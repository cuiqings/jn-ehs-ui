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
            <van-field readonly v-model="formData.orgName" type="text" name="orgName" label="检查范围" />
            <van-field readonly v-model="formData.taskTimeStart" type="text" name="taskTimeStart" label="任务时间">
              <template #input> {{ formData.taskTimeStart }} - {{ formData.taskTimeEnd }} </template>
            </van-field>
            <van-field readonly v-model="formData.checkPersonName" type="text" name="checkPersonName" label="检查人" />
          </van-collapse-item>
          <van-collapse-item title="检查项" name="3">
            <div class="ex-result" v-for="(item, idx) in formData.itemList" :key="'c' + idx">
              <div class="ex-inner">
                <span class="label">{{ idx + 1 }}</span>
                <div
                  class="projectinfo"
                  v-if="formData.checkType == '3' || formData.checkType == '4' || formData.checkType == '5' || formData.checkType == '6'"
                >
                  <div><label>检查内容及标准：</label>{{ item.contentStandard }}</div>
                </div>
                <div class="projectinfo" v-if="formData.checkType == '7'">
                  <div><label>违法行为描述：</label>{{ item.illegalDesc }}</div>
                  <div><label>判定情形：</label>{{ item.illegalBasis }}</div>
                </div>
                <div class="projectinfo" v-if="formData.checkType == '8'">
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
    <div class="foot">
      <van-button :loading="loading" @click="passClick" type="primary" block>开始检查</van-button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, watch } from 'vue';
  import { useRouter, useRoute } from 'vue-router';
  import { specialSetRange } from '../index.api';
  import { filterDictTextByCache } from '/@/utils/dict/JDictSelectUtil';
  const activeNames = ref(['1']);
  const route = useRoute();
  const router = useRouter();
  const formData = reactive({
    plan: {},
    planType: '',
    itemList: [],
    task: {},
    signPicture: null,
  });
  let pageName = ref(route.name);

  const loading = ref(true);

  getDetail();
  function getDetail() {
    specialSetRange({
      id: route.query.id,
      org: route.query.orgCode,
    })
      .then((res) => {
        console.log('res', res);
        Object.assign(formData, res);
        if (formData.status > 0) {
          router.replace({ path: '/app/hiddenManage/specialTasks/detail', query: { id: route.query.id, orgCode: route.query.orgCode } });
        }
        loading.value = false;
        // pageInit();
      })
      .catch((err) => (loading.value = false));
  }
  watch(route, (newRoute) => {
    pageName.value = newRoute.name;
  });

  // 通过
  const passClick = () => {
    router.replace({ path: '/app/hiddenManage/specialTasks/executeTask', query: { id: route.query.id, orgCode: route.query.orgCode } });
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
