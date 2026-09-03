<template>
  <div>
    <!-- 查询区域 -->
    <div class="jeecg-basic-table-form-container">
      <a-form ref="formRef" :model="queryParam" :label-col="labelCol" :wrapper-col="wrapperCol">
        <a-row :gutter="24">
          <a-col :md="6" :sm="12">
            <a-form-item label="所属单位">
              <a-select 
                v-model:value="queryParam.orgCode" 
                placeholder="请选择" 
                allow-clear
                show-search
                :filter-option="filterOption"
              >
                <a-select-option 
                  v-for="item in departList" 
                  :key="item.orgCode" 
                  :value="item.orgCode"
                >
                  {{ item.departName }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :md="6" :sm="12">
            <a-form-item label="设备编码">
              <JInput v-model:value="queryParam.deviceCode" placeholder="请输入" allow-clear />
            </a-form-item>
          </a-col>
          <a-col :md="6" :sm="12">
            <a-form-item label="设备名称">
              <JInput v-model:value="queryParam.deviceName" placeholder="请输入" allow-clear />
            </a-form-item>
          </a-col>
          <a-col :md="6" :sm="12">
            <div class="table-page-search-submitButtons">
               <a-button type="primary" @click="searchQuery">查询</a-button>
               <a-button type="primary" @click="searchReset" style="margin-left: 8px">重置</a-button>
             </div>
          </a-col>
        </a-row>
      </a-form>
    </div>

    <!-- 表格区域 -->
    <BasicTable @register="registerTable">
      <!-- <template #tableTitle>
        <a-button type="primary" preIcon="ant-design:plus-outlined" @click="handleSyncData">手动同步数据</a-button>
        <a-button type="primary" preIcon="ant-design:export-outlined" @click="onExportXls">导出</a-button>
      </template> -->
      
      <!-- 操作列 -->
      <template #action="{ record }">
        <TableAction :actions="getActions(record)" />
      </template>
    </BasicTable>

    <!-- 详情弹窗 -->
    <FourInOneModal @register="registerModal" @success="reload" />
  </div>
</template>

<script lang="ts" setup name="four-in-one">
import { ref, reactive, onMounted } from 'vue';
import { BasicTable, useTable, TableAction } from '/@/components/Table';
import { useModal } from '/@/components/Modal';
import { useMessage } from '/@/hooks/web/useMessage';
import { useListPage } from '/@/hooks/system/useListPage';
import { columns } from './fourInOne.data.ts';
import { getList } from './fourInOne.api.ts';
import { getDepart3ListWithSecurity } from '/@/api/common/api';
import FourInOneModal from './FourInOneModal.vue';
import JInput from '/@/components/Form/src/jeecg/components/JInput.vue';

// 定义部门数据类型
interface DepartItem {
  orgCode: string;
  departName: string;
}

const { createMessage } = useMessage();
const [registerModal, { openModal }] = useModal();

// 查询参数
const queryParam = reactive({
  orgCode: undefined,
  deviceCode: '',
  deviceName: '',
});

// 部门列表
const departList = ref<DepartItem[]>([]);

// 表单布局
const labelCol = reactive({
  xs: { span: 24 },
  sm: { span: 7 },
});

const wrapperCol = reactive({
  xs: { span: 24 },
  sm: { span: 17 },
});

// 列表页面公共参数、方法
const { tableContext } = useListPage({
  tableProps: {
    api: getList,
    columns: columns,
    useSearchForm: false,
    showIndexColumn: true,
    rowKey: 'id',
    clickToRowSelect: false,
    actionColumn: {
      width: 120,
      title: '操作',
      dataIndex: 'action',
      slots: { customRender: 'action' },
      fixed: 'right',
    },
    beforeFetch: (info) => {
      return Object.assign(info, queryParam);
    },
  },
});

const [registerTable, { reload, getForm }] = tableContext;

/**
 * 获取部门列表数据
 */
async function loadDepartList() {
  try {
    const result = await getDepart3ListWithSecurity();
    departList.value = result || [];
  } catch (error) {
    console.error('获取部门列表失败:', error);
  }
}

/**
 * 下拉搜索过滤函数
 */
function filterOption(input: string, option: any) {
  return option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0;
}

/**
 * 查询操作
 */
function searchQuery() {
  reload();
}

/**
 * 重置查询
 */
function searchReset() {
  queryParam.orgCode = undefined;
  queryParam.deviceCode = '';
  queryParam.deviceName = '';
  reload();
}

/**
 * 编辑操作
 */
function handleEdit(record: any) {
  openModal(true, {
    record,
    isUpdate: true,
    showFooter: true,
    title: '编辑',
  });
}

/**
 * 组件挂载时获取部门数据
 */
onMounted(() => {
  loadDepartList();
});

/**
 * 获取操作按钮配置
 */
function getActions(record: any) {
  return [
    {
      label: '编辑',
      onClick: handleEdit.bind(null, record),
    },
  ];
}
</script>

<style lang="less" scoped>
.jeecg-basic-table-form-container {
  .table-page-search-submitButtons {
    display: block;
    margin-bottom: 24px;
    white-space: nowrap;
  }
}
</style>