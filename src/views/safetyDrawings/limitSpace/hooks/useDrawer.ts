import { ref } from 'vue';
import { add, edit, queryById } from '../url/index';
import { BasicDrawer, useDrawerInner } from '/@/components/Drawer';
import { useModal } from '/@/components/Modal';
import { getOrganizationNew, getPersonList } from '../url/index';
export const useDrawer = (emit, infoForm) => {
  const [registerModal, { openModal }] = useModal();
  const companyCodeDisabled = ref(false);
  const showFooter = ref(true);
  const showOkBtn = ref(false);
  const title = ref('问题录入');
  const type = ref('add');
  const info = ref<any>({
    id: '',
    dutyOrg: undefined,
    dutyOrgName: '',
    riskLevelNo: '',
    name: '',
    type: '',
    liveLocationPicture: '',
    locationRange: '',
    majorHazard: '',
    workersMaxNumber: '',
    region: '',
    managerName: undefined,
    manager: undefined,
    crNumber: '',
    risk: '',
    remark: '',
    x: null,
    y: null,
    size: '',
  });
  const userList = ref([]);
  const orgList = ref<any[]>([]);
  const activeKey = ref(1);
  const [registerDrawer, { setDrawerProps, closeDrawer }] = useDrawerInner(async (data) => {
    activeKey.value = 1;
    showOkBtn.value = data.showOkBtn;
    showFooter.value = data.showFooter;
    title.value = data.title;
    type.value = data.type;
    orgList.value = [];
    userList.value = [];
    await getOrganization();
    if (data.type !== 'add') {
      const res = await queryById({ id: data.data.id });
      info.value = JSON.parse(JSON.stringify(res));
      info.value.workPermitValidityPeriod = info.value.workPermitValidityPeriodStart
        ? info.value.workPermitValidityPeriodStart + '至' + info.value.workPermitValidityPeriodEnd
        : '';
      getPersonListNew(orgList.value.filter((item) => item.orgCode === info.value.dutyOrg)[0].id);
    }
    setDrawerProps({ confirmLoading: false, showFooter: showFooter.value, showOkBtn: showOkBtn.value, title: title.value });
  });
  const optionsChangeFn = (value, data) => {
    info.value.manager = undefined;
    info.value.x = null;
    info.value.y = null;
    info.value.size = '';
    if (value) {
      getPersonListNew(data.key);
    } else {
      userList.value = [];
    }
  };
  const getPersonListNew = async (id) => {
    const res = await getPersonList({ departIds: id });
    userList.value = res.records;
  };
  const getOrganization = async () => {
    const res = await getOrganizationNew();
    if (res.length == 1) {
      info.value.dutyOrg = res[0].orgCode;
      getPersonListNew(res[0].id);
    }
    orgList.value = res;
  };
  const handleSubmit = async () => {
    await infoForm.value.validate();
    try {
      setDrawerProps({ confirmLoading: true });
      if (type.value === 'add') {
        await add(info.value).then(() => {
          emit('success');
          close();
        });
      } else {
        await edit(info.value).then(() => {
          emit('success');
          close();
        });
      }
    } finally {
      setDrawerProps({ confirmLoading: false });
    }
  };

  const close = async () => {
    //刷新列表
    emit('success');
    //关闭弹窗
    closeDrawer();
    info.value = {
      id: '',
      dutyOrg: undefined,
      dutyOrgName: '',
      riskLevelNo: '',
      name: '',
      type: '',
      liveLocationPicture: '',
      locationRange: '',
      majorHazard: '',
      workersMaxNumber: '',
      region: '',
      managerName: '',
      manager: undefined,
      crNumber: '',
      risk: '',
      remark: '',
      x: null,
      y: null,
      size: '',
    };
  };

  return {
    showFooter,
    showOkBtn,
    title,
    registerDrawer,
    BasicDrawer,
    handleSubmit,
    type,
    info,
    close,
    activeKey,
    registerModal,
    openModal,
    companyCodeDisabled,
    optionsChangeFn,
    userList,
    orgList,
  };
};
export default useDrawer;
