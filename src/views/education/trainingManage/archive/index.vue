<template>
  <a-row :class="['p-4', `${prefixCls}--box`]" :gutter="10">
    <a-col :xl="5" :lg="8" :md="10" :sm="24" style="flex: 1">
      <a-card :bordered="false" style="height: 100%">
        <!--组织机构树-->
        <a-spin :spinning="treeReloading">
          <div v-if="!treeReloading">
            <a-tree
              v-if="treeData.length > 0"
              class="dep-tree"
              style="padding: 10px"
              :showIcon="false"
              :multiple="false"
              v-model:selectedKeys="selectedKeys"
              :defaultExpandedKeys="expandedKeys"
              :tree-data="treeData"
              @select="onSelect"
            />
            <a-empty v-if="!treeData.length" />
          </div>
        </a-spin>
      </a-card>
    </a-col>
    <a-col :xl="19" :lg="16" :md="14" :sm="24" style="flex: 1">
      <a-card :bordered="false" style="height: 100%">
        <!-- Add completion status indicators -->
        <a-row :gutter="16" class="mb-4">
          <a-col :span="12">
            <a-card :bordered="false" class="stats-card">
              <div class="completion-status">
                <div class="title">人员信息完成情况</div>
                <div class="stats-wrapper">
                  <div class="stats-item">
                    <span class="completed">{{ completionStats.personFinish || 0 }}</span>
                    <span class="label">完成</span>
                  </div>
                  <div class="stats-item">
                    <span class="uncompleted">{{ completionStats.personNotFinish || 0 }}</span>
                    <span class="label text-red">未完成</span>
                  </div>
                </div>
              </div>
            </a-card>
          </a-col>
          <a-col :span="12">
            <a-card :bordered="false" class="stats-card">
              <div class="completion-status">
                <div class="title">培训完成情况</div>
                <div class="stats-wrapper">
                  <div class="stats-item">
                    <span class="completed">{{ completionStats.trainFinish || 0 }}</span>
                    <span class="label">完成</span>
                  </div>
                  <div class="stats-item">
                    <span class="uncompleted">{{ completionStats.trainNotFinish || 0 }}</span>
                    <span class="label text-red">未完成</span>
                  </div>
                </div>
              </div>
            </a-card>
          </a-col>
        </a-row>
        <BasicTable @register="registerTable" :rowSelection="rowSelection">
          <template #tableTitle>
            <a-space>
              <a-button type="primary" preIcon="ant-design:export-outlined" v-auth="'trainArchival:export'" @click="onExportXls"
                >人员信息导出</a-button
              >

              <j-upload-button type="primary" preIcon="ant-design:import-outlined" v-auth="'trainArchival:import'" @click="onImportXls">
                人员信息导入
              </j-upload-button>
              <a-button type="primary" preIcon="ant-design:export-outlined" @click="exportRecord"> 下载导入模板 </a-button>
              <a-button
                type="primary"
                v-if="selectedRowKeys.length > 0"
                preIcon="ant-design:export-outlined"
                :loading="loading"
                @click="batchCreateArchive"
                >批量生成档案</a-button
              >
              <a-button type="primary" v-if="selectedRowKeys.length > 0" @click="checkSign(selectedRowKeys)">批量核查签字</a-button>
            </a-space>
          </template>
          <template #action="{ record }">
            <TableAction :actions="getTableAction(record)" />
          </template>
        </BasicTable>
      </a-card>
    </a-col>
  </a-row>
  <PersonModal @register="registerPersonModal" @success="reload" />
  <SelfSignModal @register="registerSelfSignModal" @success="reload" />
  <CheckSignModal @register="registerCheckSignModal" @success="onSuccess" />
  <WordDrawer @register="registerWordDrawer" />
