<template>
  <BasicModal v-bind="$attrs" @register="registerModal" destroyOnClose :title="title" :width="800" @ok="handleSubmit">
      <BasicForm @register="registerForm"/>
  </BasicModal>
</template>

<script lang="ts" setup>
    import {ref, computed, unref} from 'vue';
    import {BasicModal, useModalInner} from '/@/components/Modal';
    import {BasicForm, FormSchema, useForm} from '/@/components/Form/index';
    import {saveOrUpdate} from '../device.api';
    import {defHttp} from "/@/utils/http/axios";
    import {useUserStore} from "/@/store/modules/user";
    import {message, Upload} from "ant-design-vue";
    // Emits声明
    const emit = defineEmits(['register','success']);
    const isUpdate = ref(true);
    const orgOptions = ref<any>([]);
    const clearPlans = ref<any>([]);
    const userStore = useUserStore();
    const userinfo = computed(() => userStore.getUserInfo);
    async function getOrgList() {
      await defHttp.get({ url: '/jn/common/getOrganizationNew' }).then((res) => {
        res.map((item) => {
          orgOptions.value.push({
            label: item.departName,
            value: item.orgCode,
          });
        });
      });
    }
    const orgCode = ref('A04A06');
    async function getCleanList() {
      await defHttp.get({ url: '/fireManagement/jnFireKeyLedger/getClearPlanHaveStopUse?subsidiaryCode=' + orgCode.value}).then((res) => {
        clearPlans.value = res;
      });
    }
    getOrgList();
    //表单数据
    const formSchema: FormSchema[] = [
      {
        field: 'belongingAreaCode',
        label: '设备归属地',
        component: 'Select',
        rules: [{ 'required': true, 'message': '请选择设备归属地！'}],
        componentProps: {
          key: 'orgCode',
          value: 'departName',
          options: orgOptions,
          showChooseOption: false,
          onChange: (e) => {
            orgCode.value = e;
            getCleanList();
            setFieldsValue({"maintenancePlanId": ""});
          },
        },
      },
      {
        label: '维保计划',
        field: 'maintenancePlanId',
        component: 'Select',
        rules: [{ 'required': true, 'message': '请选择维保计划！'}],
        componentProps: {
          options: clearPlans,
          showChooseOption: false,
        },
      },
      // TODO 主键隐藏字段，目前写死为ID
      {
        label: '',
        field: 'id',
        component: 'Input',
        show: false
      },
    ];
    //表单配置
    const [registerForm, {setProps,resetFields, setFieldsValue, validate}] = useForm({
        //labelWidth: 150,
        schemas: formSchema,
        showActionButtonGroup: false,
        baseColProps: {span: 24}
    });
    //表单赋值
    const [registerModal, {setModalProps, closeModal}] = useModalInner(async (data) => {
        //重置表单
        await resetFields();
        setModalProps({confirmLoading: false,showCancelBtn:!!data?.showFooter,showOkBtn:!!data?.showFooter});
        isUpdate.value = !!data?.isUpdate;
        if (unref(isUpdate)) {
          orgCode.value = data.record.belongingAreaCode.length >= 6 ? data.record.belongingAreaCode.substring(0, 6) : '';
          getCleanList();
            //表单赋值
            await setFieldsValue({belongingAreaCode: data.record.belongingAreaCode});
            await setFieldsValue({id: data.record.id});
            if(data.record.maintenancePlanId != null) await setFieldsValue({maintenancePlanId: data.record.maintenancePlanId});
        }
        // 隐藏底部时禁用整个表单
       setProps({ disabled: !data?.showFooter })
    });
    //设置标题
    const title = computed(() => '关联计划');
    //表单提交事件
    async function handleSubmit(v) {
        try {
            let values = await validate();
            setModalProps({confirmLoading: true});
            //提交表单
            await saveOrUpdate(values, isUpdate.value);
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
