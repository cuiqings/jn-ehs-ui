<template>
  <div class="result" v-loading="loading">
    <div class="title">{{ detailInfo.taskName }}</div>
    <div class="hint" v-if="!detailInfo.trainerSign && detailInfo.passStatus === '0' && detailInfo.userSign">已完成考试：待教育者确认</div>
    <div class="participant" v-else-if="detailInfo.trainerSign || detailInfo.userSign">
      <van-field label-width="60px" readonly :border="false" label="教育者：">
        <template #input
          ><img @click="imagePreview(detailInfo.trainerSign)" class="sign" :src="getFileAccessHttpUrl(detailInfo.trainerSign)" />{{
            detailInfo.trainerSignTime
          }}</template
        >
      </van-field>
      <van-field label-width="60px" readonly :border="false" label="参加人：">
        <template #input
          ><img @click="imagePreview(detailInfo.userSign)" class="sign" :src="getFileAccessHttpUrl(detailInfo.userSign)" />{{
            detailInfo.userSignTime
          }}</template
        >
      </van-field>
    </div>

    <div class="progress-box">
      <div class="progress">
        <div class="adm-progress-circle-info">
          <span>{{ route.query.freemem ? detailInfo.userScore : detailInfo.score }}</span>
          <span>{{ detailInfo.passStatus === null || (detailInfo.passStatus && detailInfo.passStatus === '1') ? '不合格' : '合格' }}</span>
        </div>
      </div>
      <div class="time" v-if="!route.query.freemem">考试用时：{{ userUseTime }}</div>
    </div>
    <!-- <div class="confim">
      <van-button v-if="detailInfo.passStatus === '0' && !detailInfo.userSign && detailInfo.trainerUser && route.query.examType !== '1'" @click="checkResult()" size="small" round type="primary">签字确认</van-button>
    </div> -->
    <div class="sheet-box">
      <div class="label">答题卡</div>
      <div class="num-sheet">
        <div class="num-item" v-for="(item, idx) in detailInfo.questionList" :class="{ act: !item.correctFlag }" @click="go(idx)">
          {{ idx + 1 }}
        </div>
      </div>
    </div>
    <div class="foot">
      <div class="hint"><span v-if="detailInfo.passStatus === '0' && !detailInfo.userSign && detailInfo.trainerUser && route.query.examType !== '1'">考试合格后，需学员签字确认！</span></div>
      <div>
        <van-button @click="examRecordClick" size="small" plain round type="success">考试记录</van-button>
        <van-button @click="go()" size="small" plain round type="primary">全部解析</van-button>
        <van-button v-if="detailInfo.passStatus === '0' && !detailInfo.userSign && detailInfo.trainerUser && route.query.examType !== '1'" 
          style="height: 40px;"
          @click="checkResult()" size="small" round type="primary">签字确认</van-button>
      </div>
    </div>
    <ExamRecord :taskItem="{ taskId: route.query.taskId, id: route.query.contentId, examType: route.query.examType}" v-model:show="show" />
    
    <van-dialog v-model:show="signShow" title="签名" :before-close="signClose" @confirm="dialogConfirm" show-cancel-button>
      <Sign v-model:value="signature" />
      <div class="hint" v-show="hintShow && !signature">请签字</div>
    </van-dialog>
  </div>
