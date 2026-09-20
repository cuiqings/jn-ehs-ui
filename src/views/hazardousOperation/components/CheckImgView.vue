<template>
  <div class="check-img-view" v-if="groups.length">
    <div class="img-group" v-for="group in groups" :key="group.id || 'legacy'">
      <div class="group-title" v-if="group.name">
        <span class="group-index">({{ group.id }})</span>
        {{ group.name }}
      </div>
      <div class="img-list">
        <div
          class="img-item"
          v-for="(url, idx) in group.urlList"
          :key="idx"
          @click="handlePreview(group.urlList, idx)"
        >
          <JImageUpload :value="url" disabled text="" bizPath="hiddenTrouble" :fileMax="1" />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { computed } from 'vue';
  import { JImageUpload } from '/@/components/Form';
  import { resolveCheckImgGroups } from '../constants/checkImg';
  import { getFileAccessHttpUrl } from '/@/utils/common/compUtils';
  import { createImgPreview } from '/@/components/Preview/index';

  const props = defineProps({
    record: {
      type: Object,
      default: () => ({}),
    },
  });

  const groups = computed(() => {
    return resolveCheckImgGroups(props.record).map((group) => {
      const urlList = group.url
        ? group.url
            .split(',')
            .map((u) => u.trim())
            .filter(Boolean)
        : [];
      return { ...group, urlList };
    });
  });

  function handlePreview(urlList: string[], index: number) {
    const fullUrls = urlList.map((u) => getFileAccessHttpUrl(u));
    createImgPreview({ imageList: fullUrls, index });
  }
</script>

<style lang="less" scoped>
.check-img-view {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: flex-start;
}

.img-group {
  flex: 0 0 auto;

  .group-title {
    margin-bottom: 4px;
    font-size: 13px;
  }

  .group-index {
    color: #1890ff;
    font-weight: 600;
  }

  /* 图片横排，最多3列换行 */
  .img-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    max-width: 340px;
  }

  .img-item {
    flex: 0 0 auto;
  }
}
</style>
