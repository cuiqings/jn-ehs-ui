import { ActionItem, BasicColumn, FormSchema } from '/@/components/Table';
import { useDrawer } from '/@/components/Drawer';
import { useListPage } from '/@/hooks/system/useListPage';
import { pageListLedger, deleteLedger } from '../../api';
import { getEduOrgList } from '/@/api/common/api';
import { Modal } from 'ant-design-vue';
import {ref} from "vue";
export const useContent = () => {
  //定义表格列
  const columns: BasicColumn[] = [
    {
      title: '演练内容',
      dataIndex: 'rehearsalContent',
      width: 170,
    },
    {
      title: '演练单位',
      dataIndex: 'orgCode',
      width: 130,
    },
    {
      title: '演练地点',
      dataIndex: 'rehearsalLocation',
      width: 140,
    },
    {
      title: '演练方式',
      dataIndex: 'rehearsalType',
      width: 140,
    },
    {
      title: '计划实施时间',
      dataIndex: 'enforceDate',
      width: 140,
    },
    {
      title: '演练时间',
      dataIndex: 'drillDate',
      width: 140,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 140,
    },
  ];
  const orgTree = ref<any[]>([]);
  //表单搜索字段
  const searchFormSchema: FormSchema[] = [
    {
      label: '演练内容', //显示label
      field: 'drillContent', //查询字段
      component: 'Input', //渲染的组件
    },
    {
      label: '演练单位',
      field: 'orgCode',
      component: 'ApiTreeSelect',
      allowClear: true,
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
          SelectItem(res, res[0].title);
          orgTree.value = res;
          await getForm().setFieldsValue({ orgCode: res[0].key });
          reload();
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
      label: '演练地点', //显示label
      field: 'drillLocation', //查询字段
      component: 'Input', //渲染的组件
    },
    {
      label: '计划实施时间',
      field: 'enforceDate',
      component: 'DatePicker',
      componentProps: {
        picker: 'month',
        formatl: 'YYYY-MM',
        valueFormat: 'YYYY-MM',
        placeholder: '请选择',
        style: { width: '100%' },
      },
    },
    {
      label: '状态',
      field: 'status',
      component: 'Select',
      componentProps: {
        placeholder: '请选择状态',
        options: [
          {
            label: '进行中（正常）',
            value: '1',
          },
          {
            label: '已结束（正常）',
            value: '2',
          },
          {
            label: '进行中（超期）',
            value: '3',
          },
          {
            label: '已结束（超期）',
            value: '4',
          },
        ],
      },
    },
    {
      label: '演练时间',
      field: 'time',
      component: 'RangePicker',
      componentProps: {
        formatl: 'YYYY-MM-DD',
        valueFormat: 'YYYY-MM-DD',
        style: { width: '100%' },
      },
    },
  ];

  const [registerDetailDrawer, { openDrawer }] = useDrawer();
  // 列表页面公共参数、方法
  const { tableContext } = useListPage({
    designScope: 'basic-table-demo-filter',
    tableProps: {
      api: pageListLedger,
      columns: columns,
      immediate: false,
      formConfig: {
        schemas: searchFormSchema,
      },
      beforeFetch: (params) => {
        if (params.time) {
          const time = params.time.split(',');
          params['startDrillTime'] = time[0];
          params['endDrillTime'] = time[1];
        }
        if(!params.orgCode) {
          params.orgCode = orgTree.value[0].key;
          getForm().setFieldsValue({ orgCode: orgTree.value[0].key });
        }
        return params;
      },
      showIndexColumn: true,
    },
  });
  //BasicTable绑定注册
  const [registerTable, { getForm, reload }] = tableContext;
  /**
   * 操作栏
   */
  function getTableAction(record): ActionItem[] {
    return [
      {
        label: '查看',
        onClick: handleView.bind(null, record),
      },
      {
        label: '编辑',
        auth: 'emergencyNew:taskLedger:edit',
        onClick: handleEdit.bind(null, record),
      },
      {
        label: '删除',
        color: 'error',
        onClick: handleDel.bind(null, record),
      },
    ];
  }

  function handleDel(record) {
    Modal.confirm({
      title: '确定要删除吗?',
      onOk() {
        deleteLedger(record.id).then((res) => {
          reload();
        });
      },
      onCancel() {
        console.log('Cancel');
      },
      class: 'test',
    });
  }
  function handleView(record) {
    openDrawer(true, { ...record, title: '详情' });
  }

  function handleEdit(record) {
    openDrawer(true, { ...record, title: '编辑' });
  }

  return {
    reload,
    registerTable,
    getTableAction,
    registerDetailDrawer,
  };
};
