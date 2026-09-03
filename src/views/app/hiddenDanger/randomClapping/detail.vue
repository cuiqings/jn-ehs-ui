<!-- 随手拍处理 -->
<template>
  <div class="hd-edit">
    <div class="main">
      <CurLoading v-if="loading" />
      <van-collapse v-model="activeNames">
        <van-collapse-item title="基本信息" name="1">
          <BasicInfo :readonly="true" :formData="formData" />
        </van-collapse-item>
        <van-collapse-item title="隐患确认" name="2">
          <ConfirnInfo :readonly="true" :formData="formData" />
          <ConfirmLog v-if="formData.confirm.yhLevel > 1" :formData="formData" />
        </van-collapse-item>
        <van-collapse-item title="隐患整改" name="3">
          <van-field readonly v-model="formData.confirm.repairStatus" name="repairStatus" label="整改状态" placeholder="整改状态" />
          <StepDiv :logList="formData.confirm.logList" />
        </van-collapse-item>
      </van-collapse>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { getFileAccessHttpUrl } from '/@/utils/common/compUtils';
  import ConfirnInfo from '../components/confirnInfo.vue';
  import BasicInfo from '../components/basicInfo.vue';
  import CurLoading from '../components/loading.vue';
  import StepDiv from '../components/stepDiv.vue';
  import ConfirmLog from '../components/confirmLog.vue';
  import { jnYhSspDetail, jnYhPlanExecuteItemDetail } from '../index.api';
  import { ref, reactive, watch } from 'vue';
  import { useRoute } from 'vue-router';

  const activeNames = ref(['1']);
  const route = useRoute();
  const loading = ref(false);
  const formData = reactive({});

  let pageName = ref(route.name);
  watch(route, (newRoute) => {
    pageName.value = newRoute.name;
  });

  pageInit();
  function pageInit() {
    if (route.query.sourceType == '1') {
      loading.value = true;
      jnYhPlanExecuteItemDetail({ id: route.query.id }).then((res) => {
        Object.assign(res, res.confirm);
        splitImg(res);
        Object.assign(formData, res);
        loading.value = false;
      }).catch(() => loading.value = false);
    } else {
      loading.value = true;
      jnYhSspDetail({ id: route.query.id }).then((res) => {
        splitImg(res);
        Object.assign(formData, res);
        loading.value = false;
      }).catch(() => loading.value = false);
    }
  }

  // 统一处理图片src
  function splitImg(res) {
    if (res.yhPicture) {
      let arr = res.yhPicture.split(',').map((item) => getFileAccessHttpUrl(item));
      res.yhPicture = arr;
    }
    if (res.repairPicture) {
      let arr = res.repairPicture.split(',').map((item) => getFileAccessHttpUrl(item));
      res.repairPicture = arr;
    }
    if (res.confirm.handlePicture) {
      let arr = res.confirm.handlePicture.split(',').map((item) => getFileAccessHttpUrl(item));
      res.confirm.handlePicture = arr;
    }
    if (res.confirm.recheckPicture) {
      let arr = res.confirm.recheckPicture.split(',').map((item) => getFileAccessHttpUrl(item));
      res.confirm.recheckPicture = arr;
    }
  }
</script>

<style scoped lang="less">
  .hd-edit {
    width: 100%;
    height: 100%;
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
