import { BasicColumn } from '/@/components/Table';
import { FormSchema } from '/@/components/Table';
export const columns: BasicColumn[] = [
  {
    title: '上级部门',
    dataIndex: 'superiorDepart',
    width: 130,
    resizable: true,
  },
  {
    title: '部门名称',
    dataIndex: 'departName',
    width: 130,
    resizable: true,
  },
  {
    title: '人员',
    dataIndex: 'realname',
    width: 100,
    resizable: true,
  },
  {
    title: '安全管理岗',
    dataIndex: 'safetyManagementPost_dictText',
    width: 120,
    resizable: true,
  },
  {
    title: '联系方式',
    dataIndex: 'contactInformation',
    width: 120,
    resizable: true,
  },
  {
    title: '安全生产职责',
    dataIndex: 'safetyProductionZz',
    width: 300,
    resizable: true,
    // customRender: ({ record }) => {
    //   let arr:Array<any> = []
    //   if(record.list){
    //     record.list.forEach((e,i) => {
    //       arr.push(`${i+1}、${e.safetyProductionZz}\n`)
    //     });
    //   }
    //   return arr.join('')
    // },
    slots: { customRender: 'safe' },
  },
];

export const searchFormSchema: FormSchema[] = [
  {
    field: 'name',
    label: '姓名',
    component: 'Input',
    colProps: { span: 8 },
  },
  {
    field: 'birthday',
    label: '生日',
    component: 'RangePicker',
    componentProps: {
      valueType: 'Date',
    },
    colProps: { span: 8 },
  },
  {
    field: 'age',
    label: '年龄',
    component: 'Input',
    slot: 'age',
    colProps: { span: 8 },
  },
  {
    field: 'sex',
    label: '性别',
    colProps: { span: 8 },
    component: 'JDictSelectTag',
    componentProps: {
      dictCode: 'sex',
      placeholder: '请选择性别',
    },
  },
];
export const formSchema: FormSchema[] = [
  {
    label: '上级部门',
    field: 'superiorDepartCode',
    component: 'JTreeSelect1',
    required: true,
    ifShow: ({ values }) => values.parentId != '0',
  },
  {
    label: '上级部门',
    field: 'superiorDepart',
    component: 'Input',
    show: false,
  },
  {
    // 去掉了 - 新增的时候去掉
    label: '上级部门ID',
    field: 'parentId',
    component: 'Input',
    show: false,
  },
  {
    label: '部门名称',
    field: 'departName',
    component: 'Input',
    ifShow: ({ values }) => values.parentId == '0',
    required: true,
    componentProps: {
      disabled: false,
    },
  },
  {
    label: '部门名称',
    field: 'departNameCode',
    component: 'Select',
    required: true,
    ifShow: ({ values }) => values.parentId != '0',
  },
  {
    label: '人员',
    field: 'userName',
    component: 'Select',
    slot: 'PeopleSlot',
    defaultValue: [],
  },
  {
    label: '安全管理岗',
    field: 'safetyManagementPost',
    component: 'JDictSelectTag',
    componentProps: {
      dictCode: 'safety_management_post',
      type: 'select',
      placeholder: '请选择',
    },
  },
  {
    label: '联系方式',
    field: 'contactInformation',
    component: 'Input',
    componentProps: {
      placeholder: '请输入联系方式',
    },
    rules: [{ pattern: /^[0-9()（）-]{1,20}$/, message: '请输入正确的联系方式' }],
  },
  {
    label: '安全生产职责',
    field: 'list',
    component: 'Input',
    slot: 'SafeSlot',
    defaultValue: [''],
  },
];
