<template>
  <div class="m-2 p-3" style="background: #fff; height: 100%">
    <BasicForm @register="registerForm" @submit="onSubmit" @reset="resetForm" />
    <a-tabs v-model:activeKey="activeKey" @change="tabChange" style="height: 100%; width: 100%">
      <a-tab-pane forceRender v-for="(item, idx) in tabs" :key="idx" :tab="item.label">
        <Job-pending ref="jobPending" :getFieldsValue="getFieldsValue" :thisState="item.value" :show="item.show" />
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script setup name="HazardousOperation-jobManagement">
  import { ref, provide, nextTick, onMounted } from 'vue';
  import JobPending from './JobPending.vue';
  import { useContent } from '../hooks/useContent';
  import { BasicForm, JImageUpload } from '/@/components/Form';
import { set } from 'nprogress';

  const { registerForm, getFieldsValue, updateSchema, init, departList } = useContent();
  const activeKey = ref(0);
  const jobPending = ref();
  // 类型1.审批中2.待作业3.作业中4.待验收5.已验收
  const tabs = [
    {
      value: '1',
      label: '审批中',
      show: true,
    },
    {
      value: '2',
      label: '待作业',
      show: true,
    },
    {
      value: '3',
      label: '作业中',
      show: true,
    },
    {
      value: '7',
      label: '作业中-作业中断',
      show: true,
    },
    // {
    //   value: '4',
    //   label: '待验收',
    //   show: true,
    // },
    {
      value: '5',
      label: '已验收',
      show: true,
    },
  ];
  
  onMounted(async () => {
    await init();
    const formData = await getQueryFormData();
    jobPending.value[0].pageInit(tabs[0].value, formData);
  });
  const tabChange = (value) => {
    updateSchema({
      field: 'checkMark',
      show: ['2'].includes(value.toString()),
    });
    nextTick(async () => {
      refreshPage();
    })
  }

  const getQueryFormData = async () => {
    const formData = await getFieldsValue();
    if (!formData.applicationUnit && departList.value && departList.value.length) {
      // 申请单位未选择时仅给查询补集团根编码，不回写表单，避免重置后显示 A04。
      return { ...formData, applicationUnit: departList.value[0].key };
    }
    return formData;
  };

  const refreshPage = async () => {
    const formData = await getQueryFormData();
    jobPending.value[activeKey.value].pageInit(tabs[activeKey.value].value, formData);
  };
  let formState = ref({});
   // 表单提交
  const onSubmit = (value) => {
    if (value.endTime) {
      value.endTime = value.endTime + ' 23:59:59';
    }
    if (value.startTime) {
      value.startTime = value.startTime + ' 00:00:00';
    }
    if (value.workStartTime) {
      value.workStartTime = value.workStartTime + ' 00:00:00';
    }
    if (value.workEndTime) {
      value.workEndTime = value.workEndTime + ' 23:59:59';
    }
    formState.value = { ...value };
    refreshPage();
  };
  // 重置表单
  const resetForm = (value) => {
    refreshPage();
  };
</script>

<style lang="scss" scoped></style>
