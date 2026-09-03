<template>
  <div>
    <!--引用表格-->
    <BasicTable @register="registerTable">
      <!--插槽:table标题-->
      <template #tableTitle>
        <!-- <a-button type="primary" @click="handleAdd" preIcon="ant-design:plus-outlined"> 发通知
        </a-button> -->
        <a-dropdown v-if="selectedRowKeys.length > 0">
          <template #overlay>
            <a-menu>
              <a-menu-item key="1" @click="batchHandleDelete">
                <Icon icon="ant-design:delete-outlined"></Icon>
                删除
              </a-menu-item>
            </a-menu>
          </template>
          <a-button>批量操作
            <Icon icon="mdi:chevron-down"></Icon>
          </a-button>
        </a-dropdown>
      </template>
      <!--操作栏-->
      <template #action="{ record }">
        <TableAction :actions="getTableAction(record)"/>
      </template>
      <template #clickNoticeNo="{ record }">
        <TableAction :actions="getViewModel(record)"/>
      </template>
      
      <!--字段回显插槽-->
      <template #htmlSlot="{text}">
        <div v-html="text"></div>
      </template>
      <template #fileSlot="{text}">
        <span v-if="!text" style="font-size: 12px;font-style: italic;">无文件</span>
        <a-button v-else :ghost="true" type="primary" preIcon="ant-design:download-outlined"
                  size="small" @click="downloadFile(text)">下载
        </a-button>
      </template>
    </BasicTable>
    <!-- 表单区域 -->
    <EhsNoticeInfoModal @register="registerModal" @success="reload" :showFooter="showFooter"></EhsNoticeInfoModal>
    <EhsNoticeInfoDetail @register="registerDesc" @success="reload" :showFooter="showFooter"></EhsNoticeInfoDetail>
    <EhsNoticeInfoPreview @register="registerPreview" @success="reload" :showFooter="showFooter"  @refresh="refresh"></EhsNoticeInfoPreview>
    
    <a-modal v-model:visible="visibleNotice" title="通知书查看" width="800px" :footer="null" @cancel="previewCancel">
      <div style="float: right;margin-right: 10px">
        <a-button type="primary" @click="exportDataPdf()" preIcon="ant-design:plus-outlined">下载</a-button>
      </div>
      <div id="downLoadPdf">
        <a-row style="text-align: center;margin-right: 90px">
          <a-col :span="4">
            <img src="/resource/img/logo.png" style="width: 50px; height: 50px;" alt="">
          </a-col>
          <a-col :span="20">
            <div class="STYLE1">中信重工公司</div>
            <div class="STYLE2">{{ehsNoticeInfoForm.ehsNoticeInfo.title}}{{typeName}}</div>
          </a-col>
        </a-row>
        <a-row style="float: right;margin-right: 25px">
          <a-col :span="24">
            <div class="STYLE3"> 编号: {{ ehsNoticeInfoForm.ehsNoticeInfo.noticeNo }}</div>
          </a-col>
        </a-row>

        <table width="762" cellpadding="0" cellspacing="0" bordercolor="#000000" style="margin:auto; margin-top: 25px; border-collapse:collapse;table-layout: fixed;border:2px solid #000;">
          <tbody>
          <tr style="height:50px; border: 1px solid #000;" >
            <td colspan="13" class="STYLE3" style="font-weight:normal;text-align: left;">
              {{ehsNoticeInfoForm.ehsNoticeInfo.receiveOrgName}}:
            </td>
          </tr>
          <tr>
            <td v-if="type1||type4" colspan="13" class="STYLE3" style="font-weight:normal;text-align: left;">
              <div class="STYLE3" style="margin-left: 100px">
                {{typeNameTip}}
              </div>
              <div
                v-for="(item, index) in ehsNoticeInfoForm.ehsNoticeInfo.enpInfo"
                :key="item.id"
                style="margin-bottom: 8px;margin-left: 10px"
                align="baseline">
                <a-row>
                  <a-form-item :name="['enpInfo', index, 'problemContent']">
                    <span>{{index+1}}.{{item.problemContent}}</span>
                  </a-form-item>
                </a-row>
                <a-row>
                  <a-upload
                    list-type="picture-card"
                    :headers="headers"
                    v-model:file-list="item.reviewImgList"
                    :max-count="10"
                    @preview="imgPreview"
                    disabled
                  >
                  </a-upload>
                  <a-modal :visible="previewVisible" :footer="null" @cancel="imgCancel(item)">
                    <img alt="example" style="width: 100%" :src="previewImage" />
                  </a-modal>
                </a-row>
              </div>
            </td>
            <td v-if="type2||type3||type5" colspan="6" class="STYLE3" style="font-weight:normal;text-align: left;">
              <div class="STYLE3" style="margin-left: 100px">
                {{typeNameTip}}
              </div>
              <div style="margin-bottom: 8px;margin-left: 10px" align="baseline">
                <a-form-item label="" :style="'width:738px;margin-left: 10px;height:'+ noticeContentHeight+'px'">
                  {{ehsNoticeInfoForm.ehsNoticeInfo.noticeContent}}
                </a-form-item>
              </div>
            </td>
          </tr>
          <tr v-if="type1||type2||type3||type4" style="border: 1px solid #000;">
            <td colspan="2" class="STYLE3" style="text-align: center;border:1px solid #000;">整改要求</td>
            <td colspan="12" class="STYLE3" style="font-weight:normal;text-align: left;">
              <a-row>
                {{demandName}}
              </a-row>
              <a-row>
                {{ ehsNoticeInfoForm.ehsNoticeInfo.content }}
              </a-row>
            </td>
          </tr>
          <tr v-if="type1||type2||type3||type4" style="height:50px;  border: 1px solid #000;">
            <td colspan="2" class="STYLE3" style="text-align: center; border:1px solid #000;">{{ typeDtName }}</td>
            <td colspan="12" class="STYLE3" style="font-weight:normal;text-align: left;">{{ ehsNoticeInfoForm.ehsNoticeInfo.endDt }}</td>
          </tr>
          <tr v-if="type3" style="height:50px;  border: 1px solid #000;">
            <td colspan="2" class="STYLE3" style="text-align: center; border:1px solid #000;">管控时间</td>
            <td colspan="12" class="STYLE3" style="font-weight:normal;text-align: left;">{{ controlDt }}</td>
          </tr>
          <tr v-if="type1||type2||type3||type4" style="height:160px;  border: 1px solid #000;">
            <td colspan="7" class="STYLE3" style="text-align: left; border:1px solid #000;">
              <div style="margin-top: 5px;margin-left: 5px ">
                签发人签字：
              </div>
              <div style="width: 30px;height: 30px;margin-left: 15px">
                <a-upload
                  list-type="picture-card"
                  :headers="headers"
                  v-model:file-list="signatureImg"
                  :max-count="1"
                  @preview="imgPreview"
                  disabled
                >
                </a-upload>
                <a-modal :visible="previewVisible" :footer="null" @cancel="imgCancel(item)">
                    <img alt="example" style="width: 100%" :src="previewImage" />
                </a-modal>
              </div>
              <div style="float: right;margin-top: 70px;margin-right: 10px">
                {{ ehsNoticeInfoForm.ehsNoticeInfo.initiatorTime!="" &&
                ehsNoticeInfoForm.ehsNoticeInfo.initiatorTime!= null &&
                ehsNoticeInfoForm.ehsNoticeInfo.initiatorTime!= undefined &&
                ehsNoticeInfoForm.ehsNoticeInfo.initiatorTime!=" "
                ?dayjs(ehsNoticeInfoForm.ehsNoticeInfo.initiatorTime).format('YYYY年MM月DD日'):"年  月  日" }}
              </div>
            </td>
            <td colspan="7" class="STYLE3" style="text-align: left; border:1px solid #000;">
              <div style="margin-top: 5px;margin-left: 5px ">
                接收单位签字：
              </div>
              <div style="width: 30px;height: 30px;margin-left: 15px">
                <a-upload
                  list-type="picture-card"
                  :headers="headers"
                  v-model:file-list="recipientSignImg"
                  :max-count="1"
                  @preview="imgPreview"
                  disabled
                >
                </a-upload>
                <a-modal :visible="previewVisible" :footer="null" @cancel="imgCancel(item)">
                    <img alt="example" style="width: 100%" :src="previewImage" />
                </a-modal>
              </div>
              <div style="float: right;margin-top: 70px;margin-right: 10px">
                {{
                  ehsNoticeInfoForm.ehsNoticeInfo.receiveTime!= null &&
                  ehsNoticeInfoForm.ehsNoticeInfo.receiveTime!= undefined &&
                  ehsNoticeInfoForm.ehsNoticeInfo.receiveTime!=" " &&
                  ehsNoticeInfoForm.ehsNoticeInfo.receiveTime!="" ?dayjs(ehsNoticeInfoForm.ehsNoticeInfo.receiveTime).format('YYYY年MM月DD日'):"年  月  日" }}
              </div>
            </td>
          </tr>
          <tr v-if="type1||type2||type3||type4" style="height:100px;  border: 1px solid #000;">
            <td colspan="2" class="STYLE3" style="text-align: center;border:1px solid #000;">整改反馈</td>
            <td colspan="12" class="STYLE3">
              <div v-for="(item,index) in noticeModel.correctionList" :key="item.id">
                <div>
                  第{{index+1}}次整改反馈：
                </div>
                <div>
                  &nbsp;
                  {{ item.correctionFeedback }}
                </div>
                <div :style="{'position': 'relative','min-height': index+1 == noticeModel.correctionList.length? '180px': '0'}">
                  <div style="display: inline-block;width:340px;">
                    <a-upload
                      list-type="picture-card"
                      :headers="headers"
                      v-model:file-list="item.img"
                      :max-count="10"
                      @preview="handlePreview"
                      disabled
                    >
                    </a-upload>
                    <a-modal :visible="previewVisible" :footer="null" @cancel="imgCancel(item)">
                      <img alt="example" style="width: 100%" :src="previewImage" />
                    </a-modal>
                  </div>
                </div>
              </div>
              <div style="width:240px;margin-bottom: 10px;margin-right: 20px">
                <div style="float: right;margin-right: -295px;">
                  签字：
                  <a-upload
                    list-type="picture-card"
                    :headers="headers"
                    v-model:file-list="correctorSignImg"
                    :max-count="1"
                    @preview="imgPreview"
                    disabled
                  >
                  </a-upload>
                  <a-modal :visible="previewVisible" :footer="null" @cancel="imgCancel(item)">
                    <img alt="example" style="width: 100%" :src="previewImage" />
                  </a-modal>
                </div>
                <div style="float: right;margin-right: -291px;margin-top: 137px;margin-bottom: 10px;">
                  {{ ehsNoticeInfoForm.ehsNoticeInfo.correctorTime!=""?dayjs(ehsNoticeInfoForm.ehsNoticeInfo.correctorTime).format('YYYY年MM月DD日'):"年  月  日" }}
                </div>
              </div>
            </td>
          </tr>
          <tr v-if="type1||type2||type3||type4" style="height:100px;  border: 1px solid #000;">
            <td colspan="2" class="STYLE3" style="text-align: center; border:1px solid #000;">复查结果</td>
            <td colspan="12" class="STYLE3">
              <div v-for="(item,index) in noticeModel.correctionList" :key="item.id">
                <div v-if="item.status != '0'">
                <div>
                  第{{index+1}}次复查结果：
                </div>
                <div>
                  &nbsp;
                  {{ item.reviewOpinion }}
                </div>
                <div :style="{'position': 'relative','min-height': index+1 == noticeModel.correctionList.length? '180px': '0'}">
                  <div style="display: inline-block;width:340px;">
                    <a-upload
                      list-type="picture-card"
                      :headers="headers"
                      v-model:file-list="item.reviewImg"
                      :max-count="10"
                      @preview="handlePreview"
                      disabled
                    >
                    </a-upload>
                    <a-modal :visible="previewVisible" :footer="null" @cancel="imgCancel(item)">
                      <img alt="example" style="width: 100%" :src="previewImage" />
                    </a-modal>
                  </div>
                </div>
              </div>
              <div style="width:240px;margin-bottom: 10px;margin-right: 20px">
                <div style="float: right;margin-right: -295px;">
                  签字：
                  <a-upload
                    list-type="picture-card"
                    :headers="headers"
                    v-model:file-list="reviewSignImg"
                    :max-count="1"
                    @preview="handlePreview"
                    disabled
                  >
                  </a-upload>
                  <a-modal :visible="previewVisible" :footer="null" @cancel="imgCancel(item)">
                      <img alt="example" style="width: 100%" :src="previewImage" />
                    </a-modal>
                </div>
                <div style="float: right;margin-right: -291px;margin-top: 137px;margin-bottom: 10px;">
                  {{ ehsNoticeInfoForm.ehsNoticeInfo.reviewTime!=""?dayjs(ehsNoticeInfoForm.ehsNoticeInfo.correctorTime).format('YYYY年MM月DD日'):"年  月  日" }}
                </div>
              </div>
              </div>
            </td>
          </tr>
          </tbody>
        </table>
      </div>
    </a-modal>
  
  </div>
