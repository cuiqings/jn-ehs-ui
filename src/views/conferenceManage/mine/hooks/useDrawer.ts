import { ref } from 'vue';
import { BasicDrawer, useDrawerInner } from '/@/components/Drawer';
import { add, edit, queryById } from '../url/index';
import { useMessage } from '/@/hooks/web/useMessage';
import { useModal } from '/@/components/Modal';
import { useUserStore } from '/@/store/modules/user';
export const useDrawer = (emit, infoForm) => {
  const userStore: any = useUserStore();
  const { createMessage } = useMessage();
  const showFooter = ref(true);
  const showOkBtn = ref(false);
  const title = ref('预定会议');
  const type = ref('add');
  const isBlacklist = ref(false);
  const info = ref<any>({
    id: '',
    conferenceTheme: '',
    startDate: '',
    endDate: '',
    location: '',
    annex: '',
    userId: userStore.userInfo.id,
    sign: false,
    signStartTime: '',
    signEndTime: '',
    remark: '',
    userIds: '',
    userList: [],
  });
  const tabsPanes = ref<any[]>([]);
  const activeKey = ref(1);
  const [registerModal, { openModal }] = useModal();
  const [registerDrawer, { setDrawerProps, closeDrawer }] = useDrawerInner(async (data) => {
    await infoForm.value.resetFields();
    isBlacklist.value = data.isBlacklist;
    Object.assign(info.value, {
      id: '',
      conferenceTheme: '',
      startDate: '',
      endDate: '',
      location: '',
      annex: '',
      userId: userStore.userInfo.id,
      sign: false,
      signStartTime: '',
      signEndTime: '',
      remark: '',
      userIds: '',
      userList: [],
    });
    activeKey.value = 1;
    tabsPanes.value = [];
    showOkBtn.value = data.showOkBtn;
    showFooter.value = data.showFooter;
    title.value = data.title;
    type.value = data.type;
    if (data.type !== 'add') {
      await queryById({ id: data.data.id }).then((res) => {
        if (res) {
          if(res.userList && res.userList.length > 0){
            res.userIds = res.userList.map(item => item.userId).join(',');
          }
          info.value = JSON.parse(JSON.stringify(res));
          if(res.sign == '1') {
            info.value.sign = true;
          } else {
            info.value.sign = false;
          }
        }
      });
    }
    setDrawerProps({ confirmLoading: false, showFooter: showFooter.value, showOkBtn: showOkBtn.value, title: title.value });
  });
 
  const handleCert = (data) => {
    openModal(true, data);
  };
  const onEdit = (targetKey: string | MouseEvent, action: string) => {
    
  };

  const changeWorkType = (_event, index) => {
    info.value.certificateList[index].allowableItem = undefined;
  };
  const handleSubmit = async () => {
    await infoForm.value.validate();
    const obj = JSON.parse(JSON.stringify(info.value));
    obj.sign = obj.sign ? 1 : 0;
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
    isBlacklist,
    registerModal,
    handleCert
  };
};
export default useDrawer;
