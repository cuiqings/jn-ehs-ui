<template>
  <div class="gas">
    <!-- <span class="title">气体检测分析：</span> -->
    <div class="list" v-for="item in workAnalysisList" :key="item.analysisTime">
      <div v-if="workType == '2'"><span>位置：</span> {{ item.analysisSite }}</div>
      <div v-if="workType == '2'"><span>取样时间：</span> {{ item.analysisTime }}</div>
      <div v-if="workType == '2'" class="bk"><span>氧含量：</span> {{ item.oxygenContent }} %</div>
      <div v-if="workType == '2'" class="bk"><span>一氧化碳：</span> {{ item.carbonMonoxide }} ppm</div>
      <div v-if="workType == '2'" class="bk"><span>可燃气体：</span> {{ item.gas }} %LEL</div>
      <div v-if="workType == '2'" class="bk"><span>硫化氢：</span> {{ item.toxicHarmfulMedia }} ppm</div>
      <div v-if="workType == '2'" class="bk"><span>其它：</span> {{ item.otherGas }}</div>

      <div v-if="workType == '3'"><span style="width: 100px">动火分析时间：</span> {{ item.analysisTime }}</div>
      <div v-if="workType == '3'" class="bk"><span>采样地点：</span> {{ item.analysisSite }}</div>
      <div v-if="workType == '3'" class="bk"><span>分析数据：</span> {{ item.analysisData }} ppm</div>
      <div class="al-sign-wrap"><span>分析人：</span>
        <img v-if="item.sign" class="al-sign" :src="getFileAccessHttpUrl(item.sign)" />
        <span v-else>{{ item.analyst }}</span>
      </div>
    </div>
    <template v-if="nodeInfo" v-for="item in nodeInfo.examineInfoItemList">
      <van-field label-align="left" label="现场监护人:">
        <template #input>
          <div>
            {{ item.operatorName }}
            <div class="sign-wrap"> <img :src="getFileAccessHttpUrl(item.sign)" /> </div
          ></div>
        </template>
      </van-field>
    </template>
  </div>
</template>

<script lang="ts" setup>
  import { getFileAccessHttpUrl } from '/@/utils/common/compUtils';
  import { useRoute } from 'vue-router';
  const route = useRoute();
  const props = defineProps({
    workAnalysisList: {
      type: Array,
      default: () => [],
    },
    workType: {
      type: String,
      default: '',
    },
    nodeInfo: {
      type: Object,
      default: () => {},
    },
  });
</script>

<style lang="less" scoped>
  .gas {
    padding: 10px 16px;
    background-color: #ffffff;
    .list {
      margin-top: 5px;
      background-color: #f5f5f5;
      padding: 5px 10px;
      div {
        line-height: 22px;
        span {
          display: inline-block;
          width: 70px;
          text-align: right;
          color: #323233;
        }
      }
    }
    .title {
      color: #1890ff;
    }
  }
  .bk {
    word-break: break-all;
  }
  .al-sign-wrap {
    display: flex;
    .al-sign {
      width: 120px;
    }
  }
</style>
