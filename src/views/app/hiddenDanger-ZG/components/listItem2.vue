<!-- 共用列表项 -->
<template>
  <div class="item" @click="openDetail">
    <van-swipe style="width: 30%; margin-right: 15px; height: 120px">
      <van-swipe-item v-for="(pic, idx) in curItem.imgList" @click.stop="preview(idx)">
        <img :src="pic" />
      </van-swipe-item>
      <template #indicator="{ active, total }" v-if="curItem.imgList.length > 1">
        <div class="custom-indicator">{{ active + 1 }}/{{ total }}</div>
      </template>
    </van-swipe>
    <div class="right">
      <p>
        {{ curItem.orgName }} {{ curItem.departName ? '>' + curItem.departName : ''}} {{ curItem.yhPlaceDepartName }}
        <!-- <span class="tag gy" v-if="item.handleResult == 1">非隐患</span> -->
        <!-- <span class="tag bl" v-if="item.yhLevel == 1">一般</span> -->
        <span class="tag" v-if="item.yhLevel == 2">重大</span>
      </p>
      <div class="content">
        {{ curItem.yhDescription }}
      </div>
      <div class="btn">
        <span class="time">{{ curItem.createTime }}</span>
        <span :class="['status', 'tag' + curItem.status]" v-if="!needBtn">{{
          { 1: '未开始', 2: '整改中', 3: '待验收', 4: '验收中', 5: '验收通过' }[curItem.status]
        }}</span>
        <van-button type="primary" v-if="curItem.canHandle && needBtn" @click.stop="edit">{{ btnText }}</van-button>
      </div>
      <div class="hint" v-if="curItem.noticeNos && needNotice">
        整改通知书：<span>{{ curItem.noticeNos }}</span>
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
      needNotice?: boolean;
      btnShowTag?: string;
    }>(),
    {
      btnText: '处理',
      needBtn: true,
      item: () => {},
      btnShowTag: 'canHandle',
      needNotice: false
    }
  );

  const curItem = ref(props.item);
  const { needBtn, btnText, needNotice } = props;
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
    width: 100%;
    height: 150px;
    background: #fff;
    border-radius: 10px;
    display: flex;
    align-items: center;
    padding: 10px 15px;
    font-size: 12px;
    margin-bottom: 15px;
    .tag {
      font-size: 12px;
      display: inline-block;
      background-color: #f76262;
      color: #fff;
      font-size: 10px;
      border-radius: 4px;
      padding: 0 4px;
      margin-left: 10px;
    }
    .bl {
      background-color: #68b0f8;
    }
    .or {
      background-color: #f7aa36;
    }
    .gy{
      background-color: #90d391;
    }
    img {
      width: 100%;
      height: 120px;
    }
    .custom-indicator {
      color: #fff;
      position: absolute;
      right: 5px;
      bottom: 5px;
      padding: 2px 5px;
      font-size: 12px;
      background: rgba(0, 0, 0, 0.3);
    }
    .right {
      height: 100%;
      display: flex;
      flex: 1;
      flex-direction: column;
      justify-content: space-around;
    }
    p {
      font-size: 12px;
      color: #333;
      padding: 0;
      margin: 0;
      display: flex;
      align-items: center;
    }
    .time {
      color: #999;
    }
    .content {
      font-size: 14px;
      word-break: break-all;
      overflow: hidden;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }
    .btn {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 12px;
    }
    .tag1 {
      color: #f76262;
    }
    .tag2 {
      color: #f7aa36;
    }
    .tag3 {
      color: #e2f868;
    }
    .tag4 {
      color: #68b0f8;
    }
    .tag5 {
      color: #62f776;
    }
    .hint {
      font-size: 12px;
      color: #f7aa36;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      -o-text-overflow: ellipsis;
    }
  }
  .top-f{
    background-color: #ffdcdc;
    color: #ff3e3e;
    padding: 0 4px;
    border-radius: 4px;
    font-size: 12px;
  }
  .top-o{
    background-color: #ffecb8;
    color: #ffa81c;
    padding: 0 4px;
    border-radius: 4px;
    font-size: 12px;
  }
</style>
