<template>
  <BasicTable @register="registerTable" :searchInfo="searchInfo" :columns="logColumns">
    <template #tableTitle>
      <div class="title-inner">
        <a-tabs defaultActiveKey="1" @change="tabChange" size="small">
          <a-tab-pane tab="登录日志" key="1"></a-tab-pane>
          <a-tab-pane tab="操作日志" key="2"></a-tab-pane>
        </a-tabs>
        <div class="count">
          <table>
            <tr><td>访问人数</td><td>内部人员</td><td>相关方</td></tr>
            <tr>
              <td>{{ stastics.innerEmployee + stastics.outerEmployee }}</td>
              <td><span>{{ stastics.innerEmployee }}</span></td>
              <td><span>{{ stastics.outerEmployee }}</span></td>
            </tr>
          </table>
        </div>
      </div>

    </template>
    <template #expandedRowRender="{ record }">
      <div v-if="searchInfo.logType == 2">
        <div style="margin-bottom: 5px">
          <a-badge status="success" style="vertical-align: middle" />
          <span style="vertical-align: middle">请求方法:{{ record.method }}</span></div
        >
        <div>
          <a-badge status="processing" style="vertical-align: middle" />
          <span style="vertical-align: middle">请求参数:{{ record.requestParam }}</span></div
        >
      </div>
    </template>
  </BasicTable>
</template>
<script lang="ts" name="monitor-log" setup>
  import { ref } from 'vue';
  import { BasicTable, useTable, TableAction } from '/@/components/Table';
  import { getLogList, logincount } from './log.api';
  import { columns, searchFormSchema, operationLogColumn } from './log.data';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useListPage } from '/@/hooks/system/useListPage';
  const { createMessage } = useMessage();
  const checkedKeys = ref<Array<string | number>>([]);

  const logColumns = ref<any>(columns);
  const searchInfo = { logType: '1' };
  const stastics = ref({
    innerEmployee: 0,
    outerEmployee: 0,
  });
  // 列表页面公共参数、方法
  const { prefixCls, tableContext } = useListPage({
    designScope: 'user-list',
    tableProps: {
      title: '日志列表',
      api: getLogList,
      expandRowByClick: true,
      showActionColumn: false,
      rowSelection: {
        columnWidth: 20,
      },
      beforeFetch: (params) => {
        logincount({
          beginTime: params.createTime_begin,
          endTime: params.createTime_end,
        }).then((res) => {
          stastics.value = res;
        });
        return params;
      },
      formConfig: {
        schemas: searchFormSchema,
        fieldMapToTime: [['fieldTime', ['createTime_begin', 'createTime_end'], 'YYYY-MM-DD']],
      },
    },
  });

  const [registerTable, { reload }] = tableContext;

  // 日志类型
  function tabChange(key) {
    searchInfo.logType = key;
    //update-begin---author:wangshuai ---date:20220506  for：[VUEN-943]vue3日志管理列表翻译不对------------
    if (key == '1') {
      logColumns.value = columns;
    } else {
      logColumns.value = operationLogColumn;
    }
    //update-end---author:wangshuai ---date:20220506  for：[VUEN-943]vue3日志管理列表翻译不对--------------
    reload();
  }

  /**
   * 选择事件
   */
  function onSelectChange(selectedRowKeys: (string | number)[]) {
    checkedKeys.value = selectedRowKeys;
  }
</script>
<style lang="less" scoped>
.title-inner { 
  display: flex;justify-content: space-between;align-items: center;margin-bottom: 5px;padding: 0 10px;width: 100%;
  .count {
    font-size: 14px;
    table{
      width: 100%; /* 占满父容器，可自定义如600px */
      border-collapse: collapse; /* 关键：合并单元格边框，避免双边框 */
      border-spacing: 0; /* 清除单元格间距，与collapse配合使用 */
      font-size: 14px;
      color: #333; /* 文字主色 */
      text-align: center;
      td{
        border: 1px solid #eaeaea;
        padding: 0 5px;
        span{
          font-size: 16px;
          font-weight: 600;
          color: #1890ff;
        }
      }
      
    }

  }
}
</style>
