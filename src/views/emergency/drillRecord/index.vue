<template>
  <div>
    <!--自定义查询区域-->
    <div class="jeecg-basic-table-form-container" @keyup.enter="searchQuery">
      <a-form ref="formRef" :model="queryParam" :label-col="labelCol" :wrapper-col="wrapperCol">
        <a-row :gutter="24">
          <a-col :md="6" :sm="12">
            <a-form-item label="所属机构">
              <a-select v-model:value="queryParam.orgCode" @change="orgCodeChange" allowClear placeholder="请选择" :disabled="isCanSelectLine">
                <template v-for="item in orgOptions" :key="`${item.value}`">
                  <a-select-option :value="item.value">{{ item.label }}</a-select-option>
                </template>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :md="6" :sm="12">
            <a-form-item label="所属部门">
              <a-select v-model:value="queryParam.departCode" allowClear placeholder="请选择">
                <template v-for="item in departOptions" :key="`${item.value}`">
                  <a-select-option :value="item.value">{{ item.label }}</a-select-option>
                </template>
              </a-select>
            </a-form-item>
          </a-col>
          <template v-if="toggleSearchStatus">
            <a-col :md="6" :sm="12">
              <a-form-item label="分类">
                <JDictSelectTag v-model:value="queryParam.typeCode" placeholder="请选择" dictCode="emergency_disposal_classify" />
              </a-form-item>
            </a-col>
            <a-col :md="6" :sm="12">
              <a-form-item label="演练名称">
                <a-input allowClear placeholder="请输入" v-model:value="queryParam.name" />
              </a-form-item>
            </a-col>
            <a-col :md="6" :sm="12">
              <a-form-item label="演练签到表">
                <a-input allowClear placeholder="请输入" v-model:value="queryParam.drillCheckinFileName" />
              </a-form-item>
            </a-col>
            <a-col :md="6" :sm="12">
              <a-form-item label="演练评估">
                <a-input allowClear placeholder="请输入" v-model:value="queryParam.drillEvaluateFileName" />
              </a-form-item>
            </a-col>
            <a-col :md="6" :sm="12">
              <a-form-item label="录入时间">
                <a-range-picker style="width: -webkit-fill-available" :format="dateFormat" v-model:value="uploadDate" @change="onChangeTime" />
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
      <template #drillCheckinPath="{ record }">
        <span v-if="record.drillCheckinPath" style="color: #0091ff; cursor: pointer" @click="handlePreview(record.drillCheckinPath)">{{
          record.drillCheckinPath.split('/').slice(-1)[0]
        }}</span>
      </template>
      <template #drillEvaluatePath="{ record }">
        <span v-if="record.drillEvaluatePath" style="color: #0091ff; cursor: pointer" @click="handlePreview(record.drillEvaluatePath)">{{
          record.drillEvaluatePath.split('/').slice(-1)[0]
        }}</span>
      </template>
      <template #drillRecordPath="{ record }">
        <span v-if="record.drillRecordPath" style="color: #0091ff; cursor: pointer" @click="handlePreview(record.drillRecordPath)">{{
          record.drillRecordPath.split('/').slice(-1)[0]
        }}</span>
      </template>
      <template #responsePlanFilePath="{ record }">
        <span v-if="record.responsePlanFilePath" style="color: #0091ff; cursor: pointer" @click="handlePreview(record.responsePlanFilePath)">{{
          record.responsePlanFilePath.split('/').slice(-1)[0]
        }}</span>
      </template>
      <template #tableTitle>
        <a-button preIcon="ant-design:plus-outlined" type="primary" v-auth="'drill:add'" @click="handleAdd">新增</a-button>
        <a-button preIcon="ant-design:export-outlined" v-if="checkedKeys.length > 0" @click="handleDownloadSelect"> 打包下载</a-button>
        <a-button preIcon="ant-design:delete-outlined" v-if="checkedKeys.length > 0" v-auth="'drill:batchDel'" @click="batchHandleDelete">
          批量删除</a-button
        >
      </template>
      <template #action="{ record }">
        <TableAction :actions="getActions(record)" />
      </template>
    </BasicTable>
    <DrillRecordModal @register="registerModal" @success="reload" />
  </div>
