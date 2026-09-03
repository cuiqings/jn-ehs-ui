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
          <a-step title="环评提资单"  :sub-title="eiaProjectNameTime">
            <template #description>
            <div style="text-align: center">
              <span><a class="a-hover-underline" style="color: #0091ff; cursor: pointer" @click="downloadFile('eia/'+eiaProjectAttachName)">
                      {{eiaProjectAttachName}}</a>
              </span> &nbsp;&nbsp;

            </div>
            </template>
          </a-step>
          <a-step title="环评报告(初稿)"   :sub-title="firstTime">
            <template #description>
            <div style="text-align: center">
              <span><a class="a-hover-underline" style="color: #0091ff; cursor: pointer" @click="downloadFile('eiaProceed/'+firstAttachName)">
                      {{firstAttachName}}</a>
              </span> &nbsp;&nbsp;

            </div>
            </template>
          </a-step>
          <a-step title="专家评审" :description="secondTime" />
          <a-step title="环评报告(报批)"  :sub-title="thirdTime">
            <template #description>
            <div style="text-align: center">
              <span><a class="a-hover-underline" style="color: #0091ff; cursor: pointer" @click="downloadFile('eiaProceed/'+thirdAttachName)">
                      {{thirdAttachName}}</a>
              </span> &nbsp;&nbsp;

            </div>
            </template>
          </a-step>
          <a-step title="环评报告(终版)"  :sub-title="lastTime">
            <template #description>
            <div style="text-align: center">
              <span><a class="a-hover-underline" style="color: #0091ff; cursor: pointer" @click="downloadFile('eiaProceed/'+lastAttachName)">
                      {{lastAttachName}}</a>
              </span> &nbsp;&nbsp;

            </div>
            </template>
          </a-step>     
        </a-steps>

        <div style="padding: 12px 10px 6px;  margin: 10px;">
        <a-button style="margin: 10px;" type="primary" @click="firstAudit" v-show= "firstShow">初稿审核</a-button>
        <a-button style="margin: 10px;" type="primary" @click="secondAudit" v-show= "secondtShow">提交专家评审</a-button>
        <a-button style="margin: 10px;"  type="primary" @click="thridAudit"  v-show= "thirdtShow && thridButton">报批版审核</a-button>
        <a-button style="margin: 10px;" type="primary" @click="lastAudit" v-show= "lasttShow">环评报告终版</a-button>
        </div>
  
        <br/>
        <div v-if="auditMap.length >0 " style="overflow-x: scroll">
          <div :data-index="key" v-for="(value, key) in auditMap" :key="key">
          <div v-if="value.steps == '3'"> <br/>
          <div style="font-weight: bolder; font-size:medium; color: rgba(2, 95, 244, 0.5)"> 环评报告报批版</div> <br/>

          <div style="padding: 12px 10px 6px;  margin: 10px;">
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <a-button type="primary" @click="addAuditUser(value.list[0],'3')" >添加审核人</a-button>
            </div>

            <a-table
            width="100%"
            wrap-class-name="full-modal"
            ref="table"
            size="small"
            bordered
            rowKey="id"
            :columns="thirdColumns"
            :scroll="{ x: 1300, y: 1000 }"
            :dataSource="value.list"
            :pagination="false" 
            > 
              <template #tags="{ record }">
                <a-button v-if="record.auditComments == null && userId == record.auditer" type="primary" ghost @click="editFirst(record)">编辑</a-button>
              </template>
          </a-table>
          </div>

          <div v-else-if="value.steps == '2'"> <br/>
          <div style="font-weight: bolder; font-size: medium; color: rgba(2, 95, 244, 0.5)"> 专家评审</div> <br/>

            <div  v-if="value.list.length > 0" style="font-weight: bolder; font-size: small;"> 
              <div :data-index="index" v-for="(audit, index) in value.list" :key="audit.id">

                <div  v-if="audit.auditEndDt == null" style="padding: 12px 10px 6px;  margin: 10px;">
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <a-button type="primary" @click="expertReview(value.list[0])" >评审结束</a-button>
                </div>

                <div  v-if="audit.commitTime != null"> 
                  <!-- 提交时间 : {{ audit.commitTime }}     提交资料: {{ audit.reviewAttach }}   提交人: {{ audit.createBy }} -->
                  <span>提交时间 : {{ audit.commitTime }}</span> &nbsp;&nbsp;&nbsp;&nbsp;
                  <span>提交资料: <a class="a-hover-underline" v-for="(item,index) in audit.expertAttachName" :key="index" style="color: #0091ff; cursor: pointer" @click="downloadFile('eiaProceed/'+item)">
                      {{item}};&nbsp;&nbsp;</a>
                    </span> &nbsp;&nbsp;&nbsp;&nbsp;

                  <span>提交人 : {{ audit.auditName }}</span> &nbsp;&nbsp;
                </div>

                <div  v-if="audit.auditEndDt != null"> 
                  <!-- 专家会时间 : {{ audit.auditEndDt }}   {{ '&nbsp;&nbsp;&nbsp;' }}  会议资料: {{ audit.auditEndAttach }}   提交人: {{ audit.createBy }} -->
                  <span>专家会时间 : {{ audit.auditEndDt }}</span> &nbsp;&nbsp;&nbsp;&nbsp;
                  <span>会议资料: 
                    <a class="a-hover-underline" v-for="(item,index) in audit.expertEndAttachName" :key="index" style="color: #0091ff; cursor: pointer" @click="downloadFile('eiaProceed/'+item)">
                      {{item}};&nbsp;&nbsp;</a>
                    </span> &nbsp;&nbsp;&nbsp;&nbsp;

                  <span>提交人: {{ audit.auditEndName }}</span>
                </div>
              </div>  
            </div>
          </div>

          <div v-if="value.steps == '1'"> <br/>
          <div style="font-weight: bolder; font-size: medium; color: rgba(2, 95, 244, 0.5)"> 环评报告初稿</div> <br/>
    
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
            :columns="firstColumns"
            :scroll="{ x: 1300, y: 1000 }"
            :dataSource="value.list"
            :pagination="false" 
            >
        
              <template #tags="{ record }">
                <a-button v-if="record.auditComments == null  &&  userId == record.auditer" type="primary" ghost @click="editFirst(record)">编辑</a-button>
              </template>
             
          </a-table> 
            </div>
          </div>
        </div>


          <br/>
          <div v-if="listAddAuditData.length > 0" style="overflow-x: scroll">
            <div style="font-weight: bolder; font-size: medium; color: rgba(2, 95, 244, 0.5)"> 环评提资单</div>
          
            <div :data-index="index" v-for="(item, index) in listAddAuditData" :key="item.orgAndProjectName">
              <div   style="font-weight: bolder; font-size: small;"> 

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
                :columns="columns"
                :scroll="{ x: 1300, y: 1000 }"
                :dataSource="item.list"
                :pagination="false"
  
                > 
                <template #attachName="{ record }">
                  <div style="text-align: justify;word-break:break-all">
                    <a class="a-hover-underline" v-if="record.attach" v-for="(item,index) in record.attachName" :key="index" style="color: #0091ff; cursor: pointer" @click="downloadFile('eiaAdd/'+item)">
                      {{item}};&nbsp;&nbsp;
                    </a>
                  </div>
                </template>
                <template #tags="{ record }">
                  <div style="text-align: justify;word-break:break-all">
                    <a-button v-if="record.auditStatement == null" type="primary" ghost @click="auditCommentOperate(record)">审核意见</a-button>
                  </div>
                </template>
                
              </a-table>
          </div>
        </div>

    </basic-modal>
     <!-- 表单区域 -->
     <EhsEiaInfoAudit @register="auditModal"  @getStepsTimes="getStepsTimes"></EhsEiaInfoAudit>
     <RoleUserModal @register="registerUserModal" @success="handleUser" />

