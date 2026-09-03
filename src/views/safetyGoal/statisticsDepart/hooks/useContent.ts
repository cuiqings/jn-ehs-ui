import { getDepart3ListWithSecurity, selectDeptNew } from '/@/api/common/api';
import { ActionItem, BasicColumn, FormSchema } from '/@/components/Table';
import { useListPage } from '/@/hooks/system/useListPage';
import { unitStatistics, unitTargetStatistics } from '../../api';
import type { FormInstance } from 'ant-design-vue';
import { useDrawer } from '/@/components/Drawer';
import { useModal } from '/@/components/Modal';
import dayjs from 'dayjs';
import { ref } from 'vue';
export const useContent = () => {
  const tabActive = ref('1');
  // 定义表格列
  const columns: BasicColumn[] = [
    {
      title: '单位名称',
      dataIndex: 'orgCodeName',
      width: 130,
    },
    {
      title: '目标内容',
      dataIndex: 'content',
      width: 230,
    },
    {
      title: '指标类型',
      dataIndex: 'indicatorType',
      width: 100,
    },
    {
      title: '目标值',
      dataIndex: 'value',
      width: 100,
    },
    {
      title: '实际完成值',
      dataIndex: 'completionValue',
      width: 100,
    },
     {
      title: '达标状态',
      dataIndex: 'status',
      width: 90,
      slots: { customRender: 'status' },
    }
  ];
  const orgList = ref<any[]>([]);
  //表单搜索字段
  const searchFormSchema: FormSchema[] = [
    {
      label: '年份',
      field: 'year',
      component: 'DatePicker',
      componentProps: {
        placeholder: '请选择',
        picker: 'year',
        fieldNames: {
          label: 'departName',
          value: 'orgCode',
        },
        format: 'YYYY',
        valueFormat: 'YYYY',
        style: { width: '100%' },
      },
    },
    {
      label: '单位名称',
      field: 'orgCode',
      component: 'Select',
      componentProps: {
        placeholder: '请选择',
        fieldNames: {
          label: 'departName',
          value: 'orgCode',
        },
      },
    },
  ];

  const [registerDrawer, { openDrawer }] = useDrawer();

  // const departList = await getDepart3ListWithSecurity();
  const queryParams = ref({
    orgCode: undefined,
  });
  const orgOptions = ref<any[]>([]);
  const orgcode = ref('');
  // 列表页面公共参数、方法
  const { tableContext, onExportXls, onImportXls } = useListPage({
    designScope: 'occupationalHealth-files-table',
    tableProps: {
      api: unitStatistics,
      immediate: false,
      columns: columns,
      formConfig: {
        schemas: searchFormSchema,
        resetFunc: resetFunc,
      },
      beforeFetch: (params) => {
        if (orgOptions.value && orgOptions.value.length == 1 && !params.orgCode) {
          getForm().setFieldsValue({
            orgCode: orgOptions.value[0].orgCode,
          });
          params.orgCode = orgOptions.value[0].orgCode;
        }
        queryParams.value = params;
        queryParams.value.dataType = tabActive.value;
        getFileStatistics(params);
        return params;
      },
      showIndexColumn: true,
      actionColumn: {
        width: 200,
        title: '操作',
        dataIndex: 'action',
        slots: { customRender: 'action' },
      },
    },
    exportConfig: {
      name: () => {
        let name = '';
        name = dayjs(new Date()).format('YYYYMMDD') + '安全生产目标统计';
        return name;
      },
      url: '/physicalExamination/export',
      suffix: 'xlsx',
    },
  });
  //BasicTable绑定注册
  const [registerTable, { getSelectRows, reload, getForm }, { rowSelection, selectedRowKeys }] = tableContext;
  pageInit();
  async function pageInit() {
    const res = await getDepart3ListWithSecurity();
    orgOptions.value = res;
    getForm().updateSchema([
      {
        field: 'orgCode',
        componentProps: {
          options: res,
          onChange: (value) => {
            if (Array.isArray(value)) return;
            selectDeptNew({ orgCode: value }).then((res) => {
              getForm().setFieldsValue({
                workshop: undefined
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
    ]);
    if (res.length == 1) {
      getForm().setFieldsValue({
        orgCode: res[0].orgCode,
      });
      selectDeptNew({ orgCode: res[0].orgCode }).then((res) => {
        getForm().updateSchema([
          {
            field: 'workshop',
            componentProps: {
              options: res,
            },
          },
        ]);
      });
    }
    reload();
  }
  const statisticsData = ref({
    total: 0,
    waitDetection: 0,
    already: 0,
    ratio: '',
    wait: 0,
  });
  function getFileStatistics(params) {
    unitTargetStatistics(params).then((res) => {
      statisticsData.value = res;
    });
  }
  /**
   * 操作栏
   */
  function getTableAction(record): ActionItem[] {
    return [
      {
        label: '录入指标',
        auth: 'statisticsDept:input',
        onClick: handleInput.bind(null, record),
        ifShow: !record.status,
      },
      {
        label: '修改录入',
        auth: 'statisticsDept:edit',
        onClick: handleEdit.bind(null, record),
        ifShow: !!record.status,
      },
      {
        label: '查看',
        onClick: handleReview.bind(null, record),
      },
    ];
  }

  function handleReview(record) {
    openDrawer(true, { title: '详情', record });
  }

  function handleInput(record) {
    openDrawer(true, { title: '录入指标', record: JSON.parse(JSON.stringify(record)) });
  }
  
  function handleEdit(record) {
    openDrawer(true, { title: '修改录入', record: JSON.parse(JSON.stringify(record)) });
  }
  
  function resetFunc() {
    if (orgList.value?.length == 1) {
      getForm().setFieldsValue({
        orgCode: orgList.value[0].orgCode,
      });
    }
  }
  const submitSuccess = () => {
    reload();
    selectedRowKeys.value = [];
  };

  return {
    getForm,
    onExportXls,
    registerTable,
    getTableAction,
    registerDrawer,
    submitSuccess,
    statisticsData,
  };
};
