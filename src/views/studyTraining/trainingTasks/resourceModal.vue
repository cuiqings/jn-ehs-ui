<template>
  <div>
    <BasicModal v-bind="$attrs" @register="registerModal" :width="950" :bodyStyle="{ padding: '10px' }" title="资源素材库" destroyOnClose>
      <a-tabs v-model:activeKey="activeKey" size="size" @change="changeTabs">
        <a-tab-pane v-for="item in tabsPanes" :key="item.key" :tab="item.title">
          <div class="modalinner">
            <div class="left">
              <a-directory-tree
                style="margin: 15px"
                selectable
                draggable
                :treeData="treeData"
                :selectedKeys="selectedKeys"
                check-strictly
                v-model:expandedKeys="expandedKeys"
                @select="onSelect"
              >
                <template #icon="{ expanded, isLeaf }">
                  <template v-if="expanded && !isLeaf">
                    <FolderOpenOutlined />
                  </template>
                  <template v-else>
                    <FolderOutlined />
                  </template>
                </template>
              </a-directory-tree>
            </div>
            <div class="right">
              <div style="margin-bottom: 10px">
                <a-input-search v-model:value="name" placeholder="请输入" enter-button @search="onSearch" />
              </div>
              <a-table
                rowKey="id"
                :columns="activeKey === 'DOCUMENT' ? columns2 : columns1"
                :row-selection="rowSelection"
                :data-source="dataSource"
                :pagination="pagination"
                :loading="loading"
                @change="handleTableChange"
              >
                <template #name="{ record }">
                  <div style="overflow: hidden; white-space: nowrap; text-overflow: ellipsis; word-break: keep-all" :title="record.name">
                    <Icon icon="vscode-icons:file-type-word" v-if="record.fileType == 'doc' || record.fileType == 'docx'" />
                    <Icon icon="bi:file-earmark-pdf" :style="{ color: 'red' }" v-else-if="record.fileType == 'pdf'" />
                    <Icon
                      icon="icon-park-outline:file-pdf"
                      :style="{ color: 'red' }"
                      v-else-if="record.fileType == 'ppt' || record.fileType == 'pptx'"
                    />
                    <Icon icon="fluent:video-clip-28-filled" style="color: #1890ff" v-else-if="record.fileType == 'mp4'" />
                    <Icon
                      icon="teenyicons:audio-document-outline"
                      style="color: red"
                      v-else-if="['mp3', 'aac', 'wav', 'wma'].includes(record.fileType)"
                    />
                    {{ record.name }}
                  </div>
                </template>
              </a-table>
            </div>
          </div>
        </a-tab-pane>
      </a-tabs>
      <template #footer>
        <div style="text-align: center">
          <a-button style="margin-right: 15px" @click="close">取消</a-button>
          <a-button v-if="showOkBtn" type="primary" :loading="loading" @click="confirmClose">确定</a-button>
        </div>
      </template>
    </BasicModal>
  </div>
