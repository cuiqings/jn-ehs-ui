import { ref, nextTick, computed, watch } from 'vue';
import { BasicDrawer, useDrawerInner, useDrawer } from '/@/components/Drawer';
import { edit, queryById } from '../url/index';
export const useTeamInfoDrawer = (emit, infoForm, scrollContainer) => {
  const showFooter = ref(true);
  const showOkBtn = ref(false);
  const title = ref('编辑');
  const type = ref('edit');
  const info = ref<any>({
    id: '',
    pairsList: [
      {
        userId: '',
        userName: '',
      },
    ],
  });
  const teamUserList = ref<any[]>([]);
  const displayCount = ref(15); // 初始显示数量
  const loadStep = 10; // 每次加载的数量
  const [registerCertificateDrawer, { openDrawer }] = useDrawer();
  const [registerDrawer, { setDrawerProps, closeDrawer }] = useDrawerInner(async (data) => {
    await infoForm.value.resetFields();
    // 先清空数据，确保组件重置
    teamUserList.value = [];
    Object.assign(info.value, {
      id: '',
      pairsList: [
        {
          userId: '',
          userName: '',
        },
      ],
    });
    showOkBtn.value = data.showOkBtn;
    showFooter.value = data.showFooter;
    title.value = data.title;
    type.value = data.type;
    setDrawerProps({ confirmLoading: false, showFooter: showFooter.value, showOkBtn: showOkBtn.value, title: title.value });
    await nextTick();
    await queryById({ id: data.data.id }).then((res) => {
      if (res) {
        info.value = res;
        nextTick(() => {
          teamUserList.value = res.teamUserList || [];
        });
        if (info.value.pairsList.length === 0 && type.value === 'edit') {
          info.value.pairsList = [
            {
              userId: '',
              userName: '',
            },
          ];
        }
      }
    });
  });
  const handleSubmit = async () => {
    await infoForm.value.validate();
    const obj = JSON.parse(JSON.stringify(info.value));
    try {
      setDrawerProps({ confirmLoading: true });
      edit(obj).then(() => {
        emit('success');
        close();
      });
    } finally {
      setDrawerProps({ confirmLoading: false });
    }
  };
  const add = (index) => {
    info.value.pairsList.splice(index + 1, 0, {
      userId: '',
      userName: '',
    });
  };
  const remove = (index) => {
    info.value.pairsList.splice(index, 1);
  };
  const handleUserIds = (cb) => {
    let userIds: any = [];
    userIds = info.value.pairsList
      .filter((item) => item.userId !== undefined && item.userId !== '') // 过滤掉 user 是 undefined 的项
      .flatMap((item) => item.userId.split(','));
    cb(userIds);
  };
  const userConfirm = (_name: string, userName: string, index) => {
    info.value.pairsList[index].userName = userName;
  };
  const handleCertificate = (record) => {
    openDrawer(true, {
      showOkBtn: false,
      showFooter: true,
      record: record,
      title: '证书信息',
      type: 'view',
      isBz: true,
    });
  };
  const close = () => {
    //刷新列表
    emit('success');
    //关闭弹窗
    closeDrawer();
  };

  // 计算当前显示的用户列表
  const displayedUserList = computed(() => {
    return teamUserList.value.slice(0, displayCount.value);
  });

  // 监听 teamUserList 变化，重置显示数量和滚动位置
  watch(teamUserList, () => {
    displayCount.value = 15;
    // 重置滚动条位置
    nextTick(() => {
      if (scrollContainer.value) {
        scrollContainer.value.scrollTop = 0;
      }
    });
  });

  // 处理滚动事件，实现按需加载
  const handleScroll = (e: Event) => {
    const target = e.target as HTMLElement;
    const { scrollTop, scrollHeight, clientHeight } = target;

    // 当滚动到距离底部 50px 以内时，加载更多
    if (scrollHeight - scrollTop - clientHeight < 50) {
      if (displayCount.value < teamUserList.value.length) {
        displayCount.value = Math.min(displayCount.value + loadStep, teamUserList.value.length);
      }
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
    add,
    remove,
    handleUserIds,
    userConfirm,
    registerCertificateDrawer,
    handleCertificate,
    teamUserList,
    scrollContainer,
    displayedUserList,
    handleScroll,
  };
};
export default useTeamInfoDrawer;
