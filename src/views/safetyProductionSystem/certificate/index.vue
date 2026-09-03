<template>
  <div>
    <div class="certificate-total">
      <div>
        <div class="flex-align_center">
          <div class="flex-align_center border-right">
            <div>
              <div>{{ controlCount.zc }}</div>
              <div>正常</div>
            </div>
            <div>
              <div style="color: rgb(219, 173, 111)">{{ controlCount.jjdq }}</div>
              <div style="color: rgb(219, 173, 111)">即将到期</div>
            </div>
            <div>
              <div style="color: rgb(200, 0, 22)">{{ controlCount.cqws }}</div>
              <div style="color: rgb(200, 0, 22)">超期未审</div>
            </div>
          </div>
          <div class="flex-align_center">
            <div>
              <div>{{ controlCount.dgzy }}</div>
              <div>电工作业</div>
            </div>
            <div>
              <div>{{ controlCount.gczy }}</div>
              <div>高处作业</div>
            </div>
            <div>
              <div>{{ controlCount.jlryqczy }}</div>
              <div>焊接与热切割作业</div>
            </div>
            <div>
              <div>{{ controlCount.yjysscaqzy }}</div>
              <div>冶金（有色）生产安全作业</div>
            </div>
            <div>
              <div>{{ controlCount.qczjzy }}</div>
              <div>起重机作业</div>
            </div>
            <div>
              <div>{{ controlCount.qpzy }}</div>
              <div>气瓶作业</div>
            </div>
            <div>
              <div>{{ controlCount.cnzyjdc }}</div>
              <div>场（厂）内专用机动车辆</div>
            </div>
            <div>
              <div>{{ controlCount.tzsbgwj }}</div>
              <div>特种设备安全管理</div>
            </div>
            <div>
              <div>{{ controlCount.zgz }}</div>
              <div>资格证</div>
            </div>
            <div>
              <div style="color: rgb(219, 173, 111)">{{ controlCount.djcqz }}</div>
              <div style="color: rgb(219, 173, 111)">待检查签字</div>
            </div>
            <div>
              <div style="color: rgb(219, 173, 111)">{{ controlCount.dqrqz }}</div>
              <div style="color: rgb(219, 173, 111)">待确认签字</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <BasicTable @register="registerTable" :rowSelection="rowSelection">
      <template #tableTitle>
        <a-button preIcon="ant-design:plus-outlined" type="primary" v-auth="'staffCertifications:add'" @click="handleAdd">新增 </a-button>
        <j-upload-button type="primary" preIcon="ant-design:import-outlined" v-auth="'staffCertifications:import'" @click="onImportXls">
          导入
        </j-upload-button>
        <a-button preIcon="ant-design:export-outlined" type="primary" v-auth="'staffCertifications:export'" @click="onExportXls"> 导出</a-button>
        <a-button type="primary" preIcon="ant-design:export-outlined" v-auth="'staffCertifications:template'" @click="onExportTemplateXls">
          导入模版下载
        </a-button>
        <a-button
          preIcon="ant-design:delete-outlined"
          v-if="selectedRowKeys.length > 0"
          v-auth="'staffCertifications:del'"
          @click="batchHandleDelete"
        >
          批量删除
        </a-button>
        <a-button
          type="primary"
          v-if="selectedRowKeys.length > 0 && isCheckSignature"
          v-auth="'staffCertifications:del'"
          @click="handleSignature([], '批量检查签字')"
        >
          批量检查签字
        </a-button>
        <a-button
          type="primary"
          v-if="selectedRowKeys.length > 0 && isConfirmSignature"
          v-auth="'staffCertifications:del'"
          @click="handleSignature([], '批量确认签字')"
        >
          批量确认签字
        </a-button>
      </template>
      <template #remindStatus="{ text, record }">
        <a-switch v-if="text === '1'" :checked="true" @click="handleRemind('0', record)" />
        <a-switch v-else :checked="false" @click="handleRemind('1', record)" />
      </template>
      <template #action="{ record }">
        <TableAction :actions="getActions(record)" />
      </template>
    </BasicTable>
    <certificate-drawer @register="registerDrawer" @success="onSuccess" />
    <RecheckModal @register="recheckModal" @success="onSuccess" />
    <SignatureModal @register="signatureModal" @success="onSuccess" />
  </div>
