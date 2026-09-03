import { ref, h, computed } from 'vue';
import { BasicColumn, FormSchema } from '/@/components/Table';
import { render } from '/@/utils/common/renderUtils';

export const columns: BasicColumn[] = [
    {
        title: '通讯名称',
        align: "center",
        dataIndex: 'name',
        ellipsis: true,
    },
    {
        title: '协议',
        align: "center",
        dataIndex: 'protocol',
        ellipsis: true,
    },
    {
        title: '地址',
        align: "center",
        dataIndex: 'address',
        ellipsis: true,
        width: 150,
    },
    {
        title: '参数信息',
        align: "center",
        dataIndex: 'daqCommunicationParamStr',
        width: 400,
        ellipsis: true,
    },
    {
        title: '启/停用',
        align: "center",
        dataIndex: 'enableFlag',
        slots: { customRender: 'enableFlag' },
        width: 80,
    },
    {
        title: '时间',
        align: "center",
        dataIndex: 'updateTime',
        width: 180,
    },
];

export const searchFormSchema: FormSchema[] = [
    {
        label: '名称',
        field: 'name',
        component: 'Input',
        colProps: { span: 6 },
    },
    {
        label: '协议',
        field: 'protocol',
        component: 'JDictSelectTag',
        componentProps: {
            dictCode: 'communication_protocol',
            placeholder: '请选择',
            stringToNumber: false,
            showChooseOption: false,
        },
        colProps: { span: 6 },
    },
    {
        label: '启/停用',
        field: 'enableFlag',
        component: 'Select',
        componentProps: {
            options: [{ label: '启用', value: '1' }, { label: '停用', value: '0' }],
        },
        colProps: { span: 6 },
    },
];
