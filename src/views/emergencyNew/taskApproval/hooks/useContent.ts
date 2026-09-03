import { useDrawer } from '/@/components/Drawer';
import { FormSchema, useForm } from '/@/components/Form';
import { suppliesPageList } from '../../api';
import { getEduOrgList } from '/@/api/common/api';
import {ref} from "vue";
export const useContent = () => { 
  const [registerDrawer, { openDrawer }] = useDrawer();
  const [registerDetailDrawer, { openDrawer: openDetailDrawer }] = useDrawer();
  const orgTree = ref<any[]>([])
  const searchFormSchema: FormSchema[] = [
      {
        label: '演练内容', //显示label
        field: 'name', //查询字段
        component: 'Input', //渲染的组件
      },
      {
        label: '演练单位',
        field: 'orgCode',
        component: 'ApiTreeSelect',
        componentProps: {
          placeholder: '请选择',
          api: async () => {
            let res = await getEduOrgList({ level: 4, permission: 1 });
            function SelectItem(arr, title) {
              arr.forEach(item => {
                if(item.key.length < 9){
                  item.selectable = false;
                }
                if(item.key.length == 12){
                  item.title = title + '-' + item.title;
                }
                if(item.children) {
                  SelectItem(item.children, item.title)
                }
              })
            }
            SelectItem(res, res[0].title);
            setFieldsValue( {orgCode: res[0].key});
            orgTree.value = res;
            return res;
          },
          params: {
            level: 4
          },
          fieldNames: {
            label: 'title',
            value: 'key',
            children: 'children',
          },
        },
      },
      {
        label: '实施时间',
        field: 'yearDate',
        component: 'DatePicker',
        componentProps: {
          formatl: "YYYY",
          valueFormat: "YYYY",
          placeholder: '请选择状态',
          style: { width: '100%' },
        },
      },
      {
        label: '演练地点', //显示label
        field: 'name', //查询字段
        component: 'Input', //渲染的组件
      },
    ];


  const [registerForm, { resetFields, getFieldsValue, setFieldsValue }] = useForm({
    schemas: searchFormSchema,
    submitButtonOptions: { text: '查询' },
    resetButtonOptions: { text: '重置' },
    fieldMapToTime: [['start', ['startTime', 'endTime'], 'YYYY-MM-DD']],
    showAdvancedButton: true,
    // resetFunc: resetFunc,
    baseColProps: { span: 6 },
    // actionColOptions: { span: 6 },
    // //使用labelCol的样式参数来控制标题宽度
    labelCol: { style: { width: '120px' } },
    //字体对齐方式（left:左对齐，right：右对齐），默认右对齐
    labelAlign: 'right',
    submitOnReset: true,
  });
  // 列表页面公共参数、方法
  const getList = async (params) => {
    const res = await suppliesPageList(params);
    return res;
  };
  return {
    orgTree,
    getList,
    registerForm,
    setFieldsValue,
    resetFields,
    getFieldsValue,
    openDrawer,
    registerDrawer,
    openDetailDrawer,
    registerDetailDrawer,
  }
};
