<template>
  <div class="taskDetail">
    <section>
      <div class="detail-Information">
        <h3 :class="label == 2 ? 'rwx' : 'hide'">任务信息</h3>
        <dl class="detail-dl">
          <dt>
            完成时限：{{ detailObj.completeTimeLimit }}
            <span :class="label == 1 && taskStatus !== 3 ? 'detail-sp' : 'hide'">{{ detailObj.reportTag }}</span>
          </dt>
          <dd class="detail-dd">
            <van-tag color="#ddebfe" text-color="#3E87F8" type="primary" size="medium">{{
              filterDictTextByCache('jn_publish_task_type', detailObj.taskType)
            }}</van-tag>
            <van-tag v-if="detailObj.reportRequire == 1" color="#daf6f0" text-color="#09C199" type="primary" size="medium">长期</van-tag>
            <van-tag v-if="detailObj.reportRequire == 2" color="#daf6f0" text-color="#09C199" type="primary" size="medium">日常</van-tag>
            <van-tag color="#d9f5fe" text-color="#00BEF7" type="primary" size="medium"
              >{{ reportWay[detailObj.reportWay] }}{{ detailObj.reportTime }}</van-tag
            >
          </dd>
        </dl>
        <p class="detail-text">
          {{ detailObj.workContent }}
        </p>
        <p>验收人：{{ detailObj.checkPeopleName }}</p>
        <p class="detail-annex">
          附件：<a href="#">{{ detailObj.attachment }}</a>
        </p>
        <p>发布单位：{{ detailObj.publishOrgName }}</p>
        <p>发布时间：{{ detailObj.publishTime }}</p>
        <van-button
          :class="taskStatus == 1 && showBtn == true && detailObj.canReport == true ? 'taskBtn' : 'hide'"
          type="primary"
          size="small"
          @click="onIshowBtn"
          >汇报</van-button
        >
        <!-- completeTimeLimit  completeTag-->
        <div :class="taskStatus == 3 ? '' : 'hide'">
          <span>完成时间：{{ detailObj.completeTime }}</span> <br />
          <span>完成说明：{{ detailObj.finishExplain }}</span>
        </div>
      </div>
      <div :class="label == 1 ? 'detail-process' : 'hide'">
        <div class="detail-participator">
          <p>参与人：</p>
          <div class="participants-box">
            <div class="surname" :style="{ backgroundColor: getColorBySurname(v.realname2) }" v-for="(v, i) in pantsData" :key="i">{{
              v.realname2 ? v.realname2[0] : v.realname2
            }}</div>
            <div :class="taskStatus && taskStatus !== 2 ? 'addPar' : 'hide'" @click="addRen">+ 添加参与人</div>
          </div>
        </div>
        <div>
          <p style="margin-top: 3%">当前流程</p>
          <!-- 进行中的流程 -->
          <van-steps direction="vertical" :active="active" :class="taskStatus == 1 || taskStatus == 3 ? '' : 'hide'">
            <van-step v-for="(item, index) in process1" :key="index" @click="onStep(index)">
              <p>{{ item.time }}</p>
              <h3>{{ item.reportCycle }} {{ item.status }}</h3>
            </van-step>
          </van-steps>
          <!-- 我参与的流程 -->
          <van-steps direction="vertical" :active="active" :class="taskStatus == 2 ? '' : 'hide'">
            <van-step v-for="(item, index) in process2" :key="index" @click="onStep(index)">
              <div v-if="item.total">
                <h3>{{ item.time }} {{ item.status }}</h3>
                <h3>汇报完成{{ item.reportedCount }}/{{ item.total }} 验收完成{{ item.checkedCount }}/{{ item.total }}</h3>
              </div>
              <div v-else>
                <p>{{ item.time }}</p>
                <h3>{{ item.reportCycle }} {{ item.status }}</h3>
              </div>
            </van-step>
          </van-steps>
        </div>
      </div>
      <div :class="label == 2 ? 'detail-process' : 'hide'">
        <h3 class="rwx">汇报信息</h3>
        <div class="detail-label">
          <p class="label-cycle">汇报单位：{{ hbObj.reportPeopleOrgName }}</p>
          <p class="label-cycle">汇报周期：{{ format(hbObj.reportTime) }}</p>
          <p class="label-cycle">汇报人：{{ hbObj.reportPeopleName }}</p>
          <p>
            {{ hbObj?.job?.jobRequirement }}
          </p>
          <AppUpload v-if="hbObj.attachmentImg" disabled v-model:fileList="hbObj.attachmentImg" :max-count="hbObj.attachmentImg.split(',').length" />
          <p class="label-annex">
            <a href="#">{{ hbObj.attachmentFile }}</a>
          </p>
        </div>
      </div>
      <div :class="isFootBtn == true ? 'label-acceptance' : 'hide'">
        <h3 class="rwx">验收结果</h3>
        <div class="acceptance-results">
          <p>
            验收结果：<span :class="isPass == true ? 'color-green' : 'color-red'">{{ isPass == true ? '通过' : '不通过' }}</span>
          </p>
          <p :class="isIll == true ? 'hide' : ''">
            验收说明 : <span>{{ accTextValue }}</span>
          </p>
        </div>
      </div>
    </section>
    <footer :class="label == 1 && !taskStatus ? '' : 'hide'">
      <van-button :class="handoffBtm == 1 && detailObj.canReport == true ? 'hando-btn' : 'hide'" type="primary" block @click="reportBtn"
        >汇报</van-button
      >
      <van-button :class="handoffBtm == 2 ? 'hando-btn' : 'hide'" plain type="primary">查看任务</van-button>
    </footer>
    <footer :class="label == 2 && isFootBtn == false ? '' : 'hide'">
      <van-button @click="onNotPass" style="margin-right: 3%" class="label-btn" color="#FBB621" type="primary">不通过</van-button>
      <van-button @click="onPass" class="label-btn" type="primary">通过</van-button>
    </footer>
    <!-- 我的参与-汇报信息加评论-历史汇报 -->
    <footer :class="taskStatus ? '' : 'hide'">
      <van-button :class="taskStatus == 2 ? '' : 'hide'" @click="onRepInfor" style="margin-right: 3%" class="label-btn" type="primary"
        >汇报信息</van-button
      >
      <van-button
        :class="taskStatus == 1 || taskStatus == 3 ? '' : 'hide'"
        style="margin-right: 3%"
        class="label-btn"
        plain
        type="primary"
        @click="onReHis"
        >历史汇报</van-button
      >
      <van-button class="label-btn" @click="onComBtn" color="#000" plain> <a-badge :count="commentList.length"> 评论 </a-badge> </van-button>
    </footer>
    <!-- 汇报周期提交-模态框-->
    <van-popup v-model:show="show" closeable position="bottom" :style="{ height: '74%' }">
      <van-form @submit="repSubmit" class="report-modal">
        <p class="report-title">汇报周期：{{ year }}年{{ month < 10 ? `0${month}` : month }}月{{ date < 10 ? `0${date}` : date }}日</p>
        <div class="illustrate">
          <p>完成说明：</p>
          <textarea v-model="textIll" cols="30" rows="2" placeholder="请输入"></textarea>
        </div>
        <div class="report-upload">
          <AppUpload v-model:fileList="imgList" />
        </div>
        <div class="report-annex">
          <p>上传附件</p>
          <AppUploadFile v-model:fileList="fileList" />
        </div>
        <div style="margin: 16px">
          <van-button block type="primary" native-type="submit"> 提交 </van-button>
        </div>
      </van-form>
    </van-popup>

    <!--不通过/验收说明 -->
    <van-dialog v-model:show="accShow" show-cancel-button title="验收说明" @cancel="onCancel" :before-close="beforeClose">
      <template #default>
        <van-form ref="formRef">
          <van-field
            :autosize="{ maxHeight: 100, minHeight: 50 }"
            v-model="accTextValue"
            rows="3"
            maxlength="200"
            type="textarea"
            placeholder="请输入不通过说明"
            :rules="[{ required: true, message: '请输入不通过说明' }]"
          />
        </van-form>
      </template>
    </van-dialog>
  </div>
