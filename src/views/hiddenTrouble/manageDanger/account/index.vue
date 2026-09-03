<template>
  <div>
    <!--自定义查询区域-->
    <div class="jeecg-basic-table-form-container" @keyup.enter="searchQuery">
      <a-form ref="formRef" :model="queryParam" :label-col="labelCol" :wrapper-col="wrapperCol">
        <a-row :gutter="24">
          <a-col :md="6" :sm="12">
            <a-form-item label="检查层级">
              <a-select v-model:value="queryParam.checkHierarchy" allowClear placeholder="请选择">
                <a-select-option value="1">公司检查</a-select-option>
                <a-select-option value="2">单位自查</a-select-option>
                <a-select-option value="3">车间班组</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :md="6" :sm="12">
            <a-form-item label="所属单位">
              <a-select v-model:value="queryParam.org" @change="orgCodeChange" allowClear placeholder="请选择" :disabled="isCanSelectLine">
                <template v-for="item in orgOptions" :key="`${item.value}`">
                  <a-select-option :value="item.value">{{ item.label }}</a-select-option>
                </template>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :md="6" :sm="12">
            <a-form-item label="所属车间">
              <JSelectMultiple
                v-model:value="queryParam.depart"
                :show-choose-option="false"
                :allowClear="true"
                placeholder="请选择"
                :options="departOptions"
              />
              <!-- <a-select v-model:value="queryParam.depart" mode="multiple" allowClear placeholder="请选择">
                <template v-for="item in departOptions" :key="`${item.value}`">
                  <a-select-option :value="item.value">{{ item.label }}</a-select-option>
                </template>
              </a-select> -->
            </a-form-item>
          </a-col>
          <template v-if="toggleSearchStatus">
            <a-col :md="6" :sm="12">
              <a-form-item label="隐患来源">
                <JSelectMultiple v-model:value="queryParam.sourceType" :show-choose-option="false" placeholder="请选择" dictCode="sk_yh_source" />
              </a-form-item>
            </a-col>
            <a-col :md="6" :sm="12">
              <a-form-item label="检查时间">
                <a-range-picker v-model:value="rangeValue" @change="onChangeTime" :placeholder="placeholder" valueFormat="YYYY-MM-DD" />
              </a-form-item>
            </a-col>
            <a-col :md="6" :sm="12">
              <a-form-item label="隐患编码">
                <a-input allowClear placeholder="请输入" v-model:value="queryParam.yhCode" />
              </a-form-item>
            </a-col>
            <a-col :md="6" :sm="12">
              <a-form-item label="隐患描述">
                <a-input allowClear placeholder="请输入" v-model:value="queryParam.yhDescription" />
              </a-form-item>
            </a-col>
            <a-col :md="6" :sm="12">
              <a-form-item label="隐患分类">
                <JSelectMultiple v-model:value="queryParam.yhType" :show-choose-option="false" placeholder="请选择" dictCode="sk_yh_type" />
              </a-form-item>
            </a-col>
            <a-col :md="6" :sm="12">
              <a-form-item label="子类">
                <JDictSelectTag
                  v-model:value="queryParam.yhTypeSub"
                  :show-choose-option="false"
                  :allowClear="true"
                  placeholder="请选择"
                  dictCode="sk_yh_type_sub"
                />
              </a-form-item>
            </a-col>
            <a-col :md="6" :sm="12">
              <a-form-item label="隐患等级">
                <a-select v-model:value="queryParam.yhLevel" allowClear placeholder="请选择">
                  <a-select-option value="1">一般</a-select-option>
                  <a-select-option value="2">重大</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :md="6" :sm="12">
              <a-form-item label="检查人">
                <a-input allowClear placeholder="请输入" v-model:value="queryParam.checkPersonName" />
              </a-form-item>
            </a-col>
            <a-col :md="6" :sm="12">
              <a-form-item label="整改措施">
                <a-input allowClear placeholder="请输入" v-model:value="queryParam.sugRepairMsr" />
              </a-form-item>
            </a-col>
            <a-col :md="6" :sm="12">
              <a-form-item label="整改期限">
                <a-range-picker v-model:value="rangeValue1" @change="onChangeTime1" :placeholder="placeholder" valueFormat="YYYY-MM-DD" />
              </a-form-item>
            </a-col>
            <a-col :md="6" :sm="12">
              <a-form-item label="整改完成时间">
                <a-range-picker v-model:value="rangeValue2" @change="onChangeTime2" :placeholder="placeholder" valueFormat="YYYY-MM-DD" />
              </a-form-item>
            </a-col>
            <a-col :md="6" :sm="12">
              <a-form-item label="隐患状态">
                <JDictSelectTag
                  mode="multiple"
                  v-model:value="queryParam.yhStatus"
                  :show-choose-option="false"
                  placeholder="请选择"
                  dictCode="sk_yh_status"
                />
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
        <a-button type="primary" preIcon="ant-design:camera-outlined" v-auth="'yh:sk_yh_confirm:reportYh'" @click="handleDangerReport"
          >隐患上报</a-button
        >
        <a-button type="primary" preIcon="ant-design:export-outlined" v-auth="'yh:sk_yh_confirm:exportXls'" @click="onExportXls">导出</a-button>
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
      <template #repairTimeLimit="{ record }">
        <span v-if="getRepairDate(record.repairTimeLimit) == 'red' && record.yhStatus != '6'" style="color: red">{{ record.repairTimeLimit }}</span>
        <span v-else-if="getRepairDate(record.repairTimeLimit) == 'orange' && record.yhStatus != '6'" style="color: orange">{{
          record.repairTimeLimit
        }}</span>
        <span v-else>{{ record.repairTimeLimit }}</span>
      </template>
      <template #yhDescription="{ record }">
        <div style="text-align: left" class="yh-desc">{{ record.yhDescription }}</div>
      </template>
      <template #notice="{ record }">
        <div v-if="record.repairNotice">
          <a-button type="link" @click="handleNoticeDetail(record.id)">{{ record.repairNotice }}</a-button></div
        >
      </template>
      <template #action="{ record }">
        <TableAction :actions="getActions(record)" />
      </template>
    </BasicTable>
    <NoticeDetailDrawer @register="registerNoticeDetailDrawer" />
    <ReportDrawer @register="registerReportDrawer" @success="handleReportSuccess" />
    <DealDrawer @register="registerDealDrawer" @success="dealOk" />
    <EditInfoModal @register="registerModal" @success="reload" />
    <EditPersonModal @register="registerPersonModal" @success="reload" />
  </div>
