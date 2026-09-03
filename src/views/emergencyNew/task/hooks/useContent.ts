import { useDrawer } from '/@/components/Drawer';
import { FormSchema, useForm } from '/@/components/Form';
import { ref } from 'vue';
export const useContent = () => {
  const [registerDrawer, { openDrawer }] = useDrawer();
  const [registerDetailDrawer, { openDrawer: openDetailDrawer }] = useDrawer();
  const departList = ref([]);
  const searchFormSchema: FormSchema[] = [
    {
      label: '演练内容', //显示label
      field: 'drillContent', //查询字段
      component: 'Input', //渲染的组件
    },
    {
      label: '演练单位',
      field: 'orgCode',
      component: 'TreeSelect',
      slot: 'orgCode',
    },
    {
      label: '实施时间',
      field: 'enforceDate',
      component: 'DatePicker',
      componentProps: {
        formatl: 'YYYY-MM',
        valueFormat: 'YYYY-MM',
        picker: 'month',
        placeholder: '请选择状态',
        style: { width: '100%' },
      },
    },
    {
      label: '演练地点', //显示label
      field: 'drillLocation', //查询字段
      component: 'Input', //渲染的组件
    },
  ];

  const [registerForm, { resetFields, getFieldsValue, setFieldsValue }] = useForm({
    schemas: searchFormSchema,
    submitButtonOptions: { text: '查询' },
    resetButtonOptions: { text: '重置' },
    fieldMapToTime: [['start', ['startTime', 'endTime'], 'YYYY-MM-DD']],
    showAdvancedButton: true,
    baseColProps: { span: 6 },
    labelCol: { style: { width: '120px' } },
    labelAlign: 'right',
    submitOnReset: true,
  });
  return {
    departList,
    registerForm,
    resetFields,
    getFieldsValue,
    setFieldsValue,
    openDrawer,
    registerDrawer,
    openDetailDrawer,
    registerDetailDrawer,
  };
};
