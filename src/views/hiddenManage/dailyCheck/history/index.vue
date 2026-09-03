<template>
  <div>
    <!--自定义查询区域-->
    <div class="jeecg-basic-table-form-container" @keyup.enter="searchQuery">
      <a-form ref="formRef" :model="queryParam" :label-col="labelCol" :wrapper-col="wrapperCol">
        <a-row :gutter="24">
          <a-col :md="6" :sm="12">
            <a-form-item label="所属单位">
              <a-select v-model:value="queryParam.org" @change="orgCodeChange" allowClear placeholder="请选择">
                <template v-for="item in orgOptions" :key="`${item.value}`">
                  <a-select-option :value="item.value">{{ item.label }}</a-select-option>
                </template>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :md="6" :sm="12">
            <a-form-item label="所属车间">
              <a-select v-model:value="queryParam.depart" allowClear placeholder="请选择">
                <template v-for="item in departOptions" :key="`${item.value}`">
                  <a-select-option :value="item.value">{{ item.label }}</a-select-option>
                </template>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :md="6" :sm="12">
            <a-form-item label="计划名称">
              <a-input allowClear placeholder="请输入" v-model:value="queryParam.planName" />
            </a-form-item>
          </a-col>
          <template v-if="toggleSearchStatus">
            <a-col :md="6" :sm="12">
              <a-form-item label="排查周期">
                <JDictSelectTag
                  v-model:value="queryParam.checkCycle"
                  :show-choose-option="false"
                  placeholder="请选择"
                  dictCode="sk_check_cycle"
                  allowClear
                />
              </a-form-item>
            </a-col>
            <a-col :md="6" :sm="12">
              <a-form-item label="排查责任人">
                <a-input allowClear placeholder="请输入" v-model:value="queryParam.checkDutyPersonName" />
              </a-form-item>
            </a-col>
            <a-col :md="6" :sm="12">
              <a-form-item label="检查人">
                <a-input allowClear placeholder="请输入" v-model:value="queryParam.realExecutePersonName" />
              </a-form-item>
            </a-col>
            <a-col :md="6" :sm="12">
              <a-form-item label="排查责任人单位">
                <a-select v-model:value="queryParam.checkDutyOrgCode" allowClear placeholder="请选择" @change="dutyOrgCodeChange">
                  <template v-for="item in orgOptions" :key="`${item.value}`">
                    <a-select-option :value="item.value">{{ item.label }}</a-select-option>
                  </template>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :md="6" :sm="12">
              <a-form-item label="排查责任人车间">
                <a-select v-model:value="queryParam.checkDutyDepartCode" allowClear placeholder="请选择">
                  <template v-for="item in dutyDepartOptions" :key="`${item.value}`">
                    <a-select-option :value="item.value">{{ item.label }}</a-select-option>
                  </template>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :md="6" :sm="12">
              <a-form-item label="任务时间">
                <a-range-picker v-model:value="rangeValue" @change="onChangeTime" valueFormat="YYYY-MM-DD" />
              </a-form-item>
            </a-col>
            <a-col :md="6" :sm="12">
              <a-form-item label="检查状态">
                <a-select v-model:value="queryParam.status" placeholder="请选择" allowClear>
                  <a-select-option value="0">未检查</a-select-option>
                  <a-select-option value="1">已检查</a-select-option>
                  <a-select-option value="2">超期未检查</a-select-option>
                  <a-select-option value="3">超期检查</a-select-option>
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
        <a-button type="primary" preIcon="ant-design:export-outlined" @click="onExportXls"> 导出</a-button>
      </template>
      <template #yhCount="{ record }">
        <a-button type="link" @click="showYhDetail(record)">{{ record.yhCount }}</a-button>
      </template>
      <template #status="{ record }">
        <a-tag v-if="record.status == '0'" color="red">未检查</a-tag>
        <a-tag v-else-if="record.status == '1'" color="green">已检查</a-tag>
        <a-tag v-else-if="record.status == '2'" color="orange">超期未检查</a-tag>
        <a-tag v-else-if="record.status == '3'" color="blue">超期检查</a-tag>
      </template>
      <template #action="{ record }">
        <TableAction :actions="getActions(record)" />
      </template>
    </BasicTable>
    <HistoryDrawer @register="registerHistoryDrawer" />
    <a-modal v-model:visible="visible" title="发现隐患" @ok="handleOk" width="1200px">
      <a-table style="margin: 16px" :columns="yhListColumns" :dataSource="yhData" :pagination="false" bordered>
        <template #checkPicture="{ record }">
          <img
            v-if="record.checkPicture"
            :src="fmtImg(record)"
            style="cursor: pointer; display: inline-block; width: 40px; height: 40px"
            @click="openImg(record)"
          />
          <span v-if="!record.checkPicture">无</span>
        </template>
      </a-table>
    </a-modal>
  </div>
