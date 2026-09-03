<template>
  <BasicDrawer v-bind="$attrs" @register="register" :title="title" width="1300px">
    <a-tabs v-model:activeKey="activeKey">
      <a-tab-pane key="1" tab="演练计划信息">
        <plan-form ref="formElRef" :detail="detail" :disabled="disabled" @cancel="closeDrawer"
          @submit="closeDrawer"></plan-form>
      </a-tab-pane>
      <a-tab-pane key="2" tab="审批流程" force-render>
        <process-form ref="processRef" :detail="detail" :disabled="disabled" @cancel="closeDrawer" @submit="closeDrawer"></process-form>
      </a-tab-pane>
    </a-tabs>
    <div class="exaime" v-if="activeKey == '1'">
      <div class="tit">计划审批</div>
      <ul>
        <li v-for="item in detail.examineList">
          <div class="name">{{ item.node }}</div>
          <div v-for="citem in item.examineItemList">
            <div class="names">
              <span style="padding-right: 15px;">{{ citem.operatorName }}</span> <span>{{citem.finishTime}}</span>
            </div>
            <img v-if="citem.sign" :src="getFileAccessHttpUrl(citem.sign)" alt="">
          </div>
        </li>
      </ul>
    </div>
    <template v-if="title != '详情'" #footer>
      <div class="btns">
        <a-space :size="24">
          <a-button type="primary" danger @click="backFn">审批退回</a-button>
          <a-button type="primary" @click="submitFn">审批同意</a-button>
        </a-space>
      </div>
    </template>
  </BasicDrawer>
  <a-modal v-model:visible="backOpen" title="审批退回" @cancel="cancel" @ok="backOk" :confirmLoading="confirmLoading">
    <div class="back-reson">
      <div class="main">
        <span>说明</span><a-textarea v-model:value="backreson" :auto-size="{ minRows: 3, maxRows: 5 }" placeholder="请输入退回原因" />
      </div>
      <div class="hint" v-show="empty">请输入</div>
    </div>
  </a-modal>
  <signModal @register="registerSignModal" @close="signSuccess" />
</template>
<script lang="ts" setup>
import { BasicDrawer, useDrawerInner } from '/@/components/Drawer';
import { examine, examineBack, planDetail } from '../api';
import { getFileAccessHttpUrl } from '/@/utils/common/compUtils';
import { useModal } from '/@/components/Modal';
import signModal from './components/signModal.vue';
import processForm from './components/process.vue';
import planForm from './components/planForm.vue';
import { ref } from 'vue';

const emits = defineEmits(['success']);
const title = ref('新增');
const activeKey = ref('1');
const disabled = ref(false);
const detail = ref({});
const backOpen = ref(false);
const formElRef = ref<InstanceType<typeof planForm> | null>(null);
const empty = ref(false);
const processRef = ref<InstanceType<typeof processForm> | null>(null);
const [register, { closeDrawer }] = useDrawerInner((data) => {
  title.value = data.title;
  if(data.id){
    planDetail(data.id).then(res => { 
      detail.value = res
      formElRef.value?.init(res)
      processRef.value?.init(res.examineList)
    });
  }
});

const [registerSignModal, { openModal: openSignModal }] = useModal();

const backreson = ref('');
const backFn = () => {
  backOpen.value = true;
  console.log(backOpen.value);

};
const confirmLoading = ref(false);
const backOk = () => {
  if(!backreson.value) {
    empty.value = true;
    return;
  };
  
  confirmLoading.value = true;
  examineBack({
    id: getId(),
    backReason: backreson.value
  }).then(() => {
    backOpen.value = false;
    empty.value = false;
    confirmLoading.value = false;
    closeDrawer();
    emits('success')
  }).catch(() => { 
    confirmLoading.value = false;
  })
}
const cancel = () => {
  backOpen.value = false;
  backreson.value = '';
  empty.value = false;
}

const submitFn = () => {
  openSignModal(true, {id: getId()})
}
const getId = () => {
  let nodeId = '';
  for(var i = 0; i < detail.value.examineList.length; i++){
    if(detail.value.examineList[i].state === null){
      nodeId = detail.value.examineList[i].id;
      break;
    }
  }
  return nodeId;
}

const signSuccess = () => {
  emits('success')
  closeDrawer();
}

</script>
<style lang="less" scoped>
.back-reson{
  height: 180px;
  padding: 16px;
  .main{
    display: flex;
  }
  span{
    width: 70px;
    &:before {
      display: inline-block;
      margin-right: 4px;
      color: #ff4d4f;
      font-size: 14px;
      font-family: SimSun, sans-serif;
      line-height: 1;
      content: '*';
    }
  }
  .hint{
    padding-left: 70px;
    color: #ff4d4f;
  }
}
.exaime{
  .tit{
    font-size: 16px;
    font-weight: 600;
    color: #1890ff;
    padding: 16px 0;
  }
  .name{
    color: #1890ff;
  }
  img{
    height: 80px;
    margin-left: 58px;
  }
  ul{
    padding-left: 20px;
    li{
      margin-bottom: 20px;
    }
  }
}
.btns{
  width: 100%;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}
</style>
