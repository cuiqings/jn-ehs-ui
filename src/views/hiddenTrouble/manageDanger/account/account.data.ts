import { BasicColumn } from '/@/components/Table';
import { FormSchema } from '/@/components/Table';

export const columns: BasicColumn[] = [
  {
    title: '隐患状态',
    ellipsis: true,
    dataIndex: 'yhStatus_dictText',
    width: '100px',
    align: 'left',
  },
  {
    title: '检查层级',
    dataIndex: 'checkHierarchy',
    width: 100,
    align: 'left',
  },
  {
    title: '隐患来源',
    ellipsis: true,
    dataIndex: 'sourceType_dictText',
    width: 100,
    align: 'left',
  },
  {
    title: '检查时间',
    ellipsis: true,
    dataIndex: 'checkTime',
    width: 120,
    align: 'left',
  },
  {
    title: '所属单位',
    width: 120,
    dataIndex: 'orgName',
    align: 'left',
  },
  {
    title: '所属车间',
    dataIndex: 'departName',
    width: 120,
    align: 'left',
  },
  {
    title: '隐患编码',
    dataIndex: 'yhCode',
    width: 130,
    align: 'left',
  },
  {
    title: '隐患描述',
    ellipsis: false,
    dataIndex: 'yhDescription',
    width: 350,
    align: 'left',
    slots: {
      customRender: 'yhDescription',
    },
  },
  {
    title: '隐患等级',
    ellipsis: true,
    dataIndex: 'yhLevel',
    width: 100,
    align: 'left',
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
    title: '整改要求',
    ellipsis: true,
    dataIndex: 'repairRequire',
    width: 110,
    align: 'left',
    customRender: ({ text }) => {
      if (text === '1') {
        return '现场整改';
      }
      if (text === '2') {
        return '限期整改';
      }
    },
  },
  {
    title: '隐患分类',
    ellipsis: true,
    dataIndex: 'yhType_dictText',
    align: 'left',
  },
  {
    title: '子类',
    ellipsis: true,
    dataIndex: 'yhTypeSub_dictText',
    align: 'left',
  },
  {
    title: '车间责任人',
    ellipsis: true,
    dataIndex: 'departDutyPersonName',
    width: 130,
    align: 'left',
  },
  {
    title: '所属班组',
    ellipsis: true,
    dataIndex: 'teamName',
    width: 130,
    align: 'left',
  },
  {
    title: '班组责任人',
    ellipsis: true,
    dataIndex: 'teamDutyPersonName',
    width: 130,
    align: 'left',
  },
  {
    title: '检查人',
    ellipsis: true,
    dataIndex: 'checkPersonName',
    width: 120,
    align: 'left',
  },
  {
    title: '整改措施',
    ellipsis: true,
    dataIndex: 'sugRepairMsr',
    width: 180,
    align: 'left',
    customRender: ({ text, record }) => {
      if (!text) {
        return record.repairMsr;
      }
      return text;
    },
  },
  {
    title: '整改期限',
    ellipsis: true,
    dataIndex: 'repairTimeLimit',
    width: 120,
    align: 'left',
    slots: {
      customRender: 'repairTimeLimit',
    },
  },
  {
    title: '整改人',
    ellipsis: true,
    dataIndex: 'repairPersonName',
    width: 120,
    align: 'left',
  },
  {
    title: '整改完成时间',
    ellipsis: true,
    dataIndex: 'realRepairTime',
    width: 150,
    align: 'left',
  },
  {
    title: '复查验收结果',
    dataIndex: 'recheckResult',
    width: 120,
    align: 'left',
    customRender: ({ text }) => {
      if (text === '1') {
        return '合格';
      }
      if (text === '2') {
        return '不合格';
      }
    },
  },
  {
    title: '复查验收人',
    ellipsis: true,
    dataIndex: 'realCheckPersonName',
    width: 100,
    align: 'left',
  },
  {
    title: '复查验收时间',
    ellipsis: true,
    dataIndex: 'realCheckTime',
    width: 150,
    align: 'left',
  },
  {
    title: '备注',
    ellipsis: true,
    dataIndex: 'remark',
    width: 100,
    align: 'left',
  },
  {
    title: '隐患照片',
    dataIndex: 'yhPicture',
    width: 120,
    align: 'left',
    slots: {
      customRender: 'yhPicture',
    },
  },
  {
    title: '整改后照片',
    dataIndex: 'repairPicture',
    width: 120,
    align: 'left',
    slots: {
      customRender: 'repairPicture',
    },
  },
  {
    title: '整改通知书',
    dataIndex: 'repairNotice',
    width: 180,
    align: 'left',
    slots: { customRender: 'notice' },
  },
];
export const riskPointsColumns: BasicColumn[] = [
  {
    title: '风险ID',
    width: 150,
    align: 'center',
    dataIndex: 'uniqueCode',
    ellipsis: true,
  },
  {
    title: '所属单位',
    width: 150,
    align: 'center',
    dataIndex: 'orgCodeName',
    ellipsis: true,
  },
  {
    title: '所属车间',
    width: 150,
    align: 'center',
    dataIndex: 'departCodeName',
    ellipsis: true,
  },
  {
    title: '区域位置（单元）',
    width: 100,
    align: 'center',
    dataIndex: 'areaIdName',
    ellipsis: true,
  },
  {
    title: '风险名称',
    width: 100,
    align: 'center',
    dataIndex: 'riskName',
    ellipsis: true,
  },
  {
    title: '可能导致的事故类型',
    width: 150,
    align: 'center',
    dataIndex: 'standardRequest',
    ellipsis: true,
  },
  {
    title: '风险等级',
    width: 100,
    align: 'center',
    dataIndex: 'riskExtent',
    ellipsis: true,
  },
];
export const searchRiskPointsFormSchema: FormSchema[] = [
  {
    label: '所属单位',
    field: 'orgCode',
    component: 'Select',
    show: false,
    dynamicDisabled: true,
    componentProps: () => {
      return {
        options: [],
      };
    },
  },
  {
    label: '所属车间',
    field: 'departCode',
    component: 'Select',
    dynamicDisabled: true,
    show: false,
    componentProps: () => {
      return {
        options: [],
      };
    },
  },
];

export const signUserColumns: BasicColumn[] = [
  {
    title: '用户账号',
    align: 'center',
    dataIndex: 'username',
    ellipsis: true,
  },
  {
    title: '用户姓名',
    align: 'center',
    dataIndex: 'realname',
    ellipsis: true,
  },
];
