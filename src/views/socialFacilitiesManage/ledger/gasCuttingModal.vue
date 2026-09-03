<template>
  <div>
    <BasicModal v-bind="$attrs" @register="registerModal" :width="800" :bodyStyle="{ padding: '10px 20px 0 0' }" :title="title" destroyOnClose>
      <div>
        <a-form
          ref="formRef"
          name="insulation_tool_form"
          class="ant-advanced-search-form"
          :model="formState"
          :label-col="{ span: 9 }"
          :wrapper-col="{ span: 15 }"
          :rules="rules"
        >
          <a-row>
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
          </a-row>
          <a-row>
            <a-col :span="12">
              <a-form-item label="设备设施" name="equipmentFacilities">
                <a-input v-model:value="formState.equipmentFacilities" placeholder="请输入" :maxlength="50" />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="切断阀编号" name="code">
                <a-input v-model:value="formState.code" placeholder="请输入" :maxlength="100" />
              </a-form-item>
            </a-col>
          </a-row>
          <a-row>
            <a-col :span="12">
              <a-form-item label="一级切断阀位置" name="shutOffValvePosition1">
                <a-input v-model:value="formState.shutOffValvePosition1" placeholder="请输入" :maxlength="50" />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="二级切断阀位置" name="shutOffValvePosition2">
                <a-input v-model:value="formState.shutOffValvePosition2" placeholder="请输入" :maxlength="50" />
              </a-form-item>
            </a-col>
          </a-row>
          <a-row>
            <a-col :span="24">
              <a-form-item label="备注" name="remark">
                <a-textarea v-model:value="formState.remark" placeholder="请输入" :maxlength="100" :rows="3" />
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

<script lang="ts" name="gas-cutting-modal" setup>
  import { ref, reactive } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { getDepart3ListWithSecurity, selectDeptNew } from '/@/api/common/api';
  import { add, edit } from './api';
  import type { FormInstance } from 'ant-design-vue';
  const emit = defineEmits(['success']);
  const title = ref('');
  const loading = ref(false);
  const formRef = ref<FormInstance>();
  const orgOptions: any = ref([]);
  const departOptions: any = ref([]);
  const type = ref('add');
  const formState = reactive({
    id: '',
    ledgerType: '4',
    org: undefined,
    depart: undefined,
    equipmentFacilities: '',
    code: '',
    shutOffValvePosition1: '',
    shutOffValvePosition2: '',
    remark: '',
  });

  const rules = {
    org: [{ required: true, message: '请选择所属单位', trigger: 'change' }],
    depart: [{ required: true, message: '请选择所属车间', trigger: 'change' }],
    code: [{ required: true, message: '请输入切断阀编号', trigger: 'blur' }],
    shutOffValvePosition1: [{ required: true, message: '请输入一级切断阀位置', trigger: 'blur' }],
    shutOffValvePosition2: [{ required: true, message: '请输入二级切断阀位置', trigger: 'blur' }],
  };

  const [registerModal, { closeModal }] = useModalInner(async (data) => {
    title.value = data.type === 'edit' ? '编辑煤气设施隔断装置' : '新增煤气设施隔断装置';
    type.value = data.type;
    departOptions.value = [];
    await getOrgList();
    if (data.type !== 'add') {
      Object.assign(formState, data.record);
      getDepartList(data.record.org);
    } else {
      resetForm();
    }
  });

  const resetForm = () => {
    Object.assign(formState, {
      id: '',
      ledgerType: '4',
      org: undefined,
      depart: undefined,
      equipmentFacilities: '',
      code: '',
      shutOffValvePosition1: '',
      shutOffValvePosition2: '',
      remark: '',
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
    departOptions.value = [];
    if (value) {
      getDepartList(value);
    }
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
      width: 140px !important;
    }
    .ant-form-item-control {
      width: calc(100% - 140px) !important;
    }
    .ant-col-9 {
      flex: none !important;
    }
    .ant-col-15 {
      flex: none !important;
      max-width: 100% !important;
    }
  }
</style>
