<template>
  <div>
    <BasicModal v-bind="$attrs" @register="registerModal" @cancel="handleClose" :title="getTitle" @ok="onSubmit" width="800px">
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
        <template #blank>
          <span style="padding-right: 35px" v-if="false"></span>
        </template>
        <template #table>
          <div class="params-info">
            <div style="margin-bottom: 15px">
              <span>是否为点表：</span>
              <a-switch :disabled="getTitle === '查看'" checked-children="是" un-checked-children="否" v-model:checked="isPoint" />
            </div>
            <table>
              <tr>
                <th>名称</th>
                <th>值</th>
                <th>操作</th>
              </tr>
              <template v-for="data in dataSource">
                <tr>
                  <td>
                    <a-input
                      v-model:value="data.paramKey"
                      :disabled="['channel_topic', 'device_name'].includes(data.paramKey) || getTitle === '查看'"
                    ></a-input>
                  </td>
                  <td>
                    <a-input v-model:value="data.value" :disabled="getTitle === '查看'"></a-input>
                  </td>
                  <td>
                    <a-button
                      @click="deleteItem(data)"
                      type="link"
                      :disabled="['channel_topic', 'device_name'].includes(data.paramKey) || getTitle === '查看'"
                    >
                      删除
                    </a-button>
                  </td>
                </tr>
              </template>
            </table>
            <a-button style="width: 140%" @click="addItem" :disabled="getTitle === '查看'"><a-icon type="plus" /></a-button>
          </div>
        </template>
      </BasicForm>
    </BasicModal>
    <DeviceModal @register="registerDeviceModal" @select="selectDeviceOk" />
  </div>
</template>
    
    <script lang="ts" setup>
import { ref, unref, reactive } from 'vue';
import { BasicModal, useModalInner, useModal } from '/@/components/Modal';
import { BasicForm, useForm } from '/@/components/Form/index';
import { saveEdit, getDetail } from './attribute.api';
import { defHttp } from '/@/utils/http/axios';
import { message, Upload, FormInstance } from 'ant-design-vue';
import { formatToDate, formatToDateTime } from '/@/utils/dateUtil';
import { duplicateCheck } from '/@/views/system/user/user.api';
import { previewFile } from '/@/api/common/api';
import JDictSelectTag from '/@/components/Form/src/jeecg/components/JDictSelectTag.vue';
import DeviceModal from './DeviceModal.vue';

// import { useMessage } from '/@/hooks/web/useMessage';
// const { createMessage } = useMessage();
const emit = defineEmits(['success', 'register']);
const [registerDeviceModal, { openModal: openDeviceModal }] = useModal();
const isUpdate = ref<Boolean>(true);
// const getTitle = computed(() => (!unref(isUpdate) ? '新增' : '编辑'));
const getTitle = ref('查看');
const roleId = ref('');
const curRecord: any = ref({});
const selectRoleUser: any = ref({});
const curClearObj: any = ref({});
const postOptions = ref([]);
const dataSource = ref([]);
const communicationObj = ref({});
const isPoint = ref(true);
const attributeId = ref(undefined);
const deviceId = ref(null);
const deviceAddVOList = ref([]);
async function getPostOptions() {
  let params: any = {};
  params.pageSize = 9999;
  params.pageNo = 1;
  await defHttp.get({ url: '/daqCommunication/selectCommunication', params }).then((res) => {
    if (res && res.length > 0) {
      res.map((item) => {
        item.value = item.id;
        item.label = item.name;
      });
      postOptions.value = res;
    }
  });
}

