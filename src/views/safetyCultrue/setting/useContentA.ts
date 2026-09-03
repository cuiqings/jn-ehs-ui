import { useModal } from '/@/components/Modal';
import { list } from '../api';
import { reactive, ref } from 'vue';
export const useContent = () => {

  const [registerA, { openModal: openModalA }] = useModal();

  const queryParamsA = reactive({
    pageNo: 1,
    pageSize: 10,
    type: 1
  });
   const columnsA = [
    {
      title: '序号',
      key: 'index',
      width: 80,
      customRender: ({ index }) => {
        const { current, pageSize } = paginationA.value;
        return (current - 1) * pageSize + index + 1;
      },
    },
    {
      title: '理念内容',
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
  const tableDataA = ref<any[]>([]);
  const handleChangeA = (opt) => {
    queryParamsA.pageNo = opt.current;
    Object.assign(paginationA.value, opt);
    getIdeaList()
  }
  const paginationA = ref<any>({
    current: 1,
    pageSize: 10,
    total: 0,
    showTotal: (total) => `共 ${total} 条`,
  });
  const getIdeaList = async () => {
    const res = await list(queryParamsA);
    tableDataA.value = res.records;
    paginationA.value.total = res.total;
  };
  getIdeaList();
  const loadA = async () => {
    const res = await getIdeaList();
  };

  return {
    loadA,
    columnsA,
    tableDataA,
    registerA,
    openModalA,
    handleChangeA,
    paginationA
  }

}
