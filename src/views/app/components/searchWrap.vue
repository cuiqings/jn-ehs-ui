<template>
    <van-popup v-model:show="computedShow" position="right" @close="close" :style="{ width: '80%', height: '100%' }">
        <div class="search-box">
            <div class="tit">筛选条件<van-icon @click="close" name="cross" /></div>
            <div class="s-main">
                <slot></slot>
            </div>
            <div class="s-foot">
                <van-button @click="reset" type="default">重置</van-button>
                <van-button @click="confirm" type="primary">查询</van-button>
            </div>
        </div>
    </van-popup>
</template>
<script setup lang="ts">
import { computed, ref } from 'vue';
const props = defineProps<{
    visible: boolean;
}>();

const emits = defineEmits<{
    (e: 'confirm'): void;
    (e: 'reset'): void;
    (e: 'update:visible', value: boolean): void;
}>();
const computedShow = computed(() => props.visible)
const confirm = () => {
    emits('confirm');
    emits('update:visible', false);
};
const reset = () => {
    emits('reset');
    emits('update:visible', false);
};
const close = () => {
    emits('update:visible', false);
};
</script>
<style lang="less" scoped>
.search-box {
    width: 100%;

    .tit {
        display: flex;
        font-weight: 600;
        justify-content: space-between;
        padding: 10px 16px;
    }

    .s-foot {
        display: flex;
        justify-content: space-around;
    }
}
</style>