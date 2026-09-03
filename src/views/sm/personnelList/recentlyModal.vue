<template>
  <basic-modal v-bind="$attrs" @register="registerModal" wrapClassName="camera-modal" :width="1300" title="近七日更新" :footer="false" destroyOnClose>
    <basic-table @register="registerTable" />
  </basic-modal>
</template>
<script lang="ts" name="personnel" setup>
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicTable } from '/@/components/Table';
  import { useListPage } from '/@/hooks/system/useListPage';
  import { list } from './url/index';
  import { h } from 'vue';
  import { BasicColumn, FormSchema } from '/@/components/Table';
  const searchFormSchema: FormSchema[] = [
    {
      label: '姓名',
      field: 'name',
      component: 'Input',
      colProps: { span: 6 },
    },
  ];
  const columns: BasicColumn[] = [
    {
      title: '企业名称',
      dataIndex: 'companyName',
    },
    {
      title: '姓名',
      dataIndex: 'name',
    },
    {
      title: '工号',
      dataIndex: 'workNo',
    },
    {
      title: '联系方式',
      dataIndex: 'phone',
      width: 200,
    },
    {
      title: '身份证号',
      dataIndex: 'idNumber',
      width: 200,
    },
    {
      title: '健康状况',
      dataIndex: 'healthStatus',
    },
    {
      title: '账号状态',
      dataIndex: 'status',
      customRender: ({ text }) => {
        return h('span', { style: { color: text === '2' ? 'red' : '' } }, text === '1' ? '正常' : text === '2' ? '冻结' : '');
      },
    },
    {
      title: '证书状态',
      dataIndex: 'certificateStatus',
      customRender: ({ text }) => {
        return h('span', { style: { color: text === '2' ? 'red' : '' } }, text === '1' ? '正常' : text === '2' ? '过期' : '');
      },
    },
    {
      title: '保险期限',
      dataIndex: 'insuranceStatus',
      customRender: ({ text }) => {
        return h('span', { style: { color: text === '2' ? 'red' : '' } }, text === '1' ? '有效' : text === '2' ? '过期' : '');
      },
    },
    {
      title: '教育培训状态',
      dataIndex: 'trainDateStart',
    },
    {
      title: '资质状态',
      dataIndex: 'aptitudeStatus',
      customRender: ({ text }) => {
        return h(
          'span',
          { style: { color: text === '2' ? '#FFA500' : text === '3' ? 'red' : '' } },
          text === '1' ? '正常' : text === '2' ? '限制进厂' : text === '3' ? '离场' : text === '4' ? '未进场' : ''
        );
      },
    },
    {
      title: '分数',
      dataIndex: 'score',
    },
    {
      title: '当前项目',
      width: 200,
      dataIndex: 'projectName',
    },
    {
      title: '当前所属发包单位',
      width: 200,
      dataIndex: 'publishName',
    },
  ];
  // 列表页面公共参数、方法
  const { tableContext } = useListPage({
    tableProps: {
      api: list,
      columns,
      formConfig: {
        schemas: searchFormSchema,
      },
      defSort: {
        column: 'updateTime',
        order: 'desc',
      },
      showActionColumn: false,
      beforeFetch: (params) => {
        params.blackFlag = '0';
        params.recentFlag = '1';
        return params;
      },
    },
  });
  const [registerTable] = tableContext;
  const [registerModal] = useModalInner();
</script>
<style lang="less" scoped>
  /deep/.ant-table-title {
    display: none;
  }
</style>
