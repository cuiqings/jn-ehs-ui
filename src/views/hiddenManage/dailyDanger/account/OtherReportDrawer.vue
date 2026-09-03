<template>
  <BasicDrawer
    v-bind="$attrs"
    @register="registerDrawer"
    title="隐患上报"
    ok-text="提交"
    width="900px"
    @ok="handleSubmit"
    :show-footer="true"
    destroyOnClose
  >
    <BasicForm @register="registerForm">
      <template #workshopDirector="{ model, field }">
        <JUserModal v-model:value="model[field]" placeholder="请选择" @confirm="confirmDirector" />
      </template>
      <template #repairPerson="{ model, field }">
        <JUserModal v-model:value="model[field]" placeholder="请选择" @confirm="confirmRepairPerson" />
      </template>
     </BasicForm>
    <RiskPointsModal @register="registerRiskPointsModal" @select="selectRiskPointsOk" />
  </BasicDrawer>
</template>
<script lang="ts" setup>
  import { ref, computed } from 'vue';
  import type { Dayjs } from 'dayjs';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import { BasicDrawer, useDrawerInner } from '/src/components/Drawer';
  import { useModal } from '/@/components/Modal';
  import { dangerReport, getUserListByOrgAndRole } from './account.api';
  import RiskPointsModal from '../components/RiskPointsModal.vue';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { JUserModal } from '/@/components/Form';
  import dayjs from 'dayjs';
  import { useUserStore } from '/@/store/modules/user';
  const userStore = useUserStore();
  const userinfo: any = computed(() => userStore.getUserInfo);
  console.log('userinfo', userinfo.value);
  const emit = defineEmits(['register', 'success']);
  const info = ref<any>({
    handleResult: '2',
    yhLevel: '1',
    yhType: undefined,
    checkHierarchy: '',
    yhPlace: undefined,
    riskPointName: '',
    riskPoint: '',
    repairResult: '',
    recheckResult: '',
    recheckPicture: '',
    tempMeasure: '',
    repairDate1: ref<Dayjs>(dayjs(dayjs(new Date()).format('YYYY-MM-DD'), 'YYYY-MM-DD')),
    repairDate: ref<Dayjs>(),
    dutyDept: undefined,
    dutyDeptName: '',
    dutyPeople: undefined,
    dutyPeopleName: '',
    ifRepair: '',
    handleExplain: '',
    handlePicture: '',
  });
  const dictCodeSub = ref('sk_yh_type_1');
  const fileList = ref('');
  const fileList1 = ref('');
  const riskIdEdit = ref([]);
  const riskDataSource: any = ref([]);
  const nextAssignees = ref([]);
  const [registerRiskPointsModal, { openModal: openRiskPointsModal }] = useModal();
  const [registerDrawer, { setDrawerProps, closeDrawer }] = useDrawerInner(async (data) => {
    setDrawerProps({ confirmLoading: false });
    nextAssignees.value = [];
    fileList.value = '';
    fileList1.value = '';
    // 重置表单
    await resetFields();
  });
  // 注册表单
  const [registerForm, { validate, setFieldsValue, resetFields, clearValidate }] = useForm({
    schemas: [
      {
        label: 'id',
        field: 'id',
        component: 'Input',
        show: false,
      },
      {
        field: 'divider-basic',
        component: 'Divider',
        label: '基本信息',
      },
      {
        label: '隐患照片',
        field: 'yhPicture',
        component: 'JImageUpload',
        required: true,
        componentProps: {
          fileMax: 10,
          text: '',
          isWatermark: true,
        },
      },
      {
        label: '隐患描述',
        field: 'yhDescription',
        component: 'InputTextArea',
        required: true,
        componentProps: {
          autoSize: false,
          rows: 3,
          maxlength: 300,
          showCount: true,
        },
      },
      {
        label: '隐患等级',
        field: 'yhLevel',
        component: 'Select',
        required: true,
        componentProps: () => {
          return {
            options: [
              { label: '一般', value: '1' },
              { label: '重大', value: '2' },
            ],
            placeholder: '请选择',
          };
        },
      },
      {
        label: '隐患类别',
        field: 'yhType',
        required: true,
        component: 'JDictSelectTag',
        componentProps: ({ formModel, formActionType }) => {
          return {
            dictCode: 'sk_yh_type',
            placeholder: '请选择',
            stringToNumber: false,
            showChooseOption: false,
            onChange: (val) => {
              console.log('onChange val', val);
              dictCodeSub.value = val;
              formModel.yhTypeSub = '';
              clearValidate(['yhTypeSub']);
            },
          };
        },
      },
      {
        label: '隐患子类别',
        field: 'yhTypeSub',
        required: true,
        component: 'JDictSelectTag',
        componentProps: ({ formModel, formActionType }) => {
          return {
            dictCode: dictCodeSub.value,
            placeholder: '请选择',
            stringToNumber: false,
            showChooseOption: false,
          };
        },
      },
      {
        label: '关联风险点',
        field: 'riskName',
        required: true, 
        component: 'InputTextArea',
        componentProps: ({ formModel, formActionType }) => {
          return {
            autoSize: true,
            placeholder: '请选择',
            readOnly: true,
            onClick: () => {
              openRiskPointsModal(true, {
                riskId: riskIdEdit.value,
                data: riskDataSource.value,
              });
            },
            onChange: (val) => {
              if (!val.target.value || val.target.value === '') {
                riskIdEdit.value = [];
                riskDataSource.value = [];
              }
            },
          };
        },
      },
      {
        label: '完成时限',
        field: 'repairTimeLimit',
        component: 'DatePicker',
        required: true,
        componentProps: {
          valueFormat: 'YYYY-MM-DD',
          style: { width: '100%' },
          disabledDate: (currentDate) => {
            return currentDate < dayjs().startOf('day');
          },
        },
      },
      {
        label: '整改责任人',
        field: 'repairPerson',
        component: 'Input',
        required: true,
        slot: 'repairPerson',
      },

      {
        label: '车间主任',
        field: 'workshopDirector',
        component: 'Input',
        required: true,
        ifShow: ({ values }) => {
          return values.yhLevel == '2';
        },
        slot: 'workshopDirector',
      },
    ],
    showActionButtonGroup: false,
    labelCol: {
      xs: { span: 24 },
      sm: { span: 5 },
    },
    wrapperCol: {
      xs: { span: 24 },
      sm: { span: 18 },
    },
  });
  //表单提交事件
  async function handleSubmit() {
    let values = await validate();
    if (!values) return;
    setDrawerProps({ confirmLoading: true });
    values.riskId = riskIdEdit.value[0];
    console.log('values', values);
    await dangerReport(values)
      .then(() => {
        closeDrawer();
        emit('success');
      })
      .finally(() =>
        setTimeout(() => {
          setDrawerProps({ confirmLoading: false });
        }, 100)
      );
  }
  function selectRiskPointsOk(data) {
    console.log('selectRiskPointsOk data', data);
    if (data.dataSource.length > 0) {
      riskDataSource.value = data.dataSource;

      setFieldsValue({
        riskName: riskDataSource.value[0].pointName,
      });
      riskIdEdit.value = data.selectedRowKeys;
    }
  }
  function resetInfo() {
    // 初始化info
    info.value = {
      handleResult: '2',
      yhLevel: '1',
      yhType: undefined,
      checkHierarchy: '',
      yhPlace: undefined,
      riskPointName: '',
      riskPoint: '',
      repairResult: '',
      recheckResult: '',
      recheckPicture: '',
      tempMeasure: '',
      repairDate1: ref<Dayjs>(dayjs(dayjs(new Date()).format('YYYY-MM-DD'), 'YYYY-MM-DD')),
      repairDate: ref<Dayjs>(),
      dutyDept: undefined,
      dutyDeptName: '',
      dutyPeople: undefined,
      dutyPeopleName: '',
      ifRepair: '',
      handleExplain: '',
      handlePicture: '',
    };
  }
  const confirmRepairPerson = (userName: string, userValue: string, orgCode: string) => {
    // 清除repairPerson的表单验证
    clearValidate(['repairPerson']);
    //根据组织编码获取车间主任
    getUserListByOrgAndRole({orgCode: orgCode, roleCode: 'workshop_director'}).then((res) => {
      console.log('getUserListByOrgAndRole res', res);
      if(res.length > 0) {
        // 设置workshopDirector的值
        setFieldsValue({
          workshopDirector: res[0].id,
        });
      }
    });
  };
  const confirmDirector = () => {
    clearValidate(['workshopDirector']);
  };