</template>
<script lang="ts" name="safetyProductionSystem-certificate" setup>
  import { BasicTable, TableAction } from '/@/components/Table';
  import { useListPage } from '/@/hooks/system/useListPage';
  import { getList, deleteRecord, batchDeleteRecord, importUrl, getDepart3ListWithSecurity, getDeptNew, remind, statistics } from './certificate.api';
  import { columns, searchFormSchema } from './certificate.data';
  import { useModal } from '/@/components/Modal';
  import CertificateDrawer from './certificateDrawer.vue';
  import RecheckModal from './recheckModal.vue';
  import SignatureModal from './signatureModal.vue';
  import { useDrawer } from '/@/components/Drawer';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { ref, onMounted, computed } from 'vue';
  import { useMethods } from '/@/hooks/system/useMethods';
  import { dateFormat } from '/@/utils/common/compUtils';
  const { createConfirm, createMessage } = useMessage();
  const [recheckModal, { openModal }] = useModal();
  const [signatureModal, signatureOpen] = useModal();
  const [registerDrawer, { openDrawer }] = useDrawer();
  const orgOptions: any = ref([]);
  const departOptions: any = ref([]);
  const controlCount: any = ref({
    zc: 0,
    jjdq: 0,
    cqws: 0,
    dgzy: 0,
    gczy: 0,
    jlryqczy: 0,
    glzy: 0,
    qczjzy: 0,
    dtzy: 0,
    qpzy: 0,
    cnzyjdc: 0,
    ylqjzy: 0,
    tzsbgwj: 0,
    zgz: 0,
    djcqz: 0,
    dqrqz: 0,
    yjysscaqzy: 0,
  });
  const { tableContext, onImportXls, operateRequest, onExportXls } = useListPage({
    designScope: 'periodic-template',
    tableProps: {
      title: '人员资质证书',
      api: getList,
      columns: columns,
      formConfig: {
        schemas: searchFormSchema,
        resetFunc: () => {
          if (orgOptions.value.length !== 1) {
            getForm().updateSchema({
              field: 'departCode',
              componentProps: {
                options: [],
              },
            });
          }
        },
      },
      beforeFetch: (params) => {
        if (params.time) {
          const time = params.time.split(',');
          params['issueStartDate'] = time[0] + ' 00:00:00';
          params['issueEndDate'] = time[1] + ' 23:59:59';
          delete params['time'];
        }
        if (orgOptions.value.length === 1) {
          params.organizationCode = orgOptions.value[0].value;
          getForm().setFieldsValue({
            organizationCode: orgOptions.value[0].value,
          });
        }
        return params;
      },
      immediate: false,
      showIndexColumn: true,
      actionColumn: {
        width: 300,
        title: '操作',
        dataIndex: 'action',
        slots: { customRender: 'action' },
        fixed: 'right',
      },
    },
    exportConfig: {
      name: '人员资质证书-' + dateFormat(new Date(), 'yyyy-MM-dd'),
      url: '/jnStaffCertifications/export',
      suffix: 'xlsx',
    },
    importConfig: {
      url: importUrl,
      success: () => reload(),
    },
  });
  const [registerTable, { reload, getForm }, { rowSelection, selectedRowKeys, selectedRows }] = tableContext;
  const init = () => {
    getDepart3ListWithSecurity().then(async (res) => {
      orgOptions.value = res.map((item: any) => {
        return {
          label: item.departName,
          value: item.orgCode,
        };
      });
      getForm().updateSchema({
        field: 'organizationCode',
        componentProps: {
          options: orgOptions.value,
          disabled: orgOptions.value.length === 1,
          showSearch: true,
          filterOption: (input: string, option: any) => {
            return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
          },
          onChange: (e: any) => {
            getForm().setFieldsValue({
              departCode: undefined,
            });
            getForm().updateSchema({
              field: 'departCode',
              componentProps: {
                options: [],
              },
            });
            if (e) {
              getDepartList(e);
            }
          },
        },
      });
      if (orgOptions.value.length === 1) {
        getForm().setFieldsValue({
          organizationCode: orgOptions.value[0]?.value,
        });
        getDepartList(orgOptions.value[0]?.value);
      }
      reload();
    });
  };
  // 查询顶部统计
  const initStatistics = () => {
    statistics().then((res) => {
      controlCount.value = res;
    });
  };
  onMounted(() => {
    init();
    initStatistics();
  });
  const getDepartList = (orgCode) => {
    departOptions.value = [];
    getDeptNew({ orgCode }).then(async (res) => {
      departOptions.value = res.map((item: any) => {
        return {
          label: item.departName,
          value: item.orgCode,
        };
      });
      departOptions.value.unshift({
        label: '无',
        value: 'none',
      });
      getForm().updateSchema({
        field: 'departCode',
        componentProps: {
          options: departOptions.value,
          showSearch: true,
          filterOption: (input: string, option: any) => {
            return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
          },
        },
      });
    });
  };
  // 新增
  function handleAdd() {
    openDrawer(true, {
      showOkBtn: true,
      showFooter: true,
      title: '新增', // 新增
      type: 'add',
    });
  }
  // 操作列
  function getActions(record) {
    return [
      {
        label: '查看',
        onClick: handleDetail.bind(null, record),
        auth: 'staffCertifications:view',
      },
      {
        label: '编辑',
        onClick: handleEdit.bind(null, record),
        auth: 'staffCertifications:edit',
      },
      {
        label: '删除',
        onClick: handleDelete.bind(null, record),
        auth: 'staffCertifications:del',
      },
      {
        label: '复审',
        ifShow: record.whetherReview === '1',
        auth: 'staffCertifications:reexamine',
        onClick: handleRecheck.bind(null, record),
      },
      {
        label: '检查签字',
        onClick: handleSignature.bind(null, record, '检查签字'),
        ifShow: !record.checkSignImg && record.certificationsType === '1',
        auth: 'staffCertifications:checkSignature',
      },
      {
        label: '确认签字',
        onClick: handleSignature.bind(null, record, '确认签字'),
        ifShow: record.checkSignImg != null && !record.confirmSignImg && record.certificationsType === '1',
        auth: 'staffCertifications:confirmSignature',
      },
    ];
  }
  // 查看
  function handleDetail(record) {
    openDrawer(true, {
      showOkBtn: false,
      showFooter: true,
      record: record,
      title: '查看', // 查看
      type: 'view',
    });
  }
  // 编辑
  function handleEdit(record) {
    openDrawer(true, {
      record,
      showOkBtn: true,
      showFooter: true,
      title: '编辑', // 编辑
      type: 'edit',
    });
  }
  // 删除
  function handleDelete(record) {
    operateRequest(() => deleteRecord({ id: record.id }), {
      confirm: true,
      isBatch: false,
    });
  }
  // 复审
  function handleRecheck(record) {
    openModal(true, { record });
  }
  // 批量删除
  function batchHandleDelete() {
    operateRequest(() => batchDeleteRecord({ ids: selectedRowKeys.value }), {
      confirm: true,
      isBatch: true,
    });
  }
  // 到期提醒变换
  const handleRemind = (type, record) => {
    createConfirm({
      iconType: 'warning',
      title: '到期提醒',
      content: '是否确认开启/关闭到期提醒？',
      onOk: () => {
        remind({
          id: record.id,
          remindStatus: type,
        }).then(() => {
          onSuccess();
        });
      },
    });
  };
  //导入模版下载
  const onExportTemplateXls = () => {
    const { handleExportXlsx } = useMethods();
    handleExportXlsx('人员资质证书模版', '/jnStaffCertifications/downloadTemplate');
  };
  const onSuccess = () => {
    reload();
    initStatistics();
    selectedRowKeys.value = [];
  };
  const isCheckSignature = computed(() => {
    return selectedRows.value.every((item) => item.certificationsType === '1' && !item.checkSignImg);
  });
  const isConfirmSignature = computed(() => {
    return selectedRows.value.every((item) => item.certificationsType === '1' && item.checkSignImg != null && !item.confirmSignImg);
  });
  const handleSignature = (record, title) => {
    if (Array.isArray(record)) {
      if (selectedRows.value.some((item) => !item.filePath || item.filePath === '')) {
        return createMessage.info('请完善必填信息再签字！');
      }
      const ids = selectedRowKeys.value.join(',');
      signatureOpen.openModal(true, { ids, title });
    } else {
      if (!record.filePath || record.filePath === '') {
        return createMessage.info('请完善必填信息再签字！');
      }
      signatureOpen.openModal(true, { record, title });
    }
  };
</script>

<style lang="less" scoped>
  .orange {
    color: orange;
  }

  .red {
    color: red;
  }
  .certificate-total {
    padding: 15px 0;
    margin: 10px 10px 0;
    background: #fff;
    & > div {
      margin: 0 10px;
      padding: 15px 0;
      border-radius: 8px;
      background-color: rgb(238, 248, 254);
      .flex-align_center {
        display: flex;
        align-items: center;
        & > div {
          padding: 0 16px;
          div {
            text-align: center;
          }
          & > div {
            & > div:nth-child(1) {
              font-size: 20px;
              font-weight: bold;
            }
          }
        }
        .border-right {
          border-right: 1px solid #eee;
        }
      }
    }
  }
</style>
