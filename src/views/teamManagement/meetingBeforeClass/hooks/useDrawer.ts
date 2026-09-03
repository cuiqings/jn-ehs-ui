import { ref, computed } from 'vue';
import { edit, queryById, bzk } from '../url/index';
import { BasicDrawer, useDrawerInner } from '/@/components/Drawer';
import { Modal } from 'ant-design-vue';

// 类型定义
interface Pair {
  userId: string;
  userName: string;
}

interface DataSourceItem {
  rowKey: string;
  lc: string;
  status: string;
  illustrate: string;
}

interface DataSource1Item {
  rowKey: string;
  lc: string;
  standard: string;

  [key: string]: string;
}

interface Info {
  id: string;
  orgName: string;
  departName: string;
  depart: string;
  teamName: string;
  workType: string;
  teamOrder: string;
  expectedNumber: number;
  actualNumber: number;
  leavePersonName: string;
  leavePerson: string;
  joinPerson: string;
  preShiftTime: string;
  bzkTime: string;
  bzkReason: string;
  bzkMsr: string;
  bzkPicture: string;
  pairsList: Pair[];
  dataSource: DataSourceItem[];
  dataSource1: DataSource1Item[];
}

// 初始数据常量
const INIT_PAIRS_LIST: Pair[] = [{ userId: '', userName: '' }];
const INIT_DATA_SOURCE: DataSourceItem[] = [
  { rowKey: '1', lc: '巡视作业现场', status: '1', illustrate: '' },
  { rowKey: '2', lc: '了解上班情况', status: '1', illustrate: '' },
  { rowKey: '3', lc: '熟悉上级要求', status: '1', illustrate: '' },
  { rowKey: '4', lc: '准备班前会要点', status: '1', illustrate: '' },
];
const INIT_DATA_SOURCE1: DataSource1Item[] = [
  {
    rowKey: '1',
    lc: '点名，互查劳保急救药盒',
    standard: '班组长点名，确定当班上班人数；联保人员互查劳保穿戴情况、精神状况、急救药品佩戴（建议互保人员坐在一起，便于互查）；',
    file: '',
    illustrate: '',
    file1: '',
    illustrate1: '',
    file2: '',
    illustrate2: '',
    file3: '',
    illustrate3: '',
    file4: '',
    illustrate4: '',
  },
  // {
  //   rowKey: '2',
  //   lc: '互查劳保急救药盒',
  //   standard: '联保人员互查劳保穿戴情况、精神状况、急救药品佩戴（建议互保人员坐在一起，便于互查）；',
  //   file: '',
  //   illustrate: '',
  //   file1: '',
  //   illustrate1: '',
  //   file2: '',
  //   illustrate2: '',
  //   file3: '',
  //   illustrate3: '',
  //   file4: '',
  //   illustrate4: '',
  // },
  {
    rowKey: '2',
    lc: '背诵安全誓词',
    standard: '班组长带领全员背诵安全誓词；',
    file: '',
    illustrate: '',
    file1: '',
    illustrate1: '',
    file2: '',
    illustrate2: '',
    file3: '',
    illustrate3: '',
    file4: '',
    illustrate4: '',
  },
  {
    rowKey: '3',
    lc: '观看安全警示教育视频',
    standard: '每周组织一次交通安全警示视频，其它时间可选择与生产、检维修等相关的事故警示视频；',
    file: '',
    illustrate: '',
    file1: '',
    illustrate1: '',
    file2: '',
    illustrate2: '',
    file3: '',
    illustrate3: '',
    file4: '',
    illustrate4: '',
  },
  {
    rowKey: '4',
    lc: '贯彻学习',
    standard: '传达集团、厂部、车间安全相关方案、通报及其他文件；',
    file: '',
    illustrate: '',
    file1: '',
    illustrate1: '',
    file2: '',
    illustrate2: '',
    file3: '',
    illustrate3: '',
    file4: '',
    illustrate4: '',
  },
  {
    rowKey: '5',
    lc: '安全活动',
    standard: '开展一项安全活动：手指口述、“吓一跳”、我的一次不安全经历；抽查安全操作规程、应知应会等；',
    file: '',
    illustrate: '',
    file1: '',
    illustrate1: '',
    file2: '',
    illustrate2: '',
    file3: '',
    illustrate3: '',
    file4: '',
    illustrate4: '',
  },
  {
    rowKey: '6',
    lc: '布置当班工作情况',
    standard:
      '1、讲解上班生产情况及存在问题，针对问题部署改进措施；<br>2、布置本班生产工作及安全事项（布置工作任务、分析存在风险辨识、制定防范措施等）；',
    file: '',
    illustrate: '',
    file1: '',
    illustrate1: '',
    file2: '',
    illustrate2: '',
    file3: '',
    illustrate3: '',
    file4: '',
    illustrate4: '',
  },
  {
    rowKey: '7',
    lc: '周例会',
    standard: '上传周例会图片及会议纪要',
    file: '',
    illustrate: '',
    file1: '',
    illustrate1: '',
    file2: '',
    illustrate2: '',
    file3: '',
    illustrate3: '',
    file4: '',
    illustrate4: '',
  },
];

