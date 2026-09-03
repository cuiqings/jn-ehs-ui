<template>
    <van-form v-model="dialogFormData" ref="dialogForm" label-width="80">
      <van-field
        v-model="dialogFormData.analysisTime"
        label-width="100"
        readonly
        required
        name="analysisTime"
        :label="curItem.workType == 2 ? '取样时间' : '动火分析时间'"
        placeholder="请输入"
        @click="showPickeranalysisTime = true"
        :rules="[{ required: true, message: '请输入' }]"
      />
      <!-- <van-field
        v-if="curItem.workType == 2"
        :maxlength="30"
        v-model="dialogFormData.analysisSite"
        name="analysisSite"
        label="位置"
        placeholder="请输入"
        readonly
        @click="analysisSiteClick"
      /> -->

      <van-field
        required
        v-if="curItem.workType == 3"
        :maxlength="30"
        v-model="dialogFormData.analysisSite"
        name="analysisSite"
        label="采样地点"
        placeholder="请输入"
        :rules="[{ required: true, message: '请输入' }]"
      />

      <van-field
        v-if="curItem.workType == 3"
        placeholder="请输入"
        label="分析数据"
        name="analysisData"
        required
        v-model="dialogFormData.analysisData"
        :maxlength="30"
        :rules="[{ required: true, message: '请输入' }]"
      >
        <template #button>ppm</template>
      </van-field>

      <van-field
        v-model="dialogFormData.oxygenContent"
        v-if="curItem.workType == 2"
        required
        :maxlength="30"
        name="oxygenContent"
        @input="changeOxygenContent"
        label="氧含量"
        placeholder="请输入"
        :rules="[{ required: true, message: '请输入' }]"
      >
        <template #button>%</template>
      </van-field>

      <van-field
        placeholder="请输入"
        label="一氧化碳"
        name="carbonMonoxide"
        required
        v-model="dialogFormData.carbonMonoxide"
        :maxlength="30"
        v-if="curItem.workType == 2"
        :rules="[{ required: true, message: '请输入' }]"
      >
        <template #button>ppm</template>
      </van-field>

      <van-field
        v-model="dialogFormData.gas"
        v-if="curItem.workType == 2"
        required
        :maxlength="30"
        name="gas"
        label="可燃气体"
        placeholder="请输入"
        :rules="[{ required: true, message: '请输入' }]"
      >
        <template #button>%LEL</template>
      </van-field>

      <van-field
        label="硫化氢"
        placeholder="请输入"
        name="toxicHarmfulMedia"
        required
        v-model="dialogFormData.toxicHarmfulMedia"
        :maxlength="30"
        v-if="curItem.workType == 2"
        :rules="[{ required: true, message: '请输入' }]"
      >
        <template #button>ppm</template>
      </van-field>
      <van-field
        label="其他"
        name="otherGas"
        v-model="dialogFormData.otherGas"
        :maxlength="30"
        required
        v-if="curItem.workType == 2"
        :rules="[{ required: true, message: '请输入' }]"
      >
      </van-field>
      <van-field
        label="粉尘"
        name="dust"
        v-model="dialogFormData.dust"
        :maxlength="30"
        required
        v-if="curItem.workType == 2"
        :rules="[{ required: true, message: '请输入' }]"
      >
      </van-field>
      <van-field
        label="分析人"
        name="analystName"
        disabled
        v-model="dialogFormData.analystName"
        :maxlength="30"
        :rules="[{ required: true, message: '请输入' }]"
      >
      </van-field>
      <div v-if="curItem.workType == 2" style="text-align: center; margin: 20px 0">
        <a-button type="primary" :disabled="!curItem.gasDetectorsName" :loading="getIng" @click="getGasDetectorsData">数据自动获取</a-button>
        <div style="font-size: 12px"
          >已选择四合一设备：<span style="color: #1890ff">{{ curItem.gasDetectorsName }}</span></div
        >
      </div>
    </van-form>
  <!-- 开始时间 -->
  <DateTimePicker
    :values="dialogFormData.analysisTime"
    @changeValue="showPickeranalysisTime = false"
    :showPicker="showPickeranalysisTime"
    @confirm="onConfirm($event, 'analysisTime')"
  />
  <van-popup v-model:show="pickerShow" position="bottom">
    <van-picker :columns="columns" @confirm="onConfirm2" @cancel="pickerShow = false" />
  </van-popup>
</template>
<script lang="ts" setup>
  import DateTimePicker from '/@/views/app/components/appDateTimePicker.vue';
  import { getDeviceData } from '/@/views/hazardousOperation/api/index';
  import { FormInstance } from 'vant';
  import { ref, reactive, computed } from 'vue';
  import { useUserStore } from '/@/store/modules/user';
  import dayjs from 'dayjs';

  const userStore = useUserStore();
  const dialogForm = ref<FormInstance>();
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

  const dialogFormData = reactive<WorkAnalysisItems>({
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
  dialogFormData.analysisSite = props.local;
  const columns = [
    { text: '上', value: '上' },
    { text: '中', value: '中' },
    { text: '下', value: '下' },
  ];

  const cancel = () => {
    dialogFormData.analysisSite = '';
    dialogFormData.analysisTime = dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss');
    dialogFormData.oxygenContent = '';
    dialogFormData.gas = '';
    dialogFormData.toxicHarmfulMedia = '';
    dialogFormData.toxicHarmfulMediaUnit = '';
    dialogFormData.carbonMonoxide = '';
    dialogFormData.carbonMonoxideUnit = '';
    dialogFormData.otherGas = '';
    dialogFormData.otherGasUnit = '';
    dialogFormData.determination = '';
    dialogForm.value?.resetValidation();
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
      Object.assign(dialogFormData, res);
    }
  };
  
  const validate = () => {
    return dialogForm.value?.validate();
  };

  // 位置
  const onConfirm2 = (e) => {
    dialogFormData.analysisSite = e.selectedValues[0];
    pickerShow.value = false;
  };

  // 日期选择
  const onConfirm = (e, key) => {
    dialogFormData.analysisTime = e;
    showPickeranalysisTime.value = false;
  };
  // 根据氧气浓度判断是否合格
  const changeOxygenContent = ({ target }) => {
    if (target.value < 23.5 && target.value > 19.5) {
      dialogFormData.determination = '1';
    } else {
      dialogFormData.determination = '2';
    }
  };
  const getData = () => {
    dialogFormData['workApplyId'] = props.curItem.id;
    return JSON.parse(JSON.stringify(dialogFormData));
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
