import { ref, reactive } from 'vue';
import { getToken, getLoginBackInfo } from '/@/utils/auth';
export const useStatement = () => {
  // 右键选中的id
  const nowChooseFile = ref('');
  const dataSource = ref([]);
  // 搜索条件
  const formInfo = reactive({
    text: '',
  });
  const tableLoading = ref(false);
  const treeLoading = ref(false);
  const fieldNames = reactive({
    children: 'data',
    title: 'value',
    key: 'id',
  });
  const token = getToken();
  const userInfo = <any>getLoginBackInfo();
  return {
    nowChooseFile,
    dataSource,
    formInfo,
    tableLoading,
    treeLoading,
    fieldNames,
    token,
    userInfo,
  };
};
export default useStatement;
