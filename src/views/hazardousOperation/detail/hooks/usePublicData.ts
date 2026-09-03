import { ref } from 'vue';
import type { Rule } from 'ant-design-vue/es/form';
export const usePublicData = () => {
  const levelList = [
    { label: '一级', value: '一级' },
    { label: '二级', value: '二级' },
  ];

  const workGradeList = {
    1: [
      { label: '一级', value: '一级' },
      { label: '二级', value: '二级' },
      { label: '三级', value: '三级' },
      { label: '四级', value: '四级' },
    ],
    3: [
      { label: '特级', value: '特级' },
      { label: '一级', value: '一级' },
      { label: '二级', value: '二级' },
    ],
    4: [
      { label: '一级', value: '一级' },
      { label: '二级', value: '二级' },
      { label: '三级', value: '三级' },
    ],
  };

  // 安全措施
  const colum = [
    {
      title: '序号',
      dataIndex: 'id',
      align: 'center',
      width: 80,
    },
    {
      title: '安全措施',
      dataIndex: 'name',
      align: 'center',
    },
  ];

  // 停送煤气作业 现场防护设施准备情况
  const colum2 = [
    {
      title: '序号',
      dataIndex: 'id',
      align: 'center',
    },
    {
      title: '设施',
      dataIndex: 'name',
      align: 'center',
    },
    {
      title: '单位',
      dataIndex: 'unit',
      align: 'center',
    },
    {
      title: '数量',
      dataIndex: 'count',
      align: 'center',
    },
  ];

  const dataSauce2 = ref<any[]>([
    {
      id: 1,
      name: '空气呼吸器',
      unit: '台',
      count: '',
    },
    {
      id: 2,
      name: '担架',
      unit: '个',
      count: '',
    },
    {
      id: 3,
      name: '煤气报警仪',
      unit: '个',
      count: '',
    },
    {
      id: 4,
      name: '氧气袋',
      unit: '套',
      count: '',
    },
  ]);

  // 风险辨识
  const possibleDangerList = {
    1: [
      { label: '高处坠落', value: '高处坠落' },
      { label: '物体打击', value: '物体打击' },
      { label: '机械伤害', value: '机械伤害' },
      { label: '火灾', value: '火灾' },
      { label: '中毒和窒息', value: '中毒和窒息' },
      { label: '触电', value: '触电' },
      { label: '灼烫', value: '灼烫' },
      { label: '其他伤害', value: '其他伤害' },
    ],
    2: [
      { label: '中毒和窒息', value: '中毒和窒息' },
      { label: '火灾', value: '火灾' },
      { label: '触电', value: '触电' },
      { label: '坍塌', value: '坍塌' },
      { label: '灼烫', value: '灼烫' },
      { label: '其他伤害', value: '其他伤害' },
    ],
    3: [
      { label: '火灾', value: '火灾' },
      { label: '其它爆炸', value: '其它爆炸' },
      { label: '触电', value: '触电' },
      { label: '灼烫', value: '灼烫' },
      { label: '中毒和窒息', value: '中毒和窒息' },
      { label: '物体打击', value: '物体打击' },
      { label: '其他伤害', value: '其他伤害' },
    ],
    4: [
      { label: '起重伤害', value: '起重伤害' },
      { label: '物体打击', value: '物体打击' },
      { label: '机械伤害', value: '机械伤害' },
      { label: '高处坠落', value: '高处坠落' },
      { label: '车辆伤害', value: '车辆伤害' },
      { label: '其他伤害', value: '其他伤害' },
    ],
    5: [
      { label: '触电', value: '触电' },
      { label: '火灾', value: '火灾' },
      { label: '灼烫', value: '灼烫' },
      { label: '其他爆炸', value: '其他爆炸' },
      { label: '其他伤害', value: '其他伤害' },
    ],
  };

  const workTimeValidation = (workType: string, value: string): Rule => {
    return {
      type: 'array',
      required: true,
      validator: (_rule, time) => {
        if (workType === '1') {
          if (time.length > 0) {
            if (value == '一级' && new Date(time[1]).getTime() - new Date(time[0]).getTime() > 7 * 24 * 60 * 60 * 1000) {
              return Promise.reject('高处作业等级为一级的作业实施时间最长为7天！');
            } else if (value == '二级' && new Date(time[1]).getTime() - new Date(time[0]).getTime() > 5 * 24 * 60 * 60 * 1000) {
              return Promise.reject(' 高处作业等级为二级的作业实施时间最长为5天！');
            } else if (value == '三级' && new Date(time[1]).getTime() - new Date(time[0]).getTime() > 3 * 24 * 60 * 60 * 1000) {
              return Promise.reject('高处作业等级为三级的作业实施时间最长为3天！');
            } else if ((value == '四级' || value == '五级') && new Date(time[1]).getTime() - new Date(time[0]).getTime() > 8 * 60 * 60 * 1000) {
              return Promise.reject('高处作业等级为四级/五级的作业实施时间最长为8小时！');
            } else {
              return Promise.resolve();
            }
          } else {
            return Promise.reject('请输入作业实施时间！');
          }
          // 高处作业等级为一级的作业实施时间最长为7天！
          // 高处作业等级为二级的作业实施时间最长为5天！
          // 高处作业等级为三级的作业实施时间最长为3天！
          // 高处作业等级为四级/五级的作业实施时间最长为8小时！
        } else if (workType === '2') {
          if (time.length > 0) {
            if (value == '一级' && new Date(time[1]).getTime() - new Date(time[0]).getTime() > 8 * 60 * 60 * 1000) {
              return Promise.reject('吊装作业等级为一级的作业实施时间最长为8小时！');
            } else if (value == '二级' && new Date(time[1]).getTime() - new Date(time[0]).getTime() > 3 * 24 * 60 * 60 * 1000) {
              return Promise.reject('吊装作业等级为二级的作业实施时间最长为3天！');
            } else if (value == '三级' && new Date(time[1]).getTime() - new Date(time[0]).getTime() > 5 * 24 * 60 * 60 * 1000) {
              return Promise.reject('吊装作业等级为三级的作业实施时间最长为5天！');
            } else {
              return Promise.resolve();
            }
          } else {
            return Promise.reject('请输入作业实施时间！');
          }
          // 吊装作业等级为一级的作业实施时间最长为8小时！
          // 吊装作业等级为二级的作业实施时间最长为3天！
          // 吊装作业等级为三级的作业实施时间最长为5天！
        } else if (workType === '3') {
          if (time.length > 0) {
            if (new Date(time[1]).getTime() - new Date(time[0]).getTime() > 24 * 60 * 60 * 1000) {
              return Promise.reject('有限空间的作业实施时间最长为24小时！');
            } else {
              return Promise.resolve();
            }
          } else {
            return Promise.reject('请输入作业实施时间！');
          }
        } else if (workType === '4') {
          if (value == 'A级' && new Date(time[1]).getTime() - new Date(time[0]).getTime() > 8 * 60 * 60 * 1000) {
            return Promise.reject('A级动火的动火期限最长为8小时！');
          } else if (value == 'B级' && new Date(time[1]).getTime() - new Date(time[0]).getTime() > 3 * 24 * 60 * 60 * 1000) {
            return Promise.reject(' B级动火的动火期限最长为3天！');
          } else if (value == 'C级' && new Date(time[1]).getTime() - new Date(time[0]).getTime() > 15 * 24 * 60 * 60 * 1000) {
            return Promise.reject('C级动火的动火期限最长为15天！');
          } else {
            return Promise.resolve();
          }
        } else if (workType == '5') {
          if (time.length > 0) {
            if (new Date(time[1]).getTime() - new Date(time[0]).getTime() > 15 * 24 * 60 * 60 * 1000) {
              return Promise.reject('动土作业实施时间最长为15天！');
            } else {
              return Promise.resolve();
            }
          } else {
            return Promise.reject('请输入作业实施时间！');
          }
        } else if (workType == '6') {
          if (time.length > 0) {
            return Promise.resolve();
          } else {
            return Promise.reject('请输入作业实施时间！');
          }
        } else if (workType == '7') {
          if (time.length > 0) {
            if (new Date(time[1]).getTime() - new Date(time[0]).getTime() > 90 * 24 * 60 * 60 * 1000) {
              return Promise.reject('长期动火时间最长3个月！');
            } else {
              return Promise.resolve();
            }
          } else {
            return Promise.reject('请输入作业实施时间！');
          }
        } else {
          if (time.length > 0) {
            return Promise.resolve();
          } else {
            return Promise.reject('请输入作业实施时间！');
          }
        }
      },
      trigger: 'change',
    };
  };

  // 有限空间气体分析
  const colum4 = [
    {
      title: '序号',
      dataIndex: 'index',
      align: 'center',
    },
    {
      title: '位置',
      dataIndex: 'analysisSite',
      align: 'center',
    },
    {
      title: '氧含量（%）',
      dataIndex: 'oxygenContent',
      align: 'center',
    },
    {
      title: '一氧化碳（ppm）',
      dataIndex: 'carbonMonoxide',
      align: 'center',
    },
    {
      title: '可燃气（%LEL）',
      dataIndex: 'gas',
      align: 'center',
    },
    {
      title: '硫化氢（ppm）',
      dataIndex: 'toxicHarmfulMedia',
      align: 'center',
    },
    {
      title: '取样时间',
      dataIndex: 'analysisTime',
      align: 'center',
    },
    {
      title: '分析人',
      dataIndex: 'analyst',
      align: 'center',
    },
  ];
  // 动火气体分析
  const colum5 = [
    {
      title: '动火分析时间',
      dataIndex: 'analysisTime',
      align: 'center',
    },
    {
      title: '采样地点',
      dataIndex: 'analysisSite',
      align: 'center',
    },
    {
      title: '分析数据',
      dataIndex: 'analysisData',
      align: 'center',
    },
    {
      title: '分析人',
      dataIndex: 'analyst',
      align: 'center',
    },
  ];
  // 有限空间进出记录
  const colum6 = [
    {
      title: '序号',
      dataIndex: 'index',
      align: 'center',
    },
    {
      title: '有限空间名称',
      dataIndex: 'spaceName',
      align: 'center',
    },
    {
      title: '检修部位',
      dataIndex: 'accessParts',
      align: 'center',
    },
    {
      title: '进入时间',
      dataIndex: 'inTime',
      align: 'center',
    },
    {
      title: '进入人签字',
      dataIndex: 'inSign',
      align: 'center',
    },
    {
      title: '携带工具',
      dataIndex: 'carryTools',
      align: 'center',
    },
    {
      title: '出来时间',
      dataIndex: 'outTime',
      align: 'center',
    },
    {
      title: '出来人员签字',
      dataIndex: 'outSign',
      align: 'center',
    },
    {
      title: '携带工具',
      dataIndex: 'carryTools',
      align: 'center',
    },
    {
      title: '监护人签字',
      dataIndex: 'inSignConfirm',
      align: 'center',
    },
    {
      title: '备注',
      dataIndex: 'remark',
      align: 'center',
    },
  ];

  // 操作步骤记录
  const colum7 = [
    {
      title: '操作步骤',
      dataIndex: 'workProcedure',
      align: 'center',
    },
    {
      title: '完成时间',
      dataIndex: 'operatingTime',
      align: 'center',
    },
    {
      title: '操作者',
      dataIndex: 'operatingUserName',
      align: 'center',
    },
    {
      title: '完成情况',
      dataIndex: 'finishStatus',
      align: 'center',
    },
    {
      title: '确认人',
      dataIndex: 'confirmUserName',
      align: 'center',
    },
  ];

  return {
    colum,
    colum2,
    colum4,
    colum5,
    colum6,
    colum7,
    levelList,
    dataSauce2,
    workGradeList,
    possibleDangerList,
    workTimeValidation,
  };
};
