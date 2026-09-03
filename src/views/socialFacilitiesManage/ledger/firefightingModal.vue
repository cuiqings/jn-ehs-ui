<template>
  <div>
    <BasicModal v-bind="$attrs" @register="registerModal" :width="800" :title="title" destroyOnClose>
      <div>
        <a-form ref="formRef" :model="formState" :label-col="{ span: 8 }" :wrapper-col="{ span: 16 }" :rules="rules">
          <a-row>
            <a-col :span="12">
              <a-form-item label="设备类型" name="fireEquipmentType">
                <a-select v-model:value="formState.fireEquipmentType" placeholder="请选择">
                  <a-select-option value="1">灭火器</a-select-option>
                  <a-select-option value="2">消防栓</a-select-option>
                  <a-select-option value="3">消防泵</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="所属单位" name="org">
                <a-select
                  v-model:value="formState.org"
                  placeholder="请选择"
                  @change="handleDepartmentChange"
                  :options="orgOptions"
                  show-search
                  :filter-option="(input: string, option: any) =>  option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0"
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
                  @change="handleWorkshopChange"
                  :options="departOptions"
                  show-search
                  :filter-option="(input: string, option: any) =>  option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0"
                />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="岗位" name="post">
                <a-input v-model:value="formState.post" placeholder="请输入" :maxlength="50" />
              </a-form-item>
            </a-col>
          </a-row>
          <a-row v-if="formState.fireEquipmentType === '2' || formState.fireEquipmentType === '3'">
            <a-col :span="12">
              <a-form-item label="名称" name="name">
                <a-input v-model:value="formState.name" placeholder="请输入" :maxlength="50" />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="型号" name="model">
                <a-input v-model:value="formState.model" placeholder="请输入" :maxlength="50" />
              </a-form-item>
            </a-col>
          </a-row>
          <a-row v-if="formState.fireEquipmentType === '2' || formState.fireEquipmentType === '3'">
            <a-col :span="12">
              <a-form-item label="数量" name="quantity">
                <a-input-number v-model:value="formState.quantity" placeholder="请输入" :min="1" :max="99999" style="width: 100%" />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="存放地点" name="location">
                <a-input v-model:value="formState.location" placeholder="请输入" :maxlength="50" />
              </a-form-item>
            </a-col>
          </a-row>
          <a-row v-if="formState.fireEquipmentType === '1'">
            <a-col :span="12">
              <a-form-item label="型号" name="model">
                <a-input v-model:value="formState.model" placeholder="请输入" :maxlength="50" />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="数量（具）" name="quantity">
                <a-input-number v-model:value="formState.quantity" placeholder="请输入" :min="1" :max="99999" style="width: 100%" />
              </a-form-item>
            </a-col>
          </a-row>
          <a-row v-if="formState.fireEquipmentType === '1' || formState.fireEquipmentType === '2'">
            <a-col :span="12">
              <a-form-item label="状况" name="status">
                <a-input v-model:value="formState.status" placeholder="请输入" :maxlength="20" />
              </a-form-item>
            </a-col>
            <a-col :span="12" v-if="formState.fireEquipmentType === '1'">
              <a-form-item label="下次检验日期" name="maintenanceDate" required>
                <a-date-picker
                  v-model:value="formState.maintenanceDate"
                  placeholder="年/月/日"
                  valueFormat="YYYY-MM-DD"
                  style="width: 100%"
                  :allowClear="false"
                />
              </a-form-item>
            </a-col>
            <a-col :span="12" v-if="formState.fireEquipmentType === '2'">
              <a-form-item label="室内/室外" name="indoorOrOutdoor">
                <a-select v-model:value="formState.indoorOrOutdoor" placeholder="请选择">
                  <a-select-option value="室内"> 室内 </a-select-option>
                  <a-select-option value="室外"> 室外 </a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
          </a-row>
          <a-row v-if="formState.fireEquipmentType === '3'">
            <a-col :span="24">
              <a-form-item label="所在位置" name="position">
                <a-input v-model:value="formState.position" placeholder="请输入" :maxlength="50" />
              </a-form-item>
            </a-col>
          </a-row>
          <a-row>
            <a-col :span="12">
              <a-form-item label="责任人" name="principal">
                <JUserModal
                  v-model:value="formState.principal"
                  :isInit="formState.depart && formState.depart !== '' ? true : false"
                  :orgCode="formState.depart"
                  type="checkbox"
                  @confirm="userConfirm"
                />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="备注" name="remark">
                <a-input v-model:value="formState.remark" placeholder="请输入" :maxlength="100" />
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
<script lang="ts" name="firefighting-modal" setup>
  import { ref, reactive } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { getDepart3ListWithSecurity, selectDeptNew } from '/@/api/common/api';
  import { add, edit } from './api';
  import type { FormInstance } from 'ant-design-vue';
  import { JUserModal } from '/@/components/Form';
  import dayjs from 'dayjs';
  const emit = defineEmits(['success']);
  const title = ref('新增消防设备');
  const type = ref('add');
  const loading = ref(false);
  const formRef = ref<FormInstance>();
  const orgOptions: any = ref([]);
  const departOptions: any = ref([]);
  const formState = reactive({
    id: '',
    ledgerType: '1',
    fireEquipmentType: '1',
    org: undefined,
    depart: undefined,
    post: '',
    name: '',
    model: '',
    quantity: 1,
    location: '',
    status: '',
    maintenanceDate: dayjs(new Date()).format('YYYY-MM-DD'),
    principal: '',
    principalName: '',
    remark: '',
    indoorOrOutdoor: '室内',
    position: '',
  });

  const rules = {
    fireEquipmentType: [{ required: true, message: '请选择设备类型', trigger: 'change' }],
    org: [{ required: true, message: '请选择所属单位', trigger: 'change' }],
    depart: [{ required: true, message: '请选择所属车间', trigger: 'change' }],
    name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
    model: [{ required: true, message: '请输入型号', trigger: 'blur' }],
    quantity: [{ required: true, message: '请输入数量', trigger: 'blur' }],
    location: [{ required: true, message: '请输入存放地点', trigger: 'blur' }],
    status: [{ required: true, message: '请输入状况', trigger: 'blur' }],
    principal: [{ required: true, message: '请选择责任人', trigger: 'change' }],
    indoorOrOutdoor: [{ required: true, message: '请选择室内/室外', trigger: 'change' }],
    position: [{ required: true, message: '请输入所在位置', trigger: 'blur' }],
  };

  const [registerModal, { closeModal }] = useModalInner(async (data) => {
    type.value = data?.type;
    formState.fireEquipmentType = data?.fireEquipmentType;
    title.value = type.value === 'edit' ? '编辑消防设备' : '新增消防设备';
    departOptions.value = [];
    await getOrgList();
    if (type.value !== 'add') {
      Object.assign(formState, data.record);
      getDepartList(data.record.org);
    } else {
      resetForm();
      formState.fireEquipmentType = data?.fireEquipmentType;
    }
  });

  const resetForm = () => {
    Object.assign(formState, {
      id: '',
      ledgerType: '1',
      fireEquipmentType: '1',
      org: undefined,
      depart: undefined,
      post: '',
      name: '',
      model: '',
      quantity: 1,
      location: '',
      status: '',
      maintenanceDate: dayjs(new Date()).format('YYYY-MM-DD'),
      principal: '',
      principalName: '',
      remark: '',
      indoorOrOutdoor: '室内',
      position: '',
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
    departOptions.value = [];
    if (value) {
      getDepartList(value);
    }
  };
  const userConfirm = (_name: string, nameWorkNo: string) => {
    formState.principalName = nameWorkNo;
    formRef.value?.clearValidate(['principal']);
  };
  const handleWorkshopChange = () => {
    formState.principal = '';
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
