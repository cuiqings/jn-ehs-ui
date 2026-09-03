import { list, del, getPlanList, downloadRecord, downloadExam } from '../url/index';
import { getDepartTreeBy34 } from '/@/api/common/api';
import { useMessage } from '/@/hooks/web/useMessage';
import { createVNode, ref, computed } from 'vue';
import { QuestionCircleOutlined } from '@ant-design/icons-vue';
import { BasicColumn, FormSchema } from '/@/components/Table';
import { useListPage } from '/@/hooks/system/useListPage';
import { useDrawer } from '/@/components/Drawer';
import { useModal } from '/@/components/Modal';
import { TreeSelect } from 'ant-design-vue';
import { useUserStore } from '/@/store/modules/user';
export const useContent = () => {
  const userStore: any = useUserStore();
  const userInfo = computed(() => userStore.getUserInfo);
  const loginInfo = computed(() => userStore.getLoginInfo);
  const isSecuritySector = loginInfo.value.departs[0]?.isSecuritySector;
  const { createConfirm, createMessage } = useMessage();
  //注册drawer
  const [registerDrawer, { openDrawer }] = useDrawer();
  const [registerViewModal, { openModal }] = useModal();
  const SHOW_ALL = TreeSelect.SHOW_ALL;
  const orgOptions: any = ref([]);
  const enforceOptions: any = ref([]);
  const spinning = ref(false);
  const searchFormSchema = <FormSchema[]>[
    {
      label: '任务名称',
      field: 'taskName',
      component: 'Input',
      colProps: { span: 6 },
    },
    {
      label: '实施单位',
      field: 'enforceCode',
      component: 'JTreeSelect1',
      componentProps: {
        treeDataArr: [],
        multiple: true,
        treeNodeFilterProp: 'title',
        treeDefaultExpandAll: false,
      },
      colProps: { span: 6 },
    },
    {
      label: '培训项目',
      field: 'trainProjectName',
      component: 'JDictSelectTag',
      componentProps: {
        dictCode: 'edu_train_project',
        placeholder: '请选择',
        stringToNumber: false,
        isLabel: true,
      },
      colProps: { span: 6 },
    },
    {
      label: '培训计划',
      field: 'trainPlanId',
      component: 'Select',
      componentProps: {
        options: [],
        showSearch: true,
        placeholder: '请选择',
        filterOption: (input: string, option: any) => {
          return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
        },
      },
      colProps: { span: 6 },
    },
    {
      label: '任务时间',
      field: 'time',
      component: 'RangePicker',
      componentProps: {
        valueFormat: 'YYYY-MM-DD',
        style: { width: '100%' },
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
          { label: '待提交', value: '0' },
          { label: '评审中', value: '4' },
          { label: '未开始', value: '1' },
          { label: '进行中', value: '2' },
          { label: '待签字评价', value: '5' },
          { label: '已结束', value: '3' },
        ],
      },
      colProps: { span: 6 },
    },
    {
      label: '创建单位',
      field: 'orgCode',
      component: 'JTreeSelect1',
      componentProps: {
        treeDataArr: [],
        isLeaf: false,
        load: false,
        treeDefaultExpandAll: false,
        treeNodeFilterProp: 'title',
        fieldNames: { label: 'title', value: 'orgCode', key: 'orgCode', options: 'children' },
        showCheckedStrategy: SHOW_ALL,
      },
      colProps: { span: 6 },
    },
    {
      label: '参加人员',
      field: 'userName',
      component: 'Input',
      colProps: { span: 6 },
    },
  ];
  const columns = <BasicColumn[]>[
    {
      title: '任务名称',
      dataIndex: 'taskName',
      width: 220,
    },
    {
      title: '实施单位',
      dataIndex: 'enforceCode',
      width: 180,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
    },
    {
      title: '培训人数',
      dataIndex: 'personNum',
      width: 80,
    },
    {
      title: '已参加',
      dataIndex: 'participatedNum',
      width: 80,
    },
    {
      title: '参与率',
      dataIndex: 'participationRate',
      customRender: ({ text }) => {
        return text ? text + '%' : '';
      },
      width: 80,
    },
    {
      title: '已合格',
      dataIndex: 'passNum',
      width: 100,
    },
    {
      title: '合格率',
      dataIndex: 'finishRate',
      customRender: ({ text }) => {
        return text ? text + '%' : '';
      },
      width: 80,
    },
    {
      title: '培训完成率',
      dataIndex: 'trainFinishRate',
      width: 100,
    },
    {
      title: '培训计划',
      dataIndex: 'trainPlanName',
      width: 200,
    },
    {
      title: '培训项目',
      width: 180,
      dataIndex: 'trainProjectName',
    },
    {
      title: '任务时间',
      dataIndex: 'taskDate',
      width: 350,
    },
    // {
    //   title: '任务分类',
    //   dataIndex: 'category',
    //   width: 100,
    // },

    {
      title: '创建人',
      dataIndex: 'createBy',
      width: 100,
    },
    {
      title: '创建单位',
      dataIndex: 'orgCodeName',
      width: 180,
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      width: 180,
    },
  ];
  const getActions = (record: any) => {
    return [
      {
        label: '继续创建',
        auth: ['trainingTasks:draft'],
        onClick: onDraft.bind(null, record),
        ifShow:
          record.status == '待提交' &&
          (userInfo.value.orgCode?.slice(0, 9) === record.orgCode || loginInfo.value.departs[0]?.isSecuritySector === '1'),
      },
      {
        label: '详情',
        ifShow: record.status != '待提交',
        onClick: onView.bind(null, record),
      },
      {
        label: '删除',
        auth: ['trainingTasks:del'],
        onClick: onDel.bind(null, record),
        ifShow: userInfo.value.orgCode?.slice(0, 9) === record.orgCode || loginInfo.value.departs[0]?.isSecuritySector === '1',
      },
      {
        label: '复用',
        auth: ['trainingTasks:reuse'],
        onClick: onReuse.bind(null, record),
        ifShow: userInfo.value.orgCode?.slice(0, 9) === record.orgCode || loginInfo.value.departs[0]?.isSecuritySector === '1',
      },
      {
        label: '下载记录',
        auth: ['trainingTasks:download'],
        ifShow: record.status === '已结束',
        onClick: onDownload.bind(null, record),
      },
      {
        label: '下载试卷',
        auth: ['trainingTasks:downloadTestPaper'],
        ifShow: record.status === '已结束',
        onClick: onDownloadTestPaper.bind(null, record),
      },
    ];
  };
  // 列表页面公共参数、方法
  const { tableContext, doRequest } = useListPage({
    designScope: 'trainingTasks-list',
    tableProps: {
      api: list,
      columns: columns,
      formConfig: {
        schemas: searchFormSchema,
      },
      immediate: false,
      beforeFetch: (params) => {
        if (params.time) {
          const time = params.time.split(',');
          params['taskStrTime'] = time[0] + ' 00:00:00';
          params['taskEndTime'] = time[1] + ' 23:59:59';
          delete params['time'];
        }
        if (userInfo.value.orgCode.length > 9 && isSecuritySector !== '1') {
          getForm().setFieldsValue({
            orgCode: userInfo.value.orgCode,
          });
          params.orgCode = userInfo.value.orgCode;
        }
        return params;
      },
      showIndexColumn: true,
      indexColumnProps: {
        fixed: 'left',
      },
      actionColumn: {
        width: 310,
        title: '操作',
        dataIndex: 'action',
        slots: { customRender: 'action' },
        fixed: 'right',
      },
    },
  });
  const [registerTable, { reload, getForm }, { rowSelection, selectedRowKeys }] = tableContext;
  const init = () => {
    getDepartTreeBy34({ securityFlag: false }).then((res) => {
      enforceOptions.value = res;
      getForm().updateSchema({
        field: 'enforceCode',
        componentProps: {
          treeDataArr: enforceOptions.value,
          multiple: true,
          placeholder: '请选择',
          isLeaf: false,
          load: false,
          treeDefaultExpandAll: false,
          treeNodeFilterProp: 'title',
          fieldNames: { label: 'title', value: 'orgCode', options: 'children' },
          showCheckedStrategy: SHOW_ALL,
        },
      });
    });
    getDepartTreeBy34().then((res) => {
      orgOptions.value = res;
      getForm().updateSchema({
        field: 'orgCode',
        componentProps: {
          treeDataArr: orgOptions.value,
          isLeaf: false,
          load: false,
          treeDefaultExpandAll: false,
          treeNodeFilterProp: 'title',
          disabled: userInfo.value.orgCode.length > 9 && isSecuritySector !== '1',
          fieldNames: { label: 'title', value: 'orgCode', options: 'children' },
          showCheckedStrategy: SHOW_ALL,
        },
      });
      if (userInfo.value.orgCode.length > 9 && isSecuritySector !== '1') {
        getForm().setFieldsValue({
          orgCode: userInfo.value.orgCode,
        });
      }
      handleSuccess();
    });
    // 培训计划
    getPlanList().then((res) => {
      if (res) {
        const orgOptions = res.map((item) => {
          return {
            label: item.value,
            value: item.key,
          };
        });
        getForm().updateSchema({
          field: 'trainPlanId',
          componentProps: {
            options: orgOptions,
            showSearch: true,
            placeholder: '请选择',
            filterOption: (input: string, option: any) => {
              return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
            },
          },
        });
      }
    });
  };
  init();
  // 新增
  const onAdd = () => {
    openDrawer(true, {
      title: '新增',
      type: 'add',
      showOkBtn: true,
    });
  };
  // 查看
  const onView = (data) => {
    openModal(true, {
      title: data.taskName,
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
          del({ ids: data.id }).then((res) => {
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
  // 批量删除
  const batchHandleDelete = () => {
    doRequest(() => del({ ids: selectedRowKeys.value.join(',') }));
  };
  // 复用
  const onReuse = (data) => {
    openDrawer(true, {
      title: '复用',
      type: 'reuse',
      showOkBtn: true,
      data,
    });
  };
  // 继续创建
  const onDraft = (data) => {
    openDrawer(true, {
      title: '继续创建',
      type: 'draft',
      showOkBtn: true,
      data,
    });
  };
  const handleSuccess = () => {
    reload();
    selectedRowKeys.value = [];
  };
  // 下载记录
  const onDownload = async (a) => {
    spinning.value = true;
    const data = await downloadRecord({ id: a.id });
    if (!data) {
      createMessage.warning('文件下载失败');
      spinning.value = false;
      return;
    }
    const blobOptions = { type: 'application/pdf' };
    const url = window.URL.createObjectURL(new Blob([data], blobOptions));
    const link = document.createElement('a');
    link.style.display = 'none';
    link.href = url;
    link.setAttribute('download', '培训记录.pdf');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link); //下载完成移除元素
    window.URL.revokeObjectURL(url); //释放掉blob对象
    spinning.value = false;
  };
  // 下载试卷
  const onDownloadTestPaper = async (a) => {
    spinning.value = true;
    const data = await downloadExam({ id: a.id });
    if (!data) {
      createMessage.warning('文件下载失败');
      spinning.value = false;
      return;
    }
    const blobOptions = { type: 'application/pdf' };
    const url = window.URL.createObjectURL(new Blob([data], blobOptions));
    const link = document.createElement('a');
    link.style.display = 'none';
    link.href = url;
    link.setAttribute('download', '试卷记录.pdf');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link); //下载完成移除元素
    window.URL.revokeObjectURL(url); //释放掉blob对象
    spinning.value = false;
  };
  return {
    registerTable,
    onAdd,
    getActions,
    handleSuccess,
    registerDrawer,
    registerViewModal,
    selectedRowKeys,
    batchHandleDelete,
    rowSelection,
    spinning,
  };
};
export default useContent;
