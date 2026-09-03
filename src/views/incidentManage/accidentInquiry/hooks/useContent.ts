import { ref, reactive, onMounted } from 'vue';
import { useModal } from '/@/components/Modal';
import { useDrawer } from '/@/components/Drawer';
import { list, getOrgInfoForOrgCode } from '../url/index';
import { getDictItemsByCode } from '/@/utils/dict/index';
import { getLoginBackInfo } from '/@/utils/auth';
export const useContent = () => {
  const userInfo: any = getLoginBackInfo();
  // 天数补正
  const [registerModal, { openModal }] = useModal();
  // 补充资料
  const [materialRegisterModal, materialModal] = useModal();
  // 详情
  const [viewRegisterModal, viewModal] = useModal();
  //注册drawer
  const [registerDrawer, { openDrawer }] = useDrawer();
  const queryParams = reactive({
    orderBy: 'event_time',
    orgCodes: [] as any[],
    types: [],
    results: [],
    description: '',
    time: [],
    startTime: '',
    endTime: '',
  });
  const page = reactive({
    total: 0, // 共多少条
    pageSize: 9,
    pageNo: 1,
  });
  const listData = ref<any[]>([]);
  const toggleSearchStatus = ref(false);
  const spinning = ref(true);
  const orgOptions = ref<any[]>([]);
  const init = () => {
    spinning.value = true;
    const params: any = Object.assign({}, queryParams);
    params.orgCodes = params.orgCodes.join(',');
    params.types = params.types.join(',');
    params.results = params.results.join(',');
    if (params.time && params.time.length > 0) {
      params.startTime = params.time[0];
      params.endTime = params.time[1];
    } else {
      params.startTime = '';
      params.endTime = '';
    }
    delete params.time;
    list({ ...params, pageNo: page.pageNo, pageSize: page.pageSize })
      .then((data) => {
        listData.value = data.records;
        page.total = data.total;
      })
      .finally(() => {
        spinning.value = false;
      });
  };
  onMounted(async () => {
    await getOrgInfoForOrgCode().then((res) => {
      orgOptions.value = res;
    });
    queryParams.orgCodes =
      userInfo.userInfo.orgCode.length === 3 || userInfo.departs[0].isSecuritySector === '1' ? [] : [userInfo.userInfo.orgCode.slice(0, 6)];
    init();
  });
  const onChange = (pageNumber: number) => {
    page.pageNo = pageNumber;
    init();
  };
  const searchQuery = () => {
    page.pageNo = 1;
    init();
  };
  const searchReset = () => {
    Object.assign(queryParams, {
      orgCodes: userInfo.userInfo.orgCode.length === 3 || userInfo.departs[0].isSecuritySector === '1' ? [] : [userInfo.userInfo.orgCode.slice(0, 6)],
      types: [],
      results: [],
      description: '',
      time: [],
      startTime: '',
      endTime: '',
    });
    page.pageNo = 1;
    init();
  };
  const handleAdd = () => {
    openDrawer(true);
  };
  // 损失天数补正
  const dayCorrection = (record) => {
    openModal(true, record);
  };
  // 补充资料弹框
  const handleReplenishMaterial = (record) => {
    record.id = record.eventId;
    materialModal.openModal(true, record);
  };
  const handleView = async (record) => {
    viewModal.openModal(true, record);
  };
  const onSuccess = () => {
    page.pageNo = 1;
    init();
  };
  const imgText = (text) => {
    let imageStr = '';
    if (text !== '' && text) {
      if (text.split(',').length - 1 >= 1) {
        const secondCommaIndex = text.indexOf(',');
        imageStr = text.substring(0, secondCommaIndex);
      } else {
        imageStr = text;
      }
    }
    return imageStr;
  };
  const renderDict = (v, code) => {
    let text = '';
    const array = getDictItemsByCode(code) || [];
    const obj = array.filter((item) => item.value == v);
    if (obj.length > 0) {
      text = obj[0].text;
    }
    return text;
  };
  return {
    queryParams,
    searchQuery,
    searchReset,
    listData,
    handleAdd,
    toggleSearchStatus,
    onChange,
    page,
    dayCorrection,
    registerModal,
    onSuccess,
    materialRegisterModal,
    handleReplenishMaterial,
    registerDrawer,
    viewRegisterModal,
    handleView,
    imgText,
    renderDict,
    spinning,
    orgOptions,
  };
};
export default useContent;
