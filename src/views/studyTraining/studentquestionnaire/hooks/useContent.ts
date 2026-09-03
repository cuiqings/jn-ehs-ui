import { list, del } from '../api';
import { createVNode } from 'vue';
import { BasicColumn, FormSchema } from '/@/components/Table';
import { useListPage } from '/@/hooks/system/useListPage';
import { useMessage } from '/@/hooks/web/useMessage';
import { QuestionCircleOutlined } from '@ant-design/icons-vue';
import { useModal } from '/@/components/Modal';
export const useContent = () => {
  const { createConfirm } = useMessage();
  const [registerModal, { openModal }] = useModal();
  const [registerStatisticsModal, { openModal: openStatisticsModal }] = useModal();
  const [registerRemindModal, { openModal: openRemindModal }] = useModal();
  const [registerFillModal, { openModal: openFillModal }] = useModal();
  const [registerFilledUsersModal, { openModal: openFilledUsersModal }] = useModal();
  const searchFormSchema = <FormSchema[]>[
    {
      label: '问卷状态',
      field: 'status',
      component: 'Select',
      componentProps: {
        options: [
          {
            label: '未开始',
            value: '0',
          },
          {
            label: '进行中',
            value: '1',
          },
          {
            label: '已结束',
            value: '2',
          },
        ],
      },
      colProps: { span: 6 },
    },
    {
      label: '发布时间',
      field: 'time',
      component: 'RangePicker',
      componentProps: {
        valueFormat: 'YYYY-MM-DD',
        style: { width: '100%' },
      },
      colProps: { span: 6 },
    },
    {
      label: '问卷名称',
      field: 'name',
      component: 'Input',
      colProps: { span: 6 },
    },
  ];
  const columns = <BasicColumn[]>[
    {
      title: '问卷名称',
      width: 200,
      dataIndex: 'name',
    },
    {
      title: '问卷说明',
      width: 300,
      dataIndex: 'instructions',
    },
    {
      title: '题目数量',
      dataIndex: 'quesNum',
    },
    {
      title: '发布日期',
      dataIndex: 'startTime',
    },
    {
      title: '有效期至',
      dataIndex: 'endTime',
    },
    {
      title: '状态',
      dataIndex: 'status',
      slots: { customRender: 'status' },
    },
  ];
  const getActions = (record: any) => {
    return [
      {
        label: '问卷填写',
        ifShow: !['0', '2'].includes(record.status) && record.answerStatus == 0,
        onClick: handleFill.bind(null, record),
      },
      {
        label: '查看',
        auth: ['questionnaire:edit'],
        ifShow: record.answerStatus == '1',
        onClick: handleViewFilled.bind(null, record),
      },
    ];
  };
  // 列表页面公共参数、方法
  const { tableContext, doRequest, onExportXls } = useListPage({
    designScope: 'questionnaire-list',
    tableProps: {
      api: list,
      columns: columns,
      formConfig: {
        schemas: searchFormSchema,
      },
      beforeFetch: (params) => {
        if (params.time) {
          let time = params.time.split(',');
          params.startTime = time[0];
          params.endTime = time[1];
        }
        return params;
      },
      showIndexColumn: true,
      indexColumnProps: {
        fixed: 'left',
      },
      actionColumn: {
        width: 100,
        title: '操作',
        dataIndex: 'action',
        slots: { customRender: 'action' },
      },
    },
  });
  const [registerTable, { reload }, { rowSelection, selectedRowKeys }] = tableContext;
  const handleAdd = () => {
    openModal(true, {
      title: '创建培训调查问卷',
      type: 'add',
    });
  };
  const handleFill = (data) => {
    openFillModal(true, {
      title: '问卷填写',
      type: 'add',
      data,
    });
  };
  
  // 批量删除
  const batchHandleDelete = () => {
    doRequest(() => del({ ids: selectedRowKeys.value.join(',') }));
  };
  const handleFilledNum = (data) => {
    openFilledUsersModal(true, data);
  };
  const handleViewFilled = (data) => {
    openFillModal(true, {
      title: '查看问卷',
      type: 'view',
      data,
    });
  };
  const handleSuccess = () => {
    reload();
  };
  return {
    registerTable,
    getActions,
    handleSuccess,
    onExportXls,
    rowSelection,
    batchHandleDelete,
    handleAdd,
    handleFilledNum,
    selectedRowKeys,
    registerModal,
    registerStatisticsModal,
    registerRemindModal,
    registerFillModal,
    registerFilledUsersModal,
    handleViewFilled,
  };
};
export default useContent;
