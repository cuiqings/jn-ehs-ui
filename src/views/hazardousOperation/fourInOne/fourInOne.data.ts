import { BasicColumn, FormSchema } from '/@/components/Table';
import { getDepart3ListWithSecurity } from '/@/api/common/api';

/**
 * 表格列配置
 */
export const columns: BasicColumn[] = [
  {
    title: '设备编码',
    dataIndex: 'deviceCode',
    width: 150,
    align: 'center',
  },
  {
    title: '所属单位',
    dataIndex: 'orgName',
    width: 200,
    align: 'center',
  },
  {
    title: '设备名称',
    dataIndex: 'deviceName',
    width: 200,
    align: 'center',
  },
];

/**
 * 搜索表单配置
 */
export const searchFormSchema: FormSchema[] = [
  {
    field: 'orgName',
    label: '所属单位',
    component: 'Input',
    componentProps: {
      placeholder: '请输入所属单位',
    },
    colProps: { span: 6 },
  },
  {
    field: 'cleanTime',
    label: '清洗时间',
    component: 'Input',
    componentProps: {
      placeholder: '请输入清洗时间',
    },
    colProps: { span: 6 },
  },
  {
    field: 'deviceName',
    label: '设备名称',
    component: 'Input',
    componentProps: {
      placeholder: '请输入设备名称',
    },
    colProps: { span: 6 },
  },
];

/**
 * 表单配置
 */
export const formSchema: FormSchema[] = [
  {
    field: 'deviceCode',
    label: '设备编码',
    component: 'Input',
    componentProps: {
      disabled: true,
    },
  },
  {
    field: 'orgCode',
    label: '所属单位',
    component: 'ApiSelect',
    required: true,
    componentProps: {
      api: getDepart3ListWithSecurity,
      labelField: 'departName',
      valueField: 'orgCode',
      placeholder: '请选择所属单位',
    },
  },
  {
    field: 'deviceName',
    label: '设备名称',
    component: 'Input',
    required: true,
  },
];