</template>


<script lang="ts" name="notice-ehsNoticeInfo" setup>
import {ref, computed, reactive} from 'vue';
import {BasicTable, useTable, TableAction} from '/@/components/Table';
import {useDrawer} from '/src/views/notice/components/Drawer';
import {useModal} from '/@/components/Modal';
import {useListPage} from '/@/hooks/system/useListPage'
import EhsNoticeInfoModal from './components/EhsNoticeInfoModal.vue'
import EhsNoticeInfoDetail from './components/EhsNoticeInfoDetail.vue'
import EhsNoticeInfoPreview from './components/EhsNoticeInfoPreview.vue'
import {columns, searchFormSchema} from './EhsNoticeInfo.data';
import {list, deleteOne, batchDelete, getImportUrl, getExportUrl} from './EhsNoticeInfo.api';
import {downloadFile} from '/@/utils/common/renderUtils';
import {useUserStore} from '/@/store/modules/user';
import {usePermission} from "/@/hooks/web/usePermission";
import {picPreviewUrl, previewFile} from "/@/api/common/api";
import {SelectProps, UploadProps} from "ant-design-vue";
import dayjs, {Dayjs} from "dayjs";
import {defHttp} from "/@/utils/http/axios";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import {getToken} from "/@/utils/auth";

const visibleNotice = ref<boolean>(false);
const type1 = ref(true);
const type2 = ref(false);
const type3 = ref(false);
const type4 = ref(false);
const type5 = ref(false);
const noticeContentHeight = ref(400);
const typeName = ref("");
const demandName = ref("");
const typeNameTip = ref("");
const typeDtName = ref('整改期限');
const controlDt = ref("");
let fileList = ref<UploadProps['fileList']>([]);
let signatureImg = ref<UploadProps['fileList']>([]);
let recipientSignImg = ref<UploadProps['fileList']>([]);
let correctorSignImg = ref<UploadProps['fileList']>([]);
let reviewSignImg = ref<UploadProps['fileList']>([]);
const noticeInfoType = ref<SelectProps['options']>([]);
const buttonAddHeight = ref(0);
const noticeModel = reactive({ });


