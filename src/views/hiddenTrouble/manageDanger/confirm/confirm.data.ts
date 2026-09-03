import { BasicColumn, FormSchema } from '/@/components/Table';
export const columns: BasicColumn[] = [
    {
        title: '所属单位',
        width: 150,
        dataIndex: 'orgName',
    },
    {
        title: '所属车间',
        width: 150,
        dataIndex: 'departName',
    },
    {
        title: '检查时间',
        ellipsis: true,
        dataIndex: 'checkTime',
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
        width: 100,
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