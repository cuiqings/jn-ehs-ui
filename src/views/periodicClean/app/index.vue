<template>
  <div class="app-periodic-wrap">
    <Spin :spinning="loading">
      <div class="pc-list">
        <dl v-if="dataObj.changeStatus==='0'">
          <dt>申请变更</dt>
          <dd>{{
            dataObj.jnPlanChangeRecordList[dataObj.jnPlanChangeRecordList.length - 1].changeType === '1' ? '申请内容变更' : dataObj.isEnable === '0' ? '申请启用' : '申请停用'
          }}</dd>
        </dl>
        <dl v-if="dataObj.changeStatus === '1' || dataObj.changeStatus === '2'">
          <dt>申请变更</dt>
          <dd>{{
            dataObj.jnPlanChangeRecordList[dataObj.jnPlanChangeRecordList.length - 1].changeType === '1' ? '申请内容变更' : dataObj.isEnable === '1' ? '申请启用' : '申请停用'
          }}</dd>
        </dl>
        <dl v-if="!!dataObj.changeStatus && dataObj.jnPlanChangeRecordList[dataObj.jnPlanChangeRecordList.length - 1].annex">
          <dt>附件</dt>
          <dd><span style="color:blue;" @click="handlePreview()">查看附件</span></dd>
        </dl>
        <dl>
          <dt>类型</dt>
          <dd>{{filterMultiDictText(dictOptionsType, dataObj.type)}}</dd>
        </dl>
        <dl>
          <dt>工序</dt>
          <dd>{{dataObj.productionProcessse}}</dd>
        </dl>
        <dl>
          <dt>设备/区域</dt>
          <dd>{{dataObj.deviceRegion}}</dd>
        </dl>
        <dl>
          <dt>项目</dt>
          <dd>{{dataObj.entryName}}</dd>
        </dl>
        <dl>
          <dt>周期</dt>
          <dd>{{dataObj.cycle === '5' ? dataObj.dayNum+'天' : filterMultiDictText(dictOptionsCycle, dataObj.cycle)}}</dd>
        </dl>
        <dl>
          <dt>上次执行时间</dt>
          <dd>{{dataObj.lastExecutionTime}}</dd>
        </dl>
        <dl>
          <dt>执行人</dt>
          <dd>{{dataObj.executorName}}</dd>
        </dl>
        <dl>
          <dt>监督人</dt>
          <dd>{{dataObj.supervisorName}}</dd>
        </dl>
        <dl>
          <dt>清理维护项</dt>
          <dd>{{dataObj.jnClearPositionList?.length}}项</dd>
        </dl>
        <div class="p-line"></div>
        <ul class="cl-title">
          <li>
            <span class="t-index">序号</span>
            <span class="t-name">{{dataObj.type==='0' ? '清理部位' : '维保内容'}}</span>
            <span class="t-type">{{dataObj.type==='0' ? '方法' : '维保方式'}}</span>
          </li>
        </ul>
        <ul class="cl-list">
          <li v-for="(item,index) in dataObj.jnClearPositionList">
            <span class="t-index">{{ index+1 }}</span>
            <span class="t-name">{{item.clearPosition}}</span>
            <span class="t-type">
              {{dataObj.type==='0' ? filterMultiDictText(dictOptionsQlmethod, item.clearMethod) : filterMultiDictText(dictOptionsWbmethod, item.clearMethod)}}
            </span>
          </li>
        </ul>
      </div>
      <div
        v-if="(dataObj.planStatus === '1' || dataObj.planStatus === '2') && dataObj.changeStatus !== '0'"
        v-for="(item) in dataObj.jnPlanChangeRecordJhList"
      >
        <div class="rd-title">审批记录</div>
        <div class="pc-list">
          <dl>
            <dt>处理结果</dt>
            <dd>{{filterMultiDictText(dictOptionsPlanStatus, item.changeStatus)}}</dd>
          </dl>
          <dl v-if="item.changeStatus !== '1'">
            <dt>审批说明</dt>
            <dd>{{ item.approverIllustrate }}</dd>
          </dl>
          <dl>
            <dt>处理人</dt>
            <dd>{{ item.approver }}</dd>
          </dl>
          <dl>
            <dt>处理时间</dt>
            <dd>{{ item.approverTime || '--' }}</dd>
          </dl>
        </div>
      </div>

      <div
        class="btn-box"
        v-if="dataObj.planStatus === '0' || dataObj.changeStatus === '0'"
      >
        <a-button type="warning" @click="handleNoPass()">不通过</a-button> 
        <a-button type="primary" :disabled="loading" @click="handlePass()">通过</a-button>
      </div>

      <van-dialog
        v-model:show="show"
        title="审批说明"
        show-cancel-button
        :lazy-render="false"
        @confirm="remarkConfirm"
      >
        <van-field
          type="textarea"
          v-model="remark"
          rows="2"
          autosize
          autofocus
          maxlength="200"
          placeholder="请输入"
          show-word-limit
          class="message"
        />
      </van-dialog>
    </Spin>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { showToast } from 'vant';
import { getDetail,postUpdate } from './app.api';
// import { downloadFile } from '/@/utils/common/renderUtils';
import { initDictOptions } from '/@/utils/dict';
import { filterMultiDictText } from '/@/utils/dict/JDictSelectUtil.js';
import { useRouter } from 'vue-router';
import { previewFile } from '/@/api/common/api';
import { setAppTitle } from '/@/utils/index';
// import { getFileAccessHttpUrl } from '/@/utils/common/compUtils';
import { Spin } from 'ant-design-vue';
const router = useRouter();
const { currentRoute } = router;
const dictOptionsType = ref<any>([]);
const dictOptionsCycle = ref<any>([]);
const dictOptionsPlanStatus = ref<any>([]);
const dictOptionsQlmethod = ref<any>([]);
const dictOptionsWbmethod = ref<any>([]);
const pageId = currentRoute.value?.query.id
const subTaskCode = currentRoute.value?.query.subTaskCode
const show = ref(false)
const remark = ref('')
const dataObj:any = ref({})
const loading = ref(false)

