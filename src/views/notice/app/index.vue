<template>
  <div class="app-em-wrap" align="center">
    <div class="search-wrap">
      <van-search class="search-left" shape="round" v-model="searchValue" placeholder="请输入" @search="onSearch" />
      <div class="search-right" @click="showSearchDrawer">
        <span class="btn-text">筛选</span>
        <img class="btn-icon" src="../../../assets/images/emergency/down.png" alt="" />
      </div>
    </div>
    <div class="" style="background-color: #FFFFFF;width: 95%">
      <van-list v-model:loading="loading" :finished="finished" finished-text="没有更多了" @load="onLoad">
        <div class="" style="border:1px solid #D7D7D7;margin-top: 10px;height: 200px;" v-for="(item, index) in listData" :key="item.id">
          <div @click="detailAction(item)">
          <van-row justify="space-between" style="margin-top: 20px">
            <div class="" style="margin-left: 10px;font-size: 18px">
              {{partiallyHidden(item.title)}}{{filterMultiDictText(dictOptionsType, item.type)}}
            </div>
            <div class="" style="margin-right: 10px">
              {{item.noticeNo}}
            </div>
          </van-row>
          <van-row justify="space-between" style="margin-top: 20px">
            <div class="" style="margin-left: 10px" @click="showAllText(item.orgName)">
              <span style="color: #BABCC1">签发单位：</span>{{partiallyHidden(item.orgName)}}
            </div>
            <div class="" style="margin-right: 10px;color: red">
              {{ filterMultiDictText(dictStatus, item.status) }}
            </div>
          </van-row>
          <van-row justify="space-between" style="margin-top: 20px">
            <div class="" style="margin-left: 10px">
              <span style="color: #BABCC1">签发时间：</span>{{ item.distributeTime }}
            </div>
          </van-row>
          <van-row justify="space-between" style="margin-top: 20px">
            <van-col span="12">
              <div class="" style="float: left;margin-left: 10px" v-for="(itemData, index) in item.enpInfo.imgList">
                <img v-if="index<2" style="width: 30px;height: 30px" :src="itemData">
              </div>
            </van-col>
            <van-col span="12">
              <div v-if="item.isShowButton" class="buttonClass" @click.stop="operate(item)">
                <span>
                  {{item.buttonName}}
                </span>
              </div>
            </van-col>
          </van-row>
          </div>
        </div>
      </van-list>
    </div>
    <!-- 右侧弹出 -->
    <van-popup v-model:show="showRight" closeable position="right" :style="{ width: '294px', height: '100%' }">
      <div style="position: relative">
        <div class="search-title">筛选</div>
        <div class="search-split"></div>
        <div class="content-box">
          <div class="content-item">
            <div class="item-label">签发单位</div>
            <div class="choose-list">
              <van-field style="border:1px solid #EFF1F5;border-radius: 5px" v-model="searchOrgName" placeholder="请输入" />
            </div>
          </div>
