<template>
  <BasicModal @register="registerModal" :title="getTitle" width="600px" @ok="handleSubmit">
    <div style="display:flex; align-items:center; justify-content:center;margin:15px;">
      <p v-if="!isBatch">已选 {{ facilityNo }}：{{ name }}, 是否确认更新?</p>
      <p v-else>已选 {{ number }} 个消防器材, 是否确认全部更新?</p>
    </div>

    <div>
      <BasicForm @register="registerForm" />
    </div>
  </BasicModal>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { check, checkBatch } from './url';
import { BasicForm, useForm } from '/@/components/Form';
import { BasicModal, useModalInner } from '/@/components/Modal';
import { FormSchema } from '/@/components/Table';
import dayjs, { Dayjs } from 'dayjs';

// 声明Emits
const emit = defineEmits(['register', 'success']);
const rowId = ref('');
const isBatch = ref(); // 是否批量操作模式
const ids = ref([]);
let getTitle = ref('');
const name = ref('');
const facilityNo = ref('');
const number = ref(0);
const infoSingle = ref<any>({
  checkVos: [
    {
      checkType: '',
      id: '',
    },
  ],
  nextCheckDate: '',
  remark: '',

});
const infoBatch = ref<any>({
  checkVos: [
    {
      checkType: '',
      id: '',
    },
  ],
  nextCheckDate: '',
  remark: '',
});

const checkFormSchema: FormSchema[] = [
  {
    label: '下次检定日期',
    field: 'nextCheckDate',
    component: 'DatePicker',
    componentProps: {
      format: 'YYYY-MM-DD',
      valueFormat: 'YYYY-MM-DD',
      style: {
        width: '100%'
      },
      getPopupContainer: () => document.body,
    }
  },
  {
    label: '备注',
    field: 'remark',
    component: 'Input',
  },
]
// 表单配置
const [registerForm, { resetFields, setFieldsValue, validate, updateSchema }] = useForm({
  schemas: checkFormSchema,
  showActionButtonGroup: false,
});

// 表单赋值
const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {

  //获取传来的data里的值 这里的data是选中的那一列数据或多列的ids
  isBatch.value = data.isBatch;
  updateSchema({
    label: '下次检定日期',
    field: 'nextCheckDate',
    component: 'DatePicker',
    componentProps: {
      format: 'YYYY-MM-DD',
      valueFormat: 'YYYY-MM-DD',
      style: {
        width: '100%'
      },
      disabledDate: (current: Dayjs) => {
        return current && current < dayjs(new Date()).endOf('day');
      },
      getPopupContainer: () => document.body,
    }
  });

  //获取标题
  if (!isBatch.value) {
    console.log('isBatch', isBatch.value);
    getTitle.value = '设备检验';
  } else {
    console.log('isBatch', isBatch.value);
    getTitle.value = '批量检验';
  }

  if (!isBatch.value) {
    //获取装备名称
    name.value = data.record.equipmentName;
    facilityNo.value = data.record.facilityNo;
  } else {
    number.value = data.records.length;
    ids.value = data.records;
  }
  // 重置表单
  await resetFields();
  setModalProps({ confirmLoading: false, minHeight: 180 });

  // 表单赋值
  if (!isBatch.value) {
    if (data?.record) {
      rowId.value = data.record.id;
      data.record.nextCheckDate = ''
      let record = JSON.parse(JSON.stringify(data.record))
      if(record.remark) record.remark = ''
      await setFieldsValue({
        ...record
      });
    }
  }
});

// 表单提交事件
async function handleSubmit() {
  try {
    let values = await validate();

    if (!isBatch.value) {

      infoSingle.value.nextCheckDate = values.nextCheckDate;
      infoSingle.value.remark = values.remark;
      console.log('infoSingle:', infoSingle.value);

      setModalProps({ confirmLoading: true });
      // 提交表单
      await check(infoSingle.value, rowId.value);

    } else {

      infoBatch.value.nextCheckDate = values.nextCheckDate;
      infoBatch.value.remark = values.remark;
      setModalProps({ confirmLoading: true });

      // 提交表单
      await checkBatch(infoBatch.value, ids.value);
    }

    // 关闭弹窗
    closeModal();

    // 刷新列表
    if (isBatch.value) {
      emit('success', { infoSingle });
    } else {
      emit('success', { infoBatch });
    }
  } finally {
    setModalProps({ confirmLoading: false });
  }
}

</script>
