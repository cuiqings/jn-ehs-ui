<template>
  <div>
    <BasicModal v-bind="$attrs" @register="registerModal" :title="getTitle" @ok="onSubmit" width="500px">
      <BasicForm @register="registerForm">
      </BasicForm>
    </BasicModal>
  </div>
</template>
  
<script lang="ts">
import { ref } from 'vue';
import { BasicModal, useModalInner } from '/@/components/Modal';
import { BasicForm, useForm } from '/@/components/Form/index';
import { saveOrUpdate } from './plan.api';
// import { defHttp } from '/@/utils/http/axios';
import { useMessage } from '/@/hooks/web/useMessage';
const { createMessage } = useMessage();
export default {
  name: 'StatusModal',
  components: { BasicModal, BasicForm },
  emits: ['success', 'register'],
  setup(_props, { emit }) {
    // const getTitle = computed(() => (!unref(isUpdate) ? '新增' : '编辑'));
    const getTitle = ref('申请停用');
    const roleId = ref('');
    const curRecord:any = ref({})
    
    // 注册表单
    const [registerForm, { validate, resetFields}] = useForm({
      schemas: [
        {
          label: '变更说明',
          field: 'changeRecord',
          component: 'InputTextArea',
          required: true,
          componentProps: {
            placeholder: '请输入至少五个字符',
            rows: 4,
          },
          rules: [
            {
              required: true,
              validator: async (rule, value) => {
                if (!value) {
                  return Promise.reject('请输入至少五个字符');
                }
                if (value.length < 5) {
                  return Promise.reject('请输入至少五个字符');
                }
                if (value.length > 50) {
                  return Promise.reject('变更说明字数超限，请控制在50字内');
                }
                return Promise.resolve();
              },
              trigger: 'change',
            }
          ]
        },
        {
          label: '附件',
          field: 'annex',
          component: 'JUpload',
          componentProps: {
            maxCount: 1,
            accept: '.pdf,.doc,.docx',
            beforeUpload: (file: File) => {
              const isLt300M = file.size / 1024 / 1024 < 300;
              if (!isLt300M) {
                createMessage.error('文件过大，请不要超过300M！');
              }
              return isLt300M;
            },
          },
        }
      ],
      showActionButtonGroup: false,
      labelCol: {
        xs: { span: 24 },
        sm: { span: 5 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 18 },
      },
    });

    async function onSubmit() {
      const values = await validate();
      console.log('validate value', values);
      values.id = roleId.value;
      values.planStatus = curRecord.value.planStatus
      values.changeType = '0'
      setModalProps({ confirmLoading: true});
      try {
        await saveOrUpdate(values, true);
        closeModal();
        emit('success');
        setModalProps({ confirmLoading: false});
      } catch {
        setModalProps({ confirmLoading: false});
      }
    }
    // 注册弹窗
    // 这个方法执行需要openModal传入第二个参数
    const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
      console.log('useModalInner data', data, data.a);
      // console.log('useModalInner data', data.type);
      if(data.record.isEnable === '1'){
        getTitle.value = '申请停用'
      } else {
        getTitle.value = '申请启用'
      }
      // 下次点击弹窗的时候清空表单
      await resetFields();
      setModalProps({ confirmLoading: false});
      roleId.value = data.record.id;
      curRecord.value = data.record
      // 隐藏底部时禁用整个表单
      // setProps({ disabled: !data?.showFooter })
    });

    return {
      registerModal,
      registerForm,
      getTitle,
      onSubmit
    };
  },
};
</script>
  
<style lang="less" scoped>
/deep/.ant-input-suffix{
  color: #999;
}
</style>
  