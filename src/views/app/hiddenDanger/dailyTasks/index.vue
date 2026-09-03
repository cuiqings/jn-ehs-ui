<!-- 审批任务 -->
<template>
  <div class="hd-edit">
    <div class="main">
      <van-form label-width="100px">
        <van-collapse v-model="activeNames">
          <van-collapse-item title="基本信息" name="1">
            <van-field readonly v-model="formData.orgName" name="orgName" label="所属机构" />
            <van-field readonly v-model="formData.departName" name="departName" label="所属部门" />
            <van-field readonly v-model="formData.plan.planType" name="planType" label="计划类型">
              <template #input>{{ { 1: '长期计划', 2: '临时计划' }[formData.plan.planType] }}</template>
            </van-field>
            <van-field readonly v-model="formData.checkTypeName" type="tel" name="checkTypeName" label="检查类型" />
            <van-field readonly v-model="formData.plan.planName" type="text" name="planName" label="计划名称" />
            <van-field readonly v-model="formData.plan.checkCycleName" type="text" name="checkCycleName" label="巡检周期" />
            <van-field readonly v-model="formData.plan.approveRoleName" type="text" name="approveRoleName" label="计划审批角色" />
            <van-field readonly v-model="formData.plan.executeRoleName" type="text" name="executeRoleName" label="执行角色" />
            <van-field readonly v-model="formData.plan.superviseRoleName" type="text" name="superviseRoleName" label="监督人" />
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
              <!-- <span class="label">{{ idx + 1 }}</span>
              <div style="flex: 1">
                <van-field readonly v-model="item.itemTypeName" type="text" name="itemTypeName" label="检查项分类" />
                <van-field readonly v-model="item.itemName" name="itemName" type="text" label="检查项" />
                <van-field readonly
                  v-model="item.checkContent"
                  name="repairExplain"
                  autosize
                  type="textarea"
                  label="检查内容/方法"
                />
                <van-field readonly v-model="item.checkStandard" name="checkStandard" autosize type="textarea" label="检查标准" />
                <van-field readonly v-model="item.pictureFlag" name="pictureFlag" label="检查照片">
                  <template #input>
                    {{ { 0: '非必填', 1: '必填' }[item.pictureFlag] }}
                  </template>
                </van-field>
              </div> -->
            </div>
          </van-collapse-item>
        </van-collapse>
      </van-form>
    </div>
    <div class="foot">
      <van-button :loading="loading" @click="passClick" type="primary" block>开始检查</van-button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, watch } from 'vue';
  import { useRouter, useRoute } from 'vue-router';
  import { jnYhPlanExecuteDetailZX } from '../index.api';
  import { useUserStore } from '/@/store/modules/user';

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
    itemList: []
  });
  let pageName = ref(route.name);

  const userStore: any = useUserStore();
  const yh_inspection_cycleList = userStore.getAllDictItems.yh_inspection_cycle;
  const check_sortList = userStore.getAllDictItems.check_sort;

  const loading = ref(true);

  jnYhPlanExecuteDetailZX({
    id: route.query.id,
  }).then((res) => {
    Object.assign(formData, res);
    if(formData.status > 0){
      router.replace({ path: '/app/hiddenDanger/dailyTasks/detail', query: { id: formData.id } });
    }
    loading.value = false;
    pageInit();
  }).catch(err => loading.value = false);
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
    router.replace({ path: '/app/hiddenDanger/dailyTasks/executeTask', query: { id: route.query.id } });
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
</style>
