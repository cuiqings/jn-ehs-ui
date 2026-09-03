import { useModal } from '/@/components/Modal';
import { list } from '../api';
import { reactive, ref } from 'vue';
export const useContent = () => {

  const [registerE, { openModal: openModalE }] = useModal();

  const queryParamsE = reactive({
    pageNo: 1,
    pageSize: 10,
    type: 5
  });
   const columnsE = [
    {
      title: '序号',
      key: 'index',
      width: 80,
      customRender: ({ index }) => {
        const { current, pageSize } = paginationE.value;
        return (current - 1) * pageSize + index + 1;
      },
    },
    {
      title: '类型',
      dataIndex: 'isTop',
      width: 120,
    },
    {
      title: '标题',
      dataIndex: 'title',
    },
    {
      title: '内容',
      dataIndex: 'playContent',
      ellipsis: true,
    },
    {
      title: '发布时间',
      dataIndex: 'playDate',
      width: 120,
    },
    {
      title: '标签',
      dataIndex: 'playLocation',
      width: 120,
    },
    {
      title: '状态',
      dataIndex: 'displayFlag',
      width: 100,
    },
    {
      title: '操作',
      key: 'action',
      width: 160,
    },
  ];
  const tableDataE = ref<any[]>([]);
  const handleChangeE = (opt) => {
    queryParamsE.pageNo = opt.current;
    Object.assign(paginationE.value, opt);
    getList()
  }
  const paginationE = ref<any>({
    current: 1,
    pageSize: 10,
    total: 0,
    showTotal: (total) => `共 ${total} 条`,
  });
  const getList = async () => {
    const res = await list(queryParamsE);
    tableDataE.value = res.records;
    paginationE.value.total = res.total;
  };
  getList();
  const loadE = async () => {
    await getList();
  };

  return {
    loadE,
    columnsE,
    tableDataE,
    registerE,
    openModalE,
    handleChangeE,
    paginationE
  }

}
