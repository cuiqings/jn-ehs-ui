<!-- 随手拍处理 -->
<template>
  <div class="hd-edit">
    <div class="main">
      <CurLoading v-if="loading" />
      <van-collapse v-model="activeNames">
        <van-collapse-item
          title="确认信息"
          v-if="
            ['AppHiddenDangerCancelNew', 'AppHiddenDangerConfirmNew', 'AppDangerAdministerCancelNew', 'AppDangerAdministerConfirmNew'].includes(
              route.name
            )
          "
          name="0"
        >
          <Undanger :formData="formData" ref="cancelRef" v-if="['AppHiddenDangerCancelNew', 'AppDangerAdministerCancelNew'].includes(route.name)" />
          <ConfirmDanger
            :formData="formData"
            ref="confirmRef"
            v-if="['AppHiddenDangerConfirmNew', 'AppDangerAdministerConfirmNew'].includes(route.name)"
          />
        </van-collapse-item>
        <van-form label-width="70px">
          <van-collapse-item title="基本信息" name="1">
            <EditPage
              @submitSuccess="submitSuccess"
              ref="editPageRef"
              v-if="(['11', '12'].includes(formData.currentNode) || (formData.flowType == 2 && formData.currentNode == 21)) && canHandle"
            />
            <BasicInfo ref="basicInfoRef" v-else :readonly="true" :formData="formData" />
          </van-collapse-item>
          <van-collapse-item title="隐患确认" name="2" v-if="formData.confirmLogList && formData.confirmLogList.length > 0">
            <van-steps direction="vertical" :active="1">
              <template v-for="item in formData.confirmLogList">
                <van-step>
                  <h3>{{ item.handleTime }}</h3>
                  <p class="active-text" v-if="item.node">{{ item.handlerOrgName }}>{{ item.handlerName }}</p>
                  <p class="active-text" v-if="item.node">确认结果： {{ { 1: '确认', 2: '退回', 3: '加签' }[item.confirmResult] }}</p>
                  <p class="active-text" v-if="item.node && item.confirmResult == 2">确认说明：{{ item.confirmBackReason }}</p>
                </van-step>
              </template>
            </van-steps>
          </van-collapse-item>
          <van-collapse-item v-if="route.query.pageType != 1 && (formData.repairPicture || formData.repairExplain)" title="隐患整改" name="3">
            <!-- <DisInfo :readonly="true" :formData="formData" /> -->
            <StepDiv :logList="formData.repairLogList" />
            <ConfirmLog v-if="formData.confirm.yhLevel == 3" :formData="formData" />
          </van-collapse-item>
        </van-form>
      </van-collapse>
    </div>

    <div class="foot" v-if="['AppHiddenDangerEditNew', 'AppDangerAdministerEditNew'].includes(route.name)">
      <van-button
        @click="deleteItem"
        plain
        type="danger"
        v-if="canHandle && formData.confirm.yhLevel != 3 && ['AppHiddenDangerEditNew'].includes(route.name)"
        >删除</van-button
      >
      <!-- <van-button v-if="canHandle" :loading="submitIng" @click="goBack" plain>取消</van-button> -->
      <van-button
        v-if="
          canHandle &&
          ['21', '22', '23'].includes(formData.currentNode) &&
          ((['1', '3'].includes(formData.flowType) && ((formData.yhLevel == 1 && formData.repairRequire == 2) || formData.yhLevel == 2)) ||
            (['2'].includes(formData.flowType) && formData.yhLevel == 2 && ['22', '23', '24'].includes(formData.currentNode)))
        "
        @click="returnShow = true"
        type="danger"
        >退回</van-button
      >
      <van-button
        v-if="canHandle && (['23'].includes(formData.currentNode) || (['22'].includes(formData.currentNode) && formData.flowType == '1'))"
        @click="tagShow = true"
        type="warning"
        >加签</van-button
      >
      <van-button v-if="canHandle && ['11', '21'].includes(formData.currentNode)" @click="goPage(2)" type="primary">{{btnText}}</van-button>
      <van-button v-if="canHandle && ['22', '23', '24'].includes(formData.currentNode)" @click="goPage(2)" type="primary">{{ btnText }}</van-button>
      <van-button v-if="canHandle && ['12'].includes(formData.currentNode)" @click="resubmit" type="primary">重新提交</van-button>
    </div>
    <div class="foot" v-else>
      <!-- <van-button :loading="submitIng" @click="goBack" plain>取消</van-button> -->
      <van-button :loading="submitIng" @click="submitFn" type="primary">确认</van-button>
    </div>

    <!-- 退回弹窗 -->
    <van-dialog v-model:show="returnShow" title="确认退回" :before-close="beforeClose" @confirm="confirmReturn" show-cancel-button>
      <van-form ref="returnRef">
        <van-field
          label-align="top"
          required
          name="confirmBackReason"
          autosize
          v-model="confirmBackReason"
          type="textarea"
          label="退回原因"
          :maxlength="100"
          placeholder="请输入退回原因"
          :rules="[{ required: true, message: '请输入退回原因' }]"
        />
      </van-form>
    </van-dialog>
    <!-- 加签 -->
    <van-dialog v-model:show="tagShow" title="加签" :before-close="beforeCloseAdd" show-cancel-button>
      <van-form ref="confirmTagRef">
        <van-field
          required
          v-model="addPersonName"
          is-link
          readonly
          name="addPersonName"
          label=" "
          label-width="0"
          placeholder="请选择"
          @click="tagPersonShow = true"
          :rules="[{ required: true, message: '请选择' }]"
        />
      </van-form>
    </van-dialog>
    <van-popup v-model:show="tagPersonShow" position="bottom">
      <van-picker
        :columns-field-names="{ text: 'realname', value: 'id' }"
        :columns="personList"
        @confirm="onConfirm"
        @cancel="tagPersonShow = false"
      />
    </van-popup>
    <PersonDialog ref="personDialogRef" @confirm="confirmPerson" />
  </div>
