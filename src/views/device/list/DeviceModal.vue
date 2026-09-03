<template>
  <BasicModal v-bind="$attrs" @register="registerModal" :title="getTitle" @ok="onSubmit" width="1200px" destroyOnClose @close="onClose">
    <BasicForm @register="registerForm"></BasicForm>
    <a-tabs v-model:activeKey="activeKey" type="card">
      <a-tab-pane key="1" tab="设备详情">
        <JEditor v-model:value="deviceInfo" :disabled="getTitle == '查看'" />
      </a-tab-pane>
      <a-tab-pane v-if="getTitle == '查看'" key="2" tab="指示信息">
        <IndicationInfo :deviceId="deviceId"></IndicationInfo>
      </a-tab-pane>
      <a-tab-pane key="3" tab="参数信息">
        <a-button :disabled="getTitle === '查看'"  class="attribute-add-btn" preIcon="ant-design:plus-outlined" type="primary" @click="handleParameterAdd">新增</a-button>
        <a-table :bordered="true" :dataSource="parameterDataList" :columns="columnsParameter" :pagination="false">
          <template #bodyCell="{ column, record, index }">
            <template v-if="column.dataIndex === 'operation'">
              <a-button :disabled="getTitle === '查看'" type="link" @click="handleEditParameter(record, index)">编辑</a-button>
              <a-button type="link" @click="handleDetailParameter(record)">查看</a-button>
              <a-button :disabled="getTitle === '查看'" type="link" @click="handleDeleteParameter(record)">删除</a-button>
            </template>
          </template>
        </a-table>
      </a-tab-pane>
      <a-tab-pane key="4" tab="属性信息">
        <a-button :disabled="getTitle === '查看'"  class="attribute-add-btn" preIcon="ant-design:plus-outlined" type="primary" @click="handleAttributeAdd">添加</a-button>
        <a-table :bordered="true" :dataSource="attributeDataList" :columns="columnsAttribute" :pagination="false">
          <template #bodyCell="{ column, text, record }">
            <template v-if="column.dataIndex === 'action'">
              <!-- <a-button type="link" @click="handleDetailItem(record)">查看</a-button> -->
              <a-button :disabled="getTitle === '查看'" type="link" @click="handleDeleteItem(record)">删除</a-button>
            </template>
          </template>
        </a-table>
      </a-tab-pane>
    </a-tabs>
    <AttributeModal @register="registeAttributerModal" @select="selectAttributeOk" />
    <ParameterModal @register="registeParameterModal" @select="selectParameterOk" />
    <div class="qr-code">
      <QrCode :value="qrCodeUrl" class="enter-x flex justify-center xl:justify-start" :width="100" />
    </div>
  </BasicModal>
</template>
    
  <script lang="ts" setup>
import { ref, unref, reactive, computed } from 'vue';
import { BasicModal, useModalInner } from '/@/components/Modal';
import { useModal } from '/@/components/Modal';
import { JEditor } from '/@/components/Form';
import { BasicForm, useForm } from '/@/components/Form/index';
import { saveOrUpdate, getParamListByDeviceId, getAttributeListByDeviceId, deleteAttribute } from './list.api';
import AttributeModal from './AttributeModal.vue';
import ParameterModal from './ParameterModal.vue';
import IndicationInfo from './IndicationInfo.vue';
import { columnsAttribute, columnsParameter } from './list.data';
import { useUserStore } from '/@/store/modules/user';
import { getOrgCodeList } from '/@/api/common/api';
import { QrCode } from '/@/components/Qrcode/index';
import { useMessage } from '/@/hooks/web/useMessage';
const { createConfirm } = useMessage();
const emit = defineEmits(['success', 'register']);
const [registeAttributerModal, { openModal }] = useModal();
const [registeParameterModal, { openModal: openParameterModal }] = useModal();
const isUpdate = ref(false);
const getTitle = ref('');
const activeKey = ref('1');
const deviceInfo = ref('');
const attributeDataList = ref([]);
const parameterDataList = ref([]);
const deviceId = ref('');
const userStore = useUserStore();
const qrCodeUrl = ref('QRCODELOGIN34jhhjkhkj');
console.log('userStore', userStore);
const userinfo = computed(() => userStore.getUserInfo);
console.log('userinfo', userinfo);
getOrgList();
getChannelNumberOptions();

