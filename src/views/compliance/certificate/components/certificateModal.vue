<template>
  <BasicModal v-bind="$attrs" @register="registerModal" destroyOnClose :title="title" :width="800"
              @ok="handleSubmit">
    <BasicForm @register="registerForm">
      <template #orgCode="{ model, field }">
        <ETreeSelectOrg :isDisabled="isDisabled" v-model:value="model[field]"></ETreeSelectOrg>
      </template>
    </BasicForm>
  </BasicModal>
  <RoleUserModal @register="registerUserModal" @success="handleUser" />
</template>

<script lang="ts" setup>
  import {ref, computed, unref} from 'vue';
  import {BasicModal, useModal, useModalInner} from '/@/components/Modal';
  import {BasicForm, FormSchema, useForm} from '/@/components/Form/index';
  import ETreeSelectOrg from './ETreeSelectOrg.vue';
  import RoleUserModal from './RoleUserModal.vue';
  import {saveOrUpdate} from '../certificate.api';
  import {message, Upload, UploadProps} from "ant-design-vue";
  import {defHttp} from "/@/utils/http/axios";
  import {useUserStore} from "/@/store/modules/user";
  import {Rule} from "ant-design-vue/es/form";
  import {bool} from "vue-types";
  import {previewFile} from "/@/api/common/api";
  import dayjs, {Dayjs} from "dayjs";
  import {rules} from "/@/utils/helper/validator";
  import { useMessage } from '/@/hooks/web/useMessage';
  // Emits声明
  const emit = defineEmits(['register', 'success']);
  const isUpdate = ref(true);

  const [registerUserModal, { openModal }] = useModal();
  const { createMessage } = useMessage();
  const auditIds = ref('');
  const auditorName = ref('');
  const auditOrgCodes = ref('');
  // 选择角色或人回调
  function handleUser(val:any){
    auditIds.value = val.approvalContentOne;
    auditorName.value = val.approvalContentTwo;
    auditOrgCodes.value = val.approvalContentThree;
    setFieldsValue({
      remindUsersNames: val.approvalContentTwo,
      remindUsers: val.approvalContentOne,
    });
  }
  let validateIsRemind = async (_rule: Rule, value: string) => {
    const form = getFieldsValue();
    if (value === '1' && (form.certificateValidateEnd === undefined || form.certificateValidateEnd === null)) {
      return Promise.reject('请设置证件有效期，没有到期时间无法开启提醒！');
    } else {
      return Promise.resolve();
    }
  };
  let validateRemindBefore = async (_rule: Rule, value: string) => {
    if (isRemindBool.value  && (value == undefined || value == null)) {
      return Promise.reject('请填写到期前多少天开始提醒！');
    } else {
      return Promise.resolve();
    }
  };
  const isRemindBool = ref<boolean>(false);
  const isRemindDisplay = ref(true);
  const isDisabled = ref<boolean>(false);
  const handlePreview = async (file: UploadProps['fileList'][number]) => {
    previewFile(file.name).then((res) => {
      window.open(res, '_blank');
    });
  };
  //表单数据
  const formSchema: FormSchema[] = [
    {
      label: '所属机构',
      field: 'orgCode',
      component: 'ETreeSelectOrg',
      rules: [{ 'required': true, 'message': '请选择所属机构！'}],
    },
    {
      label: '提醒设置',
      field: 'isRemind',
      component: 'Switch',
      // rules: [{ validator: validateIsRemind, trigger: 'change'}],
      componentProps: {
        checked: false,
        checkedValue: "1",
        unCheckedValue: "0",
        onChange: (checked, event)=>{
          if(isRemindDisplay.value){
            isRemindBool.value = false;
            setFieldsValue({isRemind: '0'});
            createMessage.warning('请设置证件有效期，没有到期时间无法开启提醒！');
          }else{
            if(checked == '1'){
              isRemindBool.value = true;
            }else{
              isRemindBool.value = false;
            }
          }
        },
      },
      // dynamicDisabled: ({ values }) => {
      //   return isRemindDisplay.value;
      // },
      defaultValue: "0"
    },
    {
      label: '证件类型',
      field: 'certificateType',
      component: 'Input',
      componentProps:{
        maxLength: 50,
      },
    },
    {
      label: '',
      field: 'remindBefore',
      component: 'InputNumber',
      dynamicRules: ()=>[{required: isRemindBool.value,message: '请设置到期前x天开始提醒！'}],
      componentProps: {
        prefix: "到期前",
        style: {width: '100%'},
        max: 999,
        min: 1,
      },
      dynamicDisabled: ()=> !isRemindBool.value,
      suffix: "天",
      colProps: {
        offset: 3,
        span: 9,
      },
    },
    {
      label: '证件编号',
      field: 'certificateNo',
      component: 'Input',
      // rules: [{ required: true, message: '请填写证件编号！'}],
      dynamicRules: ({ model, schema }) => [
        { required: true, message: '请填写证件编号！'},
        {...rules.duplicateCheckRule('ehs_ecm_certificate', 'certificate_no', model, schema)[0]},
      ],
      componentProps:{
        maxLength: 50,
      },
    },
    {
      label: '频度',
      field: 'remindFrequency',
      component: 'InputNumber',
      dynamicRules: ()=>[{required: isRemindBool.value,'message': '请设置提醒后每x天提醒一次！'}],
      dynamicDisabled: ()=> !isRemindBool.value,
      componentProps: {
        prefix: "每",
        style: {width: '100%'},
        max: 99,
        min: 1,

      },
      suffix: "天1次",
    },
    {
      label: '证件有效起始日期',
      field: 'certificateValidateStart',
      component: 'DatePicker',
      rules: [{ required: true, message: '请选择证件有效起始日期！'}],
      componentProps: {
        valueFormat: 'YYYY-MM-DD',
        style: {width: '100%'}
      },
    },
    {
      label: '时间',
      field: 'remindTime',
      component: 'TimePicker',
      dynamicRules: ()=>[{required: isRemindBool.value, 'message': '请填写提醒时的具体时间！'}],
      dynamicDisabled: ()=> !isRemindBool.value,
      componentProps: {
        prefix: "每日",
        style: {width: '100%'},
        format: "HH",
        valueFormat: "HH",
        disabledHours: function () {
          const result = [];
          for (let i = 1; i < 7; i++) {
            result.push(i)
          }
          return result
        }
      },
    },
    {
      label: '证件有效结束日期',
      field: 'certificateValidateEnd',
      component: 'DatePicker',
      dynamicRules: ({ model }) => {
        return [
          {
            validator: (_, value) => {
              let fieldsValue = getFieldsValue();
              let certificateValidateStart = fieldsValue.certificateValidateStart;
              if(certificateValidateStart != undefined && certificateValidateStart != null){
                if(dayjs(certificateValidateStart) > dayjs(value)){
                  return new Promise((resolve, reject) => {
                    reject('证件有效开始日期不可大于证件有效结束日期！');
                  });
                }else{
                  return new Promise((resolve, reject) => {
                    resolve();
                  });
                }
              }else{
                return new Promise((resolve, reject) => {
                  resolve();
                });
              }

            },
          },
        ];
      },
      componentProps: {
        valueFormat: 'YYYY-MM-DD',
        style: {width: '100%'},
        disabledDate: (current: Dayjs)=>{
          let fieldsValue = getFieldsValue();
          if(fieldsValue.certificateValidateStart != undefined && fieldsValue.certificateValidateStart != null){
            return current < dayjs(fieldsValue.certificateValidateStart).startOf('day');
          }
        },
        onChange: (time, timeString)=>{
          // console.log("==certificateBeginEnd==",time);
          if(time == null){
            setFieldsValue({"isRemind": "0"});
            isRemindDisplay.value = true;
            isRemindBool.value = false;
          }else{
            isRemindDisplay.value = false;
          }
        },
      },
    },
    {
      label: '消息模板',
      field: 'messageTemplate',
      component: 'ApiSelect',
      dynamicRules: ()=>[{required: isRemindBool.value, 'message': '请选择消息模板！'}],
      dynamicDisabled: ()=> !isRemindBool.value,
      componentProps: {
        api: () => {
          return  defHttp.get({ url: '/sys/message/sysMessageTemplate/list', params: {pageNo: 1,pageSize: 9999}})
        },
        resultField: 'records',
        labelField: 'templateName',
        valueField: 'templateCode',
      },
    },
    {
      label: '证件原件',
      field: 'certificatePath',
      component: 'JUpload',
      rules: [{ required: true, message: '请上传证件原件！'}],
      componentProps: {
        bizPath: 'certificate',
        maxCount: 1,
        text: '添加附件',
        beforeUpload: (file: File) => {
          const isPdf = file.type === 'application/pdf';
          const isDoc = file.type === 'application/msword';
          const isDocx = file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
          const isLt300M = file.size / 1024 / 1024 < 300;
          if (!isLt300M) {
            message.error('文件过大，请不要超过300M！');
            return false || Upload.LIST_IGNORE;
          } else if (!isPdf && !isDoc && !isDocx) {
            message.error(`文件格式错误，仅支持doc、docx、pdf格式!推荐pdf格式上传！`);
            return false || Upload.LIST_IGNORE;
          }
          return true;
        },
        showUploadList:{
          showDownloadIcon: true,
          showRemoveIcon: true,
        },
        previewFile: (file: File) => {
          handlePreview(file);
        }
      },
    },
    {
      label: '通知人',
      field: 'remindUsersNames',
      component: 'Input',
      dynamicRules: ()=>[{required: isRemindBool.value, 'message': '请选择通知人！'}],
      dynamicDisabled: ()=> !isRemindBool.value,
      componentProps: () => {
        return {
          placeholder: '请选择',
          readOnly: true,
          onClick: (e: any) => {
            if(isUpdate){
              let fieldsValue = getFieldsValue();
              openModal(true, {"auditIds": fieldsValue.remindUsers});
            }else{
              openModal(true, {"auditIds": auditIds.value});
            }
          },
        };
      },
    },
    {
      label: '',
      field: 'remindUsers',
      component: 'Input',
      show: false
    },
    {
      label: '通知渠道',
      field: 'remindChannel',
      component: 'JCheckbox',
      dynamicRules: ()=>[{required: isRemindBool.value, 'message': '请选择通知渠道！'}],
      dynamicDisabled: ()=> !isRemindBool.value,
      componentProps: {
        options: [
          { label: 'web', value: '0' },
          { label: '短信', value: '1' },
          { label: 'APP', value: '2' },
          // { label: '手机', value: '3' },
        ],
      },
      colProps: {
        offset: 12,
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
  const [registerForm, {setProps, getProps, resetFields, setFieldsValue, getFieldsValue, validate}] = useForm({
    labelWidth: 120,
    schemas: formSchema,
    showActionButtonGroup: false,
    baseColProps: {span: 12},
  });

  const title = ref('');
  const userStore = useUserStore();
  const userinfo = computed(() => userStore.getUserInfo);
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
    setModalProps({
      confirmLoading: false,
      showCancelBtn: !!data?.showFooter,
      showOkBtn: !!data?.showFooter
    });
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
      if(unref(data.showFooter)){//编辑
        isDisabled.value = false;
        if(data.record.isRemind == '1'){
          isRemindBool.value = true;
          isRemindDisplay.value = false;
        }else{
          isRemindBool.value = false;
          if (data.record.certificateValidateEnd == null){
            isRemindDisplay.value = true;
          }else{
            isRemindDisplay.value = false;
          }
        }
      }else{//详情
        isDisabled.value = true;
        isRemindBool.value = false;
        isRemindDisplay.value = true;
      }
      //表单赋值
      await setFieldsValue({
        ...data.record,
      });
    }else{//新增
      setFieldsValue({"orgCode": defaultValue});
      isDisabled.value = false;
      isRemindBool.value = false;
      isRemindDisplay.value = true;
    }
    // 隐藏底部时禁用整个表单
    setProps({disabled: !data?.showFooter})
  });

  //表单提交事件
  async function handleSubmit(v) {
    try {
      // console.log( "==getFieldsValue==",getFieldsValue() );
      let values = await validate();
      // values.remindUsers = auditIds.value;
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
  :deep(.ant-input-number) {
    width: 100%
  }

  :deep(.ant-calendar-picker) {
    width: 100%
  }
</style>
