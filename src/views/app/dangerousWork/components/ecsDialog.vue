<template>
  <van-dialog width="100%" v-model:show="show" title="开始作业" @cancel="cancel" show-cancel-button @confirm="dialogConfirm">
    <van-form ref="dialogForm">
      <van-field
        required
        disabled
        v-model="tempElectricityForm.time"
        label="开始时间"
        name="otherWorkCode"
        input-align="right"
        placeholder="请选择"
      />
    </van-form>
  </van-dialog>
</template>
<script lang="ts" setup>
  import { FormInstance } from 'vant';
  import { ref, reactive, computed, watch } from 'vue';
  import { useUserStore } from '/@/store/modules/user';
  import { postStartWork, getElecCertNo } from '../../../hazardousOperation/api/index';
  import dayjs from 'dayjs';
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
  const emits = defineEmits(['submit', 'update:show', 'submit-sign']);

  const userStore: any = useUserStore();

  //临时用电表单数据
  const tempElectricityForm = reactive({
    time: dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss'),
  });
  const electricianCardCodeInput = ref(false);
  
  const cancel = () => {
    emits('update:show', false);
  };
  const dialogConfirm = () => {
    dialogForm.value
      ?.validate()
      .then(() => {
          emits('submit');
          emits('update:show', false);
      })
      .catch(() => {
        return false;
      });
  };
</script>
