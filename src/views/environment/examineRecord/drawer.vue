<template>
  <BasicDrawer v-bind="$attrs" @register="registerDrawer" title="查看" :width="1200" show-footer :show-ok-btn="false" destroyOnClose>
    <a-row :gutter="24" class="examineRecord">
      <a-col class="gutter-row" :span="8">
        <div class="flex">
          <div class="label"> 计划名称：</div>
          <a-input v-model:value="info.checkPlanName" disabled />
        </div>
      </a-col>
      <a-col class="gutter-row" :span="8">
        <div class="flex">
          <div class="label"> 检查频率：</div>
          <a-input v-model:value="info.checkFrequency" disabled />
        </div>
      </a-col>
      <a-col class="gutter-row" :span="8">
        <div class="flex">
          <div class="label"> 检查单位：</div>
          <a-input v-model:value="info.organizationName" disabled />
        </div>
      </a-col>
    </a-row>
    <a-row :gutter="24" class="examineRecord">
      <a-col class="gutter-row" :span="8">
        <div class="flex">
          <div class="label"> 检查状态：</div>
          <a-input v-model:value="info.isOverdue" disabled />
        </div>
      </a-col>
      <a-col class="gutter-row" :span="8">
        <div class="flex">
          <div class="label"> 上次检查时间：</div>
          <a-input v-model:value="info.lastCheckTime" disabled />
        </div>
      </a-col>
      <a-col class="gutter-row" :span="8">
        <div class="flex">
          <div class="label"> 检查异常：</div>
          <a-input v-model:value="info.abnormalNum" disabled />
        </div>
      </a-col>
    </a-row>
    <p style="color: #1890ff" v-if="resultData.length > 0">检查记录</p>
    <a-collapse v-model:activeKey="activeKey" v-if="resultData.length > 0">
      <a-collapse-panel v-for="(item, index) in resultData" :key="index">
        <template #header>
          <div>
            <span>检查时间：{{ item.checkTime }}</span>
            <span style="margin-left: 40px">检查人：{{ item.checkUserPost ? item.checkUserPost + '-' + item.checkUser : item.checkUser }}</span>
            <span :class="item.bs === '1' ? 'abnormal' : item.bs === '2' ? 'atn' : ''" style="margin-left: 40px" v-if="item.bs !== '0'"
              >异常：{{ item.abnormalNum }}</span
            ><span v-if="item.bs === '2'" class="atn">（已处理）</span>
          </div>
        </template>
        <a-table :columns="columns" :data-source="item.jnEnvironmentalCheckRecordSubList" bordered :pagination="false">
          <template #checkResult="{ record }">
            <span v-if="record.checkResult === '0'">正常</span>
            <span v-else style="color: red"> 异常</span>
          </template>
          <template #checkPhoto="{ record }">
            <img
              v-if="record.checkPhoto"
              :src="fmtImg(record)"
              style="cursor: pointer; display: inline-block; width: 40px; height: 40px"
              @click="openImg(record)"
            />
            <span v-if="!record.checkPhoto">无</span>
          </template>
        </a-table>
      </a-collapse-panel>
    </a-collapse>
  </BasicDrawer>
</template>
<script lang="ts" name="examineRecord-drawer" setup>
  import useDrawer from './hooks/useDrawer';
  const { BasicDrawer, registerDrawer, activeKey, columns, fmtImg, openImg, info, resultData } = useDrawer();
</script>
<style lang="less" scoped>
  .examineRecord {
    .flex {
      display: flex;
      justify-content: space-between;
      margin-bottom: 24px;
      .label {
        width: 150px;
        line-height: 30px;
        text-align: right;
      }
    }
  }

  .abnormal {
    color: red;
  }
  .atn {
    color: rgb(100, 153, 14);
  }
</style>