getPostOptions();
const schemas: any = [
  {
    field: 'divider-basic',
    component: 'Divider',
    label: '基本信息',
  },
  {
      label: '设备名称',
      field: 'deviceName',
      component: 'InputTextArea',
      componentProps: () => {
        return {
          rows: 1,
          placeholder: '请选择',
          readOnly: true,
          onClick: (e: any) => {
            console.log('click-- ', e);
            openDeviceModal(true, { deviceId: deviceId.value });
          },
        };
      },
    },
  {
    label: '通讯名称',
    field: 'communicationId',
    required: true,
    component: 'Select',
    componentProps: ({ formModel }) => {
      return {
        options: postOptions.value,
        placeholder: '请选择',
        onChange: (e: any) => {
          console.log('e-----', e);
          if (e) {
            dataSource.value = [
              {
                paramKey: 'channel_topic',
                value: '',
              },
              {
                paramKey: 'device_name',
                value: '',
              },
            ];
          }
          communicationObj.value = postOptions.value.find((item) => item.id === formModel.communicationId);
        },
      };
    },
  },
  {
    label: '属性名称',
    field: 'pointName',
    required: true,
    component: 'Input',
    dynamicRules: ({ model }) => {
      console.log('model', model);
      return [
        { required: true, message: '属性名称不能为空！' },
        { min: 0, max: 100, message: '请输入100字内的名称！', trigger: 'blur' },
        {
          validator: (_, value) => {
            if (value) {
              value = value.trim();
            }
            return new Promise((resolve, reject) => {
              let params = {
                tableName: 'daq_point',
                fieldName: 'point_name',
                fieldVal: value,
                dataId: attributeId.value,
              };
              duplicateCheck(params)
                .then((res) => {
                  res.success ? resolve() : reject(res.message || '校验失败');
                })
                .catch((err) => {
                  reject(err.message || '验证失败');
                });
            });
          },
        },
      ];
    },
  },
  {
    label: '属性TAG',
    field: 'pointTag',
    required: true,
    component: 'Input',
    dynamicRules: ({ model }) => {
      console.log('model', model);
      return [
        { required: true, message: '属性TAG不能为空！' },
        { min: 0, max: 100, message: '请输入100字内的名称！', trigger: 'blur' },
        {
          validator: (_, value) => {
            if (value) {
              value = value.trim();
            }
            return new Promise((resolve, reject) => {
              let params = {
                tableName: 'daq_point',
                fieldName: 'point_tag',
                fieldVal: value,
                dataId: attributeId.value,
              };
              duplicateCheck(params)
                .then((res) => {
                  res.success ? resolve() : reject(res.message || '校验失败');
                })
                .catch((err) => {
                  reject(err.message || '验证失败');
                });
            });
          },
        },
      ];
    },
  },
  {
    label: '属性类型',
    field: 'type',
    component: 'JDictSelectTag',
    required: true,
    componentProps: () => {
      return {
        dictCode: 'point_type',
        placeholder: '请选择',
        stringToNumber: false,
        showChooseOption: false,
      };
    },
  },
  {
    label: '单位',
    field: 'unit',
    component: 'JDictSelectTag',
    required: true,
    componentProps: () => {
      return {
        dictCode: 'point_unit',
        placeholder: '请选择',
        stringToNumber: false,
        showChooseOption: false,
      };
    },
  },
  {
    label: '访问类型',
    field: 'accessType',
    component: 'JDictSelectTag',
    required: true,
    componentProps: () => {
      return {
        dictCode: 'point_access_type',
        placeholder: '请选择',
        stringToNumber: false,
        showChooseOption: false,
      };
    },
  },
  {
    label: '点位展示类型',
    field: 'displayType',
    component: 'JDictSelectTag',
    required: true,
    componentProps: () => {
      return {
        dictCode: 'point_display_type',
        placeholder: '请选择',
        stringToNumber: false,
        showChooseOption: false,
      };
    },
  },
  {
    label: '权重',
    field: 'displayWeights',
    component: 'InputNumber',
    required: true,
    componentProps: {
      precision: 0,
      // max: 99,
      // min: 1,
      style: {
        width: '100%',
      },
    },
  },
  {
    label: '描述',
    field: 'remarks',
    required: true,
    component: 'Input',
    rules: [
      { required: true, message: '请输入描述！' },
      { min: 0, max: 500, message: '长度不能超过 500 个字符', trigger: 'blur' },
    ],
  },
  {
    label: '状态',
    field: 'enableFlag',
    component: 'Switch',
    componentProps: {
      // checked: false,
      checkedValue: '1',
      unCheckedValue: '0',
      checkedChildren: '启用',
      unCheckedChildren: '停用',
      onChange: (checked, event) => {},
    },
    dynamicDisabled: ({ values }) => {
      return getTitle.value === '查看';
    },
    defaultValue: '1',
  },
  {
    field: 'divider-basic2',
    component: 'Divider',
    label: '参数信息',
  },
  {
    field: 'table',
    label: '',
    component: 'Input',
    slot: 'table',
  },
];

