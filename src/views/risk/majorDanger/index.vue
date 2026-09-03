<template>
  <div style="height: 100%">
    <a-row type="flex" style="height: calc(100vh - 98px)">
      <a-col :md="5" :sm="24" style="overflow: auto; height: 100%">
        <div style="margin: 10px 0 10px 10px; height: calc(100% - 20px)">
          <a-directory-tree
            style="margin: 15px"
            selectable
            draggable
            expand-action="dblclick"
            :treeData="treeData"
            :selectedKeys="selectedKeys"
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
      </a-col>
      <a-col :md="19" :sm="24">
        <basic-table @register="registerTable" :rowSelection="rowSelection">
          <template #tableTitle>
            <a-button preIcon="ant-design:plus-outlined" type="primary" v-auth="'majorDanger:add'" @click="handleAdd">上传文档</a-button>
            <a-button preIcon="ant-design:delete-outlined" v-auth="'majorDanger:del'" v-if="selectedRowKeys.length > 0" @click="batchHandleDelete">
              批量删除</a-button
            >
          </template>
          <template #name="{ record }">
            <a-tooltip>
              <template #title> {{ record.name }}</template>
              <Icon icon="vscode-icons:file-type-word" v-if="record.fileType == 'doc' || record.fileType == 'docx'" />
              <Icon icon="bi:file-earmark-pdf" :style="{ color: 'red' }" v-else-if="record.fileType == 'pdf'" />
              <Icon icon="icon-park-outline:file-pdf" :style="{ color: 'red' }" v-else-if="record.fileType == 'ppt' || record.fileType == 'pptx'" />
              {{ record.name }}
            </a-tooltip>
          </template>
          <template #action="{ record }">
            <table-action :actions="getActions(record)" />
          </template>
        </basic-table>
      </a-col>
    </a-row>
  </div>
  <draggerModal
    uploadText="将文档拖拽到此处上传"
    uploadHint="支持一次上传多个/支持word、ppt、pdf格式文档，大小在200MB以内。"
    title="上传文档"
    file-type="DOCUMENT"
    name="文档"
    :fileSize="200"
    :category="selectedKeys[0]"
    @register="registerModal"
    @success="handleSuccess"
  />
  <editModal labelText="修改" @register="registerEditModal" @success="handleSuccess" />
