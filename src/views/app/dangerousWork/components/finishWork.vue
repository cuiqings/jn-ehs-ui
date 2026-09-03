<template>
  <van-dialog width="100%" v-model:show="show" title="完结验收">
    <van-form ref="dialogForm">
      <van-field
        required
        label="完结状态"
        v-model="dialogFormData.status"
        autosize
        placeholder="请选择"
        :rules="[{ required: true, message: '请选择！' }]"
      >
        <template #input>
          <van-radio-group :disabled="disabled" v-model="dialogFormData.status" direction="horizontal">
            <van-radio name="正常完结">正常完结</van-radio>
            <van-radio name="取消作业">取消作业</van-radio>
          </van-radio-group>
        </template>
      </van-field>
      <van-field
        label-align="top"
        v-model="dialogFormData.reviewComments"
        type="textarea"
        autosize
        required
        max-length="100"
        name="reviewComments"
        :label="labelName"
        :placeholder="placeholder"
        :rules="[{ required: true, message: '请输入' }]"
      />

      <!-- <van-field v-if="show" label-width="40" name="reviewImg" label=" ">
        <template #input>
          <AppUpload :watermarkText="watermarkText" :maxCount="10" v-model:fileList="dialogFormData.reviewImg" />
        </template>
      </van-field> -->
    </van-form>
    <template #footer>
      <div class="footer">
        <van-button size="small" type="default" @click="cancel">取消</van-button>
        <van-button size="small" type="primary" @click="dialogConfirm(1)">验收通过</van-button>
      </div>
    </template>
  </van-dialog>
  <van-dialog v-model:show="signShow" title="签名" @confirm="dialogConfirmSign" show-cancel-button>
    <Sign v-model:value="signature" />
  </van-dialog>
</template>
<script lang="ts" setup>
  import { FormInstance, showFailToast, SignatureInstance } from 'vant';
  import { ref, reactive, computed, watch } from 'vue';
  import { dateFormat } from '/@/utils/common/compUtils';
  import { useUserStore } from '/@/store/modules/user';
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

  const emits = defineEmits(['submit', 'update:show', 'submit-sign']);
  interface WorkAnalysisItems {
    reviewComments: string;
    reviewImg: string;
    workApplyId: string;
    sign: string;
    stag: number;
  }
  const userStore: any = useUserStore();
  const watermarkText = ref(
    `${userStore.getUserInfo.realname} ${userStore.getUserInfo.workNo} ${dateFormat(new Date(), 'yyyy-MM-dd  hh:mm:ss')} 上传`
  );

  const dialogFormData = reactive<WorkAnalysisItems>({
    reviewComments: '',
    reviewImg: '',
    workApplyId: '',
    sign: '',
    stag: 1,
    status: '正常完结',
  });
  const labelName = ref<string>('验收意见');
  const placeholder = ref<string>('请输入');
  watch(
    () => props.show,
    () => {
      resetForm();
    },
    {
      deep: true,
    }
  );
  watch(
    () => props.item,
    (newVal) => {
      resetForm();
      Object.assign(dialogFormData, newVal);
      dialogFormData.workApplyId = newVal.id;
      console.log(newVal);

      if (newVal.workType == 6) {
        labelName.value = '拆除验收';
        placeholder.value = ' 已拆除';
      }
    },
    {
      deep: true,
    }
  );

  function resetForm() {
    Object.assign(dialogFormData, {
      reviewComments: '',
      reviewImg: '',
      workApplyId: '',
      sign: '',
    });
  }

  const cancel = () => {
    emits('update:show', false);
  };

  const stag = ref(1); // 0退回 1通过
  const dialogConfirm = (s: number) => {
    stag.value = s;
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
    dialogFormData.stag = stag.value;
    if (!dialogFormData.sign) {
      showFailToast('请签名！');
      return;
    }
    emits('submit', dialogFormData);
    emits('update:show', false);
    signShow.value = false;
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

  const validator = () => !!dialogFormData.sign;
</script>
<style lang="less" scoped>
  .footer {
    height: 65px;
    display: flex;
    align-items: center;
    justify-content: space-around;
  }
</style>
