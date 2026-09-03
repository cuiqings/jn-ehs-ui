<template>
  <div>
    <!--自定义查询区域-->
    <div class="jeecg-basic-table-form-container" @keyup.enter="searchQuery">
      <a-form ref="formRef" :model="queryParam" :label-col="labelCol" :wrapper-col="wrapperCol">
        <a-row :gutter="24">
          <a-col :md="6" :sm="12">
            <a-form-item label="所属机构">
              <a-select v-model:value="queryParam.org" @change="orgCodeChange" allowClear placeholder="请选择" :disabled="isCanSelectLine">
                <template v-for="item in orgOptions" :key="`${item.value}`">
                  <a-select-option :value="item.value">{{ item.label }}</a-select-option>
                </template>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :md="6" :sm="12">
            <a-form-item label="隐患地点">
              <a-select v-model:value="queryParam.depart" allowClear placeholder="请选择">
                <template v-for="item in departOptions" :key="`${item.value}`">
                  <a-select-option :value="item.value">{{ item.label }}</a-select-option>
                </template>
              </a-select>
            </a-form-item>
          </a-col>
          <template v-if="toggleSearchStatus">
            <a-col :md="6" :sm="12">
              <a-form-item label="提报部门">
                <a-select v-model:value="queryParam.reportDepart" allowClear placeholder="请选择">
                  <template v-for="item in departOptions" :key="`${item.value}`">
                    <a-select-option :value="item.value">{{ item.label }}</a-select-option>
                  </template>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :md="6" :sm="12">
              <a-form-item label="隐患描述">
                <a-input allowClear placeholder="请输入" v-model:value="queryParam.yhDescription"></a-input>
              </a-form-item>
            </a-col>
            <a-col :md="6" :sm="12">
              <a-form-item label="提报时间">
                <a-range-picker v-model:value="reportTime" @change="onChangeTime" :placeholder="placeholder" valueFormat="YYYY-MM-DD" />
              </a-form-item>
            </a-col>
            <a-col :md="6" :sm="12">
              <a-form-item label="提报人">
                <a-input allowClear placeholder="请输入" v-model:value="queryParam.reporterName"></a-input>
              </a-form-item>
            </a-col>
            <a-col :md="6" :sm="12">
              <a-form-item label="提报人联系方式">
                <a-input allowClear placeholder="请输入" v-model:value="queryParam.reporterPhone"></a-input>
              </a-form-item>
            </a-col>
            <a-col :md="6" :sm="12">
              <a-form-item label="隐患确认">
                <a-select placeholder="请选择" v-model:value="queryParam.status">
                  <a-select-option value="0">未确认</a-select-option>
                  <a-select-option value="1">非隐患</a-select-option>
                  <a-select-option value="2">确认隐患</a-select-option>
                </a-select>
                <!-- <JDictSelectTag v-model:value="queryParam.typeCode" placeholder="请选择" dictCode="plan_type" /> -->
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
    <BasicTable @register="registerTable" :searchInfo="queryParam">
      <template #yhPicture="{ record }">
        <img
          v-if="record.yhPicture"
          :src="fmtImgYh(record)"
          style="cursor: pointer; display: inline-block; width: 40px; height: 40px"
          @click="openImgYh(record)"
        />
        <span v-if="!record.yhPicture"> </span>
      </template>
      <template #repairPicture="{ record }">
        <img
          v-if="record.repairPicture"
          :src="fmtImg(record)"
          style="cursor: pointer; display: inline-block; width: 40px; height: 40px"
          @click="openImg(record)"
        />
        <span v-if="!record.repairPicture"> </span>
      </template>
      <template #action="{ record }">
        <TableAction :actions="getActions(record)" />
      </template>
    </BasicTable>
    <DetailDrawer @register="registerDetailDrawer" />
    <DealDrawer @register="registerDealDrawer" @success="dealOk" />
    <RectifyDrawer @register="registerRectifyDrawer" @success="dealOk" />
  </div>
</template>
<script lang="ts" setup>
import { ref, reactive, computed, toRaw } from 'vue';
import type { Dayjs } from 'dayjs';
import { BasicTable, useTable, TableAction } from '/@/components/Table';
import { columns } from './randomClap.data';
import { getList, deleteRecord } from './randomClap.api';
import { useListPage } from '/@/hooks/system/useListPage';
import { useMessage } from '/@/hooks/web/useMessage';
const { createConfirm } = useMessage();
import { getOrgCodeList, getDepartmentList, previewFile } from '/@/api/common/api';
import { defHttp } from '/@/utils/http/axios';
import { useUserStore } from '/@/store/modules/user';
import JDictSelectTag from '/@/components/Form/src/jeecg/components/JDictSelectTag.vue';
import { useDrawer } from '/@/components/Drawer';
import DetailDrawer from './DetailDrawer.vue';
import DealDrawer from './DealDrawer.vue';
import RectifyDrawer from './RectifyDrawer.vue';
import { getFileAccessHttpUrl } from '/@/utils/common/compUtils';
import { createImgPreview } from '/@/components/Preview/index';

