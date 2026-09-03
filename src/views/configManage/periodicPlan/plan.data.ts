import { BasicColumn } from '/@/components/Table';
import { render } from '/@/utils/common/renderUtils';

export const columns: BasicColumn[] = [
    {
        title: '计划类型',
        width: 150,
        dataIndex: 'planType',
        customRender: ({ text }) => {
            return render.renderDict(text, 'clean_plan_type');
        },
    },
    {
        title: '审批角色/人',
        width: 150,
        dataIndex: 'approvalContentTwo',
    },
    {
        title: '操作时间',
        width: 110,
        dataIndex: 'updateTime',
        customRender: ({ text }) => {
            // return text.substring(0, 10)
            return text
        }
    },{
        title: '操作人',
        width: 110,
        dataIndex: 'updateBy'
    }
];



