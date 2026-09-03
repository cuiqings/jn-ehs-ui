<template>
  <div>
    <basic-modal v-bind="$attrs" @register="registerModal" :width="700" :bodyStyle="{ padding: '10px 20px 0 0' }" :title="title" destroyOnClose>
      <BasicForm @register="registerForm" />
      <template #footer>
        <div style="text-align: center">
          <a-button style="margin-right: 15px" @click="close">取消</a-button>
          <a-button type="primary" :loading="loading" v-if="showOkBtn" @click="confirmClose">提交</a-button>
        </div>
      </template>
    </basic-modal>
  </div>
</template>
<script lang="ts" name="evaluate-fun-modal" setup>
  import { ref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import { FormSchema } from '/@/components/Table';
  import { getDepart3ListWithSecurity } from '/@/api/common/api';
  import { message, Upload } from 'ant-design-vue';
  import { add, edit, queryById } from './api';
  const emit = defineEmits(['success']);
  const orgOptions: any = ref([]);
  const loading = ref(false);
  const title = ref('新增');
  const showOkBtn = ref(true);
  const formSchema: FormSchema[] = [
    {
      label: 'id',
      field: 'id',
      component: 'Input',
      ifShow: false,
    },
    {
      label: '自评/评审单位',
      field: 'orgCode',
      component: 'Select',
      required: true,
      componentProps: () => {
        return {
          options: [],
          showSearch: true,
          filterOption: (input: string, option: any) => {
            return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
          },
          getPopupContainer: () => document.body,
        };
      },
    },
    {
      label: '评审时间',
      field: 'evaluateTime',
      component: 'DatePicker',
      required: true,
      componentProps: {
        valueFormat: 'YYYY-MM-DD',
        style: {
          width: '100%',
        },
        getPopupContainer: () => document.body,
      },
    },
    {
      label: '评审报告',
      field: 'evaluateFile',
      component: 'JUpload',
      required: true,
      componentProps: {
        maxCount: 1,
        text: '添加附件',
        bizPath: 'safetyStandardization',
        beforeUpload: (file: File) => {
          const isLt300M = file.size / 1024 / 1024 < 300;
          const isPdf = file.type === 'application/pdf';
          const isDoc = file.type === 'application/msword';
          const isDocx = file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
          if (!isLt300M) {
            message.error('文件过大，请不要超过300M！');
            return false || Upload.LIST_IGNORE;
          } else if (!isPdf && !isDoc && !isDocx) {
            message.error(`文件格式错误，仅支持doc、docx、pdf格式!推荐pdf格式上传！`);
            return false || Upload.LIST_IGNORE;
          }
          return true;
        },
      },
    },
  ];
  //表单配置
  const [registerForm, { resetFields, setFieldsValue, updateSchema, validate, setProps }] = useForm({
    schemas: formSchema,
    showActionButtonGroup: false,
    labelCol: {
      xs: { span: 24 },
      sm: { span: 5 },
    },
    wrapperCol: {
      xs: { span: 24 },
      sm: { span: 19 },
    },
  });
  const initOrg = () => {
    getDepart3ListWithSecurity().then((res) => {
      orgOptions.value = res.map((item) => {
        return {
          label: item.departName,
          value: item.orgCode,
        };
      });
      updateSchema({
        field: 'orgCode',
        componentProps: () => {
          return {
            options: orgOptions.value,
            showSearch: true,
            filterOption: (input: string, option: any) => {
              return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
            },
            getPopupContainer: () => document.body,
          };
        },
      });
      if (orgOptions.value.length === 1) {
        setFieldsValue({
          orgCode: orgOptions.value[0]?.value,
        });
      }
    });
  };
  const [registerModal, { closeModal }] = useModalInner(async (data) => {
    title.value = data.title;
    showOkBtn.value = data.showOkBtn;
    await resetFields();
    initOrg();
    if (title.value !== '新增') {
      queryById({ id: data.data.id }).then((res) => {
        setFieldsValue(res);
      });
    }
    if (!data.showOkBtn) setProps({ disabled: true });
  });
  const close = () => {
    closeModal();
  };
  const confirmClose = async () => {
    const values = await validate();
    loading.value = true;
    if (title.value === '新增') {
      add({ ...values })
        .then((res) => {
          if (res) {
            //关闭弹窗
            closeModal();
            //刷新列表
            emit('success');
          }
        })
        .finally(() => {
          loading.value = false;
        });
    } else {
      edit({ ...values })
        .then((res) => {
          if (res) {
            //关闭弹窗
            closeModal();
            //刷新列表
            emit('success');
          }
        })
        .finally(() => {
          loading.value = false;
        });
    }
  };
</script>
<style lang="less" scoped></style>
