import {getDepart3ListWithSecurity, selectDeptNew} from '/@/api/common/api';
import {ActionItem, BasicColumn, FormSchema} from '/@/components/Table';
import {useListPage} from '/@/hooks/system/useListPage';
import {unitBatchDel, unitDel, unitList, unitStatistics} from '../../api';
import {useModal} from '/@/components/Modal';
import {Modal} from 'ant-design-vue';
import {ref} from 'vue';

export const useContent = () => {
  // 定义表格列
  const columns: BasicColumn[] = [{
    title: '参保单位', dataIndex: 'insuredUnit', width: 130,
  }, {
    title: '单位', dataIndex: 'orgCodeName', width: 130,
  }, {
    title: '所属车间', dataIndex: 'workshopName', width: 140,
  }, {
    title: '姓名', dataIndex: 'name', width: 140,
  }, {
    title: '身份证号', dataIndex: 'idCard', width: 140,
  }, {
    title: '工号', dataIndex: 'workNo', width: 140,
  }, {
    title: '参保类型',
    dataIndex: 'insuranceType',
    width: 140,
    slots: {customRender: 'insuranceType'},
  }, {
    title: '变更', dataIndex: 'changeType', width: 140, slots: {customRender: 'changeType'},
  },];
  const orgList = ref<any[]>([]);
  //表单搜索字段
  const searchFormSchema: FormSchema[] = [{
    label: '单位', field: 'orgCode', component: 'ApiSelect', componentProps: {
      placeholder: '请选择计划单位', api: async () => {
        const res = await getDepart3ListWithSecurity();
        orgList.value = res;
        if (res.length == 1) {
          selectDeptNew({orgCode: res[0].key}).then((res) => {
            getForm().updateSchema({
              field: 'workshop', componentProps: {
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
      }, onChange: (e) => {
        selectDeptNew({orgCode: Array.isArray(e) ? e[0] : e}).then((res) => {
          console.log(res);
          getForm().updateSchema({
            field: 'workshop', componentProps: {
              options: res,
            },
          });
          getForm().setFieldsValue({
            workshop: undefined,
          });
        });
      }, params: {
        level: 4,
      }, fieldNames: {
        label: 'departName', value: 'orgCode',
      },
    },
  }, {
    label: '所属车间', field: 'workshop', component: 'Select', componentProps: {
      placeholder: '请选择', fieldNames: {
        label: 'departName', value: 'orgCode',
      },
    },
  }, {
    label: '姓名', field: 'name', component: 'Input',
  }, {
    label: '身份证号', field: 'idCard', component: 'Input',
  }, {
    label: '工号', field: 'workNo', component: 'Input',
  }, {
    label: '参保类型', field: 'insuranceType', component: 'Select', componentProps: {
      placeholder: '请选择状态', options: [{
        label: '正常参保', value: '1',
      }, {
        label: '灵活用工', value: '2',
      },],
    },
  }, {
    label: '变更类型', field: 'changeType', component: 'Select', componentProps: {
      placeholder: '请选择状态', options: [{
        label: '新增', value: '1',
      }, {
        label: '减员', value: '2',
      },],
    },
  },];

  const [registerModal, {openModal}] = useModal();

  // const departList = await getDepart3ListWithSecurity();
  const queryParams = ref({
    orgCode: undefined,
  });
  // 列表页面公共参数、方法
  const {tableContext} = useListPage({
    designScope: 'basic-table-demo-filter', tableProps: {
      api: unitList, immediate: false, columns: columns, formConfig: {
        schemas: searchFormSchema, resetFunc: resetFunc,
      }, beforeFetch: (params) => {
        queryParams.value = params;
        getStatistics(params.orgCode || '');
        return params;
      }, showIndexColumn: true, rowSelection: {type: 'checkbox'}, actionColumn: {
        width: 200,
        title: '操作',
        dataIndex: 'action',
        slots: {customRender: 'action'},
        fixed: 'right',
      },
    },
  });
  //BasicTable绑定注册
  const [registerTable, {getSelectRows, reload, getForm}, {
    rowSelection, selectedRowKeys
  }] = tableContext;

  async function init() {
    reload();
    getStatistics();
  }

  const statisticsList = ref<any>({})
  const getStatistics = async (code = null) => {
    statisticsList.value = await unitStatistics({orgCode: code});
  };

  /**
   * 操作栏
   */
  function getTableAction(record): ActionItem[] {
    return [{
      label: '查看',
      auth: 'insurance:departRecord:review',
      onClick: handleReview.bind(null, record),
    }, {
      label: '编辑',
      color: 'success',
      auth: 'insurance:departRecord:edit',
      onClick: handleEdit.bind(null, record),
    }, {
      label: '删除',
      color: 'error',
      auth: 'insurance:departRecord:del',
      onClick: handleDel.bind(null, record),
      ifShow: () => record.addFlag,
    },];
  }

  function handleReview(record) {
    openModal(true, {title: '查看人员详情', record});
  }

  function handleEdit(record) {
    openModal(true, {title: '编辑人员', record: JSON.parse(JSON.stringify(record))});
  }

  function handleDel(record) {
    Modal.confirm({
      title: '确定要删除吗?', onOk() {
        unitDel({id: record.id}).then(() => {
          reload();
        });
      }, onCancel() {
        console.log('Cancel');
      }, class: 'test',
    });
  }

  function handleBatchDel(data) {
    Modal.confirm({
      title: '确定要删除吗?', onOk() {
        unitBatchDel({ids: data.map((item) => item.id).join(',')}).then(() => {
          reload();
        });
      }, onCancel() {
        console.log('Cancel');
      }, class: 'test',
    });
  }

  const add = () => {
    openModal(true, {title: '新增人员', record: {addFlag: true}});
  };

  function resetFunc() {
    if (orgList.value.length == 1) {
      getForm().setFieldsValue({
        orgCode: orgList.value[0].orgCode,
      });
    }
  }

  return {
    add,
    init,
    getForm,
    selectedRowKeys,
    handleBatchDel,
    statisticsList,
    rowSelection,
    getSelectRows,
    registerTable,
    getTableAction,
    openModal,
    registerModal,
  };
};
