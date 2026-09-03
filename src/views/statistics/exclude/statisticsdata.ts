// import { ref } from 'vue'
import { BasicColumn, FormSchema } from '/@/components/Table';
import { render } from '/@/utils/common/renderUtils';
// import { defHttp } from '/@/utils/http/axios'
import dayjs from 'dayjs';
export const columns: BasicColumn[] = [
  {
    title: '所属单位',
    width: 150,
    dataIndex: 'orgName',
  },
  {
    title: '所属车间',
    dataIndex: 'departName',
    width: 100,
  },
  {
    title: '计划名称',
    width: 160,
    dataIndex: 'planName',
  },
  {
    title: '执行人',
    dataIndex: 'checkDutyPersonName',
    width: 100,
  },
  {
    title: '任务总数',
    dataIndex: 'totalCount',
    width: 120,
  },
  {
    title: '已检查',
    dataIndex: 'completedCount',
    width: 120,
  },
  {
    title: '未检查',
    dataIndex: 'uncompleteCount',
    width: 100,
    slots: { customRender: 'abnormalNum' },
  },
  {
    title: '检查完成率(%)',
    dataIndex: 'completeRate',
    width: 100,
  },
];

export const noCompleteColumns = [
  {
    title: '序号',
    dataIndex: 'index',
    key: 'index',
    width: '78px',
    align: 'center',
  },
  {
    title: '所属产线',
    width: '100px',
    align: 'center',
    dataIndex: 'orgName',
    key: 'orgName',
  },
  {
    title: '所属部门',
    width: '100px',
    align: 'center',
    dataIndex: 'departName',
    key: 'departName',
  },
  {
    title: '计划类型',
    width: 100,
    align: 'center',
    dataIndex: 'planType',
    customRender: ({ text }) => {
      return render.renderDict(text, 'yh_plan_type');
    },
  },
  {
    title: '计划名称',
    width: '100px',
    align: 'center',
    dataIndex: 'planName',
    key: 'planName',
  },
  {
    title: '巡检周期',
    width: '100px',
    align: 'center',
    dataIndex: 'checkCycle',
    key: 'checkCycle',
  },
  {
    title: '监督角色',
    width: '100px',
    align: 'center',
    dataIndex: 'superviseRoleName',
    key: 'superviseRoleName',
  },
  {
    title: '执行人',
    width: '100px',
    align: 'center',
    dataIndex: 'executeRoleName',
    key: 'executeRoleName',
  },
  {
    title: '创建时间',
    width: '120px',
    align: 'center',
    dataIndex: 'executeDate',
    key: 'executeDate',
  },
  {
    title: '巡检情况',
    width: '100px',
    dataIndex: 'status',
    key: 'status',
    align: 'center',
    customRender: ({ text }) => {
      // 0未检查 1已检查 2已超时
      if (text === '0') {
        return '未检查';
      } else if (text === '1') {
        return '已检查';
      } else if (text === '2') {
        return '已超时';
      }
    },
  },
];

export const searchFormSchema: FormSchema[] = [
  {
    label: '所属机构',
    field: 'org',
    component: 'Select',
    componentProps: {
      allowClear: false,
      options: [],
      placeholder: '请选择',
    },
    colProps: { span: 6 },
  },
  {
    label: '所属车间',
    field: 'depart',
    component: 'Select',
    componentProps: {
      allowClear: true,
      options: [],
      placeholder: '请选择',
    },
    colProps: { span: 6 },
  },
  {
    label: '统计时间',
    field: 'time',
    component: 'RangePicker',
    colProps: { span: 6 },
    defaultValue: [dayjs(new Date()).format('YYYY-MM-DD'), dayjs(new Date()).format('YYYY-MM-DD')],
    componentProps: {
      valueFormat: 'YYYY-MM-DD',
      style: { width: '100%' },
    },
  },
];
