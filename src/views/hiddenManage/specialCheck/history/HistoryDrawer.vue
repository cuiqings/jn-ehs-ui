<template>
  <BasicDrawer v-bind="$attrs" @register="registerDrawer" title="专项检查记录" width="1000px" destroyOnClose>
    <!-- 计划信息 -->
    <div class="info-wrapper">
      <div class="info">
        <div class="split-line"></div>
        <div class="info-title">基本信息</div>
      </div>
      <div class="info-content">
        <div style="display: flex">
          <div class="item">
            <div class="item-title">检查类型：</div>
            <div class="item-content">{{ filterDictTextByCache('special_check_type', historyData.checkType) }}</div>
          </div>
        </div>
        <div style="display: flex">
          <div class="item">
            <div class="item-title">任务名称：</div>
            <div class="item-content">{{ historyData.taskName }}</div>
          </div>
          <div class="item">
            <div class="item-title">检查范围：</div>
            <div class="item-content">{{ historyData.orgNameRange }}</div>
          </div>
        </div>
        <div style="display: flex">
          <div class="item">
            <div class="item-title">任务时间：</div>
            <div class="item-content">{{ historyData.taskTimeStart }} ~ {{ historyData.taskTimeEnd }}</div>
          </div>
          <div class="item">
            <div class="item-title">检查人：</div> <div class="item-content">{{ historyData.checkPersonName }}</div></div
          >
        </div>
      </div>
    </div>
    <div class="info-wrapper">
      <div class="info">
        <div class="split-line"></div>
        <div class="info-title">签到记录</div>
      </div>
      <div class="info-content" v-if="signList.length > 0">
        <div v-for="(item, idx) in signList" :key="'c' + idx" class="sign-item">
          <span style="display: inline-block; margin-right: 10px; font-weight: 500; color: #1890ff">{{ item.signByName }}</span> 签到时间：{{
            item.signTime
          }}
          <img style="display: inline-block; margin-left: 20px; width: 50px; height: 30px" :src="item.signPicture" alt="" />
        </div>
      </div>
      <div v-else>
        <a-empty description="暂无签到记录" />
      </div>
    </div>
    <!-- 检查记录 -->
    <div class="info-wrapper" style="margin-bottom: 20px">
      <div>
        <div class="info">
          <div class="split-line"></div>
          <div class="info-title">检查记录</div>
        </div>
        <div v-if="mapKeys.length > 0">
          <a-tabs v-model:activeKey="activeOrgName" type="card" @change="changeTab">
            <a-tab-pane v-for="item in mapKeys" :key="item" :tab="item">
              <div class="org-item">
                <!-- <div class="org-name">{{ item }}</div> -->
                <div class="info-content" v-for="(item1, idx1) in currentTabList" :key="'c' + idx1">
                  <div style="display: flex">
                    <div class="item">
                      <div class="item-title">检查人：</div>
                      <div class="item-content">{{ item1.checkPersonName }}</div>
                    </div>
                    <div class="item">
                      <div class="item-title">检查时间：</div>
                      <div class="item-content">{{ item1.checkTime }}</div>
                    </div>
                  </div>
                  <a-table
                    v-if="item1.checkType == '3' || item1.checkType == '4' || item1.checkType == '5' || item1.checkType == '6'"
                    :columns="checkColumns"
                    :dataSource="item1.itemListForShow"
                    :pagination="false"
                    bordered
                  >
                    <template #checkPicture="{ record }">
                      <img
                        v-if="record.checkPicture"
                        :src="fmtImg(record)"
                        style="cursor: pointer; display: inline-block; width: 40px; height: 40px"
                        @click="openImg(record)"
                      />
                      <span v-if="!record.checkPicture"></span>
                    </template>
                    <template #repairPicture="{ record }">
                      <img
                        v-if="record.repairPicture"
                        :src="fmtImg1(record)"
                        style="cursor: pointer; display: inline-block; width: 40px; height: 40px"
                        @click="openImg1(record)"
                      />
                      <span v-if="!record.repairPicture"></span>
                    </template>
                  </a-table>
                  <a-table v-if="item1.checkType == '7'" :columns="checkColumns1" :dataSource="item1.itemListForShow" :pagination="false" bordered>
                    <template #checkPicture="{ record }">
                      <img
                        v-if="record.checkPicture"
                        :src="fmtImg(record)"
                        style="cursor: pointer; display: inline-block; width: 40px; height: 40px"
                        @click="openImg(record)"
                      />
                      <span v-if="!record.checkPicture"></span>
                    </template>
                    <template #repairPicture="{ record }">
                      <img
                        v-if="record.repairPicture"
                        :src="fmtImg1(record)"
                        style="cursor: pointer; display: inline-block; width: 40px; height: 40px"
                        @click="openImg1(record)"
                      />
                      <span v-if="!record.repairPicture"></span>
                    </template>
                  </a-table>
                  <a-table v-if="item1.checkType == '8'" :columns="checkColumns2" :dataSource="item1.itemListForShow" :pagination="false" bordered>
                    <template #checkPicture="{ record }">
                      <img
                        v-if="record.checkPicture"
                        :src="fmtImg(record)"
                        style="cursor: pointer; display: inline-block; width: 40px; height: 40px"
                        @click="openImg(record)"
                      />
                      <span v-if="!record.checkPicture"></span>
                    </template>
                  </a-table>
                </div> </div></a-tab-pane
          ></a-tabs>
        </div>
        <div v-else>
          <a-empty description="暂无检查记录" />
        </div>
      </div>
    </div>
  </BasicDrawer>
