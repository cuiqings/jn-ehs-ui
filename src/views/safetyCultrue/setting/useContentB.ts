import { useDrawer } from '/@/components/Drawer';
import { list } from '../api';
import { reactive, ref } from 'vue';
export const useContent = () => {

  const [registerB, { openDrawer: openModalB }] = useDrawer();

  const queryParamsB = reactive({
    pageNo: 1,
    pageSize: 10,
    type: 2
  });
   const columnsB = [
    {
      title: '序号',
      key: 'index',
      width: 80,
      customRender: ({ index }) => {
        const { current, pageSize } = paginationB.value;
        return (current - 1) * pageSize + index + 1;
      },
    },
    {
      title: '置顶',
      dataIndex: 'isTop',
    },
    {
      title: '活动主题',
      dataIndex: 'title',
    },
    {
      title: '活动时间',
      dataIndex: 'playDate',
    },
    {
      title: '活动单位',
      dataIndex: 'orgName',
    },
    {
      title: '状态',
      dataIndex: 'delFlag',
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
    },
  ];
  const tableDataB = ref<any[]>([]);
  const handleChangeB = (opt) => {
    queryParamsB.pageNo = opt.current;
    Object.assign(paginationB.value, opt);
    getIdeaList()
  }
  const paginationB = ref<any>({
    current: 1,
    pageSize: 10,
    total: 0,
    showTotal: (total) => `共 ${total} 条`,
  });
  const getIdeaList = async () => {
    const res = await list(queryParamsB);
    tableDataB.value = res.records;
    paginationB.value.total = res.total;
  };
  getIdeaList();
  const loadB = async () => {
    const res = await getIdeaList();
  };

  return {
    loadB,
    columnsB,
    tableDataB,
    registerB,
    openModalB,
    handleChangeB,
    paginationB
  }

}
