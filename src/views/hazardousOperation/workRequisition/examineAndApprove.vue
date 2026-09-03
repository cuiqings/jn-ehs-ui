<template>
  <a-form ref="formRef" v-loading="loading" :model="workExamine" :label-col="{ span: 8 }" :wrapper-col="{ span: 16 }" autocomplete="off" labelWrap>
    <a-row :span="24">
      <a-col :span="24" v-if="JSON.stringify(viewEditData) !== '{}' && readonly">
        <a-form-item :colon="false">
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
        </a-form-item>
      </a-col>
    </a-row>
    <a-steps direction="vertical" size="small" :current="1" disabled>
      <a-step
        v-for="(item, index) in workExamine"
        :key="index"
        :status="item.state == '0' ? 'finish' : item.state == '1' ? 'error' : item.state == '' ? 'wait' : 'wait'"
      >
        <template #description>
          <template v-if="readonly">
            <div :style="{ color: item.state == '0' ? '#1890ff' : '' }">
              <a-row :span="24">
                <a-col :span="6">{{ item.nodeName }}</a-col>
                <a-col :span="18">
                  <a-row :span="24" v-for="v in item.workExamineInfo" :key="v.id">
                    {{ v.nodeTime }} {{ v.nodeOperatorName }}{{ v.nodeOperatorName ? '，' : '' }} 操作内容：{{ v.operatorContent }}
                  </a-row>
                </a-col>
              </a-row>
            </div>
          </template>
          <template v-else>
            <template v-for="(v, i) in item.workExamineInfoList" :key="i">
              <div v-if="index == 0" :style="{ color: item.state == '0' ? '#1890ff' : '' }">
                <a-row :span="24">
                  <a-col :span="6">{{ item.nodeName }}</a-col>
                  <a-col :span="18"> {{ v.nodeOperatorName }},操作内容：填写票据，预填写危险辨识 </a-col>
                </a-row>
              </div>
              <a-row :span="24" v-else>
                <a-col :span="6" v-if="i === 0">
                  {{ item.nodeName }}
                </a-col>
                <a-col :span="6" v-if="i === 0">
                  <a-form-item name="type" :wrapper-col="{ span: 23 }" v-if="item.station.need">
                    <a-select
                      v-model:value="item.type"
                      @change="typeChange($event, index)"
                      :disabled="disabled(item.disabled, item.nodeName) || index == 0 || !item.needNode"
                      :options="options"
                    />
                  </a-form-item>
                </a-col>
                <a-col :span="12" v-bind="attr(i)">
                  <a-form-item
                    :name="[index, 'workExamineInfoList', i, 'nodeOperator']"
                    :wrapper-col="{ span: 24 }"
                    :rules="{
                      required: item.needNode,
                      message: '请选择',
                      trigger: 'submit',
                    }"
                  >
                    <a-row :span="24">
                      <a-col :span="16">
                        <JUserModal
                          :roleCode="item.roleCode"
                          :org-code="item.orgCode"
                          type="checkbox"
                          :disabled="item.disabled || !item.needNode"
                          v-model:value="v.nodeOperator"
                          placeholder="请选择"
                        />
                      </a-col>
                      <a-col :span="8">
                        <a-button type="link" v-show="i !== 0" size="small" @click="del(index, i)" :disabled="item.disabled">删除</a-button>
                        <a-button type="link" v-show="item.type == '2'" size="small" @click="add(index, i)" :disabled="item.disabled">添加</a-button>
                        <a-switch v-if="item.show" v-model:checked="item.needNode" checked-children="打开" un-checked-children="关闭" />
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
    <!-- <a-row :span="24">
      <a-col :offset="7">
        <a-space :size="30">
          <a-button @click="JobKeep" v-if="!readonly">保存</a-button>
          <a-button @click="emit('update:value', '1')" v-if="!readonly">上一步</a-button>
          <a-button type="primary" @click="submit" v-if="!readonly">提交</a-button>
        </a-space>
      </a-col>
    </a-row> -->
  </a-form>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { getWorkJobWorkDetail } from '../api';
  import { JobApplyForFrom } from '../type';
  import { computedStepData } from './components/computedData';
  import type { FormInstance } from 'ant-design-vue';
  import { JUserModal } from '/@/components/Form';
  withDefaults(
    defineProps<{
      readonly: boolean;
    }>(),
    {}
  );
  const loading = ref(false);
  const formState = ref<JobApplyForFrom>({});
  const viewEditData = ref<JobApplyForFrom>();
  const workExamine = ref<any[]>([]);

  async function pageInit(data) {
    Object.assign(formState.value, data[0]);
    viewEditData.value = data;
    workExamine.value = [];
    getSteps(data);
  }

  const typeChange = (e, idx) => {};

  const disabled = (disabled?: boolean, nodeName?: string): boolean | undefined => {
    if (nodeName === '用电接入(设备运营保障中心维修科维修工)') {
      return true;
    } else if (nodeName == '安全员确认(属地安全员)') {
      return true;
    } else {
      return disabled;
    }
  };
  const attr = (i: number) => {
    if (i === 0) {
      return {
        offset: 0,
      };
    } else {
      return {
        offset: 12,
      };
    }
  };
  const options = [
    { label: '单岗单批', value: '1' },
    { label: '多岗多批', value: '2' },
  ];
  const getSteps = async (data: any) => {
    loading.value = true;
    let arr = await computedStepData(data);
    console.log(JSON.parse(JSON.stringify(arr)), 'arr');
    workExamine.value = arr;
    if (formState.value.id) {
      let steps = await getWorkJobWorkDetail(formState.value.id);
      workExamine.value.map((val) => {
        steps.workExamine &&
          steps.workExamine.forEach((item) => {
            if (val.nodeName == item.nodeName) {
              if (!item.nodeName.includes('作业负责人') && !item.nodeName.includes('岗位工') && !item.nodeName.includes('安全措施确认人') && !item.nodeName.includes('接受交底')) {
                val.workExamineInfoList = item.workExamineInfo;
                val.workExamineInfo = item.workExamineInfo;
              }
              val.typeName = item.type == 1 ? '单岗单批' : '多岗多批';
              val.state = item.state;
              val.type = item.type;
              if (val.workExamineInfoList.length > 0) {
                val.workExamineInfoList.forEach((pitem) => {
                  if (!pitem.nodeOperator) {
                    pitem.nodeOperator = '';
                  }
                });
              } else {
                val.workExamineInfoList = [{ nodeOperator: '' }];
              }
            }
          });
      });
    }
    console.log(workExamine);

    loading.value = false;
  };

  //删除节点
  const del = (idx, i) => {
    workExamine.value[idx].workExamineInfoList.splice(i, 1);
  };
  //添加节点
  const add = (idx, _i) => {
    if (workExamine.value[idx].workExamineInfoList[workExamine.value[idx].workExamineInfoList.length - 1].nodeOperator.length == 0) return;
    workExamine.value[idx].workExamineInfoList.push({ nodeOperator: '', options });
  };

  const formRef = ref<FormInstance | null>(null);
  const getFormData = () => {
    return workExamine.value;
  };

  const submitFormData = async () => {
    await formRef.value?.validate();
    return filterPerson(workExamine.value);
  };

  // 删除不相关人员 避免分厂安全员/消防员 带出车间主任bug
  function filterPerson(arr) {
    let node = arr.find((item) => item.nodeName == '分厂安全员/消防员');
    if (node) {
      let ids = node.options.map((oitem) => oitem.id);
      node.workExamineInfoList.forEach((item, index) => {
        if (item.nodeOperator) {
          let nodeOperator = Array.isArray(item.nodeOperator) ? item.nodeOperator : item.nodeOperator.split(',');
          let aid = JSON.parse(JSON.stringify(nodeOperator));
          nodeOperator.forEach((val, idx) => {
            if (!ids.includes(val)) {
              aid.splice(idx, 1);
            }
          });
          item.nodeOperator = aid;
        }
      });
    }
    return arr;
  }

  defineExpose({
    pageInit,
    getFormData,
    submitFormData,
  });
</script>

<style lang="less">
  .my-multiple {
    .ant-select-selector {
      overflow-x: auto;
    }
    .ant-select-selection-overflow {
      flex-wrap: nowrap;
    }
  }
</style>
