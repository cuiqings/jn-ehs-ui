<template>
  <div class="step-div">
    <van-steps direction="vertical" :active="0">
      <van-step v-for="item in logList" :key="item">
        <template v-if="item.checkResult">
          <h3>{{ item.handleTime }}</h3>
          <p class="active-text" v-if="item.node">{{ item.handlerOrgName }}>{{ item.handlerName }}</p>
          <p class="active-text" v-if="item.node">验收结果：{{ item.checkResult == '1' ? '验收通过' : '验收不通过' }}</p>
          <p class="active-text" v-if="item.node">处理说明：{{ item.handleExplain }}</p>
          <p class="active-text" v-if="item.node && item.handlePicture">
            <AppUpload :disabled="true" v-model:fileList="item.handlePicture" />
          </p>
        </template>
        <template v-else-if="item.repairResult">
          <h3>{{ item.handleTime }}</h3>
          <p class="active-text" v-if="item.node">{{ item.handlerOrgName }}>{{ item.handlerName }}</p>
          <p class="active-text" v-if="item.node"
            >整改情况：
            {{ item.repairResult == '1' ? '整改完成' : '整改中' }}
          </p>
          <p class="active-text" v-if="item.node">整改措施：{{ item.repairMsr }}</p>
          <p class="active-text" v-if="item.node && item.repairPicture"
            >整改照片：
            <AppUpload :disabled="true" v-model:fileList="item.repairPicture" />
          </p>
        </template>
        <template v-else>
          <h3>{{ item.handleTime }}</h3>
          <p v-if="item.node">{{ item.handlerOrgName }}>{{ item.handlerName }}</p>
          <p v-if="item.departDutyPersonName">车间责任人：{{ item.departDutyPersonName }}</p>
          <p v-if="item.teamDutyPersonName">班组责任人：{{ item.teamDutyPersonName }}</p>
          <p v-if="item.repairPersonName">整改人：{{ item.repairPersonName }}</p>
          
          <p v-if="item.repairMsr"
            >整改措施：{{ item.repairMsr }}
          </p>
          <p v-if="item.repairPlan"
            >整改方案：
            <AppCustomizeUpload :disabled="true" :maxCount="10" v-model:fileList="item.repairPlan" />
          </p>
          <p v-if="item.tempMsr">临时措施：{{ item.tempMsr }}</p>
          <p v-if="item.yhLevel">隐患等级：{{ item.yhLevel == 1 ? '一般' : '重大' }}</p>
          <p v-if="item.yhType">隐患分类：{{ item.yhType }}</p>
          <p v-if="item.yhTypeSub">子类：{{ item.yhTypeSub }}</p>
          <p v-if="item.node && item.repairPicture"
            >整改照片：
            <AppUpload :disabled="true" v-model:fileList="item.repairPicture" />
          </p>
          <p v-if="item.node && item.handleExplain">处理说明：{{ item.handleExplain }}</p>
          <p v-if="item.node && item.handlePicture">处理照片：<AppUpload :disabled="true" v-model:fileList="item.handlePicture" /></p>
        </template>
      </van-step>
    </van-steps>
  </div>
</template>

<script lang="ts" setup>
  import AppCustomizeUpload from '../../components/AppCustomizeUpload.vue';
  import AppUpload from '../../../../components/App/AppUpload.vue';
  import { getFileAccessHttpUrl } from '/@/utils/common/compUtils';
  import { showImagePreview } from 'vant';
  const props = withDefaults(
    defineProps<{
      logList: any[];
      yhLevel: string;
    }>(),
    {
      logList: () => [],
    }
  );
  const { logList } = props;
  const splitImg = (item: any) => {
    if (!item.picture) return [];
    let arr = item.picture.split(',').map((item) => getFileAccessHttpUrl(item));
    item.pictureList = arr;
  };
  logList.forEach((item) => {
    splitImg(item);
  });
  console.log(logList);

  // 图片预览
  const preview = (idx, list) => {
    showImagePreview({
      images: list,
      startPosition: idx,
    });
  };
</script>

<style lang="less" scoped>
  .step-div {
    padding: 0 15px;
    .tag {
      display: inline-block;
      width: 14px;
      height: 14px;
      border-radius: 7px;
      background-color: #ccc;
      position: absolute;
      left: -7px;
      top: 50%;
      transform: translateY(-50%);
    }
    .time-tit {
      height: 45px;
    }
    .main {
      position: relative;
    }
    .myfield {
      .van-field__value {
        max-width: 100%;
      }
    }
    .img-wrap {
      width: auto;
      height: 100px;
      display: flex;
      overflow-y: hidden;
      overflow-x: auto;
      // padding-bottom: 20px;
      // box-sizing: content-box;
      .van-image {
        flex-shrink: 0;
        width: 100px;
        margin: 0px 5px;
      }
    }
  }
  .explain-label {
    white-space: nowrap;
  }
</style>
