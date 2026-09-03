<template>
  <div class="standard-page">
    <!-- 左侧台账类型菜单 -->
    <a-card class="standard-menu">
      <a-menu v-model:selectedKeys="selectedMenu" mode="inline" style="border: none" @select="handleMenuSelect">
        <a-menu-item v-for="item in orgOptions" :key="item.value">
          {{ item.label }}
        </a-menu-item>
      </a-menu>
    </a-card>
    <!-- 右侧主内容 -->
    <div class="ledger-content">
      <div class="standard-header">
        <div>
          <a-form
            :label-col="{
              xs: { span: 24 },
              sm: { span: 5 },
            }"
            :model="queryParams"
            :wrapper-col="{
              xs: { span: 24 },
              sm: { span: 19 },
            }"
            style="margin-bottom: 20px; width: 99%"
          >
            <a-row :gutter="24">
              <a-col :md="8" :sm="12">
                <a-form-item label="车间">
                  <a-select
                    v-model:value="queryParams.departCode"
                    :filterOption="(input, option) => option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0"
                    :options="departOptions1"
                    allowClear
                    placeholder="请选择"
                    showSearch
                    @change="getPostList"
                  />
                </a-form-item>
              </a-col>
              <a-col :md="8" :sm="12">
                <a-form-item label="岗位">
                  <a-select
                    v-model:value="queryParams.postCode"
                    :filterOption="(input, option) => option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0"
                    :options="postOptions1"
                    allowClear
                    placeholder="请选择"
                    showSearch
                  />
                </a-form-item>
              </a-col>
              <a-col :md="8" :sm="12">
                <a-button preIcon="ant-design:search-outlined" type="primary" @click="handleMenuSelect(false)">查询 </a-button>
                <a-button preIcon="ant-design:reload-outlined" style="margin-left: 8px" @click="handleReset">重置 </a-button>
              </a-col>
            </a-row>
          </a-form>
        </div>
        <div>
          <j-upload-button
            v-auth="'equipmentManage-standard:import'"
            preIcon="ant-design:import-outlined"
            style="margin-right: 10px"
            type="primary"
            @click="onImportXls"
          >
            导入
          </j-upload-button>
          <a-button v-auth="'equipmentManage-standard:download'" preIcon="ant-design:download-outlined" type="primary" @click="onDownload">
            导入模版下载
          </a-button>
          <a-button
            v-auth="'equipmentManage-standard:addMaterial'"
            :disabled="isEditing"
            preIcon="ant-design:plus-outlined"
            type="primary"
            @click="handleAddMaterial"
            >新增物料
          </a-button>
          <a-button
            v-auth="'equipmentManage-standard:addPost'"
            :disabled="isEditing"
            preIcon="ant-design:plus-outlined"
            type="primary"
            @click="handleAddPost"
            >新增岗位
          </a-button>
          <a-button
            v-if="selectedRowKeys.length > 0"
            v-auth="'equipmentManage-standard:del'"
            danger
            style="margin-left: 10px"
            type="primary"
            @click="handleBatchDelete"
          >
            批量删除
          </a-button>
        </div>
      </div>
      <a-table
        :columns="columns"
        :data-source="tableData"
        :loading="loading"
        :pagination="false"
        :row-selection="rowSelection"
        :scroll="{ x: 1200, y: 'calc(100vh - 306px)' }"
        bordered
        style="margin: 0 5px"
      >
        <template #headerCell="{ column }">
          <div class="th-wrapper">
            <span
              :style="{
                marginLeft: !['车间', '岗位名称', 'operation'].includes(column.dataIndex) ? '18px' : '',
              }"
              :title="String(column.title)"
              class="th-title"
              >{{ column.title }}</span
            >
            <span v-if="!['车间', '岗位名称', 'operation'].includes(column.dataIndex)" class="th-action" @click.stop="handleDeleteColumn(column)">
              <DeleteOutlined />
            </span>
          </div>
        </template>
        <template #bodyCell="{ column, text, record }">
          <template v-if="column.dataIndex === 'operation'">
            <div class="editable-row-operations">
              <span v-if="editableData[record.key]">
                <span style="margin-right: 10px">
                  <a v-if="editableData[record.key].loading">保存中...</a>
                  <a v-else @click="save(record.key)">保存</a>
                </span>
                <span>
                  <a @click="cancel(record.key)">取消</a>
                </span>
              </span>
              <span v-else>
                <a v-auth="'equipmentManage-standard:edit'" @click="handleEdit(record.key)">编辑</a>
                <a v-auth="'equipmentManage-standard:del'" style="margin-left: 10px" @click="handleDelete(record)">删除</a>
              </span>
            </div>
          </template>
          <template v-else>
            <div>
              <a-select
                v-if="column.dataIndex === '车间' && editableData[record.key] && record.isNew"
                v-model:value="editableData[record.key].departCode"
                :filterOption="(input: string, option: any) => { return option.label.toLowerCase().indexOf(input.toLowerCase()) >=0; }"
                :showSearch="true"
                allowClear
                placeholder="请选择车间"
                style="width: 100%"
                @change="changePostList($event, record.key)"
              >
                <a-select-option v-for="item in departOptions" :key="item.value" :value="item.value">
                  {{ item.label }}
                </a-select-option>
              </a-select>
              <a-select
                v-else-if="column.dataIndex === '岗位名称' && editableData[record.key] && record.isNew"
                v-model:value="editableData[record.key].postCode"
                :filterOption="(input: string, option: any) => { return option.label.toLowerCase().indexOf(input.toLowerCase()) >=0; }"
                :placeholder="`请选择${column.title}`"
                :showSearch="true"
                allowClear
                style="width: 100%"
              >
                <a-select-option v-for="item in postOptions" :key="item.value" :value="item.value">
                  {{ item.label }}
                </a-select-option>
              </a-select>
              <a-input
                v-else-if="editableData[record.key] && !record.isNew && column.dataIndex !== '车间' && column.dataIndex !== '岗位名称'"
                v-model:value="editableData[record.key][column.dataIndex]"
                :placeholder="`请输入${column.title}`"
                allowClear
                style="width: 100%"
              />
              <template v-else>
                {{ text || '-' }}
              </template>
            </div>
          </template>
        </template>
      </a-table>
    </div>
  </div>
  <!-- 添加物料弹框 -->
  <a-modal
    :body-style="{ padding: '25px' }"
    :confirmLoading="confirmLoading"
    :visible="addMaterialModalVisible"
    title="添加物料"
    @cancel="cancelAddMaterial"
    @ok="confirmAddMaterial"
  >
    <a-form ref="addMaterialFormRef" :model="addMaterialForm" :rules="addMaterialRules">
      <a-form-item :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }" label="物料名称" name="supply">
        <a-input v-model:value="addMaterialForm.supply" allowClear placeholder="请输入物料名称" />
      </a-form-item>
    </a-form>
  </a-modal>
