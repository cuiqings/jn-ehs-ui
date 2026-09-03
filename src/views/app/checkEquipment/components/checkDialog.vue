<template>
  <van-dialog v-model:show="show" :title="single ? '设备检验' : '批量检验设备'" show-cancel-button @confirm="confirm" @cancel="cancel">
    <div class="content">
      <div class="hint" v-if="!single">已选{{ ids.length }}个设备，是否确认全部检验？</div>
      <van-form v-model="formData" ref="form">
        <van-field
          v-model="formData.nextCheckDate"
          label="下次检验日期"
          placeholder="请选择"
          label-align="top"
          right-icon="notes-o"
          readonly
          @click="calendarShow = true"
        >
        </van-field>
        <van-field v-model="formData.remark" label="备注" maxlength="50" placeholder="请输入" type="textarea" rows="3" autosize label-align="top" />
      </van-form>
    </div>
  </van-dialog>
  <van-calendar :minDate="minDate" v-model:show="calendarShow" @confirm="calendarConfirm" />
</template>

<script lang="ts" setup>
  import { computed, ref } from 'vue';
  import dayjs, { Dayjs } from 'dayjs';
  const props = withDefaults(
    defineProps<{
      show: boolean;
      ids: string[];
      single: boolean;
    }>(),
    {
      show: false,
      single: false
    }
  );

  const formData = ref({
    nextCheckDate: '',
    remark: '',
  });

  const form = ref();

  const calendarShow = ref(false);
  const emits = defineEmits<{
    (e: 'update:show', val: boolean): void;
    (e: 'hideBatch', val: any): void;
  }>();

  const show = computed({
    get: () => props.show,
    set: (val) => {
      console.log(val);
      return show;
    },
  });

  const minDate = ref(new Date(dayjs(new Date(new Date(dayjs(new Date()).format('YYYY-MM-DD')).getTime()+24*60*60*1000)).format('YYYY-MM-DD')))

  const calendarConfirm = (val: any) => {
    formData.value.nextCheckDate = dayjs(val).format('YYYY-MM-DD');
    calendarShow.value = false;
  };

  const confirm = () => {
    emits('hideBatch', formData.value)
    formData.value.nextCheckDate = '';
    formData.value.remark =  '';
    emits('update:show', false);
  };

  const cancel = () => {
    formData.value.nextCheckDate = '';
    formData.value.remark =  '';
    emits('update:show', false);
  };
</script>
<style lang="less" scoped>
  .content {
    padding: 15px;
    .hint {
      text-align: center;
      font-size: 16px;
    }
  }
</style>
