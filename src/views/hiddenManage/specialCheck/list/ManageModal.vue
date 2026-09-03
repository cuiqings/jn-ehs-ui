<template>
  <div>
    <BasicModal v-bind="$attrs" @register="registerModal" :width="1000" @ok="onSubmit" :title="modalTitle" @cancel="handleCancel">
      <BasicForm @register="registerForm">
        <template v-if="modalTitle !== '查看'" #add>
          <div style="margin-left: 82px">
            <a-button
              v-if="showFooter && (checkType == '3' || checkType == '4' || checkType == '5' || checkType == '6')"
              type="primary"
              @click="downloadTemplate"
              style="margin-right: 8px"
            >
              <DownloadOutlined />下载模版</a-button
            >
            <j-upload-button v-if="showFooter&&(checkType=='3'||checkType=='4'||checkType=='5'||checkType=='6')" type="primary" preIcon="ant-design:import-outlined" @click="onImportXls">导入</j-upload-button>
            <a-button
              v-if="showFooter && checkType == '7'"
              type="primary"
              @click="downloadTemplate7"
              style="margin-right: 8px"
            >
              <DownloadOutlined />下载模版</a-button
            >
            <j-upload-button v-if="showFooter&&checkType=='7'" type="primary" preIcon="ant-design:import-outlined" @click="onImportXls7">导入</j-upload-button>
            <a-button style="margin-left: 12px" type="primary" @click="addCheckItem">+ 添加检查项目</a-button>
          </div>
        </template>
        <template #table1 v-if="checkType != '7'">
          <a-table
            style="width: 120%; margin-left: 40px"
            ref="table"
            size="middle"
            bordered
            rowKey="id"
            :columns="modalTitle !== '查看' ? columns : columns1"
            :dataSource="dataSource"
            :pagination="false"
          >
            <template #headerCell="{ column }">
              <template v-if="column.key === 'contentStandard'"> <span class="red-require">*</span>检查内容及标准</template>
              <template v-if="column.key === 'score'"> <span class="red-require">*</span>分数</template>
            </template>
            <template v-if="modalTitle !== '查看'" #action="{ record, index }">
              <div>
                <a-button type="link" :disabled="index == dataSource.length - 1" @click="downItem(record, index)"><arrow-down-outlined /></a-button>
                <a-button type="link" :disabled="index == 0" @click="upItem(record, index)"><arrow-up-outlined /></a-button>
                <a-button type="link" @click="deleteItem(index)">删除</a-button>
              </div>
            </template>
            <template #contentStandard="{ record }">
              <a-textarea
                placeholder="请输入5000字以内"
                v-model:value="record.contentStandard"
                :rows="3"
                :maxlength="5000"
                :disabled="modalTitle === '查看'"
                @change="changecontentStandard(record)"
              />
              <!-- <span v-else style="display: inline-block; width: 150px">{{ record.drillCheckinPath }}</span> -->
              <div v-if="record.errorFlag1" style="color: red">请输入检查内容及标准</div>
            </template>
            <template #score="{ record }">
              <a-input-number
                :disabled="modalTitle === '查看'"
                :min="1"
                :max="100"
                placeholder="请输入"
                :precision="0"
                v-model:value="record.score"
                @change="changescore(record)"
              />
              <div v-if="record.errorFlag2" style="color: red">请输入分数</div>
            </template>
          </a-table>
        </template>
        <template #table2 v-if="checkType == '7'">
          <a-table
            style="width: 120%; margin-left: 40px"
            ref="table"
            size="middle"
            bordered
            rowKey="id"
            :columns="modalTitle !== '查看' ? columns2 : columns3"
            :dataSource="dataSource"
            :pagination="false"
          >
            <template #headerCell="{ column }">
              <template v-if="column.key === 'violationDescribe'"> <span class="red-require">*</span>违法行为描述</template>
              <template v-if="column.key === 'judgeSituation'"> <span class="red-require">*</span>判定情形</template>
              <template v-if="column.key === 'score'"> <span class="red-require">*</span>分数</template>
            </template>
            <template v-if="modalTitle !== '查看'" #action="{ record, index }">
              <div>
                <a-button type="link" :disabled="index == dataSource.length - 1" @click="downItem(record, index)"><arrow-down-outlined /></a-button>
                <a-button type="link" :disabled="index == 0" @click="upItem(record, index)"><arrow-up-outlined /></a-button>
                <a-button type="link" @click="deleteItem(index)">删除</a-button>
              </div>
            </template>
            <template #violationDescribe="{ record }">
              <a-textarea
                placeholder="请输入5000字以内"
                v-model:value="record.violationDescribe"
                :rows="3"
                :maxlength="5000"
                :disabled="modalTitle === '查看'"
                @change="changeViolationDescribe(record)"
              />
              <!-- <span v-else style="display: inline-block; width: 150px">{{ record.drillCheckinPath }}</span> -->
              <div v-if="record.errorFlag5" style="color: red">请输入违法行为描述</div>
            </template>
            <template #judgeSituation="{ record }">
              <a-textarea
                placeholder="请输入5000字以内"
                v-model:value="record.judgeSituation"
                :rows="3"
                :maxlength="5000"
                :disabled="modalTitle === '查看'"
                @change="changejudgeSituation(record)"
              />
              <!-- <span v-else style="display: inline-block; width: 150px">{{ record.drillCheckinPath }}</span> -->
              <div v-if="record.errorFlag3" style="color: red">请输入判定情形</div>
            </template>
            <template #score="{ record }">
              <a-input-number
                :disabled="modalTitle === '查看'"
                :min="1"
                :max="100"
                placeholder="请输入"
                :precision="0"
                v-model:value="record.score"
                @change="changescore(record)"
              />
              <div v-if="record.errorFlag2" style="color: red">请输入分数</div>
            </template>
          </a-table>
        </template>
      </BasicForm>
    </BasicModal>
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
  import { ArrowDownOutlined, ArrowUpOutlined } from '@ant-design/icons-vue';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { initDictOptions } from '/@/utils/dict';
  import { getDepart3ListWithSecurity } from '/@/api/common/api';
  import RiskModalInfo from '/@/views/risk/component/riskModalInfo.vue';
  import { useMethods } from '/@/hooks/system/useMethods';
  import { DownloadOutlined } from '@ant-design/icons-vue';
  const { handleImportXls, handleExportXls } = useMethods();
  const [registerRiskInfoModal, RiskInfoProps] = useModal();
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
  const checkType = ref('');
  const importConfig = {
    url: '/yh/skYhSpecialCheck/importExcel1',
    data: () => {},
    success: handleSuccess,
  };
  const importConfig7 = {
    url: '/yh/skYhSpecialCheck/importExcel2',
    data: () => {},
    success: handleSuccess,
  };
  const columns: any = [
    {
      title: '序号',
      align: 'center',
      width: 80,
      customRender: ({ index }) => {
        return index + 1;
      },
    },
    {
      title: '检查内容及标准',
      align: 'center',
      key: 'contentStandard',
      dataIndex: 'contentStandard',
      slots: { customRender: 'contentStandard' },
    },
    {
      title: '分数',
      align: 'center',
      dataIndex: 'score',
      key: 'score',
      slots: { customRender: 'score' },
    },
    {
      title: '操作',
      width: 180,
      align: 'center',
      dataIndex: 'action',
      slots: { customRender: 'action' },
    },
  ];
  const columns1: any = [
    {
      title: '序号',
      align: 'center',
      width: 80,
      customRender: ({ index }) => {
        return index + 1;
      },
    },
    {
      title: '检查内容及标准',
      align: 'center',
      key: 'contentStandard',
      dataIndex: 'contentStandard',
      slots: { customRender: 'contentStandard' },
    },
    {
      title: '分数',
      align: 'center',
      dataIndex: 'score',
      key: 'score',
      slots: { customRender: 'score' },
    },
  ];
  const columns2: any = [
    {
      title: '序号',
      align: 'center',
      width: 80,
      customRender: ({ index }) => {
        return index + 1;
      },
    },
    {
      title: '违法行为描述',
      align: 'center',
      key: 'violationDescribe',
      dataIndex: 'violationDescribe',
      slots: { customRender: 'violationDescribe' },
    },
    {
      title: '判定情形',
      align: 'center',
      key: 'judgeSituation',
      dataIndex: 'judgeSituation',
      slots: { customRender: 'judgeSituation' },
    },
    {
      title: '分数',
      align: 'center',
      key: 'score',
      dataIndex: 'score',
      slots: { customRender: 'score' },
    },
    {
      title: '操作',
      width: 180,
      align: 'center',
      dataIndex: 'action',
      slots: { customRender: 'action' },
    },
  ];
  const columns3: any = [
    {
      title: '序号',
      align: 'center',
      width: 80,
      customRender: ({ index }) => {
        return index + 1;
      },
    },
    {
      title: '违法行为描述',
      align: 'center',
      key: 'violationDescribe',
      dataIndex: 'violationDescribe',
      slots: { customRender: 'violationDescribe' },
    },
    {
      title: '判定情形',
      align: 'center',
      key: 'judgeSituation',
      dataIndex: 'judgeSituation',
      slots: { customRender: 'judgeSituation' },
    },
    {
      title: '分数',
      align: 'center',
      key: 'score',
      dataIndex: 'score',
      slots: { customRender: 'score' },
    },
  ];
  const editType = ref('');
  async function getOrgList() {
    await getDepart3ListWithSecurity().then((res) => {
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
  initDictConfig();
  // 初始化字典
  async function initDictConfig() {
    checkTypeOptions.value = await initDictOptions('special_check_type');
    console.log('checkTypeOptions', checkTypeOptions.value);
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
        label: '编制单位',
        field: 'org',
        component: 'Select',
        required: true,
        componentProps: ({ formModel, formActionType }) => {
          return {
            options: orgOptions,
          };
        },
        colProps: {
          span: 20,
        },
      },
      {
        label: '检查类型',
        field: 'checkType',
        component: 'Select',
        required: true,
        componentProps: ({ formModel, formActionType }) => {
          return {
            options: checkTypeOptions.value.filter((item: any) => {
              if (item.value == '8') {
                return false;
              }
              return true;
            }),
            onChange: (e: any) => {
              if (e) {
                checkType.value = e;
              }
            },
          };
        },
        colProps: {
          span: 20,
        },
      },
      {
        field: 'checkTable',
        label: ' 检查表名称',
        component: 'Input',
        rules: [{ required: true, message: ' 检查表名称不可为空！' }],
        componentProps: {
          maxlength: 50,
        },
        colProps: {
          span: 20,
        },
      },
      {
        field: 'remark',
        label: ' 备注',
        component: 'Input',
        componentProps: {
          // maxlength: 150,
        },
        colProps: {
          span: 20,
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
          span: 20,
        },
        slot: 'add',
      },
      {
        field: 'table1',
        component: 'Input',
        label: '',
        //   colProps: {
        //     span: 5,
        //   },
        slot: 'table1',
        ifShow: () => {
          return checkType.value == '3' || checkType.value == '4' || checkType.value == '5' || checkType.value == '6';
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
        ifShow: () => {
          return checkType.value == '7';
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
  async function onSubmit(e: MouseEvent) {
    console.log('onSubmit');
    e?.stopPropagation();
    e?.preventDefault();
    const values = await validate();
    console.log('values', values);
    for (let item of dataSource.value) {
      if (!item.contentStandard && checkType.value != '7') {
        item.errorFlag1 = true;
      }
      if (!item.score) {
        item.errorFlag2 = true;
      }
      if (!item.judgeSituation && checkType.value == '7') {
        item.errorFlag3 = true;
      }
      if (!item.violationDescribe && checkType.value == '7') {
        item.errorFlag5 = true;
      }
      if (item.errorFlag1 || item.errorFlag2 || item.errorFlag3 || item.errorFlag5) {
        return false;
      }
    }
    if (values.remindNoExecute == '1') {
      values.remindMessage = '1';
    }
    // 检查项不可为空
    if (dataSource.value.length == 0) {
      createMessage.error('检查项不可为空');
      return false;
    }
    values.itemList = dataSource.value;
    setModalProps({ confirmLoading: true });
    console.log('values', values);
    if (unref(isUpdate)) {
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
    if (userinfo.value.orgCode.length == 9) {
      // 如果是集团用户，默认选择集团
      setFieldsValue({
        org: userinfo.value.orgCode,
      });
    }
    // 设置部门
    if (unref(isUpdate)) {
      // 计划清单-编辑
      // 根据id获取详情
      await defHttp.get({ url: '/yh/skYhSpecialCheck/queryById', params: { id: data.record.id } }).then(async (res) => {
        dataSource.value = res.itemList;
        detailsData.value = res;
        checkType.value = res.checkType;
      });

      //表单赋值
      await setFieldsValue({
        ...data.record,
      });
    }
    // 隐藏底部时禁用整个表单
    setProps({ disabled: !data?.showFooter });
  });

  function selectCheckLibraryOk({ data, selectedRowKeys }) {
    // // 过滤掉dataSource.value中不存在itemId数组中的数据，不包含不存在itemId的
    const dat1 = dataSource.value.filter((item) => (item.itemId && selectedRowKeys.includes(item.itemId)) || !item.itemId);
    dataSource.value = dat1.concat(data);
  }
  function deleteItem(index) {
    dataSource.value.splice(index, 1);
  }
  function addCheckItem() {
    dataSource.value.push({
      itemType: undefined,
      itemName: '',
      drillCheckinPath: '',
      drillRecordPath: '',
      drillEvaluatePath: '1',
      errorFlag1: false,
      errorFlag2: false,
      errorFlag3: false,
      errorFlag4: false,
      errorFlag5: false,
    });
  }
  function upItem(record, index) {
    let temp = dataSource.value[index - 1];
    dataSource.value[index - 1] = record;
    dataSource.value[index] = temp;
  }
  function downItem(record, index) {
    let temp = dataSource.value[index + 1];
    dataSource.value[index + 1] = record;
    dataSource.value[index] = temp;
  }
  function changejudgeSituation(record) {
    if (record.judgeSituation) {
      record.errorFlag3 = false;
    } else {
      record.errorFlag3 = true;
    }
  }
  function changecontentStandard(record) {
    if (record.contentStandard) {
      record.errorFlag1 = false;
    } else {
      record.errorFlag1 = true;
    }
  }
  function changeViolationDescribe(record) {
    if (record.violationDescribe) {
      record.errorFlag5 = false;
    } else {
      record.errorFlag5 = true;
    }
  }
  function changescore(record) {
    if (record.score) {
      record.errorFlag2 = false;
    } else {
      record.errorFlag2 = true;
    }
  }
  function handleCancel() {
    closeModal();
    emit('success');
  }
  // 导入成功
  function handleSuccess(fileInfo) {
    console.log('handleSuccess', fileInfo);
    if(fileInfo.success){
      // 返回结果追加到dataSource.value中
      dataSource.value = dataSource.value.concat(fileInfo.result);
    }else{
      createMessage.error(fileInfo.message);
    }
  }
  function onImportXls(file) {
    const { url, success, data } = importConfig;
    const realUrl = url;
    if (realUrl) {
      const dataBody = typeof data === 'function' ? data() : data;
      handleImportXls(file, realUrl, success, dataBody);
    } else {
      createMessage.warn('没有传递 importConfig.url 参数');
      return Promise.reject();
    }
  }
  // 下载模版
  function downloadTemplate() {
    let params = {};
    handleExportXls('专项检查项导入模板下载', '/yh/skYhSpecialCheck/downloadTemplate1', params);
  }
  function downloadTemplate7() {
    let params = {};
    handleExportXls('专项检查项重大事故隐患导入模板下载', '/yh/skYhSpecialCheck/downloadTemplate2', params);
  }
  function onImportXls7(file) {
    const { url, success, data } = importConfig7;
    const realUrl = url;
    if (realUrl) {
      const dataBody = typeof data === 'function' ? data() : data;
      handleImportXls(file, realUrl, success, dataBody);
    } else {
      createMessage.warn('没有传递 importConfig.url 参数');
      return Promise.reject();
    }
  }
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