</template>
<script lang="ts" setup name="edu-train-archive">
  import { ref, nextTick, computed, onMounted } from 'vue';
  import { BasicTable, TableAction } from '/@/components/Table';
  import { useModal } from '/@/components/Modal';
  import { useDrawer } from '/@/components/Drawer';
  import { downloadFileAll } from '/@/api/common/api';
  import PersonModal from './PersonModal.vue';
  import SelfSignModal from './SelfSignModal.vue';
  import CheckSignModal from './CheckSignModal.vue';
  import { columns, searchFormSchema } from './archive.data';
  import { list, getCompletionStats, getDownloadTemplateUrl, importUrl, exportUrl } from './archive.api';
  import { useListPage } from '/@/hooks/system/useListPage';
  import { getEduOrgList } from '/@/api/common/api';
  import { useUserStore } from '/@/store/modules/user';
  import { useMethods } from '/@/hooks/system/useMethods';
  import { dateFormat } from '/@/utils/common/compUtils';
  import { useMessage } from '/@/hooks/web/useMessage';
  import WordDrawer from './WordDrawer.vue';
  import dayjs from 'dayjs';
  const { createMessage } = useMessage();
  const showFooter = ref(true);
  const [registerPersonModal, { openModal: openPersonModal }] = useModal();
  const [registerSelfSignModal, { openModal: openSelfSignModal }] = useModal();
  const [registerCheckSignModal, { openModal: openCheckSignModal }] = useModal();
  const [registerWordDrawer, { openDrawer: openWordDrawer }] = useDrawer();
  const emit = defineEmits(['select', 'rootTreeData']);
  const userStore = useUserStore();
  const userinfo: any = computed(() => userStore.getUserInfo);

  const orgCode = userinfo.value.orgCode.length > 9 ? userinfo.value.orgCode.slice('0', '9') : userinfo.value.orgCode;
  const treeData = ref<any[]>([]);
  const treeReloading = ref(false);
  const selectedKeys = ref<string[]>([]);
  const expandedKeys = ref<string[]>([]);
  const currentDepart = ref<any>({});
  const completionStats = ref({
    personFinish: 0,
    personNotFinish: 0,
    trainFinish: 0,
    trainNotFinish: 0,
  });
  const loading = ref(false);
  // 列表页面公共参数、方法
  const { prefixCls, tableContext, onImportXls, onExportXls } = useListPage({
    tableProps: {
      title: '培训档案列表',
      api: list,
      columns: columns,
      formConfig: {
        schemas: searchFormSchema,
        labelWidth: 120,
        // 给查询条件添加默认值
        resetFunc: () => {
          const searchForm = getForm();
          searchForm.setFieldsValue({
            orgCode: orgCode,
          });
        },
      },
      showIndexColumn: true,
      actionColumn: {
        width: 160,
        fixed: 'right',
      },
      // 滑动
      scroll: { x: 1500 },
      //自定义默认排序
      defSort: {
        column: 'id',
        order: 'desc',
      },
    },
    importConfig: {
      url: importUrl,
      success: () => reload(),
    },
    exportConfig: {
      name: '培训人员信息-' + dateFormat(new Date(), 'yyyy-MM-dd'),
      url: exportUrl,
    },
  });
  const [registerTable, { reload, getForm }, { rowSelection, selectedRowKeys, selectedRows }] = tableContext;
  // 加载顶级部门信息
  async function loadRootTreeData() {
    try {
      treeReloading.value = true;
      treeData.value = [];
      let params = {
        level: '4',
        permission: '1',
      };
      const result = await getEduOrgList(params);
      if (Array.isArray(result)) {
        treeData.value = result;
      }
      if (treeData.value.length > 0) {
        const searchForm = getForm();
        searchForm.setFieldsValue({
          orgCode: treeData.value[0].key,
        });
      }
      if (expandedKeys.value.length === 0) {
        autoExpandParentNode();
      } else {
        if (selectedKeys.value.length === 0) {
          let item = treeData.value[0];
          if (item) {
            // 默认选中第一个
            setSelectedKey(item.key, item);
          }
        } else {
          emit('select', currentDepart.value);
        }
      }
      emit('rootTreeData', treeData.value);
      treeReloading.value = false;
    } finally {
      treeReloading.value = false;
    }
  }
  loadRootTreeData();

  /**
   * 设置当前选中的行
   */
  function setSelectedKey(key: string, data?: object) {
    console.log('setSelectedKey: ', key, data);
    // 查询条件
    const searchForm = getForm();
    searchForm.setFieldsValue({
      orgCode: key,
    });
    selectedKeys.value = [key];
    if (data) {
      currentDepart.value = data;
      emit('select', data);
    }
    reload();
  }

  // 树选择事件
  async function onSelect(selKeys, event) {
    console.log('select: ', selKeys, event);
    if (selKeys.length > 0 && selectedKeys.value[0] !== selKeys[0]) {
      setSelectedKey(selKeys[0], event.selectedNodes[0]);
    } else {
      // 这样可以防止用户取消选择
      setSelectedKey(selectedKeys.value[0], event.selectedNodes[0]);
    }
    // 查询右侧列表数据
    await getForm().setFieldsValue({
      orgCode: selKeys[0],
    });
    reload();
  }
  // 自动展开父节点，只展开一级
  function autoExpandParentNode() {
    let item = treeData.value[0];
    if (item) {
      if (!item.isLeaf) {
        expandedKeys.value = [item.key];
      }
      // 默认选中第一个
      setSelectedKey(item.key, item);
      reloadTree();
    } else {
      emit('select', null);
    }
  }

  // 重新加载树组件，防止无法默认展开数据
  async function reloadTree() {
    await nextTick();
    treeReloading.value = true;
    await nextTick();
    treeReloading.value = false;
  }
  async function exportRecord() {
    const { handleExportXls } = useMethods();
    let params = {};
    handleExportXls('批量导入培训档案人员信息模板', getDownloadTemplateUrl, params);
  }
  /**
   * 人员信息
   */
  function handlePersonInfo(record) {
    showFooter.value = true;
    openPersonModal(true, {
      isUpdate: true,
      record,
    });
  }
  /**
   * 批量生成档案
   */
  async function batchCreateArchive() {
    loading.value = true;
    try {
      await downloadFileAll('/edu/trainArchival/batchGenerate', `培训档案${dayjs(new Date()).format('YYYYMMDD')}.zip`, {
        id: selectedRowKeys.value.join(','),
      });
    } finally {
      selectedRowKeys.value = [];
      loading.value = false;
    }
  }
  function createArchive(record) {
    openWordDrawer(true, {
      record: { id: record.id },
    });
  }
  function checkUserPrem(record) {
    if (!userinfo.value.roleList.map((item) => item.roleCode).includes('verify_sign_user')) {
      return false;
    }
    if (record.userSign == null) {
      return false;
    }
    if (record.checkSign !== null) {
      return false;
    }
    if (userinfo.value.orgCode.includes('A04B01C11')) {
      return true;
    }
    return true;
  }
  /**
   * 操作栏
   */

  function getTableAction(record) {
    return [
      {
        label: '本人签字',
        onClick: selfSign.bind(null, record),
        ifShow: record.userSign == null && userinfo.value.id == record.userId,
      },
      {
        label: '核查签字',
        onClick: checkSign.bind(null, record),
        ifShow: checkUserPrem(record),
      },
      {
        label: '人员信息',
        onClick: handlePersonInfo.bind(null, record),
      },
      {
        label: '查看档案',
        onClick: createArchive.bind(null, record),
      },
      // {
      //   label: '查看word文档',
      //   onClick: previewWord.bind(null, record),
      // },
    ];
  }
  function selfSign(record) {
    openSelfSignModal(true, {
      record,
    });
  }
  function checkSign(record) {
    let id = '';
    if (Array.isArray(record)) {
      if (selectedRows.value.some((item) => item.userSign === null)) {
        return createMessage.warning('存在本人未签字的数据！');
      }
      if (selectedRows.value.some((item) => item.checkSign)) {
        return createMessage.warning('存在已核查签字的数据！');
      }
      id = record.join(',');
    } else {
      id = record.id;
    }
    openCheckSignModal(true, id);
  }
  // Load completion statistics
  const loadCompletionStats = async () => {
    try {
      const stats = await getCompletionStats({});
      completionStats.value = stats;
    } catch (error) {
      console.error('Failed to load completion stats:', error);
    }
  };
  const onSuccess = () => {
    selectedRowKeys.value = [];
    reload();
  };
  onMounted(() => {
    loadCompletionStats();
  });
