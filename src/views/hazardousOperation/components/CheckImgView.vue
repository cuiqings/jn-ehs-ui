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
        >
          <JImageUpload
            :value="url"
            disabled
            text=""
            bizPath="hiddenTrouble"
            :fileMax="1"
            :previewImageList="group.urlList"
            :previewIndex="idx"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { computed } from 'vue';
  import { JImageUpload } from '/@/components/Form';
  import { resolveCheckImgGroups } from '../constants/checkImg';

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
    cursor: pointer;

    .thumb-img {
      width: 80px;
      height: 80px;
      object-fit: cover;
      border-radius: 4px;
      border: 1px solid #e8e8e8;
      transition: opacity 0.2s;

      &:hover {
        opacity: 0.85;
      }
    }
  }
}
</style>