</template>

<script setup lang="ts">
  import { showImagePreview, showConfirmDialog } from 'vant';
  import { ref, reactive, watch, computed, onActivated } from 'vue';
  import Undanger from './components/undanger.vue';
  import { useRouter, useRoute } from 'vue-router';
  import CurLoading from '../components/loading.vue';
  import BasicInfo from '../components/basicInfo.vue';
  import ConfirmLog from '../components/confirmLog.vue';
  import ConfirmDanger from './components/confirmDanger.vue';
  import { getFileAccessHttpUrl } from '/@/utils/common/compUtils';
  import { jnYhSspDetail, jnYhSspDelete, jnYhConfirmHandle, handleYh, getUserListByRole } from '../index.api';
  import PersonDialog from '../components/personDialog.vue';
  import EditPage from '../components/edit.vue';
  import StepDiv from '../components/stepDiv.vue';

  const personDialogRef = ref<HTMLElement | null>(null);
  const basicInfoRef = ref<InstanceType<typeof BasicInfo> | null>(null);
  const activeNames = ref(['1', '2']);
  const route = useRoute();
  const router = useRouter();
  const loading = ref(false); // 页面加载动画
  const submitIng = ref(false); // 提交按钮动画
  const formData = reactive<any>({
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
  const confirmBackReason = ref('');
  const btnText = ref('提交');

  // 加签弹框
  const addPerson = ref('');
  const addPersonName = ref('');
  const tagShow = ref(false);
  const confirmTagRef = ref<InstanceType<typeof ConfirmDanger> | null>(null);
  const tagPersonShow = ref(false);
  const personList = ref<any[]>([]);
  // 加签
  const onConfirm = (val) => {
    addPersonName.value = val.selectedOptions[0].realname;
    addPerson.value = val.selectedOptions[0].id;
    tagPersonShow.value = false;
  };

  const beforeCloseAdd = async (c) => {
    let res = false;
    if (c == 'confirm') {
      await confirmTagRef.value
        ?.validate()
        .then(async () => {
          return handleYh({
            confirmId: route.query.id,
            addPerson: addPerson.value,
            confirmResult: 3,
          }).then((val) => {
            res = true;
            router.replace({
              path: '/app/hiddenDangerNew/dangerAdminister/detail',
              query: { id: route.query.id, sourceType: route.query.sourceType },
            });
          });
        })
        .catch(() => (res = false));
      confirmBackReason.value = '';
      tagPersonShow.value = false;
    } else {
      res = true;
    }
    return res;
  };
  getUserListByRole({
    roleCode: 'branch_leader',
  }).then((res) => {
    personList.value = res;
  });

  let pageName = ref<string>(route.name);
  watch(route, (newRoute) => {
    pageName.value = newRoute.name;
    if (
      ['AppHiddenDangerCancelNew', 'AppHiddenDangerConfirmNew', 'AppDangerAdministerCancelNew', 'AppDangerAdministerConfirmNew'].includes(
        pageName.value
      )
    ) {
      activeNames.value.unshift('0');
    }
  });

  onActivated(() => {
    console.log('进入了');
    
  })

  pageInit();
  function pageInit() {
    loading.value = true;
    jnYhSspDetail({ id: route.query.id })
      .then((res) => {
        splitImg(res);
        Object.assign(formData, res);
        loading.value = false;
        if(
          (formData.yhLevel == '1' && formData.flowType == '1' && formData.repairRequire == '2') ||
          (formData.yhLevel == '2' && formData.flowType == '1') ||
          (formData.yhLevel == '1' && formData.flowType == '3' && formData.repairRequire == '2')
        ){
          btnText.value = '确认下发'
        }
      })
      .catch(() => (loading.value = false));
  }

  watch(() => route.query.canHandle, () => {
    pageInit();
  })

  function splitImg(res) {
    if (!res.departName) res.departName = res.orgName;
    if (res.yhPicture) {
      res.yhPictureo = res.yhPicture;
      let arr = res.yhPicture.indexOf(',') > -1 ? res.yhPicture.split(',').map((item) => getFileAccessHttpUrl(item)) : [getFileAccessHttpUrl(res.yhPicture)];
      res.yhPicture = arr;
    }
    if (res.repairPicture) {
      res.repairPictureo = res.repairPicture;
      let arr = res.repairPicture.indexOf(',') > -1 ? res.repairPicture.split(',').map((item) => getFileAccessHttpUrl(item)) : [getFileAccessHttpUrl(res.repairPicture)];
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
          router.back();
        });
      })
      .catch((err) => {
        console.log(err);
      });
  };
  // 处理提交
  const submitFn = async () => {
    console.log(pageName.value);
    let url = '/app/hiddenDangerNew/randomClapping/detail';
    if (['AppDangerAdministerConfirm'].includes(pageName.value)) {
      url = '/app/hiddenDangerNew/dangerAdminister/detail';
    }

    let result: any = {};
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
        setTimeout(() => {
          let url = '/app/hiddenDangerNew/randomClapping/detail';
          if (['AppDangerAdministerCancel', 'AppDangerAdministerConfirm'].includes(pageName.value)) {
            url = '/app/hiddenDangerNew/dangerAdminister/detail';
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

  const editPageRef = ref(null);
  const resubmit = () => {
    editPageRef.value?.onSubmit();
  };

  // 图片预览
  const preview = (idx, list) => {
    showImagePreview({
      images: list,
      startPosition: idx,
    });
  };

  // 页面跳转
  const goPage = async () => {
    await getEditData()
    if (['1', '2', '3'].includes(formData.flowType) && ['11','21', '22', '23', '24'].includes(formData.currentNode)) {
      if (['11', '12'].includes(formData.currentNode) || (formData.flowType == 2 && formData.currentNode == 21)) {
        let data = await editPageRef.value?.getFormData();
        Object.assign(formData, data);
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
        let data = await editPageRef.value?.getFormData();
        showConfirmDialog({
          title: '提示',
          message: '是否确认？',
        })
          .then((res) => {
            if (res == 'confirm') {
              handleYh({
                ...data,
                confirmId: route.query.id,
                confirmResult: 1,
                ...getEditData()
              }).then((res) => {
                router.replace({
                  path: '/app/hiddenDangerNew/dangerAdminister/edit',
                  query: { id: route.query.id, sourceType: route.query.sourceType, canHandle: 'false' },
                });
              });
            }
          })
          .catch((err) => {
            console.log(err);
          });
      }
    }
  };

  const submitSuccess = () => {
    // pageInit();
    router.replace({
      path: '/app/hiddenDangerNew/dangerAdminister/edit',
      query: { id: route.query.id, sourceType: route.query.sourceType, canHandle: 'false' },
    });
  };

  const confirmPerson = async (data) => {
    let params = {
      ...formData,
      confirmId: route.query.id,
      confirmResult: 1,
      ...data,
      ...(await getEditData()),
      ...(await editPageRef.value?.getFormData()),
    }
    if(params.repairPictureo){
      params.repairPicture = params.repairPictureo
    }
    params.yhPicture = params.yhPictureo;
    delete params.id;
    handleYh(params).then((res) => {
      router.replace({
        path: '/app/hiddenDangerNew/dangerAdminister/edit',
        query: { id: route.query.id, sourceType: route.query.sourceType, canHandle: false },
      });
    });
  };

  const goBack = () => {
    router.back();
  };

  const getEditData = () => {
    let obj = basicInfoRef.value?.getFormData();
    if (!obj) return {};
    return obj;
  };

  // 判断是否有处理权限
  const canHandle = computed(() => {
    if (route.query.hasOwnProperty('canHandle')) {
      return route.query.canHandle == 'true';
    }
    return false;
  });

  // 退回
  const returnShow = ref(false);
  const returnRef = ref(null);
  const beforeClose = async (c) => {
    let res = false;
    if (c == 'confirm') {
      await returnRef.value
        ?.validate()
        .then(async () => {
          return handleYh({
            confirmId: route.query.id,
            confirmBackReason: confirmBackReason.value,
            confirmResult: 2,
          }).then((val) => {
            res = true;
            router.replace({
              path: '/app/hiddenDangerNew/dangerAdminister/detail',
              query: { id: route.query.id, sourceType: route.query.sourceType },
            });
          });
        })
        .catch(() => (res = false));
      confirmBackReason.value = '';
      console.log(res);
    } else {
      res = true;
    }
    return res;
  };
  const confirmReturn = () => {};
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
  .active-text {
    color: #1989fa;
  }
  .gary {
    color: #9a9b9b;
  }
  .gary-text {
    color: #9a9b9b !important;
  }
  * {
    --van-field-input-disabled-text-color: #9a9b9b;
    --van-field-disabled-text-color: #9a9b9b;
  }
</style>
