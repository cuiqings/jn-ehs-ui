// import { ref } from 'vue';
import { BasicColumn, FormSchema } from '/@/components/Table';
import { render } from '/@/utils/common/renderUtils';

export const columns: BasicColumn[] = [
    {
        title: '所属机构',
        dataIndex: 'orgCodeName',
    },
    {
        title: '页面名称',
        dataIndex: 'pageName',
    },
    {
        title: '页面配置',
        dataIndex: 'configStatus',
        customRender: ({text}) => {
            return text == '1' ? '已配置' : '未配置'
        }
    },
    {
        title: '操作时间',
        dataIndex: 'updateTime',
    },
    {
        title: '操作人',
        dataIndex: 'operatorName',
    },
    {
        title: '启/停用',
        dataIndex: 'status',
        customRender: ({ text }) => {
            return render.renderDict(text, 'device_enable_flag');
        },
    },
];

export const searchFormSchema: FormSchema[] = [
    {
        label: '所属机构',
        field: 'orgCode',
        component: 'Select',
        componentProps: {
            options: [],
            placeholder: '请选择',
        },
        colProps: { span: 6 },
    },
    {
        label: '页面名称',
        field: 'pageName',
        component: 'Input',
        colProps: { span: 6 },
    }
];
