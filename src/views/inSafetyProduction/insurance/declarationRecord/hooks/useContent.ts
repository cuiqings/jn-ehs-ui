import { ActionItem, BasicColumn, FormSchema } from '/@/components/Table';
import { useModal } from '/@/components/Modal';
import { useListPage } from '/@/hooks/system/useListPage';
import { bmDel, bmList } from '../../api';
import { getDepart3ListWithSecurity, selectDeptNew } from '/@/api/common/api';
import dayjs, { Dayjs } from 'dayjs';
import { ref } from 'vue';
import { Modal } from 'ant-design-vue';
export const useContent = (cb) => {
  //定义表格列
  const columns: BasicColumn[] = [
    {
      title: '参保单位',
      dataIndex: 'insuredUnit',
      width: 130,
    },
    {
      title: '所属单位',
      dataIndex: 'orgCodeName',
      width: 170,
    },
    {
      title: '所属车间',
      dataIndex: 'workshopName',
      width: 170,
    },
    {
      title: '姓名',
      dataIndex: 'name',
      width: 130,
    },
    {
      title: '身份证号',
      dataIndex: 'idCard',
      width: 140,
    },
    {
      title: '工号',
      dataIndex: 'workNo',
      width: 140,
    },
    {
      title: '申报月份',
      dataIndex: 'reportMonth',
      width: 140,
    },
  ];
  const orgList = ref<any[]>([]);
  //表单搜索字段
  const searchFormSchema: FormSchema[] = [
    {
      label: '单位',
      field: 'orgCode',
      component: 'ApiSelect',
      componentProps: {
        placeholder: '请选择计划单位',
        api: async () => {
          const res = await getDepart3ListWithSecurity();
          orgList.value = res;
          if (res.length == 1) {
            selectDeptNew({ orgCode: res[0].key }).then((res) => {
              getForm().updateSchema({
                field: 'workshop',
                componentProps: {
                  options: res,
                },
              });
              getForm().setFieldsValue({
                workshop: undefined,
              });
            });
            getForm().setFieldsValue({
              orgCode: res[0].orgCode,
            });
            init();
          }
          return res;
        },
        onChange: (e) => {
          selectDeptNew({ orgCode: Array.isArray(e) ? e[0] : e }).then((res) => {
            console.log(res);
            getForm().updateSchema({
              field: 'workshop',
              componentProps: {
                options: res,
              },
            });
            getForm().setFieldsValue({
              workshop: undefined,
            });
          });
        },
        params: {
          level: 4,
        },
        fieldNames: {
          label: 'departName',
          value: 'orgCode',
        },
      },
    },
    {
      label: '所属车间',
      field: 'workshop',
      component: 'Select',
      componentProps: {
        placeholder: '请选择',
        fieldNames: {
          label: 'departName',
          value: 'orgCode',
        },
      },
    },

    {
      label: '姓名',
      field: 'name',
      component: 'Input',
    },
    {
      label: '身份证号',
      field: 'idCard',
      component: 'Input',
    },
    {
      label: '申报月份',
      field: 'month',
      component: 'Input',
      show: false,
    },
  ];

  const curM = ref<string>();
  const departName = ref<string>('敬业钢铁有限公司');
  curM.value = dayjs(new Date()).format('YYYY-MM');
  async function init() {
    reload();
  }
  const [registerModal, { openModal }] = useModal();
  // 列表页面公共参数、方法
  const { tableContext, onImportXls } = useListPage({
    designScope: 'basic-table-demo-filter',
    tableProps: {
      api: bmList,
      columns: columns,
      formConfig: {
        showAdvancedButton: false,
        schemas: searchFormSchema,
      },
      showIndexColumn: true,
      beforeFetch: (params) => {
        params.month = curM.value;
        params.insuredUnit = departName.value;
        return params;
      },
      actionColumn: {
        width: 120,
        title: '操作',
        dataIndex: 'action',
        slots: { customRender: 'action' },
        fixed: 'right',
      },
    },
    importConfig: {
      url: '/businessAdmin/import',
      success: () => {
        reload();
        cb(curM.value);
      },
    },
  });

  //BasicTable绑定注册
  const [registerTable, { reload, getForm }] = tableContext;

  /**
   * 操作栏
   */
  function getTableAction(record): ActionItem[] {
    return [
      {
        label: '编辑',
        auth: 'occupationalHealth:checkup:edit',
        onClick: handleEdit.bind(null, record),
      },
      {
        label: '删除',
        color: 'error',
        auth: 'occupationalHealth:checkup:del',
        onClick: handleDel.bind(null, record),
      },
    ];
  }

  function handleEdit(record) {
    openModal(true, { title: '编辑', record: JSON.parse(JSON.stringify(record)) });
  }
  function handleDel(record) {
    console.log(record);

    Modal.confirm({
      title: '确定要删除吗?',
      onOk() {
        bmDel(record.id).then((res) => {
          console.log(res);
          reload();
        });
      },
      onCancel() {
        console.log('Cancel');
      },
      class: 'test',
    });
  }

  const disabledDate = (current: Dayjs) => {
    // Can not select days before today and today
    return current && current > dayjs().endOf('day');
  };
  return {
    curM,
    departName,
    reload,
    getForm,
    disabledDate,
    onImportXls,
    registerTable,
    registerModal,
    getTableAction,
  };
};
