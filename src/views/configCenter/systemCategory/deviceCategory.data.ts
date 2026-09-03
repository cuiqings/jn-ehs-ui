import { BasicColumn } from '/@/components/Table';
import { FormSchema } from '/@/components/Table';
import { duplicateCheck } from '/@/views/system/user/user.api';

export const columns: BasicColumn[] = [
  {
    title: '分类名称',
    dataIndex: 'name',
    width: 350,
    align: 'left',
  },
  {
    title: '编码',
    dataIndex: 'code',
    width: 150,
    align: 'left',
  },
  {
    title: '序号',
    dataIndex: 'sort',
  },
  {
    title: '描述',
    dataIndex: 'remarks',
    ellipsis: true,
  },
  {
    title: '时间',
    dataIndex: 'createTime',
  },
];

export const formSchema: FormSchema[] = [
  {
    label: '',
    field: 'id',
    component: 'Input',
    show: false,
  },
  {
    label: '父级节点',
    field: 'pid',
    component: 'TreeSelect',
    componentProps: {
      replaceFields: {
        value: 'key',
      },
      dropdownStyle: {
        maxHeight: '50vh',
      },
      getPopupContainer: () => document.body,
    },
    show: ({ values }) => {
      return values.pid != '0';
    },
    dynamicDisabled: ({ values }) => {
      return !!values.id;
    },
  },
  {
    label: '类别名称',
    field: 'name',
    required: true,
    component: 'Input',
    dynamicRules: ({ model }) => {
      console.log('model', model);
      return [
        { required: true, message: '类别名称不能为空！' },
        { min: 0, max: 100, message: '请输入100字内的名称！', trigger: 'blur' },
        {
          validator: (_, value) => {
            if (value) {
              value = value.trim();
            }
            return new Promise((resolve, reject) => {
              let params = {
                tableName: 'device_category',
                fieldName: 'name',
                fieldVal: value,
                dataId: model.id,
              };
              duplicateCheck(params)
                .then((res) => {
                  res.success ? resolve() : reject(res.message || '校验失败');
                })
                .catch((err) => {
                  reject(err.message || '验证失败');
                });
            });
          },
        },
      ];
    },
  },
  {
    label: '序号',
    field: 'sort',
    required: true,
    component: 'InputNumber',
    componentProps: {
      style: {
        width: '100%',
      },
    },
  },              
  {
    label: '描述',
    field: 'remarks',
    component: 'InputTextArea',
    componentProps: {
      autoSize: true,
      maxlength: 300,
    },
  },
];
