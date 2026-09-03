<template>
  <BasicModal @register="register" v-bind="$attrs" :title="title" width="50%" @ok="handleSubmit">
    <a-form ref="formRef" :model="formState" name="basic" :label-col="{ span: 4 }" :wrapper-col="{ span: 16 }">
      <a-form-item label="实施时间" name="enforceDate" :rules="[{ required: true, message: '请选择' }]">
        <a-date-picker style="width: 100%;" placeholder="请选择" v-model:value="formState.enforceDate" valueFormat="YYYY-MM" format="YYYY-MM"
          picker="month" />
      </a-form-item>
      <a-form-item label="演练方式" name="rehearsalType" :rules="[{ required: true, message: '请输入' }]">
        <a-input v-model:value="formState.rehearsalType" placeholder="请输入" />
      </a-form-item>
      <a-form-item label="演练内容" name="rehearsalContent" :rules="[{ required: true, message: '请输入' }]">
        <a-input v-model:value="formState.rehearsalContent" placeholder="请输入" />
      </a-form-item>
      <a-form-item label="演练地点" name="rehearsalLocation" :rules="[{ required: true, message: '请输入' }]">
        <a-input v-model:value="formState.rehearsalLocation" placeholder="请输入" />
      </a-form-item>
      <a-form-item label="参演人数" name="personNum" :rules="[{ required: true, message: '请输入' }]">
        <a-input type="number" v-model:value="formState.personNum" placeholder="请输入" />
      </a-form-item>
      <a-form-item label="应急预案" name="annex" :rules="[{ required: true, message: '请上传' }]">
        <JUpload ref="uploadRef" :maxCount="1" v-model:value="formState.annex" text="上传附件" />
        <!-- <a-upload v-model:file-list="formState.annex" :action="fileUploadFile" :customRequest="customRequest"
          @preview="onFilePreview"
          @change="handleChange">
          <a-button>
            <upload-outlined></upload-outlined>
            上传附件
          </a-button>
          <template #itemRender="{ file, actions, index }">
            <a-space>
              <span @click="onFilePreview(file)" :style="file.status === 'error' ? 'color: red' : ''">{{ file.name }}</span>
              <a href="javascript:;" @click="remove(index)">删除</a>
            </a-space>
          </template>
        </a-upload> -->
      </a-form-item>
      <a-form-item label="备注" name="remark">
        <a-input v-model:value="formState.remark" placeholder="请输入" />
      </a-form-item>
    </a-form>
  </BasicModal>
</template>
<script lang="ts" setup>
import { JUpload } from '/@/components/Form/src/jeecg/components/JUpload';
import { previewFile, uploadUrl, fileUploadFile } from '/@/api/common/api';
import { getFileAccessHttpUrl } from '/@/utils/common/compUtils';
import { BasicModal, useModalInner } from '/@/components/Modal';
import { createImgPreview } from '/@/components/Preview/index';
import { ref } from 'vue';
const title = ref('新增')
const emits = defineEmits(['submitSuccess']);

const formRef = ref(null);
const formState = ref({
  enforceDate: '',
  rehearsalType: '',
  annex: [],
  remark: '',
  rehearsalContent: '',
  rehearsalLocation: '',
  personNum: '',
});
const [register, { closeModal }] = useModalInner((data) => {
  title.value = data.title;
  if (title.value === '编辑') {
    Object.assign(formState.value, data.record)
  }
});


const handleSubmit = async () => {
  await formRef.value?.validate();
  let data = JSON.parse(JSON.stringify(formState.value));
  if(title.value === '编辑') data.type = 'edit'
  emits('submitSuccess', data);
  closeModal();
  formRef.value?.resetFields();
};

function onFilePreview(file) {
  console.log(getFileAccessHttpUrl(file.name))
  // 如果是图片模式
  if (file.type.indexOf('image') > -1){
    createImgPreview({ imageList: [getFileAccessHttpUrl(file.name)], maskClosable: true });
  } else {
    previewFile(file.name).then((res) => {
      window.open(res, '_blank');
    });
  }
  }

</script>