</template>
<script lang="ts" name="equipmentManage-standard" setup>
  import { ref, onMounted, reactive, nextTick, createVNode, computed } from 'vue';
  import { getDepart3ListWithSecurity, selectDeptNew, getPost } from '/@/api/common/api';
  import { cloneDeep } from 'lodash-es';
  import { useMethods } from '/@/hooks/system/useMethods';
  import { QuestionCircleOutlined, DeleteOutlined } from '@ant-design/icons-vue';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { list, addSupply, addPost, edit, del, deleteSupply } from './api';

  const { createConfirm, createMessage } = useMessage();
  const { handleImportXls, handleExportXlsx } = useMethods();

  // 添加编辑状态计算属性
  const isEditing = computed(() => {
    return Object.keys(editableData).length > 0;
  });

  const columns = ref([
    {
      title: '车间',
      dataIndex: '车间',
      align: 'center',
      width: 200,
      fixed: 'left',
      ellipsis: true,
    },
    {
      title: '岗位名称',
      dataIndex: '岗位名称',
      align: 'center',
      width: 200,
      fixed: 'left',
      ellipsis: true,
    },
    {
      title: '操作',
      dataIndex: 'operation',
      align: 'center',
      fixed: 'right',
      width: 150,
      ellipsis: true,
    },
  ]);
  const queryParams = ref({
    departCode: undefined,
    postCode: undefined,
  });
  const tableData: any = ref([]);
  const loading = ref(false);
  const selectedRowKeys: any = ref([]);
  const selectedRows: any = ref([]);
  const selectedMenu: any = ref([]);
  const orgOptions: any = ref([]);
  const departOptions: any = ref([]);
  const departOptions1: any = ref([]);
  const postOptions: any = ref([]);
  const postOptions1: any = ref([]);
  const editableData: any = reactive({});
  // 添加物料弹框相关状态
  const addMaterialModalVisible = ref(false);
  const addMaterialForm = ref({
    supply: '',
  });
  const addMaterialFormRef = ref();
  const confirmLoading = ref(false);
  // 添加物料表单验证规则
  const addMaterialRules = {
    supply: [
      { required: true, message: '请输入物料名称', trigger: 'blur' },
      { min: 1, max: 50, message: '物料名称长度在1-50个字符之间', trigger: 'blur' },
    ],
    departCode: [{ required: true, message: '请选择车间', trigger: 'change' }],
  };
  const handleMenuSelect = async (is = true) => {
    columns.value = [
      {
        title: '车间',
        dataIndex: '车间',
        align: 'center',
        width: 200,
        fixed: 'left',
        ellipsis: true,
      },
      {
        title: '岗位名称',
        dataIndex: '岗位名称',
        align: 'center',
        width: 200,
        fixed: 'left',
        ellipsis: true,
      },
      {
        title: '操作',
        dataIndex: 'operation',
        align: 'center',
        fixed: 'right',
        width: 150,
        ellipsis: true,
      },
    ];
    if (is) await getPostList();
    init();
  };
  onMounted(() => {
    getDepart3ListWithSecurity().then((res) => {
      orgOptions.value = res.map((item) => ({
        label: item.departName,
        value: item.orgCode,
      }));
      selectedMenu.value = [orgOptions.value[0].value];
      handleMenuSelect();
    });
  });
  const init = () => {
    loading.value = true;
    tableData.value = [];
    selectedRowKeys.value = [];
    selectedRows.value = [];
    // 清空编辑状态
    Object.keys(editableData).forEach((key) => {
      delete editableData[key];
    });
    list({
      orgCode: selectedMenu.value[0],
      ...queryParams.value,
    })
      .then((res) => {
        tableData.value = res.rows.map((item, index) => {
          return {
            ...item,
            key: Date.now().toString() + index,
          };
        });
        if (res.supplies && res.supplies.length > 0) {
          // 在操作列之前插入新的物料列
          const operationIndex = columns.value.findIndex((col) => col.dataIndex === 'operation');
          const newColumn = res.supplies.map((item) => {
            return {
              title: item,
              dataIndex: item,
              align: 'center',
              width: 150,
              ellipsis: true,
            };
          });
          columns.value.splice(operationIndex, 0, ...newColumn);
        }
      })
      .finally(() => {
        loading.value = false;
      });
    departOptions.value = [];
    departOptions1.value = [];
    selectDeptNew({ orgCode: selectedMenu.value[0] }).then((res) => {
      departOptions.value = res.map((item) => ({
        label: item.departName,
        value: item.orgCode,
      }));
      departOptions1.value = JSON.parse(JSON.stringify(departOptions.value));
      departOptions1.value.unshift({
        label: '厂部',
        value: selectedMenu.value[0],
      });
    });
  };
  const handleReset = () => {
    queryParams.value.departCode = undefined;
    queryParams.value.postCode = undefined;
    handleMenuSelect();
  };
  // 获取岗位
  const getPostList = async (departCode?) => {
    postOptions1.value = [];
    queryParams.value.postCode = undefined;
    if (!departCode) return;
    getPost({ orgCode: departCode }).then((res) => {
      postOptions1.value = res.map((item) => ({
        label: item.departName,
        value: item.orgCode,
      }));
    });
  };
  const changePostList = (departCode?, key?) => {
    if (key) {
      editableData[key].postCode = undefined;
    }
    postOptions.value = [];
    getPost({ orgCode: departCode ? departCode : selectedMenu.value[0] }).then((res) => {
      postOptions.value = res.map((item) => ({
        label: item.departName,
        value: item.orgCode,
      }));
    });
  };
  const handleEdit = (key: string) => {
    // 如果已经有其他行在编辑，先取消之前的编辑
    if (isEditing.value) {
      const editingKeys = Object.keys(editableData);
      editingKeys.forEach((editingKey) => {
        if (editingKey !== key) {
          cancel(editingKey);
        }
      });
    }

    const record = tableData.value.find((item) => key === item.key);
    if (record) {
      editableData[key] = cloneDeep(record);
      editableData[key].loading = false;
      changePostList();
    }
  };
  const save = (key: string) => {
    const record = tableData.value.find((item) => key === item.key);
    if (record) {
      if (record.isNew) {
        if (!editableData[key].postCode || editableData[key].postCode == undefined) {
          createMessage.error('请选择岗位名称！');
          return;
        }
        editableData[key].loading = true;
        addPost({
          orgCode: selectedMenu.value[0],
          departCode: editableData[key].departCode,
          postCode: editableData[key].postCode,
        })
          .then((res) => {
            if (res) {
              handleMenuSelect();
              delete editableData[key];
            }
          })
          .finally(() => {
            editableData[key].loading = false;
          });
      } else {
        editableData[key].loading = true;
        // 如果是编辑现有数据
        edit({
          orgCode: selectedMenu.value[0],
          row: editableData[key],
        })
          .then((res) => {
            if (res) {
              handleMenuSelect();
              delete editableData[key];
            }
          })
          .finally(() => {
            editableData[key].loading = false;
          });
      }
    }
  };
  const cancel = (key: string) => {
    const record = tableData.value.find((item) => key === item.key);
    if (record && record.isNew) {
      // 如果是新增数据取消，则从表格中移除
      const index = tableData.value.findIndex((item) => key === item.key);
      if (index > -1) {
        tableData.value.splice(index, 1);
      }
    }
    delete editableData[key];
  };
  const onImportXls = (file) => {
    handleImportXls(
      file,
      '/lb/lbDistributeStandard/importExcel',
      () => {
        handleMenuSelect();
      },
      {
        orgCode: selectedMenu.value[0],
      }
    );
  };
  const onDownload = () => {
    const name = orgOptions.value.find((item) => item.value === selectedMenu.value[0])?.label;
    handleExportXlsx(`劳保发放标准（${name}）-模板`, '/lb/lbDistributeStandard/downloadImportTemplate', {
      orgCode: selectedMenu.value[0],
    });
  };
  const handleAddMaterial = () => {
    selectedRows.value = [];
    selectedRowKeys.value = [];
    addMaterialModalVisible.value = true;
    nextTick(() => {
      addMaterialFormRef.value?.resetFields();
      addMaterialForm.value.supply = '';
    });
  };
  // 确认添加物料
  const confirmAddMaterial = () => {
    addMaterialFormRef.value?.validate().then(() => {
      confirmLoading.value = true;
      addSupply({
        orgCode: selectedMenu.value[0],
        supply: addMaterialForm.value.supply,
      })
        .then((res) => {
          if (res) {
            handleMenuSelect();
            addMaterialModalVisible.value = false;
          }
        })
        .finally(() => {
          confirmLoading.value = false;
        });
    });
  };
  const onSelectChange = (keys, rows) => {
    selectedRowKeys.value = keys;
    selectedRows.value = rows;
  };
  const rowSelection = computed(() => ({
    selectedRowKeys: selectedRowKeys.value,
    onChange: onSelectChange,
  }));

  // 取消添加物料
  const cancelAddMaterial = () => {
    addMaterialModalVisible.value = false;
    addMaterialForm.value.supply = '';
  };
  const handleAddPost = () => {
    selectedRows.value = [];
    selectedRowKeys.value = [];
    // 如果已经有行在编辑，先取消之前的编辑
    if (isEditing.value) {
      const editingKeys = Object.keys(editableData);
      editingKeys.forEach((editingKey) => {
        cancel(editingKey);
      });
    }

    // 创建新的岗位数据
    const newPost = {
      key: Date.now().toString(), // 使用时间戳作为唯一key
      departCode: undefined,
      postCode: undefined,
      isNew: true, // 标记为新添加的数据
    };
    // 将新数据插入到表格第一行
    tableData.value.unshift(newPost);
    // 立即进入编辑状态
    handleEdit(newPost.key);
  };
  const handleDelete = (record: any) => {
    createConfirm({
      iconType: 'warning',
      icon: createVNode(QuestionCircleOutlined),
      title: '删除',
      content: '确定要删除吗？',
      onOk: () => {
        return new Promise<void>((resolve, reject) => {
          del({ orgCode: selectedMenu.value[0], departName: record['车间'], postName: record['岗位名称'] })
            .then((res) => {
              if (res) {
                handleMenuSelect();
                resolve();
              } else {
                reject(new Error('删除失败！'));
              }
            })
            .catch(() => {
              resolve();
            });
        });
      },
    });
  };
  const handleBatchDelete = () => {
    if (selectedRowKeys.value.length === 0) return;
    createConfirm({
      iconType: 'warning',
      icon: createVNode(QuestionCircleOutlined),
      title: '批量删除',
      content: `确定要删除选中的${selectedRowKeys.value.length}条数据吗？`,
      onOk: () => {
        const postNames = selectedRows.value.map((item) => item['岗位名称']).join(',');
        const departNames = selectedRows.value.map((item) => item['车间']).join(',');
        return new Promise<void>((resolve, reject) => {
          del({ orgCode: selectedMenu.value[0], departName: departNames, postName: postNames })
            .then((res) => {
              if (res) {
                handleMenuSelect();
                resolve();
                selectedRows.value = [];
                selectedRowKeys.value = [];
              } else {
                reject(new Error('删除失败！'));
              }
            })
            .catch(() => {
              resolve();
            });
        });
      },
    });
  };

  // 删除物料
  const handleDeleteColumn = (column: any) => {
    createConfirm({
      iconType: 'warning',
      icon: createVNode(QuestionCircleOutlined),
      title: '删除物料',
      content: '物料删除后，所有人员将不再发放此物料，确认删除？',
      onOk: () => {
        return new Promise<void>((resolve, reject) => {
          deleteSupply({ orgCode: selectedMenu.value[0], supply: column.title })
            .then((res) => {
              if (res) {
                handleMenuSelect();
                resolve();
              } else {
                reject(new Error('删除失败！'));
              }
            })
            .catch(() => {
              resolve();
            });
        });
      },
    });
  };
