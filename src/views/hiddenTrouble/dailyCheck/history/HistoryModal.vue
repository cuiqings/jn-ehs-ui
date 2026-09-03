<template>
  <div>
    <BasicModal v-bind="$attrs" @register="registerModal" :width="1600" title="巡检任务处理" @cancel="handleCancel">
      <BasicForm @register="registerForm">
        <template #table1>
          <a-table
            style="width: 120%; margin-left: 40px"
            ref="table"
            size="middle"
            bordered
            rowKey="id"
            :columns="columns"
            :dataSource="dataSource"
            :pagination="false"
          >
            <template #headerCell="{ column }">
              <template v-if="column.key === 'checkResult'"> <span class="red-require">*</span>检查结果</template>
            </template>
            <template #checkMethod="{ record }">
              <span v-if="record.checkMethod == '1'">现场检查</span>
              <span v-if="record.checkMethod == '2'">文件查阅</span>
            </template>
            <template #checkResult="{ record }">
              <a-radio-group v-model:value="record.checkResult" @change="changeCheckResult(record)">
                <a-radio :value="'1'">合格</a-radio>
                <a-radio :value="'2'">不合格</a-radio>
              </a-radio-group>
              <div v-if="record.errorFlag1" style="color: red">请选择检查结果</div>
            </template>
            <template #problemDescription="{ record }">
              <a-textarea
                placeholder="请输入100字以内"
                v-model:value="record.problemDescription"
                :rows="2"
                :maxlength="100"
                @change="changeProblemDescription(record)"
              />
              <div v-if="record.errorFlag2" style="color: red">请输入问题描述</div>
            </template>
            <template #checkPicture="{ record }">
              <JImageUpload
                v-model:value="record.checkPicture"
                :isYhWatermark="true"
                :fileMax="10"
                text=""
                bizPath="hiddenTrouble"
                @change="changeCheckPicture(record)"
              />
              <div v-if="record.errorFlag3" style="color: red">请选择检查照片</div>
            </template>
            <template #repairPicture="{ record }">
              <JImageUpload v-model:value="record.repairPicture" :isYhWatermark="true" :fileMax="10" text="" bizPath="hiddenTrouble" />
            </template>
            <template #workshopManager="{ record }">
              <a-select
                v-model:value="record.workshopManager"
                style="width: 120px"
                @change="changeWorkshopManager(record)"
                allowClear
                show-search
                :options="personOptions"
                :filter-option="filterOption"
                placeholder="请选择"
              >
              </a-select>
              <div v-if="record.errorFlag4" style="color: red">请选择车间负责人</div>
            </template>
            <template #riskId="{ record }">
              <span style="cursor: pointer; color: #1890ff" @click="handleRiskId(record)">{{ record.riskId }}</span>
            </template>
          </a-table>
        </template>
        <template #table2>
          <a-table
            style="width: 120%; margin-left: 40px"
            ref="table"
            size="middle"
            bordered
            rowKey="id"
            :columns="columns2"
            :dataSource="dataSource"
            :pagination="false"
          >
            <template #headerCell="{ column }">
              <template v-if="column.key === 'checkResult'"> <span class="red-require">*</span>检查结果</template>
            </template>
            <template #checkMethod="{ record }">
              <span v-if="record.checkMethod == '1'">现场检查</span>
              <span v-if="record.checkMethod == '2'">文件查阅</span>
            </template>
            <template #checkResult="{ record }">
              <a-radio-group v-model:value="record.checkResult" @change="changeCheckResult(record)">
                <a-radio :value="'1'">合格</a-radio>
                <a-radio :value="'2'">不合格</a-radio>
              </a-radio-group>
              <div v-if="record.errorFlag1" style="color: red">请选择检查结果</div>
            </template>
            <template #problemDescription="{ record }">
              <a-textarea
                placeholder="请输入100字以内"
                v-model:value="record.problemDescription"
                :rows="2"
                :maxlength="100"
                @change="changeProblemDescription(record)"
              />
              <div v-if="record.errorFlag2" style="color: red">请输入问题描述</div>
            </template>
            <template #checkPicture="{ record }">
              <JImageUpload
                v-model:value="record.checkPicture"
                :isYhWatermark="true"
                :fileMax="10"
                text=""
                bizPath="hiddenTrouble"
                @change="changeCheckPicture(record)"
              />
              <div v-if="record.errorFlag3" style="color: red">请选择检查照片</div>
            </template>
            <template #repairPicture="{ record }">
              <JImageUpload v-model:value="record.repairPicture" :isYhWatermark="true" :fileMax="10" text="" bizPath="hiddenTrouble" />
            </template>
            <template #workshopManager="{ record }">
              <a-select
                v-model:value="record.workshopManager"
                style="width: 120px"
                @change="changeWorkshopManager(record)"
                show-search
                :options="personOptions"
                :filter-option="filterOption"
                allowClear
                placeholder="请选择"
              >
              </a-select>
              <div v-if="record.errorFlag4" style="color: red">请选择车间负责人</div>
            </template>
          </a-table>
        </template>
        <template #reviewCase v-if="modalTitle == '查看'">
          <div class="info-content">
            <div class="item">
              <div class="item-title">审批结果：</div>
              <div class="item-content">
                <span v-if="detailsData.planStatus == '1'">审批通过</span>
                <span v-if="detailsData.planStatus == '0'">待审批</span>
                <span v-if="detailsData.planStatus == '2'">审批退回</span>
              </div>
            </div>
            <div class="item">
              <div class="item-title">审批人：</div>
              <div class="item-content">
                {{ detailsData.approvePeopleName }}
              </div>
            </div>
            <div class="item">
              <div class="item-title">审批时间：</div>
              <div class="item-content">
                {{ detailsData.approveTime }}
              </div>
            </div>
          </div>
        </template>
        <template #noticeType>
          <div style="">
            <a-checkbox :disabled="true" v-model:checked="remindMessage">短信</a-checkbox>
          </div>
        </template>
      </BasicForm>
      <template #footer>
        <a-button @click="onSave" type="primary"> 保存 </a-button>
        <a-button @click="handleSubmit" type="primary">提交</a-button>
      </template>
    </BasicModal>
    <RiskModalInfo @register="registerRiskInfoModal" />
  </div>
