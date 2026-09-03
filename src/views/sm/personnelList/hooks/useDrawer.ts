import { ref } from 'vue';
import { BasicDrawer, useDrawerInner } from '/@/components/Drawer';
import { add, edit, queryById, getDetailList, getExamineLog } from '../url/index';
import { useMessage } from '/@/hooks/web/useMessage';
import { duplicateCheck } from '/@/views/system/user/user.api';
import { getDepart3List } from '/@/api/common/api';
import cert1 from '/@/assets/images/certificate/cert1.png';
import cert2 from '/@/assets/images/certificate/cert3.png';
import cert3 from '/@/assets/images/certificate/cert4.png';
import { useModal } from '/@/components/Modal';
import { useUserStore } from '/@/store/modules/user';
export const useDrawer = (emit, infoForm) => {
  const userStore: any = useUserStore();
  const { createMessage } = useMessage();
  const showFooter = ref(true);
  const showOkBtn = ref(false);
  const title = ref('问题录入');
  const type = ref('add');
  const isBlacklist = ref(false);
  const logList: any = ref([]);
  const contractOrgCodeOptions = ref([]);
  const info = ref<any>({
    id: '',
    companyId: undefined,
    name: '',
    workNo: '',
    sex: undefined,
    age: '',
    phone: '',
    contractOrgCode: undefined,
    contractOrgName: '',
    healthStatus: '',
    idNumber: '',
    idNumberFile: '',
    insType: undefined,
    icInsFile: '',
    aiInsDate: null,
    aiInsFile: '',
    workType: '',
    ifSpecialOperator: '2',
    certificateList: [],
    trainCard: null,
    physicalReportOvertime: null,
    physicalReportFile: '',
  });
  const tabsPanes = ref<any[]>([]);
  const activeKey = ref(1);
  // 企业名称
  const companyOptions = ref<any[]>([]);
  const companyIdDisabled = ref(false);
  const [registerModal, { openModal }] = useModal();
  const [registerDrawer, { setDrawerProps, closeDrawer }] = useDrawerInner(async (data) => {
    await infoForm.value.resetFields();
    isBlacklist.value = data.isBlacklist;
    Object.assign(info.value, {
      id: '',
      companyId: undefined,
      name: '',
      workNo: '',
      sex: undefined,
      age: '',
      phone: '',
      contractOrgCode: undefined,
      contractOrgName: '',
      healthStatus: '',
      idNumber: '',
      idNumberFile: '',
      insType: undefined,
      icInsFile: '',
      aiInsDate: null,
      aiInsFile: '',
      workType: '',
      ifSpecialOperator: '2',
      certificateList: [],
      trainCard: null,
      physicalReportOvertime: null,
      physicalReportFile: '',
    });
    activeKey.value = 1;
    tabsPanes.value = [];
    showOkBtn.value = data.showOkBtn;
    showFooter.value = data.showFooter;
    title.value = data.title;
    type.value = data.type;
    if (data.type === 'add') {
      await getDetailList().then((res) => {
        companyOptions.value = res.map((item) => ({
          label: item.companyName,
          value: item.id,
          key: item.orgCode,
        }));
      });
      if (userStore.userInfo.orgCode.includes('A04B12')) {
        info.value.companyId = companyOptions.value.filter((item) => userStore.userInfo.orgCode.includes(item.key))[0].value;
        companyIdDisabled.value = true;
      } else {
        info.value.companyId = undefined;
        companyIdDisabled.value = false;
      }
    }
    if (data.type !== 'view') {
      getDepart3List().then((res) => {
        contractOrgCodeOptions.value = res.map((item) => {
          return {
            label: item.departName,
            value: item.orgCode,
          };
        });
      });
    }
    if (data.type !== 'add') {
      await queryById({ id: data.data.id }).then((res) => {
        if (res) {
          info.value = JSON.parse(JSON.stringify(res));
          info.value.workNo = info.value.workNo;
          if (info.value.trainCard) {
            info.value.trainCard.forEach((item) => {
              item.render = JSON.parse(item.render);
            });
          }
          if (res.certificateList && res.certificateList?.length > 0) {
            tabsPanes.value = [];
            res.certificateList.forEach((_item, index) => {
              tabsPanes.value.push({
                title: `作业证${index + 1}`,
                key: index + 1,
              });
            });
          } else {
            info.value.certificateList = [];
            tabsPanes.value = [];
          }
        }
      });
      if (data.type === 'view') {
        getExamineLog({ id: data.data.id }).then((res) => {
          if (res && res.length > 0) {
            logList.value = res;
          }
        });
      }
    }
    setDrawerProps({ confirmLoading: false, showFooter: showFooter.value, showOkBtn: showOkBtn.value, title: title.value });
  });
  // 保险类型change
  const changeInsType = (value) => {
    if (value === '1') {
      info.value.aiInsDate = null;
      info.value.aiInsFile = '';
    }
    if (value === '2') {
      info.value.icInsFile = '';
    }
  };
  const imgUrl = (item) => {
    if (item.render.imgUrl) {
      return item.render.imgUrl;
    } else {
      if (item.render.type === 'v1') {
        return cert1;
      } else if (item.render.type === 'v2') {
        return cert2;
      } else if (item.render.type === 'v3') {
        return cert3;
      }
    }
  };
  const handleCert = (data) => {
    openModal(true, data);
  };
  const onEdit = (targetKey: string | MouseEvent, action: string) => {
    if (action === 'add') {
      if (tabsPanes.value.length < 10) {
        tabAdd();
      } else {
        createMessage.info('作业证最多添加10个！');
      }
    } else {
      if (info.value.ifSpecialOperator === '1' && tabsPanes.value.length === 1) {
        createMessage.info('至少填写一个作业证！');
      } else {
        tabRemove(targetKey as string);
      }
    }
  };
  const tabAdd = () => {
    activeKey.value = tabsPanes.value.length + 1;
    tabsPanes.value.push({ title: `作业证${tabsPanes.value.length + 1}`, key: tabsPanes.value.length + 1 });
    info.value.certificateList.push({
      certificateType: undefined,
      workType: undefined,
      allowableItem: undefined,
      certificateName: '',
      certificateNo: '',
      obtainDate: '',
      reviewDate: '',
      certificateFile: '',
    });
  };
  const tabRemove = (key) => {
    activeKey.value = tabsPanes.value.length - 1;
    info.value.certificateList.splice(key - 1, 1);
    tabsPanes.value.splice(key - 1, 1);
    tabsPanes.value = tabsPanes.value.map((item, index) => {
      item.key = index + 1;
      item.title = `作业证${index + 1}`;
      return item;
    });
  };
  const changeWorkType = (_event, index) => {
    info.value.certificateList[index].allowableItem = undefined;
  };
  const handleSubmit = async () => {
    await infoForm.value.validate();
    const obj = JSON.parse(JSON.stringify(info.value));
    try {
      setDrawerProps({ confirmLoading: true });
      if (type.value === 'add') {
        await add(obj).then(() => {
          emit('success');
          close();
        });
      } else {
        await edit(obj).then(() => {
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
  };
  // 手机号校验唯一性
  const validatorPhone = (_rule, value) => {
    if (!value) {
      return Promise.reject(`请输入联系方式！`);
    }
    if (value) {
      if (!/^1[3456789]\d{9}$/.test(value)) {
        return Promise.reject(`请输入正确的联系方式！`);
      }
    }
    return new Promise((resolve, reject) => {
      duplicateCheck({
        tableName: 'sys_user',
        fieldName: 'phone',
        fieldVal: value,
        dataId: info.value.userId,
      })
        .then((res) => {
          res.success ? resolve() : reject(res.message || '校验失败');
        })
        .catch((err) => {
          reject(err.message || '验证失败');
        });
    });
  };
  const changeIfSpecialOperator = (value) => {
    activeKey.value = 1;
    if (value === '1') {
      tabsPanes.value = [
        {
          title: '作业证1',
          key: 1,
        },
      ];
      info.value.certificateList = [
        {
          certificateType: undefined,
          workType: undefined,
          allowableItem: undefined,
          certificateName: '',
          certificateNo: '',
          obtainDate: '',
          reviewDate: '',
          certificateFile: '',
        },
      ];
    } else {
      tabsPanes.value = [];
      info.value.certificateList = [];
    }
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
    activeKey,
    onEdit,
    tabsPanes,
    changeWorkType,
    validatorPhone,
    isBlacklist,
    imgUrl,
    registerModal,
    handleCert,
    changeIfSpecialOperator,
    changeInsType,
    companyOptions,
    companyIdDisabled,
    logList,
    contractOrgCodeOptions,
  };
};
export default useDrawer;
