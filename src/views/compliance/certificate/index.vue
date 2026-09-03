<template>
  <div>
    <!--引用表格-->
   <BasicTable @register="registerTable" :rowSelection="rowSelection">
     <!--插槽:table标题-->
      <template #tableTitle>
        <a-button type="primary" v-if="hasPermission('certificate:add')" @click="handleAdd" preIcon="ant-design:plus-outlined"> 新增</a-button>
        <a-dropdown v-if="hasPermission('certificate:remove')&&selectedRowKeys.length > 0">
          <template #overlay>
            <a-menu>
              <a-menu-item key="1" @click="batchHandleDelete">
                <Icon icon="ant-design:delete-outlined"></Icon>
                删除
              </a-menu-item>
            </a-menu>
          </template>
          <a-button>批量操作
            <Icon icon="mdi:chevron-down"></Icon>
          </a-button>
        </a-dropdown>
      </template>
       <!--操作栏-->
      <template #action="{ record }">
        <TableAction :actions="getTableAction(record)" :dropDownActions="getDropDownAction(record)"/>
      </template>
     <template #certificateName="{ record }">
       <div style="text-align: justify;word-break:break-all">
         <a class="a-hover-underline" v-for="(item,index) in record.certificateName" :key="index" style="color: #0091ff; cursor: pointer" @click="handlePreview( 'certificate/'+item)">
           {{item}};
         </a>
       </div>
     </template>
    </BasicTable>
    <!-- 表单区域 -->
    <CertificateModal @register="registerModal" @success="handleSuccess"></CertificateModal>
    <CertificateUpdate @register="registerUpdate" @success="handleSuccess"></CertificateUpdate>
  </div>
</template>

<script lang="ts" name="menu-menuOperLog" setup>
  import {ref, computed, unref, onMounted} from 'vue';
  import {BasicTable, useTable, TableAction} from '/@/components/Table';
  import {useModal} from '/@/components/Modal';
  import { useListPage } from '/@/hooks/system/useListPage'
  import CertificateModal from './components/certificateModal.vue'
  import CertificateUpdate from './components/certificateUpdate.vue'
  import {columns, searchFormSchema} from './certificate.data';
  import {list, deleteOne, batchDelete, getImportUrl,getExportUrl} from './certificate.api';
  import { downloadFile } from '/@/utils/common/renderUtils';
  import {usePermission} from "/@/hooks/web/usePermission";
  import {previewFile} from "/@/api/common/api";
  import {useUserStore} from "/@/store/modules/user";
  const { hasPermission } = usePermission();
  const checkedKeys = ref<Array<string | number>>([]);
  //注册model
  const [registerModal, {openModal}] = useModal();
  const [registerUpdate, {openModal: openUpdate}] = useModal();
  //注册table数据
  const {prefixCls, tableContext, onExportXls, onImportXls} = useListPage({
    tableProps: {
      api: list,
      columns,
      canResize: false,
      formConfig: {
        //labelWidth: 120,
        schemas: searchFormSchema,
        autoSubmitOnEnter: true,
        showAdvancedButton: true,
        fieldMapToNumber: [],
        fieldMapToTime: [],
        resetFunc: ()=>{
          const searchForm = getForm();
          if(isSecuritySector == '0') {
            searchForm.setFieldsValue({
              orgCode: orgCode,
            });
          }
        }
      },
      afterFetch(result){
        result.forEach(e=>{
          if (e.certificatePath == null || e.certificatePath == undefined){
            e.certificateName = [];
          } else {
            e.certificateName = e.certificatePath.split(',').map(e=>{
              return e.split('/').slice(-1)[0];
            });
          }
        });
        return result;
      },
      actionColumn: {
        width: 180,
        fixed: 'right'
      },
    },
    exportConfig: {
      name: "系统访问统计",
      url: getExportUrl,
    },
    importConfig: {
      url: getImportUrl,
      success: handleSuccess
    },
  });

  const [registerTable, {reload ,getForm},{ rowSelection, selectedRowKeys }] = tableContext;
  const userStore = useUserStore();
  const userinfo = computed(() => userStore.getUserInfo);
  const loginInfo = computed(() => userStore.getLoginInfo);
  let isSecuritySector = loginInfo.value.departs[0].isSecuritySector;
  const orgCode = userinfo.value.orgCode.length > 6 ? userinfo.value.orgCode.slice('0', '6') : userinfo.value.orgCode;
  onMounted(() => {
    if(isSecuritySector == '0') {
      const searchForm = getForm();
      searchForm.updateSchema({
        field: 'orgCode',
        componentProps: {
          allowClear: false,
        },
      });
      searchForm.setFieldsValue({
        orgCode: orgCode,
      });
    }
  });

   /**
    * 新增事件
    */
  function handleAdd() {
     openModal(true, {
       isUpdate: false,
       showFooter: true,
     });
  }
   /**
    * 编辑事件
    */
  function handleEdit(record: Recordable) {
     openModal(true, {
       record,
       isUpdate: true,
       showFooter: true,
     });
   }
   /**
    * 详情
   */
  function handleDetail(record: Recordable) {
     openModal(true, {
       record,
       isUpdate: true,
       showFooter: false,
     });
   }
   /**
    * 删除事件
    */
  async function handleDelete(record) {
     await deleteOne({id: record.id}, handleSuccess);
   }
  /**
   * 编辑事件
   */
  function handleUpdate(record: Recordable) {
    openUpdate(true, {
      record,
      isUpdate: true,
      showFooter: true,
    });
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
   }
   /**
      * 操作栏
      */
  function getTableAction(record){
       return [
         {
           label: '查看',
           onClick: handleDetail.bind(null, record),
         },
         {
           label: '编辑',
           onClick: handleEdit.bind(null, record),
           ifShow: () => hasPermission('certificate:edit'),
         },
         {
           label: '删除',
           popConfirm: {
             title: '是否确认删除',
             confirm: handleDelete.bind(null, record),
           },
           ifShow: () => hasPermission('certificate:remove'),
         },
         {
           label: '更新',
           onClick: handleUpdate.bind(null, record),
           ifShow: () => hasPermission('certificate:update'),
         },
       ]
   }

  /**
   * 下拉操作栏
   */
  function getDropDownAction(record) {
    return []
  }

  /**
   * 表格文件预览
   */
  function handlePreview(filePathParam) {
    if (filePathParam) {
      previewFile(filePathParam).then((res) => {
        window.open(res, '_blank');
      });
    }
  }


</script>

<style scoped>

</style>
