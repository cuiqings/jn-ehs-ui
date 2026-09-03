<template>
  <div class="approvalProcess">
    <van-form ref="formRef">
      <van-steps direction="vertical" :active="0">
        <template v-for="(item, idx) in stepArrs" :key="idx">
          <van-step>
            <div :class="{'alreadyexam': item.state == 0, 'red': item.state == '1'}">
              <h3>{{ item.nodeName }}</h3>
              <template v-for="citem in item.workExamineInfo">
                <p>{{ citem.nodeTime }}</p>
                <p>{{ citem.nodeOperatorName }}</p>
                <p>操作内容：{{ citem.operatorContent }}</p>
              </template>
            </div>
            <template #active-icon>
              <span :class="['step-icon', item.state == 0 ? 'step-icon-active' : '', item.state == '1' ? 'step-icon-red' : '']">{{ idx + 1 }}</span>
            </template>
            <template #inactive-icon>
              <span :class="['step-icon', item.state == 0 ? 'step-icon-active' : '', item.state == '1' ? 'step-icon-red' : '']">{{ idx + 1 }}</span>
            </template>
            <template #finish-icon>
              <span :class="['step-icon', item.state == 0 ? 'step-icon-active' : '', item.state == '1' ? 'step-icon-red' : '']">{{ idx + 1 }}</span>
            </template>
          </van-step>
        </template>
      </van-steps>
    </van-form>
    <van-popup v-model:show="typeShow" position="bottom">
      <van-picker :columns="typeList" @cancel="typeShow = false" @confirm="onConfirm($event, 'type')" />
    </van-popup>
    <van-popup v-model:show="personShow" position="bottom">
      <div style="display: flex; justify-content: space-between; height: 44px; line-height: 44px">
        <van-button style="border: none; color: #969799" @click="cancelFn" size="normal">取消</van-button>
        <van-button style="border: none; color: #6398fb" @click="checkedChange" size="normal">确认</van-button>
      </div>
      <van-checkbox-group v-model="selectList">
        <van-cell v-for="(item, index) in personList" :key="index" :title="item.realname">
          <template #right-icon>
            <van-checkbox :name="item.id" />
          </template>
        </van-cell>
      </van-checkbox-group>
    </van-popup>
  </div>
