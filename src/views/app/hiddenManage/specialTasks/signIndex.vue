<!-- 审批任务 -->
<template>
  <div class="hd-edit">
    <div class="main">
      <van-form label-width="100px">
        <van-collapse v-model="activeNames">
          <van-collapse-item title="基本信息" name="1">
            <van-field readonly v-model="formData.checkType" name="checkType" label="检查类型">
              <template #input>
                {{ filterDictTextByCache('special_check_type', formData.checkType) }}
              </template>
            </van-field>
            <van-field readonly v-model="formData.taskName" name="taskName" label="任务名称" />
            <van-field readonly v-model="formData.orgNameRangeCurrent" type="text" name="orgNameRangeCurrent" label="检查范围" />
            <van-field readonly v-model="formData.taskTimeStart" type="text" name="taskTimeStart" label="任务时间">
              <template #input> {{ formData.taskTimeStart }} - {{ formData.taskTimeEnd }} </template>
            </van-field>
            <van-field readonly v-model="formData.checkPersonName" type="text" name="checkPersonName" label="检查人" />
          </van-collapse-item>
        </van-collapse>
        <div class="sign" v-show="handSignPicture">
          <Sign ref="signRef" v-model:value="handSignPictureUrl" :resetSign="false" @submit="submitSignHand" />
        </div>
        <div class="sign-button-center" v-if="!formData.signPicture && !handSignPicture">
          <a-button type="primary" @click="submitSign">签到</a-button>
        </div>
        <div class="sign-image-container" v-if="formData.signPicture">
          <img v-if="!handSignPicture" :src="formData.signPicture" alt="签名" class="sign-image" />
          <img v-else :src="handSignPictureUrl" alt="手写签名" class="sign-image" />
        </div>
      </van-form>
      <div class="sign-btn" v-if="formData.signPicture">
        <van-button
          style="margin-right: 10px; margin-bottom: 10px"
          type="primary"
          v-for="(item, idx) in columns"
          :class="{ 'disabled-button': checkedOrg.includes(item.orgCode) }"
          :key="'c' + idx"
          @click="onConfirm(item)"
          >{{ item.text }}</van-button
        >
      </div>
    </div>

    <!-- <div class="foot">
      <van-button v-if="formData.signPicture && formData.status == 0" :loading="loading" @click="passClick" type="primary" block>提交</van-button>
    </div> -->
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, watch, nextTick } from 'vue';
  import { useRouter, useRoute } from 'vue-router';
  import { specialTaskQueryById, specialTaskSubmit } from '../index.api';
  import { useUserStore } from '/@/store/modules/user';
  import { filterDictTextByCache } from '/@/utils/dict/JDictSelectUtil';
  import { get3DepartList } from '/@/api/common/api';
  import Sign from '/@/views/app/components/sign.vue';
  import { getFileAccessHttpUrl } from '/@/utils/common/compUtils';
  const activeNames = ref(['1']);
  const route = useRoute();
  const router = useRouter();
  const handSignPicture = ref(false);
  const handSignPictureUrl = ref('');
  const signRef = ref();

  interface PlanInfo {
    checkCycle?: string;
    checkCycleName?: string;
  }

  interface ColumnItem {
    text: string;
    orgCode: string;
    status: string;
  }

  const formData = reactive({
    plan: {} as PlanInfo,
    planType: '',
    itemList: [] as any[],
    itemMap: {},
    signPicture: undefined as string | undefined,
    status: 0,
    id: '',
    checkType: '',
    checkTypeName: '',
  });
  let pageName = ref(route.name);
  const columns = ref<ColumnItem[]>([]);
  const checkedOrg = ref([]);
  const userStore: any = useUserStore();
  const yh_inspection_cycleList = userStore.getAllDictItems.yh_inspection_cycle;
  const check_sortList = userStore.getAllDictItems.check_sort;

  const loading = ref(true);
  getDetail();
  function getDetail() {
    specialTaskQueryById({
      id: route.query.id,
    })
      .then((res) => {
        Object.assign(formData, res);
        if (res.checkedOrg) {
          checkedOrg.value = res.checkedOrg.split(',');
        }else{
          checkedOrg.value = [];
        }
        // 处理签名图片URL，确保是完整的HTTP地址
        if (formData.signPicture && !/^http/i.test(formData.signPicture)) {
          formData.signPicture = getFileAccessHttpUrl(formData.signPicture);
        }

        columns.value = [];
        let orgNameRangeCurrent = res.orgNameRangeCurrent.split(',');
        // 获取机构下拉数据
        getOrgList(orgNameRangeCurrent);
        // if (formData.status > 0) {
        //   router.replace({ path: '/app/hiddenManage/specialTasks/detail', query: { id: formData.id, orgCode: route.query.orgCode } });
        // }
        loading.value = false;
        // pageInit();
      })
      .catch((err) => (loading.value = false));
  }
  function getOrgList(orgNameRangeCurrent: string[]) {
    console.log('orgNameRangeCurrent', orgNameRangeCurrent);
    get3DepartList().then((res: any[]) => {
      //翻译orgNameRangeCurrent中机构的名字 并存储到columns中 格式要正确
      const tempColumns: ColumnItem[] = [];
      orgNameRangeCurrent.map((item) => {
        let org = formData.itemMap[item][0];
        console.log('org', org);
        if (org) {
          tempColumns.push({ text: org.orgName, orgCode: org.org, status: org.status });
        }
      });
      columns.value = tempColumns;
      console.log('columns', columns.value);
    });
  }
  watch(route, (newRoute) => {
    pageName.value = newRoute.name;
  });

  // 监听handSignPicture的变化，自动打开签名弹窗
  watch(handSignPicture, (newVal) => {
    if (newVal) {
      nextTick(() => {
        // 等待Sign组件渲染完成后，自动点击签名按钮
        const signButton = document.querySelector('.sign .van-button--primary');
        if (signButton) {
          (signButton as HTMLElement).click();
        }
      });
    }
  });

  function pageInit() {
    if (check_sortList.length && check_sortList.length > 0) {
      check_sortList.map((val) => {
        if (val.value == formData.checkType) {
          formData.checkTypeName = val.text;
        }
        if (formData.itemList.length && formData.itemList.length > 0) {
          formData.itemList.map((item) => {
            if (item.itemType == val.value) {
              item['itemTypeName'] = val.text;
            }
          });
        }
      });
    }

    if (yh_inspection_cycleList.length && yh_inspection_cycleList.length > 0) {
      yh_inspection_cycleList.map((val) => {
        if (val.value == formData.plan.checkCycle) {
          formData.plan.checkCycleName = val.text;
          return;
        }
      });
    }
  }

  // 监听formData.signPicture的变化
  // watch(
  //   () => formData.signPicture,
  //   (newVal) => {
  //     console.log('newVal', newVal);
  //     if (newVal) {
  //       submitSign(newVal);
  //       formData.signPicture = newVal;
  //     }
  //   },
  //   { deep: true }
  // );
  // 提交签名
  const submitSign = () => {
    console.log('submitSign');
    // 获取userStore.userInfo.signPicture
    let sign = userStore.userInfo.signature;
    console.log('userInfo sign', sign);
    if (sign) {
      // 处理签名URL，确保是完整的HTTP地址
      const signUrl = /^http/i.test(sign) ? sign : getFileAccessHttpUrl(sign);

      // 提交签名
      let params = {
        taskId: route.query.id,
        signPicture: sign,
      };
      specialTaskSubmit(params).then((res) => {
        console.log('res', res, formData.signPicture);
        formData.signPicture = signUrl;
      });
    } else {
      // 打开签名
      console.log('打开签名');
      handSignPicture.value = true;
    }
  };
  const submitSignHand = (sign) => {
    console.log('submitSignHand', sign);
    if (sign) {
      // 处理签名URL，确保是完整的HTTP地址
      const signUrl = /^http/i.test(sign) ? sign : getFileAccessHttpUrl(sign);
      handSignPictureUrl.value = signUrl;

      // 提交手写签名到后端
      let params = {
        taskId: route.query.id,
        signPicture: sign,
      };
      specialTaskSubmit(params)
        .then((res) => {
          console.log('手写签名提交成功', res);
          formData.signPicture = sign;
          handSignPicture.value = false; // 关闭手写签名组件
        })
        .catch((err) => {
          console.error('手写签名提交失败', err);
        });
    }
  };
  const onConfirm = (item) => {
    console.log('item orgCode', item.orgCode);
    router.replace({ path: '/app/hiddenManage/specialTasks/taskInfo', query: { id: route.query.id, orgCode: item.orgCode } });
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
      .ex-result {
        padding: 10px;
        .ex-inner {
          display: flex;
          padding-left: 16px;
          background: #eff1f5;
          align-items: center;
          border-radius: 4px;
          color: #333333;
          .label {
            width: 18px;
            height: 18px;
            border: 1px solid #999999;
            border-radius: 50%;
            text-align: center;
            line-height: 16px;
          }
          .van-cell {
            padding: 10px 5px;
          }
          .projectinfo {
            flex: 1;
            font-size: 14px;
            padding: 10px;
            line-height: 32px;
            color: #333333;
            label {
              width: 80px;
              text-align: left;
              font-weight: 600;
            }
          }
        }
      }
    }
    .foot {
      width: 100%;
      height: 55px;
      padding: 0 16px;
      position: fixed;
      bottom: 0;
      left: 0;
      background: #fff;
      display: flex;
      justify-content: center;
      align-items: center;
      border-top: 1px solid #f5f5f5;
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
  .restmain {
    font-size: 14px;
    padding: 10px 30px;
    line-height: 32px;
    color: #333;
    span {
      display: inline-block;
      width: 70px;
      color: #111;
    }
  }
  .sign-btn {
    padding: 10px;
  }
  .sign-button-center {
    padding: 10px;
    text-align: center;
  }
  .sign-image-container {
    padding: 10px;
    text-align: center;
  }
  .sign-image {
    display: inline-block;
    width: 150px;
    height: 100px;
    border: 1px solid #d9d9d9;
    border-radius: 4px;
    object-fit: contain;
    background: #fafafa;
  }
  .disabled-button {
    background: #f5f5f5;
    color: #666;
    border: 1px solid #e1e1e1;
  }
</style>
