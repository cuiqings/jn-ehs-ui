<!-- 共用列表项 -->
<template>
  <div class="item" @click="openDetail">
    <van-swipe style="width: 30%; margin-right: 15px; height: 100px">
      <van-swipe-item v-for="(pic, idx) in curItem.imgList" @click.stop="preview(idx)">
        <img :src="pic" />
      </van-swipe-item>
      <template #indicator="{ active, total }" v-if="curItem.imgList.length > 1">
        <div class="custom-indicator">{{ active + 1 }}/{{ total }}</div>
      </template>
    </van-swipe>
    <div class="right">
      <p
        ><span>所属单位：{{ curItem.orgName }}</span
        ><span class="tag" v-if="item.yhLevel == 2">重大</span></p
      >
      <p>隐患来源：{{ filterDictTextByCache('sk_yh_source', curItem.sourceType) }}</p>
      <div class="content">
        {{ curItem.yhDescription }}
      </div>
      <div class="btn">
        <span class="time">{{ curItem.createTime }}</span>
        <van-button style="font-size: 10px;" type="primary" v-if="needBtn && curItem.canHandle" @click.stop="edit">{{ btnText }}</van-button>
        <van-button style="font-size: 10px; margin-left: 5px;" type="primary" v-if="needBtn && curItem.canChangeRepairPerson" @click.stop="exchange">修改整改人</van-button>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { ref } from 'vue';
  import { showImagePreview } from 'vant';
  import { getFileAccessHttpUrl } from '/@/utils/common/compUtils';
  import { filterDictTextByCache } from '/@/utils/dict/JDictSelectUtil';
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
  const emit = defineEmits(['itemClick', 'btnClick', 'exchange']);

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

  const exchange = () => {
    emit('exchange');
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
    width: 100%;
    height: 130px;
    background: #fff;
    border-radius: 10px;
    display: flex;
    align-items: center;
    padding: 10px 15px;
    font-size: 12px;
    margin-bottom: 15px;
    img {
      width: 100%;
      height: 100px;
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
    }
    p {
      font-size: 10px;
      color: #333;
      padding: 0;
      margin: 0;
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
    }
  }
</style>
