<template>
  <BasicModal @register="register" v-bind="$attrs" :title="title" width="50%" @ok="handleSubmit">
    <a-form ref="formRef" :model="formState" name="basic" :label-col="{ span: 4 }" :wrapper-col="{ span: 16 }">

      <a-form-item label="姓名" name="name" :rules="[{ required: true, message: '请输入' }]">
        <a-input v-model:value="formState.name" readonly placeholder="请输入" />
      </a-form-item>
      <a-form-item label="工号" name="userId" :rules="[{ required: true, message: '请选择' }]">
        <JUserModal @confirm="userChange" :params="{userName: formState.name}" v-model:value="formState.userId" placeholder="请选择" />
      </a-form-item>

      <a-form-item label="所属单位" name="orgCode">
        <a-select disabled v-model:value="formState.orgCode" :options="departList" @change="orgChange"
          placeholder="请选择" :fieldNames="{ label: 'departName', value: 'orgCode' }"></a-select>
      </a-form-item>

      <a-form-item label="所属车间" name="workshop">
        <a-select disabled v-model:value="formState.workshop" :options="departList2" placeholder="请选择"
          @change="workshopChange" :fieldNames="{ label: 'departName', value: 'orgCode' }"></a-select>
      </a-form-item>
    </a-form>
  </BasicModal>
</template>
<script lang="ts" setup>
import { get3DepartList, selectDeptNew, userListByOrg } from '/@/api/common/api';
import { BasicModal, useModalInner } from '/@/components/Modal';
import { JUserModal } from '/@/components/Form';
import { bmEdit } from '../../api'
import { ref } from 'vue';
const title = ref('新增')
const emits = defineEmits(['submitSuccess']);
const departList = ref<any[]>([]);
const departList2 = ref<any[]>([]);
const formRef = ref(null);
const formState = ref({
  orgCode: undefined,
  workshop: undefined,
  userId: undefined,
  name: '',
  workNo: ''
});
const [register, { closeModal, changeOkLoading }] = useModalInner(async (data) => {
  console.log(data);
  
  departList.value = await get3DepartList();
  title.value = data.title;
  if (title.value === '编辑') {
    Object.assign(formState.value, data.record)
  }
});

const userList = ref<any[]>([])
const orgChange = async (value) => {
  departList2.value = await selectDeptNew({orgCode: value});
  const users = await userListByOrg({orgCode: value, pageSize: 100000})
  users.records.forEach((user) => {
    user.label = `${user.realname}-${user.workNo}-${user.org3Name}`
  }); 
  userList.value = users.records;
}

const workshopChange = async (value) => {
  const users = await userListByOrg({orgCode: value, pageSize: 100000})
  users.records.forEach((user) => {
    user.label = `${user.realname}-${user.workNo}-${user.org3Name}`
  });
  userList.value = users.records;
}
const userChange = async (a, b, c, v) => {
  formState.value.workNo = v[0].workNo;
  if(c.length > 9){
    formState.value.orgCode = c.substring(0, 9);
    formState.value.workshop = c;
    orgChange(formState.value.orgCode);
  } else {
    formState.value.orgCode = c;
    orgChange(c);
  }
}
 
const handleSubmit = async () => {
  await formRef.value?.validate();
  let data = JSON.parse(JSON.stringify(formState.value));
  changeOkLoading(true)
  bmEdit(data).then(res => {
    emits('submitSuccess', data);
    closeModal();
    formRef.value?.resetFields();
    changeOkLoading(false)
  }).catch(err => {
    changeOkLoading(false)
  })
};

</script>
