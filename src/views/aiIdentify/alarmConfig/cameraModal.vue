<template>
  <basic-modal v-bind="$attrs" @register="registerModal" wrapClassName="camera-modal" :width="1300" title="选择摄像头" @ok="onSubmit" destroyOnClose>
    <basic-table @register="registerTable" :row-selection="rowSelection" />
  </basic-modal>
</template>
<script lang="ts" name="personnel" setup>
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicTable } from '/@/components/Table';
  import { useListPage } from '/@/hooks/system/useListPage';
  import { list, getOrganizationNew } from '../cameraManage/url/index';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { ref } from 'vue';
  const emits = defineEmits(['camera-data']);
  const { createMessage } = useMessage();
  const searchFormSchema: any = [
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
      componentProps: {
        options: [],
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
  const columns: any = [
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
      title: 'AI识别场景',
      dataIndex: 'cameraType',
    },
  ];
  const orgOptions: any = ref([]);
  // 列表页面公共参数、方法
  const { tableContext } = useListPage({
    tableProps: {
      api: list,
      columns,
      defSort: {
        column: 'updateTime',
        order: 'desc',
      },
      // showHeader: false,
      immediate: false,
      formConfig: {
        schemas: searchFormSchema,
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
      rowSelection: {
        type: 'radio',
      },
      showActionColumn: false,
    },
  });
  const [registerTable, { reload, getForm }, { rowSelection, selectedRowKeys, selectedRows }] = tableContext;
  const [registerModal, { closeModal }] = useModalInner(({ cameraId }) => {
    getOrganizationNew().then(async (res) => {
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
        },
      });
      if (orgOptions.value.length === 1) {
        getForm().setFieldsValue({
          orgCode: orgOptions.value[0]?.value,
        });
      }
      await reload();
      if (cameraId) {
        selectedRowKeys.value = [cameraId];
      } else {
        selectedRowKeys.value = [];
      }
    });
  });
  const onSubmit = () => {
    if (selectedRowKeys.value.length <= 0) {
      return createMessage.info('请选择摄像头！');
    }
    emits('camera-data', selectedRows);
    closeModal();
  };
</script>
<style lang="less" scoped>
  /deep/.ant-table-title {
    display: none;
  }
</style>
<style>
  .camera-modal {
    z-index: 9999;
    .ant-modal-body {
      min-height: 360px;
      .jeecg-modal-wrapper {
        height: 360px;
      }
    }
  }
</style>
