<!-- 共用列表项 -->
<template>
  <div class="item" @click="openDetail">
    <div class="top">
      <div class="name">{{ curItem.taskName}}</div>
      <div class="right">
        <span v-if="curItem.type && curItem.type.includes('1')" class="online">线上</span>
        <span v-if="curItem.type && curItem.type.includes('2')" class="online outline">线下</span>
      </div>
    </div>
    <div class="time">培训时间：{{ curItem.trainDate }}</div>
    <div class="bottom">
      <div class="info">完成情况：{{ curItem.finishStatus }}</div>
      <div class="status" v-if="curItem.confirmFlag === '1'">待确认</div>
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

  // 按钮事件
  const edit = () => {
    emit('btnClick');
  };

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
    flex-direction: column;
    justify-content: space-around;
    background-color: #f2f2f2;
    padding: 15px 16px;
    height: auto;
    border-radius: 4px;
    position: relative;
    margin-bottom: 10px;
    .top {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      .right{
        display: flex;
        align-items: center;
        font-size: 12px;
        padding-top: 4px;
        span{
          margin-left: 10px;
        }
      }
    }
    .name {
      font-weight: 600;
      flex: 1;
    }
    .tag {
      font-size: 12px;
    }
    .online {
      color: #fff;
      background-color: #07c160;
      border-radius: 3px;
      padding: 0 4px;
      height: 16px;
      font-size: 10px;
      display: flex;
      align-items: center;
    }
    .outline {
      background-color: #1890ff;
    }
    .bottom {
      display: flex;
      justify-content: space-between;
      .status {
        color: #ee0a24;
      }
    }
  }
</style>
