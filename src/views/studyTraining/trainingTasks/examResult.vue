<template>
  <BasicModal
    @cancel="close"
    :canFullscreen="false"
    :showOkBtn="false"
    :cancelText="'关闭'"
    :defaultFullscreen="true"
    :z-index="9001"
    @register="registerThis"
    v-bind="$attrs"
    :title="title"
  >
    <div class="exam">
      <div class="hd">
        <div class="left">
          <span class="examName">{{ paperes.taskName }}</span>
        </div>
        <div class="right">
          <span v-if="paperes.score">总分：{{ paperes.totalScore || paperes.score }}</span>
          <span v-if="paperes.passScore">及格分：{{ paperes.passScore }}</span>
          <span>考试用时：{{ computeTime(paperes.userUseTime) }}</span>
          <!-- <a-button style="margin-left: 15px" :loading="downloading" type="primary" size="large" @click="downloadFile()">下载 PDF</a-button> -->
        </div>
      </div>
      <div class="main" id="myexamresult">
        <div class="left">
          <div class="result-chart">
            <span>{{ paperes.score }}</span>
            <div>{{ paperes.passStatus == '0' ? '合格' : '不合格' }}</div>
          </div>
          <div class="participant" v-if="paperes.trainerSign || paperes.userSign">
            <div>
              <span>教育者：</span>
              <img class="sign" :src="getFileAccessHttpUrl(paperes.trainerSign)" />{{ paperes.trainerSignTime }}
            </div>
            <div>
              <span>参加人：</span>
              <img class="sign" :src="getFileAccessHttpUrl(paperes.userSign)" />{{ paperes.userSignTime }}
            </div>
          </div>
          <div class="title">答题卡</div>
          <div class="list">
            <a v-for="(item, idx) in questionList" :key="idx">
              <div class="item" @click="scrollTo(item)" :class="{ err: !item.correctFlag, on: item.correctFlag }">
                <span class="num">{{ idx + 1 }}</span>
              </div>
            </a>
          </div>
        </div>
        <div class="right" id="right">
          <div class="right-inner">
            <div class="item" v-for="(item, idx) in questionList" :id="item.questionId || item.id" :key="idx">
              <Radio disabled :rod="true" :currentIdx="idx" :currentQuestion="item" v-if="item.questionType == 1" />
              <Select disabled :rod="true" :currentIdx="idx" :currentQuestion="item" v-if="item.questionType == 2" />
              <QInput disabled :rod="true" :currentIdx="idx" v-model:currentQuestion="questionList[idx]" v-if="item.questionType == 3" />
              <Judge disabled :rod="true" :currentIdx="idx" :currentQuestion="item" v-if="item.questionType == 4" />
              <Ask disabled :rod="true" :currentIdx="idx" :currentQuestion="item" v-if="item.questionType == 5" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </BasicModal>
</template>
<script lang="ts" setup>
  import { ref } from 'vue';
  import Radio from '../../education/student/components/question/radio.vue';
  import Select from '../../education/student/components/question/select.vue';
  import QInput from '../../education/student/components/question/input.vue';
  import Judge from '../../education/student/components/question/judge.vue';
  import Ask from '../../education/student/components/question/ask.vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { getFileAccessHttpUrl } from '/@/utils/common/compUtils';
  import html2canvas from 'html2canvas';
  import jsPDF from 'jspdf';

  const title = ref<string>('考试结果');
  const [registerThis] = useModalInner((data) => {
    pageInit(data.record);
  });
  const paperes = ref<any>({});
  const questionList = ref<any>([]);

  function pageInit(data) {
    // 1 考试结果页 0 考试中
    paperes.value = data.userExamContent;
    questionList.value = JSON.parse(JSON.stringify(data.userExamContent.questionList));
    questionList.value.forEach((item: any) => {
      if (item.userAnswer) {
        item.userAnswer = JSON.parse(item.userAnswer);
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
  }

  const computeTime = (time: number) => {
    let day = Math.floor(time / 3600 / 24);
    let hour = Math.floor((time / 3600) % 24);
    let minute = Math.floor((time / 60) % 60);
    let second = Math.floor(time % 60);
    return day ? `${day}天${hour}时${minute}分${second}秒` : hour ? `${hour}时${minute}分${second}秒` : `${minute}分${second}秒`;
  };

  const close = () => {
    document.querySelector('#right')?.scrollTo(0, 0);
  };

  const scrollTo = (item) => {
    const dom = document.getElementById(item.id);
    if (dom) {
      dom.scrollIntoView({ behavior: 'smooth' });
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
        pdf = new jsPDF(orientation, 'pt', [width, height], true);
        pdf.addImage(pageData, 'jpeg', 0, 0, width, height);
        pdf.save(paperes.value.taskName + '--考试.pdf');
      };
    });
  };
</script>
<style lang="less" scoped>
  .exam {
    width: 100%;
    height: 100%;
    font-size: 18px;
    .hd {
      height: 55px;
      display: flex;
      justify-content: space-between;
      align-items: center;
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
    .main {
      padding: 10px 16px;
      padding-right: 0;
      display: flex;
      position: relative;
      .left {
        width: 290px;
        left: 0;
        top: 112px;
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
          justify-content: space-between;
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
