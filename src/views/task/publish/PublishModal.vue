<template>
  <div>
    <BasicModal v-bind="$attrs" @register="registerModal" @cancel="handleClose" :title="getTitle" @ok="onSubmit" width="700px">
      <BasicForm @register="registerForm">
        <template #qlid="{ field }">
          <span style="padding-left: 10px">{{ field.slice(2) }}、</span>
        </template>
        <template #add="{ field, model }">
          <a-button
            :disabled="getTitle === '查看'"
            type="button"
            v-if="Number(field.slice(1)) === 1"
            @click="add(field, model)"
            style="cursor: pointer"
            >+</a-button
          >
          <a-button :disabled="getTitle === '查看'" type="button" v-if="field.slice(1) > 1" @click="del(field.slice(1))" style="cursor: pointer"
            >-</a-button
          >
        </template>
        <template #reportTime="{ model, field }">
          <span>第 </span>
          <a-select v-model:value="model[field]" style="width: 100px">
            <a-select-option v-for="d in quarterOptions" :key="d.value" :value="d.value">{{ d.label }}</a-select-option>
          </a-select>
          <span> 个月 </span>
        </template>
        <template #reportQuarterTime1="{ model, field }">
          <a-select v-model:value="model[field]">
            <a-select-option v-for="d in monthOptions" :key="d.value" :value="d.value">{{ d.label }}</a-select-option>
          </a-select>
        </template>
        <template #blank>
          <span style="padding-right: 35px" v-if="false"></span>
        </template>
        <template #workRequire>
          <a-form ref="modalFormRef" name="dynamic_form_nest_item" :model="modalFormState">
            <a-row style="width: 655px; margin-left: 60px" v-for="(item, index) in modalFormState.jobList" :key="index">
              <a-col :span="10">
                <a-form-item
                  required
                  label="工作要求："
                  :labelCol="labelCol"
                  :wrapperCol="wrapperCol"
                  :name="['jobList', index, 'jobRequirement']"
                  :rules="[
                    { required: true, message: '请输入工作要求!' },
                    { min: 0, max: 300, message: '长度不能超过 300 个字符', trigger: 'blur' },
                  ]"
                >
                  <a-textarea v-model:value="item.jobRequirement" :autosize="{ minRows: 1, maxRows: 1 }" placeholder="请输入" />
                </a-form-item>
              </a-col>
              <a-col :span="10">
                <a-form-item
                  :name="['jobList', index, 'departPersonNames']"
                  :rules="[{ required: true, message: '请选择责任单位!' , trigger: 'blur'}]"
                  required
                  label="责任单位："
                  :labelCol="labelCol"
                  :wrapperCol="wrapperCol"
                >
                  <a-textarea
                    v-model:value="item.departPersonNames"
                    placeholder="请选择"
                    :autosize="{ minRows: 1, maxRows: 1 }"
                    :allowClear="false"
                    @click="openModal(true, { index, jobList: modalFormState.jobList })"
                  
                  />
                </a-form-item>
              </a-col>
              <a-col :span="1">
                <a-button style="margin-left: 5px; cursor: pointer" type="button" v-if="index + 1 === 1" @click="addWorkRequire()">+</a-button>
                <a-button style="margin-left: 5px; cursor: pointer" type="button" v-if="index + 1 != 1" @click="delWorkRequire(index)">-</a-button>
              </a-col>
            </a-row>
          </a-form>
        </template>
        <template #attachment="{ model, field }">
          <span class="attachment-btn" @click="handlePreview(model['attachment'])">{{ model[field] }}</span>
        </template>
        <template #table>
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
            <template #checkStatus="{ record }">
              <span v-if="record.checkStatus">{{ record.checkStatus }}</span>
              <span v-else>--</span>
            </template>
            <template #action="{ record }">
              <a-button :disabled="!record.id" type="link" @click="showWorkRequire(record)">查看</a-button>
            </template>
          </a-table>
        </template>
        <template #status="{ model, field }">
          <JDictSelectTag
            style="width: 100px; margin-right: 10px"
            v-model:value="model[field]"
            placeholder="请选择"
            dictCode="jn_publish_status"
            disabled
          />
          <span style="color: #1890ff">完成进度：{{ model['rate'] || 0 }}%</span>
        </template>
      </BasicForm>
    </BasicModal>
    <DepartUserModal @register="registerUserModal" @success="handleUser" />
    <UserSelectModal @register="registerCheckUserModal" @success="handleCheckUser" />
    <WorkRequireModal @register="registerWorkModal" />
  </div>
