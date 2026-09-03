<template>
  <BasicModal v-bind="$attrs" @register="registerModal" title="检修计划详情" :width="1200" :canFullscreen="false" @ok="handleOk">
    <div class="detail-container">
      <a-spin :spinning="loading">
        <a-descriptions :column="3">
          <a-descriptions-item label="计划编号">
            <span :title="detailData.planCode">{{ detailData.planCode }}</span>
          </a-descriptions-item>
          <a-descriptions-item label="计划名称" :span="2">
            <span :title="detailData.planName">{{ detailData.planName }}</span>
          </a-descriptions-item>
          <a-descriptions-item label="负责人" :span="1">
            <span :title="detailData.supervisorName">{{ detailData.supervisorName }}</span>
          </a-descriptions-item>
          <a-descriptions-item label="计划部门" :span="2">
            <span :title="detailData.planDepName">{{ detailData.planDepName }}</span>
          </a-descriptions-item>
          <a-descriptions-item label="申请组织" :span="3">
            <span :title="detailData.applyLocName">{{ detailData.applyLocName }}</span>
          </a-descriptions-item>
          <a-descriptions-item label="计划开始时间" :span="1">
            <span :title="detailData.planStartTime">{{ detailData.planStartTime }}</span>
          </a-descriptions-item>
          <a-descriptions-item label="计划结束时间" :span="2">
            <span :title="detailData.planEndTime">{{ detailData.planEndTime }}</span>
          </a-descriptions-item>
          <a-descriptions-item label="计划工期">
            <span :title="detailData.planDuration">{{ detailData.planDuration }}</span>
          </a-descriptions-item>
          <a-descriptions-item label="计划分类" :span="2">
            <span :title="detailData.planType">{{ detailData.planType }}</span>
          </a-descriptions-item>
          <a-descriptions-item label="实际开始时间" :span="1">
            <span :title="detailData.actualStartTime">{{ detailData.actualStartTime }}</span>
          </a-descriptions-item>
          <a-descriptions-item label="实际结束时间" :span="2">
            <span :title="detailData.actualEndTime">{{ detailData.actualEndTime }}</span>
          </a-descriptions-item>
          <a-descriptions-item label="实际工期">
            <span :title="detailData.actualDuration">{{ detailData.actualDuration }}</span>
          </a-descriptions-item>
          <a-descriptions-item label="计划等级">
            <span :title="detailData.controlLevel">{{ detailData.controlLevel }}</span>
          </a-descriptions-item>
          <a-descriptions-item label="合计奖扣分">
            <span :title="detailData.totalRewardPenalty">{{ detailData.totalRewardPenalty }}</span>
          </a-descriptions-item>
          <a-descriptions-item label="备注">
            <span :title="detailData.remark">{{ detailData.remark }}</span>
          </a-descriptions-item>
          <a-descriptions-item label="计划费用">
            <span :title="detailData.cost">{{ detailData.cost }}</span>
          </a-descriptions-item>
          <a-descriptions-item label="是否执行">
            <a-switch :disabled="true" v-model:checked="detailData.isExec" checked-children="是" un-checked-children="否" />
          </a-descriptions-item>
          <a-descriptions-item v-if="!detailData.isExec" label="未执行原因">
            <span :title="detailData.unExecReason">{{ detailData.unExecReason }}</span>
          </a-descriptions-item>
          <a-descriptions-item label="统筹安排">
            <span :title="detailData.domainArrange">{{ detailData.domainArrange }}</span>
          </a-descriptions-item>
        </a-descriptions>
        <a-tabs v-model:activeKey="activeKey" class="tabs-container" type="card">
          <a-tab-pane key="1" tab="检修明细">
            <a-table :columns="columns1" :data-source="data1"></a-table>
          </a-tab-pane>
          <a-tab-pane key="2" tab="评审意见" force-render>
            <a-table :columns="columns2" :data-source="data2"></a-table>
          </a-tab-pane>
          <a-tab-pane key="3" tab="敬业云审批" force-render>
            <a-table :columns="columns3" :data-source="data3"></a-table>
          </a-tab-pane>
        </a-tabs>
      </a-spin>
    </div>
  </BasicModal>
</template>

