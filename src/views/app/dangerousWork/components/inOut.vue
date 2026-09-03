<template>
  <van-dialog
    :style="{ top: dTop + '%' }"
    v-model:show="show"
    :title="isIn ? '进入空间' : '出来空间'"
    show-cancel-button
    @cancel="cancel"
    @confirm="dialogConfirm"
  >
    <van-form v-model="dialogFormData" ref="dialogForm" label-width="80">
      <van-field
        v-if="isIn"
        v-model="dialogFormData.inTime"
        readonly
        required
        name="inTime"
        label="进入时间"
        placeholder="请输入"
        @click="showPickeranalysisTime = true"
        :rules="[{ required: true, message: '请输入' }]"
      />
      <van-field
        v-if="!isIn"
        v-model="dialogFormData.outTime"
        readonly
        required
        name="outTime"
        label="出来时间"
        placeholder="请输入"
        @click="showPickeranalysisTime = true"
        :rules="[{ required: true, message: '请输入' }]"
      />
      <van-field
        :maxlength="30"
        readonly
        required
        v-model="dialogFormData.spaceName"
        name="spaceName"
        label="有限空间名称"
        placeholder="请输入"
      />

      <van-field
        v-model="dialogFormData.accessParts"
        required
        :maxlength="30"
        name="accessParts"
        label="检修部位"
        placeholder="请输入"
        :rules="[{ required: true, message: '请输入' }]"
      />

      <van-field placeholder="请输入" label="携带工具" name="carryTools" required  v-model="dialogFormData.carryTools" :maxlength="30"
        :rules="[{ required: true, message: '请输入' }]" />
    </van-form>
  </van-dialog>
  <!-- 开始时间 -->
  <DateTimePicker
    :values="dialogFormData.analysisTime"
    @changeValue="showPickeranalysisTime = false"
    :showPicker="showPickeranalysisTime"
    @confirm="onConfirm($event, 'analysisTime')"
  />
  <van-dialog v-model:show="signShow" title="签名" :before-close="beforeClose" show-cancel-button>
    <Sign v-if="signShow" v-model:value="signature" />
  </van-dialog>
</template>
<script lang="ts" setup>
  import { FormInstance, showFailToast } from 'vant';
  import Sign from '../../components/sign.vue';
  import { inSpace, outSpace, userGetData} from '/@/views/hazardousOperation/api/index';
  import DateTimePicker from '/@/views/app/components/appDateTimePicker.vue';
  import { ref, reactive, computed, toRefs } from 'vue';
  import { useUserStore } from '/@/store/modules/user';
  import dayjs from 'dayjs';

  const userStore:any = useUserStore();
  const signature = ref('');
  const signShow = ref(false);
  const dialogForm = ref<FormInstance>();
  const showPickeranalysisTime = ref(false);
  const props = defineProps({
    show: {
      type: Boolean,
      default: false,
    },
    curItem: {
      type: Object,
      default: () => ({}),
    },
    isIn: {
      type: Boolean,
      default: true, // true表示进入空间，false表示出来空间
    },
  });

  const { curItem, isIn } = toRefs(props);
  const emits = defineEmits(['submit', 'update:show']);
  const show = computed(() => {
    if (props.show) {
      init();
    }
    return props.show;
  });

  const dialogFormData = reactive<any>({
    inTime: dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss'),
    outTime: dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss'),
    spaceName: curItem.value.limitSpaceName,
    accessParts: '',
    carryTools: '',
    inSign: userStore.getUserInfo.signature
  });

  const init = async () => {
    dialogFormData.spaceName = curItem.value.limitSpaceName
    if (!isIn.value) {
      await userGetData({ workApplyId: curItem.value.id }).then((res) => {
        Object.assign(dialogFormData, res);
      });
      dialogFormData.outTime = dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss');
    }
  }

  const cancel = () => {
    emits('update:show', false);
    dialogFormData.inTime = dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss');
    dialogFormData.outTime = dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss');
    dialogFormData.spaceName = '';
    dialogFormData.accessParts = '';
    dialogFormData.carryTools = '';
    dialogForm.value?.resetValidation();
  };

  const dTop = ref(45);
  const dialogConfirm = () => {;
    dialogFormData.workExamineId = props.curItem.workExamineId
    dialogForm.value
      ?.validate()
      .then(() => {
        signShow.value = true;
        return true;
      })
      .catch(() => {
        return false;
      });
  };

  const beforeClose = (c) => {
    if (c == 'cancel') {
      signShow.value = false;
      return Promise.resolve(false);
    }
    return new Promise(async (resolve, reject) => {
      if (!signature.value) {
        showFailToast('请签名！');
        resolve(false);
      } else {
        if (isIn.value) {
          inSpace({ workApplyId: curItem.value?.id, ...dialogFormData, inSign: signature.value }).then((res) => {
            resolve(true);
            emits('update:show', false);
            emits('submit');
          }).catch((err) => {
            showFailToast(err.message || '操作失败');
            resolve(false);
          });
        } else {
          outSpace({ workApplyId: curItem.value?.id, ...dialogFormData, outSign: signature.value }).then((res) => {
            resolve(true);
            emits('update:show', false);
            emits('submit');
          }).catch((err) => {
            showFailToast(err.message || '操作失败');
            resolve(false);
          });;
        }
        
      }
    });
  };

  // 日期选择
  const onConfirm = (e, key) => {
    dialogFormData.analysisTime = e;
    showPickeranalysisTime.value = false;
  };
</script>
<style lang="less" scoped>
  .divinput{
    :deep(.van-cell){
      padding: 10px 0 !important;
    }
  }
</style>
