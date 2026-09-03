<template>
  <van-dialog width="100%" v-model:show="show" :title="item.ysFlag" @cancel="cancel" show-cancel-button @confirm="dialogConfirm">
    <van-form ref="dialogForm" label-width="70">
      <van-field
        v-if="item.xsNum <= 1 && item.ysFlag == '预验收'"
        label="验收说明"
        name="reviewComments"
        placeholder="请输入"
        required
        :rules="[{ validator: checkReviewComments, message: '请输入验收说明'}]"
        v-model="dialogFormData.reviewComments"
        :maxlength="300"
      >
      </van-field>
      <van-field v-if="item.xsNum <= 1 && item.ysFlag == '预验收'" name="reviewImg" :wrapper-col="{ span: 18, offset: 5 }">
        <template #input>
          <AppUpload :watermarkText="watermarkText" :maxCount="10" v-model:fileList="dialogFormData.reviewImg" />
        </template>
      </van-field>
      <template v-if="item.workGrade == 'C级'">
        <van-field label="盯防时间" required :colon="false" placeholder="请选择" readonly :rules="[{ validator: checTime, message: '请输入验收说明'}]">
          <template #input>
            <div class="time-wrap">
              <span @click="showTimeClick('start')">
                <template v-if="dialogFormData.visitsTime">{{ dialogFormData.visitsTime || '请选择时间' }}</template>
                <i v-if="!dialogFormData.visitsTime">请选择时间</i>  
              </span>
              ~
              <span @click="showTimeClick('end')">
                <template v-if="dialogFormData.visitsEndTime">{{ dialogFormData.visitsEndTime || '请选择时间' }}</template>
                <i v-if="!dialogFormData.visitsEndTime">请选择时间</i>  
              </span>
            </div>
          </template>
        </van-field>
        <van-field label="备注" v-model="dialogFormData.remark" placeholder="请输入" :colon="false"> </van-field>
      </template>
      <template v-if="['B级'].includes(item.workGrade)">
        <van-field
          :label-width="80"
          :label="'第' + ['', '一', '二', '三', '四', '五', '六', '七'][item.xsNum] + '次巡视'"
          :colon="false"
          name="visitsTime"
          required
        >
          <template #input>
            <span @click="showTimeClick('start')">
              <template v-if="dialogFormData.visitsTime">{{ dialogFormData.visitsTime || '请选择时间' }}</template>
              <i v-if="!dialogFormData.visitsTime">请选择时间</i>
            </span>
          </template>
        </van-field>
        <van-field label="备注" name="remark" placeholder="请输入" v-model="dialogFormData.remark" :colon="false">
        </van-field>
      </template>
      <template v-if="['A级'].includes(item.workGrade) && item.ysFlag != '预验收'">
        <van-field
          :label-width="80"
          :label="'第' + ['', '一', '二', '三', '四', '五', '六', '七'][item.xsNum] + '次巡视'"
          :colon="false"
          name="visitsTime"
          required
        >
          <template #input>
            <span @click="showTimeClick('start')">
              <template v-if="dialogFormData.visitsTime">{{ dialogFormData.visitsTime }}</template>
              <i v-if="!dialogFormData.visitsTime">请选择时间</i>
            </span>
          </template>
        </van-field>
        <van-field label="备注" placeholder="请输入" name="remark" v-model="dialogFormData.remark" :colon="false">
        </van-field>
      </template>
    </van-form>
  </van-dialog>
  <van-dialog v-model:show="signShow" title="签名" @confirm="dialogConfirmSign" show-cancel-button>
    <Sign v-if="signShow" v-model:value="signature" />
  </van-dialog>
  <!-- 开始时间 -->
  <DateTimePicker @changeValue="showPickeranalysisTime = false" :showPicker="showPickeranalysisTime" @confirm="onConfirm($event)" />
