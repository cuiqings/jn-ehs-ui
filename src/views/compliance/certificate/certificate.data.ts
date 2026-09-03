import { BasicColumn } from '/@/components/Table';
import { FormSchema } from '/@/components/Table';
import { h } from 'vue';
//列表数据
export const columns: BasicColumn[] = [
  {
    title: '所属机构',
    align: 'center',
    dataIndex: 'orgName',
  },
  {
    title: '证件类型',
    align: 'center',
    dataIndex: 'certificateType',
  },
  {
    title: '证件编号',
    align: 'center',
    dataIndex: 'certificateNo',
  },
  {
    title: '证件有效期',
    align: 'center',
    dataIndex: 'certificateValidate',
    width: 200,
  },
  {
    title: '证件原件',
    align: 'center',
    dataIndex: 'certificatePath',
    slots: { customRender: 'certificateName' },
  },
  {
    title: '提醒设置',
    align: 'center',
    dataIndex: 'remindBefore',
    customRender: ({ record, text }) => {
      if (record.isRemind == '0') {
        return h('span', { style: 'color: #b0b0b0' }, '未设置');
      } else {
        return h('span', {}, `到期前${text}天`);
      }
    },
  },
  {
    title: '证件状态',
    align: 'center',
    dataIndex: 'certificateStatus_dictText',
  },
];
//查询数据
export const searchFormSchema: FormSchema[] = [
  {
    field: 'orgCode',
    label: '所属机构',
    component: 'ETreeSelectOrg',
    // componentProps: {
    //   key: 'orgCode',
    //   value: 'departName',
    //   options: orgOptions,
    //   showChooseOption: false,
    // },
    colProps: { span: 6 },
  },
  {
    field: 'certificateType',
    label: '证件类型',
    component: 'Input',
    colProps: { span: 6 },
  },
  {
    field: 'certificateNo',
    label: '证件编号',
    component: 'Input',
    colProps: { span: 6 },
  },
  {
    label: '证件有效期',
    field: 'certificateValid',
    component: 'RangePicker',
    componentProps: {
      valueFormat: 'YYYY-MM-DD',
    },
    colProps: { span: 6 },
  },
  {
    label: '证件状态',
    field: 'certificateStatus',
    component: 'JDictSelectTag',
    componentProps: {
      dictCode: 'certificate_status',
      placeholder: '请选择',
      stringToNumber: false,
      showChooseOption: false,
    },
    colProps: { span: 6 },
  },
];
