<template>
  <div class="detail">
    <div class="hd">
      <div>
        <span>{{ detailInfo.trainPersonNum }}</span>
        <span>培训人数</span>
      </div>
      <div>
        <span>{{ detailInfo.participateNum }}</span>
        <span>已参与</span>
      </div>
      <div>
        <span>{{ detailInfo.participateRate }}%</span>
        <span>参与率</span>
      </div>
    </div>
    <div class="main">
      <div class="item" v-for="(item, idx) in detailInfo.taskContentItems" :key="item.id" @click="go(item, idx)">
        <div class="title">
          {{ item.stageName }}
          <span>{{ { 1: '线上', 2: '线下' }[item.trainType] }}培训</span>
          <van-icon size="24px" @click.stop="showCode(item)" name="qr" v-if="item.signFlag == 1" />
          <span v-if="item.signFlag == 1" style="color: #1890ff" @click.stop="showSign(item)">签到进度：{{ item.sign }}</span>
        </div>
        <div class="bottom">
          <div class="dept">
            <van-field readonly input-align="right" :border="false" v-model="item.enforceCodeName" label="实施单位：" />
            <van-field readonly input-align="right" :border="false" v-model="item.trainPerson" label="教育者：" />
          </div>
          <div class="info">
            <div
              >待教育者确认<span style="color: #ee0a24">{{ item.confirmNum || 0 }}</span></div
            >
            <div
              >完成情况<span>{{ item.finishStatus }}</span></div
            >
          </div>
        </div>
      </div>
    </div>
  </div>
  <van-dialog :showConfirmButton="false" @close="close" :showCancelButton="false" v-model:show="showSignDialog" close-on-click-overlay>
    <template #title>
      <div class="d-tit">
        <span>扫码签到</span>
        <div class="re" @click="getSignCode(curId)">
          刷新
          <van-icon size="18" name="replay" />
        </div>
      </div>
    </template>
    <img :src="codeUrl" />
  </van-dialog>
  <van-popup v-model:show="showSignInfoDialog" round position="bottom" :style="{ height: 'auto' }">
    <div class="signmain">
      <div class="tit">签到进度{{ currentSignItem.sign }}</div>
      <div class="list">
        <div class="hd">
          <span>人员</span><span>签名</span><span>签到时间</span>
        </div>
        <div class="item" v-for="item in signInfoList" :key="item.id">
          <span>{{ item.userName }}</span>
          <span><img @click="imagePreview(item.sign)" class="sign" :src="getFileAccessHttpUrl(item.sign)" /></span>
          <span>{{ item.signTime }}</span>
        </div>
      </div>
    </div>
  </van-popup>
</template>
<script lang="ts" setup>
  import { ref } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { taskContent, getQrCode, signInfo } from '../../index.api';
  import { getFileAccessHttpUrl } from '/@/utils/common/compUtils';
  import { showImagePreview, showToast } from 'vant';
  import { useUserStore } from '/@/store/modules/user';
  const userStore: any = useUserStore();
  const route = useRoute();
  const router = useRouter();

  const detailInfo = ref<any>({});
  const pageInit = async () => {
    const res = await taskContent({ taskId: route.query.id });
    detailInfo.value = res;
  };
  pageInit();

  const showSignDialog = ref(false);
  const curId = ref('');
  const showCode = async (item) => {
    await getSignCode(item.id);
    showSignDialog.value = true;
    // timer.value = setInterval(() => {
    curId.value = item.id;
    getSignCode(item.id);
    // }, 1000 * 30);
  };

  // 获取签到二维码
  const codeUrl = ref('');
  const timer = ref<any>(null);
  const getSignCode = async (contentId) => {
    let res = await getQrCode({ contentId: contentId });
    codeUrl.value = 'data:image/png;base64,' + res.qrImg;
  };

  const close = () => {
    if (!timer.value) return;
    clearInterval(timer.value);
  };

  const go = (item, idx) => {
    let next = detailInfo.value.taskContentItems[idx + 1];
    if(item.trainPersonId != userStore.getUserInfo.id) {
      showToast('您不是本阶段培训人员，无法参与培训');
      return
    };
    router.push({
      path: '/app/teacher/checkStudent',
      query: {
        id: item.id,
        name: item.stageName,
        num: item.confirmNum,
        type: item.trainType,
        courseConfig: item.courseConfig,
        enforceCode: next && next.enforceCodeName ? next.enforceCodeName : '',
        trainPerson: next && next.trainPerson ? next.trainPerson : '',
        grade: idx,
        isLast: idx == detailInfo.value.taskContentItems.length - 1 ? 'true' : 'false',
        taskId: route.query.id,
        orgCode: item.enforceCode
      },
    });
  };

  const showSignInfoDialog = ref(false);
  const signInfoList = ref<any>([]);
  const currentSignItem = ref<any>({});
  const showSign = async (item) => {
    console.log(item);
    currentSignItem.value = item;
    let res = await signInfo({ contentId: item.id });
    signInfoList.value = res;
    showSignInfoDialog.value = true;
  };

  const imagePreview = (url: string) => {
    showImagePreview([getFileAccessHttpUrl(url)]);
  };
</script>
<style lang="less" scoped>
  .detail {
    width: 100%;
    height: 100%;
    padding: 10px 16px;
    .hd {
      width: 100%;
      height: 80px;
      background: #e9f2fa;
      display: flex;
      justify-content: space-around;
      div {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        span:nth-child(1) {
          font-size: 30px;
          font-weight: 600;
          color: #3f87ed;
        }
        span:nth-child(2) {
          font-size: 14px;
          font-weight: 400;
          color: #666666;
        }
      }
    }
    .main {
      width: 100%;
      height: calc(100% - 80px);
      overflow-y: auto;
      padding-top: 16px;
      .item {
        .title {
          height: 38px;
          font-size: 16px;
          display: flex;
          align-items: center;
          span {
            font-size: 14px;
            color: #666666;
            margin: 0 15px;
          }
        }
        .info {
          padding: 18px 16px;
          display: flex;
          justify-content: space-between;
          background-color: #f5f5f5;
          margin-left: 16px;
          align-items: center;
          span {
            font-size: 18px;
            padding-left: 10px;
            font-weight: 600;
          }
        }
      }
    }
  }
  .signmain {
    text-align: center;
    padding: 16px;
    .title {
      font-size: 16px;
      font-weight: 600;
    }
    .list {
      height: 380px;
      overflow-y: auto;
      line-height: 38px;
      .hd{
        display: flex;
        justify-content: space-between;
        background: #e9f2fa;
        margin: 10px 0;
        span:nth-child(1){
          width: 80px;
        }
        span:nth-child(2){
          width: 60px;
        }
        span:nth-child(3){
          flex: 1;
        }
      }
      .item{
        display: flex;
        justify-content: space-between;
        span:nth-child(1){
          width: 80px;
        }
        span:nth-child(2){
          width: 60px;
        }
        span:nth-child(3){
          flex: 1;
        }
        img{
          height: 35px;
          width: auto;
        }
      }
    }
  }
  .d-tit{
    position: relative;
  }
  .re{
    position: absolute;
    top: 0;
    right: 16px;
    font-size: 16px;
    color: #3f87ed;
  }
</style>