</template>
<script lang="ts" setup>
  import { ref } from 'vue';
  import { BasicDrawer, useDrawerInner } from '/src/components/Drawer';
  import { getTaskDetail, getResultsByOrgName } from './history.api';
  import { filterDictTextByCache } from '/@/utils/dict/JDictSelectUtil';
  import { checkColumns, checkColumns1, checkColumns2 } from './history.data';
  import { getFileAccessHttpUrl } from '/@/utils/common/compUtils';
  import { createImgPreview } from '/@/components/Preview/index';
  const riskData = ref([]);
  const historyData = ref({});
  const signList = ref([]);
  const itemMap = ref({});
  const mapKeys = ref<string[]>([]);
  const activeOrgName = ref('');
  const currentTabList = ref([]);
  const emit = defineEmits(['register', 'success']);
  const [registerDrawer, { setDrawerProps, closeDrawer }] = useDrawerInner(async (data) => {
    setDrawerProps({ confirmLoading: false });
    // 查详情by id
    let res = await getTaskDetail({ id: data.record.id });
    historyData.value = res;
    riskData.value = res.itemList;
    signList.value = res.signList;
    // signList里面的signPicture如果没有http的话增加http，有的话就不拼接了
    signList.value.forEach((item) => {
      if (!item.signPicture.includes('http')) {
        item.signPicture = getFileAccessHttpUrl(item.signPicture);
      }
    });
    itemMap.value = res.itemMap;
    mapKeys.value = Object.keys(itemMap.value);
    activeOrgName.value = mapKeys.value[0];
    // 根据key调用后台接口查询检查记录
    let res1 = await getResultsByOrgName({ id: historyData.value.id, orgName: activeOrgName.value });
    currentTabList.value = res1;
  });
  function fmtImg(record: any) {
    const firstImg = record.checkPicture.split(',')[0];
    return getFileAccessHttpUrl(firstImg);
  }
  function openImg(record) {
    // const onImgLoad = ({ index, url, dom }) => {
    //   console.log(`第${index + 1}张图片已加载，URL为：${url}`, dom);
    // };
    let imageList = record.checkPicture.split(',').map((i) => getFileAccessHttpUrl(i));
    createImgPreview({
      imageList: imageList,
      defaultWidth: 600,
      rememberState: true,
      scaleStep: 10,
      // onImgLoad
    });
  }
  function fmtImg1(record: any) {
    const firstImg = record.repairPicture.split(',')[0];
    return getFileAccessHttpUrl(firstImg);
  }
  function openImg1(record) {
    // const onImgLoad = ({ index, url, dom }) => {
    //   console.log(`第${index + 1}张图片已加载，URL为：${url}`, dom);
    // };
    let imageList = record.repairPicture.split(',').map((i) => getFileAccessHttpUrl(i));
    createImgPreview({
      imageList: imageList,
      defaultWidth: 100,
      rememberState: true,
      scaleStep: 10,
      // onImgLoad
    });
  }
  async function changeTab(key) {
    activeOrgName.value = key;
    // 根据key调用后台接口查询检查记录
    let res = await getResultsByOrgName({ id: historyData.value.id, orgName: key });
    currentTabList.value = res;
  }
</script>
<style lang="less" scoped>
  .info-wrapper {
    padding: 0 12px;
  }
  .hi-wrapper {
    padding: 0 12px;
  }
  .info {
    display: flex;
    margin: 10px 0;

    .split-line {
      width: 4px;
      height: 20px;
      background: #3e87f8;
      margin-right: 10px;
      margin-top: 1px;
    }
    .info-title {
      font-size: 16px;
      font-family: SourceHanSansCN-Medium, SourceHanSansCN-Medium;
      font-weight: normal;
      color: rgba(0, 0, 0, 0.87);
    }
  }
  .org-name {
    font-size: 15px;
    font-family: SourceHanSansCN-Regular, SourceHanSansCN;
    font-weight: bold;
    color: rgba(0, 0, 0, 0.9);
    margin: 20px 0;
  }
  .info-content {
    display: flex;
    flex-direction: column;
    margin-top: 20px;
    .item {
      width: 50%;
      display: flex;
      margin-bottom: 15px;
      .item-title {
        width: 120px;
        font-size: 14px;
        font-family: SourceHanSansCN-Regular, SourceHanSansCN;
        font-weight: normal;
        color: rgba(0, 0, 0, 0.68);
        text-align: right;
      }
      .item-content {
        width: calc(100% - 120px);
        font-size: 14px;
        font-family: SourceHanSansCN-Regular, SourceHanSansCN;
        font-weight: normal;
        color: rgba(0, 0, 0, 0.9);
      }
    }
  }
  .sign-item {
    margin-left: 50px;
    margin-bottom: 15px;
  }
</style>
