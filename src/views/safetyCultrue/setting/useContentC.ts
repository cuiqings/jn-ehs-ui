import { useDrawer } from '/@/components/Drawer';
import { list } from '../api';
import { reactive, ref } from 'vue';
export const useContent = () => {

  const [registerC, { openDrawer: openModalC }] = useDrawer();

  const queryParamsC = reactive({
    pageNo: 1,
    pageSize: 10,
    type: 3
  });
   const columnsC = [
    {
      title: '序号',
      key: 'index',
      width: 80,
      customRender: ({ index }) => {
        const { current, pageSize } = paginationC.value;
        return (current - 1) * pageSize + index + 1;
      },
    },
    {
      title: '知识主题',
      dataIndex: 'title',
    },
    {
      title: '类型',
      dataIndex: 'isTop',
    },
    // {
    //   title: '排序',
    //   dataIndex: 'sort',
    // },
    {
      title: '发布时间',
      dataIndex: 'createTime',
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
  const tableDataC = ref<any[]>([]);
  const handleChangeC = (opt) => {
    queryParamsC.pageNo = opt.current;
    Object.assign(paginationC.value, opt);
    getIdeaList()
  }
  const paginationC = ref<any>({
    current: 1,
    pageSize: 10,
    total: 0,
    showTotal: (total) => `共 ${total} 条`,
  });
  const getIdeaList = async () => {
    const res = await list(queryParamsC);
    tableDataC.value = res.records;
    paginationC.value.total = res.total;
  };
  getIdeaList();
  const loadC = () => {
    getIdeaList();
  };

  return {
    loadC,
    columnsC,
    tableDataC,
    registerC,
    openModalC,
    handleChangeC,
    paginationC
  }

}