</template>
<script lang="ts" setup>
  import { ref, reactive, computed, toRaw } from 'vue';
  import type { Dayjs } from 'dayjs';
  import { BasicTable, useTable, TableAction } from '/@/components/Table';
  import { useModal } from '/@/components/Modal';
  import { columns } from './drillRecord.data';
  import DrillRecordModal from './DrillRecordModal.vue';
  import { getList, deleteRecord, batchDeleteRecord, doReleaseData, doReovkeData } from './drillRecord.api';
  import { useMessage } from '/@/hooks/web/useMessage';
  const { createConfirm } = useMessage();
  import { downloadFileAll, previewFile, getOrgCodeList, getDepartmentList } from '/@/api/common/api';
  const [registerModal, { openModal }] = useModal();
  const [register, { openModal: openDetail }] = useModal();
  import { useUserStore } from '/@/store/modules/user';
  import JDictSelectTag from '/@/components/Form/src/jeecg/components/JDictSelectTag.vue';
  const userStore = useUserStore();
  const userinfo = computed(() => userStore.getUserInfo);
  const orgOptions = ref([]);
  const departOptions = ref([]);
  const checkedKeys = ref<Array<string | number>>([]);
  const toggleSearchStatus = ref(false);
  type RangeValue = [Dayjs, Dayjs];

  // 列表页面公共参数、方法
  const [registerTable, { reload, setProps }] = useTable({
    title: '应急演练记录列表',
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
  });
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
    orgCode: initOrgCode(),
    // departCode: initDeptCode(),
    departCode: undefined,
    typeCode: undefined,
    name: undefined,
    startTime: '',
    endTime: '',
    drillEvaluateFileName: '',
    drillCheckinFileName: '',
  });
  // loadData();
  // function loadData(){
  //  searchQuery();
  // }
  const dateFormat = 'YYYY-MM-DD';
  const uploadDate = ref<RangeValue>();
  function searchQuery() {
    setProps({ searchInfo: toRaw(queryParam) });
    reload();
  }
  function searchReset() {
    Object.assign(queryParam, {
      orgCode: initOrgCode(),
      // departCode: initDeptCode(),
      departCode: undefined,
      typeCode: undefined,
      name: undefined,
      startTime: '',
      endTime: '',
      drillEvaluateFileName: '',
      drillCheckinFileName: '',
    });
    uploadDate.value = undefined;
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
    if (date) {
      queryParam['startTime'] = dateString[0] + ' 00:00:00';
      queryParam['endTime'] = dateString[1] + ' 23:59:59';
    } else {
      queryParam['startTime'] = '';
      queryParam['endTime'] = '';
    }
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
  }
  getOrgList();
  function initOrgCode() {
    let queryParam = {};
    if (userinfo.value.orgCode.length > 6) {
      queryParam.orgCode = userinfo.value.orgCode.slice('0', '6');
      queryParam.departCode = userinfo.value.orgCode;
    } else if (userinfo.value.orgCode.length == 6) {
      queryParam.orgCode = userinfo.value.orgCode;
      queryParam.departCode = undefined;
    } else {
      queryParam.orgCode = undefined;
      queryParam.departCode = undefined;
    }
    if (userinfo.value.orgCode.length > 3 && userinfo.value.orgCode.slice('0', '6') != 'A04B01') {
      isCanSelectLine.value = true;
    } else {
      isCanSelectLine.value = false;
    }
    if (queryParam.orgCode) {
      departOptions.value = [];
      let params = {};
      params.orgCode = queryParam.orgCode;
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
    return queryParam.orgCode;
  }
  function initDeptCode() {
    let queryParam = {};
    if (userinfo.value.orgCode.length > 6) {
      queryParam.orgCode = userinfo.value.orgCode.slice('0', '6');
      queryParam.departCode = userinfo.value.orgCode;
    } else if (userinfo.value.orgCode.length == 6) {
      queryParam.orgCode = userinfo.value.orgCode;
      queryParam.departCode = undefined;
    } else {
      queryParam.orgCode = undefined;
      queryParam.departCode = undefined;
    }
    return queryParam.departCode;
  }
  function orgCodeChange(e: any) {
    departOptions.value = [];
    queryParam.departCode = undefined; //  reset city value
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

    // const { updateSchema } = formActionType;
    // updateSchema({
    //   field: 'departCode',
    //   componentProps: {
    //     options: departOptions.value,
    //   },
    // });
  }
  /**
   * 新增事件
   */
  function handleAdd() {
    openModal(true, {
      isUpdate: false,
      showFooter: true,
      title: '新增',
    });
  }

  /**
   * 编辑事件
   */
  function handleEdit(record) {
    openModal(true, {
      record,
      isUpdate: true,
      showFooter: true,
      title: '编辑',
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
   * 选择列配置
   */
  const rowSelection = {
    type: 'checkbox',
    columnWidth: 40,
    selectedRowKeys: checkedKeys,
    onChange: onSelectChange,
  };
  /**
   * 选择事件
   */
  function onSelectChange(selectedRowKeys: (string | number)[]) {
    checkedKeys.value = selectedRowKeys;
  }
  /**
   * 批量删除事件
   */
  async function batchHandleDelete() {
    await batchDeleteRecord({ ids: checkedKeys.value }, reload);
  }
  /**
   * 发布
   */
  async function handleRelease(id) {
    await doReleaseData({ id });
    reload();
  }
  /**
   * 撤销
   */
  async function handleReovke(id) {
    await doReovkeData({ id });
    reload();
  }
  /**
   * 查看
   */
  function handleDetail(record) {
    openModal(true, {
      isUpdate: true,
      showFooter: false,
      record: record,
      title: '查看',
    });
  }
  /**
   * 操作列定义
   * @param record
   */
  function getActions(record) {
    return [
      {
        label: '编辑',
        onClick: handleEdit.bind(null, record),
        auth: 'drill:edit',
        // ifShow: record.sendStatus == 0,
      },
      {
        label: '查看',
        onClick: handleDetail.bind(null, record),
      },
      {
        label: '下载',
        onClick: handleDownload.bind(null, record),
      },
      {
        label: '删除',
        auth: 'drill:del',
        onClick: handleDelete.bind(null, record),
        // popConfirm: {
        //   title: '是否确认删除',
        //   confirm: handleDelete.bind(null, record),
        // },
      },
    ];
  }
  // 单条下载
  function handleDownload(record) {
    let param = Object.assign({}, queryParam);
    param['id'] = record.id;
    delete param['pageNo'];
    delete param['pageSize'];
    downloadFileAll('/emergency/emergencyDrillRecord/downloadOne', '应急演练记录.zip', param);
  }
  // 打包下载
  function handleDownloadSelect() {
    let param = Object.assign({}, queryParam);
    param['ids'] = checkedKeys.value.join();
    delete param['pageNo'];
    delete param['pageSize'];
    downloadFileAll('/emergency/emergencyDrillRecord/downloadALL', '应急演练记录打包下载.zip', param);
  }
  /**
   * 下拉操作栏
   */
  function getDropDownAction(record) {
    return [
      // {
      //   label: '删除',
      //   ifShow: record.sendStatus != 1,
      //   popConfirm: {
      //     title: '是否确认删除',
      //     confirm: handleDelete.bind(null, record),
      //   },
      // },
      // {
      //   label: '发布',
      //   ifShow: record.sendStatus == 0,
      //   onClick: handleRelease.bind(null, record.id),
      // },
      // {
      //   label: '撤销',
      //   ifShow: record.sendStatus == 1,
      //   popConfirm: {
      //     title: '确定要撤销吗？',
      //     confirm: handleReovke.bind(null, record.id),
      //   },
      // },
      // {
      //   label: '查看',
      //   onClick: handleDetail.bind(null, record),
      // },
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
