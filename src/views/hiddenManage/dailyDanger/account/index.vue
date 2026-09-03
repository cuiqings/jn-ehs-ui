<template>
  <div>
    <!--自定义查询区域-->
    <div class="jeecg-basic-table-form-container" @keyup.enter="searchQuery">
      <a-form ref="formRef" :model="queryParam" :label-col="labelCol" :wrapper-col="wrapperCol">
        <a-row :gutter="24">
          <a-col :md="6" :sm="12">
            <a-form-item label="责任单位">
              <a-select v-model:value="queryParam.dutyOrg" @change="orgCodeChange" allowClear placeholder="请选择">
                <template v-for="item in orgOptions" :key="`${item.value}`">
                  <a-select-option :value="item.value">{{ item.label }}</a-select-option>
                </template>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :md="6" :sm="12">
            <a-form-item label="整改部门">
              <a-select v-model:value="queryParam.repairDepart" :allowClear="true" placeholder="请选择" :options="departOptions" />
            </a-form-item>
          </a-col>
          <a-col :md="6" :sm="12">
            <a-form-item label="检查层级">
              <a-select v-model:value="queryParam.controlLevel" :allowClear="true" placeholder="请选择" :options="controlLevelOptions" />
            </a-form-item>
          </a-col>

          <template v-if="toggleSearchStatus">
            <a-col :md="6" :sm="12">
              <a-form-item label="隐患等级">
                <a-select v-model:value="queryParam.yhLevel" allowClear placeholder="请选择">
                  <a-select-option value="1">一般</a-select-option>
                  <a-select-option value="2">重大</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :md="6" :sm="12">
              <a-form-item label="隐患描述">
                <a-input allowClear placeholder="请输入" v-model:value="queryParam.yhDescription" />
              </a-form-item>
            </a-col>
            <a-col :md="6" :sm="12">
              <a-form-item label="隐患类别">
                <JDictSelectTag v-model:value="queryParam.yhType" :show-choose-option="false" placeholder="请选择" dictCode="sk_yh_type" @change="changeYhType" :allowClear="true" />
              </a-form-item>
            </a-col>
            <a-col :md="6" :sm="12">
              <a-form-item label="隐患子类别">
                <JDictSelectTag
                  v-model:value="queryParam.yhTypeSub"
                  :show-choose-option="false"
                  :allowClear="true"
                  placeholder="请选择"
                  :dictCode="sk_yh_type_sub"
                />
              </a-form-item>
            </a-col>
            <a-col :md="6" :sm="12">
              <a-form-item label="整改责任人">
                <a-input allowClear placeholder="请输入" v-model:value="queryParam.repairPersonName" />
              </a-form-item>
            </a-col>
            <a-col :md="6" :sm="12">
              <a-form-item label="隐患状态">
                <a-select v-model:value="queryParam.yhStatus" allowClear placeholder="请选择">
                  <a-select-option value="1">确认退回</a-select-option>
                  <a-select-option value="2">待确认</a-select-option>
                  <a-select-option value="3">待整改</a-select-option>
                  <a-select-option value="4">待验收</a-select-option>
                  <a-select-option value="5">验收通过</a-select-option>
                  <a-select-option value="6">超期未整改</a-select-option>
                  <a-select-option value="7">超期整改</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :md="6" :sm="12">
              <a-form-item label="检查时间">
                <a-range-picker v-model:value="rangeValue" @change="onChangeTime" :placeholder="placeholder" valueFormat="YYYY-MM-DD" />
              </a-form-item>
            </a-col>
            <a-col :md="6" :sm="12">
              <a-form-item label="检查人">
                <a-input allowClear placeholder="请输入" v-model:value="queryParam.checkPersonName" />
              </a-form-item>
            </a-col>
            <a-col :md="6" :sm="12">
              <a-form-item label="检查人单位">
                <a-select v-model:value="queryParam.checkOrgCode" @change="checkOrgCodeChange" allowClear placeholder="请选择">
                  <template v-for="item in checkOrgOptions" :key="`${item.value}`">
                    <a-select-option :value="item.value">{{ item.label }}</a-select-option>
                  </template>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :md="6" :sm="12">
              <a-form-item label="检查人车间">
                <a-select v-model:value="queryParam.checkDepartCode" :allowClear="true" placeholder="请选择" :options="checkDepartOptions" />
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
        <a-button type="primary" preIcon="ant-design:camera-outlined" v-auth="'yh_account_list:report'" @click="handleDangerReport"
          >隐患上报</a-button
        >
        <a-button type="primary" preIcon="ant-design:export-outlined" v-auth="'yh_account_list:export'" @click="onExportXls">导出</a-button>
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
      <template #action="{ record }">
        <TableAction :actions="getActions(record)" />
      </template>
    </BasicTable>
    <PostReportDrawer @register="registerPostReportDrawer" @success="handlePostReportSuccess" />
    <OtherReportDrawer @register="registerOtherReportDrawer" @success="handleOtherReportSuccess" />
    <DealDrawer @register="registerDealDrawer" @success="dealOk" />
    <UserSelectModal @register="registerSelectUserModal" :isRadioSelection="true" rowKey="username" @getSelectResult="handleTransferSelected" />
  </div>
