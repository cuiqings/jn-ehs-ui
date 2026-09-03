<template>
  <basic-modal v-bind="$attrs" @register="registerModal" :width="600" title="考核" :body-style="{ padding: '0 20px' }" destroyOnClose>
    <div>
      <a-form :model="info" ref="infoRef" :label-col="{ span: 4 }" :wrapper-col="{ span: 20 }">
        <a-form-item label="减分值：" name="score" :rules="[{ required: true, message: '减分值为必填项！' }]">
          <a-input-number v-model:value="info.score" style="width: 100%" :controls="false" :precision="0" :min="1" :max="100" placeholder="请输入" />
        </a-form-item>
      </a-form>
      <div v-if="logList.length > 0">
        <nav class="assessment-nav">考核记录</nav>
        <div class="assessment-list" v-for="(item, index) in logList" :key="index">
          <div><span>减分值：</span>{{ item.score }}</div>
          <div><span>考核人员：</span>{{ item.examineByName }}</div>
          <div><span>考核时间：</span>{{ item.examineTime }}</div>
        </div>
      </div>
    </div>
    <template #footer>
      <div style="text-align: right">
        <a-button style="margin-right: 15px" @click="close">取消</a-button>
        <a-button type="primary" :loading="loading" @click="confirmClose">提交</a-button>
      </div>
    </template>
  </basic-modal>
</template>
<script lang="ts" name="assessment-modal" setup>
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { ref } from 'vue';
  import { examine, getExamineLog } from './url/index';
  const emit = defineEmits(['success']);
  const infoRef: any = ref(null);
  const loading = ref(false);
  const info: any = ref({
    companyId: '',
    score: '',
  });
  const logList: any = ref([]);
  const [registerModal, { closeModal, redoModalHeight }] = useModalInner(async (data) => {
    await infoRef.value.resetFields();
    info.value.score = '';
    info.value.companyId = data.id;
    logList.value = [];
    getExamineLog({ id: data.id }).then((res) => {
      if (res && res.length > 0) {
        logList.value = res;
        redoModalHeight();
      }
    });
  });
  const confirmClose = async () => {
    await infoRef.value.validate();
    const data = JSON.parse(JSON.stringify(info.value));
    loading.value = true;
    examine(data)
      .then(() => {
        //关闭弹窗
        closeModal();
        //刷新列表
        emit('success');
      })
      .finally(() => {
        loading.value = false;
      });
  };
  const close = () => {
    closeModal();
  };
</script>
<style lang="less">
  .assessment-nav {
    font-size: 16px;
    font-weight: 600;
    color: #4498f0;
    line-height: 50px;
  }
  .assessment-list {
    margin-bottom: 10px;
    border: 1px solid #e5e7eb;
    // padding-bottom: 10px;
    border-radius: 5px;
    padding: 10px;
    div {
      line-height: 30px;
    }
  }
</style>
