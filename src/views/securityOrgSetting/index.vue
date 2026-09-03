<template>
  <div class="m-2 p-3" style="background: #fff; height: 100%; overflow-y: hidden">
    <a-form ref="formRef" :model="queryParam" :label-col="labelCol" :wrapper-col="wrapperCol">
      <a-row :gutter="24">
        <a-col :md="6" :sm="12">
          <a-form-item label="安全管理岗">
            <JDictSelectTag v-model:value="queryParam.post" placeholder="请选择安全管理岗" dictCode="safety_management_post" />
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
  import JDictSelectTag from '/@/components/Form/src/jeecg/components/JDictSelectTag.vue';
  import { ref, provide, reactive } from 'vue';
  import JobPending from './JobPending.vue';

  const activeKey = ref('1');
  const jobPending = ref();
  const queryParam = ref({ post: null });
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
    queryParam.value.post = null;
    jobPending.value.getList({});
  };

  provide('state', activeKey);
</script>

<style lang="scss" scoped></style>
