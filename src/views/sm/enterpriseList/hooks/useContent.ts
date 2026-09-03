import { list, del, getDepart3ListWithSecurity } from '../url/index';
import { useMessage } from '/@/hooks/web/useMessage';
import { createVNode, ref, computed } from 'vue';
import { QuestionCircleOutlined } from '@ant-design/icons-vue';
import { BasicColumn, FormSchema } from '/@/components/Table';
import { useListPage } from '/@/hooks/system/useListPage';
import { useModal } from '/@/components/Modal';
import { useUserStore } from '/@/store/modules/user';

export const useContent = () => {
  const { createConfirm } = useMessage();
  const [registerModal, blacklistOpen] = useModal();
  const [registerAdd, { openModal }] = useModal();
  const [registerAssessment, assessmentOpen] = useModal();
  const [registerChangeOwner, changeOwnerOpen] = useModal();
  const userStore: any = useUserStore();
  const userInfo = computed(() => userStore.getUserInfo);
  const orgCode: any = ref('');
  orgCode.value = userStore.getUserInfo.orgCode;
  const orgOptions: any = ref([]);
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
      label: '状态',
      field: 'status',
      component: 'Select',
      componentProps: {
        options: [
          {
            label: '合同内',
            value: '1',
          },
          {
            label: '合同外',
            value: '2',
          },
        ],
      },
      colProps: { span: 6 },
    },
    {
      label: '是否新入场',
      field: 'newFlag',
      component: 'Select',
      componentProps: {
        options: [
          {
            label: '是',
            value: '1',
          },
          {
            label: '否',
            value: '2',
          },
        ],
      },
      colProps: { span: 6 },
    },
  ];
  const columns = <BasicColumn[]>[
    {
      title: '企业名称',
      dataIndex: 'companyName',
      width: 200,
      align: 'left',
      slots: { customRender: 'companyName' },
    },
    {
      title: '主要负责人',
      width: 150,
      dataIndex: 'companyManager',
    },
    {
      title: '主要负责人电话',
      width: 146,
      dataIndex: 'projectPhone',
    },
    {
      title: '经营范围',
      dataIndex: 'businessScope',
      width: 150,
    },
    {
      title: '企业档案备注',
      dataIndex: 'businessRemark',
      width: 150,
    },
    {
      title: '分数',
      dataIndex: 'score',
      width: 100,
    },
    {
      title: '创建人',
      dataIndex: 'createUserName',
      width: 150,
    },
    {
      title: '创建人单位',
      dataIndex: 'createOrgName',
      width: 150,
    },
    {
      title: '状态',
      dataIndex: 'status',
      slots: { customRender: 'status' },
      width: 100,
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
        auth: ['enterpriseList:edit'],
        ifShow: userInfo.value.username === record.createBy || userInfo.value.username === 'admin',
        onClick: onEdit.bind(null, record),
      },
      {
        label: '删除',
        auth: ['enterpriseList:del'],
        ifShow:
          userInfo.value.username === record.createBy ||
          userInfo.value.username === 'admin' ||
          (orgCode.value.length >= 9 && orgCode.value.substring(0, 9) === 'A04B01C11'),
        onClick: onDel.bind(null, record),
      },
    ];
  };
  const getDropDownAction = (record) => {
    return [
      {
        label: '变更负责人',
        auth: ['enterpriseList:changeManager'],
        ifShow: userInfo.value.username === record.createBy || userInfo.value.username === 'admin',
        onClick: onChangeManager.bind(null, record),
      },
      {
        label: '加入黑名单',
        auth: ['enterpriseList:blacklist'],
        onClick: onBlacklist.bind(null, record),
      },
      {
        label: '考核',
        auth: ['enterpriseList:assessment'],
        onClick: onAssessment.bind(null, record),
      },
    ];
  };
  // 列表页面公共参数、方法
  const { tableContext } = useListPage({
    designScope: 'enterpriseList-list',
    tableProps: {
      api: list,
      columns: columns,
      formConfig: {
        schemas: searchFormSchema,
      },
      beforeFetch: (params) => {
        params.blackFlag = '0';
        return params;
      },
      defSort: {
        column: 'updateTime',
        order: 'desc',
      },
      immediate: false,
      showIndexColumn: true,
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
  });
  const [registerTable, { reload, getForm }] = tableContext;
  const init = () => {
    getDepart3ListWithSecurity().then((res) => {
      orgOptions.value = res.map((item) => ({
        label: item.departName,
        value: item.orgCode,
      }));
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
  init();
  // 新增
  const onAdd = () => {
    openModal(true, {
      title: '新增',
    });
  };
  // 查看
  const onView = (data) => {
    openModal(true, {
      title: '查看',
      data,
    });
  };
  // 编辑
  const onEdit = (data) => {
    openModal(true, {
      title: '编辑',
      data,
    });
  };
  // 删除
  const onDel = (data) => {
    createConfirm({
      iconType: 'warning',
      icon: createVNode(QuestionCircleOutlined),
      title: '删除',
      content: '确定要删除吗？删除后该企业下所关联数据全部清除，由于涉及的数据量较大，可能需要较长时间，请耐心等待。',
      onOk: () => {
        return new Promise<void>((resolve, reject) => {
          del({ id: data.id })
            .then((res) => {
              if (res) {
                handleSuccess();
                resolve();
              } else {
                reject(new Error('删除失败！'));
              }
            })
            .catch(() => {
              resolve();
            });
        });
      },
    });
  };
  // 加入黑名单
  const onBlacklist = (data) => {
    blacklistOpen.openModal(true, data);
  };
  // 考核
  const onAssessment = (data) => {
    assessmentOpen.openModal(true, data);
  };
  // 变更负责人
  const onChangeManager = (data) => {
    changeOwnerOpen.openModal(true, data);
  };
  const handleSuccess = () => {
    reload();
  };
  return {
    getActions,
    registerTable,
    onAdd,
    handleSuccess,
    registerAdd,
    registerModal,
    registerAssessment,
    registerChangeOwner,
    getDropDownAction,
  };
};
export default useContent;
