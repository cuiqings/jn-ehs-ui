<!-- 审批任务 -->
<template>
  <div class="hd-edit">
    <div class="main">
      <van-form label-width="70px">
        <van-collapse v-model="activeNames">
          <van-collapse-item title="基本信息" name="1">
            <van-field readonly v-model="formData.orgName" name="orgName" label="所属机构" />
            <van-field v-model="formData.departName" name="departName" label="所属部门" />
            <van-field v-model="formData.planType" name="planType" label="计划类型">
              <template #input>{{ { 1: '长期计划', 2: '临时计划' }[formData.planType] }}</template>
            </van-field>
            <van-field v-model="formData.checkTypeName" type="tel" name="checkTypeName" label="检查类型" />
            <van-field v-model="formData.planName" type="text" name="planName" label="计划名称" />
            <van-field v-model="formData.checkCycleName" type="text" name="checkCycleName" label="巡检周期" />
            <van-field label-width="110" v-model="formData.approveRoleName" type="text" name="approveRoleName" label="计划审批角色" />
            <van-field v-model="formData.executeRoleName" type="text" name="executeRoleName" label="执行角色" />
            <van-field v-model="formData.superviseRoleName" type="text" name="superviseRoleName" label="监督人" />
          </van-collapse-item>
          <van-collapse-item title="检查项" name="2">
            <div class="ex-result" v-for="(item, idx) in formData.itemList" :key="'c' + idx">
              <div class="ex-inner">
                <span class="label">{{ idx + 1 }}</span>
                <div class="projectinfo">
                  <div><label>检查项分类：</label>{{ item.itemTypeName }}</div>
                  <div><label>检查项：</label>{{ item.itemName }}</div>
                  <div><label>检查内容/方法：</label>{{ item.checkContent }}</div>
                  <div><label>检查标准：</label>{{ item.checkStandard }}</div>
                  <div><label>检查照片：</label>{{ { 0: '非必填', 1: '必填' }[item.pictureFlag] }}</div>
                </div>
              </div>
            </div>
          </van-collapse-item>
          <van-collapse-item title="计划审批" name="3" v-if="['AppHiddenDangerReturn', 'AppHiddenDangerPass'].includes(pageName)">
            <van-field readonly v-model="formData.reporterPhone" type="text" autosize name="reporterPhone" label="审批结果">
              <template #input>
                {{ { 1: '审批通过', 2: '审批退回:' + formData.backReason }[formData.planStatus] }}
              </template>
            </van-field>
            <van-field readonly v-model="formData.approvePeopleName" name="repairExplain" type="text" label="审批人" placeholder=" 审批人" />
            <van-field
              readonly
              v-model="formData.approveTime"
              name="repairExplain"
              autosize
              type="textarea"
              label="审批时间"
              placeholder="审批时间"
            />
          </van-collapse-item>
        </van-collapse>
      </van-form>
    </div>
    <van-dialog @confirm="dialogConfirm" v-model:show="dialogShow" :before-close="beforeClose" title="审批退回" show-cancel-button>
      <van-form ref="formRef">
        <van-field
          required
          v-model="backReason"
          name="backReason"
          type="textarea"
          placeholder="请输入退回原因"
          maxlength="200"
          :rules="[{ required: true, message: '请输入退回原因！' }]"
        ></van-field>
      </van-form>
    </van-dialog>
    <div class="foot" v-if="!['AppHiddenDangerReturn', 'AppHiddenDangerPass'].includes(pageName) && formData.planStatus == 0">
      <van-button :loading="loading" @click="dialogShow = true" type="warning">审批退回</van-button>
      <van-button :loading="loading" @click="passClick" type="primary">审批通过</van-button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, watch } from 'vue';

  import { showSuccessToast, showConfirmDialog, showFailToast } from 'vant';
  import { useRouter, useRoute } from 'vue-router';
  import { jnYhPlanExecuteDetail, approvalPlan } from '../index.api';
  import { getDictItemsByCode } from '/@/utils/dict';

  const activeNames = ref(['1']);
  const route = useRoute();
  const router = useRouter();
  const dialogShow = ref(false);
  const loading = ref(false);
  const backReason = ref('');
  const formRef = ref();
  const formData = reactive({
    org: '',
    orgName: '',
    departName: '',
    planType: '',
    checkType: '',
    checkTypeName: '',
    planName: '',
    checkCycle: '',
    checkCycleName: '',
    approveRoleName: '',
    executeRoleName: '',
    superviseRoleName: '',
  });
  let pageName = ref(route.name);

  getDetail();

  watch(route, (newRoute) => {
    pageName.value = newRoute.name;
    if (route.query.id) {
      getDetail();
    }
  });

  function getDetail() {
    jnYhPlanExecuteDetail({
      id: route.query.id,
    }).then((res) => {
      if (res.planStatus != 0) {
        router.replace({ path: '/app/hiddenDanger/approve/pass', query: { ...route.query } });
      }
      Object.assign(formData, res);
      pageInit();
    });
  }

  function pageInit() {
    Promise.all([
      getDictItemsByCode('yh_plan_check_type'), // 检查类型
      getDictItemsByCode('yh_inspection_cycle'), // 巡检周期
      getDictItemsByCode('check_sort'), // 检查项分类
    ]).then((res) => {
      if (res[2].length && res[2].length > 0) {
        res[2].map((val) => {
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

      if (res[1].length && res[1].length > 0) {
        res[1].map((val) => {
          if (val.value == formData.checkCycle) {
            formData.checkCycleName = val.text;
            return;
          }
        });
      }
    });
  }

  // 退回弹窗
  const dialogConfirm = () => {
    formRef.value.validate().then(() => {
      approvalPlanSend({
        planStatus: 2,
        id: formData.id,
        backReason: backReason.value,
      });
    });
  };

  const beforeClose = (e) => {
    if (e === 'confirm') {
      if (!backReason.value) return false;
    }
    return true;
  };

  // 通过
  const passClick = () => {
    showConfirmDialog({
      title: '审核通过',
      confirmButtonText: '通过',
      message: '请确认是否通过！',
    }).then(() => {
      approvalPlanSend({
        planStatus: 1,
        id: formData.id,
      });
    });
  };
  function approvalPlanSend(params) {
    loading.value = true;
    approvalPlan(params)
      .then(() => {
        loading.value = false;
        // showSuccessToast({ message: '审批成功！', duration: 300 });
        setTimeout(() => {
          router.replace({ path: '/app/hiddenDanger/approve/pass', query: { ...route.query } });
        }, 300);
      })
      .catch(() => (loading.value = false));
  }
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
            label {
              width: 80px;
              text-align: left;
            }
          }
        }
      }
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
  :deep(.van-collapse-item__content) {
    padding: 0 !important;
  }
  :deep(.van-collapse-item) {
    .van-collapse-item__title {
      .van-cell__title {
        color: #1989fa !important;
      }
    }
  }
</style>
