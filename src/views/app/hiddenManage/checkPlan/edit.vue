<!-- 审批任务 -->
<template>
  <div class="hd-edit">
    <div class="main">
      <van-form label-width="100px">
        <van-collapse v-model="activeNames">
          <van-collapse-item title="基本信息" name="1">
            <van-field readonly v-model="formData.planName" type="text" name="planName" label="计划名称" />
            <van-field readonly label="排查周期">
              <template #input>
                {{ filterDictTextByCache('sk_check_cycle', formData.checkCycle) }}
              </template>
            </van-field>
            <van-field readonly v-model="formData.checkDutyPersonName" type="text" name="checkDutyPersonName" label="排查责任人" />
            <van-field name="useFlag" label="计划状态">
              <template #input>
                <van-radio-group :disabled="pageType == 'detail'" v-model="formData.useFlag" direction="horizontal">
                  <van-radio name="0">停用</van-radio>
                  <van-radio name="1">启用</van-radio>
                </van-radio-group>
              </template>
            </van-field>
            <van-field name="remindNoExecute" label="未执行提醒">
              <template #input>
                <van-radio-group v-model="formData.remindNoExecute" :disabled="pageType == 'detail'" direction="horizontal">
                  <van-radio name="0">不需要提醒</van-radio>
                  <van-radio name="1">需要提醒</van-radio>
                </van-radio-group>
              </template>
            </van-field>
            <van-field v-if="formData.remindNoExecute == '1'" name="remindApp" label=" ">
              <template #input>
                <van-checkbox disabled shape="square" v-model="formData.remindApp" :checked="formData.remindApp === '1'">APP</van-checkbox>
              </template>
            </van-field>
          </van-collapse-item>
          <!-- <van-collapse-item title="检查记录" name="2">
              <van-field readonly v-model="formData.checkPersonName" type="text" name="checkPersonName" label="检查人" />
              <van-field readonly v-model="formData.checkTime" type="text" name="checkTime" label="检查时间" />
            </van-collapse-item> -->
          <van-collapse-item title="排查项目" name="3">
            <div class="ex-result" v-for="(item, idx) in formData.planItemList" :key="'c' + idx">
              <div class="ex-inner">
                <span class="label">{{ idx + 1 }}</span>
                <div class="projectinfo">
                  <div><label>所属单位：</label>{{ item.orgName }}</div>
                  <div><label>所属车间：</label>{{ item.departName }}</div>
                  <div><label>辨识单元：</label>{{ item.recogUnit }}</div>
                  <div><label>风险部位：</label>{{ item.riskName }}</div>
                  <div><label>风险失控表现：</label>{{ item.riskFactor }}</div>
                </div>
              </div>
            </div>
          </van-collapse-item>
        </van-collapse>
      </van-form>
    </div>
    <div class="foot" v-if="pageType == 'edit'">
      <van-button :loading="loading" @click="editClick" type="primary" block>提交</van-button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive } from 'vue';
  import { useRouter, useRoute } from 'vue-router';
  import { checkPlanDetail, setEmpty, editPlan } from '../index.api';
  import { useUserStore } from '/@/store/modules/user';
  import { filterDictTextByCache } from '/@/utils/dict/JDictSelectUtil';
  const activeNames = ref(['1', '3']);
  const route = useRoute();
  const router = useRouter();
  const formData = reactive({});

  const userStore: any = useUserStore();
  const yh_inspection_cycleList = userStore.getAllDictItems.yh_inspection_cycle;
  const check_sortList = userStore.getAllDictItems.check_sort;

  const loading = ref(true);
  const pageType = ref(route.query.pageType || 'detail');

  getDetail();
  function getDetail() {
    checkPlanDetail({
      id: route.query.id,
    })
      .then((res) => {
        Object.assign(formData, res);
        loading.value = false;
        //   pageInit();
      })
      .catch((err) => (loading.value = false));
  }

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

  // 编辑
  const editClick = () => {
    // 提交
    console.log('edit',formData);
    editPlan(formData).then((res) => {
      router.replace({ path: '/app/hiddenManage/checkPlan' });
    });
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
