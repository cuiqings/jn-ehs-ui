<template>
  <div>
    <!--自定义查询区域-->
    <div class="jeecg-basic-table-form-container" @keyup.enter="searchQuery">
      <a-form ref="formRef" :model="queryParam" :label-col="labelCol" :wrapper-col="wrapperCol">
        <a-row :gutter="24">
          <a-col :md="6" :sm="12">
            <a-form-item label="所属机构">
              <a-select v-model:value="queryParam.yhPlaceOrg" @change="orgCodeChange" allowClear placeholder="请选择" :disabled="isCanSelectLine">
                <template v-for="item in orgOptions" :key="`${item.value}`">
                  <a-select-option :value="item.value">{{ item.label }}</a-select-option>
                </template>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :md="6" :sm="12">
            <a-form-item label="所属部门">
              <a-select v-model:value="queryParam.yhPlaceDepart" allowClear placeholder="请选择">
                <template v-for="item in departOptions" :key="`${item.value}`">
                  <a-select-option :value="item.value">{{ item.label }}</a-select-option>
                </template>
              </a-select>
            </a-form-item>
          </a-col>
          <template v-if="toggleSearchStatus">
            <a-col :md="6" :sm="12">
              <a-form-item label="提交方式">
                <JDictSelectTag v-model:value="queryParam.reportType" :show-choose-option="false" placeholder="请选择" dictCode="yh_report_type" />
              </a-form-item>
            </a-col>
            <a-col :md="6" :sm="12">
              <a-form-item label="隐患状态">
                <JDictSelectTag v-model:value="queryParam.status" :show-choose-option="false" placeholder="请选择" dictCode="yh_rectify_status" />
              </a-form-item>
            </a-col>
            <a-col :md="6" :sm="12">
              <a-form-item label="隐患来源">
                <JDictSelectTag v-model:value="queryParam.sourceType" :show-choose-option="false" placeholder="请选择" dictCode="yh_hidden_source" />
              </a-form-item>
            </a-col>
            <a-col :md="6" :sm="12">
              <a-form-item label="检查日期">
                <a-range-picker v-model:value="rangeValue" @change="onChangeTime" :placeholder="placeholder" valueFormat="YYYY-MM-DD" />
              </a-form-item>
            </a-col>
            <a-col :md="6" :sm="12">
              <a-form-item label="检查层级">
                <a-input allowClear placeholder="请输入" v-model:value="queryParam.checkHierarchy" />
              </a-form-item>
            </a-col>
            <a-col :md="6" :sm="12">
              <a-form-item label="隐患描述">
                <a-input allowClear placeholder="请输入" v-model:value="queryParam.yhDescription" />
              </a-form-item>
            </a-col>
            <!-- <a-col :md="6" :sm="12">
              <a-form-item label="隐患等级">
                <JDictSelectTag v-model:value="queryParam.yhLevel" placeholder="请选择" :show-choose-option="false" dictCode="yh_hidden_level" />
              </a-form-item>
            </a-col> -->
            <a-col :md="6" :sm="12">
              <a-form-item label="临时措施">
                <a-input allowClear placeholder="请输入" v-model:value="queryParam.tempMeasure" />
              </a-form-item>
            </a-col>
            <a-col :md="6" :sm="12">
              <a-form-item label="整改期限">
                <a-range-picker v-model:value="rangeValue1" @change="onChangeTime1" :placeholder="placeholder" valueFormat="YYYY-MM-DD" />
              </a-form-item>
            </a-col>
            <a-col :md="6" :sm="12">
              <a-form-item label="责任人">
                <a-input allowClear placeholder="请输入" v-model:value="queryParam.dutyPeopleName" />
              </a-form-item>
            </a-col>
            <a-col :md="6" :sm="12">
              <a-form-item label="责任部门">
                <a-select v-model:value="queryParam.dutyDept" allowClear placeholder="请选择">
                  <template v-for="item in departOptions" :key="`${item.value}`">
                    <a-select-option :value="item.value">{{ item.label }}</a-select-option>
                  </template>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :md="6" :sm="12">
              <a-form-item label="隐患类型">
                <JDictSelectTag v-model:value="queryParam.yhType" placeholder="请选择" :show-choose-option="false" dictCode="yh_hidden_type" />
              </a-form-item>
            </a-col>
            <a-col :md="6" :sm="12">
              <a-form-item label="防控手段">
                <JDictSelectTag v-model:value="queryParam.handleMeans" placeholder="请选择" :show-choose-option="false" dictCode="yh_control_means" />
              </a-form-item>
            </a-col>
            <a-col :md="6" :sm="12">
              <a-form-item label="提报部门">
                <a-select v-model:value="queryParam.reportDepart" allowClear placeholder="请选择">
                  <template v-for="item in orgOptions" :key="`${item.value}`">
                    <a-select-option :value="item.value">{{ item.label }}</a-select-option>
                  </template>
                </a-select>
              </a-form-item>
            </a-col>
          </template>
          <span style="float: left; overflow: hidden" class="table-page-search-submitButtons">
            <a-col :md="6" :sm="12">
              <a-button type="primary" preIcon="ant-design:search-outlined" @click="searchQuery">查询</a-button>
              <a-button type="primary" preIcon="ant-design:reload-outlined" @click="searchReset" style="margin-left: 8px">重置</a-button>
              <a @click="toggleSearchStatus = !toggleSearchStatus" style="margin-left: 8px">
                {{ toggleSearchStatus ? '收起' : '展开' }}
                <Icon :icon="toggleSearchStatus ? 'ant-design:up-outlined' : 'ant-design:down-outlined'" />
              </a>
            </a-col>
          </span>
        </a-row>
      </a-form>
    </div>
    <BasicTable @register="registerTable" :rowSelection="rowSelection" :searchInfo="queryParam">
      <template #tableTitle>
        <a-button type="primary" preIcon="ant-design:export-outlined" @click="onExportXls"> 导出</a-button>
      </template>
      <template #yhPicture="{ record }">
        <img
          v-if="record.yhPicture"
          :src="fmtImg(record)"
          style="cursor: pointer; display: inline-block; width: 40px; height: 40px"
          @click="openImg(record)"
        />
        <span v-if="!record.yhPicture"></span>
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
      <template #notice="{ record }">
        <div v-if="record.noticeNos">
          <a-button v-for="(item, index) in record.noticeNos.split(',')" :key="index" type="link" @click="handleNoticeDetail(item)">{{
            item
          }}</a-button></div
        >
      </template>
      <template #action="{ record }">
        <TableAction :actions="getActions(record)" />
      </template>
      <template #repairDate="{ text }">
        <span v-if="getRepairDate(text) == 'red'" style="color: red">{{ text }}</span>
        <span v-if="getRepairDate(text) == 'orange'" style="color: orange">{{ text }}</span>
        <span v-if="!getRepairDate(text)">{{ text }}</span>
      </template>
    </BasicTable>
    <DetailDrawer @register="registerDetailDrawer" />
    <NoticeDetailDrawer @register="registerNoticeDetailDrawer" />
  </div>
