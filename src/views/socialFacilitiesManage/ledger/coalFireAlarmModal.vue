<template>
  <div>
    <BasicModal v-bind="$attrs" @register="registerModal" :width="800" :title="title" destroyOnClose>
      <div>
        <a-form ref="formRef" :model="formState" :label-col="{ span: 8 }" :wrapper-col="{ span: 16 }" :rules="rules">
          <a-row>
            <a-col :span="12">
              <a-form-item label="器材类型" name="coalAlarmEquipmentType">
                <a-select v-model:value="formState.coalAlarmEquipmentType" placeholder="请选择">
                  <a-select-option v-for="item in equipmentTypes" :key="item.value" :value="item.value">{{ item.label }}</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="所属单位" name="org">
                <a-select
                  v-model:value="formState.org"
                  placeholder="请选择"
                  :options="orgOptions"
                  show-search
                  :filter-option="(input: string, option: any) =>  option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0"
                  @change="handleDepartmentChange"
                />
              </a-form-item>
            </a-col>
          </a-row>
          <a-row>
            <a-col :span="12">
              <a-form-item label="所属车间" name="depart">
                <a-select
                  v-model:value="formState.depart"
                  placeholder="请选择"
                  :options="departOptions"
                  show-search
                  :filter-option="(input: string, option: any) =>  option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0"
                />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="名称" name="name">
                <a-input v-model:value="formState.name" placeholder="请输入" :maxlength="50" />
              </a-form-item>
            </a-col>
          </a-row>
          <!-- 型号/生产厂家/配置时间表单项优化 -->
          <a-row>
            <a-col :span="12">
              <a-form-item label="型号" name="model">
                <a-input v-model:value="formState.model" placeholder="请输入" :maxlength="50" />
              </a-form-item>
            </a-col>
            <a-col :span="12" v-if="formState.coalAlarmEquipmentType !== '4'">
              <a-form-item label="生产厂家" name="manufacturer">
                <a-input v-model:value="formState.manufacturer" placeholder="请输入" :maxlength="50" />
              </a-form-item>
            </a-col>
            <a-col :span="12" v-if="formState.coalAlarmEquipmentType === '4'">
              <a-form-item label="配置时间" name="configTime" required>
                <a-date-picker
                  v-model:value="formState.configTime"
                  placeholder="年/月/日"
                  valueFormat="YYYY-MM-DD"
                  style="width: 100%"
                  :allowClear="false"
                />
              </a-form-item>
            </a-col>
          </a-row>
          <a-row v-if="formState.coalAlarmEquipmentType !== '4' && formState.coalAlarmEquipmentType !== '2'">
            <a-col :span="12">
              <a-form-item label="配置时间" name="configTime" required>
                <a-date-picker
                  v-model:value="formState.configTime"
                  placeholder="年/月/日"
                  valueFormat="YYYY-MM-DD"
                  style="width: 100%"
                  :allowClear="false"
                />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="放置岗位" name="post">
                <a-input v-model:value="formState.post" placeholder="请输入" :maxlength="50" />
              </a-form-item>
            </a-col>
          </a-row>
          <a-row v-if="formState.coalAlarmEquipmentType === '2'">
            <a-col :span="24">
              <a-form-item label="放置位置" name="location">
                <a-input v-model:value="formState.location" placeholder="请输入" :maxlength="50" />
              </a-form-item>
            </a-col>
          </a-row>
          <a-row v-if="formState.coalAlarmEquipmentType === '4'">
            <a-col :span="24">
              <a-form-item label="放置岗位" name="post">
                <a-input v-model:value="formState.post" placeholder="请输入" :maxlength="50" />
              </a-form-item>
            </a-col>
          </a-row>
          <a-row>
            <a-col :span="12">
              <a-form-item label="数量" name="quantity">
                <a-input-number v-model:value="formState.quantity" placeholder="请输入" :min="1" :max="99999" style="width: 100%" />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="责任人" name="principal">
                <JUserModal
                  v-model:value="formState.principal"
                  :isInit="!!formState.org"
                  :orgCode="formState.org"
                  type="checkbox"
                  @confirm="userConfirm"
                />
              </a-form-item>
            </a-col>
          </a-row>
        </a-form>
      </div>
      <template #footer>
        <div style="text-align: center">
          <a-button style="margin-right: 15px" @click="close">取消</a-button>
          <a-button type="primary" :loading="loading" @click="confirmClose">确定</a-button>
        </div>
      </template>
    </BasicModal>
  </div>
