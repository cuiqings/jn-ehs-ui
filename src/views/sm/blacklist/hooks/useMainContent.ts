import { useListPage } from '/@/hooks/system/useListPage';
import { BasicColumn, FormSchema } from '/@/components/Table';
import { ref, nextTick, onMounted, createVNode } from 'vue';
import { useMessage } from '/@/hooks/web/useMessage';
import { QuestionCircleOutlined } from '@ant-design/icons-vue';
import {
  getDepart3ListWithSecurity,
  list,
  del,
  enterpriseList,
  addBlack,
  delPerson,
  addBlackPerson,
  getByTeamDutyPerson,
  getBlackNumber,
} from '../url/index';
import { useModal } from '/@/components/Modal';
import { useDrawer } from '/@/components/Drawer';
import { useUserStore } from '/@/store/modules/user';
export const useMainContent = () => {
  const userStore: any = useUserStore();
  const orgCode: any = ref('');
  orgCode.value = userStore.getUserInfo.orgCode;
  const { createConfirm } = useMessage();
  const orgOptions: any = ref([]);
  const activeKey = ref('0');
  const companyCount = ref(0);
  const personCount = ref(0);
  const [registerModal, { openModal }] = useModal();
  const [registerDrawer, { openDrawer }] = useDrawer();
  const visible = ref(false);
  const dataSource: any = ref([]);
  const yhColumns = [
    {
      title: '序号',
      align: 'center',
      width: 80,
      customRender: ({ index }) => {
        return index + 1;
      },
    },
    {
      title: '隐患状态',
      dataIndex: 'yhStatus_dictText',
      align: 'center',
    },
    {
      title: '检查时间',
      dataIndex: 'checkTime',
      align: 'center',
    },
    {
      title: '所属单位',
      dataIndex: 'orgName',
      align: 'center',
    },
    {
      title: '隐患描述',
      dataIndex: 'yhDescription',
      align: 'center',
    },
    {
      title: '隐患等级',
      dataIndex: 'yhLevel',
      customRender: ({ text }) => {
        if (text === '1') {
          return '一般隐患';
        }
        if (text === '2') {
          return '重大隐患';
        }
      },
      align: 'center',
    },
    {
      title: '操作',
      dataIndex: 'options',
      align: 'center',
      slots: { customRender: 'options' },
    },
  ];
  const searchFormSchema = <FormSchema[]>[
    {
      label: '创建人单位',
      field: 'createOrg',
      component: 'Select',
      componentProps: {
        options: [],
        showSearch: true,
        filterOption: (input: string, option: any) => {
          return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
        },
      },
      colProps: { span: 6 },
      ifShow: () => orgCode.value.slice(0, 6) !== 'A04B12',
    },
    {
      label: '企业名称',
      field: 'companyName',
      component: 'Input',
      colProps: { span: 6 },
      ifShow: () => orgCode.value.slice(0, 6) !== 'A04B12',
    },
    {
      label: '主要负责人',
      field: 'companyManager',
      component: 'Input',
      colProps: { span: 6 },
    },
    {
      label: '经营范围',
      field: 'businessScope',
      component: 'Input',
      colProps: { span: 6 },
    },
    {
      label: '企业档案备注',
      field: 'businessRemark',
      component: 'Input',
      colProps: { span: 6 },
    },
    {
      label: '创建人',
      field: 'createUserName',
      component: 'Input',
      colProps: { span: 6 },
    },
    {
      label: '列入原因',
      field: 'blackRemark',
      component: 'Input',
      colProps: { span: 6 },
    },
  ];
  const searchUserFormSchema = <FormSchema[]>[
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
      label: '身份证号',
      field: 'idNumber',
      component: 'Input',
      colProps: { span: 6 },
    },
    {
      label: '列入原因',
      field: 'blackRemark',
      component: 'Input',
      colProps: { span: 6 },
    },
  ];
  const columns = <BasicColumn[]>[
    {
      title: '企业名称',
      dataIndex: 'companyName',
    },
    {
      title: '主要负责人',
      dataIndex: 'companyManager',
    },
    {
      title: '主要负责人电话',
      dataIndex: 'projectPhone',
    },
    {
      title: '经营范围',
      dataIndex: 'businessScope',
    },
    {
      title: '企业档案备注',
      dataIndex: 'businessRemark',
    },
    {
      title: '创建人',
      dataIndex: 'createUserName',
    },
    {
      title: '创建人单位',
      dataIndex: 'createOrgName',
    },
    {
      title: '列入原因',
      align: 'center',
      dataIndex: 'blackRemark',
    },
  ];
  const columns1 = <BasicColumn[]>[
    {
      title: '姓名',
      dataIndex: 'name',
      align: 'center',
    },
    {
      title: '工作证号',
      dataIndex: 'workNo',
      align: 'center',
    },
    {
      title: '联系方式',
      dataIndex: 'phone',
      align: 'center',
    },
    {
      title: '身份证号',
      dataIndex: 'idNumber',
      align: 'center',
    },
    {
      title: '列入原因',
      align: 'center',
      dataIndex: 'blackRemark',
    },
  ];
  // 企业刷新
  const handleSuccess = async () => {
    init();
    await handleNav();
  };
  // 人员刷新
  const userHandleSuccess = async () => {
    userOption.reload();
    await handleNav();
  };
  // 企业列表
  const { tableContext, operateRequest } = useListPage({
    tableProps: {
      api: enterpriseList,
      columns: columns,
      formConfig: {
        schemas: searchFormSchema,
        labelWidth: 120,
        autoAdvancedCol: 3,
      },
      beforeFetch: (params) => {
        params.blackFlag = '1';
        return params;
      },
      showIndexColumn: true,
      immediate: false,
      indexColumnProps: {
        fixed: 'left',
      },
      rowSelection: {
        fixed: 'left',
      },
      actionColumn: {
        width: 200,
        title: '操作',
        dataIndex: 'action',
        slots: { customRender: 'action' },
        fixed: 'right',
      },
    },
  });
  const [registerTable, { getForm, reload }] = tableContext;
  // 人员列表
  const listContext = useListPage({
    tableProps: {
      api: list,
      columns: columns1,
      formConfig: {
        schemas: searchUserFormSchema,
        labelWidth: 120,
        autoAdvancedCol: 3,
      },
      showIndexColumn: true,
      beforeFetch: (params) => {
        params.blackFlag = '1';
        return params;
      },
      indexColumnProps: {
        fixed: 'left',
      },
      rowSelection: {
        fixed: 'left',
      },
      actionColumn: {
        width: 200,
        title: '操作',
        dataIndex: 'action',
        slots: { customRender: 'action' },
        fixed: 'right',
      },
    },
  });
  const [registerUserTable, userOption] = listContext.tableContext;
  const init = () => {
    getDepart3ListWithSecurity().then((res) => {
      orgOptions.value = res.map((item) => {
        return {
          label: item.departName,
          value: item.orgCode,
        };
      });
      getForm().updateSchema({
        field: 'createOrg',
        componentProps: {
          options: orgOptions.value,
          showSearch: true,
          filterOption: (input: string, option: any) => {
            return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
          },
        },
      });
      reload();
    });
  };
  onMounted(() => {
    handleNav();
    init();
  });
  const getActions = (record: any) => {
    return [
      {
        label: '查看',
        onClick: handleView.bind(null, record),
      },
      {
        label: '删除',
        auth: ['blacklist:del'],
        onClick: handleDelete.bind(null, record),
      },
      {
        label: '移出黑名单',
        auth: ['blacklist:moveOut'],
        onClick: handleMoveOut.bind(null, record),
      },
    ];
  };
  const handleNav = async () => {
    await getBlackNumber().then((res) => {
      if (res) {
        companyCount.value = res.companyCount;
        personCount.value = res.personCount;
      }
    });
  };
  const handleDelete = (data: any) => {
    if (activeKey.value === '0') {
      operateRequest(
        () => del({ id: data.id }),
        {
          confirm: true,
          isBatch: false,
          content: '确定要删除吗？删除后该企业下所关联数据全部清除，由于涉及的数据量较大，可能需要较长时间，请耐心等待。',
        },
        () => handleSuccess()
      );
    } else {
      listContext.operateRequest(
        () => delPerson({ id: data.id }),
        {
          confirm: true,
          isBatch: false,
          content: '确定要删除吗？',
        },
        () => userHandleSuccess()
      );
    }
  };
  // tab切换
  const handleTabChange = (key) => {
    activeKey.value = key;
    nextTick(() => {
      activeKey.value === '0' ? handleSuccess() : userHandleSuccess();
    });
  };
  // 移出黑名单
  const handleMoveOut = (data) => {
    createConfirm({
      iconType: 'warning',
      icon: createVNode(QuestionCircleOutlined),
      title: '移出黑名单',
      content: `是否确认${activeKey.value === '0' ? data.companyName : data.name}移出黑名单？`,
      onOk: () => {
        return new Promise<void>((resolve, reject) => {
          if (activeKey.value === '0') {
            addBlack({ blackFlag: '0', id: data.id })
              .then((res) => {
                if (res) {
                  handleSuccess();
                  resolve();
                } else {
                  reject(new Error('移除失败！'));
                }
              })
              .catch(() => {
                reject(false);
              });
          } else {
            addBlackPerson({ blackFlag: '0', id: data.id })
              .then((res) => {
                if (res) {
                  userHandleSuccess();
                  resolve();
                } else {
                  reject(new Error('移除失败！'));
                }
              })
              .catch(() => {
                reject(false);
              });
          }
        });
      },
    });
  };
  const handleView = (data) => {
    if (activeKey.value === '0') {
      openModal(true, {
        title: '查看',
        data,
        isBlacklist: true,
      });
    } else {
      openDrawer(true, {
        title: '查看',
        type: 'view',
        showOkBtn: false,
        showFooter: true,
        data,
        isBlacklist: true,
      });
    }
  };
  // 查看违章信息
  const handleYhNumber = (data) => {
    getByTeamDutyPerson({ userId: data.userId }).then((res) => {
      if (res) {
        dataSource.value = res.data;
        visible.value = true;
      }
    });
  };
  return {
    registerTable,
    getActions,
    activeKey,
    handleTabChange,
    companyCount,
    personCount,
    registerUserTable,
    registerModal,
    registerDrawer,
    visible,
    yhColumns,
    dataSource,
    handleYhNumber,
  };
};
export default useMainContent;