</template>
<script lang="ts" name="ehs-eia-project-info-detail" setup>

  import {  reactive,ref,onMounted,getCurrentInstance,h ,computed} from 'vue';
  import { BasicModal, useModalInner ,useModal} from '/@/components/Modal';
  import { addAuditList, listEiaAuditByCondition,addAuditUserOption,saveBatchByUserInfoOption,listEiaInfoByCondition} from '../EhsEiaProjectInfo.api';
  import { defHttp } from '/@/utils/http/axios';
  import { ApiSelect} from '/@/components/Form';
  import { DatePicker } from 'ant-design-vue';
  import { create } from 'domain';
  import EhsEiaInfoAudit from './EhsEiaInfoAudit.vue';
  import RoleUserModal from '../../hooks/RoleUserModal.vue';
  import { useListPage } from '/@/hooks/system/useListPage';
  import { render,downloadFile } from '/@/utils/common/renderUtils';
  import {useUserStore} from '/@/store/modules/user';
  import { useRouter } from 'vue-router';

  const userStore = useUserStore();
  const router = useRouter();
  const emit = defineEmits(['success','getStepsTimes']);
  const userInfo = computed(() => userStore.getUserInfo);
  let userId = "";
  if(userInfo.value.id){
    userId = userInfo.value.id;
  }

    // 选择角色或人回调
    async function handleUser(val:any){
    
    let auditIds = val.approvalContentOne;
    let auditorName = val.approvalContentTwo;
    let auditOrgCodes = val.approvalContentThree;
    
      if(null != addAuditId.value && '' != addAuditId.value){
        let params = {'auditorId':auditIds ,'auditorName':auditorName,'auditorOrgCode':auditOrgCodes,'addId':addAuditId.value,'source':1,'eiaProjectName':eiaProjectName.value};
        addAuditUserOption(params);
        searchQuery();
        close();
      }
      if(null != auditType.value && '' != auditType.value){
        let params = {'auditer':auditIds ,'auditerName':auditorName,'sysOrgCode':auditOrgCodes,'applyId':applyId.value,'type':auditType.value,'eiaProjectName':eiaProjectName.value};
        saveBatchByUserInfoOption(params);   
        searchQuery();
        close();
       
      }
  }


  const currentSteps = ref('1');
  const firstShow = ref(true);
  const secondtShow = ref(false);
  const thirdtShow = ref(false);
  const lasttShow = ref(false);

  const eiaProjectName = ref('');
  const eiaProjectNameTime = ref('');
  const secondTime = ref('');
  const firstTime = ref('');
  const thirdTime = ref('');
  const lastTime = ref('');


  const eiaProjectAttachName = ref('');
  const secondAttachName = ref('');
  const firstAttachName = ref('');
  const thirdAttachName = ref('');
  const lastAttachName = ref('');
  const thridButton = ref(false);

  const applyId = ref('');

  const addAuditId = ref('');
  const auditType = ref('');

  const [registerModal, { closeModal }] = useModalInner((data) => {

    eiaProjectName.value = data.eiaProjectName;
    eiaProjectNameTime.value = data.createTime;
    applyId.value = data.applyId;
    searchQuery();

  });


 
  const [registerUserModal,  userModal ] = useModal();
  const [auditModal, infoAuditModal] = useModal();

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
    attach: string;
    auditorNname: string;
    auditStatement: string;
    auditorTime :string;
    addOrg :string;
    eiaProjectName :string;
    projectName :string;
}

  // onMounted(() => {
  //   // 访问组件的 DOM 元素
  //   const  ctx  = getCurrentInstance();
  //   const element = ctx.$el;
  //   console.log(element);
  //   searchQuery();
  // });

  // const listAddAuditData: DataType[] = [];
  // const listAddAuditData = ref([]);

   let listAddAuditData = reactive([]);
   async function searchQuery(){

    let params = {"applyId":applyId.value,"type":"4"};
    await addAuditList(params).then(res => {
  
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
   

    // 查询审核文件阶段
    getAuditList();

    // 查询项目基础信息
    getProjectInfo();
  });
  }
  

