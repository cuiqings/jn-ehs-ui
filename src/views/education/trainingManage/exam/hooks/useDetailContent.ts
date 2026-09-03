import { useListPage } from '/@/hooks/system/useListPage';
import { BasicColumn, FormSchema } from '/@/components/Table';
import { examDetails } from '../url/index';
import { ref, nextTick, onMounted, h } from 'vue';
import { dateFormat } from '/@/utils/common/compUtils';
import { useModal } from '/@/components/Modal';
import { examRecord, delUser } from '../url/index';
import { Modal } from 'ant-design-vue';
export const useDetailContent = () => {
  const taskId = ref<string>('');
  const columns = <BasicColumn[]>[
    {
      title: '学员',
      width: 100,
      align: 'center',
      dataIndex: 'userName',
    },
    {
      title: '工号',
      width: 100,
      align: 'center',
      dataIndex: 'workNo',
    },
    {
      title: '所属单位',
      width: 200,
      align: 'center',
      dataIndex: 'orgName',
    },
    {
      title: '考试状态',
      width: 100,
      align: 'center',
      dataIndex: 'status',
    },
    {
      title: '考试次数',
      width: 100,
      align: 'center',
      dataIndex: 'num',
    },
    {
      title: '考试最高分',
      width: 100,
      align: 'center',
      dataIndex: 'score',
    },
  ];
  const searchFormSchema = <FormSchema[]>[
    {
      label: '',
      field: 'type',
      component: 'Select',
      slot: 'type',
      defaultValue: '1',
      colProps: { span: 8 },
    },
    {
      label: '姓名',
      field: 'userName',
      component: 'Input',
      componentProps: {
        options: [],
      },
      colProps: { span: 6 },
    },
  ];
  const { tableContext, onExportXls } = useListPage({
    tableProps: {
      api: examDetails,
      columns: columns,
      formConfig: {
        schemas: searchFormSchema,
        labelWidth: 80,
        autoAdvancedCol: 3,
        resetFunc: () => {
          // if (orgOptions.value.length !== 1) {
          //   getForm().updateSchema({
          //     field: 'departCode',
          //     componentProps: {
          //       options: [],
          //     },
          //   });
          // }
        },
      },
      showIndexColumn: true,
      immediate: false,
      indexColumnProps: {
        fixed: 'left',
      },
      rowKey: 'userId',
      rowSelection: {
        fixed: 'left',
      },
      actionColumn: {
        width: 100,
        title: '操作',
        dataIndex: 'action',
        slots: { customRender: 'action' },
        fixed: 'right',
      },
      beforeFetch: (params) => {
        params.id = taskId.value;
        return params;
      },
    },
    exportConfig: {
      name: '考试明细-' + dateFormat(new Date(), 'yyyy-MM-dd'),
      url: '/edu/examTask/details/export',
      suffix: 'xlsx',
    },
  });

  const [registerTable, { getForm, reload, setColumns }, { rowSelection, selectedRowKeys }] = tableContext;
  // 考试记录
  const [registerRecore, { openModal: openRecord }] = useModal();

  function pageInit(id) {
    taskId.value = id;
    reload();
  }

  const getActions = (record: any) => {
    return [
      {
        label: '明细',
        auth: ['examTask:edit'],
        onClick: handleDetail.bind(null, record),
        disabled: record.status == '未参考',
      },
      {
        label: '删除',
        auth: ['examTask:del'],
        onClick: handleDel.bind(null, record),
      }
    ];
  };

  const handleDel = (data) => {
    console.log(data);
    Modal.confirm({
      title: '确定要删除吗?',
      onOk() {
        delUser({ id: taskId.value, userId: data.userId }).then(res => {
          reload();
        })
      },
    });
  };
  const batchHandleDelete = () => {
    Modal.confirm({
      title: '确定要删除吗?',
      onOk() {
        delUser({ id: taskId.value, userId: selectedRowKeys.value.join(',')}).then(res => {
          reload();
        })
      },
    });
  }

  const handleDetail = (data) => {
    console.log(data);
    examRecord({
      taskId: taskId.value,
      userId: data.userId,
    }).then((res) => {
      openRecord(true, res);
    });
  };
  return {
    getActions,
    onExportXls,
    registerTable,
    rowSelection,
    selectedRowKeys,
    batchHandleDelete,
    pageInit,
    registerRecore,
    openRecord,
  };
};
