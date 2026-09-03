<template>
  <div style="height: 100%">
    <a-row type="flex" style="height: calc(100vh - 98px)">
      <a-col :md="6" :sm="24" style="overflow: auto; height: 100%">
        <div style="margin: 10px 0 10px 10px; height: calc(100% - 20px)">
          <a-tree
            style="margin: 15px"
            v-if="!treeReloading"
            :clickRowToExpand="false"
            :treeData="treeData"
            :selectedKeys="selectedKeys"
            check-strictly
            :load-data="loadChildrenTreeData"
            :checkedKeys="checkedKeys"
            v-model:expandedKeys="expandedKeys"
            @select="onSelect"
          />
        </div>
      </a-col>
      <a-col :md="18" :sm="24">
        <!--引用表格-->
        <BasicTable @register="registerTable">
          <!--插槽:table标题-->
          <template #tableTitle>
            <a-button type="primary" preIcon="ant-design:export-outlined" @click="onExportXls"> 导出</a-button>
            <a-popconfirm title="全量同步是否同步?" @confirm="() => syncUserHand()">
              <a-button type="primary">用户手动同步</a-button>
            </a-popconfirm>
          </template>
          <!--操作栏-->
          <template #action="{ record }">
            <TableAction :actions="getTableAction(record)" />
          </template>
        </BasicTable>
      </a-col>
    </a-row>
  </div>
  <!--用户抽屉-->
  <UserDrawer @register="registerDrawer" @success="handleSuccess" />
</template>

<script lang="ts" name="system-user" setup>
  //ts语法
  import { ref, nextTick, onMounted } from 'vue';
  import { BasicTable, TableAction, ActionItem } from '/@/components/Table';
  import UserDrawer from './UserDrawer.vue';
  import { useDrawer } from '/@/components/Drawer';
  import { useListPage } from '/@/hooks/system/useListPage';
  import { columns, searchFormSchema } from './user.data';
  import { getExportUrl, updateUserInfoBatch, list } from './user.api';
  import { queryDepartTreeSync } from '../depart/depart.api';
  // 部门树列表数据
  const treeData = ref<any[]>([]);
  // 当前选中的项
  const checkedKeys = ref<any[]>([]);
  // 当前展开的项
  const expandedKeys = ref<any[]>([]);
  // 当前选中的项
  const selectedKeys: any = ref([]);
  // 树组件重新加载
  const treeReloading = ref<boolean>(false);
  //注册drawer
  const [registerDrawer, { openDrawer }] = useDrawer();

  // 列表页面公共参数、方法
  const { tableContext, onExportXls } = useListPage({
    designScope: 'user-list',
    tableProps: {
      title: '用户列表',
      api: list,
      columns: columns,
      size: 'small',
      showIndexColumn: true,
      formConfig: {
        schemas: searchFormSchema,
      },
      beforeFetch: (params) => {
        params.orgCode = selectedKeys.value[0];
        return params;
      },
      immediate: false,
      actionColumn: {
        width: 100,
      },
    },
    exportConfig: {
      name: '用户列表',
      url: getExportUrl,
    },
  });

  //注册table数据
  const [registerTable, { reload }] = tableContext;
  onMounted(async () => {
    await loadRootTreeData();
    reload();
  });
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
    } catch (e) {
      console.error(e);
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
   * 详情
   */
  async function handleDetail(record: Recordable) {
    openDrawer(true, {
      record,
      isUpdate: true,
      showFooter: false,
      tenantSaas: false,
    });
  }
  /**
   * 成功回调
   */
  function handleSuccess() {
    reload();
  }
  /**
   * 操作栏
   */
  function getTableAction(record): ActionItem[] {
    return [
      {
        label: '详情',
        onClick: handleDetail.bind(null, record),
      },
    ];
  }
  function syncUserHand() {
    updateUserInfoBatch({});
  }
</script>

<style scoped lang="less">
  :deep(.ant-tree) {
    height: 100%;
    overflow-y: auto;
  }
</style>
