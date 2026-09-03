<template>
  <div>
    <!--自定义查询区域-->
    <div class="jeecg-basic-table-form-container" @keyup.enter="searchQuery">
      <a-form ref="formRef" :model="queryParam" :label-col="labelCol" :wrapper-col="wrapperCol">
        <a-row :gutter="24">
          <a-col :md="6" :sm="12">
            <a-form-item label="所属单位">
              <a-select v-model:value="queryParam.org" @change="orgCodeChange" placeholder="请选择" :allowClear="true">
                <template v-for="item in orgOptions" :key="`${item.value}`">
                  <a-select-option :value="item.value">{{ item.label }}</a-select-option>
                </template>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :md="6" :sm="12">
            <a-form-item label="所属车间">
              <a-select v-model:value="queryParam.depart" :allowClear="true" placeholder="请选择" @change="orgDepartChange">
                <template v-for="item in departOptions" :key="`${item.value}`">
                  <a-select-option :value="item.value">{{ item.label }}</a-select-option>
                </template>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :md="6" :sm="12">
            <a-form-item label="执行人">
              <a-select
                v-model:value="queryParam.executePerson"
                :allowClear="true"
                placeholder="请选择"
                show-search
                :filter-option="filterOption"
                :options="personOptions"
              >
              </a-select>
            </a-form-item>
          </a-col>
          <template v-if="toggleSearchStatus">
            <a-col :md="6" :sm="12">
              <a-form-item label="计划名称">
                <a-input allowClear placeholder="请输入" v-model:value="queryParam.planName" />
              </a-form-item>
            </a-col>
            <a-col :md="6" :sm="12">
              <a-form-item label="巡检周期">
                <JDictSelectTag v-model:value="queryParam.checkCycle" placeholder="请选择" :show-choose-option="false" dictCode="sk_check_cycle" />
              </a-form-item>
            </a-col>
            <a-col :md="6" :sm="12">
              <a-form-item label="计划类型">
                <JDictSelectTag v-model:value="queryParam.planType" placeholder="请选择" :show-choose-option="false" dictCode="ht_plan_type" />
              </a-form-item>
            </a-col>
            <a-col :md="6" :sm="12">
              <a-form-item label="检查时间">
                <a-range-picker v-model:value="rangeValue" @change="onChangeTime" valueFormat="YYYY-MM-DD" />
              </a-form-item>
            </a-col>
            <a-col :md="6" :sm="12">
              <a-form-item label="检查状态">
                <a-select v-model:value="queryParam.status" placeholder="请选择" :allowClear="true">
                  <a-select-option value="0">未检查</a-select-option>
                  <a-select-option value="1">已检查</a-select-option>
                  <a-select-option value="2">已超时</a-select-option>
                  <a-select-option value="3">空班</a-select-option>
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
      <!--插槽:table标题-->
      <template #tableTitle>
        <a-button
          type="primary"
          v-if="selectedRowKeys.length > 0"
          @click="batchHandleEmpty"
          v-auth="'yh:sk_yh_execute:setEmpty'"
          preIcon="ant-design:plus-outlined"
        >
          空班</a-button
        >
        <a-button
          type="primary"
          v-if="selectedRowKeys.length > 0"
          v-auth="'yh:sk_yh_execute:changeHandler'"
          @click="batchHandleDeal"
          preIcon="ant-design:plus-outlined"
        >
          转处理</a-button
        >
        <a-button type="primary" preIcon="ant-design:export-outlined" v-auth="'yh:sk_yh_execute:export'" @click="onExportXls"> 导出</a-button>
      </template>
      <template #yhCount="{ record }">
        <a-button type="link" @click="showYhDetail(record)">{{ record.yhCount }}</a-button>
      </template>
      <template #status="{ record }">
        <a-tag v-if="record.status == '0'" color="red">未检查</a-tag>
        <a-tag v-else-if="record.status == '2'" color="#f50">已超时</a-tag>
        <a-tag v-else-if="record.status == '1'" color="green">已检查</a-tag>
        <a-tag v-else color="default" style="width: 52px">空班</a-tag>
      </template>
      <template #action="{ record }">
        <TableAction :actions="getActions(record)" />
      </template>
    </BasicTable>
    <HistoryDrawer @register="registerHistoryDrawer" />
    <HistoryModal @register="registerHistoryModal" @success="historyCheckSuccess" />
    <a-modal v-model:visible="visible" title="发现隐患" @ok="handleOk" width="1400px">
      <a-table style="margin: 16px" :columns="planType == '1' ? checkColumns : checkColumns1" :dataSource="yhData" :pagination="false" bordered>
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
    </a-modal>
    <a-modal v-model:visible="emptyVisible" title="空班" @ok="handleEmptyOk">
      <div style="margin: 30px">
        <h1 style="font-size: 16px">是否确认下列计划空班？</h1>
        <div style="margin: 15px">
          <div>计划名称：{{ emptyItem.planName }}</div>
          <div>巡检周期：{{ emptyItem.checkCycle_dictText }}</div>
          <div>检查人：{{ emptyItem.executePersonName }}</div>
        </div>
      </div>
    </a-modal>
    <a-modal v-model:visible="emptyBatchVisible" title="空班" @ok="handleBatchEmptyOk">
      <div style="margin: 30px">
        <h1 style="font-size: 16px">是否确认下列计划空班？</h1>
        <div style="margin: 15px" v-for="item in selectedRowsList" :key="item.id">
          <div>计划名称：{{ item.planName }}</div>
          <div>巡检周期：{{ item.checkCycle_dictText }}</div>
          <div>检查人：{{ item.executePersonName }}</div>
        </div>
      </div>
    </a-modal>
    <UserSelectModal @register="registerCheckUserModal" @success="handleCheckUser" />
  </div>
