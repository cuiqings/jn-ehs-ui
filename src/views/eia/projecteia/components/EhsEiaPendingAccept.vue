<template>

    <basic-modal   
    v-bind="$attrs" 
    @register="registerModal" 
    width="100%"
    :show-ok-btn="false"
    :show-cancel-btn="false"
    :defaultFullscreen="false" 
    title="查看详情" 
    :mask-closable= "false"
    wrap-class-name="full-modal">
    <div style="font-weight: bolder; font-size: medium;"> 环评项目名称:{{ eiaProjectName }}</div><br/>
    
        <a-steps :current="currentSteps" size="small">
          <a-step title="申请验收" :sub-title="pendingAcceptTime" />
          <a-step title="验收提资单"  :sub-title="firstTime">
            <template #description>
            <div style="text-align: center">
              <span><a class="a-hover-underline" style="color: #0091ff; cursor: pointer" @click="downloadFile('eiaAccept/'+acceptProjectAttachName)">
                      {{acceptProjectAttachName}}</a>
              </span> &nbsp;&nbsp;

            </div>
            </template>
          </a-step>
          <a-step title="验收报告(初稿)" :sub-title="secondTime" >
            <template #description>
            <div style="text-align: center">
              <span><a class="a-hover-underline" style="color: #0091ff; cursor: pointer" @click="downloadFile('eiaAccept/'+acceptFirstAttachName)">
                      {{acceptFirstAttachName}}</a>
              </span> &nbsp;&nbsp;
            </div>
            </template>
          </a-step>
          <a-step title="验收报告(终版)"  :sub-title="lastTime">
            <template #description>
            <div style="text-align: center">
              <span><a class="a-hover-underline" style="color: #0091ff; cursor: pointer" @click="downloadFile('eiaAccept/'+acceptSecondtAttachName)">
                      {{acceptSecondtAttachName}}</a>
              </span> &nbsp;&nbsp;
            </div>
            </template>
          </a-step>
        </a-steps>

        <div style="padding: 12px 10px 6px;  margin: 10px;">
        <a-button style="margin: 10px;" type="primary" @click="firstAudit"  v-show= "firstShow">提资单下发</a-button>
        <a-button style="margin: 10px;" type="primary" @click="secondAudit" v-show= "secondtShow">初稿审核</a-button>
        <a-button style="margin: 10px;"  type="primary" @click="lastAudit"  v-show= "lasttShow">验收报告终版</a-button>
        </div>

          <br/>
          <div v-if="auditMap.length >0 " style="overflow-x: scroll">

            <div :data-index="key" v-for="(value, key) in auditMap" :key="key">

                <div v-if="value.steps == '6'"> <br/>
                    <div style="font-weight: bolder; font-size: medium; color: rgba(59, 130, 246, 0.5)"> 验收报告初稿</div>

                    <div style="padding: 12px 10px 6px;  margin: 10px;">
                      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <a-button type="primary" @click="addAuditUser(value.list[0],'1')" >添加审核人</a-button>
                    </div>
                    
                      <a-table
                      width="100%"
                      wrap-class-name="full-modal"
                      ref="table"
                      size="small"
                      bordered
                      rowKey="id"
                      :columns="auditColumns"
                      :scroll="{ x: true, y: 360 }"
                      :dataSource="value.list"
                      :pagination="false" 
                      >
                      <template #tags="{ record }">
                      <a-button type="primary" v-if="record.auditComments == null  &&  userId == record.auditer"  ghost @click="editFirst(record)">编辑</a-button>
                    </template>
                    </a-table> 
               
              </div>
            </div>
          </div>

        <br/>
        <div v-if="listAddAuditData.length > 0" style="overflow-x: scroll">
          <div style="font-weight: bolder; font-size: medium; color: rgba(59, 130, 246, 0.5)"> 验收提资单</div> <br/>
          
          <div :data-index="index" v-for="(item, index) in listAddAuditData" :key="item.orgAndProjectName">
          
            <div   style="font-weight: bolder; font-size: small;"> 
              <!-- 申请单位 : {{ item.orgAndProjectName.split('|')[0] }}     申请的项目名称: {{ item.orgAndProjectName.split('|')[1] }} -->
              
              <span style="color: #0a0e14;width:240px">申请单位:</span> &nbsp;&nbsp;
              <span style="color: #0a0e14;width:240px">{{ item.orgAndProjectName.split('|')[0] }}</span> &nbsp;&nbsp;&nbsp;&nbsp;

              <span style="color: #0a0e14;width:240px">申请的项目名称:</span> &nbsp;&nbsp;
              <span @click="queryEiaInfo(item.infoId)" style="cursor:pointer;color: #329DFF;text-decoration: underline;display:inline-block;width:900px;word-wrap:break-word;white-space:normal;">{{ item.orgAndProjectName.split('|')[1] }}</span>
     
            
            </div>
            <div style="padding: 12px 10px 6px;  margin: 10px;">
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <a-button type="primary" @click="addAuditUser(item,'0')" >添加审核人</a-button>
            </div>  
            <a-table
            width="100%"
            wrap-class-name="full-modal"
            ref="table"
            size="small"
            bordered
            rowKey="id"
            :columns="addColumns"
            :scroll="{ x: true, y: 360 }"
            :dataSource="item.list"
            :pagination="false"
            > 
              <template #attachName="{ record }">
                    <div style="text-align: justify;word-break:break-all">
                      <a class="a-hover-underline" v-if="record.attach" v-for="(item,index) in record.attachName" :key="index" style="color: #0091ff; cursor: pointer" @click="downloadFile('eiaAccept/'+item)">
                        {{item}};&nbsp;&nbsp;
                      </a>
                    </div>
              </template>
            </a-table>
          </div>
        </div>

        <br/>
        <div v-if="listInfoData.length > 0" style="overflow-x: scroll">
            <div style="font-weight: bolder; font-size: medium; color: rgba(59, 130, 246, 0.5)"> 申请验收</div> <br/>
          
          <!-- <div :data-index="index" v-for="(item, index) in listInfoData" :key="item.id"> -->
  
            <a-table
            width="100%"
            wrap-class-name="full-modal"
            ref="table"
            size="small"
            bordered
            rowKey="id"
            :columns="columns"
            :scroll="{ x: true, y: 360 }"
            :dataSource="listInfoData"
            :pagination="false"
            >
            
              <template #skipProjectId="{ record }">
               <span @click="queryEiaInfo(record.id)" style="cursor:pointer;color: #329DFF;text-decoration: underline;display:inline-block;width:900px;word-wrap:break-word;white-space:normal;">{{record.projectName}}</span>
              </template>
            </a-table>
          <!-- </div> -->
        </div>
    </basic-modal>
   <!-- 表单区域 -->
   <EhsEiaInfoAudit @register="auditModal"  @getStepsTimes="getStepsTimes"></EhsEiaInfoAudit>
   <RoleUserModal @register="registerUserModal" @success="handleUser" />

