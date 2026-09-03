<template>
  <div>
    <basic-table @register="registerTable" :rowSelection="rowSelection">
      <template #tableTitle>
        <a-button preIcon="ant-design:plus-outlined" type="primary" v-auth="'govcheck:add'" @click="onAdd">新增</a-button>
        <a-button type="primary" v-show="selectedRowKeys.length > 0" ghost v-auth="'govcheck:del'" @click="batchDeal">批量删除</a-button>
      </template>
      <template #action="{ record }">
        <table-action :actions="getActions(record)" />
      </template>
      <template #file="{ record }">
        <div class="file">
          <!-- <template v-for="val in fileUrls(record.file)">
            <img :title="val.name" class="iconimg" @click="previewFiles(val)" src="../../../assets/images/doc.png" v-if="val.type == 'doc'" alt="" />
            <img :title="val.name" class="iconimg" @click="previewFiles(val)" :width="50" :src="val.url" v-else alt="" />
          </template> -->
          <span  @click="previewFiles(val)" v-for="val in fileUrls(record.file)">{{ val.name }}</span>
        </div>
      </template>
    </basic-table>
    <add-or-edit @register="registerAdd" @success="handleSuccess" />
  </div>
</template>
<script setup name="sm-enterpriseList" lang="ts">
  import { useContent } from './hooks/useContent';
  import addOrEdit from './addOrEdit.vue';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { BasicTable, TableAction } from '/@/components/Table';
  import { del } from './url/index';
  import {createImgPreview} from "/@/components/Preview";
   import { getFileAccessHttpUrl } from '/@/utils/common/compUtils';
  import { previewFile } from '/@/api/common/api';

  const { registerTable, onAdd, getActions, handleSuccess, registerAdd, rowSelection, selectedRowKeys } = useContent();
  const { createConfirm } = useMessage();

  const fileUrls = (str) => {
    let arr = str.split(',');
    arr = arr.map((item) => {
      let obj = {};
      if(['doc', 'docx', 'pdf', 'DOC', 'DOCX', 'PDF'].includes(item.split('.')[1])){
        obj = { url: item, type: 'doc', name: item };
      } else {
        obj = { url: getFileAccessHttpUrl(item), type: 'img', name: item };
      }
      return obj;
    });
    return arr;
  }
  const batchDeal = () => {
    createConfirm({
      iconType: 'warning',
      title: '删除',
      content: '确定要删除吗？',
      onOk: () => {
        return new Promise<void>((resolve, reject) => {
          del({ id: selectedRowKeys.value.join(',') })
            .then((res) => {
              if (res) {
                handleSuccess();
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
  const previewFiles = (val) => {
    if(val.type == 'doc') {
      previewFile(val.url).then((res) => {
        window.open(res, '_blank');
      });
      return;
    }
    createImgPreview({
      index: 0,
      imageList: [val.url],
      defaultWidth: 600,
      rememberState: true,
      scaleStep: 10
    });
  };
</script>
<style lang="less">
  .file{
    display: flex;
    margin-right: 10px;
    span{
      width: 100px;
      // 单行省略号
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
        display: inline-block;
        vertical-align: middle;
      color: #40a9ff;
    }
  }
  .iconimg{
    width: 30px;
    height: 30px;
    margin-right: 10px;
  }
</style>
