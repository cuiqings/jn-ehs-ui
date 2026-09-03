<template>
  <div class="process-content">
    <a-form ref="formRef" v-loading="loading" :model="examineList" :label-col="{ span: 8 }" :wrapper-col="{ span: 16 }"
      autocomplete="off" labelWrap>
      <a-steps direction="vertical" size="small" :current="1" disabled>
        <a-step v-for="(item, index) in examineList" :key="index"
          :status="item.state == '0' ? 'finish' : item.state == '1' ? 'error' : item.state == '' ? 'wait' : 'wait'">
          <template #description>
            <div :style="{ color: item.state == '0' ? '#1890ff' : '' }">
              <a-row :span="24">
                <a-col :span="6">{{ item.node }}</a-col>
                <a-col :span="18" v-if="index == 0">
                  <a-row :span="24" v-for="v in item.examineItemList">
                      {{v.finishTime}} {{ v.operatorName }}
                  </a-row>
                </a-col>
                <a-col :span="18" v-if="index > 0 && item.state === '0'">
                  <a-row :span="24" v-for="(v, i) in item.examineItemList">
                    {{v.finishTime}} {{ v.operatorName }} {{ v.finishState == '1' ? '审核通过' : '' }}
                  </a-row>
                </a-col>
              </a-row>
            </div>
          </template>
        </a-step>
      </a-steps>
    </a-form>
  </div>
</template>
<script lang="ts" setup>
import { ref } from 'vue';
import { useUserStore } from '/@/store/modules/user';

const userStore = useUserStore();
const userInfo = userStore.getUserInfo;
const loading = ref(false);
const examineList = ref([
  {
    node: '资料计划',
    type: '1',
    sort: '1',
    examineItemList: [
      {
        operator: userInfo.id,
        operatorName: userInfo.realname
      },
    ],
  },
  {
    node: '安全副部长',
    state: '',
    type: '1',
    sort: '2',
    examineItemList: [
      {
        operator: '',
        operatorName: ''
      },
    ],
  },
  {
    node: '一把手',
    state: '',
    type: '1',
    sort: '3',
    examineItemList: [
      {
        operator: '',
        operatorName: ''
      },
    ],
  },
])

const formRef = ref();

const init = (data) => {
  examineList.value = data;
}

const save = () => {
  let params = JSON.parse(JSON.stringify(examineList.value));
  if (params.length == 0) return;
  params.forEach((item, idx) => {
    item.examineItemList.forEach((item, _idx) => {
      if (item.operator) {
        item.operator = item.operator.split(',');
      } else {
        item.operator = [];
      }
    });
  })
  return params;
};
const submit = async () => {
  await formRef.value.validate();
  return save();
};

defineExpose({ save, submit, init });

</script>
<style scoped lang="less">
.process-content {
  padding: 16px;
}

.my-multiple {
  .ant-select-selector {
    overflow-x: auto;
  }

  .ant-select-selection-overflow {
    flex-wrap: nowrap;
  }
}
</style>
