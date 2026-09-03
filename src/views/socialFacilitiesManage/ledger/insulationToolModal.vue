<template>
  <div>
    <BasicModal v-bind="$attrs" @register="registerModal" :width="800" :bodyStyle="{ padding: '10px 20px 0 0' }" :title="title" destroyOnClose>
      <div>
        <a-form
          ref="formRef"
          name="insulation_tool_form"
          class="ant-advanced-search-form"
          :model="formState"
          :label-col="{ span: 8 }"
          :wrapper-col="{ span: 16 }"
          :rules="rules"
        >
          <a-row>
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
              <a-form-item label="工具名称" name="name">
                <a-input v-model:value="formState.name" placeholder="请输入" :maxlength="10" />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="单位" name="unit">
                <a-input v-model:value="formState.unit" placeholder="请输入" :maxlength="10" />
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
              <a-form-item label="存放地点" name="location">
                <a-input v-model:value="formState.location" placeholder="请输入" :maxlength="50" />
              </a-form-item>
            </a-col>
          </a-row>
          <a-row>
            <a-col :span="12">
              <a-form-item label="检验到期时间" name="maintenanceDate" required>
                <a-date-picker
                  v-model:value="formState.maintenanceDate"
                  placeholder="年/月/日"
                  valueFormat="YYYY-MM-DD"
                  style="width: 100%"
                  :allowClear="false"
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

<script lang="ts" name="insulation-tool-modal" setup>
  import { ref, reactive } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { getDepart3ListWithSecurity, selectDeptNew } from '/@/api/common/api';
  import { add, edit } from './api';
  import type { FormInstance } from 'ant-design-vue';
  import dayjs from 'dayjs';
  const emit = defineEmits(['success']);
  const title = ref('新增绝缘工具');
  const loading = ref(false);
  const formRef = ref<FormInstance>();
  const orgOptions: any = ref([]);
  const departOptions: any = ref([]);
  const type = ref('add');
  const formState = reactive({
    id: '',
    ledgerType: '2',
    org: undefined,
    depart: undefined,
    name: '',
    unit: '',
    quantity: 1,
    location: '',
    maintenanceDate: dayjs(new Date()).format('YYYY-MM-DD'),
    remark: '',
  });

  const rules = {
    org: [{ required: true, message: '请选择所属单位', trigger: 'change' }],
    depart: [{ required: true, message: '请选择所属车间', trigger: 'change' }],
    unit: [{ required: true, message: '请输入单位', trigger: 'blur' }],
    quantity: [{ required: true, message: '请输入数量', trigger: 'blur' }],
    location: [{ required: true, message: '请输入存放地点', trigger: 'blur' }],
    maintenanceDate: [{ required: true, message: '请选择检验到期时间', trigger: 'change' }],
  };

  const [registerModal, { closeModal }] = useModalInner(async (data) => {
    title.value = data.type === 'edit' ? '编辑绝缘工具' : '新增绝缘工具';
    type.value = data.type;
    await getOrgList();
    departOptions.value = [];
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
      ledgerType: '2',
      org: undefined,
      depart: undefined,
      name: '',
      unit: '',
      quantity: 1,
      location: '',
      maintenanceDate: dayjs(new Date()).format('YYYY-MM-DD'),
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

<style lang="less" scoped></style>
