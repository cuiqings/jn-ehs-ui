<template>
    <van-dialog v-model:show="showDialog" :title="title" :beforeClose="backBeforeClose" show-cancel-button>
        <van-field
            required
            rows="2"
            autosize
            label=""
        >
            <template #input> 已选{{checkData?.length}}项物资，是否进行检验？</template>
        </van-field>
         <van-field
            v-model="formData.dateStr"
            required
            readonly
            label="检验有效期"
            placeholder="请选择"
            @click="calendarShow = true"
        />
    </van-dialog>
    <van-calendar v-model:show="calendarShow" @confirm="onConfirm" />
</template>

<script lang="ts" setup>
import { suppliesCheck, suppliesCheckBatch } from '/@/views/emergencyNew/api'
  import dayjs, { Dayjs } from 'dayjs';
import { showToast } from 'vant';
import { ref, computed } from 'vue'
const title = ref('检验')
const dateStr = ref('')
const props = defineProps({
    visable: Boolean,
    message: String,
    checkData: Array,
})
const showDialog = computed(() => props.visable)
const calendarShow = ref(false)
const formData = ref({
    dateStr: '',
    ids: ''
})
const onConfirm = (value: string) => {
    formData.value.dateStr = dayjs(value).format('YYYY-MM-DD');
    calendarShow.value = false
}

const emits = defineEmits(['update:visable', 'success'])
const backBeforeClose = (str) => {
    if(str === 'cancel') {
        emits('update:visable', false)
        return;
    }
    if(!formData.value.dateStr) {
        showToast('请选择检验有效期！');
        return false;
    }
    formData.value.ids = props.checkData.map((item) => item.id).join(',');
    return new Promise((resolve) => {
         suppliesCheckBatch({
            id: formData.value.ids,
            checkDate: formData.value.dateStr
        }).then(res => { 
            resolve(true)
            emits('success')
            emits('update:visable', false)
            reset();
        }).catch(err => {
            resolve(false)
        })
    })
   
}
function reset () {
    formData.value.ids = ''
    formData.value.dateStr = ''
}
</script>

<style lang="less" scoped>

</style>
