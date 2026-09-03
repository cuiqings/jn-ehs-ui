import { ActionItem, BasicColumn, FormSchema } from '/@/components/Table';
import { useModal } from '/@/components/Modal';
import { useListPage } from '/@/hooks/system/useListPage';
import { ledgerPageList, ledgerDel } from '../../api';
import { getEduOrgList } from '/@/api/common/api';
import { Modal } from 'ant-design-vue';
import { ref } from 'vue';
import dayjs from 'dayjs';
export const useContent = () => {
  //定义表格列
  const columns: BasicColumn[] = [
    {
      title: '预案年份',
      dataIndex: 'year',
      width: 170,
    },
    {
      title: '所属单位',
      dataIndex: 'orgCodeName',
      width: 170,
    },
    {
      title: '应急预案分类',
      dataIndex: 'categoryName',
      width: 130,
    },
    {
      title: '应急预案名称',
      dataIndex: 'name',
      width: 140,
    },
    {
      title: '应急预案',
      dataIndex: 'annex',
      width: 140,
      slots: { customRender: 'annex' },
    },
  ];
  const orgList = ref<any[]>([]);
  //表单搜索字段
  const searchFormSchema: FormSchema[] = [
    {
      label: '预案年份',
      field: 'year',
      component: 'DatePicker',
      defaultValue: dayjs().format('YYYY'),
      componentProps: {
        format: 'YYYY',
        valueFormat: 'YYYY',
        placeholder: '请选择',
        picker: 'year',
        style: { width: '100%' },
      }
    },
    {
      label: '所属单位',
      field: 'orgCode',
      component: 'ApiTreeSelect',
      componentProps: {
        placeholder: '请选择计划单位',
        api: async () => {
          let res = await getEduOrgList({ level: 4, permission: 1 });
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
          getForm().setFieldsValue({ orgCode: res[0].key });
          reload();
          orgList.value = res;
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
      label: '应急预案分类：',
      field: 'category',
      component: 'Select',
      componentProps: {
        placeholder: '请选择状态',
        options: [
          {
            label: '综合应急预案',
            value: '1',
          },
          {
            label: '专项应急预案',
            value: '2',
          },
          {
            label: '现场处置方案',
            value: '3',
          },
          // {
          //   label: '专项应急预案',
          //   value: '4',
          // },
        ],
      },
    },
    {
      label: '应急预案名称', //显示label
      field: 'name', //查询字段
      component: 'Input', //渲染的组件
    },
  ];

  const [registerModal, { openModal }] = useModal();
  // 列表页面公共参数、方法
  const { tableContext } = useListPage({
    designScope: 'basic-table-demo-filter',
    tableProps: {
      api: ledgerPageList,
      columns: columns,
      immediate: false,
      formConfig: {
        schemas: searchFormSchema,
      },
      showIndexColumn: true,
      beforeFetch: (params) => { 
        if(!params.orgCode) {
          params.orgCode = orgList.value[0].key;
          getForm().setFieldsValue({
            orgCode: orgList.value[0].key,
          });
        }
      },
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
        onClick: handleEdit.bind(null, record),
      },
      {
        label: '删除',
        onClick: handleDel.bind(null, record),
      },
    ];
  }

  function handleEdit(record) {
    openModal(true, { title: '编辑', record });
  }
  function handleDel(record) {
    Modal.confirm({
      title: '确定要删除吗?',
      onOk() {
        ledgerDel({ id: record.id }).then((res) => {
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
    openModal(true, { title: '详情', record });
  }

  const add = () => {
    openModal(true, { title: '新增' });
  };
  return {
    add,
    reload,
    registerTable,
    getTableAction,
    registerModal,
  };
};
