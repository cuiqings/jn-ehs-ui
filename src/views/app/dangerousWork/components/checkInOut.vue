<template>
  <van-dialog
    width="90%"
    :style="{ top: dTop + '%' }"
    v-model:show="show"
    title="确认进出空间"
    show-cancel-button
    @cancel="cancel"
    @confirm="dialogConfirm"
    className="inoutDialog"
  >
    <van-form class="inoutform" v-model="dialogFormData" ref="dialogForm" label-width="80">
      <van-field
        :maxlength="30"
        readonly
        required
        label-width="100"
        v-model="checkInfo.spaceName"
        name="spaceName"
        label="有限空间名称"
        placeholder="请输入"
      />
      <div v-for="(item, index) in checkInfo.userList" style="padding: 0 16px">
        <h3>{{ item.userName }}</h3>
        <van-field
          v-model="item.inTime"
          readonly
          required
          name="inTime"
          label="进入时间"
          placeholder="请输入"
          @click="showPicker('inTime', index)"
          :rules="[{ required: true, message: '请输入' }]"
        />
        <van-field
          v-model="item.outTime"
          readonly
          required
          name="outTime"
          label="出来时间"
          placeholder="请输入"
          @click="showPicker('outTime', index)"
          :rules="[{ required: true, message: '请输入' }]"
        />

        <van-field
          v-model="item.accessParts"
          required
          readonly
          :maxlength="30"
          name="accessParts"
          label="检修部位"
          placeholder="请输入"
        />

        <van-field placeholder="请输入" readonly label="携带工具" name="carryTools" required  v-model="item.carryTools" :maxlength="30" />
      </div>
    </van-form>
  </van-dialog>
  <!-- 开始时间 -->
  <DateTimePicker
    :values="dialogFormData.analysisTime"
    @changeValue="showPickeranalysisTime = false"
    :showPicker="showPickeranalysisTime"
    @confirm="onConfirm"
  />
  <van-dialog v-model:show="signShow" title="签名" :before-close="beforeClose" show-cancel-button>
    <Sign v-if="signShow" v-model:value="signature" />
  </van-dialog>
</template>
<script lang="ts" setup>
  import { FormInstance, showFailToast } from 'vant';
  import Sign from '../../components/sign.vue';
  import { inSpace, outSpace, spaceConfirm, getWaitConfirmData} from '/@/views/hazardousOperation/api/index';
  import DateTimePicker from '/@/views/app/components/appDateTimePicker.vue';
  import { ref, reactive, computed, toRefs } from 'vue';
  import { useUserStore } from '/@/store/modules/user';
  import dayjs from 'dayjs';

  const userStore = useUserStore();
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
    spaceName: curItem.value.limitSpaceName || 'A-04 热工',
    accessParts: '',
    carryTools: '',
    inSign: userStore.getUserInfo.signature
  });
  const checkInfo = ref<any>({});
  const init = async () => {
    console.log(show.value)
    if (!isIn.value) {
      await getWaitConfirmData({ workApplyId: curItem.value.id }).then((res) => {
        checkInfo.value = res;
      });
    }
  }

  // 显示时间选择器
  const curIndex = ref(0);
  const curKey = ref('');
  
  const showPicker = (key, idx) => {
    curKey.value = key;
    curIndex.value = idx;
    showPickeranalysisTime.value = true;
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
        spaceConfirm({ workApplyId: curItem.value?.id, ...checkInfo.value, sign: signature.value }).then((res) => {
          resolve(true);
          emits('update:show', false);
          emits('submit');
        }).catch((err) => {
          showFailToast(err.message || '操作失败');
          resolve(false);
        });
      }
    });
  };

  // 日期选择
  const onConfirm = (e) => {
    checkInfo.value.userList[curIndex.value][curKey.value] = e;
    showPickeranalysisTime.value = false;
  };
</script>
<style lang="less" scoped>
  .divinput{
    :deep(.van-cell){
      padding: 10px 0 !important;
    }
  }
  .inoutform{
    max-height: 68vh;
    overflow-y: auto;
  }
</style>
