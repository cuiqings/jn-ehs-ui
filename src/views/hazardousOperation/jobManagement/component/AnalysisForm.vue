<template>
    <a-form
        :model="addAnalysisForm"
        ref="addAnalysisFormRef"
        :rules="analysisRules"
        autocomplete="off"
        :label-col="{ span: 4 }"
        :wrapper-col="{ span: 18 }"
      >
        <a-form-item :label="currentWorkType == 2 ? '取样时间' : '动火分析时间'" name="analysisTime" :colon="false" required>
          <a-date-picker
            style="width: 100%"
            show-time
            placeholder="年月日时分"
            value-format="YYYY-MM-DD HH:mm:ss"
            format="YYYY-MM-DD HH:mm:ss"
            v-model:value="addAnalysisForm.analysisTime"
            :disabledDate="(current) => current > new Date()"
          />
        </a-form-item>
        <a-form-item label="位置" v-if="currentWorkType == 2" name="analysisSite" :colon="false">
          <a-select ref="select" v-model:value="addAnalysisForm.analysisSite" :disabled="curItem.workStatus == 2">
            <a-select-option value="上">上</a-select-option>
            <a-select-option value="中">中</a-select-option>
            <a-select-option value="下">下</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item
          required
          label="采样地点"
          v-if="currentWorkType == 3"
          name="analysisSite"
          :colon="false"
          :rules="{ required: true, message: '请输入' }"
        >
          <a-input placeholder="请输入" v-model:value="addAnalysisForm.analysisSite" :maxlength="30" />
        </a-form-item>
        <a-form-item label="氧含量" v-if="currentWorkType == 2" name="oxygenContent" :colon="false" required>
          <a-input placeholder="请输入" @change="changeOxygenContent" v-model:value="addAnalysisForm.oxygenContent" suffix="%" :maxlength="30" />
        </a-form-item>
        <a-form-item label="一氧化碳" name="carbonMonoxide" :colon="false" required v-if="currentWorkType == 2">
          <a-input placeholder="请输入" v-model:value="addAnalysisForm.carbonMonoxide" suffix="ppm" :maxlength="30" />
        </a-form-item>
        <a-form-item label="可燃气体" v-if="currentWorkType == 2" name="gas" :colon="false" required>
          <a-input placeholder="请输入" v-model:value="addAnalysisForm.gas" suffix="%LEL" :maxlength="30" />
        </a-form-item>
        <a-form-item label="硫化氢" name="toxicHarmfulMedia" :colon="false" required v-if="currentWorkType == 2">
          <a-input placeholder="请输入" v-model:value="addAnalysisForm.toxicHarmfulMedia" suffix="pmp" :maxlength="30" />
        </a-form-item>
        <a-form-item label="其他" name="otherGas" :colon="false" required v-if="currentWorkType == 2">
          <a-input placeholder="请输入" v-model:value="addAnalysisForm.otherGas" :maxlength="30" />
        </a-form-item>
        <a-form-item label="粉尘" name="dust" :colon="false" required v-if="currentWorkType == 2">
          <a-input placeholder="请输入" v-model:value="addAnalysisForm.dust" :maxlength="30" />
        </a-form-item>
        <a-form-item label="分析数据" name="analysisData" :colon="false" required v-if="currentWorkType == 3">
          <a-input placeholder="请输入" v-model:value="addAnalysisForm.analysisData" suffix="ppm" :maxlength="30" />
        </a-form-item>
        <a-form-item label="分析人" name="analystName" :colon="false" required>
          <a-input placeholder="请输入" disabled v-model:value="addAnalysisForm.analystName" :maxlength="30" />
        </a-form-item>
        <div v-if="currentWorkType == 2" style="text-align: center; margin-bottom: 20px">
          <a-button type="primary" :disabled="!curItem.gasDetectorsName" :loading="getIng" @click="getGasDetectorsData">数据自动获取</a-button>
          <div
            >已选择四合一设备：<span style="color: #1890ff">{{ curItem.gasDetectorsName }}</span></div
          >
        </div>
      </a-form>