</template>
<script lang="ts" name="ehs-eia-pending-accept" setup>

  import {  ref ,computed} from 'vue';
  import { BasicModal, useModalInner ,useModal} from '/@/components/Modal';
  import { listEiaInfoByCondition,listEiaAuditByCondition,addAuditList,addAuditUserOption,saveBatchByUserInfoOption} from '../EhsEiaProjectInfo.api';
  import { useListPage } from '/@/hooks/system/useListPage';
  import EhsEiaInfoAudit from './EhsEiaInfoAudit.vue';
  import RoleUserModal from '../../hooks/RoleUserModal.vue';
  import { render,downloadFile } from '/@/utils/common/renderUtils';
  import { useRouter } from 'vue-router';
  import {useUserStore} from '/@/store/modules/user';
  const userStore = useUserStore();
  const userInfo = computed(() => userStore.getUserInfo);
  let userId = "";
  if(userInfo.value.id){
    userId = userInfo.value.id;
  }
    const router = useRouter();
    const emit = defineEmits(['success','getAcceptStepsTimes']);

    const [auditModal, infoAuditModal] = useModal();
    const [registerUserModal,  userModal ] = useModal();
    const currentSteps = ref('2');
    const firstShow = ref(true);
    const secondtShow = ref(false);
    const lasttShow = ref(false);

    const pendingAcceptTime = ref('');
    const secondTime = ref('');
    const firstTime = ref('');
    const lastTime = ref('');
    const addAuditId = ref('');
    const auditType = ref('');

    const acceptProjectAttachName = ref('');
    const acceptFirstAttachName = ref('');
    const acceptSecondtAttachName = ref('');
    function addAuditUser(item,type){

      if(type == '0'){
        addAuditId.value ='';
        auditType.value = '';
        addAuditId.value = item.id;
      }
      if(type == '1'){
        addAuditId.value ='';
        auditType.value = '';
        auditType.value = item.type;
      }

      let record = {}
      userModal.openModal(true, record);

    }
    // 选择角色或人回调
    function handleUser(val:any){
    console.log(val)
    let auditIds = val.approvalContentOne;
    let auditorName = val.approvalContentTwo;
    let auditOrgCodes = val.approvalContentThree;
    
      if(null != addAuditId.value && '' != addAuditId.value){
        let params = {'auditorId':auditIds ,'auditorName':auditorName,'auditorOrgCode':auditOrgCodes,'addId':addAuditId.value,'source':3,'eiaProjectName':eiaProjectName.value};
        addAuditUserOption(params);
        close();
      }
      if(null != auditType.value && '' != auditType.value){
        let params = {'auditer':auditIds ,'auditerName':auditorName,'sysOrgCode':auditOrgCodes,'applyId':applyId.value,'type':auditType.value,'eiaProjectName':eiaProjectName.value};
        saveBatchByUserInfoOption(params);
        close();
      }
      

  }
    // 子组件传递父组件 节点时间展示
    const getStepsTimes = (params)=> { 
    let createTime = params.createTime;
    let type = params.type;
     if(type == '5'){
      firstTime.value = createTime;
    }else if(type == '6'){
      secondTime.value = createTime;
    }else if(type == '7'){
      lastTime.value = createTime;
    }
    console.log('in parent compoennt, e=', params);

    close();
    searchQuery();

  }

  
  function firstAudit(){
    let record = {
      'type' : '5',
      'applyId' : applyId.value
    }
   
    infoAuditModal.openModal(true, record);
  
  }

  
  function secondAudit(){
    let record = {
      'type' : '6',
      'applyId' : applyId.value
    }
    infoAuditModal.openModal(true, record);
  
  }

  function lastAudit(){
    let record = {
      'type' : '7',
      'applyId' : applyId.value
    }
    infoAuditModal.openModal(true, record);
  
  }

  const { tableContext} = useListPage({
      tableProps:{
            
        },
  });
  const [registerTable, {reload}] = tableContext;

  const eiaProjectName = ref('');
  const applyId = ref('');

  const [registerModal, { closeModal }] = useModalInner((data) => {
    eiaProjectName.value = data.eiaProjectName;
    applyId.value = data.applyId;
    searchQuery();
  
  });


  const close = async () => {
    try {

      //关闭弹窗
      closeModal();
      //刷新列表
      emit('success', 6);
    } catch (e) {}
  };


  interface DataType {
    id:string;
    eiaProjectName :string;
    projectName :string;
    orgName : string;
    pollutionDischargeDt:string;
    pollutionDischargeStatus:string;
}


  // const listInfoData: DataType[] = [];
  const listInfoData = ref([]);
  let listAddAuditData = [];
  let auditMap = [];
  

   async function searchQuery(){
    // 查询审核文件阶段
    
    getInfoList();
  
  }

  const columns = [
  {
    title: '申请项目名称',
    dataIndex: 'projectName',
    slots: { customRender: 'skipProjectId' },
  
  },
  {
    title: '申请单位',
    dataIndex: 'orgName',
  },
  {
    title: '申请验收',
    dataIndex: 'acceptanceCheckStatus',
    width : 200,
    customRender: ({text}) => {
      return render.renderDict(text, 'acceptance_check_status');
    },
  },
  {
    title: '申请时间',
    dataIndex: 'acceptanceCheckDt',
  },
];
  
  const auditColumns = [
    {
      title: '审核人',
      dataIndex: 'auditerName',
    
    },
    {
      title: '审核意见',
      dataIndex: 'auditComments',
    },
    {
      title: '审核时间',
      dataIndex: 'auditTime',
    },
    {
        title: '操作',
        dataIndex: 'tags',
        key: 'tags',
        slots: { customRender: 'tags' },
        width:100
  },
  ];

  const addColumns = [
    {
      title: '补充材料',
      dataIndex: 'attach',
      slots: { customRender: 'attachName' },
      width:500
    
    },
    {
      title: '审核人',
      dataIndex: 'auditorName',
      width:150
    },
    {
      title: '审核结果',
      dataIndex: 'auditStatement',
      width:150
    },
    {
      title: '审核时间',
      dataIndex: 'auditorTime',
      width:150
    },
  ];


   function getInfoList(){

      let params = {'applyId':applyId.value};
      
      listEiaInfoByCondition(params).then((res)=>{
      listInfoData.value = [];
      console.log(res);

      listInfoData.value.push(...res);

      if(listInfoData.value && listInfoData.value.length > 0){

        pendingAcceptTime.value = listInfoData.value[0].acceptanceCheckDt;
        
        }
        getAuditList();
        getAddList();
    })

    // 子组件时间传递
    let stepsTimes = {'acceptFirstTime':firstTime.value,'acceptSecondTime':secondTime.value,'acceptLastTime':lastTime.value};
  
    emit('getAcceptStepsTimes',stepsTimes);
  }

   function getAuditList(){

  let params = {'applyId':applyId.value,'steps':''};

  listEiaAuditByCondition(params).then((res)=>{
    console.log(res);
    auditMap = res;

    for (let value of auditMap) {

      if(value.steps == '7'){
        lastTime.value = value.list[0].createTime;
        if(value.list && value.list.length >0){
            for (let auditInfo of value.list) {
            
              if (auditInfo.reviewAttach != null && auditInfo.reviewAttach != undefined){ {
                    let reviewAttachName = auditInfo.reviewAttach.split(',').map(auditInfo=>{
                      return auditInfo.split('/').slice(-1)[0];
                    });

                    acceptSecondtAttachName.value = reviewAttachName[0];
                    // return;
              }
            }     
          } 
        }
      }
      if(value.steps == '6'){
        secondTime.value = value.list[0].createTime;

          if(value.list && value.list.length >0){
            for (let auditInfo of value.list) {
            
              if (auditInfo.reviewAttach != null && auditInfo.reviewAttach != undefined){ {
                    let reviewAttachName = auditInfo.reviewAttach.split(',').map(auditInfo=>{
                      return auditInfo.split('/').slice(-1)[0];
                    });

                    acceptFirstAttachName.value = reviewAttachName[0];
                    // return;
              }
            }     
          } 
        }
      }
      if(value.steps == '5'){  
        firstTime.value = value.list[0].createTime;

        if(value.list && value.list.length >0){
          for (let auditInfo of value.list) {
           
            if (auditInfo.reviewAttach != null && auditInfo.reviewAttach != undefined){ {
                  let reviewAttachName = auditInfo.reviewAttach.split(',').map(auditInfo=>{
                    return auditInfo.split('/').slice(-1)[0];
                  });

                  acceptProjectAttachName.value = reviewAttachName[0];
                  // return;
            }
          }     
         } 
      }
      }
    }

    for (let value of auditMap) {
      
      if(value.steps == '5'){
         firstShow.value = false;
         secondtShow.value = true;
         lasttShow.value = false;
         currentSteps.value = '3';
        return;
      }
      if(value.steps == '6'){
         firstShow.value = false;
         secondtShow.value = false;
         lasttShow.value = true;
         currentSteps.value = '4';
         return;
      }
      if(value.steps == '7'){
         firstShow.value = false;
         secondtShow.value = false;
         lasttShow.value = false;
         currentSteps.value = '4';
         return;
      }
    }
  })

}

 function getAddList(){

  let params = {'applyId':applyId.value,'type':'3'};

  addAuditList(params).then((res)=>{

    if(res && res.length >0){
          res.forEach(addAduit=>{
            if(addAduit.list && addAduit.list.length >0){  
              addAduit.list.forEach(e=>{
                if (e.attach == null || e.attach == undefined){
                  e.attachName = [];
                } else {
                  e.attachName = e.attach.split(',').map(e=>{
                    return e.split('/').slice(-1)[0];
                  });
                }
              });
            }
          });
      }
  listAddAuditData = res;
})

}



/**
 * 成功回调
 */
 function handleSuccess(e) {
  console.log(e);

  // reload();
    //刷新列表
    // emit('success');
}


const editFirst = (e) => {
    e.type = '9';
    console.log(e);
    infoAuditModal.openModal(true, e);
  };


function queryEiaInfo(infoId){
closeModal();
router.push({ path: '/eia/projectapply', query: {id:infoId} })
}

</script>

<style lang="less" scoped>
.full-modal {
  .ant-modal {
    max-width: 100%;
    top: 0;
    padding-bottom: 0;
    margin: 0;
  }
  .ant-modal-content {
    display: flex;
    flex-direction: column;
    height: calc(300vh);
  }
  .ant-modal-body {
    flex: 1;
  }
}
</style>
