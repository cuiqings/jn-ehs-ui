<template>
  <div>
    <BasicDrawer
      v-bind="$attrs"
      @register="registerDrawer"
      :width="1000"
      title="整改计划"
      @close="handleCancel"
      ok-text="提交"
      show-footer
      @ok="handleSubmit"
      destroyOnClose
    >
      <BasicForm @register="registerForm">
        <template #table1>
          <a-table
            style="width: 130%; margin-left: 5px"
            ref="table"
            size="middle"
            bordered
            rowKey="id"
            :columns="columns"
            :dataSource="dataSource"
            :pagination="false"
          >
            <!-- <template #headerCell="{ column }">
              <template v-if="column.key === 'approveResult'"> <span class="red-require">*</span>审批意见</template>
            </template> -->
            <template #approveResult="{ record }">
              <a-radio-group v-model:value="record.approveResult" @change="changeapproveResult(record)">
                <a-radio :value="'1'">合格</a-radio>
                <a-radio :value="'2'">不合格</a-radio>
              </a-radio-group>
              <!-- <div v-if="record.errorFlag1" style="color: red">请选择审批意见</div> -->
              <!-- 如果不合格， 输入整改意见 -->
              <a-input
                style="width: 200px"
                v-if="record.approveResult == '2'"
                v-model:value="record.approveOpinion"
                placeholder="请输入意见"
                @change="changeapproveOpinion(record)"
              />
              <div v-if="record.errorFlag2" style="color: red">请输入意见</div>
            </template>
            <template #yhLevel="{ record }">
              <span v-if="record.yhLevel == '1'">一般</span>
              <span v-if="record.yhLevel == '2'">重大</span>
            </template>
          </a-table>
        </template>
      </BasicForm>
      <!-- 签名弹框 -->
      <SignModal @register="registerSignModal" @signOk="handleSignOk" />
    </BasicDrawer>
  </div>
</template>

