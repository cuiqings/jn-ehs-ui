<template>
  <a-form
    :model="readOnly ? delayedMarks : delayedMark"
    ref="delayedMarkRef"
    :label-col="{ span: 8 }"
    :wrapper-col="{ span: 16 }"
    autocomplete="off"
    labelWrap
  >
    <a-row :span="24">
      <template v-if="!readOnly">
        <a-col :span="12">
          <a-form-item label="申请人" name="applicant">
            <a-input v-model:value="delayedMark.applicant" disabled />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="申请人时间" name="applicationTime">
            <a-input v-model:value="delayedMark.applicationTime" disabled />
          </a-form-item>
        </a-col>
        <a-col :span="24">
          <a-form-item label="延期原因" :label-col="{ span: 4 }" :wrapper-col="{ span: 20 }" name="delayReason">
            <a-input v-model:value="delayedMark.delayReason" disabled />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="延期时间" name="delayTime">
            <a-date-picker
              show-time
              placeholder="请选择延期时间"
              v-model:value="delayedMark.delayTime"
              valueFormat="YYYY-MM-DD HH:mm:ss"
              format="YYYY-MM-DD HH:mm:ss"
            />
          </a-form-item>
        </a-col>
        <a-col :span="24" v-if="delayedMark.workExamineInfo">
          <a-form-item :label-col="{ span: 5 }" :wrapper-col="{ flex: 1, offset: 4 }">
            <template #label><span style="color: blue">延时续签审批</span></template>
            <a-steps direction="vertical">
              <a-step
                v-for="(item, index) in delayedMark.workExamineInfo"
                :key="index"
                :status="item.state == '0' ? 'finish' : item.state == '1' ? 'error' : item.state == '' ? 'wait' : 'wait'"
              >
                <!-- <span slot="title">Finished</span> -->
                <template #description>
                  <div :style="{ color: item.state == '0' ? 'blue' : '' }">
                    {{ item.nodeName }}
                    <span>{{ item.nodeTime }} {{ item.nodeOperator }},{{ item.reviewComments }}</span>
                  </div>
                </template>
              </a-step>
            </a-steps>
          </a-form-item>
        </a-col>
      </template>
      <template v-else>
        <template v-for="(item, i) in delayedMarks" :key="i">
          <a-col :span="24" :offset="2" v-if="delayedMarks?.length > 1">延时申请第{{ i + 1 }}次 </a-col>
          <a-col :span="12">
            <a-form-item label="申请人" name="applicant">
              <a-input v-model:value="item.applicant" disabled />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="申请人时间" name="applicationTime">
              <a-input v-model:value="item.applicationTime" disabled />
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item label="延期原因" :label-col="{ span: 4 }" :wrapper-col="{ span: 20 }" name="delayReason">
              <a-input v-model:value="item.delayReason" disabled />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="延期时间" name="delayTime">
              <a-input v-model:value="item.delayDate" disabled />
            </a-form-item>
          </a-col>
          <a-col :span="24" v-if="item.workExamineInfo">
            <a-form-item :label-col="{ span: 5 }" :wrapper-col="{ flex: 1, offset: 4 }">
              <template #label><span style="color: blue">延时续签审批</span></template>
              <a-steps direction="vertical">
                <a-step
                  v-for="(value, index) in item.workExamineInfo"
                  :key="index"
                  :status="value.state == '0' ? 'finish' : value.state == '1' ? 'error' : value.state == '' ? 'wait' : 'wait'"
                >
                  <!-- <span slot="title">Finished</span> -->
                  <template #description>
                    <span :style="{ color: value.state == '0' ? 'blue' : '' }">
                      {{ value.nodeName }} {{ value.nodeTime }} {{ value.nodeOperator }},{{ value.reviewComments }}
                    </span>
                  </template>
                </a-step>
              </a-steps>
            </a-form-item>
          </a-col>
        </template>
      </template>
      <a-col :span="24">
        <a-form-item :wrapperCol="{ offset: 4 }">
          <a-space :size="50">
            <a-button v-if="!readOnly" style="background: rgb(242, 122, 5); color: #fff" @click="handleBack">审批退回</a-button>
            <a-button v-if="!readOnly" type="primary" @click="handleSubmit">审批通过</a-button>
            <a-button v-if="readOnly" type="primary" @click="close">关闭</a-button>
          </a-space>
        </a-form-item>
      </a-col>
    </a-row>
  </a-form>
</template>

<script setup lang="ts">
  import { computed, inject, Ref, ref } from 'vue';
  import { JobApplyForFrom } from '../type';
  import { getWorkExamineDelayApproval, getWorkExamineDelayBack } from '../api';
  const props = defineProps({
    detailInfo: {
      type: Object,
      default: () => {
        return {};
      },
    }
  })
  const emits = defineEmits(['close', 'refresh']);
  let formState = inject<Ref<JobApplyForFrom>>('formState') as Ref<JobApplyForFrom>;
  let readOnly = inject<Ref<boolean>>('readOnly') as Ref<boolean>;
  let delayedMarkRef = ref<any>();
  let delayedMark = computed(() => {
    let delayedMark = formState.value.delayedMark && formState.value.delayedMark.length ? formState.value.delayedMark[formState.value.delayedMark.length - 1] : [];
    return delayedMark;
  });
  let delayedMarks = computed(() => {
    // @ts-ignore
    return props.detailInfo.delayedMark || [];
  });
  const handleBack = async () => {
    await getWorkExamineDelayBack(delayedMark.value);
    delayedMarkRef.value.resetFields();
    emits('close');
    emits('refresh');
  };

  const handleSubmit = async () => {
    await getWorkExamineDelayApproval(delayedMark.value);
    delayedMarkRef.value.resetFields();
    emits('close');
    emits('refresh');
  };
  const close = () => {
    emits('close');
    emits('refresh');
  };
</script>

<style lang="less" scoped></style>
