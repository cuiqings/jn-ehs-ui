<template>
  <van-field v-model="formData.departName" v-if="route.name != 'AppHiddenDangerEdit' && route.name != 'AppHiddenDangerDetail' " name="departName" label="隐患来源" placeholder="隐患来源">
    <template #input>
      {{ filterDictTextByCache('yh_hidden_source', formData.confirm.sourceType) }}
    </template>
  </van-field>
  <template v-if="formData.sourceType == 1 || (formData.confirm && formData.confirm.sourceType == 1)">
    <van-field readonly v-model="formData.plan.planName" name="planName" label="巡检计划" placeholder="巡检计划" />
    <van-field readonly v-model="formData.itemName" name="itemName" label="检查项" placeholder="检查项">
      <template #input>
        <div>
        {{ filterDictTextByCache('check_sort', formData.itemType) }}<span v-if="formData.itemName">></span>
              {{ formData.itemName }}
        </div>
      </template>
    </van-field>
  </template>
  <van-field autosize label-align="top" name="yhPicture" label="隐患照片">
    <template #input>
      <div class="img-wrap">
        <van-image
          v-for="(item, index) in formData.yhPicture"
          @click.stop="preview(index, formData.yhPicture)"
          :key="index"
          width="100"
          height="100"
          :src="item"
        />
      </div>
    </template>
  </van-field>
  <van-field
    :readonly="readonly"
    v-model="formData.confirm.yhDescription"
    name="yhDescription"
    autosize
    type="textarea"
    label=" 隐患描述"
    placeholder=" 隐患描述"
  />

  <van-field
    v-if="formData.confirm.yhPlaceName"
    :readonly="readonly"
    v-model="formData.confirm.yhPlaceName"
    name="yhPlaceName"
    label="隐患地点"
    placeholder="隐患地点"
  />
  <van-field v-else :readonly="readonly" v-model="formData.confirm.yhPlaceName" name="yhPlaceName" label="隐患地点" placeholder="隐患地点">
    <template #input>
      {{ formData.confirm.yhPlaceOrgName }} 
      <template v-if="formData.confirm.yhPlaceOrgName && formData.confirm.yhPlaceDepartName && formData.confirm.yhPlaceOrgName !== formData.confirm.yhPlaceDepartName">></template>
      {{ formData.confirm.yhPlaceOrgName !== formData.confirm.yhPlaceDepartName ? formData.confirm.yhPlaceDepartName : '' }}
    </template>
  </van-field>
  <!-- <template v-if="formData.confirm.sourceType == 2"> -->
    <van-field label-width="90" v-show="formData.repairDate" :readonly="readonly" v-model="formData.repairDate" name="reporterName" label="限定整改日期" placeholder="限定整改日期" />
    <van-field :readonly="readonly" v-model="formData.reporterName" name="reporterName" label="提报人" placeholder="提报人" />
    <van-field :readonly="readonly" v-model="formData.reporterPhone" type="tel" name="reporterPhone" label="提报人电话" />
    <van-field :readonly="readonly" v-model="formData.reportTime" type="text" name="reportTime" label="提报时间" />
  <!-- </template> -->
  <!-- <template v-else>
    <van-field :readonly="readonly" v-model="formData.reporterName" name="reporterName" label="检查人" placeholder="提报人" />
    <van-field :readonly="readonly" v-model="formData.reporterPhone" type="tel" name="reporterPhone" label="检查时间" placeholder="提报人电话" />
  </template> -->
</template>

<script lang="ts" setup>
  import { showImagePreview } from 'vant';
  import { useRoute } from 'vue-router';
  import { filterDictTextByCache } from '/@/utils/dict/JDictSelectUtil';
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
  
  const route = useRoute();
  console.log(formData, '9999');

  // 图片预览
  const preview = (idx, list) => {
    showImagePreview({
      images: list,
      startPosition: idx,
    });
  };
</script>

<style lang="less">
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
