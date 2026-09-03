import { useListPage } from '/@/hooks/system/useListPage';
import { BasicColumn, FormSchema } from '/@/components/Table';
import { preview } from '../url/index';
import { list, del, getDepart3ListWithSecurity, loadTreeData, transcoding } from '../../url/index';
import { useModal } from '/@/components/Modal';
import { ref, computed } from 'vue';
import { useUserStore } from '/@/store/modules/user';
import { message } from 'ant-design-vue';
export const useMainContent = () => {
  const [registerModal, { openModal }] = useModal();
  const [registerPlayerModal, open] = useModal();
  const [registerEditModal, openEdit] = useModal();
  const [registerQuestionsModal, openQuestions] = useModal();
  const [registerBatchEditModal, openBatchEdit] = useModal();
  const userStore: any = useUserStore();
  const loginInfo = computed(() => userStore.getLoginInfo);
  const orgOptions: any = ref([]);
  // 部门树列表数据
  const treeData = ref<any[]>([]);
  // 当前展开的项
  const expandedKeys = ref<any[]>([]);
  // 当前选中的项
  const selectedKeys: any = ref([]);
  const searchFormSchema = <FormSchema[]>[
    {
      label: '视频名称',
      field: 'name',
      component: 'Input',
      colProps: { span: 6 },
    },
    {
      label: '创建时间',
      field: 'time',
      component: 'RangePicker',
      componentProps: {
        valueFormat: 'YYYY-MM-DD',
      },
      colProps: { span: 6 },
    },
    {
      label: '创建单位',
      field: 'orgCode',
      component: 'Select',
      componentProps: {
        options: [],
        showSearch: true,
        filterOption: (input: string, option: any) => {
          return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
        },
      },
      colProps: { span: 6 },
    },
    {
      label: '创建人',
      field: 'createUser',
      component: 'Input',
      colProps: { span: 6 },
    },
  ];
  const columns = <BasicColumn[]>[
    {
      title: '视频名称',
      align: 'left',
      dataIndex: 'name',
      ellipsis: true,
      slots: { customRender: 'name' },
    },
    {
      title: '视频时长',
      align: 'center',
      dataIndex: 'duration',
      customRender: ({ record }) => formatDuration(record.duration),
    },
    {
      title: '状态',
      align: 'center',
      width: 100,
      dataIndex: 'transcodingStatus',
      slots: { customRender: 'transcodingStatus' },
    },
    {
      title: '创建人',
      align: 'center',
      dataIndex: 'createUser',
    },
    {
      title: '创建时间',
      align: 'center',
      dataIndex: 'createTime',
    },
    {
      title: '创建单位',
      align: 'center',
      dataIndex: 'orgCode',
    },
  ];
  // 默认选中
  const setSelectedKey = (key: string) => {
    selectedKeys.value = [key];
  };
  // 类型
  const loadRootTreeData = async () => {
    try {
      treeData.value = [];
      const result = await loadTreeData({
        async: false,
        pcode: 'A02',
      });
      if (Array.isArray(result)) {
        treeData.value = result;
        treeData.value.unshift({
          title: '全部视频',
          key: '0',
          code: '0',
          children: [],
        });
        processTreeData(treeData.value);
      }
      if (expandedKeys.value.length === 0) {
        autoExpandParentNode();
      } else {
        if (selectedKeys.value.length === 0) {
          const item = treeData.value[0];
          if (item) {
            // 默认选中第一个
            setSelectedKey(item.key);
          }
        }
      }
    } catch (e) {
      console.error(e);
    }
  };
  const processTreeData = (data) => {
    return data.map((item) => {
      // 递归处理子节点
      if (item.children && item.children.length > 0) {
        item.children = processTreeData(item.children);
      }
      item.key = item.code;
      return item;
    });
  };
  // 自动展开父节点，只展开一级
  const autoExpandParentNode = () => {
    const item = treeData.value[0];
    if (item) {
      if (!item.isLeaf) {
        expandedKeys.value = [item.key];
      }
      // 默认选中第一个
      setSelectedKey(item.key);
    }
  };
  // 树选择事件
  const onSelect = (selKeys) => {
    if (selKeys.length > 0 && selectedKeys.value[0] !== selKeys[0]) {
      setSelectedKey(selKeys[0]);
    } else {
      // 这样可以防止用户取消选择
      setSelectedKey(selectedKeys.value[0]);
    }
    handleSuccess();
  };
  const handleSuccess = () => {
    (selectedRowKeys.value = []) && reload();
  };
  // 列表页面公共参数、方法
  const { tableContext, onImportXls, operateRequest } = useListPage({
    tableProps: {
      api: list,
      columns: columns,
      formConfig: {
        schemas: searchFormSchema,
        labelWidth: 80,
      },
      showIndexColumn: true,
      defSort: {
        column: 'updateTime',
        order: 'desc',
      },
      rowSelection: {
        fixed: 'left',
        getCheckboxProps: (record) => ({
          disabled: !(
            loginInfo.value.userInfo.orgCode === 'A04B01C11' ||
            loginInfo.value.userInfo.username === record.createBy ||
            loginInfo.value.userInfo.username === 'admin'
          ),
        }),
      },
      immediate: false,
      beforeFetch: (params) => {
        if (params.time) {
          const time = params.time.split(',');
          params['strTime'] = time[0] + ' 00:00:00';
          params['endTime'] = time[1] + ' 23:59:59';
          delete params['time'];
        }
        params.type = 'VIDEO';
        params.category = selectedKeys.value[0] === '0' ? undefined : selectedKeys.value[0];
        if (orgOptions.value.length === 1) {
          params.orgCode = orgOptions.value[0].value;
          getForm().setFieldsValue({
            orgCode: orgOptions.value[0].value,
          });
        }
        return params;
      },
      actionColumn: {
        width: 240,
        title: '操作',
        dataIndex: 'action',
        slots: { customRender: 'action' },
        fixed: 'right',
      },
    },
  });
  const [registerTable, { reload, getForm }, { rowSelection, selectedRowKeys }] = tableContext;
  const init = async () => {
    await loadRootTreeData();
    await getDepart3ListWithSecurity().then((res) => {
      orgOptions.value = res.map((item) => {
        return {
          label: item.departName,
          value: item.orgCode,
        };
      });
      getForm().updateSchema({
        field: 'orgCode',
        componentProps: {
          options: orgOptions.value,
          disabled: orgOptions.value.length === 1,
          placeholder: '请选择',
          showSearch: true,
          filterOption: (input: string, option: any) => {
            return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
          },
        },
      });
      if (orgOptions.value.length === 1) {
        getForm().setFieldsValue({
          orgCode: orgOptions.value[0]?.value,
        });
      }
      reload();
    });
  };
  init();

  const getActions = (record: any) => {
    return [
      {
        label: '预览',
        // ifShow: record.transcodingStatus === '1',
        onClick: handlePreview.bind(null, record),
      },
      {
        label: '编辑',
        auth: ['rsVideo:edit'],
        ifShow:
          loginInfo.value.userInfo.orgCode === 'A04B01C11' ||
          loginInfo.value.userInfo.username === record.createBy ||
          loginInfo.value.userInfo.username === 'admin',
        onClick: handleEdit.bind(null, record),
      },
      {
        label: '转码',
        ifShow: record.transcodingStatus != '2',
        onClick: handleReCodeing.bind(null, record),
      },
      {
        label: '删除',
        auth: ['rsVideo:del'],
        onClick: handleDelete.bind(null, record),
        ifShow:
          loginInfo.value.userInfo.orgCode === 'A04B01C11' ||
          loginInfo.value.userInfo.username === record.createBy ||
          loginInfo.value.userInfo.username === 'admin',
      },
      {
        label: '试题',
        // ifShow: record.transcodingStatus === '1',
        auth: ['rsVideo:del'],
        onClick: handleTestQuestions.bind(null, record),
      },
    ];
  };
  const handleAdd = () => {
    openModal(true);
  };
  const handlePreview = (data: any) => {
    preview(data.id).then((res) => {
      if (res) {
        open.openModal(true, {
          url: res,
          id: data.id,
        });
      }
    });
  };
  const handleReCodeing = (data: any) => {
    transcoding({ id: data.id }).then(() => {
      message.success('转码中，请稍后刷新页面查看最新状态');
    });
  };
  const handleEdit = (data: any) => {
    openEdit.openModal(true, data);
  };
  const handleBatchEdit = () => {
    openBatchEdit.openModal(true, {
      ids: selectedRowKeys.value.join(','),
    });
  };
  // 批量删除
  const batchHandleDelete = () => {
    operateRequest(() => del({ ids: selectedRowKeys.value.join(',') }), {
      confirm: true,
      isBatch: true,
    });
  };
  const handleDelete = (data: any) => {
    operateRequest(() => del({ ids: data.id }), {
      confirm: true,
      isBatch: false,
    });
  };
  // 转换视频时长
  const formatDuration = (duration: number) => {
    const h = Math.trunc(duration / 3600);
    const m = Math.trunc((duration % 3600) / 60);
    const s = Math.trunc((duration % 3600) % 60);
    return `${h ? `${h}:` : ''}${m >= 10 ? `${m}:` : `0${m}:`}${s >= 10 ? `${s}` : `0${s}`}`;
  };
  // 选择试题
  const handleTestQuestions = (data: any) => {
    preview(data.id).then((res) => {
      if (res) {
        openQuestions.openModal(true, {
          url: res,
          id: data.id,
        });
      }
    });
  };
  return {
    registerTable,
    getActions,
    rowSelection,
    handleAdd,
    onImportXls,
    handleSuccess,
    selectedRowKeys,
    batchHandleDelete,
    registerModal,
    registerPlayerModal,
    registerEditModal,
    treeData,
    selectedKeys,
    expandedKeys,
    onSelect,
    registerQuestionsModal,
    registerBatchEditModal,
    handleBatchEdit,
  };
};
export default useMainContent;
