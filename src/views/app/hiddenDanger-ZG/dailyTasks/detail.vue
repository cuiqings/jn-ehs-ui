<!-- 巡检计划-执行完成 -->
<template>
  <div class="hd-edit">
    <div class="main">
      <CurLoading v-if="loading" />
      <van-form label-width="100px">
        <van-collapse v-model="activeNames">
          <van-collapse-item title="基本信息" name="1">
            <!-- <van-field readonly v-model="formData.orgName" name="orgName" label="所属机构" />
            <van-field v-model="formData.departName" name="departName" label="所属部门" />
            <van-field v-model="formData.plan.planType" name="planType" label="计划类型">
              <template #input>{{ { 1: '长期计划', 2: '临时计划' }[formData.plan.planType] }}</template>
            </van-field>
            <van-field v-model="formData.plan.checkTypeName" type="tel" name="checkTypeName" label="检查类型" />
            <van-field v-model="formData.plan.planName" type="text" name="planName" label="计划名称" />
            <van-field v-model="formData.plan.checkCycleName" type="text" name="checkCycleName" label="巡检周期" />
            <van-field v-model="formData.plan.approveRoleName" type="text" name="approveRoleName" label="计划审批角色" />
            <van-field v-model="formData.plan.executeRoleName" type="text" name="executeRoleName" label="执行角色" />
            <van-field v-model="formData.plan.superviseRoleName" type="text" name="superviseRoleName" label="监督人" /> -->
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
            <van-field readonly v-model="formData.checkPersonName" type="text" name="checkPersonName" label="检查人" />
            <van-field readonly v-model="formData.checkTime" type="text" name="checkTime" label="检查时间" />
          </van-collapse-item>
          <van-collapse-item title="检查记录" name="2">
            <van-field readonly v-model="formData.status" name="checkTime" label="处理结果">
              <template #input>{{ { 0: '未检查', 1: '已检查', 2: '已超时', 3: '空班' }[formData.status] }}</template>
            </van-field>
            <van-field readonly v-model="formData.realExecutePersonName" name="checkUserName" label="处理人" />
            <van-field readonly v-model="formData.realCheckTime" name="checkUserName" label="处理时间" />
          </van-collapse-item>
          <van-collapse-item title="检查项" name="3">
            <div class="ex-result" v-for="(item, idx) in formData.itemList" :key="'c' + idx">
              <div class="ex-inner">
                <span class="label">{{ idx + 1 }}</span>
                <div class="projectinfo">
                  <div><label>风险ID：</label>{{ item.riskId }}</div>
                  <div><label>区域位置（单元）：</label>{{ item.rgLcName }}</div>
                  <div><label>风险名称：</label>{{ item.riskName }}</div>
                  <div><label>检查照片：</label>{{ { 0: '非必填', 1: '必填' }[item.pictureFlag] }}</div>
                  <!-- <div><label>风险ID：</label>{{ item.riskId }}</div>
                  <div><label>区域位置（单元）：</label>{{ item.rgLcName }}</div>
                  <div><label>风险名称：</label>{{ item.riskName }}</div>
                  <div><label>排查方法：</label>{{ filterDictTextByCache('ht_check_type', item.checkMethod) }}</div>
                  <div><label>检查结果：</label>{{ item.checkResult == 1 ? '合格' : '不合格' }}</div>
                  <div><label>问题描述：</label>{{ item.problemDescription }}</div>
                  <div><label>检查照片：</label>{{ { 0: '非必填', 1: '必填' }[item.pictureFlag] }}</div>
                  <div><label>整改后照片：</label>{{ item.repairPicture }}</div> -->
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
                <van-field
                  readonly
                  label-width="60"
                  v-model="item.problemDescription"
                  name="problemDescription"
                  autosize
                  type="textarea"
                  label="问题描述"
                />
                <div class="myfield">
                  <div class="labe">检查照片</div>
                  <div class="img-wrap">
                    <van-image
                      v-for="(picitem, index) in splitImg(item.checkPicture)"
                      @click.stop="preview(index, splitImg(item.checkPicture))"
                      :key="index"
                      width="100"
                      height="100"
                      :src="picitem"
                    />
                  </div>
                </div>
                <div class="myfield">
                  <div class="label">整改照片</div>
                  <div class="img-wrap">
                    <van-image
                      v-for="(picitem, index) in splitImg(item.repairPicture)"
                      @click.stop="preview(index, splitImg(item.repairPicture))"
                      :key="index"
                      width="100"
                      height="100"
                      :src="picitem"
                    />
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
  import { skYhPlanQueryById } from '../index.api';
  import { getDictItemsByCode } from '/@/utils/dict';
  import CurLoading from '../components/loading.vue';
  import { filterDictTextByCache } from '/@/utils/dict/JDictSelectUtil';

  const activeNames = ref(['1']);
  const route = useRoute();
  const loading = ref(false);
  const formData = reactive<{
    plan: any;
    itemList: any[];
  }>({ plan: {}, itemList: [] });

  const getDetail = () => {
    loading.value = true;
    skYhPlanQueryById({
      id: route.query.id,
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
    background-color: #1989fa;
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