</template>
<script lang="ts" setup>
  import { getApprovalProcess, getApplyForUnit, getApproval, getWorkJobWorkDetail } from '../../../../hazardousOperation/api/index';
  import { useUserStore } from '/@/store/modules/user';
  import { ref, computed, watch } from 'vue';
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
      type: Number || String,
      default: 1,
    },
  });

  const formRef = ref();
  // 审批流列表
  const stepArrs = ref<
    {
      nodeName: string;
      nodeNumber: string | number;
      type: string | number;
      typeName: string;
      workExamineInfoList: [any];
    }[]
  >([]);

  // 已选中人员
  const selectPerson = ref<any[]>([]);

  const typeShow = ref(false);
  const typeList = ref([
    { text: '单岗单批', value: 1 },
    { text: '多岗多批', value: 2 },
  ]);
  const typeIdX = ref(0);

  const personShow = ref(false);
  const personList = ref([]);
  const personIdX = ref(0);
  const personCIdX = ref(0);
  const selectList = ref([]);

  const userStore: any = useUserStore();
  const userInfo = computed(() => userStore.getUserInfo);
  console.log(userInfo.value.orgCode, 'userInfo');

  // 单多岗下拉选展开
  const typeClick = (idx) => {
    typeShow.value = true;
    typeIdX.value = idx;
  };

  // 人员下拉选
  const personClick = (idx, cidx) => {
    personShow.value = true;
    personIdX.value = idx;
    personCIdX.value = cidx;
    selectPerson.value = stepArrs.value[idx].workExamineInfoList[cidx].nodeOperator;
    if (stepArrs.value[idx].workExamineInfoList[cidx].nodeOperator.length > 0) {
      selectList.value = stepArrs.value[idx].workExamineInfoList[cidx].nodeOperator.split(',');
    }
  };

  // 单多岗下拉选确认
  const onConfirm = (e: any) => {
    stepArrs.value[typeIdX.value].type = e.selectedOptions[0].value;
    stepArrs.value[typeIdX.value].typeName = e.selectedOptions[0].text;
    typeShow.value = false;
    if (e.selectedOptions[0].value == 1 && stepArrs.value[typeIdX.value].workExamineInfoList.length > 1) {
      stepArrs.value[typeIdX.value].workExamineInfoList.splice(1, stepArrs.value[typeIdX.value].workExamineInfoList.length - 1);
    }
  };

  // 人员多选picker 确认处理
  const checkedChange = () => {
    personShow.value = false;
    let str = '';
    personList.value.forEach((item: any) => {
      selectList.value.forEach((i: any) => {
        if (item.id == i) {
          str += item.realname + ',';
        }
      });
    });
    stepArrs.value[personIdX.value].workExamineInfoList[personCIdX.value].nodeOperator = selectList.value.toString();
    stepArrs.value[personIdX.value].workExamineInfoList[personCIdX.value].nodeOperatorName = str.substring(0, str.length - 1);
    selectList.value = [];
  };

  const cancelFn = () => {
    personShow.value = false;
    selectList.value = [];
  };

  // 获取组织机构
  getApplyForUnit().then((res) => {
    res.forEach(async (item: any) => {
      if (item.orgCode == userInfo.value.orgCode) {
        // 获取组织机构下的人员
        let workUnitGuardianRes = await getApproval({ departIds: item.id });
        personList.value = workUnitGuardianRes.records;
      }
    });
  });

  watch(props.workGrade, (newVal) => {
    console.log(newVal, 'newVal');
  });

  // 获取审批流程
  // getApprovalProcess({
  //   workType: props.workType,
  //   value: props.workGrade,
  // }).then((res) => {
  //   res.forEach((item: any, idx) => {
  //     stepArrs.value.push({
  //       nodeName: item,
  //       nodeNumber: idx,
  //       type: 1,
  //       typeName: '单岗单批',
  //       workExamineInfoList: [{ nodeOperator: [], nodeOperatorName: [] }],
  //     });
  //   });
  //   if (props.detailInfo.id) {
  getWorkJobWorkDetail(props.detailInfo.id).then((res) => {
    stepArrs.value = res.workExamine;
    // stepArrs.value.map((val) => {
    //   res.workExamineNode.forEach((item) => {
    //     if (val.nodeName == item.nodeName) {
    //       val.workExamineInfoList = item.workExamineInfo;
    //       val.typeName = item.type == 1 ? '单岗单批' : '多岗多批';
    //       val.workExamineInfoList.forEach((pitem) => {
    //         if (pitem.nodeOperator) {
    //           pitem.nodeOperator = pitem.nodeOperator.split(',');
    //         }
    //         if (pitem.nodeOperatorName) {
    //           pitem.nodeOperatorName = pitem.nodeOperatorName.split(',').map((val) => val.split('-')[1]);
    //         }
    //       });
    //     }
    //   });
    // });
  });
  //   }
  // });

  // 添加人员
  const addPerson = (idx) => {
    stepArrs.value[idx].workExamineInfoList.push({ nodeOperator: [], nodeOperatorName: [] });
  };

  const submitForm = () => {
    // console.log(stepArrs);
    // return false
    return new Promise((resolve, reject) => {
      formRef.value
        ?.validate()
        .then(() => {
          let params = JSON.parse(JSON.stringify(stepArrs.value));
          params.map((val) => {
            val.workExamineInfoList.map((item) => {
              delete item.nodeOperatorName;
              item.nodeOperator = item.nodeOperator.toString();
            });
          });
          resolve(params);
        })
        .catch(() => {
          reject(false);
        });
    });
  };

  const getFormData = () => {
    let params = JSON.parse(JSON.stringify(stepArrs.value));
    params.map((val) => {
      val.workExamineInfoList.map((item) => {
        delete item.nodeOperatorName;
        item.nodeOperator = item.nodeOperator.toString();
      });
    });
    return params;
  };

  defineExpose({
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
    background: #a0a1a2;
    align-items: center;
    color: #ffffff;
    font-size: 12px;
    line-height: 15px;
  }
  .step-icon-active {
    background: #1989fa;
  }
  .alreadyexam{
    color: #1989fa;
    h3{
      color: #1989fa;
    }
  }
  .red{
    color: #ee0a24;
    h3{
      color: #ee0a24;
    }
  }
  .step-icon-red{
    background-color: #ee0a24;
  }
</style>
