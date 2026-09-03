import { ActionItem, BasicColumn, FormSchema } from '/@/components/Table';
import { downloadFileAll } from '/@/api/common/api';
import { useListPage } from '/@/hooks/system/useListPage';
import { useDrawer } from '/@/components/Drawer';
import { inputPlanPageList, inputPlanDelete, investPlanCommitSign } from '../api';
import { useModal } from '/@/components/Modal';
import { Modal } from 'ant-design-vue';
import { useMessage } from '/@/hooks/web/useMessage';
import { onMounted, ref } from 'vue';
import dayjs from 'dayjs';

export const useContent = () => {
  const { createMessage } = useMessage();

  //定义表格列
  const columns: BasicColumn[] = [
    {
      title: '计划年度',
      dataIndex: 'year',
      width: 120,
    },
    {
      title: '所属单位',
      dataIndex: 'orgName',
      width: 200,
    },
    {
      title: '计划名称',
      dataIndex: 'planName',
      width: 300,
    },
    {
      title: '制表人',
      dataIndex: 'createUser',
      width: 120,
    },
    {
      title: '制表时间',
      dataIndex: 'createTime',
      width: 180,
    },
    {
      title: '计划状态',
      dataIndex: 'status',
      width: 120,
    },
  ];

  //表单搜索字段
  const searchFormSchema: FormSchema[] = [
    {
      label: '计划年度',
      field: 'year',
      component: 'DatePicker',
      componentProps: {
        placeholder: '请选择',
        picker: 'year',
        fieldNames: {
          label: 'departName',
          value: 'orgCode',
        },
        allowClear: false,
        format: 'YYYY',
        valueFormat: 'YYYY',
        style: { width: '100%' },
        defaultValue: dayjs().format('YYYY'),
      },
    },
  ];

  const [registerDrawer, { openDrawer }] = useDrawer();
  const [registerUpdateSignModal, { openModal: openUpdateSignModal }] = useModal();
  const [registerDetailModal, { openModal: openDetailModal }] = useModal();
  // 列表页面公共参数、方法
  const { tableContext } = useListPage({
    designScope: 'input-plan-filter',
    tableProps: {
      api: inputPlanPageList,
      columns: columns,
      formConfig: {
        schemas: searchFormSchema,
        resetFunc: resetFunc,
      },
      beforeFetch: (params) => {
        return params;
      },
      showIndexColumn: true,
      rowKey: 'id',
      rowSelection: {
        type: 'checkbox',
        getCheckboxProps: (record) => ({
          disabled: record.status != '起稿中',
        }),
      },
      actionColumn: {
        width: 260,
        fixed: 'right',
      },
    },
  });

  //BasicTable绑定注册
  const [registerTable, { reload, getSelectRowKeys, getForm }, { rowSelection }] = tableContext;

  onMounted(() => {
    getForm().setFieldsValue({
      year: new Date().getMonth() > 8 ? dayjs().add(1, 'year').format('YYYY') : dayjs().format('YYYY'),
    });
  });

  /**
   * 操作栏
   */
  function getTableAction(record): ActionItem[] {
    const actions: ActionItem[] = [
      {
        label: '查看',
        onClick: handleView.bind(null, record),
      },
      {
        label: '下载',
        auth: 'insurance:inputplan:download',
        onClick: handleDownload.bind(null, record),
      },
    ];
    // 根据状态显示不同操作
    if (record.status === '起稿中' && record.status != '签字完成') {
      actions.unshift({
        label: '编辑',
        auth: 'insurance:inputplan:edit',
        onClick: handleEdit.bind(null, record),
      });
    }
    if (record.status != '签字完成') {
      actions.push({
        label: '删除',
        color: 'error',
        auth: 'insurance:inputplan:delete',
        onClick: handleDel.bind(null, record),
      });
    }

    if (record.status == '待签字') {
      actions.push({
        label: '上传签字',
        auth: 'insurance:inputplan:upload',
        onClick: handleUploadSignature.bind(null, record),
      });
    }
    if (record.fileUrl && record.status != '签字完成') {
      actions.push({
        label: '提交签字',
        auth: 'insurance:inputplan:submit',
        onClick: handleSubmit.bind(null, record),
      });
    }

    return actions;
  }

  function resetFunc() {
    getForm().setFieldsValue({
      year: dayjs().format('YYYY'),
    });
  }

  function handleView(record) {
    openDetailModal(true, { title: '查看计划', record: JSON.parse(JSON.stringify(record)), disabled: true });
  }

  function handleEdit(record) {
    openDrawer(true, { title: '编辑计划', record: JSON.parse(JSON.stringify(record)) });
  }

  const downloading = ref(false);
  async function handleDownload(record) {
    if (downloading.value) return;
    downloading.value = true;
    await downloadFileAll('/investPlan/download?id=' + record.id, `${record.planName}.pdf`);
    setTimeout(() => {
      downloading.value = false;
    }, 300);
  }

  function handleSubmit(record) {
    Modal.confirm({
      title: '是否确认提交签字?',
      onOk() {
        investPlanCommitSign({ id: record.id }).then((res) => {
          reload();
        });
      },
      onCancel() {
        console.log('Cancel');
      },
    });
  }

  function handleUploadSignature(record) {
    openUpdateSignModal(true, { title: '上传签字', record: JSON.parse(JSON.stringify(record)) });
  }

  function handleDel(record) {
    Modal.confirm({
      title: '确定要删除吗?',
      onOk() {
        inputPlanDelete({ ids: record.id }).then((res) => {
          reload();
        });
      },
      onCancel() {
        console.log('Cancel');
      },
    });
  }

  function handleBatchExport() {
    const selectedRowKeys = getSelectRowKeys();
    if (selectedRowKeys.length === 0) {
      createMessage.warning('请选择要导出的数据');
      return;
    }
    createMessage.info('批量导出功能待实现');
  }

  function handleBatchDelete() {
    const selectedRowKeys = getSelectRowKeys();
    if (selectedRowKeys.length === 0) {
      createMessage.warning('请选择要删除的数据');
      return;
    }
    Modal.confirm({
      title: `确定要删除选中的 ${selectedRowKeys.length} 条计划吗?`,
      onOk() {
        inputPlanDelete({ ids: selectedRowKeys.join(',') }).then((res) => {
          reload();
        });
      },
      onCancel() {
        console.log('Cancel');
      },
    });
  }

  const add = () => {
    openDrawer(true, { title: '创建投入计划' });
  };

  return {
    add,
    reload,
    downloading,
    registerTable,
    getTableAction,
    registerDrawer,
    handleBatchExport,
    handleBatchDelete,
    registerUpdateSignModal,
    registerDetailModal,
    rowSelection,
  };
};
