<template>
  <basic-modal
    v-bind="$attrs"
    @register="registerModal"
    :width="600"
    title="考核"
    :body-style="{ padding: '0 20px', maxHeight: '600px', overflow: 'auto' }"
    destroyOnClose
  >
    <div>
      <a-form :model="info" ref="infoRef" :label-col="{ span: 4 }" :wrapper-col="{ span: 20 }">
        <a-form-item label="减分值：" name="score" :rules="[{ required: true, message: '减分值为必填项！' }]">
          <a-input-number
            v-model:value="info.score"
            style="width: 100%"
            :controls="false"
            :precision="0"
            :min="1"
            :max="score"
            placeholder="请输入"
            :addonAfter="'当前人员分数：' + score"
          />
        </a-form-item>
        <a-form-item label="考核原因：" name="remark" :rules="[{ required: true, message: '考核原因为必填项！' }]">
          <InputTextArea v-model:value="info.remark" placeholder="请输入" autoSize :maxlength="200" />
        </a-form-item>
      </a-form>
      <div v-if="logList.length > 0">
        <nav class="assessment-nav">考核记录</nav>
        <div class="assessment-list" v-for="(item, index) in logList" :key="index">
          <div class="assessment-list-nav">
            <div>-{{ item.score }}分</div>
            <span>{{ item.examineTime }}</span>
          </div>
          <div>{{ item.remark }}</div>
          <div style="color: #666; font-size: 14px"><span>考核人：</span>{{ item.examineByName }}</div>
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
  import { Input } from 'ant-design-vue';
  import { ref } from 'vue';
  import { examine, getExamineLog } from './url/index';
  const emit = defineEmits(['success']);
  const InputTextArea = Input.TextArea;
  const infoRef: any = ref(null);
  const loading = ref(false);
  const info: any = ref({
    personId: '',
    score: '',
    remark: '',
  });
  const score = ref(100);
  const logList: any = ref([]);
  const [registerModal, { closeModal, redoModalHeight }] = useModalInner(async (data) => {
    await infoRef.value.resetFields();
    info.value.score = '';
    info.value.remark = '';
    info.value.personId = data.id;
    score.value = data.score;
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
    border-radius: 5px;
    padding: 10px;
    div {
      line-height: 30px;
      font-size: 14px;
    }
    .assessment-list-nav {
      display: flex;
      justify-content: space-between;
      align-items: center;
      div {
        color: red;
        font-weight: bold;
        font-size: 16px;
      }
      span {
        color: #666;
        font-size: 14px;
      }
    }
  }
</style>
