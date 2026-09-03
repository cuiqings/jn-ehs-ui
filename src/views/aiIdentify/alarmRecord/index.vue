<template>
  <basic-table @register="registerTable" :rowSelection="rowSelection">
    <template #tableTitle>
      <a-button type="primary" preIcon="ant-design:export-outlined" @click="onExportXls"> 导出</a-button>
    </template>
    <template #action="{ record }">
      <table-action :actions="getActions(record)" />
    </template>
    <template #jobHandler="{ record }">
      <span v-if="record.jobHandler === '0'">已处理</span>
      <span v-if="record.jobHandler === '1'">未处理</span>
    </template>
    <template #jobAcceptance="{ record }">
      <span v-if="record.jobAcceptance === '0'">已验收</span>
      <span v-if="record.jobAcceptance === '1'">未验收</span>
      <span v-if="record.jobAcceptance === '2'">验收不通过</span>
    </template>
  </basic-table>
  <alarm-modal @register="registerModal" />
</template>
<script setup name="alarm-record" lang="ts">
  import { BasicTable, TableAction } from '/@/components/Table';
  import { useListPage } from '/@/hooks/system/useListPage';
  import { dateFormat } from '/@/utils/common/compUtils';
  import { ref } from 'vue';
  import { list, getOrganizationNew } from './url/index';
  import { getStructureData } from '../../configuration/processProductionLineManage/url/index';
  import alarmModal from './alarmModal.vue';
  import { useModal } from '/@/components/Modal';
  const [registerModal, { openModal }] = useModal();
  const orgOptions: any = ref([]);
  const searchFormSchema: any = [
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
      label: '任务处理',
      field: 'jobHandler',
      component: 'Select',
      componentProps: {
        options: [
          {
            label: '已处理',
            value: '0',
          },
          {
            label: '未处理',
            value: '1',
          },
        ],
        placeholder: '请选择',
      },
      colProps: { span: 6 },
    },
    {
      label: '日期',
      field: 'time',
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
      label: '报警状态',
      field: 'alarmState',
      component: 'Select',
      componentProps: {
        options: [
          {
            label: '报警',
            value: '1',
          },
          {
            label: '已销警',
            value: '0',
          },
        ],
        placeholder: '请选择',
      },
      colProps: { span: 6 },
    },
  ];
  const columns: any = [
    {
      title: '报警名称',
      dataIndex: 'alarmName',
    },
    {
      title: '摄像头名称',
      dataIndex: 'cameraName',
    },
    {
      title: 'AI识别场景',
      dataIndex: 'cameraType',
    },
    {
      title: '所属机构',
      dataIndex: 'orgCode',
    },
    {
      title: '工序',
      dataIndex: 'structure',
    },
    {
      title: '子工序',
      dataIndex: 'structureChild',
    },
    {
      title: '报警时间',
      dataIndex: 'alarmStrTime',
    },
    {
      title: '结束时间',
      dataIndex: 'alarmEndTime',
    },
    {
      title: '持续时间',
      dataIndex: 'duration',
    },
    {
      title: '任务处理',
      align: 'center',
      dataIndex: 'jobHandler',
      slots: { customRender: 'jobHandler' },
    },
    {
      title: '任务验收',
      align: 'center',
      dataIndex: 'jobAcceptance',
      slots: { customRender: 'jobAcceptance' },
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
      beforeFetch: (params) => {
        if (params.time) {
          const time = params.time.split(',');
          params['strTime'] = time[0] + ' 00:00';
          params['endTime'] = time[1] + ' 23:59';
          delete params['time'];
        }
        return params;
      },
      actionColumn: {
        title: '操作',
        width: 100,
        dataIndex: 'action',
        slots: { customRender: 'action' },
        fixed: 'right',
      },
    },
    exportConfig: {
      name: '告警记录-' + dateFormat(new Date(), 'yyyy-MM-dd'),
      url: '/ai/alarmRecord/export',
    },
  });
  const getActions = (record: any) => {
    return [
      {
        label: '查看',
        onClick: onView.bind(null, record),
      },
    ];
  };
  const [registerTable, { reload, getForm }, { rowSelection }] = tableContext;
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
  const onView = (data) => {
    openModal(true, {
      id: data.id,
    });
  };
</script>
<style lang="less" scoped></style>
