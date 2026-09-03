<template>
  <BasicModal :title="title" :width="924" v-bind="$attrs" @ok="handleOk" @register="registerModal" :canFullscreen="false" :closeFunc="closeFunc">
    <div class="content-box">
      <div class="left">
        <div class="left-1">
          <DepartPeopleLeftTree :isNew="true" @select="onTreeSelect" @rootTreeData="onRootTreeData"  />
        </div>
        <a-spin :spinning="spinning">
          <div class="left-2">
            <div class="title">{{ departName }}</div>
            <div class="allpeople scrollstyle otherScroll">
              <a-checkbox-group v-model:value="allvalue" @change="changeCheck" v-if="allpeopleArr.length !== 0">
                <a-row v-for="(item, index) in allpeopleArr" :key="index">
                  <a-col :span="24">
                    <a-checkbox :value="item.workNo" :disabled="item.disabled">
                      <span class="span1">{{ item.realname }}</span> 
                      <span class="span2">{{ item.workNo }}</span>
                    </a-checkbox>
                  </a-col>
                </a-row>
              </a-checkbox-group>
              <span v-else>暂无可选人员信息</span>
            </div>
          </div>
        </a-spin>
      </div>
      <div class="right">
        <div class="title">
          已选{{ selectedpeopleArr.length }}项
          <span style="float: right;" @click="clearnAll">清空</span>
        </div>
        <div class="selectedpeople scrollstyle otherScroll">
          <div class="selectedpeople-item" v-for="(e,i) in selectedpeopleArr" :key="i">
            <span class="span1">{{ e.realname }}</span>
            <span class="span2">{{ e.workNo }}</span>
            <span class="span3" @click="delcur(e,i)">×</span>
          </div>
        </div>
      </div>
    </div>          
  </BasicModal>
</template>

<script lang="ts" setup>
  import { ref, unref, onMounted } from 'vue';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import DepartPeopleLeftTree from './components/DepartPeopleLeftTree.vue'
  import {getSelectPeople} from './demo.api'
  const { createMessage: $message } = useMessage();
  const emit = defineEmits(['success', 'register']);
  const props = defineProps({
    ifMul: { type: Boolean, default: false }, // 单选:false  多选:true
  });
  const spinning = ref<boolean>(false);
  // 当前选中的部门信息
  const departData = ref({});
  const rootTreeData = ref<any[]>([]);
  // 当前是否是更新模式
  const isUpdate = ref<boolean>(false);
  const title = '选择人员'
  const allvalue = ref<any>([])
  const departName = ref<string>('')
  let allpeopleArr = ref<any>([])
  let selectedpeopleArr = ref<any>([])
  // 注册弹窗
  const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
    isUpdate.value = unref(data?.isUpdate);
  });

  // 提交事件
  async function handleOk() {
    try {
      //提交表单
      if(selectedpeopleArr.value.length === 0){
        $message.warning('请选择人员！') 
        return
      }
      //返回人员信息
      emit('success',selectedpeopleArr);
    } finally {
      //关闭弹窗
      closeModal();
      setModalProps({ confirmLoading: false });
    }
  }
  // 清空
  function clearnAll(){
    selectedpeopleArr.value = []
    allvalue.value = []
    clearnDis()
  }
  // 删除
  function delcur(_e,i){
    selectedpeopleArr.value.splice(i,1)
    routeRandL()
    clearnDis()
  }
  // 右已选项和左已选项对应
  function routeRandL(){
    allvalue.value = []
    selectedpeopleArr.value.forEach((e)=>{
      allvalue.value.push(e.workNo)
    })
  }
  // 清空禁用
  function clearnDis(){
    allpeopleArr.value.forEach((ea)=>{
      ea.disabled = false
    })
  }
  // 多选框选择
  function changeCheck(e){
    selectedpeopleArr.value = []
    clearnDis()
    e.forEach((ee)=>{
      allpeopleArr.value.filter((ef)=>{
        if(ee === ef.workNo){
          selectedpeopleArr.value.push(ef)
        }
      })
      if(!props.ifMul){  // 单选
        allpeopleArr.value.forEach((ea)=>{
          if(ee === ea.workNo){
            ea.disabled = false
          }else{
            ea.disabled = true
          }
        })
      }
    })
  }
  // 关闭弹窗函数
  function closeFunc(){
    allvalue.value = []
    selectedpeopleArr.value = []
    clearnDis()
    return true
  }
  
  // 左侧树选择后触发
  function onTreeSelect(data) {
    departData.value = data;
    departName.value = data.departName
    spinning.value = true;
    getPeople(data.orgCode)
  }
  // 左侧树rootTreeData触发
  function onRootTreeData(data) {
    rootTreeData.value = data;
  }
  // 获取选中部门的全部人员
  async function getPeople(orgCode){
    allvalue.value = []
    selectedpeopleArr.value = []
    allpeopleArr.value = []
    try {
      let res = await getSelectPeople({ orgCode: orgCode, pageSize:9999 })
      allpeopleArr.value = res.records
    } finally {
      spinning.value = false;
    }
  }
  
</script>
<style lang="less" scoped>
.content-box{
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 30px 0;
  .left{
    height: 434px;
    border-radius: 4px 4px 4px 4px;
    opacity: 1;
    border: 1px solid rgba(0,0,0,0.16);
    display: flex;
    &-1{
      width: 250px;
      border-right: 1px solid rgba(0,0,0,0.16)
    }
    &-2{
      width: 300px;
      padding: 14px 24px;
      .title{
        font-size: 14px;
        color: rgba(0,0,0,0.38);
        margin-bottom: 25px;
      }
      .allpeople{
        /deep/.ant-row{
          margin-bottom: 22px;
        }
        .span1{
            color: rgba(0,0,0,0.87);
            margin-right: 8px;
          }
          .span2{
            color: rgba(0,0,0,0.6);
          }
      }
    }
  }
  .right{
    width: 299px;
    height: 434px;
    border-radius: 4px 4px 4px 4px;
    opacity: 1;
    border: 1px solid rgba(0,0,0,0.16);
    padding: 14px 16px;
    .title{
        font-size: 14px;
        color: rgba(0,0,0,0.38);
        margin-bottom: 25px;
        span{
          color: #0091FF;
          cursor: pointer;
        }
      }
      .selectedpeople{
        &-item{
          width: calc(100% - 4px);
          height: 30px;
          line-height: 30px;
          padding: 0 8px;
          background: rgba(0,0,0,0.05);
          border-radius: 4px 4px 4px 4px;
          opacity: 1;
          font-size: 14px;
          margin-bottom: 10px;
          .span1{
            color: rgba(0,0,0,0.87);
            margin-right: 8px;
          }
          .span2{
            color: rgba(0,0,0,0.6);
          }
          .span3{
            color: rgba(0,0,0,0.87);
            float: right;
            display: inline-block;
            font-size: 18px;
            cursor: pointer;
          }
        }
      }
  }
}
/deep/.scrollstyle{
  max-height: 360px;
  overflow-y: auto;
}
/deep/.otherScroll::-webkit-scrollbar {
    width: 4px;
    /*滚动条宽度*/
    background: none;
    /*去除滚动条背景设置*/
}
/deep/.otherScroll::-webkit-scrollbar-thumb {
    background-color: #3E87F8;
    /*滚动条颜色*/
    border-radius: 5px;
}
/deep/.otherScroll::-webkit-scrollbar-track {
    background-color: #e0e0e0;
}
</style>
