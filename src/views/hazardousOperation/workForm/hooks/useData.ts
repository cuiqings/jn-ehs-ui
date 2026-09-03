import { BasicColumn } from '/@/components/Table';

export const useData = () => {
  const columns: BasicColumn[] = [
    {
      title: '序号',
      dataIndex: 'index',
      width: 70,
    },
    {
      title: '单位',
      dataIndex: 'orgName',
      width: 150,
    },
    {
      title: '危险作业管控',
      children: [
        {
          title: '审批数量',
          children: [
            {
              title: '总项数',
              dataIndex: 'workCount',
            },
            {
              title: '公司审批',
              dataIndex: 'companyCount',
            },
            {
              title: '单位审批',
              dataIndex: 'unitCount',
            },
          ],
        },
        {
          title: '验收数量',
          children: [
            {
              title: '完成验收',
              dataIndex: 'finishCount',
            },
            {
              title: '未验收',
              dataIndex: 'notFinishCount',
            },
          ],
        },
        {
          title: '作业数量',
          children: [
            {
              title: '完成作业数量',
              dataIndex: 'recordCount',
            },
            {
              title: '在作业数量',
              dataIndex: 'runCount',
            },
          ],
        },
        {
          title: '公司抽查记录',
          children: [
            {
              title: '抽查项数',
              dataIndex: 'companyCheckCount',
            },
            {
              title: '正常',
              dataIndex: 'companyCheckCountZc',
            },
            {
              title: '异常',
              dataIndex: 'companyCheckCountYc',
            },
          ],
        },
        {
          title: '各单位检查记录',
          children: [
            {
              title: '检查项数',
              dataIndex: 'unitCheckCount',
            },
            {
              title: '正常',
              dataIndex: 'unitCheckCountZc',
            },
            {
              title: '异常',
              dataIndex: 'unitCheckCountYc',
            }
          ]
        }
      ]
    }
  ];

  return {
    columns,
  };
};
