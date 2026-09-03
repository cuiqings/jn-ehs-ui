<template>
  <BasicModal
    v-bind="$attrs"
    @register="registerModal"
    :width="900"
    :bodyStyle="{ padding: '10px 0 0 0', height: '700px' }"
    :title="modalTitle"
    destroyOnClose
  >
    <a-form ref="formRef" :model="form" :rules="rules" :label-col="{ span: 7 }" :wrapper-col="{ span: 17 }">
      <a-row>
        <a-col :span="12">
          <a-form-item label="建设单位" name="org" :rules="[{ required: true, message: '请选择建设单位', trigger: 'change' }]">
            <a-select
              v-model:value="form.org"
              :options="orgOptions"
              placeholder="请选择"
              show-search
              :filter-option="(input: string, option: any) =>  option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0"
            />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="建设项目" name="constructProject">
            <a-input v-model:value="form.constructProject" placeholder="请输入" :maxlength="50" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="预评价编写单位" name="preEvaluateUnit" :rules="[{ required: true, message: '请输入预评价编写单位', trigger: 'blur' }]">
            <a-input v-model:value="form.preEvaluateUnit" placeholder="请输入" :maxlength="50" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="设计单位" name="designUnit" :rules="[{ required: true, message: '请输入设计单位', trigger: 'blur' }]">
            <a-input v-model:value="form.designUnit" placeholder="请输入" :maxlength="50" />
          </a-form-item>
        </a-col>
        <a-col :span="24">
          <a-form-item label="验收单位" name="checkUnit" :rules="[{ required: true, message: '请输入验收单位', trigger: 'blur' }]">
            <a-input v-model:value="form.checkUnit" placeholder="请输入" :maxlength="50" />
          </a-form-item>
        </a-col>
      </a-row>
      <a-row>
        <a-card title="职业健康三同时" style="width: 100%; background-color: #fafafa; border-radius: 5px">
          <a-form-item label="职业病危害控制效果评价" name="zyjkFile1" :label-col="{ span: 24 }" :wrapper-col="{ span: 24 }">
            <customize-upload v-model:value="form.zyjkFile1" />
          </a-form-item>
          <a-form-item label="职业病危害预评价" name="zyjkFile2" :label-col="{ span: 24 }" :wrapper-col="{ span: 24 }">
            <customize-upload v-model:value="form.zyjkFile2" />
          </a-form-item>
          <a-form-item label="职业病危害现状评价" name="zyjkFile3" :label-col="{ span: 24 }" :wrapper-col="{ span: 24 }">
            <customize-upload v-model:value="form.zyjkFile3" />
          </a-form-item>
        </a-card>
      </a-row>
      <a-row>
        <a-card title="安全设备三同时" style="width: 100%; margin-top: 20px; background-color: #fafafa; border-radius: 5px">
          <a-form-item label="安全预评价" name="aqsbFile1" :label-col="{ span: 24 }" :wrapper-col="{ span: 24 }">
            <customize-upload v-model:value="form.aqsbFile1" />
          </a-form-item>
          <a-form-item label="安全设施设计" name="aqsbFile2" :label-col="{ span: 24 }" :wrapper-col="{ span: 24 }">
            <customize-upload v-model:value="form.aqsbFile2" />
          </a-form-item>
          <a-form-item label="验收报告" name="aqsbFile3" :label-col="{ span: 24 }" :wrapper-col="{ span: 24 }">
            <customize-upload v-model:value="form.aqsbFile3" />
          </a-form-item>
          <a-form-item label="省厅批复" name="aqsbFile4" :label-col="{ span: 24 }" :wrapper-col="{ span: 24 }">
            <customize-upload v-model:value="form.aqsbFile4" />
          </a-form-item>
        </a-card>
      </a-row>
      <a-row>
        <a-card title="消防三同时" style="width: 100%; margin-top: 20px; background-color: #fafafa; border-radius: 5px">
          <a-form-item label="消防设计" name="xfFile1" :label-col="{ span: 24 }" :wrapper-col="{ span: 24 }">
            <customize-upload v-model:value="form.xfFile1" />
          </a-form-item>
          <a-form-item label="消防设计审核" name="xfFile2" :label-col="{ span: 24 }" :wrapper-col="{ span: 24 }">
            <customize-upload v-model:value="form.xfFile2" />
          </a-form-item>
          <a-form-item label="消防验收" name="xfFile3" :label-col="{ span: 24 }" :wrapper-col="{ span: 24 }">
            <customize-upload v-model:value="form.xfFile3" />
          </a-form-item>
        </a-card>
      </a-row>
    </a-form>
    <template #footer>
      <a-button @click="close" :disabled="loading">取消</a-button>
      <a-button type="primary" :loading="loading" @click="handleOk">确定</a-button>
    </template>
  </BasicModal>