</script>
<style lang="less" scoped>
  .step-wrapper {
    padding: 20px 12px;
  }
  .info-wrapper {
    padding: 0 12px;
  }
  .hi-wrapper {
    padding: 0 12px;
  }
  .info {
    display: flex;
    margin: 10px 0;

    .split-line {
      width: 4px;
      height: 20px;
      background: #3e87f8;
      margin-right: 10px;
      margin-top: 1px;
    }
    .info-title {
      font-size: 16px;
      font-family: SourceHanSansCN-Medium, SourceHanSansCN-Medium;
      font-weight: normal;
      color: rgba(0, 0, 0, 0.87);
    }
  }
  .info-content {
    display: flex;
    flex-direction: column;
    margin-top: 20px;
    .item {
      // width: 50%;
      display: flex;
      margin-bottom: 15px;
      .item-title {
        width: 120px;
        font-size: 14px;
        font-family: SourceHanSansCN-Regular, SourceHanSansCN;
        font-weight: normal;
        color: rgba(0, 0, 0, 0.68);
        text-align: right;
      }
      .item-content {
        width: calc(100% - 120px);
        font-size: 14px;
        font-family: SourceHanSansCN-Regular, SourceHanSansCN;
        font-weight: normal;
        color: rgba(0, 0, 0, 0.9);
      }
    }
  }
  .line-wrapper {
    padding: 24px;
  }
  .his-detail {
    display: flex;
    position: relative;
    .his-time {
      width: 160px;
      margin-right: 5px;
    }
    .more-btn {
      position: absolute;
      right: 0;
      top: 0;
    }
  }
  .his-content {
    // width: 850px;
    .history-explain {
      width: 100%;
      margin-top: 10px;
      display: flex;
      .explain-label {
        width: 90px;
        text-align: right;
      }
      .explain-text {
        // width: 750px;
        color: #666;
      }
    }
  }
  .rectification-pic {
    margin-left: 120px;
  }
</style>