<!--          <div class="content-item">-->
<!--            <div class="item-label">所属机构</div>-->
<!--            <div class="choose-list">-->
<!--              <div-->
<!--                class="choose-item"-->
<!--                @click="chooseLine(index, item.value)"-->
<!--                v-for="(item, index) in orgOptions"-->
<!--                :key="index"-->
<!--                :class="{ 'item-margin': (index + 1) % 2 != 0, 'item-active': isActiveLine && isActiveLineIndex == index }"-->
<!--              >{{ item.label }}</div-->
<!--              >-->
<!--            </div>-->
<!--          </div>-->
<!--          <div v-if="isActiveLine" class="content-item">-->
<!--            <div class="item-label">部门</div>-->
<!--            <div class="choose-list">-->
<!--              <div-->
<!--                class="choose-item"-->
<!--                @click="chooseDepart(index, item.value)"-->
<!--                v-for="(item, index) in departOptions"-->
<!--                :key="index"-->
<!--                :class="{ 'item-margin': (index + 1) % 2 != 0, 'item-active': isActiveDepart && isActiveIndex == index }"-->
<!--              >{{ item.label }}</div-->
<!--              >-->
<!--            </div>-->
<!--          </div>-->
          <div class="content-item">
            <div class="item-label">通知类型</div>
            <div class="choose-list">
              <div
                class="choose-item"
                @click="chooseType(index, item.value)"
                v-for="(item, index) in dictOptionsType"
                :key="index"
                :class="{ 'item-margin': (index + 1) % 2 != 0, 'item-active': item.isChecked}"
                >{{ item.text }}
                <input type="text" v-model="item.value" style="display: none" />
              </div>
            </div>
          </div>
          <div class="content-item">
            <div class="item-label">状态</div>
            <div class="choose-list">
              <div
                class="choose-item"
                @click="chooseStatus(index, item.value)"
                v-for="(item, index) in dictOptionsStatus"
                :key="index"
                :class="{ 'item-margin': (index + 1) % 2 != 0, 'item-active': item.isChecked }"
              >{{ item.text }}
                <input type="text" v-model="item.value" style="display: none" />
              </div>
            </div>
          </div>
          <div class="content-item" style="position: relative">
            <div class="item-label">签发时间</div>
            <a-input
              :disabled="true"
              style="width: 264px; height: 46px; border-radius: 4px 4px 4px 4px; margin-top: 8px"
              v-model:value="date"
              placeholder="请选择"
            />
            <van-icon name="arrow-down" class="arrow-down" @click="showTime = true" />
          </div>
        </div>
        <div class="action-btn">
          <div class="btn-item-1" @click="handleReset">重置</div>
          <div class="btn-item-2" @click="handleConfirm">查询</div>
        </div>
      </div>
    </van-popup>
    <van-calendar :max-date="maxDate" :min-date="minDate" v-model:show="showTime" :allow-same-day="true" type="range" @confirm="onConfirm" />
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, reactive, onMounted} from 'vue';
import { showDialog,showToast} from 'vant';
import { list } from './app.api';
import { initDictOptions } from '/@/utils/dict';
import { filterMultiDictText } from '/@/utils/dict/JDictSelectUtil.js';
import { defHttp } from '/@/utils/http/axios';
import { useRouter } from 'vue-router';
import {picPreviewUrl, previewFile} from '/@/api/common/api';
import {usePermission} from "/@/hooks/web/usePermission";
import dayjs from "dayjs";
import {useUserStore} from '/@/store/modules/user';

const userStore = useUserStore();
const userinfo = computed(() => userStore.getUserInfo);
const loginInfo = computed(() => userStore.getLoginInfo);
const { hasPermission } = usePermission();
const router = useRouter();
const searchValue = ref('');
const loading = ref(false);
const finished = ref(false);
const showRight = ref(false);
const isActiveDepart = ref(false);
const isActiveIndex = ref(null);
const isActiveType = ref(false);
const isActiveTypeIndex = ref([]);
const isActiveStatus = ref(false);
const isActiveStatusIndex = ref(null);
const isActiveLine = ref(false);
const isActiveLineIndex = ref(null);
const date = ref('');
const showTime = ref(false);
const isCollect = ref(false);
const collectIndex = ref(0);
const listData = ref([]);
const current = ref(1);
const pageSizeRef = ref(8);
const total = ref(0);
const dictOptionsType = ref<any>([]);
const dictOptionsStatus = ref<any>([]);
const dictStatus = ref<any>([]);
const departOptions = ref<any>([]);
const orgOptions = ref<any>([]);
const queryParam = reactive<any>({
  title: null,
  startTime: null,
  endTime: null,
  type: null,
  status: null,
  orgId: null,
  orgName:null,
});

const searchOrgName = ref('');
const searchTypeValue = ref('');
const searchStatusValue = ref('');
const query = ref({});
const showDetail = ref(false);
const maxDate = new Date();
const minDate = new Date(new Date().getFullYear() - 5, new Date().getMonth(), new Date().getDate());

/**
 * 初始化字典选项
 */
async function initDictConfig() {
  dictOptionsType.value = await initDictOptions('notice_info_type');
  for(let i=0;i<dictOptionsType.value.length;i++){
    dictOptionsType.value[i].isChecked = false;
  }
  dictOptionsStatus.value = await initDictOptions('notice_info_app_status');
  for(let i=0;i<dictOptionsStatus.value.length;i++){
    dictOptionsStatus.value[i].isChecked = false;
  }

  dictStatus.value = await initDictOptions('notice_info_status');
}
 loadData(1);
onMounted(() => {
  //初始化字典选项
  initDictConfig();
  // getOrgList();
});

async function detailAction(item) {
  JSON.stringify(item);
  router.push({
    path: '/app/ehsNoticeInfoRecDetail',
    query: {
      qm:JSON.stringify(item),
      isShowButton: '0',
      dictOptionsType:JSON.stringify(dictOptionsType),
    }
  })
}

