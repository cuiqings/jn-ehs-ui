import {BasicColumn} from '/@/components/Table';
import {FormSchema} from '/@/components/Table';
import {rules} from '/@/utils/helper/validator';
import {render} from '/@/utils/common/renderUtils';
import {defHttp} from "/@/utils/http/axios";
//列表数据
export const columns: BasicColumn[] = [
  {
    title: '模块名称',
    align: "center",
    dataIndex: 'moduleName'
  },
  {
    title: '功能名称',
    align: "center",
    dataIndex: 'functionName'
  },
  {
    title: '部门名称',
    align: "center",
    dataIndex: 'depName'
  },
  {
    title: '操作员',
    align: "center",
    dataIndex: 'operName'
  },
  {
    title: '访问次数',
    align: "center",
    dataIndex: 'accCount'
  },
];

/**
 * 所属机构change事件
 */
import { ref } from 'vue';
import dayjs from "dayjs";
const orgOptions = ref<any>([]);
getOrgList();
async function getOrgList() {
  await defHttp.get({ url: '/jn/common/selectLine?orgCategories=1,2,4' }).then((res) => {
    res.map((item) => {
      orgOptions.value.push({
        label: item.departName,
        value: item.orgCode,
      });
    });
  });
}
// orgOptions.value.push({label: "一号线", value: "A04",})
//查询数据
export const searchFormSchema: FormSchema[] = [
  {
    field: 'moduleName',
    label: '模块名称',
    component: 'Input',
    colProps: { span: 6 },
  },
  {
    field: 'functionName',
    label: '功能名称',
    component: 'Input',
    colProps: { span: 6 },
  },
  {
    label: '时间范围',
    field: 'createTime1',
    component: 'RangePicker',
    componentProps: {
      valueFormat: 'YYYY-MM-DD',
    },
    defaultValue: [dayjs(),dayjs()],
    colProps: { span: 6 },
  },
  {
    field: 'depCode',
    label: '所属部门',
    component: 'Select',
    componentProps: {
      key: 'orgCode',
      value: 'departName',
      options: orgOptions.value,
      showChooseOption: false,
    },
    colProps: { span: 6 },
  },
];
//表单数据
export const formSchema: FormSchema[] = [
  {
    label: '模块标题',
    field: 'title',
    component: 'Input',
  },
  {
    label: '方法名称',
    field: 'method',
    component: 'Input',
  },
  {
    label: '请求方式',
    field: 'requestMethod',
    component: 'Input',
  },
  {
    label: '操作人员',
    field: 'operName',
    component: 'Input',
  },
  {
    label: '请求URL',
    field: 'operUrl',
    component: 'Input',
  },
  {
    label: '主机地址',
    field: 'operIp',
    component: 'Input',
  },
  {
    label: '请求参数',
    field: 'parameters',
    component: 'InputTextArea',
  },
  {
    label: '操作系统',
    field: 'os',
    component: 'Input',
  },
  {
    label: '浏览器',
    field: 'browser',
    component: 'Input',
  },
  {
    label: '部门编码',
    field: 'depCode',
    component: 'Input',
  },
  {
    label: '部门名称',
    field: 'depName',
    component: 'Input',
  },
  {
    label: '是否删除1是0否',
    field: 'isDel',
    component: 'InputNumber',
  },
  // TODO 主键隐藏字段，目前写死为ID
  {
    label: '',
    field: 'id',
    component: 'Input',
    show: false
  },
];


/**
 * 流程表单调用这个方法获取formSchema
 * @param param
 */
export function getBpmFormSchema(_formData): FormSchema[] {
  // 默认和原始表单保持一致 如果流程中配置了权限数据，这里需要单独处理formSchema
  return formSchema;
}
