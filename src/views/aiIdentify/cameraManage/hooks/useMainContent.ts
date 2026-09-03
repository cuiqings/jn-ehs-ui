import { createVNode, ref } from 'vue';
import { QuestionCircleOutlined } from '@ant-design/icons-vue';
import { useListPage } from '/@/hooks/system/useListPage';
import { BasicColumn, FormSchema } from '/@/components/Table';
import { useMessage } from '/@/hooks/web/useMessage';
import { list, del, getOrganizationNew, batchDel, updateState } from '../url/index';
import { getStructureData } from '../../../configuration/processProductionLineManage/url/index';
import { dateFormat } from '/@/utils/common/compUtils';
import { useDrawer } from '/@/components/Drawer';
export const useMainContent = () => {
  const [registerDrawer, { openDrawer }] = useDrawer();
  const { createConfirm } = useMessage();
  const orgOptions: any = ref([]);
  const searchFormSchema = <FormSchema[]>[
    {
      label: '摄像头名称',
      field: 'cameraName',
      component: 'Input',
      colProps: { span: 6 },
    },
    {
      label: '所属机构',
      field: 'orgCode',
      component: 'Select',
      componentProps: () => {
        return {
          options: [],
          placeholder: '请选择',
        };
      },
      colProps: { span: 6 },
    },
    {
      label: '工序',
      field: 'structureId',
      component: 'Select',
      componentProps: () => {
        return {
          options: [],
          placeholder: '请选择',
        };
      },
      colProps: { span: 6 },
    },
    {
      label: '子工序',
      field: 'structureChildId',
      component: 'Select',
      componentProps: {
        options: [],
        placeholder: '请选择',
      },
      colProps: { span: 6 },
    },
    {
      label: '监控位置',
      field: 'monitorLocation',
      component: 'Input',
      colProps: { span: 6 },
    },
    {
      label: 'IP',
      field: 'cameraIp',
      component: 'Input',
      colProps: { span: 6 },
    },
    {
      label: 'AI识别场景',
      field: 'cameraType',
      component: 'JDictSelectTag',
      componentProps: {
        dictCode: 'ai_camera_type',
        placeholder: '请选择',
        stringToNumber: false,
        showChooseOption: false,
      },
      colProps: { span: 6 },
    },
  ];
  const columns = <BasicColumn[]>[
    {
      title: '摄像头名称',
      dataIndex: 'cameraName',
    },
    {
      title: '所属机构',
      dataIndex: 'orgCodeName',
    },
    {
      title: '工序',
      dataIndex: 'structureName',
    },
    {
      title: '子工序',
      dataIndex: 'structureChildName',
    },
    {
      title: '监控位置',
      dataIndex: 'monitorLocation',
    },
    {
      title: 'IP',
      dataIndex: 'cameraIp',
    },
    {
      title: 'AI识别场景',
      dataIndex: 'cameraType',
    },
    {
      title: '报警状态',
      align: 'center',
      dataIndex: 'alarmState',
      slots: { customRender: 'alarmState' },
    },
  ];
  // 列表页面公共参数、方法
  const { tableContext, onExportXls } = useListPage({
    designScope: 'cameraManage-list',
    tableProps: {
      api: list,
      columns: columns,
      formConfig: {
        schemas: searchFormSchema,
        resetFunc: () => {
          getForm().updateSchema({
            field: 'structureChildId',
            componentProps: {
              options: [],
              placeholder: '请选择',
            },
          });
          if (orgOptions.value.length !== 1) {
            getForm().updateSchema({
              field: 'structureId',
              componentProps: () => {
                return {
                  options: [],
                  placeholder: '请选择',
                };
              },
            });
          }
        },
      },
      showIndexColumn: true,
      immediate: false,
      defSort: {
        column: 'updateTime',
        order: 'desc',
      },
      handleSearchInfoFn: (params) => {
        if (orgOptions.value.length === 1) {
          params.orgCode = orgOptions.value[0].value;
          getForm().setFieldsValue({
            orgCode: orgOptions.value[0].value,
          });
        }
        return params;
      },
      actionColumn: {
        title: '操作',
        width: 250,
        dataIndex: 'action',
        slots: { customRender: 'action' },
        fixed: 'right',
      },
    },
    exportConfig: {
      name: '摄像头管理-' + dateFormat(new Date(), 'yyyy-MM-dd'),
      url: '/ai/cameraManage/export',
    },
  });
  const getActions = (record: any) => {
    return [
      {
        label: '查看',
        onClick: onView.bind(null, record),
      },
      {
        label: '编辑',
        auth: ['cameraManage:edit'],
        onClick: onEdit.bind(null, record),
      },
      {
        label: '停用报警',
        auth: ['cameraManage:deactivate'],
        ifShow: record.alarmState === '0',
        onClick: onDeactivate.bind(null, record),
      },
      {
        label: '启用报警',
        auth: ['cameraManage:enable'],
        ifShow: record.alarmState === '1',
        onClick: onEnable.bind(null, record),
      },
      {
        label: '删除',
        auth: ['cameraManage:del'],
        onClick: handleDelete.bind(null, record),
      },
    ];
  };
  const [registerTable, { reload, getForm }, { rowSelection, selectedRowKeys }] = tableContext;
  const init = () => {
    getOrganizationNew().then((res) => {
      orgOptions.value = res.map((item) => {
        return {
          label: item.departName,
          value: item.orgCode,
        };
      });
      getForm().updateSchema({
        field: 'orgCode',
        componentProps: {
          options: orgOptions,
          placeholder: '请选择',
          disabled: orgOptions.value.length === 1,
          onChange: (value) => {
            getForm().setFieldsValue({
              structureId: undefined,
              structureChildId: undefined,
            });
            getForm().updateSchema({
              field: 'structureId',
              componentProps: () => {
                return {
                  options: [],
                  placeholder: '请选择',
                };
              },
            });
            getForm().updateSchema({
              field: 'structureChildId',
              componentProps: {
                options: [],
                placeholder: '请选择',
              },
            });
            if (value) {
              getStructureData({ id: '0', orgCode: value }).then((res) => {
                const data = res.map((item) => {
                  return {
                    label: item.name,
                    value: item.id,
                  };
                });
                getForm().updateSchema({
                  field: 'structureId',
                  componentProps: ({ formModel }) => {
                    return {
                      options: data,
                      placeholder: '请选择',
                      onChange: (value) => {
                        formModel.structureChildId = undefined;
                        getForm().updateSchema({
                          field: 'structureChildId',
                          componentProps: {
                            options: [],
                            placeholder: '请选择',
                          },
                        });
                        if (value) {
                          getStructureData({ id: value, orgCode: formModel.orgCode }).then((res) => {
                            const data = res.map((item) => {
                              return {
                                label: item.name,
                                value: item.id,
                              };
                            });
                            getForm().updateSchema({
                              field: 'structureChildId',
                              componentProps: {
                                options: data,
                                placeholder: '请选择',
                              },
                            });
                          });
                        }
                      },
                    };
                  },
                });
              });
            }
          },
        },
      });
      if (orgOptions.value.length === 1) {
        getForm().setFieldsValue({
          orgCode: orgOptions.value[0]?.value,
        });
        getStructureData({ id: '0', orgCode: orgOptions.value[0].value }).then((res) => {
          const data = res.map((item) => {
            return {
              label: item.name,
              value: item.id,
            };
          });
          getForm().updateSchema({
            field: 'structureId',
            componentProps: ({ formModel }) => {
              return {
                options: data,
                placeholder: '请选择',
                onChange: (value) => {
                  formModel.structureChildId = undefined;
                  getForm().updateSchema({
                    field: 'structureChildId',
                    componentProps: {
                      options: [],
                      placeholder: '请选择',
                    },
                  });
                  if (value) {
                    getStructureData({ id: value, orgCode: formModel.orgCode }).then((res) => {
                      const data = res.map((item) => {
                        return {
                          label: item.name,
                          value: item.id,
                        };
                      });
                      getForm().updateSchema({
                        field: 'structureChildId',
                        componentProps: {
                          options: data,
                          placeholder: '请选择',
                        },
                      });
                    });
                  }
                },
              };
            },
          });
        });
      }
      reload();
    });
  };
  init();
  // 单个删除
  const handleDelete = (record: any) => {
    createConfirm({
      iconType: 'warning',
      icon: createVNode(QuestionCircleOutlined),
      title: '删除',
      content: '确定要删除吗？',
      onOk: () => {
        return new Promise<void>((resolve, reject) => {
          del(record.id)
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
  // 批量删除
  const batchHandleDelete = () => {
    createConfirm({
      iconType: 'warning',
      icon: createVNode(QuestionCircleOutlined),
      title: '批量删除',
      content: '是否批量删除所选项？删除后对应报警配置将同步删除？',
      onOk: () => {
        return new Promise<void>((resolve, reject) => {
          batchDel({ ids: selectedRowKeys.value })
            .then((res) => {
              if (res) {
                handleSuccess();
                resolve();
              } else {
                reject(new Error('批量删除失败！'));
              }
            })
            .catch(() => {
              resolve();
            });
        });
      },
    });
  };
  // 新增
  const accidentReport = () => {
    openDrawer(true, {
      type: 'add',
      showOkBtn: true,
      showFooter: true,
      title: '新增',
    });
  };
  // 查看
  const onView = (data: any) => {
    openDrawer(true, {
      title: '查看',
      type: 'view',
      showOkBtn: false,
      showFooter: true,
      data,
    });
  };
  // 编辑
  const onEdit = (data: any) => {
    openDrawer(true, {
      type: 'edit',
      showOkBtn: true,
      showFooter: true,
      title: '编辑',
      data,
    });
  };
  // 停用
  const onDeactivate = (data: any) => {
    createConfirm({
      iconType: 'warning',
      icon: createVNode(QuestionCircleOutlined),
      title: '停用',
      content: '确认停用该设备的报警？',
      onOk: () => {
        return new Promise<void>((resolve, reject) => {
          updateState({ id: data.id, state: 1 })
            .then((res) => {
              if (res) {
                handleSuccess();
                resolve();
              } else {
                reject(new Error('停用失败！'));
              }
            })
            .catch(() => {
              resolve();
            });
        });
      },
    });
  };
  // 启用
  const onEnable = (data: any) => {
    createConfirm({
      iconType: 'warning',
      icon: createVNode(QuestionCircleOutlined),
      title: '启用',
      content: '确认启用该设备的报警？',
      onOk: () => {
        return new Promise<void>((resolve, reject) => {
          updateState({ id: data.id, state: 0 })
            .then((res) => {
              if (res) {
                handleSuccess();
                resolve();
              } else {
                reject(new Error('启用失败！'));
              }
            })
            .catch(() => {
              resolve();
            });
        });
      },
    });
  };
  const handleSuccess = () => {
    reload();
  };
  return {
    registerTable,
    selectedRowKeys,
    batchHandleDelete,
    getActions,
    rowSelection,
    accidentReport,
    handleSuccess,
    onExportXls,
    registerDrawer,
  };
};
export default useMainContent;
