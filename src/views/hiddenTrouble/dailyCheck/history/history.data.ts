import { BasicColumn, FormSchema } from '/@/components/Table';
import { render } from '/@/utils/common/renderUtils';
export const columns: BasicColumn[] = [
    {
        title: '所属单位',
        width: 150,
        dataIndex: 'orgName',
    },
    {
        title: '所属车间',
        dataIndex: 'departName',
        width: 120,
    },
    {
        title: '计划名称',
        width: 140,
        dataIndex: 'planName',
    },
    {
        title: '计划类型',
        width: 120,
        dataIndex: 'planType_dictText',
    },
    {
        title: '巡检周期',
        width: 100,
        dataIndex: 'checkCycle_dictText',
    },
    {
        title: '检查人',
        dataIndex: 'realExecutePersonName',
        width: 150,
    },
    {
        title: '任务时间',
        dataIndex: 'cycleTime',
        width: 120,
        customRender: ({ text }) => {
            if (!text) {
                return '';
            }
            return text.substring(0, 10);
        },
    },
    {
        title: '检查时间',
        dataIndex: 'realCheckTime',
        width: 150,
    },
    {
        title: '检查状态',
        dataIndex: 'status',
        width: 100,
        slots: { customRender: 'status' },
    },
    {
        title: '发现隐患',
        width: 100,
        dataIndex: 'yhCount',
        slots: { customRender: 'yhCount' },
    },
];
export const checkColumns: BasicColumn[] = [
    {
        title: '风险ID',
        dataIndex: 'riskId',
        width: '120px',
        align: 'center',
    },
    {
        title: '区域位置（单元）',
        ellipsis: true,
        dataIndex: 'rgLcName',
        width: '150px',
        align: 'center',
    },
    {
        title: '风险名称',
        ellipsis: true,
        dataIndex: 'riskName',
        width: '150px',
        align: 'center',
    },
    {
        title: '排查方法',
        ellipsis: true,
        dataIndex: 'checkMethod',
        width: '150px',
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
        title: '车间负责人',
        align: 'center',
        dataIndex: 'workshopManagerName',
        width: '100px',
    },
    {
        title: '检查照片',
        dataIndex: 'checkPicture',
        width: '100px',
        align: 'center',
        slots: { customRender: 'checkPicture' },
    },
    {
        title: '整改后照片',
        dataIndex: 'repairPicture',
        width: '100px',
        align: 'center',
        slots: { customRender: 'repairPicture' },
    },
];
export const checkColumns1: BasicColumn[] = [
    {
        title: '区域位置（单元）',
        ellipsis: true,
        dataIndex: 'rgLcName',
        width: '150px',
        align: 'center',
    },
    {
        title: '排查方法',
        ellipsis: true,
        dataIndex: 'checkMethod',
        width: '150px',
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
        title: '车间负责人',
        align: 'center',
        dataIndex: 'workshopManagerName',
        width: '100px',
    },
    {
        title: '检查照片',
        dataIndex: 'checkPicture',
        width: '100px',
        align: 'center',
        slots: { customRender: 'checkPicture' },
    },
    {
        title: '整改后照片',
        dataIndex: 'repairPicture',
        width: '100px',
        align: 'center',
        slots: { customRender: 'repairPicture' },
    },
];
