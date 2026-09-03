<template>
  <BasicDrawer v-bind="$attrs" @register="registerModal" @close="drawerClose" destroyOnClose :title="title" :width="800"
               @ok="handleSubmit">
    <a-form ref="formEl" :model="planModel" :rules="rules" layout="horizontal" :label-col="{xs: {span: 24}, sm: {span: 6}}" :wrapper-col="{xs: {span: 24}, sm: {span: 18}}">
      <a-row>
        <a-col :span="24">
          <a-form-item :labelCol="{ span: 4 }" :wrapperCol="{ span: 24 }" label="项目名称">
            <a-input :value="recordShow.projectName" placeholder="请输入" disabled/>
          </a-form-item>
        </a-col>
        <a-col :span="24">
          <a-form-item :labelCol="{ span: 4 }" :wrapperCol="{ span: 24 }" label="补充类型">
            <a-input :value="recordShow.typeTex" placeholder="请输入" disabled/>
          </a-form-item>
        </a-col>
        <a-col :span="24">
          <a-form-item :labelCol="{ span: 4 }" :wrapperCol="{ span: 24 }" label="截止日期">
            <a-input :value="recordShow.endDt" placeholder="请输入" disabled/>
          </a-form-item>
        </a-col>
      </a-row>

      <a-row v-show="showExplainflag || titleCode == '2' || titleCode == '3'">
        <a-col :span="24">
          <a-form-item :labelCol="{ span: 4 }" :wrapperCol="{ span: 24 }" label=" 补充说明">
            <a-textarea :rows="4" :value="recordShow.addExplain" placeholder="请输入" show-count :maxlength="800" disabled/>
          </a-form-item>
        </a-col>
      </a-row>
      <a-row v-show="showExplainflag || titleCode == '2' || titleCode == '3'">
        <a-col :span="24">
          <a-form-item :labelCol="{ span: 4 }" :wrapperCol="{ span: 24 }" label="补充资料">
            <a-upload
              v-model:file-list="fileListShow"
              :action="uploadAction"
              :headers="headers"
              :data="{'biz': 'eiaAdd'}"
              :max-count="10"
              :before-upload="beforeUploadFile"
              @change="handlefileChange"
              :show-upload-list="{ showDownloadIcon: true, showRemoveIcon: false }"
              @preview="handlePreview"
              disabled
            >
            </a-upload>
          </a-form-item>
        </a-col>
      </a-row>

      <a-row v-show="auditsFlag || titleCode == '3'">
        <a-col :span="24">
          <a-form-item :labelCol="{ span: 4 }" :wrapperCol="{ span: 24 }" label="审核进展">
            <BasicTable @register="registerTable">
            </BasicTable>
          </a-form-item>
        </a-col>
      </a-row>
      <a-divider v-show="showExplainflag || titleCode == '2'" />

      <a-row v-if="addExplain2flag && titleCode == '1'">
        <a-col :span="24">
          <a-form-item :labelCol="{ span: 4 }" :wrapperCol="{ span: 24 }" name="addExplain" label=" 补充说明">
            <a-textarea :rows="4" v-model:value="planModel.addExplain" placeholder="请输入" show-count :maxlength="800"/>
          </a-form-item>
        </a-col>
      </a-row>
      <a-row v-if="addExplain2flag && titleCode == '1'">
        <a-col :span="24">
          <a-form-item :labelCol="{ span: 4 }" :wrapperCol="{ span: 24 }" name="file" label="补充资料">
            <a-upload
              v-model:file-list="fileList"
              :action="uploadAction"
              :headers="headers"
              :data="{'biz': 'eiaAdd'}"
              :max-count="10"
              :before-upload="beforeUploadFile"
              @change="handlefileChange"
            >
              <a-button>
                <upload-outlined></upload-outlined>
                添加附件
              </a-button>
            </a-upload>
          </a-form-item>
        </a-col>
      </a-row>
      <a-row v-show="false">
        <a-col :span="24">
        <a-form-item :labelCol="{ span: 4 }" name="attach" :wrapperCol="{ span: 24 }" label="补充资料">
          <a-input v-model:value="planModel.attach"/>
        </a-form-item>
        </a-col>
      </a-row>
      <a-row v-if="addExplain2flag && titleCode == '1'">
        <a-col :span="24">
          <a-form-item :labelCol="{ span: 4 }" name="auditorName" :wrapperCol="{ span: 24 }" label="下一节点审核人">
            <a-input v-model:value="planModel.auditorName" @click="() => {openModal(true, {field: 'auditorName'})}"/>
          </a-form-item>
        </a-col>
      </a-row>

    <!--   审核   -->
      <a-row v-if="titleCode == '2'">
        <a-col :span="24">
          <a-form-item :labelCol="{ span: 4 }" name="status" :wrapperCol="{ span: 24 }" label="审核结果">
            <a-radio-group v-model:value="planModel.status">
              <a-radio value="2">通过</a-radio>
              <a-radio value="3">不通过</a-radio>
            </a-radio-group>
          </a-form-item>
        </a-col>
      </a-row>
      <a-row v-if="titleCode == '2'">
        <a-col :span="24">
          <a-form-item :labelCol="{ span: 4 }" :wrapperCol="{ span: 24 }" name="auditStatement" label=" 审核说明">
            <a-textarea :rows="4" v-model:value="planModel.auditStatement" placeholder="请输入" show-count :maxlength="800"/>
          </a-form-item>
        </a-col>
      </a-row>
    </a-form>