</template>
  
  <script lang="ts" setup>
import { computed, ref, unref } from 'vue';
import { BasicModal, useModalInner, useModal } from '/@/components/Modal';
import { BasicForm, useForm } from '/@/components/Form/index';
import { getDetail, taskSubmit, saveItemBatch } from './history.api';
import { getFlowType } from '../../manageDanger/account/account.api';
import { defHttp } from '/@/utils/http/axios';
import { useUserStore } from '/@/store/modules/user';
import { ArrowDownOutlined, ArrowUpOutlined } from '@ant-design/icons-vue';
import { useMessage } from '/@/hooks/web/useMessage';
import { initDictOptions } from '/@/utils/dict';
import { weekOptions, monthOptions } from '/@/views/task/publish/time.data';
import { getOrgCodeList, getDepartmentList } from '/@/api/common/api';
import { getUserList } from '../manage/manage.api';
import { JImageUpload } from '/@/components/Form';
import { getRiskInfoById } from '../../checklist/check.api';
import RiskModalInfo from '/@/views/risk/component/riskModalInfo.vue';
const [registerRiskInfoModal, RiskInfoProps] = useModal();
const { createConfirm } = useMessage();
const { createMessage } = useMessage();
const userStore = useUserStore();
const userinfo: any = computed(() => userStore.getUserInfo);
const emit = defineEmits(['success', 'register']);
const isUpdate = ref<Boolean>(true);
const showFooter = ref<Boolean>(true);
const modalTitle = ref('查看');
const orgOptions: any = ref([]);
const departOptions: any = ref([]);
const dataSource: any = ref([]);
const itemTypeOptions: any = ref([]);
const remindMessage = ref(true);
const detailsData: any = ref({});
const checkTypeOptions: any = ref([]);
const planType = ref('');
const flowType = ref('');
getFlowTypeCode();
// 获取流程节点
// 获取当前登陆人的所属部门级别
async function getFlowTypeCode() {
  await getFlowType({ userId: userinfo.value.id }).then((res) => {
    console.log('res', res);
    flowType.value = res;
  });
}
const columns: any = [
  {
    title: '序号',
    align: 'center',
    width: 80,
    customRender: ({ index }) => {
      return index + 1;
    },
  },
  { title: '风险ID', align: 'center', key: '', dataIndex: 'riskId', width: 120, slots: { customRender: 'riskId' } },
  { title: '区域位置（单元）', width: 150, align: 'center', key: 'rgLcName', dataIndex: 'rgLcName' },
  { title: '风险名称', width: 140, align: 'center', key: 'riskName', dataIndex: 'riskName' },
  { title: '排查方法', width: 140, align: 'center', key: 'checkMethod', dataIndex: 'checkMethod', slots: { customRender: 'checkMethod' } },
  {
    title: '检查结果',
    width: 120,
    align: 'center',
    key: 'checkResult',
    dataIndex: 'checkResult',
    slots: { customRender: 'checkResult' },
  },
  {
    title: '问题描述',
    align: 'center',
    key: 'problemDescription',
    dataIndex: 'problemDescription',
    width: 200,
    slots: { customRender: 'problemDescription' },
  },
  {
    title: '车间负责人',
    align: 'center',
    key: 'workshopManager',
    dataIndex: 'workshopManager',
    width: 100,
    slots: { customRender: 'workshopManager' },
    ifShow: ({ values }) => {
      if (flowType.value == '2') {
        return true;
      } else {
        return false;
      }
    },
  },
  { title: '检查照片', align: 'center', key: 'checkPicture', dataIndex: 'checkPicture', width: 120, slots: { customRender: 'checkPicture' } },
  { title: '整改后照片', align: 'center', key: 'repairPicture', dataIndex: 'repairPicture', width: 120, slots: { customRender: 'repairPicture' } },
];
const columns2: any = [
  { title: '区域位置（单元）', width: 150, align: 'center', key: 'rgLcName', dataIndex: 'rgLcName' },
  { title: '检查内容', width: 140, align: 'center', key: 'checkContent', dataIndex: 'checkContent' },
  { title: '检查要求', width: 140, align: 'center', key: 'checkRequire', dataIndex: 'checkRequire' },
  { title: '排查方法', width: 140, align: 'center', key: 'checkMethod', dataIndex: 'checkMethod', slots: { customRender: 'checkMethod' } },
  {
    title: '检查结果',
    width: 200,
    align: 'center',
    key: 'checkResult',
    dataIndex: 'checkResult',
    slots: { customRender: 'checkResult' },
  },
  {
    title: '问题描述',
    align: 'center',
    key: 'problemDescription',
    dataIndex: 'problemDescription',
    width: 120,
    slots: { customRender: 'problemDescription' },
  },
  {
    title: '车间负责人',
    align: 'center',
    key: 'workshopManager',
    dataIndex: 'workshopManager',
    width: 100,
    slots: { customRender: 'workshopManager' },
    ifShow: ({ values }) => {
      if (flowType.value == '2') {
        return true;
      } else {
        return false;
      }
    },
  },

  { title: '检查照片', align: 'center', key: 'checkPicture', dataIndex: 'checkPicture', width: 120, slots: { customRender: 'checkPicture' } },
  { title: '整改后照片', align: 'center', key: 'repairPicture', dataIndex: 'repairPicture', width: 120, slots: { customRender: 'repairPicture' } },
];
const editType = ref('');
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
// function initDeptCode() {
//   let queryParam = {};
//   if (userinfo.value.orgCode.length > 6) {
//     queryParam.orgCode = userinfo.value.orgCode.slice('0', '6');
//     queryParam.departCode = userinfo.value.orgCode;
//   } else if (userinfo.value.orgCode == 6) {
//     queryParam.orgCode = userinfo.value.orgCode;
//     queryParam.departCode = undefined;
//   } else {
//     queryParam.orgCode = undefined;
//     queryParam.departCode = undefined;
//   }
//   return queryParam.departCode;
// }
initDictConfig();
// 初始化字典
async function initDictConfig() {
  itemTypeOptions.value = await initDictOptions('check_sort');
  checkTypeOptions.value = await initDictOptions('yh_plan_check_type');
}
const personOptions: any = ref([]);
const filterOption = (input: string, option: any) => {
  return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
};
// 获取角色列表
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
      label: 'planType',
      field: 'planType',
      component: 'Input',
      show: false,
    },
    {
      field: 'divider-basic',
      component: 'Divider',
      label: '基本信息',
    },
    {
      label: '所属单位',
      field: 'orgName',
      component: 'Input',
      required: true,
      colProps: {
        span: 8,
      },
    },
    {
      label: '所属车间',
      field: 'depart',
      component: 'Select',
      // defaultValue: initDeptCode(),
      componentProps: {
        options: departOptions.value, // defalut []
        placeholder: '请选择',
      },
      colProps: {
        span: 8,
      },
    },
    {
      field: 'planName',
      label: '计划名称',
      component: 'Input',
      rules: [{ required: true, message: '计划名称不可为空！' }],
      componentProps: {
        maxlength: 50,
      },
      colProps: {
        span: 7,
      },
    },
    {
      label: '巡检周期',
      field: 'checkCycle',
      required: true,
      component: 'JDictSelectTag',
      componentProps: {
        dictCode: 'sk_check_cycle',
        placeholder: '请选择',
        stringToNumber: false,
        showChooseOption: false,
      },
      colProps: {
        span: 8,
      },
    },
    {
      label: '责任人',
      field: 'checkDutyPersonName',
      component: 'Input',
      required: true,
      colProps: {
        span: 8,
      },
    },
    {
      label: '执行人',
      field: 'executePersonName',
      component: 'Input',
      required: true,
      colProps: {
        span: 7,
      },
    },
    {
      label: '未执行提醒',
      field: 'remindNoExecute',
      defaultValue: '0',
      component: 'JDictSelectTag',
      required: true,
      componentProps: () => {
        return {
          dictCode: 'ht_remind_executed',
          type: 'radio',
          placeholder: '请选择',
          onChange: (e: any) => {
            console.log(e, 'eeeee====');
          },
        };
      },
      colProps: {
        span: 6,
        style: 'margin-left: 32px',
      },
    },
    {
      field: 'noticeType',
      component: 'Input',
      label: '',
      labelWidth: 0,
      ifShow: ({ values }) => {
        return values.remindNoExecute == '1';
      },
      slot: 'noticeType',
      colProps: {
        span: 2,
        style: 'margin-left: -63px',
      },
    },
    {
      field: 'divider-basic1',
      component: 'Divider',
      label: '检查项',
    },
    {
      field: 'add1',
      component: 'Input',
      label: '',
      colProps: {
        span: 5,
      },
      slot: 'add',
      ifShow: ({ values }) => {
        if (values.planType != '1') {
          return true;
        } else {
          return false;
        }
      },
    },
    {
      field: 'table1',
      component: 'Input',
      label: '',
      //   colProps: {
      //     span: 5,
      //   },
      slot: 'table1',
      ifShow: ({ values }) => {
        if (values.planType == '1') {
          return true;
        } else {
          return false;
        }
      },
    },
    {
      field: 'table2',
      component: 'Input',
      label: '',
      //   colProps: {
      //     span: 5,
      //   },
      slot: 'table2',
      ifShow: ({ values }) => {
        if (values.planType != '1') {
          return true;
        } else {
          return false;
        }
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
function changeWorkshopManager(record) {
  if (!record.workshopManager && record.checkResult == '2') {
    record.errorFlag4 = true;
  } else {
    record.errorFlag4 = false;
  }
}
// 保存
async function onSave() {
  setModalProps({ confirmLoading: true });
  saveItemBatch(dataSource.value)
    .then(() => {
      closeModal();
      emit('success');
    })
    .finally(() =>
      setTimeout(() => {
        setModalProps({ confirmLoading: false });
      }, 100)
    );
}
async function handleSubmit() {
  setModalProps({ confirmLoading: true });
  // 检查项不可为空
  if (dataSource.value.length == 0) {
    createMessage.error('检查项不可为空');
    return false;
  }
  for (let item of dataSource.value) {
    if (item.checkResult == '' || item.checkResult == undefined) {
      item.errorFlag1 = true;
    } else {
      item.errorFlag1 = false;
    }
    if (item.checkResult && item.checkResult == '2') {
      //  问题描述=检查结果选择不合格时必填
      if (!item.problemDescription) {
        item.errorFlag2 = true;
      } else {
        item.errorFlag2 = false;
      }
      // 车间负责人=检查结果选择不合格时必填
      if (flowType.value == '2') {
        if (!item.workshopManager) {
          item.errorFlag4 = true;
        } else {
          item.errorFlag4 = false;
        }
      }
    }
    if (item.pictureFlag == '1') {
      if (!item.checkPicture) {
        item.errorFlag3 = true;
      } else {
        item.errorFlag3 = false;
      }
    }
    if (item.errorFlag1 || item.errorFlag2 || item.errorFlag3 || item.errorFlag4) {
      return false;
    }
  }
  console.log('dataSource', dataSource.value);
  await taskSubmit(dataSource.value);

  console.log('dataSource taskSubmit', dataSource.value);
  closeModal();
  emit('success');
  setModalProps({ confirmLoading: false });
}
// 注册弹窗
// 这个方法执行需要openModal传入第二个参数
const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
  console.log('useModalInner data', data);
  // 下次点击弹窗的时候清空表单
  await resetFields();
  dataSource.value = [];
  setModalProps({ confirmLoading: false, showCancelBtn: !!data?.showFooter, showOkBtn: !!data?.showFooter });
  isUpdate.value = !!data?.isUpdate;
  showFooter.value = !!data?.showFooter;
  editType.value = data.editType;
  modalTitle.value = data.title;
  // if (data.editType) {
  //   modalTitle.value = unref(isUpdate) && data.editType === '1' ? '复用' : '编辑';
  // }
  if (unref(isUpdate)) {
    // 计划清单-编辑
    planType.value = data.record.planType;
    if (data.record.org) {
      departOptions.value = [];
      let params: any = {};
      params.orgCode = data.record.org;
      params.pageSize = 9999;
      params.pageNo = 1;
      await getDepartmentList(params).then((res) => {
        departOptions.value = res.map((item) => {
          return {
            label: item.departName,
            value: item.orgCode,
          };
        });
      });
      await getPersonList(data.record.org);
    }
    updateSchema({
      field: 'depart',
      componentProps: {
        options: departOptions.value,
        placeholder: '请选择',
      },
    });
    // 根据id获取详情
    let res = await getDetail({ id: data.record.id });
    if (res.remindNoExecute == '1') {
      res.remindMessage = true;
    } else {
      res.remindMessage = false;
    }
    if (res.itemList.length > 0) {
      res.itemList.map((item) => {
        if (!item.checkResult) {
          item.checkResult = '1';
        }
      });
    }
    dataSource.value = res.itemList;
    detailsData.value = res;
    //表单赋值
    await setFieldsValue({
      ...data.record,
    });
    // 隐藏底部时禁用整个表单
    setProps({ disabled: true });
  } else {
    updateSchema({
      field: 'depart',
      componentProps: {
        options: departOptions.value,
        placeholder: '请选择',
      },
    });
  }
  // 隐藏底部时禁用整个表单
  setProps({ disabled: true });
});

