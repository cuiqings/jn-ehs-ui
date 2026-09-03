<template>
    <BasicModal :canFullscreen="false" :footer="null" width="400px" v-bind="$attrs" @register="register" title="扫码考试">
        <img :src="imgUrl" style="width: 380px; display: block; margin: 0 auto 8px" />
    </BasicModal>
</template>
<script lang="ts" setup>
import { BasicModal, useModalInner } from '/@/components/Modal';
import { useGlobSetting } from '/@/hooks/setting';
import { ref } from 'vue';
 import QRCode from 'qrcode';

const options = ref('');
const imgUrl = ref('');
const [register] = useModalInner(async (data) => {
    options.value = JSON.stringify({
        type: 'common',
        id: data.id,
        title: data.examPaperName,
        name: data.examPaperName,
        url: useGlobSetting().appUrl + '/app/student/examredct?token='
    });
    imgUrl.value = await QRCode.toDataURL(options.value, { width: 800 });
});
</script>