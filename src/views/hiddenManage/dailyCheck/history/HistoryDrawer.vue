<template>
  <BasicDrawer v-bind="$attrs" @register="registerDrawer" title="排查记录" width="1000px" destroyOnClose>
    <!-- 计划信息 -->
    <div class="info-wrapper">
      <div class="info">
        <div class="split-line"></div>
        <div class="info-title">计划信息</div>
      </div>
      <div class="info-content">
        <div style="display: flex">
          <div class="item">
            <div class="item-title">所属单位：</div>
            <div class="item-content">{{ historyData.orgName }}</div>
          </div>
          <div class="item">
            <div class="item-title">所属车间：</div>
            <div class="item-content">{{ historyData.departName }}</div>
          </div>
          <div class="item">
            <div class="item-title">计划名称：</div>
            <div class="item-content">{{ historyData.planName }}</div>
          </div>
        </div>
        <div style="display: flex"
          ><div class="item">
            <div class="item-title">排查周期：</div>
            <div class="item-content">{{ filterDictTextByCache('sk_check_cycle', historyData.checkCycle) }}</div>
          </div>
          <div class="item">
            <div class="item-title">排查责任人：</div>
            <div class="item-content">{{ historyData.checkDutyPersonName }}</div>
          </div>
          <div class="item"> </div>
        </div>
      </div>
    </div>
    <!-- 检查记录 -->
    <div class="info-wrapper" style="margin-bottom: 20px">
      <div>
        <div class="info">
          <div class="split-line"></div>
          <div class="info-title">检查记录</div>
        </div>
        <div class="info-content">
          <div style="display: flex">
            <div class="item">
              <div class="item-title">检查人：</div>
              <div class="item-content">{{ historyData.realExecutePersonName }}</div>
            </div>
            <div class="item">
              <div class="item-title">检查时间：</div>
              <div class="item-content">{{ historyData.realCheckTime }}</div>
            </div>
          </div>
        </div>
        <a-table :columns="checkColumns" :dataSource="riskData" :pagination="false" bordered>
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
      </div>
    </div>
  </BasicDrawer>
</template>
<script lang="ts" setup>
  import { ref } from 'vue';
  import { BasicDrawer, useDrawerInner } from '/src/components/Drawer';
  import { getDetail } from './history.api';
  import { filterDictTextByCache } from '/@/utils/dict/JDictSelectUtil';
  import { checkColumns } from './history.data';
  import { getFileAccessHttpUrl } from '/@/utils/common/compUtils';
  import { createImgPreview } from '/@/components/Preview/index';
  const riskData = ref([]);
  const historyData = ref({});
  const planData = ref({});
  const planType = ref('1');
  const emit = defineEmits(['register', 'success']);

  const [registerDrawer, { setDrawerProps, closeDrawer }] = useDrawerInner(async (data) => {
    setDrawerProps({ confirmLoading: false });
    // historyData.value = data.record;
    planType.value = data.record.planType;
    // 查详情by id
    let res = await getDetail({ id: data.record.id });
    console.log('getDetail', res);
    historyData.value = res;
    riskData.value = res.itemList;
    planData.value = res.plan;
  });
  function fmtImg(record: any) {
    // console.log(record,'000---------')
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
    // console.log(record,'000---------')
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
</style>
