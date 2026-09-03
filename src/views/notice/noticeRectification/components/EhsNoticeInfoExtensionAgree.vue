<template>
  <BasicModal v-bind="$attrs" @register="registerModal" destroyOnClose :minHeight="320" :title="title" :width="500" :heigth="300">
    <BasicForm @register="registerForm"/>
    <template #footer>
      <a-button color="warning" style="margin-right: 50px;" @click="noPass">不同意</a-button>
      <a-button type="primary" style="margin-right: 150px;" @click="pass">同意</a-button>
    </template>
  </BasicModal>
</template>

<script lang="ts" setup>
  import {ref, computed, unref, reactive} from 'vue';
  import {BasicModal, useModalInner} from '/@/components/Modal';
  import {BasicForm, useForm} from '/@/components/Form/index';
  import {formExtensionAgree} from '../EhsNoticeInfo.data';
  import {defHttp} from "/@/utils/http/axios";
  import { useUserStore } from '/@/store/modules/user';
  // Emits声明
  const emit = defineEmits(['register','success']);
  const isUpdate = ref(true);
  var titleCode = ref('1');
  let noticeInfo;//grid表格传过来的通知信息
  let noticeExtension;
  const userStore = useUserStore();
  const userinfo = computed(() => userStore.getUserInfo);
  //表单配置
  const [registerForm, {setProps,resetFields, setFieldsValue, validate}] = useForm({
    labelWidth: 100,
    schemas: formExtensionAgree,
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
    let formInitData;
    let url = '/notice/ehsNoticeExtension/listByInfoId';
    await defHttp.get({url: url,params: {'noticeInfoId': noticeInfo.id,'status': '0'}}).then(res => {
      if(res.length>0){
        noticeExtension = res[0];
        formInitData = Object.assign({}, {
          'id': noticeExtension.id,
          'extensionOrgName':noticeExtension.extensionOrgName,
          'noticeExtension':noticeExtension.extensionOrgCode,
          'extensionTime': noticeExtension.extensionTime,
          'reson': noticeExtension.reson,
          'passTime': noticeExtension.extensionTime,
        });
        formInitData.endDt = noticeInfo.endDt;
      }
    });
    if (unref(isUpdate)) {
      //表单赋值
      await setFieldsValue({
        ...formInitData,
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

  async function noPass(v) {
    try {
      let values = await validate(['id','passTime','auditStatement']);
      setModalProps({confirmLoading: true});
      //表单数据封装
      let formData = Object.assign({}, values);
      formData.status = '2';
      formData.auditUserId = userinfo.value.id;
      formData.auditName = userinfo.value.realname;
      formData.extensionUsername = noticeExtension.extensionUsername;
      formData.noticeInfoId = noticeExtension.noticeInfoId;
      //获取通知书类型字典
      let dicurl = '/sys/dict/getDictText/'+"notice_info_type/"+ noticeInfo.type;
      let infoTypeText = '';
      await defHttp.get({url: dicurl,params: {}}).then(res=>{
        infoTypeText = res;
      });
      formData.infoTypeText= infoTypeText;
      let url = '/notice/ehsNoticeExtension/edit';
      await defHttp.post({url: url,params: formData});
      let infourl = '/notice/ehsNoticeInfo/correctionEdit';
      let infoFormData = {'id': noticeInfo.id,'isExtension': '0'};
      await defHttp.post({url: infourl,params: infoFormData},{successMessageMode: 'none'});
      //关闭弹窗
      closeModal();
      //刷新列表
      emit('success');
    } finally {
      setModalProps({confirmLoading: false});
    }
  }

  async function pass(v) {
    try {
      let values = await validate(['id','passTime','auditStatement']);
      setModalProps({confirmLoading: true});
      //表单数据封装
      let formData = Object.assign({}, values);
      formData.status = '1';
      formData.auditUserId = userinfo.value.id;
      formData.auditName = userinfo.value.realname;
      formData.extensionUsername = noticeExtension.extensionUsername;
      formData.noticeInfoId = noticeExtension.noticeInfoId;
      //获取通知书类型字典
      let dicurl = '/sys/dict/getDictText/'+"notice_info_type/"+ noticeInfo.type;
      let infoTypeText = '';
      await defHttp.get({url: dicurl,params: {}}).then(res=>{
        infoTypeText = res;
      });
      formData.infoTypeText= infoTypeText;
      let url = '/notice/ehsNoticeExtension/edit';
      await defHttp.post({url: url,params: formData});
      let infourl = '/notice/ehsNoticeInfo/correctionEdit';
      let infoFormData = {'id': noticeInfo.id,'isExtension': '1','endDt':values.passTime};
      await defHttp.post({url: infourl,params: infoFormData},{successMessageMode: 'none'});
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