</template>
<script lang="ts" setup>
  import { ref } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import Sign from '../../../components/sign.vue';
  import ExamRecord from '../components/emamRecord.vue';
  import { examRecord, studentSign } from '../../index.api';
  import { getFileAccessHttpUrl } from '/@/utils/common/compUtils';
  import { showImagePreview } from 'vant';
  const route = useRoute();
  const router = useRouter();
  const show = ref(false);
  const loading = ref(false);

  const examRecordClick = () => {
    show.value = true;
  };
  const detailInfo = ref<any>({});
  const userUseTime = ref('');
  pageInit();
  async function pageInit() {
    console.log(route.query);
    loading.value = true;
    if (route.query.signed) {
      await examRecord({ id: route.query.taskId, contentId: route.query.contentId, examType: route.query.examType }).then((res: any) => {
        console.log(res);
        sessionStorage.setItem('identify', 'true');
        sessionStorage.setItem('examResult', JSON.stringify(res[0].userExamContent));
      });
    }
    detailInfo.value = JSON.parse(sessionStorage.getItem('examResult') as string);
    let day = Math.floor(detailInfo.value.userUseTime / 3600 / 24);
    let hour = Math.floor((detailInfo.value.userUseTime / 3600) % 24);
    let minute = Math.floor((detailInfo.value.userUseTime / 60) % 60);
    let second = Math.floor(detailInfo.value.userUseTime % 60);
    userUseTime.value = day ? `${day}天${hour}时${minute}分${second}秒` : hour ? `${hour}时${minute}分${second}秒` : `${minute}分${second}秒`;
    loading.value = false;
  }

  const go = (idx?: number) => {
    sessionStorage.setItem('identify', 'true');
    let query = {
      status: 1,
    };
    query['index'] = idx;
    router.push({
      path: '/app/student/exam?status=1',
      query: query,
    });
  };

  const signShow = ref(false);
  const signature = ref('');
  const hintShow = ref(false);
  const showHold = ref(false);
  // 签字确认
  const dialogConfirm = async () => {
    if (!signature.value) {
      hintShow.value = true;
      return;
    }
    signShow.value = false;
    showHold.value = false;
    await studentSign({
      id: route.query.taskId,
      contentId: route.query.contentId,
      sign: signature.value,
    }).catch((_) => {
    });
    router.back();
  };
  const signClose = (s) => {
    if (s == 'confirm') return !!signature.value;
    hintShow.value = false;
    return true;
  };
  const checkResult = () => {
    signShow.value = true;
  }

  const imagePreview = (url: string) => {
    showImagePreview([getFileAccessHttpUrl(url)]);
  };
</script>
<style lang="less" scope>
  .result {
    width: 100%;
    height: 100%;
    background: #fff;
    padding-bottom: 55px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    .sign {
      width: auto;
      height: 45px;
      margin-right: 15px;
    }
    .title {
      width: 100%;
      text-align: center;
      font-size: 16px;
      font-weight: 500;
      color: rgba(0, 0, 0, 0.88);
      line-height: 45px;
    }
    .hint {
      text-align: center;
      color: #ee0a24;
    }
    .progress-box {
      width: 100%;
      height: auto;
      display: flex;
      flex-direction: column;
      align-items: center;
      .progress {
        width: 150px;
        height: 150px;
        margin-top: 10px;
        position: relative;
        &::before {
          content: '';
          position: absolute;
          width: 100%;
          height: 100%;
          border: 18px solid #1890ff;
          border-radius: 50%;
          z-index: 1;
        }
        .adm-progress-circle-info {
          position: absolute;
          width: 100%;
          top: 50%;
          left: 50%;
          text-align: center;
          transform: translate(-50%, -50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          span {
            color: rgba(0, 0, 0, 0.88);
            font-size: 24px;
            font-weight: 600;
            line-height: 33px;
            margin-bottom: 10px;
          }
          span:nth-child(2) {
            color: #1890ff;
          }
        }
      }
      .time {
        width: 100%;
        font-size: 14px;
        font-weight: 400;
        color: #999;
        line-height: 14px;
        margin-top: 30px;
        text-align: center;
      }
    }
    .sheet-box {
      width: 100%;
      flex: 1;
      display: flex;
      flex-direction: column;
      margin-top: 30px;
      text-align: left;
      box-sizing: border-box;
      padding: 0 20px 84px;
      .label {
        width: 100%;
        font-size: 16px;
        font-weight: 600;
        color: rgba(0, 0, 0, 0.88);
        line-height: 16px;
      }
      .num-sheet {
        width: 100%;
        margin-top: 30px;
        display: grid;
        row-gap: 20px;
        column-gap: 19px;
        grid-template-columns: repeat(6, minmax(0, 1fr));
        .num-item {
          width: 40px;
          height: 40px;
          background: #1890ff;
          border-radius: 50%;
          font-size: 16px;
          line-height: 40px;
          font-weight: 500;
          text-align: center;
          color: #fff;
        }
        .act {
          background: #e34e1c;
        }
      }
    }
    .foot {
      width: 100%;
      height: 95px;
      position: absolute;
      bottom: 0;
      left: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-around;
      background-color: #fff;
      div{
        width: 100%;
        padding: 10px;
      }
      div:nth-child(2){
        padding: 0;
        display: flex;
        align-items: center;
        justify-content: space-around;
      }
      button {
      }
    }
    .confim{
      padding: 16px;
    }
  }
</style>