</template>
<script lang="ts" setup>
  import { ref, reactive, computed } from 'vue';
  import type { Dayjs } from 'dayjs';
  import { BasicTable, TableAction } from '/@/components/Table';
  import { BasicModal, useModalInner, useModal } from '/@/components/Modal';
  import { columns, checkColumns, checkColumns1 } from './history.data';
  import { getList, getYhCountList, batchDeal, transferDeal, setEmpty, getExportUrl } from './history.api';
  import { useListPage } from '/@/hooks/system/useListPage';
  import { getOrgCodeList, getDepartmentList } from '/@/api/common/api';
  import { useUserStore } from '/@/store/modules/user';
  import JDictSelectTag from '/@/components/Form/src/jeecg/components/JDictSelectTag.vue';
  import { useDrawer } from '/@/components/Drawer';
  import HistoryDrawer from './HistoryDrawer.vue';
  import HistoryModal from './HistoryModal.vue';
  import { getFileAccessHttpUrl } from '/@/utils/common/compUtils';
  import { createImgPreview } from '/@/components/Preview/index';
  import { usePermission } from '/@/hooks/web/usePermission';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { dateFormat } from '/@/utils/common/compUtils';
  import UserSelectModal from './UserSelectModal.vue';
  import { getUserList } from '../manage/manage.api';
  import dayjs from 'dayjs';

  const { createConfirm } = useMessage();
  const { hasPermission } = usePermission();
  const [registerHistoryDrawer, { openDrawer: openHistoryDrawer }] = useDrawer();
  const [registerHistoryModal, { openModal: openHistoryModal }] = useModal();
  const [registerCheckUserModal, { openModal: openCheckModal }] = useModal();
  const userStore = useUserStore();
  const userinfo: any = computed(() => userStore.getUserInfo);
  const orgOptions: any = ref([]);
  const departOptions: any = ref([]);
  const toggleSearchStatus = ref(false);
  type RangeValue = [Dayjs, Dayjs];
  const rangeValue = ref<RangeValue>();
  const yhData = ref([]);
  const visible = ref<boolean>(false);
  const emptyItem = ref<any>({});
  const personOptions = ref([]);
  const planType = ref('1');

  const labelCol = reactive({
    xs: { span: 24 },
    sm: { span: 7 },
  });
  const wrapperCol = reactive({
    xs: { span: 24 },
    sm: { span: 16 },
  });
  const queryParam = reactive({
    org: undefined,
    depart: undefined,
    planType: undefined,
    planName: undefined,
    checkCycle: undefined,
    realCheckTimeBegin: '',
    realCheckTimeEnd: '',
    executePerson: undefined,
    status: undefined,
  });
  const emptyVisible = ref<boolean>(false);
  const emptyBatchVisible = ref<boolean>(false);
  const selectedRowsList = ref([]);
  // 列表页面公共参数、方法
  const { tableContext, onExportXls } = useListPage({
    tableProps: {
      title: '巡检记录',
      api: getList,
      columns: columns,
      // formConfig: {
      //   schemas: searchFormSchema,
      // },
      useSearchForm: false,
      rowKey: 'id',
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
      //
      // },
      clickToRowSelect: false,
      // rowSelection: {
      //   getCheckboxProps: (record) => ({
      //     disabled: record.canCheck == '0', // Column configuration not to be checked
      //   }),
      // },
      actionColumn: {
        width: 240,
        title: '操作',
        dataIndex: 'action',
        slots: { customRender: 'action' },
        fixed: 'right',
      },
    },
    exportConfig: {
      name: dayjs(new Date()).format('YYYYMMDD') + '隐患排查记录',
      url: getExportUrl,
      params: queryParam,
    },
  });
  const [registerTable, { reload }, { rowSelection, selectedRowKeys, selectedRows }] = tableContext;
  function searchQuery() {
    console.log('searchQuery', queryParam);
    //   setProps({ searchInfo: toRaw(queryParam) });
    reload();
  }
  function filterOption(input: string, option: any) {
    return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
  }
  function getExecutePerson(orgCode) {
    let params: any = {};
    params.orgCode = orgCode;
    params.pageSize = 9999;
    params.pageNo = 1;
    getUserList(params).then((res) => {
      if (res) {
        personOptions.value = res.map((item: any) => {
          return {
            label: item.realname,
            value: item.id,
          };
        });
      } else {
        personOptions.value = [];
      }
    });
  }
  async function searchReset() {
    Object.assign(queryParam, {
      org: undefined,
      depart: undefined,
      planType: undefined,
      planName: undefined,
      checkCycle: undefined,
      realCheckTimeBegin: '',
      realCheckTimeEnd: '',
      executePerson: undefined,
      status: undefined,
    });
    rangeValue.value = undefined;
    departOptions.value = [];
    personOptions.value = [];
    await getExecutePerson('');
    // 管理员三位 A04
    if (userinfo.value.orgCode.length >= 6) {
      queryParam.executePerson = userinfo.value.id;
    }
    await reload();
  }
  const handleOk = (e: MouseEvent) => {
    console.log(e);
    visible.value = false;
  };
  const showYhDetail = (record) => {
    console.log('record', record);
    planType.value = record.planType;
    // 发起请求
    getYhCountList({ id: record.id }).then((res) => {
      console.log('res', res);
      yhData.value = res;
      visible.value = true;
    });
  };
  // 执行日期
  function onChangeTime(date, dateString) {
    console.log(date, dateString);
    queryParam['realCheckTimeBegin'] = dateString[0];
    queryParam['realCheckTimeEnd'] = dateString[1];
  }
  function getOrgList() {
    getOrgCodeList().then((res) => {
      orgOptions.value = res.map((item) => {
        return {
          label: item.departName,
          value: item.orgCode,
        };
      });
    });
    // 管理员三位 A04
    if (userinfo.value.orgCode.length >= 6) {
      queryParam.executePerson = userinfo.value.id;
    }
  }
  getOrgList();
  getExecutePerson('');
  function orgCodeChange(e: any) {
    console.log('e', e);
    departOptions.value = [];
    personOptions.value = [];
    queryParam.depart = undefined;
    queryParam.executePerson = undefined;
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
    getExecutePerson(e);
  }
  function orgDepartChange(e: any) {
    console.log('orgDepartChange', e);
    queryParam.executePerson = undefined;
    if (e) {
      getExecutePerson(e);
    } else if (queryParam.org) {
      getExecutePerson(queryParam.org);
    } else {
      personOptions.value = [];
    }
  }
  /**
   * 查看
   */
  function handleDetail(record) {
    openHistoryDrawer(true, {
      showFooter: false,
      record,
      isUpdate: true,
    });
  }
  /**
   * 检查
   */
  function handleHistoryModal(record) {
    openHistoryModal(true, {
      isUpdate: true,
      showFooter: true,
      record,
    });
  }
  /**
   * 操作列定义
   * @param record
   */
  function getActions(record) {
    return [
      {
        label: '转处理',
        onClick: handleDealModal.bind(null, record),
        ifShow: hasPermission(['yh:sk_yh_execute:changeHandler']) && record.canCheck == '1',
      },
      {
        label: '检查',
        onClick: handleHistoryModal.bind(null, record),
        ifShow: record.canCheck == '1',
      },
      {
        label: '空班',
        onClick: handleEmptyModal.bind(null, record),
        ifShow: hasPermission(['yh:sk_yh_execute:setEmpty']) && record.canCheck == '1',
      },
      {
        label: '查看',
        onClick: handleDetail.bind(null, record),
      },
    ];
  }
  /**
   * 空班
   */
  function handleEmptyModal(record) {
    console.log('handleEmptyModal', record);
    emptyItem.value = record;
    emptyVisible.value = true;
  }
  /**
   * 转处理
   */
  function handleDealModal(record) {
    console.log('handleDealModal', record);
    openCheckModal(true, { historyIds: [record.id] });
  }
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
  /**
   * 批量空班事件
   */
  function batchHandleEmpty() {
    selectedRowsList.value = selectedRows.value;
    emptyBatchVisible.value = true;
  }
  const handleBatchEmptyOk = (e: MouseEvent) => {
    let arr = [];
    console.log(e);
    selectedRowKeys.value.forEach((id) => {
      let params = {};
      params['id'] = id;
      arr.push(params);
    });
    setEmpty(arr, reload);
    emptyBatchVisible.value = false;
    selectedRowKeys.value = [];
  };
  const handleEmptyOk = (e: MouseEvent) => {
    let arr = [];
    console.log(e);
    let params = {};
    params['id'] = emptyItem.value.id;

    arr.push(params);
    setEmpty(arr, reload);
    emptyVisible.value = false;
  };
  /**
   * 批量转处理事件
   */
  function batchHandleDeal() {
    // 弹出处理人选择框
    openCheckModal(true, { historyIds: selectedRowKeys.value });
  }
  // 选择处理人
  function handleCheckUser(val: any) {
    console.log('handleCheckUser', val);
    // 发送接口请求
    batchDeal({ executeIdList: val.historyIds, newUserName: val.newUserName }, reload);
    selectedRowKeys.value = [];
  }
  function historyCheckSuccess(val: any) {
    console.log('historyCheckSuccess', val);
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
