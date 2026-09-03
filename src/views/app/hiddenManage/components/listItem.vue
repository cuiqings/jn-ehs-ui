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
      <p style="font-size: 12px; margin: 6px 0"
        ><span>责任单位：{{ curItem.dutyOrgName }}</span
        ><span class="tag" v-if="item.yhLevel == 2">重大</span></p
      >
      <div class="content" style="font-size: 12px">
        {{ curItem.yhDescription }}
      </div>
      <div class="content" style="font-size: 12px; margin: 6px 0 0 0"> 检查时间：{{ curItem.checkTime }} </div>
      <div>
        <span class="time">{{ curItem.createTime }}</span>
      </div>
      <div class="btn">
        <van-button v-if="curItem.canHandle && curItem.suspendFlag !== '1'" style="font-size: 10px" type="primary" @click.stop="edit">{{ btnText }}</van-button>
        <van-button v-if="curItem.canEdit" style="font-size: 10px; margin-left: 5px" type="default" @click.stop="editItem">编辑</van-button>
        <van-button v-if="curItem.canEdit" style="font-size: 10px; margin-left: 5px" type="danger" @click.stop="deleteItem">删除</van-button>
        <!-- <van-button style="font-size: 10px;" type="primary" v-if="needBtn && curItem.canHandle" @click.stop="edit">{{ btnText }}</van-button> -->
        <!-- <van-button style="font-size: 10px; margin-left: 5px;" type="primary" v-if="needBtn && curItem.canChangeRepairPerson" @click.stop="exchange">修改整改人</van-button> -->
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
  const emit = defineEmits(['itemClick', 'btnClick', 'exchange', 'editItem', 'deleteItem']);

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

  /**
   * 编辑按钮点击事件：将当前项的编辑意图上抛给父组件
   * 父组件可根据该事件跳转到 add.vue 并携带 id 参数
   */
  const editItem = () => {
    emit('editItem');
  };

  /**
   * 删除按钮点击事件：将当前项的删除意图上抛给父组件
   * 父组件可根据该事件弹出确认并调用删除接口
   */
  const deleteItem = () => {
    emit('deleteItem');
  };

  const exchange = () => {
    emit('exchange');
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
      closeable: true,
      // 点击遮罩关闭
      closeOnClickOverlay: false,
      className: 'ip-large-close',
    });
  };
</script>

<style lang="less" scoped>
  .item {
    position: relative;
    width: 100%;
    height: 150px;
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
      margin: 6px 0 0 0;
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
      position: absolute;
      bottom: 10px;
      right: 10px;
    }
  }
</style>
<style lang="less">
  /* 仅对本组件触发的图片预览生效，通过 className 作用于根节点 */
  .ip-large-close {
    .van-image-preview__close-icon {
      font-size: 40px;
    }
  }
</style>
