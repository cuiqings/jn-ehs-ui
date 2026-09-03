<template>
  <van-dialog
    ref="dialogRef"
    v-model:show="show"
    title="添加气体分析"
    show-cancel-button
    @cancel="cancel"
    @confirm="dialogConfirm"
  >
    <template v-if="curItem.workType == 2">
      <van-tabs v-if="curItem.workStatus == 2" v-model:active="active" :lazyRender="false">
        <van-tab title="上">
          <div class="inner">
            <AnlyForm ref="dialogFormRef1" local="上" :curItem="curItem" />
          </div>
        </van-tab>
        <van-tab title="中">
          <div class="inner">
            <AnlyForm ref="dialogFormRef2" local="中" :curItem="curItem" />
          </div>
        </van-tab>
        <van-tab title="下">
          <div class="inner">
            <AnlyForm ref="dialogFormRef3" local="下" :curItem="curItem" />
          </div>
        </van-tab>
      </van-tabs>
      <div v-else class="inner">
        <AnlyForm ref="dialogFormRef1" local="" :curItem="curItem" />
      </div>
    </template>
    <div v-else class="inner">
      <AnlyForm ref="dialogFormRef1" local="" :curItem="curItem" />
    </div>
  </van-dialog>
</template>
<script lang="ts" setup>
  import AnlyForm from './anlyForm.vue';
  import { ref, computed } from 'vue';
  import { showFailToast } from 'vant';

  const active = ref(0);
  const dialogFormRef1 = ref<InstanceType<typeof AnlyForm>>();
  const dialogFormRef2 = ref<InstanceType<typeof AnlyForm>>();
  const dialogFormRef3 = ref<InstanceType<typeof AnlyForm>>();
  const props = defineProps({
    show: {
      type: Boolean,
      default: false,
    },
    curItem: {
      type: Object,
      default: () => ({}),
    },
  });
  const emits = defineEmits(['submit', 'update:show']);
  const show = computed(() => props.show);

  const cancel = () => {
    emits('update:show', false);
    dialogFormRef1.value?.cancel(), dialogFormRef2.value?.cancel(), dialogFormRef3.value?.cancel();
  };

  const dTop = ref(45);
  const dialogRef = ref<HTMLElement>();

  const dialogConfirm = () => {
    if (props.curItem.workType == 2) {
      let promises: any = [];
      let data: any = [];
      if(props.curItem.workStatus == 2){
        promises = [dialogFormRef1.value?.validate(), dialogFormRef2.value?.validate(), dialogFormRef3.value?.validate()];
        data = [dialogFormRef1.value?.getData(), dialogFormRef2.value?.getData(), dialogFormRef3.value?.getData()];
      }else{
        promises = [dialogFormRef1.value?.validate()];
        data = [dialogFormRef1.value?.getData()];
      }
      Promise.all(promises)
        .then(() => {
          emits('submit', data);
          dialogFormRef1.value?.cancel(), dialogFormRef2.value?.cancel(), dialogFormRef3.value?.cancel();
          return true;
        })
        .catch(() => {
          showFailToast('请填写所有位置的分析数据！');
        });
    } else {
      Promise.all([dialogFormRef1.value?.validate()])
        .then(() => {
          emits('submit', [dialogFormRef1.value?.getData()]);
          dialogFormRef1.value?.cancel();
          return true;
        })
        .catch(() => {
          showFailToast('请填写所有位置的分析数据！');
        });
    }
  };
</script>
<style lang="less" scoped>
  // :deep(.van-field__body) {
  //   background-color: #f5f5f5 !important;
  // }
  // :deep(.van-cell){
  //   padding: 10px 10px !important
  // }
  .divinput {
    :deep(.van-cell) {
      padding: 10px 0 !important;
    }
  }
  .inner {
    overflow-y: auto;
  }
</style>
