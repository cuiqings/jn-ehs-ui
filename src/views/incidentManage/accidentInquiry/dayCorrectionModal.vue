<template>
  <div>
    <basic-modal v-bind="$attrs" @register="registerModal" :width="600" title="损失天数补正">
      <a-row>
        <a-col :md="6" style="line-height: 30px"> 损失天数： </a-col>
        <a-col :md="18">
          <a-input-number v-model:value="info.lostWorkday" :min="0" :precision="1" :max="99999.9" style="width: 100%" placeholder="请输入">
            <template #addonAfter>天</template>
          </a-input-number>
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
  import { reactive } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { modifyLostWorkday } from './url/index';
  import { useMessage } from '/@/hooks/web/useMessage';
  const { createMessage } = useMessage();
  const emit = defineEmits(['success']);
  const info = reactive({
    lostWorkday: '' as string | number,
    eventId: undefined,
  });
  const [registerModal, { closeModal }] = useModalInner((data) => {
    info.eventId = data.eventId;
    info.lostWorkday = data.lostWorkday;
  });
  const close = () => {
    closeModal();
  };
  const confirmClose = () => {
    if (info.lostWorkday === '' || (!info.lostWorkday && info.lostWorkday !== 0)) {
      return createMessage.warning('请输入损失天数！');
    }
    modifyLostWorkday(info).then(() => {
      //关闭弹窗
      closeModal();
      //刷新列表
      emit('success');
    });
  };
</script>
