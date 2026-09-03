<template>
  <div>
    <!--自定义查询区域-->
    <div class="jeecg-basic-table-form-container" @keyup.enter="searchQuery">
      <a-form ref="formRef" :model="queryParam" :label-col="labelCol" :wrapper-col="wrapperCol">
        <a-row :gutter="24">
          <a-col :lg="4">
            <a-form-item label="上级部门">
              <a-input v-model:value="queryParam.superiorDepart" allowClear placeholder="请输入上级部门" />
            </a-form-item>
          </a-col>
          <a-col :lg="4">
            <a-form-item label="部门名称">
              <a-input v-model:value="queryParam.departName" allowClear placeholder="请输入部门名称" />
            </a-form-item>
          </a-col>
          <a-col :lg="3">
            <a-form-item label="人员">
              <a-input v-model:value="queryParam.userName" allowClear placeholder="请输入人员" />
            </a-form-item>
          </a-col>
          <a-col :lg="5">
            <a-form-item label="安全管理岗">
              <JDictSelectTag
                v-model:value="queryParam.safetyManagementPost"
                allowClear
                placeholder="请选择安全管理岗"
                dictCode="safety_management_post"
              />
            </a-form-item>
          </a-col>
          <a-col :lg="5">
            <a-form-item label="安全生产职责">
              <a-input v-model:value="queryParam.safetyProductionZz" allowClear placeholder="请输入安全生产职责" />
            </a-form-item>
          </a-col>

          <span style="float: left; overflow: hidden" class="table-page-search-submitButtons">
            <a-col :lg="3">
              <a-button type="primary" preIcon="ant-design:search-outlined" @click="searchQuery">查询</a-button>
              <a-button preIcon="ant-design:reload-outlined" @click="searchReset" style="margin-left: 8px">重置</a-button>
            </a-col>
          </span>
        </a-row>
      </a-form>

      <BasicTable @register="registerTable" :rowSelection="rowSelection">
        <template #tableTitle>
          <a-button preIcon="ant-design:plus-outlined" type="primary" @click="handleAdd" v-auth="'securityOrg:add'">新增</a-button>
          <a-dropdown v-if="checkedKeys.length > 0">
            <template #overlay>
              <a-menu>
                <a-menu-item key="1" @click="batchHandleDelete" v-if="hasPermission('securityOrg:del')">
                  <Icon icon="ant-design:delete-outlined" />
                  删除
                </a-menu-item>
              </a-menu>
            </template>
            <a-button
              >批量操作
              <Icon style="fontsize: 12px" icon="ant-design:down-outlined" />
            </a-button>
          </a-dropdown>
        </template>
        <template #safe="{ record }">
          <a-popover title="安全生产职责" :overlayStyle="{ width: '500px' }" v-if="record.safetyProductionZz">
            <template #content>
              <div v-for="(e, i) in record.safetyProductionZz.split(',')" :key="i">
                <div class="poppverstyle">{{ i + 1 }}、{{ e }}</div>
              </div>
            </template>
            <div v-for="(e, i) in record.safetyProductionZz.split(',')" :key="i">
              <div class="desc-more">{{ i + 1 }}、{{ e }}</div>
            </div>
          </a-popover>
        </template>
        <template #action="{ record }">
          <TableAction :actions="getActions(record)" />
        </template>
      </BasicTable>
    </div>

    <DemoDrawer :data="departData" @register="registerDrawer" @success="handleSuccess" :options="options" :selp="selp" />
  </div>
