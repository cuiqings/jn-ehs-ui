<template>
  <BasicDrawer forceRender v-bind="$attrs" @register="register" @close="close" :title="title" width="50%" destroyOnClose>
    <div style="width: 100%">
      <a-form ref="formRef" :model="formState" name="basic" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
        <a-row :gutter="12">
          <a-col :span="12">
            <a-form-item label="物资类别" name="category" :rules="[{ required: true, message: '请输入' }]">
              <a-select v-model:value="formState.category" placeholder="请选择">
                <a-select-option v-for="item in categoryOptions" :value="item.value">{{ item.text }}</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="所属单位" name="orgCode" :rules="[{ required: true, message: '请选择' }]">
              <a-select
                v-model:value="formState.orgCode"
                :options="departList"
                @change="orgChange"
                placeholder="请选择"
                :fieldNames="{ label: 'departName', value: 'orgCode' }"
              ></a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="所属车间" name="workshop" :rules="[{ required: true, message: '请选择' }]">
              <a-select
                v-model:value="formState.workshop"
                :options="departList2"
                placeholder="请选择"
                :fieldNames="{ label: 'departName', value: 'orgCode' }"
              ></a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="位置(使用岗位)" name="location" :rules="[{ required: true, message: '请输入' }]">
              <a-input v-model:value="formState.location" placeholder="请输入" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label=" 类型" name="type">
              <a-input max-length="50" v-model:value="formState.type" placeholder="请输入" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="型号" name="model">
              <a-input max-length="20" v-model:value="formState.model" placeholder="请输入" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="数量" name="number" :rules="[{ required: true, message: '请输入' }]">
              <a-input type="number" max="50000" v-model:value="formState.number" placeholder="请输入" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="责任人" name="dutyUser" :rules="[{ required: true, message: '请输入' }]">
              <a-input max-length="20" v-model:value="formState.dutyUser" placeholder="请输入" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="检验日期" name="checkDate">
              <a-date-picker
                style="width: 100%"
                format="YYYY-MM-DD"
                valueFormat="YYYY-MM-DD"
                v-model:value="formState.checkDate"
                placeholder="请选择"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="检验有效期" name="expirationDate">
              <a-date-picker
                style="width: 100%"
                format="YYYY-MM-DD"
                valueFormat="YYYY-MM-DD"
                v-model:value="formState.expirationDate"
                placeholder="请选择"
              />
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </div>
    <template #footer v-if="title != '详情'">
      <div class="footer">
        <a-button @click="close">取消</a-button>
        <a-button :loading="submitIng" type="primary" @click="handleSubmit">确定</a-button>
      </div>
    </template>
  </BasicDrawer>
</template>
<script lang="ts" setup>
  import { getDepart3ListWithSecurity, selectDeptNew } from '/@/api/common/api';
  import { suppliesAdd, suppliesEdit } from '../api';
  import { BasicDrawer, useDrawerInner } from '/@/components/Drawer';
  import { ref, reactive } from 'vue';
  import { useUserStore } from '/@/store/modules/user';

  const readonly = ref(false);
  const userStore = useUserStore();
  const categoryOptions = userStore.getAllDictItems.yj_wz_type;
  const formRef = ref(null);
  const title = ref('新增');
  const departList = ref<any[]>([]);
  const departList2 = ref<any[]>([]);
  const formState = reactive({
    category: undefined,
    orgCode: undefined,
    workshop: undefined,
    location: '',
    type: '',
    model: '',
    number: '',
    dutyUser: '',
    checkDate: '',
    expirationDate: '',
  });

  const emits = defineEmits(['submitSuccess']);

  const [register, { closeDrawer, changeOkLoading }] = useDrawerInner(async (data) => {
    title.value = data.title;
    departList.value = await getDepart3ListWithSecurity();
    if (title.value == '编辑') {
      Object.assign(formState, data.record);
      orgChange(formState.orgCode);
    }
    if (title.value == '详情') {
      Object.assign(formState, data.record);
      readonly.value = true;
    }
    console.log(title.value === '详情', 9999);
  });

  const orgChange = async (value) => {
    departList2.value = await selectDeptNew({ orgCode: value });
  };
  const submitIng = ref(false);
  const handleSubmit = () => {
    formRef.value
      ?.validate()
      .then(() => {
        submitIng.value = true;
        changeOkLoading(true);
        if (title.value == '新增') {
          suppliesAdd(formState)
            .then((res) => {
              changeOkLoading(false);
              emits('submitSuccess', res);
              closeDrawer();
              formRef.value?.resetFields();
            })
            .finally(() => {
              submitIng.value = false;
            });
        } else {
          suppliesEdit(formState)
            .then((res) => {
              changeOkLoading(false);
              emits('submitSuccess', res);
              closeDrawer();
              formRef.value?.resetFields();
            })
            .finally(() => {
              submitIng.value = false;
            });
        }
      })
      .catch(() => {
        changeOkLoading(false);
      });
  };
  const close = () => {
    formRef.value?.resetFields();
    submitIng.value = false;
    closeDrawer();
  };
</script>
<style lang="less" scoped>
  .footer {
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    line-height: 60px;
    .ant-btn{
      margin-left: 10px;
    }
  }
</style>
