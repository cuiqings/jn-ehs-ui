<template>
    <div class="redct" v-loading="laoding"></div>
</template>
<script lang="ts" setup> 
import { ref } from 'vue';
import { qrCodeExam } from '../../index.api';
import { useRoute, useRouter } from 'vue-router';
const route = useRoute();
const router = useRouter();
const laoding = ref(true);
qrCodeExam({
    id: route.query.id,
}).then(res => {
    router.replace(`/app/student/exam?taskId=${route.query.id}&contentId=null&examType=0`);
    sessionStorage.setItem('examPaper', JSON.stringify(res));
    sessionStorage.setItem('identify', 'true');
})
</script>