</template>
<script lang="ts" setup name="checkHistory">
  import { ref, reactive, computed } from 'vue';
  import type { Dayjs } from 'dayjs';
  import { BasicTable, TableAction } from '/@/components/Table';
  import { BasicModal, useModalInner, useModal } from '/@/components/Modal';
  import { columns, yhListColumns } from './history.data';
  import { getList, getYhCountList, getExportUrl } from './history.api';
  import { useListPage } from '/@/hooks/system/useListPage';
  import { getDepart3ListWithSecurity, selectDeptNew } from '/@/api/common/api';
  import { useUserStore } from '/@/store/modules/user';
  import JDictSelectTag from '/@/components/Form/src/jeecg/components/JDictSelectTag.vue';
  import { useDrawer } from '/@/components/Drawer';
  import HistoryDrawer from './HistoryDrawer.vue';
  import { getFileAccessHttpUrl } from '/@/utils/common/compUtils';
  import { createImgPreview } from '/@/components/Preview/index';
  import dayjs from 'dayjs';

  const [registerHistoryDrawer, { openDrawer: openHistoryDrawer }] = useDrawer();
  const userStore = useUserStore();
  const userinfo: any = computed(() => userStore.getUserInfo);
  const orgOptions: any = ref([]);
  const departOptions: any = ref([]);
  const dutyDepartOptions: any = ref([]);
  const toggleSearchStatus = ref(false);
  type RangeValue = [Dayjs, Dayjs];
  const rangeValue = ref<RangeValue>();
  const yhData = ref([]);
  const visible = ref<boolean>(false);
  const personOptions = ref([]);

  const labelCol = reactive({
    xs: { span: 24 },
    sm: { span: 8 },
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
    checkDutyPersonName: '',
    realExecutePersonName: '',
    status: undefined,
    checkDutyOrgCode: undefined,
    checkDutyDepartCode: undefined,
  });
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
        width: 120,
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
  async function searchReset() {
    Object.assign(queryParam, {
      org: undefined,
      depart: undefined,
      planType: undefined,
      planName: undefined,
      checkCycle: undefined,
      realCheckTimeBegin: '',
      realCheckTimeEnd: '',
      checkDutyPersonName: '',
      realExecutePersonName: '',
      status: undefined,
      checkDutyOrgCode: undefined,
      checkDutyDepartCode: undefined,
    });
    rangeValue.value = undefined;
    departOptions.value = [];
    personOptions.value = [];
    dutyDepartOptions.value = [];
    await reload();
  }
  const handleOk = (e: MouseEvent) => {
    console.log(e);
    visible.value = false;
  };
  const showYhDetail = (record) => {
    console.log('record', record);
    // 发起请求
    getYhCountList({ id: record.id }).then((res) => {
      console.log('res', res);
      yhData.value = res;
      visible.value = true;
    });
  };
  // 任务日期
  function onChangeTime(date, dateString) {
    console.log(date, dateString);
    queryParam['realCheckTimeBegin'] = dateString[0];
    queryParam['realCheckTimeEnd'] = dateString[1];
  }
  function getOrgList() {
    getDepart3ListWithSecurity().then((res) => {
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
  function orgCodeChange(e: any) {
    console.log('e', e);
    departOptions.value = [];
    personOptions.value = [];
    queryParam.depart = undefined;
    if (e) {
      let params: any = {};
      params.orgCode = e;
      params.pageSize = 9999;
      params.pageNo = 1;
      selectDeptNew(params).then((res) => {
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
  }
  function dutyOrgCodeChange(e: any) {
    console.log('e', e);
    dutyDepartOptions.value = [];
    queryParam.checkDutyDepartCode = undefined;
    if (e) {
      let params: any = {};
      params.orgCode = e;
      params.pageSize = 9999;
      params.pageNo = 1;
      selectDeptNew(params).then((res) => {
        if (res && res.length > 0) {
          dutyDepartOptions.value = res.map((item) => {
            return {
              label: item.departName,
              value: item.orgCode,
            };
          });
        } else {
          dutyDepartOptions.value = [];
        }
      });
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
   * 操作列定义
   * @param record
   */
  function getActions(record) {
    return [
      // {
      //   label: '转处理',
      //   onClick: handleDealModal.bind(null, record),
      //   ifShow: hasPermission(['yh:sk_yh_execute:changeHandler']) && record.canCheck == '1',
      // },
      {
        label: '查看',
        onClick: handleDetail.bind(null, record),
      },
    ];
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
