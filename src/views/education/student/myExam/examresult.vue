<template>
  <div class="exam">
    <div class="hd">
      <div class="left">
        <a-button @click="back" type="link">退出</a-button>
        <div class="line"></div>
        <span class="examName">{{ paperes.taskName }}</span>
      </div>
      <div class="right">
        <span v-if="paperes.score">总分：{{ paperes.totalScore || paperes.score }}</span>
        <span v-if="paperes.passScore">及格分：{{ paperes.passScore }}</span>
        <span v-if="pageState != '1'"
          >考试剩余：{{ remainingTime.hr > 0 ? remainingTime.hr + '时' : '' }} {{ remainingTime.min }}分{{ remainingTime.sec }} 秒</span
        >
        <span v-if="pageState == '1' && paperes.userUseTime">考试用时：{{ computeTime(paperes.userUseTime) }}</span>
        <span v-if="pageState != '1'"><a-button type="primary" @click="submitExam()">提交试卷</a-button></span>
        <!-- <a-button style="margin-left: 15px;" :loading="downloading" type="primary" size="large" @click="downloadFile()">下载 PDF</a-button> -->
      </div>
    </div>
    <div class="main" id="myexamresult">
      <div class="left">
        <div class="result-chart" v-if="pageState == '1' && !route.query.isReflection">
          <span>{{ paperes.userScore || paperes.score }}</span>
          <div>{{ paperes.passStatus == '0' ? '合格' : '不合格' }}</div>
        </div>
        <div class="record" v-if="pageState == '1'">
          <!-- <span v-if="paperes.submitTime">{{ paperes.submitTime }}</span> -->
          <a-button @click="recordShow">考试记录</a-button>
        </div>
        <div class="participant" v-if="paperes.trainerSign || paperes.userSign">
          <div>
            <span>教育者：</span>
            <img @click="imagePreview(paperes.trainerSign)" class="sign" :src="getFileAccessHttpUrl(paperes.trainerSign)" />{{
              paperes.trainerSignTime
            }}
          </div>
          <div>
            <span>参加人：</span>
            <img @click="imagePreview(paperes.userSign)" class="sign" :src="getFileAccessHttpUrl(paperes.userSign)" />{{ paperes.userSignTime }}
          </div>
        </div>
        <div class="title">答题卡</div>
        <div class="list">
          <a v-for="(item, idx) in questionList" :href="'#' + (item.questionId ? item.questionId : item.id)">
            <div class="item" :class="{ err: !item.correctFlag, on: item.correctFlag }">
              <span class="num">{{ idx + 1 }}</span>
            </div>
          </a>
        </div>
        <div class="record" style="margin-top: 50px" v-if="pageState == '1' && paperes.passStatus == '0' && !paperes.userSign && paperes.trainPerson">
          <!-- <span v-if="paperes.submitTime">{{ paperes.submitTime }}</span> -->
          <a-button type="primary" @click="checkResult">签字确认</a-button>
        </div>
      </div>
      <div class="right">
        <div class="right-inner">
          <div class="item" v-for="(item, idx) in questionList" :id="item.questionId || item.id">
            <Radio :currentIdx="idx" :currentQuestion="item" v-if="item.questionType == 1" />
            <Select :currentIdx="idx" :currentQuestion="item" v-if="item.questionType == 2" />
            <QInput :currentIdx="idx" v-model:currentQuestion="questionList[idx]" v-if="item.questionType == 3" />
            <Judge :currentIdx="idx" :currentQuestion="item" v-if="item.questionType == 4" />
            <Ask :currentIdx="idx" :currentQuestion="item" v-if="item.questionType == 5" />
          </div>
        </div>
      </div>
    </div>
  </div>
  <ExamRecord @register="register" />
  <!-- <ErrorCheck @register="errorCheckRegister" @confirm="errorConfirm" /> -->
  <SignModal @register="signRegister" @signOk="signOk" />