</template>

<script setup lang="ts">
  import AppUploadFile from '/@/components/App/AppUploadFile.vue';
  import { goingDetail, process1App1, oarticipantList, repUpl, processApp2, checkAccept, listByForm, cycleDetail } from './appTask.api';
  import { ref, onMounted } from 'vue';
  import { useRouter, useRoute } from 'vue-router';
  import AppUpload from '/@/components/App/AppUpload.vue';
  import { filterDictTextByCache } from '/@/utils/dict/JDictSelectUtil';
  import { pinyin } from 'pinyin-pro';
  const router = useRouter();
  const route = useRoute();
  const label: any = route.query.label == undefined ? 1 : route.query.label;
  const taskStatus: any = route.query.taskStatus;
  const active = ref(0);
  const show = route.query.isReport ? ref(true) : ref(false);
  const showBtn = ref(true);
  const imgList = ref('');
  const fileList = ref('');
  const textIll = ref(''); //说明
  const handoffBtm = ref(1); //底部
  const isFootBtn = ref(false); //是否通过
  const isPass: any = ref(null);
  const accShow = ref(false);
  const accTextValue = ref('');
  const isIll = ref(false);
  const detailObj: any = ref({});
  const hbObj: any = ref({});
  const process1: any = ref([]);
  const process2: any = ref([]);
  const pantsData: any = ref([]);
  const formRef = ref('');
  const commentList: any = ref([]);
  // 汇报方式
  const reportWay = { 1: '每班汇报', 2: '每日汇报', 3: '每周汇报', 4: '每月汇报', 5: '每季汇报' };
  onMounted(() => {
    cycDet();
  });
  //通过
  const onPass = async () => {
    let param = {
      id: hbObj.value.id,
      opinion: 'agree',
    };
    await isCheckAccept(param);
    isFootBtn.value = true;
    isPass.value = true;
    accTextValue.value = '';
    isIll.value = true;
  };
  //不通过
  const onNotPass = () => {
    accShow.value = true;
  };
  //验收说明取消
  const onCancel = () => {
    accShow.value = false;
  };

  const beforeClose = (s) => {
    if (s == 'confirm') {
      return new Promise((res) => {
        formRef.value
          ?.validate()
          .then(() => {
            onSure();
            res(true);
          })
          .catch(() => {
            res(false);
          });
      });
    }
    accTextValue.value = '';
    formRef.value?.resetValidation();
    return true;
  };
  //验收说明确定
  const onSure = async () => {
    let param = {
      id: hbObj.value.id,
      checkExplain: accTextValue.value,
      opinion: 'agree',
    };
    accTextValue.value = '';
    await isCheckAccept(param);
    accShow.value = false;
    isFootBtn.value = true;
    isPass.value = false;
  };

  //跳转汇报信息
  const onRepInfor = () => {
    router.push('/app/report/information');
  };
  //跳转历史汇报
  const onReHis = () => {
    router.push({
      path: '/app/history/repor',
      query: {
        id: detailObj.value.id,
      },
    });
  };

  //汇报周期模态框-显示
  const reportBtn = () => {
    show.value = true;
  };
  //汇报周期模态框-提交
  const repSubmit = async () => {
    let params = {
      id: route.query.label ? hbObj.value.id : detailObj.value.recordId,
      finishExplain: textIll.value ? textIll.value : '',
      attachmentImg: imgList.value ? imgList.value : '',
      attachmentFile: fileList.value ? fileList.value : '',
    };
    await repUpl(params);
    show.value = false;
    handoffBtm.value = 2;
    showBtn.value = false;
  };

  //评论
  const onComBtn = () => {
    router.push({
      path: '/app/commentsr',
      query: {
        tableName: 'jn_task_detail',
        dataId: detailObj.value.id,
        datetime: new Date().getTime(),
      },
    });
  };
  const loadData = () => {
    const params = {
      tableName: 'jn_task_detail',
      tableDataId: detailObj.value.id,
      column: 'createTime',
      order: 'desc',
    };
    listByForm(params).then((res) => {
      if (res?.records) {
        commentList.value = res.records;
      } else {
        commentList.value = [];
      }
    });
  };
  //步骤条
  const onStep = (index) => {
    active.value = index;
  };
  //详情页面的汇报按钮
  const onIshowBtn = () => {
    show.value = true;
  };
  //跳转到参与人
  const addRen = () => {
    router.push({ name: 'AppParticipants', query: { publishId: detailObj.value.id } });
  };
  //详情数据
  async function cycDet() {
    if (route.query.label) {
      await cycleDetail(route.query.id).then((res) => {
        detailObj.value = res.publish;
        hbObj.value = res;
        pantsName(res.publish.id);
        //@ts-ignore
        if (taskStatus == 2) {
          process2Detail(res.publish.id);
        }
      });
    } else {
      await goingDetail(route.query.id).then((res) => {
        detailObj.value = res;
        hbObj.value = res;
        pantsName(detailObj.value.id);
        //@ts-ignore
        if (taskStatus == 2) {
          process2Detail(detailObj.value.id);
        }
      });
    }
    await process1Detail();
    loadData();
  }
  //进行中的流程数据
  async function process1Detail() {
    await process1App1(detailObj.value.id).then((res) => {
      process1.value = res;
    });
  }
  //我参与的流程数据
  async function process2Detail(publishId) {
    await processApp2(publishId).then((res) => {
      process2.value = res;
    });
  }
  //参与人
  async function pantsName(publishId) {
    await oarticipantList(publishId).then((res) => {
      pantsData.value = res;
    });
  }
  //验收
  async function isCheckAccept(param) {
    await checkAccept(param);
  }
  const year = ref(0);
  const month = ref(0);
  const date = ref(0);
  //当前时间
  currentTime();
  function currentTime() {
    setInterval(function () {
      let now = new Date();
      year.value = now.getFullYear(); //年
      month.value = now.getMonth() + 1; //月
      date.value = now.getDate(); //日
    }, 1000);
  }
  //时间的拆分
  function format(time) {
    if (!time) return '';
    let forStr = time.split(' ')[0];
    const [year, month, day] = forStr.split('-');
    const newTime = `${year}年${month}月${day}日`;
    return newTime;
  }
  // 根据姓首字母去获取颜色
  const getColorBySurname = (surname) => {
    const colorMap = {
      A: '#FF0000', // Red
      B: '#008000', // Green
      C: '#0000FF', // Blue
      D: '#FFFF00', // Yellow
      E: '#FFA500', // Orange
      F: '#800080', // Purple
      G: '#00FFFF', // Cyan
      H: '#FF00FF', // Magenta
      I: '#008080', // Teal
      J: '#ADD8E6', // Light Blue
      K: '#FFC0CB', // Pink
      L: '#A52A2A', // Brown
      M: '#FFD700', // Gold
      N: '#800000', // Maroon
      O: '#7FFFD4', // Aquamarine
      P: '#006400', // Dark Green
      Q: '#EE82EE', // Violet
      R: '#E6E6FA', // Lavender
      S: '#808000', // Olive
      T: '#000080', // Navy
      U: '#FFFFE0', // Light Yellow
      V: '#FF7F50', // Coral
      W: '#BC8F8F', // Rosy Brown
      X: '#4169E1', // Royal Blue
      Y: '#9370DB', // Medium Purple
      Z: '#008B8B', // Dark Cyan
    };
    if (!surname || surname.length === 0) {
      return '#000000'; // 默认颜色：黑色
    }
    // 将汉字姓氏转换为拼音并获取首字母
    const firstLetter = pinyin(surname[0])[0].toUpperCase();
    // 返回对应颜色，如果没有匹配的，返回默认颜色
    return colorMap[firstLetter] || '#000000';
  };
