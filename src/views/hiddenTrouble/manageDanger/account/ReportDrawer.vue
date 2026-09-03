<template>
  <BasicDrawer
    v-bind="$attrs"
    @register="registerDrawer"
    title="隐患上报"
    ok-text="提交"
    width="800px"
    @ok="submitPerson"
    :show-footer="true"
    destroyOnClose
  >
    <BasicForm @register="registerForm">
      <template #yhPicture>
        <JImageUpload v-model:value="fileList" :isYhWatermark="true" :fileMax="10" text="" bizPath="hiddenTrouble" />
      </template>
      <template #repairPicture>
        <JImageUpload v-model:value="fileList1" :isYhWatermark="true" :fileMax="10" text="" bizPath="hiddenTrouble" />
      </template>
    </BasicForm>
    <RiskPointsModal @register="registerRiskPointsModal" @select="selectRiskPointsOk" />
    <a-modal v-model:visible="personVisible" title="下一节点处理人" @ok="handlePersonOk" width="600px">
      <a-form ref="personFormRef" :model="personInfo" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }" autocomplete="off" style="margin: 20px 0">
        <a-form-item
          v-for="(itemAssignee, index) in nextAssignees"
          :key="index"
          :label="itemAssignee.name"
          :name="itemAssignee.field"
          :rules="[{ required: true, message: '请选择！' }]"
        >
          <a-select v-model:value="personInfo[itemAssignee.field]" placeholder="请选择" style="width: 200px">
            <a-select-option v-for="(item, index) in itemAssignee.users" :key="index" :value="item.value">
              {{ item.label }}
            </a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>
  </BasicDrawer>
