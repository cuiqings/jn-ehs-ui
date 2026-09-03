<template>
  <van-form style="padding-bottom: 0px; background-color: #ffffff" ref="formRef">
    <van-field disabled v-model="formData.limitSpaceName" name="workGrade" label="有限空间名称" placeholder="请选择" />
    <van-field disabled v-model="formData.workGrade" name="hazardFactors" label="作业分级">
      <template #input><span style="color: #c8c9cc;">{{ { 1: '一级', 2: '二级', 3: '三级', 4: '特级' }[formData.workGrade] }}</span></template>
    </van-field>

    <van-field disabled v-model="formData.workUnitName" name="hazardFactors" label="作业车间" placeholder="请输入" />

    <van-field disabled v-model="formData.workTeamName" name="hazardFactors" label="作业班组" placeholder="请输入" />

    <van-field disabled v-model="formData.workContent" name="workContent" label="作业内容" placeholder="请输入" />

    <van-field disabled v-model="formData.operatorName" name="operatorName" label="作业人员" placeholder="请输入" />

    <van-field disabled v-model="formData.sceneHeadName" name="sceneHeadName" label="作业负责人" placeholder="请输入" />

    <van-field disabled v-model="formData.workUnitGuardianName" name="workUnitGuardianName" label="监护人员" placeholder="请输入" />

    <van-field disabled v-model="formData.workCheck.otherHead" name="otherHead" label="其他人员" placeholder="请输入" />

    <van-field
      input-align="right"
      v-model="tempElectricityForm.start"
      name="startTime"
      label="实际实施作业时间"
      label-align="top"
      placeholder="请选择"
      disabled
      required
    >
      <template #input>
        <van-field
          input-align="center"
          :border="false"
          v-model="tempElectricityForm.startTime"
          name="startTime"
          label-align="top"
          placeholder="开始时间"
          disabled
          style="padding: 10px 0"
        />
        <span style="color: #c8c9cc;">至</span>
        <van-field
          input-align="center"
          :border="false"
          v-model="tempElectricityForm.endTime"
          name="endTime"
          label-align="top"
          placeholder="结束时间"
          disabled
          style="padding: 10px 0"
        />
      </template>
    </van-field>

    <!-- 开始时间 -->
    <DateTimePicker
      :minDate="new Date()"
      :values="formData.startTime"
      @changeValue="showPicker.startTime = false"
      :showPicker="showPicker.startTime"
      @confirm="onConfirm($event, 'startTime')"
    />
    <!-- 结束时间 -->
    <DateTimePicker
      :minDate="new Date()"
      :values="formData.endTime"
      @changeValue="showPicker.endTime = false"
      :showPicker="showPicker.endTime"
      @confirm="onConfirm($event, 'endTime')"
    />

    <van-field
      label-class="labelclass"
      label-align="top"
      v-for="(item, idx) in safetyDataSauce"
      name="check"
      placeholder="请输入"
    >
      <template #input>
        <div style="width: 100%">
          <van-field
            v-if="idx == safetyDataSauce.length - 1"
            label-class="labelclass"
            label-align="top"
            :required="item.check == 1"
            v-model="formData.workCheck.otherSecurityMeasures"
            name="check"
            disabled
            type="textarea"
            :rules="[{ required: true, message: '请输入' }]"
            placeholder="请输入"
            :disabled="!item.check || item.check === '0'"
          />
          <div style="display: flex; align-items: center">
            确认结果：
            <van-radio-group disabled v-model="item.check" direction="horizontal">
              <van-radio name="1">是</van-radio>
              <van-radio name="0">否</van-radio>
            </van-radio-group>
          </div>
          <div style="display: flex; align-items: center">
            确认人：{{ item.head }}
          </div>
        </div>
      </template>

      <template #label> {{ idx + 1 }}、{{ item.name }} </template>
    </van-field>
    <template v-if="nodeInfo" v-for="item in nodeInfo.examineInfoItemList">
      <van-field label-align="left" label="现场监护人:">
        <template #input>
          <div>
            {{ item.operatorName }}
            <div class="sign-wrap">
              <img :src="getFileAccessHttpUrl(item.sign)" /> </div
          ></div>
        </template>
      </van-field>
    </template>
  </van-form>
</template>

