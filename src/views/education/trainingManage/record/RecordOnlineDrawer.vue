<template>
  <BasicDrawer v-bind="$attrs" @register="registerDrawer" title="查看" width="1000px" destroyOnClose>
    <!-- 计划信息 -->
    <div class="info-wrapper">
      <div class="info">
        <div class="split-line"></div>
        <div class="info-title">培训信息</div>
      </div>
      <div class="info-content">
        <div style="display: flex">
          <div class="item">
            <div class="item-title">当前状态：</div>
            <div class="item-content">{{ recordData.status }}</div>
          </div>
          <div class="item">
            <div class="item-title">实施方式：</div>
            <div class="item-content">{{ recordData.type }}</div>
          </div>
        </div>
        <div style="display: flex"
          ><div class="item">
            <div class="item-title">任务名称：</div>
            <div class="item-content">{{ recordData.taskName }}</div>
          </div>
          <div class="item">
            <div class="item-title">培训项目：</div>
            <div class="item-content">{{ recordData.trainProjectName }}</div>
          </div></div
        >
        <div
          ><div class="item1">
            <div class="item-title">培训内容：</div>
            <div class="item-content-1">{{ recordData.trainContent }}</div>
          </div>
        </div>
        <div
          ><div class="item1">
            <div class="item-title">任务时间：</div>
            <div class="item-content">{{ recordData.taskDate }}</div>
          </div>
        </div>
        <div
          ><div class="item1">
            <div class="item-title">培训对象：</div>
            <div class="item-content">{{ recordData.trainObject }}</div>
          </div>
        </div>
      </div>
    </div>
    <!-- 巡检记录 -->
    <div class="info-wrapper">
      <div class="info">
        <div class="split-line"></div>
        <div class="info-title">任务内容</div>
      </div>
      <div>
        <a-table style="margin-left: 20px" :columns="taskColumns" :dataSource="recordData.taskContent" :pagination="false" bordered>
          <template #course="{ record }">
            <div v-if="record.course && record.course.length > 0">
              <div v-for="(item, index) in record.course" :index="item.id">
                <a-tooltip placement="topLeft" :title="index + 1 + item.name" arrow-point-at-center> 课时{{ index + 1 }}:{{ item.name }} </a-tooltip>
              </div>
            </div>
          </template>
        </a-table>
      </div>
      <div class="info-content">
        <div style="display: flex">
          <div class="item">
            <div class="item-title">创建单位：</div>
            <div class="item-content">{{ recordData.orgCodeName }}</div>
          </div>
          <div class="item">
            <div class="item-title">任务时间：</div>
            <div class="item-content">{{ recordData.taskCreateTime }}</div>
          </div>
        </div>
      </div>
    </div>
  </BasicDrawer>
</template>
<script lang="ts" setup>
  import { ref } from 'vue';
  import { BasicDrawer, useDrawerInner } from '/src/components/Drawer';
  import { getDetailById } from './record.api';
  import { filterDictTextByCache } from '/@/utils/dict/JDictSelectUtil';
  import { taskColumns } from './record.data';
  import { getFileAccessHttpUrl } from '/@/utils/common/compUtils';
  import { createImgPreview } from '/@/components/Preview/index';
  const recordData = ref({});
  const emit = defineEmits(['register', 'success']);

  const [registerDrawer, { setDrawerProps, closeDrawer }] = useDrawerInner(async (data) => {
    setDrawerProps({ confirmLoading: false });
    // recordData.value = data.record;
    // 查详情by id
    let res = await getDetailById({ id: data.record.id });
    console.log('getDetailById', res);
    recordData.value = res;
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
      defaultWidth: 600,
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
    }
    .item1 {
      width: 90%;
      display: flex;
      margin-bottom: 15px;
    }
    .item-content-1 {
      width: calc(100% - 120px);
      font-size: 14px;
      font-family: SourceHanSansCN-Regular, SourceHanSansCN;
      font-weight: normal;
      color: rgba(0, 0, 0, 0.9);
      white-space: pre-wrap;
    }
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
  .course-item {
    // 超过一行显示省略号
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    width: 100%;
    margin-top: 10px;
    margin-left: 20px;
    font-size: 14px;
    font-family: SourceHanSansCN-Regular, SourceHanSansCN;
    font-weight: normal;
    color: rgba(0, 0, 0, 0.9);
  }
</style>
