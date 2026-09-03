<template>
    <div class="">
        <Title :title="title" :isEdit="isEdit" @btnBack="btnBack" />
        <!-- 表单 -->
        <a-spin :spinning="loading">
            <BasicForm @register="registerForm">
                <template #MCSlot="{ model, field }">
                    <!-- {{ model[field] }} -->
                    {{ enterpriseNameSession ? enterpriseNameSession : ''}}
                </template>
            </BasicForm>
        </a-spin>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import Title from './components/Title.vue'
import { formSchemaTrade } from './demo.data';
import { tradeInfoSave, tradeInfoGet,basicInfoGet } from './demo.api';
import { BasicForm, useForm } from '/src/components/Form';
import { useMessage } from '/@/hooks/web/useMessage';
const $message = useMessage();
const enterpriseNameSession = ref('')
const props = defineProps({
    selectData: { type: Object, default: () => ({}) },
});
const title = '工贸企业基础信息表'
const id = ref<any>('')
const loading = ref<boolean>(false);
let isEdit = ref<boolean>(true)  // 先预览
const resData = ref({})
const btnBack = ((s) => {
    switch (s) {
        case 'edit':
            btnEdit()
            break;
        case 'save':
            btnSave()
            break;
        case 'cancel':
            btnCancel()
            break;
        default:
            break;
    }
})

const btnEdit = (() => {
    //开启表单
    setProps({ disabled: false });
    if (resData.value) {
        updateSchema([{
            field: 'dustName',
            componentProps: {
                disabled: resData.value.isExplosiveDust === '0' ? true : false
            }
        }, {
            field: 'limitedSpaceType',
            componentProps: {
                disabled: resData.value.isLimitedSpace === '0' ? true : false
            }
        }, {
            field: 'onSsmc',
            componentProps: {
                disabled: !resData.value.oneWxys ? true : false
            }
        }, {
            field: 'twoSsmc',
            componentProps: {
                disabled: !resData.value.twoWxys ? true : false
            }
        }, {
            field: 'threeSsmc',
            componentProps: {
                disabled: !resData.value.threeWxys ? true : false
            }
        }, {
            field: 'fourSsmc',
            componentProps: {
                disabled: !resData.value.fourWxys ? true : false
            }
        }]);
    }
})
const btnSave = (async () => {
    const values = await validate()
    Object.keys(values).forEach((e)=>{  // 判断是否有下拉框字段undefined 处理
        if(!values[e]){values[e] = ''} 
    })
    delete values.enterpriseName
    values.dataOrgCode = props.selectData.orgCode
    // for (var prop in values) {
    //     if(values[prop] === null){
    //         values[prop] = undefined
    //     }
    // }
    id.value ? values.id = id.value : values.id = null
    loading.value = true;
    const res = await tradeInfoSave(values)
    if (res) { // 编辑成功！
        getFormData()
    }
})
const btnCancel = (() => {
    getFormData()
})

// 获取表单数据
const getFormData = (async () => {
    loading.value = true;
    try {
        const {success:suc, result:re} = await basicInfoGet({ dataOrgCode: props.selectData.orgCode })
        if (suc) {
            enterpriseNameSession.value = re.enterpriseName
        }
        const {success, result, message} = await tradeInfoGet({ dataOrgCode: props.selectData.orgCode })
        if (success) {
            if(!result){
                resetFields()
            }else{
                resData.value = result
                id.value = result.id
                setFieldsValue(result)
            }
        }else{
            resData.value = {}
            id.value = null
            resetFields()
            // $message.createMessage.warning(message);
        }
    } finally {
        setProps({ disabled: true });
        loading.value = false;
    }
})
getFormData()
// 注册Form ======
const [registerForm, { setProps, resetFields, setFieldsValue, validate, updateSchema }] = useForm({
    labelWidth: 200,
    labelAlign: 'left',
    schemas: formSchemaTrade,
    showActionButtonGroup: false,
    compact: true,
    size: 'large'
});

onMounted(async () => {
    watch(
        () => props.selectData,
        async () => {
            getFormData()
        },
        { deep: true, immediate: false }
    )
})
</script>

<style lang="less" scoped>
/deep/.ant-col {
    max-width: 100%;

    .ant-form-item {
        margin-bottom: 0px !important;
        min-height: 56px;
        line-height: 56px;

        .ant-form-item-label {
            background: rgba(0, 0, 0, 0.02);
            border-radius: 0px 0px 0px 0px;
            border: 1px solid #E7E8E9;
            padding-left: 16px;

            label {
                color: rgba(0, 0, 0, 0.87);
                font-size: 16px;
                font-family: Source Han Sans CN-Medium, Source Han Sans CN;
                font-weight: 500;
            }

            label[title='主要危险源 (主要安全风险伴随的设施、部位、场所和区域， 以及伴随风险的主要作业活动等)'] {
                height: 140px;
                line-height: 24px;
                white-space: pre-wrap;
            }

            label[title='有独立污水处理设施的企业分类'],
            [title='分别说明具体介质、生产（储存）设施名称'],
            [title='一级危险源处数'],
            [title='二级危险源处数'],
            [title='三级危险源处数'],
            [title='四级危险源处数'],
            [title='备注'] {
                height: 85px;
                line-height: 24px;
                white-space: pre-wrap;
            }

        }

        .ant-form-item-control {
            background: #FFFFFF;
            border: 1px solid #E7E8E9;
            padding: 0 8px;

            textarea {
                margin-top: -10px;
                resize: none;
            }

            .ant-input-number {
                width: 100%
            }
        }
    }

}
</style>
  