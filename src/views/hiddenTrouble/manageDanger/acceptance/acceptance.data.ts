import { BasicColumn, FormSchema } from '/@/components/Table';
export const columns: BasicColumn[] = [
    {
        title: '验收状态',
        ellipsis: true,
        width: '100px',
        dataIndex: 'yhStatus_dictText',
    },
    {
        title: '所属单位',
        width: '120px',
        dataIndex: 'orgName',
    },
    {
        title: '所属车间',
        dataIndex: 'departName',
        width: '120px',
    },
    {
        title: '检查时间',
        ellipsis: true,
        dataIndex: 'checkTime',
        width: '120px',
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
            if (text === '1') {
                return '一般隐患';
            }
            if (text === '2') {
                return '重大隐患';
            }
        }
    },
    {
        title: '隐患分类',
        ellipsis: true,
        dataIndex: 'yhType_dictText',
    },
    {
        title: '子类',
        ellipsis: true,
        dataIndex: 'yhTypeSub_dictText',
    },
    {
        title: '检查人',
        ellipsis: true,
        dataIndex: 'checkPersonName',
        width: 100,
    },
    {
        title: '隐患照片',
        dataIndex: 'yhPicture',
        width: 120,
        slots: {
            customRender: 'yhPicture',
        },
    },
];