</template>
  
  <script lang="ts" setup>
import { ref, unref, reactive, computed } from 'vue';
import type { Ref } from 'vue';
import { BasicModal, useModalInner, useModal } from '/@/components/Modal';
import { BasicForm, useForm } from '/@/components/Form/index';
import DepartUserModal from './DepartUserModal.vue';
import UserSelectModal from './UserSelectModal.vue';
import WorkRequireModal from './WorkRequireModal.vue';
import { publish, getDetail } from './publish.api';
import { classOptions, dayOptions, weekOptions, monthOptions, quarterOptions } from './time.data';
import { defHttp } from '/@/utils/http/axios';
import { message, Upload, FormInstance } from 'ant-design-vue';
import { formatToDate } from '/@/utils/dateUtil';
import { previewFile } from '/@/api/common/api';
import JDictSelectTag from '/@/components/Form/src/jeecg/components/JDictSelectTag.vue';
import { useUserStore } from '/@/store/modules/user';

// import { useMessage } from '/@/hooks/web/useMessage';
// const { createMessage } = useMessage();
const [registerUserModal, { openModal }] = useModal();
const [registerCheckUserModal, { openModal: openCheckModal }] = useModal();
const [registerWorkModal, { openModal: openWorkModal }] = useModal();
const emit = defineEmits(['success', 'register']);

