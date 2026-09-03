<!-- 隐患验收 -->
<template>
  <div class="hd-edit">
    <div class="main">
          <AdjustForm v-if="[1].includes(1)" :pageType="pageType" ref="adjustFormRef" />
      <van-collapse v-model="activeNames">
        <!-- <van-collapse-item title="确认信息" v-if="[1].includes(1)" name="0">
          <AdjustForm :pageType="pageType" ref="adjustFormRef" />
        </van-collapse-item> -->
        <van-form label-width="70px">
          <van-collapse-item title="隐患整改" name="3">
            <van-field v-model="formData.confirm.repairStatus" name="repairStatus" label="整改状态" placeholder="整改状态" />
            <StepDiv :logList="formData.confirm.logList" />
          </van-collapse-item>
          <van-collapse-item title="基本信息" name="1">
            <BasicInfo :readonly="true" :form-data="formData" />
          </van-collapse-item>
          <van-collapse-item title="隐患确认" name="2">
            <ConfirmInfo :form-data="formData" />
            <ConfirmLog v-if="formData.confirm.yhLevel > 1" :formData="formData" />
          </van-collapse-item>
        </van-form>
      </van-collapse>
    </div>

    <div class="foot">
      <van-button :loading="loading" @click="goBack" plain>取消</van-button>
      <van-button :loading="loading" @click="submitFn" type="primary">提交</van-button>
    </div>
  </div>
</template>

<script setup lang="ts">
  /**
   *
   * @param pageType 1：隐患确认处理按钮，2：隐患确认卡片；3：隐患整改按钮，4：隐患整改卡片；5：隐患验收按钮，6：隐患验收卡片
   */
  import { showSuccessToast } from 'vant';
  import { ref, reactive, watch } from 'vue';
  import { useRouter, useRoute } from 'vue-router';
  import StepDiv from '../../components/stepDiv.vue';
  import AdjustForm from '../components/adjustForm.vue';
  import BasicInfo from '../../components/basicInfo.vue';
  import ConfirmLog from '../../components/confirmLog.vue';
  import ConfirmInfo from '../../components/confirnInfo.vue';
  import { getFileAccessHttpUrl } from '/@/utils/common/compUtils';
  import { jnYhSspDetail, jnYhConfirmCheck, jnYhPlanExecuteItemDetail } from '../../index.api';

  const activeNames = ref(['0']);
  const route = useRoute();
  const router = useRouter();
  const loading = ref<boolean>(false);
  const submitIng = ref<boolean>(false);

  const pageType = ref(route.query.pageType);
  const formData = reactive({});
  const adjustFormRef = ref<HTMLElement | null>(null);
  let pageName = ref(route.name);
  watch(route, (newRoute) => {
    pageName.value = newRoute.name;
  });

  pageInit();
  async function pageInit() {
    if (route.query.sourceType == 1) {
      loading.value = true;
      jnYhPlanExecuteItemDetail({ id: route.query.id }).then((res) => {
        loading.value = false;
        splitImg(res);
        Object.assign(formData, res);
        if(res.confirm.currentNode < 41 || res.confirm.currentNode > 47){
          router.replace({
            path: '/app/hiddenDanger/dangerAdminister/detail',
            query: { id: route.query.id, sourceType: route.query.sourceType  },
          });
        }
      });
    } else {
      loading.value = true;
      jnYhSspDetail({ id: route.query.id }).then((res) => {
        loading.value = false;
        splitImg(res);
        Object.assign(formData, res);
        if(res.confirm.currentNode < 41 || res.confirm.currentNode > 47){
          router.replace({
            path: '/app/hiddenDanger/dangerAdminister/detail',
            query: { id: route.query.id, sourceType: route.query.sourceType  },
          });
        }
      });
    }
  }

  function reviewData(res) {
    console.log(res);
    
  }

  function splitImg(res) {
    if (res.confirm.yhPicture) {
      let arr = res.confirm.yhPicture.split(',').map((item) => getFileAccessHttpUrl(item));
      res.yhPicture = arr;
    }
    if (res.confirm.repairPicture) {
      let arr = res.confirm.repairPicture.split(',').map((item) => getFileAccessHttpUrl(item));
      res.repairPicture = arr;
    }
  }

  // 处理提交
  const submitFn = async () => {
    const result = await adjustFormRef.value?.submitForm();
    console.log(result);

    jnYhConfirmCheck({
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
            query: { id: route.query.id, sourceType: route.query.sourceType  },
          });
        // }, 300);
      })
      .catch(() => {
        submitIng.value = false;
      });
  };
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
