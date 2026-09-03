<template>
  <div>
    <BasicModal v-bind="$attrs" @register="registerModal" title="查看" width="700px" :showOkBtn="false">
      <div class="work-required">
        <div class="work-item">
          <span class="label">工作要求：</span>
          <span v-if="detailData.job" class="content">{{ detailData.job.jobRequirement }}</span>
        </div>
        <div class="work-item">
          <span class="label">完成时限：</span>
          <span v-if="detailData.publish" class="content">{{ detailData.publish.completeTimeLimit }}</span>
        </div>
        <div class="work-item">
          <span class="label">责任单位：</span>
          <span v-if="detailData.publish" class="content">{{ detailData.publish.dutyUnitName }}</span>
        </div>
        <div class="work-item">
          <span class="label">汇报时间：</span>
          <span class="content">{{ detailData.reportTime }}</span>
        </div>
        <div class="work-item">
          <span class="label">完成说明：</span>
          <span class="content">{{ detailData.finishExplain }}</span>
        </div>
        <div class="work-item" v-if="detailData.attachmentFile">
          <span class="label">附件：</span>
          <div>
            <div v-for="item in detailData.attachmentFileList" class="attachment-btn" @click="handlePreview(item)">{{
              item.split('/')[item.split('/').length - 1]
            }}</div>
          </div>
        </div>
        <div style="margin: 30px 0">
          <div style="margin: 10px 0; color: #000; width: 80px; text-align: right">汇报记录： </div>
          <div v-if="historyList.length > 0">
            <a-timeline style="height: auto">
              <a-timeline-item v-for="item in historyList" :key="item.time">
                <div class="his-detail">
                  <div class="his-time">{{ item.time }} ： </div>
                  <div class="his-content">
                    <p v-if="item.type.includes('验收')">验收状态：{{ item.type }} </p>
                    <p v-else>任务状态：{{ item.type }} </p>
                    <p>{{ item.handler }} </p>
                    <p>完成说明：{{ item.checkExplain || item.finishExplain }}</p>
                    <div style="display: flex; margin-top: 20px" v-if="item.attachmentImgList && item.attachmentImgList.length > 0">
                      <div style="width: 44px; text-align: left">图片：</div>
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
                        <span class="label" style="text-align: left">附件：</span>
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
          </div>

          <span v-else>暂无</span>
        </div>
      </div>
    </BasicModal>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import type { UploadProps } from 'ant-design-vue';
import { getWorkRequiredDetail, getHistoryDetail } from './publish.api';
import { BasicModal, useModalInner } from '/@/components/Modal';
import { previewFile } from '/@/api/common/api';
import { getFileAccessHttpUrl } from '/@/utils/common/compUtils';

const record = ref({});
const detailData = ref({});
const historyList = ref([]);
const previewVisible = ref(false);
const previewImage = ref('');
const previewTitle = ref('');
// 注册弹窗
const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
  console.log('useModalInner data', data);
  record.value = data.record;
  // 任务详情
  getWorkRequiredDetail({ id: data.record.id }).then((res) => {
    console.log('getWorkRequiredDetail', res);
    if (res.attachmentFile) {
      res.attachmentFileList = res.attachmentFile.split(',').map((item1) => {
        return item1;
      });
    }
    detailData.value = res;
  });
  // 历史记录
  await getHistoryDetail({ id: data.record.id }).then((res) => {
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
      width: 150px;
    }
    .his-content {
      width: 420px;
    }
  }
}
.attachment-btn {
  display: block;
  color: #1890ff;
  cursor: pointer;
}
</style>