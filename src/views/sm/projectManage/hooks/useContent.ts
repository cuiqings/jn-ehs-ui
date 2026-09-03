import { getDepart3ListWithSecurity, del } from '../../admissionApplication/url/index';
import { list } from '../url/index';
import { h, ref, createVNode } from 'vue';
import { BasicColumn, FormSchema } from '/@/components/Table';
import { useListPage } from '/@/hooks/system/useListPage';
import { useDrawer } from '/@/components/Drawer';
import { useMessage } from '/@/hooks/web/useMessage';
import { QuestionCircleOutlined } from '@ant-design/icons-vue';
import { useUserStore } from '/@/store/modules/user';
import dayjs from 'dayjs';
const userStore: any = useUserStore();
export const useContent = () => {
  const { createConfirm } = useMessage();
  //注册drawer
  const [registerDrawer, { openDrawer }] = useDrawer();
  const orgCode: any = ref('');
  orgCode.value = userStore.getUserInfo.orgCode;
  const orgOptions: any = ref([]);
  const searchFormSchema = <FormSchema[]>[
    {
      label: '发包单位',
      field: 'publishCode',
      component: 'Select',
      componentProps: {
        options: [],
        showSearch: true,
        filterOption: (input: string, option: any) => {
          return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
        },
      },
      colProps: { span: 6 },
    },
    {
      label: '承包单位',
      field: 'contractName',
      component: 'Input',
      colProps: { span: 6 },
      ifShow: () => orgCode.value.slice(0, 6) !== 'A04B12',
    },
    {
      label: '项目名称',
      field: 'projectName',
      component: 'Input',
      colProps: { span: 6 },
    },
    {
      label: '相关方类别',
      field: 'xgfType',
      component: 'Select',
      componentProps: {
        placeholder: '请选择',
        options: [
          { label: '施工类', value: '1' },
          { label: '生产服务类', value: '2' },
          { label: '搬倒类', value: '3' },
        ],
      },
      colProps: { span: 6 },
    },
    {
      label: '项目期限',
      field: 'projectTerm',
      component: 'Select',
      componentProps: {
        placeholder: '请选择',
        options: [
          { label: '长期', value: '1' },
          { label: '短期', value: '2' },
        ],
      },
      colProps: { span: 6 },
    },
    {
      label: '施工时间',
      field: 'time1',
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
      label: '状态',
      field: 'status',
      component: 'Select',
      componentProps: {
        placeholder: '请选择',
        options: [
          { label: '审批中', value: '1' },
          { label: '待作业', value: '3' },
          { label: '施工作业中', value: '4' },
          { label: '已结束', value: '5' },
        ],
      },
      colProps: { span: 6 },
    },
    {
      label: '即将到期',
      field: 'dueFlag',
      component: 'Select',
      componentProps: {
        placeholder: '请选择',
        options: [
          { label: '是', value: '1' },
          { label: '否', value: '2' },
        ],
      },
      colProps: { span: 6 },
    },
  ];
  const columns = <BasicColumn[]>[
    {
      title: '承包单位',
      dataIndex: 'contractName',
    },
    {
      title: '项目名称',
      dataIndex: 'projectName',
    },
    {
      title: '相关方类别',
      dataIndex: 'xgfType',
      customRender: ({ text }) => {
        return h('span', {}, text === '1' ? '施工类' : text === '2' ? '生产服务类' : text === '3' ? '搬倒类' : '');
      },
    },
    {
      title: '发包单位',
      dataIndex: 'publishName',
    },
    {
      title: '项目期限',
      dataIndex: 'projectTerm',
      customRender: ({ text }) => {
        return h('span', {}, text === '1' ? '长期' : text === '2' ? '短期' : '');
      },
    },
    {
      title: '施工时间',
      dataIndex: 'workDateStart',
      width: 200,
      customRender: (data: any) => {
        return data.record.workDateStart ? h('span', data.record.workDateStart + '至' + data.record.workDateEnd) : '';
      },
    },
    // {
    //   title: '培训合格人数',
    //   dataIndex: 'qualifiedNumber',
    // },
    {
      title: '状态',
      dataIndex: 'status',
      customRender: ({ text }) => {
        return h(
          'span',
          { style: { color: text === '2' ? 'red' : '' } },
          text === '1' ? '审批中' : text === '3' ? '待作业' : text === '4' ? '施工作业中' : text === '5' ? '已结束' : ''
        );
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
        label: '删除',
        auth: ['projectManage:del'],
        onClick: onDel.bind(null, record),
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
        labelWidth: 140,
      },
      immediate: false,
      beforeFetch: (params) => {
        if (params.time1) {
          const time1 = params.time1.split(',');
          params['workDateStart'] = time1[0];
          params['workDateEnd'] = time1[1];
          delete params['time1'];
        }
        return params;
      },
      defSort: {
        column: 'updateTime',
        order: 'desc',
      },
      rowClassName: (record: any) => {
        return dayjs(record.workDateEnd).isAfter(dayjs().subtract(10, 'day')) && dayjs(record.workDateEnd).isBefore(dayjs()) && record.status === '4'
          ? 'bg-red'
          : '';
      },
      showIndexColumn: true,
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
    getDepart3ListWithSecurity().then((res) => {
      orgOptions.value = res.map((item) => {
        return {
          label: item.departName,
          value: item.orgCode,
        };
      });
      getForm().updateSchema({
        field: 'publishCode',
        componentProps: {
          options: orgOptions.value,
          placeholder: '请选择',
          showSearch: true,
          filterOption: (input: string, option: any) => {
            return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
          },
        },
      });
      reload();
    });
  };
  init();
  // 查看
  const onView = (data) => {
    openDrawer(true, {
      title: '查看',
      type: 'view',
      addType: '入场申请',
      data,
    });
  };
  // 删除
  const onDel = (data) => {
    createConfirm({
      iconType: 'warning',
      icon: createVNode(QuestionCircleOutlined),
      title: '删除',
      content: '确定要删除吗？',
      onOk: () => {
        return new Promise<void>((resolve, reject) => {
          del({ id: data.id }).then((res) => {
            if (res) {
              handleSuccess();
              resolve();
            } else {
              reject(new Error('删除失败！'));
            }
          });
        });
      },
    });
  };
  const handleSuccess = () => {
    reload();
  };
  return {
    getActions,
    registerTable,
    handleSuccess,
    registerDrawer,
  };
};
export default useContent;
