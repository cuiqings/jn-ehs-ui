import { getDepart3ListWithSecurity, selectDeptNew } from '/@/api/common/api';
import { ActionItem, BasicColumn, FormSchema } from '/@/components/Table';
import { useListPage } from '/@/hooks/system/useListPage';
import { remindPageList, remindDel } from '../../api';
import { useUserStore } from '/@/store/modules/user';
import { useModal } from '/@/components/Modal';
import { Modal } from 'ant-design-vue';
import dayjs from 'dayjs';
import { ref } from 'vue';
export const useContent = () => {
  const userStore: any = useUserStore();
  // 定义表格列
  const columns: BasicColumn[] = [
    {
      title: '所属单位',
      dataIndex: 'orgCodeName',
      width: 130,
      resizable: true,
    },
    {
      title: '疾病或指标',
      dataIndex: 'diseaseName',
      width: 100,
      resizable: true,
    },
    {
      title: '提醒规则',
      dataIndex: 'frequency',
      width: 100,
      resizable: true,
      slots: { customRender: 'frequency' },
    },
    {
      title: '提醒升级（通知班组长）',
      dataIndex: 'upgrade',
      width: 100,
      resizable: true,
      slots: { customRender: 'upgrade' },
    }
  ];
  const orgOptions = ref<any[]>([]);
  //表单搜索字段
  const searchFormSchema: FormSchema[] = [
    {
      label: '单位',
      field: 'orgCode',
      component: 'ApiSelect',
      componentProps: {
        placeholder: '请选择',
        allowClear: true,
        api: async () => {
          const res = await getDepart3ListWithSecurity();
          orgOptions.value = res;
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
          getForm().updateSchema([
            {
              field: 'disease',
              componentProps: {
                options: userStore.getAllDictItems.diseases_types,
                fieldNames: {
                  label: 'label',
                  value: 'value',
                },
              },
            },
          ]);
          return res;
        },
        fieldNames: {
          label: 'departName',
          value: 'orgCode',
        }
      },
    },
    {
      label: '疾病或指标',
      field: 'disease',
      component: 'Select',
      componentProps: {
        placeholder: '请选择',
        allowClear: true
      },
    },
  ];
  const [registerCheckModal, { openModal }] = useModal();

  const queryParams = ref({
    orgCode: undefined,
  });
  const orgcode = ref('');
  // 列表页面公共参数、方法
  const { tableContext, onExportXls, onImportXls } = useListPage({
    designScope: 'occupationalHealth-files-table',
    tableProps: {
      api: remindPageList,
      immediate: true,
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
        width: 80,
        title: '操作',
        dataIndex: 'action',
        slots: { customRender: 'action' },
      },
    },
    exportConfig: {
      name: () => {
        let name = '';
        name = dayjs(new Date()).format('YYYYMMDD') + '职业健康监护档案';
        return name;
      },
      url: '/archives/export',
      suffix: 'xlsx',
    },
    importConfig: {
      url: '/archives/import',
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
        auth: 'highRiskLedger:remind:edit',
        onClick: handleEdit.bind(null, record),
      },
      {
        label: '删除',
        color: 'error',
        auth: 'highRiskLedger:remind:del',
        onClick: handleDel.bind(null, record),
      }
    ];
  }
  function handleEdit(record) {
    openModal(true, { title: '编辑', record: JSON.parse(JSON.stringify(record)) });
  }
 
  function handleDel(record) {
    Modal.confirm({
      title: '确定要删除吗?',
      onOk() {
        remindDel(record.id).then(() => {
          reload();
        });
      },
      onCancel() {
        console.log('Cancel');
      },
      class: 'test',
    });
  }
  const add = () => {
    openModal(true, { title: '新增配置' });
  };
  const updateCode = (code) => {
    orgcode.value = code;
    console.log(orgcode.value);
  };
  function resetFunc() {
    if(orgOptions.value.length == 1) {
      getForm().setFieldsValue({
        orgCode: orgOptions.value[0].orgCode,
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
    getSelectRows,
    registerTable,
    getTableAction,
    openModal,
    selectedRowKeys,
    registerCheckModal
  };
};
