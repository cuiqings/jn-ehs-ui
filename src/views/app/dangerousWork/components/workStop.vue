<template>
  <van-dialog v-model:show="show" title="中断原因" @cancel="cancel" show-cancel-button @confirm="dialogConfirm">
    <van-form ref="dialogForm">
      <van-field
        label-align="top"
        v-model="dialogFormData.reason"
        type="textarea"
        autosize
        required
        :maxlength="100"
        name="reason"
        label="中断原因"
        placeholder="请输入"
        :rules="[{ required: true, message: '请输入' }]"
      />
      <van-field
        label-align="top"
        v-model="dialogFormData.reason"
        type="textarea"
        autosize
        required
        :maxlength="100"
        name="reason"
        label="作业状态"
        :rules="[{ required: true, message: '请选择' }]"
      >
        <template #input>
          <van-radio-group v-model="dialogFormData.desc" direction="horizontal">
            <van-radio :name="0" icon-size="16px">今日未作业</van-radio>
            <van-radio :name="1" icon-size="16px">今日已作业</van-radio>
          </van-radio-group>
        </template>
      </van-field>
    </van-form>
  </van-dialog>
</template>
<script lang="ts" setup>
import { FormInstance } from 'vant';
  import { ref, reactive, computed } from 'vue';
  const dialogForm = ref<FormInstance>();
  const props = defineProps({
    show: {
      type: Boolean,
      default: false,
    }
  })
  const show = computed(() => props.show);
  const emits = defineEmits(['submit', 'update:show'])
  interface WorkAnalysisItems {
    reason: string;
    desc: number|null;
  }

  const dialogFormData = reactive<WorkAnalysisItems>({
    desc: null,
    reason: '',
  });
  const cancel = () => {
    emits('update:show', false)
  }
  const dialogConfirm = () => {
    dialogForm.value
      ?.validate()
      .then(() => {
        emits('submit', dialogFormData);
        emits('update:show', false)
        Object.assign(dialogFormData, {
          delayDate: '',
          reason: '',
          desc: null,
        });
        return true;
      })
      .catch(() => {
        return false;
      });
  };
</script>
