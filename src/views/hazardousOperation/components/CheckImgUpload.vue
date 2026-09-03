<template>
  <div class="check-img-upload">
    <div class="img-group" v-for="cat in CHECK_IMG_CATEGORIES" :key="cat.id">
      <div class="group-title">
        <span class="group-index">({{ cat.id }})</span>
        {{ cat.name }}
        <span class="group-optional" v-if="!cat.required">（非必填）</span>
      </div>
      <JImageUpload
        :value="csv(cat.id)"
        @update:value="onChange(cat.id, $event)"
        :isYhWatermark="true"
        :fileMax="CHECK_IMG_MAX_COUNT"
        :disabled="disabled"
        text=""
        bizPath="hiddenTrouble"
      />
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { JImageUpload } from '/@/components/Form';
  import { CHECK_IMG_CATEGORIES, CHECK_IMG_MAX_COUNT, findMissingCategories, toUrlList } from '../constants/checkImg';
  import type { CheckImgMap } from '../constants/checkImg';

  const props = defineProps({
    value: {
      type: Object,
      default: () => ({}),
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  });
  const emits = defineEmits(['update:value']);

  // JImageUpload 收发的都是逗号拼接的短路径
  const csv = (catId: string) => toUrlList(props.value[catId]).join(',');

  const onChange = (catId: string, val: string) => {
    emits('update:value', { ...props.value, [catId]: toUrlList(val) });
  };

  /** 供 a-form-item rules 的 validator 调用 */
  const validate = () => {
    const missing = findMissingCategories(props.value as CheckImgMap);
    if (missing.length) {
      return Promise.reject(`请上传（${missing[0].id}）${missing[0].name}`);
    }
    return Promise.resolve();
  };

  defineExpose({
    validate,
  });
</script>
<style lang="less" scoped>
  .img-group {
    & + .img-group {
      margin-top: 8px;
    }
    .group-title {
      margin-bottom: 4px;
    }
    .group-index {
      color: #1890ff;
      font-weight: 600;
    }
    .group-optional {
      color: #999999;
      font-size: 12px;
    }
  }
</style>
