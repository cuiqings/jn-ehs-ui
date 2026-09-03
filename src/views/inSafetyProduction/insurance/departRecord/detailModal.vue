<template>
  <BasicModal @register="register" v-bind="$attrs" :title="title" width="850px" @cancel="cancel" @ok="handleSubmit">
    <a-form ref="formRef" :model="formState" name="basic" :label-col="{ span: 8 }" :wrapper-col="{ span: 14 }">
      <a-row :gutter="12">
        <a-col :span="12">
          <a-form-item label="所属单位" name="orgCode" :rules="[{ required: true, message: '请选择' }]">
            <a-select
              v-model:value="formState.orgCode"
              :options="departList"
              @change="orgChange"
              :disabled="readonly || !addFlag"
              placeholder="请选择"
              :fieldNames="{ label: 'departName', value: 'orgCode' }"
            />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="所属车间" name="workshop">
            <a-select
              v-model:value="formState.workshop"
              :options="departList2"
              :disabled="readonly || !addFlag"
              placeholder="请选择"
              @change="workshopChange"
              :fieldNames="{ label: 'departName', value: 'orgCode' }"
            />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="姓名" name="userId" :rules="[{ required: true, message: '请输入' }]">
            <a-select
              v-model:value="formState.userId"
              show-search
              :options="userList"
              :disabled="readonly || !addFlag"
              placeholder="请选择"
              @change="userChange"
              :fieldNames="{ label: 'label', value: 'id' }"
              :filter-option="filterOption"
            />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="工号" name="workNo" :rules="[{ required: true, message: '请输入' }]">
            <a-input disabled v-model:value="formState.workNo" placeholder="请输入" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="身份证号" name="idCard" :rules="[{ validator: validateIdCard }]">
            <a-input v-model:value="formState.idCard" :disabled="readonly || !addFlag" placeholder="请输入" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="参保类型" name="insuranceType" :rules="[{ required: true, message: '请选择' }]">
            <a-select v-model:value="formState.insuranceType" :disabled="readonly" placeholder="请选择">
              <a-select-option :value="1">正常参保</a-select-option>
              <a-select-option :value="2">灵活用工</a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="参保单位" name="insuredUnit" :rules="[{ required: true, message: '请选择' }]">
            <a-select v-model:value="formState.insuredUnit" placeholder="请选择" :options="dList"></a-select>
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="变更" name="changeType" :rules="[{ required: true, message: '请选择' }]">
            <a-select v-model:value="formState.changeType" :disabled="readonly" placeholder="请选择">
              <a-select-option :value="0">无</a-select-option>
              <a-select-option :value="1">新增</a-select-option>
              <a-select-option :value="2">减员</a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
      </a-row>
    </a-form>
  </BasicModal>
</template>
<script lang="ts" setup>
  import { getDepart3ListWithSecurity, selectDeptNew, userListByOrg } from '/@/api/common/api';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { unitAdd, unitEdit } from '../api';
  import { reactive, ref } from 'vue';
  import type { FormInstance } from 'ant-design-vue';
  import { useUserStore } from '/@/store/modules/user';
  const userStore: any = useUserStore();
  const title = ref('检验');
  const emits = defineEmits(['submitSuccess']);

  const dList = [
    {value: '敬业钢铁有限公司', label: '敬业钢铁有限公司'},
    {value: '河北敬业宽板科技有限公司', label: '河北敬业宽板科技有限公司'},
    {value: '平山县洁创环保科技有限公司', label: '平山县洁创环保科技有限公司'},
    {value: '河北敬业高品钢科技有限公司', label: '河北敬业高品钢科技有限公司'}
  ]

  const departList = ref<any[]>([]);
  const departList2 = ref<any[]>([]);
  const userList = ref<any[]>([]);
  const formRef = ref<FormInstance | null>(null);
  const formState = reactive({
    orgCode: undefined,
    workshop: undefined,
    name: undefined,
    userId: undefined,
    workNo: '',
    idCard: '',
    insuranceType: undefined,
    changeType: undefined,
    id: '',
  });

  const readonly = ref(false);
  const addFlag = ref(true);
  const [register, { closeModal, changeOkLoading }] = useModalInner(async (data) => {
    title.value = data.title;
    if (title.value == '编辑人员') readonly.value = false;
    if (title.value == '查看人员详情') readonly.value = true;
    addFlag.value = data.record && data.record.addFlag;
    departList.value = await getDepart3ListWithSecurity();
    if (departList.value.length == 1) {
      formState.orgCode = departList.value[0].orgCode;
      departList2.value = await selectDeptNew({ orgCode: formState.orgCode });
      if(userStore.userInfo.orgCode.length > 9){
        formState.workshop = userStore.userInfo.orgCode;
      }
      const users = await userListByOrg({ orgCode: formState.workshop, pageSize: 100000 });
      users.records.forEach((user) => {
        user.label = `${user.realname}-${user.workNo}-${user.org3Name}`;
      });
      userList.value = users.records;
    }
    if (['查看人员详情', '编辑人员'].includes(title.value)) {
      Object.assign(formState, data.record);
      departList2.value = await selectDeptNew({ orgCode: formState.orgCode });
      const users = await userListByOrg({ orgCode: formState.workshop, pageSize: 100000 });
      users.records.forEach((user) => {
        user.label = `${user.realname}-${user.workNo}-${user.org3Name}`;
      });
      userList.value = users.records;
    }
  });

  const orgChange = async (value, tag) => {
    departList2.value = await selectDeptNew({ orgCode: value });
    const users = await userListByOrg({ orgCode: value, pageSize: 100000 });
    users.records.forEach((user) => {
      user.label = `${user.realname}-${user.workNo}-${user.org3Name}`;
    });
    userList.value = users.records;
    if (tag != 'edit') {
      formState.name = undefined;
      formState.userId = undefined;
      formState.workNo = '';
      formState.workshop = undefined;
    }
  };

  const workshopChange = async (value, tag) => {
    const users = await userListByOrg({ orgCode: value, pageSize: 100000 });
    users.records.forEach((user) => {
      user.label = `${user.realname}-${user.workNo}-${user.org3Name}`;
    });
    userList.value = users.records;
    if (tag != 'edit') {
      formState.name = undefined;
      formState.userId = undefined;
      formState.workNo = '';
    }
  };
  const userChange = (value, opt) => {
    formState.workNo = opt.workNo;
    formState.name = opt.realname;
  };
  const filterOption = (input: string, option: any) => {
    return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
  };
  const handleSubmit = async () => {
    await formRef.value?.validate();
    let data = JSON.parse(JSON.stringify(formState));
    changeOkLoading(true);
    if (title.value === '新增人员') {
      unitAdd(data)
        .then((res) => {
          emits('submitSuccess', data);
          closeModal();
          formRef.value?.resetFields();
          changeOkLoading(false);
        })
        .catch((err) => {
          changeOkLoading(false);
        });
    } else {
      unitEdit(data)
        .then((res) => {
          emits('submitSuccess', data);
          closeModal();
          formRef.value?.resetFields();
          changeOkLoading(false);
        })
        .catch((err) => {
          changeOkLoading(false);
        });
    }
  };

  const cancel = () => {
    closeModal();
    readonly.value = false;
    formRef.value?.resetFields();
  };
  // 身份证号验证
  const validateIdCard = (rule, value, callback) => {
    if(!value) callback();
    if (!/^\d{17}[0-9Xx]$/.test(value)) {
      callback(new Error('请输入正确的身份证号'));
    }
    callback();
  };
</script>
