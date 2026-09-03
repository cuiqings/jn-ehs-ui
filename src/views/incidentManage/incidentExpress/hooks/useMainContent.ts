import { createVNode } from 'vue';
import { QuestionCircleOutlined } from '@ant-design/icons-vue';
import { useListPage } from '/@/hooks/system/useListPage';
import { BasicColumn, FormSchema } from '/@/components/Table';
import { useMessage } from '/@/hooks/web/useMessage';
import { useModal } from '/@/components/Modal';
import { useDrawer } from '/@/components/Drawer';
import { render } from '/@/utils/common/renderUtils';
import { list, manageDelete, deleteBatch, getOrganizationNew } from '../url/index';
import { tableType } from '../index';
import { dateFormat } from '/@/utils/common/compUtils';
import { h } from 'vue';
export const useMainContent = () => {
  const { createConfirm } = useMessage();
  const [registerModal, { openModal }] = useModal();
  //注册drawer
  const [registerDrawer, { openDrawer }] = useDrawer();
  const searchFormSchema = <FormSchema[]>[
    {
      label: '事件类型',
      field: 'types',
      component: 'JDictSelectTag',
      defaultValue: [],
      componentProps: {
        mode: 'multiple',
        dictCode: 'event_type',
        placeholder: '请选择',
        stringToNumber: false,
        showChooseOption: false,
      },
      colProps: { span: 6 },
    },
    {
      label: '发生单位',
      field: 'orgCodes',
      component: 'Select',
      componentProps: {
        mode: 'multiple',
        options: [],
      },
      colProps: { span: 6 },
    },
    {
      label: '事件描述',
      field: 'description',
      component: 'Input',
      colProps: { span: 6 },
    },
    {
      label: '发生时间',
      field: 'time',
      component: 'RangePicker',
      componentProps: {
        valueFormat: 'YYYY-MM-DD',
      },
      colProps: { span: 6 },
    },
    {
      label: '事件地点',
      field: 'address',
      component: 'Input',
      colProps: { span: 6 },
    },
    {
      label: '状态',
      field: 'status',
      component: 'JDictSelectTag',
      defaultValue: [],
      componentProps: {
        dictCode: 'event_search_status',
        placeholder: '请选择',
        stringToNumber: false,
        showChooseOption: false,
      },
      colProps: { span: 6 },
    },
  ];
  const columns = <BasicColumn[]>[
    {
      title: '事件类型',
      width: 150,
      dataIndex: 'type_dictText',
    },
    {
      title: '发生单位',
      width: 150,
      dataIndex: 'orgCode_dictText',
    },
    {
      title: '事件描述',
      width: 300,
      dataIndex: 'description',
    },
    {
      title: '现场照片',
      width: 100,
      align: 'center',
      dataIndex: 'photo',
      customRender: ({ text }) => {
        let imageStr = '';
        if (text !== '' && text) {
          if (text.split(',').length - 1 >= 2) {
            const firstCommaIndex = text.indexOf(','); // 获取第一个逗号的位置
            const secondCommaIndex = text.indexOf(',', firstCommaIndex + 1); // 获取第二个逗号的位置
            imageStr = text.substring(0, secondCommaIndex); //
          } else {
            imageStr = text;
          }
        }
        return render.renderImage({ text: imageStr });
      },
    },
    {
      title: '发生时间',
      width: 200,
      dataIndex: 'eventTime',
    },
    {
      title: '事件地点',
      width: 200,
      dataIndex: 'address',
    },
    {
      title: '临时处置措施',
      width: 300,
      dataIndex: 'interimMeasures',
    },
    {
      title: '状态',
      width: 200,
      dataIndex: 'status_dictText',
      customRender: ({ text, record }) => {
        return record.status === 7 || record.status === 10 ? h('span', { style: 'color: red' }, text) : text;
      },
    },
  ];
  // 列表页面公共参数、方法
  const { tableContext, onExportXls, doRequest } = useListPage({
    designScope: 'incidentExpress-list',
    tableProps: {
      api: list,
      columns: columns,
      formConfig: {
        schemas: searchFormSchema,
      },
      showIndexColumn: true,
      beforeFetch: (params) => {
        if (params.time) {
          const time = params.time.split(',');
          params['startTime'] = time[0] + ' 00:00';
          params['endTime'] = time[1] + ' 23:59';
          delete params['time'];
        }
        return params;
      },
      actionColumn: {
        width: 300,
        title: '操作',
        dataIndex: 'action',
        slots: { customRender: 'action' },
        fixed: 'right',
      },
    },
    exportConfig: {
      name: '事故事件快报-' + dateFormat(new Date(), 'yyyy-MM-dd'),
      url: '/eventmanage/jnEvent/exportXls',
    },
  });
  const getActions = (record: tableType) => {
    return [
      {
        label: '确认',
        auth: ['incidentExpress:ac'],
        onClick: onConfirm.bind(null, record),
        ifShow: record.status === 0,
      },
      {
        label: '调查确认',
        auth: ['incidentExpress:ic'],
        onClick: investigationConfirm.bind(null, record),
        ifShow: record.status === 3,
      },
      {
        label: '报告上传',
        auth: ['incidentExpress:riu'],
        onClick: reportUpload.bind(null, record),
        ifShow: record.status === 5 || record.status === 7,
      },
      {
        label: '报告审核',
        auth: ['incidentExpress:irr'],
        onClick: reportReview.bind(null, record),
        ifShow: record.status === 6,
      },
      {
        label: '整改落实',
        auth: ['incidentExpress:rai'],
        onClick: rectifyImplement.bind(null, record),
        ifShow: record.status === 8 || record.status === 10,
      },
      {
        label: '整改落实审核',
        auth: ['incidentExpress:rir'],
        ifShow: record.status === 9,
        onClick: rectifyImplementReview.bind(null, record),
      },
      {
        label: '查看',
        onClick: onView.bind(null, record),
      },
      {
        label: '编辑',
        onClick: onEdit.bind(null, record),
        ifShow: record.status === 0,
      },
      {
        label: '补充资料',
        auth: ['incidentExpress:am'],
        onClick: handleReplenishMaterial.bind(null, record),
        ifShow:
          record.status === 4 || record.status === 6 || record.status === 8 || record.status === 9 || record.status === 10 || record.status === 11,
      },
      {
        label: '删除',
        auth: ['incidentExpress:del'],
        onClick: handleDelete.bind(null, record),
      },
    ];
  };
  const [registerTable, { reload, getForm }, { rowSelection, selectedRowKeys }] = tableContext;
  const init = () => {
    getOrganizationNew().then((res) => {
      const orgOptions = res.map((item) => {
        return {
          label: item.departName,
          value: item.orgCode,
        };
      });
      getForm().updateSchema({
        field: 'orgCodes',
        componentProps: {
          options: orgOptions,
          placeholder: '请选择',
          disabled: orgOptions.length === 1,
        },
      });
      if (orgOptions.length === 1) {
        getForm().setFieldsValue({
          orgCodes: [orgOptions[0]?.value],
        });
      }
      reload();
    });
  };
  init();
  // 单个删除
  const handleDelete = (record: tableType) => {
    createConfirm({
      iconType: 'warning',
      icon: createVNode(QuestionCircleOutlined),
      title: '删除',
      content: '确定要删除吗？',
      onOk: () => {
        manageDelete({ id: record.id }, reload);
      },
    });
  };
  // 批量删除
  const batchHandleDelete = () => {
    doRequest(() => deleteBatch({ ids: selectedRowKeys.value }));
  };
  // 补充资料
  const handleReplenishMaterial = (record: tableType) => {
    openModal(true, record);
  };
  // 新增
  const accidentReport = () => {
    openDrawer(true, {
      type: 'add',
      showOkBtn: true,
      showFooter: true,
    });
  };
  // 查看
  const onView = (record: tableType) => {
    openDrawer(true, {
      type: 'view',
      showOkBtn: false,
      showFooter: true,
      record: record,
      status: record.status,
    });
  };
  // 确认
  const onConfirm = (record: tableType) => {
    openDrawer(true, {
      type: 'process',
      showOkBtn: false,
      showFooter: true,
      record: record,
      status: record.status,
    });
  };
  // 编辑
  const onEdit = (record: tableType) => {
    openDrawer(true, {
      type: 'edit',
      showOkBtn: true,
      showFooter: true,
      record: record,
    });
  };
  // 调查确认
  const investigationConfirm = (record: tableType) => {
    openDrawer(true, {
      type: 'process',
      showOkBtn: false,
      showFooter: true,
      record: record,
      status: record.status,
    });
  };
  // 报告上传
  const reportUpload = async (record: tableType) => {
    openDrawer(true, {
      type: 'process',
      showOkBtn: false,
      showFooter: true,
      record: record,
      status: record.status,
    });
  };
  // 报告审核
  const reportReview = (record: tableType) => {
    openDrawer(true, {
      type: 'process',
      showOkBtn: false,
      showFooter: true,
      record: record,
      status: record.status,
    });
  };
  // 整改落实
  const rectifyImplement = (record: tableType) => {
    openDrawer(true, {
      type: 'process',
      showOkBtn: false,
      showFooter: true,
      record: record,
      status: record.status,
    });
  };
  // 整改落实审核
  const rectifyImplementReview = (record: tableType) => {
    openDrawer(true, {
      type: 'process',
      showOkBtn: false,
      showFooter: true,
      record: record,
      status: record.status,
    });
  };
  const handleSuccess = () => {
    reload();
  };
  return {
    registerTable,
    selectedRowKeys,
    batchHandleDelete,
    getActions,
    rowSelection,
    registerModal,
    accidentReport,
    registerDrawer,
    handleSuccess,
    onExportXls,
  };
};
export default useMainContent;
