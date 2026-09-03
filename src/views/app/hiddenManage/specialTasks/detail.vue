<!-- 巡检计划-执行完成 -->
<template>
  <div class="hd-edit">
    <div class="main">
      <CurLoading v-if="loading" />
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
          <van-collapse-item title="检查记录" name="2">
            <van-field readonly v-model="formData.status" name="checkTime" label="处理结果">
              <template #input>{{ { 0: '未检查', 1: '已检查', 2: '已超时' }[formData.status] }}</template>
            </van-field>
            <van-field readonly v-model="formData.checkPersonName" name="checkUserName" label="处理人" />
            <van-field readonly v-model="formData.checkTime" name="checkUserName" label="处理时间" />
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
              <template v-if="formData.status != 3">
                <van-field readonly v-model="item.checkResult" type="text" label-width="60" name="reporterPhone" label="检查结果">
                  <template #input>
                    <span v-if="item.checkResult" :class="['checkResult', 'checkResult' + item.checkResult]">
                      {{ { 1: '合格', 2: '不合格', 3: '忽略' }[item.checkResult] }}
                    </span>
                  </template>
                </van-field>
                <div v-if="item.checkResult == 2">
                  <div v-for="(item1, idx1) in item.yhList" :key="idx1">
                    <div>
                      <van-cell title="隐患描述" :value="item1.yhDescription" />
                      <van-field name="checkPicture" label="检查照片">
                        <template #input>
                          <AppUpload :disabled="true" :fileList="item1.checkPicture" />
                        </template>
                      </van-field>
                      <van-cell title="隐患等级" value="一般" />
                      <van-cell title="隐患类别" :value="item1.yhType_dictText" />
                      <van-cell title="隐患子类别" :value="item1.yhTypeSub_dictText" />
                      <van-cell title="责任部门" :value="item1.dutyDepartName" />
                    </div>
                  </div>
                </div>
              </template>
            </div>
          </van-collapse-item>
        </van-collapse>
      </van-form>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive } from 'vue';
  import { getFileAccessHttpUrl } from '/@/utils/common/compUtils';
  import { showImagePreview } from 'vant';
  import { useRoute } from 'vue-router';
  import { specialSetRange } from '../index.api';
  import { getDictItemsByCode } from '/@/utils/dict';
  import CurLoading from '../components/loading.vue';
  import { filterDictTextByCache } from '/@/utils/dict/JDictSelectUtil';
  import AppUpload from '/@/components/App/AppUpload.vue';

  const activeNames = ref(['1']);
  const route = useRoute();
  const loading = ref(false);
  const formData = reactive<{
    plan: any;
    itemList: any[];
  }>({ plan: {}, itemList: [] });

  const getDetail = () => {
    loading.value = true;
    specialSetRange({
      id: route.query.id,
      org: route.query.orgCode,
    })
      .then((res) => {
        Object.assign(formData, res);
        pageInit();
        loading.value = false;
      })
      .catch(() => {
        loading.value = false;
      });
  };
  getDetail();
  

  // 统一处理图片src
  function splitImg(str) {
    if (!str) return [];
    let arr = str.split(',').map((item) => getFileAccessHttpUrl(item));
    return arr;
  }

  function pageInit() {
    Promise.all([
      getDictItemsByCode('check_sort'), // 检查项分类
      getDictItemsByCode('yh_plan_check_type'), // 检查类型
      getDictItemsByCode('yh_inspection_cycle'), // 巡检周期
    ]).then((res) => {
      if (res[0].length && res[0].length > 0) {
        res[0].map((val) => {
          if (val.value == formData.plan.checkType) {
            formData.plan.checkTypeName = val.text;
          }
          if (formData.itemList.length && formData.itemList.length > 0) {
            formData.itemList.map((item) => {
              if (item.itemType == val.value) {
                item['itemTypeName'] = val.text; // 初始化字典值
              }
            });
          }
        });
      }
      if (res[2].length && res[2].length > 0) {
        res[2].map((val) => {
          if (val.value == formData.plan.checkCycle) {
            formData.plan.checkCycleName = val.text;
            return;
          }
        });
      }
    });
  }

  // 图片预览
  const preview = (idx, list) => {
    showImagePreview({
      images: list,
      startPosition: idx,
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
            border: 1px solid #333333;
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
  :deep(.van-collapse-item__content) {
    padding: 0 !important;
  }
  .checkResult {
    display: inline-block;
    height: 20px;
    padding: 0 6px;
    color: #ffffff;
    line-height: 20px;
    background-color: #008000;
  }
  .checkResult2 {
    background-color: #ee0a24;
  }
  .checkResult3 {
    background-color: #989898;
  }
  :deep(.van-collapse-item) {
    .van-collapse-item__title {
      .van-cell__title {
        color: #1989fa !important;
      }
    }
  }
  .myfield {
    display: flex;
    padding: 16px;
    color: #323233;
    .label {
      width: 60px;
      margin-right: 12px;
    }
  }
  .img-wrap {
    flex: 1;
    height: auto;
    display: flex;
    overflow-y: hidden;
    overflow-x: auto;
    padding-bottom: 20px;
    box-sizing: content-box;
    .van-image {
      flex-shrink: 0;
      width: 100px;
      margin: 0px 5px;
    }
  }
</style>
