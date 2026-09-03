<template>
  <div class="process-content">
    <a-form ref="formRef" v-loading="loading" :model="examineList" :label-col="{ span: 8 }" :wrapper-col="{ span: 16 }"
      autocomplete="off" labelWrap>
      <a-steps direction="vertical" size="small" :current="1" disabled>
        <a-step v-for="(item, index) in examineList" :key="index"
          :status="item.state == '0' ? 'finish' : item.state == '1' ? 'error' : item.state == '' ? 'wait' : 'wait'">
          <template #description>
            <template v-if="readonly">
              <div :style="{ color: item.state == '0' ? '#1890ff' : '' }">
                <a-row :span="24">
                  <a-col :span="6">{{ item.node }}</a-col>
                  <a-col :span="18">
                    <a-row :span="24" v-for="v in item.workExamineInfo" :key="v.id">
                      {{ v.operatorName }}{{ v.operatorName ? '，' : '' }} 操作内容：{{ v.operatorContent }}
                    </a-row>
                  </a-col>
                </a-row>
              </div>
            </template>
            <template v-else>
              <template v-for="(v, i) in item.examineItemList" :key="i">
                <div v-if="index == 0" :style="{ color: item.state == '0' ? '#1890ff' : '' }">
                  <a-row :span="24">
                    <a-col :span="6">{{ item.node }}</a-col>
                    <a-col :span="18"> {{ v.operatorName }} </a-col>
                  </a-row>
                </div>
                <a-row :span="24" v-else>
                  <a-col :span="6" v-if="i === 0">
                    {{ item.node }}
                  </a-col>
                  <a-col :span="6" v-if="i === 0">
                    <a-form-item name="type" :wrapper-col="{ span: 23 }">
                      <a-select v-model:value="item.type" :options="options" />
                    </a-form-item>
                  </a-col>
                  <a-col :span="12" :offset="i != 0 ? 12 : 0">
                    <a-form-item :name="[index, 'examineItemList', i, 'operator']" :wrapper-col="{ span: 24 }" :rules="{
                      required: true,
                      message: '请选择',
                      trigger: 'submit',
                    }">
                      <a-row :span="24">
                        <a-col :span="16">
                          <JUserModal type="checkbox" v-model:value="v.operator" placeholder="请选择" />
                        </a-col>
                        <a-col :span="8">
                          <a-button type="link" v-show="i !== 0" size="small" @click="del(index, i)">删除</a-button>
                          <a-button type="link" v-show="item.type == '2'" size="small"
                            @click="add(index, i)">添加</a-button>
                        </a-col>
                      </a-row>
                    </a-form-item>
                  </a-col>
                </a-row>
              </template>
            </template>
          </template>
        </a-step>
      </a-steps>
    </a-form>
  </div>
</template>
<script lang="ts" setup>
import { ref } from 'vue';
import { JUserModal } from '/@/components/Form';
import { useUserStore } from '/@/store/modules/user';
import { json } from 'stream/consumers';

const userStore = useUserStore();
const userInfo = userStore.getUserInfo;
const loading = ref(false);
const readonly = ref(false);
const options = [
  { label: '单岗单批', value: '1' },
  { label: '多岗多批', value: '2' },
];
const list = [
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
];
const examineList = ref(list)

const formRef = ref();

const init = (data) => {
  data.forEach((item, index) => {
    item.itemList.forEach((citem) => {
      citem.operator = citem.operator.toString();
    });
    examineList.value[index].examineItemList = item.itemList;
  })
}

//删除节点
const del = (idx, i) => {
  examineList.value[idx].examineItemList.splice(i, 1);
};
//添加节点
const add = (idx, _i) => {
  if (examineList.value[idx].examineItemList[examineList.value[idx].examineItemList.length - 1].operator.length == 0) return;
  examineList.value[idx].examineItemList.push({ operator: '', operatorName: '' });
};

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
const reset = () => { 
  formRef.value.resetFields()
};

defineExpose({ save, submit, init, reset });

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
