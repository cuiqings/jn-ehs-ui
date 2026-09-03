import { list, del, out, getDepart3ListWithSecurity, aptitudeStatistics, deleteBatch, updateStatus } from '../url/index';
import { useMessage } from '/@/hooks/web/useMessage';
import { createVNode, h, ref, nextTick, computed } from 'vue';
import { QuestionCircleOutlined } from '@ant-design/icons-vue';
import { BasicColumn, FormSchema } from '/@/components/Table';
import { useListPage } from '/@/hooks/system/useListPage';
import { useDrawer } from '/@/components/Drawer';
import { useModal } from '/@/components/Modal';
import { useUserStore } from '/@/store/modules/user';
import { Tag } from 'ant-design-vue';
import { getDepart3List } from '/@/api/common/api';
export const useContent = (route) => {
  const userStore: any = useUserStore();
  const [registerModal, { openModal }] = useModal();
  const [recentlyRegisterModal, recentlyOpen] = useModal();
  const [registerAssessment, assessmentOpen] = useModal();
  const [registerQrcode, qrcodeOpen] = useModal();
  const { createConfirm, createMessage } = useMessage();
  //注册drawer
  const [registerDrawer, { openDrawer }] = useDrawer();
  const orgCode = ref('');
  const userInfo = computed(() => userStore.getUserInfo);
  orgCode.value = userInfo.value.orgCode;
  const activeKey = ref<string>('4');
  const contractOrgCodeOptions = ref([]);
  const tabsArr: any = ref([
    {
      title: '未进场',
      keys: '4',
    },
    {
      title: '离场',
      keys: '3',
    },
    {
      title: '在厂',
      keys: '1,2',
    },
  ]);
  const controlCount = ref({
    wjc: 0,
    lc: 0,
    zc: 0,
    zcc: 0,
    dq: 0,
    jjdq: 0,
  });
  const searchFormSchema = <FormSchema[]>[
    {
      label: '企业名称',
      field: 'companyName',
      component: 'Input',
      colProps: { span: 6 },
      ifShow: () => orgCode.value.slice(0, 6) !== 'A04B12',
    },
    {
      label: '姓名',
      field: 'name',
      component: 'Input',
      colProps: { span: 6 },
    },
    {
      label: '工作证号',
      field: 'workNo',
      component: 'Input',
      colProps: { span: 6 },
    },
    {
      label: '联系方式',
      field: 'phone',
      component: 'Input',
      colProps: { span: 6 },
    },
    {
      label: '账号状态',
      field: 'status',
      component: 'Select',
      componentProps: {
        placeholder: '请选择',
        options: [
          { label: '正常', value: '1' },
          { label: '冻结', value: '2' },
        ],
      },
      colProps: { span: 6 },
    },
    {
      label: '身份证号',
      field: 'idNumber',
      component: 'Input',
      colProps: { span: 6 },
    },
    {
      label: '证书状态',
      field: 'certificateStatus',
      component: 'Select',
      componentProps: {
        placeholder: '请选择',
        options: [
          { label: '正常', value: '1' },
          { label: '过期', value: '2' },
          { label: '即将到期', value: '3' },
        ],
      },
      colProps: { span: 6 },
    },
    {
      label: '保险期限',
      field: 'insuranceStatus',
      component: 'Select',
      componentProps: {
        placeholder: '请选择',
        options: [
          { label: '有效', value: '1' },
          { label: '过期', value: '2' },
          { label: '即将到期', value: '3' },
        ],
      },
      colProps: { span: 6 },
    },
    {
      label: '发包单位',
      field: 'publishCode',
      component: 'Select',
      componentProps: {
        placeholder: '请选择',
        showSearch: true,
        filterOption: (input: string, option: any) => {
          return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
        },
      },
      colProps: { span: 6 },
    },
    {
      label: '体检期限',
      field: 'physicalStatus',
      component: 'Select',
      componentProps: {
        placeholder: '请选择',
        options: [
          { label: '有效', value: '1' },
          { label: '过期', value: '2' },
        ],
      },
      colProps: { span: 6 },
    },
    {
      label: '教育培训状态',
      field: 'trainStatus',
      component: 'Select',
      componentProps: {
        placeholder: '请选择',
        options: [
          { label: '待培训', value: '0' },
          { label: '培训中', value: '1' },
          { label: '培训合格', value: '2' },
        ],
      },
      colProps: { span: 6 },
    },
    {
      label: '资质状态',
      field: 'aptitudeStatus',
      component: 'Select',
      componentProps: {
        placeholder: '请选择',
        options: [
          { label: '正常', value: '1' },
          { label: '即将到期', value: '5' },
          { label: '限制进厂', value: '2' },
        ],
      },
      ifShow: () => activeKey.value === '1,2',
      colProps: { span: 6 },
    },
    {
      label: '是否特种作业人员',
      field: 'ifSpecialOperator',
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
    {
      label: '合同单位',
      field: 'contractOrgCode',
      component: 'Select',
      componentProps: {
        placeholder: '请选择',
        options: [],
        showSearch: true,
        filterOption: (input: string, option: any) => {
          return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
        },
      },
      colProps: { span: 6 },
    },
  ];
  const columns = <BasicColumn[]>[
    {
      title: '企业名称',
      dataIndex: 'companyName',
    },
    {
      title: '姓名',
      dataIndex: 'name',
    },
    {
      title: '工号',
      dataIndex: 'workNo',
    },
    {
      title: '联系方式',
      dataIndex: 'phone',
      width: 200,
    },
    {
      title: '身份证号',
      dataIndex: 'idNumber',
      width: 200,
    },
    {
      title: '健康状况',
      dataIndex: 'healthStatus',
    },
    {
      title: '账号状态',
      dataIndex: 'status',
      customRender: ({ text }) => {
        return h(Tag, { color: text === '2' ? 'red' : 'green' }, text === '1' ? '正常' : text === '2' ? '冻结' : '');
      },
    },
    {
      title: '证书状态',
      dataIndex: 'certificateStatus',
      customRender: ({ text }) => {
        return h(
          Tag,
          { color: text === '1' ? 'green' : text === '2' ? 'red' : text === '3' ? 'orange' : '' },
          text === '1' ? '正常' : text === '2' ? '过期' : text === '3' ? '即将到期' : ''
        );
      },
    },
    {
      title: '保险期限',
      dataIndex: 'insuranceStatus',
      customRender: ({ text }) => {
        return h(
          Tag,
          { color: text === '1' ? 'green' : text === '2' ? 'red' : text === '3' ? 'orange' : '' },
          text === '1' ? '有效' : text === '2' ? '过期' : text === '3' ? '即将到期' : ''
        );
      },
    },
    {
      title: '体检期限',
      dataIndex: 'physicalStatus',
      customRender: ({ text }) => {
        return h(Tag, { color: text === '1' ? 'green' : text === '2' ? 'red' : '' }, text === '1' ? '有效' : text === '2' ? '过期' : '');
      },
    },
    {
      title: '教育培训状态',
      dataIndex: 'trainDateStart',
    },
    {
      title: '资质状态',
      dataIndex: 'aptitudeStatus',
      customRender: ({ text }) => {
        return h(
          'span',
          { style: { color: text === '2' ? '#FFA500' : text === '3' ? 'red' : '' } },
          text === '1' ? '正常' : text === '2' ? '限制进厂' : text === '3' ? '离场' : text === '4' ? '未进场' : text === '5' ? '即将到期' : ''
        );
      },
    },
    {
      title: '分数',
      dataIndex: 'score',
    },
    {
      title: '当前项目',
      width: 200,
      dataIndex: 'projectName',
    },
    {
      title: '当前所属发包单位',
      width: 200,
      dataIndex: 'publishName',
    },
    {
      title: '合同单位',
      width: 200,
      dataIndex: 'contractOrgName',
    },
  ];
  const getActions = (record: any) => {
    return [
      {
        label: '查看',
        onClick: onView.bind(null, record),
      },
      {
        label: '编辑',
        auth: ['personnelList:edit'],
        onClick: onEdit.bind(null, record),
      },
      {
        label: '删除',
        auth: ['personnelList:del'],
        ifShow: () => {
          return (
            record.createBy === userInfo.value.username ||
            userInfo.value.username == 'admin' ||
            (orgCode.value.length >= 9 && orgCode.value.substring(0, 9) === 'A04B01C11')
          );
        },
        onClick: onDel.bind(null, record),
      },
    ];
  };
  const getDropDownAction = (record) => {
    return [
      {
        label: '加入黑名单',
        auth: ['personnelList:blacklist'],
        onClick: onBlacklist.bind(null, record),
      },
      {
        label: '二维码',
        auth: ['personnelList:qrcode'],
        onClick: onQrCode.bind(null, record, 'one'),
      },
      {
        label: '冻结',
        ifShow: () => record.status !== '2',
        auth: ['personnelList:freeze'],
        onClick: onFreeze.bind(null, record, 'one'),
      },
      {
        label: '解冻',
        ifShow: () => record.status !== '1',
        auth: ['personnelList:thaw'],
        onClick: onThaw.bind(null, record, 'one'),
      },
      {
        label: '离场',
        ifShow: () => activeKey.value !== '3',
        auth: ['personnelList:leaveFactory'],
        onClick: onLeaveFactory.bind(null, record, 'one'),
      },
      {
        label: '考核',
        auth: ['personnelList:assessment'],
        onClick: onAssessment.bind(null, record),
      },
    ];
  };
  const getBatchHandleDropDownAction = () => {
    return [
      {
        label: '批量删除',
        auth: ['personnelList:del'],
        onClick: batchHandleDelete.bind(null),
      },
      {
        label: '批量冻结',
        auth: ['personnelList:freeze'],
        onClick: onFreeze.bind(null),
      },
      {
        label: '批量解冻',
        auth: ['personnelList:thaw'],
        onClick: onThaw.bind(null),
      },
      {
        label: '批量离场',
        ifShow: () => activeKey.value !== '3',
        auth: ['personnelList:leaveFactory'],
        onClick: onLeaveFactory.bind(null),
      },
      {
        label: '批量二维码下载',
        auth: ['personnelList:batchQrcode'],
        onClick: onQrCode.bind(null),
      },
    ];
  };
  const orgOptions = ref<any[]>([]);
  const init = async () => {
    await getDepart3ListWithSecurity().then((res) => {
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
    });
    await getDepart3List().then((res) => {
      contractOrgCodeOptions.value = res.map((item) => {
        return {
          label: item.departName,
          value: item.orgCode,
        };
      });
      getForm().updateSchema({
        field: 'contractOrgCode',
        componentProps: {
          options: contractOrgCodeOptions.value,
          placeholder: '请选择',
          showSearch: true,
          filterOption: (input: string, option: any) => {
            return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
          },
        },
      });
    });
    handleSuccess();
  };
  init();
  // 列表页面公共参数、方法
  const { tableContext, onImportXls, onExportXls, doRequest } = useListPage({
    designScope: 'personnelList-list',
    tableProps: {
      api: list,
      columns: columns,
      formConfig: {
        schemas: searchFormSchema,
        labelWidth: 120,
      },
      defSort: {
        column: 'updateTime',
        order: 'desc',
      },
      beforeFetch: async (params) => {
        params.blackFlag = '0';
        if (route?.query?.entranceStatus && !params.entranceStatus) {
          getForm().setFieldsValue({
            entranceStatus: route.query.entranceStatus,
          });
          params.entranceStatus = route.query.entranceStatus;
        }
        if (activeKey.value !== '1,2') {
          params.aptitudeStatus = activeKey.value;
        } else {
          if (!params.aptitudeStatus) {
            params.aptitudeStatus = '1,2';
          }
        }
        return params;
      },
      showIndexColumn: true,
      immediate: false,
      indexColumnProps: {
        fixed: 'left',
      },
      actionColumn: {
        width: 210,
        title: '操作',
        dataIndex: 'action',
        slots: { customRender: 'action' },
        fixed: 'right',
      },
    },
    importConfig: {
      url: '/xgf/xgfPerson/importExcel',
    },
    exportConfig: {
      name: () => {
        return `${activeKey.value === '4' ? '未进场' : activeKey.value === '3' ? '离场' : activeKey.value === '1，2' ? '在厂' : ''}-人员列表`;
      },
      url: '/xgf/xgfPerson/exportXls',
      suffix: 'xlsx',
    },
  });
  const [registerTable, { reload, getForm }, { rowSelection, selectedRows, selectedRowKeys }] = tableContext;
  // 新增
  const onAdd = () => {
    openDrawer(true, {
      title: '新增',
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
  // 编辑
  const onEdit = (data) => {
    openDrawer(true, {
      title: '修改',
      type: 'edit',
      showOkBtn: true,
      showFooter: true,
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
        return new Promise<void>((resolve) => {
          del({ id: data.id })
            .then((res) => {
              if (res) {
                handleSuccess();
                resolve();
              }
            })
            .finally(() => {
              resolve();
            });
        });
      },
    });
  };
  const batchHandleDelete = () => {
    const isUsername = selectedRows.value.every((item) => item.createBy === userInfo.value.username);
    if (!(userInfo.value.username == 'admin' || (orgCode.value.length >= 9 && orgCode.value.substring(0, 9) === 'A04B01C11') || isUsername)) {
      return createMessage.warning('当前操作人不是安全部或添加人不允许删除！');
    }
    doRequest(() => deleteBatch({ ids: selectedRowKeys.value.join(',') }));
  };
  // 冻结
  const onFreeze = (data, type = 'two') => {
    if (type === 'two' && !selectedRows.value.every((item) => item.status !== '2')) {
      return createMessage.info('选中的存在已冻结的数据！');
    }
    const id = type === 'two' ? selectedRowKeys.value.join(',') : data.id;
    createConfirm({
      iconType: 'warning',
      icon: createVNode(QuestionCircleOutlined),
      title: '冻结',
      content: '确定要冻结吗？',
      onOk: () => {
        return new Promise<void>((resolve, reject) => {
          updateStatus({
            id,
            status: '2',
          })
            .then((res) => {
              if (res) {
                handleSuccess();
                selectedRowKeys.value = [];
                resolve();
              } else {
                reject(new Error('冻结失败！'));
              }
            })
            .catch(() => {
              reject();
            });
        });
      },
    });
  };
  const handleSuccess = async () => {
    aptitudeStatistics().then((res) => {
      if (res) {
        controlCount.value.dq = res['到期'];
        controlCount.value.jjdq = res['即将到期'];
        controlCount.value.zc = res['在厂'];
        controlCount.value.wjc = res['未进场'];
        controlCount.value.zcc = res['正常'];
        controlCount.value.lc = res['离场'];
      }
    });
    reload();
  };
  // 解冻
  const onThaw = (data, type = 'two') => {
    if (type === 'two' && !selectedRows.value.every((item) => item.status !== '1')) {
      return createMessage.info('选中的存在已解冻的数据！');
    }
    const id = type === 'two' ? selectedRowKeys.value.join(',') : data.id;
    createConfirm({
      iconType: 'warning',
      icon: createVNode(QuestionCircleOutlined),
      title: '解冻',
      content: '确定要解冻吗？',
      onOk: () => {
        return new Promise<void>((resolve, reject) => {
          updateStatus({
            id,
            status: '1',
          })
            .then((res) => {
              if (res) {
                handleSuccess();
                selectedRowKeys.value = [];
                resolve();
              } else {
                reject();
              }
            })
            .catch(() => {
              reject();
            });
        });
      },
    });
  };
  // 离场
  const onLeaveFactory = (data, type = 'two') => {
    const id = type === 'two' ? selectedRowKeys.value.join(',') : data.id;
    createConfirm({
      iconType: 'warning',
      icon: createVNode(QuestionCircleOutlined),
      title: '离场',
      content: '确定要离场吗？',
      onOk: () => {
        return new Promise<void>((resolve, reject) => {
          out({ id })
            .then((res) => {
              if (res) {
                handleSuccess();
                selectedRowKeys.value = [];
                resolve();
              } else {
                reject();
              }
            })
            .catch(() => {
              reject();
            });
        });
      },
    });
  };
  // 加入黑名单
  const onBlacklist = (data) => {
    openModal(true, data);
  };
  // 资质状态切换
  const handleTabChange = (value) => {
    activeKey.value = value;
    selectedRowKeys.value = [];
    selectedRows.value = [];
    nextTick(() => {
      reload();
    });
  };
  const handleRecently = () => {
    recentlyOpen.openModal(true);
  };
  // 二维码
  const onQrCode = (record, type = 'two') => {
    qrcodeOpen.openModal(true, {
      arr: type === 'one' ? [record] : selectedRows.value,
    });
  };
  // 考核
  const onAssessment = (data) => {
    assessmentOpen.openModal(true, data);
  };
  return {
    getActions,
    onImportXls,
    registerTable,
    onAdd,
    handleSuccess,
    registerDrawer,
    registerModal,
    getDropDownAction,
    activeKey,
    handleTabChange,
    tabsArr,
    controlCount,
    handleRecently,
    recentlyRegisterModal,
    registerAssessment,
    registerQrcode,
    rowSelection,
    onExportXls,
    selectedRowKeys,
    getBatchHandleDropDownAction,
  };
};
export default useContent;
