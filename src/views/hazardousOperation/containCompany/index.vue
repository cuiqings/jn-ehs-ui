<template>
    <div class="contain-company">
         <a-row style="width: 80%;" :gutter="[16,16]">
            <a-col :offset="3" :span="3" style="text-align: right;">包厂</a-col>
            <a-col  :offset="1" :span="9">包厂人员</a-col>
            <a-col :span="8">防护站包厂人员</a-col>
            <a-col :offset="3" :span="24">
                <a-form
                    ref="formRef"
                    :model="formState"
                    :rules="rules"
                    :label-col="labelCol"
                    :wrapper-col="wrapperCol"
                >
                    <a-row v-for="item in cList">
                        <a-col :span="13">
                            <a-form-item  :key="item.id" :label="item.orgName">
                                <JUserModal style="width: 100%;" type="checkbox" v-model:value="item.user" placeholder="请选择" />
                            </a-form-item>
                        </a-col>
                        <a-col :span="11">
                            <a-form-item :wrapper-col="{span: 20}">
                                <JUserModal type="checkbox" v-model:value="item.stationUser" placeholder="请选择" />
                            </a-form-item>
                        </a-col>
                    </a-row>
                    <a-form-item :wrapper-col="{ span: 14, offset: 8 }">
                        <a-space :size="24">
                            <!-- <a-button v-if="edit" style="margin-left: 10px" @click="cancel">取消</a-button>
                            <a-button v-if="!edit" type="primary" @click="editClick">编辑</a-button> -->
                            <a-button v-if="edit" type="primary" @click="onSubmit">保存</a-button>
                        </a-space>
                    </a-form-item>
                </a-form>
            </a-col>
        </a-row>
        
    </div>
</template>
<script lang="ts" setup>
import { ref, reactive } from 'vue';
import { JUserModal } from '/@/components/Form';
import { contractorList, contractorEdit } from '../api/index'
const formRef = ref();
const formState = reactive({
    region: 'shanghai',
});
const rules = { region: [{ required: true, message: '请选择活动区域', trigger: 'change' }] };
const labelCol = { span: 6 };
const wrapperCol = { span: 16 };
const edit = ref(true);

const cList = ref<any[]>([]);
contractorList().then(res => {
    cList.value = res;
})

const editClick = () => {
    edit.value = true;
};

const cancel = () => {
    edit.value = false;
};

const submitIng = ref(false);
const onSubmit = () => {
    submitIng.value = true;
    contractorEdit(cList.value).then(res => {
        submitIng.value = false;
    }).catch(err => {
        submitIng.value = false;
    })
};

</script>
<style lang="less" scoped>
.contain-company{
    width: 100%;
    height: 100%;
    background-color: #ffffff;
    padding: 20px;
}
</style>