async function operate(item) {
  if(item.status=='1'){ //待审核
    JSON.stringify(item);
    router.push({
      path: '/app/noticeDetail',
      query: {
        id:item.id,
        isShowButton:'1',
        dictOptionsType:JSON.stringify(dictOptionsType),
      }
    })
  }else if(item.status=='2'){ //待签收
    JSON.stringify(item);
    router.push({
      path: '/app/noticeInfoSignDetail',
      query: {
        id:item.id,
        dictOptionsType:JSON.stringify(dictOptionsType),
      }
    })

  }else if(item.status=='3'){ //待整改
    JSON.stringify(item);
    router.push({
      path: '/app/ehsNoticeInfoRecDetail',
      query: {
        qm:JSON.stringify(item),
        isShowButton: '1',
        dictOptionsType:JSON.stringify(dictOptionsType),
        dictOptionsStatus:JSON.stringify(dictOptionsStatus),
      }
    })
  }else if(item.status=='4'){ //待复查
    JSON.stringify(item);
    router.push({
      path: '/app/ehsNoticeInfoRecDetail',
      query: {
        qm:JSON.stringify(item),
        isShowButton: '1',
        dictOptionsType:JSON.stringify(dictOptionsType),
        dictOptionsStatus:JSON.stringify(dictOptionsStatus),
      }
    })
  }
}

async function getOrgList() {
  await defHttp.get({ url: '/sys/sysDepart/selectLine' }).then((res) => {
    res.map((item) => {
      orgOptions.value.push({
        label: item.departName,
        value: item.orgId,
      });
    });
  });
}
function getDepartList(value) {
  let params: any = {};
  params.orgCode = value;
  params.pageSize = 9999;
  params.pageNo = 1;
  defHttp.get({ url: '/sys/sysDepart/selectDept', params }).then((res) => {
    departOptions.value = [];
    res.records.map((item) => {
      departOptions.value.push({
        label: item.departName,
        value: item.orgId,
      });
    });
  });
}
const onSearch = (val) => {
  listData.value = [];
  current.value = 1;
  total.value = 0;
  loadData(1);
};
const onLoad = () => {
  // 异步更新数据
  // setTimeout 仅做示例，真实场景中一般为 ajax 请求
  // 数据全部加载完成
  if (listData.value.length == total.value) {
    finished.value = true;
  } else {
    finished.value = false;
    // 加载状态结束
    loading.value = false;
    current.value += 1;
    loadData(current.value);
  }
};
//列表
async function loadData(arg) {
  if (arg === 1) {
    current.value = 1;
    listData.value = [];
  }
  loading.value = true;
  let param: any = Object.assign({}, queryParam);
  if(searchValue.value!=""){
    param['noticeNo'] = searchValue.value;
  }
  if(searchOrgName.value!=""){
    param['orgName'] = searchOrgName.value;
  }
  param['pageNo'] = current.value;
  param['pageSize'] = pageSizeRef.value;

  await list(param).then((res) => {
    listData.value = listData.value.concat(res.records);
      let listDataBak = listData.value.map((item: any) => {
        if (searchValue.value) {
          if (item.title.indexOf(searchValue.value) > -1) {
            item.title = item.title.replace(searchValue.value, "<span style='color:red'>" + searchValue.value + '</span>');
          }
        }
        if(item.status=='1'){
          item.buttonName="审核";
          if(hasPermission('notice:reviewing')&&userinfo.value.id == item.auditorId){
            item.isShowButton=true;
          }else{
            item.isShowButton=false;
          }

        }else if(item.status=='2'){

          // 获取当前记录的 接收单位 接收人信息
          let buttonFlag = false;
          let receiveUserId  = item.receiveUserId;
          if(receiveUserId != null  && receiveUserId.trim() != ''){
            let  userId = userinfo.value.id;
            if(userId == receiveUserId ){
              buttonFlag = true;
            }
          }else{
            let orgCode =  userinfo.value.orgCode;
            const isSecuritySector = loginInfo.value.departs[0]?.isSecuritySector;
            if(isSecuritySector == '1'){
              buttonFlag = true;
            }else{
              let receiveOrgCode  = item.receiveOrgCode;
              if(orgCode == receiveOrgCode){
                buttonFlag = true;
              }
            }
          }

          item.buttonName="签收";
          if((hasPermission('safeNotice:sign') || hasPermission('eiaNotice:sign')) && buttonFlag){
            item.isShowButton=true;
          }else{
            item.isShowButton=false;
          }
        }else if(item.status=='3'){
          item.buttonName="整改反馈";
          if(hasPermission('noticeRectification:feedback') && item.isExtension!='2' && userinfo.value.id == item.correctorId){
            item.isShowButton=true;
          }else{
            item.isShowButton=false;
          }
        }else if(item.status=='4'){
          item.buttonName="复查";
          if(hasPermission('noticeRectification:review') && userinfo.value.id == item.signUserid){
            item.isShowButton=true;
          }else{
            item.isShowButton=false;
          }
        }else if(item.status=='5'){
          item.buttonName="";
          item.isShowButton=false;
        }else{
          item.buttonName="";
          item.isShowButton=false;
        }
        let imgList = [];
        item.enpInfo.map((v) => {
          let imgArr = [];
          if(v.img!=""&&v.img!=null){
            imgArr = v.img.split(",");
            imgArr.map((v) => {
              if(v.indexOf("http")==0){
                imgList.push(v);
              }else{
                imgList.push(picPreviewUrl+v);
              }
            });
          }
        });
        if(imgList.length>0){
          item.enpInfo.imgList = imgList;
        }
        return item;
      });
      listData.value = listDataBak;
    total.value = res.total;
    loading.value = false;
  });
}
const onConfirm = (values) => {
  const [start, end] = values;
  showTime.value = false;
  console.log(start);
  date.value = dayjs(start).format('YYYY-MM-DD') + '-' + dayjs(end).format('YYYY-MM-DD');
  queryParam['startTime'] = dayjs(start).format('YYYY-MM-DD');
  queryParam['endTime'] = dayjs(end).format('YYYY-MM-DD');
};
function showSearchDrawer() {
  showRight.value = true;
}