</template>
<script setup name="risk-majorDanger" lang="ts">
  import { BasicTable, TableAction, BasicColumn, FormSchema } from '/@/components/Table';
  import draggerModal from './draggerModal.vue';
  import editModal from './editModal.vue';
  import Icon from '/@/components/Icon';
  import { useListPage } from '/@/hooks/system/useListPage';
  import { useModal } from '/@/components/Modal';
  import { previewFile } from '/@/api/common/api';
  import { ref, onMounted } from 'vue';
  import { list, del, deleteBatch, loadTreeData } from './api';
  import { getFileAccessHttpUrl } from '/@/utils/common/compUtils';
  import { downloadFile } from '/@/utils/common/renderUtils';
  import { FolderOpenOutlined, FolderOutlined } from '@ant-design/icons-vue';
  const [registerModal, { openModal }] = useModal();
  const [registerEditModal, openEdit] = useModal();
  // 部门树列表数据
  const treeData = ref<any[]>([]);
  // 当前展开的项
  const expandedKeys = ref<any[]>([]);
  // 当前选中的项
  const selectedKeys: any = ref([]);
  const searchFormSchema: FormSchema[] = [
    {
      label: '文档名称',
      field: 'name',
      component: 'Input',
      colProps: { span: 6 },
    },
    {
      label: '创建时间',
      field: 'time',
      component: 'RangePicker',
      componentProps: {
        valueFormat: 'YYYY-MM-DD',
      },
      colProps: { span: 6 },
    },
    {
      label: '创建人',
      field: 'createUser',
      component: 'Input',
      colProps: { span: 6 },
    },
  ];
  const columns: BasicColumn[] = [
    {
      title: '文档名称',
      align: 'left',
      dataIndex: 'name',
      ellipsis: true,
      slots: { customRender: 'name' },
    },
    {
      title: '文档大小',
      align: 'center',
      dataIndex: 'size',
      customRender: ({ record }) => getSize(record.size),
    },
    {
      title: '创建人',
      align: 'center',
      dataIndex: 'createUser',
    },
    {
      title: '创建时间',
      align: 'center',
      dataIndex: 'createTime',
    },
  ];
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
        pcode: 'C04',
      });
      if (Array.isArray(result)) {
        treeData.value = result;
        treeData.value.unshift({
          title: '全部危险源管理',
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
    handleSuccess();
  };
  const handleSuccess = () => {
    (selectedRowKeys.value = []) && reload();
  };
  // 列表页面公共参数、方法
  const { tableContext, operateRequest } = useListPage({
    tableProps: {
      api: list,
      columns: columns,
      formConfig: {
        schemas: searchFormSchema,
        labelWidth: 80,
      },
      showIndexColumn: true,
      indexColumnProps: {
        fixed: 'left',
      },
      immediate: false,
      beforeFetch: (params) => {
        if (params.time) {
          const time = params.time.split(',');
          params['strTime'] = time[0];
          params['endTime'] = time[1];
          delete params['time'];
        }
        params.category = selectedKeys.value[0] === '0' ? undefined : selectedKeys.value[0];
        return params;
      },
      actionColumn: {
        title: '操作',
        width: 200,
        dataIndex: 'action',
        slots: { customRender: 'action' },
        fixed: 'right',
      },
    },
  });
  const [registerTable, { reload }, { rowSelection, selectedRowKeys }] = tableContext;
  onMounted(async () => {
    await loadRootTreeData();
    await reload();
  });
  const getActions = (record: any) => {
    return [
      {
        label: '预览',
        onClick: handlePreview.bind(null, record),
      },
      {
        label: '下载',
        onClick: handleDownload.bind(null, record),
      },
      {
        label: '编辑',
        auth: ['majorDanger:edit'],
        onClick: handleEdit.bind(null, record),
      },
      {
        label: '删除',
        auth: ['majorDanger:del'],
        onClick: handleDelete.bind(null, record),
      },
    ];
  };
  const handleAdd = () => {
    openModal(true);
  };
  const handlePreview = (data: any) => {
    previewFile(data.path).then((res) => {
      window.open(res, '_blank');
    });
  };
  const handleDownload = (data: any) => {
    downloadFile(getFileAccessHttpUrl(data.path));
  };
  const handleEdit = (data: any) => {
    openEdit.openModal(true, data);
  };
  // 批量删除
  const batchHandleDelete = () => {
    operateRequest(() => deleteBatch({ ids: selectedRowKeys.value.join(',') }), {
      confirm: true,
      isBatch: true,
    });
  };
  const handleDelete = (data: any) => {
    operateRequest(() => del({ id: data.id }), {
      confirm: true,
      isBatch: false,
    });
  };
  const getSize = (size: number) => {
    let data = '0';
    if (size < 0.1 * 1024) {
      //如果小于0.1KB转化成B
      data = size.toFixed(2) + 'B';
    } else if (size < 0.1 * 1024 * 1024) {
      //如果小于0.1MB转化成KB
      data = (size / 1024).toFixed(2) + 'KB';
    } else if (size < 0.1 * 1024 * 1024 * 1024) {
      //如果小于0.1GB转化成MB
      data = (size / (1024 * 1024)).toFixed(2) + 'MB';
    } else {
      //其他转化成GB
      data = (size / (1024 * 1024 * 1024)).toFixed(2) + 'GB';
    }
    const sizestr = data + '';
    const len = sizestr.indexOf('.');
    const dec = sizestr.substring(len + 1, 2);
    if (dec == '00') {
      //当小数点后为00时 去掉小数部分
      return sizestr.substring(0, len) + sizestr.substring(len + 3, 2);
    }
    return sizestr;
  };
</script>
<style scoped lang="less">
  :deep(.ant-tree) {
    height: 100%;
    overflow-y: auto;
  }
</style>
