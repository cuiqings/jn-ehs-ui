import { ref } from 'vue';
import { BasicColumn } from '/@/components/Table';
import { useListPage } from '/@/hooks/system/useListPage';
export const useScoreContent = () => {
  const columns = <BasicColumn[]>[
    {
      title: '任务名称',
      width: 100,
      align: 'center',
      dataIndex: 'taskName',
    },
    {
      title: '培训计划',
      width: 100,
      align: 'center',
      dataIndex: 'planName',
    },
    {
      title: '培训项目',
      width: 200,
      align: 'center',
      dataIndex: 'projectName',
    },
    {
      title: '实施单位',
      width: 100,
      align: 'center',
      dataIndex: 'enforceCodes',
    },
    {
      title: '任务时间',
      width: 100,
      align: 'center',
      dataIndex: 'taskStartTime',
    },
    {
      title: '任务分类',
      width: 100,
      align: 'center',
      dataIndex: 'category',
    },
    {
      title: '指派人数',
      width: 100,
      align: 'center',
      dataIndex: 'trainNum',
    },
    {
      title: '已参加',
      width: 100,
      align: 'center',
      dataIndex: 'joinNum',
    },
    {
      title: '创建人',
      width: 100,
      align: 'center',
      dataIndex: 'createBy',
    },
    {
      title: '创建单位',
      width: 100,
      align: 'center',
      dataIndex: 'orgCode',
    },
    {
      title: '创建时间',
      width: 100,
      align: 'center',
      dataIndex: 'createTime',
    },
    {
      title: '状态',
      width: 100,
      align: 'center',
      dataIndex: 'status',
    },
  ];
  const { tableContext } = useListPage({
    tableProps: {
      columns: columns,
      useSearchForm: false,
      showActionColumn: false,
      pagination: false,
      beforeFetch: (params) => {
        params.id = taskId.value;
        params.userId = userId.value;
        return params;
      },
    },
  });
  const taskId = ref('');
  const userId = ref('');
  const pageInit = (data) => {
    taskId.value = data.id;
    userId.value = data.userId;
    setTableData([data]);
  };

  const [registerTable, { setTableData }] = tableContext;
  return {
    pageInit,
    registerTable,
  };
};
