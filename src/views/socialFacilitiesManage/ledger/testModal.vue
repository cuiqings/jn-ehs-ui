<template>
  <div>
    <BasicModal v-bind="$attrs" @register="registerModal" :width="600" :title="title" destroyOnClose>
      <div>
        <a-form ref="formRef" :model="formState" :label-col="{ span: 5 }" :wrapper-col="{ span: 19 }" :rules="rules">
          <a-row>
            <a-col :span="24">
              <a-form-item :label="type === '2' ? '检验时间' : '下次检验日期'" name="checkTime">
                <a-date-picker v-model:value="formState.checkTime" placeholder="年/月/日" valueFormat="YYYY-MM-DD" style="width: 100%" />
              </a-form-item>
            </a-col>
            <a-col :span="24" v-if="type === '2'">
              <a-form-item label="检验结果" name="checkResult">
                <a-select v-model:value="formState.checkResult" placeholder="请选择" style="width: 100%">
                  <a-select-option value="1">合格</a-select-option>
                  <a-select-option value="2">不合格</a-select-option>
                  <a-select-option value="3">需要维修</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :span="24" v-if="type === '2'">
              <a-form-item label="下次检验时间" name="nextCheckTime">
                <a-date-picker v-model:value="formState.nextCheckTime" placeholder="年/月/日" valueFormat="YYYY-MM-DD" style="width: 100%" />
              </a-form-item>
            </a-col>
            <a-col :span="24">
              <a-form-item label="检验人员" name="checkPerson">
                <JUserModal v-model:value="formState.checkPerson" :orgCode="orgCode" @confirm="userConfirm" />
              </a-form-item>
            </a-col>
            <a-col :span="24">
              <a-form-item label="备注" name="remark">
                <InputTextArea v-model:value="formState.remark" placeholder="请输入" :rows="3" :maxlength="50" />
              </a-form-item>
            </a-col>
          </a-row>
        </a-form>
      </div>
      <template #footer>
        <div style="text-align: center">
          <a-button style="margin-right: 15px" @click="close">取消</a-button>
          <a-button type="primary" :loading="loading" @click="confirmClose">提交校验</a-button>
        </div>
      </template>
    </BasicModal>
  </div>
</template>
<script lang="ts" name="test-modal" setup>
  import { ref, reactive } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import type { FormInstance } from 'ant-design-vue';
  import { JUserModal } from '/@/components/Form';
  import dayjs from 'dayjs';
  import { useUserStore } from '/@/store/modules/user';
  import { check } from './api';
  import { Input } from 'ant-design-vue';
  const emit = defineEmits(['success']);
  const InputTextArea = Input.TextArea;
  const userStore: any = useUserStore();
  const loading = ref(false);
  const formRef = ref<FormInstance>();
  const orgCode = ref('');
  const title = ref('灭火器检验');
  const type = ref('1');
  const formState = reactive({
    ledgerId: '',
    ledgerType: '',
    checkTime: dayjs(new Date()).format('YYYY-MM-DD'),
    nextCheckTime: null,
    checkPerson: '',
    checkPersonName: '',
    checkResult: undefined,
    remark: '',
  });
  const rules = {
    checkTime: [{ required: true, message: '请选择检验时间', trigger: 'change' }],
    nextCheckTime: [{ required: true, message: '请选择下次检验时间', trigger: 'change' }],
    checkPerson: [{ required: true, message: '请选择检验人员', trigger: 'change' }],
    checkResult: [{ required: true, message: '请选择检验结果', trigger: 'change' }],
  };
  const [registerModal, { closeModal }] = useModalInner(async (data) => {
    title.value = data.title;
    type.value = data.type;
    formRef.value?.resetFields();
    resetForm();
    orgCode.value = data.record.org;
    formState.ledgerId = data.ledgerId;
    formState.ledgerType = data.ledgerType;
    if (userStore.getUserInfo.orgCode?.length >= 9 && userStore.getUserInfo.orgCode.substring(0, 9) === data.record.org) {
      formState.checkPerson = userStore.getUserInfo.id;
      formState.checkPersonName = userStore.getUserInfo.realname + '（' + userStore.getUserInfo.username + '）';
    } else {
      formState.checkPerson = '';
      formState.checkPersonName = '';
    }
  });
  const resetForm = () => {
    Object.assign(formState, {
      ledgerType: '',
      checkTime: dayjs(new Date()).format('YYYY-MM-DD'),
      nextCheckTime: null,
      checkPerson: '',
      checkPersonName: '',
      checkResult: undefined,
      remark: '',
    });
  };

  const userConfirm = (_name, nameWorkNo) => {
    formRef.value?.clearValidate(['checkPerson']);
    formState.checkPersonName = nameWorkNo;
  };
  const close = () => {
    closeModal();
  };

  const confirmClose = async () => {
    await formRef.value?.validate();
    loading.value = true;
    check(formState)
      .then(() => {
        emit('success');
        closeModal();
      })
      .finally(() => {
        loading.value = false;
      });
  };
</script>
<style lang="less" scoped></style>
