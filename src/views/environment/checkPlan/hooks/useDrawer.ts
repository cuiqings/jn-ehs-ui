import { BasicDrawer, useDrawerInner } from '/@/components/Drawer';
import { getOrganizationNew, getUser, add, edit } from '../url/index';
import { useMessage } from '/@/hooks/web/useMessage';
import { ref, onMounted, watch } from 'vue';
export const useDrawer = (emit, infoRef: any) => {
  const { createMessage } = useMessage();
  const showFooter = ref(true);
  const showOkBtn = ref(false);
  const title = ref('新增');
  const orgOptions = ref<any[]>([]);
  const info = ref<any>({
    id: '',
    organizationCode: undefined,
    checkPlanName: '',
    checkFrequency: undefined,
    timeOne: undefined,
    timeTwo: undefined,
    checkUserId: undefined,
    checkName: '',
    jnEnvironmentalCheckPlanSubList: [
      {
        serialNumber: '1',
        processes: '',
        checkEntry: '',
        checkRecord: '',
      },
    ],
    isEnable: '0',
  });
  const timeOneArr = ref([
    {
      label: '07:00',
      value: '07:00',
    },
    {
      label: '08:00',
      value: '08:00',
    },
    {
      label: '09:00',
      value: '09:00',
    },
    {
      label: '10:00',
      value: '10:00',
    },
    {
      label: '11:00',
      value: '11:00',
    },
    {
      label: '12:00',
      value: '12:00',
    },
    {
      label: '13:00',
      value: '13:00',
    },
    {
      label: '14:00',
      value: '14:00',
    },
    {
      label: '15:00',
      value: '15:00',
    },
    {
      label: '16:00',
      value: '16:00',
    },
    {
      label: '17:00',
      value: '17:00',
    },
    {
      label: '18:00',
      value: '18:00',
    },
    {
      label: '19:00',
      value: '19:00',
    },
    {
      label: '20:00',
      value: '20:00',
    },
    {
      label: '21:00',
      value: '21:00',
    },
    {
      label: '22:00',
      value: '22:00',
    },
    {
      label: '23:00',
      value: '23:00',
    },
  ]);
  const timeTwoArr = ref<any[]>([]);
  const isTime = ref(true);
  const type = ref('add');
  const timeDateArr = [
    {
      label: '07:00',
      value: '07:00',
    },
    {
      label: '08:00',
      value: '08:00',
    },
    {
      label: '09:00',
      value: '09:00',
    },
    {
      label: '10:00',
      value: '10:00',
    },
    {
      label: '11:00',
      value: '11:00',
    },
    {
      label: '12:00',
      value: '12:00',
    },
    {
      label: '13:00',
      value: '13:00',
    },
    {
      label: '14:00',
      value: '14:00',
    },
    {
      label: '15:00',
      value: '15:00',
    },
    {
      label: '16:00',
      value: '16:00',
    },
    {
      label: '17:00',
      value: '17:00',
    },
    {
      label: '18:00',
      value: '18:00',
    },
    {
      label: '19:00',
      value: '19:00',
    },
    {
      label: '20:00',
      value: '20:00',
    },
    {
      label: '21:00',
      value: '21:00',
    },
    {
      label: '22:00',
      value: '22:00',
    },
    {
      label: '23:00',
      value: '23:00',
    },
  ];
  // 周
  const weekArr = [
    {
      label: '周一',
      value: '周一',
    },
    {
      label: '周二',
      value: '周二',
    },
    {
      label: '周三',
      value: '周三',
    },
    {
      label: '周四',
      value: '周四',
    },
    {
      label: '周五',
      value: '周五',
    },
    {
      label: '周六',
      value: '周六',
    },
    {
      label: '周日',
      value: '周日',
    },
  ];
  // 月
  const moonArr = [
    {
      label: '1月',
      value: '1',
    },
    {
      label: '2月',
      value: '2',
    },
    {
      label: '3月',
      value: '3',
    },
    {
      label: '4月',
      value: '4',
    },
    {
      label: '5月',
      value: '5',
    },
    {
      label: '6月',
      value: '6',
    },
    {
      label: '7月',
      value: '7',
    },
    {
      label: '8月',
      value: '8',
    },
    {
      label: '9月',
      value: '9',
    },
    {
      label: '10月',
      value: '10',
    },
    {
      label: '11月',
      value: '11',
    },
    {
      label: '12月',
      value: '12',
    },
  ];
  // 月数
  const moonNumArr = [
    {
      label: '1',
      value: '1',
    },
    {
      label: '2',
      value: '2',
    },
    {
      label: '3',
      value: '3',
    },
    {
      label: '4',
      value: '4',
    },
    {
      label: '5',
      value: '5',
    },
    {
      label: '6',
      value: '6',
    },
  ];
  // 季数
  const quarterNumArr = [
    {
      label: '1',
      value: '1',
    },
    {
      label: '2',
      value: '2',
    },
    {
      label: '3',
      value: '3',
    },
  ];
  // 日
  const dayArr = [
    {
      label: '1日',
      value: '1',
    },
    {
      label: '2日',
      value: '2',
    },
    {
      label: '3日',
      value: '3',
    },
    {
      label: '4日',
      value: '4',
    },
    {
      label: '5日',
      value: '5',
    },
    {
      label: '6日',
      value: '6',
    },
    {
      label: '7日',
      value: '7',
    },
    {
      label: '8日',
      value: '日',
    },
    {
      label: '9日',
      value: '9',
    },
    {
      label: '10日',
      value: '10',
    },
    {
      label: '11日',
      value: '11',
    },
    {
      label: '12日',
      value: '12',
    },
    {
      label: '13日',
      value: '13',
    },
    {
      label: '14日',
      value: '14',
    },
    {
      label: '15日',
      value: '15',
    },
    {
      label: '16日',
      value: '16',
    },
    {
      label: '17日',
      value: '17',
    },
    {
      label: '18日',
      value: '18',
    },
    {
      label: '19日',
      value: '19',
    },
    {
      label: '20日',
      value: '20',
    },
    {
      label: '21日',
      value: '21',
    },
    {
      label: '22日',
      value: '22',
    },
    {
      label: '23日',
      value: '23',
    },
    {
      label: '24日',
      value: '24',
    },
    {
      label: '25日',
      value: '25',
    },
    {
      label: '26日',
      value: '26',
    },
    {
      label: '27日',
      value: '27',
    },
    {
      label: '28日',
      value: '28',
    },
  ];
  // 检查人
  const checkerArr = ref([]);
  const fetching = ref(false);
  const columns = [
    { title: '序号', dataIndex: 'serialNumber', align: 'center', width: 70 },
    { title: '工序', dataIndex: 'processes', align: 'center', slots: { customRender: 'processes' } },
    { title: '检查项目', dataIndex: 'checkEntry', align: 'center', slots: { customRender: 'checkEntry' } },
    { title: '检查要求', dataIndex: 'checkRecord', align: 'center', slots: { customRender: 'checkRecord' } },
    { title: '操作', align: 'center', width: 120, slots: { customRender: 'operate' } },
  ];
  const columns1 = [
    { title: '序号', dataIndex: 'serialNumber', align: 'center', width: 70 },
    { title: '工序', dataIndex: 'processes', align: 'center', width: 250 },
    { title: '检查项目', dataIndex: 'checkEntry', align: 'center', width: 250 },
    { title: '检查要求', dataIndex: 'checkRecord', align: 'center', width: 314 },
  ];
  onMounted(() => {
    getOrganizationNew().then((res) => {
      orgOptions.value = res.map((item) => {
        return {
          label: item.departName,
          value: item.orgCode,
          id: item.id,
        };
      });
    });
  });
  const [registerDrawer, { setDrawerProps, closeDrawer }] = useDrawerInner(async (data) => {
    info.value = {
      organizationCode: undefined,
      checkPlanName: '',
      checkFrequency: undefined,
      timeOne: undefined,
      timeTwo: undefined,
      checkUserId: undefined,
      checkName: '',
      jnEnvironmentalCheckPlanSubList: [
        {
          serialNumber: '1',
          processes: '',
          checkEntry: '',
          checkRecord: '',
        },
      ],
      isEnable: '0',
    };
    showOkBtn.value = data.showOkBtn;
    showFooter.value = data.showFooter;
    isTime.value = true;
    title.value = data.title;
    type.value = data.type;
    if (data.type === 'add') {
      if (orgOptions.value.length === 1) {
        info.value.organizationCode = orgOptions.value[0].value;
      }
    }
    if (data.type !== 'add') {
      const infoData = JSON.parse(JSON.stringify(data.data));
      changeFrequency(infoData.checkFrequency);
      infoData.checkUserId = infoData.checkUserId.split(',');
      info.value = infoData;
    }
    // 更新抽屉
    setDrawerProps({ confirmLoading: false, showFooter: showFooter.value, showOkBtn: showOkBtn.value, title: title.value });
  });
  // 检查频率change
  const changeFrequency = (data) => {
    if (data === '0' || data === '1' || data === '2') {
      if (data === '0') timeOneArr.value = timeDateArr;
      if (data === '1') timeOneArr.value = weekArr;
      if (data === '2') timeOneArr.value = dayArr;
      isTime.value = true;
    } else {
      if (data === '3') timeOneArr.value = quarterNumArr;
      if (data === '6') timeOneArr.value = moonNumArr;
      if (data === '4') timeOneArr.value = moonArr;
      timeTwoArr.value = dayArr;
      isTime.value = false;
    }
    info.value.timeOne = undefined;
    info.value.timeTwo = undefined;
  };
  watch(
    () => info.value.organizationCode,
    (news) => {
      const departIds = orgOptions.value.filter((item) => item.value === news)[0]?.id;
      checkerArr.value = [];
      fetching.value = true;
      getUser({ departIds }).then((res) => {
        checkerArr.value = res.records.map((item) => {
          return {
            label: item.realname,
            value: item.id,
          };
        });
        fetching.value = false;
      });
    }
  );
  const filterOption = (input: string, option: any) => {
    return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
  };
  const onJia = (data) => {
    info.value.jnEnvironmentalCheckPlanSubList.splice(Number(data.serialNumber), 0, {
      processes: '',
      checkEntry: '',
      checkRecord: '',
    });
    info.value.jnEnvironmentalCheckPlanSubList = info.value.jnEnvironmentalCheckPlanSubList.map((item, index) => {
      item.serialNumber = String(index + 1);
      return item;
    });
  };
  const onJian = (data) => {
    info.value.jnEnvironmentalCheckPlanSubList.splice(Number(data.serialNumber) - 1, 1);
    info.value.jnEnvironmentalCheckPlanSubList = info.value.jnEnvironmentalCheckPlanSubList.map((item, index) => {
      item.serialNumber = String(index + 1);
      return item;
    });
  };
  const changeCheckUser = (data, ext) => {
    info.value.checkName = ext.map((item) => item.label).join(',');
  };
  const handleSubmit = async () => {
    try {
      await infoRef.value.validate();
      const data = info.value.jnEnvironmentalCheckPlanSubList;
      for (let i = 0; i < data.length; i++) {
        if (data[i].processes === '') {
          return createMessage.info(`第${i + 1}行工序不可为空！`);
        }
        if (data[i].checkEntry === '') {
          return createMessage.info(`第${i + 1}行检查项目不可为空！`);
        }
        if (data[i].checkRecord === '') {
          return createMessage.info(`第${i + 1}行检查要求不可为空！`);
        }
      }
      setDrawerProps({ confirmLoading: true });
      info.value.checkUserId = Array.isArray(info.value.checkUserId) ? info.value.checkUserId.join(',') : info.value.checkUserId;
      if (type.value === 'add') {
        await add(info.value).then((res) => {
          if (res) {
            //刷新列表
            emit('success');
            //关闭弹窗
            closeDrawer();
          }
        });
      } else {
        await edit(info.value).then((res) => {
          if (res) {
            //刷新列表
            emit('success');
            //关闭弹窗
            closeDrawer();
          }
        });
      }
    } finally {
      setDrawerProps({ confirmLoading: false });
    }
  };
  return {
    BasicDrawer,
    registerDrawer,
    title,
    showFooter,
    showOkBtn,
    handleSubmit,
    info,
    orgOptions,
    changeFrequency,
    timeDateArr,
    weekArr,
    moonArr,
    moonNumArr,
    quarterNumArr,
    dayArr,
    checkerArr,
    filterOption,
    columns,
    onJia,
    onJian,
    columns1,
    changeCheckUser,
    isTime,
    timeOneArr,
    timeTwoArr,
    fetching,
  };
};
export default useDrawer;
