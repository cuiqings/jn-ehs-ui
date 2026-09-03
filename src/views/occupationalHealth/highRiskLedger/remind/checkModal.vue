<template>
  <BasicModal @register="register" v-bind="$attrs" :title="title" width="650" @cancel="cancel" @ok="handleSubmit" destroyOnClose>
    <a-form ref="formRef" layout="vertical" :model="formState">
      <a-form-item label="单位：" name="orgCode" :rules="[{ required: true, message: '请选择' }]">
        <a-select
          v-model:value="formState.orgCode"
          :options="departList"
          placeholder="请选择"
          :fieldNames="{ label: 'departName', value: 'orgCode' }"
        />
      </a-form-item>
      <a-form-item label="疾病或指标：" name="disease" :rules="[{ required: true, message: '请选择' }]">
        <a-select
          v-model:value="formState.disease"
          :options="diseases_types"
          :fieldNames="{ label: 'label', value: 'value' }"
          placeholder="请选择"
          show-search
          :filter-option="filterOption"
        >
        </a-select>
      </a-form-item>
      <a-form-item label="提醒频率：" name="frequency" :rules="[{ required: true, message: '请输入' }]">
        <div style="display: flex;align-items: center;">每<a-input style="width: 120px; margin: 0 10px;" v-model:value="formState.frequency" placeholder="请输入" />小时一次</div>
      </a-form-item>
      <a-form-item label="提醒升级（通知班组长/高危人员负责人）：" name="upgrade" :rules="[{ required: true, message: '请选择' }]">
        <a-radio-group v-model:value="formState.upgrade">
          <a-radio value="1">是</a-radio>
          <a-radio value="0">否</a-radio>
        </a-radio-group>
      </a-form-item>
    </a-form>
  </BasicModal>
</template>
<script lang="ts" setup>
  import { getDepart3ListWithSecurity } from '/@/api/common/api';
  import { ref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { remindAdd, remindEdit } from '../api';
  import type { FormInstance } from 'ant-design-vue';
  import { useUserStore } from '/@/store/modules/user';
  const userStore: any = useUserStore();
  const diseases_types = ref<any[]>(userStore.getAllDictItems.diseases_types);
  const departList = ref<any[]>([]);
  const title = ref('检验');
  const emits = defineEmits(['submitSuccess']);
  const formRef = ref<FormInstance | null>(null);
  const userName = ref('');
  const formState = ref({
    upgrade: '0',
    disease: undefined,
    orgCode: undefined,
  });
  const [register, { closeModal, changeOkLoading }] = useModalInner(async (data) => {
    departList.value = await getDepart3ListWithSecurity();
    formRef.value?.resetFields();
    title.value = data.title;
    if(title.value === '编辑'){
      Object.assign(formState.value, data.record);
    }
  });

  const handleSubmit = async () => {
    let data = JSON.parse(JSON.stringify(formState.value));
    changeOkLoading(true);
    if(title.value === '编辑') {
      remindEdit(data)
        .then((res) => {
          emits('submitSuccess', data);
          cancel();
          closeModal();
          changeOkLoading(false);
        })
        .catch((err) => {
          changeOkLoading(false);
        });
      return;
    }
    remindAdd(data)
      .then((res) => {
        emits('submitSuccess', data);
        cancel();
        closeModal();
        changeOkLoading(false);
      })
      .catch((err) => {
        changeOkLoading(false);
      });
  };

  const filterOption = (input: string, option: any) => {
    return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
  };

  const cancel = () => {
    formState.value = {
      type: undefined,
      hazardFactors: [],
      id: '',
    };
  };
</script>
