<template>
  <basic-modal v-bind="$attrs" @register="registerModal" :width="1600" :title="title" destroyOnClose>
    <div v-if="type === 'view'">
      <div style="display: flex">
        <div style="width: 360px"
          >标题：<span style="font-weight: bold; font-size: 16px">{{ name }}</span></div
        >
      </div>
      <div v-for="(item, index) in logList" :key="index" style="border: 1px solid #e8e8e8; padding: 10px; border-radius: 5px; margin-top: 15px">
        <div style="display: flex">
          <div>{{ applyType === '1' ? '评审人员' : '审核人员' }}：{{ item.handlerName }}</div>
          <div style="margin-left: 100px">评审时间：{{ item.handleTime }}</div>
        </div>
      </div>
    </div>
    <basic-table @register="registerTable" :loading="tableLoading">
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
          >{{ record.riskLevel === '1' ? '重大风险' : record.riskLevel === '2' ? '较大风险' : record.riskLevel === '3' ? '一般风险' : '低风险' }}</div
        >
      </template>
      <template #reviewOpinion="{ record }">
        <InputTextArea v-if="type === 'review'" v-model:value="record.reviewOpinion" placeholder="请输入" autoSize :maxlength="500" />
        <span v-else>{{ record.reviewOpinion }}</span>
      </template>
      <template #auditOpinion="{ record }">
        <InputTextArea v-if="type === 'review'" v-model:value="record.auditOpinion" placeholder="请输入" autoSize :maxlength="500" />
        <span v-else>{{ record.auditOpinion }}</span>
      </template>
    </basic-table>
    <template #footer>
      <div style="text-align: right">
        <a-button style="margin-right: 15px" @click="close">取消</a-button>
        <a-button v-if="type !== 'view'" type="primary" :loading="loading" @click="confirmClose">提交</a-button>
      </div>
    </template>
  </basic-modal>
