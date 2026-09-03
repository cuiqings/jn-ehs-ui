<!-- 共用列表项 -->
<template>
  <div class="item" :class="{'hold': ['3', '7'].includes(curItem.workState) && dayjs(new Date()).isAfter(curItem.workEndTime)}" @click="openDetail">
    <p class="title">
      <div style="display: flex;" class="tags">
        <span v-if="curItem.status == '1'" class="holdtag" style="display: inline-block; margin-left: 5px; color: #ff4d4f;"
          >待交班</span>
        <span v-if="curItem.status == '2'" class="holdtag" style="display: inline-block; margin-left: 5px; color: #ff4d4f;background-color: rgba(255, 77, 79, 0.1);"
          >待接班</span>
        <span v-if="curItem.status == '3'" class="holdtag" style="display: inline-block; margin-left: 5px; color: #ff4d4f;background-color: rgba(255, 77, 79, 0.1);"
          >待签字</span>
      </div>
    </p>
    <p><span class="label">所属单位：</span>{{ curItem.orgCodeName }}</p>
    <p><span class="label">所属车间：</span>{{ curItem.workshopName }}</p>
    <p><span class="label">上班时间：</span>{{ curItem.workTime }}</p>
    <p><span class="label">班次：</span>

      {{curItem.status!='1'? curItem.teamName:null }}</p>
    <p><span class="label">交班人员：</span>{{ curItem.shiftsUserName }}</p>
    <p><span class="label">接班人员：</span>{{ curItem.successionUserName }}</p>
    <div class="sign"><span class="label">领导签字：</span><van-image
      height="22" @click.stop="imagePreview(curItem.leadersUserName)"
      :src="getFileAccessHttpUrl(curItem.leadersUserName)"
    /></div>
    <div class="btn">
      <slot name="btn"> </slot>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { ref, computed } from 'vue';
  import { useRoute } from 'vue-router';
  import { getFileAccessHttpUrl } from '/@/utils/common/compUtils';
  import { showImagePreview } from 'vant';
  import dayjs from 'dayjs';

  const route = useRoute();
  const props = withDefaults(
    defineProps<{
      btnText?: string;
      needBtn?: boolean;
      item: any;
      listType?: number;
    }>(),
    {
      listType: 1, // 1申请 2审批
      btnText: '处理',
      needBtn: true,
      item: () => {},
    }
  );

  const curItem = ref(props.item);
  const isUnhazardousWork = computed(() => {
    return route.name === 'AppUnhazardousWorkManage';
  });

  const emit = defineEmits(['itemClick', 'btnClick']);

  // 按钮事件
  const edit = (type) => {
    emit('btnClick', type);
  };

  // item卡片事件
  const openDetail = () => {
    emit('itemClick');
  };

  const imagePreview = (url) => {
    showImagePreview([getFileAccessHttpUrl(url)]);
  }
   
  const setCheckRole = (role) => {
    const statusmaps = [
      { text: '安全部', status: false, id: '1' },
      { text: '副部长', status: false, id: '2' },
      { text: '安全科', status: false, id: '3' },
      { text: '车间主任', status: false, id: '4' },
      { text: '班组长', status: false, id: '5' },
    ];
    let res = statusmaps.map((v) => {
      if (!role.includes(v.id)) {
        v.status = true;
      }
      return v;
    });
    return res;
  };
</script>

<style lang="less" scoped>
  .item {
    width: 100%;
    height: auto;
    background: #fff;
    border-radius: 10px;
    padding: 10px 15px;
    font-size: 12px;
    margin-bottom: 15px;
    .title{
      display: flex;
      justify-content: space-between;
    }
    p{
      color: #333;
    }
    .label {
      color: #222;
      font-size: 12px;
      margin-right: 5px;
      width: 62px;
      display: inline-block;
    }
    .tit {
      font-size: 14px;
      font-weight: 600;
      word-break: break-all;
      overflow: hidden;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }
    .grade {
      display: inline-block;
      font-size: 10px;
      height: 18px;
      padding: 0 6px;
      border-radius: 4px;
      line-height: 16px;
      margin-left: 10px;
      white-space: nowrap;
    }
    .red{
      color: rgb(255, 77, 79);
      background-color: #fff1f0;
    }
    .orange{
      color: #faad14;
      background-color: #fffbe6;
    }
    .blue{
      color: #1890ff;
      background-color: #e6f7ff;
    }
    .sign{
      display: flex;
      align-items: center;
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
      flex-wrap: wrap;
      justify-content: flex-end;
      :deep(button) {
        margin-top: 5px !important;
        display: inline-block;
      }
    }
  }
  .hold{
    box-shadow: inset 5px 5px 5px rgba(255, 77, 79, 0.3), inset -5px -5px 5px rgba(255, 77, 79, 0.3);
  }
  .delayed {
    display: inline-block;
    padding: 0px;
    width: 68px;
    font-size: 12px;
    align-items: center;
    border: 1px solid #ee0a24;
    color: #ee0a24;
    border-radius: 4px;
    height: 18px;
    margin-left: 10px;
    line-height: 16px;
    text-align: center;
    white-space: nowrap;
  }
  .tag3 {
    color: #ee0a24;
  }
  .tags {
    width: 100%;
    position: relative;
    align-items: center !important;
    .holdtag{
      position: absolute;
      right: 0;
      top: 0px;
    }
    span{
      border-radius: 4px;
      font-size: 12px;
      padding: 0 5px;
    }
  }
</style>
