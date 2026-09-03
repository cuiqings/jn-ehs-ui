<template>
  <div>
    <BasicModal v-bind="$attrs" @register="registerModal" :title="getTitle" @ok="onSubmit" width="700px">
      <BasicForm @register="registerForm"></BasicForm>
    </BasicModal>
  </div>
</template>
  
<script lang="ts">
import { ref, unref } from 'vue';
import { BasicModal, useModalInner } from '/@/components/Modal';
import { BasicForm, useForm } from '/@/components/Form/index';
import { saveOrUpdate } from './api';
// import { useMessage } from '/@/hooks/web/useMessage';
// const { createMessage } = useMessage();
export default {
  name: 'ProjectModal',
  components: { BasicModal, BasicForm },
  emits: ['success', 'register'],
  setup(_props, { emit }) {
    const isUpdate = ref<Boolean>(true);
    const getTitle = ref('')
    const roleId = ref('');
    const oldRecord:any = ref({})
    // 注册表单
    const [registerForm, { validate, setFieldsValue, resetFields,setProps}] = useForm({
      schemas: [
        {
          label: '所属园区',
          field: 'park',
          component: 'JDictSelectTag',
          required: true,
          componentProps: {
            dictCode: 'screen_park',
            type: 'radio',
            placeholder: '请选择'
          }
        },
        {
          label: '页面类型',
          field: 'pageType',
          component: 'Input',
          required: true,
          componentProps: {
            showCount: true,
            maxLength: 50,
            suffix: '/50'
          }
        },
        {
          label: '启/停用',
          field: 'status',
          component: 'JDictSelectTag',
          required: true,
          defaultValue: '0',
          componentProps: {
            dictCode: 'enable_flag',
            type: 'radio',
            placeholder: '请选择'
          }
        },
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

      setModalProps({ confirmLoading: true});
      if (unref(isUpdate)) {
        values.id = roleId.value;
        values.pageContentOne = oldRecord.value.pageContentOne,
        values.pageContentTwo = oldRecord.value.pageContentTwo
        await saveOrUpdate(values);
      } else {
        await saveOrUpdate(values);
      }
      closeModal();
      setModalProps({ confirmLoading: false});
      emit('success');
    }
    // 注册弹窗
    // 这个方法执行需要openModal传入第二个参数
    const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
      console.log('useModalInner data', data, data.a);
      if(!data?.showFooter){
        getTitle.value='查看'
      } else if(data?.isUpdate) {
        getTitle.value='编辑'
      } else {
        getTitle.value='新增'
      }
      // 下次点击弹窗的时候清空表单
      oldRecord.value = {}
      await resetFields();
      setModalProps({ confirmLoading: false,showCancelBtn:!!data?.showFooter,showOkBtn:!!data?.showFooter });
      isUpdate.value = !!data?.isUpdate;
      if (unref(isUpdate)) {
        //表单赋值
        await setFieldsValue({
          ...data.record,
        });
        console.log('data.record', data.record);
        oldRecord.value = data.record
        roleId.value = data.record.id;
      }
      // 隐藏底部时禁用整个表单
      setProps({ disabled: !data?.showFooter })
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