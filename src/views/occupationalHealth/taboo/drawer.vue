<template>
  <BasicDrawer
    :showFooter="false"
    forceRender
    v-bind="$attrs"
    @register="register"
    :title="title"
    width="50%"
    @close="close"
    @ok="handleSubmit"
    destroyOnClose
  >
    <div style="width: 100%">
      <a-form ref="formRef" :model="formState" name="basic" :label-col="{ span: 4 }" :wrapper-col="{ span: 16 }">
        <a-form-item label="所属单位" name="orgCode" :rules="[{ required: true, message: '请选择' }]">
          <a-select
            v-model:value="formState.orgCode"
            :options="departList"
            @change="orgChange"
            :disabled="readonly"
            placeholder="请选择"
            :fieldNames="{ label: 'departName', value: 'orgCode' }"
          ></a-select>
        </a-form-item>

        <a-form-item label="所属车间" name="workshop" :rules="[{ required: true, message: '请选择' }]">
          <a-select
            v-model:value="formState.workshop"
            :options="departList2"
            :disabled="readonly"
            placeholder="请选择"
            @change="workshopChange"
            :fieldNames="{ label: 'departName', value: 'orgCode' }"
          ></a-select>
        </a-form-item>

        <a-form-item label="姓名" name="userId" :rules="[{ required: true, message: '请输入' }]">
          <a-select
            v-model:value="formState.userId"
            show-search
            :options="userList"
            :disabled="readonly"
            placeholder="请选择"
            @change="userChange"
            :fieldNames="{ label: 'label', value: 'id' }"
            :filter-option="filterOption"
          >
          </a-select>
        </a-form-item>

        <a-form-item label="工号" name="workNo" :rules="[{ required: true, message: '请输入' }]">
          <a-input disabled v-model:value="formState.workNo" placeholder="请输入" />
        </a-form-item>

        <a-form-item label="岗位" name="post" :rules="[{ required: true, message: '请输入' }]">
          <a-input v-model:value="formState.post" :disabled="readonly" placeholder="请输入" />
        </a-form-item>

        <a-form-item label="身份证号" name="idCard" :rules="[{ required: true, message: '请输入' }, { validator: idCardValidator }]">
          <a-input @change="idcodeChange" v-model:value="formState.idCard" :disabled="readonly" placeholder="请输入" />
        </a-form-item>
        <a-form-item label="职业禁忌证" name="tabooProof" :rules="[{ required: true, message: '请输入' }]">
          <a-input v-model:value="formState.tabooProof" :disabled="readonly" placeholder="请输入" />
        </a-form-item>
        <a-form-item label="原车间" name="oldOrg" :rules="[{ required: true, message: '请输入' }]">
          <a-input v-model:value="formState.oldOrg" :disabled="readonly" placeholder="请输入" />
        </a-form-item>
        <a-form-item label="原岗位" name="oldPost" :rules="[{ required: true, message: '请输入' }]">
          <a-input v-model:value="formState.oldPost" :disabled="readonly" placeholder="请输入" />
        </a-form-item>
        <a-form-item label="备注" name="remark">
          <a-input v-model:value="formState.remark" :disabled="readonly" placeholder="请输入" />
        </a-form-item>
      </a-form>
    </div>
    <template #footer>
      <div style="display: flex; align-items: center; justify-content: center; height: 60px">
        <a-space :size="24">
          <a-button @click="close">取消</a-button>
          <a-button v-if="!readonly" type="primary" @click="handleSubmit">确定</a-button>
        </a-space>
      </div>
    </template>
  </BasicDrawer>
