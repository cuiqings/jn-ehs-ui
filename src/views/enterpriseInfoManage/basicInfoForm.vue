<template>
    <div class="">
        <Title :title="title" :isEdit="isEdit" @btnBack="btnBack" />
        <!-- 表单 -->
        <a-spin :spinning="loading">
            <BasicForm @register="registerForm">
                <template #DateSlot="{ model, field }">
                    <a-select v-model:value="model['isBusinessExpirationDate']" @change="handleChange" style="width: 48%;margin-right: 4%;"
                        placeholder="请选择" :disabled="disabledDeadline">
                        <a-select-option value="1"> 有截止日期 </a-select-option>
                        <a-select-option value="0"> 无截止日期 </a-select-option>
                    </a-select>
                    <a-date-picker :showTime="false" valueFormat="YYYY-MM-DD HH:mm:ss" placeholder="请选择"
                        v-model:value="model[field]" style="width: 48%" :disabled="disabledPicker" :disabledDate="(current) => {
                            const today = new Date();
                            const yesterdayTimestamp = today.getTime() - 24 * 60 * 60 * 1000;
                            const currentTimestamp = current.valueOf();
                            return currentTimestamp <= yesterdayTimestamp;
                        }" @change="handlePicker"></a-date-picker>
                </template>
            </BasicForm>
        </a-spin>
    </div>
</template>
  
<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import Title from './components/Title.vue'
import { formSchemaBasic } from './demo.data';
import { basicInfoSave, basicInfoGet } from './demo.api';
import { BasicForm, useForm } from '/src/components/Form';
import { useMessage } from '/@/hooks/web/useMessage';
const $message = useMessage();
const props = defineProps({
    selectData: { type: Object, default: () => ({}) },
});
const title = '企业基础信息表'
const id = ref<any>('')
const loading = ref<boolean>(false);
let isEdit = ref<boolean>(true)  // 先预览
const resData = ref({})
let disabledPicker = ref<boolean>(true)
let disabledDeadline = ref<boolean>(true)
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
    disabledDeadline.value = false
    if (resData.value) {
        disabledPicker.value = resData.value.businessExpirationDate ? false : true
    }
})
const btnSave = (async () => {
    const values = await validate()
    Object.keys(values).forEach((e)=>{  // 判断是否有下拉框字段undefined 处理
        if(!values[e]){values[e] = ''} 
    })
    values.dataOrgCode = props.selectData.orgCode
    id.value ? values.id = id.value : values.id = null
    const res = await basicInfoSave(values)
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
        const {success, result, message} = await basicInfoGet({ dataOrgCode: props.selectData.orgCode })
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
        disabledDeadline.value = true
        disabledPicker.value = true
        loading.value = false
    }
})
getFormData()
// 注册Form ======
const [registerForm, { setProps, resetFields, setFieldsValue, validate, updateSchema }] = useForm({
    labelWidth: 200,
    labelAlign: 'left',
    schemas: formSchemaBasic,
    showActionButtonGroup: false,
    compact: true,
    size: 'large'
});

const handleChange = ((e) => {
    if (e === '1') {
        disabledPicker.value = false
    } else {
        disabledPicker.value = true
        setFieldsValue({
            businessExpirationDate: undefined,
        })
    }

})
const handlePicker = ((e) => {
    if (!e) {
        setFieldsValue({
            isBusinessExpirationDate: undefined,
        })
    } else {
        setFieldsValue({
            isBusinessExpirationDate: '1',
        })
    }
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

            label[title='行业类别'],
            [title='经营范围'],
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
  