<template>
  <BasicModal v-bind="$attrs" @register="registerModal" title="已填报人员列表" :width="800" :canFullscreen="false" :footer="null">
    <BasicTable @register="registerTable">
      <template #action="{ record }">
        <TableAction
          :actions="[
            {
              label: '查看问卷',
              onClick: handleView.bind(null, record),
            },
          ]"
        />
      </template>
    </BasicTable>
  </BasicModal>
</template>

<script lang="ts" setup>
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicTable, FormSchema, TableAction } from '/@/components/Table';
  import { useListPage } from '/@/hooks/system/useListPage';
  import { queryAnswerList } from './api';
  import { ref } from 'vue';

  const emit = defineEmits(['view-detail']);
  const curId = ref('');
  const [registerModal] = useModalInner(async (data) => {
    curId.value = data.id;
    reload();
  });
  const searchFormSchema = <FormSchema[]>[
      {
        label: '姓名',
        field: 'name',
        component: 'Input',
      },
    ];
  const { tableContext } = useListPage({
      designScope: 'questionnaire-list',
      tableProps: {
        api: queryAnswerList,
        formConfig: {
          schemas: searchFormSchema,
          baseColProps: { span: 24 },
        },
        columns: [
          { title: '所属单位', dataIndex: 'orgName' },
          { title: '人员姓名', dataIndex: 'realName' },
          { title: '工号', dataIndex: 'workNo' },
        ],
        immediate: false,
        beforeFetch: (params) => {
          params.id = curId.value;
          return params;
        },
        showIndexColumn: true,
        indexColumnProps: {
          fixed: 'left',
        },
      },
    });
 const [registerTable, { reload }] = tableContext;

  const handleView = (record: any) => {
    emit('view-detail', record);
  };
</script>
