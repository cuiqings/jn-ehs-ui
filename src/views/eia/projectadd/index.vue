<template>
  <div>
    <div class="projecteia projecteia-form">
      <a-tabs v-model:activeKey="activeKey" defaultActiveKey="1" size="large" @change="tabsChange">
        <a-tab-pane key="1" tab="待补充">
          <!--引用表格-->
          <BasicTable @register="registerTable">
            <!--操作栏-->
            <template #action="{ record }">
              <TableAction :actions="getTableAction(record)"/>
            </template>
            <!--字段回显插槽-->
            <template #htmlSlot="{text}">
              <div v-html="text"></div>
            </template>
            <!--省市区字段回显插槽-->
            <template #pcaSlot="{text}">
              {{ getAreaTextByCode(text) }}
            </template>
            <template #fileSlot="{text}">
              <span v-if="!text" style="font-size: 12px;font-style: italic;">无文件</span>
              <a-button v-else :ghost="true" type="primary" preIcon="ant-design:download-outlined" size="small" @click="downloadFile(text)">下载</a-button>
            </template>
          </BasicTable>
        </a-tab-pane>
        <a-tab-pane key="2" tab="待审核" force-render>
          <!--引用表格-->
          <BasicTable @register="auditRegisterTable">
            <!--操作栏-->
            <template #action="{ record }">
              <TableAction :actions="getTableAction(record)"/>
            </template>
            <!--字段回显插槽-->
            <template #htmlSlot="{text}">
              <div v-html="text"></div>
            </template>
            <template #attachPath="{ record }">
              <div style="text-align: justify;word-break:break-all">
                <a class="a-hover-underline" v-if="record.attach" v-for="(item,index) in record.attachPath" :key="index" style="color: #0091ff; cursor: pointer" @click="handlePreview( 'eiaAdd/'+item)">
                  {{item}};&nbsp;&nbsp;
                </a>
              </div>

            </template>
          </BasicTable>
        </a-tab-pane>
      </a-tabs>
    </div>

    <!-- 表单区域 -->
    <EhsEiaAddModal @register="registerModal" @success="handleSuccess" :showFooter="showFooter"></EhsEiaAddModal>
  </div>
</template>

