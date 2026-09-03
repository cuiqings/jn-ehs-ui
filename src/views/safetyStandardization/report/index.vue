<template>
  <div>
    <basic-table @register="registerTable" :rowSelection="rowSelection">
      <template #tableTitle>
        <a-button preIcon="ant-design:plus-outlined" type="primary" v-auth="'safetyStandardization-report:add'" @click="handleAdd">新增</a-button>
        <a-button
          preIcon="ant-design:delete-outlined"
          v-auth="'safetyStandardization-report:del'"
          v-if="selectedRowKeys.length > 0"
          @click="batchHandleDelete"
        >
          批量删除</a-button
        >
      </template>
      <template #action="{ record }">
        <table-action :actions="getActions(record)" />
      </template>
      <template #evaluateFile="{ record }">
        <span style="color: #0091ff; cursor: pointer" @click="handlePreview(record)">{{ getTrimmedFileName(record.evaluateFile) }}</span>
      </template>
    </basic-table>
    <AddModal @register="registerModal" @success="handleSuccess" />
  </div>
</template>
<script setup name="safetyStandardization-report" lang="ts">
  import { ref, onMounted } from 'vue';
  import { BasicTable, TableAction } from '/@/components/Table';
  import { useListPage } from '/@/hooks/system/useListPage';
  import { BasicColumn, FormSchema } from '/@/components/Table';
  import { list, del, deleteBatch } from './api';
  import { getDepart3ListWithSecurity } from '/@/api/common/api';
  import { downloadFile } from '/@/utils/common/renderUtils';
  import { previewFile } from '/@/api/common/api';
  import AddModal from './addModal.vue';
  import { useModal } from '/@/components/Modal';
  const orgOptions: any = ref([]);
  const [registerModal, { openModal }] = useModal();
  const searchFormSchema: FormSchema[] = [
    {
      label: '自评/评审单位',
      field: 'orgCode',
      component: 'Select',
      componentProps: {
        options: [],
      },
      colProps: { span: 6 },
    },
    {
      label: '评审时间',
      field: 'time',
      component: 'RangeDate',
      componentProps: {
        valueFormat: 'YYYY-MM-DD',
        style: {
          width: '100%',
        },
      },
      colProps: { span: 6 },
    },
  ];
  const columns: BasicColumn[] = [
    {
      title: '自评/评审单位',
      align: 'center',
      dataIndex: 'orgName',
    },
    {
      title: '评审时间',
      align: 'center',
      dataIndex: 'evaluateTime',
    },
    {
      title: '评审报告',
      align: 'center',
      dataIndex: 'evaluateFile',
      slots: { customRender: 'evaluateFile' },
    },
    {
      title: '创建时间',
      align: 'center',
      dataIndex: 'createTime',
    },
  ];
  const handleSuccess = () => {
    (selectedRowKeys.value = []) && reload();
  };
  // 列表页面公共参数、方法
  const { tableContext, operateRequest } = useListPage({
    designScope: 'equipmentManage-ledger-list',
    tableProps: {
      api: list,
      columns: columns,
      formConfig: {
        schemas: searchFormSchema,
        labelWidth: 120,
      },
      showIndexColumn: true,
      rowSelection: {
        fixed: 'left',
      },
      immediate: false,
      beforeFetch: (params) => {
        if (params.time) {
          const time = params.time.split(',');
          params['evaluateTimeStart'] = time[0];
          params['evaluateTimeEnd'] = time[1];
          delete params['time'];
        }
        if (orgOptions.value.length === 1) {
          params.orgCode = orgOptions.value[0].value;
          getForm().setFieldsValue({
            orgCode: orgOptions.value[0].value,
          });
        }
        return params;
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
  const [registerTable, { reload, getForm }, { rowSelection, selectedRowKeys }] = tableContext;
  onMounted(() => {
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
          disabled: orgOptions.value.length === 1,
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
      reload();
    });
  });
  const getActions = (record: any) => {
    return [
      {
        label: '查看',
        onClick: handleView.bind(null, record),
      },
      {
        label: '下载',
        auth: ['safetyStandardization-report:download'],
        onClick: handleDownload.bind(null, record),
      },
      {
        label: '删除',
        auth: ['safetyStandardization-report:del'],
        onClick: handleDelete.bind(null, record),
      },
    ];
  };
  const handleAdd = () => {
    openModal(true, {
      title: '新增',
      showOkBtn: true,
      type: 'add',
    });
  };
  const handleView = (data: any) => {
    openModal(true, {
      title: '查看',
      data,
      showOkBtn: false,
    });
  };
  const handleDownload = (data: any) => {
    downloadFile(data.evaluateFile);
  };
  // 批量删除
  const batchHandleDelete = () => {
    operateRequest(
      () => deleteBatch({ ids: selectedRowKeys.value.join(',') }),
      {
        confirm: true,
        isBatch: true,
      },
      handleSuccess
    );
  };
  const handleDelete = (data: any) => {
    operateRequest(
      () => del({ id: data.id }),
      {
        confirm: true,
        isBatch: false,
      },
      handleSuccess
    );
  };
  const handlePreview = (data: any) => {
    previewFile(data.evaluateFile).then((res) => {
      window.open(res, '_blank');
    });
  };
  // 使用 Map 缓存已处理的文件名，避免重复计算
  const fileNameCache = new Map<string, string>();
  const getTrimmedFileName = (fileName: string) => {
    if (!fileName) return '';
    // 检查缓存
    if (fileNameCache.has(fileName)) {
      return fileNameCache.get(fileName)!;
    }
    // 处理文件名
    const list = fileName.split(',');
    let result = '';
    for (const item of list) {
      // 删除第一个 / 及其前面的内容
      const slashIndex = item.indexOf('/');
      let processedItem = item;
      if (slashIndex !== -1) {
        processedItem = item.substring(slashIndex + 1);
      }
      const index = processedItem.lastIndexOf('_');
      const pointIndex = processedItem.lastIndexOf('.');
      if (index !== -1) {
        result += processedItem.substring(0, index) + '.' + processedItem.substring(pointIndex + 1) + ',';
      }
    }
    const trimmedName = result.slice(0, -1);
    // 缓存结果
    fileNameCache.set(fileName, trimmedName);
    return trimmedName;
  };
</script>
<style lang="less" scoped></style>
