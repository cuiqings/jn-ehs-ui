import { ref } from 'vue';
import { add, edit, queryById } from '../url/index';
import { BasicDrawer, useDrawerInner } from '/@/components/Drawer';
import { useModal } from '/@/components/Modal';
import { getOrganizationNew, getPersonList } from '../url/index';
export const useDrawer = (emit, infoForm) => {
  const [registerModal, { openModal }] = useModal();
  const showFooter = ref(true);
  const showOkBtn = ref(false);
  const title = ref('问题录入');
  const type = ref('add');
  const info = ref<any>({
    id: '',
    org: undefined,
    orgName: '',
    module: '',
    deleteIds: [],
    dutyPeople: undefined,
    dutyPeopleName: '',
    location: '',
    facilityNo: '',
    x: null,
    y: null,
    size: '',
    equipmentVoList: [
      {
        id: '',
        equipmentName: '',
        number: '',
        checkDate: '',
        nextCheckDate: '',
        remark: '',
      },
    ],
  });
  const equipmentColumns = [
    {
      width: 150,
      dataIndex: 'equipmentName',
      slots: { title: 'equipmentNameTitle' },
    },
    {
      width: 150,
      dataIndex: 'number',
      slots: { title: 'numberTitle' },
    },
    {
      width: 200,
      dataIndex: 'checkDate',
      slots: { title: 'checkDateTitle' },
    },
    {
      width: 200,
      title: '下次检定日期',
      dataIndex: 'nextCheckDate',
    },
    {
      width: 150,
      title: '备注',
      dataIndex: 'remark',
    },
    {
      title: '操作',
      width: 100,
      dataIndex: 'headerCell',
    },
  ];
  const activeKey = ref(1);
  const orgList = ref<any[]>([]);
  const userList = ref([]);
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
      getPersonListNew(orgList.value.filter((val) => val.orgCode === info.value.org)[0].id);
    }
    setDrawerProps({ confirmLoading: false, showFooter: showFooter.value, showOkBtn: showOkBtn.value, title: title.value });
  });
  const optionsChangeFn = (value) => {
    info.value.x = null;
    info.value.y = null;
    info.value.size = '';
    if (value) {
      const item = orgList.value.find((val) => val.orgCode === value);
      getPersonListNew(item.id);
    } else {
      userList.value = [];
    }
  };
  const getOrganization = async () => {
    const res = await getOrganizationNew();
    if (res.length == 1) {
      info.value.org = res[0].orgCode;
      getPersonListNew(res[0].id);
    }
    orgList.value = res;
  };
  const getPersonListNew = async (id) => {
    const res = await getPersonList({ departIds: id });
    if (res.records.length > 0 && !res.records.find((item) => item.id == info.value.dutyPeople)) {
      info.value.dutyPeople = null;
    }
    if (res.records.length == 0) info.value.dutyPeople = null;
    userList.value = res.records;
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
  const close = () => {
    //刷新列表
    emit('success');
    //关闭弹窗
    closeDrawer();
    info.value = {
      id: '',
      org: undefined,
      orgName: '',
      module: '',
      deleteIds: [],
      dutyPeople: undefined,
      dutyPeopleName: '',
      location: '',
      facilityNo: '',
      x: null,
      y: null,
      size: '',
      equipmentVoList: [
        {
          id: '',
          equipmentName: '',
          number: '',
          checkDate: '',
          nextCheckDate: '',
          remark: '',
        },
      ],
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
    equipmentColumns,
    orgList,
    userList,
    optionsChangeFn,
  };
};
export default useDrawer;
