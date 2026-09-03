<!-- 统计表公共头部 -->
<template>
  <div class="title">
    <div class="left">
      {{ title }}
    </div>
    <div class="right">
      <template v-if="type == 0">
        申请单位：
        <a-select
          v-model:value="dept"
          show-search
          style="width: 180px"
          :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
          placeholder="请选择"
          @change="changeDept"
          :options="listData"
          :fieldNames="{ label: 'departName', value: 'orgCode' }"
        />
      </template>
      <template v-if="type == 1">
        <a-date-picker
          style="width: 180px"
          :format="monthFormat"
          v-model:value="Ym"
          :valueFormat="monthFormat"
          @change="changeMonth"
          picker="month"
        />
      </template>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import dayjs, { Dayjs } from 'dayjs';
  import { ref, watch } from 'vue';
  const props = defineProps({
    title: { type: String, default: '' },
    type: { type: Number, default: 0 },
    listData: { type: Array, default: () => [] },
  });

  const dept = ref<string>('');

  const monthFormat = 'YYYY-MM';
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1 < 10 ? '0' + (now.getMonth() + 1) : now.getMonth() + 1;
  const Ym = ref<Dayjs>(dayjs(year + '-' + month, monthFormat));

  const emits = defineEmits(['change']);

  // 申请单位change 筛选
  const changeDept = (e) => {
    emits('change', e);
  };

  // 月份change 筛选
  const changeMonth = (e, dateString) => {
    emits('change', dateString);
  };
  watch(
    props.listData,
    (n: any) => {
      if (n[0]) {
        // 默认选中第一级
        dept.value = n[0].orgCode;
        emits('change', dept.value);
      }
    },
    { deep: true }
  );
</script>

<style lang="less" scoped>
  .title {
    height: 55px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    .left {
      position: relative;
      padding-left: 10px;
      font-size: 16px;
      font-weight: 600;
      &::before {
        content: '';
        width: 4px;
        height: 18px;
        background: #1890ff;
        border-radius: 2px;
        position: absolute;
        top: 50%;
        left: 0;
        transform: translateY(-50%);
      }
    }
  }
</style>
