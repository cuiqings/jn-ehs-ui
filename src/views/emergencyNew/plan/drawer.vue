<template>
  <BasicDrawer v-bind="$attrs" @register="register" :title="title" @close="onClose" @cancel="onClose" width="1300px">
    <a-tabs v-model:activeKey="activeKey">
      <a-tab-pane key="1" tab="演练计划信息">
        <plan-form ref="formElRef" :detail="detail" :disabled="disabled"
          @submit="onClose"></plan-form>
      </a-tab-pane>
      <a-tab-pane key="2" tab="审批流程" force-render>
        <process-form ref="processRef" :detail="detail.examineList" :disabled="disabled"
          @submit="onClose"></process-form>
      </a-tab-pane>
    </a-tabs>
    <template #footer>
      <div class="btns">
        <a-space :size="24">
          <a-button @click="save" :loading="submitIng">保存</a-button>
          <a-button :loading="submitIng" v-if="activeKey === '2'" type="primary" @click="activeKey = '1'">上一步</a-button>
          <a-button :loading="submitIng" v-if="activeKey === '1'" type="primary" @click="nextFn">下一步</a-button>
          <a-button :loading="submitIng" v-if="activeKey === '2'" type="primary" @click="submit">提交</a-button>
        </a-space>
      </div>
    </template>
  </BasicDrawer>
</template>
<script lang="ts" setup>
import { BasicDrawer, useDrawerInner } from '/@/components/Drawer';
import { planAdd, planSave, planDetail, planEdit } from '../api'
import processForm from './components/process.vue';
import planForm from './components/planForm.vue';
import { useMessage } from '/@/hooks/web/useMessage';
import { ref } from 'vue';

const { createMessage } = useMessage();
const submitIng = ref(false);
const title = ref('新增');
const activeKey = ref('1');
const disabled = ref(false);
const detail = ref<any>({});
const formElRef = ref<InstanceType<typeof planForm> | null>(null);
const processRef = ref<InstanceType<typeof processForm> | null>(null);
const [register, { closeDrawer, changeOkLoading }] = useDrawerInner((data) => {
  title.value = data.title;
  if (data.record && data.record.id) {
    planDetail(data.record.id).then(res => {
      formElRef.value?.init(res)
      processRef.value?.init(res.examineList)
    });
  }
});

const emits = defineEmits(['success']);

const save = () => {
  let params = formElRef.value?.save();
  params['examineList'] = processRef.value?.save();
  submitIng.value = true;
  planSave(params).then(res => {
    submitIng.value = false;
    emits('success')
    closeDrawer();
    reset();
  }).catch(_ => submitIng.value = false);
};

const nextFn = () => {
  formElRef.value?.submit().then(() => {
    if (activeKey.value === '1') {
      activeKey.value = '2';
    } else {
      activeKey.value = '1';
    }
  })

};

const submit = () => {
  formElRef.value?.submit().then((data1) => {
    processRef.value?.submit().then((data2) => {
      submitIng.value = true;
      let idx = 10000;
      data1.planItemList.forEach((item, index) => {
        if (!item.annex) idx = index;
      })
      if (idx !== 10000) {
        createMessage.error('请上传应急预案！');
        submitIng.value = false;
        return;
      }
      if (title.value === '编辑') {
        planEdit({
          ...data1,
          examineList: data2
        }).then(res => {
          submitIng.value = false;
          emits('success')
          closeDrawer();
        }).catch(_ => submitIng.value = false);
        reset();
        return;
      }
      planAdd({
        ...data1,
        examineList: data2
      }).then((res) => {
        submitIng.value = false;
        closeDrawer();
        emits('success')
        reset();
      }).catch(_ => {
        submitIng.value = false;
      })
    });
  })
}
function reset() {
  activeKey.value = '1';
  formElRef.value?.reset();
  processRef.value?.reset();
}
const onClose = () => {
  activeKey.value = '1';
  closeDrawer();
  reset();
}

</script>
<style scoped lang="less">
.btns {
  width: 100%;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  position: relative;
  z-index: 9999;
}
</style>
