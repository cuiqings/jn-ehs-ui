<template>
  <div>
    <BasicDrawer
      @register="registerDrawer"
      :title="getTitle"
      :show-footer="showFooter"
      width="900px"
      destroyOnClose
      :zIndex="zIndex"
    >
      <template #footer>
        <div style="text-align: right">
          <a-button style="margin-right: 8px" @click="closeDrawer">取消</a-button>
          <a-button v-if="showOkBtn" type="primary" @click="onSubmit">提交</a-button>
        </div>
      </template>
      <BasicForm @register="registerForm" />
      <div v-if="getTitle === '查看'">
        <div class="reviewRecord" v-for="item in reviewList" :key="item.id">
          <div style="display: flex; justify-content: space-between">
            <div class="reviewRecord-text"
              >操作人：<span>{{ item.operator }}</span></div
            >
            <div class="reviewRecord-text"
              ><span>{{ item.createTime }}</span></div
            >
          </div>
          <div class="reviewRecord-text"
            >下次复审/换证日期：<span>{{ dayjs(item.reviewTime).format('YYYY年M月D日') }}</span></div
          >
          <div class="reviewRecord-text"
            >备注：<span>{{ item.remark ? item.remark : '无' }}</span></div
          >
          <div> <customize-upload lable="文件上传" :value="item.filePath ? item.filePath : ''" type="view" :max-count="1" /></div>
        </div>
        <div v-if="info.checkSignImg && !isBz">
          <a-divider orientation="left" style="color: #1890ff; font-size: 14px; font-weight: normal">检查签字记录</a-divider>
          <div class="info-row">
            <span>{{ info.checkSignByName }}</span>
            <span>{{ info.checkSignTime }}</span>
            <img v-if="info.checkSignImg" :src="getFileAccessHttpUrl(info.checkSignImg)" style="width: 90px; height: 55px" />
          </div>
        </div>
        <div v-if="info.confirmSignImg && !isBz">
          <a-divider orientation="left" style="color: #1890ff; font-size: 14px; font-weight: normal">确认签字记录</a-divider>
          <div class="info-row">
            <span>{{ info.confirmSignByName }}</span>
            <span>{{ info.confirmSignTime }}</span>
            <img v-if="info.confirmSignImg" :src="getFileAccessHttpUrl(info.confirmSignImg)" style="width: 90px; height: 55px" />
          </div>
        </div>
      </div>
    </BasicDrawer>
  </div>
</template>