</template>
<script lang="ts" setup>
  import { ref, reactive, computed, onUnmounted } from 'vue';
  import { BasicTable, TableAction } from '/@/components/Table';
  import { columns } from './account.data';
  import { getList, getExportUrl, deleteRecord } from './account.api';
  import { useListPage } from '/@/hooks/system/useListPage';
  import { getOrgCodeList, getDepartmentList } from '/@/api/common/api';
  import { useUserStore } from '/@/store/modules/user';
  import JDictSelectTag from '/@/components/Form/src/jeecg/components/JDictSelectTag.vue';
  import JSelectMultiple from '/@/components/Form/src/jeecg/components/JSelectMultiple.vue';
  import { useDrawer } from '/@/components/Drawer';
  import ReportDrawer from './ReportDrawer.vue';
  import DealDrawer from '../components/DealDrawer.vue';
  import NoticeDetailDrawer from '../components/NoticeDetailDrawer.vue';
  import { useModal } from '/@/components/Modal';
  import { getFileAccessHttpUrl, dateFormat } from '/@/utils/common/compUtils';
  import { createImgPreview } from '/@/components/Preview/index';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { usePermission } from '/@/hooks/web/usePermission';
  import EditInfoModal from './EditInfoModal.vue';
  import EditPersonModal from './EditPersonModal.vue';
  const { hasPermission } = usePermission();
  const { createConfirm } = useMessage();
  const [registerReportDrawer, { openDrawer: openReportDrawer }] = useDrawer();
  const [registerNoticeDetailDrawer, { openDrawer: openNoticeDetailDrawer }] = useDrawer();
  const [registerDealDrawer, { openDrawer: openDealDrawer }] = useDrawer();
  const [registerModal, { openModal }] = useModal();
  const [registerPersonModal, { openModal: opnenPersonModal }] = useModal();
  const userStore = useUserStore();
  const userinfo: any = computed(() => userStore.getUserInfo);
  const orgOptions: any = ref([]);
  const departOptions: any = ref([]);
  const toggleSearchStatus = ref(false);
  const placeholder = ['开始日期', '结束日期'];
  const rangeValue = ref([]);
  const rangeValue1 = ref([]);
  const rangeValue2 = ref([]);
  const queryParam = reactive({
    checkHierarchy: undefined,
    org: undefined,
    depart: undefined,
    sourceType: undefined,
    checkTimeBegin: undefined,
    checkTimeEnd: undefined,
    yhDescription: undefined,
    yhType: undefined,
    yhTypeSub: undefined,
    yhLevel: undefined,
    checkPersonName: undefined,
    repairMsr: undefined,
    repairTimeLimitBegin: undefined,
    repairTimeLimitEnd: undefined,
    repairPersonName: undefined,
    realRepairTimeBegin: undefined,
    realRepairTimeEnd: undefined,
    yhStatus: undefined,
    yhCode: undefined,
  });

  if (window.accountQueryParams) {
    let params = window.accountQueryParams;
    if (params.yhStatus && !Array.isArray(params.yhStatus)) params.yhStatus = params.yhStatus.split(',');
    rangeValue.value[0] = params.checkTimeBegin;
    rangeValue.value[1] = params.checkTimeEnd;
    if (params.org) {
      orgCodeChange(params.org);
    }
    Object.assign(queryParam, params);
  }
  if (window.mesQueryParams) {
    let params = window.mesQueryParams;
    Object.assign(queryParam, params);
  }
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
      beforeFetch(info) {
        if (info.yhStatus && info.yhStatus.length > 0) {
          info.yhStatus = info.yhStatus.join(',');
        }
        return info;
      },
      actionColumn: {
        width: 300,
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
  onUnmounted(() => {
    console.log('onUnmounted');
    window.mesQueryParams = {};
    queryParam.yhCode = undefined;
    searchQuery();
  });
  init();
  async function init() {
    console.log('history', history.state.detailId);
    if (history.state.detailId) {
      queryParam.yhCode = history.state.detailId;
      // searchQuery();
    }
  }

  // 查看通知详情
  function handleNoticeDetail(confirmId) {
    console.log('handleNoticeDetail confirmId', confirmId);
    openNoticeDetailDrawer(true, {
      // showFooter: false,
      confirmId,
    });
  }
  function getRepairDate(text) {
    console.log('getRepairDate text', text);
    // 当前日期的时间戳大于整改日期的时间戳 显示红色字体
    let repairDate = text;
    let nowDate = new Date(dateFormat(new Date(), 'yyyy-MM-dd')).getTime();
    let repairDate1 = new Date(repairDate).getTime();
    console.log('repairDate1', repairDate1);
    console.log('nowDate', nowDate);
    if (nowDate > repairDate1) {
      return 'red';
    } else if (repairDate1 - nowDate <= 3 * 24 * 60 * 60 * 1000) {
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
    queryParam['checkTimeBegin'] = dateString[0];
    queryParam['checkTimeEnd'] = dateString[1];
  }
  // 整改日期
  function onChangeTime1(date, dateString) {
    console.log(date, dateString);
    queryParam['repairTimeLimitBegin'] = dateString[0];
    queryParam['repairTimeLimitEnd'] = dateString[1];
  }
  // 整改完成日期
  function onChangeTime2(date, dateString) {
    console.log(date, dateString);
    queryParam['realRepairTimeBegin'] = dateString[0];
    queryParam['realRepairTimeEnd'] = dateString[1];
  }
  function searchQuery() {
    console.log('searchQuery', queryParam);
    //   setProps({ searchInfo: toRaw(queryParam) });
    reload();
  }
  function searchReset() {
    Object.assign(queryParam, {
      checkHierarchy: undefined,
      org: undefined,
      depart: undefined,
      sourceType: undefined,
      checkTimeBegin: undefined,
      checkTimeEnd: undefined,
      yhDescription: undefined,
      yhType: undefined,
      yhTypeSub: undefined,
      yhLevel: undefined,
      checkPersonName: undefined,
      repairMsr: undefined,
      repairTimeLimitBegin: undefined,
      repairTimeLimitEnd: undefined,
      repairPersonName: undefined,
      realRepairTimeBegin: undefined,
      realRepairTimeEnd: undefined,
      yhStatus: undefined,
      isOvertime: undefined,
      yhCode: undefined,
    });
    rangeValue.value = [];
    rangeValue1.value = [];
    rangeValue2.value = [];
    if (window.accountQueryParams) window.accountQueryParams = undefined;
    if (window.mesQueryParams) window.mesQueryParams = undefined;
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
  function orgCodeChange(e: any) {
    console.log('e', e);
    departOptions.value = [];
    queryParam.depart = undefined;
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
    openDealDrawer(true, {
      showFooter: false,
      record,
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
        label: '处理',
        onClick: handleDeal.bind(null, record),
        ifShow: record.canHandle,
      },
      {
        label: '查看',
        onClick: handleDetail.bind(null, record),
      },
      {
        label: '删除',
        onClick: handleDelete.bind(null, record),
        ifShow: hasPermission(['yh:sk_yh_confirm:delete']),
      },
      {
        label: '修改信息',
        onClick: handleEditInfo.bind(null, record),
        ifShow: hasPermission(['yh:sk_yh_confirm:edit']),
      },
      {
        label: '修改整改人',
        onClick: handleEditPerson.bind(null, record),
        ifShow: record.canChangeRepairPerson,
      },
    ];
  }
  /**
   * 修改分类等信息
   */
  function handleEditInfo(record) {
    openModal(true, {
      record,
      showFooter: true,
    });
  }
  /**
   * 修改整改人
   */
  function handleEditPerson(record) {
    opnenPersonModal(true, {
      record,
      showFooter: true,
    });
  }
  /**
   * 处理事件
   */
  function handleDeal(record) {
    openDealDrawer(true, {
      showFooter: true,
      record,
      isUpdate: true,
    });
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
  /**
   * 隐患上报
   */
  function handleDangerReport() {
    openReportDrawer(true, {
      // showFooter: false,
      accountPage: '4',
      isUpdate: false,
    });
  }
  function handleReportSuccess() {
    reload();
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