</script>
<style lang="less" scoped>
  .archive-wrap {
    display: flex;
    width: 100%;

    .archive-fl {
      width: 300px;
      height: 100%;
      padding: 30px 15px;
    }

    .archive-ri {
      flex: 1;
      padding: 20px 0;
    }
  }

  :deep(.ant-card-body) {
    padding: 15px;
  }

  .stats-card {
    background-color: #e6f4ff; // 更纯净的淡蓝色背景，去掉紫色调

    :deep(.ant-card-body) {
      padding: 16px;
    }
  }

  .completion-status {
    text-align: center;

    .title {
      font-size: 16px;
      font-weight: bold;
      margin-bottom: 12px;
    }

    .stats-wrapper {
      display: flex;
      justify-content: center;
      gap: 24px;

      .stats-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;

        .completed,
        .uncompleted {
          font-size: 24px;
          font-weight: bold;
        }

        .completed {
          color: #000;
        }

        .uncompleted {
          color: #ff4d4f;
        }

        .label {
          font-size: 14px;

          &.text-red {
            color: #ff4d4f;
          }
        }
      }
    }
  }

  .completion-notes {
    .text-warning {
      color: #faad14;
      margin: 0;
      font-size: 12px;
    }
  }

  .mb-4 {
    margin-bottom: 16px;
  }

  .mt-2 {
    margin-top: 8px;
  }

  .operation-buttons {
    display: flex;
    justify-content: flex-end;
    padding: 0 8px;
  }
</style>
