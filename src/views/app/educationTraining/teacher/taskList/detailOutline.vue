<template>
  <div class="detail">
    <div class="hd">
      <div>
        <span>5</span>
        <span>培训人数</span>
      </div>
      <div>
        <span>5</span>
        <span>已参与</span>
      </div>
      <div>
        <span>5</span>
        <span>参与率</span>
      </div>
    </div>
    <div class="main">
      <div class="item">
        <div class="title">
          <span>线下培训</span>
        </div>
        <div class="bottom">
          <div class="dept">
            <van-field readonly input-align="right" :border="false" v-model="value" label="实施单位：" />
            <van-field readonly input-align="right" :border="false" v-model="value" label="教育者：" />
          </div>
          <div class="sign">
            <div class="left">签到二维码<van-icon style="margin-left: 5px" size="20" name="qr" /></div>
            <div class="right" @click="detailClick">签到进度：1/4</div>
          </div>
          <div class="info">
            <div class="name">张真人</div>
            <div class="middle">
              <span>完成课时：23</span>
              <span>考试成绩：89</span>
              <span style="color: #1989fa" @click="detailClick">明细</span>
            </div>
            <span class="signtag">未签到</span>
          </div>
        </div>
      </div>
    </div>
    <van-popup v-model:show="showHold" round position="bottom" :style="{ height: '348px' }">
      <div class="signinfo">
        <div class="title">签到进度：1/4</div>
        <div class="signmain">
          <div class="th">
            <span>人员</span>
            <span>签名</span>
            <span>签到时间</span>
          </div>
          <div class="td">
            <span>张真人</span>
            <span>张真人</span>
            <span>2022-12-12 12:12:12</span>
          </div>
        </div>
      </div>
    </van-popup>
  </div>
</template>
<script lang="ts" setup>
  import { useRoute, useRouter } from 'vue-router';
  import { taskContent } from '../../index.api';
  import { ref } from 'vue';
  const route = useRoute();
  const router = useRouter();
  const showHold = ref(true);

  const detailInfo = ref<any>({})
  const pageInit = async () => {
    const res = await taskContent({taskId: route.query.id});
    detailInfo.value = res;
  }
  pageInit();
  const detailClick = () => {
    showHold.value = true;
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
          color: #1989fa;
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
          font-size: 16px;
          span {
            font-size: 14px;
            color: #666666;
          }
        }
        .info {
          padding: 18px 16px;
          background-color: #f5f5f5;
          margin-left: 16px;
          .name {
            font-size: 16px;
            font-weight: 600;
            color: #333333;
          }
          .middle {
            display: flex;
            justify-content: space-between;
          }
          .signtag {
            color: #ee0a24;
          }
        }
        .sign {
          padding: 0px 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 45px;
          .left {
            display: flex;
            align-items: center;
          }
          .right {
            color: #1989fa;
          }
        }
      }
    }
    .signinfo {
      .title {
        font-size: 16px;
        font-weight: 600;
        color: #333333;
        padding: 16px;
        text-align: center;
      }
      .signmain{
        height: 300px;
        overflow-y: auto;
        .th{
            padding: 5px 0;
            background-color: #e9f2fa;
        }
        .th, .td{
            display: flex;
            justify-content: space-between;
            span:nth-child(1){
              width: 70px;
              text-align: center;
            }
            span:nth-child(2){
              width: 120px;
              text-align: center;
            }
            span:nth-child(3){
              flex: 1;
              text-align: center;
            }
        }
        .td{
          padding: 16px 0;
          border-bottom: 1px solid #f5f5f5;
        }
      }
    }
  }
</style>
