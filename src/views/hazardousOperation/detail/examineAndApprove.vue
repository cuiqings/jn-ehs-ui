<template>
  <a-form ref="formRef" :model="workExamine" :label-col="{ span: 8 }" :wrapper-col="{ span: 16 }" autocomplete="off" labelWrap>
    <a-row :span="24">
      <a-col :span="24">
        <div class="step-wrap">
          <a-steps labelPlacement="vertical" size="small">
            <a-step
              v-for="item in formState.workExamineNodeList"
              :key="item.sort"
              :status="item.state == '0' ? 'finish' : item.state == '1' ? 'error' : item.state == '' ? 'wait' : 'wait'"
            >
              <template #title>
                <span :style="{ color: item.state == '0' ? 'blue' : '' }">{{ item.node }}</span>
              </template>
              <template #subTitle>
                <span :style="{ color: item.state == '0' ? 'blue' : '' }">{{ item.nodeOperator }}</span>
              </template>
              <template #description>
                <span :style="{ color: item.state == '0' ? 'blue' : '' }">{{ item.nodeTime }}</span>
              </template>
            </a-step>
          </a-steps>
        </div>
      </a-col>
    </a-row>
    <a-steps direction="vertical" size="small" :current="1" disabled>
      <a-step
        v-for="(item, index) in workExamine"
        :key="item.id"
        :status="item.state == '0' ? 'finish' : item.state == '1' ? 'error' : item.state == '' ? 'wait' : 'wait'"
      >{{ index }}
        <template #description>
          <div :style="{ color: item.state == '0' ? 'blue' : '' }">
            <a-row :span="24">
              <a-col :span="6">{{ item.nodeName }}</a-col>
              <a-col :span="18">
                <a-row :span="24" v-for="(v, idx) in item.workExamineInfo" :key="v.id">
                  <span :style="{ color: v.reason ? 'red' : '' }">
                    {{ v.nodeTime }} {{ v.nodeOperatorName }}{{ v.nodeOperatorName ? '，' : '' }}操作内容：{{ v.operatorContent }} {{ v.reason }}
                    <span v-if="formState && formState.examineInfoList && formState.examineInfoList.length > 0 && item.nodeName.includes('验收')">
                      {{ formState.examineInfoList[formState.examineInfoList.length - 1].examineInfoItemList[idx].status }}
                    </span>
                  </span>
                </a-row>
              </a-col>
            </a-row>
          </div>
        </template>
      </a-step>
    </a-steps>
    <a-row :span="24">
      <a-col :offset="7">
        <!-- <a-space :size="30">
          <a-button @click="emit('update:value', '1')">上一步</a-button>
        </a-space> -->
      </a-col>
    </a-row>
  </a-form>
</template>

<script setup lang="ts">
  import { ref, computed, inject } from 'vue';
  import { JobApplyForFrom } from '../type';
  withDefaults(
    defineProps<{
      readonly: boolean;
      title: string;
      viewEditData: JobApplyForFrom;
    }>(),
    {}
  );
  defineEmits(['update:value', 'close', 'refresh']);
  const formState = ref<any>({});
  const workExamine = ref<any[]>([]);
  const pageInit = (data, workExamineInfo) => {
    formState.value = data;
    workExamine.value = workExamineInfo.workExamine;
    console.log(formState.value);
  };

  defineExpose({
    pageInit,
  });
</script>

<style scoped>
  .step-wrap {
    width: 100%;
    overflow: auto;
    margin-bottom: 16px;
  }
</style>