const { hasPermission } = usePermission();
const userStore = useUserStore();
const userInfo = computed(() => userStore.getUserInfo);
const loginInfo = computed(() => userStore.getLoginInfo);
let searchInfo = {};
const showFooter = ref(true);

//传参接口对象
interface EhsNoticeProblem {
  id: string;
  problemContent: string;
  img: string;
  reviewImgList: any;
}
interface EhsNoticeInfo {
  id:string;
  orgId:string;
  orgCode:string;
  orgName:string;
  entryMethod: string;
  title: string;
  type: string;
  noticeNo: string;
  receiveOrgName: string;
  receiveOrgId: any;
  receiveUserId: any;
  receiveUserName: string;
  noticeContent: string;
  content: string;
  attachment: string;
  endDt: string;
  auditorId: any;
  auditorName: any;
  signature: string;
  status: string;
  initiatorTime: string;
  enpInfo: EhsNoticeProblem[];
  receiveTime: string;
  correctorTime: string;
  reviewTime: string;
  distributeTime: string;
}

const ehsNoticeInfoForm = reactive<{ ehsNoticeInfo: EhsNoticeInfo}>({
  ehsNoticeInfo: {
    id:'',
    orgId:'',
    orgCode:'',
    orgName:'',
    entryMethod: '1',
    title: '',
    type: '',
    noticeNo: '',
    receiveOrgName: '',
    receiveOrgId: null,
    receiveUserId: null,
    receiveUserName: '',
    content:'',
    noticeContent: '',
    attachment:'',
    endDt: '',
    auditorId: null,
    auditorName: null,
    signature: '',
    status: '',
    initiatorTime: '',
    enpInfo: [] as any,
    receiveTime: '',
    correctorTime: '',
    reviewTime: '',
    distributeTime: '',
  },
});