<script setup lang="ts" name="exam-plan-detail-modal">
  import { ref, reactive } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { getExamPlanDetail, getExamPlanApprover } from './examPlan.api';
  import { useMessage } from '/@/hooks/web/useMessage';

  const { createMessage } = useMessage();
  const loading = ref(false);
  const activeKey = ref('1');

  const columns1 = [
    {
      title: '序号',
      dataIndex: 'index',
      key: 'index',
      width: 60,
      customRender: ({ text, index }) => {
        return index + 1;
      },
    },
    {
      title: '项目编号',
      dataIndex: 'projectCode',
      key: 'projectCode',
      width: 120,
      ellipsis: true,
    },
    {
      title: '项目名称',
      dataIndex: 'projectName',
      key: 'projectName',
      width: 120,
      ellipsis: true,
    },
    {
      title: '审批状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      ellipsis: true,
    },
    {
      title: '项目分类',
      dataIndex: 'itemType',
      key: 'itemType',
      width: 120,
      ellipsis: true,
    },
    {
      title: '组织/设备',
      dataIndex: 'orgName',
      key: 'orgName',
      width: 120,
      ellipsis: true,
    },
    {
      title: '检修内容',
      dataIndex: 'mtcContent',
      key: 'mtcContent',
      width: 200,
      ellipsis: true,
    },
    {
      title: '验收标准',
      dataIndex: 'mtcAcceptance',
      key: 'mtcAcceptance',
      width: 200,
      ellipsis: true,
    },
  ];
  const data1 = ref([]);
  const columns2 = [
    {
      title: '序号',
      dataIndex: 'index',
      key: 'index',
      width: 60,
      customRender: ({ text, index }) => {
        return index + 1;
      },
    },
    {
      title: '评审人',
      dataIndex: 'commentUserName',
      key: 'commentUserName',
      width: 120,
      ellipsis: true,
    },
    {
      title: '评审单位',
      dataIndex: 'commentDepName',
      key: 'commentDepName',
      ellipsis: true,
    },
    {
      title: '评审意见',
      dataIndex: 'comment',
      key: 'comment',
      ellipsis: true,
    },
  ];
  const data2 = ref([]);
  const columns3 = [
    {
      title: '序号',
      dataIndex: 'index',
      key: 'index',
      width: 60,
      customRender: ({ text, index }) => {
        return index + 1;
      },
    },
    {
      title: '审批人',
      dataIndex: 'approvalUserName',
      key: 'approvalUserName',
      ellipsis: true,
    },
    {
      title: '审批时间',
      dataIndex: 'approvalDate',
      key: 'approvalDate',
      ellipsis: true,
    },
    {
      title: '节点名称',
      dataIndex: 'nodeName',
      key: 'nodeName',
      ellipsis: true,
    },
  ];
  const data3 = ref([]);

  // 详情数据
  const detailData = ref({});

  const [registerModal, { closeModal }] = useModalInner(async (data) => {
    activeKey.value = '1';
    Object.assign(detailData.value, data);
    if (data?.planId) {
      await loadDetail(data.planId);
      await loadApprover(data.planId);
    }
  });

  /**
   * 加载详情数据
   * @param id 记录ID
   */
  const loadDetail = async (planId: string) => {
    try {
      loading.value = true;
      const result = await getExamPlanDetail({ planId });
      if (result && result.data) {
        data1.value = result.data.mtcProjectVOList || [];
        data2.value = result.data.mtcPlanCommentVOList || [];
        Object.assign(detailData.value, result.data);
      }
      console.log(detailData.value);
    } catch (error) {
      createMessage.error('加载详情失败');
    } finally {
      loading.value = false;
    }
  };

  /**
   * 加载审批数据
   * @param id 记录ID
   */
  const loadApprover = async (planId: string) => {
    if (!planId) {
      createMessage.error('请选择项目');
      return;
    }
    try {
      loading.value = true;
      const result = await getExamPlanApprover({ planId });
      console.log('getExamPlanApprover', result);
      if (result && result.data) {
        data3.value = result.data || [];
      }
    } catch (error) {
      createMessage.error('加载敬业云审批数据失败');
    } finally {
      loading.value = false;
    }
  };

  /**
   * 确认按钮处理
   */
  const handleOk = () => {
    closeModal();
  };
</script>
<style scoped lang="less">
  .detail-container {
    padding: 20px;
  }
  .tabs-container {
    margin-top: 20px;
  }
</style>
