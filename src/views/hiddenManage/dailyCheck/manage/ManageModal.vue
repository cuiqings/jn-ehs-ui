<template>
  <div>
    <BasicModal v-bind="$attrs" @register="registerModal" :width="1400" @ok="onSubmit" :title="modalTitle" @cancel="handleCancel">
      <BasicForm @register="registerForm">
        <template #table2>
          <a-table
            style="width: 100%; margin-left: 40px"
            ref="table2"
            size="middle"
            bordered
            rowKey="id"
            :columns="columns"
            :dataSource="dataSource"
            :pagination="false"
          >
            <template #headerCell="{ column }">
              <template v-if="column.key === 'checkMethod'"> <span class="red-require">*</span>排查方法 </template>
              <template v-if="column.key === 'pictureFlag'"> <span class="red-require">*</span>检查照片 </template>
            </template>
            <template #checkMethod="{ record }">
              <a-select :disabled="modalTitle === '查看'" v-model:value="record.checkMethod" style="width: 100px" @change="changeCheckType(record)">
                <a-select-option :value="item.value" :key="index" v-for="(item, index) in checkTypeOptions">{{ item.title }}</a-select-option>
              </a-select>
              <div v-if="record.errorFlag4" style="color: red">请选择排查方法</div>
            </template>
            <template #pictureFlag="{ record }">
              <a-select
                :disabled="modalTitle === '查看'"
                v-model:value="record.pictureFlag"
                style="width: 100px"
                @change="changeCheckPicture(record)"
              >
                <a-select-option value="0">非必填</a-select-option>
                <a-select-option value="1">必填</a-select-option>
              </a-select>
              <div v-if="record.errorFlag3" style="color: red">请选择检查照片</div>
            </template>
            <template #riskId="{ record }">
              <span style="cursor: pointer; color: #1890ff" @click="handleRiskId(record)">{{ record.riskId }}</span>
            </template>
          </a-table>
        </template>
        <template #noticeType>
          <div style="">
            <a-checkbox :disabled="true" v-model:checked="remindMessage">APP</a-checkbox>
          </div>
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
      </BasicForm>
    </BasicModal>
    <CheckLibraryModal @register="registerCheckLibraryModal" @select="selectCheckLibraryOk" />
    <RiskModalInfo @register="registerRiskInfoModal" />
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, unref } from 'vue';
import { BasicModal, useModalInner, useModal } from '/@/components/Modal';
import { BasicForm, useForm } from '/@/components/Form/index';
import { saveOrUpdate, getUserList, getRgLcList } from './manage.api';
import { defHttp } from '/@/utils/http/axios';
import { useUserStore } from '/@/store/modules/user';
import CheckLibraryModal from './CheckLibraryModal.vue';
import { ArrowDownOutlined, ArrowUpOutlined } from '@ant-design/icons-vue';
import { useMessage } from '/@/hooks/web/useMessage';
import { initDictOptions } from '/@/utils/dict';
import { weekOptions, monthOptions } from '/@/views/task/publish/time.data';
import { getOrgCodeList, getDepartmentList } from '/@/api/common/api';
import { getRiskInfoById } from '../checklist/check.api';
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
const checkedPhone = ref(false);
const detailsData: any = ref({});
const checkTypeOptions: any = ref([]);
const planType = ref('');
const personOptions: any = ref([]);
const columns: any = [
  {
    title: '所属单位',
    width: 120,
    dataIndex: 'orgName',
    ellipsis: true,
  },
  {
    title: '所属车间',
    width: 120,
    dataIndex: 'departName',
    ellipsis: true,
  },
  {
    title: '辨识单元',
    width: 130,
    dataIndex: 'recogUnit',
    ellipsis: true,
  },
  {
    title: '风险部位',
    width: 120,
    dataIndex: 'riskName',
    ellipsis: true,
  },
  {
    title: '风险管控措施',
    children: [
      {
        title: '工程技术措施',
        dataIndex: 'enTechMsr',
        width: 120,
        ellipsis: true,
      },
      {
        title: '组织管理措施',
        dataIndex: 'manageMsr',
        width: 100,
        ellipsis: true,
      },
      {
        title: '教育培训措施',
        dataIndex: 'trainMsr',
        width: 120,
        ellipsis: true,
      },
      {
        title: '个体防护措施',
        dataIndex: 'selfDfeMsr',
        width: 120,
        ellipsis: true,
      },
      {
        title: '应急处置措施',
        dataIndex: 'emgDpsMsr',
        width: 120,
        ellipsis: true,
      },
    ],
  },
  {
    title: '风险失控表现',
    dataIndex: 'riskFactor',
    width: 150,
    ellipsis: true,
  },
];
const editType = ref('');
initDictConfig();
// 初始化字典
async function initDictConfig() {
  itemTypeOptions.value = await initDictOptions('check_sort');
  checkTypeOptions.value = await initDictOptions('ht_check_type'); //排查方法
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
      field: 'divider-basic',
      component: 'Divider',
      label: '基本信息',
    },
    {
      field: 'planName',
      label: '计划名称',
      component: 'Input',
      rules: [{ required: true, message: '计划名称不可为空！' }],
      dynamicDisabled: true,
      componentProps: {
        maxlength: 50,
      },
      colProps: {
        span: 7,
      },
    },
    {
      label: '排查周期',
      field: 'checkCycle',
      required: true,
      component: 'JDictSelectTag',
      dynamicDisabled: true,
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
      label: '排查责任人',
      field: 'checkDutyPersonName',
      component: 'Input',
      required: true,
      dynamicDisabled: true,
      colProps: {
        span: 8,
      },
    },
    {
      label: '计划状态',
      field: 'useFlag',
      required: true,
      component: 'Switch',
      defaultValue: '1',
      componentProps: {
        checkedValue: '1',
        unCheckedValue: '0',
        checkedChildren: '启用',
        unCheckedChildren: '停用',
      },
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
        span: 8,
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
        style: 'margin-left: -145px',
      },
    },
    {
      field: 'divider-basic1',
      component: 'Divider',
      label: '检查项目',
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
      field: 'table2',
      component: 'Input',
      label: '',
      //   colProps: {
      //     span: 5,
      //   },
      slot: 'table2',
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
async function onSubmit(e: MouseEvent) {
  e?.stopPropagation();
  e?.preventDefault();
  const values = await validate();
  if (values.remindNoExecute == '1') {
    values.remindApp = '1';
  }else {
    values.remindApp = '0';
  }
  values.planItemList = dataSource.value;
  setModalProps({ confirmLoading: true });
  if (unref(isUpdate)) {
    console.log('编values辑',values);
    saveOrUpdate(values, isUpdate.value)
      .then(() => {
        closeModal();
        emit('success');
      })
      .finally(() =>
        setTimeout(() => {
          setModalProps({ confirmLoading: false });
        }, 100)
      );
  } else {
    saveOrUpdate(values, false)
      .then(() => {
        closeModal();
        emit('success');
      })
      .finally(() => {
        setTimeout(() => {
          setModalProps({ confirmLoading: false });
        }, 100);
      });
  }
}
// 注册弹窗
// 这个方法执行需要openModal传入第二个参数
const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
  console.log('useModalInner data', data);
  // 下次点击弹窗的时候清空表单
  await resetFields();
  checkedPhone.value = false;
  dataSource.value = [];
  setModalProps({ confirmLoading: false, showCancelBtn: !!data?.showFooter, showOkBtn: !!data?.showFooter });

  isUpdate.value = !!data?.isUpdate;
  showFooter.value = !!data?.showFooter;
  editType.value = data.editType;
  modalTitle.value = data.title;
  if (unref(isUpdate)) {
    // 计划清单-编辑
    // 根据id获取详情
    await defHttp.get({ url: '/yh/skYhPlan/queryById', params: { id: data.record.id } }).then(async (res) => {
      if (res.remindApp && res.remindApp == '1') {
        remindMessage.value = true;
      } else {
        remindMessage.value = false;
      }

      dataSource.value = res.planItemList;
      detailsData.value = res;
    });
    //表单赋值
    await setFieldsValue({
      ...data.record,
    });
  }
  // 隐藏底部时禁用整个表单
  setProps({ disabled: !data?.showFooter });
});

const [registerCheckLibraryModal, { openModal: openCheckLibraryModal }] = useModal();
function selectCheckLibraryOk({ data, selectedRowKeys }) {
  // // 过滤掉dataSource.value中不存在itemId数组中的数据，不包含不存在itemId的
  const dat1 = dataSource.value.filter((item) => (item.itemId && selectedRowKeys.includes(item.itemId)) || !item.itemId);
  dataSource.value = dat1.concat(data);
}
function changeCheckType(record) {
  if (record.checkMethod) {
    record.errorFlag4 = false;
  } else {
    record.errorFlag4 = true;
  }
}
function changeCheckPicture(record) {
  if (record.pictureFlag != '' && record.pictureFlag != undefined) {
    record.errorFlag3 = false;
  } else {
    record.errorFlag3 = true;
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