// ##################### 环评资料审核开始 ###########################
  interface auditDataType {
    id:string;
    reviewAttach: string;
    auditorNname: string;
    auditer: string;
    type :string;
    auditComments :string;
    auditTime :string;
    commitTime :string;
    auditEndDt :string;
    auditEndAttach :string;
    otherAttach :string;
    applyId :string;
    createBy :string;
    createTime :string;
    updateBy :string;
    updateTime :string;
}
  const auditList: auditDataType[] = [];

  let auditMap = [];


  const firstColumns = [
  {
    title: '审核人',
    dataIndex: 'auditerName',
  
  },
  {
    title: '审核意见',
    dataIndex: 'auditComments',
    edit: true,
    editable: true,
    width :600
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
  },
];


const thirdColumns = [
{
    title: '审核人',
    dataIndex: 'auditerName',
  
  },
  {
    title: '审核意见',
    dataIndex: 'auditComments',
    edit: true,
    editable: true,
    width :600
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
  },
];

function getProjectInfo(){
  eiaProjectAttachName.value = '';
  let params = {"applyId":applyId.value};
  listEiaInfoByCondition(params).then(res => {
    if(res && res.length >0){
     
      for(let item of res){

        if (item.eiaAttachId != null && item.eiaAttachId != undefined){
       
                let attachName = item.eiaAttachId.split(',').map(e=>{
                  return e.split('/').slice(-1)[0];
              });
              eiaProjectAttachName.value = attachName[0];
              return;
      }
   
    }

   }
  });
}
  function getAuditList(){

    let params = {"applyId":applyId.value};
    listEiaAuditByCondition(params).then(res => {

    auditMap = res;

    for (let value of auditMap) {
      if(value.steps == '4'){
        lastTime.value = value.list[0].createTime;
        if(value.list && value.list.length >0){
          for (let auditInfo of value.list) {
           
            if (auditInfo.reviewAttach != null && auditInfo.reviewAttach != undefined){ {
                  let reviewAttachName = auditInfo.reviewAttach.split(',').map(auditInfo=>{
                    return auditInfo.split('/').slice(-1)[0];
                  });

                  lastAttachName.value = reviewAttachName[0];
                  return;
            }
          }     
         } 
      }
      }
      if(value.steps == '3'){    
         thirdTime.value = value.list[0].createTime;

         if(value.list && value.list.length >0){
          for (let auditInfo of value.list) {
           
            if (auditInfo.reviewAttach != null && auditInfo.reviewAttach != undefined){ {
                  let reviewAttachName = auditInfo.reviewAttach.split(',').map(auditInfo=>{
                    return auditInfo.split('/').slice(-1)[0];
                  });

                  thirdAttachName.value = reviewAttachName[0];
            }
          }     
         } 
      }

      }
      if(value.steps == '2'){ 
         secondTime.value = value.list[0].createTime;   
         // 专家审核上传文件
         if(value.list && value.list.length >0){
          for (let auditInfo of value.list) {
            if (auditInfo.auditEndAttach == null || auditInfo.auditEndAttach == undefined){
              auditInfo.expertEndAttachName = [];
            } else {
                  auditInfo.expertEndAttachName = auditInfo.auditEndAttach.split(',').map(auditInfo=>{
                    return auditInfo.split('/').slice(-1)[0];
                  });
            }
            if (auditInfo.reviewAttach == null || auditInfo.reviewAttach == undefined){
              auditInfo.expertAttachName = [];
            } else {
                  auditInfo.expertAttachName = auditInfo.reviewAttach.split(',').map(auditInfo=>{
                    return auditInfo.split('/').slice(-1)[0];
                  });
            }

              // 专家评审结束 未上传会议资料时控制环评报告报批版文件按钮显示
              if(auditInfo.auditEndDt != null){
                thridButton.value = true;
              }
          }  
         }     
      }
      if(value.steps == '1'){  
        firstTime.value = value.list[0].createTime;

        if(value.list && value.list.length >0){
          for (let auditInfo of value.list) {
           
            if (auditInfo.reviewAttach != null && auditInfo.reviewAttach != undefined){ {
                  let reviewAttachName = auditInfo.reviewAttach.split(',').map(auditInfo=>{
                    return auditInfo.split('/').slice(-1)[0];
                  });

                  firstAttachName.value = reviewAttachName[0];
            }
          }     
         } 
      }

    }
  }
    for (let value of auditMap) {
      
      if(value.steps == '4'){
         firstShow.value = false;
         secondtShow.value = false;
         thirdtShow.value = false;
         lasttShow.value = false;
         currentSteps.value = '5';
        return;
      }
      if(value.steps == '3'){
         firstShow.value = false;
         secondtShow.value = false;
         thirdtShow.value = false;
         lasttShow.value = true;
         currentSteps.value = '4';
         return;
      }
      if(value.steps == '2'){
         firstShow.value = false;
         secondtShow.value = false;
         thirdtShow.value = true;
         lasttShow.value = false;
         currentSteps.value = '3';
         return;
      }

      if(value.steps == '1'){
         firstShow.value = false;
         secondtShow.value = true;
         thirdtShow.value = false;
         lasttShow.value = false; 
        currentSteps.value = '2';
         return;
      }
    }

  });
  

    // 子组件传递父组件值
    let stepsTimes = {'firstTime':firstTime.value,'secondTime':secondTime.value,'thirdTime':thirdTime.value,'lastTime':lastTime.value};
    emit('getStepsTimes',stepsTimes);
   

    }


    function expertReview(item){
      
    item.type = '10';
    infoAuditModal.openModal(true, item);

    }

  function addAuditUser(item,type){

    if(type == '0'){
      addAuditId.value ='';
      auditType.value = '';
      addAuditId.value = item.addId;
    }
    if(type == '1'){
      addAuditId.value ='';
      auditType.value = '';
      auditType.value = item.type;
    }
    if(type == '3'){
      addAuditId.value ='';
      auditType.value = '';
      auditType.value = item.type;
    }
    let record = {}
    userModal.openModal(true, record);
  
  }

  function firstAudit(){
    let record = {
      'type' : '1',
      'applyId' : applyId.value
    }
   
    infoAuditModal.openModal(true, record);
  
  }

  
  function secondAudit(){
    let record = {
      'type' : '2',
      'applyId' : applyId.value
    }
    infoAuditModal.openModal(true, record);
  
  }

  
  function thridAudit(){
    let record = {
      'type' : '3',
      'applyId' : applyId.value
    }

    infoAuditModal.openModal(true, record);
  
  }
  
  function lastAudit(){
    let record = {
      'type' : '4',
      'applyId' : applyId.value
    }
    infoAuditModal.openModal(true, record);
  
  }

  // 子组件传递父组件 节点时间展示
  const getStepsTimes = (params)=> { 
    let createTime = params.createTime;
    let type = params.type;
    if(type == '1'){
      firstTime.value = createTime;
    }else if(type == '2'){
      secondTime.value = createTime;
    }else if(type == '3'){
      thirdTime.value = createTime;
    }else if(type == '4'){
      lastTime.value = createTime;
    }
    console.log('in parent compoennt, e=', params);

    close();
    searchQuery();
  }


  const editFirst = (e) => {
    e.type = '9';
    infoAuditModal.openModal(true, e);
  };

  const auditCommentOperate = (e) => {
    e.type = '11';
    infoAuditModal.openModal(true, e);
  };
 // ##################### 环评资料审核结束 ###########################
 
 
const columns = [
  {
    title: '补充材料',
    dataIndex: 'attach',
    width :500,
    slots: { customRender: 'attachName' },
  
  },
  {
    title: '补充说明',
    dataIndex: 'addExplain',
    width :400
  
  },
  {
    title: '审核人',
    dataIndex: 'auditorName',
    width :150
  },
  {
    title: '审核结果',
    dataIndex: 'auditStatement',
    width :150,
    customRender: ({text}) => {
      if(text != undefined && text != null && text != '') {
        return text.indexOf('不通过') != -1 ?
          h('span', { style: 'color: red' },text)
          : text;
      }
    },

  },
  {
    title: '审核时间',
    dataIndex: 'auditorTime',
    width :100
  },
  {
        title: '操作',
        dataIndex: 'tags',
        key: 'tags',
        width:100,
        slots: { customRender: 'tags' },
  },
];


/**
 * 成功回调
 */
 function handleSuccess(e) {
  console.log(e);

  // reload();
    //刷新列表
    // emit('success');
}


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
