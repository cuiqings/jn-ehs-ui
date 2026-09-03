<template>
  <div class="sm_home">
    <img :src="smHome" />
  </div>
</template>
<script setup lang="ts">
  import smHome from '/@/assets/images/sm/sm_home.png';
</script>
<style lang="less" scoped>
  .sm_home {
    img {
      height: calc(100vh - 98px);
      width: 100%;
      object-fit: cover;
    }
  }
</style>
