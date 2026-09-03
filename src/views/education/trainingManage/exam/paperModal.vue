<template>
  <div>
    <BasicModal v-bind="$attrs" @register="registerModal" :width="800" :bodyStyle="{ padding: '10px 20px 0 0' }" title="选择试卷" destroyOnClose>
      <div style="display: flex; align-items: center; gap: 16px; padding: 0 0 10px 20px">
        <span style="white-space: nowrap">创建单位：</span>
        <a-select
          v-model:value="orgCode"
          placeholder="请选择"
          allowClear
          show-search
          option-filter-prop="label"
          :options="orgOptions"
          style="width: 200px"
          @change="onSearch"
        />
        <span style="white-space: nowrap">搜索名称：</span>
        <a-input-search
          v-model:value="paperName"
          placeholder="请输入"
          enter-button
          style="width: 250px"
          @search="onSearch"
        />
      </div>
      <div class="modalinner">
        <div class="left">
          <!-- <a-tree
            v-model:checkedKeys="checkedKeys"
            @select="treeSelectDepart"
            :fieldNames="{ title: 'title', key: 'code', children: 'children' }"
            :tree-data="treeData"
          ></a-tree> -->
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
          <a-table
            rowKey="id"
            :columns="columns"
            :row-selection="rowSelection"
            :data-source="dataSource"
            :pagination="pagination"
            :loading="loading"
            @change="handleTableChange"
          >
            <template #paperName="{ record }">
              <div
                style="overflow: hidden; white-space: nowrap; text-overflow: ellipsis; word-break: keep-all; width: 488px"
                :title="record.paperName"
              >
                <Icon icon="mingcute:paper-fill" style="color: #1890ff" />
                {{ record.paperName }}
              </div></template
            >
          </a-table>
        </div>
      </div>
      <template #footer>
        <div style="text-align: center">
          <a-button style="margin-right: 15px" @click="close">取消</a-button>
          <a-button v-if="showOkBtn" type="primary" :loading="loading" @click="confirmClose">确定</a-button>
        </div>
      </template>
    </BasicModal>
  </div>
</template>
<script lang="ts" name="evaluate-fun-modal" setup>
  import { ref, onMounted, computed } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { getExamPaper, getDeptNew, add, edit, getDepart3ListWithSecurity } from './url/index';
  import type { TableProps, TableColumnType } from 'ant-design-vue';
  import { loadTreeRoot } from './url/index';
  const emit = defineEmits(['success']);
  const showOkBtn = ref(true);
  const loading = ref(false);

  // 搜索条件
  const paperName = ref('');
  const orgCode = ref<string | undefined>(undefined);
  const orgOptions = ref<{ label: string; value: string }[]>([]);

  // 加载创建单位下拉数据
  const loadOrgOptions = async () => {
    try {
      const res = await getDepart3ListWithSecurity();
      if (Array.isArray(res)) {
        orgOptions.value = res.map((item: any) => ({ label: item.departName, value: item.orgCode }));
      }
    } catch (e) {
      console.error(e);
    }
  };
  onMounted(() => {
    loadOrgOptions();
  });

  // 当前展开的项
  const expandedKeys = ref<any[]>([]);
  const dataSource = ref([]);

  const [registerModal, { closeModal }] = useModalInner(async ({value: data}) => {
    paperName.value = '';
    orgCode.value = undefined;
    queryParams.value.pageNo = 1;
    getExam();
    loadRootTreeData();
    selectedRowKeys.value = [];
    chooseResult.value = {};
    if (data.examPaperId) {
      selectedRowKeys.value = [data.examPaperId];
      chooseResult.value = {
        id: data.examPaperId,
        paperName: data.examPaperName,
      };
    }
  });

  const chooseResult = ref<any>();
  const selectedRowKeys = ref<any[]>([]);
  const rowSelection = computed((): TableProps['rowSelection'] => {
    return {
      type: 'radio',
      selectedRowKeys: selectedRowKeys.value, // 绑定响应式的 key
      onChange: (_selectedRowKeys: string[], selectedRows: any[]) => {
        selectedRowKeys.value = _selectedRowKeys; // 只会包含一个选中的 key
        chooseResult.value = selectedRows[0]; // 保存选中的行
      },
    };
  });

  const columns = [
    {
      title: '试卷名称',
      dataIndex: 'paperName',
      width: '100%',
      slots: { customRender: 'paperName' },
    },
  ];

  const treeSelectDepart = (v) => {
    queryParams.value.category = v[0];
    getExam();
  };
  const total = ref(0);
  const pagination = computed(() => ({
    total: total.value,
    current: queryParams.value.pageNo,
    pageSize: queryParams.value.pageSize,
  }));

  const queryParams = ref({
    category: '',
    pageNo: 1,
    pageSize: 10,
  });

  const getExam = () => {
    getExamPaper({
      ...queryParams.value,
      paperName: paperName.value || undefined,
      orgCode: orgCode.value || undefined,
    }).then((res) => {
      dataSource.value = res.records;
      total.value = res.total;
    });
  };

  const onSearch = () => {
    queryParams.value.pageNo = 1;
    getExam();
  };
  // 当前选中的项
  const selectedKeys: any = ref([]);
  const treeData = ref<any[]>([]);
  // 类型
  const loadRootTreeData = async () => {
    try {
      treeData.value = [];
      const result = await loadTreeRoot({
        async: false,
        pcode: 'A02',
      });
      if (Array.isArray(result)) {
        treeData.value = result;
        treeData.value.unshift({
          title: '全部',
          key: '',
          code: '',
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
  // 默认选中
  const setSelectedKey = (key: string) => {
    selectedKeys.value = [key];
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
    queryParams.value.category = selectedKeys.value[0];
    queryParams.value.pageNo = 1;
    getExam();
  };

  const handleTableChange = ({ current }) => {
    queryParams.value.pageNo = current;
    getExam();
  };

  const close = () => {
    closeModal();
  };
  const confirmClose = async () => {
    emit('success', chooseResult.value);
  };
  // 选择试卷
  const openExamConfig = () => {};
</script>
<style lang="less" scoped>
  .modalinner {
    display: flex;
    .left {
      width: 200px;
    }
    .right {
      flex: 1;
    }
  }
</style>