</template>
<script lang="ts" name="securityOrg-org" setup>
  import { ref, reactive, toRaw } from 'vue';
  import { BasicTable, useTable, TableAction } from '/@/components/Table';
  import DemoDrawer from './DemoDrawer.vue';
  import { useDrawer } from '/@/components/Drawer';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { usePermission } from '/@/hooks/web/usePermission';
  import JDictSelectTag from '/@/components/Form/src/jeecg/components/JDictSelectTag.vue';
  import { getDemoList, deleteDemo, batchDeleteDemo } from './demo.api';
  import { columns, searchFormSchema } from './demo.data';
  const { hasPermission } = usePermission();
  const { createMessage: $message } = useMessage();
  const options = ref<any>([]); // 选中的人员数组options
  const selp = ref<any>([]); // 选中的人员
  // 当前选中的部门信息
  const departData = ref({});
  const checkedKeys = ref<Array<string | number>>([]);
  const selectionRowsS = ref<any[]>([]);
  // const isDisabled = ref(false);
  // const showFooter = ref(true);

  // 注册drawer =========
  const [registerDrawer, { openDrawer }] = useDrawer();

  // 注册table ========
  const [registerTable, { reload, setProps }] = useTable({
    title: '单表示例',
    api: getDemoList,
    columns,
    formConfig: {
      //labelWidth: 120,
      schemas: searchFormSchema,
      fieldMapToTime: [['birthday', ['birthday_begin', 'birthday_end'], 'YYYY-MM-DD']],
      fieldMapToNumber: [['age', ['age_begin', 'age_end']]],
      autoAdvancedCol: 2,
      actionColOptions: {
        style: { textAlign: 'left' },
      },
    },
    striped: true,
    useSearchForm: false,
    showTableSetting: false,
    clickToRowSelect: false,
    bordered: true,
    showIndexColumn: true,
    tableSetting: { fullScreen: true },
    canResize: false,
    rowKey: 'id',
    actionColumn: {
      width: 180,
      title: '操作',
      dataIndex: 'action',
      slots: { customRender: 'action' },
      fixed: undefined,
    },
  });
  /**
   * 选择列配置
   */
  const rowSelection: any = {
    type: 'checkbox',
    columnWidth: 40,
    selectedRowKeys: checkedKeys,
    onChange: onSelectChange,
  };
  /**
   * 操作列定义 == 按钮权限配置
   * @param record
   */
  function getActions(record) {
    return [
      {
        label: '编辑',
        onClick: handleEdit.bind(null, record),
        ifShow: (_action) => {
          return record.parentId !== '0'; // 根据业务控制是否显示: 根节点不展示编辑
        },
        auth: 'securityOrg:edit',
      },
      {
        label: '查看',
        onClick: handleDetail.bind(null, record),
      },
      {
        label: '删除',
        popConfirm: {
          title: '是否确认删除？删除后该部门下关联的全部数据同步删除！',
          confirm: handleDelete.bind(null, record),
        },
        ifShow: (_action) => {
          return record.parentId !== '0'; // 根据业务控制是否显示: 根节点不展示删除
        },
        auth: 'securityOrg:del',
      },
    ];
  }

  /**
   * 选择事件
   */
  function onSelectChange(selectedRowKeys: (string | number)[], selectionRows) {
    // console.log("checkedKeys------>",checkedKeys)
    checkedKeys.value = selectedRowKeys;
    selectionRowsS.value = selectionRows;
  }

  /**
   * 新增事件
   */
  function handleAdd() {
    openDrawer(true, {
      isUpdate: false,
      showFooter: true,
    });
  }
  /**
   * 编辑事件
   */
  async function handleEdit(record: Recordable) {
    let recordNew = getfinalrecord(record);
    openDrawer(true, {
      record: recordNew,
      isUpdate: true,
      showFooter: true,
    });
  }
  /**
   * 详情页面
   */
  async function handleDetail(record: Recordable) {
    let recordNew = getfinalrecord(record);
    openDrawer(true, {
      record: recordNew,
      isUpdate: true,
      showFooter: false,
    });
  }
  // 回显操作
  function getfinalrecord(record) {
    // 安全生产职责回显
    let recordNew = JSON.parse(JSON.stringify(record));
    let listobj = { list: [] };
    if (recordNew.safetyProductionZz) {
      listobj.list = recordNew.safetyProductionZz.split(',').map((ee) => {
        return ee;
      });
    }
    // 当前选中人员options回显 - 单人
    options.value = [
      {
        username: record.userName,
        realname: record.realname,
      },
    ];
    let reocrdFinal = Object.assign(recordNew, listobj);
    return reocrdFinal;
  }
  /**
   * 删除事件
   */
  async function handleDelete(record) {
    await deleteDemo({ id: record.id }, reload);
  }
  /**
   * 批量删除事件
   */
  async function batchHandleDelete() {
    // 判断选中数据是否包含根节点，包含根节点不能删除
    let isSel = selectionRowsS.value.find((e) => {
      return e.parentId === '0';
    });
    if (isSel) {
      $message.warning('所选项包含顶层部门，请重新选择删除数据！');
      return;
    }
    await batchDeleteDemo({ ids: checkedKeys.value }, reload);
  }
  /**
   * 打开tab页面
   */
  // function openTab() {
  //   go(`/comp/jeecg/basic`);
  // }
  //-----自定义查询----begin--------
  const labelCol = reactive({
    xs: { span: 24 },
    sm: { span: 7 },
  });
  const wrapperCol = reactive({
    xs: { span: 24 },
    sm: { span: 16 },
  });
  const queryParam = reactive({
    id: null,
    superiorDepart: '',
    departName: '',
    userName: '',
    safetyManagementPost: '',
    safetyProductionZz: '',
  });
  // watch(customSearch, () => {
  //   setProps({ useSearchForm: !unref(customSearch) });
  // });
  function searchQuery() {
    setProps({ searchInfo: toRaw(queryParam) });
    reload();
  }
  function searchReset() {
    Object.assign(queryParam, { id: null, superiorDepart: '', departName: '', userName: '', safetyManagementPost: '', safetyProductionZz: '' });
    reload();
  }
  //自定义查询----end---------

  /**
   * 抽屉成功回调
   */
  function handleSuccess() {
    reload();
  }
</script>
<style lang="less" scoped>
  .jeecg-basic-table-form-container {
    // .ant-form{margin-bottom: 0px !important;}、
    .table-page-search-submitButtons {
      display: block;
      margin-bottom: 24px;
      white-space: nowrap;
    }

    .ant-form-item,
    .table-page-search-submitButtons {
      margin-bottom: 8px !important;
    }
  }
  .desc-more {
    width: 100%;
    height: 24px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    -o-text-overflow: ellipsis;
  }
  .poppverstyle {
    word-break: break-all; // html连续字符或数字换行的问题
  }
  /deep/.ant-popconfirm {
    width: 190px;
  }
</style>
