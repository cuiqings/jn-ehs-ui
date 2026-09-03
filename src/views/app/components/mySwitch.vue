<template>
  <div class="my-switch">
    <span :class="{ active: item.value == activeIdx }" @click="itemClick(item.value)" v-for="item in options">{{ item.label }}</span>
  </div>
</template>
<script lang="ts" setup>
  const psops = defineProps({
    options: {
      type: Array,
      default: () => [],
    },
    activeIdx: {
      type: String,
      default: '0',

    },
  });
  const emits = defineEmits(['update:activeIdx', 'change']);
  const itemClick = (val) => {
    if(val == psops.activeIdx){
      return;
    }
    emits('change')
    emits('update:activeIdx', val);
  };
</script>
<style lang="less" scoped>
  .my-switch {
    width: auto;
    display: flex;
    justify-content: space-between;
    border-radius: 5px;
    overflow: hidden;
    border: 1px solid #409eff;
    span {
      padding: 0 10px;
      text-align: center;
      background: #eee;
      height: 100%;
      display: flex;
      align-items: center;
      &.active {
        background: #409eff;
        color: #fff;
      }
    }
  }
</style>
