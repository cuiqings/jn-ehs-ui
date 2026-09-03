<template>
  <BasicDrawer
    forceRender
    v-bind="$attrs"
    @register="register"
    @close="close"
    :title="title"
    width="65%"
    @ok="handleSubmit"
    :showFooter="false"
    destroyOnClose
  >
    <div class="d-inner">
      <a-form class="d-form" ref="formRef" :model="formState" name="basic" :label-col="{ span: 4 }" :wrapper-col="{ span: 20 }">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="年份" name="year" :rules="[{ required: true, message: '请输入' }]">
              <a-date-picker
                style="width: 100%"
                :disabledDate="disabledDate"
                v-model:value="formState.year"
                format="YYYY"
                valueFormat="YYYY"
                picker="year"
                :disabled="readonly"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="制定单位" name="orgCode" :rules="[{ required: true, message: '请选择' }]">
              <a-select
                style="width: 100%"
                v-model:value="formState.orgCode"
                :options="departList"
                @change="orgChange"
                placeholder="请选择"
                :disabled="readonly"
                :fieldNames="{ label: 'departName', value: 'orgCode' }"
              ></a-select>
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item
              :label-col="{ span: 2 }"
              :wrapper-col="{ span: 22 }"
              label="目标内容"
              name="orgCode"
              :rules="[{ required: true, message: '请选择' }]"
            >
              <a-textarea
                placeholder="请输入"
                style="width: 100%"
                v-model:value="formState.content"
                :maxLength="500"
                :disabled="readonly"
                :auto-size="{ minRows: 2, maxRows: 5 }"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="指标类型" name="type" :rules="[{ required: true, message: '请选择' }]">
              <a-select :disabled="readonly" style="width: 100%" v-model:value="formState.type" @change="orgChange" placeholder="请选择">
                <a-select-option value="1">可量化指标</a-select-option>
                <a-select-option value="2">非量化指标</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="截止日期" name="deadline" :rules="[{ required: true, message: '请选择' }]">
              <a-date-picker :disabled="readonly" style="width: 100%" v-model:value="formState.deadline" format="YYYY-MM-DD" valueFormat="YYYY-MM-DD" />
            </a-form-item>
          </a-col>
          <!-- <a-col :span="24" style="display: flex;" v-if="formState.type == '1'">
            <a-form-item style="flex: 1;" :label-col="{span: 3}" :wrapper-col="{span: 20}" label="集团总目标值" name="totalTargetValue" :rules="[{ required: true, message: '请输入' }]">
              <a-input-number style="width: 100%;" v-model:value="formState.totalTargetValue" />
            </a-form-item>
            <a-form-item style="width: 50px;" :label-col="{span: 0}" :wrapper-col="{span: 24}" name="unit">
              <a-checkbox v-model:checked="formState.unit">%</a-checkbox>
            </a-form-item>
          </a-col> -->
          <a-col :span="24" style="display: flex">
            <a-form-item
              style="flex: 1"
              :label-col="{ span: 3 }"
              :wrapper-col="{ span: 21 }"
              label="集团总目标值"
              name="totalTargetValue"
              :rules="[{ required: true, message: '请输入' }]"
            >
              <a-input :disabled="readonly" style="width: 100%" placeholder="请输入" v-model:value="formState.totalTargetValue" />
            </a-form-item>
          </a-col>
        </a-row>
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
                <a-select :disabled="readonly"
                  v-model:value="record.orgCode"
                  mode="multiple"
                  :options="departList"
                  @change="orgChange"
                  placeholder="请选择"
                  :fieldNames="{ label: 'departName', value: 'orgCode' }"
                ></a-select>
              </a-form-item>
            </template>
            <template v-if="column.key === 'type'">
              <a-form-item
                :label-col="{ span: 0 }"
                :wrapper-col="{ span: 24 }"
                :name="['items', index, 'requirements']"
                :rules="[{ required: true, message: '请选择' }]"
              >
                <a-select :disabled="readonly" v-model:value="record.requirements" @change="orgChange" placeholder="请选择">
                  <a-select-option value="大于等于">大于等于</a-select-option>
                  <a-select-option value="小于等于">小于等于</a-select-option>
                  <a-select-option value="等于">等于</a-select-option>
                  <a-select-option value="大于">大于</a-select-option>
                  <a-select-option value="小于">小于</a-select-option>
                </a-select>
              </a-form-item>
            </template>
            <template v-if="column.key === 'value'">
              <div v-if="formState.type == '1'" style="display: flex">
                <a-form-item
                  style="flex: 1"
                  :label-col="{ span: 0 }"
                  :wrapper-col="{ span: 24 }"
                  :name="['items', index, 'value']"
                  :rules="[{ required: true, message: '请输入' }]"
                >
                  <a-input-number :disabled="readonly" placeholder="请输入" style="width: 100%" v-model:value="record.value" />
                </a-form-item>
                <a-form-item
                  style="width: 50px; padding-left: 5px"
                  :label-col="{ span: 0 }"
                  :wrapper-col="{ span: 24 }"
                  name="orgCode"
                  :rules="[{ required: true, message: '请选择' }]"
                >
                  <a-checkbox :disabled="readonly" v-model:checked="record.unit">%</a-checkbox>
                </a-form-item>
              </div>
              <a-form-item
                v-else
                :label-col="{ span: 0 }"
                :wrapper-col="{ span: 24 }"
                :name="['items', index, 'value']"
                :rules="[{ required: true, message: '请输入' }]"
              >
                <a-input :disabled="readonly" placeholder="请输入" v-model:value="record.value" />
              </a-form-item>
            </template>
            <template v-if="column.key === 'remark'">
              <a-form-item :label-col="{ span: 0 }" :wrapper-col="{ span: 24 }" :name="['items', index, 'remark']">
                <a-input :disabled="readonly" v-model:value="record.remark"></a-input>
              </a-form-item>
            </template>
            <template v-else-if="column.key === 'handle'">
              <a-space>
                <a-button type="link" size="small" @click="addBudgetItem(index)">+</a-button>
                <a-button type="link" size="small" v-if="formState.items.length > 1" @click="removeBudgetItem(index)" style="color: #ff4d4f"
                  >删除</a-button
                >
              </a-space>
            </template>
          </template>
        </a-table>
      </a-form>
      <div class="footer">
        <a-space>
          <a-button @click="handleCancel">取消</a-button>
          <a-button v-if="!readonly" :loading="submitIng" type="primary" @click="handleSubmit(1)">保存</a-button>
          <a-button v-if="!readonly" :loading="submitIng" type="primary" @click="handleSubmit(2)">发布目标</a-button>
        </a-space>
      </div>
    </div>
  </BasicDrawer>
