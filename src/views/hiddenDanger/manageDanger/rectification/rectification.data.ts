import { BasicColumn, FormSchema } from '/@/components/Table';
import { render } from '/@/utils/common/renderUtils';
export const columns: BasicColumn[] = [
    {
        title: '隐患来源',
        ellipsis: true,
        width: '100px',
        dataIndex: 'sourceType',
        customRender: ({ text }) => {
            return render.renderDict(text, 'yh_hidden_source');
        },
    },
    {
        title: '检查日期',
        ellipsis: true,
        dataIndex: 'createTime',
        width: '120px',
        customRender: ({ text }) => {
            // 截取前10位
            return text.substring(0, 10);
        },
    },
    {
        title: '所属机构',
        width: '120px',
        dataIndex: 'yhPlaceOrgName',
    },
    {
        title: '所属部门',
        dataIndex: 'yhPlaceDepartName',
        width: '120px',
    },
    {
        title: '检查层级',
        ellipsis: true,
        dataIndex: 'checkHierarchy',
        width: '150px',
    },
    {
        title: '隐患描述',
        ellipsis: true,
        dataIndex: 'yhDescription',
        width: '150px',
    },
    {
        title: '隐患等级',
        ellipsis: true,
        width: '120px',
        dataIndex: 'yhLevel',
        customRender: ({ text }) => {
            return render.renderDict(text, 'yh_hidden_level');
        },
    },
    {
        title: '临时措施',
        ellipsis: true,
        dataIndex: 'tempMeasure',
    },
    {
        title: '限定整改期限',
        ellipsis: true,
        dataIndex: 'repairDate',
        width: '150px',
        slots: { customRender: 'repairDate' }
    },
    {
        title: '责任部门',
        ellipsis: true,
        dataIndex: 'dutyDeptName',
        width: '120px',
    },
    {
        title: '责任人',
        ellipsis: true,
        dataIndex: 'dutyPeopleName',
        width: '100px',
    },
    {
        title: '隐患照片',
        dataIndex: 'yhPicture',
        width: '100px',
        slots: {
            customRender: 'yhPicture',
        },
    },
    {
        title: '隐患类型',
        ellipsis: true,
        width: '100px',
        dataIndex: 'yhType',
        customRender: ({ text }) => {
            return render.renderDict(text, 'yh_hidden_type');
        },
    },
    {
        title: '防控手段',
        ellipsis: true,
        width: '100px',
        dataIndex: 'handleMeans',
        customRender: ({ text }) => {
            return render.renderDict(text, 'yh_control_means');
        },
    },
];