<template>
  <BasicModal v-bind="$attrs" @register="registerModal" title="人员信息" @ok="handleSubmit" width="900px" destroyOnClose>
    <BasicForm class="personForm" @register="registerForm">
      <template #duration="{ model, field }">
        <a-input-number
          placeholder="请输入"
          v-model:value="model[field]"
          style="width: 80px; margin-right: 5px"
          :min="min"
          :max="100"
          :precision="0"
        />
      </template>
    </BasicForm>
  </BasicModal>
</template>
<script lang="ts" setup>
  import { ref, onMounted, unref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import dayjs from 'dayjs';
  import { getOrganizationNew, getDeptNew, saveTrainArchival } from './archive.api';
  import { Label } from 'konva/lib/shapes/Label';
  // 声明Emits
  const emit = defineEmits(['register', 'success']);
  const isUpdate = ref(true);
  const orgOptions = ref([]);
  const departOptions = ref([]);
  const min = ref(8);
  // onMounted(() => {
  //   getOrganizationNew().then((res) => {
  //     orgOptions.value = res.map((item) => {
  //       return {
  //         label: item.departName,
  //         value: item.orgCode,
  //         id: item.id,
  //       };
  //     });
  //   });
  // });
  const personFormSchema: any = [
    {
      field: 'divider-basic',
      component: 'Divider',
      label: '基本信息',
      colProps: { span: 24 },
    },
    {
      field: 'id',
      label: '',
      component: 'Input',
      show: false,
    },
    {
      field: 'realName',
      label: '姓名',
      required: true,
      dynamicDisabled: true,
      component: 'Input',
    },
    // {
    //   label: '所属单位',
    //   field: 'orgCode',
    //   component: 'Select',
    //   required: true,
    //   dynamicDisabled: true,
    //   componentProps: () => {
    //     return {
    //       options: [],
    //     };
    //   },
    // },
    // {
    //   label: '车间/科室',
    //   field: 'departCode',
    //   component: 'Select',
    //   dynamicDisabled: true,
    //   componentProps: () => {
    //     return {
    //       options: [],
    //     };
    //   },
    // },
    {
      field: 'orgCodeName',
      label: '所属单位',
      required: true,
      dynamicDisabled: true,
      component: 'Input',
    },
    {
      field: 'departCodeName',
      label: '车间/科室',
      dynamicDisabled: true,
      component: 'Input',
    },
    {
      field: 'sex',
      label: '性别',
      component: 'Select',
      required: true,
      componentProps: {
        options: [
          {
            label: '男',
            value: '1',
          },
          {
            label: '女',
            value: '2',
          },
        ],
      },
    },
    {
      field: 'idCard',
      label: '身份证号',
      component: 'Input',
      required: true,
    },
    // 民族 ethnic
    {
      field: 'ethnic',
      label: '民族',
      component: 'Input',
      required: true,
    },
    // 文化程度 education 使用字典pq_education 根据框架的书写方式写
    {
      label: '文化程度',
      field: 'education',
      component: 'JDictSelectTag',
      required: true,
      componentProps: {
        dictCode: 'pq_education',
        placeholder: '请选择',
        stringToNumber: false,
        showChooseOption: false,
      },
    },
    // 政治面貌 politicalOutlook 党员、群众
    {
      field: 'politicalOutlook',
      label: '政治面貌',
      component: 'Select',
      required: true,
      componentProps: {
        options: [
          { label: '党员', value: '党员' },
          { label: '群众', value: '群众' },
        ],
      },
    },
    // 出生年月
    {
      field: 'birthday',
      label: '出生年月',
      component: 'DatePicker',
      required: true,
      componentProps: {
        valueFormat: 'YYYY-MM-DD',
        style: { width: '100%' },
      },
    },
    // 户籍所在地 domicile
    {
      field: 'domicile',
      label: '户籍所在地',
      component: 'Input',
      required: true,
    },
    {
      field: 'arrivalTime',
      label: '参加工作时间',
      component: 'DatePicker',
      required: true,
      componentProps: {
        valueFormat: 'YYYY-MM-DD',
        style: { width: '100%' },
      },
    },
    // 进入单位时间 orgTime
    {
      field: 'orgTime',
      label: '进入本单位时间',
      component: 'DatePicker',
      required: true,
      componentProps: {
        valueFormat: 'YYYY-MM-DD',
        style: { width: '100%' },
      },
    },
    // 人员类型 personType
    {
      field: 'personType',
      label: '人员类型',
      component: 'JDictSelectTag',
      componentProps: {
        dictCode: 'edu_person_type',
        placeholder: '请选择',
        stringToNumber: false,
        showChooseOption: false,
      },
    },
    // 职务 post
    {
      field: 'post',
      label: '职务/职称',
      component: 'Input',
      required: true,
    },
    {
      field: 'workType',
      label: '工种',
      component: 'Input',
      required: true,
    },
    {
      field: 'graduateSchool',
      label: '毕业院校',
      component: 'Input',
      required: true,
    },
    {
      field: 'specialty',
      label: '所学专业',
      component: 'Input',
      required: true,
    },
    {
      field: 'phone',
      label: '联系电话',
      required: true,
      component: 'Input',
    },
    {
      field: 'healthStatus',
      label: '健康状况',
      component: 'Input',
    },
    {
      field: 'jobs',
      label: '岗位名称',
      component: 'Input',
    },
    {
      field: 'oldJobsTime',
      label: '之前从事本岗位时间',
      component: 'DatePicker',
      componentProps: {
        valueFormat: 'YYYY-MM-DD',
        style: { width: '100%' },
        // 可以选择今天之前的日期
        disabledDate: (current) => {
          return current > dayjs().endOf('day');
        },
      },
    },
    // 主要工作经历 majorWorkExperience
    {
      field: 'majorWorkExperience',
      label: '主要工作经历',
      component: 'InputTextArea',
      colProps: { span: 24 },
      labelCol: {
        xs: { span: 24 },
        sm: { span: 24 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 24 },
      },
      componentProps: {
        autoSize: true,
      },
    },
    // 入职前培训内容 trainContent
    {
      field: 'trainContent',
      label: '入职前接受安全培训和考核以及取得安全培训有关的岗位证书等情况',
      component: 'InputTextArea',
      colProps: { span: 24 },
      labelCol: {
        xs: { span: 24 },
        sm: { span: 24 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 24 },
      },
      componentProps: {
        autoSize: true,
      },
    },
    // 惩罚内容 punishmentContent
    {
      field: 'punishmentContent',
      label: '如之前受过何种有关安全生产的处罚以及是否受到刑事处罚',
      component: 'InputTextArea',
      colProps: { span: 24 },
      labelCol: {
        xs: { span: 24 },
        sm: { span: 24 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 24 },
      },
      componentProps: {
        autoSize: true,
      },
    },
    {
      field: 'divider-basic1',
      component: 'Divider',
      label: '档案信息',
      colProps: { span: 24 },
    },
    {
      field: 'duration',
      label: '年度培训课时要求',
      required: true,
      component: 'InputNumber',
      slot: 'duration',
      componentProps: {
        labelCol: {
          xs: { span: 24 },
          sm: { span: 8 },
        },
        wrapperCol: {
          xs: { span: 24 },
          sm: { span: 14 },
        },
      },
    },
    {
      label: '一寸照片',
      field: 'picture',
      component: 'JImageUpload',
      componentProps: {
        fileMax: 1,
        text: '',
        isWatermark: false,
        labelCol: {
          xs: { span: 24 },
          sm: { span: 4 },
        },
        wrapperCol: {
          xs: { span: 24 },
          sm: { span: 18 },
        },
      },
    },
  ];
  //表单配置
  const [registerForm, { resetFields, setFieldsValue, validate, updateSchema, clearValidate }] = useForm({
    schemas: personFormSchema,
    baseColProps: { span: 12 },
    showActionButtonGroup: false,
    labelCol: {
      xs: { span: 24 },
      sm: { span: 8 },
    },
    wrapperCol: {
      xs: { span: 24 },
      sm: { span: 16 },
    },
  });

  //表单赋值
  const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
    console.log('data', data);
    // 深拷贝
    let recordDeep = JSON.parse(JSON.stringify(data.record));
    //重置表单
    await resetFields();

    // if (data.record.orgCode) {
    //   getDepartList(data.record.orgCode);
    // }
    // updateSchema({
    //   field: 'orgCode',
    //   componentProps: {
    //     options: orgOptions.value,
    //     showSearch: true,
    //     filterOption: (input: string, option: any) => {
    //       return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
    //     },
    //     onChange: (value) => {
    //       if (value) {
    //         getDepartList(value);
    //       } else {
    //         departOptions.value = [];
    //         updateSchema({
    //           field: 'departCode',
    //           componentProps: () => {
    //             return {
    //               options: [],
    //               showSearch: true,
    //               filterOption: (input: string, option: any) => {
    //                 return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
    //               },
    //             };
    //           },
    //         });
    //       }
    //     },
    //   },
    // });
    setModalProps({ confirmLoading: false });
    isUpdate.value = !!data?.isUpdate;

    // 先设置其他字段
    const formData = { ...data.record };
    formData.realName = formData.workNo ? formData.realName + '（' + formData.workNo + '）' : formData.realName;
    await setFieldsValue(formData);
  });
  // 车间
  const getDepartList = (orgCode) => {
    getDeptNew({ orgCode }).then(async (res) => {
      departOptions.value = res.map((item: any) => {
        return {
          label: item.departName,
          value: item.orgCode,
        };
      });
      updateSchema({
        field: 'departCode',
        componentProps: () => {
          return {
            options: departOptions.value,
            showSearch: true,
            filterOption: (input: string, option: any) => {
              return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
            },
          };
        },
      });
    });
  };
  //表单提交事件
  async function handleSubmit(v) {
    try {
      let values = await validate();
      console.log('values', values);

      setModalProps({ confirmLoading: true });
      //提交表单
      await saveTrainArchival(values);
      //关闭弹窗
      closeModal();
      //刷新列表
      emit('success');
    } finally {
      setModalProps({ confirmLoading: false });
    }
  }
</script>
<style lang="less">
  .personForm {
    .ant-col-24 {
      .ant-col-sm-8 {
        flex: 0 0 100%;
        max-width: 100%;
        text-align: left;
      }
      .ant-col-sm-16 {
        flex: 0 0 100%;
        max-width: 100%;
      }
    }
  }
</style>
