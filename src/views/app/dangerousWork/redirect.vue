<template>
  <div></div>
</template>
<script lang="ts" setup>
/**
 * /app/dangerousWork/redirect?id=1778298104777412608&workType=5&pageType=detail
 * 延时审批 /app/dangerousWork/redirect?id=1780075701098123264&workType=3&pageType=edit&exam=true&delayedMark=true
 * type: 2:待作业; 3: 作业中; 4: 待验收; 5: 已验收;
 * /app/dangerousWork/redirect?name=manage&active=2
 * 
 */

  import { useRoute, useRouter } from 'vue-router';
  const pageMap = {
    1: '/app/dangerousWork/approvedetail',
    2: '/app/dangerousWork/approvedetail',
    3: '/app/dangerousWork/approvedetail',
    4: '/app/dangerousWork/approvedetail',
    5: '/app/dangerousWork/approvedetail',
    6: '/app/dangerousWork/approvedetail',
    7: '/app/dangerousWork/approvedetail',
    9: '/app/dangerousWork/approvedetail',
    8: '/app/unhazardousWork/approvedetail',
    100: '/app/dangerousWork/manage',
    101: '/app/unhazardousWork/manage',
  };
  const route = useRoute();
  const router = useRouter();
  if (route.query.name == 'manage') {
    if(route.query.workType == '8') {
      router.replace({
        path: pageMap[101],
        query: route.query,
      });
    } else {
      router.replace({
        path: pageMap[100],
        query: route.query,
      });
    }
  } else {
    router.replace({
      path: pageMap[route.query.workType as string],
      query: route.query,
    });
  }
</script>
