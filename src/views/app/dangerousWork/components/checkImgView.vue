<template>
  <div class="check-img-view" v-if="groups.length">
    <div class="img-group" v-for="group in groups" :key="group.id || 'legacy'">
      <div class="group-title" v-if="group.name">
        <span class="group-index">({{ group.id }})</span>
        {{ group.name }}
      </div>
      <AppUpload :fileList="group.url" :disabled="true" text="" />
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { computed } from 'vue';
  import AppUpload from '/@/components/App/AppUpload.vue';
  import { resolveCheckImgGroups } from '/@/views/hazardousOperation/constants/checkImg';

  const props = defineProps({
    // 检查/整改记录，需含 imgType、imgJson、imgUrl
    record: {
      type: Object,
      default: () => ({}),
    },
  });

  // imgType=1 按 5 类展示，旧数据仍按不分类的 imgUrl 展示
  const groups = computed(() => resolveCheckImgGroups(props.record));
</script>
<style lang="less" scoped>
  .check-img-view {
    width: 100%;
  }
  .img-group {
    & + .img-group {
      margin-top: 10px;
    }
    .group-title {
      color: #222222;
      margin-bottom: 6px;
    }
    .group-index {
      color: #1989fa;
      font-weight: 600;
    }
  }
</style>