</template>
<script lang="ts" setup>
  import { ref, computed } from 'vue';
  import type { Dayjs } from 'dayjs';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import { BasicDrawer, useDrawerInner } from '/src/components/Drawer';
  import { useModal } from '/@/components/Modal';
  import { JImageUpload } from '/@/components/Form';
  import { defHttp } from '/@/utils/http/axios';
  import { dangerReport, getUserList, getTeamList, getFlowType, getNextAssignee } from './account.api';
  import RiskPointsModal from '../components/RiskPointsModal.vue';
  import { useMessage } from '/@/hooks/web/useMessage';
  import dayjs from 'dayjs';
  import { getOrgCodeList, getDepartmentList } from '/@/api/common/api';
  import { useUserStore } from '/@/store/modules/user';
  const userStore = useUserStore();
  const userinfo: any = computed(() => userStore.getUserInfo);
  console.log('userinfo', userinfo.value);
  const { createMessage } = useMessage();
  const emit = defineEmits(['register', 'success']);
  const historyData = ref({});
  const previewVisible = ref(false);
  const previewImage = ref('');
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
  const treeData = ref<any[]>([]);
  const treeData1 = ref<any[]>([]);
  const personOptions = ref<any[]>([]);
  const fileList = ref('');
  const fileList1 = ref('');
  const riskIdEdit = ref([]);
  const riskDataSource: any = ref([]);
  const repairDate1Disabled = ref(false);
  const repairDateDisabled = ref(false);
  const personVisible = ref(false);
  const personFormRef = ref<any>(null);
  const personInfo = ref<any>({});
  const nextAssignees = ref([]);
  const orgOptions = ref([]);
  const departOptions = ref([]);
  const teamOptions = ref([]);
  const flowType = ref(''); //1安全管理部 2分厂车间班组 3分厂安全科
  const [registerRiskPointsModal, { openModal: openRiskPointsModal }] = useModal();

  async function getOrgList() {
    await getOrgCodeList().then((res) => {
      orgOptions.value = res.map((item) => {
        return {
          label: item.departName,
          value: item.orgCode,
        };
      });
    });
    console.log('options', orgOptions.value);
  }
  getOrgList();
  function initOrgCode() {
    let queryParam: any = {};
    if (userinfo.value.orgCode.length > 6) {
      queryParam.orgCode = userinfo.value.orgCode.slice('0', '6');
    } else if (userinfo.value.orgCode.length == 6) {
      queryParam.orgCode = userinfo.value.orgCode;
      queryParam.departCode = undefined;
    } else {
      queryParam.orgCode = undefined;
      queryParam.departCode = undefined;
    }
    if (queryParam.orgCode) {
      let params: any = {};
      params.orgCode = queryParam.orgCode;
      params.pageSize = 9999;
      params.pageNo = 1;
      getDepartmentList(params).then((res) => {
        if (res && res.length > 0) {
          departOptions.value = res.map((item) => {
            return {
              label: item.departName,
              value: item.orgCode,
            };
          });
        } else {
          departOptions.value = [];
        }
      });
    }
    return queryParam.orgCode;
  }
  getFlowTypeCode();
  // 获取当前登陆人的所属部门级别
  async function getFlowTypeCode() {
    await getFlowType({ userId: userinfo.value.id }).then((res) => {
      console.log('res', res);
      flowType.value = res;
    });
  }
  const [registerDrawer, { setDrawerProps, closeDrawer }] = useDrawerInner(async (data) => {
    setDrawerProps({ confirmLoading: false });
    nextAssignees.value = [];
    fileList.value = '';
    fileList1.value = '';
    // 重置表单
    await resetFields();
  });
  // 注册表单
  const [registerForm, { validate, setFieldsValue, resetFields, setProps, updateSchema }] = useForm({
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
        colProps: {
          style: 'margin-left: -100px',
        },
      },
      {
        label: '隐患照片',
        field: 'yhPicture',
        component: 'Input',
        slot: 'yhPicture',
        colProps: {
          style: 'margin-left: -100px',
        },
      },
      {
        label: '所属单位',
        field: 'org',
        component: 'Select',
        required: true,
        componentProps: ({ formModel, formActionType }) => {
          return {
            options: orgOptions,
            placeholder: '请选择',
            onChange: (e: any) => {
              departOptions.value = [];
              personOptions.value = [];
              formModel.depart = undefined; //  reset city value
              formModel.checkDutyPerson = undefined; //  reset city value
              formModel.executePerson = undefined; //  reset city value
              formModel.team = undefined; //  reset city value
              formModel.repairPerson = undefined; //  reset city value
              // 清空风险ID
              formModel.riskId = '';
              riskIdEdit.value = [];
              riskDataSource.value = [];
              const { updateSchema } = formActionType;
              if (e) {
                let params: any = {};
                params.orgCode = e;
                params.pageSize = 9999;
                params.pageNo = 1;
                getUserList(params).then((res) => {
                  if (res) {
                    personOptions.value = res.map((item: any) => {
                      return {
                        label: item.realname,
                        value: item.id,
                      };
                    });
                    updateSchema({
                      field: 'repairPerson',
                      componentProps: {
                        options: personOptions.value,
                      },
                    });
                  }
                });
                let params1: any = {};
                params1.workShopCode = e;
                getTeamList(params1).then((res) => {
                  if (res) {
                    teamOptions.value = res.map((item: any) => {
                      return {
                        label: item.sectionName,
                        value: item.id,
                      };
                    });
                    updateSchema({
                      field: 'team',
                      componentProps: {
                        options: teamOptions.value,
                      },
                    });
                  } else {
                    updateSchema({
                      field: 'team',
                      componentProps: {
                        options: [],
                      },
                    });
                  }
                });
                getDepartmentList(params).then((res) => {
                  if (res && res.length > 0) {
                    departOptions.value = res.map((item) => {
                      return {
                        label: item.departName,
                        value: item.orgCode,
                      };
                    });
                    updateSchema({
                      field: 'depart',
                      componentProps: ({ formModel, formActionType }) => {
                        return {
                          options: departOptions,
                          placeholder: '请选择',
                          onChange: (e: any) => {},
                        };
                      },
                    });
                  } else {
                    updateSchema({
                      field: 'depart',
                      componentProps: ({ formModel, formActionType }) => {
                        return {
                          options: [],
                          placeholder: '请选择',
                          onChange: (e: any) => {
                          },
                        };
                      },
                    });
                  }
                });
              } else {
                updateSchema({
                  field: 'team',
                  componentProps: {
                    options: [],
                  },
                });
                updateSchema({
                  field: 'depart',
                  componentProps: ({ formModel, formActionType }) => {
                    return {
                      options: departOptions,
                      placeholder: '请选择',
                      onChange: (e: any) => {
                        // personOptions.value = [];
                        formModel.checkDutyPerson = undefined; //  reset city value
                        formModel.executePerson = undefined; //  reset city value
                      },
                    };
                  },
                });
              }
            },
          };
        },
        colProps: {
          span: 12,
        },
      },
      {
        label: '所属车间',
        field: 'depart',
        component: 'Select',
        // defaultValue: initDeptCode(),
        required: () => {
          if (flowType.value == '1') {
            return false;
          } else {
            return true;
          }
        },
        componentProps: ({ formModel, formActionType }) => {
          return {
            options: departOptions,
            placeholder: '请选择',
            onChange: (e: any) => {
            },
          };
        },
        colProps: {
          span: 12,
        },
      },
      {
        label: '所属班组',
        field: 'team',
        component: 'Select',
        required: true,
        componentProps: () => {
          return {
            options: teamOptions.value,
            placeholder: '请选择',
          };
        },
        ifShow: () => {
          if (flowType.value == '2') {
            return true;
          } else {
            return false;
          }
        },
        colProps: {
          span: 12,
        },
      },
      {
        label: '隐患等级',
        field: 'yhLevel',
        component: 'Select',
        required: true,
        defaultValue: '1',
        componentProps: () => {
          return {
            options: [
              { label: '一般', value: '1' },
              { label: '重大', value: '2' },
            ],
            placeholder: '请选择',
          };
        },
        colProps: {
          span: 12,
        },
      },
      {
        label: '检查日期',
        field: 'checkTime',
        component: 'DatePicker',
        required: true,
        defaultValue: ref<Dayjs>(dayjs(dayjs(new Date()).format('YYYY-MM-DD'), 'YYYY-MM-DD')),
        componentProps: {
          valueFormat: 'YYYY-MM-DD',
          style: { width: '100%' },
          disabledDate: (currentDate) => {
            return currentDate > dayjs().endOf('day');
          },
        },
        colProps: {
          span: 12,
        },
      },
      {
        label: '检查人',
        field: 'checkPersonName',
        component: 'Input',
        defaultValue: userinfo.value.realname,
        required: true,
        dynamicDisabled: true,
        colProps: {
          span: 12,
        },
      },
      {
        label: '隐患分类',
        field: 'yhType',
        required: true,
        component: 'JDictSelectTag',
        componentProps: ({ formModel, formActionType }) => {
          return {
            dictCode: 'sk_yh_type',
            placeholder: '请选择',
            stringToNumber: false,
            showChooseOption: false,
            // onChange: (e: any) => {
            //   formModel.yhTypeSub = undefined;
            //   const { updateSchema } = formActionType;
            //   updateSchema({
            //     field: 'yhTypeSub',
            //     componentProps: {
            //       dictCode: e,
            //       placeholder: '请选择',
            //       stringToNumber: false,
            //       showChooseOption: false,
            //     },
            //   });
            // },
          };
        },
        ifShow: () => {
          return flowType.value !== '2' ? true : false;
        },
        colProps: {
          span: 12,
        },
      },
      {
        label: '子类',
        field: 'yhTypeSub',
        required: true,
        component: 'JDictSelectTag',
        componentProps: {
          dictCode: 'sk_yh_type_sub',
          placeholder: '请选择',
          stringToNumber: false,
          showChooseOption: false,
        },
        ifShow: () => {
          return flowType.value !== '2' ? true : false;
        },
        colProps: {
          span: 12,
        },
      },
      {
        label: '风险ID',
        field: 'riskId',
        component: 'InputTextArea',
        componentProps: ({ formModel, formActionType }) => {
          return {
            autoSize: true,
            placeholder: '请选择',
            readOnly: true,
            onClick: () => {
              if (formModel.org) {
                openRiskPointsModal(true, {
                  riskId: riskIdEdit.value,
                  data: riskDataSource.value,
                  orgCode: formModel.org,
                  departCode: formModel.depart,
                });
              } else {
                createMessage.error('请先选择所属单位');
              }
            },
            onChange: (val) => {
              if (!val.target.value || val.target.value === '') {
                riskIdEdit.value = [];
                riskDataSource.value = [];
              }
            },
          };
        },
        colProps: {
          span: 12,
        },
      },
      {
        field: 'remark',
        label: '备注',
        component: 'Input',
        componentProps: {
          maxlength: 50,
        },
        colProps: {
          span: 12,
        },
      },

      {
        label: '整改要求',
        field: 'repairRequire',
        component: 'RadioGroup',
        required: true,
        defaultValue: '1',
        componentProps: ({ formActionType, formModel }) => {
          return {
            options: [
              { label: '现场整改', value: '1' },
              { label: '限期整改', value: '2' },
            ],
            onChange: (item) => {
              const { updateSchema } = formActionType;
              let e = item.target.value;
              if (e === '2') {
                formModel.isHazardousChemicalsUrl = '';
              }
              updateSchema({
                field: 'isHazardousChemicalsUrl',
                componentProps: {
                  disabled: e === '0' ? true : false,
                },
              });
            },
          };
        },
        colProps: { span: 12 },
      },
      {
        label: '整改期限',
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
        colProps: {
          span: 12,
        },
      },
      {
        label: '整改人',
        field: 'repairPerson',
        component: 'Select',
        required: true,
        // dynamicDisabled: false,
        componentProps: {
          options: personOptions.value,
          placeholder: '请选择',
          showSearch: true,
          filterOption: (input: string, option: any) => {
            return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
          },
        },
        ifShow: ({ values }) => {
          if (flowType.value == '2' && values.yhLevel == '1') {
            return true;
          } else {
            return false;
          }
        },
        colProps: {
          span: 12,
        },
      },
      {
        label: '整改后照片',
        field: 'repairPicture',
        component: 'Input',
        slot: 'repairPicture',
        ifShow: ({ values }) => {
          return values.repairRequire === '1' ? true : false;
        },
        colProps: {
          style: 'margin-left: -95px',
        },
      },
      {
        label: '建议整改措施',
        field: 'sugRepairMsr',
        component: 'InputTextArea',
        required: true,
        componentProps: {
          autoSize: false,
          rows: 3,
          maxlength: 300,
          showCount: true,
        },
        ifShow: ({ values }) => {
          return values.repairRequire === '2' ? true : false;
        },
        colProps: {
          style: 'margin-left: -95px',
        },
      },
    ],
    showActionButtonGroup: false,
    labelCol: {
      xs: { span: 24 },
      sm: { span: 6 },
    },
    wrapperCol: {
      xs: { span: 24 },
      sm: { span: 18 },
    },
  });
  // 加载部门数
  loadRoot();
  async function changeRepairResult(value) {
    console.log('changeRepairResult', value);
    if (value.target.value == '1') {
      info.value.tempMeasure = '';
      info.value.repairDate1 = ref<Dayjs>(dayjs(dayjs(new Date()).format('YYYY-MM-DD'), 'YYYY-MM-DD'));
      if (historyData.value.depart) {
        info.value.dutyDept = historyData.value.depart;
      } else {
        info.value.dutyDept = historyData.value.org;
      }
      // 整改完成-限定整改日期赋值
      if (historyData.value.repairDate) {
        info.value.repairDate1 = historyData.value.repairDate;
        repairDate1Disabled.value = true;
      } else {
        info.value.repairDate1 = ref<Dayjs>(dayjs(dayjs(new Date()).format('YYYY-MM-DD'), 'YYYY-MM-DD'));
        repairDate1Disabled.value = false;
      }
      info.value.dutyPeople = undefined;
      info.value.recheckResult = '';
      info.value.recheckPicture = '';
    } else {
      info.value.tempMeasure = '';
      info.value.repairDate = ref<Dayjs>();
      info.value.dutyDept = undefined;
      info.value.dutyPeople = undefined;
      personOptions.value = [];
      // 整改完成-限定整改日期赋值
      if (historyData.value.repairDate) {
        info.value.repairDate = historyData.value.repairDate;
        repairDateDisabled.value = true;
      } else {
        info.value.repairDate = ref<Dayjs>();
        repairDateDisabled.value = false;
      }
    }
  }
  /**
   * 加载下拉树形数据
   */
  async function loadRoot() {
    let params = {};
    let res = await defHttp.get({ url: '/jn/common/getDepartTreeBy23', params }, { isTransformResponse: false });
    if (res.success && res.result) {
      //深拷贝res.result
      let resCopy = JSON.parse(JSON.stringify(res.result));
      for (let i of res.result) {
        i.key = i.orgCode;
        i.label = i.departName;
        i.value = i.orgCode;
        i.isLeaf = !!i.isLeaf;
        if (!i.isLeaf) {
          toData(i.children, i.isLeaf);
        }
      }
      treeData.value = [...res.result];
      console.log(treeData.value);
      for (let i of resCopy) {
        i.key = i.orgCode;
        i.label = i.departName;
        i.value = i.orgCode;
        i.isLeaf = !!i.isLeaf;
        i.selectable = false;
        if (!i.isLeaf) {
          toData(i.children, i.isLeaf);
        }
      }
      treeData1.value = [...resCopy];
      // console.log(treeData1.value);
    } else {
      console.log('数根节点查询结果异常', res);
    }
  }

  function toData(children, isLeaf) {
    if (!isLeaf) {
      for (let i of children) {
        i.key = i.orgCode;
        i.label = i.departName;
        i.value = i.orgCode;
        i.isLeaf = !!i.isLeaf;
        toData(i.children, i.isLeaf);
      }
    }
  }
  // 提交选人
  async function submitPerson() {
    const values = await validate();
    if (!values) return;
    // 获取节点处理人列表
    nextAssignees.value = [];
    personInfo.value = {};
    let params: any = {};
    params.currentNode = '11';
    params.flowType = flowType.value;
    params.yhLevel = values.yhLevel;
    params.repairRequire = values.repairRequire;
    params.org = values.org;
    params.depart = values.depart;
    getNextAssignee(params).then((res) => {
      console.log('res', res);
      if (res && res.length > 0) {
        res.map((item) => {
          item.users = item.users.map((item1) => {
            return {
              label: item1.realname,
              value: item1.id,
            };
          });
        });
        nextAssignees.value = res;
      } else {
        nextAssignees.value = [];
      }
    });
    personVisible.value = true;
  }
  // 下一节点处理人
  async function handlePersonOk() {
    const values = await personFormRef.value.validate();
    console.log('handlePersonOk values', values);
    await handleSubmit(values);
    personVisible.value = false;
  }
  //表单提交事件
  async function handleSubmit(personsValues) {
    let values = await validate();
    if (!values) return;
    setDrawerProps({ confirmLoading: true });
    console.log('values', values);
    values.checkTime = `${values.checkTime} 00:00:00`;
    values.repairTimeLimit = `${values.repairTimeLimit} 00:00:00`;
    values.checkPerson = userinfo.value.id;
    values.yhPicture = fileList.value;
    values.repairPicture = fileList1.value;
    if (values.team) {
      // 遍历查询teamName
      for (let i of teamOptions.value) {
        if (i.value == values.team) {
          values.teamName = i.label;
          break;
        }
      }
    }
    if (riskIdEdit.value.length > 0) {
      values.riskId = riskIdEdit.value[0];
    }
    values = Object.assign(values, personsValues);
    console.log('values personsValues both', values);
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
        riskId: riskDataSource.value[0].uniqueCode,
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
