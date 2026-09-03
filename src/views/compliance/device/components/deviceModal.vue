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
    const logininfo = computed(() => userStore.getLoginInfo);
    async function getOrgList() {
      await defHttp.get({ url: '/jn/common/getOrganizationNew' }).then((res) => {
        res.map((item) => {
          orgOptions.value.push({
            label: item.departName,
            value: item.orgCode,
          });
        });
      });
      const orgCode = userinfo.value.orgCode.length >= 6 ? userinfo.value.orgCode.substring(0, 6) : '';
      // const orgCode = 'A04A06';
      await defHttp.get({ url: '/fireManagement/jnFireKeyLedger/getClearPlanHaveStopUse?subsidiaryCode=' + orgCode}).then((res) => {
        clearPlans.value = res;
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
        field: 'orgCode',
        label: '属地单位',
        component: 'ETreeSelectOrg',
        rules: [{ 'required': true, 'message': '请选择属地单位！'}],
      },
      {
        label: '治理设备类别',
        field: 'deviceType',
        component: 'JDictSelectTag',
        rules: [{ 'required': true, 'message': '请选择治理设备类别！'}],
        componentProps: {
          dictCode: 'ehsEcmDevice_deviceType',
          placeholder: '请选择',
          stringToNumber: false,
          showChooseOption: false,
        },
      },
      {
        label: '治理设备名称',
        field: 'deviceName',
        component: 'Input',
        rules: [{ 'required': true, 'message': '治理设备名称不可为空！'}],
        componentProps: {
          maxlength: 50,
        },
      },
      {
        label: '数量',
        field: 'amount',
        component: 'InputNumber',
        dynamicRules: ()=>[{required: true,message: '数量不可为空！'}],
        componentProps: {
          // precision: 0,
          max: 99,
          min: 1,
          formatter: (value)=>{
            return value=="" ? "" : parseInt(value);
          }
        },
      },
      {
        label: '运行状态',
        field: 'runningStatus',
        component: 'Input',
        rules: [{ required: true, message: '运行状态不可为空！'}],
        componentProps: {
          maxlength: 50,
        },
      },
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
        label: '设备维修负责单位',
        field: 'repairUnit',
        component: 'Input',
        rules: [{ required: true, message: '设备维修负责单位不可为空！'}],
        componentProps: {
          maxlength: 100,
        },
      },
      {
        label: '维护保养负责单位',
        field: 'maintenanceUnit',
        component: 'Input',
        rules: [{ required: true, message: '维护保养负责单位不可为空！'}],
        componentProps: {
          maxlength: 100,
        },
      },
      {
        label: '维护保养内容',
        field: 'maintenanceContent',
        component: 'Input',
        rules: [{ required: true, message: '维护保养内容不可为空！'}],
        componentProps: {
          maxlength: 100,
        },
      },
      {
        label: '维保计划',
        field: 'maintenancePlanId',
        component: 'Select',
        rules: [{ required: true, message: '请选择维保计划！'}],
        componentProps: {
          // key: 'value',
          // value: 'label',
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
    const title = ref('');
    //表单配置
    const [registerForm, {setProps,resetFields, setFieldsValue, validate}] = useForm({
        //labelWidth: 150,
        schemas: formSchema,
        showActionButtonGroup: false,
        baseColProps: {span: 24}
    });
    const defaultValue = ref<string>("");
    if (userinfo.value.orgCode.length > 6) {
      defaultValue.value = userinfo.value.orgCode.slice('0', '6');
    } else if (userinfo.value.orgCode.length == 6) {
      defaultValue.value = userinfo.value.orgCode;
    }
    //表单赋值
    const [registerModal, {setModalProps, closeModal}] = useModalInner(async (data) => {
        //重置表单
        await resetFields();
        setModalProps({confirmLoading: false,showCancelBtn:!!data?.showFooter,showOkBtn:!!data?.showFooter});
        isUpdate.value = !!data?.isUpdate;
        //设置标题
        if (!data?.showFooter) {
          title.value = '查看';
        } else if (data?.isUpdate) {
          title.value = '编辑';
        } else {
          title.value = '新增';
        }
        if (unref(isUpdate)) {
          orgCode.value = data.record.belongingAreaCode.length >= 6 ? data.record.belongingAreaCode.substring(0, 6) : '';
          getCleanList();
          //表单赋值
          await setFieldsValue({
              ...data.record,
          });
        } else {
          let isSecuritySector = logininfo.value.departs[0].isSecuritySector;
          if (isSecuritySector == "0") {
            setFieldsValue({"orgCode": defaultValue.value});
            setFieldsValue({"belongingAreaCode": defaultValue.value});
          }
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
