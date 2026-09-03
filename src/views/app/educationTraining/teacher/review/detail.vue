<template>
  <div class="taskDetail" v-loading="loading">
    <van-tabs v-model:active="active">
      <van-tab title="课件" style="padding-bottom: 50px;">
        <div class="main">
          <DetailList @signed="pageInit" @changeClass="itemClick" pageType="9" :id="route.query.id || ''"
            :contentList="detailInfo" />
        </div>
      </van-tab>
      <van-tab title="审批流程" style="padding-bottom: 50px;">
        <van-steps direction="vertical" :active="0">
          <van-step v-for="item in stepData" :key="item.node">
            <h3>{{ item.node }}</h3>
            <template v-for="citem in item.vettingInfoList">
              <div class="item" v-if="citem.sign">
                <p>{{ citem.userName }}{{ citem.operateTime }}</p>
                <p>审查意见：{{ citem.reviewComment }}</p>
                <p>会审意见：{{ citem.triageComment }}{{ citem.triageComment }}</p>
                <img :src="citem.sign" alt="">
              </div>
            </template>
          </van-step>
        </van-steps>
      </van-tab>
    </van-tabs>

    <div class="foot">
      <van-button type="primary" @click="showSign" block>评审</van-button>
    </div>
    <van-dialog v-model:show="showReviewDialog" :beforeClose="beforeClose" :showCancelButton="true"
      confirmButtonText="提交" round :style="{ height: 'auto' }">
      <div class="signmain">
        <div class="tit">教材会审</div>
        <van-form ref="formRef" labelAlign="top">
          <van-field required v-model="formData.reviewComment" name="reviewComment" label="审查意见" placeholder="请输入"
            :rules="[{ required: true, message: '请输入' }]" />
          <van-field required autosize type="textarea" :max="100" v-model="formData.triageComment" name="triageComment"
            label=" 会审意见" placeholder="请输入" :rules="[{ required: true, message: '请输入' }]" />
        </van-form>
      </div>
    </van-dialog>
    <van-dialog v-model:show="showSignDialog" title="签名" :before-close="signClose" @confirm="dialogConfirm"
      show-cancel-button>
      <Sign v-model:value="signature" />
      <div class="hint" v-show="hintShow && !signature">请签字</div>
    </van-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import DetailList from '../components/detailList.vue';
import { reviewDetail, getResourceUrl, review, viewProcess } from '../../index.api';
import { useRoute, useRouter } from 'vue-router';
import StudyView from '../study/index.vue';
import Sign from '../../../components/sign.vue';
const route = useRoute();
const router = useRouter();

const active = ref(0);
const loading = ref(false);
const detailInfo = ref<any>({ contentList: [] });
const studying = ref(false);
const studyViewRef = ref<InstanceType<typeof StudyView>>();
const stepData = ref<any>([]);
pageInit();
function pageInit() {
  loading.value = true;
  reviewDetail({ id: route.query.id }).then((res) => {
    loading.value = false;
    detailInfo.value = res;
    // setAppTitle(res.taskName);
    loading.value = false;
    viewProcess({ id: route.query.id }).then((res) => {
      stepData.value = res.reviewList;
    })
  });
}

const itemClick = async ({ contentId, resourceId, cidx }) => {
  let res = await getResourceUrl({
    taskId: route.query.id,
    contentId: contentId,
    resourceId: resourceId,
  });
  console.log(res);
  studying.value = true;
  studyViewRef.value?.pageInit(res.courseList[cidx]);
};

const showReviewDialog = ref(false);
const showSign = async () => {
  showReviewDialog.value = true;
};

const formRef = ref<any>(null);
const formData = ref<any>({
  reviewComment: '同意',
  triageComment: '教材深入浅出，内容翔实。',
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
        showSignDialog.value = true;
      })
      .catch(() => {
        resolve(false);
      });
  });
};

const showSignDialog = ref(false);
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
  // showHold.value = false;
  await review({
    taskId: route.query.id,
    ...formData.value,
    sign: signature.value,
    vettingId: route.query.vettingId,
  });
  resetForm();
  router.back();
};
function resetForm() {
  formData.value = {
    reviewComment: '',
    triageComment: '',
    sign: '',
  };
}
</script>

<style lang="less" scoped>
.taskDetail {
  width: 100%;
  height: 100%;
  .hd {
    height: 30%;
    background-color: #1890ff;
    border-radius: 10px;
    color: #ffffff;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px 16px;
    justify-content: space-between;

    h1 {
      font-size: 32px;
      font-weight: 800;
      color: #ffffff;
    }

    .bt {
      width: 100%;
      background-color: rgba(255, 255, 255, 0.1);
      padding: 10px;
      border-radius: 10px;
      font-size: 12px;
      text-align: center;

      span {
        color: rgba(255, 255, 255, 0.8);
      }
    }
  }

  .main {
    height: calc(100% - 50px);
    overflow-y: auto;
  }

  .signmain {
    text-align: center;
    padding: 16px;

    .title {
      font-size: 16px;
      font-weight: 600;
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

  .item {
    border-bottom: #f5f5f5;
    color: #1989fa;
    img {
      height: 56px;
    }
  }
}
</style>