</template>

<script setup lang="ts" name="three-simultaneity-modal">
  import { ref, reactive, onMounted } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import type { FormInstance } from 'ant-design-vue';
  import { getDepart3ListWithSecurity } from '/@/api/common/api';
  import CustomizeUpload from './CustomizeUpload.vue';
  import { add, edit } from './api';
  const emit = defineEmits(['success']);
  const modalTitle = ref('新增三同时台账');
  const loading = ref(false);
  const formRef = ref<FormInstance | null>(null);
  const type = ref('add');
  const form = reactive({
    id: '',
    ledgerType: '8',
    org: undefined,
    constructProject: '',
    preEvaluateUnit: '',
    designUnit: '',
    checkUnit: '',
    zyjkFile1: '',
    zyjkFile2: '',
    zyjkFile3: '',
    aqsbFile1: '',
    aqsbFile2: '',
    aqsbFile3: '',
    aqsbFile4: '',
    xfFile1: '',
    xfFile2: '',
    xfFile3: '',
  });

  const rules = {
    org: [{ required: true, message: '请选择建设单位', trigger: 'change' }],
    constructProject: [{ required: true, message: '请输入建设项目', trigger: 'blur' }],
    preEvaluateUnit: [{ required: true, message: '请输入预评价编写单位', trigger: 'blur' }],
    designUnit: [{ required: true, message: '请输入设计单位', trigger: 'blur' }],
    checkUnit: [{ required: true, message: '请输入验收单位', trigger: 'blur' }],
  };

  const orgOptions = ref<any[]>([]);

  const [registerModal, { closeModal }] = useModalInner((data) => {
    type.value = data.type;
    modalTitle.value = type.value === 'edit' ? '编辑三同时台账' : '新增三同时台账';
    if (type.value !== 'add') {
      Object.assign(form, data.record);
    } else {
      resetForm();
    }
  });
  onMounted(() => {
    getDepart3ListWithSecurity().then((res) => {
      orgOptions.value = res.map((item) => ({
        label: item.departName,
        value: item.orgCode,
      }));
    });
  });
  function resetForm() {
    Object.assign(form, {
      id: '',
      ledgerType: '8',
      org: undefined,
      constructProject: '',
      preEvaluateUnit: '',
      designUnit: '',
      checkUnit: '',
      zyjkFile1: '',
      zyjkFile2: '',
      zyjkFile3: '',
      aqsbFile1: '',
      aqsbFile2: '',
      aqsbFile3: '',
      aqsbFile4: '',
      xfFile1: '',
      xfFile2: '',
      xfFile3: '',
    });
    if (orgOptions.value.length === 1) {
      form.org = orgOptions.value[0].value;
    }
  }

  function close() {
    closeModal();
    resetForm();
  }

  async function handleOk() {
    await formRef.value?.validate();
    loading.value = true;
    if (type.value === 'add') {
      add(form)
        .then(() => {
          emit('success');
          closeModal();
        })
        .finally(() => {
          loading.value = false;
        });
    } else {
      edit(form)
        .then(() => {
          emit('success');
          closeModal();
        })
        .finally(() => {
          loading.value = false;
        });
    }
  }
</script>

<style scoped lang="less">
  :deep(.ant-card-body) {
    padding: 10px;
  }
  :deep(.ant-col-24) {
    .ant-form-item-label {
      width: 127px !important;
    }
    .ant-form-item-control {
      width: calc(100% - 127px) !important;
    }
    .ant-col-7 {
      flex: none !important;
    }
    .ant-col-17 {
      flex: none !important;
      max-width: 100% !important;
    }
  }
</style>
