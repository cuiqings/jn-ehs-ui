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

        <br/>
        <div v-if="listAddAuditData.length > 0" style="overflow-x: scroll">
            <div style="font-weight: bolder; font-size: medium; color: rgba(59, 130, 246, 0.5)"> 环评提资单</div> <br/>
          
          <div :data-index="index" v-for="(item, index) in listAddAuditData" :key="item.orgAndProjectName">
            <div style="font-weight: bolder; font-size: small;"> 
              <!-- 申请单位 : {{ item.orgAndProjectName.split('|')[0] }}     申请的项目名称: {{ item.orgAndProjectName.split('|')[1] }} -->
             
              <span style="color: #0a0e14;width:240px">申请单位:</span> &nbsp;&nbsp;
              <span style="color: #0a0e14;width:240px">{{ item.orgAndProjectName.split('|')[0] }}</span> &nbsp;&nbsp;&nbsp;&nbsp;


              <span style="color: #0a0e14;width:240px">申请的项目名称:</span> &nbsp;&nbsp;
              <span @click="queryEiaInfo(item.infoId)" style="cursor:pointer;color: #329DFF;text-decoration: underline;display:inline-block;width:900px;word-wrap:break-word;white-space:normal;">{{ item.orgAndProjectName.split('|')[1] }}</span>
     
            
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
            </a-table>
          </div>
        </div>
           
        <br/>
        <div v-if="auditMap.length >0 " style="overflow-x: scroll">

          <div :data-index="key" v-for="(value, key) in auditMap" :key="key">

              <div v-if="value.steps == '1'"> <br/>
                  <div style="font-weight: bolder; font-size: medium; color: rgba(59, 130, 246, 0.5)"> 环评报告初稿</div> <br/>
            
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
                    /> 
              </div>
              <div v-else-if="value.steps == '2'"> <br/>
              <div style="font-weight: bolder; font-size: medium; color: rgba(2, 95, 244, 0.5)"> 专家评审</div> <br/>

                <div  v-if="value.list.length > 0" style="font-weight: bolder; font-size: small;"> 
                  <div :data-index="index" v-for="(audit, index) in value.list" :key="audit.id">
                    <div  v-if="audit.commitTime != null"> 
                      <span>提交时间 : {{ audit.commitTime }}</span> &nbsp;&nbsp;&nbsp;&nbsp;
                      <span>提交资料: <a class="a-hover-underline" v-for="(item,index) in audit.expertAttachName" :key="index" style="color: #0091ff; cursor: pointer" @click="downloadFile('eiaProceed/'+item)">
                          {{item}};&nbsp;&nbsp;</a>
                        </span> &nbsp;&nbsp;&nbsp;&nbsp;

                      <span>提交人 : {{ audit.auditName }}</span> &nbsp;&nbsp;
                    </div>

                    <div  v-if="audit.auditEndDt != null"> 
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
           
              <div v-if="value.steps == '3'"> <br/>
                  <div style="font-weight: bolder; font-size: medium; color: rgba(59, 130, 246, 0.5)"> 环评报告报批版</div> <br/>
            
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
                    /> 
                </div>

                <div v-else-if="value.steps == '4'"> <br/>
                  <div style="font-weight: bolder; font-size: medium; color: rgba(59, 130, 246, 0.5)"> 环评报告终版</div> <br/>
                    <div  v-if="value.list.length > 0" style="font-weight: bolder; font-size: small;"> 
                      <div :data-index="index" v-for="(audit, index) in value.list" :key="audit.id">
                    
                        <div> 
                          <span>环评报告（终版）: <a class="a-hover-underline" v-for="(item,index) in audit.eiaAttachName" :key="index" style="color: #0091ff; cursor: pointer" @click="downloadFile('eiaProceed/'+item)">
                                {{item}};&nbsp;&nbsp;</a>
                          </span>
                        </div>

                        <div>                  
                          <span>环评其它资料: <a class="a-hover-underline" v-for="(item,index) in audit.eiaOtherAttachhName" :key="index" style="color: #0091ff; cursor: pointer" @click="downloadFile('eiaProceed/'+item)">
                                {{item}};&nbsp;&nbsp;</a>
                          </span>
                        </div>

                      </div>  
                    </div>
              </div>


            </div>
        </div>

        <br/>
        <div v-if="listAddExtraAuditData.length > 0" style="overflow-x: scroll">
                <div style="font-weight: bolder; font-size: medium; color: rgba(59, 130, 246, 0.5)"> 资料补充</div>
                  <a-table
                  width="100%"
                  wrap-class-name="full-modal"
                  ref="table"
                  size="small"
                  bordered
                  rowKey="id"
                  :columns="addColumns"
                  :scroll="{ x: 1300, y: 1000 }"
                  :dataSource="listAddExtraAuditData"
                  :pagination="false"
                  > 
                      <template #attachName="{ record }">
                        <div style="text-align: justify;word-break:break-all">
                          <a class="a-hover-underline" v-if="record.attach" v-for="(item,index) in record.attachName" :key="index" style="color: #0091ff; cursor: pointer" @click="downloadFile('eiaAdd/'+item)">
                            {{item}};&nbsp;&nbsp;
                          </a>
                        </div>
                      </template>
                      <template #auditstatementName="{ record }">
                        <div style="text-align: justify;word-break:break-all">
                          <span v-if="record.status == '3'" style="color: red;">
                          {{auditStatus(record.status) + ':' + record.auditStatement}}
                          </span>
                          <span v-else-if="record.status == '2'">
                          {{auditStatus(record.status)}}
                          </span>
                          <span v-else>
                          {{record.auditStatement}}
                          </span>
                        </div>
                      </template>
                </a-table>
          </div>

    </basic-modal>
     <!-- 表单区域 -->
     <EhsEiaInfoAudit @register="auditModal"  @getStepsTimes="getStepsTimes"></EhsEiaInfoAudit>

