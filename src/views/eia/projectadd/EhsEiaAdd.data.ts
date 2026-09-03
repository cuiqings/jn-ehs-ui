import {BasicColumn} from '/@/components/Table';
import {FormSchema} from '/@/components/Table';
import {rules} from '/@/utils/helper/validator';
import {render} from '/@/utils/common/renderUtils';
import {h} from "vue";

//列表数据
export const columns: BasicColumn[] = [
  {
    title: '项目名称',
    align: "center",
    dataIndex: 'eiaProjectName'
  },
  {
    title: '补充类型',
    align: "center",
    dataIndex: 'type',
    customRender: ({text}) => {
      return render.renderDict(text, 'eia_add_type');
    },
  },
  {
    title: '补充要求',
    align: "center",
    dataIndex: 'addRequest'
  },
  {
    title: '截止日期',
    align: "center",
    dataIndex: 'endDt',
    customRender: ({text}) => {
      return !text ? "" : (text.length > 10 ? text.substr(0, 10) : text)
    },
  },
  {
    title: '补充人',
    align: "center",
    dataIndex: 'addRealName',
  },
  {
    title: '补充时间',
    align: "center",
    dataIndex: 'addTime',
  },
  {
    title: '状态',
    align: "center",
    dataIndex: 'status',
    defaultFilteredValue: '待补充',
    customRender: ({text}) => {
      if(text == undefined) {
       return '待补充';
      } else {
        return text == '3' ?
          h('span', { style: 'color: red' }, render.renderDict(text, 'eia_add_status'))
          : render.renderDict(text, 'eia_add_status');
      }
    },
  },
];

export const aduitColumns: BasicColumn[] = [
  {
    title: '项目名称',
    align: "center",
    dataIndex: 'eiaProjectName'
  },
  {
    title: '项目申请单位',
    align: "center",
    dataIndex: 'infoOrgName',
  },
  {
    title: '补充类型',
    align: "center",
    dataIndex: 'type',
    customRender: ({text}) => {
      return render.renderDict(text, 'eia_add_type');
    },
  },
  {
    title: '补充要求',
    align: "center",
    dataIndex: 'addRequest'
  },
  {
    title: '补充资料',
    align: "left",
    dataIndex: 'attach',
    slots: { customRender: 'attachPath' },
  },
  {
    title: '审核人',
    align: "center",
    dataIndex: 'auditorName',
  },
];

//查询数据
export const searchFormSchema: FormSchema[] = [];
//表单数据
export const formSchema: FormSchema[] = [
  {
    label: '项目id',
    field: 'infoId',
    component: 'Input',
  },
  {
    label: '打包id',
    field: 'applyId',
    component: 'Input',
  },
  {
    label: '补充类型',
    field: 'type',
    component: 'Input',
  },
  {
    label: '补充要求',
    field: 'addRequest',
    component: 'Input',
  },
  {
    label: '截止日期',
    field: 'endDt',
    component: 'DatePicker',
  },
  {
    label: '补充材料',
    field: 'attach',
    component: 'Input',
  },
  {
    label: '补充人',
    field: 'addRealName',
    component: 'Input',
  },
  {
    label: '补充时间',
    field: 'addTime',
    component: 'DatePicker',
    componentProps: {
      showTime: true,
      valueFormat: 'YYYY-MM-DD HH:mm:ss'
    },
  },
  {
    label: '审核人ID',
    field: 'auditorId',
    component: 'Input',
  },
  {
    label: '审核人名称',
    field: 'auditorName',
    component: 'Input',
  },
  {
    label: '审核人单位编码',
    field: 'auditorOrgCode',
    component: 'Input',
  },
  {
    label: '审核说明',
    field: 'auditStatement',
    component: 'Input',
  },
  {
    label: '审核时间',
    field: 'auditorTime',
    component: 'Input',
  },
  {
    label: '状态',
    field: 'status',
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
