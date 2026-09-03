import { reactive, ref, onMounted } from 'vue';
import { BasicDrawer, useDrawerInner } from '/@/components/Drawer';
import { add, getOrganizationNew } from '../url/index';
export const useEventHistoryArchive = (emit: any, infoRef: any) => {
  const orgOptions = ref<any[]>([]);
  // 获取当前年月日时分
  const timeDate = () => {
    const date = new Date();
    let str = '';
    const Y = date.getFullYear() + '-';
    const M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
    const D = (date.getDate() < 10 ? '0' + date.getDate() : date.getDate()) + ' ';
    const h = (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':';
    const m = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
    str = Y + M + D + h + m;
    return str;
  };
  const info = reactive({
    orgCode: '',
    lostWorkday: '',
    eventTime: timeDate(),
    type: '',
    result: '',
    description: '',
    photo: '',
    reportFile: '',
  });
  // 调查资料
  const surveyInformation = reactive({
    id: '',
    eventId: '',
    surveyFile: '',
    economicLossesFile: '',
    technologyFile: '',
    evidenceFile: '',
    medicineFile: '',
    craftFile: '',
    meetingFile: '',
    reportFile: '',
    trainingFile: '',
    otherFile: '',
  });
  onMounted(() => {
    getOrganizationNew().then((res) => {
      orgOptions.value = res.map((item) => {
        return {
          label: item.departName,
          value: item.orgCode,
        };
      });
      info.orgCode = orgOptions.value.length === 1 ? orgOptions.value[0].value : undefined;
    });
  });
  const [registerDrawer, { setDrawerProps, closeDrawer }] = useDrawerInner();
  const handleSubmit = async () => {
    const values = await infoRef.value.validate();
    setDrawerProps({ confirmLoading: true });
    add({ ...values, eventSurveyFile: surveyInformation })
      .then(() => {
        onClose();
        emit('success');
      })
      .finally(() => {
        setDrawerProps({ confirmLoading: false });
      });
  };
  const onClose = () => {
    Object.keys(info).forEach((item) => {
      info[item] = '';
      if (item === 'orgCode') {
        info[item] = orgOptions.value.length === 1 ? orgOptions.value[0].value : '';
      }
      if (item === 'eventTime') {
        info[item] = timeDate();
      }
    });
    Object.keys(surveyInformation).forEach((item) => {
      surveyInformation[item] = '';
    });
    closeDrawer();
  };
  return {
    surveyInformation,
    handleSubmit,
    BasicDrawer,
    registerDrawer,
    info,
    onClose,
    orgOptions,
  };
};
export default useEventHistoryArchive;
