<template>
  <BasicModal v-bind="$attrs" @register="registerModal" destroyOnClose :minHeight="200" :title="title" :width="500" :heigth="300" @ok="handleSubmit">
    <BasicForm @register="registerForm"/>
  </BasicModal>
</template>

<script lang="ts" setup>
  import {ref, computed, unref, reactive} from 'vue';
  import {BasicModal, useModalInner} from '/@/components/Modal';
  import {BasicForm, useForm} from '/@/components/Form/index';
  import {formExtension} from '../EhsNoticeInfo.data';
  import {formExtensionAgree} from '../EhsNoticeInfo.data';
  import {saveOrUpdate} from '../EhsNoticeInfo.api';
  import {defHttp} from "/@/utils/http/axios";
  import {useUserStore} from "/@/store/modules/user";
  import {SuccessMessageMode} from "/#/axios";
  // Emits声明
  const emit = defineEmits(['register','success']);
  const isUpdate = ref(true);
  var titleCode = ref('1');
  let noticeInfo;//grid表格传过来的通知信息
  const userStore = useUserStore();
  const userinfo = computed(() => userStore.getUserInfo);
  //表单配置
  const [registerForm, {setProps,resetFields, setFieldsValue, validate}] = useForm({
    labelWidth: 100,
    schemas: formExtension,
    showActionButtonGroup: false,
    baseColProps: {span: 24}
  });
  //表单赋值
  const [registerModal, {setModalProps, closeModal}] = useModalInner(async (data) => {
    //重置表单
    await resetFields();
    setModalProps({confirmLoading: false,showCancelBtn:!!data?.showFooter,showOkBtn:!!data?.showFooter});
    isUpdate.value = !!data?.isUpdate;
    titleCode.value = data.titleCode;
    noticeInfo = Object.assign({}, data.record);
    if (unref(isUpdate)) {
      //表单赋值
      await setFieldsValue({
        ...data.record,
      });
    }
    // 隐藏底部时禁用整个表单
    setProps({ disabled: !data?.showFooter })
  });
  //设置标题
  const title = computed(() => {
    if (unref(titleCode) == '2'){
      return '延期申请';
    }else if(unref(titleCode) == '3'){
      return '延期审核'
    }else{
      return ''
    }
  });
  //表单提交事件
  async function handleSubmit(v) {
    try {
      let values = await validate(['extensionTime','reson']);
      setModalProps({confirmLoading: true});
      //表单数据封装
      let formData = Object.assign({}, values);
      formData.noticeInfoId = noticeInfo.id;
      formData.status = '0';
      formData.extensionOrgCode = userinfo.value.orgCode;
      await defHttp.get({url: '/jn/common/getDepartByNameOrOrgCodeOrId',params: {orgCode: userinfo.value.orgCode.length >= 6 ? userinfo.value.orgCode.substring(0, 6) : userinfo.value.orgCode}}).then(res=>{
        formData.extensionOrgName = res[0].departName;
      });
      //获取通知书类型字典
      let dicurl = '/sys/dict/getDictText/'+"notice_info_type/"+ noticeInfo.type;
      let infoTypeText = '';
      await defHttp.get({url: dicurl,params: {}}).then(res=>{
        infoTypeText = res;
      });
      formData.infoTypeText= infoTypeText;
      let url = '/notice/ehsNoticeExtension/add';
      await defHttp.post({url: url,params: formData},{successMessageMode: 'none'});
      let infourl = '/notice/ehsNoticeInfo/correctionEdit';
      let infoFormData = {'id': noticeInfo.id,'isExtension': '2'};
      await defHttp.post({url: infourl,params: infoFormData});
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