</script>
<style lang="less" scoped>
  .standard-page {
    display: flex;
    margin: 10px;
    height: calc(100vh - 120px);
    overflow: hidden;
  }

  :deep(.ant-menu-item) {
    padding: 0 10px !important;
  }

  :deep(.ant-card-body) {
    padding: 10px !important;
  }

  .standard-menu {
    width: 250px;
    //min-width: 180px;
    padding: 0;
    border-radius: 8px;
    height: calc(100vh - 120px);
    overflow-y: auto;
  }

  .ledger-content {
    background-color: #fff;
    border-radius: 8px;
    border: 1px solid #e5e7eb;
    margin-left: 10px;
    width: calc(100% - 260px);

    .standard-header {
      margin: 10px;

      button {
        margin-right: 10px;
      }
    }

    :deep(.ant-card-body) {
      padding-bottom: 0 !important;
    }

    :deep(.ant-card-bordered) {
      border: none !important;
    }

    // 修复表格滚动条问题
    :deep(.ant-table-wrapper) {
      overflow: hidden;
      max-height: calc(100vh - 250px);
      // max-height: calc(100vh - 180px);
    }

    :deep(.ant-table) {
      overflow: auto;
    }

    // 空数据时隐藏多余的滚动条
    :deep(.ant-table-empty) {
      .ant-table-body {
        overflow: hidden;
        min-height: 200px;
      }
    }

    // 确保表格容器不会产生多余的滚动条
    :deep(.ant-table-container) {
      overflow: hidden;
    }
  }

  .th-wrapper {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    position: relative;
  }

  .th-title {
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    display: inline-block;
    vertical-align: middle;
  }

  .th-action {
    color: #ff4d4f;
    cursor: pointer;
    opacity: 0;
    transition: opacity 0.2s ease;
    display: inline-flex;
    align-items: center;
  }

  :deep(.ant-table-thead) th:hover .th-action {
    opacity: 1;
  }
</style>
