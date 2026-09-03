<template>
  <div>
    <BasicModal v-bind="$attrs" @register="registerModal" title="验收" :footer="null">
      <div class="work-item">
        <span class="label">责任单位/人：</span>
        <span class="content">{{ curRecord.dutyUnitName }}</span>
      </div>
      <div class="work-item">
        <span class="label">完成说明：</span>
        <span class="content">{{ curRecord.finishExplain }}</span>
      </div>
      <div class="work-item" v-if="curRecord.attachmentFile">
        <span class="label">附件：</span>
        <span class="content" style="margin: -5px 0 0 -19px"
          ><a-button type="link" v-for="(item, index) in curRecord.attachmentFileList" :key="index" @click="handlePreview(item)">{{
            item.split('/')[item.split('/').length - 1]
          }}</a-button>
        </span>
      </div>
      <a-textarea v-model:value="checkExplain" :maxlength="200" showCount="true" :rows="3" placeholder="请输入验收说明" />
      <div style="text-align: center; margin-top: 50px">
        <a-button style="margin-right: 20px" type="danger" @click="handleNoAccept">不通过</a-button>
        <a-button type="primary" @click="handleOkAccept">通过</a-button>
      </div>
    </BasicModal>
  </div>
</template>
      
<script lang="ts" setup>
import { ref } from 'vue';
import { BasicModal, useModalInner } from '/@/components/Modal';
import { checkReport } from './listing.api';
import { previewFile } from '/@/api/common/api';
import { message } from 'ant-design-vue';
const emit = defineEmits(['register', 'success']);
const curRecord = ref({});
const checkExplain = ref('');

// 注册弹窗
// 这个方法执行需要openModal传入第二个参数
const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
  console.log('useModalInner data', data);
  checkExplain.value = '';
  // 处理附件
  if (data.record.attachmentFile) {
    data.record.attachmentFileList = data.record.attachmentFile.split(',');
  }
  curRecord.value = data.record;
  if (data.record.key) {
  }

  // 下次点击弹窗的时候清空表单
});
async function handleOkAccept() {
  // if (!checkExplain.value) {
  //   message.error('请输入验收说明');
  //   return;
  // }
  // 请求接口逻辑
  let params = {
    id: curRecord.value.id,
    checkExplain: checkExplain.value,
    opinion: 'agree',
  };
  await checkReport(params);
  closeModal();
  emit('success', params);
  checkExplain.value = '';
}
async function handleNoAccept() {
  if (!checkExplain.value) {
    message.error('请输入验收说明');
    return;
  }
  let params = {
    id: curRecord.value.id,
    checkExplain: checkExplain.value,
    opinion: 'disagree',
  };
  // 请求接口逻辑
  await checkReport(params);
  closeModal();
  emit('success', params);
  checkExplain.value = '';
}
// 预览
function handlePreview(filePath) {
  if (filePath) {
    previewFile(filePath).then((res) => {
      window.open(res, '_blank');
    });
  }
}
</script>
      
  <style scoped lang="less">
.deadline-wrap {
  font-size: 13px;
  margin-bottom: 20px;
}
.report-deadline {
  display: inline-block;
  width: 25%;
  text-align: right;
}
.already-text {
  text-align: center;
  font-size: 16px;
  color: #ff8d04;
  margin-top: 20px;
}
.work-item {
  margin-bottom: 10px;
  display: flex;
  .label {
    display: block;
    color: #000;
    width: 130px;
    text-align: right;
  }
  .content {
    display: block;
    color: #666;
    width: 500px;
  }
}
</style>
      