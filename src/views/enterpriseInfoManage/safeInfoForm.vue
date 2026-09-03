<template>
    <div class="">
        <Title :title="title" :isEdit="isEdit" @btnBack="btnBack" />
        <!-- 表单 -->
        <a-spin :spinning="loading">
            <BasicForm @register="registerForm"></BasicForm>
        </a-spin>
    </div>
</template>
  
<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import Title from './components/Title.vue'
import { formSchemaSafe } from './demo.data';
import { safeInfoSave, safeInfoGet } from './demo.api';
import { BasicForm, useForm } from '/src/components/Form';
import { useMessage } from '/@/hooks/web/useMessage';
const $message = useMessage();

const props = defineProps({
    selectData: { type: Object, default: () => ({}) },
});
const title = '安全生产基础信息表'
const id = ref<any>('')
const loading = ref<boolean>(false);
let isEdit = ref(true)  // 先预览
const resData = ref({})
const btnBack = ((s)=>{
    switch(s){
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
const btnEdit = (()=>{
    //开启表单
    setProps({ disabled: false });
    if (resData.value) {
        const isTureInter = !resData.value.integrityLevel || resData.value.integrityLevel == '4'
        const isTureStandar = !resData.value.standardizationLevel || resData.value.standardizationLevel == '4'
        updateSchema([{
            field: 'integrityLevelCertificateNum',
            componentProps: {
                disabled: isTureInter  ? true : false
            }
        },{
            field: 'levelCertificateAuthority',
            componentProps: {
                disabled: isTureInter  ? true : false
            }
        },{
            field: 'levelCertificateDate',
            componentProps: {
                disabled: isTureInter  ? true : false
            }
        },{
            field: 'standardizationLevelNum',
            componentProps: {
                disabled: isTureStandar  ? true : false
            }
        },{
            field: 'standardizationLevelAuthority',
            componentProps: {
                disabled: isTureStandar  ? true : false
            }
        },{
            field: 'standardizationLevelFzDate',
            componentProps: {
                disabled: isTureStandar  ? true : false
            }
        },{
            field: 'standardizationLevelJzDate',
            componentProps: {
                disabled: isTureStandar  ? true : false
            }
        },{
            field: 'securityAgencyName',
            componentProps: {
                disabled: resData.value.isSpecializedSafetyOrganization === '0' ? true : false
            }
        },{
            field: 'securityAgencyFzr',
            componentProps: {
                disabled: resData.value.isSpecializedSafetyOrganization === '0' ? true : false
            }
        },{
            field: 'securityAgencyFzrPhone',
            componentProps: {
                disabled: resData.value.isSpecializedSafetyOrganization === '0' ? true : false
            }
        },{
            field: 'securityAgencyNum',
            componentProps: {
                disabled: resData.value.isSpecializedSafetyOrganization === '0' ? true : false
            }
        },
        
        
        {
            field: 'isHazardousChemicalsUrl',
            componentProps: {
                disabled: resData.value.isHazardousChemicals === '0' ? true : false
            }
        }, {
            field: 'isSafetyProductionUrl',
            componentProps: {
                disabled: resData.value.isSafetyProduction === '0' ? true : false
            }
        }, {
            field: 'isCorporateCultureUrl',
            componentProps: {
                disabled: resData.value.isCorporateCulture === '0' ? true : false
            }
        }, {
            field: 'isSpecialEquipmentUrl',
            componentProps: {
                disabled: resData.value.isSpecialEquipment === '0' ? true : false
            }
        }, {
            field: 'isFzrZjUrl',
            componentProps: {
                disabled: resData.value.isFzrZj === '0' ? true : false
            }
        }, {
            field: 'isScglrZjUrl',
            componentProps: {
                disabled: resData.value.isScglrZj === '0' ? true : false
            }
        }, {
            field: 'isTzztZjUrl',
            componentProps: {
                disabled: resData.value.isTzztZj === '0' ? true : false
            }
        }])
    }
})
const btnSave = (async()=>{
    const values = await validate()
    Object.keys(values).forEach((e)=>{  // 判断是否有下拉框字段undefined 处理
        if(!values[e]){values[e] = ''} 
    })
    values.dataOrgCode = props.selectData.orgCode
    id.value ? values.id = id.value : values.id = null
    const res = await safeInfoSave(values)
    if (res) { // 编辑成功！
        getFormData()
    }
})
const btnCancel = (()=>{
    getFormData()
})

// 获取表单数据
const getFormData = (async()=>{
    loading.value = true;
    try {
        const {success, result, message} = await safeInfoGet({ dataOrgCode: props.selectData.orgCode })
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
        loading.value = false
    }
})
getFormData()

// 注册Form ======
const [registerForm, { setProps, resetFields, setFieldsValue, validate, updateSchema }] = useForm({
    labelWidth: 220,
    labelAlign: 'left',
    schemas: formSchemaSafe,
    showActionButtonGroup: false,
    compact: true,
    size: 'large'
})

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

            label[title='规模情况'],
            [title='企业规模'],
            [title='涉及危化品种类，数量']{
                min-height: 85px;
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
  