<script lang="ts" setup>
import DateTimePicker from '../../components/appDateTimePicker.vue';
import { reactive, ref, toRefs, nextTick, watchEffect } from 'vue';
import { getFileAccessHttpUrl } from '/@/utils/common/compUtils';
  const props = defineProps({
    curItem: {
      type: Object,
      default: () => ({}),
    },
    formData: {
      type: Object,
      default: () => ({}),
    },
    nodeInfo: {
      type: Object,
      default: () => ({}),
    },
    readonly: {
      type: Boolean,
      default: false,
    },
  });
  const formRef = ref(null);
  const { formData, readonly, curItem } = toRefs(props);

  const safetyDataSauce = ref<any[]>([
    { sort: 1, name: '作业负责人对实施作业的全体人员进行了安全交底。', check: '0', user: '' },
    { sort: 2, name: '作业现场已封闭，并设置了有限空间作业安全告知牌。', check: '0', user: '' },
    { sort: 3, name: '作业现场已配置作业安全防护设备设施和应急教援设备设施，数量和种类符合要求，经检查安全、可靠。', check: '0', user: '' },
    { sort: 4, name: '出人口已安全开启进行自然通风', check: '0', user: '' },
    { sort: 5, name: '存在可能危及有限空间作业安全的物料、能量及设备设施的，已采取可篇的隔离(隔断)措施。', check: '0', user: '' },
    { sort: 6, name: '已在作业前对有限空间内盛装或残留的物料进行了清空、清洗或置换。', check: '0', user: '' },
    { sort: 7, name: '严格执行先通风、再检测、后作业的原则，气体检测结果(见气体检测记录)已符合要求。', check: '0', user: '' },
    { sort: 8, name: '作业人已佩戴符合要求的个体防护装备。', check: '0', user: '' },
    { sort: 9, name: '其他安全防护措施', check: '0', user: '' },
  ]);
  const showPicker = reactive({
    startTime: false,
    endTime: false,
  });
  watchEffect(() => {
    if (formData.value.workCheck && formData.value.workCheck.confirmResult) {
      let arr = formData.value.workCheck.confirmResult.split(',');
      safetyDataSauce.value.forEach((val) => {
        val.head = formData.value.workCheck.head;
        if (arr.includes(val.sort+'')) val.check = '1';
      });
    }
    console.log(safetyDataSauce.value);
    
  })

  const tempElectricityForm = reactive<{[key: string]: any}>({
    id: '',
    otherSecurityMeasures: '',
    otherHead: '',
    workExamineId: '',
    start: [],
  });

  const openPicker = (key) => {
    if (readonly.value) return;
    showPicker[key] = true;
  };

  const onConfirm = async (e, key) => {
    switch (key) {
      case 'startTime':
          tempElectricityForm[key] = e;
          break;
        case 'endTime':
          tempElectricityForm[key] = e;
          break;
    }
  }
  setTimeout(() => {
    tempElectricityForm.startTime = formData.value.startTimeStr;
    tempElectricityForm.endTime = formData.value.endTimeStr;
    tempElectricityForm.id = curItem.value.id;
    tempElectricityForm.workExamineId = curItem.value.workExamineId;
    tempElectricityForm.start = [formData.value.startTimeStr, formData.value.endTimeStr];
  },600)

  if (readonly) {
  }
  const otherCheck = ref(false);
  const getData = async () => {
    let str = '';
    safetyDataSauce.value.forEach((item) => {
      if (item.check == 1) {
        item.sort == 9 ? (otherCheck.value = true) : '';
        str += item.sort + ',';
      }
    });
    str = str.substring(0, str.length - 1);
    await formRef.value?.validate();
    let data = {
      workStrTime: formData.value.startTime,
      workEndTime: formData.value.endTime,
      ...tempElectricityForm,
      confirmResult: str,
    }
    return data;
  };

  defineExpose({
    getData,
  });
</script>

<style lang="less" scoped>
  .list {
    padding-left: 16px;
    span {
      display: block;
      margin-top: 10px;
    }
    div {
      line-height: 30px;
      padding-right: 16px;
    }
    div:last-child {
      border-bottom: 1px solid #e5e7eb;
      padding-bottom: 10px;
    }
  }
  .labelclass {
    align-items: center;
  }
  :deep(.van-field--disabled .van-field__label){
    color: #323233;
  }
</style>
