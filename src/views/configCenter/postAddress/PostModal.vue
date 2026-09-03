<template>
  <div>
    <BasicModal v-bind="$attrs" @register="registerModal" @cancel="handleClose" :title="getTitle" @ok="onSubmit" width="800px">
      <BasicForm @register="registerForm">
        <template #table>
          <div class="params-info">
            <table>
              <tr>
                <th>名称</th>
                <th>值</th>
                <th>操作</th>
              </tr>
              <tr v-for="(data, inx) in dataSource" :key="inx">
                <td>
                  <a-input
                    v-model:value="data.paramKey"
                    :disabled="['username', 'password', 'port', 'security'].includes(data.paramKey) || getTitle === '查看'"
                  />
                </td>
                <td v-if="data.paramKey === 'security'">
                  <a-select placeholder="请选择" v-model:value="data.value" :disabled="getTitle === '查看'" style="width: 100%">
                    <a-select-option value="None">None</a-select-option>
                    <a-select-option value="Basic128Rsa15">Basic128Rsa15</a-select-option>
                    <a-select-option value="Basic256">Basic256</a-select-option>
                    <a-select-option value="Basic256Sha256">Basic256Sha256</a-select-option>
                  </a-select>
                </td>
                <td v-else>
                  <a-input v-model:value="data.value" :disabled="getTitle === '查看'" />
                </td>
                <td>
                  <a-button
                    @click="deleteItem(data)"
                    type="link"
                    :disabled="['username', 'password', 'port', 'security'].includes(data.paramKey) || getTitle === '查看'"
                  >
                    删除
                  </a-button>
                </td>
              </tr>
            </table>
            <a-button style="width: 140%" @click="addItem" :disabled="getTitle === '查看'"><a-icon type="plus" /></a-button>
          </div>
        </template>
      </BasicForm>
    </BasicModal>
  </div>
</template>

<script lang="ts" setup>
  import { ref, unref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import { saveEdit, getDetail } from './post.api';
  import { message, Upload } from 'ant-design-vue';
  const emit = defineEmits(['success', 'register']);
  const isUpdate = ref<Boolean>(true);
  const getTitle = ref('查看');
  const curRecord: any = ref({});
  const selectRoleUser: any = ref({});
  const curClearObj: any = ref({});
  const dataSource: any = ref([]);
  const schemas: any = [
    {
      field: 'divider-basic',
      component: 'Divider',
      label: '基本信息',
    },
    {
      label: '名称',
      field: 'name',
      required: true,
      component: 'Input',
      rules: [
        { required: true, message: '请输入名称！' },
        { min: 0, max: 50, message: '长度不能超过 50 个字符', trigger: 'blur' },
      ],
    },
    {
      label: '协议',
      field: 'protocol',
      component: 'JDictSelectTag',
      required: true,
      componentProps: () => {
        return {
          dictCode: 'communication_protocol',
          placeholder: '请选择',
          stringToNumber: false,
          showChooseOption: false,
          onChange: (e: any) => {
            console.log('e-----', e);
            if (e === 'WinCC-OPC-UA' || e === 'KepServer-OPC-UA' || e === 'KepServer-MQTT') {
              dataSource.value = [
                {
                  paramKey: 'username',
                  value: '',
                },
                {
                  paramKey: 'password',
                  value: '',
                },
                {
                  paramKey: 'port',
                  value: '',
                },
                {
                  paramKey: 'security',
                  value: '',
                },
              ];
            } else {
              dataSource.value = [];
            }
          },
        };
      },
    },
    {
      label: '地址',
      field: 'address',
      required: true,
      component: 'Input',
      rules: [
        { required: true, message: '请输入地址！' },
        { min: 0, max: 200, message: '长度不能超过 200 个字符', trigger: 'blur' },
      ],
    },
    {
      field: 'fileUrl',
      label: '附件',
      component: 'JUpload',
      // ifShow: ({ values }) => {
      //   return getTitle.value !== '查看';
      // },
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
      label: '状态',
      field: 'enableFlag',
      component: 'Switch',
      componentProps: {
        checked: false,
        checkedValue: '1',
        unCheckedValue: '0',
      },
      dynamicDisabled: () => {
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
    closeModal();
  }
  // 注册表单
  const [registerForm, { validate, setFieldsValue, resetFields, setProps, resetSchema }] = useForm({
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
    dataSource.value = dataSource.value.filter((item) => {
      if (
        !(params.protocol === 'WinCC-OPC-UA' || params.protocol === 'KepServer-OPC-UA' || params.protocol === 'KepServer-MQTT') &&
        ['username', 'password', 'port', 'security'].includes(item.paramKey)
      ) {
        return false;
      }
      return !!item.paramKey;
    });
    dataSource.value.forEach((item) => {
      if (['port', 'security'].includes(item.paramKey) && !item.value) {
        attr = item.paramKey;
      }
    });
    if (attr) {
      message.warn(`${attr}不能为空`);
      return;
    }
    params.daqCommunicationParamSaveDTOList = dataSource.value;
    delete params.table;
    if (unref(isUpdate)) {
      params.id = curRecord.value.id;
    }
    console.log('params', params);
    setModalProps({ confirmLoading: true });
    await saveEdit(params);
    closeModal();
    emit('success');
  }
  // 这个方法执行需要openModal传入第二个参数
  const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
    dataSource.value = [];
    if (!data?.showFooter) {
      getTitle.value = '查看';
    } else if (data?.isUpdate) {
      getTitle.value = '编辑';
    } else {
      getTitle.value = '新增';
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
      curRecord.value = record;
      dataSource.value = record.daqCommunicationParamList;
      console.log('data.record res', data.record, record);
      record.enableFlag = record.enableFlag + '';
      console.log('data.record', record);
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
