<template>
  <div>
    <BasicModal v-bind="$attrs" @register="registerModal" :width="800" title="延期审核" :footer="null">
      <div v-if="curRecord.reviewList && curRecord.reviewList.length > 0">
        <div class="work-item" v-for="item in curRecord.reviewList" :key="item.id">
          <div class="label">申请单位：{{ item.dutyUnitName }}</div>
          <div class="content">
            <div> 汇报截止时间：{{ item.overtimeLimit }}</div>
            <div> 申请延期至： {{ item.delayTime }}</div>
            <div> 延期原因：{{ item.delayReason }}</div>
          </div>
          <div class="btn">
            <a-button style="display: inline-block; margin-right: 10px" type="primary" ghost @click="handleNoAccept(item)">拒绝</a-button>
            <a-button style="display: inline-block" type="primary" @click="handleOkAccept(item)">同意</a-button>
          </div>
        </div>
      </div>
      <a-empty v-else description="暂无数据" style="position: relative; top: 20px" />
    </BasicModal>
    <a-modal v-model:visible="visibleRefuse" title="拒绝原因" @ok="handleRefuseOk">
      <div style="padding: 16px">
        <a-textarea v-model:value="delayDisagreeReason" show-count :maxlength="200" placeholder="请输入" />
      </div>
    </a-modal>
  </div>
</template>

<script lang="ts" setup>
  import { ref } from 'vue';
  import type { Ref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { reviewReport } from './listing.api';
  import { useMessage } from '/@/hooks/web/useMessage';
  const { createMessage } = useMessage();

  const emit = defineEmits(['register', 'success']);
  const curRecord: Ref<any> = ref({});
  const delayDisagreeReason = ref('');
  const visibleRefuse = ref(false);
  const curId: Ref<string> = ref('');

  // 注册弹窗
  // 这个方法执行需要openModal传入第二个参数
  const [registerModal, { closeModal }] = useModalInner(async (data) => {
    curRecord.value = data.record;
    console.log('useModalInner curRecord.value', curRecord.value);
    // 下次点击弹窗的时候清空表单
  });
  // 拒绝
  function handleRefuseOk() {
    if (!delayDisagreeReason.value) {
      createMessage.error('请输入拒绝原因');
      return;
    }
    let params = {
      id: curId.value,
      delayDisagreeReason: delayDisagreeReason.value,
      opinion: 'disagree',
    };
    // 请求接口逻辑
    reviewReport(params).then((res) => {
      curId.value = '';
    });
    visibleRefuse.value = false;
    closeModal();
    emit('success');
  }
  // 同意
  function handleOkAccept(item: any) {
    // 请求接口逻辑
    let params = {
      id: item.id,
      opinion: 'agree',
    };
    // 请求接口逻辑
    reviewReport(params).then((res) => {
      console.log('reviewReport', res);
    });
    closeModal();
    emit('success');
  }
  // 点击拒绝
  function handleNoAccept(item: any) {
    visibleRefuse.value = true;
    curId.value = item.id;
  }
</script>

<style scoped lang="less">
  .deadline-wrap {
    font-size: 13px;
    margin-bottom: 20px;
  }
  .report-deadline {
    display: inline-block;
    width: 25%;
    text-align: right;
  }
  .already-text {
    text-align: center;
    font-size: 16px;
    color: #ff8d04;
    margin-top: 20px;
  }
  .work-item {
    padding-bottom: 20px;
    border-bottom: 1px solid #e1e1e1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    .label {
      display: block;
      width: 200px;
      text-align: center;
    }
    .content {
      display: block;
      color: #666;
      width: 350px;
    }
    .btn {
    }
  }
</style>
