<template>
  <div class="approvalProcess">
    <curLoading v-show="loading" />
    <van-form ref="formRef">
      <van-steps direction="vertical" :active="0">
        <template v-for="(item, idx) in stepArrs" :key="idx">
          <van-step v-if="idx == 0" v-for="(citem, cidx) in item.workExamineInfoList">
            <h3>{{ item.nodeName }}</h3>
            <div style="background-color: #ededed">
              <p>{{ detailInfo.startTimeStr }}</p>
              {{ citem.nodeOperatorName }},操作内容：{{ citem.operatorContent }}</div
            >
            <template #active-icon>
              <span class="step-icon">{{ idx + 1 }}</span>
            </template>
            <template #inactive-icon>
              <span class="step-icon">{{ idx + 1 }}</span>
            </template>
            <template #finish-icon>
              <span class="step-icon">{{ idx + 1 }}</span>
            </template>
          </van-step>
          <van-step v-else>
            <div class="tit">
              <h3 :class="{ red: item.state == 1 }">{{ item.nodeName }}</h3>
              <span v-if="item.type == 2 && item.add" @click="addPerson(idx)">添加</span>
              <a-switch v-if="item.show" v-model:checked="item.needNode" checked-children="打开" un-checked-children="关闭" />
            </div>
            <template v-if="!item.hint">
              <van-field
                :disabled="item.disabled || idx == 0 || !item.needNode"
                v-model="item.typeName"
                name="workUnitText"
                readonly
                required
                is-link
                @click="typeClick(idx, item)"
              />
              <div class="item-s" v-for="(citem, cidx) in item.workExamineInfoList" :key="cidx + 'JUserModal'">
                <JUserModal
                  :elInfo="{
                    type: 'vant',
                    attr: {
                      required: item.needNode,
                      rules: [{ required: item.needNode, message: '请选择' }],
                    },
                  }"
                  :key="cidx + 'JUserModal'"
                  :userStyle="{ width: '100%' }"
                  :disabled="item.disabled || !item.needNode"
                  v-model:value="citem.nodeOperator"
                  type="checkbox"
                  @confirm="confirmUser($event, idx, cidx)"
                  @click-user="(cb) => changeUser(cb, item)"
                />
                <van-icon v-if="cidx > 0 && item.add" @click.stop="deletePerson(idx, cidx, citem)" color="#ee0a24" name="delete-o" />
              </div>
            </template>
            <template #active-icon>
              <span class="step-icon">{{ idx + 1 }}</span>
            </template>
            <template #inactive-icon>
              <span class="step-icon">{{ idx + 1 }}</span>
            </template>
            <template #finish-icon>
              <span class="step-icon">{{ idx + 1 }}</span>
            </template>
          </van-step>
        </template>
      </van-steps>
    </van-form>
    <van-popup v-model:show="typeShow" position="bottom">
      <van-picker v-model="selectedValues" :columns="typeList" @cancel="typeShow = false" @confirm="onConfirm($event, 'type')" />
    </van-popup>
    <allPerson
      :value="curPersonValue"
      :isRadio="true"
      :not-tree="true"
      value-key="id"
      title-key="realname"
      v-model:show="personShow"
      @change="checkedChange"
    />
  </div>
