<template>
  <div>
    <basic-modal v-bind="$attrs" @register="registerModal" :width="1200" title="报警查看" destroyOnClose @close="close">
      <div class="modal-body">
        <div>
          <img :src="getFileAccessHttpUrl(info.alarmImg)" style="height: 400px; width: 100%" />
        </div>
        <div>
          <div
            >报警名称：<span>{{ info.alarmName }}</span></div
          >
          <div
            >摄像头名称：<span>{{ info.cameraName }}</span></div
          >
          <div
            >所属机构：<span>{{ info.orgCode }}</span></div
          >
          <div
            >工序：<span>{{ info.structureName }}</span></div
          >
          <div
            >子工序：<span>{{ info.structureChildName }}</span></div
          >
          <div
            >报警时间：<span>{{ info.alarmStrTime }}</span></div
          >
          <div
            >结束时间：<span>{{ info.alarmEndTime }}</span></div
          >
          <div
            >持续时间：<span>{{ info.duration }}</span></div
          >
          <div v-if="info.cameraType !== '劳保穿戴'"
            >报警阈值：<span>{{ info.threshold }}</span>
          </div>
          <div v-if="info.cameraType !== '劳保穿戴'" style="color: red"
            >检测值：<span>{{ info.alarmValue }}</span></div
          >
          <div v-if="info.cameraType === '劳保穿戴'"
            >报警原因：<span>{{ info.errorMsg }}</span></div
          >
          <div v-if="info.handlerList.length > 0">
            <div style="color: #1890ff">验收处理</div>
            <div v-for="(item, index) in info.handlerList" :key="index">
              <div v-if="item.handler">
                <div style="display: flex; justify-content: space-between">
                  <div>处理人：{{ item.handler?.handlePeople }}<span></span></div>
                  <div>处理时间：{{ item.handler?.handleTime }}</div>
                </div>
                <div>处理说明：<a-textarea style="margin-top: 10px" :value="item.handler?.remark" disabled /></div>
                <div style="margin: 10px 0"><j-image-upload :value="item.handler?.annexFile" :file-max="10" disabled text="" /></div>
              </div>
              <div v-if="item.acceptance">
                <div style="display: flex; justify-content: space-between">
                  <div>验收人：{{ item.acceptance?.handlePeople }}<span></span></div>
                  <div>验收时间：{{ item.acceptance?.handleTime }}</div>
                </div>
                <div>验收说明：<a-textarea style="margin-top: 10px" :value="item.acceptance?.remark" disabled /></div>
                <div style="margin: 10px 0"><j-image-upload :value="item.acceptance?.annexFile" :file-max="10" disabled text="" /></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <div>
          <a-button :loading="loading" style="margin-right: 15px" @click="close">取消</a-button>
        </div>
      </template>
    </basic-modal>
  </div>
</template>
<script lang="ts" name="alarm-modal" setup>
  import { ref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { JImageUpload } from '/@/components/Form';
  import { details } from './url/index';
  import { getFileAccessHttpUrl } from '/@/utils/common/compUtils';
  const loading = ref(false);
  const info: any = ref({
    id: '',
    alarmImg: '',
    cameraName: '',
    alarmName: '',
    orgCode: '',
    structureName: '',
    structureChildName: '',
    alarmStrTime: '',
    alarmEndTime: '',
    duration: '',
    threshold: '',
    alarmValue: '',
    handlerList: [],
    errorMsg: '',
  });
  const [registerModal, { closeModal }] = useModalInner((data) => {
    details({ id: data.id }).then((res) => {
      info.value = res;
      if (res.handlerList) info.value.handlerList = res.handlerList;
      else info.value.handlerList = [];
    });
  });
  const close = () => {
    closeModal();
  };
</script>
<style lang="less" scoped>
  .modal-body {
    display: flex;
    justify-content: space-between;
    & > div:nth-child(1) {
      width: calc(60% - 30px);
      & > div {
        display: flex;
        justify-content: space-between;
      }
    }
    & > div:nth-child(2) {
      width: 40%;
      & > div {
        margin-bottom: 10px;
        & > div {
          margin-bottom: 10px;
        }
      }
    }
  }
</style>
