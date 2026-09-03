import { useListPage } from '/@/hooks/system/useListPage';
import { BasicColumn, FormSchema } from '/@/components/Table';
import { ref, nextTick, onMounted, h } from 'vue';
import { useDrawer } from '/@/components/Drawer';
import { useModal } from '/@/components/Modal';
import { useMethods } from '/@/hooks/system/useMethods';
import { getOrganizationNew, list, del, getDeptNew, delBatch } from '../url/index';
  import { getEduOrgList } from '/@/api/common/api';
export const useMainContent = (tableRef) => {
  const [registerDrawer, { openDrawer }] = useDrawer();
  const [registerAddModal, { openModal: openAddModal }] = useModal();
  const [registerDetailModal, { openModal: openDetailModal }] = useModal();
  const orgOptions: any = ref([]);
  const departOptions: any = ref([]);
  // 类型统计
  const typeStatisticsInfo = ref({
    notOrganized: 0,
    training: 0,
    finish: 0,
  });
  // 在用状态统计
  const statisticsInfo = ref({
    notOrganized: 0,
    training: 0,
    timeoutNotCompleted: 0,
  });
  const visible = ref(false);
  const info = ref({
    reason: '',
  });
  const searchFormSchema = <FormSchema[]>[
    {
      label: '讲师姓名',
      field: 'name',
      component: 'Input',
      colProps: { span: 6 },
    },
    {
      label: '所属单位',
      field: 'orgCode',
      component: 'TreeSelect',
      componentProps: {
        options: [],
        showSearch: true,
        placeholder: '请选择',
      },
      colProps: { span: 6 },
    },
  ];
  const columns = <BasicColumn[]>[
    {
      title: '讲师姓名',
      width: 150,
      align: 'center',
      dataIndex: 'userName',
    },
    {
      title: '所属单位',
      width: 200,
      align: 'center',
      dataIndex: 'orgName',
    },
    {
      title: '讲师介绍',
      width: 100,
      align: 'center',
      dataIndex: 'describes',
    },
    {
      title: '讲师评分',
      width: 100,
      align: 'center',
      dataIndex: 'rating',
    },
  ];
  const handleSuccess = () => {
    nextTick(() => {
      selectedRowKeys.value = [];
      reload();
    });
  };
  const { tableContext, onImportXls, operateRequest } = useListPage({
    tableProps: {
      api: list,
      columns: columns,
      formConfig: {
        schemas: searchFormSchema,
        labelWidth: 80,
        autoAdvancedCol: 3,
      },
      showIndexColumn: true,
      immediate: false,
      indexColumnProps: {
        fixed: 'left',
      },
      rowSelection: {
        fixed: 'left',
      },
      beforeFetch: (params) => {
        if (params.time) {
          let arr = params.time.split(',');
          params.strTime = arr[0];
          params.endTime = arr[1];
        }
        return params;
      },
      actionColumn: {
        width: 180,
        title: '操作',
        dataIndex: 'action',
        slots: { customRender: 'action' },
        fixed: 'right',
      },
    },
    importConfig: {
      url: '/edu/employeeEntry/import',
      success: handleSuccess,
    },
  });
  const [registerTable, { getForm, reload, setColumns }, { rowSelection, selectedRowKeys, selectedRows }] = tableContext;
  const init = () => {
    getEduOrgList({ level: 3 }).then((res) => {
      orgOptions.value =setOrgOptions(res)
      getForm().updateSchema({
        field: 'orgCode',
        componentProps: {
          treeNodeFilterProp: 'label',
          treeData: orgOptions.value,
        },
      });
      reload();
    });
  };
  onMounted(() => {
    init();
  });
  function setOrgOptions(list) {
      list.forEach((item) => {
        item.label = item.title;
        item.value = item.key;
        item.id = item.id;
        if(item.key.length < 9){
          item.selectable = false;
        }
        delete item.key;
        if (item.children) {
          item.children = setOrgOptions(item.children);
        }
      });
      return list;
    }
  // 车间
  const getDepartList = (orgCode) => {
    getDeptNew({ orgCode }).then(async (res) => {
      departOptions.value = res.map((item: any) => {
        return {
          label: item.departName,
          value: item.orgCode,
        };
      });
      getForm().updateSchema({
        field: 'departCode',
        componentProps: {
          options: departOptions.value,
        },
      });
    });
  };

  const getActions = (record: any) => {
    return [
      {
        label: '详情',
        auth: ['lecture:edit'],
        onClick: handleDetail.bind(null, record),
      },
      {
        label: '编辑',
        auth: ['lecture:edit'],
        onClick: handleEdit.bind(null, record),
      },
      {
        label: '删除',
        auth: ['lecture:del'],
        onClick: handleDelete.bind(null, record),
      },
    ];
  };
  const handleAdd = () => {
    openAddModal(true, {
      title: '新增',
      type: 'add',
      showOkBtn: true,
    });
  };
  const handleEdit = (data: any) => {
    openAddModal(true, {
      title: '编辑',
      type: 'edit',
      showOkBtn: true,
      data,
    });
  };
  const handleDetail = (data) => {
    console.log(data);

    openDetailModal(true, {
      title: data.examTaskName,
      data,
    });
  };

  const handleDelete = (data: any) => {
    operateRequest(
      () => del({ id: data.id }),
      {
        confirm: true,
        isBatch: false,
      },
      () => handleSuccess()
    );
  };

  const handleBatchDel = () => {
    operateRequest(
      () => delBatch({ ids: selectedRowKeys.value.join(',') }),
      { confirm: true, isBatch: true },
      () => handleSuccess()
    );
  };

  //导入模版下载
  const onExportTemplateXls = () => {
    const { handleExportXlsx } = useMethods();
    handleExportXlsx('新员工入职模版', '/edu/employeeEntry/downloadTemplate');
  };
  return {
    registerTable,
    getActions,
    rowSelection,
    handleAdd,
    onImportXls,
    registerDrawer,
    handleSuccess,
    onExportTemplateXls,
    selectedRowKeys,
    selectedRows,
    registerAddModal,
    statisticsInfo,
    typeStatisticsInfo,
    visible,
    registerDetailModal,
    info,
    handleBatchDel,
  };
};
export default useMainContent;
