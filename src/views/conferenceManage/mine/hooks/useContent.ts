import { list, cancel, download, getDepart3ListWithSecurity } from '../url/index';
import { useMessage } from '/@/hooks/web/useMessage';
import { createVNode, ref, nextTick, computed } from 'vue';
import { QuestionCircleOutlined } from '@ant-design/icons-vue';
import { BasicColumn, FormSchema } from '/@/components/Table';
import { useListPage } from '/@/hooks/system/useListPage';
import { useDrawer } from '/@/components/Drawer';
import { useModal } from '/@/components/Modal';
import { useUserStore } from '/@/store/modules/user';

export const useContent = (route) => {
  const userStore: any = useUserStore();
  const [registerModal, { openModal }] = useModal();
  const [registerUploadModal, openUpFileModal] = useModal();
  const [detailRegisterModal, detailOpen] = useModal();
  const [registerAssessment, assessmentOpen] = useModal();
  const [registerQrcode, qrcodeOpen] = useModal();
  const { createConfirm, createMessage } = useMessage();
  //注册drawer
  const [registerDrawer, { openDrawer }] = useDrawer();
  const orgCode = ref('');
  const userInfo = computed(() => userStore.getUserInfo);
  orgCode.value = userInfo.value.orgCode;
  const activeKey = ref<string>('1');
  const tabsArr: any = ref([
    {
      title: '待参加会议',
      keys: '1',
    },
    {
      title: '我发起的会议',
      keys: '2',
    },
    {
      title: '已结束会议',
      keys: '3',
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
      label: '会议主题',
      field: 'conferenceTheme',
      component: 'Input',
      colProps: { span: 6 },
    },
    {
      field: 'time',
      label: '会议时间',
      component: 'RangePicker',
      colProps: { span: 6 },
      componentProps: {
        format: 'YYYY-MM-DD HH:mm:ss',
        valueFormat: 'YYYY-MM-DD HH:mm:ss',
        style: { width: '100%' },
        showTime: true,
        placeholder: ['开始日期', '结束日期'],
        separator: '至',
        clearable: true,
      },
    },
    {
      label: '状态',
      field: 'status',
      component: 'Select',
      componentProps: {
        placeholder: '请选择',
        options: [
          { label: '未开始', value: '1' },
          { label: '进行中', value: '2' },
          { label: '已取消', value: '3' },
        ],
      },
      ifShow: () => ['1', '2'].includes(activeKey.value),
      colProps: { span: 6 },
    },
  ];
  const columns = <BasicColumn[]>[
    {
      title: '会议主题',
      dataIndex: 'conferenceTheme',
    },
    {
      title: '会议时间',
      dataIndex: 'startDate',
    },
    {
      title: '会议地点',
      dataIndex: 'location',
    },
    {
      title: '组织者',
      dataIndex: 'userName',
      width: 100,
    },
    {
      title: '参会人数',
      dataIndex: 'attendeeNum',
      width: 110,
    },
    {
      title: '签到状态',
      dataIndex: 'signStatus',
      width: 100,
      ifShow: () => {
        return activeKey.value === '1';
      },
    },
    {
      title: '会议状态',
      dataIndex: 'status',
      width: 100,
      ifShow: () => {
        return activeKey.value === '2';
      },
    },
    {
      title: '实到人数',
      dataIndex: 'signNum',
      width: 100,
      ifShow: () => {
        return activeKey.value === '3';
      },
    },
    {
      title: '签到率',
      dataIndex: 'signRate',
      width: 100,
      ifShow: () => {
        return activeKey.value === '3';
      },
    }
  ];
  const getActions = (record: any) => {
    return [
      {
        label: '查看',
        onClick: onView.bind(null, record),
      },
      {
        label: '签到',
        auth: ['conference:mine:del'],
        ifShow: () => {
          return (
            activeKey.value == '1'
          );
        },
        onClick: onSignIn.bind(null, record),
      },
      {
        label: '编辑',
        ifShow: () => {
          return (
            activeKey.value == '2' && record.status == '未开始'
          );
        },
        auth: ['conference:mine:edit'],
        onClick: onEdit.bind(null, record),
      },
      {
        label: '下载纪要',
        auth: ['conference:mine:del'],
        ifShow: () => {
          return (
            activeKey.value == '3'
          );
        },
        onClick: onDownload.bind(null, record),
      }
    ];
  };

  const orgOptions = ref<any[]>([]);
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
      handleSuccess();
    });
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
        labelWidth: 80,
      },
      defSort: {
        column: 'updateTime',
        order: 'desc',
      },
      beforeFetch: async (params) => {
        if(params.time) {
          let time = params.time.split(',');
          params.startDate = time[0];
          params.endDate = time[1];
        }
        params.type = activeKey.value;
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
    }
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
    detailOpen.openModal(true, {
      title: '会议详情',
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
      title: '取消会议',
      content: '确定要取消会议吗？',
      onOk: () => {
        return new Promise<void>((resolve) => {
          cancel({ id: data.id })
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
  const onDownload = async (record: any) => {
    download({ id: record.id }).then((res) => {
      let fileType = res.headers['content-disposition'];
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.style.display = 'none';
      link.href = url;
      link.setAttribute('download', '会议纪要.'+fileType.split('.')[1]);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link); //下载完成移除元素
      window.URL.revokeObjectURL(url); //释放掉blob对象
    });
  }
  // 签到
  const onSignIn = (data) => {
    let startTime = new Date(data.startDate).getTime() - (data.signStartTime ? data.signStartTime * 60 * 1000 : 0);
    let endTime = new Date(data.endDate).getTime() + (data.signEndTime ? data.signEndTime * 60 * 1000 : 0);
    let now = new Date().getTime();
    if(now >= startTime && now <= endTime) {
      openModal(true, { title: '签到', data });
    } else {
      createMessage.warning('不在签到时间范围内！');
    }
  };
  const batchHandleDelete = () => {
    const isUsername = selectedRows.value.every((item) => item.createBy === userInfo.value.username);
    if (!(userInfo.value.username == 'admin' || (orgCode.value.length >= 9 && orgCode.value.substring(0, 9) === 'A04B01C11') || isUsername)) {
      return createMessage.warning('当前操作人不是安全部或添加人不允许删除！');
    }
    // doRequest(() => deleteBatch({ ids: selectedRowKeys.value.join(',') }));
  };

  const getDropDownAction = (record) => {
    return [
      {
        label: '取消会议',
        auth: ['conference:mine:del'],
        ifShow: () => {
          return (
            activeKey.value == '2'
          );
        },
        onClick: onDel.bind(null, record),
      },
      {
        label: '会议纪要',
        auth: ['conference:mine:del'],
        ifShow: () => {
          return (
            activeKey.value == '2' && record.status != '未开始'
          );
        },
        onClick: onUploadFile.bind(null, record),
      },
      {
        label: '签到码',
        auth: ['conference:mine:del'],
        ifShow: () => {
          return (
            activeKey.value == '2' && record.sign == 1
          );
        },
        onClick: onQrCode.bind(null, record),
      },
    ];
  };
 
  const handleSuccess = async () => {
    reload();
  };

  // 资质状态切换
  const handleTabChange = (value) => {
    activeKey.value = value;
    nextTick(() => {
      reload();
    });
  };
  // 二维码
  const onQrCode = (data) => {
    qrcodeOpen.openModal(true, data);
  };
  // 会议纪要
  const onUploadFile = (data) => {
    openUpFileModal.openModal(true, data)
  };

  return {
    getActions,
    onImportXls,
    registerTable,
    onAdd,
    handleSuccess,
    registerDrawer,
    registerModal,
    activeKey,
    handleTabChange,
    tabsArr,
    controlCount,
    detailRegisterModal,
    registerUploadModal,
    registerAssessment,
    registerQrcode,
    onQrCode,
    rowSelection,
    selectedRows,
    onExportXls,
    selectedRowKeys,
    batchHandleDelete,
    getDropDownAction
  };
};
export default useContent;
