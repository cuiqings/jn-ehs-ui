<!-- 隐患验收 -->
<template>
  <div class="hd-edit">
    <div class="main">
      <AdjustForm :infoData="formData" v-if="[1].includes(1)" :pageType="pageType" ref="adjustFormRef" />
      <van-collapse v-model="activeNames">
        <!-- <van-collapse-item title="确认信息" v-if="[1].includes(1)" name="0">
          <AdjustForm :pageType="pageType" ref="adjustFormRef" />
        </van-collapse-item> -->
        <van-form label-width="70px">
          <van-collapse-item title="隐患整改" name="3" v-if="formData.repairLogList && formData.repairLogList.length > 0">
            <StepDiv :logList="formData.repairLogList" />
          </van-collapse-item>
          <van-collapse-item title="基本信息" name="1">
            <BasicInfo :readonly="true" :form-data="formData" />
          </van-collapse-item>
          <van-collapse-item title="隐患确认" name="2">
            <ConfirmInfo :form-data="formData" />
            <ConfirmLog :formData="formData" />
          </van-collapse-item>
        </van-form>
      </van-collapse>
    </div>

    <div class="foot">
      <van-button v-show="route.query.canHandle == 'true'" :loading="loading" @click="goBack" plain>取消</van-button>
      <van-button v-show="route.query.canHandle == 'true'" :loading="loading" @click="submitFn" type="primary">提交</van-button>
    </div>
    <PersonDialog ref="personDialogRef" @confirm="confirmPerson" />
  </div>
</template>

<script setup lang="ts">
  /**
   *
   * @param pageType 1：隐患确认处理按钮，2：隐患确认卡片；3：隐患整改按钮，4：隐患整改卡片；5：隐患验收按钮，6：隐患验收卡片
   */
  import { ref, reactive, watch } from 'vue';
  import { useRouter, useRoute } from 'vue-router';
  import StepDiv from '../../components/stepDiv.vue';
  import AdjustForm from '../components/adjustForm.vue';
  import BasicInfo from '../../components/basicInfo.vue';
  import ConfirmLog from '../../components/confirmLog.vue';
  import ConfirmInfo from '../../components/confirnInfo.vue';
  import { getFileAccessHttpUrl } from '/@/utils/common/compUtils';
  import PersonDialog from '../../components/personDialog.vue';
  import { jnYhSspDetail, jnYhConfirmCheck, jnYhPlanExecuteItemDetail } from '../../index.api';

  const personDialogRef = ref<HTMLElement | null>(null);
  const activeNames = ref(['0']);
  const route = useRoute();
  const router = useRouter();
  const loading = ref<boolean>(false);
  const submitIng = ref<boolean>(false);

  const pageType = ref(route.query.pageType);
  const formData = reactive<any>({});
  const adjustFormRef = ref<HTMLElement | null>(null);
  let pageName = ref(route.name);
  watch(route, (newRoute) => {
    pageName.value = newRoute.name;
  });

  pageInit();
  async function pageInit() {
    if (route.query && route.query.canHandle && route.query.canHandle == 'false') {
      router.replace({
        path: '/app/hiddenDangerNew/dangerAdminister/detail',
        query: { id: route.query.id, sourceType: route.query.sourceType },
      });
      return;
    }
    loading.value = true;
    jnYhSspDetail({ id: route.query.id }).then((res) => {
      loading.value = false;
      splitImg(res);
      Object.assign(formData, res);
      if (res.currentNode < 41 || res.currentNode > 47) {
        router.replace({
          path: '/app/hiddenDangerNew/dangerAdminister/detail',
          query: { id: route.query.id, sourceType: route.query.sourceType },
        });
      }
    });
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
    if (result.value.checkResult == 2) {
      console.log(result.value);
      checkRequest({ ...result.value, yhLevel: result.value.yhLevelNew });
      return;
    }
    let pResult = await personDialogRef.value?.getAssigneeData({
      currentNode: formData.currentNode,
      org: formData.org,
      depart: formData.depart,
      flowType: formData.flowType,
      repairRequire: formData.repairRequire,
      yhLevel: formData.yhLevel,
      yhLevelNew: result.value.yhLevelNew,
    });
    if (!pResult) {
      checkRequest({ ...result.value, yhLevel: result.value.yhLevelNew });
    }
  };

  async function confirmPerson(data) {
    const result = await adjustFormRef.value?.submitForm();
    checkRequest({ ...result.value, ...data, yhLevel: result.value.yhLevelNew });
  }

  function checkRequest(data) {
    jnYhConfirmCheck({
      ...data,
      confirmId: formData.id,
    })
      .then((res) => {
        submitIng.value = false;
        router.replace({
          path: '/app/hiddenDangerNew/dangerAdminister/detail',
          query: { id: route.query.id, sourceType: route.query.sourceType },
        });
      })
      .catch(() => {
        submitIng.value = false;
      });
  }

  // 返回
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
