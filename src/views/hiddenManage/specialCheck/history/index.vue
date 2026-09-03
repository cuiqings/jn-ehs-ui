<template>
  <div>
    <!--自定义查询区域-->
    <div class="jeecg-basic-table-form-container" @keyup.enter="searchQuery">
      <a-form ref="formRef" :model="queryParam" :label-col="labelCol" :wrapper-col="wrapperCol">
        <a-row :gutter="24">
          <a-col :md="6" :sm="12">
            <a-form-item label="检查类型">
              <a-select
                v-model:value="queryParam.checkType"
                :options="checkTypeOptions"
                :field-names="{ label: 'label', value: 'value' }"
                allowClear
                placeholder="请选择"
              />
            </a-form-item>
          </a-col>
          <a-col :md="6" :sm="12">
            <a-form-item label="任务名称">
              <a-input allowClear placeholder="请输入" v-model:value="queryParam.taskName" />
            </a-form-item>
          </a-col>
          <a-col :md="6" :sm="12">
            <a-form-item label="检查范围">
              <a-select v-model:value="queryParam.orgCodeRange" allowClear placeholder="请选择">
                <template v-for="item in orgOptions" :key="`${item.value}`">
                  <a-select-option :value="item.value">{{ item.label }}</a-select-option>
                </template>
              </a-select>
            </a-form-item>
          </a-col>
          <template v-if="toggleSearchStatus">
            <a-col :md="6" :sm="12">
              <a-form-item label="任务时间">
                <a-range-picker valueFormat="YYYY-MM-DD" format="YYYY-MM-DD" v-model:value="taskTime" @change="handleTaskTimeChange" />
              </a-form-item>
            </a-col>
            <a-col :md="6" :sm="12">
              <a-form-item label="检查人">
                <a-input allowClear placeholder="请输入" v-model:value="queryParam.checkPersonName" />
              </a-form-item>
            </a-col>
            <a-col :md="6" :sm="12">
              <a-form-item label="检查状态">
                <a-select v-model:value="queryParam.status" placeholder="请选择" :allowClear="true">
                  <a-select-option value="0">未检查</a-select-option>
                  <a-select-option value="1">已检查</a-select-option>
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
      <!--插槽:table标题-->
      <!-- <template #tableTitle>
        <a-button type="primary" preIcon="ant-design:export-outlined" v-auth="'yh:sk_yh_execute:export'" @click="onExportXls"> 导出</a-button>
      </template> -->
      <template #yhCount="{ record }">
        <a-button type="link" @click="showYhDetail(record)">{{ record.yhCount }}</a-button>
      </template>
      <template #status="{ record }">
        <a-tag v-if="record.status == '0'" color="red">未完成</a-tag>
        <a-tag v-else-if="record.status == '1'" color="green">已完成</a-tag>
      </template>
      <template #checkNotice="{ record }">
        <a-button v-if="record.status == '1'" type="link" @click="showCheckNotice(record)">查看</a-button>
      </template>
      <template #repairPlan="{ record }">
        <a-button v-if="record.status == '1'" type="link" @click="showRepairPlan(record)">查看</a-button>
      </template>
      <template #checkReport="{ record }">
        <a-button v-if="record.completeFlag == '1'" type="link" @click="showRepairReport(record)">查看</a-button>
      </template>
      <template #attachments="{ record }">
        <a-button v-if="record.videos || record.images" type="link" @click="showAttachments(record)">查看</a-button>
      </template>
      <template #action="{ record }">
        <TableAction :actions="getActions(record)" />
      </template>
    </BasicTable>
    <HistoryDrawer @register="registerHistoryDrawer" />
    <HistoryModal @register="registerHistoryModal" @success="historyCheckSuccess" />
    <UploadAttachmentsModal @register="registerUploadModal" @success="handleUploadSuccess" />
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
    <WordDrawer @register="registerWordDrawer" />
    <RepairDetailDrawer @register="registerRepairDetailDrawer" />
    <CheckDrawer @register="registerCheckDrawer" @success="checkSuccess" />
  </div>
