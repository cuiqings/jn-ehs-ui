import { BasicColumn, FormSchema } from '/@/components/Table';
import { render } from '/@/utils/common/renderUtils';
export const columns: BasicColumn[] = [
    {
        title: '所属机构',
        width: 150,
        dataIndex: 'yhPlaceOrgName',
    },
    {
        title: '隐患来源',
        ellipsis: true,
        width: 100,
        dataIndex: 'sourceType',
        customRender: ({ text }) => {
            return render.renderDict(text, 'yh_hidden_source');
        },
    },
    {
        title: '检查日期',
        ellipsis: true,
        dataIndex: 'createTime',
        width: 120,
        customRender: ({ text }) => {
            // 截取前10位
            return text.substring(0, 10);
        },
    },
    {
        title: '所属部门',
        dataIndex: 'yhPlaceDepartName',
        width: 120,
    },
    {
        title: '隐患描述',
        ellipsis: true,
        dataIndex: 'yhDescription',
    },
    {
        title: '隐患照片',
        dataIndex: 'yhPicture',
        width: 120,
        slots: {
            customRender: 'yhPicture',
        },
    },
    {
        title: '提报时间',
        dataIndex: 'createTime',
        width: 180,
    },
    {
        title: '提报部门',
        ellipsis: true,
        dataIndex: 'reportDepartName',
        width: 120,
    },
  
    {
        title: '提报人',
        dataIndex: 'reporterName',
        width: 100,
    },
];