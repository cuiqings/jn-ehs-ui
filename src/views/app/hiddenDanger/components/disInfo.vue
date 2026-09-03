<template>
  <van-field class="myfield" label-align="top" v-if="formData.repairPicture" name="repairPicture" label="整改后照片">
    <template #input>
      <div class="img-wrap">
        <van-image
          v-for="(item, index) in formData.repairPicture"
          @click.stop="preview(index, formData.repairPicture)"
          :key="index"
          width="100"
          height="100"
          :src="item"
        />
      </div>
    </template>
  </van-field>
  <van-field v-model="formData.repairExplain" v-if="formData.repairExplain" name="repairExplain" autosize type="textarea" label="整改描述" />
  
</template>

<script lang="ts" setup>
  import { showImagePreview } from 'vant';

  const props = withDefaults(
    defineProps<{
      readonly?: boolean;
      formData: any;
    }>(),
    {
      formData: () => {},
      readonly: false,
    }
  );
  const { formData, readonly } = props;

  // 图片预览
  const preview = (idx, list) => {
    showImagePreview({
      images: list,
      startPosition: idx,
    });
  };
</script>

<style lang="less" scoped>
  .myfield {
    .van-field__value {
      max-width: 100%;
    }
  }
  .img-wrap {
    width: auto;
    height: auto;
    // display: flex;
    // overflow-y: hidden;
    // overflow-x: scroll;
    // padding-bottom: 20px;
    // box-sizing: content-box;
    .van-image {
      flex-shrink: 0;
      width: 100px;
      margin: 0px 5px;
    }
  }
</style>
