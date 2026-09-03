<template>
  <div>
    <!--自定义查询区域-->
    <div class="jeecg-basic-table-form-container" @keyup.enter="searchQuery">
      <a-form ref="formRef" :model="queryParam" :label-col="labelCol" :wrapper-col="wrapperCol">
        <a-row :gutter="24">
          <a-col :md="6" :sm="12">
            <a-form-item label="类型">
              <a-select v-model:value="queryParam.postType" allowClear placeholder="请选择类型">
                <template v-for="item in typeOptions" :key="`${item.value}`">
                  <a-select-option :value="item.value">{{ item.label }}</a-select-option>
                </template>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :md="6" :sm="12">
            <a-form-item label="所属单位">
              <a-select
                v-model:value="queryParam.orgCode"
                @change="handleOrgCodeChange"
                allowClear
                placeholder="请选择所属单位"
                show-search
                :filter-option="filterOption"
              >
                <template v-for="item in orgOptions" :key="`${item.value}`">
                  <a-select-option :value="item.value">{{ item.label }}</a-select-option>
                </template>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :md="6" :sm="12">
            <a-form-item label="所属车间">
              <a-select v-model:value="queryParam.workshop" allowClear placeholder="请选择所属车间" show-search :filter-option="filterOption">
                <template v-for="item in departOptions" :key="`${item.value}`">
                  <a-select-option :value="item.value">{{ item.label }}</a-select-option>
                </template>
              </a-select>
            </a-form-item>
          </a-col>
          <template v-if="toggleSearchStatus">
            <a-col :md="6" :sm="12">
              <a-form-item label="岗位">
                <a-input allowClear placeholder="请输入岗位" v-model:value="queryParam.post" />
              </a-form-item>
            </a-col>
            <a-col :md="6" :sm="12">
              <a-form-item label="考评周期">
                <a-select v-model:value="queryParam.cycle" allowClear placeholder="请选择考评周期">
                  <template v-for="item in cycleOptions" :key="`${item.value}`">
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
    <BasicTable @register="registerTable" :searchInfo="queryParam" :rowSelection="rowSelection">
      <template #tableTitle>
        <a-button preIcon="ant-design:plus-outlined" type="primary" @click="handleAdd" v-auth="'safetyResponsibility:dual:add'"> 新增 </a-button>
        <a-button preIcon="ant-design:download-outlined" type="primary" @click="onExportTemplateXls" v-auth="'safetyResponsibility:dual:export'">
          导入模版下载
        </a-button>
        <a-button preIcon="ant-design:download-outlined" type="primary" @click="exportData" v-auth="'safetyResponsibility:dual:exportData'">
          导出
        </a-button>
      </template>
      <template #action="{ record }">
        <TableAction :actions="getActions(record)" />
      </template>
    </BasicTable>
    <DualModal @register="registerModal" @success="reload" />
  </div>
</template>

