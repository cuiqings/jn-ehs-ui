<template>
  <div class="correspondence-page">
    <!-- 左侧台账类型菜单 -->
    <a-card class="standard-menu">
      <a-menu v-model:selectedKeys="selectedMenu" mode="inline" style="border: none" @select="handleMenuSelect">
        <a-menu-item v-for="item in orgOptions" :key="item.value">
          {{ item.label }}
        </a-menu-item>
      </a-menu>
    </a-card>
    <!-- 右侧主内容 -->
    <div class="correspondence-content">
      <div class="standard-header">
        <a-button type="primary" v-auth="'equipmentManage-correspondence:autoOut'" @click="handleAutoOut">自动带出</a-button>
      </div>
      <a-table
        rowKey="key"
        :columns="columns"
        :data-source="tableData"
        :pagination="{
          total: total,
          pageSize: queryParams.pageSize,
          current: queryParams.pageNo,
          showSizeChanger: true,
          showQuickJumper: true,
        }"
        :loading="loading"
        @change="tableChange"
        style="margin: 0 5px"
        bordered
        :scroll="{ y: 'calc(100vh - 290px)' }"
      >
        <template #bodyCell="{ column, text, record }">
          <template v-if="column.dataIndex === 'operation'">
            <div class="editable-row-operations">
              <span v-if="editableData[record.key]">
                <span style="margin-right: 10px">
                  <a @click="save(record.key)">保存</a>
                </span>
                <span>
                  <a @click="cancel(record.key)">取消</a>
                </span>
              </span>
              <span v-else>
                <a v-auth="'equipmentManage-correspondence:edit'" @click="handleEdit(record.key)">编辑</a>
              </span>
            </div>
          </template>
          <template v-if="column.dataIndex === 'supplyName'">
            <div>
              <a-select
                v-if="editableData[record.key]"
                style="width: 100%"
                v-model:value="editableData[record.key][column.dataIndex]"
                placeholder="请选择"
                :options="nameOptions"
                :showSearch="true"
                :filterOption="(input: string, option: any) => { return option.label.toLowerCase().indexOf(input.toLowerCase()) >=0; }"
              />
              <span v-else>
                <span v-if="text && text !== ''">{{ text }}</span>
                <span v-else style="color: red">待选择</span>
              </span>
            </div>
          </template>
        </template>
      </a-table>
    </div>
  </div>
</template>
<script setup name="equipmentManage-correspondence" lang="ts">
  import { ref, onMounted, reactive, computed } from 'vue';
  import { getDepart3ListWithSecurity } from '/@/api/common/api';
  import { cloneDeep } from 'lodash-es';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { list, bringOut, edit, getListByOrg } from './api';
  const { createConfirm } = useMessage();
  const columns = ref([
    {
      title: '序号',
      dataIndex: 'index',
      key: 'index',
      width: 80,
      align: 'center',
      customRender: ({ index }) => {
        return index + 1;
      },
    },
    {
      title: '发放标准的物料名称',
      dataIndex: 'supply',
      align: 'center',
    },
    {
      title: '对应劳保物料台账的物料名称',
      dataIndex: 'supplyName',
      align: 'center',
    },
    {
      title: '操作',
      dataIndex: 'operation',
      align: 'center',
      width: 200,
    },
  ]);
  const tableData: any = ref([]);
  const loading = ref(false);
  const selectedMenu: any = ref([]);
  const orgOptions: any = ref([]);
  const editableData: any = reactive({});
  const nameOptions: any = ref([]);
  const isEditing = computed(() => {
    return Object.keys(editableData).length > 0;
  });
  const total = ref(0);
  const queryParams = ref({
    pageNo: 1,
    pageSize: 10,
  });
  const handleMenuSelect = () => {
    init();
  };
  onMounted(() => {
    getDepart3ListWithSecurity().then((res) => {
      orgOptions.value = res.map((item) => ({
        label: item.departName,
        value: item.orgCode,
      }));
      selectedMenu.value = [orgOptions.value[0].value];
      init();
      getListByOrg().then((res) => {
        nameOptions.value = res.map((item) => ({
          label: item,
          value: item,
        }));
      });
    });
  });
  const init = () => {
    loading.value = true;
    list({ orgCode: selectedMenu.value[0], ...queryParams.value })
      .then((res) => {
        tableData.value = res.records.map((item, index) => {
          return {
            ...item,
            key: Date.now().toString() + index,
          };
        });
        total.value = res.total;
      })
      .finally(() => {
        loading.value = false;
      });
  };
  const tableChange = (pagination) => {
    queryParams.value.pageNo = pagination.current;
    queryParams.value.pageSize = pagination.pageSize;
    init();
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
    }
  };
  const save = (key: string) => {
    edit({
      orgCode: selectedMenu.value[0],
      supply: editableData[key].supply,
      supplyName: editableData[key].supplyName,
    }).then((res) => {
      if (res) {
        init();
        delete editableData[key];
      }
    });
  };
  const cancel = (key: string) => {
    tableData.value = tableData.value.map((item) => {
      if (item.key === key) {
        item.supplyName = item.supplyName ? item.supplyName : undefined;
      }
      return item;
    });
    delete editableData[key];
  };
  const handleAutoOut = () => {
    createConfirm({
      iconType: 'warning',
      title: '提示',
      content: '确定要自动带出吗？',
      onOk: () => {
        return new Promise<void>((resolve, reject) => {
          bringOut({ orgCode: selectedMenu.value[0] })
            .then((res) => {
              if (res) {
                init();
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
  .correspondence-page {
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
    min-width: 180px;
    padding: 0;
    border-radius: 8px;
    height: calc(100vh - 120px);
    overflow-y: auto;
  }
  .correspondence-content {
    background-color: #fff;
    border-radius: 8px;
    border: 1px solid #e5e7eb;
    margin-left: 10px;
    width: calc(100% - 250px);
    display: flex;
    flex-direction: column;
    height: calc(100vh - 120px);
    overflow: hidden;
    .standard-header {
      margin: 10px;
      flex-shrink: 0;
      button {
        margin-right: 10px;
      }
    }
    :deep(.ant-table-wrapper) {
      flex: 1;
      overflow: hidden;
    }
    :deep(.ant-table) {
      height: 100%;
    }
    :deep(.ant-table-body) {
      overflow-y: auto;
    }
    :deep(.ant-card-body) {
      padding-bottom: 0 !important;
    }
    :deep(.ant-card-bordered) {
      border: none !important ;
    }
    :deep(.ant-pagination) {
      margin-right: 10px;
    }
  }
</style>
