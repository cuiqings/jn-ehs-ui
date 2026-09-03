<template>
  <BasicDrawer @register="registerModal" :showFooter="true" width="50%" v-bind="$attrs" :title="title" @ok="submit" @cancel="close" @close="close">
    <a-form size="small" ref="formRef" :model="formState" layout="vertical">
      <a-form-item label="活动主题" name="title" :rules="[{ required: true, message: '请输入' }]">
        <a-textarea :auto-size="{ maxRows: 1 }" v-model:value="formState.title" :maxLength="30" placeholder="请输入活动主题" />
      </a-form-item>
       <a-form-item label="活动时间" name="playDate" :rules="[{ required: true, message: '请选择' }]">
        <a-date-picker v-model:value="formState.playDate" format="YYYY-MM-DD" valueFormat="YYYY-MM-DD" />
      </a-form-item>
      <a-form-item label="活动地点" name="playLocation">
        <a-textarea :auto-size="{ maxRows: 1 }" v-model:value="formState.playLocation" :maxLength="50" placeholder="请输入活动地点" />
      </a-form-item>
      <a-form-item label="活动单位" name="orgName">
        <a-textarea :auto-size="{ maxRows: 1 }" v-model:value="formState.orgName" :maxLength="50" placeholder="请输入活动单位" />
      </a-form-item>
      <a-form-item label="活动图片" name="file">
        <JUpload  ref="uploadRef" fileType="image" :maxCount="10" v-model:value="formState.file" text="上传附件"  />
      </a-form-item>
      <a-form-item label="活动内容" name="playContent" :rules="[{ required: true, message: '请输入' }]">
        <JEditor height="260" v-model:value="formState.playContent" class="remark-textarea" />
      </a-form-item>
      <a-form-item label="置顶" name="isTop" :rules="[{ required: true, message: '请输入' }]">
        <a-radio-group v-model:value="formState.isTop" name="radioGroup">
          <a-radio value="1">是</a-radio>
          <a-radio value="0">否</a-radio>
        </a-radio-group>
      </a-form-item>
    </a-form>
  </BasicDrawer>
</template>
<script lang="ts" setup>
  import { JUpload } from '/@/components/Form/src/jeecg/components/JUpload';
  import { BasicDrawer, useDrawerInner } from '/@/components/Drawer';
  import type { FormInstance } from 'ant-design-vue';
  import { JEditor } from '/@/components/Form';
  import { add, edit } from '../api';
  import { ref } from 'vue';
  import dayjs from 'dayjs';

  const formRef = ref<FormInstance | null>(null);
  const formState = ref({
    id: null,
    title: '',
    playDate: dayjs().format('YYYY-MM-DD'),
    playLocation: '',
    orgName: '',
    file: '',
    playContent: '',
    isTop: '1',
    type: '2',
    sort: null,
  });
  const title = ref('发布活动');
  const [registerModal, { closeDrawer }] = useDrawerInner((data) => {
    formRef.value?.resetFields();
    title.value = data.title;
    if(title.value == '编辑活动') {
      formState.value = data.record;
    }
  });

  const emits = defineEmits(['success']);
  const submit = () => {
    formRef.value?.validate().then(() => {
      if(title.value == '编辑活动') {
        edit(formState.value).then((res) => { 
          emits('success', res);
          closeDrawer();
          formRef.value?.resetFields();
        })
        return;
      }
      add(formState.value).then((res) => {
        emits('success', res);
        closeDrawer();
        formRef.value?.resetFields();
      })
    });
  }

  const close = () => {
    formRef.value?.resetFields();
    closeDrawer();
    formState.value = {
      id: null,
      title: '',
      playDate: dayjs().format('YYYY-MM-DD'),
      playLocation: '',
      orgName: '',
      file: '',
      playContent: '',
      isTop: '1',
      type: '2',
      sort: null,
    }
  }
</script>
