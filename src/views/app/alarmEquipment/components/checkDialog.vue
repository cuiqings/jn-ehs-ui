<template>
  <van-dialog v-model:show="show" :title="title" show-cancel-button :beforeClose="beforeClose">
    <div class="content">
      <van-form v-model="formData" ref="form">
        <div class="deviceName">
          设备名称：
          {{ deviceName }}
        </div>
        <van-field
          v-if="title == '启用'"
          v-model="formData.startTime"
          label="启用开始时间"
          placeholder="请选择"
          label-align="top"
          right-icon="notes-o"
          readonly
          required
          :rules="[{ required: true, message: '请选择' }]"
          @click="startShow = true"
        >
        </van-field>
        <van-field
          v-if="title == '启用'"
          v-model="formData.info"
          label="报警启用原因"
          maxlength="100"
          placeholder="请输入"
          type="textarea"
          rows="3"
          autosize
          label-align="top"
        />
        <van-field
          v-if="title == '禁用'"
          v-model="formData.startTime"
          label="禁用开始时间"
          placeholder="请选择"
          label-align="top"
          right-icon="notes-o"
          readonly
          required
          :rules="[{ required: true, message: '请选择', validator: startValidator }]"
          @click="startShow = true"
        >
        </van-field>
        <van-field
          v-if="title == '禁用'"
          v-model="formData.endTime"
          label="禁用结束时间"
          placeholder="请选择"
          label-align="top"
          right-icon="notes-o"
          readonly
          required
          :rules="[{ required: true, message: '请选择', validator: endValidator  }]"
          @click="endShow = true"
        >
        </van-field>
        <van-field
          v-if="title == '禁用'"
          v-model="formData.info"
          label="禁用报警原因"
          maxlength="100"
          placeholder="请输入"
          type="textarea"
          required
          :rules="[{ required: true, message: '请输入' }]"
          rows="3"
          autosize
          label-align="top"
        />
      </van-form>
    </div>
  </van-dialog>
  <DateTimePicker
    @changeValue="startShow = false"
    :miniTime="miniTime"
    :showPicker="startShow"
    @confirm="calendarConfirm($event, 'startTime')"
  />
  <DateTimePicker @changeValue="endShow = false" :showPicker="endShow" @confirm="calendarConfirm($event, 'endTime')" />
</template>

<script lang="ts" setup>
  import { computed, ref, watch } from 'vue';
  import DateTimePicker from '/@/views/app/components/appDateTimePicker.vue';
  import { unEnableUpdate, enableUpdate } from '../index.api';
  import dayjs from 'dayjs';

  const miniTime = ref(dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss'));

  const props = withDefaults(
    defineProps<{
      show: boolean;
      items: any[];
      title: string;
    }>(),
    {
      show: false,
    }
  );

  const formData = ref({
    info: '',
    startTime: '',
    endTime: '',
  });
  const deviceName = ref();

  watch(
    () => props.items,
    (val) => {
      if (val) {
        init();
      }
    },
    {
      deep: true,
    }
  );

  init();
  function init() {
    let ids = [];
    let name = '';
    props.items.forEach((item) => {
      ids.push(item.deviceId);
      name += item.deviceName + ',';
    });
    name = name.substring(0, name.length - 1);
    formData.value['ids'] = ids;
    deviceName.value = name;
  }

  function startValidator(val) {
    if(new Date().getTime() > new Date(val).getTime()){
      return '禁用开始时间需大于当前时间'
    } else {
      return true
    }
  }
  function endValidator(val) {
    if(new Date(val).getTime() <= new Date(formData.value.startTime).getTime()){
      return '禁用结束时间需大于禁用开始时间'
    } else {
      return true
    }
  }

  const form = ref();

  const startShow = ref(false);
  const endShow = ref(false);
  const emits = defineEmits<{
    (e: 'update:show', val: boolean): void;
    (e: 'checkSubmit'): void;
  }>();

  const show = computed({
    get: () => props.show,
    set: (val) => {
      return show;
    },
  });

  const calendarConfirm = (val: any, key) => {
    formData.value[key] = val;
    startShow.value = false;
    endShow.value = false;
  };

  const beforeClose = (action) => {
    return new Promise((resolve) => {
      if (action === 'confirm') {
        form.value.validate().then(() => {
          if (props.title == '禁用') {
            unEnableUpdate(formData.value).then((res) => {
              resolve(true);
              reserForm();
              emits('checkSubmit');
              emits('update:show', false);
            }).catch(err => resolve(false));
          } else {
            enableUpdate(formData.value).then((res) => {
              resolve(true);
              reserForm();
              emits('checkSubmit');
              emits('update:show', false);
            }).catch(err => resolve(false));
          }
        }).catch(err => resolve(false))
      } else {
        reserForm();
        emits('update:show', false);
        resolve(true);
      }
    });
  };

  const reserForm = () => {
    Object.keys(formData.value).forEach((key) => {
      formData.value[key] = '';
    })
  }
</script>
<style lang="less" scoped>
  .content {
    padding: 15px;
    .hint {
      text-align: center;
      font-size: 16px;
    }
    .deviceName {
      font-size: 14px;
      padding: 0 15px;
      max-height: 160px;
      overflow-y: auto;
    }
  }
</style>