</template>
<script lang="ts" setup>
  import DateTimePicker from '/@/views/app/components/appDateTimePicker.vue';
  import { FormInstance, showFailToast } from 'vant';
  import dayjs from 'dayjs';
  import { ref, reactive, computed, watch } from 'vue';
  import { dateFormat } from '/@/utils/common/compUtils';
  import { useUserStore } from '/@/store/modules/user';
  import AppUpload from '/@/components/App/AppUpload.vue';
  import Sign from '../../components/sign.vue';
  import { uploadFile } from '/@/api/common/api';
  const dialogForm = ref<FormInstance>();
  const props = defineProps({
    show: {
      type: Boolean,
      default: false,
    },
    item: {
      type: Object,
      default: () => ({}),
    },
  });
  const show = computed(() => props.show);
  const signShow = ref(false);
  const signature = ref<string>();
  const showPickeranalysisTime = ref(false);
  const emits = defineEmits(['submit', 'update:show', 'submit-sign']);
  interface WorkAnalysisItems {
    reviewComments: string;
    reviewImg: string;
    workApplyId: string;
    sign: string;
    visitsTime: string;
    visitsEndTime: string;
    workExamineId: string;
    remark: string;
    id: string;
    start: [];
  }
  const userStore: any = useUserStore();
  const watermarkText = ref(
    `${userStore.getUserInfo.realname} ${userStore.getUserInfo.workNo} ${dateFormat(new Date(), 'yyyy-MM-dd  hh:mm:ss')} 上传`
  );

  const dialogFormData = reactive({
    reviewComments: '',
    reviewImg: '', //@ts-ignore
    sign: userStore.getUserInfo.signature,
    workApplyId: '',
    workExamineId: '',
    visitsTime: dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss'),
    visitsEndTime: '',
    remark: '',
    id: '',
    start: ref<RangeValue>(),
  });

  watch(
    () => props.item,
    (newVal) => {
      resetForm();
      Object.assign(dialogFormData, newVal);
      dialogFormData.visitsTime = dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss');
      dialogFormData.visitsEndTime = '';
      if(newVal.ysFlag == '预验收' && newVal.workGrade == 'C级'){
        dialogFormData.visitsTime = newVal.strYsTime;
        dialogFormData.visitsEndTime = dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss');
      }
      if(newVal.ysFlag == '预验收' && newVal.workGrad == 'B级'){
        dialogFormData.visitsTime = dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss');
      }
      console.log(dialogFormData);
      
    },
    {
      deep: true,
    }
  );

  function checkReviewComments() {
      if (!dialogFormData.reviewComments && !dialogFormData.reviewImg) {
        return '验收书说明或验收照片至少一项不为空！';
      } else {
        return true;
      }
  }

  function checTime() {
    if (!dialogFormData.visitsEndTime || !dialogFormData.visitsTime) {
      return '盯防时间不可为空';
    } else if (new Date(dialogFormData.visitsEndTime).getTime() - new Date(dialogFormData.visitsTime).getTime() < 15 * 60 * 1000) {
      return '盯防时间不足，请完成后进行预验收！';
    } else {
      return true;
    }
  }

  function resetForm() {
    Object.assign(dialogFormData, {
      reviewComments: '',
      reviewImg: '', //@ts-ignore
      sign: userStore.getUserInfo.signature,
      workApplyId: '',
      workExamineId: '',
      visitsTime: dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss'),
      visitsEndTime: '',
      remark: '',
      id: '',
      start: '',
    });
    signature.value = '';
    console.log(signature);
    
  }

  const cancel = () => {
    emits('update:show', false);
    resetForm();
  };

  const dialogConfirm = () => {
    dialogForm.value
      ?.validate()
      .then(() => {
        signShow.value = true;
      })
      .catch(() => {
        return false;
      });
  };

  const dialogConfirmSign = () => {
    dialogFormData.sign = signature.value;
    if (!dialogFormData.sign) {
      showFailToast('请签名！');
      return;
    }
    dialogFormData.id = props.item.id;
    dialogFormData.workApplyId = props.item.id;
    dialogFormData.workExamineId = props.item.workExamineId;
    console.log(dialogFormData);
    
    emits('submit', dialogFormData);
    emits('update:show', false);
    signShow.value = false;
    resetForm();
  };
 

  const base64ImgtoFile = (dataurl, filename = 'file') => {
    let arr = dataurl.split(',');
    let mime = arr[0].match(/:(.*?);/)[1];
    let suffix = mime.split('/')[1];
    let bstr = atob(arr[1]);
    let n = bstr.length;
    let u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], `${filename}.${suffix}`, {
      type: mime,
    });
  };
  const onSigning = (data) => {
    if (data.image) {
      uploadFile({ file: base64ImgtoFile(data.image), data: { biz: 'app' } }, (res) => {
        if (res.success) {
          dialogFormData.sign = res.message;
        }
      });
    } else {
      return showFailToast('签名为必填项！');
    }
  };
  const onClear = () => {
    dialogFormData.sign = '';
    emits('update:show', '');
  };

  const timeTag = ref<string>();
  const showTimeClick = (tag) => {
    timeTag.value = tag;
    showPickeranalysisTime.value = true;
  };
  const onConfirm = (e) => {
    if (timeTag.value == 'start') {
      dialogFormData.visitsTime = e;
    }
    if (timeTag.value == 'end') {
      dialogFormData.visitsEndTime = e;
    }
  };

</script>
<style scoped lang="less">
  span {
    i {
      font-style: normal;
      color: #999;
    }
  }
  .time-wrap{
    display: flex;
    justify-content: space-around;
    span{
      width: auto;
    }
  }
</style>
