<template>
  <BasicModal @register="register" v-bind="$attrs" :title="title" width="550" @ok="handleSubmit">
    <a-row v-if="title == '检验'" style="margin-bottom: 16px;"><a-col :span="4"></a-col>已选{{count}}项物资，是否进行检验？</a-row>
    <a-row v-else style="margin-bottom: 16px;"><a-col :span="4"></a-col>已选{{count}}项物资，是否全部进行检验？</a-row>
    <a-form ref="formRef" :model="formState" name="basic" :label-col="{ span: 8 }" :wrapper-col="{ span: 14 }">
      <a-form-item label="检验有效期" name="checkDate" :rules="[{ required: true, message: '请选择' }]">
        <a-date-picker format="YYYY-MM-DD" valueFormat="YYYY-MM-DD" style="width: 100%;" v-model:value="formState.checkDate" placeholder="请选择" />
      </a-form-item>
    </a-form>
  </BasicModal>
</template>
<script lang="ts" setup>
import { ref } from 'vue';
import { BasicModal, useModalInner } from '/@/components/Modal';
import { suppliesCheck, suppliesCheckBatch } from '../api'
const title = ref('检验')
const emits = defineEmits(['submitSuccess']);

const formRef = ref(null);
const formState = ref({
  checkDate: '',
  id: '',
});
const count = ref(0)
const record = ref([])
const [register, { closeModal, changeOkLoading }] = useModalInner(async (data) => {
  title.value = data.title;
  count.value = data.data.length;
  record.value = data.data;
  formState.value.id = data.data.map((item) => item.id).join(',');
});

const handleSubmit = async () => {
  await formRef.value?.validate();
  let data = JSON.parse(JSON.stringify(formState.value));
  changeOkLoading(true)
  if(title.value === '检验') {
    suppliesCheck(data).then(res => {
      emits('submitSuccess', data);
      closeModal();
      formRef.value?.resetFields();
      changeOkLoading(false)
    }).catch(err => {
      changeOkLoading(false)
    })
  } else {
    suppliesCheckBatch(data).then(res => {
      emits('submitSuccess', data);
      closeModal();
      formRef.value?.resetFields();
      changeOkLoading(false)
    }).catch(err => {
      changeOkLoading(false)
    })
  }
};

</script>
