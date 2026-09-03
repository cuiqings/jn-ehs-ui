import { useModal } from '/@/components/Modal';
import { list } from '../api';
import { reactive, ref } from 'vue';
export const useContent = () => {

  const [registerD, { openModal: openModalD }] = useModal();

  const queryParamsD = reactive({
    pageNo: 1,
    pageSize: 10,
    type: 4
  });
   const columnsD = [
    {
      title: '序号',
      key: 'index',
      width: 80,
      customRender: ({ index }) => {
        const { current, pageSize } = paginationD.value;
        return (current - 1) * pageSize + index + 1;
      },
    },
    {
      title: '安全提示内容',
      dataIndex: 'playContent',
    },
    {
      title: '排序',
      dataIndex: 'sort',
      width: 80
    },
    {
      title: '首页轮播',
      dataIndex: 'displayFlag',
      width: 120,
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
    },
  ];
  const tableDataD = ref<any[]>([]);
  const handleChangeD = (opt) => {
    queryParamsD.pageNo = opt.current;
    Object.assign(paginationD.value, opt);
    getTipList()
  }
  const paginationD = ref<any>({
    current: 1,
    pageSize: 10,
    total: 0,
    showTotal: (total) => `共 ${total} 条`,
  });
  const getTipList = async () => {
    const res = await list(queryParamsD);
    tableDataD.value = res.records;
    paginationD.value.total = res.total;
  };
  getTipList();
  const loadD = async () => {
    await getTipList();
  };

  return {
    loadD,
    columnsD,
    tableDataD,
    registerD,
    openModalD,
    handleChangeD,
    paginationD
  }

}