const headers = { 'X-Access-Token': getToken() };
const previewVisible = ref(false);
const previewImage = ref('');
const previewTitle = ref('');
const dateFormat = 'YYYY-MM-DD';
const endDt = ref<Dayjs>();

//注册model

const [registerModal, { openDrawer }] = useDrawer();
const [registerDesc, { openDrawer: openDesc }] = useDrawer();
const [registerPreview, { openDrawer: openPreview }] = useDrawer();

// Emits声明
const emit = defineEmits(['register', 'success','refresh']);

//注册table数据
const {prefixCls, tableContext, onExportXls, onImportXls} = useListPage({
  tableProps: {
    title: 'ehs_notice_info',
    api: list,
    columns,
    canResize: false,
    showIndexColumn: true,
    handleSearchInfoFn(info) {
      console.log('handleSearchInfoFn', info);
      searchInfo = Object.assign({}, info);
      if (info.createTime1) {
        console.log('createTime1', info.createTime, info.createTime1.split(','));
        let time = info.createTime1.split(',');
        searchInfo['startTime'] = time[0];
        searchInfo['endTime'] = time[1];
        delete searchInfo['createTime1'];
      }

      console.log('handleSearchInfoFn param', searchInfo);
      return searchInfo;
    },
    formConfig: {
      //labelWidth: 120,
      schemas: searchFormSchema,
      autoSubmitOnEnter: true,
      showAdvancedButton: true,
      fieldMapToNumber: [],
      fieldMapToTime: [],
    },
    actionColumn: {
      width: 120,
      fixed: 'right'
    },
  },
  exportConfig: {
    name: "ehs_notice_info",
    url: getExportUrl,
  },
  importConfig: {
    url: getImportUrl,
    success: handleSuccess
  },
});