</template>
<script lang="ts" name="ehs-eia-complete-detail" setup>

  import {  reactive,ref,onMounted,getCurrentInstance,h} from 'vue';
  import { BasicModal, useModalInner ,useModal} from '/@/components/Modal';
  import {addAuditList ,listEiaInfoByCondition,addAuditList1} from '../EhsEiaProjectInfo.api';
  import { defHttp } from '/@/utils/http/axios';
  import { ApiSelect} from '/@/components/Form';
  import { DatePicker } from 'ant-design-vue';
  import { create } from 'domain';
  import EhsEiaInfoAudit from './EhsEiaInfoAudit.vue';
  import { useListPage } from '/@/hooks/system/useListPage'
  import { render,downloadFile } from '/@/utils/common/renderUtils';
  import { useRouter } from 'vue-router';

  const router = useRouter();
  const emit = defineEmits(['success']);
 

  const { tableContext} = useListPage({
      tableProps:{
            
        },
  });
  const [registerTable, {reload},{ rowSelection, selectedRowKeys }] = tableContext;
  const currentSteps = ref('1');

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



  const applyId = ref('');
  const steps = ref('');
  const [registerModal, { closeModal }] = useModalInner((data) => {
    eiaProjectName.value = data.eiaProjectName;
    eiaProjectNameTime.value = data.createTime;
    applyId.value = data.applyId;
    steps.value = data.steps;
    searchQuery();
  
  });


 

  const [auditModal] = useModal();

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


  // const listAddAuditData = ref([]);
  let listAddAuditData = [];
  let listAddExtraAuditData = [];

   async function searchQuery(){
 
  let params = {"applyId":applyId.value,"type":"4"};
    await addAuditList(params).then(res => {
      if(res && res.length >0){
        res.forEach(e=>{
          let list = e.list;
          if(null != list && list.length >0){

            list.forEach(ee=>{
              if (ee.attach == null || ee.attach == undefined){
                ee.attachName = [];
              } else {
                ee.attachName = ee.attach.split(',').map(ee=>{
                  return ee.split('/').slice(-1)[0];
                });
              }
            });
          }
          
        });
      }
    listAddAuditData = res;

    // 查询审核文件阶段
    getAuditList();

    getAddExtraList();

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
    width :600
  },
  {
    title: '审核时间',
    dataIndex: 'auditTime',
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
    width :600
  },
  {
    title: '审核时间',
    dataIndex: 'auditTime',
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

function getAddExtraList(){

let params = {'applyId':applyId.value,'type':'1'};

addAuditList1(params).then((res)=>{
  
  if(res.records && res.records.length >0){
      res.records.forEach(addAduit=>{
            if (addAduit.attach == null || addAduit.attach == undefined){
              addAduit.attachName = [];
            } else {
              addAduit.attachName = addAduit.attach.split(',').map(e=>{
                return e.split('/').slice(-1)[0];
              });
            }
      });
  }
      listAddExtraAuditData = [];
      let records = res.records;
      listAddExtraAuditData = records;
})
}

  async function getAuditList(){

    let url = '/eia/ehsEiaAudit/listByCondition';
    let params = {"applyId":applyId.value,'steps':steps.value};
    defHttp.post({url: url,params: params}).then(res => {
    console.log(res);
    auditMap = res;

    for (let value of auditMap) {
      if(value.steps == '4'){
        lastTime.value = value.list[0].createTime;

        if(value.list && value.list.length >0){

         let reviewAttach = value.list[0].reviewAttach;
         if(reviewAttach != null && reviewAttach != undefined){
          let attachName = reviewAttach.split(',').map(e=>{
                    return e.split('/').slice(-1)[0];
           });

           eiaProjectAttachName.value = attachName[0];      
         }

            for (let auditInfo of value.list) {
              if (auditInfo.reviewAttach == null || auditInfo.reviewAttach == undefined){
                auditInfo.eiaAttachName = [];
              } else {
                    auditInfo.eiaAttachName = auditInfo.reviewAttach.split(',').map(auditInfo=>{
                      return auditInfo.split('/').slice(-1)[0];
                    });
                    lastAttachName.value =  auditInfo.eiaAttachName[0];
              }
              if (auditInfo.otherAttach == null || auditInfo.otherAttach == undefined){
                auditInfo.eiaOtherAttachhName = [];
              } else {
                    auditInfo.eiaOtherAttachhName = auditInfo.otherAttach.split(',').map(auditInfo=>{
                      return auditInfo.split('/').slice(-1)[0];
                    });
              }
            }     
          }
      }
      if(value.steps == '3'){    
         thirdTime.value = value.list[0].createTime;

         let reviewAttach = value.list[0].reviewAttach;
         if(reviewAttach != null && reviewAttach != undefined){
          let attachName = reviewAttach.split(',').map(e=>{
                    return e.split('/').slice(-1)[0];
           });

           thirdAttachName.value = attachName[0];      
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
            }     
          }
      }
      if(value.steps == '1'){  
        firstTime.value = value.list[0].createTime;

        
        let reviewAttach = value.list[0].reviewAttach;
         if(reviewAttach != null && reviewAttach != undefined){
          let attachName = reviewAttach.split(',').map(e=>{
                    return e.split('/').slice(-1)[0];
           });

           firstAttachName.value = attachName[0];      
         }
      }
    }
    currentSteps.value = '5';
    });
  

   

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

  }

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
    width:150
  },
  {
    title: '审核结果',
    dataIndex: 'auditStatement',
    customRender: ({text}) => {
      if(text != undefined && text != null && text != '') {
        return text.indexOf('不通过') != -1 ?
          h('span', { style: 'color: red' },text)
          : text;
      }
    },
    width:150
  },

  {
    title: '审核时间',
    dataIndex: 'auditorTime',
    width:150
  },
];

const addColumns = [

    {
      title: '补充单位',
      dataIndex: 'orgName',
    },
    {
      title: '补充要求',
      dataIndex: 'addRequest',
    },
    {
      title: '截止日期',
      dataIndex: 'endDt',
    },
    {
      title: '补充材料',
      dataIndex: 'attach',
      slots: { customRender: 'attachName' },
      width:600
    },
    {
      title: '审核人',
      dataIndex: 'auditorName',
    },
    {
      title: '审核结果',
      dataIndex: 'auditStatement',
      slots: { customRender: 'auditstatementName' },
      // customRender: ({text}) => {
      // if(text != undefined && text != null && text != '') {
      //   return text.indexOf('不通过') != -1 ?
      //     h('span', { style: 'color: red' },text)
      //     : text;
      // }
      // },
      width:150
    },
    {
      title: '审核时间',
      dataIndex: 'auditorTime',
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

function auditStatus(text){
  console.log(render.renderDict(text, 'eia_add_status'))
  return render.renderDict(text, 'eia_add_status').children
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