function chooseLine(index, value) {
  getDepartList(value);
  if (isActiveLineIndex.value == index) {
    isActiveLine.value = !isActiveLine.value;
    queryParam['orgId'] = null;
  } else {
    isActiveLineIndex.value = index;
    isActiveLine.value = true;
    queryParam['orgId'] = value;
  }
}

function chooseDepart(index, value) {
  if (isActiveIndex.value == index) {
    isActiveDepart.value = !isActiveDepart.value;
    queryParam['departCode'] = '';
  } else {
    isActiveIndex.value = index;
    isActiveDepart.value = true;
    queryParam['departCode'] = value;
  }
}

function chooseType(index, value) {
  queryParam['type'] = null;
  for(let i=0;i<dictOptionsType.value.length;i++){
    if (i == index) {
      dictOptionsType.value[i].isChecked = !dictOptionsType.value[i].isChecked;
    }
  }
  for(let j=0;j<dictOptionsType.value.length;j++){
    if(dictOptionsType.value[j].isChecked){
      if(queryParam['type']!=null){
        queryParam['type'] = queryParam['type']+","+dictOptionsType.value[j].value;
      }else{
        queryParam['type'] = dictOptionsType.value[j].value;
      }
    }
  }
}
function chooseStatus(index, value) {
  queryParam['status'] = null;
  for(let i=0;i<dictOptionsStatus.value.length;i++){
    if (i == index) {
      dictOptionsStatus.value[i].isChecked = !dictOptionsStatus.value[i].isChecked;
    }
  }
  for(let j=0;j<dictOptionsStatus.value.length;j++){
    if(dictOptionsStatus.value[j].isChecked){
      if(queryParam['status']!=null){
        queryParam['status'] = queryParam['status']+","+dictOptionsStatus.value[j].value;
      }else{
        queryParam['status'] = dictOptionsStatus.value[j].value;
      }
    }
  }
  console.log(queryParam['status']);
}
function handleCollect(index) {
  if (collectIndex.value == index) {
    isCollect.value = !isCollect.value;
  } else {
    collectIndex.value = index;
    isCollect.value = true;
  }
}
function showMarkDialog(item) {
  if (!item.remark) {
    item.remark = '暂无数据';
  }
  showDialog({
    title: '备注',
    message: item.remark,
    messageAlign: 'left',
  }).then(() => {
    // on close
  });
}
// 预览
function handlePreview(filePath) {
  if (filePath) {
    previewFile(filePath).then((res) => {
      window.open(res, '_blank');
    });
  }
}
// 筛选-确认
function handleConfirm() {
  listData.value = [];
  current.value = 1;
  total.value = 0;
  loadData(1);
  showRight.value = false;
}
// 重置
function handleReset() {
  console.log("************")
  finished.value = false;
  loading.value = false;
  isActiveDepart.value = false;
  isActiveIndex.value = null;
  isActiveType.value = false;
  isActiveTypeIndex.value = null;
  isActiveStatus.value = false;
  isActiveStatusIndex.value = null;
  isActiveLine.value = false;
  isActiveLineIndex.value = null;
  searchOrgName.value = '';
  date.value = '';
  queryParam['startTime'] = null;
  queryParam['endTime'] = null;
  queryParam['type'] = null;
  queryParam['title'] = null;
  for(let i=0;i<dictOptionsType.value.length;i++){
      dictOptionsType.value[i].isChecked = false;
  }
  for(let i=0;i<dictOptionsStatus.value.length;i++){
      dictOptionsStatus.value[i].isChecked =  false;
  }
}
function handleDetail(item) {
  // router.push({ path: '/app/em/drill/detail', query: item });
  showDetail.value = true;
  query.value = Object.assign({}, item);
}

