<template>
  <BasicModal v-bind="$attrs" @register="registerModal" destroyOnClose :title="title" :width="800" :minHeight="minHeight" @ok="handleSubmit">
      <BasicForm @register="registerForm"/>
    <div v-if="isShowProject" style="margin-left: 50px" v-for="(item, index) in itemInfo" :key="item.id">
      {{index+ 1 +"."+item.projectName}}
    </div>
      <div v-if="isShowTipMsg" style="margin-top: 50px" align="center">{{tipMsg}}</div>
  </BasicModal>
</template>

<script lang="ts" setup>
    import {ref, computed, unref} from 'vue';
    import {BasicModal, useModalInner} from '/@/components/Modal';
    import {BasicForm, useForm} from '/@/components/Form/index';
    import {applyFormSchema} from '../EhsEiaInfo.data';
    import {operate} from '../EhsEiaInfo.api';
    import {picPreviewUrl} from "/@/api/common/api";
    // Emits声明
    const emit = defineEmits(['register','success']);
    const isUpdate = ref(true);
    //表单配置
    const [registerForm, {setProps,resetFields, setFieldsValue, validate}] = useForm({
        //labelWidth: 150,
        schemas: applyFormSchema,
        showActionButtonGroup: false,
        baseColProps: {span: 24}
    });
    //设置标题
    const title = ref("");
    const tipMsg = ref("");
    const isShowTipMsg = ref(false);
    const isShowProject = ref(false);
    const minHeight = ref(400);
    const itemInfo = ref([]);
    //表单赋值
    const [registerModal, {setModalProps, closeModal}] = useModalInner(async (data) => {
        //重置表单
        await resetFields();
        setModalProps({confirmLoading: false,showCancelBtn:!!data?.showFooter,showOkBtn:!!data?.showFooter});
        isUpdate.value = !!data?.isUpdate;
        itemInfo.value = data.item.map(e=>{
          return {
            projectName: e.projectName,
            id: e.id,
          }
        })

        if (unref(isUpdate)) {
            //表单赋值
          if(data.record.eiaType == "1"){
            title.value = "备案信息";
            isShowTipMsg.value =false;
            isShowProject.value = true;
            minHeight.value = 400;
          }else if(data.record.eiaType == "2"){
            title.value = "合同信息";
            isShowTipMsg.value =false;
            isShowProject.value = true;
            minHeight.value = 400;
          }else if(data.record.eiaType == "3"){
            title.value = "环评提资";
            isShowTipMsg.value =false;
            isShowProject.value = true;
            minHeight.value = 400;
          }else if(data.record.eiaType == "4"){
            title.value = "申请排污许可";
            tipMsg.value = "是否确认提交申请排污许可？";
            isShowTipMsg.value =true;
            isShowProject.value = false;
            minHeight.value = 100;
          }else if(data.record.eiaType == "5"){
            title.value = "申请验收";
            tipMsg.value = "是否确认提交申请验收？";
            isShowTipMsg.value =true;
            isShowProject.value = false;
            minHeight.value = 100;
          }
            await setFieldsValue({
                ...data.record,
            });
        }
        // 隐藏底部时禁用整个表单
       setProps({ disabled: !data?.showFooter })
    });

    //表单提交事件
    async function handleSubmit(v) {
        try {
            let values = await validate();
            setModalProps({confirmLoading: true});
            //提交表单
            await operate(values,null);
            //关闭弹窗
            closeModal();
            //刷新列表
            emit('success');
        } finally {
            setModalProps({confirmLoading: false});
        }
    }
</script>

<style lang="less" scoped>
	/** 时间和数字输入框样式 */
  :deep(.ant-input-number){
		width: 100%
	}

	:deep(.ant-calendar-picker){
		width: 100%
	}
</style>
