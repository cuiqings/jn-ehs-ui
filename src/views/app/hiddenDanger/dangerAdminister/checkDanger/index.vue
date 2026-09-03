<!-- 隐患整改 -->
<template>
  <div class="hd-edit">
    <div class="main">
      <CurLoading v-if="loading" />
      <van-collapse v-model="activeNames">
        <van-collapse-item title="确认信息" v-if="['1', '3', '5'].includes(pageType)" name="0">
          <AdjustForm :pageType="pageType" ref="adjustFormRef" />
        </van-collapse-item>
        <van-form label-width="70px">
          <van-collapse-item title="基本信息" name="1">
            <BasicInfo :readonly="true" :formData="formData" />
          </van-collapse-item>
          <van-collapse-item title="隐患确认" name="2">
            <ConfirnInfo :readonly="true" :formData="formData" />
            <ConfirmLog v-if="formData.confirm.yhLevel > 1" :formData="formData" />
          </van-collapse-item>
          <van-collapse-item title="隐患整改" name="3">
            <van-field v-model="formData.confirm.repairStatus" name="repairStatus" label="整改状态" placeholder="整改状态" />
            <StepDiv :logList="formData.confirm.logList" />
          </van-collapse-item>
        </van-form>
      </van-collapse>
    </div>

    <div class="foot" v-if="pageType == '4'">
      <van-button v-if="canHandle" @click="goPage('/app/hiddenDanger/dangerAdminister/checkDanger', { pageType: '3' })" type="primary"
        >整改反馈</van-button
      >
    </div>
    <div class="foot" v-else-if="pageType == '6'">
      <van-button v-if="canHandle" @click="goPage('/app/hiddenDanger/dangerAdminister/checkAccept', { pageType: '5' })" type="primary"
        >验收审核</van-button
      >
    </div>
    <div class="foot" v-else>
      <van-button :loading="submitIng" @click="goBack" plain>取消</van-button>
      <van-button :loading="submitIng" @click="submitFn" type="primary">提交</van-button>
    </div>
  </div>
</template>

<script setup lang="ts">
  /**
   *
   * @param pageType 1：隐患确认处理按钮，2：隐患确认卡片；3：隐患整改按钮，4：隐患整改卡片；5：隐患验收按钮，6：隐患验收卡片
   */
  import { jnYhSspDetail, jnYhConfirmRepair, jnYhPlanExecuteItemDetail } from '../../index.api';
  import { getFileAccessHttpUrl } from '/@/utils/common/compUtils';
  import ConfirnInfo from '../../components/confirnInfo.vue';
  import ConfirmLog from '../../components/confirmLog.vue';
  import BasicInfo from '../../components/basicInfo.vue';
  import CurLoading from '../../components/loading.vue';
  import AdjustForm from '../components/adjustForm.vue';
  import StepDiv from '../../components/stepDiv.vue';
  import { useRouter, useRoute } from 'vue-router';
  import { ref, reactive, watch, computed } from 'vue';
  import { showSuccessToast } from 'vant';

  const router = useRouter();
  const route = useRoute();
  const activeNames = ref(['0']);
  const submitIng = ref(false);
  const loading = ref(false);
  const pageType = ref(route.query.pageType);

  const formData = reactive({
    yhPicture: '',
    repairPicture: '',
    yhDescription: '',
    repairExplain: '',
    reporterName: '',
    reporterPhone: '',
    depart: '',
    departName: '',
  });
  const adjustFormRef = ref<HTMLElement | null>(null);
  let pageName = ref(route.name);

  watch(route, (newRoute) => {
    pageName.value = newRoute.name;
    pageType.value = newRoute.query.pageType;
    if (['1', '3', '5'].includes(route.query.pageType)) {
      activeNames.value = ['0'];
    }
  });
  // 判断是否有处理权限
  const canHandle = computed(() => {
    if (route.query.hasOwnProperty('canHandle')) {
      return route.query.canHandle == 'true';
    } else {
      return true;
    }
  });

  pageInit();
  async function pageInit() {
    if (route.query.sourceType == 1) {
      loading.value = true;
      jnYhPlanExecuteItemDetail({ id: route.query.id })
        .then((res) => {
          Object.assign(res, res.confirm);
          splitImg(res);
          Object.assign(formData, res);
          loading.value = false;
        })
        .catch(() => (loading.value = false));
    } else {
      loading.value = true;
      jnYhSspDetail({ id: route.query.id }).then((res) => {
        loading.value = false;
        splitImg(res);
        Object.assign(formData, res);
      });
    }
    if (['4', '6'].includes(pageType.value)) {
      activeNames.value = ['1'];
    } else {
      activeNames.value = ['0'];
    }
  }

  function splitImg(res) {
    if (res.yhPicture) {
      let arr = res.yhPicture.split(',').map((item) => getFileAccessHttpUrl(item));
      res.yhPicture = arr;
    }
    if (res.repairPicture) {
      let arr = res.repairPicture.split(',').map((item) => getFileAccessHttpUrl(item));
      res.repairPicture = arr;
    }
  }

  // 处理提交
  const submitFn = async () => {
    const result = await adjustFormRef.value?.submitForm();

    jnYhConfirmRepair({
      ...result,
      confirmId: formData.confirm.id,
    })
      .then((res) => {
        submitIng.value = false;
        console.log(res);
        // showSuccessToast({ message: '提交成功！', duration: 300 });
        // setTimeout(() => {
          router.replace({
            path: '/app/hiddenDanger/dangerAdminister/detail',
            query: { id: route.query.id, sourceType: route.query.sourceType },
          });
        // }, 300);
      })
      .catch(() => {
        submitIng.value = false;
      });
  };
  /**
   *
   * @param path
   * @param obj 二次跳转改变pageType
   */
  const goPage = (path, obj) => {
    router.replace({ path: path, query: { ...route.query, ...obj } });
  };
  const goBack = () => {
    router.back();
  };
</script>
<style scoped lang="less">
  .hd-edit {
    width: 100%;
    height: 100%;
    padding-bottom: 55px;
    .main {
      width: 100%;
      height: 100%;
      overflow-y: auto;
    }
    .foot {
      width: 100%;
      height: 55px;
      position: fixed;
      bottom: 0;
      left: 0;
      background: #fff;
      display: flex;
      justify-content: center;
      align-items: center;
      border-top: 1px solid #f5f5f5;
      .van-button {
        margin-right: 15px;
      }
    }
  }
  :deep(.van-collapse-item) {
    .van-collapse-item__title {
      .van-cell__title {
        color: #1989fa !important;
      }
    }
  }
  :deep(.van-collapse-item__content) {
    padding: 0 !important;
  }
</style>
