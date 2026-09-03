<!-- 共用列表项 -->
<template>
  <div class="item" @click="openDetail">
    <div class="left">
      <img src="../../../../../assets/images/default-avatar.png" alt="" />
    </div>
    <div class="right">
      <div class="name">{{ item.taskName }}</div>
      <div class="gress">
        <span class="tag on">{{ item.status }}</span><div class="bar"><span :style="{ width: item.finishRate + '%' }"></span></div>{{item.finishRate}}%
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { ref } from 'vue';
  import { showImagePreview } from 'vant';
  import { getFileAccessHttpUrl } from '/@/utils/common/compUtils';

  const props = withDefaults(
    defineProps<{
      btnText?: string;
      needBtn?: boolean;
      item: any;
    }>(),
    {
      btnText: '处理',
      needBtn: true,
      item: () => {},
    }
  );

  const curItem = ref(props.item);
  const emit = defineEmits(['itemClick', 'btnClick']);

  // 置换图片路径
  curItem.value['imgList'] = curItem.value.yhPicture ? getImgList(curItem.value.yhPicture) : [];

  function getImgList(url) {
    let arr = url.split(',');
    return arr.map((item) => getFileAccessHttpUrl(item));
  }

  // item卡片事件
  const openDetail = () => {
    emit('itemClick');
  };

  // 图片预览
  const preview = (idx) => {
    showImagePreview({
      images: curItem.value.imgList,
      startPosition: idx,
    });
  };
</script>

<style lang="less" scoped>
  .item {
    display: flex;
    justify-content: space-between;
    background-color: #f2f2f2;
    padding: 15px 16px;
    height: auto;
    border-radius: 4px;
    position: relative;
    margin-bottom: 10px;
    .left {
      width: 80px;
      img {
        height: 80px;
      }
    }
    .right {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;
    }
    .name {
      width: 100%;
      line-height: 32px;
    }
    .gress {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      color: #1890ff;
      font-size: 12px;

      .bar {
        width: calc(100% - 100px);
        height: 10px;
        margin-right: 10px;
        background-color: #d7d7d7;
        border-radius: 5px;
        overflow: hidden;
        display: flex;
        span {
          display: block;
          height: 100%;
          background-color: #1890ff;
        }
      }
    }
    .tag {
      font-size: 10px;
      padding: 0 3px;
      border-radius: 2px;
      background-color: #cfe9ff;
      display: flex;
      align-items: center;
      height: 14px;
    }
  }
</style>
