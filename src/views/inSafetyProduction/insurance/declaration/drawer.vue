<template>
  <BasicDrawer
    :showFooter="false"
    forceRender
    v-bind="$attrs"
    @register="register"
    :title="title"
    width="65%"
    @close="close"
    @ok="handleSubmit"
    destroyOnClose
  >
    <div style="width: 100%; padding-bottom: 60px">
      <a-form ref="formRef" :model="formState" name="basic" :label-col="{ span: 4 }" :wrapper-col="{ span: 20 }">
        <a-row :gutter="12">
          <a-col :span="16">
            <a-form-item label="所属单位" name="orgCode" :rules="[{ required: true, message: '请选择' }]">
              <a-select
                v-model:value="formState.orgCode"
                :options="departList"
                @change="orgChange"
                placeholder="请选择"
                :disabled="title == '查看'"
                :fieldNames="{ label: 'departName', value: 'orgCode' }"
              />
            </a-form-item>
          </a-col>
          <a-col :span="16">
            <a-form-item label="上报月度" name="month" :rules="[{ required: true, message: '请输入' }]">
              <a-date-picker
                :disabled="title == '查看'"
                style="width: 100%"
                placeholder="请选择"
                v-model:value="formState.month"
                picker="month"
                value-format="YYYYMM"
                format="YYYYMM"
              />
            </a-form-item>
          </a-col>
          <a-col :span="16">
            <a-form-item label="新增人数" name="addNum" :rules="[{ required: true, message: '请选择' }]">
              <a-input-number :disabled="title == '查看'" style="width: 100%" v-model:value="formState.addNum" placeholder="请输入" />
            </a-form-item>
          </a-col>
          <a-col :span="16">
            <a-form-item label="减员人数" name="decreaseNum" :rules="[{ required: true, message: '请选择' }]">
              <a-input-number :disabled="title == '查看'" style="width: 100%" v-model:value="formState.decreaseNum" placeholder="请输入" />
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item
              label="人员明细"
              name="fileUrl"
              :rules="[{ required: formState.addNum > 0 || formState.decreaseNum > 0, message: '请上传' }]"
            >
              <div class="download">
                <a-button :disabled="title == '查看'" style="margin-right: 16px" type="primary" @click="downloadTemplate()">模板下载</a-button>
                <JUpload
                  :disabled="title == '查看'"
                  accept=".doc,.docx,.pdf,.xls,.xlsx"
                  ref="uploadRef"
                  :maxCount="1"
                  v-model:value="formState.fileUrl"
                  text="上传人员明细文件"
                />
              </div>
            </a-form-item>
          </a-col>
          <a-col :span="16">
            <a-form-item label="审核人" name="approver" :rules="[{ required: true, message: '请选择' }]">
              <JUserModal :disabled="title == '查看'" :org-code="formState.orgCode" v-model:value="formState.approver" placeholder="请选择" />
            </a-form-item>
            <a-form-item label="审核时间" name="approverTime" v-if="title == '查看'">
              <a-input v-model:value="formState.approverTime" />
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </div>
    <template #footer>
      <div style="display: flex; align-items: center; justify-content: center; height: 60px" v-if="title !== '查看'">
        <a-space :size="24">
          <a-button @click="close">取消</a-button>
          <a-button v-if="!readonly" type="primary" @click="handleSubmit">确定</a-button>
        </a-space>
      </div>
    </template>
  </BasicDrawer>
</template>
<script lang="ts" setup>
  import { JUpload } from '/@/components/Form/src/jeecg/components/JUpload';
  import { BasicDrawer, useDrawerInner } from '/@/components/Drawer';
  import type { FormInstance } from 'ant-design-vue';
  import { JUserModal } from '/@/components/Form';
  import { reportAdd } from '../api';
  import { downloadFileAll, getDepart3ListWithSecurity } from '/@/api/common/api';
  import { ref, reactive } from 'vue';

  const readonly = ref(false);
  const departList = ref<any[]>([]);
  const formRef = ref<FormInstance | null>(null);
  const title = ref('上报');
  const formState = reactive({
    month: undefined,
    orgCode: undefined,
    addNum: 0,
    decreaseNum: 0,
    fileUrl: '',
    approver: undefined,
    approverTime: undefined,
  });

  const emits = defineEmits(['submitSuccess']);
  const submitIng = ref(false);
  const [register, { closeDrawer }] = useDrawerInner(async (data) => {
    departList.value = await getDepart3ListWithSecurity();
    title.value = data.title;
    Object.assign(formState, data.record);
  });

  const handleSubmit = () => {
    formRef.value
      ?.validate()
      .then(() => {
        const params = JSON.parse(JSON.stringify(formState));
        submitIng.value = true;
        reportAdd(params)
          .then((res) => {
            submitIng.value = false;
            emits('submitSuccess', res);
            closeDrawer();
            close();
          })
          .catch((err) => {
            submitIng.value = false;
          });
      })
      .catch(() => {
        submitIng.value = false;
      });
  };

  const downloadTemplate = () => {
    downloadFileAll('/declare/export', `人员明细模板.xlsx`);
  };

  const close = () => {
    closeDrawer();
    readonly.value = false;
    submitIng.value = false;
    formRef.value?.resetFields();
  };

  const orgChange = () => {
    formState.approver = undefined;
  };
</script>
<style scoped>
  .download {
    display: flex;
  }
</style>
