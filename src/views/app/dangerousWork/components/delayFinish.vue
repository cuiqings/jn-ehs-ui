<template>
    <van-dialog v-model:show="show" title="延时续签" @cancel="cancel" show-cancel-button @confirm="dialogConfirm">
      <van-form ref="dialogForm" v-if="props.delayInfo">
        <van-field
          label-align="top"
          v-model="dialogFormData.delayDate"
          readonly
          required
          name="delayDate"
          label="延时时间"
          placeholder="请输入"
          @click="showPickeranalysisTime = true"
          :rules="[{ required: true, message: '请输入' }]"
        />
        <van-field
          label-align="top"
          v-model="dialogFormData.reason"
          type="textarea"
          autosize
          required
          max-length="100"
          name="reason"
          label="延时续签原因"
          placeholder="请输入"
          :rules="[{ required: true, message: '请输入' }]"
        />
        <van-field v-if="delayInfo.workExamineInfo && delayInfo.workExamineInfo" label-align="top" label="延时续签审批">
          <template #input>
            <van-steps direction="vertical">
              <van-step v-for="item in delayInfo.workExamineInfo">
                <div :class="{ red: item.state == 1, activetext: item.state == 0}">
                  <h3>{{ item.nodeName }}</h3>
                  <p>{{ item.nodeTime }} {{ item.nodeOperator }} {{ ['审批通过', '审批退回'][item.state] }}</p>
                </div>
              </van-step>
            </van-steps>
          </template></van-field
        >
      </van-form>
      <template #footer>
        <div class="footer">
          <van-button
            type="default"
            size="small"
            @click="cancel"
            >取消</van-button
          >
          <van-button
            type="primary"
            size="small"
            v-if="!delayInfo.workExamineInfo"
            @click="dialogConfirm"
            >确定</van-button
          >
          <van-button
            type="primary"
            size="small"
            v-if="delayInfo.workExamineInfo && delayInfo.workExamineInfo[delayInfo.workExamineInfo.length - 1].state != null"
            @click="reApply"
            >{{delayInfo.workExamineInfo[delayInfo.workExamineInfo.length - 1].state == 1 ? '重新申请' : '继续申请'}}</van-button
          >
        </div>
      </template>
    </van-dialog>
    <!-- 开始时间 -->
    <DateTimePicker
      :values="dialogFormData.delayDate"
      @changeValue="showPickeranalysisTime = false"
      :showPicker="showPickeranalysisTime"
      @confirm="onConfirm($event, 'analysisTime')"
    />
    
  </template>
  <script lang="ts" setup>
    import DateTimePicker from '/@/views/app/components/appDateTimePicker.vue';
    import { FormInstance } from 'vant';
    import { ref, reactive, computed, watch } from 'vue';
    const dialogForm = ref<FormInstance>();
    const showPickeranalysisTime = ref(false);
    const props = defineProps({
      show: {
        type: Boolean,
        default: false,
      },
      delayInfo: {
        type: Object,
        default: () => ({}),
      },
    });
    const show = computed(() => props.show);
    const emits = defineEmits(['submit', 'update:show']);
    interface WorkAnalysisItems {
      delayDate: string;
      reason: string;
    }
  
    const dialogFormData = reactive<WorkAnalysisItems>({
      reason: '',
      delayDate: '',
    });
  
    const delayInfo = reactive({});
    const showBtn1 = ref(false);
   
    watch(
      () => props.delayInfo,
      (val) => {
        console.log('props.delayInfo', val);
        Object.assign(delayInfo, val);
        dialogFormData.delayDate = props.delayInfo.delayDate;
        dialogFormData.reason = props.delayInfo.delayReason;
      },
      { deep: true }
    );
  
    const cancel = () => {
      emits('update:show', false);
    };
    const dialogConfirm = () => {
      dialogForm.value
        ?.validate()
        .then(() => {
          emits('submit', dialogFormData);
          emits('update:show', false);
          Object.assign(dialogFormData, {
            delayDate: '',
            reason: '',
          });
          return true;
        })
        .catch(() => {
          return false;
        });
    };
  
    // 日期选择
    const onConfirm = (e, key) => {
      dialogFormData.delayDate = e;
      showPickeranalysisTime.value = false;
    };
  
    const reApply = () => {
      dialogFormData.reason = '';
      dialogFormData.delayDate = '';
      Object.assign(delayInfo, {
        applicant: '',
        applicationTime: '',
        delayDate: '',
        delayReason: '',
        workApplyId: '',
        workDelayExamineId: '',
        workExamineInfo: null,
      });
      showBtn1.value = true;
      console.log(showBtn1.value);
      
    };
  </script>
  <style lang="less" scoped>
    .footer {
      padding: 10px 16px;
      text-align: center;
      display: flex;
      justify-content: space-around;
    }
    .red {
      color: #ee0a24 !important;
      h3 {
        color: #ee0a24 !important;
      }
    }
    .activetext{
      color: #1989fa !important;
      h3 {
        color: #1989fa !important;
      }
    }
  </style>