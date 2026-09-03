<template>
  <div>
    <basic-modal v-bind="$attrs" @register="registerModal" :width="1400" title="修改" destroyOnClose>
      <basic-table @register="registerTable" :scroll="{ y: 235 }" style="margin-bottom: 20px">
        <template #riskLevel="{ record }">
          <div
            style="color: #fff"
            :class="
              record.riskLevel === '1'
                ? 'major'
                : record.riskLevel === '2'
                ? 'larger'
                : record.riskLevel === '3'
                ? 'generally'
                : record.riskLevel === '4'
                ? 'low'
                : ''
            "
            >{{
              record.riskLevel === '1' ? '重大风险' : record.riskLevel === '2' ? '较大风险' : record.riskLevel === '3' ? '一般风险' : '低风险'
            }}</div
          >
        </template>
        <template #action="{ record }">
          <table-action :actions="getActions(record)" />
        </template>
      </basic-table>
      <template #footer>
        <div>
          <a-button style="margin-right: 15px" @click="close">取消</a-button>
        </div>
      </template>
    </basic-modal>
  </div>
  <risk-evaluate-drawer @register="registerDrawer" @success="init" />
</template>
<script lang="ts" name="danger-source-modal" setup>
  import { BasicTable, TableAction } from '/@/components/Table';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { useListPage } from '/@/hooks/system/useListPage';
  import { nextTick, ref, computed } from 'vue';
  import { useDrawer } from '/@/components/Drawer';
  import riskEvaluateDrawer from '../riskEvaluate/drawer.vue';
  import { del } from '../riskEvaluate/url/index';
  import { queryById } from '../riskPointManagement/url/index';
  const [registerDrawer, { openDrawer }] = useDrawer();
  const id = ref('');
  const orgNameRowSpan = computed(() => getRowSpan(getDataSource(), 'orgName'));
  const departNameRowSpan = computed(() => getRowSpan(getDataSource(), 'departName'));
  const recogUnitRowSpan = computed(() => getRowSpan(getDataSource(), 'recogUnit'));
  const pointNameRowSpan = computed(() => getRowSpan(getDataSource(), 'pointName'));
  const checkItemRowSpan = computed(() => getRowSpan(getDataSource(), 'checkItem'));
  const workStepRowSpan = computed(() => getRowSpan(getDataSource(), 'workStep'));
  const columns: any = [
    {
      title: '所属单位',
      width: 150,
      align: 'center',
      dataIndex: 'orgName',
      customCell: (_, index: any) => {
        return {
          rowSpan: orgNameRowSpan.value[index],
        };
      },
    },
    {
      title: '所属车间',
      width: 150,
      align: 'center',
      dataIndex: 'departName',
      customCell: (_, index: any) => {
        return {
          rowSpan: departNameRowSpan.value[index],
        };
      },
    },
    {
      title: '辨识单元',
      width: 200,
      align: 'center',
      dataIndex: 'recogUnit',
      customCell: (_, index: any) => {
        return {
          rowSpan: recogUnitRowSpan.value[index],
        };
      },
    },
    {
      title: '设备设施',
      width: 150,
      align: 'center',
      dataIndex: 'pointName',
      customCell: (_, index: any) => {
        return {
          rowSpan: pointNameRowSpan.value[index],
        };
      },
    },
    {
      title: '检查项目',
      width: 150,
      align: 'center',
      dataIndex: 'checkItem',
      customCell: (_, index: any) => {
        return {
          rowSpan: checkItemRowSpan.value[index],
        };
      },
    },
    {
      title: '不符合标准情况及后果',
      width: 250,
      align: 'center',
      dataIndex: 'consequence',
    },
    {
      title: '标准',
      width: 250,
      align: 'center',
      dataIndex: 'standard',
    },
    {
      title: '可能发生的事故类型',
      width: 250,
      align: 'center',
      dataIndex: 'accidentType_dictText',
    },
    {
      title: '现有管控措施',
      children: [
        {
          title: '工程技术措施',
          width: 150,
          align: 'center',
          dataIndex: 'existingGcjsMsr',
        },
        {
          title: '组织管理措施',
          width: 150,
          align: 'center',
          dataIndex: 'existingZzglMsr',
        },
        {
          title: '培训教育措施',
          width: 150,
          align: 'center',
          dataIndex: 'existingPxjyMsr',
        },
        {
          title: '个体防护措施',
          width: 150,
          align: 'center',
          dataIndex: 'existingGrfhMsr',
        },
        {
          title: '应急处置措施',
          width: 150,
          align: 'center',
          dataIndex: 'existingYjclMsr',
        },
      ],
    },
    {
      title: '风险评价',
      children: [
        {
          title: '可能性',
          width: 100,
          align: 'center',
          dataIndex: 'evaluateL',
        },
        {
          title: '严重性',
          width: 100,
          align: 'center',
          dataIndex: 'evaluateC',
        },
        {
          title: '频次',
          width: 100,
          align: 'center',
          dataIndex: 'evaluateE',
        },
        {
          title: '风险值',
          width: 100,
          align: 'center',
          dataIndex: 'evaluateD',
        },
        {
          title: '评价级别',
          width: 150,
          align: 'center',
          dataIndex: 'riskLevel',
          slots: { customRender: 'riskLevel' },
        },
      ],
    },
    {
      title: '管控层级',
      width: 150,
      align: 'center',
      dataIndex: 'controlLevel',
    },
    {
      title: '改进措施',
      children: [
        {
          title: '工程技术措施',
          width: 150,
          align: 'center',
          dataIndex: 'improveGcjsMsr',
        },
        {
          title: '组织管理措施',
          width: 150,
          align: 'center',
          dataIndex: 'improveZzglMsr',
        },
        {
          title: '培训教育措施',
          width: 150,
          align: 'center',
          dataIndex: 'improvePxjyMsr',
        },
        {
          title: '个体防护措施',
          width: 150,
          align: 'center',
          dataIndex: 'improveGrfhMsr',
        },
        {
          title: '应急处置措施',
          width: 150,
          align: 'center',
          dataIndex: 'improveYjclMsr',
        },
      ],
    },
  ];
  const columns1: any = [
    {
      title: '所属单位',
      width: 150,
      align: 'center',
      dataIndex: 'orgName',
      customCell: (_, index: any) => {
        return {
          rowSpan: orgNameRowSpan.value[index],
        };
      },
    },
    {
      title: '所属车间',
      width: 150,
      align: 'center',
      dataIndex: 'departName',
      customCell: (_, index: any) => {
        return {
          rowSpan: departNameRowSpan.value[index],
        };
      },
    },
    {
      title: '辨识单元',
      width: 200,
      align: 'center',
      dataIndex: 'recogUnit',
      customCell: (_, index: any) => {
        return {
          rowSpan: recogUnitRowSpan.value[index],
        };
      },
    },
    {
      title: '作业活动',
      width: 150,
      align: 'center',
      dataIndex: 'pointName',
      customCell: (_, index: any) => {
        return {
          rowSpan: pointNameRowSpan.value[index],
        };
      },
    },
    {
      title: '作业步骤',
      width: 150,
      align: 'center',
      dataIndex: 'workStep',
      customCell: (_, index: any) => {
        return {
          rowSpan: workStepRowSpan.value[index],
        };
      },
    },
    {
      title: '危险源或潜在事件（人、物、作业环境、管理）',
      width: 350,
      align: 'center',
      dataIndex: 'dangerSource',
    },
    {
      title: '可能发生的事故类型',
      width: 250,
      align: 'center',
      dataIndex: 'accidentType_dictText',
    },
    {
      title: '现有管控措施',
      children: [
        {
          title: '工程技术措施',
          width: 150,
          align: 'center',
          dataIndex: 'existingGcjsMsr',
        },
        {
          title: '组织管理措施',
          width: 150,
          align: 'center',
          dataIndex: 'existingZzglMsr',
        },
        {
          title: '培训教育措施',
          width: 150,
          align: 'center',
          dataIndex: 'existingPxjyMsr',
        },
        {
          title: '个体防护措施',
          width: 150,
          align: 'center',
          dataIndex: 'existingGrfhMsr',
        },
        {
          title: '应急处置措施',
          width: 150,
          align: 'center',
          dataIndex: 'existingYjclMsr',
        },
      ],
    },
    {
      title: '风险评价',
      children: [
        {
          title: '可能性',
          width: 100,
          align: 'center',
          dataIndex: 'evaluateL',
        },
        {
          title: '严重性',
          width: 100,
          align: 'center',
          dataIndex: 'evaluateC',
        },
        {
          title: '频次',
          width: 100,
          align: 'center',
          dataIndex: 'evaluateE',
        },
        {
          title: '风险值',
          width: 100,
          align: 'center',
          dataIndex: 'evaluateD',
        },
        {
          title: '评价级别',
          width: 150,
          align: 'center',
          dataIndex: 'riskLevel',
          slots: { customRender: 'riskLevel' },
        },
      ],
    },
    {
      title: '管控层级',
      width: 150,
      align: 'center',
      dataIndex: 'controlLevel',
    },
    {
      title: '改进措施',
      children: [
        {
          title: '工程技术措施',
          width: 150,
          align: 'center',
          dataIndex: 'improveGcjsMsr',
        },
        {
          title: '组织管理措施',
          width: 150,
          align: 'center',
          dataIndex: 'improveZzglMsr',
        },
        {
          title: '培训教育措施',
          width: 150,
          align: 'center',
          dataIndex: 'improvePxjyMsr',
        },
        {
          title: '个体防护措施',
          width: 150,
          align: 'center',
          dataIndex: 'improveGrfhMsr',
        },
        {
          title: '应急处置措施',
          width: 150,
          align: 'center',
          dataIndex: 'improveYjclMsr',
        },
      ],
    },
  ];
  // 计算 rowSpan 的工具函数
  const getRowSpan = (data, field) => {
    const spans: any = [];
    let count = 0;
    data.forEach((record, i) => {
      if (i === 0 || record[field] !== data[i - 1][field]) {
        count = 1;
        let j = i + 1;
        while (j < data.length && data[j][field] === record[field]) {
          count++;
          j++;
        }
        spans[i] = count;
      } else {
        spans[i] = 0;
      }
    });
    return spans;
  };
  const { tableContext, operateRequest } = useListPage({
    tableProps: {
      dataSource: [],
      useSearchForm: false,
      columns: columns,
      pagination: false,
      indexColumnProps: {
        fixed: 'left',
      },
      actionColumn: {
        width: 200,
        title: '操作',
        dataIndex: 'action',
        slots: { customRender: 'action' },
        fixed: 'right',
      },
    },
  });
  const getActions = (record: any) => {
    return [
      {
        label: '编辑',
        auth: ['riskEvaluate:edit'],
        onClick: handleEdit.bind(null, record),
      },
      {
        label: '删除',
        auth: ['riskEvaluate:del'],
        onClick: handleDelete.bind(null, record),
      },
    ];
  };
  const [registerTable, { setTableData, getDataSource, setColumns }] = tableContext;
  const [registerModal, { closeModal }] = useModalInner(async (data) => {
    const obj = JSON.parse(JSON.stringify(data));
    id.value = obj.id;
    init();
    nextTick(() => {
      setColumns(data.type === '1' ? columns : columns1);
    });
  });
  const init = () => {
    queryById({ id: id.value }).then((res) => {
      if (res) {
        setTableData(res.sourceList);
      }
    });
  };
  const handleEdit = (data: any) => {
    openDrawer(true, {
      type: 'edit',
      title: '编辑',
      showOkBtn: true,
      showFooter: true,
      data,
      activeKey: data.type,
    });
  };
  const handleDelete = (data: any) => {
    operateRequest(
      () => del({ id: data.id }),
      {
        confirm: true,
        isBatch: false,
      },
      () => init()
    );
  };
  const close = () => {
    closeModal();
  };
</script>
<style lang="less" scoped>
  .major {
    background: rgb(200, 0, 22);
  }
  .larger {
    background: rgb(236, 115, 14);
  }
  .generally {
    background: rgb(220, 228, 15);
  }
  .low {
    background: rgb(29, 209, 255);
  }
</style>