const [registerDetailDrawer, { openDrawer: openDetailDrawer }] = useDrawer();
const [registerDealDrawer, { openDrawer: openDealDrawer }] = useDrawer();
const [registerRectifyDrawer, { openDrawer: openRectifyDrawer }] = useDrawer();

const userStore = useUserStore();
const userinfo = computed(() => userStore.getUserInfo);
const loginInfo = computed(() => userStore.getLoginInfo);
console.log('userinfo loginInfo', userinfo, loginInfo);
// let isSecuritySector = loginInfo.value.departs[0].isSecuritySector;
let searchInfo = {};
const orgOptions = ref([]);
const departOptions = ref([]);
const toggleSearchStatus = ref(false);
type RangeValue = [Dayjs, Dayjs];
const placeholder = ['开始日期', '结束日期'];
const reportTime = ref([]);

// 列表页面公共参数、方法
const { tableContext } = useListPage({
  tableProps: {
    title: '',
    api: getList,
    columns: columns,
    // formConfig: {
    //   schemas: searchFormSchema,
    // },
    useSearchForm: false,
    showIndexColumn: true,
    // handleSearchInfoFn(info) {
    //   console.log('handleSearchInfoFn', info);
    //   searchInfo = Object.assign({}, info);
    //   if (info.createTime1) {
    //     console.log('createTime1', info.createTime, info.createTime1.split(','));
    //     let time = info.createTime1.split(',');
    //     searchInfo['startTime'] = `${time[0]} 00:00:00`;
    //     searchInfo['endTime'] = `${time[1]} 23:59:59`;
    //     delete searchInfo['createTime1'];
    //   }
    //   console.log('handleSearchInfoFn param', searchInfo);
    //   return searchInfo;
    // },
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
});
const [registerTable, { reload }, {}] = tableContext;

const labelCol = reactive({
  xs: { span: 24 },
  sm: { span: 7 },
});
const wrapperCol = reactive({
  xs: { span: 24 },
  sm: { span: 16 },
});
const isCanSelectLine = ref(false);
const queryParam = reactive({
  org: initOrgCode(),
  depart: initDeptCode(),
  reportDepart: undefined,
  yhDescription: '',
  reportTimeBegin: '',
  reportTimeEnd: '',
  reporterName: '',
  reporterPhone: '',
  status: undefined,
});
// loadData();
// function loadData(){
//  searchQuery();
// }
const dateFormat = 'YYYY-MM-DD';
const uploadDate = ref<RangeValue>();
function searchQuery() {
  console.log('searchQuery', queryParam);
  //   setProps({ searchInfo: toRaw(queryParam) });
  reload();
}
function fmtImg(record: any) {
  // console.log(record,'000---------')
  const firstImg = record.repairPicture.split(',')[0];
  return getFileAccessHttpUrl(firstImg);
}
function openImg(record) {
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
function fmtImgYh(record: any) {
  // console.log(record,'000---------')
  const firstImg = record.yhPicture.split(',')[0];
  return getFileAccessHttpUrl(firstImg);
}
function openImgYh(record) {
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
function searchReset() {
  departOptions.value = [];
  Object.assign(queryParam, {
    org: initOrgCode(),
    depart: initDeptCode(),
    reportDepart: undefined,
    yhDescription: '',
    reportTimeBegin: '',
    reportTimeEnd: '',
    reporterName: '',
    reporterPhone: '',
    status: undefined,
  });
  reportTime.value = [];
  reload();
}
//自定义查询----end---------
/**
 * 预览
 */
function handlePreview(filePathParam) {
  if (filePathParam) {
    previewFile(filePathParam).then((res) => {
      window.open(res, '_blank');
    });
  }
}
// 上传时间
function onChangeTime(date, dateString) {
  console.log(date, dateString);
  queryParam['reportTimeBegin'] = dateString[0] + '';
  queryParam['reportTimeEnd'] = dateString[1] + '';
}
function getOrgList() {
  getOrgCodeList().then((res) => {
    res.map((item) => {
      orgOptions.value.push({
        label: item.departName,
        value: item.orgCode,
      });
    });
  });
  console.log('options', orgOptions.value);
}
getOrgList();
function initOrgCode() {
  console.log('userinfo.value.orgCode', userinfo, userinfo.value.orgCode);
  let queryParam = {};
  if (userinfo.value.orgCode.length > 6) {
    queryParam.org = userinfo.value.orgCode.slice('0', '6');
    queryParam.depart = userinfo.value.orgCode.slice('0', '9');
  } else if (userinfo.value.orgCode.length == 6) {
    queryParam.org = userinfo.value.orgCode;
    queryParam.depart = undefined;
  } else {
    queryParam.org = undefined;
    queryParam.depart = undefined;
  }
  //   if (userinfo.value.orgCode.length > 3 && isSecuritySector != 1 && userinfo.value.orgCode.slice('0', '6') != 'A04B01') {
  //     isCanSelectLine.value = true;
  //   } else {
  //     isCanSelectLine.value = false;
  //   }
  if (queryParam.org) {
    let params = {};
    params.orgCode = queryParam.org;
    params.pageSize = 9999;
    params.pageNo = 1;
    getDepartmentList(params).then((res) => {
      if (res && res.length > 0) {
        res.map((item) => {
          departOptions.value.push({
            label: item.departName,
            value: item.orgCode,
          });
        });
      } else {
        departOptions.value = [];
      }
    });
  }
  console.log('queryParam.orgCode', queryParam.org);
  return queryParam.org;
}
function initDeptCode() {
  let queryParam = {};
  if (userinfo.value.orgCode.length > 6) {
    queryParam.org = userinfo.value.orgCode.slice('0', '6');
    queryParam.depart = userinfo.value.orgCode.slice('0', '9');
  } else if (userinfo.value.orgCode.length == 6) {
    queryParam.org = userinfo.value.orgCode;
    queryParam.depart = undefined;
  } else {
    queryParam.org = undefined;
    queryParam.depart = undefined;
  }
  return queryParam.depart;
}
function orgCodeChange(e: any) {
  console.log('e', e);
  departOptions.value = [];
  queryParam.depart = undefined;
  queryParam.reportDepart = undefined;
  if (e) {
    let params = {};
    params.orgCode = e;
    params.pageSize = 9999;
    params.pageNo = 1;
    getDepartmentList(params).then((res) => {
      if (res && res.length > 0) {
        res.map((item) => {
          departOptions.value.push({
            label: item.departName,
            value: item.orgCode,
          });
        });
      } else {
        departOptions.value = [];
      }
    });
  }
}
/**
 * 查看
 */
function handleDetail(record) {
  openDetailDrawer(true, {
    // showFooter: false,
    record,
    isUpdate: true,
  });
}
/**
 * 操作列定义
 * @param record
 */
function getActions(record) {
  return [
    {
      label: '查看',
      onClick: handleDetail.bind(null, record),
    },
    {
      label: '处理',
      onClick: handleDeal.bind(null, record),
      ifShow: record.confirm && record.confirm.canHandle !== null && record.confirm.canHandle,
    },
    {
      label: '整改反馈',
      onClick: handleRectify.bind(null, record, '1'),
      ifShow: record.confirm && record.confirm.canRepair !== null && record.confirm.canRepair,
    },
    {
      label: '验收审核',
      onClick: handleRectifyCheck.bind(null, record, '2'),
      ifShow: record.confirm && record.confirm.canCheck !== null && record.confirm.canCheck,
    },
    {
      label: '删除',
      onClick: handleDelete.bind(null, record),
      ifShow: record.status == '0',
    },
  ];
}
/**
 * 删除事件
 */
function handleDelete(record) {
  createConfirm({
    iconType: 'warning',
    title: '删除',
    content: '确定要删除吗？',
    onOk: () => {
      deleteRecord({ id: record.id }, reload);
    },
    onCancel() {},
  });
}
// 处理
function handleDeal(record: any) {
  openDealDrawer(true, {
    // showFooter: false,
    record,
    isUpdate: true,
  });
}
// 整改反馈
function handleRectify(record: any, type: string) {
  openRectifyDrawer(true, {
    // showFooter: false,
    type, // 1:整改反馈 2:验收
    record,
    isUpdate: true,
  });
}
// 验收审核
function handleRectifyCheck(record: any, type: string) {
  openRectifyDrawer(true, {
    // showFooter: false,
    type, // 1:整改反馈 2:验收
    record,
    isUpdate: true,
  });
}
// 处理成功
function dealOk() {
  reload();
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