const isUpdate = ref<Boolean>(true);
// const getTitle = computed(() => (!unref(isUpdate) ? '新增' : '编辑'));
const getTitle = ref('查看');
const roleId = ref('');
const curRecord: any = ref({});
const selectRoleUser: any = ref({});
const curClearObj: any = ref({});
const entryOptions: Ref<any> = ref([]);
const dataSource = ref([]);
const labelCol = ref<any>({ xs: { span: 24 }, sm: { span: 7 } });
const wrapperCol = ref<any>({ xs: { span: 24 }, sm: { span: 15 } });
const modalFormRef = ref<FormInstance>();
interface WorkRequire {
  jobRequirement: string;
  dutyOrg: string;
  dutyOrgName: string;
  dutyPerson: string;
  dutyPersonName: string;
  departPersonNames: string;
  selectValuesData: any[];
}
const modalFormState = reactive<{ jobList: WorkRequire[] }>({
  jobList: [{ jobRequirement: '', dutyOrg: '', dutyOrgName: '', dutyPerson: '', dutyPersonName: '', departPersonNames: '', selectValuesData: [] }],
});
const buttonType = ref('0');
const checkPeople: Ref<string | null> = ref('');
const columns: any = [
  { title: '工作要求', width: 100, align: 'center', dataIndex: 'jobRequirement' },
  { title: '责任单位', width: 80, align: 'center', dataIndex: 'dutyUnitName' },
  { title: '完成说明', width: 150, align: 'center', dataIndex: 'finishExplain', ellipsis: true },
  { title: '验收状态', width: 80, align: 'center', dataIndex: 'checkStatus', slots: { customRender: 'checkStatus' } },
  { title: '操作', width: 50, align: 'center', dataIndex: 'action', slots: { customRender: 'action' } },
];
const publishOrgName = ref('');
// 用户信息
const userStore: any = useUserStore();
const userInfo = computed(() => userStore.getUserInfo);
checkPeople.value = userInfo.value.id;
function handleDepartPerson(index, val) {
  console.log('handleDepartPerson', index, val);
  if (!val) {
    modalFormState.jobList[index].dutyOrg = '';
    modalFormState.jobList[index].dutyOrgName = '';
    modalFormState.jobList[index].dutyPerson = '';
    modalFormState.jobList[index].dutyPersonName = '';
    modalFormState.jobList[index].departPersonNames = '';
    modalFormState.jobList[index].selectValuesData = [];
  }
}
async function getEntryOptions() {
  let params: any = {};
  params.pageSize = 9999;
  params.pageNo = 1;
  await defHttp.get({ url: '/jnClearEntry/list', params }).then((res) => {
    res.records.map((item: any) => {
      entryOptions.value.push({
        label: item.entryName,
        value: item.id,
        clearType: item.clearType,
        method: item.method,
      });
    });
  });
}
getEntryOptions();
const schemas: any = [
  {
    field: 'divider-basic',
    component: 'Divider',
    label: '基本信息',
  },
  {
    label: '任务状态',
    field: 'status',
    component: 'JDictSelectTag',
    ifShow: () => {
      return buttonType.value === '3';
    },
    slot: 'status',
  },
  {
    label: '任务进度',
    field: 'rate',
    component: 'JDictSelectTag',
    ifShow: () => {
      return false;
    },
    slot: 'rate',
  },
  {
    label: '任务分类',
    field: 'taskType',
    component: 'JDictSelectTag',
    required: true,
    componentProps: {
      dictCode: 'jn_publish_task_type',
      placeholder: '请选择',
      stringToNumber: false,
      showChooseOption: false,
    },
  },
  {
    label: '是否是其他单位',
    field: 'publishOrgType',
    component: 'RadioGroup',
    defaultValue: '1',
    componentProps: ({ formActionType, formModel }) => {
      return {
        options: [
          { label: '否', value: '1' },
          { label: '是', value: '2' },
        ],
        placeholder: '请选择',
        onChange: (e) => {
          formModel.publishOrgName = '';

          // const { updateSchema } = formActionType;
          // updateSchema([{
          //   field: 'publishOrgName',
          //   componentProps:{
          //     disabled: e.target.value === '0' ? true : false
          //   }
          // },])
        },
      };
    },
    colProps: { span: 24 },
  },
  {
    label: '发布单位',
    field: 'publishOrg',
    required: true,
    component: 'ETreeSelectOrg1',
    ifShow: ({ values }) => {
      return values.publishOrgType !== '2';
    },
    componentProps: ({ formActionType, formModel }) => {
      return {
        sync: false,
        checkStrictly: true,
        defaultExpandLevel: 2,
        placeholder: '请选择',
        checkable: false,
        onChange: (value, label, extra) => {
         console.log('onChange', value, label, extra);
          //所属部门修改后更新负责部门下拉框数据
          publishOrgName.value = label[0];
        },
      };
    },
  },
  {
    label: '发布单位',
    field: 'publishOrgName',
    component: 'Input',
    ifShow: ({ values }) => {
      return values.publishOrgType === '2';
    },
    rules: [
      { required: true, message: '请输入发布单位！' },
      { min: 0, max: 50, message: '长度不能超过 50 个字符', trigger: 'blur' },
    ],
  },
  {
    label: '发布时间',
    field: 'publishTime',
    required: true,
    component: 'DatePicker',
    defaultValue: new Date(),
    componentProps: ({ formModel }) => {
      return {
        showTime: false,
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
          return currentTimestamp < todayTimestamp;
        },
        onChange: (e) => {
          console.log('publishTime', e);
          formModel.reportDailyTime = null;
        },
      };
    },
  },
  {
    field: 'workContent',
    label: '工作任务',
    component: 'InputTextArea',
    required: true,
    componentProps: {
      showCount: true,
      maxlength: 500,
      // rows: 5,
      autosize: {
        minRows: 5,
        maxRows: 5,
      },
      suffix: '/500',
    },
  },
  {
    label: '完成时限',
    field: 'completeTimeLimit',
    required: true,
    component: 'DatePicker',
    defaultValue: new Date(`${new Date().getFullYear()}-12-31`),
    componentProps: ({ formModel }) => {
      return {
        valueFormat: 'YYYY-MM-DD',
        style: {
          width: '100%',
        },
        onChange: (e) => {
          console.log('completeTimeLimit', e);
          // 判断formModel是否有reportDailyTime属性
          if (formModel.reportDailyTime) {
            formModel.reportDailyTime = null;
          }
        },
        disabledDate: (current) => {
          const today = new Date(formatToDate(new Date()));
          // 将当前日期转换为时间戳
          const todayTimestamp = today.getTime();
          // 将当前日期之前的日期转换为时间戳
          // const currentTimestamp = current.valueOf();
          const currentTimestamp = new Date(formatToDate(new Date(current.valueOf()))).getTime();
          // 判断当前日期是否在当前日期之前
          return currentTimestamp < todayTimestamp;
        },
      };
    },
  },
  {
    field: 'attachment1',
    label: '附件',
    component: 'JUpload',
    slot: 'attachment',
    ifShow: ({ values }) => {
      return buttonType.value == '3' && values.attachment;
    },
  },
  {
    field: 'attachment',
    label: '附件',
    component: 'JUpload',
    ifShow: ({ values }) => {
      return buttonType.value !== '3';
    },
    componentProps: {
      // maxCount: 1,
      beforeUpload: (file: File) => {
        const isLt300M = file.size / 1024 / 1024 < 300;
        if (!isLt300M) {
          message.error('文件过大，请不要超过300M！');
          return false || Upload.LIST_IGNORE;
        }
        return true;
      },
    },
  },
  {
    field: 'divider-basic2',
    component: 'Divider',
    label: '工作要求',
  },

  {
    field: 'workRequire',
    component: 'Input',
    label: '',
    slot: 'workRequire',
    ifShow: ({ values }) => {
      return buttonType.value !== '3';
    },
  },
  {
    field: 'table',
    label: '',
    component: 'Input',
    slot: 'table',
    ifShow: ({ values }) => {
      return buttonType.value === '3';
    },
  },
  {
    field: 'divider-basicf2',
    component: 'Divider',
    label: '任务验收',
  },
  {
    label: '是否需要验收',
    field: 'checkFlag',
    component: 'RadioGroup',
    defaultValue: '0',
    componentProps: () => {
      return {
        options: [
          { label: '是', value: '0' },
          { label: '否', value: '1' },
        ],
        placeholder: '请选择',
        onChange: (e) => {
          if (e.target.value == '1') {
            checkPeople.value = null;
            setFieldsValue({
              checkPeopleName: '',
            });
          }
        },
      };
    },
    colProps: { span: 24 },
  },
  {
    label: '验收人',
    field: 'checkPeopleName',
    required: true,
    component: 'Select',
    // 默认值是当前登录人
    defaultValue: userInfo.value.realname,
    ifShow: ({ values }) => {
      return values.checkFlag === '0';
    },
    componentProps: () => {
      return {
        placeholder: '请选择',
        readOnly: true,
        onClick: (e: any) => {
          console.log('click--', e);
          let selectValues = null;
          const { executor, executorName, executorType } = curRecord.value;
          if (executor) {
            const ids = executor.split(',');
            const names = executorName.split(',');
            selectValues = ids.map((v, i) => {
              return {
                value: v,
                name: names[i],
              };
            });
          }
          openCheckModal(true, {});
        },
      };
    },
  },
  {
    field: 'divider-basic4',
    component: 'Divider',
    label: '汇报要求',
  },
  {
    label: '汇报要求',
    field: 'reportRequire',
    component: 'RadioGroup',
    defaultValue: '1',
    componentProps: ({ formActionType, formModel }) => {
      return {
        options: [
          { label: '长期', value: '1' },
          { label: '日常', value: '2' },
        ],
        placeholder: '请选择',
        onChange: (e) => {
          //   const { updateSchema } = formActionType;
          formModel.reportDailyTime = null;
          if (e.target.value === '2') {
            removeSchemaByFiled(['reportTime']);
          } else {
            appendSchemaByField(
              {
                field: 'reportTime',
                label: '汇报时间',
                component: 'Select',
                required: true,
                componentProps: ({ formModel }) => {
                  switch (formModel.reportWay) {
                    case '1':
                      return {
                        options: classOptions,
                        placeholder: '请选择',
                      };
                    case '2':
                      return {
                        options: dayOptions,
                        placeholder: '请选择',
                      };
                    case '3':
                      return {
                        options: weekOptions,
                        placeholder: '请选择',
                      };
                    case '4':
                      return {
                        options: monthOptions,
                        placeholder: '请选择',
                      };
                    default:
                      return {
                        options: dayOptions,
                        placeholder: '请选择',
                      };
                  }
                },
              },
              'reportWay'
            );
          }
          //   updateSchema([{
          //     field: 'securityAgencyName',
          //     componentProps:{
          //       disabled: e.target.value === '0' ? true : false
          //     }
          //   }, {
          //     field: 'securityAgencyFzr',
          //     componentProps:{
          //       disabled: e.target.value === '0' ? true : false
          //     }
          //   }])
        },
      };
    },
    colProps: { span: 24 },
  },
  {
    label: '汇报方式',
    field: 'reportWay',
    component: 'JDictSelectTag',
    required: true,
    ifShow: ({ values }) => {
      return values.reportRequire === '1';
    },
    componentProps: () => {
      return {
        dictCode: 'jn_publish_report_way',
        placeholder: '请选择',
        stringToNumber: false,
        onChange: (e) => {
          console.log('reportWay', e);
          //   const { updateSchema } = formActionType;

          if (e == '5') {
            removeSchemaByFiled(['reportTime']);
            appendSchemaByField(
              {
                field: 'blank',
                component: 'Input',
                label: '',
                colProps: {
                  span: 3,
                },
                slot: 'blank',
              },
              'reportWay'
            );

            appendSchemaByField(
              {
                field: 'reportQuarterTime',
                label: '汇报时间',
                component: 'Input',
                colProps: {
                  span: 10,
                },
                required: true,
                slot: 'reportTime',
              },
              'blank'
            );
            appendSchemaByField(
              {
                field: 'reportQuarterTime1',
                label: '',
                component: 'Input',
                required: true,
                colProps: {
                  span: 4,
                },
                slot: 'reportQuarterTime1',
              },
              'reportQuarterTime'
            );
          } else {
            removeSchemaByFiled(['reportTime', 'blank', 'reportQuarterTime', 'reportQuarterTime1']);
            appendSchemaByField(
              {
                field: 'reportTime',
                label: '汇报时间',
                component: 'Select',
                required: true,
                componentProps: ({ formModel }) => {
                  switch (formModel.reportWay) {
                    case '1':
                      return {
                        options: classOptions,
                        placeholder: '请选择',
                      };
                    case '2':
                      return {
                        options: dayOptions,
                        placeholder: '请选择',
                      };
                    case '3':
                      return {
                        options: weekOptions,
                        placeholder: '请选择',
                      };
                    case '4':
                      return {
                        options: monthOptions,
                        placeholder: '请选择',
                      };
                    default:
                      return {
                        options: dayOptions,
                        placeholder: '请选择',
                      };
                  }
                },
              },
              'reportWay'
            );
          }
        },
      };
    },
  },
  {
    field: 'reportTime',
    component: 'Select',
    label: '汇报时间',
    required: true,
    ifShow: ({ values }) => {
      return values.reportRequire === '1';
    },
    componentProps: ({ formModel }) => {
      switch (formModel.reportWay) {
        case '1':
          return {
            options: classOptions,
            placeholder: '请选择',
          };
        case '2':
          return {
            options: dayOptions,
            placeholder: '请选择',
          };
        case '3':
          return {
            options: weekOptions,
            placeholder: '请选择',
          };
        case '4':
          return {
            options: monthOptions,
            placeholder: '请选择',
          };
        default:
          return {
            options: dayOptions,
            placeholder: '请选择',
          };
      }
    },
  },
  {
    field: 'reportDailyTime',
    label: '汇报时间',
    required: true,
    component: 'DatePicker',
    ifShow: ({ values }) => {
      return values.reportRequire === '2';
    },
    componentProps: ({ formModel }) => {
      return {
        valueFormat: 'YYYY-MM-DD',
        style: {
          width: '100%',
        },
        disabledDate: (current) => {
          console.log('current', current, current.valueOf());
          // const today = new Date();
          // 将当前日期转换为时间戳
          const todayTimestamp = new Date(formatToDate(formModel.publishTime)).getTime();
          // 完成时限
          const completeTimeLimit = new Date(formatToDate(formModel.completeTimeLimit)).getTime();
          // 将当前日期之前的日期转换为时间戳
          const currentTimestamp = new Date(formatToDate(current)).getTime();
          const endTime = currentTimestamp > completeTimeLimit;
          // 判断当前日期是否在当前日期之前
          return currentTimestamp < todayTimestamp || endTime;
        },
      };
    },
  },
];
// 工作要求表单重置
function resetWorkRequireForm() {
  modalFormRef.value?.resetFields();
  modalFormState.jobList = [
    { jobRequirement: '', dutyOrg: '', dutyOrgName: '', dutyPerson: '', dutyPersonName: '', departPersonNames: '', selectValuesData: [] },
  ];
}
//关闭方法
function handleClose() {
  closeModal();
  resetWorkRequireForm();
}
// 注册表单
const [registerForm, { validate, setFieldsValue, resetFields, setProps, appendSchemaByField, removeSchemaByFiled, updateSchema, resetSchema }] =
  useForm({
    schemas: schemas,
    showActionButtonGroup: false,
    labelCol: {
      xs: { span: 24 },
      sm: { span: 6 },
    },
    wrapperCol: {
      xs: { span: 24 },
      sm: { span: 17 },
    },
  });
