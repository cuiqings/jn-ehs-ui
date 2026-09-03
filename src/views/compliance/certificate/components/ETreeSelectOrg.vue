<template>
  <a-tree-select
    v-model:value="value"
    style="width: 100%"
    :tree-data="treeData"
    tree-default-expand-all
    :show-checked-strategy="SHOW_PARENT"
    placeholder="请选择"
    :allowClear=false
    :rules= "[{ 'required': true, 'message': '请选择所属机构！'}]"
    tree-node-filter-prop="title"
    :disabled="isDisabled"
  />
</template>
<script lang="ts" setup>
  import {computed, ref, watch} from 'vue';
import { TreeSelect } from 'ant-design-vue';
import {defHttp} from "/@/utils/http/axios";
  import {useUserStore} from "/@/store/modules/user";
  import {propTypes} from "/@/utils/propTypes";
enum Api {
  url = '/jn/common/getLevelThreeDepartTreeBySecurity',
}

const SHOW_PARENT = TreeSelect.SHOW_PARENT;
const treeData = ref<any[]>([]);
const value = ref<string>('');

const isDisabled = ref<boolean>(false);
const props = defineProps({
  isDisabled: propTypes.bool.def(false),
  value: propTypes.string.def(''),
});
loadRoot();
//监听isDisabled变化
watch(
  () => props.isDisabled,
  (val) => {
    isDisabled.value = val;
  },
);
isDisabled.value = props.isDisabled;
watch(
  () => props.value,
  (val) => {
    value.value = val;
  },
);
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
      i.key = i.orgCode;
      i.label = i.departName;
      i.value = i.orgCode;
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
      i.key = i.orgCode;
      i.label = i.departName;
      i.value = i.orgCode;
      i.isLeaf = !!i.isLeaf;
      toData(i.children,i.isLeaf);
    }
  }
}
</script>

