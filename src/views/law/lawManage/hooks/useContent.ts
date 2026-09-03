import { BasicColumn, FormSchema } from '/@/components/Table';
import { render } from '/@/utils/common/renderUtils';
import { useListPage } from '/@/hooks/system/useListPage';
import { createVNode } from 'vue';
import { useMessage } from '/@/hooks/web/useMessage';
import { QuestionCircleOutlined } from '@ant-design/icons-vue';
import { useDrawer } from '/@/components/Drawer';
import { list, edit } from '../url/index';
export const useContent = () => {
  const { createConfirm, createMessage } = useMessage();
  const [registerDrawer, { openDrawer }] = useDrawer();
  const [viewRegisterDrawer, drawer] = useDrawer();
  const searchFormSchema = <FormSchema[]>[
    {
      label: '主题分类',
      field: 'topicType',
      component: 'JTreeSelect1',
      componentProps: ({ formModel }) => {
        return {
          url: '/sys/category/childList',
          params: {
            pid: '1719911661011816449',
          },
          fieldNames: {
            label: 'name',
            value: 'name',
            options: 'children',
          },
          onChange: (value, extra) => {
            if (value) {
              if (extra.triggerNode.props.fatherName) {
                formModel.topicCategory = extra.triggerNode.props.fatherName;
                formModel.topicTwoCategory = value;
              } else {
                formModel.topicCategory = value;
                formModel.topicTwoCategory = '';
              }
            } else {
              formModel.topicCategory = '';
              formModel.topicTwoCategory = '';
            }
          },
          getPopupContainer: () => document.body,
        };
      },
      colProps: { span: 6 },
    },
    {
      label: '文件编号',
      field: 'standardNumber',
      component: 'Input',
      colProps: { span: 6 },
    },
    {
      label: '文件名称',
      field: 'fileName',
      component: 'Input',
      colProps: { span: 6 },
    },
    {
      label: '发布部门',
      field: 'publishDepart',
      component: 'Input',
      colProps: { span: 6 },
    },
    {
      label: '状态',
      field: 'hierarchyStatus',
      component: 'JDictSelectTag',
      defaultValue: [],
      componentProps: {
        dictCode: 'law_status',
        placeholder: '请选择',
        stringToNumber: false,
        showChooseOption: false,
      },
      colProps: { span: 6 },
    },
    {
      label: '发布日期',
      field: 'publishDate',
      component: 'RangePicker',
      componentProps: {
        valueFormat: 'YYYY-MM-DD',
        style: {
          width: '100%',
        },
      },
      colProps: { span: 6 },
    },
    {
      label: '实施日期',
      field: 'executeDate',
      component: 'RangePicker',
      componentProps: {
        valueFormat: 'YYYY-MM-DD',
        style: {
          width: '100%',
        },
      },
      colProps: { span: 6 },
    },
    {
      label: '',
      field: 'topicCategory',
      component: 'Input',
      show: false,
    },
    {
      label: '',
      field: 'topicTwoCategory',
      component: 'Input',
      show: false,
    },
  ];
  const columns = <BasicColumn[]>[
    {
      title: '主题分类',
      width: 200,
      align: 'center',
      dataIndex: 'topicType',
      customRender: (data: any) => {
        return data.record.topicTwoCategory ? data.record.topicCategory + '>' + data.record.topicTwoCategory : data.record.topicCategory;
      },
    },
    {
      title: '文件编号',
      width: 200,
      align: 'center',
      dataIndex: 'standardNumber',
    },
    {
      title: '文件名称',
      width: 300,
      align: 'center',
      dataIndex: 'fileName',
    },
    {
      title: '发布部门',
      width: 150,
      align: 'center',
      dataIndex: 'publishDepart',
    },
    {
      title: '状态',
      width: 100,
      dataIndex: 'hierarchyStatus',
      customRender: ({ text }) => {
        return render.renderDict(text, 'law_status');
      },
    },
    {
      title: '发布日期',
      width: 150,
      dataIndex: 'publishDate',
    },
    {
      title: '实施日期',
      width: 150,
      dataIndex: 'executeDate',
    },
    {
      title: '阅读量',
      width: 150,
      dataIndex: 'readCount',
    },
  ];
  // 列表页面公共参数、方法
  const { tableContext } = useListPage({
    designScope: 'lawManage-list',
    tableProps: {
      api: list,
      columns: columns,
      formConfig: {
        schemas: searchFormSchema,
      },
      showIndexColumn: true,
      beforeFetch: (params) => {
        params.column = 'updateTime';
        if (params.publishDate) {
          const publishDate = params.publishDate.split(',');
          params['publishDateBegin'] = publishDate[0];
          params['publishDateEnd'] = publishDate[1];
          delete params['publishDate'];
        }
        if (params.executeDate) {
          const executeDate = params.executeDate.split(',');
          params['executeDateBegin'] = executeDate[0];
          params['executeDateEnd'] = executeDate[1];
          delete params['executeDate'];
        }
        return params;
      },
      actionColumn: {
        width: 160,
        title: '操作',
        dataIndex: 'action',
        slots: { customRender: 'action' },
        fixed: 'right',
      },
    },
  });
  const getActions = (record) => {
    return [
      {
        label: '查看',
        onClick: onView.bind(null, record),
      },
      {
        label: '编辑',
        onClick: onEdit.bind(null, record),
      },
      {
        label: '删除',
        onClick: handleDelete.bind(null, record),
      },
    ];
  };
  const [registerTable, { reload, setPagination }] = tableContext;
  const add = () => {
    openDrawer(true, {
      type: 'add',
    });
  };
  // 查看
  const onView = (record) => {
    drawer.openDrawer(true, record);
  };
  // 编辑
  const onEdit = (record) => {
    openDrawer(true, {
      type: 'edit',
      record,
    });
  };
  // 删除
  const handleDelete = (record) => {
    createConfirm({
      iconType: 'warning',
      icon: createVNode(QuestionCircleOutlined),
      title: '删除',
      content: record.relateFile ? '当前文件已被添加为关联文件，是否确定删除？' : '确定要删除吗？',
      onOk: () => {
        const data = record;
        data.isDeleted = 1;
        edit(data).then((res: any) => {
          if (res.success) {
            createMessage.success('删除成功！');
            handleSuccess(false);
          } else {
            createMessage.error(res.message);
          }
        });
      },
    });
  };
  const handleSuccess = (is = true) => {
    if (is) setPagination({ current: 1 });
    reload();
  };
  return {
    add,
    registerTable,
    getActions,
    registerDrawer,
    handleSuccess,
    viewRegisterDrawer,
  };
};
export default useContent;
