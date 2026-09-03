import { ref, reactive } from 'vue';
import { message } from 'ant-design-vue';
import { useModal } from '/@/components/Modal';
import type { InputRecordItem, InputRecordQuery } from '../types';
import { investLedgerList } from '../api';
import { downloadFileAll } from '/@/api/common/api';

export function useContent() {
  const loading = ref(false);
  const recordList = ref<InputRecordItem[]>([]);
  const total = ref(0);
  const [registerViewModal, { openModal: openViewModal }] = useModal();

  const getRecordList = async (params) => {
    try {
      loading.value = true;
      const res = await investLedgerList(params);
      recordList.value = res.records;
      console.log('recordList.value', recordList.value);
      total.value = res.total;
    } catch (error) {
      message.error('获取数据失败');
    } finally {
      loading.value = false;
    }
  };

  const handleQuery = async (params) => {
    return await getRecordList(params);
  };

  const handleDownload = async (record: InputRecordItem) => {
    downloadFileAll('/investLedger/download', `${record.year}敬业集团生产系统安全投入费用预算.pdf`, { id: record.id });
  };

  const handleUpload = async (record: InputRecordItem) => {};

  const handleView = async (record: InputRecordItem) => {
    try {
      openViewModal(true, record);
    } catch (error) {
      message.error('查看失败');
    }
  };

  return {
    loading,
    recordList,
    handleQuery,
    handleDownload,
    handleUpload,
    handleView,
    registerViewModal,
    total,
  };
}