const [registerTable, {reload}, {rowSelection, selectedRowKeys}] = tableContext;

/**
 * 新增事件
 */
function handleAdd() {
  showFooter.value = true;
  openDrawer(true, {
    isUpdate: false,
    showFooter: showFooter.value
  });
}

/**
 * 编辑事件
 */
function handleEdit(record: Recordable) {
  showFooter.value = true;
  openDrawer(true, {
    record,
    isUpdate: true,
    showFooter: showFooter.value
  });
}

/**
 * 确认签字
 */
 function handleSign(record: Recordable) {
  showFooter.value = true;
  openPreview(true, {
    record,
    isUpdate: true,
    showFooter: showFooter.value
  });
}

/**
 * 详情
 */
function handleDetail(record: Recordable) {
  showFooter.value = false;
  // openDesc(true, {
  //   record,
  //   showFooter: showFooter.value
  // });
  openPreview(true, {
    record,
    showFooter: showFooter.value
  });
}

/**
 * 删除事件
 */
async function handleDelete(record) {
  await deleteOne({id: record.id}, handleSuccess);
}

/**
 * 批量删除事件
 */
async function batchHandleDelete() {
  await batchDelete({ids: selectedRowKeys.value}, handleSuccess);
}

/**
 * 成功回调
 */
function handleSuccess() {
  (selectedRowKeys.value = []) && reload();
}

/**
 * 操作栏
 */
function getTableAction(record) {

  let status = record.status;
  let type = record.type;
  let userId = "";
  if(userInfo.value.id){
    userId = userInfo.value.id;
  }
 let receiveUserId = record.receiveUserId;

   // 获取当前记录的 接收单位 接收人信息
   let buttonFlag = false;
    if(receiveUserId != null  && receiveUserId.trim() != ''){
      if(userId == receiveUserId ){
        buttonFlag = true;
      }
    }else{
      let orgCode =  userInfo.value.orgCode;
      const isSecuritySector = loginInfo.value.departs[0]?.isSecuritySector;
      if(isSecuritySector == '1'){
        buttonFlag = true;
      }else{
        let receiveOrgCode  = record.receiveOrgCode;
        if(orgCode == receiveOrgCode){
          buttonFlag = true;
        }
      }
      
    }

 let operate = [];

  if((status != "3" && type != "4" &&  type != "5") && buttonFlag){

    if(hasPermission('safeNotice:sign') || hasPermission('eiaNotice:sign')){

      let sign =  {
        label: '签收',
        onClick: handleSign.bind(null, record),
      };
      operate.push(sign);
      }
    }
  

  let view = {
      label: '查看',
      onClick: handleDetail.bind(null, record),
    };

    operate.push(view);
    return operate;
}

/**
 * 下拉操作栏
 */
function getDropDownAction(record) {
  return [
    {
      label: '查看',
      onClick: handleDetail.bind(null, record),
    }, 
    // {
    //   label: '删除',
    //   popConfirm: {
    //     title: '是否确认删除',
    //     confirm: handleDelete.bind(null, record),
    //   }
    // }
  ]
}


 // 子组件传递父组件 刷新页面
 const refresh = (params)=> { 
   
   // 刷新列表
   emit('success');
   
};