</template>
<script lang="ts" setup name="specialCheck-history">
  import { ref, reactive, computed } from 'vue';
  import type { Dayjs } from 'dayjs';
  import { BasicTable, TableAction } from '/@/components/Table';
  import { BasicModal, useModalInner, useModal } from '/@/components/Modal';
  import { columns, checkColumns, checkColumns1 } from './history.data';
  import { getList, getYhCountList, getExportUrl } from './history.api';
  import { useListPage } from '/@/hooks/system/useListPage';
  import { getDepart3ListWithSecurity } from '/@/api/common/api';
  import { useUserStore } from '/@/store/modules/user';
  import { useDrawer } from '/@/components/Drawer';
  import HistoryDrawer from './HistoryDrawer.vue';
  import HistoryModal from './HistoryModal.vue';
  import UploadAttachmentsModal from './UploadAttachmentsModal.vue';
  import RepairDetailDrawer from './RepairDetailDrawer.vue';
  import { getFileAccessHttpUrl } from '/@/utils/common/compUtils';
  import { createImgPreview } from '/@/components/Preview/index';
  import { usePermission } from '/@/hooks/web/usePermission';
  import { initDictOptions } from '/@/utils/dict';
  import { getUserList } from '../task/task.api';
  import dayjs from 'dayjs';
  import WordDrawer from './WordDrawer.vue';
  import CheckDrawer from './CheckDrawer.vue';

  const { hasPermission } = usePermission();

  const [registerHistoryDrawer, { openDrawer: openHistoryDrawer }] = useDrawer();
  const [registerHistoryModal, { openDrawer: openHistoryModal }] = useDrawer();
  const [registerUploadModal, { openModal: openUploadModal }] = useModal();
  const [registerWordDrawer, { openDrawer: openWordDrawer }] = useDrawer();
  const [registerRepairDetailDrawer, { openDrawer: openRepairDetailDrawer }] = useDrawer();
  const [registerCheckDrawer, { openDrawer: openCheckDrawer }] = useDrawer();
  const userStore = useUserStore();
  const userinfo: any = computed(() => userStore.getUserInfo);
  const orgOptions: any = ref([]);
  const toggleSearchStatus = ref(false);
  type RangeValue = [Dayjs, Dayjs];
  const rangeValue = ref<RangeValue>();
  const yhData = ref([]);
  const visible = ref<boolean>(false);
  const emptyItem = ref<any>({});
  const planType = ref('1');
  const checkTypeOptions: any = ref([]);
  const taskTime: any = ref([]);

  const labelCol = reactive({
    xs: { span: 24 },
    sm: { span: 7 },
  });
  const wrapperCol = reactive({
    xs: { span: 24 },
    sm: { span: 16 },
  });
  const queryParam = reactive({
    orgCodeRange: undefined,
    taskName: undefined,
    checkType: undefined,
    checkPersonName: undefined,
    taskTimeStart: undefined,
    taskTimeEnd: undefined,
    status: undefined,
  });

  initDictConfig();
  // 初始化字典
  async function initDictConfig() {
    checkTypeOptions.value = await initDictOptions('special_check_type');
  }
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
      clickToRowSelect: false,
      // rowSelection: {
      //   getCheckboxProps: (record) => ({
      //     disabled: record.canCheck == '0', // Column configuration not to be checked
      //   }),
      // },
      actionColumn: {
        width: 300,
        title: '操作',
        dataIndex: 'action',
        slots: { customRender: 'action' },
        fixed: 'right',
      },
    },
    exportConfig: {
      name: dayjs(new Date()).format('YYYYMMDD') + '专项检查记录',
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
  /**
   * 重置查询条件
   */
  async function searchReset() {
    Object.assign(queryParam, {
      orgCodeRange: undefined,
      taskName: undefined,
      checkType: undefined,
      checkPersonName: undefined,
      taskTimeStart: undefined,
      taskTimeEnd: undefined,
      status: undefined,
    });
    rangeValue.value = undefined;
    taskTime.value = undefined;
    reload();
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
  function handleTaskTimeChange(date, dateString) {
    console.log(date, dateString);
    queryParam['taskTimeStart'] = dateString[0];
    queryParam['taskTimeEnd'] = dateString[1];
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
  }
  getOrgList();
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
        label: '检查',
        onClick: handleCheckDrawer.bind(null, record),
        ifShow: record.canCheckCurrent,
      },
      {
        label: '整改计划审批',
        onClick: handleHistoryModal.bind(null, record),
        ifShow: record.canApprovePlan && hasPermission('yh:special_check:approval'),
      },
      {
        label: '上传影像资料',
        onClick: handleUploadAttachmentsModal.bind(null, record),
        ifShow: record.status == '1' && hasPermission('yh:special_upload_file'),
      },
      {
        label: '查看',
        onClick: handleDetail.bind(null, record),
      },
    ];
  }
  /**
   * 检查
   */
  function handleCheckDrawer(record) {
    openCheckDrawer(true, {
      isUpdate: true,
      showFooter: true,
      record,
    });
  }
  /**
   * 上传影像资料
   */
  function handleUploadAttachmentsModal(record) {
    openUploadModal(true, { showFooter: true, record });
  }
  /**
   * 上传成功回调
   */
  function handleUploadSuccess() {
    reload();
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
  function historyCheckSuccess(val: any) {
    console.log('historyCheckSuccess', val);
    reload();
  }
  function showCheckNotice(record) {
    console.log('showCheckNotice', record);
    openWordDrawer(true, {
      title: '检查通报',
      type: 'notice',
      record,
    });
  }
  function showRepairPlan(record) {
    console.log('showRepairPlan', record);
    openRepairDetailDrawer(true, {
      record,
    });
  }
  function showRepairReport(record) {
    console.log('showCheckReport', record);
    openWordDrawer(true, {
      title: '整改报告',
      type: 'repair',
      record,
    });
  }
  function showAttachments(record) {
    openUploadModal(true, { showFooter: false, record });
  }
  function checkSuccess(val: any) {
    console.log('checkSuccess', val);
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