//关闭方法
function handleClose() {
  resetFields();
  closeModal();
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
function addItem() {
  dataSource.value.push({ paramKey: '', value: undefined });
}
function deleteItem(data) {
  const index = dataSource.value.indexOf(data);
  dataSource.value.splice(index, 1);
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
  console.log('validate success');
  let attr = '';
  let params = Object.assign({}, values);
  //   params.fileUrl = values.map((item) => item.url).join('&jn-')
  dataSource.value.forEach((item) => {
    if (['port', 'security'].includes(item.paramKey) && !item.value) {
      attr = item.paramKey;
    }
  });
  if (attr) {
    message.warn(`${attr}不能为空`);
    return;
  }
  if (attributeId.value) {
    params.id = attributeId.value;
  }
  params.daqPointParamSaveDTOList = dataSource.value;
  params.isPoint = isPoint.value ? '1' : '0';
  params.deviceId = deviceId.value;
  delete params.table;
  console.log('params', params);
  setModalProps({ confirmLoading: true });
  await saveEdit(params);
  closeModal();
  emit('success');
}
// 这个方法执行需要openModal传入第二个参数
const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
  console.log('useModalInner data', data);
  if (!data?.showFooter) {
    getTitle.value = '查看';
  } else if (data?.isUpdate) {
    getTitle.value = '编辑';
  } else {
    getTitle.value = '新增';
  }

  await resetSchema(schemas);
  await resetFields();
  deviceId.value = null;
  setModalProps({ confirmLoading: false, showCancelBtn: !!data?.showFooter, showOkBtn: !!data?.showFooter });
  isUpdate.value = !!data?.isUpdate;
  attributeId.value = undefined;
  if (unref(isUpdate)) {
    // 获取详情
    let res = await getDetail({ id: data.record.id });
    attributeId.value = res.id;
    curRecord.value = res;
    dataSource.value = res.daqPointParamList;
    console.log('data.record res', data.record, res);
    data.record.enableFlag = data.record.enableFlag + '';
    data.record.isPoint = data.record.isPoint + '';
    deviceId.value = data.record.deviceId;
    // if (data.record.enableFlag=='1') {
    //   data.record.enableFlag = true;
    // }else{
    //   data.record.enableFlag = false;
    // }
    //表单赋值
    await setFieldsValue({
      ...data.record,
    });
  }
  // 隐藏底部时禁用整个表单
  setProps({ disabled: !data?.showFooter });
});
function selectDeviceOk(data) {
  console.log('selectDeviceOk', data);
  deviceAddVOList.value = [];
  setFieldsValue({
    deviceName: '',
  });
  if (data.length == 0) {
    return;
  }
  let deviceName = '';
  setFieldsValue({
    deviceName: data.length > 1 ? deviceName : data[0].name,
  });
  deviceId.value = data[0].id
}
</script>
    
<style lang="less" scoped>
:deep(.ant-input-suffix) {
  color: #999;
}
.params-info {
  padding-left: 114px;
  //   padding-right: 96px;
  margin-left: 40px;
  table {
    width: 140%;
    border-top: 1px solid #e8e8e8;
    border-left: 1px solid #e8e8e8;
    th,
    td {
      border-bottom: 1px solid #e8e8e8;
      border-right: 1px solid #e8e8e8;
      padding: 8px 16px;
    }
    th {
      background-color: #ebeff4;
    }
  }
}
</style>
    