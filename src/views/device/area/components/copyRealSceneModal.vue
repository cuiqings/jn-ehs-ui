<template>
  <div>
    <basic-modal v-bind="$attrs" @register="registerModal" :width="600" title="复制设备实景">
      <a-row style="padding: 0 10px">
        <a-col :md="6" style="line-height: 30px"> <span style="color: red; display: inline-block; line-height: 32px">*</span>复制设备： </a-col>
        <a-col :md="18">
          <a-select v-model:value="info.id" placeholder="请选择" style="width: 100%" :options="orgOptions" />
        </a-col>
      </a-row>
      <template #footer>
        <div style="text-align: center">
          <a-button style="margin-right: 15px" @click="close">取消</a-button>
          <a-button type="primary" @click="confirmClose">确认</a-button>
        </div>
      </template>
    </basic-modal>
  </div>
</template>
<script lang="ts" name="day-correction-modal" setup>
  import { reactive, ref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { listDevicePageSetup, copyDevicePageSetup } from '../area.api';
  import { useMessage } from '/@/hooks/web/useMessage';
  const { createMessage } = useMessage();
  const emit = defineEmits(['success']);
  const info = reactive({
    id: undefined,
    deviceId: '',
  });
  const orgOptions: any = ref([]);
  const [registerModal, { closeModal }] = useModalInner(({ deviceId }) => {
    info.deviceId = deviceId;
    listDevicePageSetup().then((res) => {
      if (res) {
        orgOptions.value = res
          .filter((ite) => ite.deviceId != deviceId)
          .map((item) => {
            return {
              label: item.pageName,
              value: item.id,
            };
          });
      }
    });
  });
  const close = () => {
    closeModal();
  };
  const confirmClose = () => {
    if (info.id === '' || !info.id) {
      return createMessage.warning('请选择设备实景！');
    }
    copyDevicePageSetup(info).then(() => {
      //关闭弹窗
      closeModal();
      //刷新列表
      emit('success');
    });
  };
</script>
