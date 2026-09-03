<template>
  <basic-modal v-bind="$attrs" @register="registerModal" :width="1600" :footer="null" title="获得证书人员列表" destroyOnClose>
    <basic-table @register="registerTable">
      <template #uniqueCode="{ record }">
        <span style="cursor: pointer; color: #1890ff">{{ record.uniqueCode }}</span>
      </template>
      <template #status="{ record }">
        <a-tag :color="record.status === '1' ? 'green' : record.status === '2' ? 'orange' : record.status === '3' ? 'red' : ''">
          {{ record.status === '1' ? '正常' : record.status === '2' ? '过期' : record.status === '3' ? '撤销' : '' }}
        </a-tag>
      </template>
      <template #action="{ record }">
        <table-action :actions="getActions(record)" />
      </template>
    </basic-table>
  </basic-modal>
  <cancel-modal @register="registerCancelModal" @submit="handleSubmit" />
</template>
<script lang="ts" name="user-modal" setup>
  import { useListPage } from '/@/hooks/system/useListPage';
  import { BasicTable, TableAction } from '/@/components/Table';
  import { BasicModal, useModalInner, useModal } from '/@/components/Modal';
  import { pageList, revocation } from './url/index';
  import { getPopupContainer } from '/@/utils';
  import cancelModal from './cancelModal.vue';
  import { ref } from 'vue';
  import { selectDeptNew, getDepart3List } from '/@/api/common/api';
  const emit = defineEmits(['success']);
  const [registerCancelModal, { openModal }] = useModal();
  const id = ref('');
  const orgOptions = ref([]);
  const departOptions = ref([]);
  const searchFormSchema: any = [
    {
      label: '人员姓名',
      field: 'userName',
      component: 'Input',
      colProps: { span: 6 },
    },
    {
      label: '颁布时间',
      field: 'time',
      component: 'RangePicker',
      componentProps: {
        valueFormat: 'YYYY-MM-DD',
        getPopupContainer: () => getPopupContainer(),
      },
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
        getPopupContainer: () => getPopupContainer(),
      },
      colProps: { span: 6 },
    },
    {
      label: '所属车间',
      field: 'workshop',
      component: 'Select',
      componentProps: {
        options: [],
        showSearch: true,
        filterOption: (input: string, option: any) => {
          return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
        },
        getPopupContainer: () => getPopupContainer(),
      },
      colProps: { span: 6 },
    },
  ];
  const columns: any = [
    {
      title: '获得人员',
      align: 'center',
      dataIndex: 'userName',
    },
    {
      title: '证书编号',
      align: 'center',
      dataIndex: 'certCode',
    },
    {
      title: '关联培训任务',
      align: 'center',
      dataIndex: 'taskName',
    },
    {
      title: '颁布时间',
      align: 'center',
      dataIndex: 'createTime',
    },
    {
      title: '证书有效期',
      align: 'center',
      dataIndex: 'certData',
    },
    {
      title: '证书状态',
      align: 'center',
      dataIndex: 'status',
      slots: { customRender: 'status' },
    },
  ];
  const { tableContext } = useListPage({
    tableProps: {
      api: pageList,
      columns: columns,
      formConfig: {
        schemas: searchFormSchema,
        labelWidth: 120,
      },
      showIndexColumn: true,
      immediate: false,
      beforeFetch: (params) => {
        if (params.time) {
          const time = params.time.split(',');
          params['strTime'] = time[0] + ' 00:00:00';
          params['endTime'] = time[1] + ' 23:59:59';
          delete params['time'];
        }
        params.certId = id.value;
        return params;
      },
      actionColumn: {
        width: 160,
        title: '操作',
        dataIndex: 'action',
        slots: { customRender: 'action' },
        fixed: 'right',
      },
    },
  });
  const [registerTable, { reload, getForm }] = tableContext;
  const [registerModal] = useModalInner(async (data) => {
    id.value = data.id;
    reload();
    init();
  });
  const init = () => {
    getDepart3List().then((res) => {
      orgOptions.value = res.map((item: any) => {
        return {
          label: item.departName,
          value: item.orgCode,
        };
      });
      getForm().updateSchema({
        field: 'orgCode',
        componentProps: {
          options: orgOptions.value,
          onChange: (value) => {
            getForm().updateSchema({
              field: 'workshop',
              componentProps: {
                options: [],
              },
            });
            getForm().setFieldsValue({
              workshop: undefined,
            });
            if (value) {
              getDepartList(value);
            }
          },
        },
      });
    });
  };
  // 车间
  const getDepartList = (orgCode) => {
    selectDeptNew({ orgCode }).then(async (res) => {
      departOptions.value = res.map((item: any) => {
        return {
          label: item.departName,
          value: item.orgCode,
        };
      });
      getForm().updateSchema({
        field: 'workshop',
        componentProps: {
          options: departOptions.value,
        },
      });
    });
  };
  const getActions = (record: any) => {
    return [
      {
        label: '撤销发布',
        auth: ['rsCertificate:unpublish'],
        ifShow: record.status === '1',
        onClick: handleUnpublish.bind(null, record),
      },
    ];
  };
  const handleUnpublish = async (data: any) => {
    openModal(true, {
      id: data.id,
    });
  };
  const handleSubmit = (data: any, close: any) => {
    revocation(data).then((res) => {
      if (res) {
        close();
        reload();
        emit('success');
      }
    });
  };
</script>
<style lang="less" scoped></style>
