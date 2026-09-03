<template>
  <div>
    <BasicTable @register="registerTable">
      <template #tableTitle>
        <a-button type="primary" @click="handleAdd">上传模板</a-button>
      </template>
      <template #action="{ record }">
        <TableAction :actions="getActions(record)" />
      </template>
      <template #status="{ record }">
        <Tag :color="record.status == '1' ? 'green' : 'orange'">
          {{ record.status == '1' ? '已发布' : '草稿' }}
        </Tag>
      </template>
    </BasicTable>
    <AddModal @register="registerModal" @success="handleSuccess" />
  </div>
</template>

<script lang="ts" setup name="safetyCommitment-list">
  import { onMounted } from 'vue';
  import { getDepart3ListWithSecurity } from '/@/api/common/api';
  import { BasicTable, useTable, TableAction, BasicColumn, FormSchema, ActionItem } from '/@/components/Table';
  import { Tag } from 'ant-design-vue';
  import { useModal } from '/@/components/Modal';
  import AddModal from './AddModal.vue';
  import { getList, deleteCommitmentTemplate, download } from './api';

  const [registerModal, { openModal }] = useModal();

  // 表格列定义
  const columns: BasicColumn[] = [
    {
      title: '年度',
      dataIndex: 'year',
      width: 80,
    },
    {
      title: '模板名称',
      dataIndex: 'name',
      width: 180,
    },
    {
      title: '所属单位',
      dataIndex: 'orgName',
      width: 150,
    },
    {
      title: '岗位层级',
      dataIndex: 'postLevel',
      width: 120,
      customRender: ({ text }) => {
        if (text === '1') {
          return '各事业部部长';
        } else if (text === '2') {
          return '科段级干部';
        } else if (text === '3') {
          return '班组长';
        } else if (text === '4') {
          return '一般员工';
        } else {
          return '未知';
        }
      },
    },
    {
      title: '创建人',
      dataIndex: 'createUser',
      width: 120,
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      width: 180,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      slots: { customRender: 'status' },
    },
  ];

  // 搜索表单配置
  const searchFormSchema: FormSchema[] = [
    {
      field: 'orgCode',
      label: '所属单位',
      component: 'Select',
      componentProps: {
        options: [],
      },
      colProps: { span: 6 },
    },
    {
      field: 'postLevel',
      label: '岗位层级',
      component: 'Select',
      componentProps: {
        options: [
          { label: '各事业部部长', value: '1' },
          { label: '科段级干部', value: '2' },
          { label: '班组长', value: '3' },
          { label: '一般员工', value: '4' },
        ],
      },
      colProps: { span: 6 },
    },
    {
      field: 'name',
      label: '模板名称',
      component: 'Input',
      componentProps: {
        placeholder: '请输入模板名称',
      },
      colProps: { span: 6 },
    },
  ];

  // 表格配置
  const [registerTable, { reload, getForm }] = useTable({
    api: getList,
    columns,
    formConfig: {
      labelWidth: 80,
      schemas: searchFormSchema,
      autoSubmitOnEnter: true,
    },
    useSearchForm: true,
    showTableSetting: false,
    bordered: true,
    showIndexColumn: true,
    indexColumnProps: {
      title: '序号',
      width: 60,
    },
    actionColumn: {
      width: 250,
      title: '操作',
      dataIndex: 'action',
      slots: { customRender: 'action' },
    },
  });

  onMounted(() => {
    getDepart3ListWithSecurity().then((res) => {
      const options = res.map((item) => ({
        label: item.departName,
        value: item.orgCode,
      }));
      getForm().updateSchema({
        field: 'orgCode',
        componentProps: {
          options,
        },
      });
    });
  });

  /**
   * @description: 新增
   */
  function handleAdd() {
    console.log('新增');
    openModal(true, {
      isUpdate: false,
      showFooter: true,
    });
  }

  /**
   * @description: 获取操作栏
   */
  function getActions(record: Recordable): ActionItem[] {
    return [
      {
        label: '查看',
        onClick: handleView.bind(null, record),
      },
      {
        label: '下载',
        onClick: handleDownload.bind(null, record),
      },
      {
        label: '编辑',
        onClick: handleEdit.bind(null, record),
        ifShow: () => record.status == '0',
      },
      {
        label: '删除',
        color: 'error',
        popConfirm: {
          title: '是否确认删除',
          confirm: handleDelete.bind(null, record),
        },
      },
    ];
  }

  /**
   * @description: 查看
   */
  function handleView(record: Recordable) {
    openModal(true, {
      isUpdate: true,
      showFooter: false,
      record,
    });
  }

  /**
   * @description: 下载
   */
  async function handleDownload(record: Recordable) {
    // pdf下载
   let res = await download({ id: record.id })
      const blob = new Blob([res], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `${record.name}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  /**
   * @description: 编辑
   */
  function handleEdit(record: Recordable) {
    console.log('编辑', record);
    openModal(true, {
      isUpdate: true,
      showFooter: true,
      record,
    });
  }

  /**
   * @description: 删除
   */
  function handleDelete(record: Recordable) {
    console.log('删除', record);
    deleteCommitmentTemplate({ id: record.id }).then(() => {
      reload();
    });
  }
  /**
   * @description: 刷新
   */
  function handleSuccess() {
    reload();
  }
</script>
