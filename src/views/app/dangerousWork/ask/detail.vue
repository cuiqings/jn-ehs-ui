<template>
  <div class="hazardous-apply">
    <div class="hazardous-apply-main-nav">
      <van-tabs v-model:active="active" :before-change="beforeChange">
        <van-tab title="作业信息" :name="1">
          <div class="tab-inner">
            <WorkMain
              v-if="!loading"
              ref="componentRef"
              :tabidx="idx"
              v-for="(item, idx) in workList"
              :key="idx"
              :workIndex="idx"
              :workType="workType"
              :detailInfo="item"
            />
          </div>
        </van-tab>
        <van-tab title="审批流程" :name="2">
          <div class="tab-inner">
            <ApprovalProcess :workType="workType" :workGrade="workGrade" ref="approvalProcessRef" :detailInfo="workList[0]" />
          </div>
        </van-tab>
      </van-tabs>
    </div>
    <div class="footer" v-if="route.query.pageType != 'detail'">
      <van-button
        :loading="submiting"
        @click="addNewWork"
        v-if="[1, 2].includes(active) && !isUnhazardousWork"
        type="primary"
        size="small"
        color="#1f7cf8"
        >添加新作业类型</van-button
      >
      <van-button :loading="submiting" @click="save" v-if="[1, 2].includes(active)" type="primary" plain size="small" color="#1f7cf8"
        >保存</van-button
      >
      <van-button @click="next" type="primary" v-if="active == 1" size="small" color="#1f7cf8">下一步</van-button>
      <van-button @click="prev" type="primary" size="small" v-if="active == 2" color="#1f7cf8">上一步</van-button>
      <van-button :loading="submiting" @click="submit" type="primary" v-if="active == 2" size="small" color="#1f7cf8">提交</van-button>
    </div>
    <CurLoading v-if="loading" />
  </div>
</template>