</template>
<script lang="ts" setup>
  import { getDepart3ListWithSecurity, selectDeptNew, userListByOrg } from '/@/api/common/api';
  import { tabooAdd, tabooEdit } from '../api';
  import { BasicDrawer, useDrawerInner } from '/@/components/Drawer';
  import { ref, reactive } from 'vue';
  import type { FormInstance } from 'ant-design-vue';
  import dayjs, { Dayjs } from 'dayjs';

  const readonly = ref(false);
  const formRef = ref<FormInstance | null>(null);
  const title = ref('新增');
  const departList = ref<any[]>([]);
  const departList2 = ref<any[]>([]);
  const formState = reactive({
    workNo: undefined,
    orgCode: undefined,
    workshop: undefined,
    post: '',
    name: undefined,
    userId: undefined,
    idCard: '',
    birthDate: '',
    gender: '',
    phone: '',
    nativePlace: '',
    joinDate: '',
    totalWorkAge: '',
    harmDate: '',
    harmWorkAge: '',
    formerName: '',
    maritalStatus: '',
    hobbies: '',
    educationLevel: '',
  });

  const emits = defineEmits(['submitSuccess']);
  const submitIng = ref(false);
  const [register, { closeDrawer }] = useDrawerInner(async (data) => {
    title.value = data.title;
    departList.value = await getDepart3ListWithSecurity();
    if (departList.value.length == 1) {
      formState.orgCode = departList.value[0].orgCode;
      selectDeptNew({ orgCode: departList.value[0].orgCode }).then((dres) => {
        departList2.value = dres;
      });
    }
    if (title.value == '编辑') {
      Object.assign(formState, data.record);
      orgChange(formState.orgCode, 'edit');
      workshopChange(formState.workshop, 'edit');
    }
    if (title.value == '详情') {
      readonly.value = true;
      Object.assign(formState, data.record);
    }
  });

  const idcodeChange = (e) => {
    if (e.target.value.length >= 15) {
      // 根据身份证号计算出生年月日和年龄
      const birth = calculateInfo(e.target.value);
      formState.birthDate = birth.birthDate;
      formState.age = birth.age;
      formState.gender = birth.gender;
    }
  };

  const timeChange = (e, idx) => {
    console.log(e);
    formState.professionalHistory[idx].workStartTime = e[0];
    formState.professionalHistory[idx].workEndTime = e[1];
  };

  const userList = ref<any[]>([]);
  const orgChange = async (value, tag) => {
    departList2.value = await selectDeptNew({ orgCode: value });
    const users = await userListByOrg({ orgCode: value, pageSize: 100000 });
    users.records.forEach((user) => {
      user.label = user.realname + '-' + user.workNo + '-' + user.org3Name;
    });
    userList.value = users.records;
    console.log('1', tag);
    if (tag != 'edit') {
      formState.name = undefined;
      formState.userId = undefined;
      formState.workNo = undefined;
      formState.workshop = undefined;
    }
  };

  const workshopChange = async (value, tag) => {
    const users = await userListByOrg({ orgCode: value, pageSize: 100000 });
    users.records.forEach((user) => {
      user.label = user.realname + '-' + user.workNo + '-' + user.org3Name;
    });
    userList.value = users.records;
    console.log('2', tag);
    if (tag != 'edit') {
      formState.name = '';
      formState.userId = '';
      formState.workNo = '';
    }
  };

  const filterOption = (input: string, option: any) => {
    return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
  };
  const userChange = (value, opt) => {
    formState.workNo = opt.workNo;
    formState.name = opt.realname;
  };

  const add = (type) => {
    if (type == 1) {
      formState.professionalHistory.push({});
    } else {
      formState.diseaseHistory.push({});
    }
  };
  const cut = (idx, type) => {
    if (type == 1) {
      formState.professionalHistory.splice(idx, 1);
    } else {
      formState.diseaseHistory.splice(idx, 1);
    }
  };
  const handleSubmit = () => {
    formRef.value
      ?.validate()
      .then(() => {
        const params = JSON.parse(JSON.stringify(formState));
        submitIng.value = true;
        if (title.value == '新增') {
          tabooAdd(params)
            .then((res) => {
              submitIng.value = false;
              emits('submitSuccess', res);
              closeDrawer();
              close();
            })
            .catch((err) => {
              submitIng.value = false;
            });
        } else {
          tabooEdit(params)
            .then((res) => {
              submitIng.value = false;
              emits('submitSuccess', res);
              closeDrawer();
              close();
            })
            .catch((err) => {
              submitIng.value = false;
            });
        }
      })
      .catch(() => {
        submitIng.value = false;
      });
  };

  const close = () => {
    closeDrawer();
    readonly.value = false;
    submitIng.value = false;
    formRef.value?.resetFields();
  };

  const disabledDate = (current: Dayjs) => {
    return current && current > dayjs().endOf('day');
  };
  function calculateInfo(idNumber) {
    // 提取出生日期
    const birthDate = idNumber.slice(6, 14);
    const year = birthDate.slice(0, 4);
    const month = birthDate.slice(4, 6);
    const day = birthDate.slice(6, 8);

    // 计算年龄
    const currentYear = new Date().getFullYear();
    const age = currentYear - parseInt(year);

    // 判断性别
    const genderCode = parseInt(idNumber.slice(16, 17));
    const gender = genderCode % 2 === 0 ? '2' : '1';

    return {
      birthDate: `${year}-${month}-${day}`,
      age: age,
      gender: gender,
    };
  }
  const idCardValidator = (rule, value, callback) => {
    if (!value) {
      callback(new Error('请输入身份证号'));
    }
    if (value.length != 18) {
      callback(new Error('身份证号长度不正确'));
    }
    if (!/^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[0-1])\d{3}[0-9Xx]$/.test(value)) {
      callback(new Error('身份证号格式不正确'));
    }
    callback();
  };
</script>
