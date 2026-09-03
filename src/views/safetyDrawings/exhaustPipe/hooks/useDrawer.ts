import { ref } from 'vue';
import { add, edit, queryById } from '../url/index';
import { BasicDrawer, useDrawerInner } from '/@/components/Drawer';
import { useModal } from '/@/components/Modal';
export const useDrawer = (emit, infoForm) => {
  const [registerModal, { openModal }] = useModal();
  const showFooter = ref(true);
  const showOkBtn = ref(false);
  const title = ref('新增');
  const type = ref('add');
  const info = ref<any>({
    id: '',
    org: undefined,
    outletNo: '',
    outletName: '',
    operatingAirVolume: '',
    standardAirVolume: '',
    remark: '',
    x: null,
    y: null,
    size: '',
  });

  const [registerDrawer, { setDrawerProps, closeDrawer }] = useDrawerInner(async (data) => {
    showOkBtn.value = data.showOkBtn;
    showFooter.value = data.showFooter;
    title.value = data.title;
    type.value = data.type;
    if(data.orgOptions.length == 1) {
      info.value.org = data.orgOptions[0].value;
    }
    if (data.type !== 'add') {
      const res = await queryById({ id: data.data.id });
      info.value = JSON.parse(JSON.stringify(res));
    }
    setDrawerProps({ confirmLoading: false, showFooter: showFooter.value, showOkBtn: showOkBtn.value, title: title.value });
  });
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
      outletNo: '',
      outletName: '',
      operatingAirVolume: '',
      standardAirVolume: '',
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
    registerModal,
    openModal,
  };
};
export default useDrawer;