<script setup lang="ts">
  import { getKeepJob, getWorkDetail, getModificationJob, addWork, queryIsHaveWork } from '../../../hazardousOperation/api/index';
  import { ref, reactive, nextTick, computed, onBeforeUnmount } from 'vue';
  import ApprovalProcess from './components/approvalProcess.vue';
  import { useWorkStore } from '/@/store/modules/dangerousWork';
  import { showFailToast, showConfirmDialog } from 'vant';
  import CurLoading from '../../components/loading.vue';
  import { useUserStore } from '/@/store/modules/user';
  import { useRoute, useRouter } from 'vue-router';
  import WorkMain from './workMain.vue';

  const workStore = useWorkStore();
  const workList = computed(() => workStore.getWorkList);
  const userStore: any = useUserStore();
  const loading = ref(false);
  const route = useRoute();
  const router = useRouter();
  const componentRef = ref<InstanceType<typeof WorkMain> | null>(null);
  const active = ref(1);
  const detailInfo = reactive({});
  const approvalProcessRef = ref();
  const workType = ref('1');
  const workGrade = ref('');
  const tabDisable = ref(true);
  const isUnhazardousWork = computed(() => {
    return route.name === 'AppUnhazardousWorkAddDetail';
  });

  workType.value = route.query.workType as string;
  // 获取作业详情
  if (route.query.id) {
    loading.value = true;
    getWorkDetail(route.query.id as string).then((res) => {
      if (res.operatorName && res.operatorName.includes('、')) {
        res.operatorName = res.operatorName.replace('、', ',');
      }
      Object.assign(detailInfo, res);
      workStore.setWorkList([initItem(res)]);
      if (res.otherWorkApply && res.otherWorkApply.length > 0) {
        res.otherWorkApply.forEach((item) => {
          workStore.updateWorkList(initItem(item));
        });
      }
      loading.value = false;
    });
  } else {
    nextTick(() => {
      // componentRef.value?.pageInit();
    });
  }

  function initItem(item) {
    let otherText = '';
    const possibleDanger = item.possibleDanger?.split(',').map((item) => {
      if (item.includes('其他伤害')) {
        otherText = item.split('-')[1];
        return item.split('-')[0];
      }
      return item;
    });
    if (item.securityMeasuresIds && item.securityMeasuresIds.length > 0) {
      item.securityMeasuresIds = item.securityMeasuresIds?.split(',').map((item) => item.toString());
    } else {
      item.securityMeasuresIds = [];
    }
    if (item.operatorName && item.operatorName.includes('、')) {
      item.operatorName = item.operatorName.replace('、', ',');
    }
    item.possibleDanger = possibleDanger;
    item.otherText = otherText;
    item.start = [item.startTimeStr, item.endTimeStr];
    item.workAnalysis = item.workAnalysisList;
    item.examineInfoList = item.examineInfoList && item.examineInfoList.length > 0 ? item.examineInfoList : [];
    item.reviewComments = '';
    item.operateMethod = item.operateMethod?.split(',');
    item.hoistingIdNumber = item.hoistingIdNumber?.split(',');
    item.hoistingCommander = item.hoistingCommander?.split(','); //@ts-ignore
    if (route.query.pageType == 'copy') {
      item.id = null;
      item.workApplyCode = null;
      item.state = 1;
      item.workState = 1;
      item.startTime = null;
      item.endTime = null;
      item.startTimeStr = null;
      item.endTimeStr = null;
      item.applicationUnit = userStore.getUserInfo.orgCode;
      item.applicantName = userStore.getUserInfo.realname;
      item.applicant = userStore.getUserInfo.id;
    }
    return item;
  }

  const beforeChange = (name) => {
    if (name == 2 && tabDisable.value) {
      return false;
    }
  };

  const addNewWork = () => {
    workStore.addWorkList();
  };

  // 下一步
  const next = () => {
    let promiseAll = [];
    workList.value.forEach((_, idx) => {
      promiseAll.push(componentRef.value[idx].submitForm());
    });
    Promise.all(promiseAll)
      .then((_) => {
        console.log(_);
        tabDisable.value = false;
        active.value = 2;
        approvalProcessRef.value?.pageInit();
      })
      .catch((err) => {
        console.log(err);
        showFailToast(err);
      });
  };

  // 上一步
  const prev = () => {
    active.value = 1;
    console.log(workList.value);
  };
  const submiting = ref(false);
  // 作业 保存
  const save = async () => {
    submiting.value = true;
    let promiseAll = [];
    let workExamine = [];
    let formState: any = setSubmitData(workStore.getWorkList[0]);
    formState.otherWorkApply = [];
    workStore.getWorkList.slice(1, workStore.getWorkList.length).forEach((item) => {
      let data = Object.assign({}, item, { workExamine: [] });
      formState.otherWorkApply.push(setSubmitData(data));
    });
    if (approvalProcessRef.value) {
      workExamine = await approvalProcessRef.value.getFormData();
    }
    if (workExamine && workExamine.length >= 0) {
      workExamine = setWorkExamine(workExamine);
    }
    formState.workExamine = workExamine;
    if (route.query.pageType == 'copy') {
      formState.id = null;
      formState.workApplyCode = null;
      formState.state = 1;
      formState.workState = 1;
    }
    if (formState.id) {
      getModificationJob(formState)
        .then((res) => {
          submiting.value = false;
          loading.value = true;
          router.back();
        })
        .catch(() => (submiting.value = false));
    } else {
      getKeepJob(formState)
        .then((res) => {
          submiting.value = false;
          loading.value = true;
          router.back();
        })
        .catch(() => (submiting.value = false));
    }
  };

  const submit = async () => {
    let promiseAll = [];
    let workExamine = [];
    workList.value.forEach((_, idx) => {
      promiseAll.push(componentRef.value[idx].submitForm());
    });
    Promise.all(promiseAll).then(async (_) => {
      let formState: any = setSubmitData(workStore.getWorkList[0]);
      formState.otherWorkApply = [];
      workStore.getWorkList.slice(1, workStore.getWorkList.length).forEach((item) => {
        let data = Object.assign({}, item, { workExamine: [] });
        formState.otherWorkApply.push(setSubmitData(data));
      });
      workExamine = await approvalProcessRef.value.submitForm().catch((_) => (submiting.value = false));
      if (!workExamine || workExamine.length == 0) {
        showFailToast('请检查必填项后重试！');
        submiting.value = false;
        return;
      }
      if (workExamine && workExamine.length >= 0) {
        workExamine = setWorkExamine(workExamine);
      }
      if (route.query.pageType == 'copy') {
        formState.id = null;
        formState.workApplyCode = null;
        formState.state = 2;
        formState.workState = 1;
      }
      queryIsHaveWork({ userId: formState.sceneHead }).then((res) => {
        if (res) {
          showConfirmDialog({
            title: '提示',
            message: res,
            showCancelButton: false,
          });
        } else {
          submiting.value = true;
          addWork({ ...formState, workExamine })
            .then(async (_) => {
              submiting.value = false;
              await clearPhotoCache();
              if (isUnhazardousWork.value) {
                router.replace({ path: '/app/unhazardousWork/ask' });
                return;
              }
              router.replace({ path: '/app/dangerousWork/ask' });
            })
            .catch(() => (submiting.value = false));
        }
      });
    });
  };

  async function clearPhotoCache() {
    await Promise.all(componentRef.value?.map((item) => {
      console.log(item);
      
      item.clearPhotoCache()}) || []);
  }

  // 根据开关状态过滤审批节点
  function setWorkExamine(arr) {
    arr = arr.filter((item: any) => {
      let tag = item.hasOwnProperty('needNode') && !item.needNode ? false : true;
      return tag;
    });
    arr.forEach((item, idx) => (item.nodeNumber = idx));
    return arr;
  }
  // 格式化提交数据
  function setSubmitData(data) {
    if (data.possibleDanger && Array.isArray(data.possibleDanger)) {
      let idx = data.possibleDanger.indexOf('其他伤害');
      if (idx > -1 && Array.isArray(data.possibleDanger)) {
        data.possibleDanger[idx] = data.possibleDanger[idx] + '-' + data.otherText;
      }
      data.possibleDanger = data.possibleDanger.join(',');
    }
    if (data.annexUrl && Array.isArray(data.annexUrl)) data.annexUrl = data.annexUrl.join(',');
    if (data.otherSecurityMeasures2) {
      data.otherSecurityMeasures =
        (data.otherSecurityMeasures ? data.otherSecurityMeasures + '，' : data.otherSecurityMeasures) + data.otherSecurityMeasures2;
      data.otherSecurityMeasures2 = '';
    }
    if (data.securityMeasuresIds && Array.isArray(data.securityMeasuresIds)) {
      data.securityMeasuresIds = data.securityMeasuresIds.join(',');
    }
    if (data.hoistingIdNumber && Array.isArray(data.hoistingIdNumber)) {
      //@ts-ignore
      data.hoistingIdNumber = data.hoistingIdNumber.join(',');
    }
    if (route.query.pageType == 'copy') {
      data.otherSecurityMeasures = '';
      data.otherSecurityMeasuresAnnex = '';
      data.securityMeasuresIdList = [];
    }
    return data;
  }
  // 组件销毁，清除workList的数据
  onBeforeUnmount(() => {
    workStore.resetWorkList();
  });
</script>

<style lang="less" scoped>
  ::-webkit-scrollbar {
    display: none;
  }

  .hazardous-apply {
    width: 100%;
    height: 100%;
  }

  .tab-inner {
    height: calc(100vh - 88px);
    overflow-y: scroll;
    background: #ffffff;
    padding-bottom: 280px;
  }

  .hazardous-apply-main-nav {
    height: calc(100vh - 44px);
  }

  .footer {
    background-color: #ffffff;
    position: fixed;
    bottom: 0;
    width: 100%;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: space-around;
  }
</style>
