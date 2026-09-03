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
      <div class="item" v-for="(item, idx) in detailInfo.taskContentItems" :key="item.id">
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
  <div class="foot">
    <van-button v-if="route.query.type == '1'" type="primary" @click="showSign" block>签字评价</van-button>
    <van-button v-if="route.query.type == '2'" type="primary" @click="showSign" block>评审</van-button>
  </div>
  <van-dialog
    v-model:show="showEvaluateDialog"
    :beforeClose="beforeClose"
    :showCancelButton="true"
    confirmButtonText="提交"
    round
    :style="{ height: 'auto' }"
  >
    <div class="signmain">
      <div class="tit">签字评价</div>
      <van-form ref="formRef" labelAlign="top">
        <van-field
          required
          v-model="formData.lecturerCourse"
          name="lecturerCourse"
          label="讲师授课情况"
          placeholder="请输入"
          maxlength="200"
          v-if="route.query.node == '评价人员'"
          :rules="[{ required: true, message: '请输入' }]"
        />
        <van-field
          required
          v-model="formData.employeeLearning"
          name="employeeLearning"
          label="员工学习情况"
          placeholder="请输入"
          maxlength="200"
          v-if="route.query.node == '评价人员'"
          :rules="[{ required: true, message: '请输入' }]"
        />
        <van-field
          required
          v-model="formData.appraiseResult"
          name="appraiseResult"
          label="评价结果"
          placeholder="请输入"
          maxlength="200"
          v-if="route.query.node == '评价人员'"
          :rules="[{ required: true, message: '请输入' }]"
        />
        <van-field label="本人签字:" v-if="['安全生产管理机构负责人', '考核人员'].includes(route.query.node as string)" name="uploader">
          <template #input>
            <Sign v-model:value="signature" />
          </template>
        </van-field>
        <van-field
          v-if="!['安全生产管理机构负责人', '考核人员', '评价人员'].includes(route.query.node as string)"
          name="uploader"
          label="记录图片/视频"
        >
          <template #input>
            <AppUpload accept="image/*,video/*" :watermarkText="watermarkText" v-model:fileList="formData.annex" />
          </template>
        </van-field>
      </van-form>
    </div>
  </van-dialog>
  <van-dialog v-model:show="showSignDialog" title="签名" :before-close="signClose" @confirm="dialogConfirm" show-cancel-button>
    <Sign v-model:value="signature" />
    <div class="hint" v-show="hintShow && !signature">请签字</div>
  </van-dialog>
</template>
<script lang="ts" setup>
  import { ref } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { evaluateDetail, getQrCode, signAppraise } from '../../index.api';
  import { showToast } from 'vant';
  import { useUserStore } from '/@/store/modules/user';
  import Sign from '../../../components/sign.vue';
  import { dateFormat } from '/@/utils/common/compUtils';
  import AppUpload from '/@/components/App/AppUpload.vue';
  const userStore: any = useUserStore();
  const route = useRoute();
  const router = useRouter();

  const detailInfo = ref<any>({});
  const pageInit = async () => {
    const res = await evaluateDetail({ id: route.query.id });
    detailInfo.value = res;
  };
  pageInit();

  const watermarkText = ref(
    `${userStore.getUserInfo.realname} ${userStore.getUserInfo.workNo} ${dateFormat(new Date(), 'yyyy-MM-dd  hh:mm:ss')} 上传`
  );
  const showSignDialog = ref(false);
  const showCode = async (item) => {
    await getSignCode(item.id);
    showSignDialog.value = true;
    timer.value = setInterval(() => {
      getSignCode(item.id);
    }, 1000 * 30);
  };

  // 获取签到二维码
  const codeUrl = ref('');
  const timer = ref<any>(null);
  const getSignCode = async (contentId) => {
    let res = await getQrCode({ contentId: contentId });
    codeUrl.value = 'data:image/png;base64,' + res.qrImg;
  };

  const go = (item, idx) => {
    console.log(userStore.getUserInfo.id);
    let next = detailInfo.value.taskContentItems[idx + 1];
    if (item.trainPersonId != userStore.getUserInfo.id) {
      showToast('您不是本阶段培训人员，无法参与培训');
      return;
    }
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
        orgCode: item.enforceCode,
      },
    });
  };

  const showEvaluateDialog = ref(false);
  const showReviewDialog = ref(false);
  const showSign = async () => {
    if (route.query.type == '1') {
      showEvaluateDialog.value = true;
    } else {
      showReviewDialog.value = true;
    }
  };

  const formRef = ref<any>(null);
  const formData = ref<any>({
    lecturerCourse: '',
    employeeLearning: '',
    appraiseResult: '',
    annex: '',
    sign: '',
  });

  const beforeClose = (str: string): boolean | Promise<boolean> => {
    if (str == 'cancel') {
      resetForm();
      return true;
    }
    return new Promise<boolean>((resolve) => {
      formRef.value
        .validate()
        .then(() => {
          resolve(true);
          if (['安全生产管理机构负责人', '考核人员'].includes(route.query.node as string)) {
            dialogConfirm();
          } else {
            showSignDialog.value = true;
          }
        })
        .catch(() => {
          resolve(false);
        });
    });
  };

  const hintShow = ref(false);
  const signature = ref('');
  const signClose = (s) => {
    if (s == 'confirm') return !!signature.value;
    hintShow.value = false;
    return true;
  };
  // 签字确认
  const dialogConfirm = async () => {
    if (!signature.value) {
      hintShow.value = true;
      return;
    }
    showSignDialog.value = false;
    await signAppraise({
      taskId: route.query.id,
      ...formData.value,
      sign: signature.value,
      vettingId: route.query.vettingId,
    });
    resetForm();
    router.go(-1);
  };
  function resetForm() {
    formData.value = {
      lecturerCourse: '',
      employeeLearning: '',
      appraiseResult: '',
      annex: '',
      sign: '',
    };
  }
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
      height: calc(100% - 130px);
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
      .hd {
        display: flex;
        justify-content: space-between;
        background: #e9f2fa;
        margin: 10px 0;
        span:nth-child(1) {
          width: 80px;
        }
        span:nth-child(2) {
          width: 60px;
        }
        span:nth-child(3) {
          flex: 1;
        }
      }
      .item {
        display: flex;
        justify-content: space-between;
        span:nth-child(1) {
          width: 80px;
        }
        span:nth-child(2) {
          width: 60px;
        }
        span:nth-child(3) {
          flex: 1;
        }
        img {
          height: 35px;
          width: auto;
        }
      }
    }
  }
  .foot {
    width: 100%;
    height: 50px;
    padding: 0 16px;
    position: fixed;
    bottom: 0;
    left: 0;
    background: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.1);
  }
</style>