</template>
<script name="Exam" lang="ts" setup>
  import { computed, ref, watch } from 'vue';
  import { useRouter, useRoute } from 'vue-router';
  import Radio from '../components/question/radio.vue';
  import Select from '../components/question/select.vue';
  import QInput from '../components/question/input.vue';
  import Judge from '../components/question/judge.vue';
  import Ask from '../components/question/ask.vue';
  import { examSubmit, studentSign } from '/@/views/app/educationTraining/index.api';
  import ExamRecord from '../components/examRecord.vue';
  import SignModal from '../components/signModel.vue';
  import { useModal } from '/@/components/Modal';
  import { Modal } from 'ant-design-vue';
  import { notification } from 'ant-design-vue';
  import { ExclamationCircleOutlined } from '@ant-design/icons-vue';
  import { h } from 'vue';
  import { getFileAccessHttpUrl } from '/@/utils/common/compUtils';
  import html2canvas from 'html2canvas';
  import jsPDF from 'jspdf';

  // 错题订正弹窗
  // const [errorCheckRegister, { openModal: openErrorCheckModal, closeModal: closeErrorCheckModal }] = useModal();
  // 签名弹窗
  const [signRegister, { openModal: openSignModal, closeModal }] = useModal();
  const signOk = async (sign) => {
    console.log(sign);
    await studentSign({
      id: route.query.taskId,
      contentId: route.query.contentId,
      sign: sign,
    });
    closeModal();
    back();
  };

  const openNotification = () => {
    notification.open({
      message: '提示！',
      description: '考试剩余一分钟，到时将自动交卷！',
      duration: 60,
      icon: () => h(ExclamationCircleOutlined, { style: 'color: #faad14' }),
    });
  };

  const pageState = computed(() => (route && route.query && route.query.status) || 0);

  const [register, { openModal }] = useModal();
  const router = useRouter();
  const route = useRoute();
  const timer = ref<any>(null);
  const remainingTime = ref<any>({
    day: 0,
    hr: 0,
    min: 0,
    sec: 0,
  });
  const imagePreview = (url: string) => {
    // showImagePreview([getFileAccessHttpUrl(url)]);
  };
  const paperes = ref<any>({});
  const questionList = ref<any>([]);
  const userUseTime = ref<number>(0);
  const countdown = (timestamp: number, recordId: number, method: string) => {
    const today: any = new Date();
    const now = Date.parse(today);
    let remaining: number = Math.ceil((timestamp - now) / 1000);
    if (remaining <= 0) {
      finish();
      return;
    }
    timer.value = setInterval(() => {
      //防止出现负数
      if (remaining > 0) {
        remaining--;
        let day = Math.floor(remaining / 3600 / 24);
        let hour = Math.floor((remaining / 3600) % 24);
        let minute = Math.floor((remaining / 60) % 60);
        let second = Math.floor(remaining % 60);
        remainingTime.value = {
          day: day,
          hr: hour,
          min: minute,
          sec: second,
        };
        if (remaining == 60) openNotification();
      } else {
        finish();
      }
      userUseTime.value = remaining;
    }, 1000);
  };

  pageInit();
  function pageInit() {
    // 1 考试结果页 0 考试中
    if (pageState.value == '1') {
      paperes.value = JSON.parse(sessionStorage.getItem('examResult') as string);
      questionList.value = paperes.value.questionList;
      questionList.value.forEach((item: any) => {
        if (item.userAnswer) {
          item.userAnswer = typeof item.userAnswer === 'string' ? JSON.parse(item.userAnswer) : item.userAnswer;
          // 单选 判断
          if (['1', '4'].includes(item.questionType)) item.userAnswer = item.userAnswer[0];
          // 填空
          if (['3', '5'].includes(item.questionType)) {
            item.userQuestionInfoList.forEach((subItem: any, idx: number) => {
              subItem.userAnswer = item.userAnswer[idx] || '';
            });
          }
        }
      });
    } else {
      paperes.value = JSON.parse(sessionStorage.getItem('examPaper') as string);
      questionList.value = paperes.value.questionList;
      countdown(new Date(paperes.value.userExamTime).getTime() + paperes.value.examTime * 60 * 1000, 1, 'submit');
    }
  }
  watch(
    () => route.query,
    () => {
      pageInit();
    }
  );
  const computeTime = (time: number) => {
    let day = Math.floor(time / 3600 / 24);
    let hour = Math.floor((time / 3600) % 24);
    let minute = Math.floor((time / 60) % 60);
    let second = Math.floor(time % 60);
    return day ? `${day}天${hour}时${minute}分${second}秒` : hour ? `${hour}时${minute}分${second}秒` : `${minute}分${second}秒`;
  };

  const back = () => {
    if (paperes.value.practiseId) {
      // router.replace(`/student/selfStudy`);
      router.back();
      return;
    }
    if (route.query.source == '1') {
      router.replace('/student/myExam');
    } else {
      router.replace('/student/myTrining');
    }
  };

  const finish = () => {
    clearInterval(timer.value);
    timer.value = null;
    let result = setResult();
    next(result, true);
  };

  const recordShow = () => {
    openModal(true, { taskId: route.query.taskId, source: route.query.source, contentId: route.query.contentId });
  };

  const checkResult = () => {
    console.log(paperes.value, 'paperes.value');

    // if (paperes.examScore == paperes.exam.score) {
    openSignModal(true, {});
    // } else {
    //   openErrorCheckModal(true, { ...item.exam, contentId: item.id, taskId: taskInfo.value.taskId, source: 0 });
    // }
  };

  const setResult = () => {
    let result: Array<{ questionId: number; userAnswer: string | number | Array<string> }> = [];
    questionList.value.forEach((item: any) => {
      let obj = { questionId: item.questionId, userAnswer: item.userAnswer };
      // 填空题结果组装
      if (item.questionType == 3) {
        let strs: string[] = [];
        item.userQuestionInfoList.forEach((citem: any) => {
          if (citem.userAnswer) {
            strs.push(citem.userAnswer);
          }
        });
        obj.userAnswer = strs;
      }
      // 所有答案以数组形式提交
      if (!Array.isArray(obj.userAnswer)) obj.userAnswer = obj.userAnswer ? [obj.userAnswer] : [];
      console.log(obj.userAnswer, 'leng');

      result.push(obj);
    });
    return result;
  };

  // 交卷
  const submitExam = async () => {
    let result = setResult();
    let count = 0;
    result.forEach((item: any) => {
      if (item.userAnswer.length == 0) count++;
    });
    if (count > 0) {
      Modal.confirm({
        title: '提交试卷',
        content: `剩余${count}道题目未完成，是否确认提交试卷？`,
        okText: '确认交卷',
        cancelText: '继续答题',
        onOk() {
          next(result, true);
        },
        onCancel() {
          console.log('取消交卷');
        },
      });
    } else {
      Modal.confirm({
        title: '提交试卷',
        content: `是否确认提交试卷？`,
        okText: '确认交卷',
        cancelText: '继续答题',
        onOk() {
          next(result, true);
        },
        onCancel() {
          console.log('取消交卷');
        },
      });
    }
  };
  const next = async (result, needResultPage?) => {
    let res = await examSubmit({
      questionList: result,
      userExamRecordId: paperes.value.userExamRecordId,
      userUseTime: paperes.value.examTime * 60 - userUseTime.value,
      userExamTime: paperes.value.userExamTime,
    });
    sessionStorage.setItem('examResult', JSON.stringify(res));
    if (needResultPage) {
      router.replace({
        path: `/examresult`,
        query: {
          taskId: route.query.taskId,
          examed: 'true',
          status: 1,
        },
      });
    }
  };
  const downloading = ref(false);
  const downloadFile = () => {
    const el = document.querySelector('#myexamresult') as HTMLElement;
    downloading.value = true;
    html2canvas(el, {
      scale: 2,
      useCORS: true,
      allowTaint: false,
    }).then((canvas) => {
      const context: any = canvas.getContext('2d');
      let orientation;
      if (context) {
        context.mozImageSmoothingEnabled = false;
        context.webkitImageSmoothingEnabled = false;
        context.msImageSmoothingEnabled = false;
        context.imageSmoothingEnabled = false;
      }

      const pageData = canvas.toDataURL('image/jpg', 1.0);
      const img = new Image();
      const width = document.body.clientWidth;
      const height = el.clientHeight;
      img.src = pageData;
      img.onload = function () {
        img.width /= 2;
        img.height /= 2;
        img.style.transform = 'scale(0.5)';
        let pdf;
        orientation = width > height ? 'l' : 'p';
        downloading.value = false;
        // eslint-disable-next-line
        pdf = new jsPDF(orientation, 'mm', [width, height]);
        pdf.addImage(pageData, 'jpeg', 0, 0, width, height);
        pdf.save(paperes.value.taskName + '--考试.pdf');
      };
    });
  };
