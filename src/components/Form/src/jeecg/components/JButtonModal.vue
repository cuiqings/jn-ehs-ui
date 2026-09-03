<template>
  <div>
    <a-button v-if="!value" v-bind="attrs" :style="buttonStyle" :type="type" :disabled="disabled">{{ text }}</a-button>
    <!-- <img v-if="value" style="height: 80px; width: 80px" :src="value" /> -->
    <div v-if="valueType === 'img'" style="display: flex; flex-wrap: wrap">
      <img v-for="(item, index) in value" style="width: 80px; height: 80px; object-fit: contain; margin: 10px" :src="item[imgKey]" :key="index" />
    </div>
  </div>
</template>
<script lang="ts" setup>
  defineProps({
    value: {
      type: String,
      default: '',
    },
    isButton: {
      type: Boolean,
      default: false,
    },
    text: {
      type: String,
      default: '按钮',
    },
    type: {
      type: String,
      default: 'primary',
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    buttonStyle: {
      type: Object,
    },
    valueType: {
      type: String,
    },
    imgKey: {
      type: String,
      default: 'img',
    },
  });
</script>
