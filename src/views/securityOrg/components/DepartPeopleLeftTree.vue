<template>
  <a-card :bordered="false" style="height: 100%">
    <a-spin :spinning="loading">
      <a-input-search placeholder="请输入" style="margin-bottom: 10px" @search="onSearch" allowClear v-if="props.showSearch" />
      <!--组织机构树-->
     <div v-if="!treeReloading">
          <a-tree v-if="treeData.length > 0" class="dep-tree" style="padding: 10px" :showIcon="false" :multiple="false"
            v-model:selectedKeys="selectedKeys" :defaultExpandedKeys="expandedKeys" :tree-data="treeData"
            @select="onSelect" />
          <a-empty v-if="!treeData.length" />
        </div>
    </a-spin>
  </a-card>
</template>

<script lang="ts" setup>
  import { nextTick, ref } from 'vue';
  import { queryDepartTreeSync } from '/@/views/system/depart/depart.api';
  import { queryDepartTreeSyncNew } from '../demo.api';
  import { searchByKeywords } from '/@/views/system/departUser/depart.user.api';
  import { getEduOrgList } from '/@/api/common/api';

  // const prefixCls = inject('prefixCls');
  const emit = defineEmits(['select', 'rootTreeData']);
  const props = defineProps({
    showSearch: { type: Boolean, default: true }, 
    showLine: { type: Boolean, default: false }, 
    isNew:{type: Boolean, default: false},
    isScroll:{type: Boolean, default: true},
    isSecend:{type: Boolean, default: false}
  });
  const loading = ref<boolean>(false);
  // 部门树列表数据
  const treeData = ref<any[]>([]);
  // 当前展开的项
  const expandedKeys = ref<any[]>([]);
  // 当前选中的项
  const selectedKeys = ref<any[]>([]);
  // 树组件重新加载
  const treeReloading = ref<boolean>(false);
  // 当前选中的部门
  const currentDepart = ref<any>(null);
  // 搜索关键字
  const searchKeyword = ref('');

  // 加载顶级部门信息
  async function loadRootTreeData() {
    try {
      loading.value = true;
      treeData.value = [];
      let params = {
      level: '3',
    };
    const result = await getEduOrgList(params);
      if (Array.isArray(result)) {
        //二级过滤掉相关方
        result[0].children = result[0].children.filter(item => item.title !== '相关方单位');
        treeData.value = result;
      }
     
     if (expandedKeys.value.length === 0) {
      autoExpandParentNode();
    }else{
       let item = treeData.value[0];
      console.log('item', item);
      if (item) {
        // 默认选中第一个
        setSelectedKey(item.key, item);
      }
    }
    } finally {
      loading.value = false;
    }
  }
loadRootTreeData();

  // 加载子级部门信息
  async function loadChildrenTreeData(treeNode) {
    try {
      const result = props.isNew ? await queryDepartTreeSyncNew({pid: treeNode.dataRef.key}) : await queryDepartTreeSync({pid: treeNode.dataRef.key})
      if (result.length == 0) {
        treeNode.dataRef.isLeaf = true;
      } else {
        // ================================================企业信息管理：只能展开二级数据 - bagin
        if(props.isSecend){ // 这里判断是否有children，result就是children
          result.forEach(e => {
            e.isLeaf = true
          })
        }
        // =========================================================================== - end
        treeNode.dataRef.children = result;
        if (expandedKeys.value.length > 0) {
          // 判断获取的子级是否有当前展开的项
          let subKeys: any[] = [];
          for (let key of expandedKeys.value) {
            if (result.findIndex((item) => item.key === key) !== -1) {
              subKeys.push(key);
            }
          }
          if (subKeys.length > 0) {
            expandedKeys.value = [...expandedKeys.value];
          }
        }
      }
      treeData.value = [...treeData.value];
      
    } catch (e) {
      console.error(e);
    }
    return Promise.resolve();
  }

  // 自动展开父节点，只展开一级
  function autoExpandParentNode() {
    let item = treeData.value[0];
    if (item) {
      if (!item.isLeaf) {
        expandedKeys.value = [item.key];
        setSelectedKey(item.key, item); // 选中根节点
      }
      reloadTree();
    }
  }

  // 重新加载树组件，防止无法默认展开数据
  async function reloadTree() {
    await nextTick();
    treeReloading.value = true;
    await nextTick();
    treeReloading.value = false;
    
  }

  /**
   * 设置当前选中的行
   */
  function setSelectedKey(key: string, data?: object) {
    console.log('setSelectedKey', key, data);
    selectedKeys.value = [key];
    console.log('setSelectedKey', key, selectedKeys.value);
    if (data) {
      currentDepart.value = data;
      emit('select', data);
    }
  }

  // 搜索事件
  async function onSearch(value: string) {
    if (value) {
      try {
        loading.value = true;
        treeData.value = [];
        let result = await searchByKeywords({ keyWord: value });
        if (Array.isArray(result)) {
          treeData.value = result;
        }
        autoExpandParentNode();
      } finally {
        loading.value = false;
      }
    } else {
      loadRootTreeData();
    }
    searchKeyword.value = value;
  }

  // 树选择事件
  function onSelect(selKeys, event) {
    console.log('onSelect', selKeys, event);
    if (selKeys.length > 0 && selectedKeys.value[0] !== selKeys[0]) {
      setSelectedKey(selKeys[0], event.selectedNodes[0]);
    } else {
      // 这样可以防止用户取消选择
      setSelectedKey(selectedKeys.value[0],event.selectedNodes[0]);
    }
    emit('select', currentDepart.value);
  }

  defineExpose({
    loadRootTreeData,
  });
</script>
