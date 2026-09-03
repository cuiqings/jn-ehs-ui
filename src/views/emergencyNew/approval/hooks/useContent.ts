import { useDrawer } from '/@/components/Drawer';
import { useForm } from '/@/components/Form';
import { FormSchema } from '/@/components/Form';
import { getEduOrgList } from '/@/api/common/api';
import { ref } from 'vue';
export const useContent = () => {
  const [registerDrawer, { openDrawer }] = useDrawer();
  const orgTree = ref<any[]>([]);
  const searchFormSchema: FormSchema[] = [
    {
      label: '演练计划名称', //显示label
      field: 'name', //查询字段
      component: 'Input', //渲染的组件
    },
    {
      label: '计划单位',
      field: 'orgCode',
      component: 'ApiTreeSelect',
      componentProps: {
        placeholder: '请选择计划单位',
        api: async () => {
          const res = await getEduOrgList({ level: 4, permission: 1 });
          function SelectItem(arr, title) {
            arr.forEach((item) => {
              if (item.key.length < 9) {
                item.selectable = false;
              }
              if (item.key.length == 12) {
                item.title = title + '-' + item.title;
              }
              if (item.children) {
                SelectItem(item.children, item.title);
              }
            });
          }
          setFieldsValue({
            orgCode: res[0].key,
          });
          SelectItem(res, res[0].title);
          orgTree.value = res;
          return res;
        },
        params: {
          level: 4,
        },
        fieldNames: {
          label: 'title',
          value: 'key',
          children: 'children',
        },
      },
    },
    {
      label: '计划年份',
      field: 'yearDate',
      component: 'DatePicker',
      componentProps: {
        formatl: 'YYYY',
        valueFormat: 'YYYY',
        placeholder: '请选择状态',
        picker: 'year',
      },
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

  return {
    orgTree,
    registerForm,
    setFieldsValue,
    resetFields,
    getFieldsValue,
    openDrawer,
    registerDrawer,
  };
};
