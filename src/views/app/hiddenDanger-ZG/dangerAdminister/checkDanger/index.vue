<!-- 隐患整改 -->
<template>
  <div class="hd-edit">
    <div class="main">
      <CurLoading v-if="loading" />
      <van-collapse v-model="activeNames">
        <van-collapse-item title="隐患整改" v-if="['1', '3', '5'].includes(pageType)" name="0">
          <AdjustForm :pageType="pageType" :infoData="formData" ref="adjustFormRef" />
        </van-collapse-item>
        <van-form label-width="70px">
          <van-collapse-item title="基本信息" name="1">
            <BasicInfo :readonly="true" :formData="formData" />
          </van-collapse-item>
          <van-collapse-item title="隐患确认" name="2">
            <!-- <ConfirnInfo :readonly="true" :formData="formData" /> -->
            <ConfirmLog :formData="formData" />
          </van-collapse-item>
          <van-collapse-item title="隐患整改" name="3">
            <van-field v-model="formData.repairStatus" name="repairStatus" label="整改状态">
              <template #input>
                {{ { 1: '确认退回', 2: '确认中', 3: '整改中', 4: '待验收', 5: '验收中', 6: '验收通过' }[formData.yhStatus] }}
              </template>
            </van-field>
            <StepDiv :logList="formData.repairLogList" :yhLevel="formData.yhLevel" />
          </van-collapse-item>
        </van-form>
      </van-collapse>
    </div>

    <div class="foot" v-if="pageType == '4'">
      <van-button v-if="canHandle" @click="goPage('/app/hiddenDangerNew/dangerAdminister/checkDanger', { pageType: '3' })" type="primary"
        >整改反馈</van-button
      >
    </div>
    <div class="foot" v-else-if="pageType == '6'">
      <van-button v-if="canHandle" @click="goPage('/app/hiddenDangerNew/dangerAdminister/checkAccept', { pageType: '5' })" type="primary"
        >验收审核</van-button
      >
    </div>
    <div class="foot" v-else>
      <van-button v-show="canHandle" :loading="submitIng" @click="goBack" plain>取消</van-button>
      <van-button v-show="canHandle" :loading="submitIng" @click="submitFn" type="primary">提交</van-button>
    </div>
    <PersonDialog ref="personDialogRef" @confirm="confirmPerson" />
  </div>
</template>

<script setup lang="ts">
  /**
   *
   * @param pageType 1：隐患确认处理按钮，2：隐患确认卡片；3：隐患整改按钮，4：隐患整改卡片；5：隐患验收按钮，6：隐患验收卡片
   */
  import { jnYhSspDetail, jnYhConfirmRepair, jnYhPlanExecuteItemDetail } from '../../index.api';
  import { getFileAccessHttpUrl } from '/@/utils/common/compUtils';
  import PersonDialog from '../../components/personDialog.vue';
  import ConfirmLog from '../../components/confirmLog.vue';
  import BasicInfo from '../../components/basicInfo.vue';
  import CurLoading from '../../components/loading.vue';
  import AdjustForm from '../components/adjustForm.vue';
  import StepDiv from '../../components/stepDiv.vue';
  import { useRouter, useRoute } from 'vue-router';
  import { ref, reactive, watch, computed } from 'vue';
  import { showFailToast } from 'vant';

  const personDialogRef = ref<HTMLElement | null>(null);
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
    }
    return false;
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
      // if(!res.canHandle){
      //   router.replace({
      //     path: '/app/hiddenDangerNew/dangerAdminister/detail',
      //     query: { id: route.query.id, sourceType: route.query.sourceType },
      //   });
      // }
      splitImg(res);
      Object.assign(formData, res);
    });
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
    if (['31'].includes(formData.currentNode) && formData.yhLevel == 2) {
      if (!result.value.tempMsr && !result.value.repairPicture) {
        showFailToast('临时措施和整改照片不能同时为空');
        return;
      }
    }
    if(formData.currentNode == 34 && formData.flowType == 1 && formData.yhLevel == 2){
      if(!formData.repairMsr && !formData.repairPicture){
        showFailToast('整改措施和整改照片至少一个不为空！')
        return
      }
    }
    let pResult = await personDialogRef.value?.getAssigneeData({
      currentNode: formData.currentNode,
      org: formData.org,
      depart: formData.depart,
      flowType: formData.flowType,
      repairRequire: formData.repairRequire,
      yhLevel: formData.yhLevel,
    });
    if (!pResult) {
      console.log(result);

      checkRequest(result.value);
    }
  };

  async function confirmPerson(data) {
    const result = await adjustFormRef.value?.submitForm();
    checkRequest({ ...result.value, ...data });
  }

  function checkRequest(data) {
    jnYhConfirmRepair({
      ...data,
      confirmId: formData.id,
    })
      .then((res) => {
        submitIng.value = false;
        console.log(res);
        router.replace({
          path: '/app/hiddenDangerNew/dangerAdminister/detail',
          query: { id: route.query.id, sourceType: route.query.sourceType },
        });
      })
      .catch(() => {
        submitIng.value = false;
      });
  }

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
