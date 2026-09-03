<template>
  <div class="check-img-upload">
    <div class="img-group" v-for="cat in CHECK_IMG_CATEGORIES" :key="cat.id">
      <div class="group-title">
        <span class="group-index">({{ cat.id }})</span>
        {{ cat.name }}
        <span class="group-optional" v-if="!cat.required">（非必填）</span>
      </div>
      <RealCameraUpload
        ref="uploadRefs"
        :businessId="cacheKey(cat.id)"
        :id="cacheKey(cat.id)"
        :key="cacheKey(cat.id)"
        :maxCount="CHECK_IMG_MAX_COUNT"
        :value="value[cat.id] || []"
        @update:value="onChange(cat.id, $event)"
        albumText="离线相册"
        biz="dangerousWork"
      />
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { ref } from 'vue';
  import { showFailToast } from 'vant';
  import RealCameraUpload from '/@/components/App/RealCameraUpload.vue';
  import { uploadFile } from '/@/api/common/api';
  import { CHECK_IMG_CATEGORIES, CHECK_IMG_MAX_COUNT, findMissingCategories, toUrlList } from '/@/views/hazardousOperation/constants/checkImg';
  import type { CheckImgMap } from '/@/views/hazardousOperation/constants/checkImg';

  const props = defineProps({
    value: {
      type: Object,
      default: () => ({}),
    },
    // 每个分类的相册/原生回调都要独立，用它拼出唯一 key
    businessId: {
      type: String,
      default: 'checkImg',
    },
  });
  const emits = defineEmits(['update:value']);
  const uploadRefs = ref<any[]>([]);

  const cacheKey = (catId: string) => `${props.businessId}_${catId}`;

  const onChange = (catId: string, list: string[]) => {
    emits('update:value', { ...props.value, [catId]: list || [] });
  };

  const base64ToFile = async (base64Str: string, fileName: string): Promise<File> => {
    const res = await fetch(base64Str);
    const blob = await res.blob();
    return new File([blob], fileName, { type: blob.type });
  };

  /** 拍照失败时组件里留的是 base64，提交前补传一次 */
  const uploadPendingPhotos = async (catId: string) => {
    const list = toUrlList(props.value[catId]);
    const uploaded = await Promise.all(
      list.map((str, i) => {
        if (!str.startsWith('data:image')) return Promise.resolve(str);
        return new Promise<string>(async (resolve, reject) => {
          const params = {
            file: await base64ToFile(str, `photo${catId}_${i}.jpg`),
            data: { biz: 'dangerousWork' },
          };
          uploadFile(
            params,
            (res) => {
              if (res.success) {
                resolve(res.message);
              } else {
                showFailToast('网络环境不佳请稍后重试！');
                reject(new Error('upload failed'));
              }
            },
            () => reject(new Error('upload failed'))
          );
        });
      })
    );
    return uploaded;
  };

  /** 供表单 rules 调用：true 通过，返回字符串则作为错误提示 */
  const validate = async (): Promise<true | string> => {
    const missing = findMissingCategories(props.value as CheckImgMap);
    if (missing.length) {
      return `请上传（${missing[0].id}）${missing[0].name}`;
    }
    try {
      const next: CheckImgMap = { ...(props.value as CheckImgMap) };
      await Promise.all(
        CHECK_IMG_CATEGORIES.map(async (cat) => {
          next[cat.id] = await uploadPendingPhotos(cat.id);
        })
      );
      emits('update:value', next);
      return true;
    } catch (err) {
      return '图片上传中请稍后！';
    }
  };

  const clearCachedPhotos = async () => {
    await Promise.all((uploadRefs.value || []).map((item) => item?.clearCachedPhotos()));
  };

  /** 按照片分类删除已提交缓存，不影响同类别下未使用的照片。 */
  const removeCachedPhotos = async (sourceMap: CheckImgMap) => {
    await Promise.all(CHECK_IMG_CATEGORIES.map((cat, index) => uploadRefs.value?.[index]?.removeCachedPhotos(toUrlList(sourceMap[cat.id]))));
  };

  defineExpose({
    validate,
    removeCachedPhotos,
    clearCachedPhotos,
  });
</script>
<style lang="less" scoped>
  .check-img-upload {
    width: 100%;
  }
  .img-group {
    & + .img-group {
      margin-top: 12px;
    }
    .group-title {
      color: #222222;
      margin-bottom: 6px;
    }
    .group-index {
      color: #1989fa;
      font-weight: 600;
    }
    .group-optional {
      color: #969799;
      font-size: 12px;
    }
  }
</style>
