import { getOrganizationNew, list, selectDeptNew } from '../url/index';
import { BasicColumn, FormSchema } from '/@/components/Table';
import { useListPage } from '/@/hooks/system/useListPage';
import { useDrawer } from '/@/components/Drawer';
import { getFileAccessHttpUrl } from '/@/utils/common/compUtils';
import { createImgPreview } from '/@/components/Preview/index';
import { render } from '/@/utils/common/renderUtils';
import { getLoginBackInfo } from '/@/utils/auth';
import { h, ref } from 'vue';
export const useContent = () => {
  const userInfo: any = getLoginBackInfo();
  //注册drawer
  const [registerDrawer, { openDrawer }] = useDrawer();
  const orgOptions: any = ref([]);
  const searchFormSchema = <FormSchema[]>[
    {
      label: '状态',
      field: 'status',
      component: 'JDictSelectTag',
      defaultValue: [],
      componentProps: {
        dictCode: 'problem_checklist_status',
        placeholder: '请选择',
        stringToNumber: false,
        showChooseOption: false,
      },
      colProps: { span: 6 },
    },
    {
      label: '来源',
      field: 'source',
      component: 'Select',
      componentProps: {
        placeholder: '请选择',
        options: [
          { label: '日常检查', value: '0' },
          { label: '上级发现', value: '1' },
        ],
      },
      colProps: { span: 6 },
    },
    {
      label: '检查日期',
      field: 'time',
      component: 'RangePicker',
      componentProps: {
        valueFormat: 'YYYY-MM-DD',
        style: {
          width: '100%',
        },
      },
      colProps: { span: 6 },
    },
    {
      label: '所属机构',
      field: 'subsidiaryCode',
      component: 'Select',
      componentProps: () => {
        return {
          options: [],
          getPopupContainer: () => document.body,
        };
      },
      colProps: { span: 6 },
    },
    {
      label: '问题描述',
      field: 'description',
      component: 'Input',
      colProps: { span: 6 },
    },
    {
      label: '责任部门',
      field: 'dutyDepartCode',
      component: 'ApiSelect',
      componentProps: {
        api: selectDeptNew,
        params: { orgCode: undefined },
        numberToString: true,
        labelField: 'departName',
        valueField: 'orgCode',
      },
      colProps: { span: 6 },
    },
    {
      label: '责任人',
      field: 'dutyPerson',
      component: 'Input',
      colProps: { span: 6 },
    },
    {
      label: '复查结果',
      field: 'result',
      component: 'Select',
      componentProps: {
        placeholder: '请选择',
        options: [
          { label: '通过', value: '0' },
          { label: '不通过', value: '1' },
        ],
      },
      colProps: { span: 6 },
    },
  ];
  const columns = <BasicColumn[]>[
    {
      title: '状态',
      dataIndex: 'status',
      customRender: ({ text }) => {
        return render.renderDict(text, 'problem_checklist_status');
      },
    },
    {
      title: '来源',
      dataIndex: 'source',
      customRender: ({ text }) => {
        return text === '0' ? h('span', {}, '日常检查') : h('span', {}, '上级发现');
      },
    },
    {
      title: '检查日期',
      dataIndex: 'checkTime',
      customRender: ({ text }) => {
        return h('span', {}, text.slice(0, 10));
      },
    },
    {
      title: '所属机构',
      dataIndex: 'subsidiaryName',
    },
    {
      title: '问题描述',
      dataIndex: 'description',
    },
    {
      title: '整改期限',
      dataIndex: 'reviseDate',
    },
    {
      title: '责任部门',
      dataIndex: 'dutyDepart',
    },
    {
      title: '责任人',
      dataIndex: 'dutyPerson',
    },
    {
      title: '问题照片',
      dataIndex: 'image',
      slots: { customRender: 'image' },
    },
    {
      title: '复查结果',
      dataIndex: 'result',
      customRender: ({ text }) => {
        if (text === '0') {
          return h('span', {}, '通过');
        } else if (text === '1') {
          return h('span', {}, '不通过');
        }
      },
    },
  ];
  const getActions = (record: any) => {
    return [
      {
        label: '查看',
        onClick: onView.bind(null, record),
      },
      {
        label: '确认',
        onClick: onConfirm.bind(null, record),
        auth: ['examineQuestion:confirm'],
        ifShow: record.status === '0',
      },
      {
        label: '整改',
        onClick: onRectify.bind(null, record),
        auth: ['examineQuestion:rectify'],
        ifShow: (record.status === '2' || record.status === '3') && record.dutyPersonId === userInfo.userInfo.id,
      },
      {
        label: '复查',
        onClick: onReview.bind(null, record),
        auth: ['examineQuestion:review'],
        ifShow: record.status === '4',
      },
    ];
  };
  // 列表页面公共参数、方法
  const { tableContext } = useListPage({
    designScope: 'incidentExpress-list',
    tableProps: {
      api: list,
      columns: columns,
      formConfig: {
        schemas: searchFormSchema,
      },
      immediate: false,
      handleSearchInfoFn: (params) => {
        if (orgOptions.value.length === 1) {
          params.subsidiaryCode = orgOptions.value[0].value;
          getForm().setFieldsValue({
            subsidiaryCode: orgOptions.value[0].value,
          });
        }
        return params;
      },
      defSort: {
        column: 'updateTime',
        order: 'desc',
      },
      showIndexColumn: true,
      beforeFetch: (params) => {
        if (params.time) {
          const time = params.time.split(',');
          params['startTime'] = time[0] + ' 00:00:00';
          params['endTime'] = time[1] + ' 23:59:59';
          delete params['time'];
        }
        return params;
      },
      actionColumn: {
        width: 150,
        title: '操作',
        dataIndex: 'action',
        slots: { customRender: 'action' },
        fixed: 'right',
      },
    },
  });
  const [registerTable, { reload, getForm }] = tableContext;
  const init = () => {
    getOrganizationNew().then((res) => {
      orgOptions.value = res.map((item) => {
        return {
          label: item.departName,
          value: item.orgCode,
        };
      });
      getForm().updateSchema({
        field: 'subsidiaryCode',
        componentProps: ({ formModel }) => {
          return {
            options: orgOptions.value,
            placeholder: '请选择',
            disabled: orgOptions.value.length === 1,
            onChange: (value) => {
              formModel.dutyDepartCode = undefined;
              getForm().updateSchema({
                field: 'dutyDepartCode',
                componentProps: {
                  params: { orgCode: value },
                },
              });
            },
            getPopupContainer: () => document.body,
          };
        },
      });
      if (orgOptions.value.length === 1) {
        getForm().setFieldsValue({
          subsidiaryCode: orgOptions.value[0]?.value,
        });
        getForm().updateSchema({
          field: 'dutyDepartCode',
          componentProps: {
            params: { orgCode: orgOptions.value[0]?.value },
          },
        });
      }
      reload();
    });
  };
  init();
  // 问题录入
  const onAdd = () => {
    openDrawer(true, {
      title: '问题录入',
      type: 'add',
      showOkBtn: true,
      showFooter: true,
    });
  };
  // 查看
  const onView = (data) => {
    openDrawer(true, {
      title: '查看',
      type: 'view',
      showOkBtn: false,
      showFooter: true,
      data,
    });
  };
  // 确认
  const onConfirm = (data) => {
    openDrawer(true, {
      title: '确认',
      type: 'confirm',
      showOkBtn: true,
      showFooter: true,
      data,
    });
  };
  // 整改
  const onRectify = (data) => {
    openDrawer(true, {
      title: '整改',
      type: 'rectify',
      showOkBtn: true,
      showFooter: true,
      data,
    });
  };
  // 复查
  const onReview = (data) => {
    openDrawer(true, {
      title: '复查',
      type: 'review',
      showOkBtn: true,
      showFooter: true,
      data,
    });
  };
  const fmtImg = (record: any) => {
    const firstImg = record.image.split(',')[0];
    return getFileAccessHttpUrl(firstImg);
  };
  const openImg = (record) => {
    const imageList = record.image.split(',').map((i) => getFileAccessHttpUrl(i));
    createImgPreview({
      imageList: imageList,
      defaultWidth: 600,
      rememberState: true,
      scaleStep: 10,
    });
  };
  const handleSuccess = () => {
    reload();
  };
  return {
    getActions,
    registerTable,
    registerDrawer,
    onAdd,
    fmtImg,
    openImg,
    handleSuccess,
  };
};
export default useContent;
