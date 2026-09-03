<template>
    <van-image style="margin: 10px 10px 0 0" v-for="(item, idx) in imgList" @click="preview(idx)" width="100" height="100" :src="item" />
</template>

<script lang="ts" setup>
import { getFileAccessHttpUrl } from '/@/utils/common/compUtils';
import { ref } from 'vue'
import { showImagePreview } from 'vant';
const props = defineProps({
    src: {
        type: String,
        default: ''
    }
})
const imgList = ref<string[]>([]);
if(props.src) {
    imgList.value = props.src.split(',');
    imgList.value = imgList.value.map(item => getFileAccessHttpUrl(item))
}
const preview = (idx: number) => {
    showImagePreview({
        images: imgList.value,
        startPosition: idx,
        closeable: true,
    });
}

</script>