<template>
  <div>
    <!--引用表格-->
   <BasicTable @register="registerTable">
     <!--插槽:table标题-->
      <template #tableTitle>
        <a-button type="primary" v-if="hasPermission('device:add')" @click="handleAdd" > 新增</a-button>
<!--          <a-button type="primary" @click="handlePlanWiths" > 关联计划</a-button>-->
        <j-upload-button v-if="hasPermission('device:import')" type="primary" @click="onImportXls">导入</j-upload-button>
        <a-button v-if="hasPermission('device:export')" type="primary" @click="onExportXls" > 导出</a-button>
        <a-button type="primary" @click="download">导入模版</a-button>
      </template>
       <!--操作栏-->
      <template #action="{ record }">
        <TableAction :actions="getTableAction(record)" :dropDownActions="getDropDownAction(record)"/>
      </template>
     <template #maintenancePlanName="{ record }">
       <div style="text-align: justify;word-break:break-all">
         <a class="a-hover-underline" style="color: #0091ff; cursor: pointer" @click="handlePlanDetail(record.maintenancePlanId)">
           {{record.maintenancePlanName}}
         </a>
       </div>
     </template>
    </BasicTable>
    <!-- 表单区域 -->
    <DeviceModal @register="registerModal" @success="handleSuccess"></DeviceModal>
    <PlanWith @register="registerPlanWiths" @success="handleSuccess"></PlanWith>
    <PlanModal @register="registerPlanModal" @success="handleSuccess"></PlanModal>
  </div>
</template>

<script lang="ts" name="compliance-device" setup>
  import {ref, computed, unref} from 'vue';
  import {BasicTable, useTable, TableAction} from '/@/components/Table';
  import {useModal} from '/@/components/Modal';
  import { useListPage } from '/@/hooks/system/useListPage'
  import DeviceModal from './components/deviceModal.vue'
  import PlanWith from './components/planWith.vue'
  import PlanModal from '/@/views/periodicClean/plan/PlanModal.vue';
  import {columns, searchFormSchema} from './device.data';
  import {list, deleteOne, batchDelete, getImportUrl,getExportUrl,getPlanById} from './device.api';
  import { downloadFile } from '/@/utils/common/renderUtils';
  import {usePermission} from "/@/hooks/web/usePermission";
  import {previewFile} from "/@/api/common/api";
  import {useMessage} from "/@/hooks/web/useMessage";
  import dayjs from "dayjs";
  import {defHttp} from "/@/utils/http/axios";
  import {useUserStore} from "/@/store/modules/user";
  const { createConfirm } = useMessage();
  const { hasPermission } = usePermission();
  const checkedKeys = ref<Array<string | number>>([]);
  //注册model
  const [registerModal, {openModal}] = useModal();
  const [registerPlanWiths, {openModal: openPlanWiths}] = useModal();
  const [registerPlanModal, {openModal: openPlanModal}] = useModal();
  //注册table数据
  const {prefixCls, tableContext, onExportXls, onImportXls} = useListPage({
    tableProps: {
      api: list,
      columns,
      canResize: false,
      showIndexColumn: true,
      formConfig: {
        //labelWidth: 120,
        schemas: searchFormSchema,
        autoSubmitOnEnter: true,
        showAdvancedButton: true,
        fieldMapToNumber: [],
        fieldMapToTime: [],
        labelWidth: 120,
        resetFunc: ()=>{
          const searchForm = getForm();
          if(isSecuritySector == '0') {
            searchForm.setFieldsValue({
              orgCode: orgCode,
              belongingAreaCode: orgCode,
            });
          }
        }
      },
      beforeFetch(info){
        if(isSecuritySector == '0'){
          info['orgCode'] = orgCode;
          info['belongingAreaCode'] = orgCode;
        }
        return info;
      },
      afterFetch(result){
        // result.forEach(e=>{
        //   if (e.certificatePath == null || e.certificatePath == undefined){
        //     e.certificateName = [];
        //   } else {
        //     e.certificateName = e.certificatePath.split(',').map(e=>{
        //       return e.split('/').slice(-1)[0];
        //     });
        //   }
        // });
        return result;
      },
      actionColumn: {
        width: 210,
        fixed: 'right'
      },
    },
    exportConfig: {
      name: `环保治理设备${dayjs().format("YYYYMMDD")}`,
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
  const orgOptions = ref<any>([]);
  async function getOrgList() {
    await defHttp.get({url: '/jn/common/getDepartByNameOrOrgCodeOrId',params: {'orgCode': orgCode}}).then((res) => {
      res.forEach(item=>{
        if(item.isSecuritySector == '1'){
          isSecuritySector = '1';
        }
      })
    });
    await defHttp.get({ url: '/jn/common/getOrganizationNew' }).then((res) => {
      res.map((item) => {
        orgOptions.value.push({
          label: item.departName,
          value: item.orgCode,
        });
      });
      const searchForm = getForm();
      searchForm.updateSchema({
        field: 'orgCode',
        componentProps: {
          options: orgOptions,
          disabled: isSecuritySector == '0',
        },
      });
      searchForm.updateSchema({
        field: 'belongingAreaCode',
        componentProps: {
          options: orgOptions,
          disabled: isSecuritySector == '0',
        },
      });
      if(isSecuritySector == '0') {
        searchForm.setFieldsValue({
          orgCode: orgCode,
          belongingAreaCode: orgCode,
        });
      }
      reload()
    });
  }
  getOrgList();

  //查看清理计划详情
  async function handlePlanDetail(id) {
    const res = await getPlanById({ id: id,type: 'web' });
    openPlanModal(true, {
      isUpdate: true,
      showFooter: false,
      record: res,
      type: '3', // 查看
    });
  }
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
  //  /**
  //   * 删除事件
  //   */
  // async function handleDelete(record) {
  //    await deleteOne({id: record.id}, handleSuccess);
  //  }
  /**
   * 关联计划
   */
  function handlePlanWiths(record: Recordable) {
    openPlanWiths(true, {
      record,
      isUpdate: true,
      showFooter: true,
    });
  }
  /**
   * 删除事件
   */
  function handleDelete(record) {
    createConfirm({
      iconType: 'warning',
      title: '删除',
      content: '确定要删除吗？',
      onOk: () => {
        deleteOne({ id: record.id }, reload);
      },
      onCancel() {},
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
           ifShow: () => hasPermission('device:edit'),
         },
         {
           label: '关联计划',
           onClick: handlePlanWiths.bind(null, record),
           ifShow: () => hasPermission('device:planWith'),
         },
         {
           label: '删除',
           onClick: handleDelete.bind(null,record),
           // popConfirm: {
           //   title: '是否确认删除',
           //   confirm: handleDelete.bind(null, record),
           // },
           ifShow: () => hasPermission('device:remove'),
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
  const download = () => {
    const link: any = document.createElement('a');
    // link.href = '/files/accidentInvestigationReport.docx';
    link.href = '/files/环保治理设备导入模板.xlsx';
    link.download = '环保治理设备-模板.xlsx';
    link.style.display = 'none';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

</script>

<style scoped>

</style>