</template>
<script lang="ts" name="resource-modal" setup>
  import { ref, computed } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import type { TableProps } from 'ant-design-vue';
  import { list, loadTreeData } from '../resourceManage/url/index';
  import { useUserStore } from '/@/store/modules/user';
  const userStore: any = useUserStore();
  const loginInfo = computed(() => userStore.getLoginInfo);
  const emit = defineEmits(['success']);
  const showOkBtn = ref(true);
  const loading = ref(false);
  const dataSource: any = ref([]);
  const name = ref('');
  const selectedRowKeys1: any = ref([]);
  const selectedRowKeys3: any = ref([]);
  const selectedRows1: any = ref([]);
  const selectedRows3: any = ref([]);
  // 部门树列表数据
  const treeData = ref<any[]>([]);
  // 当前展开的项
  const expandedKeys = ref<any[]>([]);
  // 当前选中的项
  const selectedKeys: any = ref([]);
  const activeKey = ref('VIDEO');
  const tabsPanes = ref<any[]>([
    {
      title: '视频',
      key: 'VIDEO',
    },
    {
      title: '文档',
      key: 'DOCUMENT',
    },
  ]);
  const total = ref(0);
  const pagination = computed(() => ({
    total: total.value,
    current: queryParams.value.pageNo,
    pageSize: queryParams.value.pageSize,
  }));

  const queryParams = ref({
    pageNo: 1,
    pageSize: 10,
  });
  // 课时要求
  const courseConfig = ref(0);
  const [registerModal, { closeModal }] = useModalInner(async (data) => {
    activeKey.value = 'VIDEO';
    queryParams.value.pageNo = 1;
    queryParams.value.pageSize = 10;
    name.value = '';
    loadRootTreeData();
    initList();
    selectedRowKeys1.value = [];
    selectedRowKeys3.value = [];
    selectedRows1.value = [];
    selectedRows3.value = [];
    courseConfig.value = data.courseConfig;
    /**
     * type 1 视频 2 文档
     */
    if (data.course && data.course?.length > 0) {
      selectedRows1.value = data.course
        .filter((item) => item.type === '1')
        .map((item) => {
          return {
            id: item.id,
            duration: item.duration,
            name: item.name,
          };
        });
      selectedRowKeys1.value = selectedRows1.value.map((item) => item.id);
      selectedRows3.value = data.course
        .filter((item) => item.type === '2')
        .map((item) => {
          return {
            id: item.id,
            duration: item.duration,
            name: item.name,
          };
        });
      selectedRowKeys3.value = selectedRows3.value.map((item) => item.id);
    }
  });
  // 默认选中
  const setSelectedKey = (key: string) => {
    selectedKeys.value = [key];
  };
  // 类型
  const loadRootTreeData = async () => {
    try {
      treeData.value = [];
      const result = await loadTreeData({
        async: false,
        pcode: 'A02',
      });
      if (Array.isArray(result)) {
        treeData.value = result;
        treeData.value.unshift({
          title: '全部',
          key: '0',
          code: '0',
          children: [],
        });
        processTreeData(treeData.value);
      }
      if (expandedKeys.value.length === 0) {
        autoExpandParentNode();
      } else {
        if (selectedKeys.value.length === 0) {
          const item = treeData.value[0];
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
  const processTreeData = (data) => {
    return data.map((item) => {
      // 递归处理子节点
      if (item.children && item.children.length > 0) {
        item.children = processTreeData(item.children);
      }
      item.key = item.code;
      return item;
    });
  };
  // 自动展开父节点，只展开一级
  const autoExpandParentNode = () => {
    const item = treeData.value[0];
    if (item) {
      if (!item.isLeaf) {
        expandedKeys.value = [item.key];
      }
      // 默认选中第一个
      setSelectedKey(item.key);
    }
  };
  // 树选择事件
  const onSelect = (selKeys) => {
    if (selKeys.length > 0 && selectedKeys.value[0] !== selKeys[0]) {
      setSelectedKey(selKeys[0]);
    } else {
      // 这样可以防止用户取消选择
      setSelectedKey(selectedKeys.value[0]);
    }
    queryParams.value.pageNo = 1;
    initList();
  };
  const rowSelection = computed((): TableProps['rowSelection'] => {
    return {
      type: 'checkbox',
      preserveSelectedRowKeys: true,
      selectedRowKeys: activeKey.value === 'VIDEO' ? selectedRowKeys1.value : selectedRowKeys3.value, // 绑定响应式的 key
      onChange: (_selectedRowKeys: string[], selectedRows: any[]) => {
        // 更新全局选中 keys（包括当前页和其他页）
        updateSelectedKeys(_selectedRowKeys, selectedRows);
      },
    };
  });
  // 更新全局选中 keys
  const updateSelectedKeys = (currentSelectedKeys, selectedRows) => {
    if (activeKey.value === 'VIDEO') {
      selectedRowKeys1.value = currentSelectedKeys;
      selectedRows1.value = selectedRows;
    } else {
      selectedRowKeys3.value = currentSelectedKeys;
      selectedRows3.value = selectedRows;
    }
  };
  const columns1 = [
    {
      title: () => '视频名称',
      align: 'left',
      dataIndex: 'name',
      ellipsis: true,
      slots: { customRender: 'name' },
    },
    {
      title: '视频时长',
      align: 'center',
      dataIndex: 'duration',
      customRender: ({ record }) => formatDuration(record.duration),
    },
  ];
  const columns2 = [
    {
      title: '文档名称',
      align: 'left',
      dataIndex: 'name',
      ellipsis: true,
      slots: { customRender: 'name' },
    },
    {
      title: '文档类型',
      align: 'center',
      width: 100,
      dataIndex: 'fileType',
    },
    {
      title: '最少观看时间',
      align: 'center',
      width: 160,
      dataIndex: 'duration',
      customRender: ({ text }) => {
        return text + '分';
      },
    },
  ];
  // 表格数据初始化
  const initList = () => {
    loading.value = true;
    dataSource.value = [];
    list({
      category: selectedKeys.value[0] === '0' ? undefined : selectedKeys.value[0],
      type: activeKey.value,
      name: name.value,
      orgCode: loginInfo.value.userInfo.orgCode,
      ...queryParams.value,
    })
      .then((res) => {
        if (activeKey.value === 'DOCUMENT') {
          dataSource.value = res.records.map((item) => {
            item.duration = selectedRows3.value.filter((i) => i.id === item.id)[0]?.duration || 0;
            return item;
          });
        } else {
          dataSource.value = res.records;
        }
        total.value = res.total;
      })
      .finally(() => {
        loading.value = false;
      });
  };
  const handleTableChange = ({ current }) => {
    queryParams.value.pageNo = current;
    initList();
  };
  const changeTabs = (value) => {
    activeKey.value = value;
    queryParams.value.pageNo = 1;
    initList();
  };
  const close = () => {
    closeModal();
  };
  const confirmClose = async () => {
    emit('success', reorganizationInfo());
    close();
  };
  const reorganizationInfo = () => {
    const videoArr = selectedRows1.value.map((item) => {
      return {
        id: item.id,
        type: '1',
        name: item.name,
        duration: item.duration,
      };
    });
    const totalDuration = videoArr.reduce((sum, item) => sum + (item.duration || 0), 0);
    const time = courseConfig.value * 45 * 60;
    const documentArr = selectedRows3.value.map((item) => {
      const duration = time - totalDuration < 0 ? 0 : Math.ceil((time - totalDuration) / selectedRows3.value.length / 60);
      return {
        id: item.id,
        type: '2',
        name: item.name,
        duration,
      };
    });
    const arr = [...videoArr, ...documentArr];
    return arr;
  };
  // 转换视频时长
  const formatDuration = (duration: number) => {
    const h = Math.trunc(duration / 3600);
    const m = Math.trunc((duration % 3600) / 60);
    const s = Math.trunc((duration % 3600) % 60);
    return `${h ? `${h}:` : ''}${m >= 10 ? `${m}:` : `0${m}:`}${s >= 10 ? `${s}` : `0${s}`}`;
  };
  const onSearch = () => {
    initList();
  };
</script>
<style lang="less" scoped>
  .modalinner {
    display: flex;
    .left {
      width: 300px;
    }
    .right {
      flex: 1;
    }
  }
  :deep(.ant-table-tbody) > tr > td {
    padding: 10px 16px !important;
  }
</style>
<style scoped lang="less">
  :deep(.ant-tree) {
    height: 100%;
    overflow-y: auto;
    .ant-tree-iconEle {
      display: none !important;
    }
  }
</style>