<script lang="ts" setup>
  import { computed, ref } from 'vue';
  import { BasicDrawer, useDrawerInner } from '/@/components/Drawer';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import { getRepairPlan, approveRepairPlan } from './history.api';
  import { useModal } from '/@/components/Modal';
  import { useUserStore } from '/@/store/modules/user';
  import { useMessage } from '/@/hooks/web/useMessage';
  import SignModal from '/@/views/sm/components/signModel.vue';
  const { createMessage } = useMessage();
  const userStore = useUserStore();
  const emit = defineEmits(['success', 'register']);
  const taskId = ref('');
  const dataSource: any = ref([]);
  const columns: any = [
    {
      title: '序号',
      align: 'center',
      width: 60,
      customRender: ({ index }) => {
        return index + 1;
      },
    },
    { title: '检查时间', align: 'center', key: 'checkTime', dataIndex: 'checkTime' },
    { title: '责任单位', align: 'center', key: 'dutyOrgName', dataIndex: 'dutyOrgName' },
    { title: '责任车间', align: 'center', key: 'dutyDepartName', dataIndex: 'dutyDepartName' },
    { title: '隐患描述', align: 'center', key: 'yhDescription', dataIndex: 'yhDescription' },
    { title: '隐患等级', align: 'center', key: 'yhLevel', dataIndex: 'yhLevel', slots: { customRender: 'yhLevel' } },
    { title: '治理措施', align: 'center', key: 'handleMsr', dataIndex: 'handleMsr' },
    { title: '完成时限', align: 'center', key: 'repairTimeLimit', dataIndex: 'repairTimeLimit' },
    { title: '整改责任人', align: 'center', key: 'repairPersonName', dataIndex: 'repairPersonName' },
    {
      title: '审批意见',
      align: 'center',
      width: 240,
      key: 'approveResult',
      dataIndex: 'approveResult',
      slots: { customRender: 'approveResult' },
    },
  ];
  // 注册签名弹框
  const [registerSignModal, { openModal: openSignModal }] = useModal();
  // 注册表单
  const [registerForm] = useForm({
    schemas: [
      {
        label: 'id',
        field: 'id',
        component: 'Input',
        show: false,
      },
      {
        field: 'table1',
        component: 'Input',
        label: '',
        slot: 'table1',
      },
    ],
    showActionButtonGroup: false,
  });

  async function handleSubmit() {
    setDrawerProps({ confirmLoading: true });
    // 检查项不可为空
    if (dataSource.value.length == 0) {
      createMessage.error('检查项不可为空');
      setDrawerProps({ confirmLoading: false });
      return false;
    }
    for (let item of dataSource.value) {
      // 验证审批意见是否已选择
      // if (item.approveResult == '' || item.approveResult == undefined) {
      //   item.errorFlag1 = true;
      //   createMessage.error('请选择审批意见');
      //   setDrawerProps({ confirmLoading: false });
      //   return false;
      // } else {
      //   item.errorFlag1 = false;
      // }

      if (item.approveResult && item.approveResult == '2') {
        //  问题描述=检查结果选择不合格时必填
        if (!item.approveOpinion) {
          item.errorFlag2 = true;
          createMessage.error('请输入整改意见');
          setDrawerProps({ confirmLoading: false });
          return false;
        } else {
          item.errorFlag2 = false;
        }
      }
      if (item.errorFlag2) {
        setDrawerProps({ confirmLoading: false });
        return false;
      }
    }

    // 验证通过后，打开签名弹框
    setDrawerProps({ confirmLoading: false });
    openSignModal(true);
  }
  async function handleSignOk(signature: string) {
    console.log('handleSignOk signature', signature);
    setDrawerProps({ confirmLoading: true });
    let params = {
      taskId: taskId.value,
      itemList: dataSource.value,
      signPicture: signature,
    };
    console.log('params', params);
    try {
      await approveRepairPlan(params);
      closeDrawer();
      emit('success');
      createMessage.success('审批提交成功');
    } catch (error) {
      console.error('审批提交失败:', error);
      createMessage.error('审批提交失败');
    } finally {
      setDrawerProps({ confirmLoading: false });
    }
  }
  // 注册抽屉
  // 这个方法执行需要openDrawer传入第二个参数
  const [registerDrawer, { setDrawerProps, closeDrawer }] = useDrawerInner(async (data) => {
    console.log('useDrawerInner data', data);
    taskId.value = data.record.id;
    setDrawerProps({ confirmLoading: false, showCancelBtn: true, showOkBtn: true });
    // 根据id获取详情
    let res = await getRepairPlan({ id: data.record.id });
    dataSource.value = res;
    dataSource.value.forEach((item) => {
      item.approveResult = '1';
    });
  });
  function changeapproveOpinion(record) {
    if (record.approveResult == '2') {
      if (!record.approveOpinion) {
        record.errorFlag2 = true;
      } else {
        record.errorFlag2 = false;
      }
    }
  }
  function changeapproveResult(record) {
    record.errorFlag2 = false;
    record.approveOpinion = '';
  }
  function handleCancel() {
    closeDrawer();
    emit('success');
    setDrawerProps({ confirmLoading: false });
  }
</script>

<style lang="less" scoped>
  .red-require {
    display: inline-block;
    margin-right: 4px;
    color: #ff4d4f;
    font-size: 14px;
    font-family: SimSun, sans-serif;
    line-height: 1;
  }
  .info-content {
    display: flex;
    margin-top: 20px;
    margin-left: 20px;
    .item {
      // width: 50%;
      display: flex;
      margin-bottom: 15px;
      margin-right: 20px;
      .item-title {
        width: 120px;
        font-size: 14px;
        font-family: SourceHanSansCN-Regular, SourceHanSansCN;
        font-weight: normal;
        color: rgba(0, 0, 0, 0.68);
        text-align: right;
      }
      .item-content {
        width: calc(100% - 120px);
        font-size: 14px;
        font-family: SourceHanSansCN-Regular, SourceHanSansCN;
        font-weight: normal;
        color: rgba(0, 0, 0, 1);
      }
    }
  }
</style>
