import { BasicColumn, FormSchema } from '/@/components/Table';
import { render } from '/@/utils/common/renderUtils';
import { useListPage } from '/@/hooks/system/useListPage';
import { createVNode, ref, onMounted } from 'vue';
import { useMessage } from '/@/hooks/web/useMessage';
import { QuestionCircleOutlined } from '@ant-design/icons-vue';
import { useDrawer } from '/@/components/Drawer';
import { list, batchDelete, fileCategoryCount } from '../api';
import { doPreview } from '/@/api/common/api';
import { downloadFileManage } from '/@/utils/common/renderUtils';
export const useContent = () => {
  const fileContent = ref('');
  const fileCategoryData: any = ref([]);
  const selectedKeys: any = ref([]);
  const { createConfirm } = useMessage();
  const [registerDrawer, { openDrawer }] = useDrawer();
  const searchFormSchema = <FormSchema[]>[
    {
      label: '文件名称',
      field: 'fileName',
      component: 'Input',
      colProps: { span: 6 },
    },
    {
      label: '编号',
      field: 'fileNum',
      component: 'Input',
      colProps: { span: 6 },
    },

    {
      label: '备注',
      field: 'remarks',
      component: 'Input',
      colProps: { span: 6 },
    },
  ];
  const columns = <BasicColumn[]>[
    {
      title: '文件名称',
      align: 'center',
      dataIndex: 'fileName',
      width: 200,
    },
    {
      title: '文件类别',
      align: 'center',
      dataIndex: 'fileCategory',
      width: 200,
      customRender: ({ text }) => {
        return render.renderDict(text, 'file_category');
      },
    },
    {
      title: '编号',
      align: 'center',
      dataIndex: 'fileNum',
      width: 200,
    },
    {
      title: '发布日期',
      dataIndex: 'publishDate',
      width: 160,
    },
    {
      title: '备注',
      dataIndex: 'remarks',
      width: 200,
    },
    {
      title: '文件',
      align: 'center',
      dataIndex: 'fileUrl',
      width: 350,
      slots: { customRender: 'fileUrl' },
    },
  ];
  // 列表页面公共参数、方法
  const { tableContext } = useListPage({
    designScope: 'knowledgeBase-list',
    tableProps: {
      api: list,
      columns: columns,
      formConfig: {
        schemas: searchFormSchema,
      },
      showIndexColumn: true,
      indexColumnProps: {
        fixed: 'left',
      },
      immediate: false,
      beforeFetch: (params) => {
        params.fileCategory = selectedKeys.value[0];
        return params;
      },
      actionColumn: {
        width: 220,
        title: '操作',
        dataIndex: 'action',
        slots: { customRender: 'action' },
        fixed: 'right',
      },
    },
  });
  onMounted(async () => {
    await initFileCategoryCount();
    selectedKeys.value = [fileCategoryData.value[0].value];
    reload();
  });
  const getActions = (record) => {
    return [
      {
        label: '查看',
        onClick: onView.bind(null, record),
      },
      {
        label: '编辑',
        auth: ['knowledgeBase:edit'],
        onClick: onEdit.bind(null, record),
      },
      {
        label: '下载',
        onClick: handleDownload.bind(null, record),
      },
      {
        label: '删除',
        auth: ['knowledgeBase:del'],
        onClick: handleDelete.bind(null, record),
      },
    ];
  };
  const [registerTable, { reload }, { rowSelection, selectedRowKeys }] = tableContext;
  const initFileCategoryCount = async () => {
    await fileCategoryCount().then((res) => {
      fileCategoryData.value = res;
    });
  };
  const add = () => {
    openDrawer(true, {
      type: 'add',
    });
  };
  const handleMenuSelect = (value) => {
    selectedKeys.value = value.selectedKeys;
    reload();
  };
  // 查看
  const onView = (record) => {
    openDrawer(true, {
      type: 'view',
      record,
    });
  };
  // 编辑
  const onEdit = (record) => {
    openDrawer(true, {
      type: 'edit',
      record,
    });
  };
  const handleDownload = (record) => {
    downloadFileManage(record.fileUrl);
  };
  // 删除
  const handleDelete = (record) => {
    createConfirm({
      iconType: 'warning',
      icon: createVNode(QuestionCircleOutlined),
      title: '删除',
      content: '确定要删除吗？',
      onOk: () => {
        return new Promise<void>((resolve, reject) => {
          batchDelete({ ids: [record.id] })
            .then((res) => {
              if (res) {
                handleSuccess();
                resolve();
              } else {
                reject(new Error('删除失败！'));
              }
            })
            .catch(() => {
              resolve();
            });
        });
      },
    });
  };
  const handleSuccess = () => {
    reload();
    initFileCategoryCount();
  };
  /**
   * 批量删除事件
   */
  const batchHandleDelete = () => {
    createConfirm({
      iconType: 'warning',
      icon: createVNode(QuestionCircleOutlined),
      title: '批量删除',
      content: `是否删除已选中的${selectedRowKeys.value.length}项？`,
      onOk: () => {
        batchDelete({ ids: selectedRowKeys.value }).then(() => {
          handleSuccess();
          selectedRowKeys.value = [];
        });
      },
    });
  };
  const handlePreview = (filePathParam) => {
    if (filePathParam) {
      doPreview(filePathParam).then((res) => {
        window.open(res, '_blank');
      });
    }
  };
  return {
    add,
    registerTable,
    getActions,
    registerDrawer,
    handleSuccess,
    fileContent,
    handlePreview,
    rowSelection,
    batchHandleDelete,
    selectedRowKeys,
    fileCategoryData,
    selectedKeys,
    handleMenuSelect,
  };
};
export default useContent;