/**
 * 初始化字典选项
 */
async function initDictConfig() {
  dictOptionsType.value = await initDictOptions('clean_plan_type');
  dictOptionsCycle.value = await initDictOptions('cycle');
  dictOptionsPlanStatus.value = await initDictOptions('plan_status');
  dictOptionsQlmethod.value = await initDictOptions('ql_method');
  dictOptionsWbmethod.value = await initDictOptions('wb_method');
}
loadData();
onMounted(() => {
  setAppTitle()
  //初始化字典选项
  initDictConfig();
});

function loadData(){
  getDetail({id:pageId,type:'app'}).then((res:any) => {
    // console.log(res)
    dataObj.value = res
    if(!!res.changeStatus){
      document.title = '周期清理变更'
    }
  })
}
// 不通过
function handleNoPass(){
  remark.value=''
  show.value = true
}
// 确定confirm
function remarkConfirm(){
  console.log(remark.value)
  if(remark.value === ''){
    showToast('内容不能为空')
    return
  }
  const params = {
    approverIllustrate: remark.value,
    id: pageId,
    status: '2', // 不通过
    subTaskCode: subTaskCode,
    type: !!dataObj.value.changeStatus ? '1' : '0',
    changeType: !!dataObj.value.changeStatus ? dataObj.value.jnPlanChangeRecordList[dataObj.value.jnPlanChangeRecordList.length-1].changeType : ''
  }
  loading.value=true
  postUpdate(params).then((res:any) => {
    console.log(res)
    // showToast('操作成功')
    loadData()
  }).finally(() => {
    loading.value=false
  })
  show.value = false
}
// 通过
function handlePass(){
  loading.value=true
  const params = {
    approverIllustrate: '无',
    id: pageId,
    status: '1', // 通过
    subTaskCode: subTaskCode,
    type: !!dataObj.value.changeStatus ? '1' : '0',
    changeType: !!dataObj.value.changeStatus ? dataObj.value.jnPlanChangeRecordList[dataObj.value.jnPlanChangeRecordList.length-1].changeType : ''
  }
  postUpdate(params).then((res:any) => {
    console.log(res)
    // showToast('操作成功')
    loadData()
  }).finally(() => {
    loading.value=false
  })
}

// function showMarkDialog(item) {
//   showDialog({
//     title: '备注',
//     message: item.remark,
//     messageAlign: 'left',
//   }).then(() => {
//     // on close
//   });
// }
// 预览
function handlePreview() {
  const {jnPlanChangeRecordList} = dataObj.value
  const index = jnPlanChangeRecordList.length - 1
  if (jnPlanChangeRecordList && jnPlanChangeRecordList.length>0 && jnPlanChangeRecordList[index].annex) {
    // window.open(getFileAccessHttpUrl(jnPlanChangeRecordList[0].annex), '_blank');
    previewFile(jnPlanChangeRecordList[index].annex).then((res) => {
      console.log('previewFile res', res);
      window.open(res, '_blank');
    });
  }
}

</script>

<style lang="less" scoped>
.app-periodic-wrap {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  background: #eff1f5;
  padding-top: 12px;
  padding-bottom: 70px;
  .p-line{
    border-top: 1px solid #eee;
  }
  .rd-title{
    padding: 10px 16px;
    border-bottom: 1px solid rgba(0,0,0,0.05);
    font-size: 15px;
    font-weight: bold;
    color: rgba(0,0,0,0.87);
    margin-top: 12px;
    background-color: #fff;
  }
  .pc-list{
    padding: 13px 16px 0px;
    background-color: #fff;
    border-bottom: 1px solid #eee;
    >dl{
      display: flex;
      font-size: 14px;
      margin-bottom: 10px;
      dt{
        width: 100px;
        text-align: left;
        color: rgba(0,0,0,0.38);
      }
      dd{
        flex: 1;
        color: rgba(0,0,0,0.87);
        margin-bottom: 0px;
      }
    }
    .cl-title{
      margin-top: 10px;
      margin-bottom: 0px;
      li{
        display: flex;
        padding: 6px 8px;
        background: #F5F8FB;
        color: rgba(0,0,0,0.38);
        font-size: 14px;
        .t-index{
          width: 50px;
        }
        .t-name{
          flex: 1;
          word-break: break-all;
          padding-right: 10px;
        }
        .t-type{
          width: 70px;
        }
      }
    }
    .cl-list{
      li{
        display: flex;
        padding: 6px 8px;
        color: rgba(0,0,0,0.87);
        font-size: 14px;
        border-bottom: 1px solid rgba(0,0,0,0.05);;
        .t-index{
          width: 50px;
        }
        .t-name{
          flex: 1;
          word-break: break-all;
          padding-right: 10px;
        }
        .t-type{
          width: 70px;
        }
      }
    }
  }
  .btn-box{
    background-color: #fff;
    padding: 6px 10px 20px;
    position: fixed;
    bottom: 0px;
    left: 0px;
    right: 0px;
    display: flex;
    >button{
      width: 50%;
      margin: 0px 5px;
    }
  }
}

</style>
