import { ref, reactive, onMounted } from 'vue';
import { useMessage } from '/@/hooks/web/useMessage';
import { getInputRecordList, downloadInputRecord, uploadInputRecordSignature, viewInputRecord } from '../api';
import { mockInputRecordData, getYearList, getDataByYear, getAllData } from '../mockData';
import { InputRecord, YearOption } from '../types';

export const useContent = () => {
  const { createMessage } = useMessage();

  // 响应式数据
  const loading = ref(false);
  const selectedYear = ref('2024');
  const recordList = ref<InputRecord[]>([]);
  const yearOptions = ref<YearOption[]>([]);

  // 初始化数据
  const initData = () => {
    yearOptions.value = getYearList();
    loadData();
  };

  // 加载数据
  const loadData = async () => {
    loading.value = true;
    try {
      // 模拟API调用
      await new Promise((resolve) => setTimeout(resolve, 500));

      if (selectedYear.value) {
        const yearData = getDataByYear(selectedYear.value);
        recordList.value = yearData ? [yearData] : [];
      } else {
        recordList.value = getAllData();
      }
    } catch (error) {
      createMessage.error('数据加载失败');
      console.error('加载数据失败:', error);
    } finally {
      loading.value = false;
    }
  };

  // 年度筛选变化
  const handleYearChange = (value: string) => {
    selectedYear.value = value;
    loadData();
  };

  // 查询按钮点击
  const handleQuery = () => {
    loadData();
  };

  // 下载操作
  const handleDownload = async (record: InputRecord) => {
    try {
      createMessage.loading('正在下载...');
      await downloadInputRecord({ id: record.id, year: record.year });
      createMessage.success('下载成功');
    } catch (error) {
      createMessage.error('下载失败');
      console.error('下载失败:', error);
    }
  };

  // 上传签字版
  const handleUploadSignature = async (record: InputRecord) => {
    try {
      // 这里应该打开文件上传对话框
      createMessage.info('请选择要上传的签字版文件');
      // 模拟上传
      await new Promise((resolve) => setTimeout(resolve, 1000));
      createMessage.success('上传成功');
    } catch (error) {
      createMessage.error('上传失败');
      console.error('上传失败:', error);
    }
  };

  // 查看详情
  const handleView = async (record: InputRecord) => {
    try {
      const detail = await viewInputRecord({ id: record.id });
      createMessage.info(`查看 ${record.yearText} 年度投入台账详情`);
      console.log('台账详情:', detail);
    } catch (error) {
      createMessage.error('查看失败');
      console.error('查看失败:', error);
    }
  };

  // 页面挂载时初始化
  onMounted(() => {
    initData();
  });

  return {
    // 状态
    loading,
    selectedYear,
    recordList,
    yearOptions,

    // 方法
    handleYearChange,
    handleQuery,
    handleDownload,
    handleUploadSignature,
    handleView,
    loadData,
  };
};
