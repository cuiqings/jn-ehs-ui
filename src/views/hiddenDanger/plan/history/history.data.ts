import { BasicColumn, FormSchema } from '/@/components/Table';
import { render } from '/@/utils/common/renderUtils';
export const columns: BasicColumn[] = [
    {
        title: '所属机构',
        width: 150,
        dataIndex: 'orgName',
    },
    {
        title: '所属部门',
        dataIndex: 'departName',
        width: 120,
    },
    {
        title: '计划类型',
        width: 120,
        dataIndex: 'planType',
        customRender: ({ text }) => {
            switch (text) {
                case '1':
                    return '长期计划';
                case '2':
                    return '临时计划';
                default:
                    return '';
            }
        },
    },
    {
        title: '计划名称',
        width: 140,
        dataIndex: 'planName',
    },
    {
        title: '巡检周期',
        width: 100,
        dataIndex: 'checkCycle',
        customRender: ({ text }) => {
            return render.renderDict(text, 'yh_inspection_cycle');
        },
    },
    {
        title: '创建时间',
        dataIndex: 'executeDate',
        width: 150,
    },
    {
        title: '执行角色',
        dataIndex: 'executeRoleName',
        width: 120,
    },
    {
        title: '执行人',
        dataIndex: 'executePeopleName',
        width: 120,
    },
    {
        title: '执行时间',
        dataIndex: 'realExecuteDate',
        width: 150,
    },
    {
        title: '巡检记录',
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
];