</template>
<script lang="ts" setup>
import { ref, reactive, computed } from 'vue';
import { BasicTable, TableAction } from '/@/components/Table';
import { columns } from './account.data';
import { getList, getExportUrl } from './account.api';
import { useListPage } from '/@/hooks/system/useListPage';
import { getOrgCodeList, getDepartmentList } from '/@/api/common/api';
import { useUserStore } from '/@/store/modules/user';
import JDictSelectTag from '/@/components/Form/src/jeecg/components/JDictSelectTag.vue';
import { useDrawer } from '/@/components/Drawer';
import DetailDrawer from '../components/DetailDrawer.vue';
import NoticeDetailDrawer from '../components/NoticeDetailDrawer.vue';
import { getFileAccessHttpUrl, dateFormat } from '/@/utils/common/compUtils';
import { createImgPreview } from '/@/components/Preview/index';
const [registerDetailDrawer, { openDrawer: openDetailDrawer }] = useDrawer();
const [registerNoticeDetailDrawer, { openDrawer: openNoticeDetailDrawer }] = useDrawer();
const userStore = useUserStore();
const userinfo: any = computed(() => userStore.getUserInfo);
const orgOptions: any = ref([]);
const departOptions: any = ref([]);
const toggleSearchStatus = ref(false);
const placeholder = ['开始日期', '结束日期'];
const rangeValue = ref([]);
const rangeValue1 = ref([]);
const queryParam = reactive({
  yhPlaceOrg: initOrgCode(),
  yhPlaceDepart: initDeptCode(),
  reportType: undefined,
  sourceType: undefined,
  createTimeBegin: '',
  createTimeEnd: '',
  checkHierarchy: '',
  yhDescription: '',
  yhLevel: '',
  tempMeasure: '',
  repairDateBegin: '',
  repairDateEnd: '',
  dutyPeopleName: '',
  dutyDept: undefined,
  yhType: '',
  handleMeans: '',
  status: undefined,
  reportDepart: undefined,
});
// 列表页面公共参数、方法
const { tableContext, onExportXls } = useListPage({
  tableProps: {
    title: '',
    api: getList,
    columns: columns,
    // formConfig: {
    //   schemas: searchFormSchema,
    // },
    useSearchForm: false,
    showIndexColumn: true,
    rowKey: 'id',
    clickToRowSelect: false,
    actionColumn: {
      width: 200,
      title: '操作',
      dataIndex: 'action',
      slots: { customRender: 'action' },
      fixed: 'right',
    },
  },
  exportConfig: {
    name: '隐患台帐-' + dateFormat(new Date(), 'yyyy-MM-dd'),
    url: getExportUrl,
    params: queryParam,
  },
});
const [registerTable, { reload }, { rowSelection }] = tableContext;

const labelCol = reactive({
  xs: { span: 24 },
  sm: { span: 7 },
});
const wrapperCol = reactive({
  xs: { span: 24 },
  sm: { span: 16 },
});
const isCanSelectLine = ref(false);

