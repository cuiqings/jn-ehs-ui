<template>
  <a-tree-select
    v-model:value="value"
    style="width: 100%"
    :tree-data="treeData"
    allow-clear
    tree-default-expand-all
    :show-checked-strategy="SHOW_PARENT"
    placeholder="Please select"
    tree-node-filter-prop="title"
  />
</template>
<script lang="ts" setup>
import { ref, watch } from 'vue';
import { TreeSelect } from 'ant-design-vue';
import {defHttp} from "/@/utils/http/axios";
enum Api {
  url = '/jn/common/getDepartTreeBy23',
}

const SHOW_PARENT = TreeSelect.SHOW_PARENT;
const treeData = ref<any[]>([]);
const value = ref<string[]>([]);
loadRoot();
watch(value, () => {
  // console.log(value.value);
});


/**
 * 加载下拉树形数据
 */
async function loadRoot() {
  let params = {
  };
  let res = await defHttp.get({ url: Api.url, params }, { isTransformResponse: false });
  if (res.success && res.result) {
    for (let i of res.result) {
      i.key = i.orgCode+"~|~"+i.departName;
      i.value = i.orgCode+"~|~"+i.departName;
      i.isLeaf = !!i.isLeaf;
      if(!i.isLeaf){
        toData(i.children,i.isLeaf);
      }
    }
    treeData.value = [...res.result];
    console.log(treeData.value);
  } else {
    console.log('数根节点查询结果异常', res);
  }
}

function toData(children,isLeaf){
  if(!isLeaf){
    for(let i of children){
      i.key = i.orgCode+"~|~"+i.departName;
      i.value = i.orgCode+"~|~"+i.departName;
      i.isLeaf = !!i.isLeaf;
      toData(i.children,i.isLeaf);
    }
  }
}
</script>