function getViewModel(record: Recordable) {

if(record.entryMethod==1){
  return [
    {
      label: record.noticeNo,
      onClick: showViewModal.bind(null, record),
    },
  ]
}else{
  return [
    {
      label: record.noticeNo,
      onClick: getAttachment.bind(null, record),
    },
  ]
}
}

async function getAttachment(record: Recordable) {
previewFile(record.attachment).then((res) => {
  window.open(res, '_blank');
});
}

function showViewModal(record: Recordable) {
  if (record.orgCode == ''||record.orgCode == null) {
    record.isOther = '1';
  }else{
    record.isOther = '0';
  }

  

  Object.keys(ehsNoticeInfoForm.ehsNoticeInfo).forEach((item) => {
    ehsNoticeInfoForm.ehsNoticeInfo[item] = record[item] ? record[item] : "";
  });
  ehsNoticeInfoForm.ehsNoticeInfo.enpInfo = [];
  const imgList = record.enpInfo;
  if(imgList.length>0){
    buttonAddHeight.value = -175;
  }else{
    buttonAddHeight.value = 0;
  }
  for(let i=0;i<imgList.length;i++){
    let reviewImgList = [] as any;
    var imgArry = imgList[i].img.split(",");
    for(let j=0;j<imgArry.length;j++){
      if(imgArry[j].indexOf("http")==0){
        reviewImgList.push(
          {
            uid: Math.random(),
            name: 'image.png',
            status: 'done',
            path: imgArry[j],
            url:  imgArry[j],
          },
        )
      }else{
        reviewImgList.push(
          {
            uid: Math.random(),
            name: 'image.png',
            status: 'done',
            path: imgArry[j],
            url:  picPreviewUrl+imgArry[j],
          },
        )
      }
    }
    ehsNoticeInfoForm.ehsNoticeInfo.enpInfo.push(
      {
        problemContent:imgList[i].problemContent,
        id:imgList[i].id,
        img:imgList[i].img,
        reviewImgList:reviewImgList,
      }
    )
  }
  fileList = ref<UploadProps['fileList']>([]);
  if(record.attachment != ""&&record.attachment != null){
    const attachment = record.attachment;
    const attachmentArry = attachment.split(",");
    fileList.value = attachmentArry.map(e=>{
      return {
        uid: Math.random(),
        name: e,
        status: 'done',
        path: e,
        url: picPreviewUrl + e
      }
    })
  }

  if(record.signature != ""&&record.signature != null){

    const signature = record.signature;
    let signatureArry = [];
    if(signature.indexOf("data:image/png;base64")==0){
      signatureArry.push(signature);
      signatureImg.value = signatureArry.map(e=>{
          return {
            uid: Math.random(),
            name: e,
            status: 'done',
            path: e,
            url: e
          }
      })
    }else{
      signatureArry = signature.split(",");
      signatureImg.value = signatureArry.map(e=>{
        if(e.indexOf("http")==0){
          return {
            uid: Math.random(),
            name: e,
            status: 'done',
            path: e,
            url: e
          }
        }else{
          return {
            uid: Math.random(),
            name: e,
            status: 'done',
            path: e,
            url: picPreviewUrl + e
          }
        }
      })
    }
  }

  if(record.recipientSign != ""&&record.recipientSign != null){
    const recipientSign = record.recipientSign;
    let recipientSignArry = [];
    if(recipientSign.indexOf("data:image/png;base64")==0){
      recipientSignArry.push(recipientSign);
      recipientSignImg.value = recipientSignArry.map(e=>{
          return {
            uid: Math.random(),
            name: e,
            status: 'done',
            path: e,
            url: e
          }
      })
    }else{
      recipientSignArry = recipientSign.split(",");
      recipientSignImg.value = recipientSignArry.map(e=>{
        if(e.indexOf("http")==0){
          return {
            uid: Math.random(),
            name: e,
            status: 'done',
            path: e,
            url: e
          }
        }else{
          return {
            uid: Math.random(),
            name: e,
            status: 'done',
            path: e,
            url: picPreviewUrl + e
          }
        }
      })
    }

  }
  if(record.correctorSign != ""&&record.correctorSign != null){
    const correctorSign = record.correctorSign;
    let correctorSignArry = [];
    if(correctorSign.indexOf("data:image/png;base64")==0){
      correctorSignArry.push(correctorSign);
      correctorSignImg.value = correctorSignArry.map(e=>{
        return {
          uid: Math.random(),
          name: e,
          status: 'done',
          path: e,
          url: e
        }
      })
    }else{
      correctorSignArry = correctorSign.split(",");
      correctorSignImg.value = correctorSignArry.map(e=>{
        if(e.indexOf("http")==0){
          return {
            uid: Math.random(),
            name: e,
            status: 'done',
            path: e,
            url: e
          }
        }else{
          return {
            uid: Math.random(),
            name: e,
            status: 'done',
            path: e,
            url: picPreviewUrl + e
          }
        }
      })
    }
  }
  if(record.reviewSign != ""&&record.reviewSign != null){
    const reviewSign = record.reviewSign;
    let reviewSignArry = [];
    if(reviewSign.indexOf("data:image/png;base64")==0){
      reviewSignArry.push(reviewSign);
      reviewSignImg.value = reviewSignArry.map(e=>{
        return {
          uid: Math.random(),
          name: e,
          status: 'done',
          path: e,
          url: e
        }
      })
    }else{
      reviewSignArry = reviewSign.split(",");
      reviewSignImg.value = reviewSignArry.map(e=>{
        if(e.indexOf("http")==0){
          return {
            uid: Math.random(),
            name: e,
            status: 'done',
            path: e,
            url: e
          }
        }else{
          return {
            uid: Math.random(),
            name: e,
            status: 'done',
            path: e,
            url: picPreviewUrl + e
          }
        }
      })
    }
  }

  endDt.value = dayjs(record.endDt, dateFormat);
  if(null != record.controlStartDt && '' != record.controlStartDt && undefined != record.controlStartDt
  && null != record.controlEndDt && '' != record.controlEndDt && undefined != record.controlEndDt){
    controlDt.value =  dayjs(record.controlStartDt).format('YYYY-MM-DD HH:mm') + "  --  " +  dayjs(record.controlEndDt).format('YYYY-MM-DD HH:mm');

  }


  if(record.type==1){
    type1.value = true;
    type2.value = false;
    type3.value = false;
    type4.value = false;
    type5.value = false;
    noticeContentHeight.value = 200;
    demandName.value="针对上述问题，整改要求如下：";
    typeNameTip.value="经检查发现你单位存在以下问题，请及时整改：";
    typeDtName.value="整改期限"
  }else if(record.type==2){
    type1.value = false;
    type2.value = true;
    type3.value = false;
    type4.value = false;
    type5.value = false;
    noticeContentHeight.value = 200;
    demandName.value="针对上述预警内容，整改要求如下：";
    typeNameTip.value="";
    typeDtName.value="整改期限"
  }else if(record.type==3){
    type1.value = false;
    type2.value = false;
    type3.value = true;
    type4.value = false;
    type5.value = false;
    noticeContentHeight.value = 200;
    demandName.value="针对上述管控内容，整改要求如下：";
    typeNameTip.value="";
    typeDtName.value="反馈期限"
  }else if(record.type==4){
    type1.value = false;
    type2.value = false;
    type3.value = false;
    type4.value = true;
    type5.value = false;
    noticeContentHeight.value = 200;
    demandName.value="针对上述问题，进行考核：";
    typeNameTip.value="考核问题："
  }else if(record.type==5){
    type1.value = false;
    type2.value = false;
    type3.value = false;
    type4.value = false;
    type5.value = true;
    noticeContentHeight.value = 400;
    demandName.value="";
    typeNameTip.value="";
  }

  for (let i = 0; i < noticeInfoType._value.length; i++) {
    if (ehsNoticeInfoForm.ehsNoticeInfo.type == noticeInfoType._value[i].value) {
      typeName.value = noticeInfoType._value[i].text;
    }
  }

  //加载整改记录
  let url = '/notice/ehsNoticeCorrection/listByInfoId';
  defHttp.get({url: url,params: {'noticeInfoId': record.id,}}).then(res => {
    noticeModel.correctionList = [];
    if(res.length > 0){
      res.forEach(item=>{
        let modolItem = Object.assign({}, item);
        if(modolItem.img != "" && modolItem.img != null){
          modolItem.img = modolItem.img.split(",").map(e => {
            return {
              uid: Math.random(),
              name: 'image.png',
              status: 'done',
              url: picPreviewUrl + e
            }
          });
        }else{
          modolItem.img = [];
        }
        if(modolItem.attachment != "" && modolItem.attachment != null){
          modolItem.attachment = modolItem.attachment.split(",").map(e => {
            return {
              uid: Math.random(),
              name: e.split("/")[e.split("/").length-1],
              status: 'done',
              url: picPreviewUrl + e
            }
          });
        }else{
          modolItem.attachment = [];
        }
        if(modolItem.reviewImg != "" && modolItem.reviewImg != null){
          modolItem.reviewImg = modolItem.reviewImg.split(",").map(e => {
            return {
              uid: Math.random(),
              name: 'image.png',
              status: 'done',
              url: picPreviewUrl + e
            }
          });
        }else{
          modolItem.reviewImg = [];
        }
        modolItem.correctorName = record.correctorName;
        noticeModel.correctionList.push(modolItem);
      });
    }
  });


  visibleNotice.value = true;
}

