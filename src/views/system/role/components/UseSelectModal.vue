<template>
  <BasicModal v-bind="$attrs" @register="registerModal" title="用户选择列表" width="1600px" destroyOnClose @ok="handleSubmit">
    <div>
      <a-row type="flex" style="height: 630px">
        <a-col :md="6" :sm="24" style="overflow: auto; height: 100%">
          <a-tree
            style="margin: 15px"
            v-if="!treeReloading"
            :clickRowToExpand="false"
            :treeData="treeData"
            :selectedKeys="selectedKeys"
            check-strictly
            :load-data="loadChildrenTreeData"
            :checkedKeys="checkedKeys1"
            v-model:expandedKeys="expandedKeys"
            @select="onSelect"
          />
        </a-col>
        <a-col :md="18" :sm="24">
          <BasicTable @register="registerTable" :rowSelection="rowSelection" />
        </a-col>
      </a-row>
    </div>
  </BasicModal>
</template>
<script lang="ts" setup>
  import { ref, unref, toRaw, nextTick } from 'vue';
  import { BasicModal, useModalInner } from '/src/components/Modal';
  import { BasicTable, useTable } from '/src/components/Table';
  import { userColumns, searchUserFormSchema } from '../role.data';
  import { list } from '../../user/user.api';
  import { queryDepartTreeSync } from '../../depart/depart.api';
  // 声明Emits
  const emit = defineEmits(['select', 'register']);
  const checkedKeys = ref<Array<string | number>>([]);
  // 部门树列表数据
  const treeData = ref<any[]>([]);
  // 当前选中的项
  const checkedKeys1 = ref<any[]>([]);
  // 当前展开的项
  const expandedKeys = ref<any[]>([]);
  // 当前选中的项
  const selectedKeys = ref<any[]>([]);
  // 树组件重新加载
  const treeReloading = ref<boolean>(false);
  const [registerModal, { setModalProps, closeModal }] = useModalInner(async () => {
    checkedKeys.value = [];
    await loadRootTreeData();
    await reload();
  });
  //注册table数据
  const [registerTable, { reload }] = useTable({
    api: list,
    rowKey: 'id',
    columns: userColumns,
    formConfig: {
      labelWidth: 60,
      schemas: searchUserFormSchema,
      baseRowStyle: { maxHeight: '20px' },
      autoSubmitOnEnter: true,
    },
    beforeFetch: (params) => {
      params.orgCode = selectedKeys.value[0];
      return params;
    },
    immediate: false,
    striped: true,
    useSearchForm: true,
    showTableSetting: false,
    bordered: true,
    showIndexColumn: false,
    canResize: false,
  });
  /**
   * 选择列配置
   */
  const rowSelection = {
    type: 'checkbox',
    columnWidth: 50,
    selectedRowKeys: checkedKeys,
    onChange: onSelectChange,
  };
  // 默认选中
  const setSelectedKey = (key: string) => {
    selectedKeys.value = [key];
  };
  const loadRootTreeData = async () => {
    try {
      treeData.value = [];
      const result = await queryDepartTreeSync();
      if (Array.isArray(result)) {
        treeData.value = result.map((item) => {
          item.key = item.orgCode;
          return item;
        });
      }
      if (expandedKeys.value.length === 0) {
        autoExpandParentNode();
      } else {
        if (selectedKeys.value.length === 0) {
          let item = treeData.value[0];
          if (item) {
            // 默认选中第一个
            setSelectedKey(item.key);
          }
        }
      }
    } finally {
    }
  };
  // 自动展开父节点，只展开一级
  const autoExpandParentNode = () => {
    let item = treeData.value[0];
    if (item) {
      if (!item.isLeaf) {
        expandedKeys.value = [item.key];
      }
      // 默认选中第一个
      setSelectedKey(item.key);
      reloadTree();
    }
  };
  // 重新加载树组件，防止无法默认展开数据
  const reloadTree = async () => {
    await nextTick();
    treeReloading.value = true;
    await nextTick();
    treeReloading.value = false;
  };
  // 加载子级部门信息
  const loadChildrenTreeData = async (treeNode) => {
    try {
      const result = await queryDepartTreeSync({
        pid: treeNode.dataRef.id,
      });
      if (result.length == 0) {
        treeNode.dataRef.isLeaf = true;
      } else {
        treeNode.dataRef.children = result.map((item) => {
          item.key = item.orgCode;
          return item;
        });
        if (expandedKeys.value.length > 0) {
          // 判断获取的子级是否有当前展开的项
          let subKeys: any[] = [];
          for (let key of expandedKeys.value) {
            if (result.findIndex((item) => item.id === key) !== -1) {
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
  };
  // 树选择事件
  const onSelect = (selKeys) => {
    if (selKeys.length > 0 && selectedKeys.value[0] !== selKeys[0]) {
      setSelectedKey(selKeys[0]);
    } else {
      // 这样可以防止用户取消选择
      setSelectedKey(selectedKeys.value[0]);
    }
    reload();
  };
  /**
   * 选择事件
   */
  function onSelectChange(selectedRowKeys: (string | number)[]) {
    checkedKeys.value = selectedRowKeys;
  }

  //提交事件
  function handleSubmit() {
    setModalProps({ confirmLoading: true });
    //关闭弹窗
    closeModal();
    //刷新列表
    emit('select', toRaw(unref(checkedKeys)));
    setModalProps({ confirmLoading: false });
  }
</script>