function partiallyHidden(text) {
  var leg = text.length;
  if (leg > 6) {
    return text.substring(0, 6) + '...';
  } else {
    return text;
  }
}

function showAllText(text) {
  showToast(text);
}

</script>

<style lang="less" scoped>
.app-em-wrap {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  background: #eff1f5;
}
:deep(.van-search) {
  background: none;
}
:deep(.van-search__content) {
  background: #ffffff;
}
:deep(.van-search__field) {
  height: 40px;
}
.search-wrap {
  clear: both;
  overflow: hidden;
  .search-right {
    float: right;
    width: 74px;
    height: 40px;
    border-radius: 20px 20px 20px 20px;
    border: 1px solid rgba(0, 0, 0, 0.1);
    margin: 10px 12px 0 0;
    text-align: center;
    line-height: 40px;
    .btn-text {
      font-size: 13px;
      font-family: PingFang SC-Regular, PingFang SC;
      font-weight: 400;
      color: rgba(0, 0, 0, 0.87);
    }
    .btn-icon {
      display: inline-block;
      width: 10px;
      height: 10px;
      margin-left: 4px;
    }
  }
  .search-left {
    float: left;
    width: 267px;
  }
}
.search-title {
  font-size: 16px;
  font-family: SourceHanSansCN-Medium-, SourceHanSansCN-Medium;
  color: rgba(0, 0, 0, 0.87);
  margin: 12px 0 12px 16px;
}
.search-split {
  width: 100%;
  height: 1px;
  background: #eff1f5;
  border-radius: 0px 0px 0px 0px;
}
.content-box {
  margin-left: 16px;
  padding-bottom: 80px;
  .content-item {
    margin-top: 12px;
    .item-label {
      font-size: 13px;
      font-family: Source Han Sans CN-Regular, Source Han Sans CN;
      font-weight: 400;
      color: #000000;
    }
    .choose-list {
      margin-top: 8px;
      .choose-item {
        display: inline-block;
        width: 128px;
        height: 36px;
        background: #eff1f5;
        border-radius: 4px 4px 4px 4px;
        line-height: 36px;
        font-size: 14px;
        color: rgba(0, 0, 0, 0.6);
        text-align: center;
        margin-bottom: 8px;
        border: 1px solid #eff1f5;
        cursor: pointer;
        text-overflow: -o-ellipsis-lastline;
        overflow: hidden;
        text-overflow: ellipsis;
        -webkit-line-clamp: 1;
        line-clamp: 1;
        -webkit-box-orient: vertical;
      }
      .item-margin {
        margin-right: 8px;
      }
      .item-active {
        border: 1px solid #3e87f8;
        background: rgba(62, 135, 248, 0.1);
      }
    }
    .arrow-down {
      position: absolute;
      right: 30px;
      top: 43px;
      z-index: 999;
      width: 8px;
      height: 4px;
      cursor: pointer;
    }
  }
}
.action-btn {
  position: absolute;
  right: 0px;
  bottom: 0px;
  width: 100%;
  z-index: 999;
  .btn-item-1 {
    display: inline-block;
    cursor: pointer;
    width: 50%;
    color: rgba(0, 0, 0, 0.6);
    height: 53px;
    line-height: 53px;
    background: #f7f8fa;
    text-align: center;
  }
  .btn-item-2 {
    display: inline-block;
    cursor: pointer;
    width: 50%;
    height: 53px;
    line-height: 53px;
    font-weight: 600;
    color: #ffffff;
    background: #3e87f8;
    cursor: pointer;
    text-align: center;
  }
}
.buttonClass{
  border-radius:30px;
  text-align: center;
  float:right;
  margin-right: 10px;
  width: 80px;
  height: 30px;
  line-height:30px;
  background-color: #0a9fe5;
  color: white;
  margin-top: 1px;
}
</style>
