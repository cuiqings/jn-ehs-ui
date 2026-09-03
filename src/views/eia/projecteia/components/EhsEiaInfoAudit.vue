<template>
  <BasicModal v-bind="$attrs" 
  @register="registerModal" 
  :width="800" 
  :title="title"
  :minHeight="minHeight" 
  @ok="handleSubmit"
  :mask-closable= "false">
      <BasicForm @register="registerForm"/>
      <div v-if="isShowTipMsg" style="margin-top: 50px" align="center">{{tipMsg}}</div>
  </BasicModal>
</template>

<script lang="ts" name = "ehs-eia-info-audit"  setup >
    import {ref, computed, unref} from 'vue';
    import {BasicModal, useModalInner} from '/@/components/Modal';
    import {BasicForm, useForm} from '/@/components/Form/index';
    import {applyFormSchema} from '../EhsEiaProjectInfo.data';
    import {saveAudit,saveBatchAudit,editOption,editApplyOption,editAuditOption,auditCommentAudit,listEiaInfoByCondition,addEiaExtraBatch} from '../EhsEiaProjectInfo.api';
    import { formatToDate ,formatToDateTime} from '/@/utils/dateUtil';
    import { useRouter } from 'vue-router';
    import { useMessage } from '/@/hooks/web/useMessage';
    const { createMessage } = useMessage();


    // Emits声明
    const emit = defineEmits(['register','success','getStepsTimes']);
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
    const minHeight = ref(400);
    //表单赋值
    const [registerModal, {setModalProps, closeModal}] = useModalInner(async (data) => {
        //重置表单
        await resetFields();
        setModalProps({confirmLoading: false,showCancelBtn:true,showOkBtn:true});
        isUpdate.value = true;
        if (unref(isUpdate)) {
            //表单赋值
          if(data.type == "1"){
            title.value = "环评报告(初稿审核)";
            isShowTipMsg.value =false;
            minHeight.value = 400;
          }else if(data.type == "2"){
            title.value = "提交专家审核";
            isShowTipMsg.value =false;
            minHeight.value = 400;
          }else if(data.type == "3"){
            title.value = "环评报告(报批审核)";
            isShowTipMsg.value =false;
            minHeight.value = 400;
          }else if(data.type == "4"){
            title.value = "环评报告(终版)";
            isShowTipMsg.value =false;
            minHeight.value = 400;
          }else if(data.type == "5"){
            title.value = "验收提资单";
            isShowTipMsg.value =false;
            minHeight.value = 400;
          }else if(data.type == "6"){
            title.value = "验收报告";
            isShowTipMsg.value =false;
            minHeight.value = 400;
          }else if(data.type == "7"){
            title.value = "验收报告(终版)";
            isShowTipMsg.value =false;
            minHeight.value = 400;
          
          }
          // else if(data.type == "8"){
          //   title.value = "排污许可证";
          //   isShowTipMsg.value =false;
          //   minHeight.value = 400;
          // }
           else if(data.type == "9"){
            title.value = "审核意见";
            isShowTipMsg.value =false;
            minHeight.value = 400;
          } else if(data.type == "10"){
            title.value = "专家评审结束";
            isShowTipMsg.value =false;
            minHeight.value = 400;
          }else if(data.type == "11" || data.type == "18"){
            title.value = "审核意见";
            isShowTipMsg.value =false;
            minHeight.value = 400;
          }else if(data.type == "12"){
            title.value = "排污许可提资单";
            isShowTipMsg.value =false;
            minHeight.value = 400;
          }else if(data.type == "13"){
            // 排污许可
            title.value = "排污许可填报(初稿)";
            isShowTipMsg.value =false;
            minHeight.value = 400;
          }else if(data.type == "14"){
            // 排污许可
            title.value = "专家评审";
            isShowTipMsg.value =false;
            minHeight.value = 400;
          }else if(data.type == "15"){
            // 排污许可
            title.value = "排污许可(报批)";
            isShowTipMsg.value =false;
            minHeight.value = 400;
          }else if(data.type == "16"){
            title.value = "排污许可证";
            isShowTipMsg.value =false;
            minHeight.value = 400;
          }else if(data.type == "17"){
            // 排污许可填报
            title.value = "专家评审结束";
            isShowTipMsg.value =false;
            minHeight.value = 400;
          }
          
          
          
  
            await setFieldsValue({
                ...data,
            });
        }
        // 隐藏底部时禁用整个表单
       setProps({ disabled: false})
    });


    
    //表单提交事件
    async function handleSubmit(v) {
        try {
            let values = await validate();
            setModalProps({confirmLoading: true});
            let createTime = formatToDateTime(new Date());
            values.createTime = createTime;
            //提交表单
            // 环评初稿、环评报批、验收报告
            if(values.type == '1' || values.type == '3' || values.type == '6'){
              await saveBatchAudit(values);
            }else if(values.type == '4' ){

               // 环评文件终版同步更新
              let params = {'eiaEndAttachId':values.reviewAttach,'applyId':values.applyId,'eiaEndDt':createTime,'status':'6'}
              await editOption(params);

              // 批次信息更新
              let applyParams = {'id':values.applyId,'status':'6'};
              await editApplyOption(applyParams);

              // 保存环评文件终版信息
              await saveAudit(values).then((res)=>{
                if(res.success){
                  createMessage.success(res.message);
                }
              });

            }else if(values.type == '5' ){
              // 资料补充相关信息更新
              let infoParams = {'applyId':values.applyId}
              await listEiaInfoByCondition(infoParams).then((res) =>{
              if(res && res.length >0 ){
                let infoData = res;
                let result = [];
                  if(infoData && infoData.length > 0){
                            for(let item of infoData){
                                  let params ={
                                  'applyId': item.applyId,
                                  'addRequest':'',
                                  'addOrg' : item.orgCode,
                                  'endDt':'',
                                  'eiaProjectName': item.eiaProjectName,
                                  'projectName': item.projectName,
                                  'infoId': item.id,
                                  'type' :'3',
                                  'orgName':item.orgName,
                                  'addStatus':'0',
                                  'infoOrgName':item.orgName
                                  }
                                result.push(params);
                              
                          }
                      if(result && result.length>0){
                         addEiaExtraBatch(result);
                      } 
                    }
                }
             })
               // 验收提资单下发同步更新
               let params = {'applyId':values.applyId,'acceptanceAttachId':values.reviewAttach}
              await editOption(params);
              // 保存验收提资单信息
              await saveAudit(values).then((res)=>{
                if(res.success){
                  createMessage.success(res.message);
                }
              });
            } else if(values.type == '7' ){
              // 已验证同步更新
              let params = {'acceptanceEndDt':createTime,'applyId':values.applyId,'acceptanceEndAttachId':values.reviewAttach,'status':'8'}
              await editOption(params);

              // 批次信息更新
              let applyParams = {'id':values.applyId,'status':'8'};
              await editApplyOption(applyParams);

                // 保存验收文件终版信息
              await saveAudit(values).then((res)=>{
                if(res.success){
                  createMessage.success(res.message);
                }
              });
            } else if(values.type == '8' ){
              // 排污许可证同步更新
              let params = {'applyId':values.applyId,'pollutionDischargeStatus':'2'}
              await editOption(params);

               // 批次信息更新
               let applyParams = {'id':values.applyId,'pollutionDischargeStatus':'2'};
              await editApplyOption(applyParams);

              await saveAudit(values).then((res)=>{
                if(res.success){
                  createMessage.success(res.message);
                }
              });

            } else if(values.type == '9' ){
               // 审核意见提交
              let params = {'auditTime':createTime,'id':values.id,'auditComments':values.auditComments}
              await editAuditOption(params);
           } else if(values.type == '10' ){
              // 专家审核时间
              let params = {'updateTime':createTime,'id':values.id,'auditEndDt':values.auditEndDt,'auditEndAttach':values.auditEndAttach}
              await editAuditOption(params);
            }else if(values.type == '11' || values.type == '18' ){
               // 环评提资单审核意见、排污许可资料补充审核意见
               let auditStatement = values.auditStatement;
               let status = values.status;
               if(status == '3'){
                if(null == auditStatement || '' == auditStatement || undefined == auditStatement){
                  createMessage.success("请填写审核说明!");
                  return;
                }
               }
               let params = {'id':values.id,'auditorTime':createTime,'status':values.status,'auditStatement':values.auditStatement};
              await auditCommentAudit(params);
            }else if(values.type == '12' ){
               // 排污提资单
               let params = {'createTime':createTime,'reviewAttach':values.reviewAttach,'type':8,'applyId':values.applyId}
               await saveAudit(params).then((res)=>{
                if(res.success){
                  createMessage.success(res.message);
                }
              });
            }else if(values.type == '13' ){
               // 排污许可填报(初稿)
               let params = {'createTime':createTime,'reviewAttach':values.reviewAttach,'type':9,'applyId':values.applyId,'auditer':values.auditer}
               await saveBatchAudit(params).then((res)=>{
                if(res.success){
                  createMessage.success(res.message);
                }
              });
            }else if(values.type == '14' ){
               // 排污许可填报(专家审核)
               let params = {'createTime':createTime,'reviewAttach':values.reviewAttach,'type':10,'applyId':values.applyId,'commitTime':createTime}
               await saveAudit(params).then((res)=>{
                if(res.success){
                  createMessage.success(res.message);
                }
              });
            }else if(values.type == '15' ){
               // 排污许可报批版
               let params = {'createTime':createTime,'reviewAttach':values.reviewAttach,'type':11,'applyId':values.applyId,'auditer':values.auditer}
               await saveBatchAudit(params).then((res)=>{
                if(res.success){
                  createMessage.success(res.message);
                }
              });
            }else if(values.type == '16' ){

                // 排污许可证同步更新
                let params = {'applyId':values.applyId,'pollutionDischargeStatus':'2','pollutionDischargeAttach':values.reviewAttach}
              await editOption(params);

               // 批次信息更新
               let applyParams = {'id':values.applyId,'pollutionDischargeStatus':'2'};
              await editApplyOption(applyParams);
               // 排污许可证
               let auditParams = {'createTime':createTime,'reviewAttach':values.reviewAttach,'type':12,'applyId':values.applyId}
               await saveAudit(auditParams).then((res)=>{
                if(res.success){
                  createMessage.success(res.message);
                }
              });
            }else if(values.type == '17' ){
              // 排污许可专家评审结束
              let params = {'updateTime':createTime,'id':values.id,'auditEndDt':values.auditEndDt,'auditEndAttach':values.auditEndAttach}
              await editAuditOption(params);
            }else{
              await saveAudit(values).then((res)=>{
                if(res.success){
                  createMessage.success(res.message);
                }
              });
            }

            //关闭弹窗
            closeModal();
            //刷新列表
            emit('success');
            let params = {'createTime':values.createTime,'type':values.type};
            emit('getStepsTimes', params)

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