</template>
<script lang="ts" name="review-release-modal" setup>
  import { BasicTable } from '/@/components/Table';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { useListPage } from '/@/hooks/system/useListPage';
  import { ref, nextTick } from 'vue';
  import { review, audit, queryById } from './url/index';
  import { Input } from 'ant-design-vue';
  const emit = defineEmits(['success']);
  const InputTextArea = Input.TextArea;
  const loading = ref(false);
  const tableLoading = ref(false);
  const title = ref('');
  const type = ref('');
  const name = ref('');
  const applyType = ref('');
  const logList: any = ref([]);
  const id = ref('');
  const columns: any = [
    {
      title: '所属单位',
      width: 150,
      align: 'center',
      dataIndex: 'orgName',
    },
    {
      title: '所属车间',
      width: 150,
      align: 'center',
      dataIndex: 'departName',
    },
    {
      title: '辨识单元',
      width: 200,
      align: 'center',
      dataIndex: 'recogUnit',
    },
    {
      title: '风险点',
      width: 150,
      align: 'center',
      dataIndex: 'pointName',
    },
    {
      title: '风险类别',
      width: 150,
      align: 'center',
      dataIndex: 'type',
      customRender: ({ text }) => {
        return text === '1' ? '设备设施' : '作业活动';
      },
    },
    {
      title: '风险因素',
      width: 250,
      align: 'center',
      dataIndex: 'riskFactor',
    },
    {
      title: '可能导致的事故类型',
      width: 250,
      align: 'center',
      dataIndex: 'accidentType',
    },
    {
      title: '风险分级',
      width: 150,
      align: 'center',
      dataIndex: 'riskLevel',
      slots: { customRender: 'riskLevel' },
    },
    {
      title: '现有管控措施',
      children: [
        {
          title: '工程技术措施',
          width: 250,
          align: 'center',
          dataIndex: 'existingGcjsMsr',
        },
        {
          title: '组织管理措施',
          width: 250,
          align: 'center',
          dataIndex: 'existingZzglMsr',
        },
        {
          title: '培训教育措施',
          width: 250,
          align: 'center',
          dataIndex: 'existingPxjyMsr',
        },
        {
          title: '个体防护措施',
          width: 250,
          align: 'center',
          dataIndex: 'existingGrfhMsr',
        },
        {
          title: '应急处置措施',
          width: 250,
          align: 'center',
          dataIndex: 'existingYjclMsr',
        },
      ],
    },
    {
      title: '责任部门',
      width: 200,
      align: 'center',
      dataIndex: 'dutyDepart',
    },
    {
      title: '责任人',
      width: 200,
      align: 'center',
      dataIndex: 'dutyPerson',
    },
    {
      title: '状态',
      width: 150,
      align: 'center',
      dataIndex: 'status',
      customRender: ({ text }) => {
        return text === '0' ? '待评审' : text === '1' ? '评审中' : text === '2' ? '待审核' : text === '3' ? '审核中' : '已发布';
      },
    },
    {
      title: '评审意见',
      width: 300,
      align: 'center',
      dataIndex: 'reviewOpinion',
      slots: { customRender: 'reviewOpinion' },
    },
  ];
  const columns1: any = [
    {
      title: '所属单位',
      width: 150,
      align: 'center',
      dataIndex: 'orgName',
    },
    {
      title: '所属车间',
      width: 150,
      align: 'center',
      dataIndex: 'departName',
    },
    {
      title: '辨识单元',
      width: 200,
      align: 'center',
      dataIndex: 'recogUnit',
    },
    {
      title: '风险点',
      width: 150,
      align: 'center',
      dataIndex: 'pointName',
    },
    {
      title: '风险类别',
      width: 150,
      align: 'center',
      dataIndex: 'type',
      customRender: ({ text }) => {
        return text === '1' ? '设备设施' : '作业活动';
      },
    },
    {
      title: '风险因素',
      width: 250,
      align: 'center',
      dataIndex: 'riskFactor',
    },
    {
      title: '可能导致的事故类型',
      width: 250,
      align: 'center',
      dataIndex: 'accidentType',
    },
    {
      title: '风险分级',
      width: 150,
      align: 'center',
      dataIndex: 'riskLevel',
      slots: { customRender: 'riskLevel' },
    },
    {
      title: '现有管控措施',
      children: [
        {
          title: '工程技术措施',
          width: 250,
          align: 'center',
          dataIndex: 'existingGcjsMsr',
        },
        {
          title: '组织管理措施',
          width: 250,
          align: 'center',
          dataIndex: 'existingZzglMsr',
        },
        {
          title: '培训教育措施',
          width: 250,
          align: 'center',
          dataIndex: 'existingPxjyMsr',
        },
        {
          title: '个体防护措施',
          width: 250,
          align: 'center',
          dataIndex: 'existingGrfhMsr',
        },
        {
          title: '应急处置措施',
          width: 250,
          align: 'center',
          dataIndex: 'existingYjclMsr',
        },
      ],
    },
    {
      title: '责任部门',
      width: 200,
      align: 'center',
      dataIndex: 'dutyDepart',
    },
    {
      title: '责任人',
      width: 200,
      align: 'center',
      dataIndex: 'dutyPerson',
    },
    {
      title: '状态',
      width: 150,
      align: 'center',
      dataIndex: 'status',
      customRender: ({ text }) => {
        return text === '0' ? '待评审' : text === '1' ? '评审中' : text === '2' ? '待审核' : text === '3' ? '审核中' : '已发布';
      },
    },
    {
      title: '审核意见',
      width: 300,
      align: 'center',
      dataIndex: 'auditOpinion',
      slots: { customRender: 'auditOpinion' },
    },
  ];
  const { tableContext } = useListPage({
    tableProps: {
      dataSource: [],
      useSearchForm: false,
      showActionColumn: false,
      showIndexColumn: true,
      columns: columns,
      indexColumnProps: {
        fixed: 'left',
      },
    },
  });
  const [registerTable, { setTableData, setColumns, getDataSource }] = tableContext;
  const [registerModal, { closeModal }] = useModalInner(async (data) => {
    title.value = data.title;
    name.value = data.data.title;
    type.value = data.type;
    applyType.value = data.data.applyType;
    id.value = data.data.id;
    logList.value = [];
    nextTick(() => {
      setColumns(applyType.value === '1' ? columns : columns1);
    });
    tableLoading.value = true;
    loading.value = true;
    queryById({
      id: id.value,
    })
      .then((res) => {
        if (res) {
          logList.value = res.logList;
          const data = res.pointList.map((item) => {
            if (type.value === 'review') {
              item.reviewOpinion = '';
              item.auditOpinion = '';
            }
            return item;
          });
          setTableData(data);
          tableLoading.value = false;
          loading.value = false;
        }
      })
      .catch(() => {
        tableLoading.value = false;
        loading.value = false;
      });
  });
  const confirmClose = async () => {
    let data = JSON.parse(JSON.stringify(getDataSource()));
    data = data.map((item) => {
      return {
        id: item.id,
        opinion: applyType.value === '1' ? item.reviewOpinion : item.auditOpinion,
      };
    });
    loading.value = true;
    if (applyType.value === '1') {
      review({
        applyId: id.value,
        pointList: data,
      })
        .then(() => {
          //关闭弹窗
          closeModal();
          //刷新列表
          emit('success');
        })
        .finally(() => {
          loading.value = false;
        });
    } else {
      audit({
        applyId: id.value,
        pointList: data,
      })
        .then(() => {
          //关闭弹窗
          closeModal();
          //刷新列表
          emit('success');
        })
        .finally(() => {
          loading.value = false;
        });
    }
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