</script>
<style lang="less" scoped>
  .exam {
    width: 100%;
    font-size: 18px;
    padding-top: 55px;
    .hd {
      width: 100%;
      height: 55px;
      display: flex;
      justify-content: space-between;
      padding: 0 16px;
      align-items: center;
      position: fixed;
      top: 0;
      left: 0;
      z-index: 999;
      background-color: #ffffff;
      box-shadow: 2px 0px 4px 1px rgba(0, 0, 0, 0.04);
      .left {
        display: flex;
        align-items: center;
        button {
          font-size: 18px;
          padding: 0;
          padding-right: 16px;
        }
      }
      .line {
        width: 1px;
        height: 20px;
        background: #cccccc;
        margin-right: 16px;
      }

      .right {
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: flex-end;
        span {
          padding-left: 16px;
        }
      }
    }
    .left {
      width: 290px;
    }
    .right {
      flex: 1;
    }
    .right-inner {
      width: 100%;
    }
    .main {
      height: calc(100% - 55px);
      padding: 10px 16px;
      padding-right: 0;
      display: flex;
      padding-left: 290px;
      .left {
        width: 290px;
        position: fixed;
        left: 0;
        top: 55px;
        padding-left: 16px;
        .result-chart {
          width: 150px;
          height: 150px;
          border: 15px solid #1890ff;
          border-radius: 50%;
          margin: 30px auto;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          span {
            font-size: 24px;
            font-weight: 600;
          }
          div {
            font-size: 24px;
            color: #1890ff;
            font-weight: 600;
          }
        }
        .record {
          display: flex;
          justify-content: space-around;
          align-items: center;
          padding-right: 16px;
          margin-bottom: 16px;
        }
        .list {
          display: flex;
          flex-wrap: wrap;
          .item {
            width: 43px;
            height: 43px;
            margin: 5px;
            border: 1px solid #bebebe;
            color: #cccccc;
            text-align: center;
            align-items: center;
            display: flex;
            justify-content: center;
            border-radius: 5px;
            .num {
              color: #bebebe;
            }
          }
          .on {
            background-color: #1890ff;
            border: 1px solid #1890ff;
            color: #ffffff;
            .num {
              color: #ffffff;
            }
          }
          .err {
            background-color: #ff4d4f;
            border: 1px solid #ff4d4f;
            color: #ffffff;
            .num {
              color: #ffffff;
            }
          }
        }
      }
      .right {
        flex: 1;
        padding: 16px;
        background-color: #f5f5f5;
        .item {
          background-color: #ffffff;
          padding: 16px;
          margin-bottom: 16px;
          border-radius: 8px;
        }
      }
    }
  }
  .participant {
    padding: 10px 0;
    div {
      display: flex;
      align-items: center;
      font-size: 14px;
    }
  }
  .sign {
    width: auto;
    height: 45px;
    margin-right: 15px;
  }
</style>
<style lang="less">
  .question-option {
    line-height: 38px;
  }
  .analysis {
    width: 100%;
    height: auto;
    background: #f6f6f6;
    border-radius: 8px;
    padding: 16px;
    margin-top: 16px;
    .result {
      width: 100%;
      font-size: 16px;
      font-weight: 500;
      line-height: 24px;
    }
    .answer {
      width: 100%;
      font-size: 16px;
      font-weight: 500;
      color: #333333;
      line-height: 24px;
      .input-answer {
        width: 100%;
        font-size: 14px;
        font-weight: 400;
        color: rgba(0, 0, 0, 0.88);
        line-height: 24px;
      }
    }
    .remark-tit {
      width: 100%;
      font-size: 16px;
      font-weight: 500;
      color: #333333;
      line-height: 24px;
      margin-top: 10px;
    }
    .exam-diffiCulty {
      color: #00000073;
      font-size: 14px;
    }
  }
</style>