</template>
<script lang="ts" setup>
  import { getDeviceData } from '/@/views/hazardousOperation/api/index';
  import { ref, reactive, computed } from 'vue';
  import { useUserStore } from '/@/store/modules/user';
  import dayjs from 'dayjs';

  const userStore = useUserStore();
  const addAnalysisFormRef = ref();
  const showPickeranalysisTime = ref(false);
  const pickerShow = ref(false);
  const props = defineProps({
    show: {
      type: Boolean,
      default: false,
    },
    curItem: {
      type: Object,
      default: () => ({}),
    },
    local: {
      type: String,
    },
    currentWorkType: {
        type: Number,
    }
  });
  const emits = defineEmits(['submit', 'update:show']);
  const show = computed(() => props.show);
  interface WorkAnalysisItems {
    analyst: string;
    analysisTime: string;
    oxygenContent: string;
    gas: string;
    analysisSite: string;
    toxicHarmfulMedia: string;
    carbonMonoxide: string;
    otherGas: string;
    workExamineId: string;
    determination: string;
    dust: string;
  }

  const addAnalysisForm = reactive<WorkAnalysisItems>({
    analysisSite: '',
    analysisTime: dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss'),
    oxygenContent: '',
    gas: '',
    toxicHarmfulMedia: '',
    carbonMonoxide: '',
    otherGas: '无',
    workExamineId: '',
    determination: '',
    dust: '无',
    analystName: userStore.getUserInfo.realname,
    analyst: userStore.getUserInfo.id,
    analysisData: '',
  });
  addAnalysisForm.analysisSite = props.local;
 
  // 表单验证规则
  const analysisRules = {
    analysisTime: [
      {
        required: true,
        message: '请选择',
        trigger: 'change',
      },
    ],
    oxygenContent: [
      {
        required: true,
        message: '请输入',
        trigger: 'change',
      },
    ],
    gas: [
      {
        required: true,
        message: '请输入',
        trigger: 'change',
      },
    ],
    toxicHarmfulMedia: [
      {
        required: true,
        message: '请输入',
        trigger: 'change',
      },
    ],
    toxicHarmfulMediaUnit: [
      {
        required: true,
        message: '请选择',
        trigger: 'change',
      },
    ],
    carbonMonoxide: [
      {
        required: true,
        message: '请输入',
        trigger: 'change',
      },
    ],
    carbonMonoxideUnit: [
      {
        required: true,
        message: '请选择',
        trigger: 'change',
      },
    ],
    otherGas: [
      {
        required: true,
        message: '请输入',
        trigger: 'change',
      },
    ],
    otherGasUnit: [
      {
        required: true,
        message: '请选择',
        trigger: 'change',
      },
    ],
    determination: [
      {
        required: true,
        message: '请选择',
        trigger: 'change',
      },
    ],
  };

  const cancel = () => {
    addAnalysisForm.analysisSite = '';
    addAnalysisForm.analysisTime = dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss');
    addAnalysisForm.oxygenContent = '';
    addAnalysisForm.gas = '';
    addAnalysisForm.toxicHarmfulMedia = '';
    addAnalysisForm.toxicHarmfulMediaUnit = '';
    addAnalysisForm.carbonMonoxide = '';
    addAnalysisForm.carbonMonoxideUnit = '';
    addAnalysisForm.otherGas = '';
    addAnalysisForm.otherGasUnit = '';
    addAnalysisForm.determination = '';
    addAnalysisFormRef.value?.clearValidate();
    addAnalysisFormRef.value?.resetFields();
  };
  const analysisSiteClick = () => {
    if(props.curItem.workStatus == 2) return;
    pickerShow.value = true;
  };

  const getIng = ref(false);
  const getGasDetectorsData = async () => {
    getIng.value = true;
    const res = await getDeviceData({ prodNum: props.curItem.gasDetectors }).finally(() => (getIng.value = false));
    if (res) {
      Object.assign(addAnalysisForm, res);
    }
  };
  
  const validate = () => {
    return addAnalysisFormRef.value?.validate();
  };

  // 位置
  const onConfirm2 = (e) => {
    addAnalysisForm.analysisSite = e.selectedValues[0];
    pickerShow.value = false;
  };

  // 日期选择
  const onConfirm = (e, key) => {
    addAnalysisForm.analysisTime = e;
    showPickeranalysisTime.value = false;
  };
  // 根据氧气浓度判断是否合格
  const changeOxygenContent = ({ target }) => {
    if (target.value < 23.5 && target.value > 19.5) {
      addAnalysisForm.determination = '1';
    } else {
      addAnalysisForm.determination = '2';
    }
  };
  const getData = () => {
    addAnalysisForm['workApplyId'] = props.curItem.id;
    return JSON.parse(JSON.stringify(addAnalysisForm));
  };
  defineExpose({
    validate,
    getData,
    cancel
  });
</script>
<style lang="less" scoped>
  // :deep(.van-field__body) {
  //   background-color: #f5f5f5 !important;
  // }
  // :deep(.van-cell){
  //   padding: 10px 10px !important
  // }
  .divinput {
    :deep(.van-cell) {
      padding: 10px 0 !important;
    }
  }
</style>
