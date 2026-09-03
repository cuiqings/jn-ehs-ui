import { list, del, getExaminePage, deleteExamine } from '../url/index';
import { getDetailList } from '../../admissionApplication/url/index';
import { h, ref, createVNode, computed, onMounted } from 'vue';
import { BasicColumn, FormSchema } from '/@/components/Table';
import { useListPage } from '/@/hooks/system/useListPage';
import { useModal } from '/@/components/Modal';
import { useMessage } from '/@/hooks/web/useMessage';
import { QuestionCircleOutlined } from '@ant-design/icons-vue';
import { useUserStore } from '/@/store/modules/user';
import { previewFile, getDepart3List } from '/@/api/common/api';
const userStore: any = useUserStore();
const userInfo = computed(() => userStore.getUserInfo);
export const useContent = () => {
  const { createConfirm } = useMessage();
  const [registerModal, { openModal }] = useModal();
  const [registerAddModal, { openModal: openAddModal }] = useModal();
  const userId: any = ref('');
  userId.value = userInfo.value.id;
  const tabsArr: any = ref([
    {
      title: '自主管理',
      keys: '1',
    },
    {
      title: '人员考核',
      keys: '2',
    },
  ]);
  const activeKey = ref('1');
  const publishOptions = ref([]);
  const searchFormSchema = <FormSchema[]>[
    {
      label: '相关方名称',
      field: 'companyName',
      component: 'Input',
      colProps: { span: 6 },
    },
    {
      label: '资料类型',
      field: 'dataType',
      component: 'Select',
      componentProps: {
        placeholder: '请选择',
        options: [
          { label: '周例会', value: '1' },
          { label: '周检查', value: '2' },
          { label: '培训', value: '3' },
        ],
      },
      colProps: { span: 6 },
    },
    {
      label: '审核状态',
      field: 'status',
      component: 'Select',
      componentProps: {
        placeholder: '请选择',
        options: [
          { label: '待检查', value: '1' },
          { label: '待整改', value: '2' },
          { label: '待验收', value: '3' },
          { label: '验收合格', value: '4' },
          { label: '合格', value: '5' },
        ],
      },
      colProps: { span: 6 },
    },
    {
      label: '上传时间',
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
      label: '发包单位',
      field: 'publishCode',
      component: 'Select',
      componentProps: {
        options: [],
      },
      colProps: { span: 6 },
    },
  ];
  const columns = <BasicColumn[]>[
    {
      title: '相关方名称',
      dataIndex: 'companyName',
    },
    {
      title: '项目名称',
      dataIndex: 'enterName',
    },
    {
      title: '发包单位',
      dataIndex: 'publishName',
    },
    {
      title: '资料类型',
      dataIndex: 'dataType',
      customRender: ({ text }) => {
        return h('span', {}, text === '1' ? '周例会' : text === '2' ? '周检查' : text === '3' ? '培训' : '');
      },
    },
    {
      title: '上传时间',
      dataIndex: 'uploadTime',
      width: 200,
    },
    {
      title: '相关文档',
      dataIndex: 'file',
      slots: { customRender: 'file' },
    },
    {
      title: '上传人',
      dataIndex: 'uploadByName',
    },
    {
      title: '状态',
      dataIndex: 'status',
      customRender: ({ text }) => {
        return h(
          'span',
          {
            style: {
              color: text === '4' || text === '5' ? '#52c41a' : '',
            },
          },
          text === '1' ? '待检查' : text === '2' ? '待整改' : text === '3' ? '待验收' : text === '4' ? '验收合格' : text === '5' ? '合格' : ''
        );
      },
    },
    {
      title: '检查人',
      dataIndex: 'checkByName',
    },
  ];
  const getActions = (record: any) => {
    return [
      {
        label: '检查',
        auth: ['autonomous:examine'],
        ifShow: () => {
          return record.status == '1';
        },
        onClick: onExamine.bind(null, record),
      },
      {
        label: '整改',
        auth: ['autonomous:rectify'],
        ifShow: () => {
          return record.status == '2' && userId.value === record.uploadBy;
        },
        onClick: onRectify.bind(null, record),
      },
      {
        label: '验收',
        auth: ['autonomous:acceptance'],
        ifShow: () => {
          return record.status == '3' && userId.value === record.checkBy;
        },
        onClick: onAcceptance.bind(null, record),
      },
      {
        label: '查看',
        onClick: onView.bind(null, record),
      },
      {
        label: '删除',
        auth: ['autonomous:del'],
        onClick: onDel.bind(null, record),
      },
    ];
  };
  // 列表页面公共参数、方法
  const { tableContext } = useListPage({
    designScope: 'autonomous-list',
    tableProps: {
      api: list,
      columns: columns,
      formConfig: {
        schemas: searchFormSchema,
      },
      beforeFetch: (params) => {
        if (params.time1) {
          const time1 = params.time1.split(',');
          params['uploadTimeStart'] = time1[0];
          params['uploadTimeEnd'] = time1[1];
          delete params['time1'];
        }
        return params;
      },
      immediate: false,
      showIndexColumn: true,
      indexColumnProps: {
        fixed: 'left',
      },
      actionColumn: {
        width: 180,
        title: '操作',
        dataIndex: 'action',
        slots: { customRender: 'action' },
        fixed: 'right',
      },
    },
  });
  const [registerTable, { reload, getForm }] = tableContext;
  onMounted(() => {
    reload();
    getDepart3List().then((res) => {
      publishOptions.value = res.map((item) => {
        return {
          label: item.departName,
          value: item.orgCode,
        };
      });
      getForm().updateSchema({
        field: 'publishCode',
        componentProps: {
          options: publishOptions.value,
          placeholder: '请选择',
          showSearch: true,
          allowClear: true,
          filterOption: (input: string, option: any) => {
            return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
          },
        },
      });
    });
  });
  const handleAdd = () => {
    openAddModal(true, {
      type: 'add',
      title: '新增',
    });
  };
  // 检查
  const onExamine = (data) => {
    openModal(true, {
      title: '检查',
      type: 'examine',
      data,
    });
  };
  // 整改
  const onRectify = (data) => {
    openModal(true, {
      title: '整改',
      type: 'rectify',
      data,
    });
  };
  // 验收
  const onAcceptance = (data) => {
    openModal(true, {
      title: '整改',
      type: 'acceptance',
      data,
    });
  };
  // 查看
  const onView = (data) => {
    openAddModal(true, {
      type: 'view',
      title: '查看',
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
  // 预览
  const onPreview = (file) => {
    previewFile(file).then((res) => {
      window.open(res, '_blank');
    });
  };
  const trimFileName = (fileName: string) => {
    if (fileName) {
      const index = fileName.lastIndexOf('_');
      const pointIndex = fileName.lastIndexOf('.');
      if (index !== -1) {
        return (fileName.substring(0, index) + '.' + fileName.substring(pointIndex + 1)).replace('temp/', '');
      }
    }
    return fileName;
  };
  const orgOptions: any = ref([]);
  const [registerAssessmentAddModal, { openModal: openAssessmentAddModal }] = useModal();
  const searchFormSchema1 = <FormSchema[]>[
    {
      label: '相关方名称',
      field: 'companyId',
      component: 'Select',
      componentProps: {
        options: [],
        showSearch: true,
        allowClear: true,
        filterOption: (input: string, option: any) => {
          return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
        },
      },
      colProps: { span: 6 },
    },
    {
      label: '人员姓名',
      field: 'personName',
      component: 'Input',
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
          { label: '离场', value: '3' },
        ],
      },
      colProps: { span: 6 },
    },
    {
      label: '考核时间',
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
  ];
  const columns1 = <BasicColumn[]>[
    {
      title: '相关方名称',
      dataIndex: 'companyName',
    },
    {
      title: '人员姓名',
      dataIndex: 'personName',
    },
    {
      title: '人员身份证号',
      dataIndex: 'idNumber',
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
      title: '考试减分',
      dataIndex: 'score',
    },
    {
      title: '考核原因',
      dataIndex: 'remark',
    },
    {
      title: '考核人',
      dataIndex: 'examineByName',
    },
    {
      title: '考核时间',
      dataIndex: 'examineTime',
    },
  ];
  const getActions1 = (record: any) => {
    return [
      {
        label: '编辑',
        ifShow: () => {
          return record.createBy === userInfo.value.username || userInfo.value.username == 'admin';
        },
        onClick: handleAssessmentEdit.bind(null, record),
      },
      {
        label: '删除',
        ifShow: () => {
          return record.createBy === userInfo.value.username || userInfo.value.username == 'admin';
        },
        onClick: handleAssessmentDel.bind(null, record),
      },
    ];
  };
  const assessment = useListPage({
    designScope: 'autonomous-user-list',
    tableProps: {
      api: getExaminePage,
      columns: columns1,
      formConfig: {
        schemas: searchFormSchema1,
      },
      beforeFetch: (params) => {
        if (userStore.userInfo.orgCode.includes('A04B12')) {
          const companyId = orgOptions.value.filter((item) => userStore.userInfo.orgCode.includes(item.key))[0].value;
          assessmentGinseng.getForm().setFieldsValue({
            companyId: companyId,
          });
          params.companyId = companyId;
        }
        if (params.time1) {
          const time1 = params.time1.split(',');
          params['examineTimeStart'] = time1[0];
          params['examineTimeEnd'] = time1[1];
          delete params['time1'];
        }
        params.type = '2';
        return params;
      },
      showIndexColumn: true,
      immediate: false,
      indexColumnProps: {
        fixed: 'left',
      },
      actionColumn: {
        width: 180,
        title: '操作',
        dataIndex: 'action',
        slots: { customRender: 'action' },
        fixed: 'right',
      },
    },
  });
  const [registerTable1, assessmentGinseng] = assessment.tableContext;
  const onAssessment = () => {
    openAssessmentAddModal(true, {
      title: '新增考核',
      type: 'add',
    });
  };
  const handleAssessmentEdit = (data) => {
    openAssessmentAddModal(true, {
      title: '修改考核',
      type: 'edit',
      data,
    });
  };
  const handleAssessmentDel = (data) => {
    createConfirm({
      iconType: 'warning',
      icon: createVNode(QuestionCircleOutlined),
      title: '删除',
      content: '确定要删除吗？',
      onOk: () => {
        return new Promise<void>((resolve, reject) => {
          deleteExamine({ id: data.id }).then((res) => {
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
  const handleTabChange = async (value) => {
    activeKey.value = value;
    if (activeKey.value === '1') reload();
    if (activeKey.value === '2') {
      await getDetailList().then((res) => {
        orgOptions.value = res.map((item) => {
          return {
            label: item.companyName,
            value: item.id,
            key: item.orgCode,
          };
        });
        assessmentGinseng.getForm().updateSchema({
          field: 'companyId',
          componentProps: {
            disabled: userStore.userInfo.orgCode.includes('A04B12'),
            options: orgOptions.value,
          },
        });
        if (userStore.userInfo.orgCode.includes('A04B12')) {
          assessmentGinseng.getForm().setFieldsValue({
            companyId: orgOptions.value.filter((item) => userStore.userInfo.orgCode.includes(item.key))[0].value,
          });
        } else {
          assessmentGinseng.getForm().setFieldsValue({
            companyId: undefined,
          });
        }
      });
      assessmentGinseng.reload();
    }
  };
  const handleSuccess = () => {
    if (activeKey.value === '1') reload();
    else assessmentGinseng.reload();
  };
  return {
    getActions,
    registerTable,
    handleSuccess,
    registerModal,
    onPreview,
    trimFileName,
    handleAdd,
    registerAddModal,
    tabsArr,
    activeKey,
    handleTabChange,
    onAssessment,
    getActions1,
    registerTable1,
    registerAssessmentAddModal,
  };
};
export default useContent;
