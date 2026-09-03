import { createVNode, ref } from 'vue';
import { QuestionCircleOutlined } from '@ant-design/icons-vue';
import { useListPage } from '/@/hooks/system/useListPage';
import { BasicColumn, FormSchema } from '/@/components/Table';
import { useMessage } from '/@/hooks/web/useMessage';
import { list, del, getOrganizationNew, batchDel, updateState } from '../url/index';
import { getStructureData } from '../../../configuration/processProductionLineManage/url/index';
import { useModal } from '/@/components/Modal';
import { dateFormat } from '/@/utils/common/compUtils';
export const useMainContent = () => {
  const [registerModal, { openModal }] = useModal();
  const { createConfirm } = useMessage();
  const orgOptions: any = ref([]);
  const searchFormSchema = <FormSchema[]>[
    {
      label: '报警名称',
      field: 'alarmName',
      component: 'Input',
      colProps: { span: 6 },
    },
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
      title: '报警名称',
      dataIndex: 'alarmName',
    },
    {
      title: '摄像头名称',
      dataIndex: 'cameraName',
    },
    {
      title: '所属机构',
      dataIndex: 'orgCode',
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
      title: 'AI识别场景',
      dataIndex: 'cameraType',
    },
    {
      title: '报警通知角色',
      dataIndex: 'notice',
    },
    {
      title: '任务处理角色',
      dataIndex: 'jobHandleName',
    },
    {
      title: '状态',
      align: 'center',
      dataIndex: 'enable',
      slots: { customRender: 'enable' },
    },
  ];
  // 列表页面公共参数、方法
  const { tableContext, doRequest, onExportXls } = useListPage({
    designScope: 'incidentExpress-list',
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
        width: 240,
        dataIndex: 'action',
        slots: { customRender: 'action' },
        fixed: 'right',
      },
    },
    exportConfig: {
      name: '告警配制-' + dateFormat(new Date(), 'yyyy-MM-dd'),
      url: '/ai/alarmConfig/export',
      suffix: 'xlsx',
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
        auth: ['alarmConfig:edit'],
        onClick: onEdit.bind(null, record),
      },
      {
        label: '停用',
        auth: ['alarmConfig:deactivate'],
        ifShow: record.enable === '0',
        onClick: onDeactivate.bind(null, record),
      },
      {
        label: '启用',
        auth: ['alarmConfig:enable'],
        ifShow: record.enable === '1',
        onClick: onEnable.bind(null, record),
      },
      {
        label: '删除',
        auth: ['alarmConfig:del'],
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
          del({ id: record.id })
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
    doRequest(() => {
      return new Promise<void>((resolve, reject) => {
        batchDel({ ids: selectedRowKeys.value })
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
    });
  };
  // 停用
  const onDeactivate = (data: any) => {
    createConfirm({
      iconType: 'warning',
      icon: createVNode(QuestionCircleOutlined),
      title: '停用',
      content: '确认停用该报警？',
      onOk: () => {
        return new Promise<void>((resolve, reject) => {
          updateState({ id: data.id, state: '1' })
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
      content: '确认启用该报警？',
      onOk: () => {
        return new Promise<void>((resolve, reject) => {
          updateState({ id: data.id, state: '0' })
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
  // 新增
  const accidentReport = () => {
    openModal(true, {
      title: '新增',
      type: 'add',
    });
  };
  // 查看
  const onView = (data: any) => {
    openModal(true, {
      title: '查看',
      type: 'view',
      data: data,
    });
  };
  // 编辑
  const onEdit = (data: any) => {
    openModal(true, {
      title: '编辑',
      type: 'edit',
      data: data,
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
    registerModal,
    onExportXls,
  };
};
export default useMainContent;
