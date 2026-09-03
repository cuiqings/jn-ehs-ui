<template>
  <BasicModal
    v-bind="$attrs"
    @register="registerModal"
    :title="modalTitle"
    :width="800"
    :maskClosable="false"
    @ok="handleOk"
    @cancel="handleCancel"
    :show-footer="true"
    :show-ok-btn="true"
  >
    <div class="upload-wrap">
      <div class="upload-tip">支持上传 `pdf`、`word`（doc/docx）、`Excel`（xls/xlsx）文件。</div>
      <a-upload
        v-model:file-list="fileList"
        :action="uploadUrl"
        :headers="headers"
        :data="{ biz: bizPath }"
        :accept="accept"
        :max-count="1"
        :before-upload="beforeUpload"
        @change="handleChange"
      >
        <a-button type="primary">
          <UploadOutlined />
          选择文件
        </a-button>
      </a-upload>
    </div>
  </BasicModal>
</template>

<script lang="ts" setup>
  import { ref, reactive } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { UploadOutlined } from '@ant-design/icons-vue';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { uploadUrl } from '/@/api/common/api';
  import { getToken } from '/@/utils/auth';
  import type { UploadChangeParam, UploadFile } from 'ant-design-vue';
  import { uploadReport } from './api';
  type ReportType = 'repair' | 'analysis';
  const emit = defineEmits(['success', 'register']);
  const { createMessage } = useMessage();
  const headers = reactive({
    'X-Access-Token': getToken(),
  });
  const modalTitle = ref('上传报告');
  const bizPath = ref('safetyReviewForm');
  const accept = ref(
    '.pdf,.doc,.docx,.xls,.xlsx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  );
  const currentRecord = ref<any>(null);
  const currentType = ref<ReportType>('repair');

  const fileList = ref<UploadFile[]>([]);

  const getExtByName = (name?: string) => {
    if (!name) return '';
    const clean = String(name).split('?')[0].split('#')[0];
    const idx = clean.lastIndexOf('.');
    return idx >= 0 ? clean.slice(idx + 1).toLowerCase() : '';
  };
  const allowedExt = ['pdf', 'doc', 'docx', 'xls', 'xlsx'];
  const beforeUpload = (file: File) => {
    const ext = getExtByName(file.name);
    if (!allowedExt.includes(ext)) {
      createMessage.error('仅支持 pdf、doc/docx、xls/xlsx 格式文件');
      return false;
    }
    // 若不需要大小限制，可删除此逻辑
    const isLt200M = file.size / 1024 / 1024 < 200;
    if (!isLt200M) {
      createMessage.error('文件大小不能超过 200MB');
      return false;
    }
    return true;
  };

  const handleChange = (info: UploadChangeParam) => {
    const file = info.file;
    if (file.status === 'error') {
      createMessage.error(`${file.name} 上传失败`);
      return;
    }
    if (file.status === 'done') {
      const code = (file.response as any)?.code;
      const msg = (file.response as any)?.message;
      if (code !== undefined && code !== 200) {
        createMessage.error(msg || `${file.name} 上传失败`);
      } else {
        createMessage.success(`${file.name} 上传成功`);
      }
    }
  };

  const [registerModal, { closeModal, setModalProps }] = useModalInner((data: any) => {
    currentRecord.value = data.record;
    currentType.value = data.reportType || 'repair';
    modalTitle.value = currentType.value === 'repair' ? '上传整改报告' : '上传分析报告';
    fileList.value = [];
  });

  const handleOk = async () => {
    try {
      const record = currentRecord.value;
      if (!record?.id) {
        createMessage.error('缺少记录ID，无法上传');
        return;
      }

      const uploaded = fileList.value[0];
      if (!uploaded || uploaded.status !== 'done') {
        createMessage.warning('请先选择并上传文件');
        return;
      }

      const filePath = (uploaded.response as any)?.message || uploaded.url;
      if (!filePath) {
        createMessage.error('无法获取上传文件路径');
        return;
      }
      setModalProps({ confirmLoading: true });
      if (currentType.value === 'repair') {
        await uploadReport({ id: record.id, repairReportFile: filePath });
      } else {
        await uploadReport({ id: record.id, analysisReportFile: filePath });
      }
      setModalProps({ confirmLoading: false });
      emit('success');
      closeModal();
    } catch (e) {
      setModalProps({ confirmLoading: false });
      createMessage.error('上传失败，请稍后重试');
    }
  };

  const handleCancel = () => {
    closeModal();
  };
</script>

<style lang="less" scoped>
  .upload-wrap {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .upload-tip {
    color: #595959;
  }
</style>