<script lang="ts" setup>
  import { ref, onMounted, nextTick } from 'vue';
  import { BasicDrawer, useDrawerInner } from '/@/components/Drawer';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import { saveOrUpdate, getDepart3ListWithSecurity, getDeptNew, selectUserName } from './certificate.api';
  import CustomizeUpload from '../../incidentManage/incidentExpress/component/CustomizeUpload.vue';
  import dayjs from 'dayjs';
  import { getFileAccessHttpUrl } from '/@/utils/common/compUtils';
  import { message, Upload } from 'ant-design-vue';
  const emit = defineEmits(['success', 'register']);
  const getTitle = ref('查看');
  const orgOptions: any = ref([]);
  const showFooter = ref(true);
  const showOkBtn = ref(false);
  const reviewList: any = ref([]);
  const info: any = ref({});
  const isBz = ref(false);
  const zIndex = ref(1000);
  const schemas: any = [
    {
      label: '',
      field: 'id',
      component: 'Input',
      show: false,
    },
    {
      field: 'divider-basicf',
      component: 'Divider',
      label: '人员信息',
      componentProps: {
        style: {
          color: '#1890ff',
        },
      },
      ifShow: () => !isBz.value,
    },
    {
      label: '所属单位',
      field: 'organizationCode',
      required: true,
      component: 'Select',
      componentProps: () => {
        return {
          options: [],
          showSearch: true,
          filterOption: (input: string, option: any) => {
            return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
          },
        };
      },
      ifShow: () => !isBz.value,
    },
    {
      label: '',
      field: 'organizationName',
      component: 'Input',
      show: false,
    },
    {
      label: '车间',
      field: 'departCode',
      component: 'Select',
      componentProps: () => {
        return {
          options: [],
          showSearch: true,
          filterOption: (input: string, option: any) => {
            return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
          },
        };
      },
      ifShow: () => !isBz.value,
    },
    {
      label: '',
      field: 'departName',
      component: 'Input',
      show: false,
    },
    {
      label: '工作证号',
      field: 'jobNum',
      component: 'Input',
      required: true,
      componentProps: ({ formModel }) => {
        return {
          onBlur: (e) => {
            if (e.target.value !== '') {
              selectUserName(e.target.value).then((res) => {
                if (res) {
                  formModel.userRealname = res.realname;
                  formModel.userSex = String(res.sex);
                  formModel.userPhone = res.phone;
                } else {
                  formModel.userRealname = '';
                  formModel.userSex = '';
                  formModel.userPhone = '';
                }
              });
            } else {
              formModel.userRealname = '';
              formModel.userSex = '';
              formModel.userPhone = '';
            }
          },
        };
      },
      ifShow: () => !isBz.value,
    },
    {
      label: '人员姓名',
      field: 'userRealname',
      required: true,
      component: 'Input',
      componentProps: {
        maxLength: 10,
      },
      ifShow: () => !isBz.value,
    },
    {
      label: '性别',
      field: 'userSex',
      component: 'RadioGroup',
      componentProps: {
        options: [
          { label: '男', value: '1' },
          { label: '女', value: '2' },
        ],
      },
      required: true,
      ifShow: () => !isBz.value,
    },
    {
      label: '手机号码',
      field: 'userPhone',
      rules: [{ required: true, message: '请输入正确的手机号', pattern: /^1[3456789]\d{9}$/ }],
      component: 'Input',
      componentProps: {
        maxLength: 11,
      },
      ifShow: () => !isBz.value,
    },
    {
      label: '学历',
      field: 'degree',
      component: 'JDictSelectTag',
      componentProps: {
        dictCode: 'pq_education',
        stringToNumber: false,
        showChooseOption: false,
      },
      ifShow: () => !isBz.value,
    },
    {
      field: 'divider-basicf1',
      component: 'Divider',
      label: '证书信息',
      componentProps: {
        style: {
          color: '#1890ff',
        },
      },
      ifShow: () => !isBz.value,
    },
    {
      label: '证书类型',
      field: 'certificationsType',
      required: true,
      component: 'JDictSelectTag',
      componentProps: ({ formModel }) => {
        return {
          dictCode: 'pq_certificate_type',
          stringToNumber: false,
          showChooseOption: false,
          onChange: (value) => {
            formModel.workType = undefined;
            formModel.actionItems = undefined;
            if (value === '1' || value === '2') {
              clearValidate(['certificationsName']);
            }
          },
        };
      },
    },
    {
      label: '作业类别',
      field: 'workType',
      dynamicRules: () => {
        return [{ required: true }, { trigger: 'change' }];
      },
      ifShow: ({ values }) => {
        return values.certificationsType === '1' || values.certificationsType === '2';
      },
      component: 'JDictSelectTag',
      componentProps: ({ formModel }) => {
        return {
          dictCode: formModel.certificationsType === '1' ? 'special_work_operate_type' : 'equipment_list_work_type',
          stringToNumber: false,
          showChooseOption: false,
          onChange: () => {
            formModel.actionItems = undefined;
          },
        };
      },
    },
    {
      label: '操作项目',
      field: 'actionItems',
      dynamicRules: () => {
        return [{ required: true }, { trigger: 'change' }];
      },
      ifShow: ({ values }) => {
        return values.certificationsType === '1' || values.certificationsType === '2';
      },
      component: 'JDictSelectTag',
      componentProps: ({ formModel }) => {
        return {
          dictCode: formModel.workType,
          stringToNumber: false,
          showChooseOption: false,
        };
      },
    },
    {
      label: '证书名称',
      field: 'certificationsName',
      component: 'Input',
      dynamicRules: ({ model }) => {
        return [
          { required: model.certificationsType !== '1' && model.certificationsType !== '2' && model.certificationsType },
          { trigger: 'change' },
        ];
      },
      componentProps: {
        maxLength: 30,
      },
    },
    {
      label: '发证机关',
      field: 'issuingAuthority',
      component: 'Input',
      componentProps: {
        maxLength: 50,
      },
    },
    {
      label: '培训机构',
      field: 'trainOrg',
      component: 'Input',
      componentProps: {
        maxLength: 50,
      },
    },
    {
      label: '培训时间',
      field: 'trainTime',
      component: 'RangeDate',
      componentProps: {
        placeholder: '请选择',
        style: { width: '100%' },
        valueFormat: 'YYYY-MM-DD',
      },
      ifShow: ({ values }) => {
        return values.certificationsType === '1';
      },
    },
    {
      label: '培训地点',
      field: 'trainAddress',
      component: 'Input',
      componentProps: {
        maxLength: 50,
      },
      ifShow: ({ values }) => {
        return values.certificationsType === '1';
      },
    },
    {
      label: '培训机构电话',
      field: 'trainOrgPhone',
      component: 'Input',
      // dynamicRules: () => {
      //   return [{ pattern: /^1[3456789]\d{9}$/, message: '培训机构电话格式有误' }];
      // },
      ifShow: ({ values }) => {
        return values.certificationsType === '1';
      },
    },
    {
      label: '证书编号',
      field: 'certificationsCode',
      component: 'Input',
      required: true,
      componentProps: {
        maxLength: 50,
      },
    },
    {
      label: '取证日期',
      field: 'issueDate',
      required: true,
      component: 'DatePicker',
      componentProps: ({ formActionType, formModel }) => {
        return {
          valueFormat: 'YYYY-MM-DD',
          style: {
            width: '100%',
          },
          disabledDate: (current) => {
            const today = new Date();
            // 将当前日期转换为时间戳
            const todayTimestamp = today.getTime();
            // 将当前日期之前的日期转换为时间戳
            const currentTimestamp = current.valueOf();
            // 判断当前日期是否在当前日期之前
            return currentTimestamp > todayTimestamp;
          },
          onChange: () => {
            formModel.expireDate = undefined;
            formModel.reviewTime = undefined;
            const { updateSchema } = formActionType;
            updateSchema([
              {
                field: 'expireDate',
                componentProps: {
                  disabledDate: (current) => {
                    return current && dayjs(current).isBefore(dayjs(formModel.issueDate).endOf('day'));
                  },
                },
              },
              {
                field: 'reviewTime',
                componentProps: {
                  disabledDate: (current) => {
                    return current && dayjs(current).isBefore(dayjs(formModel.issueDate).endOf('day'));
                  },
                },
              },
            ]);
          },
        };
      },
    },
    {
      label: '有效期至',
      field: 'expireDate',
      required: true,
      ifShow: ({ values }) => {
        return values.isLongTerm === '0';
      },
      component: 'DatePicker',
      componentProps: {
        valueFormat: 'YYYY-MM-DD',
        disabled: false,
        style: {
          width: '100%',
        },
      },
    },
    {
      label: '有效期至',
      field: 'expireDate1',
      component: 'DatePicker',
      ifShow: ({ values }) => {
        return values.isLongTerm === '1';
      },
      componentProps: {
        valueFormat: 'YYYY-MM-DD',
        disabled: true,
        style: {
          width: '100%',
        },
      },
    },
    {
      label: '长期有效',
      field: 'isLongTerm',
      defaultValue: '0',
      component: 'RadioGroup',
      componentProps: ({ formModel }) => {
        return {
          options: [
            { label: '是', value: '1' },
            { label: '否', value: '0' },
          ],
          onChange: (value) => {
            if (value === '1') {
              formModel.expireDate = undefined;
            }
          },
        };
      },
    },
    {
      label: '下次复审/换证日期',
      field: 'reviewTime',
      component: 'DatePicker',
      required: true,
      ifShow: ({ values }) => {
        return values.whetherReview === '1';
      },
      componentProps: {
        valueFormat: 'YYYY-MM-DD',
        disabled: false,
        style: {
          width: '100%',
        },
      },
    },
    {
      label: '下次复审/换证日期',
      field: 'reviewTime1',
      component: 'DatePicker',
      ifShow: ({ values }) => {
        return values.whetherReview === '0';
      },
      componentProps: {
        valueFormat: 'YYYY-MM-DD',
        disabled: true,
        style: {
          width: '100%',
        },
      },
    },
    {
      label: '不需复审/换证',
      field: 'whetherReview',
      defaultValue: '1',
      component: 'RadioGroup',
      componentProps: ({ formModel }) => {
        return {
          options: [
            { label: '是', value: '0' },
            { label: '否', value: '1' },
          ],
          onChange: (value) => {
            if (value === '0') {
              formModel.reviewTime = undefined;
            }
          },
        };
      },
    },
    {
      label: '到期提醒',
      field: 'remindStatus',
      ifShow: false,
      component: 'Switch',
    },
    {
      label: '备注',
      field: 'remark',
      component: 'InputTextArea',
      componentProps: {
        maxLength: 50,
        rows: 3,
      },
    },
    {
      label: '文件上传',
      field: 'filePath',
      component: 'JUpload',
      required: true,
      componentProps: {
        text: '添加附件',
        maxCount: 3,
      },
      beforeUpload: (file: File) => {
        const isPdf = file.type === 'application/pdf';
        const isLt300M = file.size / 1024 / 1024 < 300;
        if (!isLt300M) {
          message.error('文件过大，请不要超过300M！');
          return false || Upload.LIST_IGNORE;
        } else if (!isPdf) {
          message.error(`文件格式错误，仅支持pdf格式！`);
          return false || Upload.LIST_IGNORE;
        }
        return true;
      },
    },
    {
      field: 'dividerjl',
      component: 'Divider',
      label: '复审记录',
      ifShow: false,
      componentProps: {
        style: {
          color: '#1890ff',
        },
      },
    },
  ];
  onMounted(() => {
    // 所属单位
    getDepart3ListWithSecurity().then((res) => {
      orgOptions.value = res.map((item) => {
        return {
          label: item.departName,
          value: item.orgCode,
        };
      });
    });
  });
  // 车间
  const departOptions: any = ref([]);
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
        componentProps: ({ formModel }) => {
          return {
            options: departOptions.value,
            showSearch: true,
            filterOption: (input: string, option: any) => {
              return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
            },
            onChange: (value, extra) => {
              formModel.departName = '';
              if (value) {
                formModel.departName = extra.label;
              }
            },
          };
        },
      });
    });
  };
  const [registerForm, { validate, setFieldsValue, resetFields, setProps, updateSchema, clearValidate }] = useForm({
    schemas: schemas,
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
  const [registerDrawer, { setDrawerProps, closeDrawer }] = useDrawerInner(async (data) => {
    // 先根据传入数据设置底部按钮
    getTitle.value = data.title;
    showOkBtn.value = data.showOkBtn;
    showFooter.value = data.showFooter;
    isBz.value = data.isBz ? data.isBz : false;
    zIndex.value = data.isBz ? 1001 : 1000;
    setDrawerProps({ confirmLoading: false, showFooter: showFooter.value });
    await resetFields();
    updateSchema({
      field: 'remindStatus',
      ifShow: false,
    });
    updateSchema({
      field: 'dividerjl',
      ifShow: false,
    });
    reviewList.value = [];
    updateSchema({
      field: 'organizationCode',
      componentProps: ({ formModel }) => {
        return {
          options: orgOptions.value,
          showSearch: true,
          filterOption: (input: string, option: any) => {
            return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
          },
          onChange: (value, extra) => {
            formModel.departCode = undefined;
            formModel.departName = '';
            formModel.organizationName = '';
            updateSchema({
              field: 'departCode',
              componentProps: () => {
                return {
                  options: [],
                };
              },
            });
            if (value) {
              formModel.organizationName = extra.label;
              getDepartList(value);
            }
          },
        };
      },
    });
    if (data.type === 'add') {
      updateSchema({
        field: 'departCode',
        componentProps: () => {
          return {
            options: [],
          };
        },
      });
      setFieldsValue({
        departName: undefined,
      });
      if (orgOptions.value?.length === 1) {
        setFieldsValue({
          organizationCode: orgOptions.value[0]?.value,
          organizationName: orgOptions.value[0]?.label,
        });
        getDepartList(orgOptions.value[0]?.value);
      }
    }
    if (data.type !== 'add') {
      info.value = JSON.parse(JSON.stringify(data.record));
      if (data.type === 'view' && data.record.reviewList && !isBz.value) {
        updateSchema({
          field: 'dividerjl',
          ifShow: true,
        });
        if (data.record.reviewList) reviewList.value = data.record.reviewList;
        else reviewList.value = [];
      }
      updateSchema({
        field: 'remindStatus',
        ifShow: true,
      });
      if (!data.isBz) {
        getDepartList(data.record.organizationCode);
      }
      //表单赋值
      await setFieldsValue({
        ...data.record,
      });
      clearValidate(['filePath']);
      setFieldsValue({
        remindStatus: data.record?.remindStatus === '1',
      });
      setFieldsValue({
        trainTime: data.record.trainTimeStart ? data.record.trainTimeStart + ',' + data.record.trainTimeEnd : '',
      });
      if (data.type === 'view') setProps({ disabled: !data.showOkBtn });
    }
    // 更新抽屉
    setDrawerProps({ confirmLoading: false, showFooter: showFooter.value, showOkBtn: showOkBtn.value });
  });

  async function onSubmit() {
    const values = await validate();
    const obj = JSON.parse(JSON.stringify(values));
    if (obj.trainTime && obj.trainTime !== '') {
      obj.trainTimeStart = obj.trainTime.split(',')[0];
      obj.trainTimeEnd = obj.trainTime.split(',')[1];
    }
    obj.remindStatus = obj.remindStatus ? '1' : '0';
    setDrawerProps({ confirmLoading: true });
    try {
      await saveOrUpdate(obj, getTitle.value === '编辑');
      closeDrawer();
      emit('success');
      setDrawerProps({ confirmLoading: false });
    } catch {
      setDrawerProps({ confirmLoading: false });
    }
  }
</script>

<style lang="less" scoped>
  .reviewRecord {
    border: 1px solid #e8e8e8;
    padding: 20px;
    margin-bottom: 10px;
    border-radius: 8px;
    .reviewRecord-text {
      line-height: 30px;
      & > span {
        color: #888888;
      }
    }
  }
  .info-row {
    display: flex;
    padding: 0 20px;
    align-items: center;
    margin-bottom: 20px;
    & > span {
      margin-right: 50px;
    }
    & > img {
      width: 20px;
      height: 20px;
      margin-left: 5px;
    }
  }
</style>