const previewCancel = () => {
  visibleNotice.value = false;
  signatureImg = ref<UploadProps['fileList']>([]);
  recipientSignImg = ref<UploadProps['fileList']>([]);
  correctorSignImg = ref<UploadProps['fileList']>([]);
  reviewSignImg = ref<UploadProps['fileList']>([]);
};

function exportDataPdf() {

const el = document.getElementById('downLoadPdf');
html2canvas(el, {
  scale: 3, // 设置缩放
  useCORS: true, // 允许canvas画布内 可以跨域请求外部链接图片, 允许跨域请求。
  allowTaint: true,
  logging: false, // 打印日志用的 可以不加默认为false
  backgroundColor: '#ffffff'
}).then((canvas) => {
  canvas2PDF(canvas);
});

const canvas2PDF = canvas => {

  const contentWidth = canvas.width;
  const contentHeight = canvas.height;

  // 一页pdf显示html页面生成的canvas高度;a4纸的尺寸[595.28,841.89],pageHeight是应有高度吗，leftHeight是实际高度
  const pageHeight = (contentWidth / 592.28) * 841.89;
  // 未生成pdf的html页面高度
  let leftHeight = contentHeight;
  // 页面偏移
  let position = 0;
  // a4纸的尺寸[595.28,841.89]，html页面生成的canvas在pdf中图片的宽高
  const imgWidth = 595.28;
  const imgHeight = (595.28 / contentWidth) * contentHeight;

  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
  ctx.font = '15px Microsoft Yahei';
  const pageData = canvas.toDataURL('image/jpeg', 1.0);
  const pdf = new jsPDF("p", "pt", "a4");
  if (leftHeight < pageHeight) {
    // 在pdf.addImage(pageData, 'JPEG', 左，上，宽度，高度)设置在pdf中显示；
    pdf.addImage(pageData, 'JPEG', 0, 0, imgWidth, imgHeight);
  } else {
    // 分页
    while (leftHeight > 0) {
      pdf.addImage(pageData, 'JPEG', 0, position, imgWidth, imgHeight);
      leftHeight -= pageHeight;
      position -= 841.89;
      // 避免添加空白页
      if (leftHeight > 0) {
        pdf.addPage();
      }
    }
  }
  // 可动态生成
  const fileName = ehsNoticeInfoForm.ehsNoticeInfo.title + typeName.value + ehsNoticeInfoForm.ehsNoticeInfo.noticeNo;
  pdf.save(`${fileName}.pdf`);
};
}

getDictData();
//获取字典分类
async function getDictData() {
  let params = {};
  let res = await defHttp.get({
    url: '/sys/dict/getDictItems/notice_info_type',
    params
  }, {isTransformResponse: false});
  if (res.success && res.result) {
    noticeInfoType.value = [...res.result];

  } else {
    console.log('数根节点查询结果异常', res);
  }
}

const handlePreview = async (file: UploadProps['fileList'][number]) => {
  if (!file.url && !file.preview) {
    file.preview = (await getBase64(file.originFileObj)) as string;
  }
  previewImage.value = file.url || file.preview;
  previewVisible.value = true;
  previewTitle.value = file.name || file.url.substring(file.url.lastIndexOf('/') + 1);
};

const imgPreview = async (file: UploadProps['fileList'][number]) => {
  if (!file.url && !file.preview) {
    file.preview = (await getBase64(file.originFileObj)) as string;
  }
  previewImage.value = file.url || file.preview;
  previewVisible.value = true;
  previewTitle.value = file.name || file.url.substring(file.url.lastIndexOf('/') + 1);
};
const imgCancel = (item) => {
  previewVisible.value = false;
  previewTitle.value = '';
};
function getBase64(file: File) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}

</script>
<style scoped>

</style>
