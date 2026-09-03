<template>
  <BasicModal @register="register" v-bind="$attrs" :title="title" width="550" @cancel="cancel" @ok="handleSubmit" destroyOnClose>
    <a-form ref="formRef" :model="formState" :label-col="{ span: 8 }" :wrapper-col="{ span: 14 }">
      <a-form-item label="体检种类" name="type" :rules="[{ required: true, message: '请选择' }]">
        <a-select
          v-model:value="formState.type"
          placeholder="请选择"
        >
        <a-select-option value="1">岗前</a-select-option>
        <a-select-option value="2">离岗</a-select-option>
      </a-select>
      </a-form-item>
      <a-form-item v-if="formState.type === '1'" label="危害因素" name="type" :rules="[{ required: true, message: '请选择' }]">
        <a-select mode="multiple" v-model:value="formState.hazardFactors" placeholder="请选择">
          <a-select-option v-for="item in categoryOptions" :value="item.id">{{ item.name }}</a-select-option>
        </a-select>
      </a-form-item>
      <a-row v-if="formState.type" style="margin-bottom: 16px;"><a-col :span="4"></a-col>确认给  {{ userName }}  新增{{{ 1: '岗前', 2: '离岗' }[formState.type]}}体检吗？</a-row>
    </a-form>
  </BasicModal>
</template>
<script lang="ts" setup>
import { ref } from 'vue';
import { BasicModal, useModalInner } from '/@/components/Modal';
import { addPhysicalExamination, hazardFactors } from '../api'
import type { FormInstance } from 'ant-design-vue'
const title = ref('检验')
const emits = defineEmits(['submitSuccess']);
const categoryOptions = ref<any[]>([]);
const formRef = ref<FormInstance|null>(null);
const userName = ref('')
const formState = ref({
  type: undefined,
  hazardFactors: [],
  id: '',
});
const [register, { closeModal, changeOkLoading }] = useModalInner(async (data) => {
  formRef.value?.resetFields();
  title.value = data.title;
  formState.value.id = data.data.id;
  userName.value = data.data.name;
  let res = await hazardFactors();
  categoryOptions.value = res;
});

const handleSubmit = async () => {
  let data = JSON.parse(JSON.stringify(formState.value));
  if(data.hazardFactors) data.hazardFactors = data.hazardFactors.join(',');
  changeOkLoading(true)
  addPhysicalExamination(data).then(res => {
    emits('submitSuccess', data);
    cancel()
    closeModal();
    changeOkLoading(false)
  }).catch(err => {
    changeOkLoading(false)
  })
};

const cancel = () => {
  formState.value = {
    type: undefined,
    hazardFactors: [],
    id: ''
  };
}

</script>
