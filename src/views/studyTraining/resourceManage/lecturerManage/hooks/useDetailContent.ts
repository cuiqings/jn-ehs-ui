import { useListPage } from '/@/hooks/system/useListPage';
import { BasicColumn } from '/@/components/Table';
import { lecturerDetail } from '../url/index';
import { ref } from 'vue';
import { dateFormat } from '/@/utils/common/compUtils';
import { useModal } from '/@/components/Modal';
import { examRecord } from '../url/index';
export const useDetailContent = () => {
  const taskId = ref<string>('');
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
      width: 270,
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
      width: 120,
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

  const { tableContext, onExportXls } = useListPage({
    tableProps: {
      api: lecturerDetail,
      columns: columns,
      immediate: false,
      useSearchForm: false,
      pagination: false,
      actionColumn: {
        width: 100,
        title: '考试记录',
        dataIndex: 'action',
        slots: { customRender: 'action' },
        fixed: 'right',
      },
      beforeFetch: (params) => {
        params.id = taskId.value;
        return params;
      },
    },
    exportConfig: {
      name: '考试明细-' + dateFormat(new Date(), 'yyyy-MM-dd'),
      url: '/edu/examTask/details/export',
      suffix: 'xlsx',
    },
  });

  const [registerTable, { reload }] = tableContext;
  // 考试记录
  const [registerScore, { openModal: openScore }] = useModal();

  function pageInit(id) {
    taskId.value = id;
    reload();
  }

  const getActions = (record: any) => {
    return [
      {
        label: '评分详情',
        auth: ['examTask:edit'],
        onClick: handleDetail.bind(null, record),
        disabled: record.status == '未参考',
      },
    ];
  };

  const handleDetail = (data) => {
    openScore(true, data);
  };
  return {
    getActions,
    onExportXls,
    registerTable,
    pageInit,
    registerScore,
    openScore,
  };
};
