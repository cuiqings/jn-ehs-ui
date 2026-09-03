import { ActionItem, BasicColumn, FormSchema } from '/@/components/Table';
import { useListPage } from '/@/hooks/system/useListPage';
import { getEduOrgList } from '/@/api/common/api';
import { useDrawer } from '/@/components/Drawer';
import { planPageList, planDelete } from '../../api'
import { defHttp } from '/@/utils/http/axios';
import { Modal } from 'ant-design-vue';
import { ref } from 'vue';
export const useContent = () => {
  //定义表格列
  const columns: BasicColumn[] = [
    {
      title: '演练计划名称',
      dataIndex: 'name',
      width: 170,
    },
    {
      title: '计划年份',
      dataIndex: 'yearDate',
      width: 130,
    },
    {
      title: '计划单位',
      dataIndex: 'orgCode',
      width: 140,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 140,
    },
  ];
  const orgTree = ref<any[]>([])
  //表单搜索字段
  const searchFormSchema: FormSchema[] = [
    {
      label: '演练计划名称', //显示label
      field: 'name', //查询字段
      component: 'Input', //渲染的组件
    },
    {
      label: '计划年份',
      field: 'yearDate',
      component: 'DatePicker',
      componentProps: {
        placeholder: '请选择状态',
        formatl: "YYYY",
        valueFormat: "YYYY",
        picker: "year",
        style: { width: '100%' },
      },
    },
    {
      label: '计划单位',
      field: 'orgCode',
      component: 'ApiTreeSelect',
      componentProps: {
        placeholder: '请选择计划单位',
        api: async () => {
          let res = await getEduOrgList({ level: 4, permission: 1 });
          function SelectItem(arr, title) {
            arr.forEach(item => {
              if (item.key.length < 9) {
                item.selectable = false;
              }
              if (item.key.length == 12) {
                item.title = title + '-' + item.title;
              }
              if (item.children) {
                SelectItem(item.children, item.title)
              }
            })
          }
          SelectItem(res, res[0].title);
          await getForm().setFieldsValue({ orgCode: res[0].key })
          reload()
          orgTree.value = res
          return res
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
      label: '状态',
      field: 'status',
      component: 'Select',
      componentProps: {
        placeholder: '请选择状态',
        options: [
          {
            label: '待提交',
            value: '0',
          },
          {
            label: '审批中',
            value: '2',
          },
          {
            label: '审批退回',
            value: '3',
          },
          {
            label: '审批通过',
            value: '1',
          },
        ],
      },
    },
  ];

  const [registerDrawer, { openDrawer }] = useDrawer();
  // 列表页面公共参数、方法
  const { tableContext } = useListPage({
    designScope: 'basic-table-demo-filter',
    tableProps: {
      api: planPageList,
      columns: columns,
      formConfig: {
        schemas: searchFormSchema,
      },
      immediate: false,
      showIndexColumn: true,
      beforeFetch: (params) => {
        if(!params.orgCode) {
          getForm().setFieldsValue({orgCode: orgTree.value[0].key,})
          params.orgCode = orgTree.value[0].key
        }
        return params;
      },
    },
  });
  const [registerDrawerDetail, { openDrawer: openDrawerDetail }] = useDrawer();
  //BasicTable绑定注册
  const [registerTable, { reload, getForm }] = tableContext;
  /**
   * 操作栏
   */
  function getTableAction(record): ActionItem[] {
    return [
      {
        label: '查看',
        onClick: handleReview.bind(null, record),
      },
      {
        label: '编辑',
        onClick: handleEdit.bind(null, record),
        ifShow: () => ['待提交', '审批退回'].includes(record.status)
      },
      {
        label: '导出',
        onClick: handleExport.bind(null, record),
        ifShow: () => ['审批通过'].includes(record.status)
      },
      {
        label: '删除',
        onClick: handleDel.bind(null, record),
      },
    ];
  }

  function handleReview(record) {
    openDrawerDetail(true, { title: '详情', ...record });
  }
  function handleEdit(record) {
    openDrawer(true, { title: '编辑', record: JSON.parse(JSON.stringify(record)) });
  }
  async function handleExport(record) {
    const data = await defHttp.get({ url: '/rehearsalPlan/export/'+record.id, params: {}, responseType: 'blob' }, { isTransformResponse: false });
    let blobOptions = { type: 'application/vnd.docx' };
    let fileSuffix = '.docx';
     let url = window.URL.createObjectURL(new Blob([data], blobOptions));
    let link = document.createElement('a');
    link.style.display = 'none';
    link.href = url;
    link.setAttribute('download', record.name + fileSuffix);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
  function handleDel(record) {
    Modal.confirm({
      title: '确定要删除吗?',
      onOk() {
        planDelete({ id: record.id }).then(() => {
          reload();
        })
      },
      onCancel() {
        console.log('Cancel');
      },
      class: 'test',
    });
  }
  const add = () => {
    openDrawer(true, { title: '演练计划申请' });
  }

  return {
    add,
    reload,
    registerTable,
    getTableAction,
    registerDrawer,
    registerDrawerDetail,
    openDrawer
  }
};