<script lang="ts" name="eia-ehsEiaAdd" setup>
  import {ref, computed, unref} from 'vue';
  import {BasicTable, useTable, TableAction, BasicColumn} from '/@/components/Table';
  import {useModal} from '/@/components/Modal';
  import {useDrawer} from '/@/components/Drawer';
  import {useListPage} from '/@/hooks/system/useListPage'
  import EhsEiaAddModal from './components/EhsEiaAddModal.vue'
  import {columns, aduitColumns, searchFormSchema} from './EhsEiaAdd.data';
  import {list, deleteOne, batchDelete, getImportUrl, getExportUrl} from './EhsEiaAdd.api';
  import {downloadFile, render} from '/@/utils/common/renderUtils';
  import {picPreviewUrl, previewFile} from "/@/api/common/api";
  import {usePermission} from "/@/hooks/web/usePermission";
  const { hasPermission } = usePermission();

  const checkedKeys = ref<Array<string | number>>([]);
  const activeKey = ref('1');
  const showFooter = ref(true);

  //注册model
  const [registerModal, {openDrawer}] = useDrawer();
  //注册table数据
  const {prefixCls, tableContext, onExportXls, onImportXls} = useListPage({
    tableProps: {
      api: list,
      columns,
      canResize: false,
      useSearchForm: false,
      showIndexColumn: true,
      // setPagination:
      formConfig: {
        //labelWidth: 120,
        schemas: searchFormSchema,
        autoSubmitOnEnter: true,
        showAdvancedButton: false,
        fieldMapToNumber: [],
        fieldMapToTime: [],
        showResetButton: false,
        showSubmitButton: false,
      },
      beforeFetch(info) {
        info['addStatus'] = '0';
        return info;
      },
      actionColumn: {
        width: 120,
        fixed: 'right'
      },
    },
    exportConfig: {
      name: "ehs_eia_add",
      url: getExportUrl,
    },
    importConfig: {
      url: getImportUrl,
      success: handleSuccess
    },
  });

  const [registerTable, {reload},{ rowSelection, selectedRowKeys }] = tableContext;

  //注册table数据
  const {tableContext: auditTableContext} = useListPage({
    tableProps: {
      api: list,
      columns: aduitColumns,
      canResize: false,
      useSearchForm: false,
      showIndexColumn: true,
      formConfig: {
        schemas: searchFormSchema,
        autoSubmitOnEnter: true,
        showAdvancedButton: false,
        fieldMapToNumber: [],
        fieldMapToTime: [],
        showResetButton: false,
        showSubmitButton: false,
      },
      beforeFetch(info) {
        info['status'] = '1';
        return info;
      },
      afterFetch(result){
        result.forEach(e=>{
          if (e.attach == null || e.attach == undefined){
            e.attachPath = [];
          } else {
            e.attachPath = e.attach.split(',').map(e=>{
              return e.split('/').slice(-1)[0];
            });
          }
        });
        return result;
      },
      actionColumn: {
        width: 120,
        fixed: 'right'
      },
    }
  });
  //
  const [auditRegisterTable, { reload: auditReload }, {rowSelection: auditRowSelection, selectedRowKeys: auditSelectedRowKeys}] = auditTableContext;

  /**
   * 新增事件
   */
  // function handleAdd() {
  //    openModal(true, {
  //      isUpdate: false,
  //      showFooter: true,
  //    });
  // }
  /**
   * 编辑事件
   */
  function handleEdit(record: Recordable,titleCode) {
    showFooter.value = true;
    openDrawer(true, {
      record,
      isUpdate: true,
      showFooter: true,
      titleCode: titleCode
    });
  }

  /**
   * 详情
   */
  function handleDetail(record: Recordable,titleCode) {
    showFooter.value = true;
    openDrawer(true, {
      record,
      isUpdate: true,
      showFooter: false,
      titleCode: titleCode
    });
  }

  /**
   * 删除事件
   */
  async function handleDelete(record) {
    await deleteOne({id: record.id}, handleSuccess);
  }

  /**
   * 批量删除事件
   */
  async function batchHandleDelete() {
    await batchDelete({ids: selectedRowKeys.value}, handleSuccess);
  }

  /**
   * 成功回调
   */
  function handleSuccess() {
    (selectedRowKeys.value = []) && reload();
    auditReload();
  }

  /**
   * 操作栏
   */
  function getTableAction(record) {
    return [
      {
        label: '补充资料',
        onClick: handleEdit.bind(null, record,'1'),
        ifShow: () => {
          return hasPermission('projectadd:add') && activeKey.value == '1' && (record.addStatus == '0' || record.status == '3');
        },
      },
      {
        label: '审核',
        onClick: handleEdit.bind(null, record,'2'),
        ifShow: () => {
          return hasPermission('projectadd:audit') && activeKey.value == '2';
        },
      },
      {
        label: '查看',
        onClick: handleDetail.bind(null, record,'3'),
        ifShow: () => {
          return activeKey.value == '1';
        },
      },
    ]
  }

  /**
   * 下拉操作栏
   */
  function getDropDownAction(record) {
    return [
      {
        label: '详情',
        onClick: handleDetail.bind(null, record),
      },
      {
        label: '删除',
        popConfirm: {
          title: '是否确认删除',
          confirm: handleDelete.bind(null, record),
        }
      }
    ]
  }

  /**
   * 表格补充资料预览
   */
  function handlePreview(filePathParam) {
    if (filePathParam) {
      // filePathParam = picPreviewUrl + filePathParam;
      previewFile(filePathParam).then((res) => {
        window.open(res, '_blank');
      });
    }
  }

  /**
   * 侧滑栏change事件
   */
  function tabsChange(activeKey){
    if(activeKey =='1'){
      reload();
    } else {
      auditReload();
    }
  }


</script>

<style scoped>
  .projecteia {
    padding: 0 10px;
    border-radius: 2px;
    background-color: #ffffff;
  }
  .projecteia-form {
    padding: 12px 10px 6px;
  }

  .a-hover-underline:hover {
    text-decoration:underline;
  }
</style>
