import { BasicColumn } from '/@/components/Table';
export const columns: BasicColumn[] = [
    {
        title: '所属机构',
        width: 150,
        dataIndex: 'orgName',
    },
    {
        title: '隐患地点',
        ellipsis: true,
        dataIndex: 'departName',
        width: '200px',
    },
    {
        title: '隐患描述',
        ellipsis: true,
        dataIndex: 'yhDescription',
        width: '180px',
    },
    {
        title: '隐患照片',
        dataIndex: 'yhPicture',
        width: '120px', 
        slots: {
            customRender: 'yhPicture',
        },
    },
    {
        title: '整改后照片',
        dataIndex: 'repairPicture',
        width: '120px', 
        slots: {
            customRender: 'repairPicture',
        },
    },
    {
        title: '处理人',
        ellipsis: true,
        dataIndex: 'handlePeopleName',
        width: '120px',
    },
    {
        title: '处理时间',
        dataIndex: 'handleTime',
        width: '150px',
    },
    {
        title: '提报人',
        dataIndex: 'reporterName',
        width: '120px',
    },
    {
        title: '隐患确认',
        dataIndex: 'status',
        width: '100px',
        customRender: ({ text }) => {
            if (text === '0') {
                return '未处理 '
            }
            else if (text === '1') {
                return '非隐患'
            } else if (text === '2') {
                return '确认隐患'
            }
        },
    },
];