<template>
  <a-space style="display: flex; flex-wrap: wrap">
    <a-dropdown placement="bottom">
      <a-button type="primary"> 手机端App下载 </a-button>
      <template #overlay>
        <img src="../../../assets/images/appQrCode.jpeg" style="width: 200px; height: 200px" />
      </template>
    </a-dropdown>
  </a-space>
</template>
<script lang="ts" setup></script>
