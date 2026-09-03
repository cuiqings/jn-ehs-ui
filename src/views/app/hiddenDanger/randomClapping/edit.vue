<!-- 随手拍处理 -->
<template>
  <div class="hd-edit">
    <div class="main">
      <CurLoading v-if="loading" />
      <van-collapse v-model="activeNames">
        <van-collapse-item
          title="确认信息"
          v-if="['AppHiddenDangerCancel', 'AppHiddenDangerConfirm', 'AppDangerAdministerCancel', 'AppDangerAdministerConfirm'].includes(route.name)"
          name="0"
        >
          <Undanger :formData="formData" ref="cancelRef" v-if="['AppHiddenDangerCancel', 'AppDangerAdministerCancel'].includes(route.name)" />
          <ConfirmDanger :formData="formData" ref="confirmRef" v-if="['AppHiddenDangerConfirm', 'AppDangerAdministerConfirm'].includes(route.name)" />
        </van-collapse-item>
        <van-form label-width="70px">
          <van-collapse-item title="基本信息" name="1">
            <BasicInfo :readonly="true" :formData="formData" />
          </van-collapse-item>
          <van-collapse-item v-if="route.query.pageType != 1 && (formData.repairPicture || formData.repairExplain)" title="隐患整改" name="2">
            <DisInfo :readonly="true" :formData="formData" />
            <ConfirmLog v-if="formData.confirm.yhLevel == 3" :formData="formData" />
          </van-collapse-item>
        </van-form>
      </van-collapse>
    </div>

    <div class="foot" v-if="['AppHiddenDangerEdit', 'AppDangerAdministerEdit'].includes(route.name)">
      <van-button
        @click="deleteItem"
        plain
        type="danger"
        v-if="canHandle && formData.confirm.yhLevel != 3 && ['AppHiddenDangerEdit'].includes(route.name)"
        >删除</van-button
      >
      <van-button
        v-if="canHandle && formData.confirm.yhLevel != 3"
        @click="goPage('/app/hiddenDanger/randomClapping/edit/undanger', 1)"
        type="primary"
        >非隐患</van-button
      >
      <van-button v-if="canHandle" @click="goPage('/app/hiddenDanger/randomClapping/edit/confirmDanger', 2)" type="primary">确认隐患</van-button>
    </div>
    <div class="foot" v-else>
      <van-button :loading="submitIng" @click="goBack" plain>取消</van-button>
      <van-button :loading="submitIng" @click="submitFn" type="primary">确认</van-button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { showImagePreview } from 'vant';
  import { ref, reactive, watch, computed } from 'vue';
  import DisInfo from '../components/disInfo.vue';
  import Undanger from './components/undanger.vue';
  import { useRouter, useRoute } from 'vue-router';
  import CurLoading from '../components/loading.vue';
  import BasicInfo from '../components/basicInfo.vue';
  import ConfirmLog from '../components/confirmLog.vue';
  import { showSuccessToast, showConfirmDialog } from 'vant';
  import ConfirmDanger from './components/confirmDanger.vue';
  import { getFileAccessHttpUrl } from '/@/utils/common/compUtils';
  import { jnYhSspDetail, jnYhSspDelete, jnYhConfirmHandle, jnYhPlanExecuteItemDetail } from '../index.api';

  interface IFormData {
    confirm: any;
  }

  const activeNames = ref(['1', '2']);
  const route = useRoute();
  const router = useRouter();
  const loading = ref(false); // 页面加载动画
  const submitIng = ref(false); // 提交按钮动画
  const formData: IFormData = reactive({
    confirm: {},
    yhPicture: '',
    repairPicture: '',
    yhDescription: '',
    repairExplain: '',
    reporterName: '',
    reporterPhone: '',
    depart: '',
    departName: '',
  });
  const cancelRef = ref<InstanceType<typeof Undanger> | null>(null);
  const confirmRef = ref<InstanceType<typeof ConfirmDanger> | null>(null);
  let pageName = ref<string>(route.name);
  watch(route, (newRoute) => {
    pageName.value = newRoute.name;
    if (['AppHiddenDangerCancel', 'AppHiddenDangerConfirm', 'AppDangerAdministerCancel', 'AppDangerAdministerConfirm'].includes(pageName.value)) {
      activeNames.value.unshift('0');
    }
  });

  pageInit();
  function pageInit() {
    if (route.query.sourceType == '1') {
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
      jnYhSspDetail({ id: route.query.id })
        .then((res) => {
          splitImg(res);
          Object.assign(formData, res);
          loading.value = false;
        })
        .catch(() => (loading.value = false));
    }
  }

  function splitImg(res) {
    if (!res.departName) res.departName = res.orgName;
    if (res.yhPicture) {
      let arr = res.yhPicture.split(',').map((item) => getFileAccessHttpUrl(item));
      res.yhPicture = arr;
    }
    if (res.repairPicture) {
      let arr = res.repairPicture.split(',').map((item) => getFileAccessHttpUrl(item));
      res.repairPicture = arr;
    }
  }

  // 删除
  const deleteItem = () => {
    showConfirmDialog({
      title: '删除',
      message: '是否确认删除，删除后不可恢复！',
    })
      .then(() => {
        jnYhSspDelete({ id: route.query.id, flag: '1' }).then((res) => {
          // showSuccessToast({ message: '删除成功！', duration: 300 });
          // setTimeout(() => {
            router.back();
          // }, 300);
        });
      })
      .catch((err) => {
        console.log(err);
      });
  };
  // 处理提交
  const submitFn = async () => {
    console.log(pageName.value);
    let url = '/app/hiddenDanger/randomClapping/detail';
    if (['AppDangerAdministerConfirm'].includes(pageName.value)) {
      url = '/app/hiddenDanger/dangerAdminister/detail';
    }
    console.log(url);

    let result = {};
    let handleResult = 0;
    if (['AppHiddenDangerCancel', 'AppDangerAdministerCancel'].includes(pageName.value)) {
      handleResult = 1;
      result = await cancelRef.value?.submitForm();
    }
    if (['AppHiddenDangerConfirm', 'AppDangerAdministerConfirm'].includes(pageName.value)) {
      handleResult = 2;
      result = await confirmRef.value?.submitForm();
    }

    submitIng.value = true;
    jnYhConfirmHandle({
      ...result,
      handleResult: handleResult,
      id: formData.confirm.id,
    })
      .then((res) => {
        submitIng.value = false;
        console.log(res);
        // showSuccessToast({ message: '提交成功！', duration: 300 });
        setTimeout(() => {
          let url = '/app/hiddenDanger/randomClapping/detail';
          if (['AppDangerAdministerCancel', 'AppDangerAdministerConfirm'].includes(pageName.value)) {
            url = '/app/hiddenDanger/dangerAdminister/detail';
          }
          router.replace({
            path: url,
            query: { id: route.query.id, sourceType: route.query.sourceType },
          });
        }, 300);
      })
      .catch(() => {
        submitIng.value = false;
      });
  };

  // 图片预览
  const preview = (idx, list) => {
    showImagePreview({
      images: list,
      startPosition: idx,
    });
  };

  // 页面跳转
  const goPage = (path, tag?) => {
    if (route.name == 'AppDangerAdministerEdit') {
      if (tag == 1) {
        path = '/app/hiddenDanger/dangerAdminister/edit/undanger';
      } else {
        path = '/app/hiddenDanger/dangerAdminister/edit/confirmDanger';
      }
    }

    router.replace({ path, query: { id: route.query.id, sourceType: route.query.sourceType } });
  };
  const goBack = () => {
    router.back();
  };
  // 判断是否有处理权限
  const canHandle = computed(() => {
    if (route.query.hasOwnProperty('canHandle')) {
      return route.query.canHandle == 'true';
    } else {
      return true;
    }
  });
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
