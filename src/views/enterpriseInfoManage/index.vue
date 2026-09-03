<template>
  <div class="jeecgcontainer">
    <div class="jeecgcontainer-left">
      <DepartPeopleLeftTree 
        @select="onTreeSelect" 
        @rootTreeData="onRootTreeData" 
        :showSearch="false" 
        :showLine="true" 
        :isNew="true" 
        :isScroll="false" 
        :isSecend="true"
      />
    </div>
    <div class="jeecgcontainer-right">
      <a-card :bordered="false">
        <a-tabs :size="`large`" v-model:activeKey="activeKey" :destroyInactiveTabPane="true">
          <a-tab-pane :tab="e.title" v-for="(e,i) in infoArr" :key="e.key">
            <component :is="e.component" :selectData="selectData"/>
          </a-tab-pane>
        </a-tabs>
      </a-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import DepartPeopleLeftTree from '/@/views/securityOrg/components/DepartPeopleLeftTree.vue'
import basicInfoForm from './basicInfoForm.vue'
import safeInfoForm from './safeInfoForm.vue'
import tradeInfoForm from './tradeInfoForm.vue'

import { ref, onMounted } from "vue"
const activeKey = ref('one');
// 当前选中的部门信息
const rootTreeData = ref<any[]>([]);
const selectData = ref({})
const infoArr = ref<any>([])
// 左侧树选择后触发
function onTreeSelect(data) {
  console.log('onTreeSelect', data);
  // 判断tab展示项
  if(data.key.length==3){  // 根节点-敬业集团
    activeKey.value = 'one'
    infoArr.value = [{
      title:'企业基础信息',
      key:'one',
      component:basicInfoForm,
    },{
      title:'安全生产基础信息',
      key:'two',
      component:safeInfoForm,
    },{
      title:'工贸企业基础信息',
      key:'three',
      component:tradeInfoForm,
    }]
  }else{ // 二、三级节点
    activeKey.value = 'one'
    infoArr.value = [{
      title:'企业基础信息',
      key:'one',
      component:basicInfoForm,
    },{
      title:'安全生产基础信息',
      key:'two',
      component:safeInfoForm,
    }]
  }
  data.orgCode = data.key;
  selectData.value = data
}
// 左侧树rootTreeData触发
function onRootTreeData(data) {
  rootTreeData.value = data;
}


onMounted(() => {});
</script>

<style lang="less" scoped>
.jeecgcontainer {
  display: flex;
  margin: 10px;
  background-color: #fff;
  &-left{
    border-right: 1px solid rgba(0,0,0,0.05);
    width: 15%;
  }
  &-right{
    width: 85%;
  }
}

/deep/input::-webkit-input-placeholder {
    font-size: 14px;
}
/deep/input::-moz-input-placeholder {
    font-size: 14px;
}
/deep/input::-ms-input-placeholder {
    font-size: 14px;
}
</style>