</script>

<style lang="less" scoped>
  .taskDetail {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;

    section {
      flex: 1;
      overflow: auto;
      background: #eff1f5;

      .detail-Information {
        width: 100%;
        // height: 30%;
        background: white;
        padding: 3%;
        position: relative;

        .detail-dl {
          dt {
            font-size: 15px;
            font-weight: 550;

            .detail-sp {
              margin-left: 3px;
              font-weight: 500;
              color: #ff8d04;
            }
          }

          .detail-dd {
            margin-top: 4px;

            .van-tag {
              margin-right: 9px;
            }
          }
        }

        .detail-text {
        }

        .detail-annex {
          a {
            border-bottom: 1px solid #3e87f8;
          }
        }

        .taskBtn {
          width: 66px;
          position: absolute;
          right: 6%;
          bottom: 6%;
        }
      }

      .detail-process {
        width: 100%;
        // height: 333px;
        background: white;
        margin-top: 2%;
        padding: 3%;

        .detail-participator {
          width: 100%;

          .participants-box {
            display: flex;

            .surname {
              width: 29px;
              height: 29px;
              text-align: center;
              line-height: 29px;
              border-radius: 50%;
              color: white;
              // background: #ff0000;
              margin-right: 1.6%;
            }

            .addPar {
              color: #1f7cf8;
            }
          }
        }

        .van-steps {
          // height: 260px;
          /deep/ .van-step__title--active {
            p {
              color: #999;
            }
          }
        }

        //label为2时显示汇报信息
        .detail-label {
          width: 100%;

          .label-cycle {
            font-size: 15px;
            font-weight: 550;
            margin-top: 19px;
          }

          .cycle-url {
            width: 80px;
            height: 60px;
          }

          .label-annex {
            a {
              border-bottom: 1px solid #3e87f8;
            }
          }
        }
      }

      .label-acceptance {
        width: 100%;
        margin-bottom: 100px;
        background: white;
        margin-top: 2%;
        padding: 3%;

        .acceptance-results {
          width: 100%;

          .color-green {
            color: #0cc29a;
          }

          .color-red {
            color: #d0372a;
          }
        }
      }

      .rwx {
        width: 100%;
        height: 40px;
        font-size: 15px;
        font-weight: 550;
        border-bottom: 1px solid #eee;
      }
    }

    footer {
      width: 100%;
      height: 50px;
      background-color: #f7f8fa;
      display: flex;
      // flex-direction: column;
      justify-content: center;
      align-items: center;
      border-top: 1px solid #eee;

      .hando-btn {
        width: 95%;
      }

      .label-btn {
        width: 44.4%;
      }
    }

    //隐藏
    .hide {
      display: none;
    }

    //汇报周期模态框
    .report-modal {
      width: 100%;
      position: relative;

      .report-title {
        width: 100%;
        height: 50px;
        display: flex;
        align-items: center;
        font-size: 17px;
        font-weight: 550;
        padding-left: 3%;
        border-bottom: 1px solid #eee;
      }

      .illustrate {
        width: 100%;
        padding-left: 3%;
        border-bottom: 1px solid #eee;
      }

      .report-upload {
        width: 100%;
        padding: 3% 0 1% 3%;
        border-bottom: 1px solid #eee;
      }

      .report-annex {
        width: 100%;
        padding: 0 15px;
        p {
          width: 100%;
        }
      }

      .upload-annex {
        width: 90vw;
        height: 50px;
        padding-left: 3%;
        border: 1px dashed #eee;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #1f7cf8;

        span {
          margin-left: 3vw;
        }
      }
    }

    //不通过的验收说明
    .not-passed {
      border-radius: 3px;

      .passill {
        width: 100%;
        height: 40px;
        line-height: 40px;
        text-align: center;
        font-size: 16px;
        font-weight: 550;
        margin-top: 6px;
      }

      textarea {
        border: 1px solid #ccc;
        margin-left: 8%;
        border-radius: 1px;
        padding: 1%;
      }

      .illustrate-btn {
        width: 100%;
        display: flex;
        margin-top: 13px;

        button {
          width: 50%;
          height: 46px;
          border: 1px solid #f5f5f5;
        }

        .sure-btn {
          color: #1f7cf8;
        }
      }
    }
  }
  /deep/.ant-badge-count {
    right: -10px;
  }
</style>
