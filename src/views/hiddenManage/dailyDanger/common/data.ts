import { BasicColumn, FormSchema } from '/@/components/Table';
export const columns: BasicColumn[] = [
  {
    title: '隐患状态',
    ellipsis: true,
    dataIndex: 'yhStatus',
    width: '100px',
    customRender: ({ text }) => {
      //1确认退回 2待确认 3待整改 4待验收 5验收通过 6超期未整改
      if (text == '0') {
        return '系统自动退回';
      } else if (text == '1') {
        return '确认退回';
      } else if (text == '2') {
        return '待确认';
      } else if (text == '3') {
        return '待整改';
      } else if (text == '4') {
        return '待验收';
      } else if (text == '5') {
        return '验收通过';
      } else if (text == '6') {
        return '超期未整改';
      } else if (text == '7') {
        return '超期整改';
      }
      return '';
    },
  },
  {
    title: '检查时间',
    ellipsis: true,
    dataIndex: 'checkTime',
    width: 120,
  },
  {
    title: '检查层级',
    dataIndex: 'controlLevel',
    width: 100,
    customRender: ({ text }) => {
      // 1安全部 2厂部主要负责人 3厂部安全科 4车间负责人 5班组负责人 6岗位人员 7隐患上报 8专项检查
      if (text == '1') {
        return '安全部';
      } else if (text == '2') {
        return '厂部主要负责人';
      } else if (text == '3') {
        return '厂部安全科';
      } else if (text == '4') {
        return '车间负责人';
      } else if (text == '5') {
        return '班组负责人';
      } else if (text == '6') {
        return '岗位人员';
      } else if (text == '7') {
        return '隐患上报（隐患随手拍）';
      } else if (text == '8') {
        return '专项检查';
      }
      return '';
    },
  },
  {
    title: '检查人',
    ellipsis: true,
    dataIndex: 'checkPersonName',
    width: 120,
  },
  {
    title: '责任单位',
    width: 120,
    dataIndex: 'dutyOrgName',
  },
  {
    title: '整改部门',
    width: 120,
    dataIndex: 'repairDepartName',
  },
  {
    title: '隐患描述',
    ellipsis: false,
    dataIndex: 'yhDescription',
    width: 350,
    slots: {
      customRender: 'yhDescription',
    },
  },
  {
    title: '关联风险点',
    ellipsis: false,
    dataIndex: 'riskName',
    width: 150,
  },
  {
    title: '隐患等级',
    ellipsis: true,
    dataIndex: 'yhLevel',
    width: 100,
    customRender: ({ text }) => {
      if (text === '1') {
        return '一般隐患';
      }
      if (text === '2') {
        return '重大隐患';
      }
    },
  },
  {
    title: '治理措施',
    ellipsis: true,
    dataIndex: 'handleMsr',
    width: 180,
  },
  {
    title: '隐患类别',
    ellipsis: true,
    dataIndex: 'yhType_dictText',
  },
  {
    title: '隐患子类别',
    ellipsis: true,
    dataIndex: 'yhTypeSub_dictText',
  },
  {
    title: '完成时限',
    dataIndex: 'repairTimeLimit',
    width: 120,
    slots: {
      customRender: 'repairTimeLimit',
    },
  },
  {
    title: '整改责任人',
    ellipsis: true,
    dataIndex: 'repairPersonName',
    width: 130,
  },
  {
    title: '隐患照片',
    dataIndex: 'yhPicture',
    width: 120,
    slots: {
      customRender: 'yhPicture',
    },
  },
];
