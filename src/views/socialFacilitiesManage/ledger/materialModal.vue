<template>
  <div>
    <BasicModal :title="title" :width="600" destroyOnClose v-bind="$attrs" @register="registerModal">
      <div>
        <a-form ref="formRef" :label-col="{ span: 5 }" :model="formState" :rules="rules" :wrapper-col="{ span: 19 }">
          <a-row>
            <a-col :span="24">
              <a-form-item label="所属单位" name="org">
                <a-select
                  v-model:value="formState.org"
                  :filter-option="(input: string, option: any) =>  option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0"
                  :options="orgOptions"
                  placeholder="请选择"
                  show-search
                  @change="handleDepartmentChange"
                />
              </a-form-item>
            </a-col>
            <a-col :span="24">
              <a-form-item label="所属车间" name="depart">
                <a-select
                  v-model:value="formState.depart"
                  :filter-option="(input: string, option: any) =>  option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0"
                  :options="departOptions"
                  placeholder="请选择"
                  show-search
                />
              </a-form-item>
            </a-col>
            <a-col :span="24">
              <a-form-item label="设备设施" name="equipmentFacilities">
                <a-input v-model:value="formState.equipmentFacilities" :maxlength="50" placeholder="请输入" />
              </a-form-item>
            </a-col>
            <a-col :span="24">
              <a-form-item :label="ledgerType === '10' ? '计划' : '附件'" name="attachment">
                <customize-upload v-model:value="formState.attachment" />
              </a-form-item>
            </a-col>
            <a-col v-if="ledgerType === '10'" :span="24">
              <a-form-item label="方案" name="planFile">
                <customize-upload v-model:value="formState.planFile" />
              </a-form-item>
            </a-col>
            <a-col v-if="ledgerType === '10'" :span="24">
              <a-form-item label="安全措施" name="securityMeasuresFile">
                <customize-upload v-model:value="formState.securityMeasuresFile" />
              </a-form-item>
            </a-col>
          </a-row>
        </a-form>
      </div>
      <template #footer>
        <div style="text-align: center">
          <a-button style="margin-right: 15px" @click="close">取消</a-button>
          <a-button :loading="loading" type="primary" @click="confirmClose">确定</a-button>
        </div>
      </template>
    </BasicModal>
  </div>
</template>
<script lang="ts" name="material-modal" setup>
  import { ref, reactive, computed } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import type { FormInstance } from 'ant-design-vue';
  import { getDepart3ListWithSecurity, selectDeptNew } from '/@/api/common/api';
  import CustomizeUpload from './CustomizeUpload.vue';
  import { add, edit } from './api';

  const emit = defineEmits(['success']);
  const loading = ref(false);
  const formRef = ref<FormInstance>();
  const title = ref('设备设施检维修计划');
  const type = ref('add');
  const formState = reactive({
    id: '',
    ledgerType: '10',
    org: undefined,
    depart: undefined,
    equipmentFacilities: '',
    attachment: '',
    planFile: '',
    securityMeasuresFile: '',
  });
  const orgOptions: any = ref([]);
  const departOptions = ref([]);
  const ledgerType = ref('10');
  const rules = computed(() => {
    return {
      org: [{ required: true, message: '请选择所属单位', trigger: 'change' }],
      depart: [{ required: true, message: '请选择所属车间', trigger: 'change' }],
      equipmentFacilities: [{ required: true, message: '请输入设备设施', trigger: 'change' }],
      attachment: [{ required: true, message: `请上传${ledgerType.value === '10' ? '计划' : '附件'}`, trigger: 'change' }],
      planFile: [{ required: true, message: '请上传方案', trigger: 'change' }],
      securityMeasuresFile: [{ required: true, message: '请上传安全措施', trigger: 'change' }],
    };
  });
  const [registerModal, { closeModal }] = useModalInner(async (data) => {
    type.value = data.type;
    ledgerType.value = data.ledgerType;
    departOptions.value = [];
    await getOrgList();
    if (data.ledgerType === '10') {
      title.value = type.value === 'edit' ? '编辑设备设施检维修计划' : '新增设备设施检维修计划';
    } else if (data.ledgerType === '11') {
      title.value = type.value === 'edit' ? '编辑设备设施检维修前的方案' : '新增设备设施检维修前的方案';
    } else if (data.ledgerType === '12') {
      title.value = type.value === 'edit' ? '编辑设备设施检修前安全措施方案' : '新增设备设施检修前安全措施方案';
    } else if (data.ledgerType === '13') {
      title.value = type.value === 'edit' ? '编辑设备设施检验合格资料' : '新增设备设施检验合格资料';
    } else if (data.ledgerType === '14') {
      title.value = type.value === 'edit' ? '编辑设备设施拆除报废记录' : '新增设备设施拆除报废记录';
    }
    if (type.value !== 'add') {
      Object.assign(formState, data.record);
      getDepartList(data.record.org);
    } else {
      resetForm();
    }
  });
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
    departOptions.value = [];
    if (value) {
      getDepartList(value);
    }
  };
  const resetForm = () => {
    Object.assign(formState, {
      id: '',
      ledgerType: ledgerType.value,
      org: undefined,
      depart: undefined,
      equipmentFacilities: '',
      attachment: '',
    });
    if (orgOptions.value.length === 1) {
      formState.org = orgOptions.value[0].value;
      getDepartList(orgOptions.value[0].value);
    }
  };
  const close = () => {
    closeModal();
  };

  const confirmClose = async () => {
    await formRef.value?.validate();
    loading.value = true;
    if (type.value === 'add') {
      add(formState)
        .then(() => {
          emit('success');
          closeModal();
        })
        .finally(() => {
          loading.value = false;
        });
    } else {
      edit(formState)
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
<style lang="less" scoped></style>
