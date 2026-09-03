<template>
  <div v-if="type === 'input'">
    <a-input
      v-model:value="value"
      :placeholder="placeholder"
      :maxlength="maxLength"
      :defaultValue="defaultValue"
      @change="change"
      :disabled="disabled"
    >
      <template #suffix>
        <slot name="suffix"></slot>
      </template>
    </a-input>
  </div>
  <div v-if="type === 'Date'">
    <a-range-picker
      v-model:value="value"
      :placeholder="placeholder"
      :value-format="valueFormat"
      :format="format"
      :show-time="showTime"
      @change="change"
      :disabled="disabled"
    >
      <template #separator>
        <slot name="separator"></slot>
      </template>
      <template #suffixIcon>
        <slot name="suffixIcon"></slot>
      </template>
    </a-range-picker>
  </div>
  <div v-if="type === 'select'">
    <a-select
      v-model:value="value"
      :fieldNames="fieldNames"
      :mode="mode"
      :options="options"
      :showSearch="showSearch"
      :placeholder="placeholder"
      :filterOption="filterOption"
      @change="change"
      @search="search"
      :showArrow="showArrow"
      :disabled="disabled"
    />
  </div>
  <div v-if="type === 'number'">
    <a-input-number
      v-model:value="value"
      :maxLength="maxLength"
      :placeholder="placeholder"
      :decimalSeparator="decimalSeparator"
      :precision="precision"
      :formatter="formatter"
      @change="change"
      :max="max"
    >
      <template #addonAfter>
        <slot name="addonAfter"></slot>
      </template>
    </a-input-number>
  </div>
  <div v-if="type === 'readonly'">
    <a-input v-model:value="value" disabled />
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import type { selectOption } from '../type';
  const prop = withDefaults(
    defineProps<{
      type: string;
      defaultValue?: string;
      disabled?: boolean;
      placeholder?: string | string[];
      mode?: string;
      showTime?: boolean;
      decimalSeparator?: number;
      format?: string;
      maxLength?: number;
      precision?: number;
      formatter?: (value: number | string, info: { userTyping: boolean; input: string }) => string;
      max?: number;
      showSearch?: boolean;
      valueFormat?: string;
      showArrow?: boolean;
      modelValue?: unknown;
      options?: selectOption[];
      fieldNames?: { label: string; value: string; options: string };
      filterOption?: (input: string, option: any) => boolean | boolean;
    }>(),
    { showArrow: true }
  );
  const emits = defineEmits(['update:modelValue', 'change', 'search']);
  const value = computed({
    get: () => prop.modelValue,
    set: (value) => {
      emits('update:modelValue', value);
    },
  });
  const change = (value: any) => {
    emits('change', value);
  };
  const search = (value: any) => {
    emits('search', value);
  };
</script>

<style scoped></style>