// 工具函数
function getInitInfo(): Info {
  return {
    id: '',
    orgName: '',
    depart: '',
    departName: '',
    teamName: '',
    workType: '',
    teamOrder: '',
    expectedNumber: 0,
    actualNumber: 0,
    leavePersonName: '',
    leavePerson: '',
    joinPerson: '',
    preShiftTime: '',
    bzkTime: '',
    bzkReason: '',
    bzkMsr: '',
    bzkPicture: '',
    pairsList: JSON.parse(JSON.stringify(INIT_PAIRS_LIST)),
    dataSource: JSON.parse(JSON.stringify(INIT_DATA_SOURCE)),
    dataSource1: JSON.parse(JSON.stringify(INIT_DATA_SOURCE1)),
  };
}

export const useDrawer = (emit, infoForm) => {
  const showFooter = ref(true);
  const showOkBtn = ref(false);
  const title = ref('编辑');
  const type = ref('edit');
  const info = ref<Info>(getInitInfo());

  // teamName 不为空 = 班组数据，为空 = 车间数据
  const isTeamData = computed(() => !!info.value.teamName);
  // 车间数据只显示周例会（rowKey='7'），班组数据显示全部
  const displayDataSource1 = computed(() => {
    if (isTeamData.value) {
      return info.value.dataSource1;
    }
    return info.value.dataSource1.filter(item => item.rowKey === '7');
  });

  const columns = [
    { title: '序号', dataIndex: 'rowKey', align: 'center', width: 65 },
    { title: '流程', dataIndex: 'lc', align: 'center' },
    { title: '记录', dataIndex: 'jl', align: 'center', slots: { customRender: 'jl' } },
  ];
  const columns1 = computed(() => [
    { title: '序号', dataIndex: 'rowKey', align: 'center', width: 65, customRender: isTeamData.value ? undefined : ({ index }) => index + 1 },
    { title: '流程', dataIndex: 'lc', align: 'center', width: 175 },
    { title: '标准', dataIndex: 'standard', align: 'left', width: 250, slots: { customRender: 'standard' } },
    { title: '记录', dataIndex: 'jl', align: 'center', slots: { customRender: 'jl' } },
  ]);
  const teamOrderOption = ref([
    { label: '甲', value: '甲' },
    { label: '乙', value: '乙' },
    { label: '丙', value: '丙' },
  ]);
  const [registerDrawer, { setDrawerProps, closeDrawer }] = useDrawerInner(async (data) => {
    await infoForm.value.resetFields();
    info.value = getInitInfo();
    showOkBtn.value = data.showOkBtn;
    showFooter.value = data.showFooter;
    title.value = data.title;
    type.value = data.type;

    const res = await queryById({ id: data.data.id });
    if (res.workType === '1') {
      teamOrderOption.value = [
        { label: '甲', value: '甲' },
        { label: '乙', value: '乙' },
        { label: '丙', value: '丙' },
      ];
    } else if (res.workType === '2') {
      teamOrderOption.value = [
        { label: '甲', value: '甲' },
        { label: '乙', value: '乙' },
      ];
    } else if (res.workType === '3') {
      teamOrderOption.value = [{ label: '常白班', value: '常白班' }];
    }
    if (res) {
      if(res.dataSource1 && res.dataSource1.length > 6) {
        res.dataSource1.splice(1, 1);
      }

      // 根据 teamName 是否为空，决定 dataSource1 初始化逻辑
      let initDataSource1 = JSON.parse(JSON.stringify(INIT_DATA_SOURCE1));

      // 合并数据，避免直接赋值
      info.value = {
        ...info.value,
        ...res,
        dataSource: info.value.dataSource.map((item, idx) => ({
          ...item,
          status: res.dataSource?.[idx]?.status ?? item.status,
          illustrate: res.dataSource?.[idx]?.illustrate ?? item.illustrate,
        })),
        dataSource1: initDataSource1.map((item, idx) => ({
          ...item,
          ...['file', 'illustrate', 'file1', 'illustrate1', 'file2', 'illustrate2', 'file3', 'illustrate3', 'file4', 'illustrate4'].reduce(
            (acc, key) => ({ ...acc, [key]: res.dataSource1?.[idx]?.[key] ?? item[key] }),
            {}
          ),
        })),
        pairsList: res.pairsList?.length ? res.pairsList : type.value === 'edit' ? getInitInfo().pairsList : [],
      };
    }
    setDrawerProps({
      confirmLoading: false,
      showFooter: showFooter.value,
      showOkBtn: showOkBtn.value,
      title: title.value,
    });
  });

  const handleSubmit = async () => {
    await infoForm.value.validate();
    let flag = false;
    const isTeam = !!info.value.teamName;
    if (isTeam) {
      for (let i = 0; i < info.value.dataSource.length; i++) {
        if (!info.value.dataSource[i].illustrate || info.value.dataSource[i].illustrate === '') {
          flag = true;
          break;
        }
      }
    }
    const validateList = isTeam ? info.value.dataSource1 : info.value.dataSource1.filter(item => item.rowKey === '7');
    // 跳过观看安全警示教育视频(3)、安全活动(5)、周例会(7)的验证
    const skipRowKeys = ['3', '5', '7'];
    for (let i = 0; i < validateList.length; i++) {
      const row = validateList[i];
      if (skipRowKeys.includes(row.rowKey)) continue;
      if (!row.illustrate || row.illustrate === '') {
        flag = true;
        break;
      }
      if (!row.file || row.file === '') {
        flag = true;
        break;
      }
    }
    if (flag) {
      Modal.confirm({
        title: '您有必填项未填写，是否继续提交？',
        onOk: async () => {
          submitFinally();
        },
        onCancel() {
          console.log('Cancel');
        }
      });
      return;
    }
    submitFinally();
  };

  async function submitFinally() {
    setDrawerProps({ confirmLoading: true });
    try {
      const paramas = JSON.parse(JSON.stringify(info.value));
      // 车间数据不传teamOrder
      if (!paramas.teamName) delete paramas.teamOrder;
      paramas.dataSource1.splice(1, 0, {
        rowKey: '2',
        lc: '互查劳保急救药盒',
        standard: '联保人员互查劳保穿戴情况、精神状况、急救药品佩戴（建议互保人员坐在一起，便于互查）；',
        file: '',
        illustrate: '',
        file1: '',
        illustrate1: '',
        file2: '',
        illustrate2: '',
        file3: '',
        illustrate3: '',
        file4: '',
        illustrate4: '',
      })
      await edit(paramas);
      emit('success');
      close();
    } finally {
      setDrawerProps({ confirmLoading: false });
    }
  }

  const add = (index: number) => info.value.pairsList.splice(index + 1, 0, { userId: '', userName: '' });
  const remove = (index: number) => info.value.pairsList.splice(index, 1);

  const handleUserIds = (cb: (userIds: string[]) => void) => {
    let list = info.value.pairsList.filter((item) => item.userId);
    if (info.value.leavePerson && info.value.leavePerson.trim() !== '') {
      list = list.concat({ userId: info.value.leavePerson, userName: '' });
    }
    const userIds = list.flatMap((item) => item.userId.split(','));
    cb(userIds);
  };

  const userConfirm = (_name: string, userName: string, index: number) => {
    info.value.pairsList[index].userName = userName;
  };
  const confirmLeavePersonName = (_name, userName) => {
    info.value.leavePersonName = userName;
    removeLeavePersonFromPairsList();
  };
  // 移除临时互保对子中存在的请假人员
  const removeLeavePersonFromPairsList = () => {
    if (!info.value.leavePerson || info.value.leavePerson === '') return;
    const leaveIds = info.value.leavePerson
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean);
    info.value.pairsList = info.value.pairsList.map((item) => {
      // 先拆分
      const ids = item.userId.split(',').map((id) => id.trim());
      const names = item.userName.split(',').map((name) => name.trim());
      // 过滤掉请假人员
      const filtered = ids
        .map((id, idx) => ({
          id,
          name: names[idx] || '',
        }))
        .filter((pair) => pair.id && !leaveIds.includes(pair.id));
      // 再拼接
      return {
        ...item,
        userId: filtered.map((pair) => pair.id).join(','),
        userName: filtered.map((pair) => pair.name).join(','),
      };
    });
  };
  const close = () => {
    emit('success');
    closeDrawer();
  };

  // 本次不召开
  const bzkVisible = ref(false);
  const bzkForm = ref({ teamOrder: undefined as any, bzkReason: '', bzkMsr: '', bzkPicture: '' });
  const bzkLoading = ref(false);
  const handleBzkOpen = () => {
    bzkForm.value = { teamOrder: undefined as any, bzkReason: '', bzkMsr: '', bzkPicture: '' };
    bzkVisible.value = true;
  };
  const handleBzkSubmit = async () => {
    if (!bzkForm.value.teamOrder) {
      Modal.warning({ title: '请选择班次' });
      return;
    }
    if (!bzkForm.value.bzkReason) {
      Modal.warning({ title: '请填写原因' });
      return;
    }
    if (!bzkForm.value.bzkMsr) {
      Modal.warning({ title: '请填写当班工作及安全措施' });
      return;
    }
    bzkLoading.value = true;
    try {
      await bzk({ id: info.value.id, ...bzkForm.value });
      bzkVisible.value = false;
      close();
    } finally {
      bzkLoading.value = false;
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
    columns,
    columns1,
    confirmLeavePersonName,
    teamOrderOption,
    isTeamData,
    displayDataSource1,
    bzkVisible,
    bzkForm,
    bzkLoading,
    handleBzkOpen,
    handleBzkSubmit,
    closeDrawer,
  };
};

export default useDrawer;
