<template>
  <BasicModal v-bind="$attrs" @register="registerModal" destroyOnClose :title="title" :width="800"
              @ok="handleSubmit">
    <BasicForm @register="registerForm">
<!--      <template #orgCode="{ model, field }">-->
<!--        <ETreeSelectOrg v-model:value="model[field]"></ETreeSelectOrg>-->
<!--      </template>-->
    </BasicForm>
  </BasicModal>
<!--  <RoleUserModal @register="registerUserModal" @success="handleUser" />-->
</template>

<script lang="ts" setup>
  import {ref, computed, unref} from 'vue';
  import {BasicModal, useModal, useModalInner} from '/@/components/Modal';
  import {BasicForm, FormSchema, useForm} from '/@/components/Form/index';
  import {add} from '../url/index';
  import {message, Upload} from "ant-design-vue";
  import {defHttp} from "/@/utils/http/axios";
  import {useUserStore} from "/@/store/modules/user";
  import {Rule} from "ant-design-vue/es/form";
  // Emits声明
  const emit = defineEmits(['register', 'success']);

  const orgOptions = ref<any>([]);
  getOrgList();
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
  //表单数据
  const formSchema: FormSchema[] = [
    {
      label: '汇报单位',
      field: 'orgCode',
      component: 'Select',
      componentProps: {
        options: orgOptions.value,
        showChooseOption: false,
      },
      rules: [{ 'required': true, 'message': '汇报单位不可为空！'}],
    },
    {
      label: '改造项目',
      field: 'renovationProject',
      component: 'Input',
      rules: [{ required: true, message: '改造项目不可为空！'}],
      componentProps: {
        maxlength: 50,
        showCount: true,
      },
    },
    {
      label: '项目内容',
      field: 'projectContent',
      component: 'InputTextArea',
      componentProps: {
        maxlength: 300,
        showCount: true,
        autoSize: {minRows: 3, maxRows: 6}
      },
      dynamicRules: ({ values }) => {
        return [
          { required: true, message: '项目内容不可为空！' },
          { min: 0, max: 300, message: '请输入300字内的项目内容！', trigger: 'blur' },
        ];
      },
    },
    {
      label: '节能减排种类',
      field: 'renovationType',
      component: 'Input',
      rules: [{ required: true, message: '节能减排种类不可为空！'}],
      componentProps: {
        maxlength: 50,
        showCount: true,
      },
    },
    {
      label: '节能减排数量',
      field: 'renovationNum',
      component: 'Input',
      rules: [{ required: true, message: '节能减排数量不可为空！'}],
      componentProps: {
        maxlength: 50,
        showCount: true,
      },
    },
    {
      label: '改造日期',
      field: 'renovationDate',
      component: 'DatePicker',
      rules: [{ required: true, message: '改造日期不可为空！'}],
      componentProps: {
        valueFormat: 'YYYY-MM-DD',
        style: {width: '100%'}
      },
    },
    {
      label: '改造前照片',
      field: 'beforeRenovation',
      component: 'JImageUpload',
      rules: [{ required: true, message: '改造前照片不可为空！'}],
      componentProps: {
        fileMax: 10,
        bizPath: 'deviceManage',
        text: '',
        isWatermark: true,
      },
    },
    {
      label: '改造后照片',
      field: 'afterRenovation',
      component: 'JImageUpload',
      rules: [{ required: true, message: '改造后照片不可为空！'}],
      componentProps: {
        fileMax: 10,
        text: '',
        bizPath: 'deviceManage',
        isWatermark: true,
        beforeUpload: (file: File) => {
          const isLt50M = file.size / 1024 / 1024 < 50;
          if (!isLt50M) {
            message.error('图片过大，请不要超过50M！');
            return false || Upload.LIST_IGNORE;
          }
          return true;
        },
      },
    },
    {
      label: '金额',
      field: 'amount',
      component: 'Input',
      componentProps: {
        maxlength: 20,
        showCount: true,
      },
    },
    {
      label: '发票',
      field: 'invoice',
      component: 'JUpload',
      componentProps: {
        bizPath: 'deviceManage',
        maxCount: 5,
        text: '添加附件',
        beforeUpload: (file: File) => {
          const isLt300M = file.size / 1024 / 1024 < 300;
          if (!isLt300M) {
            message.error('文件过大，请不要超过300M！');
            return false || Upload.LIST_IGNORE;
          }
          return true;
        },
      },
    },
    {
      label: '',
      field: 'year',
      component: 'Input',
      show: false
    },
    {
      label: '',
      field: 'month',
      component: 'Input',
      show: false
    },
  ];

  //表单配置
  const [registerForm, {setProps, getProps, resetFields, setFieldsValue, getFieldsValue, validate}] = useForm({
    labelWidth: 120,
    schemas: formSchema,
    showActionButtonGroup: false,
    baseColProps: {span: 24},
  });

  const userStore = useUserStore();
  const userinfo = computed(() => userStore.getUserInfo);
  const loginInfo = computed(() => userStore.getLoginInfo);
  const defaultValue = ref<string>("");
  if (userinfo.value.orgCode.length > 6) {
    defaultValue.value = userinfo.value.orgCode.slice('0', '6');
  } else if (userinfo.value.orgCode.length == 6) {
    defaultValue.orgCode = userinfo.value.orgCode;
  }
  let isSecuritySector = loginInfo.value.departs[0].isSecuritySector;
  //表单赋值
  const [registerModal, {setModalProps, closeModal}] = useModalInner(async (data) => {
    //重置表单
    await resetFields();
    setModalProps({
      confirmLoading: false,
      showCancelBtn: true,
      showOkBtn: true
    });

    if(isSecuritySector == '0') setFieldsValue({"orgCode": defaultValue.value});
    setFieldsValue({"year": data.year});
    setFieldsValue({"month": data.month});
  });
  //设置标题
  const title = computed(() => ('汇报'));

  //表单提交事件
  async function handleSubmit(v) {
    try {
      let values = await validate();
      setModalProps({confirmLoading: true});
      //提交表单
      await add(values);
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