</template>
<script lang="ts" setup name="daily-hidden-account">
  import { ref, reactive, computed, onUnmounted, onMounted } from 'vue';
  import { BasicTable, TableAction } from '/@/components/Table';
  import { columns } from './account.data';
  import { getList, getExportUrl, deleteRecord, getIfPostPerson, changeHandler } from './account.api';
  import { useListPage } from '/@/hooks/system/useListPage';
  import { getDepart3ListWithSecurity, getDepartmentList, get3DepartList } from '/@/api/common/api';
  import { useUserStore } from '/@/store/modules/user';
  import JDictSelectTag from '/@/components/Form/src/jeecg/components/JDictSelectTag.vue';
  import JSelectMultiple from '/@/components/Form/src/jeecg/components/JSelectMultiple.vue';
  import { useDrawer } from '/@/components/Drawer';
  import PostReportDrawer from './PostReportDrawer.vue';
  import OtherReportDrawer from './OtherReportDrawer.vue';
  import DealDrawer from '../components/DealDrawer.vue';
  import { useModal } from '/@/components/Modal';
  import { getFileAccessHttpUrl, dateFormat } from '/@/utils/common/compUtils';
  import { createImgPreview } from '/@/components/Preview/index';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { usePermission } from '/@/hooks/web/usePermission';
  import UserSelectModal from '/@/components/Form/src/jeecg/components/modal/UserSelectModal.vue';

  const { hasPermission } = usePermission();
  const { createConfirm } = useMessage();
  const [registerPostReportDrawer, { openDrawer: openPostReportDrawer }] = useDrawer();
  const [registerOtherReportDrawer, { openDrawer: openOtherReportDrawer }] = useDrawer();
  const [registerDealDrawer, { openDrawer: openDealDrawer }] = useDrawer();
  const [registerSelectUserModal, { openModal: openSelectUserModal }] = useModal();
  const userStore = useUserStore();
  const userinfo: any = computed(() => userStore.getUserInfo);
  const orgOptions: any = ref([]);
  const departOptions: any = ref([]);
  const checkOrgOptions: any = ref([]);
  const checkDepartOptions: any = ref([]);
  const toggleSearchStatus = ref(false);
  const placeholder = ['开始日期', '结束日期'];
  const rangeValue = ref<string[]>([]);
  const rangeValue1 = ref<string[]>([]);
  const rangeValue2 = ref<string[]>([]);
  const ifPostPerson = ref(false);
  const currentChangeRecord = ref<any | null>(null);
  const sk_yh_type_sub = ref('sk_yh_type_1')
  const queryParam = reactive({
    dutyOrg: undefined,
    repairDepart: undefined,
    controlLevel: undefined,
    yhDescription: '',
    yhLevel: undefined,
    yhType: undefined,
    yhTypeSub: undefined,
    repairPersonName: '',
    checkPersonName: '',
    checkTimeBegin: '',
    checkTimeEnd: '',
    yhStatus: undefined,
    checkOrgCode: undefined,
    checkDepartCode: undefined,
  });

  /**
   * 将 window.accountQueryParams 合并到本地查询条件，并同步日期选择器
   * @param params 通过 window 传入的查询参数
   */
  function applyAccountParams(params: AccountQueryParams) {
    if (!params) return;
    if (params.yhStatus && !Array.isArray(params.yhStatus)) params.yhStatus = (params.yhStatus as string).split(',');
    rangeValue.value[0] = params.checkTimeBegin || '';
    rangeValue.value[1] = params.checkTimeEnd || '';
    Object.assign(queryParam, params);
  }

  /**
   * 初始化并监听 window.accountQueryParams，当有值时合并到查询参数并触发查询
   */
  onMounted(() => {
    console.log('onMounted==============', window);
    if (window.accountQueryParams) {
      console.log('window.accountQueryParams', window.accountQueryParams);
      applyAccountParams(window.accountQueryParams);
    }
    // 监听后续对 window.accountQueryParams 的赋值
    try {
      let __accountParams = window.accountQueryParams;
      Object.defineProperty(window, 'accountQueryParams', {
        configurable: true,
        get() {
          return __accountParams;
        },
        set(val) {
          __accountParams = val as AccountQueryParams | undefined;
          if (val) {
            applyAccountParams(val as AccountQueryParams);
            reload();
          }
        },
      });
    } catch (e) {
      // ignore defineProperty error in non-browser/runtime edge cases
    }
  });
  console.log('queryParam', queryParam);
  // 1 安全部 2厂部主要负责人 3厂部安全科 4车间负责人 5班组负责人 6岗位人员 7隐患上报 8专项检查
  const controlLevelOptions = ref([
    {
      label: '安全部',
      value: '1',
    },
    {
      label: '厂部主要负责人',
      value: '2',
    },
    {
      label: '厂部安全科',
      value: '3',
    },
    {
      label: '车间负责人',
      value: '4',
    },
    {
      label: '班组负责人',
      value: '5',
    },
    {
      label: '岗位人员',
      value: '6',
    },
    {
      label: '隐患上报（隐患随手拍）',
      value: '7',
    },
    {
      label: '专项检查',
      value: '8',
    },
  ]);

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
  onUnmounted(() => {
    console.log('onUnmounted');
    window.accountQueryParams = undefined;
    searchQuery();
  });
  init();
  function init() {
    // if (window.mesQueryParams) {
    //   let params = window.mesQueryParams;
    //   Object.assign(queryParam, params);
    // }
    getIfPostPerson().then((res) => {
      console.log('res', res);
      ifPostPerson.value = res;
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
  /**
   * 检查日期范围选择变化
   * @param date 日期对象数组
   * @param dateString 字符串格式的日期范围
   */
  function onChangeTime(date, dateString) {
    console.log(date, dateString);
    queryParam['checkTimeBegin'] = dateString[0];
    queryParam['checkTimeEnd'] = dateString[1];
  }
  /**
   * 发起查询；若 window.accountQueryParams 有值会优先合并
   */
  function searchQuery() {
    console.log('searchQuery', queryParam);
    if (window.accountQueryParams) {
      console.log('window.accountQueryParams', window.accountQueryParams);
      applyAccountParams(window.accountQueryParams);
    }
    reload();
  }
  function searchReset() {
    Object.assign(queryParam, {
      dutyOrg: undefined,
      repairDepart: undefined,
      controlLevel: undefined,
      yhDescription: '',
      yhLevel: undefined,
      yhType: undefined,
      yhTypeSub: undefined,
      repairPersonName: '',
      checkPersonName: '',
      checkTimeBegin: '',
      checkTimeEnd: '',
      yhStatus: undefined,
      checkOrgCode: undefined,
      checkDepartCode: undefined,
    });
    rangeValue.value = [];
    rangeValue1.value = [];
    rangeValue2.value = [];
    if (window.accountQueryParams) window.accountQueryParams = undefined;
    if (window.mesQueryParams) window.mesQueryParams = undefined;
    reload();
  }
  getCheckOrgList();
  function getCheckOrgList() {
    //检查单位查所有的
    get3DepartList().then((res) => {
      if (res && res.length > 0) {
        checkOrgOptions.value = res.map((item) => {
          return {
            label: item.departName,
            value: item.orgCode,
          };
        });
      } else {
        checkOrgOptions.value = [];
      }
    });
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
  function checkOrgCodeChange(e: any) {
    console.log('e', e);
    checkDepartOptions.value = [];
    queryParam.checkDepartCode = undefined;
    if (e) {
      let params: any = {};
      params.orgCode = e;
      params.pageSize = 9999;
      params.pageNo = 1;
      getDepartmentList(params).then((res) => {
        if (res && res.length > 0) {
          checkDepartOptions.value = res.map((item) => {
            return {
              label: item.departName,
              value: item.orgCode,
            };
          });
        } else {
          checkDepartOptions.value = [];
        }
      });
    }
  }
  getOrgList();
  function orgCodeChange(e: any) {
    console.log('e', e);
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
      // {
      //   label: '转处理',
      //   onClick: changeDeal.bind(null, record),
      //   ifShow: record.canChange,
      // },
      {
        label: '查看',
        onClick: handleDetail.bind(null, record),
      },
      {
        label: '删除',
        onClick: handleDelete.bind(null, record),
        ifShow: hasPermission(['yh_account_list:delete']),
      },
    ];
  }
  /**
   * 打开转处理选人弹框
   * @param record 当前行记录
   */
  function changeDeal(record) {
    currentChangeRecord.value = record;
    openSelectUserModal(true, {
      list: [],
    });
  }
  /**
   * 选人确定后调用后端并刷新
   * @param arr 选中的用户列表（单选）
   */ 
  async function handleTransferSelected(arr) {
    console.log('handleTransferSelected', arr);
    if (!arr || arr.length === 0 || !currentChangeRecord.value) return;
    const user = arr[0];
    let currentChangeIds: string[] = [];
    currentChangeIds.push(currentChangeRecord.value.id);
    await changeHandler({ confirmIdList: currentChangeIds, newUserName: user['value'] }).then(() => {
      currentChangeRecord.value = null;
      reload();
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
    if (ifPostPerson.value) {
      // 岗位工
      openPostReportDrawer(true, {
        // showFooter: false,
        accountPage: '4',
        isUpdate: false,
      });
    } else {
      // 非岗位工
      openOtherReportDrawer(true, {
        // showFooter: false,
        accountPage: '4',
        isUpdate: false,
      });
    }
  }
  function handleOtherReportSuccess() {
    reload();
  }
  function handlePostReportSuccess() {
    reload();
  }
  // 处理成功
  function dealOk() {
    reload();
  }
  /**
   * 隐患类别改变时，根据隐患类别改变隐患子类别
   */
  function changeYhType(e: any) {
    queryParam.yhTypeSub = undefined;
    if (e) {
      sk_yh_type_sub.value = e;
    } else {
      sk_yh_type_sub.value = '';
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