const orgOptions = ref([]);
const channelNumberOptions = ref([]);
async function getOrgList() {
  await getOrgCodeList().then((res) => {
    res.map((item) => {
      orgOptions.value.push({
        label: item.departName,
        value: item.orgCode,
      });
    });
  });
  console.log('options', orgOptions.value);
}
async function getChannelNumberOptions() {
  //   await getChannelNumber().then((res) => {
  //     channelNumberOptions.value = res;
  //   });
  //   console.log('channelNumberOptions', channelNumberOptions.value);
}
// 注册弹窗
// 这个方法执行需要openModal传入第二个参数
const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
  console.log('useModalInner data', data);
  activeKey.value = '1';
  isUpdate.value = data?.isUpdate;
  if (data?.isUpdate) {
    deviceId.value = data.record.id;
  }
  if (!data?.showFooter) {
    getTitle.value = '查看';
  } else if (data?.isUpdate) {
    getTitle.value = '编辑';
  } else {
    getTitle.value = '新增';
  }
  // 下次点击弹窗的时候清空表单
  await resetFields();
  setModalProps({ confirmLoading: false });
  setModalProps({ confirmLoading: false, showCancelBtn: !!data?.showFooter, showOkBtn: !!data?.showFooter });
  // 如果是编辑
  if (isUpdate.value) {
    await setFieldsValue(data.record);
    deviceInfo.value = data.record.deviceInfo;
    //获取参数列表
    getParamListByDeviceId({ deviceId: data.record.id, pageNo: 1, pageSize: 999 }).then((res) => {
      res.records.map((item, index) => {
        item.id = JSON.stringify(index);
      });
      parameterDataList.value = res.records;
    });
    //获取属性列表
    getAttributeListByDeviceId({ deviceId: data.record.id, pageNo: 1, pageSize: 999 }).then((res) => {
      attributeDataList.value = res.records;
    });
  }

  // 隐藏底部时禁用整个表单
  setProps({ disabled: !data?.showFooter });
});
// 注册表单
const [registerForm, { validate, setFieldsValue, resetFields, setProps }] = useForm({
  schemas: [
    {
      label: '编号',
      field: 'code',
      component: 'Input',
      required: true,
      componentProps: {
        // showCount: true,
        maxLength: 30,
        // suffix: '/30',
      },
      colProps: { span: 7 },
    },
    {
      label: '名称',
      field: 'name',
      component: 'Input',
      required: true,
      componentProps: {
        maxLength: 30,
      },
      colProps: { span: 7 },
    },
    {
      label: '系统分类',
      field: 'deviceCategoryId',
      component: 'JTreeSelect1',
      required: true,
      componentProps: ({ formModel }) => {
        return {
          url: '/deviceCategory/listDeviceCategoryTree',
          fieldNames: {
            label: 'name',
            value: 'key',
            options: 'children',
          },
        };
      },
      colProps: { span: 7 },
    },
    {
      label: '功能类别',
      field: 'deviceFunctionCategoryId',
      component: 'JTreeSelect1',
      required: true,
      componentProps: ({ formModel }) => {
        return {
          url: '/deviceFunctionCategory/listDeviceFunctionCategoryTree',
          fieldNames: {
            label: 'name',
            value: 'key',
            options: 'children',
          },
        };
      },
      colProps: { span: 7 },
    },
    {
      label: '公司名称/品牌',
      field: 'deviceBrand',
      component: 'Input',
      componentProps: {
        maxLength: 50,
      },
      colProps: { span: 7 },
    },
    {
      label: '型号',
      field: 'deviceModel',
      component: 'Input',
      componentProps: {
        maxLength: 50,
      },
      colProps: { span: 7 },
    },
    {
      label: '投用日期',
      field: 'usedDate',
      component: 'DatePicker',
      componentProps: {
        showTime: false,
        valueFormat: 'YYYY-MM-DD',
        style: {
          width: '100%',
        },
      },
      colProps: { span: 7 },
    },
    {
      label: '设备类型',
      field: 'deviceType',
      component: 'JDictSelectTag',
      required: true,
      componentProps: {
        dictCode: 'device_type',
        placeholder: '请选择',
        stringToNumber: false,
        showChooseOption: false,
      },
      colProps: { span: 7 },
    },
    {
      field: 'channelNumber',
      label: '选择通道名称',
      component: 'Select',
      componentProps: {
        options: channelNumberOptions.value,
        placeholder: '请选择',
      },
      ifShow: ({ values }) => {
        return values.deviceType === '1';
      },
      colProps: { span: 7 },
    },
    {
      field: 'departmentId',
      label: '所属机构',
      component: 'JTreeSelect1',
      required: true,
      // defaultValue: initOrgCode(),
      componentProps: ({ formModel }) => {
        return {
          url: '/jn/common/getDepartTreeBy23',
          fieldNames: {
            label: 'departName',
            value: 'id',
            options: 'children',
          },
        };
      },
      colProps: { span: 7 },
    },
    {
      label: '启/停用',
      field: 'enableFlag',
      component: 'JDictSelectTag',
      required: true,
      componentProps: {
        dictCode: 'device_enable_flag',
        placeholder: '请选择',
        stringToNumber: true,
        showChooseOption: false,
      },
      colProps: { span: 7 },
    },
  ],
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
async function onSubmit() {
  const values = await validate();
  console.log('onSubmit', values);
  const params = {
    ...values,
    deviceInfo: deviceInfo.value,
    deviceToPointDTOList: attributeDataList.value,
    deviceParamSaveDTOList: parameterDataList.value,
  };
  console.log('params', params);
  if (isUpdate.value) {
    params.id = deviceId.value;
  }
  await saveOrUpdate(params, isUpdate.value);
  onClose();
  closeModal();
  emit('success');
}
function handleAttributeAdd() {
  console.log('handleAttributeAdd');
  openModal(true, {
    isUpdate: false,
    showFooter: true,
  });
}
function handleParameterAdd() {
  console.log('handleParameterAdd');
  openParameterModal(true, {
    isUpdate: false,
    showFooter: true,
    title: '新增',
  });
}
function handleEditParameter(record, index) {
  console.log('handleEditParameter', record, index);
  openParameterModal(true, {
    isUpdate: true,
    showFooter: true,
    title: '编辑',
    currentIndex: index,
    record: record,
  });
}
// 查看参数
function handleDetailParameter(record) {
  console.log('handleDetailParameter', record);
  openParameterModal(true, {
    isUpdate: true,
    showFooter: false,
    title: '查看',
    record: record,
  });
}
// 删除参数
function handleDeleteParameter(record) {
  console.log('handleDeleteParameter', record);
  const index = parameterDataList.value.findIndex((item) => item.id === record.id);
  parameterDataList.value.splice(index, 1);
}
/**
 * 选择属性
 */
function selectAttributeOk(data) {
  console.log('selectAttributeOk', data);
  if (data.length == 0) {
    return;
  }
  attributeDataList.value.map((item) => {
    data.map((item1) => {
      if (item.pointId == item1.pointId) {
        data.splice(
          data.findIndex((item2) => item2.pointId === item1.pointId),
          1
        );
      }
    });
  });
  attributeDataList.value = attributeDataList.value.concat(data);
}
/**
 * 选择参数
 */
function selectParameterOk(data) {
  console.log('selectParameterOk', data);
  if (!data.id) {
    data.id = JSON.stringify(parameterDataList.value.length);
    parameterDataList.value.push(data);
  } else {
    parameterDataList.value[Number(data.id)] = data;
  }
}
/**
 * 删除属性
 */
async function handleDeleteItem(record) {
  console.log('handleDeleteItem', record);
  if (record.id) {
    // 请求删除接口-解绑设备
    createConfirm({
      iconType: 'warning',
      title: '删除',
      content: '此操作会使该属性解绑当前设备，确定要删除吗？',
      onOk: () => {
        deleteAttribute({ deviceToPointId: record.id }).then((res) => {
          if (res) {
            attributeDataList.value.splice(
              attributeDataList.value.findIndex((item) => item.pointId == record.pointId),
              1
            );
          }
        });
      },
      onCancel() {},
    });
  } else {
    const index = attributeDataList.value.findIndex((item) => item.pointId == record.pointId);
    attributeDataList.value.splice(index, 1);
  }
}
function onClose() {
  reset();
  attributeDataList.value = [];
  parameterDataList.value = [];
  deviceInfo.value = '';
}
// 重置页面
function reset() {
  console.log('reset');
  activeKey.value = '1';
}
</script>   
<style lang="less" scoped>
.ur-ovl {
  max-height: 360px;
  overflow-y: auto;
}
:deep(.ant-input-suffix) {
  color: #999;
}
.rp-col {
  border: 1px solid #eee;
  padding: 10px;
}
.r-title {
  font-size: 14px;
  color: rgba(0, 0, 0, 0.38);
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  > span {
    color: #0091ff;
    cursor: pointer;
  }
}
.r-list {
  display: flex;
  justify-content: space-between;
  width: 100%;
  height: 30px;
  line-height: 30px;
  padding: 0 8px;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 4px;
  font-size: 14px;
  margin-bottom: 10px;
  .name {
    color: rgba(0, 0, 0, 0.87);
    margin-right: 8px;
  }
  > i {
    color: rgba(0, 0, 0, 0.87);
    display: inline-block;
    font-size: 18px;
    cursor: pointer;
    font-style: normal;
  }
}
.all-check {
  padding-bottom: 10px;
  margin-bottom: 10px;
  border-bottom: 1px solid #eee;
}
.attribute-add-btn {
  margin-bottom: 10px;
}
.qr-code {
  position: absolute;
  right: 20px;
  top: 20px;
}
</style>
    