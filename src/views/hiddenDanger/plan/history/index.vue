<template>
  <div>
    <!--自定义查询区域-->
    <div class="jeecg-basic-table-form-container" @keyup.enter="searchQuery">
      <a-form ref="formRef" :model="queryParam" :label-col="labelCol" :wrapper-col="wrapperCol">
        <a-row :gutter="24">
          <a-col :md="6" :sm="12">
            <a-form-item label="所属机构">
              <a-select v-model:value="queryParam.org" @change="orgCodeChange" placeholder="请选择" :allowClear="true">
                <template v-for="item in orgOptions" :key="`${item.value}`">
                  <a-select-option :value="item.value">{{ item.label }}</a-select-option>
                </template>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :md="6" :sm="12">
            <a-form-item label="所属部门">
              <a-select v-model:value="queryParam.depart" allowClear placeholder="请选择">
                <template v-for="item in departOptions" :key="`${item.value}`">
                  <a-select-option :value="item.value">{{ item.label }}</a-select-option>
                </template>
              </a-select>
            </a-form-item>
          </a-col>
          <template v-if="toggleSearchStatus">
            <a-col :md="6" :sm="12">
              <a-form-item label="计划类型">
                <JDictSelectTag v-model:value="queryParam.planType" placeholder="请选择" :show-choose-option="false" dictCode="yh_plan_type" />
              </a-form-item>
            </a-col>
            <a-col :md="6" :sm="12">
              <a-form-item label="计划名称">
                <a-input allowClear placeholder="请输入" v-model:value="queryParam.planName" />
              </a-form-item>
            </a-col>
            <a-col :md="6" :sm="12">
              <a-form-item label="巡检周期">
                <JDictSelectTag
                  v-model:value="queryParam.checkCycle"
                  placeholder="请选择"
                  :show-choose-option="false"
                  dictCode="yh_inspection_cycle"
                />
              </a-form-item>
            </a-col>
            <a-col :md="6" :sm="12">
              <a-form-item label="执行角色">
                <a-input allowClear placeholder="请输入" v-model:value="queryParam.executeRoleName" />
              </a-form-item>
            </a-col>
            <a-col :md="6" :sm="12">
              <a-form-item label="创建时间">
                <a-range-picker v-model:value="rangeValue" @change="onChangeTime" valueFormat="YYYY-MM-DD" />
              </a-form-item>
            </a-col>
            <a-col :md="6" :sm="12">
              <a-form-item label="执行人">
                <a-input allowClear placeholder="请输入" v-model:value="queryParam.executePeopleName" />
              </a-form-item>
            </a-col>
            <a-col :md="6" :sm="12">
              <a-form-item label="巡检记录">
                <a-select v-model:value="queryParam.status" placeholder="请选择">
                  <a-select-option value="0">未检查</a-select-option>
                  <a-select-option value="1">已检查</a-select-option>
                  <a-select-option value="2">已超时</a-select-option>
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
    <BasicTable @register="registerTable" :searchInfo="queryParam">
      <template #action="{ record }">
        <TableAction :actions="getActions(record)" />
      </template>
      <template #yhCount="{ record }">
        <a-button type="link" @click="showYhDetail(record)">{{ record.yhCount }}</a-button>
      </template>
      <template #status="{ record }">
        <a-tag v-if="record.status == '0'" color="red">未检查</a-tag>
        <a-tag v-else-if="record.status == '2'" color="#f50">已超时</a-tag>
        <a-tag v-else color="green">已检查</a-tag>
      </template>
    </BasicTable>
    <HistoryDrawer @register="registerHistoryDrawer" />
    <a-modal v-model:visible="visible" title="发现隐患" @ok="handleOk" width="1400px">
      <a-table style="margin: 16px" :columns="checkColumns" :dataSource="yhData" :pagination="false" bordered>
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
  </div>
</template>
<script lang="ts" setup>
  import { ref, reactive, computed } from 'vue';
  import type { Dayjs } from 'dayjs';
  import { BasicTable, TableAction } from '/@/components/Table';
  import { columns, checkColumns } from './history.data';
  import { getList, getYhCountList } from './history.api';
  import { useListPage } from '/@/hooks/system/useListPage';
  import { getOrgCodeList, getDepartmentList } from '/@/api/common/api';
  import { useUserStore } from '/@/store/modules/user';
  import JDictSelectTag from '/@/components/Form/src/jeecg/components/JDictSelectTag.vue';
  import { useDrawer } from '/@/components/Drawer';
  import HistoryDrawer from './HistoryDrawer.vue';
  import { getFileAccessHttpUrl } from '/@/utils/common/compUtils';
  import { createImgPreview } from '/@/components/Preview/index';
  const [registerHistoryDrawer, { openDrawer: openHistoryDrawer }] = useDrawer();
  const userStore = useUserStore();
  const userinfo: any = computed(() => userStore.getUserInfo);
  const orgOptions: any = ref([]);
  const departOptions: any = ref([]);
  const toggleSearchStatus = ref(false);
  type RangeValue = [Dayjs, Dayjs];
  const rangeValue = ref<RangeValue>();
  const yhData = ref([]);
  const visible = ref<boolean>(false);
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
      //
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
  const queryParam = reactive({
    org: initOrgCode(),
    depart: initDeptCode(),
    planType: undefined,
    planName: undefined,
    checkCycle: undefined,
    executeRoleName: undefined,
    executeDateBegin: '',
    executeDateEnd: '',
    executePeopleName: undefined,
    status: undefined,
  });
  // loadData();
  // function loadData(){
  //  searchQuery();
  // }
  function searchQuery() {
    console.log('searchQuery', queryParam);
    //   setProps({ searchInfo: toRaw(queryParam) });
    reload();
  }
  function searchReset() {
    Object.assign(queryParam, {
      org: initOrgCode(),
      depart: initDeptCode(),
      planType: undefined,
      planName: undefined,
      checkCycle: undefined,
      executeRoleName: undefined,
      executeDateBegin: '',
      executeDateEnd: '',
      executePeopleName: undefined,
      status: undefined,
    });
    rangeValue.value = undefined;
    reload();
  }
  // 执行日期
  function onChangeTime(date, dateString) {
    console.log(date, dateString);
    queryParam['executeDateBegin'] = dateString[0];
    queryParam['executeDateEnd'] = dateString[1];
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
    queryParam.depart = undefined; //  reset city value
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
  }
  /**
   * 查看
   */
  function handleDetail(record) {
    openHistoryDrawer(true, {
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
  .jeecg-basic-table-form-container {
    .table-page-search-submitButtons {
      display: block;
      margin-bottom: 24px;
      white-space: nowrap;
    }
  }
</style>
