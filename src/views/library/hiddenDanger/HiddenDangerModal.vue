<template>
  <BasicModal v-bind="$attrs" @register="registerModal" :title="title" @ok="onSubmit" width="680px">
    <BasicForm @register="registerForm" />
  </BasicModal>
</template>
<script lang="ts" setup>
  import { ref, computed, unref } from 'vue';
  import { BasicModal, useModalInner, useModal } from '/@/components/Modal';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import { saveOrUpdate, getDetailById } from './hiddenDanger.api';
  import { useUserStore } from '/@/store/modules/user';
  import { neic } from '/@/views/law/lawManage/hooks/useStatic';
  // 声明Emits
  const emit = defineEmits(['register', 'success']);
  const isUpdate = ref(false);
  const userStore = useUserStore();
  const title = ref('新增');
  console.log('userStore', userStore);
  const schemas: any = [
    {
      label: '',
      field: 'id',
      component: 'Input',
      show: false,
    },
    {
      label: '',
      field: 'industry_dictText',
      component: 'Input',
      show: false,
    },
    {
      label: '隐患库ID',
      field: 'yhId',
      component: 'Input',
    },
    {
      label: '检查项目',
      field: 'yhItem',
      component: 'Input',
    },
    {
      label: '隐患描述',
      field: 'yhDescription',
      component: 'Input',
    },
    {
      label: '检查依据',
      field: 'checkStandard',
      component: 'Input',
    },
    {
      label: '整改建议',
      field: 'repairSuggestion',
      component: 'Input',
    },
    {
      field: 'yhLevel',
      label: '隐患等级',
      component: 'JDictSelectTag',
      componentProps: {
        dictCode: 'bs_yh_level',
        placeholder: '请选择',
        stringToNumber: false,
        showChooseOption: false,
        // mode: 'multiple',
      },
    },
    {
      label: '所属行业',
      field: 'industry',
      component: 'JTreeSelect1',
      componentProps: ({ formModel }) => {
        return {
          treeDataArr: neic,
          multiple: true,
          onChange: (value, extra, _label) => {
            console.log('所属行业', value, extra, _label);
            if (value) {
              formModel.industry_dictText = _label.join(',');
            }
          },
        };
      },
    },
    {
      label: '所属企业',
      field: 'company',
      component: 'JDictSelectTag',
      componentProps: {
        dictCode: 'bs_yh_enterprise',
        placeholder: '请选择',
        stringToNumber: false,
        showChooseOption: false,
        mode: 'multiple',
      },
    },
    {
      label: '主要危害',
      field: 'majorHazard',
      component: 'JDictSelectTag',
      componentProps: {
        dictCode: 'bs_accident_category',
        placeholder: '请选择',
        stringToNumber: false,
        showChooseOption: false,
      },
    },
    {
      label: '隐患类别',
      field: 'yhCategory',
      component: 'JDictSelectTag',
      componentProps: {
        dictCode: 'bs_yh_category',
        placeholder: '请选择',
        stringToNumber: false,
        showChooseOption: false,
      },
    },
    {
      label: '隐患子类',
      field: 'standardCategory',
      component: 'JDictSelectTag',
      componentProps: {
        dictCode: 'bs_standard_category',
        placeholder: '请选择',
        stringToNumber: false,
        showChooseOption: false,
      },
    },
    {
      label: '整改措施分类',
      field: 'problemCategory',
      component: 'JDictSelectTag',
      componentProps: {
        dictCode: 'bs_problem_category',
        placeholder: '请选择',
        stringToNumber: false,
        showChooseOption: false,
      },
    },
  ];
  //表单配置
  const [registerForm, { setProps, resetFields, setFieldsValue, validate, updateSchema }] = useForm({
    schemas: schemas,
    showActionButtonGroup: false,
  });
  //表单赋值
  const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
    console.log('useDrawerInner', data);
    if (!data?.showFooter) {
      title.value = '查看';
    } else if (data?.isUpdate) {
      title.value = '编辑';
    } else {
      title.value = '新增';
    }
    setModalProps({ confirmLoading: false, showCancelBtn: !!data?.showFooter, showOkBtn: !!data?.showFooter });
    isUpdate.value = !!data?.isUpdate;
    //重置表单
    await resetFields();
    if (unref(isUpdate)) {
      await setFieldsValue({
        ...data.record,
      });
    }
    // 禁用表单
    setProps({ disabled: !data?.showFooter });
  });
  //表单提交事件
  async function onSubmit() {
    try {
      let values = await validate();
      console.log('values', values);
      setModalProps({ confirmLoading: true });
      // 提交表单
      await saveOrUpdate(values, isUpdate.value);
      // 关闭弹窗
      closeModal();
      // 刷新列表
      emit('success');
    } finally {
      setModalProps({ confirmLoading: false });
    }
  }
</script>
<style lang="less" scoped>
  .red-require {
    display: inline-block;
    margin-right: 4px;
    color: #ff4d4f;
    font-size: 14px;
    font-family: SimSun, sans-serif;
    line-height: 1;
  }
</style>
