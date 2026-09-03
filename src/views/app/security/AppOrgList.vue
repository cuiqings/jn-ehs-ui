<template>
  <a-card>
    <a-spin :spinning="loading">
      <div style="width: 100%;margin-bottom: 8px;">
        <a-input
          style="width: 70%; margin-right: 8px"
          placeholder="输入人员姓名查询"
          v-model:value="searchValue"
          :allowClear="true"
        />
        <a-button type="primary" @click="handleSearch" preIcon="ant-design:search-outlined" style="width:26%"> 查询 </a-button>
      </div>

      <!--组织机构-->
      <a-tree
        show-icon
        defaultExpandAll
        v-if="treeDataSource.length"
        selectable
        checkStrictly
        v-model:expandedKeys="expandedKeys"
        v-model:selectedKeys="selectedKeys"
        :dropdownStyle="{ maxHeight: '200px', overflow: 'auto' }"
        :tree-data="treeDataSource"
        :expandAction="false"
        @select="handleTreeSelect"
      > 
        <template #icon="{ dataRef }">
          <template v-if="dataRef.objectType === 'user'">
            <img style="width: 16px; height: 16px;margin-top: 5px;" src="../../../assets/app/app-user.png"/>
          </template>
          <template v-else>
            <img style="width: 16px; height: 16px;margin-top: 4px;" src="../../../assets/app/app-depart.png"/>
          </template>
        </template>
        <template #title="{ dataRef }">
          <template v-if="dataRef.objectType === 'user'">
            {{ dataRef.safetyManagementPost }}--{{ dataRef.title }}
          </template>
          <template v-else>
            {{ dataRef.title }}
          </template>
        </template>
      </a-tree>
      <div v-else class="tr-nodata">
        <span>暂无数据</span>
      </div>
    </a-spin>
  </a-card>
</template>

<script setup lang="ts">
import {ref} from "vue"
import { useRouter, useRoute } from 'vue-router';
import { queryAlltree } from './demo.api';
const treeDataSource = ref<any[]>([])
const selectedKeys = ref<any[]>([])
const loading = ref<boolean>(false)
const searchValue = ref<string>('')
const expandedKeys = ref([])
// 获取路由器对象 href跳转用到
let router = useRouter();

// 初始化获取树形结构数据
const queryTreeData = (async(str) => {
  let params = {
    searchStr:str
  }
  const res = await queryAlltree(params)
  if (Array.isArray(res)) {
    treeDataSource.value = res
    expandedKeys.value = getExpandData(treeDataSource.value, 1)
  }
})
queryTreeData('')

// 点击树节点
const handleTreeSelect = (selectedKeys, event) =>{
  console.log(selectedKeys, event);
  
  if(event.node.objectType === 'user'){
    router.push({ path: '/app/org/details', query: {id:event.node.id} })
  }
}
// 点击查询
const handleSearch = ()=>{
  console.log(searchValue.value,'searchValue.value==');
  queryTreeData(searchValue.value)
}

// 首次展开节点
const getExpandData = ((list, n)=>{
  let keys = []
  function bianliList(val_list, i) {
    if (i < n) {
      val_list.forEach(item => {
        keys.push(item.key)
        if (item.children && item.children.length){
          bianliList(item.children, i+1)
        }
      })
    }
  }
  bianliList(list, 0)
  console.log(keys,'keys');
  
  return keys
})

</script>

<style lang="less" scoped>
.tr-nodata {
  width: 100%;
  color: #999;
  line-height: 61px;
  text-align: center;
}
</style>