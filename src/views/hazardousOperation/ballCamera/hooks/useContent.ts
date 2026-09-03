import { list } from '../url/index';
import { ref } from 'vue';
import { BasicColumn, FormSchema } from '/@/components/Table';
import { useListPage } from '/@/hooks/system/useListPage';
import { useDrawer } from '/@/components/Drawer';
import { getDepart3ListWithSecurity } from '/@/api/common/api';
import { useModal } from '/@/components/Modal';
import { getUrl } from '../../api/index';
import { message } from 'ant-design-vue';
export const useContent = () => {
  const [registerDrawer, { openDrawer }] = useDrawer();
  const [registerPlayerModal, open] = useModal();
  const orgOptions: any = ref([]);
  const searchFormSchema = <FormSchema[]>[
    {
      label: '设备编码',
      field: 'deviceCode',
      component: 'Input',
      colProps: { span: 6 },
    },
    {
      label: '所属单位',
      field: 'orgCode',
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
      label: '设备名称',
      field: 'deviceName',
      component: 'Input',
      colProps: { span: 6 },
    },
  ];
  const columns = <BasicColumn[]>[
    {
      title: '设备编码',
      dataIndex: 'deviceCode',
      width: 150,
      align: 'center',
    },
    {
      title: '所属单位',
      dataIndex: 'orgName',
      width: 200,
      align: 'center',
    },
    {
      title: '设备名称',
      dataIndex: 'deviceName',
      width: 200,
      align: 'center',
    },
  ];
  const getActions = (record: any) => {
    return [
      {
        label: '编辑',
        auth: ['ballCamera:edit'],
        onClick: onEdit.bind(null, record),
      },
      {
        label: '预览',
        auth: ['ballCamera:preview'],
        onClick: onPreview.bind(null, record),
      },
    ];
  };
  // 列表页面公共参数、方法
  const { tableContext } = useListPage({
    designScope: 'ballCamera-list',
    tableProps: {
      api: list,
      columns: columns,
      formConfig: {
        schemas: searchFormSchema,
      },
      immediate: false,
      beforeFetch: (params) => {
        if (orgOptions.value.length === 1) {
          params.orgCode = orgOptions.value[0].value;
          getForm().setFieldsValue({
            orgCode: orgOptions.value[0].value,
          });
        }
        return params;
      },
      showIndexColumn: true,
      indexColumnProps: {
        fixed: 'left',
      },
      actionColumn: {
        width: 140,
        title: '操作',
        dataIndex: 'action',
        slots: { customRender: 'action' },
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
        field: 'orgCode',
        componentProps: {
          options: orgOptions.value,
          showSearch: true,
          filterOption: (input: string, option: any) => {
            return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
          },
        },
      });
      if (orgOptions.value.length === 1) {
        getForm().setFieldsValue({
          orgCode: orgOptions.value[0]?.value,
        });
      }
      handleSuccess();
    });
  };
  init();
  const handleAdd = () => {
    openDrawer(true, {
      title: '新增',
      type: 'add',
      showOkBtn: true,
      showFooter: true,
    });
  };
  // 编辑
  const onEdit = (data) => {
    openDrawer(true, {
      title: '编辑',
      type: 'edit',
      showOkBtn: true,
      showFooter: true,
      data,
    });
  };
  const onPreview = (data) => {
    getUrl({
      code: data.deviceCode,
    })
      .then((res) => {
        if (res.code == 200) {
          open.openModal(true, {
            url: res.result,
            id: data.id,
          });
        } else {
          message.error('请确认布控球设备是否开机！');
        }
      })
      .catch(() => {
        message.error('网络超时！');
      });
  };
  const handleSuccess = () => {
    reload();
  };
  return {
    registerTable,
    getActions,
    handleSuccess,
    registerDrawer,
    handleAdd,
    registerPlayerModal,
  };
};
export default useContent;
