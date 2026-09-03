<template>
  <BasicModal :showCancelBtn="title !== '详情'" :showOkBtn="title !== '详情'" @register="register" v-bind="$attrs" :title="title" width="50%" @ok="handleSubmit"
    @cancel="close">
    <a-form ref="formRef" :model="formState" name="basic" :label-col="{ span: 4 }" :wrapper-col="{ span: 16 }">
      <a-form-item label="预案年份" name="orgCode" :rules="[{ required: true, message: '请选择' }]">
        <a-date-picker style="width: 100%;" v-model:value="formState.year" picker="year" format="YYYY" valueFormat="YYYY" />
      </a-form-item>
      <a-form-item label="所属单位" name="orgCode" :rules="[{ required: true, message: '请选择' }]">
        <a-tree-select v-model:value="formState.orgCode" placeholder="请选择" :tree-data="applicationUnitList" showSearch
          tree-node-filter-prop="title" :field-names="{ label: 'title', value: 'key', children: 'children' }" />
      </a-form-item>
      <a-form-item label="应急预案分类" name="category" :rules="[{ required: true, message: '请输入' }]">
        <a-select v-model:value="formState.category" placeholder="请选择">
          <a-select-option value="1">综合应急预案</a-select-option>
          <a-select-option value="2">专项应急预案</a-select-option>
          <a-select-option value="3">现场处置方案</a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item label="应急预案名称" name="name" :rules="[{ required: true, message: '请输入' }]">
        <a-input v-model:value="formState.name" placeholder="请输入" />
      </a-form-item>
      <a-form-item label="应急预案上传" name="annex" :rules="[{ required: true, message: '请上传' }]">
        <JUpload ref="uploadRef" :maxCount="5" v-model:value="formState.annex" text="上传附件" />
      </a-form-item>
    </a-form>
  </BasicModal>
</template>
<script lang="ts" setup>
import { ref } from 'vue';
import JUpload from '/@/components/Form/src/jeecg/components/JUpload/JUpload.vue';
import { useDepartList } from '/@/views/hazardousOperation/hooks/useDepartList'
import { BasicModal, useModalInner } from '/@/components/Modal';
import { ledgerAdd, ledgerEdit } from '../../api'
const title = ref('新增')
const emits = defineEmits(['submitSuccess']);

const applicationUnitList = ref<any[]>([])
const formRef = ref(null);
const formState = ref({
  year: new Date().getFullYear()+'',
  orgCode: undefined,
  category: undefined,
  name: '',
  annex: '',
});
const [register, { closeModal, changeOkLoading }] = useModalInner(async (data) => {
  const { applicationUnitList: list } = await useDepartList(9);
  applicationUnitList.value = list.value;
  title.value = data.title;
  if (['编辑', '详情'].includes(title.value)) {
    Object.assign(formState.value, data.record)
  }
  if(formState.value.year) formState.value.year = formState.value.year+''
});

const handleSubmit = async () => {
  await formRef.value?.validate();
  let data = JSON.parse(JSON.stringify(formState.value));
  changeOkLoading(true)
  if (title.value === '编辑') {
    ledgerEdit(data).then(res => {
      emits('submitSuccess', data);
      closeModal();
      formRef.value?.resetFields();
      changeOkLoading(false)
    }).catch(err => {
      changeOkLoading(false)
    })
    return;
  }
  ledgerAdd(data).then(res => {
    emits('submitSuccess', data);
    closeModal();
    formRef.value?.resetFields();
    changeOkLoading(false)
  }).catch(err => {
    changeOkLoading(false)
  })

};

const close = () => {
  formRef.value?.resetFields();
}


</script>