</template>
<script lang="ts" setup>
  import { getDepart3ListWithSecurity, selectDeptNew } from '/@/api/common/api';
  import { evaluateAdd, goalSave, goalInfo, evaluateEdit } from '../api';
  import { BasicDrawer, useDrawerInner } from '/@/components/Drawer';
  import { ref, reactive, computed } from 'vue';
  import { FormInstance } from 'ant-design-vue/es/form';
  import { useUserStore } from '/@/store/modules/user';
  import dayjs from 'dayjs';

  const userStore = useUserStore();
  const readonly = ref(false);
  const formRef = ref<FormInstance | null>(null);
  const title = ref('新增');
  const departList = ref<any[]>([]);
  // 禁用今年之前的日期
  const disabledDate = (current) => {
    return current && current < dayjs().startOf('year');
  };
  const formState = reactive({
    orgCode: userStore.getUserInfo.orgCode?.substring(0, 9),
    workshop: undefined,
    year: new Date().getFullYear().toString(),
    deadline: dayjs().endOf('year'),
    fileUrl: '',
    unit: false,
    type: undefined,
    totalTargetValue: undefined,
    content: '',
    items: [
      {
        orgCode: undefined,
        type: '等于',
        remark: '',
        value: '',
      },
    ],
  });

  const column = ref([
    {
      title: '单位名称',
      dataIndex: 'deptName',
      key: 'deptName',
      width: 300,
    },
    {
      title: '要求类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
    },
    {
      title: '目标要求值',
      dataIndex: 'value',
      key: 'value',
      width: 100,
    },
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
      width: 150,
    },
    {
      title: '操作',
      dataIndex: 'handle',
      key: 'handle',
      width: 80,
    },
  ]);

  const visibleColumns = computed(() => {
    if (formState.type == '2') {
      return column.value.filter((col) => col.key != 'type');
    }
    return column.value;
  });

  const emits = defineEmits(['submitSuccess']);

  const [register, { closeDrawer, changeOkLoading }] = useDrawerInner(async (data) => {
    title.value = data.title;
    departList.value = await getDepart3ListWithSecurity();
    if(['详情', '编辑'].includes(title.value)) {
      goalInfo({ id: data.record.id }).then((res) => {
        res.items.forEach((item) => {
          if (item.orgCode) item.orgCode =  item.orgCode.split(',');
        })
        if(res.year){
          res.year = res.year.toString();
        }
        Object.assign(formState, res);
      });
    }

    if (title.value == '详情') {
      readonly.value = true;
    } else {
      readonly.value = false;
    }
  });

  const orgChange = async (value) => {};

  const handleCancel = () => {
    close();
  };

  const submitIng = ref(false);
  const handleSubmit = (type) => {
    formRef.value
      ?.validate()
      .then(() => {
        submitIng.value = true;
        const params = JSON.parse(JSON.stringify(formState));
        params.items.forEach((item) => {
          if (item.orgCode) item.orgCode = item.orgCode.join(',');
          if (item.unit) item.unit = '%';
        });
        const FnMap = {
          1: goalSave,
          2: evaluateAdd,
        };
        FnMap[type](params)
          .then((res) => {
            emits('submitSuccess', res);
            closeDrawer();
            formRef.value?.resetFields();
            formState.items = [
              {
                orgCode: undefined,
                type: '等于',
                remark: '',
                value: '',
              },
            ];
          })
          .finally(() => {
            setTimeout(() => {
              submitIng.value = false;
            }, 500);
          });
      })
      .catch(() => {
        submitIng.value = false;
      });
  };

  const close = () => {
    closeDrawer();
    formState.items = [
      {
        orgCode: undefined,
        type: '等于',
        remark: '',
        value: '',
      },
    ];
    formState.content = '';
    formRef.value?.resetFields();
  };

  // 添加
  const addBudgetItem = () => {
    formState.items.push({
      orgCode: [],
      type: '等于',
      remark: '',
      value: '',
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
  .d-inner {
    width: 100%;
    height: 100%;
    padding-bottom: 55px;
    .d-form {
      flex: 1;
    }
  }
  .footer {
    width: 100%;
    height: 55px;
    position: absolute;
    left: 0;
    bottom: 0;
    padding: 0 16px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    // 盒子顶部阴影
    box-shadow: 0 -2px 5px 0 rgba(0, 0, 0, 0.09);
  }
</style>
