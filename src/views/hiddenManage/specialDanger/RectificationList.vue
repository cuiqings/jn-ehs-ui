<template>
  <div>
    <!--自定义查询区域-->
    <div class="jeecg-basic-table-form-container" @keyup.enter="searchQuery">
      <a-form ref="formRef" :model="queryParam" :label-col="labelCol" :wrapper-col="wrapperCol">
        <a-row :gutter="24">
          <a-col :md="6" :sm="12">
            <a-form-item label="责任单位">
              <a-select v-model:value="queryParam.dutyOrg" @change="orgCodeChange" allowClear placeholder="请选择" :disabled="isCanSelectLine">
                <template v-for="item in orgOptions" :key="`${item.value}`">
                  <a-select-option :value="item.value">{{ item.label }}</a-select-option>
                </template>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :md="6" :sm="12">
            <a-form-item label="整改部门">
              <JSelectMultiple
                v-model:value="queryParam.repairDepart"
                :show-choose-option="false"
                :allowClear="true"
                placeholder="请选择"
                :options="departOptions"
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
          <template v-if="toggleSearchStatus">
            <a-col :md="6" :sm="12">
              <a-form-item label="隐患描述">
                <a-input allowClear placeholder="请输入" v-model:value="queryParam.yhDescription" />
              </a-form-item>
            </a-col>
            <a-col :md="6" :sm="12">
              <a-form-item label="隐患类别">
                <JSelectMultiple v-model:value="queryParam.yhType" :show-choose-option="false" placeholder="请选择" dictCode="sk_yh_type" />
              </a-form-item>
            </a-col>
            <a-col :md="6" :sm="12">
              <a-form-item label="隐患子类别">
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
              <a-form-item label="整改责任人">
                <a-input allowClear placeholder="请输入" v-model:value="queryParam.checkPersonName" />
              </a-form-item>
            </a-col>
            <a-col :md="6" :sm="12">
              <a-form-item label="隐患状态">
                <a-select v-model:value="queryParam.yhStatus" allowClear placeholder="请选择">
                  <a-select-option value="3">待整改</a-select-option>
                  <a-select-option value="6">超期未整改</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :md="6" :sm="12">
              <a-form-item label="检查时间">
                <a-range-picker v-model:value="rangeValue" @change="onChangeTime" :placeholder="placeholder" valueFormat="YYYY-MM-DD" />
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
          :src="fmtImg(record)"
          style="cursor: pointer; display: inline-block; width: 40px; height: 40px"
          @click="openImg(record)"
        />
        <span v-if="!record.yhPicture">无</span>
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
    <DealDrawer @register="registerDealDrawer" @success="dealOk" />
  </div>
</template>
<script lang="ts" setup name="special-danger-rectification">
  import { ref, reactive, computed } from 'vue';
  import { BasicTable, TableAction } from '/@/components/Table';
  import { columns } from '../dailyDanger/common/data';
  import { getRectificationList } from '../dailyDanger/common/api';
  import { useListPage } from '/@/hooks/system/useListPage';
  import { getDepart3ListWithSecurity, getDepartmentList } from '/@/api/common/api';
  import { useUserStore } from '/@/store/modules/user';
  import JDictSelectTag from '/@/components/Form/src/jeecg/components/JDictSelectTag.vue';
  import JSelectMultiple from '/@/components/Form/src/jeecg/components/JSelectMultiple.vue';
  import { useDrawer } from '/@/components/Drawer';
  import DealDrawer from '../dailyDanger/components/DealDrawer.vue';
  import { getFileAccessHttpUrl, dateFormat } from '/@/utils/common/compUtils';
  import { createImgPreview } from '/@/components/Preview/index';
  import { useMessage } from '/@/hooks/web/useMessage';

  const { createConfirm } = useMessage();
  const [registerDealDrawer, { openDrawer: openDealDrawer }] = useDrawer();
  const userStore = useUserStore();
  const userinfo: any = computed(() => userStore.getUserInfo);
  const loginInfo = computed(() => userStore.getLoginInfo);
  console.log('userinfo loginInfo', userinfo, loginInfo);
  const orgOptions: any = ref([]);
  const departOptions: any = ref([]);
  const toggleSearchStatus = ref(false);
  const placeholder = ['开始日期', '结束日期'];
  const rangeValue = ref([]);
  const rangeValue1 = ref([]);

  // 列表页面公共参数、方法
  const { tableContext } = useListPage({
    tableProps: {
      title: '',
      api: getRectificationList,
      columns: columns,
      // formConfig: {
      //   schemas: searchFormSchema,
      // },
      useSearchForm: false,
      showIndexColumn: true,
      beforeFetch: (params) => {
        params.checkType = '3,4,5,6,7,8';
        console.log('params', params);
        return params;
      },
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
    dutyOrg: undefined,
    repairDepart: undefined,
    yhDescription: '',
    yhLevel: undefined,
    yhType: undefined,
    yhTypeSub: undefined,
    checkPersonName: '',
    checkTimeBegin: '',
    checkTimeEnd: '',
    yhStatus: undefined,
  });
  // loadData();
  // function loadData(){
  //  searchQuery();
  // }
  // const dateFormat = 'YYYY-MM-DD';
  function searchQuery() {
    console.log('searchQuery', queryParam);
    //   setProps({ searchInfo: toRaw(queryParam) });
    reload();
  }
  function searchReset() {
    Object.assign(queryParam, {
      dutyOrg: undefined,
      repairDepart: undefined,
      yhDescription: '',
      yhLevel: undefined,
      yhType: undefined,
      yhTypeSub: undefined,
      checkPersonName: '',
      checkTimeBegin: '',
      checkTimeEnd: '',
      yhStatus: undefined,
    });
    rangeValue.value = [];
    reload();
  }
  //自定义查询----end---------
  // 检查日期
  function onChangeTime(date, dateString) {
    console.log(date, dateString);
    queryParam['checkTimeBegin'] = dateString[0];
    queryParam['checkTimeEnd'] = dateString[1];
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
    departOptions.value = [];
    queryParam.repairDepart = undefined;
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
   * 操作列定义
   * @param record
   */
  function getActions(record) {
    record.pageType = 'rectification';
    return [
      {
        label: '整改',
        onClick: handleDeal.bind(null, record),
        ifShow: record.canHandle,
      },
      {
        label: '查看',
        onClick: handleDetail.bind(null, record),
      },
    ];
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
   * 处理事件
   */
  function handleDeal(record) {
    openDealDrawer(true, {
      showFooter: true,
      record,
      isUpdate: true,
    });
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
  // 处理成功
  function dealOk() {
    reload();
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