</template>
<script lang="ts" setup>
  import { computedStepData } from '../../../../hazardousOperation/workRequisition/components/computedData';
  import { getApplyForUnit, getWorkJobWorkDetail } from '../../../../hazardousOperation/api/index';
  import curLoading from '../../../components/loading.vue';
  import { ref, watch, nextTick } from 'vue';
  import allPerson from './allPerson.vue';
  import { showFailToast } from 'vant';
  import JUserModal from '/@/components/App/JUserModal.vue';
  const props = defineProps({
    detailInfo: {
      type: Object,
      default: () => {},
    },
    workType: {
      type: String,
      default: '1',
    },
    workGrade: {
      type: String,
      default: '',
    },
  });

  const changeUser = (cb, item) => {
    let userIds: any = [];
    userIds = item.workExamineInfoList
      .filter((item) => item.nodeOperator !== undefined) // 过滤掉 user 是 undefined 的项
      .flatMap((item) => item.nodeOperator.split(','));
    cb(userIds);
  };

  const treeSelectRef = ref();
  const curWorkExamineInfoList = ref<any[]>([]);

  const formRef = ref();
  // 审批流列表
  const stepArrs = ref<any[]>([]);

  const typeShow = ref(false);
  const selectedValues = ref([1]);
  const typeList = ref([
    { text: '单岗单批', value: 1 },
    { text: '多岗多批', value: 2 },
  ]);
  const typeIdX = ref(0);

  const personShow = ref(false);
  const personIdX = ref(0);
  const personCIdX = ref(0);
  const selectList = ref([]);

  const workUnit = ref([]);

  const loading = ref(false);
  let personnel = ref([]); //获取人员

  watch(
    () => props.workGrade,
    (newVal) => {
      getProcess();
    }
  );

  const confirmUser = (str, idx, cidx) => {
    console.log(str, idx, cidx);
    stepArrs.value[idx].workExamineInfoList[cidx].nodeOperatorName = str;
  };
  const asyncValidator = (value, idx, cidx) => {
    console.log(value, idx, cidx, !!stepArrs.value[idx].workExamineInfoList[cidx].nodeOperator);
    return Promise.resolve(!!stepArrs.value[idx].workExamineInfoList[cidx].nodeOperator);
  };

  pageInit(); // 页面初始化
  function pageInit() {
    getPersonnelData();
  }
  async function getPersonnelData() {
    loading.value = true;
    setTimeout(() => { 
      if(loading.value) loading.value = false;
    }, 2000);
    workUnit.value = await getApplyForUnit();
    getProcess();
  }

  // 获取审批流程
  async function getProcess() {
    stepArrs.value = await computedStepData(props.detailInfo);
    if (props.detailInfo.id) {
      const steps = await getWorkJobWorkDetail(props.detailInfo.id);
      stepArrs.value.map((val) => {
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
    nextTick(() => {
      loading.value = false;
    })
  }

  // 单多岗下拉选展开
  const typeClick = (idx, item) => {
    if (item.disabled) return;
    typeShow.value = true;
    typeIdX.value = idx;
  };

  const curPersonItem = ref({});
  const curPersonValue = ref<any>({});
  const userFilterParams = ref({});
  // 人员下拉选
  const personClick = (idx, cidx, item) => {
    console.log(item);
    curPersonItem.value = item;
    if (item.disabled) return;
    personnel.value = item.options;
    curWorkExamineInfoList.value = item.workExamineInfoList;
    personShow.value = true;
    personIdX.value = idx;
    personCIdX.value = cidx;
    curPersonValue.value = {
      ids: Array.isArray(item.workExamineInfoList[cidx].nodeOperator)
        ? item.workExamineInfoList[cidx].nodeOperator.join(',')
        : item.workExamineInfoList[cidx].nodeOperator,
      names: Array.isArray(item.workExamineInfoList[cidx].nodeOperatorName)
        ? item.workExamineInfoList[cidx].nodeOperatorName.join(',')
        : item.workExamineInfoList[cidx].nodeOperatorName,
    };
    console.log(curPersonValue.value);

    userFilterParams.value = {
      roleCode: item.roleCode,
      orgCode: item.orgCode,
    };
  };

  // 单多岗下拉选确认
  const onConfirm = (e: any) => {
    stepArrs.value[typeIdX.value].type = e.selectedOptions[0].value;
    stepArrs.value[typeIdX.value].typeName = e.selectedOptions[0].text;
    typeShow.value = false;

    if (e.selectedOptions[0].value == 1 && stepArrs.value[typeIdX.value].workExamineInfoList.length > 1) {
      stepArrs.value[typeIdX.value].workExamineInfoList.splice(1, stepArrs.value[typeIdX.value].workExamineInfoList.length - 1);
    }
    selectedValues.value = [1];
  };

  // 人员多选picker 确认处理
  const checkedChange = (result) => {
    console.log(result);

    let resultArr: [] = result.ids && Array.isArray(result.ids) ? result.ids : result.ids.split(',');
    let resultNames: [] = result.names.split(',');
    if (stepArrs.value[personIdX.value].type == 2) {
      let alreadyChose = false;
      let names = [];
      stepArrs.value[personIdX.value].workExamineInfoList.map((val) => {
        resultArr.map((item, idx) => {
          if (val.nodeOperator && val.nodeOperator.includes(item)) {
            alreadyChose = true;
            names.push(resultNames[idx]);
          }
        });
      });
      if (alreadyChose) {
        showFailToast('请勿重复选择：' + names.toString());
        return;
      }
    }

    personShow.value = false;
    stepArrs.value[personIdX.value].workExamineInfoList[personCIdX.value].nodeOperator = result.ids;
    stepArrs.value[personIdX.value].workExamineInfoList[personCIdX.value].nodeOperatorName = result.names;

    selectList.value = [];
    curPersonValue.value = '';
  };

  // 添加人员
  const addPerson = (idx) => {
    stepArrs.value[idx].workExamineInfoList.push({ nodeOperator: '', nodeOperatorName: '' });
  };

  const deletePerson = (idx, cidx) => {
    stepArrs.value[idx].workExamineInfoList.splice(cidx, 1);
  };

  const submitForm = () => {
    return new Promise((resolve, reject) => {
      if(loading.value) {
        reject(false);
        return;
      }
      formRef.value
        ?.validate()
        .then(() => {
          let params = JSON.parse(JSON.stringify(stepArrs.value));
          params = filterPerson(params);
          resolve(params);
        })
        .catch((e) => {
          console.log(e);
          reject(false);
        });
    });
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
          item.nodeOperator = aid.join(',');
        }
      });
    }
    return arr;
  }

  const getFormData = () => {
    let params = JSON.parse(JSON.stringify(stepArrs.value));
    return params;
  };

  defineExpose({
    pageInit,
    getFormData,
    submitForm,
  });
</script>
<style lang="less" scoped>
  .tit {
    display: flex;
    justify-content: space-between;

    span {
      color: #1989fa;
    }
  }
  .step-icon {
    width: 15px;
    height: 15px;
    display: flex;
    border-radius: 50%;
    justify-content: center;
    background: #1989fa;
    align-items: center;
    color: #ffffff;
    font-size: 12px;
    line-height: 15px;
  }
  .red {
    color: #ee0a24;
  }
  .popup-main {
    height: 300px;
    overflow-y: auto;
  }
  :deep(.van-field--disabled .van-field__label) {
    color: #323233;
  }
  :deep(.van-field__control:disabled) {
    color: #323233;
    -webkit-text-fill-color: #323233;
  }
  :deep(.van-checkbox__label--disabled) {
    color: #323233;
  }
  :deep(.van-radio__label--disabled) {
    color: #323233;
  }
  :deep(.van-field--disabled) {
    background-color: #ededed;
  }
  .item-s {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
</style>
