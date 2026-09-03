<template>
  <BasicDrawer v-bind="$attrs" @register="registerDrawer" :title="title" :showFooter="showFooter" @ok="handleSubmit" width="1000px" destroyOnClose>
    <BasicForm @register="registerForm">
      <template #trainUserUrl>
        <j-upload-button v-if="showFooter" type="default" @click="onImportXls"> <UploadOutlined />上传</j-upload-button>
        <a-button v-if="showFooter" type="primary" @click="downloadTemplate" style="margin-left: 8px"> <DownloadOutlined />下载模版</a-button>
        <div v-if="trainUserUrl" style="margin-top: 3px; color: #1890ff; cursor: pointer" @click="previewFileExcel(trainUserUrl)">{{
          trainUserUrl.split('/')[trainUserUrl.split('/').length - 1]
        }}</div>
      </template>
    </BasicForm>
  </BasicDrawer>
</template>
<script lang="ts" setup>
  import { ref, computed, unref } from 'vue';
  import { BasicDrawer, useDrawerInner } from '/@/components/Drawer';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import { addRecord, getUserList, getDetailById, getProjectList } from './record.api';
  import { useUserStore } from '/@/store/modules/user';
  import { defHttp } from '/@/utils/http/axios';
  import { UploadOutlined, DownloadOutlined } from '@ant-design/icons-vue';
  import { message, Upload } from 'ant-design-vue';
  import { useMethods } from '/@/hooks/system/useMethods';
  const { handleImportXls, handleExportXls } = useMethods();
  import dayjs from 'dayjs';
  import { previewFile } from '/@/api/common/api';
  // 声明Emits
  const emit = defineEmits(['register', 'success']);
  const showFooter = ref(true);
  const personOptions = ref([]);
  const userStore = useUserStore();
  const trainNum = ref(0);
  const trainUserUrl = ref('');
  const userinfo = computed(() => userStore.getUserInfo);
  const projectOptions: any = ref([]);
  const trainProjectCode = ref('');
  const trainPlanOptions: any = ref([]);
  const importConfig = {
    url: '/edu/trainRecord/import',
    data: () => {},
    success: handleSuccess,
  };
  // 导入成功
  function handleSuccess(fileInfo) {
    console.log('handleSuccess', fileInfo);
    let result = fileInfo.result;
    trainNum.value = result.trainNum;
    trainUserUrl.value = result.trainUserUrl;
    setFieldsValue({
      trainUserUrl: result.trainUserUrl,
    });
  }
  function onImportXls(file) {
    const { url, success, data } = importConfig;
    const realUrl = url;
    if (realUrl) {
      const dataBody = typeof data === 'function' ? data() : data;
      handleImportXls(file, realUrl, success, dataBody);
    } else {
      message.warn('没有传递 importConfig.url 参数');
      return Promise.reject();
    }
  }
  function previewFileExcel(filePath) {
    previewFile(filePath).then((res) => {
      window.open(res, '_blank');
    });
  }
  //获取人员列表
  getPersonList(userinfo.value.orgCode);
  const handleTrainPlanList = async () => {
    await defHttp.get({ url: '/edu/trainPlan/getPlanList' }).then((res) => {
      if (res) {
        trainPlanOptions.value = res.map((item) => {
          return {
            label: item.value,
            value: item.key,
          };
        });
        updateSchema({
          field: 'trainPlanId',
          componentProps: {
            options: trainPlanOptions.value,
            placeholder: '请选择',
            onChange: (value: any) => {
              if (showFooter.value) {
                trainProjectCode.value = '';
                setFieldsValue({
                  replant: '0',
                });
                setFieldsValue({
                  trainProjectId: undefined,
                });
                clearValidate('trainProjectId');
              }
              if (value) handleProjectList(value);
            },
          },
        });
      }
    });
  };
  // 获取项目列表
  async function handleProjectList(val, trainProjectId?) {
    const params = {
      planId: val,
      pageSize: 9999,
      pageNo: 1,
    };
    await getProjectList(params).then((res) => {
      if (res) {
        projectOptions.value = res.map((item: any) => {
          return {
            label: item.value,
            value: item.key,
            code: item.code,
          };
        });
        if (trainProjectId) {
          trainProjectCode.value = projectOptions.value.filter((ite) => ite.value === trainProjectId)[0]?.code;
        }
        // 更新培训项目下拉
        updateSchema({
          field: 'trainProjectId',
          componentProps: {
            options: projectOptions.value,
          },
        });
      } else {
        projectOptions.value = [];
      }
    });
  }
  const schemas: any = [
    {
      label: '',
      field: 'id',
      component: 'Input',
      show: false,
    },
    {
      label: '当前状态',
      field: 'status',
      component: 'Input',
      ifShow: () => {
        return !showFooter.value;
      },
      colProps: {
        span: 12,
      },
    },
    {
      label: '实施方式',
      field: 'type',
      component: 'Input',
      ifShow: () => {
        return !showFooter.value;
      },
      colProps: {
        span: 12,
      },
    },
    {
      label: '培训计划',
      field: 'trainPlanId',
      component: 'Select',
      required: true,
      componentProps: {
        options: [],
      },
      colProps: {
        span: 12,
      },
    },
    {
      label: '培训项目',
      field: 'trainProjectId',
      component: 'Select',
      required: true,
      componentProps: {
        options: projectOptions.value,
        placeholder: '请选择',
        onChange: (value, ext) => {
          trainProjectCode.value = '';
          setFieldsValue({
            replant: '0',
          });
          if (value) {
            trainProjectCode.value = ext.code;
          }
        },
      },
      colProps: {
        span: 12,
      },
    },
    {
      label: '培训内容',
      field: 'trainContent',
      component: 'InputTextArea',
      required: true,
      componentProps: {
        autoSize: true,
        maxlength: 300,
      },
      colProps: {
        span: 24,
      },
    },
    {
      field: 'duration',
      label: '培训学时',
      component: 'InputNumber',
      required: true,
      componentProps: {
        style: {
          width: '100%',
        },
        min: 0,
        max: 99,
        precision: 0,
      },
      colProps: {
        span: 12,
      },
    },
    {
      label: '是否是外部单位',
      field: 'enforceOrgType',
      component: 'RadioGroup',
      defaultValue: '1',
      componentProps: ({ formModel }) => {
        return {
          options: [
            { label: '否', value: '1' },
            { label: '是', value: '2' },
          ],
          placeholder: '请选择',
          onChange: () => {
            formModel.enforceOrg = '';
          },
        };
      },
      colProps: { span: 12 },
    },
    {
      label: '实施单位',
      field: 'enforceOrg',
      required: true,
      component: 'JTreeSelect1',
      ifShow: ({ values }) => {
        return values.enforceOrgType !== '2';
      },
      componentProps: ({ formModel }) => {
        console.log(' formModel', formModel);
        return {
          url: '/jn/common/getDepartTreeFor23',
          fieldNames: {
            label: 'departName',
            value: 'orgCode',
            options: 'children',
          },
          isLeaf: false,
          load: false,
          treeNodeFilterProp: 'departName',
        };
      },
      colProps: { span: 12 },
    },
    {
      label: '外部实施单位',
      field: 'enforceOuter',
      component: 'Input',
      ifShow: ({ values }) => {
        return values.enforceOrgType === '2';
      },
      rules: [
        { required: true, message: '请输入外部实施单位！' },
        { min: 0, max: 50, message: '长度不能超过 50 个字符', trigger: 'blur' },
      ],
      colProps: { span: 12 },
    },
    {
      label: '是否补培',
      field: 'replant',
      component: 'Select',
      required: true,
      defaultValue: '0',
      ifShow: () => {
        return trainProjectCode.value === '1';
      },
      componentProps: {
        options: [
          {
            label: '是',
            value: '1',
          },
          {
            label: '否',
            value: '0',
          },
        ],
        placeholder: '请选择',
      },
      colProps: {
        span: 12,
      },
    },
    {
      label: '培训时间',
      field: 'taskDate',
      required: true,
      component: 'RangePicker',
      componentProps: {
        showTime: true,
        valueFormat: 'YYYY-MM-DD HH:mm:ss',
        // disabledDate: (current) => {
        //   return current && current < dayjs().startOf('day');
        // },
        // 今天当前时间之后的HH:mm
        // disabledTime: (current) => {
        //   return {
        //     disabledHours: () => {
        //       return Array.from({ length: dayjs().hour() }, (v, k) => k);
        //     },
        //     disabledMinutes: () => {
        //       return Array.from({ length: dayjs().minute() }, (v, k) => k);
        //     },
        //   };
        // },
        onChange: (dates) => {
          if (dates && dates.length === 2) {
            const [startDate, endDate] = dates;
            const startMonth = dayjs(startDate).month();
            const startYear = dayjs(startDate).year();
            const endMonth = dayjs(endDate).month();
            const endYear = dayjs(endDate).year();
            // 如果结束时间与开始时间不在同一个月，则重置结束时间为开始时间的同月最后一天
            if (endYear !== startYear || endMonth !== startMonth) {
              const lastDayOfMonth = dayjs(startDate).endOf('month');
              setFieldsValue({
                taskDate: [startDate, lastDayOfMonth.format('YYYY-MM-DD HH:mm:ss')],
              });
              return message.info('任务时间只能在同一个月内，已把结束时间重置到月末！');
            }
          }
        },
      },
      colProps: { span: 12 },
    },
    {
      label: '授课老师',
      field: 'trainPerson',
      component: 'Input',
      rules: [
        { required: true, message: '请输入授课老师！' },
        { min: 0, max: 10, message: '长度不能超过 10 个字符', trigger: 'blur' },
      ],
      colProps: {
        span: 12,
      },
    },
    {
      field: 'trainUserUrl',
      label: '参加人员',
      component: 'Input',
      helpMessage: 'Excel模版内容：标题列【姓名、工号、成绩】',
      slot: 'trainUserUrl',
      rules: [{ required: true, message: '请上传参加人员！' }],
      colProps: { span: 24 },
    },
    {
      field: 'trainSign',
      label: '培训签到表',
      component: 'JUpload',
      required: () => getFieldsValue().enforceOrgType === '1',
      componentProps: {
        maxCount: 5,
        // accept: '.pdf,.doc,.docx',
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

    {
      label: '培训照片',
      field: 'trainImg',
      component: 'JImageUpload',
      required: true,
      componentProps: {
        fileMax: 5,
        text: '',
        isWatermark: false,
        beforeUpload: (file: File) => {
          const isLt50M = file.size / 1024 / 1024 < 300;
          if (!isLt50M) {
            message.error('图片过大，请不要超过300M！');
            return false || Upload.LIST_IGNORE;
          }
          return true;
        },
      },
      ifShow: ({ values }) => {
        return values.enforceOrgType === '1';
      },
    },
  ];
  //表单配置
  const [registerForm, { setProps, resetFields, setFieldsValue, getFieldsValue, validate, updateSchema, clearValidate }] = useForm({
    schemas: schemas,
    showActionButtonGroup: false,
    labelWidth: 120,
  });
  //表单赋值
  const [registerDrawer, { setDrawerProps, closeDrawer }] = useDrawerInner(async (data) => {
    trainUserUrl.value = '';
    trainProjectCode.value = '';
    showFooter.value = data.showFooter;
    setDrawerProps({ confirmLoading: false, showFooter: showFooter.value });
    //重置表单
    await resetFields();
    projectOptions.value = [];
    updateSchema({
      field: 'trainProjectId',
      componentProps: {
        options: [],
      },
    });
    await handleTrainPlanList();
    if (!unref(showFooter)) {
      // 获取详情
      const res = await getDetailById({ id: data.record.id });
      await handleProjectList(res.trainPlanId, res.trainProjectId);
      res.taskDate = [dayjs(res.taskDate.split(',')[0]), dayjs(res.taskDate.split(',')[1])];
      //表单赋值
      await setFieldsValue({
        ...res,
      });
      trainUserUrl.value = res.trainUserUrl;
      // 禁用表单
      setProps({ disabled: !showFooter.value });
    }
  });
  //设置标题
  const title = computed(() => (unref(showFooter) ? '上传线下记录' : '查看'));
  //表单提交事件
  async function handleSubmit() {
    try {
      let values = await validate();
      const obj = JSON.parse(JSON.stringify(values));
      if (!trainUserUrl.value) {
        message.error('请上传参加人员名单！');
        return;
      }
      obj.taskStrTime = obj.taskDate.split(',')[0];
      obj.taskEndTime = obj.taskDate.split(',')[1];
      delete obj.taskDate;
      delete obj.id;
      obj.trainUserUrl = trainUserUrl.value;
      obj.trainNum = trainNum.value;
      if (trainProjectCode.value !== '1') {
        delete obj.replant;
      }
      setDrawerProps({ confirmLoading: true });
      //提交表单
      await addRecord(obj);
      //关闭弹窗
      closeDrawer();
      //刷新列表
      emit('success');
    } finally {
      setDrawerProps({ confirmLoading: false });
    }
  }

  // 获取人员列表
  async function getPersonList(val?: string) {
    const params = {
      orgCode: val,
      pageSize: 9999,
      pageNo: 1,
    };
    await getUserList(params).then((res) => {
      if (res) {
        personOptions.value = res.map((item: any) => {
          return {
            label: item.realname,
            value: item.id,
          };
        });
      }
    });
  }

  // 下载模版
  function downloadTemplate() {
    let params = {};
    handleExportXls('培训记录模板下载', '/edu/trainRecord/downloadTemplate', params);
  }
</script>
<style lang="less" scoped>
  .red-require {
    display: inline-block;
    margin-right: 4px;
    color: #ff4d4f;
    font-size: 14px;
    font-family: SimSun, sans-serif;
    line-height: 1;
  }
  :deep(.ant-col-sm-18) {
    max-width: 100% !important;
  }
</style>