<script setup name="safetyResponsibility-dual" lang="ts">
  import { ref, reactive, toRaw } from 'vue';
  import { BasicTable, TableAction } from '/@/components/Table';
  import { useModal } from '/@/components/Modal';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useListPage } from '/@/hooks/system/useListPage';
  import { useMethods } from '/@/hooks/system/useMethods';
  import { Icon } from '/@/components/Icon';
  import DualModal from './DualModal.vue';
  import { columns, labelCol, wrapperCol, typeOptions, cycleOptions, orgOptions, departOptions, getDepartList } from './dual.data';
  import { getList, deleteRecord } from './dual.api';
  import { downloadFileAll } from '/@/api/common/api';
  const { createConfirm, createMessage } = useMessage();
  const [registerModal, { openModal }] = useModal();
  const toggleSearchStatus = ref(false);

  // 查询参数
  const queryParam = reactive({
    postType: undefined,
    orgCode: undefined,
    workshop: undefined,
    post: undefined,
    cycle: undefined,
  });

  /**
   * 列表页面公共参数、方法
   */
  const { tableContext } = useListPage({
    designScope: 'dual-prevention-list',
    tableProps: {
      title: '',
      api: getList,
      columns: columns,
      useSearchForm: false, // 禁用默认搜索表单
      showIndexColumn: false, // 已在columns中定义序号列
      actionColumn: {
        width: 200,
        title: '操作',
        dataIndex: 'action',
        slots: { customRender: 'action' },
        fixed: 'right',
      },
      rowKey: 'id',
      rowSelection: {
        type: 'checkbox',
      },
    },
  });

  const [registerTable, { reload, setProps }, { rowSelection, selectedRows }] = tableContext;

  /**
   * 搜索过滤选项
   */
  function filterOption(input: string, option: any) {
    return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
  }

  /**
   * 执行查询
   */
  function searchQuery() {
    setProps({ searchInfo: toRaw(queryParam) });
    reload();
  }

  /**
   * 重置查询
   */
  function searchReset() {
    Object.assign(queryParam, {
      postType: '',
      orgCode: '',
      workshop: '',
      post: '',
      cycle: '',
    });
    departOptions.value = [];
    reload();
  }

  /**
   * 处理所属单位变化事件
   */
  function handleOrgCodeChange(val: string) {
    queryParam.workshop = undefined;
    if (val) {
      getDepartList(val);
    }
  }

  /**
   * 新增事件
   */
  function handleAdd() {
    openModal(true, {
      isUpdate: false,
      showFooter: true,
    });
  }

  /**
   * 查看详情
   */
  function handleDetail(record) {
    openModal(true, {
      record,
      isUpdate: true,
      showFooter: false,
    });
  }

  /**
   * 删除事件
   */
  function handleDelete(record) {
    createConfirm({
      iconType: 'warning',
      title: '删除确认',
      content: `确定要删除"${record.orgName || ''}"的记录吗？`,
      onOk: () => {
        deleteRecord({ id: record.id }, () => {
          reload();
        });
      },
    });
  }

  /**
   * 操作列定义
   */
  function getActions(record) {
    return [
      {
        label: '查看',
        onClick: handleDetail.bind(null, record),
      },
      {
        label: '删除',
        onClick: handleDelete.bind(null, record),
        auth: 'safetyResponsibility:dual:delete',
      },
    ];
  }
  //导入模版下载
  function onExportTemplateXls() {
    const { handleExportXlsx } = useMethods();
    let params = {};
    handleExportXlsx('双清单导入模版', '/manifestManagement/downloadTemplate', params);
  }
  //导出数据
  function exportData() {
    if (selectedRows.value.length === 0) {
      downloadFileAll('/manifestManagement/export', '双清单数据.xlsx', queryParam).then((data) => {
        console.log(data);
      });
      return;
    }
    //把每个对象中postType 字段取出来，放到一个数组中
    let postTypeArr = selectedRows.value.map((item) => item.postType);
    //如果有不一样的提示
    if (new Set(postTypeArr).size !== 1) {
      createMessage.warning('请选择相同类型的记录');
      return;
    }
    // 科段级及以上的，必须是一个单位的才可以导出
    if (postTypeArr[0] === '科段级及以上') {
      let postTypeArr = selectedRows.value.map((item) => item.orgCode);
      if (new Set(postTypeArr).size !== 1) {
        createMessage.warning('请选择相同单位的记录');
        return;
      }
    } else {
      let postTypeArr = selectedRows.value.map((item) => item.workshop);
      if (new Set(postTypeArr).size !== 1) {
        createMessage.warning('请选择相同车间的记录');
        return;
      }
    }
    downloadFileAll('/manifestManagement/export', '双清单数据.xlsx', { ids: selectedRows.value.map((item) => item.id).join(',') }).then((data) => {
      console.log(data);
    });
  }
</script>

<style scoped lang="less">
  .jeecg-basic-table-form-container {
    .table-page-search-submitButtons {
      display: block;
      margin-bottom: 24px;
      white-space: nowrap;
    }
  }

  :deep(.ant-table-title) {
    min-height: 0 !important;
  }

  :deep(.ant-btn) {
    margin-right: 8px;

    &:last-child {
      margin-right: 0;
    }
  }
</style>
