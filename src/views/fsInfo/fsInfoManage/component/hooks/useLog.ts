import { ref, reactive } from 'vue';
import { showFileLog } from '../../url/index';
import { logTableType } from '../../index';
export const useLog = () => {
  const logVisible = ref(false);
  const queryParam = reactive({ id: '' });
  const columns = [
    {
      title: '#',
      dataIndex: 'index',
      widtj: 50,
      align: 'center',
      customRender: ({ index }) => index + 1,
    },
    {
      title: '用户',
      dataIndex: 'userId',
      align: 'center',
    },
    {
      title: '操作类型',
      dataIndex: 'operateType',
      align: 'center',
      customRender: ({ text }) => {
        return filterDictText(text);
      },
    },
    {
      title: '操作时间',
      dataIndex: 'operateTime',
      align: 'center',
    },
  ];
  const dataSource = ref<logTableType[]>([]);
  const pagination = reactive({
    total: 1,
    current: 1,
    pageSize: 10,
  });
  const loading = ref(false);
  const operateType = [
    { value: '1', text: '创建', title: '创建' },
    { value: '2', text: '编辑', title: '编辑' },
    { value: '3', text: '删除', title: '删除' },
    { value: '4', text: '查看', title: '查看' },
    { value: '5', text: '下载', title: '下载' },
  ];
  const filterDictText = (value: string) => {
    return operateType.filter((item) => item.value === value)[0].text;
  };
  const openLop = async (id: string) => {
    logVisible.value = true;
    dataSource.value = [];
    queryParam.id = id;
    pagination.total = 1;
    pagination.current = 1;
    pagination.pageSize = 10;
    await logList();
  };
  const logList = async () => {
    loading.value = true;
    try {
      const res = await showFileLog(queryParam.id, pagination.current, pagination.pageSize);
      dataSource.value = res.records;
      if (res.total) {
        pagination.total = res.total;
      } else {
        pagination.total = 1;
      }
    } finally {
      loading.value = false;
    }
  };
  const pageChange = async (page: number, pageSize: number) => {
    pagination.current = page;
    pagination.pageSize = pageSize;
    await logList();
  };
  const handleCancel = () => {
    logVisible.value = false;
  };
  return {
    logVisible,
    columns,
    openLop,
    handleCancel,
    dataSource,
    pagination,
    loading,
    pageChange,
  };
};
export default useLog;
