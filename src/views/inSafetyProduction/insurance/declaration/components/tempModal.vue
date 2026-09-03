<template>
  <BasicModal @register="register" v-bind="$attrs" :bodyStyle="{ height: '108px', overflow: 'hidden' }"
    :canFullscreen="false" title="模板维护" width="550" height="auto" @cancel="cancel" @ok="handleSubmit" destroyOnClose>
    <div class="main">
      <div class="text">
        <h3>工伤保险人员明细模板</h3>
        <p>用于上报工伤保险人员增减明细</p>
      </div>
      <a-space :size="24">
        <a-button @click="onExportTemplateXls">下载</a-button>
        <a-upload v-model:file-list="fileList" name="file" :action="uploadUrl" :headers="headers"
          :showUploadList="false"
          @change="handleChange">
          <a-button type="primary">
            <upload-outlined></upload-outlined>
            更新
          </a-button>
        </a-upload>
      </a-space>
    </div>
    <template #footer>
      <a-space :size="24">
        <a-button @click="close">关闭</a-button>
      </a-space>
    </template>
  </BasicModal>
</template>
<script lang="ts" setup>
import { ref, reactive } from 'vue';
import { BasicModal, useModalInner } from '/@/components/Modal';
// import { addPhysicalExamination, hazardFactors } from '../api'
import { useMethods } from '/@/hooks/system/useMethods';
import type { FormInstance, UploadProps } from 'ant-design-vue';
 import { useMessage } from '/@/hooks/web/useMessage';
import { useGlobSetting } from '/@/hooks/setting';
import { getToken } from '/@/utils/auth';

  const { createMessage } = useMessage();

const globSetting = useGlobSetting();
const baseUploadUrl = globSetting.uploadUrl;
const uploadUrl = `${baseUploadUrl}/declare/import`;
const headers = reactive({
  'X-Access-Token': getToken(),
});
const title = ref('检验')
const emits = defineEmits(['submitSuccess']);
const categoryOptions = ref<any[]>([]);
const formRef = ref<FormInstance | null>(null);
const userName = ref('')
const formState = ref({
  type: undefined,
  hazardFactors: [],
  id: '',
});
const fileList = ref<UploadProps['fileList']>([]);
const [register, { closeModal, changeOkLoading }] = useModalInner(async (data) => {
});

const handleChange = (res) => { 
  console.log(res);
  if(res.file.response && res.file.response.code === 200){
    createMessage.success('导入成功');
    closeModal();
  }
};

//导入模版下载
function onExportTemplateXls() {
  const { handleExportXls } = useMethods();
  let params = {};
  handleExportXls('增减申报模板', '/declare/export', params);
}

const close = () => {
  closeModal();
}


</script>
<style lang="less" scoped>
.main {
  width: 100%;
  height: 80px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #f5f5f5;
  border-radius: 8px;
  padding: 0 15px;

  h3,
  p {
    padding: 0;
    margin: 0;
  }

  h3 {
    font-weight: 600;
  }
}
</style>
