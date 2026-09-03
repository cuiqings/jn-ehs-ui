// import { ref } from 'vue';
import { BasicColumn, FormSchema } from '/@/components/Table';
import { render } from '/@/utils/common/renderUtils';

export const columns: BasicColumn[] = [
    {
        title: '所属园区',
        dataIndex: 'park',
        customRender: ({ text }) => {
            return render.renderDict(text, 'screen_park');
        },
    },
    {
        title: '页面类型',
        dataIndex: 'pageType',
    },
    {
        title: '页面配置',
        dataIndex: 'configStatus',
        customRender: ({text}) => {
            return text === '1' ? '已配置' : '未配置'
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
            return render.renderDict(text, 'enable_flag');
        },
    },
];

export const searchFormSchema: FormSchema[] = [
    {
        label: '所属园区',
        field: 'park',
        component: 'JDictSelectTag',
        componentProps: {
            dictCode: 'screen_park',
            placeholder: '请选择',
            stringToNumber: false,
            showChooseOption: false
        },
        colProps: { span: 6 },
    },
    {
        label: '状态',
        field: 'status',
        component: 'JDictSelectTag',
        componentProps: {
            dictCode: 'enable_flag',
            placeholder: '请选择',
            stringToNumber: false,
            showChooseOption: false
        },
        colProps: { span: 6 },
    }
];
