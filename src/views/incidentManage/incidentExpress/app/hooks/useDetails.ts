import { queryById, getOrganizationNew, affirmLog, queryByEventId, queryVoByEventId } from '../../url/index';
import { useRouter } from 'vue-router';
import { watchEffect, reactive, ref } from 'vue';
import { getDictItemsByCode } from '/@/utils/dict/index';
export const useDetails = () => {
  const router = useRouter();
  const { currentRoute } = router;
  const current = ref(0);
  const info: any = reactive({});
  const currentStatus = ref('');
  // 事故确认
  const accidentConfirm = reactive({
    affirmerName: '',
    createTime: '',
    result: '',
    closeInfo: '',
    repeatEventName: '',
    repeatEventId: '',
  });
  // 调查确认
  const investigationConfirm = reactive({
    affirmerName: '',
    createTime: '',
    result: '',
  });
  // 调查报告
  const jnEventReportArr = ref<any[]>([]);
  // 最新整改落实
  const rectifyInfoArr = ref<any[]>([]);
  // 结案归档
  const closedFilingInfo = reactive({
    affirmerName: '',
    createTime: '',
  });
  watchEffect(async () => {
    if (currentRoute.value.query.id) {
      currentStatus.value = '';
      await queryById({ id: currentRoute.value.query.id }).then((res) => {
        Object.assign(info, res);
        currentStep(res.status, res.id);
        current.value = res.status;
      });
      await getOrganizationNew().then((res) => {
        const arry = res.filter((item) => item.orgCode === info.orgCode);
        info.orgCode = arry[0]?.departName;
      });
    }
  });
  const renderDict = (v, code) => {
    let text = '';
    const array = getDictItemsByCode(code) || [];
    const obj = array.filter((item) => item.value == v);
    if (obj.length > 0) {
      text = obj[0].text;
    }
    return text;
  };
  // 当前步骤
  const currentStep = (status: number, id: string) => {
    switch (status) {
      case 0:
        currentStatus.value = '待确认';
        break;
      case 3:
        currentStatus.value = '调查待确认';
        break;
      case 5:
        currentStatus.value = '调查报告待上传';
        break;
      case 6:
        currentStatus.value = '调查报告待审核';
        break;
      case 7:
        currentStatus.value = '调查报告待上传';
        break;
      case 8:
        currentStatus.value = '待整改落实';
        break;
      case 9:
        currentStatus.value = '整改落实待审核';
        break;
      case 10:
        currentStatus.value = '待整改落实';
        break;
    }
    // 事故确认
    if (status >= 1) {
      affirmLog({ eventId: id, operateOrder: 2 }).then((data) => {
        Object.assign(accidentConfirm, data);
      });
    }
    // 调查确认
    if (status > 3) {
      affirmLog({ eventId: id, operateOrder: 3 }).then((data) => {
        Object.assign(investigationConfirm, data);
      });
    }
    // 调查报告
    if (status >= 6) {
      jnEventReportArr.value = [];
      queryByEventId({ eventId: id }).then((data) => {
        jnEventReportArr.value = data.reverse();
      });
    }
    if (status >= 9) {
      rectifyInfoArr.value = [];
      queryVoByEventId({ eventId: id }).then((data) => {
        rectifyInfoArr.value = data.reverse();
      });
    }
    if (status === 11) {
      affirmLog({ eventId: id, operateOrder: 5 }).then((data) => {
        Object.assign(closedFilingInfo, data);
      });
    }
  };
  const goDetails = (id) => {
    router.push({
      path: '/app/incidentManage/details',
      query: {
        id,
      },
    });
  };
  return {
    info,
    current,
    renderDict,
    currentStatus,
    accidentConfirm,
    investigationConfirm,
    jnEventReportArr,
    rectifyInfoArr,
    closedFilingInfo,
    goDetails,
  };
};
export default useDetails;
