<template>
  <BasicDrawer
    forceRender
    showFooter
    v-bind="$attrs"
    @register="register"
    @close="close"
    :title="title"
    width="65%"
    @ok="handleSubmit"
    destroyOnClose
  >
    <div style="width: 100%">
      <a-form ref="formRef" :model="formState" name="basic" :label-col="{ span: 4 }" :wrapper-col="{ span: 20 }">
        <div class="main">
          <div class="tit">当前目标：{{ formState.content }}</div>
          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item label="年份" name="year">
                {{ formState.year }}
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="单位" name="orgCode">
                {{ formState.orgCodeName }}
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="上级要求" name="orgCode"> {{ formState.requirements }} {{ formState.upValue }} {{ formState.unit }} </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="本级目标" name="levelValue" :rules="[{ required: true, message: '请输入' }]">
                <template v-if="formState.indicatorType != '2'">
                  <a-input-number
                    v-if="formState.unit"
                    style="width: 100%"
                    placeholder="请输入"
                    v-model:value="formState.levelValue"
                    :addon-after="formState.unit"
                  />
                  <a-input-number v-else style="width: 100%" placeholder="请输入" v-model:value="formState.levelValue" />
                </template>
                <a-input v-else style="width: 100%" placeholder="请输入" v-model:value="formState.levelValue" />
              </a-form-item>
            </a-col>
          </a-row>
        </div>
        <div class="title">各单位指标要求配置</div>
        <a-table :columns="visibleColumns" :data-source="formState.items" :pagination="false" size="small" bordered>
          <template #bodyCell="{ column, record, index }">
            <template v-if="column.key === 'deptName'">
              <a-form-item
                :label-col="{ span: 0 }"
                :wrapper-col="{ span: 24 }"
                :name="['items', index, 'orgCode']"
                :rules="[{ required: true, message: '请选择' }]"
              >
                <a-select
                  v-model:value="record.orgCode"
                  :options="departList3"
                  @change="orgChange"
                  placeholder="请选择"
                  :fieldNames="{ label: 'departName', value: 'orgCode' }"
                ></a-select>
              </a-form-item>
            </template>
            <template v-if="column.key === 'responsibleUser'">
              <a-form-item
                :label-col="{ span: 0 }"
                :wrapper-col="{ span: 24 }"
                :name="['items', index, 'responsibleUser']"
                :rules="[{ required: true, message: '请选择' }]"
              >
                <JUserModal :orgCode="record.orgCode" v-model:value="record.responsibleUser" placeholder="请选择" />
              </a-form-item>
            </template>
            <template v-if="column.key === 'requirements'">
              <a-form-item
                :label-col="{ span: 0 }"
                :wrapper-col="{ span: 24 }"
                :name="['items', index, 'requirements']"
                :rules="[{ required: true, message: '请选择' }]"
              >
                <a-select v-model:value="record.requirements" @change="orgChange" placeholder="请选择">
                  <a-select-option value="大于等于">大于等于</a-select-option>
                  <a-select-option value="小于等于">小于等于</a-select-option>
                  <a-select-option value="等于">等于</a-select-option>
                  <a-select-option value="大于">大于</a-select-option>
                  <a-select-option value="小于">小于</a-select-option>
                </a-select>
              </a-form-item>
            </template>
            <template v-if="column.key === 'value'">
              <div v-if="formState.indicatorType == '1'" style="display: flex">
                <a-form-item
                  style="flex: 1"
                  :label-col="{ span: 0 }"
                  :wrapper-col="{ span: 24 }"
                  :name="['items', index, 'value']"
                  :rules="[{ required: true, message: '请输入' }]"
                >
                  <a-input-number style="width: 100%" v-model:value="record.value" />
                </a-form-item>
                <a-form-item
                  style="width: 50px; padding-left: 5px"
                  :label-col="{ span: 0 }"
                  :wrapper-col="{ span: 24 }"
                  name="orgCode"
                  :rules="[{ required: true, message: '请选择' }]"
                >
                  <a-checkbox v-model:checked="record.unit">%</a-checkbox>
                </a-form-item>
              </div>
              <a-form-item
                v-else
                :label-col="{ span: 0 }"
                :wrapper-col="{ span: 24 }"
                :name="['items', index, 'value']"
                :rules="[{ required: true, message: '请选择' }]"
              >
                <a-input v-model:value="record.value" />
              </a-form-item>
            </template>
            <template v-else-if="column.key === 'handle'">
              <a-space>
                <a-button type="link" size="small" @click="addBudgetItem(idx)">+</a-button>
                <a-button type="link" size="small" v-if="formState.items.length > 1" @click="removeBudgetItem(index, idx)" style="color: #ff4d4f"
                  >删除</a-button
                >
              </a-space>
            </template>
          </template>
        </a-table>
      </a-form>
    </div>
  </BasicDrawer>
