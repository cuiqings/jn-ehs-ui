import { BasicColumn, FormSchema } from '/@/components/Table';
import { render } from '/@/utils/common/renderUtils';
export const columns: BasicColumn[] = [
  {
    title: '检查类型',
    width: 140,
    dataIndex: 'checkType',
    customRender: ({ record }) => {
      // 检查类别（3综合检查 4季节性检查 5节假日检查 6专项检查 7重大事故隐患检查 8重大风险管控措施检查）
      if (record.checkType == '3') {
        return '综合检查';
      } else if (record.checkType == '4') {
        return '季节性检查';
      } else if (record.checkType == '5') {
        return '节假日检查';
      } else if (record.checkType == '6') {
        return '专项检查';
      } else if (record.checkType == '7') {
        return '重大事故隐患检查';
      } else if (record.checkType == '8') {
        return '重大风险管控措施检查';
      }
      return '';
    },
  },
  {
    title: '任务名称',
    dataIndex: 'taskName',
    width: 120,
    ellipsis: true,
  },
  {
    title: '检查范围',
    width: 160,
    dataIndex: 'orgNameRange',
    ellipsis: true,
  },
  {
    title: '任务时间',
    width: 220,
    dataIndex: 'taskTimeStart',
    customRender: ({ record }) => {
      return record.taskTimeStart + ' - ' + record.taskTimeEnd;
    },
  },

  {
    title: '检查人',
    width: 180,
    dataIndex: 'checkPersonName',
    ellipsis: true,
  },
  {
    title: '备注',
    dataIndex: 'remark',
    ellipsis: true,
    width: 110,
  },
  {
    title: '状态',
    dataIndex: 'status',
    width: 100,
    slots: { customRender: 'status' },
  },
  {
    title: '检查通报',
    width: 100,
    dataIndex: 'checkNotice',
    slots: { customRender: 'checkNotice' },
  },
  {
    title: '整改计划',
    width: 100,
    dataIndex: 'repairPlan',
    slots: { customRender: 'repairPlan' },
  },
  {
    title: '整改报告',
    width: 100,
    dataIndex: 'checkReport',
    slots: { customRender: 'checkReport' },
  },
  {
    title: '影像资料',
    width: 100,
    dataIndex: 'attachments',
    slots: { customRender: 'attachments' },
  },
];
export const checkColumns: BasicColumn[] = [
  {
    title: '检查内容及标准',
    ellipsis: true,
    dataIndex: 'contentStandard',
    width: '150px',
    align: 'center',
  },
  {
    title: '检查状态',
    ellipsis: true,
    dataIndex: 'riskName',
    width: '150px',
    align: 'center',
    customRender: ({ text, record }) => {
      if (record.checkResult) {
        return '已检查';
      } else {
        return '未检查';
      }
    },
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
];
export const checkColumns1: BasicColumn[] = [
  {
    title: '违法行为描述',
    ellipsis: true,
    dataIndex: 'violationDescribe',
    width: '150px',
    align: 'center',
  },
  {
    title: '判定情形',
    ellipsis: true,
    dataIndex: 'judgeSituation',
    width: '150px',
    align: 'center',
  },
  {
    title: '检查状态',
    dataIndex: 'checkResult',
    width: '140px',
    align: 'center',
    customRender: ({ record }) => {
      if (record.checkResult) {
        return '已检查';
      } else {
        return '未检查';
      }
    },
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
];
export const checkColumns2: BasicColumn[] = [
  {
    title: '所属单位',
    ellipsis: true,
    dataIndex: 'orgName',
    width: '120px',
    align: 'center',
  },
  {
    title: '所属车间',
    ellipsis: true,
    dataIndex: 'departName',
    width: '100px',
    align: 'center',
  },
  {
    title: '辨识单元',
    dataIndex: 'recogUnit',
    width: '100px',
    align: 'center',
  },
  {
    title: '风险部位',
    dataIndex: 'workSite',
    width: '110px',
    align: 'center',
  },
  {
    title: '风险失控表现',
    dataIndex: 'riskFactor',
    width: '120px',
    align: 'center',
    ellipsis: true,
  },
  {
    title: '检查状态',
    dataIndex: 'checkResult',
    width: '80px',
    align: 'center',
    customRender: ({ record }) => {
      if (record.checkResult) {
        return '已检查';
      } else {
        return '未检查';
      }
    },
  },
  {
    title: '检查结果',
    ellipsis: true,
    dataIndex: 'checkResult',
    width: '80px',
    align: 'center',
    customRender: ({ text }) => {
      switch (text) {
        case '1':
          return '合格';
        case '2':
          return '不合格';
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
];
