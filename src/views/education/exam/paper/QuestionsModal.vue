<template>
  <BasicModal v-bind="$attrs" @register="registerModal" title="添加试题" width="1300px" @cancel="handleCancel" @ok="handleSubmit" destroyOnClose>
    <BasicTable @register="registerTable" :rowSelection="rowSelection" style="padding: 2px" />
  </BasicModal>
</template>
<script lang="ts" setup>
  import { ref, nextTick } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicTable } from '/@/components/Table';
  import { FormSchema } from '/@/components/Table';
  import { detailColumns } from '../questions/questions.data';
  import { list, detailList } from '../questions/questions.api';
  import { useListPage } from '/@/hooks/system/useListPage';
  const emit = defineEmits(['select', 'register']);
  const dataSource: any = ref([]);
  const questionBankList = ref([]);
  list({ pageNo: 1, pageSize: 9999 }).then((res) => {
    questionBankList.value = res.records.map((item) => {
      return {
        label: item.name,
        value: item.id,
      };
    });
  });
  const [registerModal, { setModalProps, closeModal }] = useModalInner((data) => {
    console.log('data', data);
    dataSource.value = data.data;
    //   getForm().setFieldsValue({
    //     department: initOrgCode(),
    //   });
    nextTick(() => {
      selectedRowKeys.value = data.data.map((item) => item.id);
    });
  });
  const searchDetailFormSchema: FormSchema[] = [
    {
      field: 'questionBankId',
      label: '题库',
      component: 'Select',
      colProps: { span: 6 },
      componentProps: {
        options: questionBankList,
      },
    },
    {
      field: 'questionName',
      label: '题目',
      component: 'Input',
      colProps: { span: 6 },
    },
    {
      field: 'questionExtent',
      label: '难度',
      component: 'Select',
      colProps: { span: 6 },
      componentProps: {
        options: [
          {
            label: '简单',
            value: 1,
          },
          {
            label: '中等',
            value: 2,
          },
          {
            label: '复杂',
            value: 3,
          },
        ],
      },
    },
    {
      field: 'questionType',
      label: '题型',
      component: 'Select',
      colProps: { span: 6 },
      componentProps: {
        options: [
          {
            label: '单选题',
            value: 1,
          },
          {
            label: '多选题',
            value: 2,
          },
          {
            label: '填空题',
            value: 3,
          },
          {
            label: '判断题',
            value: 4,
          },
          {
            label: '问答题',
            value: 5,
          },
        ],
      },
    },
  ];
  // 列表页面公共参数、方法
  const { tableContext } = useListPage({
    designScope: 'bank-list',
    tableProps: {
      api: detailList,
      rowKey: 'id',
      columns: detailColumns,
      formConfig: {
        labelWidth: 60,
        schemas: searchDetailFormSchema,
      },
      useSearchForm: true,
      showIndexColumn: false,
      showActionColumn: false,
    },
  });
  const [registerTable, { getForm }, { rowSelection, selectedRowKeys, selectedRows }] = tableContext;
  const handleCancel = () => {
    closeModal();
    // 重置勾选
    selectedRowKeys.value = [];
  };
  //提交事件
  function handleSubmit() {
    setModalProps({ confirmLoading: true });
    //关闭弹窗
    closeModal();
    dataSource.value = dataSource.value.filter((item) => selectedRowKeys.value.includes(item.id));
    dataSource.value = Array.from(new Map([...dataSource.value, ...selectedRows.value].map((item) => [item.id, item])).values());
    // 去除dataSource中不包含在selectedRowKeys中的数据
    dataSource.value = dataSource.value.filter((item) => selectedRowKeys.value.includes(item.id));
    console.log('selectedRowKeys', selectedRowKeys.value);
    console.log('dataSource', dataSource.value);
    //刷新列表
    emit('select', { selectedRowKeys: selectedRowKeys.value, dataSource: dataSource.value });
    setModalProps({ confirmLoading: false });
    // 重置勾选
    selectedRowKeys.value = [];
  }
</script>
