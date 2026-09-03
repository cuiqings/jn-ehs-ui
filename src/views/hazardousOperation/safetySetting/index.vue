<template>
  <div class="m-2 p-3" style="background: #fff; height: 100%; overflow-y: hidden">
    <a-form ref="formRef" :model="queryParam" :label-col="labelCol" :wrapper-col="wrapperCol">
      <a-row :gutter="24">
        <a-col :md="6" :sm="12">
          <a-form-item label="作业类型">
            <a-select v-model:value="queryParam.workType" allowClear placeholder="请选择">
              <template v-for="item in work_type" :key="`${item.value}`">
                <a-select-option :value="item.value">{{ item.label }}</a-select-option>
              </template>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :md="6" :sm="12">
          <a-button type="primary" preIcon="ant-design:search-outlined" @click="searchQuery">查询</a-button>
          <a-button type="primary" preIcon="ant-design:reload-outlined" @click="searchReset" style="margin-left: 8px">重置</a-button>
        </a-col>
      </a-row>
    </a-form>
    <a-row class="pb-4" :gutter="24">
      <a-col :md="6" :sm="12">
        <a-button type="primary" @click="add">新增</a-button>
        <a-button type="default" @click="del" style="margin-left: 8px">批量删除</a-button>
      </a-col>
    </a-row>
    <Job-pending ref="jobPending" :thisState="activeKey" />
  </div>
</template>

<script setup lang="ts" name="HazardousOperation-jobManagement">
  import { ref, provide, reactive, computed } from 'vue';
  import JobPending from './JobPending.vue';
  import { useUserStore } from '/@/store/modules/user';
  const userStore: any = useUserStore();
  let work_type = computed(() => {
    let list = JSON.parse(JSON.stringify(userStore.getAllDictItems.work_type));
    list.push({ label: '非高危作业', value: 8 });
    return list;
  });

  const activeKey = ref('1');
  const jobPending = ref();
  const queryParam = ref({ workType: null });
  const labelCol = reactive({
    xs: { span: 24 },
    sm: { span: 5 },
  });

  const wrapperCol = reactive({
    xs: { span: 24 },
    sm: { span: 18 },
  });

  const add = () => {
    jobPending.value.add();
  };

  const del = () => {
    jobPending.value.batchDel();
  };

  const searchQuery = () => {
    jobPending.value.getList(queryParam.value);
  };

  const searchReset = () => {
    queryParam.value.workType = null;
    jobPending.value.getList({});
  };

  provide('state', activeKey);
</script>

<style lang="scss" scoped></style>
