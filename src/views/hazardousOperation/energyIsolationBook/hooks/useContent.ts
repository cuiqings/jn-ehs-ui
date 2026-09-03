import { list, del } from '../api';
import { h, ref, createVNode, computed, onMounted } from 'vue';
import { BasicColumn, FormSchema } from '/@/components/Table';
import { useListPage } from '/@/hooks/system/useListPage';
import { useModal } from '/@/components/Modal';
import { useMessage } from '/@/hooks/web/useMessage';
import { QuestionCircleOutlined } from '@ant-design/icons-vue';
import { useUserStore } from '/@/store/modules/user';
import { previewFile, getDepart3ListWithSecurity } from '/@/api/common/api';
const userStore: any = useUserStore();
const userInfo = computed(() => userStore.getUserInfo);
export const useContent = () => {
  const { createConfirm } = useMessage();
  const [registerModal, { openModal }] = useModal();
  const [registerAddModal, { openModal: openAddModal }] = useModal();
  const userId: any = ref('');
  userId.value = userInfo.value.id;
  
  const publishOptions = ref<any[]>([]);
  const searchFormSchema = <FormSchema[]>[
    {
      label: '所属单位',
      field: 'orgCode',
      component: 'Select',
      componentProps: {
        options: [],
      },
      colProps: { span: 6 },
    },
    {
      label: '设备名称',
      field: 'equipmentName',
      component: 'Input',
      colProps: { span: 6 },
    },
    {
      label: '编号',
      field: 'equipmentCode',
      component: 'Input',
      colProps: { span: 6 },
    },
  ];
  const columns = <BasicColumn[]>[
    {
      title: '所属单位',
      dataIndex: 'orgName',
    },
    {
      title: '所属车间',
      dataIndex: 'workShopName',
    },
    {
      title: '设备名称',
      dataIndex: 'equipmentName',
    },
    {
      title: '编号',
      dataIndex: 'equipmentCode',
    },
    {
      title: '能源隔离点位',
      dataIndex: 'isolationName',
      width: 200,
    },
    {
      title: '文件',
      dataIndex: 'file',
      slots: { customRender: 'file' },
    },
    {
      title: '编写时间',
      dataIndex: 'writeTime',
    }
  ];
  const getActions = (record: any) => {
    return [
      {
        label: '查看',
        onClick: onView.bind(null, record),
      },
      {
        label: '编辑',
        auth: ['energyIsolationBook:edit'],
        onClick: onEdit.bind(null, record),
      },
      {
        label: '删除',
        color: 'error',
        auth: ['energyIsolationBook:del'],
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
        if(publishOptions.value.length == 1) {
          getForm().setFieldsValue({
            orgCode: publishOptions.value[0].value,
          });
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
    getDepart3ListWithSecurity().then((res) => {
      publishOptions.value = res.map((item) => {
        return {
          label: item.departName,
          value: item.orgCode,
        };
      });
      if(publishOptions.value.length == 1) {
        getForm().setFieldsValue({
          orgCode: publishOptions.value[0].value,
        });
      }
      reload();
      getForm().updateSchema({
        field: 'orgCode',
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
  const onEdit = (data) => {
     openAddModal(true, {
      type: 'edit',
      title: '编辑',
      data: JSON.parse(JSON.stringify(data)),
    });
  };
  
  // 查看
  const onView = (data) => {
    openAddModal(true, {
      type: 'view',
      title: '查看',
      data: JSON.parse(JSON.stringify(data)),
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
  const [registerAssessmentAddModal, { openModal: openAssessmentAddModal }] = useModal();

  const handleSuccess = () => {
   reload();
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
    registerAssessmentAddModal,
  };
};
export default useContent;
