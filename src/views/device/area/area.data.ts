import { BasicColumn, FormSchema } from '/@/components/Table';
import { render } from '/@/utils/common/renderUtils';
export const columns: BasicColumn[] = [
    { title: '采集时间', align: 'center', dataIndex: 'time' },
    { title: '名称', align: 'center', dataIndex: 'value' },
];
export const warnColumns: BasicColumn[] = [
  {
    title: '所属机构',
    align: 'center',
    width: 120,
    ellipsis: true,
    dataIndex: 'sysDepartName'
},
{
    title: '设备名称',
    align: 'center',
    ellipsis: true,
    width: 180,
    dataIndex: 'deviceName'
},
{
    title: '报警等级',
    align: 'center',
    width: 90,
    dataIndex: 'warnLevel',
    slots: { customRender: 'warnLevel' }
    // customRender: ({ text }) => {
    //     return render.renderDict(text, 'warn_level');
    // }
},
{
    title: '报警名称',
    align: 'center',
    ellipsis: true,
    width: 150,
    dataIndex: 'warnConfigName'
},
{
    title: '报警时间',
    align: 'center',
    width: 180,
    dataIndex: 'warnDate'
},
{
    title: '报警状态',
    align: 'center',
    dataIndex: 'warnState',
    width: 90,
    slots: { customRender: 'warnState' },
},
{
    title: '销警方式',
    align: 'center',
    width: 90,
    dataIndex: 'notWarnState',
    customRender: ({ text }) => {
        return render.renderDict(text, 'warn_dis_type');
    },
},
{
    title: '销警时间',
    align: 'center',
    dataIndex: 'notWarnDate',
    width: 180
},
{
    title: '销警人',
    align: 'center',
    width: 120,
    dataIndex: 'notWarnBy'
},
]
export const adsorptionColumns: BasicColumn[]= [
    {
      title: '时间',
      align: 'center',
      fixed: 'left',
      width: 100,
      dataIndex: 'time'
    },
    {
      title: '日期',
      align: 'center',
      fixed: 'left',
      dataIndex: 'date',
      width: 120
    },
    {
      title: '吸附床A温度',
      align: 'center',
      dataIndex: 'temperatureA'
    },
    {
      title: '吸附床A状态',
      align: 'center',
      dataIndex: 'statusA'
    },
    {
      title: '吸附床B温度',
      align: 'center',
      dataIndex: 'temperatureB'
    },
    {
      title: '吸附床B状态',
      align: 'center',
      dataIndex: 'statusB'
    },
    {
      title: '吸附床C温度',
      align: 'center',
      dataIndex: 'temperatureC'
    },
    {
      title: '吸附床C状态',
      align: 'center',
      dataIndex: 'statusC'
    }
  ]