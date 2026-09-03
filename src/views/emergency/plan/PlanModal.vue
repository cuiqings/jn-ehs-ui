<template>
  <div>
    <BasicModal v-bind="$attrs" @register="registerModal" :title="getTitle" @ok="onSubmit">
      <BasicForm @register="registerForm" />
    </BasicModal>
  </div>
</template>
  
<script lang="ts" setup>
import { computed, ref, unref } from 'vue';
import { BasicModal, useModalInner } from '/@/components/Modal';
import { BasicForm, useForm } from '/@/components/Form/index';
import { add, edit } from './plan.api';
import { duplicateCheck } from '/@/views/system/user/user.api';
import { message, Upload } from 'ant-design-vue';
const emit = defineEmits(['register', 'success']);
const isUpdate = ref(true);
const getTitle = computed(() => (!unref(isUpdate) ? '新增' : '编辑'));
const roleId = ref('');
// 注册表单
const [registerForm, { validate, setFieldsValue, resetFields }] = useForm({
  schemas: [
    {
      label: 'id',
      field: 'id',
      component: 'Input',
      show: false,
    },
    {
      field: 'name',
      label: '应急预案名称',
      component: 'Input',
      dynamicRules: ({ model }) => {
        console.log('model', model);
        return [
          { required: true, message: '应急预案名称不能为空！' },
          { min: 0, max: 50, message: '请输入50字内的应急预案名称！', trigger: 'blur' },
          {
            validator: (_, value) => {
              return new Promise((resolve, reject) => {
                if (value) {
                  value = value.trim();
                }
                let params = {
                  tableName: 'emergency_plan',
                  fieldName: 'name',
                  fieldVal: value,
                  dataId: model.id,
                };
                duplicateCheck(params)
                  .then((res) => {
                    res.success ? resolve() : reject(res.message || '校验失败');
                  })
                  .catch((err) => {
                    reject(err.message || '验证失败');
                  });
              });
            },
          },
        ];
      },
    },
    {
      label: '备注',
      field: 'remark',
      component: 'InputTextArea',
      rules: [{ min: 0, max: 200, message: '长度不能超过 200 个字符', trigger: 'blur' }],
    },
    {
      field: 'filePath',
      label: '附件',
      component: 'JUpload',
      rules: [
        {
          required: true,
          message: '附件不能为空!',
        },
      ],
      componentProps: {
        maxCount: 1,
        // accept: '.pdf,.doc,.docx',
        beforeUpload: (file: File) => {
          const isLt300M = file.size / 1024 / 1024 < 300;
          const isPdf = file.type === 'application/pdf';
          const isDoc = file.type === 'application/msword';
          const isDocx = file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
          if (!isLt300M) {
            message.error('文件过大，请不要超过300M！');
            return false || Upload.LIST_IGNORE;
          } else if (!isPdf && !isDoc && !isDocx) {
            message.error(`文件格式错误，仅支持doc、docx、pdf格式!推荐pdf格式上传！`);
            return false || Upload.LIST_IGNORE;
          }
          return true;
        },
      },
    },
  ],
  showActionButtonGroup: false,
  labelCol: {
    xs: { span: 24 },
    sm: { span: 6 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 18 },
  },
});
// 注册弹窗
// 这个方法执行需要openModal传入第二个参数
const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
  console.log('useModalInner data', data);
  // 下次点击弹窗的时候清空表单
  await resetFields();
  setModalProps({ confirmLoading: false });
  isUpdate.value = !!data?.isUpdate;
  if (unref(isUpdate)) {
    //表单赋值
    await setFieldsValue({
      ...data.record,
    });
    console.log('data.record', data.record);
    roleId.value = data.record.id;
  }
});

async function onSubmit() {
  const values = await validate();
  console.log('validate value', values);
  if (unref(isUpdate)) {
    values.id = roleId.value;
    await edit(values);
  } else {
    await add(values);
  }
  closeModal();
  emit('success');
}
</script>
  
  <style></style>
  