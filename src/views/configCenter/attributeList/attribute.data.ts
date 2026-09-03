import { ref, h, computed } from 'vue';
import { BasicColumn, FormSchema } from '/@/components/Table';
import { render } from '/@/utils/common/renderUtils';

export const columns: BasicColumn[] = [
    {
        title: '通讯名称',
        align: "center",
        dataIndex: 'communicationName',
        slots: { customRender: 'communicationName' },
    },
    {
        title: '协议',
        align: "center",
        dataIndex: 'communicationProtocol_dictText'
    },
    {
        title: '属性名称',
        align: "center",
        dataIndex: 'pointName',
        slots: { customRender: 'pointName' },
    },
    {
        title: '属性TAG',
        align: "center",
        ellipsis: true,
        dataIndex: 'pointTag',
        slots: { customRender: 'pointTag' },
    },
    {
        title: '属性类型',
        align: "center",
        dataIndex: 'type_dictText',
    },
    {
        title: '设备名称',
        align: "center",
        dataIndex: 'deviceName',
        slots: { customRender: 'deviceName' },
    },
    {
        title: '访问类型',
        align: "center",
        dataIndex: 'accessType_dictText',
    },
    {
        title: '展示类型',
        align: "center",
        dataIndex: 'displayType_dictText',
    },
    {
        title: '权重',
        align: "center",
        dataIndex: 'displayWeights',
        width: 80,
    },
    {
        title: '单位',
        align: "center",
        dataIndex: 'unit_dictText',
        width: 80,
    },
    {
        title: '是否点表',
        align: "center",
        dataIndex: 'isPoint_dictText',
        width: 100,
        // premise precise 
    },
    {
        title: '参数信息',
        align: "center",
        dataIndex: 'daqPointParamStr',
        ellipsis: true,
        width: 200,
    },
    {
        title: '启/停用',
        align: "center",
        dataIndex: 'enableFlag',
        slots: { customRender: 'enableFlag' },
        width: 120,
    },
    {
        title: '时间',
        align: "center",
        dataIndex: 'updateTime',
        width: 200,
    },
    {
        title: '网关发送状态',
        align: "center",
        ellipsis: true,
        dataIndex: 'sendGatewayStatus',
        slots: { customRender: 'sendGatewayStatus' },
    },
]

export const searchFormSchema: FormSchema[] = [
    {
        label: '通讯名称',
        field: 'communicationName',
        component: 'Input',
        colProps: { span: 6 },
    },
    {
        label: '协议',
        field: 'communicationProtocol',
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
        label: '属性名称',
        field: 'pointName',
        component: 'Input',
        colProps: { span: 6 },
    },
    {
        label: '设备名称',
        field: 'deviceName',
        component: 'Input',
        colProps: { span: 6 },
    },
    {
        label: '展示类型',
        field: 'displayType',
        component: 'JDictSelectTag',
        componentProps: {
            dictCode: 'point_display_type',
            placeholder: '请选择',
            stringToNumber: false,
            showChooseOption: false,
        },
        colProps: { span: 6 },
    },
    {
        label: '单位',
        field: 'unit',
        component: 'JDictSelectTag',
        componentProps: {
            dictCode: 'point_unit',
            placeholder: '请选择',
            stringToNumber: false,
            showChooseOption: false,
        },
        colProps: { span: 6 },
    },
    {
        label: '属性类型',
        field: 'type',
        component: 'JDictSelectTag',
        componentProps: {
            dictCode: 'point_type',
            placeholder: '请选择',
            stringToNumber: false,
            showChooseOption: false,
        },
        colProps: { span: 6 },
    },
    {
        label: '访问类型',
        field: 'accessType',
        component: 'JDictSelectTag',
        componentProps: {
            dictCode: 'point_access_type',
            placeholder: '请选择',
            stringToNumber: false,
            showChooseOption: false,
        },
        colProps: { span: 6 },
    },
    {
        label: '是否为点表',
        field: 'isPoint',
        component: 'JDictSelectTag',
        componentProps: {
            dictCode: 'yn',
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
export const deviceColumns: BasicColumn[] = [
    {
        title: '所属机构',
        dataIndex: 'departmentName',
    },
    {
        title: '名称',
        dataIndex: 'name',
    },
];
export const searchDeviceFormSchema: FormSchema[] = [
    {
        field: 'orgCode',
        label: '所属机构',
        component: 'JTreeSelect1',
        // defaultValue: initOrgCode(),
        componentProps: ({ formModel }) => {
            return {
                url: '/jn/common/getDepartTreeBy23',
                fieldNames: {
                    label: 'departName',
                    value: 'orgCode',
                    options: 'children',
                },
            };
        },
        colProps: { span: 6 },
    },
    {
        field: 'name',
        label: '名称',
        component: 'Input',
        colProps: { span: 6 },
    },
];