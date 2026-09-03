<template>
  <div>
    <BasicModal v-bind="$attrs" @register="registerModal" @ok="onSubmit" width="600px">
      <BasicForm @register="registerForm" />
    </BasicModal>
    <DeviceModal @register="registerDeviceModal" @select="selectDeviceOk" />
    <RiskPointsModal @register="registerRiskPointsModal" @select="selectRiskPointsOk" />
  </div>
</template>

<script lang="ts" setup>
  import { computed, ref, unref, onMounted } from 'vue';
  import { BasicModal, useModalInner, useModal } from '/@/components/Modal';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import { saveOrUpdate, getIsExist, riskByIds, getDeviceById } from './check.api';
  import { useUserStore } from '/@/store/modules/user';
  import DeviceModal from './DeviceModal.vue';
  import RiskPointsModal from './RiskPointsModal.vue';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { getOrgCodeList, getDepartmentList } from '/@/api/common/api';
  import { render } from '/@/utils/common/renderUtils';
  const { createMessage } = useMessage();
  const userStore = useUserStore();
  const userinfo: any = computed(() => userStore.getUserInfo);
  const emit = defineEmits(['register', 'success']);
  const isUpdate = ref<Boolean>(true);
  const showFooter = ref<Boolean>(true);
  // const getTitle = computed(() => (!unref(isUpdate) ? '新增' : '编辑'));
  const orgOptions = ref([]);
  const departOptions = ref([]);
  const deviceIdEdit = ref([]);
  const riskIdEdit = ref([]);
  const riskDataSource = ref([]);
  const deviceDataSource = ref([]);
  async function getOrgList() {
    await getOrgCodeList().then((res) => {
      orgOptions.value = res.map((item) => {
        return {
          label: item.departName,
          value: item.orgCode,
        };
      });
    });
  }
  onMounted(() => {
    getOrgList();
  });
  function initOrgCode() {
    const orgCode = userinfo.value.orgCode.length >= 6 ? userinfo.value.orgCode.slice(0, 6) : undefined;
    if (orgCode) {
      let params: any = {};
      params.orgCode = orgCode;
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
    return orgCode;
  }
  function initDeptCode() {
    return userinfo.value.orgCode.length >= 9 ? userinfo.value.orgCode.slice(0, 9) : undefined;
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
        label: '所属机构',
        field: 'org',
        component: 'Select',
        defaultValue: initOrgCode(),
        required: true,
        componentProps: ({ formModel, formActionType }) => {
          return {
            options: orgOptions,
            placeholder: '请选择',
            onChange: (e: any) => {
              departOptions.value = [];
              formModel.depart = undefined; //  reset city value
              const { updateSchema } = formActionType;
              if (e) {
                let params: any = {};
                params.orgCode = e;
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
                    updateSchema({
                      field: 'depart',
                      componentProps: {
                        options: departOptions.value,
                      },
                    });
                  } else {
                    updateSchema({
                      field: 'depart',
                      componentProps: {
                        options: [],
                      },
                    });
                  }
                });
              } else {
                updateSchema({
                  field: 'depart',
                  componentProps: {
                    options: [],
                  },
                });
              }
            },
          };
        },
      },
      {
        label: '所属部门',
        field: 'depart',
        component: 'Select',
        defaultValue: initDeptCode(),
        componentProps: {
          options: departOptions.value, // defalut []
          placeholder: '请选择',
        },
      },
      {
        label: '检查项分类',
        field: 'itemType',
        required: true,
        component: 'JDictSelectTag',
        componentProps: {
          dictCode: 'check_sort',
          stringToNumber: false,
          showChooseOption: false,
        },
      },
      {
        field: 'itemName',
        label: '检查项',
        component: 'Input',
        componentProps: {
          maxlength: 50,
        },
      },
      {
        field: 'checkContent',
        label: '检查内容/方法',
        component: 'InputTextArea',
        required: true,
        componentProps: {
          showCount: true,
          maxlength: 100,
          rows: 3,
          suffix: '/100',
        },
      },
      {
        field: 'checkStandard',
        label: '检查标准',
        component: 'InputTextArea',
        componentProps: {
          showCount: true,
          maxlength: 100,
          rows: 3,
          suffix: '/100',
        },
      },
      {
        label: '对应设备',
        field: 'deviceName',
        component: 'InputTextArea',
        componentProps: () => {
          return {
            rows: 1,
            placeholder: '请选择',
            readOnly: true,
            onClick: () => {
              openDeviceModal(true, { deviceId: deviceIdEdit.value, data: deviceDataSource.value });
            },
            onChange: (val) => {
              if (!val.target.value || val.target.value === '') {
                deviceIdEdit.value = [];
                deviceDataSource.value = [];
              }
            },
          };
        },
      },
      {
        label: '关联风险',
        field: 'riskName',
        component: 'InputTextArea',
        componentProps: () => {
          return {
            autoSize: true,
            placeholder: '请选择',
            readOnly: true,
            onClick: () => {
              openRiskPointsModal(true, { riskId: riskIdEdit.value, data: riskDataSource.value });
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
  async function onSubmit() {
    const values = await validate();
    const obj = JSON.parse(JSON.stringify(values));
    if (obj.depart == undefined) {
      obj.depart = '';
    }
    if (deviceIdEdit.value.length > 0) {
      obj.deviceId = deviceIdEdit.value.join(',');
    }
    if (riskIdEdit.value.length > 0) {
      obj.riskId = riskIdEdit.value.join(',');
    }
    if (unref(isUpdate)) {
      // 检验是否重复
      let params: any = {};
      params.itemName = obj.itemName;
      params.org = obj.org;
      params.depart = obj.depart;
      params.itemType = obj.itemType;
      params.checkContent = obj.checkContent;
      params.checkStandard = obj.checkStandard;
      params.id = obj.id;
      let res = await getIsExist(params);
      if (res == 'n') {
        createMessage.error('此检查表已存在！');
        return;
      } else {
        await saveOrUpdate(obj, isUpdate.value);
        closeModal();
        emit('success');
      }
    } else {
      // 检验是否重复
      let params: any = {};
      params.itemName = obj.itemName;
      params.org = obj.org;
      params.depart = obj.depart;
      params.itemType = obj.itemType;
      params.checkContent = obj.checkContent;
      params.checkStandard = obj.checkStandard;
      let res = await getIsExist(params);
      if (res == 'n') {
        createMessage.error('此检查表已存在！');
        return;
      } else {
        await saveOrUpdate(obj, isUpdate.value);
        closeModal();
        emit('success');
      }
    }
  }
  // 注册弹窗
  // 这个方法执行需要openModal传入第二个参数
  const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
    // 下次点击弹窗的时候清空表单
    await resetFields();
    deviceIdEdit.value = [];
    riskIdEdit.value = [];
    riskDataSource.value = [];
    deviceDataSource.value = [];
    setModalProps({ confirmLoading: false, showCancelBtn: !!data?.showFooter, showOkBtn: !!data?.showFooter, title: data.title });
    isUpdate.value = !!data?.isUpdate;
    showFooter.value = !!data?.showFooter;
    // title.value = data.title;
    if (unref(isUpdate)) {
      let params: any = {};
      params.orgCode = data.record.org;
      params.pageSize = 9999;
      params.pageNo = 1;
      getDepartmentList(params).then((res) => {
        departOptions.value = res.map((item) => {
          return {
            label: item.departName,
            value: item.orgCode,
          };
        });
        updateSchema({
          field: 'depart',
          componentProps: {
            options: departOptions.value,
            placeholder: '请选择',
          },
        });
      });
      if (data.record.riskId) {
        riskByIds({
          ids: data.record.riskId,
        }).then((res) => {
          if (res) {
            riskDataSource.value = res;
          } else {
            riskDataSource.value = [];
          }
        });
      }
      if (data.record.deviceId) {
        getDeviceById({
          id: data.record.deviceId,
        }).then((res) => {
          if (res) {
            deviceDataSource.value = res;
          } else {
            deviceDataSource.value = [];
          }
        });
      }
      const obj = JSON.parse(JSON.stringify(data.record));
      obj.depart = obj.depart ? obj.depart : undefined;
      //表单赋值
      setFieldsValue({
        ...obj,
      });
      deviceIdEdit.value = obj.deviceId ? obj.deviceId.split(',') : [];
      riskIdEdit.value = obj.riskId ? obj.riskId.split(',') : [];
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
    setProps({ disabled: !data?.showFooter });
  });

  const [registerDeviceModal, { openModal: openDeviceModal }] = useModal();
  const [registerRiskPointsModal, { openModal: openRiskPointsModal }] = useModal();
  function selectDeviceOk(data) {
    deviceDataSource.value = data.dataSource;
    setFieldsValue({
      deviceName: '',
    });
    let deviceName = '';
    data.dataSource.map((item) => {
      deviceName += item.name + ',';
    });
    if (deviceName.endsWith(',')) {
      deviceName = deviceName.slice(0, -1);
    }
    setFieldsValue({
      deviceName: deviceName,
    });
    deviceIdEdit.value = data.selectedRowKeys;
  }
  function selectRiskPointsOk(data) {
    riskDataSource.value = data.dataSource;
    let riskPointsName = '';
    data.dataSource.forEach((item) => {
      riskPointsName += `${item.orgName}>${render.renderDictText(item.riskType, 'risk_type')}${item.jobActivity ? '>' + item.jobActivity : ''}>${
        item.checkItem ? item.checkItem + '>' + item.riskDescription + '、' : item.riskDescription + '、'
      }`;
    });
    if (riskPointsName.endsWith('、')) {
      riskPointsName = riskPointsName.slice(0, -1);
    }
    setFieldsValue({
      riskName: riskPointsName,
    });
    riskIdEdit.value = data.selectedRowKeys;
  }
</script>

<style></style>