</template>
<script lang="ts" setup>
  import { getDepart3ListWithSecurity, selectDeptNew } from '/@/api/common/api';
  import { decompose, composeEdit, composeDetail } from '../api';
  import { BasicDrawer, useDrawerInner } from '/@/components/Drawer';
  import { ref, reactive, computed } from 'vue';
  import { FormInstance } from 'ant-design-vue/es/form';
  import { useUserStore } from '/@/store/modules/user';
  import { JUserModal } from '/@/components/Form';

  const userStore = useUserStore();
  const readonly = ref(false);
  const formRef = ref<FormInstance | null>(null);
  const title = ref('分解');
  const departList = ref<any[]>([]);
  const departList3 = ref<any[]>([]);
  const formState = reactive({
    orgCode: userStore.getUserInfo.orgCode?.substring(0, 9),
    indicatorType: '1',
    unit: false,
    items: [
      {
        orgCode: undefined,
        responsibleUser: '',
        requirements: '等于',
        value: '',
      },
    ],
  });

  const column = ref([
    {
      title: '下级单位',
      dataIndex: 'deptName',
      key: 'deptName',
      width: 200,
    },
    {
      title: '负责人',
      dataIndex: 'responsibleUser',
      key: 'responsibleUser',
      width: 200,
    },
    {
      title: '要求类型',
      dataIndex: 'requirements',
      key: 'requirements',
      width: 100,
      ifshow: false,
    },
    {
      title: '分解目标值',
      dataIndex: 'value',
      key: 'value',
      width: 100,
    },
    {
      title: '操作',
      dataIndex: 'handle',
      key: 'handle',
      width: 80,
    },
  ]);

  const visibleColumns = computed(() => {
    if (formState.indicatorType == '2') {
      return column.value.filter((col) => col.key != 'requirements');
    }
    return column.value;
  });

  const emits = defineEmits(['submitSuccess']);

  const [register, { closeDrawer, changeOkLoading }] = useDrawerInner(async (data) => {
    title.value = data.title;
    departList.value = await getDepart3ListWithSecurity();
    composeDetail({ id: data.record.id }).then((res) => {
      Object.assign(formState, res, { id: data.record.id });
      if (!res.items || res.items.length == 0) {
        formState.items = [
          {
            orgCode: undefined,
            type: '等于',
            remark: '',
            value: '',
          },
        ];
      }
      selectDeptNew({ orgCode: formState.orgCode }).then((res) => {
        departList3.value = res;
      });
    });
    if (title.value == '详情') {
      Object.assign(formState, data.record);
      readonly.value = true;
    }
  });

  const orgChange = async (value) => {};

  const handleSubmit = () => {
    console.log(formState);

    formRef.value
      ?.validate()
      .then(() => {
        changeOkLoading(true);
        if (title.value == '分解') {
          decompose(formState)
            .then((res) => {
              emits('submitSuccess', res);
              closeDrawer();
              formRef.value?.resetFields();
            })
            .finally(() => {
              setTimeout(() => {
                changeOkLoading(false);
              }, 500);
            });
        } else {
          composeEdit(formState)
            .then((res) => {
              emits('submitSuccess', res);
              closeDrawer();
              formRef.value?.resetFields();
            })
            .finally(() => {
              setTimeout(() => {
                changeOkLoading(false);
              }, 500);
            });
        }
      })
      .catch(() => {
        changeOkLoading(false);
      });
  };

  const close = () => {
    formRef.value?.resetFields();
    closeDrawer();
  };

  // 添加
  const addBudgetItem = (idx: number) => {
    formState.items.push({
      item: '',
      unit: '',
      number: 0,
      price: 0,
      totalCost: 0,
      remark: '',
      reduce: 0,
    });
  };
  // 删除
  const removeBudgetItem = (index: number) => {
    formState.items.splice(index, 1);
  };
</script>
<style lang="less" scoped>
  .title {
    font-size: 16px;
    font-weight: 600;
    padding: 16px 0;
  }
  .main {
    width: 100%;
    background: #f5f5f5;
    border-radius: 5px;
    padding: 16px;
  }
</style>
