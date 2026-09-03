<template>
  <div>
    <BasicTable @register="registerTable">
      <!-- 操作列 -->
      <template #action="{ record }">
        <TableAction :actions="getActions(record)" />
      </template>
    </BasicTable>
    
    <!-- 详情弹窗 -->
    <ExamPlanDetailModal @register="registerDetailModal" />
  </div>
</template>

<script setup lang="ts" name="socialFacilitiesManage-examPlan">
  import { BasicTable, TableAction } from '/@/components/Table';
  import { useModal } from '/@/components/Modal';
  import { useListPage } from '/@/hooks/system/useListPage';
  import { getExamPlanList } from './examPlan.api';
  import ExamPlanDetailModal from './ExamPlanDetailModal.vue';
  import { columns, searchFormSchema } from './config';

  
  // 注册详情弹窗
  const [registerDetailModal, { openModal: openDetailModal }] = useModal();


  searchFormSchema[searchFormSchema.length - 2].rules = [
    { validator: dateValidStartDate, trigger: 'change' },
  ];
  searchFormSchema[searchFormSchema.length - 1].rules = [
    { validator: dateValidEndDate, trigger: 'change' },
  ];
 
  // 列表页面公共参数、方法
  const { tableContext } = useListPage({
    designScope: 'examPlan-list',
    tableProps: {
      api: getExamPlanList,
      columns: columns,
      formConfig: {
        schemas: searchFormSchema,
      },
      afterFetch: (res) => {
        if (res && res.length > 0) {
          // 数组按照planBeginTime倒叙
          res.sort((a: any, b: any) => {
            return new Date(b.planBeginTime).getTime() - new Date(a.planBeginTime).getTime();
          });
        }
      },
      beforeFetch: (params) => { 
        if(params.startTime) {
          params.planBeginTimeGte = params.startTime.split(',')[0]
          params.planBeginTimeLte = params.startTime.split(',')[1]
        }
        if(params.endTime) {
          params.planEndTimeGte = params.endTime.split(',')[0]
          params.planEndTimeLte = params.endTime.split(',')[1]
        }
        return params;
      },
      showIndexColumn: true,
      indexColumnProps: {
        fixed: 'left',
      },
      actionColumn: {
        width: 120,
        title: '操作',
        dataIndex: 'action',
        slots: { customRender: 'action' },
        // fixed: 'right',
      },
      rowKey: 'id',
      // rowSelection: { type: 'checkbox' },
    },
  });

  const [ registerTable, { getForm } ] = tableContext;

  function dateValidStartDate(rule: any, value: any, callback: any) { 
    let fromData = getForm().getFieldsValue();
    let startTime = 0;
    let endTime = 0;
    if(fromData.startTime) {
      startTime = new Date(fromData.startTime.split(',')[0]).getTime();
    }
    if(fromData.endTime) {
      endTime = new Date(fromData.endTime.split(',')[1]).getTime();
    }
    if(fromData.startTime && fromData.endTime) {
      if(startTime > endTime) {
        return Promise.reject('计划开始时间不能大于计划结束时间');
      }
      return Promise.resolve();
    } else {
      return Promise.resolve();
    }
  }
  function dateValidEndDate(rule: any, value: any, callback: any) { 
    let fromData = getForm().getFieldsValue();
    let startTime = 0;
    let endTime = 0;
    if(fromData.startTime) {
      startTime = new Date(fromData.startTime.split(',')[0]).getTime();
    }
    if(fromData.endTime) {
      endTime = new Date(fromData.endTime.split(',')[1]).getTime();
    }
    if(fromData.startTime && fromData.endTime) {
      if(endTime < startTime) {
        return Promise.reject('计划结束时间不能小于计划开始时间');
      }
      return Promise.resolve();
    } else {
      return Promise.resolve();
    }
  }

  /**
   * 获取操作按钮配置
   * @param record 记录数据
   */
  const getActions = (record: any) => {
    return [
      {
        label: '查看',
        onClick: () => handleView(record),
      },
    ];
  };

  /**
   * 查看详情
   * @param record 记录数据
   */
  const handleView = (record: any) => {
    openDetailModal(true, record);
  };
</script>

<style scoped lang="less">
  // 自定义样式
</style>