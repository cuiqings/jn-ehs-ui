<template>
  <BasicModal v-bind="$attrs" @register="registerModal" destroyOnClose title="添加自评" :width="1200" :footer="null">
    <a-table :columns="columns" :data-source="data" :pagination="false" :bordered="true">
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'action'">
          <a-button v-if="record.selfEvaluateScore" type="primary" @click="handleRedo(record)">重新评估</a-button>
          <a-button v-else type="primary" @click="handleRedo(record)">开始评估</a-button>
        </template>
      <template v-if="column.dataIndex === 'evaluateStandard'">
        <div style="text-align: left" v-html="record.evaluateStandard"></div>
      </template>
      </template>
    </a-table>
    <a-modal v-model:visible="visible" title="自评" :footer="null">
      <div style="margin: 20px; padding-bottom: 20px">
        <div style="font-size: 16px; font-weight: 500; margin-bottom: 30px">{{ currentrRecord.indx }}-{{ currentrRecord.item }}：（满分100分）</div>
        <a-form
          :model="formState"
          name="basic"
          :label-col="{ span: 5 }"
          :wrapper-col="{ span: 19 }"
          autocomplete="off"
          @finish="onFinish"
          @finishFailed="onFinishFailed"
        >
          <a-form-item label="自评得分" name="selfEvaluateScore" :rules="[{ required: true, message: '请输入自评得分' }]">
            <a-input-number :min="0" :max="100" :precision="2" v-model:value="formState.selfEvaluateScore" />
          </a-form-item>

          <a-form-item label="说明" name="selfEvaluateRemark">
            <a-textarea v-model:value="formState.selfEvaluateRemark" show-count :maxlength="100" :rows="3" placeholder="请输入说明" />
          </a-form-item>
          <a-form-item :wrapper-col="{ span: 14, offset: 9 }">
            <a-button type="primary" html-type="submit">确定</a-button>
            <a-button style="margin-left: 10px" @click="handleCancel">取消</a-button>
          </a-form-item>
        </a-form>
      </div>
    </a-modal>
  </BasicModal>
</template>
<script lang="ts" setup>
  import { ref, reactive } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { getSelfEvalList, addEvaluateSelf } from '../api';
  const emit = defineEmits(['success']);
  interface FormState {
    selfEvaluateScore: number;
    selfEvaluateRemark: string;
  }
  const visible = ref(false);

  const columns = [
    {
      title: '指标',
      dataIndex: 'indx',
      align: 'center',
    },
    {
      title: '指标项',
      dataIndex: 'item',
      align: 'center',
    },
    {
      title: '评价标准',
      dataIndex: 'evaluateStandard',
      align: 'center',
      width: 500,
    },
    {
      title: '自评结果',
      dataIndex: 'selfEvaluateScore',
      align: 'center',
      customRender: ({ text }) => {
        return text ? `${text}分` : '未评分';
      },
    },
    {
      title: '自评说明',
      dataIndex: 'selfEvaluateRemark',
      width: 200,
      align: 'center',
    },
    {
      title: '操作',
      dataIndex: 'action',
      align: 'center',
    },
  ];
  const data = ref([]);
  const currentrRecord = ref({});
  const formState = reactive<FormState>({
    selfEvaluateScore: 0,
    selfEvaluateRemark: '',
  });
  initData();
  function initData() {
    getSelfEvalList().then((res) => {
      console.log('getSelfEvalList', res);
      data.value = res;
    });
  }
  const onFinish = (values: any) => {
    console.log('Success:', values);
    let params = {
      ...values,
      indx: currentrRecord.value.indx,
      item: currentrRecord.value.item,
    };
    console.log('onFinish', params);
    addEvaluateSelf(params).then((res) => {
      console.log('addEvaluateSelf', res);
      visible.value = false;
      initData();
      emit('success');
    });
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log('Failed:', errorInfo);
  };
  const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
    console.log('registerModal', data);
  });
  function handleRedo(record) {
    console.log('handleRedo', record);
    visible.value = true;
    formState.selfEvaluateScore = record.selfEvaluateScore;
    formState.selfEvaluateRemark = record.selfEvaluateRemark;
    currentrRecord.value = record;
  }
  function handleCancel() {
    visible.value = false;
  }
</script>
