import { BasicColumn } from '/@/components/Table';
import { useListPage } from '/@/hooks/system/useListPage';
import { archivesPageList } from '../../api';
import { useDrawer } from '/@/components/Drawer';
import { useModal } from '/@/components/Modal';
import dayjs from 'dayjs';
import { useUserStore } from '/@/store/modules/user';
export const useContent = () => {
  const userStore: any = useUserStore();
  // 定义表格列
  const columns: BasicColumn[] = [
    {
      title: '单位',
      dataIndex: 'orgCode',
      width: 130,
      resizable: true,
    },
    {
      title: '车间/科室',
      dataIndex: 'workshop',
      width: 100,
      resizable: true,
    },
    {
      title: '姓名',
      dataIndex: 'userName',
      width: 100,
      resizable: true,
    },
    {
      title: '性别',
      dataIndex: 'sex',
      width: 90,
      resizable: true,
    },
    {
      title: '年龄',
      dataIndex: 'age',
      width: 90,
      resizable: true,
    },
    {
      title: '岗位',
      dataIndex: 'post',
      width: 100,
      resizable: true,
    },
    {
      title: '疾病或指标',
      dataIndex: 'diseaseName',
      width: 100,
      resizable: true,
    },
    {
      title: '数值',
      width: 90,
      dataIndex: 'numValue',
      resizable: true,
    },
    
    {
      title: '互保人员',
      width: 100,
      dataIndex: 'mutualInsurancePersonName',
      resizable: true,
    },
    {
      title: '采取的措施',
      dataIndex: 'measures',
      resizable: true,
    },
    {
      title: '检测状态',
      dataIndex: 'status',
      width: 140,
      slots: { customRender: 'status' },
    },
  ];

  const [registerDrawer, { openDrawer }] = useDrawer();
  const [registerCheckIn, { openDrawer: checkInOpen }] = useDrawer();
  const [registerCheckModal, { openModal }] = useModal();
 
  // 列表页面公共参数、方法
  const { tableContext, onExportXls, onImportXls } = useListPage({
    designScope: 'occupationalHealth-files-table',
    tableProps: {
      api: archivesPageList,
      immediate: true,
      columns: columns,
      useSearchForm: false,
      pagination: false
    },
    exportConfig: {
      name: () => {
        let name = '';
        name = dayjs(new Date()).format('YYYYMMDD') + '职业健康监护档案';
        return name;
      },
      url: '/archives/export',
      suffix: 'xlsx',
    },
    importConfig: {
      url: '/archives/import',
      success: () => {
        reload();
      },
    },
  });
  //BasicTable绑定注册
  const [registerTable, { getSelectRows, reload, getForm }, { rowSelection, selectedRowKeys }] = tableContext;

  return {
    reload,
    getForm,
    onExportXls,
    onImportXls,
    rowSelection,
    getSelectRows,
    registerTable,
    registerDrawer,
    openModal,
    selectedRowKeys,
    registerCheckModal,
    registerCheckIn,
    checkInOpen,
  };
};
