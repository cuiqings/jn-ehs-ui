<template>
  <div class="safetyProductionSystem_view">
    <div class="safetyProductionSystem_view-item">
      <span>所属单位：</span>
      <span>{{ viewObj.organizationName }}</span>
    </div>
    <div class="safetyProductionSystem_view-item">
      <span>车间：</span>
      <span>{{ viewObj.departName }}</span>
    </div>
    <div class="safetyProductionSystem_view-item">
      <span>人员姓名：</span>
      <span>{{ viewObj.userRealname }}</span>
    </div>
    <div class="safetyProductionSystem_view-item">
      <span>证书编号：</span>
      <span>{{ viewObj.certificationsCode }}</span>
    </div>
    <div class="btn-group">
      <van-button type="primary" style="width: 90%; line-height: 35px; height: 35px" @click="handleSign">签名</van-button>
    </div>
  </div>
  <van-dialog v-model:show="signShow" title="签名" :before-close="beforeClose" show-cancel-button>
    <Sign v-model:value="signature" />
  </van-dialog>
</template>
<script lang="ts" setup>
  import { useRoute, useRouter } from 'vue-router';
  import { ref, onMounted } from 'vue';
  import { setAppTitle } from '/@/utils/index';
  import { showFailToast } from 'vant';
  import Sign from '/@/views/app/components/sign.vue';
  import { sign } from '../certificate/certificate.api';
  const route: any = useRoute();
  const router: any = useRouter();
  const viewObj: any = ref({});
  setAppTitle(route.query.title);
  const signShow = ref(false);
  const signature = ref('');
  onMounted(() => {
    viewObj.value = JSON.parse(route.query.obj);
  });
  const handleSign = () => {
    signShow.value = true;
  };
  // 确认审批提交
  const beforeClose = (c) => {
    if (c == 'cancel') {
      signShow.value = false;
      return true;
    }
    return new Promise(async (resolve) => {
      if (!signature.value) {
        showFailToast('请签名！');
        resolve(false);
      } else {
        const obj: any = {};
        if (route.query.title === '检查签字') obj.checkSignImg = signature.value;
        else obj.confirmSignImg = signature.value;
        sign({
          id: viewObj.value.id,
          ...obj,
        }).then((res) => {
          if (res) {
            resolve(false);
            router.go(-1);
          }
        });
      }
    });
  };
</script>
<style lang="less" scoped>
  .safetyProductionSystem_view {
    padding: 15px;
    .safetyProductionSystem_view-item {
      // display: flex;
      line-height: 30px;
      font-size: 14px;
      word-wrap: break-word;
      & > span {
        color: #9f9d9d;
        word-wrap: break-word;
      }
      & > span:nth-child(1) {
        color: #000;
      }
    }
    .reviewRecord {
      border: 1px solid #e8e8e8;
      padding: 20px;
      margin-bottom: 10px;
      border-radius: 8px;
      .reviewRecord-text {
        line-height: 30px;
        display: flex;
        & > span {
          color: #888888;
          word-wrap: break-word;
        }
      }
    }
    .btn-group {
      display: flex;
      justify-content: space-around;
      margin-top: 20px;
    }
  }
  :deep(.ant-divider) {
    .ant-divider-inner-text {
      color: #1890ff;
    }
  }
</style>
