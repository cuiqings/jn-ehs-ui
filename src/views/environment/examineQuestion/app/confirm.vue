<template>
  <a-card>
    <BasicForm @register="registerForm" />
    <div class="footer">
      <a-button style="width: 120px" @click="handleClose">取消</a-button>
      <a-button type="primary" :loading="loading" style="width: 120px" @click="handleSubmit">提交</a-button>
    </div>
  </a-card>
</template>
<script lang="ts" name="app-examineQuestion-confirm" setup>
  import { useRoute, useRouter } from 'vue-router';
  import { selectDeptNew, getUser, confirm } from '../url/index';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import dayjs from 'dayjs';
  import { ref, onMounted } from 'vue';
  const route: any = useRoute();
  const router = useRouter();
  const loading = ref(false);
  //表单配置
  const [registerForm, { setFieldsValue, updateSchema, validate }] = useForm({
    schemas: [
      {
        label: '',
        field: 'id',
        component: 'Input',
        show: false,
      },
      {
        label: '整改结果',
        field: 'rectResult',
        component: 'RadioGroup',
        required: true,
        componentProps: ({ formModel }) => {
          return {
            options: [
              { label: '未整改', value: '0' },
              { label: '整改完成', value: '1' },
            ],
            onChange: (e) => {
              if (e.target.value === '0') {
                formModel.rectFeedback = '';
                formModel.rectImage = '';
                formModel.reviseDate = getYear(new Date());
                updateSchema([
                  {
                    field: 'rectFeedback',
                    ifShow: false,
                  },
                  {
                    field: 'rectImage',
                    ifShow: false,
                  },
                  {
                    field: 'reviseDate',
                    ifShow: true,
                  },
                  {
                    field: 'dutyDepartCode',
                    ifShow: true,
                  },
                  {
                    field: 'dutyPersonId',
                    ifShow: true,
                    componentProps: {
                      disabled: true,
                    },
                  },
                ]);
              }
              if (e.target.value === '1') {
                formModel.reviseDate = '';
                formModel.dutyDepartCode = undefined;
                formModel.dutyPersonId = undefined;
                updateSchema([
                  {
                    field: 'rectFeedback',
                    ifShow: true,
                  },
                  {
                    field: 'rectImage',
                    ifShow: true,
                  },
                  {
                    field: 'reviseDate',
                    ifShow: false,
                  },
                  {
                    field: 'dutyDepartCode',
                    ifShow: false,
                  },
                  {
                    field: 'dutyPersonId',
                    ifShow: false,
                  },
                ]);
              }
            },
            getPopupContainer: () => document.body,
          };
        },
      },
      {
        label: '整改反馈',
        field: 'rectFeedback',
        required: true,
        component: 'InputTextArea',
        ifShow: false,
        componentProps: {
          maxlength: 200,
          rows: 5,
        },
      },
      {
        label: '整改照片',
        field: 'rectImage',
        component: 'JImageUpload',
        ifShow: false,
        componentProps: {
          fileMax: 10,
          text: '',
          isWatermark: true,
        },
      },
      {
        label: '整改期限',
        field: 'reviseDate',
        component: 'DatePicker',
        required: true,
        defaultValue: new Date(),
        componentProps: {
          format: 'YYYY-MM-DD',
          valueFormat: 'YYYY-MM-DD',
          placeholder: '请选择',
          style: { width: '100%' },
          disabledDate: (currentDate) => {
            return currentDate < dayjs().startOf('day');
          },
        },
      },
      {
        label: '整改责任部门',
        field: 'dutyDepartCode',
        component: 'ApiSelect',
        required: true,
        componentProps: ({ formModel }) => {
          return {
            api: selectDeptNew,
            placeholder: '请选择',
            params: { orgCode: JSON.parse(route.query.data).subsidiaryCode },
            numberToString: true,
            labelField: 'departName',
            valueField: 'orgCode',
            onChange: (value, exts) => {
              formModel.dutyPersonId = undefined;
              if (value && exts) {
                updateSchema({
                  field: 'dutyPersonId',
                  componentProps: {
                    api: getUser,
                    params: { departIds: exts.id },
                    disabled: false,
                  },
                });
              } else {
                updateSchema({
                  field: 'dutyPersonId',
                  componentProps: {
                    disabled: true,
                  },
                });
              }
            },
            getPopupContainer: () => document.body,
          };
        },
      },
      {
        label: '责任人',
        field: 'dutyPersonId',
        component: 'ApiSelect',
        required: true,
        componentProps: {
          placeholder: '请选择',
          disabled: true,
          numberToString: true,
          labelField: 'realname',
          valueField: 'id',
          resultField: 'records',
          showSearch: true,
          filterOption: (input, option) => option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0,
        },
      },
    ],
    showActionButtonGroup: false,
    labelCol: {
      xs: { span: 24 },
      sm: { span: 4 },
    },
    wrapperCol: {
      xs: { span: 24 },
      sm: { span: 20 },
    },
  });
  const dutyDepartCodeArr: any = ref([]);
  onMounted(async () => {
    const data = JSON.parse(route.query.data);
    setFieldsValue({
      rectResult: '0',
      id: data.id,
    });
    const obj = JSON.parse(JSON.stringify(data));
    Object.keys(obj).forEach((key) => {
      if (!obj[key]) {
        delete obj[key];
      }
    });
    await setFieldsValue({ ...obj });
    await updateSchema({
      field: 'reviseDate',
      componentProps: {
        disabled: obj.source === '1',
      },
    });
    if (data?.dutyDepartCode) {
      await selectDeptNew({ orgCode: data.subsidiaryCode }).then((res) => {
        dutyDepartCodeArr.value = res;
        updateSchema({
          field: 'dutyPersonId',
          componentProps: {
            api: getUser,
            params: { departIds: dutyDepartCodeArr.value.filter((item) => item.orgCode === data.dutyDepartCode)[0].id },
            disabled: false,
          },
        });
      });
    }
  });
  const handleSubmit = async () => {
    const values = await validate();
    loading.value = true;
    await confirm(values)
      .then((res) => {
        if (res) {
          handleClose();
        }
      })
      .finally(() => {
        loading.value = false;
      });
  };
  const handleClose = () => {
    router.push({
      path: '/app/examineQuestion/list',
    });
  };
  const getYear = (date) => {
    const y = date.getFullYear() + 30;
    const m = dayjs(date).format('MM');
    const d = dayjs(date).format('DD');
    return dayjs(y + '-' + m + '-' + d).format('YYYY-MM-DD');
  };
</script>
<style lang="less" scoped>
  .footer {
    margin: 10px 30px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .ant-card-bordered {
    border: none;
  }
</style>