// 查看通知详情
function handleNoticeDetail(noticeNo) {
  console.log('noticeNo', noticeNo);
  openNoticeDetailDrawer(true, {
    // showFooter: false,
    noticeNo,
  });
}
function getRepairDate(text) {
  // 当前日期的时间戳大于整改日期的时间戳 显示红色字体
  let repairDate = text;
  let nowDate = new Date(dateFormat(new Date(), 'yyyy-MM-dd')).getTime();
  let repairDate1 = new Date(repairDate).getTime();
  if (nowDate > repairDate1) {
    return 'red';
  } else if (nowDate <= repairDate1 && repairDate1 - nowDate <= 3 * 24 * 60 * 60 * 1000) {
    // 当前时间戳在整改日期时间戳三日之内 显示橙色字体
    return 'orange';
  } else {
    return '';
  }
}
function fmtImg(record: any) {
  // console.log(record,'000---------')
  const firstImg = record.yhPicture.split(',')[0];
  return getFileAccessHttpUrl(firstImg);
}
function openImg(record) {
  // const onImgLoad = ({ index, url, dom }) => {
  //   console.log(`第${index + 1}张图片已加载，URL为：${url}`, dom);
  // };
  let imageList = record.yhPicture.split(',').map((i) => getFileAccessHttpUrl(i));
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
// 检查日期
function onChangeTime(date, dateString) {
  console.log(date, dateString);
  queryParam['createTimeBegin'] = dateString[0];
  queryParam['createTimeEnd'] = dateString[1];
}
// 整改日期
function onChangeTime1(date, dateString) {
  console.log(date, dateString);
  queryParam['repairDateBegin'] = dateString[0];
  queryParam['repairDateEnd'] = dateString[1];
}
function searchQuery() {
  console.log('searchQuery', queryParam);
  //   setProps({ searchInfo: toRaw(queryParam) });
  reload();
}
function searchReset() {
  Object.assign(queryParam, {
    yhPlaceOrg: initOrgCode(),
    yhPlaceDepart: initDeptCode(),
    reportType: undefined,
    sourceType: undefined,
    createTimeBegin: '',
    createTimeEnd: '',
    checkHierarchy: '',
    yhDescription: '',
    yhLevel: '',
    tempMeasure: '',
    repairDateBegin: '',
    repairDateEnd: '',
    dutyPeopleName: '',
    dutyDept: undefined,
    yhType: '',
    handleMeans: '',
    status: undefined,
    reportDepart: undefined,
  });
  rangeValue.value = [];
  rangeValue1.value = [];
  reload();
}
//自定义查询----end---------
function getOrgList() {
  getOrgCodeList().then((res) => {
    orgOptions.value = res.map((item) => {
      return {
        label: item.departName,
        value: item.orgCode,
      };
    });
  });
  console.log('options', orgOptions.value);
}
getOrgList();
function initOrgCode() {
  const yhPlaceOrg = userinfo.value.orgCode.length >= 6 ? userinfo.value.orgCode.slice(0, 6) : undefined;
  if (yhPlaceOrg) {
    let params: any = {};
    params.orgCode = yhPlaceOrg;
    params.pageSize = 9999;
    params.pageNo = 1;
    getDepartmentList(params).then((res) => {
      if (res && res.length > 0) {
        departOptions.value = res.map((item) => {
          return {
            label: item.departName,
            value: item.orgCode,
          };
        });
      } else {
        departOptions.value = [];
      }
    });
  }
  return yhPlaceOrg;
}
function initDeptCode() {
  return userinfo.value.orgCode.length >= 9 ? userinfo.value.orgCode.slice(0, 9) : undefined;
}
function orgCodeChange(e: any) {
  console.log('e', e);
  departOptions.value = [];
  queryParam.yhPlaceDepart = undefined;
  if (e) {
    let params: any = {};
    params.orgCode = e;
    params.pageSize = 9999;
    params.pageNo = 1;
    getDepartmentList(params).then((res) => {
      if (res && res.length > 0) {
        departOptions.value = res.map((item) => {
          return {
            label: item.departName,
            value: item.orgCode,
          };
        });
      } else {
        departOptions.value = [];
      }
    });
  }

  // const { updateSchema } = formActionType;
  // updateSchema({
  //   field: 'departCode',
  //   componentProps: {
  //     options: departOptions.value,
  //   },
  // });
}
/**
 * 查看
 */
function handleDetail(record) {
  openDetailDrawer(true, {
    // showFooter: false,
    record,
    accountPage: '4',
    isUpdate: true,
  });
}
/**
 * 操作列定义
 * @param record
 */
function getActions(record) {
  record.pageType = 'rectification';
  return [
    {
      label: '查看',
      onClick: handleDetail.bind(null, record),
    },
  ];
}
</script>
<style lang="less" scoped>
.jeecg-basic-table-form-container {
  .table-page-search-submitButtons {
    display: block;
    margin-bottom: 24px;
    white-space: nowrap;
  }
}
</style>
