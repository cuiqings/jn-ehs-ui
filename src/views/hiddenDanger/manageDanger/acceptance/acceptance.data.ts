import { BasicColumn, FormSchema } from '/@/components/Table';
import { render } from '/@/utils/common/renderUtils';
export const columns: BasicColumn[] = [
    {
        title: '隐患来源',
        ellipsis: true,
        dataIndex: 'sourceType',
        width: '100px',
        customRender: ({ text }) => {
            return render.renderDict(text, 'yh_hidden_source');
            // accessory accessory   
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
        width: 120,
        dataIndex: 'yhPlaceOrgName',
    },
    {
        title: '所属部门',
        dataIndex: 'yhPlaceDepartName',
        width: 120,
    },
    {
        title: '检查层级',
        ellipsis: true,
        dataIndex: 'checkHierarchy',
        width: 120,
    },
    {
        title: '隐患描述',
        ellipsis: true,
        dataIndex: 'yhDescription',
    },
    {
        title: '隐患等级',
        ellipsis: true,
        dataIndex: 'yhLevel',
        width: 120,
        customRender: ({ text }) => {
            return render.renderDict(text, 'yh_hidden_level');
        },
    },
    {
        title: '临时措施',
        ellipsis: true,
        dataIndex: 'tempMeasure',
        width: 180,
    },
    {
        title: '限定整改期限',
        ellipsis: true,
        dataIndex: 'repairDate',
        width: 120,
    },
    {
        title: '责任部门',
        ellipsis: true,
        dataIndex: 'dutyDeptName',
        width: 120,
    },
    {
        title: '责任人',
        ellipsis: true,
        dataIndex: 'dutyPeopleName',
        width: 120,
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
        title: '隐患类型',
        ellipsis: true,
        dataIndex: 'yhType',
        width: 120,
        customRender: ({ text }) => {
            return render.renderDict(text, 'yh_hidden_type');
        },
    },
    {
        title: '防控手段',
        ellipsis: true,
        width: 120,
        dataIndex: 'handleMeans',
        customRender: ({ text }) => {
            return render.renderDict(text, 'yh_control_means');
        },
    },
];