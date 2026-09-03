import { BasicModal, useModalInner } from '/@/components/Modal';
import { ref, reactive, nextTick } from 'vue';
import { useModal } from '/@/components/Modal';
import { list } from '../url/index';
import { tableType } from '../index';
export const useRepeatModal = (emit: any) => {
  const [compareRegisterModal, { openModal }] = useModal();
  const activeKey = ref('1');
  const listData = ref<tableType[]>([]);
  const listData1 = ref<tableType[]>([]);
  let record = reactive<tableType>({});
  const init = (orgCodes: string | undefined = undefined, eventTime: any | undefined = undefined, date: any | undefined = undefined) => {
    list({
      orderBy: 'event_time',
      pageNo: 1,
      pageSize: 4,
      orgCodes: orgCodes,
      startTime: date,
      endTime: eventTime,
    }).then((res) => {
      if (orgCodes) {
        const arr = res.records.filter((item: tableType) => item.id !== record.id);
        if (arr.length > 3) arr.pop();
        listData1.value = arr;
      } else {
        const arr = res.records.filter((item: tableType) => {
          item.distanceTime = distanceTime(item.eventTime);
          return item.id !== record.id;
        });
        if (arr.length > 3) arr.pop();
        listData.value = arr;
      }
      nextTick(() => {
        redoModalHeight();
      });
    });
  };
  const [registerModal, { closeModal, redoModalHeight }] = useModalInner((data) => {
    activeKey.value = '1';
    record = data;
    init(undefined, record.eventTime, time(record.eventTime));
  });
  const changeTabs = (type: string) => {
    if (type === '1') {
      init(undefined, record.eventTime, time(record.eventTime));
    } else {
      init(record.orgCode, record.eventTime, time(record.eventTime));
    }
  };
  // 离当前事件距离多少小时
  const distanceTime = (date) => {
    const time1 = new Date(record.eventTime + ':00').getTime();
    const time2 = new Date(date + ':00').getTime();
    return Math.ceil((time1 - time2) / 3600000);
  };
  // 72小时
  const time = (date) => {
    const time = new Date(date + ':00').getTime();
    return timeDate(time - 259200000);
  };
  // 年月日时分
  const timeDate = (eventTime: string | number) => {
    const date = new Date(eventTime);
    const Y = date.getFullYear() + '-';
    const M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
    const D = (date.getDate() < 10 ? '0' + date.getDate() : date.getDate()) + ' ';
    const h = (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':';
    const m = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
    return Y + M + D + h + m;
  };
  // 与此重复
  const onRepeatWithThis = (current) => {
    openModal(true, { current: current, itself: record });
  };
  const onSuccess = (type: number) => {
    closeModal();
    emit('success', type);
  };
  return {
    registerModal,
    BasicModal,
    activeKey,
    listData,
    listData1,
    changeTabs,
    onRepeatWithThis,
    compareRegisterModal,
    onSuccess,
  };
};
export default useRepeatModal;
