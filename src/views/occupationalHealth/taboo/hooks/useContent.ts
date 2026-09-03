import { getDepart3ListWithSecurity, selectDeptNew } from '/@/api/common/api';
import { ActionItem, BasicColumn, FormSchema } from '/@/components/Table';
import { useListPage } from '/@/hooks/system/useListPage';
import { tabooList, tabooDel } from '../../api';
import { useDrawer } from '/@/components/Drawer';
import { useModal } from '/@/components/Modal';
import { Modal } from 'ant-design-vue';
import dayjs from 'dayjs';
import { ref, nextTick } from 'vue';
export const useContent = () => {
  // 定义表格列
  const columns: BasicColumn[] = [
    {
      title: '所属单位',
      dataIndex: 'orgName',
      width: 130,
      resizable: true,
    },
    {
      title: '所属车间',
      dataIndex: 'workshopName',
      width: 140,
      resizable: true,
    },
    {
      title: '姓名',
      dataIndex: 'name',
      width: 140,
      resizable: true,
    },
    {
      title: '岗位',
      dataIndex: 'post',
      width: 140,
      resizable: true,
    },
    {
      title: '工号',
      dataIndex: 'workNo',
      width: 140,
      resizable: true,
    },
    {
      title: '身份证号',
      dataIndex: 'idCard',
      width: 140,
      resizable: true,
    },
    {
      title: '职业禁忌证',
      dataIndex: 'tabooProof',
      width: 140,
      resizable: true,
    },
    {
      title: '原车间',
      dataIndex: 'oldOrg',
      width: 180,
      resizable: true,
    },
    {
      title: '原岗位',
      dataIndex: 'oldPost',
      width: 180,
      resizable: true,
    },
    {
      title: '备注',
      dataIndex: 'remark',
      width: 140,
    },
  ];
  const orgList = ref<any[]>()
  //表单搜索字段
  const searchFormSchema: FormSchema[] = [
    {
      label: '所属单位',
      field: 'orgCode',
      component: 'ApiSelect',
      componentProps: {
        placeholder: '请选择',
        api: async () => {
          let res = await getDepart3ListWithSecurity();
          orgList.value = res;
          if (res.length == 1) {
            console.log(res[0].orgCode);
            getForm().setFieldsValue({
              orgCode: res[0].orgCode,
            });
            selectDeptNew({ orgCode: res[0].orgCode }).then((dres) => {
              getForm().updateSchema([
                {
                  field: 'workshop',
                  componentProps: {
                    options: dres,
                  },
                },
              ]);
            });
          }
          nextTick(() => {
            reload();
            console.log('reload', reload);
          })
          return res;
        },
        fieldNames: {
          label: 'departName',
          value: 'orgCode',
        },
        onChange: (value) => {
          if (Array.isArray(value)) return;
          selectDeptNew({ orgCode: value }).then((res) => {
            getForm().setFieldsValue({
              workshop: '',
            });
            getForm().updateSchema([
              {
                field: 'workshop',
                componentProps: {
                  options: res,
                },
              },
            ]);
          });
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
      label: '岗位', //显示label
      field: 'post', //查询字段
      component: 'Input', //渲染的组件
    },
    {
      label: '姓名', //显示label
      field: 'name', //查询字段
      component: 'Input', //渲染的组件
    },
    {
      label: '职业禁忌证', //显示label
      field: 'tabooProof', //查询字段
      component: 'Input', //渲染的组件
    },
    {
      label: '原车间', //显示label
      field: 'oldOrg', //查询字段
      component: 'Input', //渲染的组件
    },
    {
      label: '原岗位', //显示label
      field: 'oldPost', //查询字段
      component: 'Input', //渲染的组件
    },
  ];

  const [registerDrawer, { openDrawer }] = useDrawer();
  const [registerCheckIn, { openDrawer: checkInOpen }] = useDrawer();
  const [registerCheckModal, { openModal }] = useModal();

  // const departList = await getDepart3ListWithSecurity();
  const queryParams = ref({
    orgCode: undefined,
  });
  const orgcode = ref('');
  // 列表页面公共参数、方法
  const { tableContext, onExportXls, onImportXls } = useListPage({
    designScope: 'occupationalHealth-files-table',
    tableProps: {
      api: tabooList,
      immediate: false,
      columns: columns,
      formConfig: {
        schemas: searchFormSchema,
        resetFunc: resetFunc,
      },
      beforeFetch: (params) => {
        queryParams.value = params;
        return params;
      },
      showIndexColumn: true,
      rowSelection: { type: 'checkbox' },
      actionColumn: {
        width: 260,
        title: '操作',
        dataIndex: 'action',
        slots: { customRender: 'action' },
        fixed: 'right',
      },
    },
    exportConfig: {
      name: () => {
        let name = '';
        name = dayjs(new Date()).format('YYYYMMDD') + '职业禁忌症';
        return name;
      },
      url: '/contraindications/export',
      suffix: 'xlsx',
    },
    importConfig: {
      url: '/contraindications/import',
      success: () => {
        reload();
      },
    },
  });
  //BasicTable绑定注册
  const [registerTable, { getSelectRows, reload, getForm }, { rowSelection, selectedRowKeys }] = tableContext;
  /**
   * 操作栏
   */
  function getTableAction(record): ActionItem[] {
    return [
      {
        label: '编辑',
        auth: 'occupationalHealth:taboo:edit',
        onClick: handleEdit.bind(null, record),
      },
      {
        label: '删除',
        color: 'error',
        auth: 'occupationalHealth:taboo:del',
        onClick: handleDel.bind(null, record),
      },
      {
        label: '查看',
        onClick: handleReview.bind(null, record),
      },
    ];
  }

  function handleReview(record) {
    openDrawer(true, { title: '详情', record: JSON.parse(JSON.stringify(record)) });
  }
  function handleEdit(record) {
    openDrawer(true, { title: '编辑', record: JSON.parse(JSON.stringify(record)) });
  }
  function handleDel(record) {
    Modal.confirm({
      title: '确定要删除吗?',
      onOk() {
        tabooDel({ids: [record.id]}).then(res => {
          reload();
        })
      },
      onCancel() {
        console.log('Cancel');
      },
      class: 'test',
    });
  }
  function batchDel() {
    Modal.confirm({
      title: '确定要删除吗?',
      onOk() {
        tabooDel({ids: selectedRowKeys.value}).then(res => {
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
    openDrawer(true, { title: '新增' });
  };
  const updateCode = (code) => {
    orgcode.value = code;
    console.log(orgcode.value);
  };
  function resetFunc() {
    if(orgList.value?.length == 1) {
      getForm().setFieldsValue({
        orgCode: orgList.value[0].orgCode
      });
    }
  }
  return {
    add,
    reload,
    getForm,
    updateCode,
    onExportXls,
    onImportXls,
    rowSelection,
    selectedRowKeys,
    batchDel,
    getSelectRows,
    registerTable,
    getTableAction,
    registerDrawer,
    openModal,
    registerCheckModal,
    registerCheckIn,
    checkInOpen,
  };
};
