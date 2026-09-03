<template>
  <BasicModal v-bind="$attrs" @register="registerModal" destroyOnClose :title="title" :width="1300">
    <div style="text-align: center;font-size: 18px;">{{month}}月节能减排改造项目</div>
    <!--引用表格-->
    <BasicTable @register="registerTable">
      <!--插槽:table标题-->
      <template #tableTitle>
        <a-button  type="primary" preIcon="ant-design:export-outlined" @click="onExportXls"> 导出</a-button>
      </template>
      <!--操作栏-->
      <template #action="{ record }">
        <TableAction :actions="getTableAction(record)"/>
      </template>
      <template #invoiceName="{ record }">
        <div style="text-align: justify;word-break:break-all">
          <a class="a-hover-underline" v-for="(item,index) in record.invoiceName"
             :key="index" style="color: #0091ff; cursor: pointer"
             @click="handlePreviewFile( 'deviceManage/'+item)">
            {{item}};
          </a>
        </div>
      </template>
      <template #beforeRenovation="{ record }">
        <img v-if="record.beforeRenovation" :src="fmtImg(record.beforeRenovation)" style="cursor: pointer;display: inline-block;width:40px;height:40px;" @click="openImg(record.beforeRenovation,0)" />
        <img v-if="isfmtImg2(record.beforeRenovation)" :src="fmtImg2(record.beforeRenovation)" style="cursor: pointer;display: inline-block;width:40px;height:40px;" @click="openImg(record.beforeRenovation,1)" />
        <span v-if="!record.beforeRenovation">无</span>
      </template>
      <template #afterRenovation="{ record }">
        <img v-if="record.afterRenovation" :src="fmtImg(record.afterRenovation)" style="cursor: pointer;display: inline-block;width:40px;height:40px;" @click="openImg(record.afterRenovation,0)" />
        <img v-if="isfmtImg2(record.afterRenovation)" :src="fmtImg2(record.afterRenovation)" style="cursor: pointer;display: inline-block;width:40px;height:40px;" @click="openImg(record.afterRenovation,1)" />
        <span v-if="!record.afterRenovation">无</span>
      </template>
    </BasicTable>
    <!-- 表单区域 -->
  </BasicModal>
</template>

<script lang="ts" name="deviceManage" setup>
  import {ref, computed, unref} from 'vue';
  import {BasicTable, useTable, TableAction, BasicColumn, FormSchema} from '/@/components/Table';
  import {BasicModal, useModal, useModalInner} from '/@/components/Modal';
  import {useListPage} from '/@/hooks/system/useListPage'
  import {list, deleteOne, getExportUrl} from '../url/index';
  import {downloadFile, render} from '/@/utils/common/renderUtils';
  import {usePermission} from "/@/hooks/web/usePermission";
  import {previewFile} from "/@/api/common/api";
  import {UploadProps} from "ant-design-vue";
  import {getFileAccessHttpUrl} from "/@/utils/common/compUtils";
  import {createImgPreview} from "/@/components/Preview";
  import { useMessage } from '/@/hooks/web/useMessage';
  const { createConfirm } = useMessage();

  const {hasPermission} = usePermission();
  const checkedKeys = ref<Array<string | number>>([]);
  const title = ref<String>("查看详情");
  const year = ref<String>("");
  const month = ref<String>("");
  //图片预览
  function fmtImg(record:any){
    const firstImg = record.split(',')[0];
    return getFileAccessHttpUrl(firstImg)
  }
  function fmtImg2(record:any){
    const firstImg = record.split(',')[1];
    return getFileAccessHttpUrl(firstImg)
  }
  function isfmtImg2(record:any){
    return record && record.split(',').length >1
  }
  function openImg(record,index) {
    // const onImgLoad = ({ index, url, dom }) => {
    //   console.log(`第${index + 1}张图片已加载，URL为：${url}`, dom);
    // };
    let imageList = record.split(',').map((i) => getFileAccessHttpUrl(i));
    createImgPreview({
      index: index,
      imageList: imageList,
      defaultWidth: 600,
      rememberState: true,
      scaleStep: 10
      // onImgLoad
    });
  }
  const [registerModal, {setModalProps, closeModal}] = useModalInner(async (data) => {
    year.value = data.year;
    month.value = data.month;
    //重置表单
    setModalProps({
      confirmLoading: false,
      showCancelBtn: true,
      showOkBtn: false
    });
  });

  const columns: BasicColumn[] = [
    {
      title: '汇报单位',
      align: "center",
      dataIndex: 'orgCode',
    },
    {
      title: '改造项目',
      align: "center",
      dataIndex: 'renovationProject'
    },
    {
      title: '项目内容',
      align: "center",
      dataIndex: 'projectContent',
    },
    {
      title: '节能减排种类',
      align: "center",
      dataIndex: 'renovationType',
    },
    {
      title: '节能减排数量',
      align: "center",
      dataIndex: 'renovationNum',
    },
    {
      title: '改造日期',
      align: "center",
      dataIndex: 'renovationDate',
    },
    {
      title: '改造前照片',
      align: 'center',
      dataIndex: 'beforeRenovation',
      slots: { customRender: 'beforeRenovation' }
    },
    {
      title: '改造后照片',
      align: 'center',
      dataIndex: 'afterRenovation',
      slots: { customRender: 'afterRenovation' }
    },
    {
      title: '金额',
      align: "center",
      dataIndex: 'amount',
    },
    {
      title: '发票',
      align: "center",
      dataIndex: 'invoice',
      slots: {customRender :'invoiceName'},
    },
  ];

  //表单数据
  const formSchema: FormSchema[] = [
    {
      label: '年',
      field: 'year',
      component: 'Input',
      show: false,
      defaultValue: year,
    },
    {
      label: '方法名称',
      field: 'month',
      component: 'Input',
      show: false,
      defaultValue: month,
    },
  ];

  //注册table数据
  const {prefixCls, tableContext, onExportXls, onImportXls} = useListPage({
    tableProps: {
      api: list,
      columns,
      canResize: false,
      showIndexColumn: true,
      formConfig: {
        //labelWidth: 120,
        schemas: formSchema,
        autoSubmitOnEnter: true,
        showAdvancedButton: true,
        showActionButtonGroup: false,
        fieldMapToNumber: [],
        fieldMapToTime: []
      },
      afterFetch(result) {
        result.forEach(e => {
          if (e.invoice == null || e.invoice == undefined || e.invoice == '') {
            e.invoiceName = [];
          } else {
            e.invoiceName = e.invoice.split(',').map(e => {
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
    },
    exportConfig: {
      name: "节能减排改造项目",
      url: getExportUrl,
    },
  });

  const [registerTable, {reload}, {rowSelection, selectedRowKeys}] = tableContext;

  /**
   * 删除事件
   */
  async function handleDelete(record) {
    await deleteOne({id: record.id}, handleSuccess);
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
  function getTableAction(record) {
    return [
      {
        label: '删除',
        popConfirm: {
          title: '是否确认删除',
          confirm: handleDelete.bind(null, record),
        },
        // ifShow: () => hasPermission('deviceManage:remove'),
      },
    ]
  }

  /**
   * 表格文件预览
   */
  function handlePreviewFile(filePathParam) {
    if (filePathParam) {
      previewFile(filePathParam).then((res) => {
        window.open(res, '_blank');
      });
    }
  }


</script>

<style scoped>

  /deep/.ant-table-title {
    min-height: 0 !important;
  }
  /deep/.jeecg-basic-table-form-container .ant-form{
    padding: 0 !important;
  }
</style>
