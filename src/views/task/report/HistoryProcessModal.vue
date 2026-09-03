<template>
  <div>
    <BasicModal v-bind="$attrs" @register="registerModal" title="" width="700px" :showOkBtn="false">
      <div class="work-required">
        <div>
          <div style="margin: 0 0 15px 0; color: #000; width: 80px; text-align: right">汇报记录： </div>
          <a-timeline v-if="historyList.length > 0">
            <a-timeline-item v-for="item in historyList" :key="item.time">
              <div class="his-detail">
                <div class="his-time">{{ item.time }} ： </div>
                <div class="his-content">
                  <p v-if="item.type.includes('验收')">验收状态：{{ item.type }} </p>
                  <p v-if="!item.type.includes('验收')">任务状态：{{ item.type }} </p>
                  <p> {{ item.handler }} </p>
                  <p v-if="item.checkExplain || item.finishExplain">完成说明：{{ item.checkExplain || item.finishExplain }}</p>
                  <div style="display: flex; margin-top: 20px" v-if="item.attachmentImgList && item.attachmentImgList.length > 0">
                    <div style="width: 60px; text-align: right">图片：</div>
                    <div style="width: 352px">
                      <a-upload
                        list-type="picture-card"
                        v-model:file-list="item.attachmentImgList"
                        :max-count="10"
                        @preview="handlePreview"
                        :disabled="true"
                      >
                      </a-upload>
                      <a-modal :visible="previewVisible" :footer="null" @cancel="handleCancel(item)">
                        <img alt="example" style="width: 100%" :src="previewImage" /> </a-modal
                    ></div>
                  </div>
                  <div v-if="item.attachmentFileList && item.attachmentFileList.length > 0">
                    <div class="work-item">
                      <span class="label">附件：</span>
                      <div class="content">
                        <div v-for="(filePath, index) in item.attachmentFileList" @click="handlePreviewFile(filePath)" :key="index">
                          <span class="attachment-btn">
                            {{ filePath.split('/')[filePath.split('/').length - 1] }}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </a-timeline-item>
          </a-timeline>
          <span v-else>暂无</span>
        </div>
      </div>
    </BasicModal>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import type { UploadProps } from 'ant-design-vue';
import { getHistoryDetail } from './report.api';
import { BasicModal, useModalInner } from '/@/components/Modal';
import { getFileAccessHttpUrl } from '/@/utils/common/compUtils';
import { previewFile } from '/@/api/common/api';
const previewVisible = ref(false);
const previewImage = ref('');
const previewTitle = ref('');
const record = ref({});
const historyList = ref([]);
// 注册弹窗
const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
  console.log('useModalInner data', data);
  record.value = data.record;
  // 历史记录
  getHistoryDetail({ id: data.record.id }).then((res) => {
    console.log('getHistoryData', res);
    res.map((item) => {
      if (item.attachmentImg) {
        item.attachmentImgList = item.attachmentImg.split(',').map((e) => {
          return {
            uid: Math.random(),
            name: 'image.png',
            status: 'done',
            url: getFileAccessHttpUrl(e),
          };
        });
      }
      if (item.attachmentFile) {
        item.attachmentFileList = item.attachmentFile.split(',');
      }
    });
    historyList.value = res;
  });
});
const handlePreview = async (file: UploadProps['fileList'][number]) => {
  if (!file.url && !file.preview) {
    file.preview = (await getBase64(file.originFileObj)) as string;
  }
  previewImage.value = file.url || file.preview;
  previewVisible.value = true;
  previewTitle.value = file.name || file.url.substring(file.url.lastIndexOf('/') + 1);
};
const handleCancel = () => {
  previewVisible.value = false;
  previewTitle.value = '';
};
// 预览
function handlePreviewFile(filePath) {
  if (filePath) {
    previewFile(filePath).then((res) => {
      window.open(res, '_blank');
    });
  }
}
</script>

<style lang="less" scoped>
.work-required {
  margin: 20px 30px;
  .work-item {
    margin-bottom: 10px;
    display: flex;
    .label {
      display: block;
      color: #000;
      width: 80px;
      text-align: right;
    }
    .content {
      display: block;
      color: #666;
      width: 500px;
    }
  }
  .his-detail {
    display: flex;
    .his-time {
      margin-right: 10px;
      width: 150px;
    }
    .his-content {
      width: 380px;
      p {
        margin: 0;
        width: 440px;
      }
    }
  }
}
.attachment-btn {
  display: block;
  color: #1890ff;
  cursor: pointer;
}
</style>