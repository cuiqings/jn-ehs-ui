<template>
    <div class="top-box">
        <div class="top-box-left">{{ props.title }}</div>
        <div class="top-box-right">
            <a-button @click="handle('edit')" class="erterBtn" type="primary" v-auth="'enterprise:edit'" v-if="isEdit">编辑</a-button>
            <a-button @click="handle('cancel')" class="erterBtn" v-auth="'enterprise:cancel'" v-if="!isEdit" style="margin-right:16px">取消</a-button>
            <a-button @click="handle('save')" class="erterBtn" type="primary" v-auth="'enterprise:save'" v-if="!isEdit">保存</a-button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
const emit = defineEmits(['btnBack']);
const props = defineProps({
    title: { type: String, default: '' },
});
const isEdit = ref<Boolean>(true)
const handle = ((s) => {
    switch (s) {
        case 'edit':
            isEdit.value = false;
            break;
        default:
            isEdit.value = true;
            break;
    }
    emit('btnBack', s);
})
</script>

<style lang="less" scoped>
.top-box {
    display: flex;
    justify-content: space-between;
    line-height: 40px;
    margin-bottom:30px;
    &-left {
        font-size: 22px;
        font-family: Source Han Sans CN-Bold, Source Han Sans CN;
        font-weight: bold;
        color: #3E87F8;
    }

    &-right {
        .erterBtn {
            width: 112px;
            height: 40px;
            border-radius: 4px 4px 4px 4px;
        }
    }
}</style>
  