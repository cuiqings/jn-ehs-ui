<template>
  <BasicDrawer @register="registerModal" :showFooter="true" width="50%" v-bind="$attrs" :title="title" @ok="submit" @cancel="close" @close="close">
    <a-form size="small" ref="formRef" :model="formState" layout="vertical">
      <a-form-item label="类型" name="isTop" :rules="[{ required: true, message: '请选择' }]">
        <a-select
          ref="select"
          v-model:value="formState.isTop"
        >
          <a-select-option value="1">有图</a-select-option>
          <a-select-option value="0">无图</a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item label="主题" name="title" :rules="[{ required: true, message: '请输入' }]">
        <a-textarea :auto-size="{ maxRows: 1 }" v-model:value="formState.title" :maxLength="30" placeholder="请输入活动主题" />
      </a-form-item>
      <a-form-item v-if="formState.isTop == '1'" label="图片" name="file" :rules="[{ required: true, message: '请输入' }]">
        <JUpload ref="uploadRef" fileType="image" :maxCount="10" v-model:value="formState.file" text="上传附件"  />
      </a-form-item>
      <a-form-item v-else label="图标" name="file">
        <JUpload ref="uploadRef" fileType="image" :maxCount="1" v-model:value="formState.file" text="上传附件"  />
      </a-form-item>
      <a-form-item label="内容" name="playContent" :rules="[{ required: true, message: '请输入' }]">
        <JEditor height="260" v-model:value="formState.playContent" class="remark-textarea" />
      </a-form-item>
      <!-- <a-form-item label="排序" name="sort" :rules="[{ required: true, message: '请输入' }]">
        <a-input v-model:value="formState.sort" :maxLength="10" placeholder="请输入序号" />
      </a-form-item> -->
      
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

  const formRef = ref<FormInstance | null>(null);
  const formState = ref({
    title: '',
    playLocation: '',
    file: '',
    playContent: '',
    isTop: '1',
    type: '3',
    sort: null,
  });
  const title = ref('新增安全知识');
  const [registerModal, { closeDrawer }] = useDrawerInner((data) => {
    title.value = data.title;
    if(title.value == '编辑安全知识') {
      formState.value = data.record;
    }
  });

  const emits = defineEmits(['success']);
  const submit = () => {
    formRef.value?.validate().then(() => {
      if(title.value == '编辑安全知识') {
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
    closeDrawer();
    formRef.value?.resetFields();
    formState.value = { 
      title: '',
      playLocation: '',
      file: '',
      playContent: '',
      isTop: '1',
      type: '3',
      sort: null,
    }
  }
</script>
