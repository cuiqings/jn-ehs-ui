<template>
  <BasicDrawer
    v-bind="$attrs"
    @register="registerDrawer"
    :title="title"
    ok-text="提交"
    :width="700"
    @ok="handleSubmit"
    :show-footer="showFooter"
    :show-ok-btn="showOkBtn"
    destroyOnClose
  >
    <div style="display: flex; align-items: center; margin-bottom: 20px" v-if="!showOkBtn && objInfo.riskGrade">
      <div style="width: 112px; text-align: right; font-size: 13px; line-height: 32px; height: 32px">区域等级：</div>
      <div
        style="width: calc(100% - 112px); height: 32px; padding: 0 12px; line-height: 32px; border-radius: 2px; color: #fff"
        :class="
          objInfo.riskGrade === '1'
            ? 'major'
            : objInfo.riskGrade === '2'
            ? 'larger'
            : objInfo.riskGrade === '3'
            ? 'generally'
            : objInfo.riskGrade === '4'
            ? 'low'
            : ''
        "
        >{{ riskText(objInfo.riskGrade) }}</div
      >
    </div>
    <BasicForm @register="registerForm" />
    <!-- <div style="display: flex; align-items: center" v-if="isMark">
      <div style="width: 112px; text-align: right; font-size: 13px">标记位置：</div>
      <a-button @click="handleMarkModal">请选择</a-button>
    </div> -->
  </BasicDrawer>
  <grid-modal @register="registerModal" @callback-value="handleGridModalCallback" />
</template>
<script lang="ts" name="griddingManage-drawer" setup>
  import useDrawer from './hooks/useDrawer';
  import gridModal from '../component/gridModal.vue';
  const emit = defineEmits(['success']);
  const {
    BasicDrawer,
    registerDrawer,
    BasicForm,
    registerForm,
    handleSubmit,
    title,
    showFooter,
    showOkBtn,
    handleMarkModal,
    objInfo,
    isMark,
    registerModal,
    handleGridModalCallback,
  } = useDrawer(emit);
  const riskText = (value) => {
    let text = '';
    switch (value) {
      case '1':
        text = '重大风险';
        break;
      case '2':
        text = '较大风险';
        break;
      case '3':
        text = '一般风险';
        break;
      case '4':
        text = '低风险';
        break;
      default:
        text = '';
    }
    return text;
  };
</script>
<style lang="less" scoped>
  .major {
    background: rgb(200, 0, 22);
  }
  .larger {
    background: rgb(236, 115, 14);
  }
  .generally {
    background: rgb(220, 228, 15);
  }
  .low {
    background: rgb(29, 209, 255);
  }
</style>