function addWorkRequire() {
  modalFormState.jobList.push({
    jobRequirement: '',
    dutyOrg: '',
    dutyOrgName: '',
    dutyPerson: '',
    dutyPersonName: '',
    departPersonNames: '',
    selectValuesData: [],
  });
}
function delWorkRequire(index) {
  modalFormState.jobList.splice(index, 1);
}
// 查看工作要求
function showWorkRequire(record) {
  console.log('record', record);
  openWorkModal(true, {
    record,
  });
}
// 选择部门或人回调
function handleUser(val: any) {
  console.log('选择部门或人回调 handleUser', val);
  let personArr = [];
  personArr = val.selectValuesData.filter((item) => item.type === 'user');
  let personName = [];
  let personId = [];
  if (personArr.length > 0) {
    personArr.map((item) => {
      personId.push(item.value);
      personName.push(item.name);
    });
  }
  let departArr = [];
  departArr = val.selectValuesData.filter((item) => item.type != 'user');
  let departName = [];
  let departId = [];
  if (departArr.length > 0) {
    departArr.map((item) => {
      departId.push(item.value);
      departName.push(item.name);
    });
  }
  modalFormState.jobList[val.index].dutyPerson = personId.join(',');
  modalFormState.jobList[val.index].dutyPersonName = personName.join(',');
  modalFormState.jobList[val.index].dutyOrg = departId.join(',');
  modalFormState.jobList[val.index].dutyOrgName = departName.join(',');
  modalFormState.jobList[val.index].selectValuesData = val.selectValuesData;
  // 强制更新departPersonNames
  if(departName.length>0&&personName.length>0){
    modalFormState.jobList[val.index].departPersonNames = `${departName.join(',')},${personName.join(',')}`;
  }
  if(departName.length>0&&personName.length==0){
    modalFormState.jobList[val.index].departPersonNames = `${departName.join(',')}`;
  }
  if(departName.length==0&&personName.length>0){
    modalFormState.jobList[val.index].departPersonNames = `${personName.join(',')}`;
  }
  // modalFormState.jobList[val.index].departPersonNames = `${departName.join(',')},${personName.join(',')}`;
  Object.assign(modalFormState, {
    jobList: modalFormState.jobList,
    });

  // modalFormState.jobList[val.index].dutyOrg = val.dutyOrg;
  // modalFormState.jobList[val.index].dutyOrgName = val.dutyOrgName;
  // modalFormState.jobList[val.index].dutyPerson = val.dutyPerson;
  // modalFormState.jobList[val.index].dutyPersonName = val.dutyPersonName;
  // modalFormState.jobList[val.index].selectValuesData = val.selectValuesData;
  // if (val.dutyOrgName && val.dutyPersonName) {
  //   modalFormState.jobList[val.index].departPersonNames = `${val.dutyOrgName},${val.dutyPersonName}`;
  // } else if (val.dutyOrgName && !val.dutyPersonName) {
  //   modalFormState.jobList[val.index].departPersonNames = `${val.dutyOrgName}`;
  // } else if (!val.dutyOrgName && val.dutyPersonName) {
  //   modalFormState.jobList[val.index].departPersonNames = `${val.dutyPersonName}`;
  // }
}
// 选择验收人
function handleCheckUser(val: any) {
  console.log('handleCheckUser', val);
  checkPeople.value = val.checkPeople;
  setFieldsValue({
    checkPeopleName: val.checkPeopleName,
  });
}
// 预览
function handlePreview(filePath) {
  if (filePath) {
    previewFile(filePath).then((res) => {
      window.open(res, '_blank');
    });
  }
}
// 整个提交
async function onSubmit(e: MouseEvent) {
  e?.stopPropagation();
  e?.preventDefault();

  const values = await validate();
  console.log('validate value', values);

  modalFormRef.value?.validateFields().then(async () => {
    console.log('validate success');
    let params = Object.assign({}, values);

    params.jobList = modalFormState.jobList;
    if (values.publishOrg) {
      params.publishOrgName = publishOrgName.value;
    }
    if (values.reportWay === '5') {
      params.reportTime = `第${values.reportQuarterTime}个月${values.reportQuarterTime1}`;
      delete params.reportQuarterTime;
      delete params.reportQuarterTime1;
    }
    params.completeTimeLimit = formatToDate(values.completeTimeLimit);
    console.log('onSubmit value', params);
    delete params.workRequire;
    params.checkPeople = checkPeople.value;
    if (params.reportDailyTime) {
      params.reportTime = params.reportDailyTime;
      delete params.reportDailyTime;
    }
    if (unref(isUpdate)) {
      params.id = roleId.value;
    }
    console.log('params', params);
    setModalProps({ confirmLoading: true });
    await publish(params);
    closeModal();
    resetWorkRequireForm();
    emit('success');
  });
}
// 这个方法执行需要openModal传入第二个参数
const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
  console.log('useModalInner data', data);
  buttonType.value = data.type;
  if (data.type === '2') {
    getTitle.value = '申请变更';
  } else if (data.type === '1') {
    getTitle.value = '编辑';
  } else if (data.type === '0') {
    getTitle.value = '任务发布';
  } else {
    getTitle.value = '查看';
  }
  // 下次点击弹窗的时候清空表单
  selectRoleUser.value = {};
  curClearObj.value = {};

  await resetSchema(schemas);
  await resetFields();
  setModalProps({ confirmLoading: false, showCancelBtn: !!data?.showFooter, showOkBtn: !!data?.showFooter });
  isUpdate.value = !!data?.isUpdate;
  if (unref(isUpdate)) {
    const record = await getDetail({ id: data.record.id });
    if (record.reportRequire == '2') {
      record.reportDailyTime = record.reportTime;
    }
    // record.publishOrg = record.publishOrg.join('~')
    record.attachment1 = record.attachment;
    curRecord.value = record;

    console.log('data.record', record);
    // 查看按钮
    if (data.type === '3') {
      dataSource.value = [];
      // dataSource.value = data.record.jnClearRecordSubs || []
      record.jobList.map((item: any) => {
        item.recordList.map((item1: any) => {
          item1.jobRequirement = item.jobRequirement;
        });
      });
      console.log('record.jobList', record.jobList);
      record.jobList.forEach((item: any) => {
        dataSource.value = dataSource.value.concat(item.recordList);
      });
      // if (record.publishOrg) {
      //   record.publishOrg = `${record.publishOrg}~|~${record.publishOrgName}`;
      // }
      if (record.attachment1) {
        let attachment = record.attachment1.split('/');
        record.attachment1 = attachment[attachment.length - 1];
        console.log('record.attachment1', record.attachment1);
      }
    }
    //表单赋值
    await setFieldsValue({
      ...record,
    });
  }
  // 隐藏底部时禁用整个表单
  setProps({ disabled: !data?.showFooter });
});
</script>
  
  <style lang="less" scoped>
/deep/.ant-input-suffix {
  color: #999;
}
.attachment-btn {
  color: #1890ff;
  cursor: pointer;
}
</style>
  