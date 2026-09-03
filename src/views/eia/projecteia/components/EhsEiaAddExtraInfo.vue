<template>
  <div style="text-align: center; height: 300px;">
    <basic-modal :centered = "true"  
    v-bind="$attrs" 
    @register="registerModal" 
    :width="800" 
    title="资料补充"
    :mask-closable= "false">
      <a-form
        ref="formRef"
        :rules="rules"
        :model="queryParam"
        :label-col="{
          xs: { span: 12 },
          sm: { span: 5 },
        }"
        :wrapper-col="{
          xs: { span: 24 },
          sm: { span: 19 },
        }"
      >
   
        <a-form-item label="补充要求" name ="addRequest">
        <a-textarea 
        v-model:value="queryParam.addRequest" 
        :placeholder="'请输入补充要求'"
        :maxlength="300" 
        />
        </a-form-item>

        <a-form-item label="截止日期" name="endDt" >
          <a-date-picker
            :showTime="false"
            valueFormat="YYYY-MM-DD"
            :placeholder="'请选择时间'"
            v-model:value="queryParam.endDt"
            :disabledDate="disabledDate"
          ></a-date-picker>
        </a-form-item>
   
        <a-form-item label="补充单位" name="addOrg">
          <a-select
            v-model:value="queryParam.addOrg"
            mode="multiple"
            placeholder="请选择"    
          >
          <a-select-option v-for="(item, index) in orgArr" :key="index" :value="item.value">
                        {{ item.lable }}
          </a-select-option>
        </a-select>
        </a-form-item>
        
      </a-form>

      <template #footer>
        <div style="text-align: center">
          <a-button style="margin-right: 15px" @click="close">取消</a-button>
          <a-button type="primary" @click="confirmClose">确认</a-button>
        </div>
      </template>
    </basic-modal>
  </div>
</template>
<script lang="ts" name="ehs-eia-add-extra-info" setup>

  import {  reactive,ref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import {listEiaInfoByCondition,addEiaExtraBatch,editOption,editApplyOption } from '../EhsEiaProjectInfo.api';
  import { message,SelectProps,FormInstance } from 'ant-design-vue'; 
  import type { Rule } from 'ant-design-vue/es/form';
  import { useMessage } from '/@/hooks/web/useMessage';
    const { createMessage } = useMessage();
  
  const formRef = ref<FormInstance>();
  const emit = defineEmits(['success','getStepsTimes']);
 
  const disabledDate = (current) => {
    const today = new Date();
    const todayTimestamp = today.getTime();
    const currentTimestamp = current.valueOf();
    return currentTimestamp < todayTimestamp;
  };

  const rules: Record<string, Rule[]> = {
    addRequest: [{ required: true, message: '请填写补充说明！', trigger: 'change' },
    { min: 0, max: 300, message: '长度不能超过 300 个字符', trigger: 'change' }],
    addOrg: [{ required: true, message: '请选择补充单位！', trigger: 'change' }],
    // endDt: [{ required: true, message: '请选择时间！', trigger: 'change' }],
    
  };

    const queryParam = reactive({
    applyId: '',
    addRequest: '',
    addOrg :[],
    endDt: '',
    eiaProjectName:'',
    type:'',
  });

  const orgArr = ref([]);
  const infoData = ref([]);
  
  // const orgArr = ref<SelectProps['options']>()

  const [registerModal, { closeModal }] = useModalInner((data) => {

    queryParam.applyId = data.applyId;
    queryParam.eiaProjectName = data.eiaProjectName;
    queryParam.type = data.type;
    let params = {'applyId' :data.applyId};
    let unduplicateOrgArr = [];
    listEiaInfoByCondition(params).then((res) =>{
      if(res && res.length >0 ){
          for(let item of res){
              let org = {'lable': item.orgName, 'value':item.orgCode };
              unduplicateOrgArr.push(org);
          }
  
          if(unduplicateOrgArr && unduplicateOrgArr.length> 0){
          let duplicateOrgArr =  duplicateOrg(unduplicateOrgArr);
          orgArr.value = duplicateOrgArr;
          console.log(orgArr.value);
          }
          infoData.value = res;

        }
    })
  });

  const close = () => {
    // 清空条件
    queryParam.addRequest ="";
    queryParam.addOrg = [];
    queryParam.endDt ="";
    queryParam. eiaProjectName ="";
    closeModal();
  };

  const confirmClose = async () => {
    try {

    addExtraOrg();

    } catch (e) {}
  };


  async function addExtraOrg(){

    formRef.value.validate().then(async(values) => {
        // console.log ("=====资料补充上传信息====",values);

          // let orgCode = "";
          // if(queryParam.addOrg && queryParam.addOrg != null){
          //   orgCode = queryParam.addOrg.join(",");
          // }

          // 当前页签 1:环评中 2:环评完成 3:排污许可 4:待验收 5:已验收 6:待审核

          // 基础信息
          // let infoParams = {};
          // 批次信息
          // let applyParams = {};
        // 资料补充类型
        let addType = '';
        // 资料审核类型
        let auditType = '';

        if(queryParam.type == '1'){
        addType = '1';
        }else if(queryParam.type == '2'){
        // let date = new Date();
        // infoParams = {'applyId':queryParam.applyId,'status':'6','eiaEndDt':date};
        // applyParams = {'id':queryParam.applyId,'status':'6'};
        addType = '1';
        } else if(queryParam.type == '3'){
        addType = '2';
        auditType = '8';
        }else if(queryParam.type == '4'){
        addType = '3';
        }else if(queryParam.type == '5'){
        addType = '5';
        }

     // 查询项目详细信息
    let result = [];
    if(infoData.value && infoData.value.length > 0){

    for(let orgCode of queryParam.addOrg){
            for(let item of infoData.value){
              if(item.orgCode == orgCode){
                  let params ={
                  'applyId': queryParam.applyId,
                  'addRequest': queryParam.addRequest,
                  'addOrg' : orgCode,
                  'endDt': queryParam.endDt,
                  'eiaProjectName': queryParam.eiaProjectName,
                  'projectName': item.projectName,
                  'infoId': item.id,
                  'type' :addType,
                  'orgName':item.orgName,
                  'addStatus':'0',
                  'infoOrgName':item.orgName
                  }
                result.push(params);
              }
          }
      } 

      if(result && result.length>0){
        addEiaExtraBatch(result).then((res)=>{
          if(res.success){
            createMessage.success(res.message);
          }
        });
      } else{
        message.warning("请重新添加!")
      }

      let params = {};
      emit('getStepsTimes', params)
    }

     //关闭弹窗
     closeModal();
      //刷新列表
      emit('success', 6);
      // 清空条件
      formRef.value.resetFields();
    });

  }


  function duplicateOrg(orgArr) {
    for (var i = 0; i < orgArr.length - 1; i++) {
        for (var j = i + 1; j < orgArr.length; j++) {
            if (orgArr[i].value == orgArr[j].value) {
              orgArr.splice(j, 1);
                //因为数组长度减小1，所以直接 j++ 会漏掉一个元素，所以要 j--
                j--;
            }
        }
    }
    return orgArr;
}
</script>

<style scoped>

</style>