<!--    <BasicForm @register="registerForm"/>-->
  </BasicDrawer>
  <RoleUserModal @register="registerUserModal" @success="handleUser" />
</template>

<script lang="ts" setup>
  import {ref, computed, unref, reactive} from 'vue';
  import RoleUserModal from '../../hooks/RoleUserModal.vue';
  import {BasicModal, useModal, useModalInner} from '/@/components/Modal';
  import {BasicDrawer, useDrawerInner} from '/@/components/Drawer';
  import { UploadOutlined } from '@ant-design/icons-vue';
  import {BasicForm, useForm} from '/@/components/Form/index';
  import {formSchema, searchFormSchema} from '../EhsEiaAdd.data';
  import {saveOrUpdate, notAuthList} from '../EhsEiaAdd.api';
  import {FormInstance, UploadChangeParam, UploadProps} from "ant-design-vue";
  import {getToken} from "/@/utils/auth";
  import {picPreviewUrl, previewFile, uploadUrl} from "/@/api/common/api";
  import {useMessage} from "/@/hooks/web/useMessage";
  import type { Rule } from 'ant-design-vue/es/form';
  //table
  import { ActionItem, BasicColumn, BasicTable, TableAction } from '/@/components/Table';
  import { useListPage } from '/@/hooks/system/useListPage';
  import {defHttp} from "/@/utils/http/axios";
  import {render} from "/@/utils/common/renderUtils";
  import {initDictOptions} from "/@/utils/dict";
  import {filterMultiDictText} from "/@/utils/dict/JDictSelectUtil";
  //
  const [registerUserModal, { openModal }] = useModal();
  // Emits声明
  const emit = defineEmits(['register', 'success']);
  const isUpdate = ref(true);
  const titleCode = ref('1');
  //表单modal
  const planModel = reactive({ });
  //补充资料
  const uploadAction = uploadUrl;
  const headers = { 'X-Access-Token': getToken() };
  const fileList = ref<UploadProps['fileList']>([]);
  const auditIds = ref('');
  const auditorName = ref('');
  const auditOrgCodes = ref('');
  const fileListShow = ref<UploadProps['fileList']>([]);
  const { createMessage } = useMessage();
  //列数据
  const record = ref({});
  const recordShow = ref({});
  const auditList = ref([]);
  const addExplain2flag = ref(false);
  const showExplainflag = ref(false);
  const auditsFlag = ref(false);
  const formEl = ref<FormInstance>();
  //表单配置
  // const [registerForm, {setProps, resetFields, setFieldsValue, validate}] = useForm({
  //   //labelWidth: 150,
  //   schemas: formSchema,
  //   showActionButtonGroup: false,
  //   baseColProps: {span: 24}
  // });
  const dictAddType = ref<any>([]);
  initDictOptions('eia_add_type').then(e=>{
     dictAddType.value = e;
  });

  //表单赋值
  const [registerModal, {setDrawerProps, closeDrawer}] = useDrawerInner(async (data) => {
    //重置表单
    // await resetFields();
    let submitText = "";
    if (unref(titleCode) == '1'){
      submitText = '提交审核';
    }else if(unref(titleCode) == '2'){
      submitText = '提交';
    }
    setDrawerProps({
      okText: submitText,
      confirmLoading: false,
      showCancelBtn: !!data?.showFooter,
      showOkBtn: !!data?.showFooter
    });
    isUpdate.value = !!data?.isUpdate;
    titleCode.value = data.titleCode;
    record.value = Object.assign({}, data.record);
    recordShow.value = Object.assign({}, data.record);
    recordShow.value.typeTex = filterMultiDictText(dictAddType.value, recordShow.value.type);
    if(record.value.attach != "" && record.value.attach != null){
      fileListShow.value = record.value.attach.split(",").map(e => {
        return {
          uid: Math.random(),
          name: e.split("/")[e.split("/").length-1],
          status: 'done',
          path: e,
          url: picPreviewUrl + e
        }
      });
    }
    recordShow.value.auditorName = recordShow.value.auditorName==undefined ? '' : recordShow.value.auditorName;
    if (unref(isUpdate)) {
      //表单赋值
      // await setFieldsValue({
      //   ...data.record,
      // });
    }
    // 隐藏底部时禁用整个表单
    // setProps({disabled: !data?.showFooter})
    init();
  });
  //设置标题
  let title = '补充资料';
  if (unref(titleCode) == '1'){
    title = '补充资料';
  }else if(unref(titleCode) == '2'){
    title = '补充资料审核';
  }
  let validateAttach = async (_rule: Rule, value: string) => {
    if (planModel.attach === undefined || planModel.attach === '') {
      return Promise.reject('请上传补充资料！');
    } else {
      return Promise.resolve();
    }
  };
  let validateAuditStatement = async (_rule: Rule, value: string) => {
    if (planModel.status == '3' && (value === undefined || value === '')) {
      return Promise.reject('请填写审核说明！');
    } else {
      return Promise.resolve();
    }
  };
  const rules: Record<string, Rule[]> = {
    addExplain: [{ required: true, message: '请填写补充说明！', trigger: 'change' }],
    file: [{required:true, validator: validateAttach, trigger: 'change' }],
    auditorName: [{ required: true, message: '请选择审核人！', trigger: 'change' }],
    status: [{ required: true, message: '请选择审核结果！', trigger: 'change' }],
    auditStatement: [{ validator: validateAuditStatement, trigger: 'change' }],
  };

  //定义表格列字段
  const columns: BasicColumn[] = [
    {
      title: '审核人',
      dataIndex: 'auditorName',
      align: 'center',
    },
    {
      title: '审核意见',
      dataIndex: 'auditStatement',
      align: 'center',
    },
    {
      title: '审核结果',
      dataIndex: 'status',
      align: 'center',
      customRender: ({text}) => {
        return render.renderDict(text, 'eia_add_status');
      },
    },
    // {
    //   title: '补充',
    //   dataIndex: 'address',
    //   align: 'center',
    // },
  ];

  // 列表页面公共参数、方法
  const { tableContext } = useListPage({
    tableProps: {
      api: notAuthList,
      columns: columns,
      actionColumn: {
        width: 120,
      },
      useSearchForm: false,
      pagination: false,
      beforeFetch(info) {
        info['id'] = record.value.id;
        info['pageNo'] = 1;
        info['pageSize'] = 9999;
        return info;
      },
      afterFetch(result){
        auditList.value = result;
        return result;
      },
      showActionColumn: false,
      inset: true,
      formConfig:{
        showResetButton: false,
        showSubmitButton: false,
      }
    },
  });
  //BasicTable绑定注册
  const [registerTable,{setShowPagination, getRawDataSource}] = tableContext;

  function init(){
    //隐藏分页
    addExplain2flag.value = false;
    auditsFlag.value = false;
    showExplainflag.value = false;
    planModel.auditorName = '';
    if(record.value.status == '3'){
      showExplainflag.value = true;
      setShowPagination(false);
      planModel.auditorName = recordShow.value.auditorName;
      auditsFlag.value = true;
      addExplain2flag.value = true;
    }
    if(record.value.addStatus == '0'){
      addExplain2flag.value = true;
    }
  }
  // 选择角色或人回调
  function handleUser(val:any){
    auditIds.value = val.approvalContentOne;
    auditorName.value = val.approvalContentTwo;
    auditOrgCodes.value = val.approvalContentThree;
    planModel.auditorName = recordShow.value.auditorName == '' ? val.approvalContentTwo :  recordShow.value.auditorName + ',' + val.approvalContentTwo;
  }
  //表单提交事件
  async function handleSubmit(v) {
    try {
      if (unref(titleCode) == '1'){//补充资料
        formEl.value.validate().then(async(values) => {
          // let values = await validate();
          setDrawerProps({confirmLoading: true});
          //提交表单
          // await saveOrUpdate(values, isUpdate.value);
          let url = '/eia/ehsEiaAdd/addMaterials';
          let infoFormData = {
            'id': record.value.id,
            'attach': planModel.attach,
            'addExplain': planModel.addExplain,
            'auditorId': auditIds.value,
            'auditorName': auditorName.value,
            'auditorOrgCode': auditOrgCodes.value,
          };
          if(record.value.status == '3'){
            infoFormData.addAuditId = record.value.addAuditId;
          }
          await defHttp.post({url: url,params: infoFormData});
          formEl.value.resetFields();
          //关闭弹窗
          closeDrawer();
          //刷新列表
          emit('success');
        })
      }else if(unref(titleCode) == '2'){//审核
        formEl.value.validate().then(async(values) => {
          // let values = await validate();
          setDrawerProps({confirmLoading: true});
          //提交表单
          let url = '/eia/ehsEiaAddAudit/audit';
          let infoFormData = {
            'id': record.value.addAuditId,
            'status': planModel.status,
            'auditStatement': planModel.auditStatement,
          };
          await defHttp.post({url: url,params: infoFormData});
          formEl.value.resetFields();
          //关闭弹窗
          closeDrawer();
          //刷新列表
          emit('success');
        })
      }

    } finally {
      setDrawerProps({confirmLoading: false});
    }
  }

  const handlePreview = async (file: UploadProps['fileList'][number]) => {
    previewFile(file.path).then((res) => {
      window.open(res, '_blank');
    });
  };

  function drawerClose(){
    formEl.value.resetFields();
    fileList.value = [];
  }

  const beforeUploadFile: UploadProps['beforeUpload'] = file => {
    const isLt300M = file.size / 1024 / 1024 < 300;
    if (!isLt300M) {
      createMessage.error('文件过大，请不要超过300M！');
      return false;
    }
    return true;
  };

  function handlefileChange(info: UploadChangeParam) {
    if(Array.isArray(info.fileList) && info.fileList.length > 0){
      fileList.value = info.fileList.map(e=>{
        if(e.status === 'done'){
          if(e.hasOwnProperty('url') && !e.hasOwnProperty('response')){
            return  {
              uid: Math.random(),
              name: e.url.split("/")[e.url.split("/").length-1],
              path: e.path,
              status: 'done',
              url: e.url
            }
          }
          if(e.hasOwnProperty('response') && e.response.code === 200){
            return  {
              uid: Math.random(),
              name: e.name,
              path: e.response.message,
              status: 'done',
              url: picPreviewUrl + e.response.message
            }
          }
        }else{
          return e
        }
      });
      planModel.attach = fileList.value.map(e=>{
        return e.path;
      }).join(',');
    }else{
      planModel.fileList = [];
      planModel.attach = '';
    }
  }
</script>

<style lang="less" scoped>
  /** 时间和数字输入框样式 */
  :deep(.ant-input-number) {
    width: 100%
  }

  :deep(.ant-calendar-picker) {
    width: 100%
  }
</style>
