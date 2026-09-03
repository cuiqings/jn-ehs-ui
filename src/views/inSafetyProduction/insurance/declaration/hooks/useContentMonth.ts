import { ActionItem, BasicColumn } from '/@/components/Table';
import { useListPage } from '/@/hooks/system/useListPage';
import { queryByMonth } from '../../api'
import { useUserStore } from '/@/store/modules/user';
export const useContent = () => {
  const userStore = useUserStore();

  // 定义表格列
  const columns: BasicColumn[] = [
    {
      title: '月度',
      dataIndex: 'monthStr',
      width: 140,
      resizable: true,
    },
     {
      title: '所属单位',
      dataIndex: 'orgName',
      width: 140,
    },
    {
      title: '上报进度',
      dataIndex: 'progress',
      width: 140,
    },
    {
      title: '新增人数',
      dataIndex: 'addNum',
      width: 140,
    },
    {
      title: '减员人数',
      dataIndex: 'decreaseNum',
      width: 140,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 140,
      slots: { customRender: 'status' },
    },
  ];

  // 列表页面公共参数、方法
  const { tableContext, onExportXls, onImportXls } = useListPage({
    designScope: 'occupationalHealth-files-table',
    tableProps: {
      api: queryByMonth,
      immediate: true,
      columns: columns,
      showIndexColumn: true,
      useSearchForm: false,
      beforeFetch: (params) => { 
        params.orgCode = userStore.getUserInfo.orgCode?.slice(0, 9);
        return params;
      },
      actionColumn: {
        width: 60,
        title: '操作',
        dataIndex: 'action',
        slots: { customRender: 'action' },
        fixed: 'right',
      },
    },
  });
  //BasicTable绑定注册
  const [registerTable, { getSelectRows, reload, getForm }] = tableContext;
  /**
   * 操作栏
   */
  function getTableAction(record): ActionItem[] {
    return [
      {
        label: '下载',
        auth: 'occupationalHealth:files:edit',
        onClick: handleEdit.bind(null, record),
      }
    ];
  }

  function handleEdit(record) {
    openDrawer(true, { title: '编辑', record: JSON.parse(JSON.stringify(record)) });
  }
  
  return {
    reload,
    getForm,
    onExportXls,
    onImportXls,
    getSelectRows,
    registerTable,
    getTableAction
  }
};