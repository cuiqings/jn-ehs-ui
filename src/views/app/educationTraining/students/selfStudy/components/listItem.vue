<!-- 共用列表项 -->
<template>
  <div class="item" @click="openDetail">
    <div class="name">{{ item.questionBankName }}</div>
    <div>{{ item.questionBankOrgCodeName }}</div>
    <div>答题时间：{{ item.answerTime }}</div>
    <div class="bt">
      <div>
        <span class="num">做题：{{ item.questionNum || 0 }}</span>
        <span class="num right">正确：{{ item.correctNum || 0 }}</span>
        <span class="num error">错误：{{ item.errorNum || 0 }}</span>
      </div>
      <van-button size="mini" plain type="primary" @click="openDetail">{{ btnText }}</van-button>
    </div>
  </div>
</template>
<script lang="ts" setup>
  const props = withDefaults(
    defineProps<{
      btnText?: string;
      needBtn?: boolean;
      item: any;
    }>(),
    {
      btnText: '详情',
      needBtn: true,
      item: () => {},
    }
  );

  const emit = defineEmits(['itemClick', 'btnClick']);

  // item卡片事件
  const openDetail = () => {
    emit('itemClick');
  };
</script>

<style lang="less" scoped>
  .item {
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    background-color: #ffffff;
    padding: 15px 16px;
    height: auto;
    border-radius: 4px;
    position: relative;
    margin-bottom: 10px;
    .num{
      font-size: 12px;
      color: #999999;
      padding-right: 16px;
    }
    .right{
      color: #389e0d;
    }
    .error{
      color: #ff4d4f;
    }
    .name {
      width: 100%;
      line-height: 32px;
      font-weight: 600;
    }
    .bt{
      display: flex;
      justify-content: space-between;
    }
  }
</style>
