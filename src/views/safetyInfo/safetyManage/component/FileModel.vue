<template>
  <a-modal :title="title" :width="width" :body-style="{ padding: '20px' }" v-model:visible="visible" :footer="false">
    <div>
      <div class="spin-content" v-if="pstatus === 'active'"> 正在上传，请稍后 </div>
      <div class="spin-content" v-if="pstatus === 'success'">上传成功</div>
      <div class="spin-content" v-if="pstatus === 'exception'">上传失败</div>
      <div class="spin-content" v-if="pstatus === 'normal'">上传完成</div>
      <Progress :percent="pPercent" :status="pstatus" />
      <div v-if="wasteList && wasteList.length" class="spin-error">
        * 下列文件大小超出限制（{{ maxSize }}M），请重新选择：
        <span class="spin-error-file">{{ wasteName }}</span>
      </div>
      <div class="spin-bottom" v-show="pstatus === 'success' || pstatus === 'exception' || pstatus === 'normal'">
        <a-button @click="handleCancel">关闭</a-button>
      </div>
    </div>
  </a-modal>
</template>
<script setup name="file-model" lang="ts">
  import { useFileModel } from './hooks/useFileModel';
  import { Progress } from 'ant-design-vue';
  const emit = defineEmits(['ok', 'close']);
  const { title, width, visible, pstatus, pPercent, wasteList, maxSize, wasteName, handleCancel, open } = useFileModel(emit);
  defineExpose(open);
</script>
<style lang="less" scoped>
  .spin-content {
    border: 1px solid #91d5ff;
    background-color: #e6f7ff;
    padding: 30px;
    text-align: center;
    margin-bottom: 15px;
  }
  .spin-bottom {
    text-align: center;
    margin-top: 15px;
  }
  .spin-error {
    margin-top: 10px;
    font-size: 14px;
    color: #ff7875;
  }
  .spin-error-file {
    color: rgba(0, 0, 0, 0.6);
  }
</style>
