<template>
  <a-card>
    <BasicForm @register="registerForm" />
    <div class="footer">
      <a-button style="width: 120px" @click="handleClose">取消</a-button>
      <a-button type="primary" :loading="loading" style="width: 120px" @click="handleSubmit">提交</a-button>
    </div>
  </a-card>
</template>
<script lang="ts" name="app-examineQuestion-review" setup>
  import { useRoute, useRouter } from 'vue-router';
  import { review } from '../url/index';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import { ref, onMounted } from 'vue';
  const route: any = useRoute();
  const router = useRouter();
  const loading = ref(false);
  //表单配置
  const [registerForm, { setFieldsValue, validate }] = useForm({
    schemas: [
      {
        label: '',
        field: 'id',
        component: 'Input',
        show: false,
      },
      {
        label: '复查结果',
        field: 'reviewResult',
        component: 'RadioGroup',
        required: true,
        componentProps: () => {
          return {
            options: [
              { label: '通过', value: '0' },
              { label: '不通过', value: '1' },
            ],
            getPopupContainer: () => document.body,
          };
        },
      },
      {
        label: '复查说明',
        field: 'reviewDetail',
        required: true,
        component: 'InputTextArea',
        componentProps: {
          maxlength: 200,
          rows: 5,
        },
      },
      {
        label: '复查照片',
        field: 'reviewImage',
        component: 'JImageUpload',
        componentProps: {
          fileMax: 10,
          text: '',
          isWatermark: true,
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
  onMounted(() => {
    setFieldsValue({
      reviewResult: '0',
      id: JSON.parse(route.query.data).id,
    });
  });
  const handleSubmit = async () => {
    const values = await validate();
    loading.value = true;
    await review(values)
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
