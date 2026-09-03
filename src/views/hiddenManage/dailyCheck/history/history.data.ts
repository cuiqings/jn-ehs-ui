import { BasicColumn, FormSchema } from '/@/components/Table';
import { render } from '/@/utils/common/renderUtils';
export const columns: BasicColumn[] = [
  {
    title: '所属单位',
    width: 150,
    dataIndex: 'orgName',
  },
  {
    title: '所属车间',
    dataIndex: 'departName',
    width: 120,
  },
  {
    title: '计划名称',
    width: 140,
    dataIndex: 'planName',
  },
  {
    title: '排查周期',
    width: 100,
    dataIndex: 'checkCycle_dictText',
  },
  {
    title: '排查责任人',
    dataIndex: 'checkDutyPersonName',
    width: 130,
  },
  {
    title: '检查人',
    dataIndex: 'realExecutePersonName',
    width: 130,
  },
  {
    title: '任务时间',
    dataIndex: 'cycleTime',
    width: 180,
  },
  {
    title: '检查时间',
    dataIndex: 'realCheckTime',
    width: 140,
  },
  {
    title: '检查状态',
    dataIndex: 'status',
    width: 100,
    slots: { customRender: 'status' },
  },
  {
    title: '发现隐患',
    width: 80,
    dataIndex: 'yhCount',
    slots: { customRender: 'yhCount' },
  },
];
export const yhListColumns: BasicColumn[] = [
  {
    title: '隐患状态',
    ellipsis: true,
    dataIndex: 'yhStatus',
    width: '100px',
    align: 'center',
    customRender: ({ text }) => {
      //1确认退回 2确认中 3整改中 4待验收 5验收中 6验收通过
      if (text == '1') {
        return '确认退回';
      } else if (text == '2') {
        return '确认中';
      } else if (text == '3') {
        return '整改中';
      } else if (text == '4') {
        return '待验收';
      } else if (text == '5') {
        return '验收中';
      } else if (text == '6') {
        return '验收通过';
      }
      return '';
    },
  },
  {
    title: '检查时间',
    ellipsis: true,
    dataIndex: 'checkTime',
    width: 100,
    align: 'center',
  },
  {
    title: '检查人',
    ellipsis: true,
    dataIndex: 'checkPersonName',
    width: 100,
    align: 'center',
  },
  {
    title: '责任单位',
    width: 120,
    dataIndex: 'orgName',
    align: 'center',
  },
  {
    title: '隐患名称（描述）',
    ellipsis: true,
    dataIndex: 'yhDescription',
    width: 150,
    align: 'center',
  },
  {
    title: '隐患等级',
    dataIndex: 'yhLevel',
    width: 100,
    align: 'center',
    customRender: ({ text }) => {
      if (text === '1') {
        return '一般';
      }
      if (text === '2') {
        return '重大';
      }
    },
  },
  {
    title: '隐患类别',
    ellipsis: true,
    dataIndex: 'yhType_dictText',
    width: 100,
    align: 'center',
  },
  {
    title: '隐患子类别',
    ellipsis: true,
    dataIndex: 'yhTypeSub_dictText',
    width: 120,
    align: 'center',
  },
  {
    title: '完成时限',
    dataIndex: 'repairTimeLimit',
    width: 120,
    slots: {
      customRender: 'repairTimeLimit',
    },
    align: 'center',
  },
  {
    title: '隐患照片',
    dataIndex: 'checkPicture',
    width: 120,
    slots: {
      customRender: 'checkPicture',
    },
    align: 'center',
  },
];
export const checkColumns: BasicColumn[] = [
  {
    title: '辨识单元',
    ellipsis: true,
    dataIndex: 'recogUnit',
    width: '150px',
    align: 'center',
  },
  {
    title: '风险部位',
    ellipsis: true,
    dataIndex: 'riskName',
    width: '150px',
    align: 'center',
  },
  {
    title: '风险失控表现',
    ellipsis: true,
    dataIndex: 'riskFactor',
    width: '150px',
    align: 'center',
  },
  {
    title: '检查结果',
    ellipsis: true,
    dataIndex: 'checkResult',
    width: '100px',
    align: 'center',
    customRender: ({ text }) => {
      switch (text) {
        case '1':
          return '合格';
        case '2':
          return '不合格';
        case '3':
          return '不涉及';
        default:
          return '';
      }
    },
  },
  {
    title: '检查照片',
    dataIndex: 'checkPicture',
    width: '100px',
    align: 'center',
    slots: { customRender: 'checkPicture' },
  },
  {
    title: '隐患描述',
    dataIndex: 'yhDescription',
    width: '140px',
    align: 'center',
    ellipsis: true,
  },
];
export const checkColumns1: BasicColumn[] = [
  {
    title: '辨识单元',
    ellipsis: true,
    dataIndex: 'recogUnit',
    width: '150px',
    align: 'center',
  },
  {
    title: '风险部位',
    ellipsis: true,
    dataIndex: 'riskName',
    width: '150px',
    align: 'center',
  },
  {
    title: '风险失控表现',
    ellipsis: true,
    dataIndex: 'riskFactor',
    width: '150px',
    align: 'center',
  },
  {
    title: '检查结果',
    ellipsis: true,
    dataIndex: 'checkResult',
    width: '100px',
    align: 'center',
    customRender: ({ text }) => {
      switch (text) {
        case '1':
          return '合格';
        case '2':
          return '不合格';
        case '3':
          return '不涉及';
        default:
          return '';
      }
    },
  },
  {
    title: '检查照片',
    dataIndex: 'checkPicture',
    width: '100px',
    align: 'center',
    slots: { customRender: 'checkPicture' },
  },
  {
    title: '隐患描述',
    dataIndex: 'problemDescription',
    width: '140px',
    align: 'center',
    ellipsis: true,
  },
];
