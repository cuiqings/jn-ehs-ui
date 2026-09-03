import { ref } from 'vue';
import { BasicColumn, FormSchema } from '/@/components/Table';
// import { render } from '/@/utils/common/renderUtils';
import { defHttp } from '/@/utils/http/axios';

export const columns: BasicColumn[] = [
    {
        title: '所属机构',
        dataIndex: 'orgCode_dictText',
    },
    {
        title: '工序',
        dataIndex: 'process',
    },
    {
        title: '页面配置',
        dataIndex: 'configStatus',
        customRender: ({text}) => {
            return text === 1 ? '已配置' : '未配置'
        }
    },
    {
        title: '操作时间',
        dataIndex: 'updateTime',
    },
    {
        title: '操作人',
        dataIndex: 'updateBy',
    },
    {
        title: '页面审核',
        dataIndex: 'operatorName',
    },
    {
        title: '状态',
        dataIndex: 'status_dictText',
    },
];

const orgOptions:any = ref([])
function getOrgList() {
     defHttp.get({ url: '/jn/common/getOrganization' }).then((res) => {
        res.map((item:any) => {
            orgOptions.value.push({
                label: item.departName,
                value: item.orgCode
            })
        })

    })
}
getOrgList()

export const searchFormSchema: FormSchema[] = [
    {
        label: '所属机构',
        field: 'orgCode',
        component: 'Select',
        componentProps: () => {
            return {
                options: orgOptions.value,
                placeholder: '请选择',
                // onChange: (e: any) => {
                //     console.log('e', e)
                // },
            };
        },
        colProps: { span: 6 },
    },
    {
        field: 'process',
        label: '工序',
        component: 'Input',
        colProps: { span: 6 },
    },
    {
        label: '状态',
        field: 'status',
        component: 'JDictSelectTag',
        componentProps: {
            dictCode: 'pollution_page_setup_status',
            placeholder: '请选择',
            stringToNumber: false,
            showChooseOption: false
        },
        colProps: { span: 6 },
    }
];