</template>
<script lang="ts" name="coal-fire-alarm-modal" setup>
  import { ref, reactive } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { getDepart3ListWithSecurity, selectDeptNew } from '/@/api/common/api';
  import type { FormInstance } from 'ant-design-vue';
  import { JUserModal } from '/@/components/Form';
  import dayjs from 'dayjs';
  import { add, edit } from './api';
  // 器材类型常量
  const equipmentTypes = [
    { label: '空气呼吸器', value: '1' },
    { label: '长管呼吸器', value: '2' },
    { label: '苏生器台账', value: '3' },
    { label: '担架台账', value: '4' },
    { label: '空气充填泵', value: '5' },
    { label: '防爆手电', value: '6' },
    { label: '模拟人', value: '7' },
  ];
  const emit = defineEmits(['success']);
  const title = ref('新增煤防报警器材台账');
  const loading = ref(false);
  const formRef = ref<FormInstance>();
  const orgOptions = ref<any[]>([]);
  const departOptions = ref<any[]>([]);
  const type = ref('add');
  const formState = reactive({
    id: '',
    ledgerType: '6',
    coalAlarmEquipmentType: '1',
    org: undefined,
    depart: undefined,
    name: '',
    model: '',
    manufacturer: '',
    configTime: dayjs().format('YYYY-MM-DD'),
    post: '',
    quantity: 1,
    principal: '',
    principalName: '',
    location: '',
  });

  // 动态表单校验规则
  const rules = {
    coalAlarmEquipmentType: [{ required: true, message: '请选择器材类型', trigger: 'change' }],
    org: [{ required: true, message: '请选择所属单位', trigger: 'change' }],
    depart: [{ required: true, message: '请选择所属车间', trigger: 'change' }],
    name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
    manufacturer: [{ required: true, message: '请输入生产厂家', trigger: 'blur' }],
    configTime: [{ required: true, message: '请选择下次检验日期', trigger: 'change' }],
    post: [{ required: true, message: '请输入放置岗位', trigger: 'blur' }],
    quantity: [{ required: true, message: '请输入数量', trigger: 'blur' }],
    principal: [{ required: true, message: '请选择责任人', trigger: 'change' }],
    location: [{ required: true, message: '请输入放置位置', trigger: 'blur' }],
  };

  const [registerModal, { closeModal }] = useModalInner(async (data) => {
    title.value = data.type === 'edit' ? '编辑煤防报警器材台账' : '新增煤防报警器材台账';
    type.value = data.type;
    departOptions.value = [];
    await getOrgList();
    if (data.type !== 'add') {
      Object.assign(formState, data.record);
      getDepartList(data.record.org);
    } else {
      resetForm();
      formState.coalAlarmEquipmentType = data.coalAlarmEquipmentType;
    }
  });

  const resetForm = () => {
    Object.assign(formState, {
      id: '',
      ledgerType: '6',
      coalAlarmEquipmentType: '1',
      org: undefined,
      depart: undefined,
      name: '',
      model: '',
      manufacturer: '',
      configTime: dayjs().format('YYYY-MM-DD'),
      post: '',
      quantity: 1,
      principal: '',
      principalName: '',
      location: '',
    });
    if (orgOptions.value.length === 1) {
      formState.org = orgOptions.value[0].value;
      getDepartList(orgOptions.value[0].value);
    }
  };
  const getOrgList = async () => {
    const res = await getDepart3ListWithSecurity();
    orgOptions.value = res.map((item) => ({
      label: item.departName,
      value: item.orgCode,
    }));
  };
  const getDepartList = (orgCode: string) => {
    selectDeptNew({ orgCode }).then((res) => {
      departOptions.value = res.map((item: any) => ({
        label: item.departName,
        value: item.orgCode,
      }));
    });
  };

  const handleDepartmentChange = (value: string) => {
    formState.depart = undefined;
    formState.principal = '';
    formState.principalName = '';
    departOptions.value = [];
    if (value) {
      getDepartList(value);
    }
  };

  const userConfirm = (_name, nameWorkNo) => {
    formRef.value?.clearValidate(['principal']);
    formState.principalName = nameWorkNo;
  };
  const close = () => {
    closeModal();
  };

  const confirmClose = async () => {
    await formRef.value?.validate();
    loading.value = true;
    if (type.value === 'edit') {
      edit(formState)
        .then(() => {
          emit('success');
          closeModal();
        })
        .finally(() => {
          loading.value = false;
        });
    } else {
      add(formState)
        .then(() => {
          emit('success');
          closeModal();
        })
        .finally(() => {
          loading.value = false;
        });
    }
  };
</script>
<style lang="less" scoped>
  :deep(.ant-col-24) {
    .ant-form-item-label {
      width: 128px !important;
    }
    .ant-form-item-control {
      width: calc(100% - 128px) !important;
    }
    .ant-col-8 {
      flex: none !important;
    }
    .ant-col-16 {
      flex: none !important;
      max-width: 100% !important;
    }
  }
</style>
