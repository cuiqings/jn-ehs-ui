import { BasicColumn, FormSchema } from '/@/components/Table';
import { render } from '/@/utils/common/renderUtils';
export const columns: BasicColumn[] = [
    {
        title: '所属机构',
        align: 'center',
        ellipsis: true,
        dataIndex: 'departName',
        width: 200,
    },
    {
        title: '设备名称',
        align: 'center',
        ellipsis: true,
        dataIndex: 'deviceName'
    },

    {
        title: '当前状态',
        align: 'center',
        dataIndex: 'status',
        slots: { customRender: 'status' },
        width: 200,
    },
    {
        title: '操作时间',
        align: 'center',
        dataIndex: 'updateTime'
    },
];
export const checkColumns: BasicColumn[] = [
    {
        title: '序号',
        dataIndex: 'index',
        key: 'index',
        width: '70px',
        fixed: 'left',
        align: 'center',
        customRender: ({ text, record, index }) => `${index + 1}`,
    },
    {
        title: '检查项分类',
        dataIndex: 'itemType',
        width: '120px',
        align: 'center',
        customRender: ({ text }) => {
            return render.renderDict(text, 'check_sort');
        },
        // justify justify-content: space-between;
        // align align-items: center;
    },
    {
        title: '检查项',
        ellipsis: true,
        dataIndex: 'itemName',
        width: '150px',
        align: 'center',
    },
    {
        title: '检查内容/方法',
        ellipsis: true,
        dataIndex: 'checkContent',
        width: '150px',
        align: 'center',
    },
    {
        title: '检查标准',
        ellipsis: true,
        dataIndex: 'checkStandard',
        width: '150px',
        align: 'center',
    },
    {
        title: '检查方式',
        ellipsis: true,
        dataIndex: 'checkWay',
        width: '120px',
        align: 'center',
        customRender: ({ text }) => {
            switch (text) {
                case '1':
                    return '现场检查';
                case '2':
                    return '文件查阅';
                default:
                    return '';
            }
        }
    },
    {
        title: '检查结果',
        ellipsis: true,
        dataIndex: 'checkResult',
        width: '100px',
        align: 'center',
        customRender: ({ text }) => {
            switch (text) {
                case '1':
                    return '合格';
                case '2':
                    return '不合格';
                case '3':
                    return '忽略';
                default:
                    return '';
            }
        }
    },
    {
        title: '问题描述',
        dataIndex: 'problemDescription',
        width: '140px',
        align: 'center',
        ellipsis: true,
    },
    {
        title: '检查照片',
        dataIndex: 'checkPicture',
        width: '100px',
        align: 'center',
        slots: { customRender: 'checkPicture' },
    },
    {
        title: '整改照片',
        dataIndex: 'repairPicture',
        width: '100px',
        align: 'center',
        slots: { customRender: 'repairPicture' },
    },
    {
        title: '整改说明',
        dataIndex: 'repairExplain',
        width: '100px',
        align: 'center',
        ellipsis: true,
    },
];
export const warnHistoryColumns: BasicColumn[] = [
    {
        title: '人员',
        align: 'center',
        width: 15,
        ellipsis: true,
        dataIndex: 'updateByRealName'
    },
    {
        title: '时间',
        align: 'center',
        width: 25,
        ellipsis: true,
        dataIndex: 'updateTime'
    },
    {
        title: '操作',
        align: 'center',
        width: 15,
        ellipsis: true,
        dataIndex: 'enableFlag',
        slots: { customRender: 'enableFlag' }
       
    },
    {
        title: '原因',
        align: 'center',
        width: 40,
        ellipsis: true,
        dataIndex: 'reason'
    },
    {
        title: '开始时间',
        align: 'center',
        width: 25,
        ellipsis: true,
        dataIndex: 'startTime'
    },
    {
        title: '结束时间',
        align: 'center',
        width: 25,
        ellipsis: true,
        dataIndex: 'endTime'
    },
]