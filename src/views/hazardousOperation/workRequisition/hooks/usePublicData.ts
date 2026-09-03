import { ref } from 'vue';
import type { Rule } from 'ant-design-vue/es/form';
export const usePublicData = () => {
  const levelList = [
    { text: '一级', label: '一级', value: '一级' },
    { text: '二级', label: '二级', value: '二级' },
    { text: '三级', label: '三级', value: '三级' },
  ];

  const workGradeList = {
    1: [
      { text: '一级', label: '一级', value: '一级' },
      { text: '二级', label: '二级', value: '二级' },
      { text: '三级', label: '三级', value: '三级' },
      { text: '四级', label: '四级', value: '四级' },
    ],
    3: [
      { text: '特级', label: '特级', value: '特级' },
      { text: '一级', label: '一级', value: '一级' },
      { text: '二级', label: '二级', value: '二级' },
    ],
    4: [
      { text: '一级', label: '一级', value: '一级' },
      { text: '二级', label: '二级', value: '二级' },
      { text: '三级', label: '三级', value: '三级' },
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
    {
      title: '附件',
      dataIndex: 'annex',
      align: 'center',
      width: 160,
    },
  ];
  const colum0 = [
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
      dataIndex: 'index',
      align: 'center',
    },
    {
      title: '设施',
      dataIndex: 'facility',
      align: 'center',
    },
    {
      title: '单位',
      dataIndex: 'unit',
      align: 'center',
    },
    {
      title: '数量',
      dataIndex: 'number',
      align: 'center',
    },
  ];

  const dataSauce2 = ref<any[]>([
    {
      index: 1,
      facility: '空气呼吸器',
      unit: '台',
      number: '',
      selected: false,
    },
    {
      index: 2,
      facility: '担架',
      unit: '个',
      number: '',
      selected: false,
    },
    {
      index: 3,
      facility: '煤气报警仪',
      unit: '个',
      number: '',
      selected: false,
    },
    {
      index: 4,
      facility: '氧气袋',
      unit: '套',
      number: '',
      selected: false,
    },
  ]);

  // 停送煤气作业 操作步骤
  const colum3 = [
    {
      title: '序号',
      dataIndex: 'index',
      align: 'center',
    },
    {
      title: '操作步骤',
      dataIndex: 'procedure',
      align: 'center',
    },
  ];

  // 停煤气 操作步骤
  const dataSauce3 = ref<any[]>([
    {
      index: 1,
      procedure: '负责人作业前动员及强调安全注意事项。',
      selected: false,
    },
    {
      index: 2,
      procedure: '作业前准备好各类防护器材及安全措施检查。',
      selected: false,
    },
    {
      index: 3,
      procedure: '确认煤气设备设施已停运，具备停煤气条件。',
      selected: false,
    },
    {
      index: 4,
      procedure: '佩戴一氧化碳报警仪，关闭煤气设备设施阀门。',
      selected: false,
    },
    {
      index: 5,
      procedure: '确认设备设施末端放散管附近无作业人员。',
      selected: false,
    },
    {
      index: 6,
      procedure: '开末端放散管并做好监护。',
      selected: false,
    },
    {
      index: 7,
      procedure: '接好氮气吹扫管，打开氮气阀门进行吹扫。',
      selected: false,
    },
    {
      index: 8,
      procedure: '直至煤气防护检测CO浓度小于24ppm为合格。',
      selected: false,
    },
    {
      index: 9,
      procedure: '如需进入煤气设备设施内部作业，进行空气置换氮气，检测氧含量在合格范围内（19.5%—23%），并设专职监护人员。',
      selected: false,
    },
  ]);
  // 送煤气 操作步骤
  const dataSauce4 = ref<any[]>([
    {
      index: 1,
      procedure: '作业前填写好相应的操作票及安全交底。',
      selected: false,
    },
    {
      index: 2,
      procedure: '穿戴好劳保用品，准备各类防护器材。',
      selected: false,
    },
    {
      index: 3,
      procedure: '确认煤气设备设施已检修完毕，且人员、设备已撤离。',
      selected: false,
    },
    {
      index: 4,
      procedure: '确认设备设施末端放散管附近无作业人员。',
      selected: false,
    },
    {
      index: 5,
      procedure: '确认煤气管末端放散阀已打开。',
      selected: false,
    },
    {
      index: 6,
      procedure: '接好氮气吹扫阀门，打开氮气吹扫阀吹扫。',
      selected: false,
    },
    {
      index: 7,
      procedure: '用氧含量检测仪在末端放散管试验头检测，氧含量小于2%为合格。',
      selected: false,
    },
    {
      index: 8,
      procedure: '监视放散管区域环境变化情况。',
      selected: false,
    },
    {
      index: 9,
      procedure: '关闭氮气吹扫阀，拆除氮气连接胶管。',
      selected: false,
    },
    {
      index: 10,
      procedure: '逐渐打开阀门向管道内送煤气。',
      selected: false,
    },
    {
      index: 11,
      procedure: '置换一段时间后在末端放散管处取样试爆，直至合格，关闭放散管。',
      selected: false,
    },
    {
      index: 12,
      procedure: '全开总阀送气，煤气设备设施恢复正常供气，设备设施所属单元可按岗位规程进行相关操作。',
      selected: false,
    },
  ]);

  // 风险辨识
  const possibleDangerList: any[] = [
    { label: '物体打击', value: '物体打击' },
    { label: '车辆伤害', value: '车辆伤害' },
    { label: '机械伤害', value: '机械伤害' },
    { label: '起重伤害', value: '起重伤害' },
    { label: '触电', value: '触电' },
    { label: '淹溺', value: '淹溺' },
    { label: '灼烫', value: '灼烫' },
    { label: '火灾', value: '火灾' },
    { label: '高处坠落', value: '高处坠落' },
    { label: '坍塌', value: '坍塌' },
    { label: '锅炉爆炸', value: '锅炉爆炸' },
    { label: '容器爆炸', value: '容器爆炸' },
    { label: '其它爆炸', value: '其它爆炸' },
    { label: '中毒和窒息', value: '中毒和窒息' },
    { label: '其他伤害', value: '其他伤害' },
  ];

  const possibleDangerList2: any[] = [
    { label: '物体打击', value: '物体打击' },
    { label: '厂(场)内车辆致害', value: '厂(场)内车辆致害' },
    { label: '道路(轨道)车辆致害', value: '道路(轨道)车辆致害' },
    { label: '机械致害', value: '机械致害' },
    { label: '起重致害', value: '起重致害' },
    { label: '触电', value: '触电' },
    { label: '淹溺', value: '淹溺' },
    { label: '灼烫', value: '灼烫' },
    { label: '火灾', value: '火灾' },
    { label: '高处坠落', value: '高处坠落' },
    { label: '跌落', value: '跌落' },
    { label: '坍塌', value: '坍塌' },
    { label: '水害', value: '水害' },
    { label: '容器爆炸', value: '容器爆炸' },
    { label: '管道爆炸', value: '管道爆炸' },
    { label: '可燃气体爆炸', value: '可燃气体爆炸' },
    { label: '可燃液体蒸气爆炸', value: '可燃液体蒸气爆炸' },
    { label: '粉尘爆炸', value: '粉尘爆炸' },
    { label: '民用爆炸物品爆炸', value: '民用爆炸物品爆炸' },
    { label: '烟花爆竹爆炸', value: '烟花爆竹爆炸' },
    { label: '其他可燃固体爆炸', value: '其他可燃固体爆炸' },
    { label: '高温熔融物爆炸', value: '高温熔融物爆炸' },
    { label: '中毒', value: '中毒' },
    { label: '窒息', value: '窒息' },
    { label: '滑坡', value: '滑坡' },
    { label: '泄漏', value: '泄漏' },
    { label: '其他伤害', value: '其他伤害' },
  ];

  // 根据传入的作业申请时间判断 大于2026-05-26的作业返回possibleDangerList2 小于等于2026-05-26的作业返回possibleDangerList
  const getPossibleDangerList = (workTime: string) => {
    if (!workTime) workTime = '2026-05-28';
    return new Date(workTime) > new Date('2026-05-26') ? possibleDangerList2 : possibleDangerList;
  };

  const workTimeValidation = (workType: string, value: string): Rule => {
    if (workType === '1') {
      return {
        type: 'array',
        required: true,
        validator: (_rule, time) => {
          console.log('time', time);
          if (!time) return Promise.reject('请选择作业实施时间！');
          if (workType === '1') {
            if (time.length > 0) {
              if (new Date(time[1]).getTime() - new Date(time[0]).getTime() > 7 * 24 * 60 * 60 * 1000) {
                return Promise.reject('高处作业的作业实施时间最长为7天！');
              } else {
                return Promise.resolve();
              }
            } else {
              return Promise.reject('请输入作业实施时间！');
            }
          }
        },
        trigger: 'change',
      };
    } else if (workType === '2') {
      return {
        type: 'array',
        required: true,
        validator: (_rule, time) => {
          console.log('time', time);
          if (!time) return Promise.reject('请选择作业实施时间！');
          if (time.length > 0) {
            if (new Date(time[1]).getTime() - new Date(time[0]).getTime() > 24 * 60 * 60 * 1000) {
              return Promise.reject('有限空间的作业实施时间最长为24小时！');
            } else {
              return Promise.resolve();
            }
          } else {
            return Promise.reject('请输入作业实施时间！');
          }
        },
        trigger: 'change',
      };
    } else if (workType === '3') {
      return {
        type: 'array',
        required: true,
        validator: (_rule, time) => {
          console.log('time', time);
          if (!time) return Promise.reject('请选择作业实施时间！');

          if (value == '特级' && new Date(time[1]).getTime() - new Date(time[0]).getTime() > 24 * 60 * 60 * 1000) {
            return Promise.reject('特级动火的动火期限最长为24小时！');
          } else if (value == '一级' && new Date(time[1]).getTime() - new Date(time[0]).getTime() > 3 * 24 * 60 * 60 * 1000) {
            return Promise.reject('一级动火的动火期限最长为72小时！');
          } else if (value == '二级' && new Date(time[1]).getTime() - new Date(time[0]).getTime() > 7 * 24 * 60 * 60 * 1000) {
            return Promise.reject('二级动火的动火期限最长为7天！');
          } else {
            return Promise.resolve();
          }
        },
        trigger: 'change',
      };
    } else if (workType === '4') {
      return {
        type: 'array',
        required: true,
        validator: (_rule, time) => {
          console.log('time', time);
          if (!time) return Promise.reject('请选择作业实施时间！');
          if (time.length > 0) {
            return Promise.resolve();
          } else {
            return Promise.reject('请输入作业实施时间！');
          }
        },
        trigger: 'change',
      };
    } else if (workType === '5') {
      return {
        type: 'array',
        required: true,
        validator: (_rule, time) => {
          if (!time) return Promise.reject('请选择作业实施时间！');
          if (time.length > 0) {
            if (new Date(time[1]).getTime() - new Date(time[0]).getTime() > 15 * 24 * 60 * 60 * 1000) {
              return Promise.reject('临时用电的期限最长为15天！');
            } else {
              return Promise.resolve();
            }
          } else {
            return Promise.reject('请输入作业实施时间！');
          }
        },
        trigger: 'change',
      };
    } else {
      return {
        type: 'array',
        required: true,
        validator: (_rule, time) => {
          console.log('time', time);
          if (!time) return Promise.reject('请选择作业实施时间！');
          if (time.length > 0) {
            return Promise.resolve();
          } else {
            return Promise.reject('请输入作业实施时间！');
          }
        },
        trigger: 'change',
      };
    }
  };

  return {
    colum,
    colum0,
    colum2,
    colum3,
    levelList,
    dataSauce2,
    dataSauce3,
    dataSauce4,
    workGradeList,
    possibleDangerList,
    possibleDangerList2,
    getPossibleDangerList,
    workTimeValidation,
  };
};
