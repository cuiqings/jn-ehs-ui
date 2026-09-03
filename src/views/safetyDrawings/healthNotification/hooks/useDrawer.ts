import { ref } from 'vue';
import { add, edit, queryById } from '../url/index';
import { BasicDrawer, useDrawerInner } from '/@/components/Drawer';
import { useModal } from '/@/components/Modal';

export const useDrawer = (emit, infoForm) => {
  const [registerModal, { openModal }] = useModal();
  const [registerSignModal, { openModal: openSignModal }] = useModal();

  const companyCodeDisabled = ref(false);
  const showFooter = ref(true);
  const showOkBtn = ref(false);
  const title = ref('问题录入');
  const type = ref('add');
  const iconList = ref([])
  const info = ref<any>({
    id: '',
    org: undefined,
    region: '',
    markType: '',
    regionLevel: '',
    safetySign: '',
    remark: '',
    x: null,
    y: null,
    w: null,
    h: null,
    size: '',
    safetySignArr: [],
  });
  const activeKey = ref(1);
  const [registerDrawer, { setDrawerProps, closeDrawer }] = useDrawerInner(async (data) => {
    activeKey.value = 1;
    showOkBtn.value = data.showOkBtn;
    showFooter.value = data.showFooter;
    title.value = data.title;
    type.value = data.type;
    info.value.safetySignArr = [];
    if(data.orgOptions.length == 1) {
      info.value.org = data.orgOptions[0].value;
    }
    if (data.type !== 'add') {
      console.log(data.data.id);

      let res = await queryById({ id: data.data.id });
      info.value = JSON.parse(JSON.stringify(res));
      info.value.safetySignArr = info.value.safetySign.split(',');
    }
    setDrawerProps({ confirmLoading: false, showFooter: showFooter.value, showOkBtn: showOkBtn.value, title: title.value });
  });

  const handleSubmit = async () => {
    console.log('给add的info:', info.value);
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
    info.value = {};
    //刷新列表
    emit('success');
    //关闭弹窗
    closeDrawer();
    info.value = {
      id: '',
      org: undefined,
      region: '',
      markType: '',
      regionLevel: '',
      safetySign: '',
      remark: '',
      x: null,
      y: null,
      w: null,
      h: null,
      size: '',
      safetySignArr: [],
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
    registerSignModal,
    openModal,
    openSignModal,
    companyCodeDisabled,
  };
};
export default useDrawer;
