<!-- 共用列表项 -->
<template>
  <div class="item" @click="openDetail">
    <div class="top">
      <span class="tag" :class="{ ing: item.taskStatus == '进行中', hold: item.taskStatus === '未开始' }">{{ item.taskStatus }}</span>
      截止日期：{{ item.endTime }}
      <!-- <span class="tag"></span> -->
    </div>
    <div class="name">
      <span class="name-text">{{ item.taskName }}</span>
      <div class="tag" :class="{ ing: item.examStatus == '合格' }" v-if="item.examStatus">
        {{ item.examStatus }}
      </div>
    </div>
    <div class="gress"> </div>
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
  const { needBtn, btnText } = props;
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
    background-color: #ffffff;
    padding: 15px 16px;
    height: auto;
    border-radius: 4px;
    position: relative;
    margin-bottom: 10px;
    .name {
      width: 100%;
      line-height: 32px;
      font-size: 14px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      .name-text {
        width: calc(100% - 60px);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
    .gress {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      .bar {
        width: calc(100% - 60px);
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
    .top {
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      padding-bottom: 10px;
    }
    .tag {
      font-size: 12px;
      color: #ffffff;
      padding: 0px 5px;
      border-radius: 4px;
      display: flex;
      align-items: center;
      font-size: 12px;
      border-radius: 4px;
      height: 20px;
      border: 1px solid transparent;
      background-color: #bbb9b9;
    }
    .ing {
      border: 1px solid #b7eb8f;
      background-color: #f6ffed;
      color: #389e0d;
    }
    .hold {
        border: 1px solid #1890ff;
        background-color: #dceeff;
        color: #1890ff;
      }
    .tag3 {
      background: #52c41a;
    }
  }
</style>
