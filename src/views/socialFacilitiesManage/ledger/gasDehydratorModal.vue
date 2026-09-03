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
              <a-form-item label="脱水器编号" name="code">
                <a-input v-model:value="formState.code" placeholder="请输入" :maxlength="100" />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="安装位置" name="position">
                <a-input v-model:value="formState.position" placeholder="请输入" :maxlength="50" />
              </a-form-item>
            </a-col>
          </a-row>
          <a-row>
            <a-col :span="12">
              <a-form-item label="安装时间" name="configTime" required>
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
              <a-form-item label="生产厂家" name="manufacturer">
                <a-input v-model:value="formState.manufacturer" placeholder="请输入" :maxlength="50" />
              </a-form-item>
            </a-col>
          </a-row>
          <a-row>
            <a-col :span="12">
              <a-form-item label="介质管道" name="mediumPipeline">
                <a-input v-model:value="formState.mediumPipeline" placeholder="请输入" :maxlength="50" />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="伴热" name="tracing">
                <j-dict-select-tag
                  v-model:value="formState.tracing"
                  dictCode="dev_ledger_tracing"
                  placeholder="请选择"
                  :string-to-number="false"
                  :show-choose-option="false"
                  :getPopupContainer="getPopupContainer"
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

<script lang="ts" name="gas-dehydrator-modal" setup>
  import { ref, reactive } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { getDepart3ListWithSecurity, selectDeptNew } from '/@/api/common/api';
  import type { FormInstance } from 'ant-design-vue';
  import dayjs from 'dayjs';
  import { JDictSelectTag } from '/@/components/Form';
  import { getPopupContainer } from '/@/utils';
  import { add, edit } from './api';
  const emit = defineEmits(['success']);
  const title = ref('新增煤气脱水器台账');
  const loading = ref(false);
  const formRef = ref<FormInstance>();
  const orgOptions: any = ref([]);
  const departOptions: any = ref([]);
  const type = ref('add');
  const formState = reactive({
    id: '',
    ledgerType: '7',
    org: undefined,
    depart: undefined,
    code: '',
    position: '',
    configTime: dayjs(new Date()).format('YYYY-MM-DD'),
    manufacturer: '',
    mediumPipeline: '',
    tracing: undefined,
  });

  const rules = {
    org: [{ required: true, message: '请选择所属单位', trigger: 'change' }],
    depart: [{ required: true, message: '请选择所属车间', trigger: 'change' }],
    code: [{ required: true, message: '请输入脱水器编号', trigger: 'blur' }],
    position: [{ required: true, message: '请输入安装位置', trigger: 'blur' }],
    manufacturer: [{ required: true, message: '请输入生产厂家', trigger: 'blur' }],
    mediumPipeline: [{ required: true, message: '请输入介质管道', trigger: 'blur' }],
    tracing: [{ required: true, message: '请选择伴热', trigger: 'change' }],
  };

  const [registerModal, { closeModal }] = useModalInner(async (data) => {
    title.value = data.type === 'edit' ? '编辑煤气脱水器台账' : '新增煤气脱水器台账';
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
      ledgerType: '7',
      org: undefined,
      depart: undefined,
      code: '',
      position: '',
      configTime: dayjs(new Date()).format('YYYY-MM-DD'),
      manufacturer: '',
      mediumPipeline: '',
      tracing: undefined,
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
