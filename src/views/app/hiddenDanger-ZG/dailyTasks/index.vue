<!-- 审批任务 -->
<template>
  <div class="hd-edit">
    <div class="main">
      <van-form label-width="100px">
        <van-collapse v-model="activeNames">
          <van-collapse-item title="基本信息" name="1">
            <van-field readonly v-model="formData.orgName" name="orgName" label="所属单位" />
            <van-field readonly v-model="formData.departName" name="departName" label="所属车间" />
            <van-field readonly v-model="formData.planName" type="text" name="planName" label="计划名称" />
            <van-field readonly label="巡检周期">
              <template #input>
                {{ filterDictTextByCache('sk_check_cycle', formData.checkCycle) }}
              </template>
            </van-field>
            <van-field readonly v-model="formData.checkDutyPersonName" type="text" name="checkDutyPersonName" label="责任人" />
            <van-field readonly v-model="formData.executePersonName" type="text" name="executePersonName" label="执行人" />
            <van-field readonly v-model="formData.remindNoExecute" type="text" name="remindNoExecute" label="未执行提醒">
              <template #input>{{ formData.remindNoExecute == 0 ? '不需要提醒' : '需要提醒' }}</template>
            </van-field>
          </van-collapse-item>
          <!-- <van-collapse-item title="检查记录" name="2">
            <van-field readonly v-model="formData.checkPersonName" type="text" name="checkPersonName" label="检查人" />
            <van-field readonly v-model="formData.checkTime" type="text" name="checkTime" label="检查时间" />
          </van-collapse-item> -->
          <van-collapse-item title="检查项" name="3">
            <div class="ex-result" v-for="(item, idx) in formData.itemList" :key="'c' + idx">
              <div class="ex-inner">
                <span class="label">{{ idx + 1 }}</span>
                <div class="projectinfo">
                  <div><label>风险ID：</label>{{ item.riskId }}</div>
                  <div><label>区域位置（单元）：</label>{{ item.rgLcName }}</div>
                  <div><label>风险名称：</label>{{ item.riskName }}</div>
                  <div><label>检查照片：</label>{{ { 0: '非必填', 1: '必填' }[item.pictureFlag] }}</div>
                  <!-- <div><label>排查方法：</label>{{ filterDictTextByCache('ht_check_type', item.checkMethod) }}</div>
                  <div><label>检查结果：</label>{{ item.checkResult == 1 ? '合格' : '不合格' }}</div>
                  <div><label>问题描述：</label>{{ item.problemDescription }}</div>
                  <div><label>整改后照片：</label>{{ item.repairPicture }}</div> -->
                </div>
              </div>
            </div>
          </van-collapse-item>
        </van-collapse>
      </van-form>
    </div>
    <div class="foot">
      <van-button v-if="formData.status == 0" :loading="loading" @click="restClick" type="default" style="margin-right: 16px" block>空班</van-button>
      <van-button :loading="loading" @click="passClick" type="primary" block>开始检查</van-button>
    </div>
    <!-- 退回弹窗 -->
    <van-dialog v-model:show="restShow" title="空班" :before-close="beforeClose" show-cancel-button>
      <div class="restmain">
        <div>是否确认下列计划空班？</div>
        <div><span>计划名称：</span>{{ formData.planName }}</div>
        <div><span>巡检周期：</span>{{ filterDictTextByCache('sk_check_cycle', formData.checkCycle) }}</div>
        <div><span>检查人：</span>{{ formData.executePersonName }}</div>
      </div>
    </van-dialog>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, watch } from 'vue';
  import { useRouter, useRoute } from 'vue-router';
  import { skYhPlanQueryById, setEmpty } from '../index.api';
  import { useUserStore } from '/@/store/modules/user';
  import { filterDictTextByCache } from '/@/utils/dict/JDictSelectUtil';

  interface IFormData {
    id?: string;
    org?: string;
    orgName?: string;
    departName?: string;
    planType: string;
    checkType?: string;
    checkTypeName?: string;
    planName?: string;
    checkCycle?: string;
    checkCycleName?: string;
    approveRoleName?: string;
    executeRoleName?: string;
    superviseRoleName?: string;
    itemList: any[];
    plan: any;
  }
  const activeNames = ref(['1']);
  const route = useRoute();
  const router = useRouter();
  const formData = reactive<IFormData>({
    plan: {},
    planType: '',
    itemList: [],
  });
  let pageName = ref(route.name);

  const userStore: any = useUserStore();
  const yh_inspection_cycleList = userStore.getAllDictItems.yh_inspection_cycle;
  const check_sortList = userStore.getAllDictItems.check_sort;

  const loading = ref(true);

  getDetail();
  function getDetail() {
    skYhPlanQueryById({
      id: route.query.id,
    })
      .then((res) => {
        Object.assign(formData, res);
        if (formData.status > 0) {
          router.replace({ path: '/app/hiddenDangerNew/dailyTasks/detail', query: { id: formData.id } });
        }
        loading.value = false;
        pageInit();
      })
      .catch((err) => (loading.value = false));
  }

  watch(route, (newRoute) => {
    pageName.value = newRoute.name;
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

  // 通过
  const passClick = () => {
    router.replace({ path: '/app/hiddenDangerNew/dailyTasks/executeTask', query: { id: route.query.id } });
  };
  // 空班
  const restShow = ref(false);
  const restClick = () => {
    restShow.value = true;
  };
  const beforeClose = async (str) => {
    if (str === 'confirm') {
      setEmpty([{ id: route.query.id }]).then((res) => {
        getDetail();
      });
      return true;
    }
    return true;
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
</style>