function handleUniqueCode(record) {
  console.log('handleUniqueCode record', record);
}
function changeCheckResult(record) {
  record.errorFlag2 = false;
  record.errorFlag4 = false;
  if (record.checkResult == '' || record.checkResult == undefined) {
    record.errorFlag1 = true;
  } else {
    record.errorFlag1 = false;
  }
}
function changeProblemDescription(record) {
  if (record.checkResult == '2') {
    if (!record.problemDescription) {
      record.errorFlag2 = true;
    } else {
      record.errorFlag2 = false;
    }
  }
}
function changeCheckPicture(record) {
  if (record.pictureFlag == '1') {
    if (record.checkPicture.length == 0) {
      record.errorFlag3 = true;
    } else {
      record.errorFlag3 = false;
    }
  }
}

function handleCancel() {
  closeModal();
  emit('success');
}
const handleRiskId = (record) => {
  // 根据风险ID获取风险信息
  getRiskInfoById({ uniqueCode: record.riskId }).then((res) => {
    console.log('res', res);
    if (res.records.length > 0) {
      RiskInfoProps.openModal(true, { activeKey: res.records[0].dataType, data: res.records[0] });
    } else {
      createConfirm({
        title: '提示',
        content: '未查询到风险信息',
      });
    }
  });
};
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
.info-content {
  display: flex;
  margin-top: 20px;
  margin-left: 20px;
  .item {
    // width: 50%;
    display: flex;
    margin-bottom: 15px;
    margin-right: 20px;
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
      color: rgba(0, 0, 0, 1);
    }
  }
}
</style>
  