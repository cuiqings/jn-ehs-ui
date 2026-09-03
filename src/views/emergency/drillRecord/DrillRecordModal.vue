<template>
  <div>
    <BasicModal v-bind="$attrs" @register="registerModal" @ok="onSubmit">
      <BasicForm @register="registerForm" />
    </BasicModal>
  </div>
</template>

<script lang="ts">
  import { computed, ref, unref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import { saveOrUpdate, orgList } from './drillRecord.api';
  import { defHttp } from '/@/utils/http/axios';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { duplicateCheck } from '/@/views/system/user/user.api';
  import { useUserStore } from '/@/store/modules/user';
  import { message, Upload } from 'ant-design-vue';
  import { getOrgCodeList, getDepartmentList } from '/@/api/common/api';

  const userStore = useUserStore();
  const userinfo = computed(() => userStore.getUserInfo);
  const loginInfo = computed(() => userStore.getLoginInfo);
  console.log('userinfo loginInfo', userinfo, loginInfo);
  // let isSecuritySector = loginInfo.value.departs[0].isSecuritySector;

  const { createMessage } = useMessage();
  export default {
    name: 'PlanModal',
    components: { BasicModal, BasicForm },
    emits: ['success', 'register'],
    setup(_props, { emit }) {
      const isUpdate = ref<Boolean>(true);
      const showFooter = ref<Boolean>(true);
      // const getTitle = computed(() => (!unref(isUpdate) ? '新增' : '编辑'));
      const roleId = ref('');
      const orgOptions = ref([]);
      const departOptions = ref([]);
      const responsePlanOptions = ref([]);
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
      async function getResponsePlanOptions(orgCode) {
        responsePlanOptions.value = [];
        let params = {};
        params.pageSize = 9999;
        params.pageNo = 1;
        params.orgCode = orgCode;
        await defHttp.get({ url: '/emergency/emergencyResponsePlan/list', params }).then((res) => {
          res.records.map((item) => {
            responsePlanOptions.value.push({
              label: item.name,
              value: item.id,
            });
          });
        });
        console.log('options', responsePlanOptions.value);
      }
      function initOrgCode() {
        let queryParam = {};
        if (userinfo.value.orgCode.length > 6) {
          queryParam.orgCode = userinfo.value.orgCode.slice('0', '6');
          queryParam.departCode = userinfo.value.orgCode;
        } else if (userinfo.value.orgCode.length == 6) {
          queryParam.orgCode = userinfo.value.orgCode;
          queryParam.departCode = undefined;
        } else {
          queryParam.orgCode = undefined;
          queryParam.departCode = undefined;
        }
        if (queryParam.orgCode) {
          let params = {};
          params.orgCode = queryParam.orgCode;
          params.pageSize = 9999;
          params.pageNo = 1;
          getDepartmentList(params).then((res) => {
            if (res && res.length > 0) {
              res.map((item) => {
                departOptions.value.push({
                  label: item.departName,
                  value: item.orgCode,
                });
              });
            } else {
              departOptions.value = [];
            }
          });
        }
        getResponsePlanOptions(queryParam.orgCode);
        return queryParam.orgCode;
      }
      function initDeptCode() {
        let queryParam = {};
        if (userinfo.value.orgCode.length > 6) {
          queryParam.orgCode = userinfo.value.orgCode.slice('0', '6');
          queryParam.departCode = userinfo.value.orgCode;
        } else if (userinfo.value.orgCode == 6) {
          queryParam.orgCode = userinfo.value.orgCode;
          queryParam.departCode = undefined;
        } else {
          queryParam.orgCode = undefined;
          queryParam.departCode = undefined;
        }
        return queryParam.departCode;
      }
      // 注册表单
      const [registerForm, { validate, getFieldsValue, setFieldsValue, resetFields, setProps, updateSchema }] = useForm({
        schemas: [
          {
            label: 'id',
            field: 'id',
            component: 'Input',
            show: false,
          },
          {
            label: '所属机构',
            field: 'orgCode',
            component: 'Select',
            defaultValue: initOrgCode(),
            required: true,
            componentProps: ({ formModel, formActionType }) => {
              const { updateSchema } = formActionType;
              return {
                options: orgOptions,
                placeholder: '请选择',
                onChange: (e: any) => {
                  console.log('e', e);
                  departOptions.value = [];
                  responsePlanOptions.value = [];
                  formModel.departCode = undefined; //  reset city value
                  if (e) {
                    getResponsePlanOptions(e);
                    let params = {};
                    params.orgCode = e;
                    params.pageSize = 9999;
                    params.pageNo = 1;
                    getDepartmentList(params).then((res) => {
                      if (res && res.length > 0) {
                        res.map((item) => {
                          departOptions.value.push({
                            label: item.departName,
                            value: item.orgCode,
                          });
                        });
                      } else {
                        departOptions.value = [];
                      }
                    });
                    updateSchema({
                      field: 'departCode',
                      componentProps: {
                        options: departOptions.value,
                      },
                    });
                    updateSchema({
                      field: 'responsePlanId',
                      componentProps: {
                        options: responsePlanOptions.value,
                      },
                    });
                  }
                },
              };
            },
          },
          {
            label: '所属部门',
            field: 'departCode',
            component: 'Select',
            defaultValue: initDeptCode(),
            componentProps: {
              options: departOptions.value, // defalut []
              placeholder: '请选择',
            },
          },
          {
            label: '分类',
            field: 'typeCode',
            required: true,
            component: 'JDictSelectTag',
            componentProps: {
              dictCode: 'emergency_disposal_classify',
              placeholder: '请选择',
              stringToNumber: false,
            },
          },
          {
            field: 'name',
            label: '演练名称',
            required: true,
            component: 'Input',
            dynamicRules: ({ model }) => {
              console.log('model', model);
              return [
                { required: true, message: '演练名称不可为空！' },
                { min: 0, max: 50, message: '请输入50字内的演练名称！', trigger: 'blur' },
                {
                  validator: (_, value) => {
                    return new Promise((resolve, reject) => {
                      if (value) {
                        value = value.trim();
                      }
                      let params = {
                        tableName: 'emergency_drill_record',
                        fieldName: 'name',
                        fieldVal: value,
                        dataId: model.id,
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
            label: '应急处置方案',
            field: 'responsePlanId',
            component: 'Select',
            componentProps: {
              options: responsePlanOptions.value,
              placeholder: '请选择',
            },
          },
          {
            field: 'drillRecordPath',
            label: '演练记录',
            component: 'JUpload',
            rules: [
              {
                required: true,
                message: '演练记录表不可为空！',
              },
            ],
            componentProps: {
              maxCount: 1,
              // accept: '.pdf,.doc,.docx',
              beforeUpload: (file: File) => {
                const isLt300M = file.size / 1024 / 1024 < 300;
                const isPdf = file.type === 'application/pdf';
                const isDoc = file.type === 'application/msword';
                const isDocx = file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
                if (!isLt300M) {
                  message.error('文件过大，请不要超过300M！');
                  return false || Upload.LIST_IGNORE;
                } else if (!isPdf && !isDoc && !isDocx) {
                  message.error(`文件格式错误，仅支持doc、docx、pdf格式!推荐pdf格式上传！`);
                  return false || Upload.LIST_IGNORE;
                }
                return true;
              },
            },
          },
          {
            field: 'drillCheckinPath',
            label: '演练签到表',
            component: 'JUpload',
            rules: [
              {
                required: true,
                message: '演练签到表不可为空！',
              },
            ],
            componentProps: {
              maxCount: 1,
              // accept: '.pdf,.doc,.docx',
              beforeUpload: (file: File) => {
                const isLt300M = file.size / 1024 / 1024 < 300;
                const isPdf = file.type === 'application/pdf';
                const isDoc = file.type === 'application/msword';
                const isDocx = file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
                if (!isLt300M) {
                  message.error('文件过大，请不要超过300M！');
                  return false || Upload.LIST_IGNORE;
                } else if (!isPdf && !isDoc && !isDocx) {
                  message.error(`文件格式错误，仅支持doc、docx、pdf格式!推荐pdf格式上传！`);
                  return false || Upload.LIST_IGNORE;
                }
                return true;
              },
            },
          },
          {
            field: 'drillEvaluatePath',
            label: '演练评估表',
            component: 'JUpload',
            rules: [
              {
                required: true,
                message: '演练评估表不可为空！',
              },
            ],
            componentProps: {
              maxCount: 1,
              // accept: '.pdf,.doc,.docx',
              beforeUpload: (file: File) => {
                const isLt300M = file.size / 1024 / 1024 < 300;
                const isPdf = file.type === 'application/pdf';
                const isDoc = file.type === 'application/msword';
                const isDocx = file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
                if (!isLt300M) {
                  message.error('文件过大，请不要超过300M！');
                  return false || Upload.LIST_IGNORE;
                } else if (!isPdf && !isDoc && !isDocx) {
                  message.error(`文件格式错误，仅支持doc、docx、pdf格式!推荐pdf格式上传！`);
                  return false || Upload.LIST_IGNORE;
                }
                return true;
              },
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
        console.log('validate value', values);
        if (values.departCode == undefined) {
          values.departCode = '';
        }
        if (values.typeCode == undefined) {
          values.typeCode = '';
        }
        if (values.responsePlanId == undefined) {
          values.responsePlanId = '';
        }
        if (unref(isUpdate)) {
          values.id = roleId.value;
          await saveOrUpdate(values, isUpdate.value);
        } else {
          await saveOrUpdate(values, isUpdate.value);
        }
        closeModal();
        emit('success');
      }
      // 注册弹窗
      // 这个方法执行需要openModal传入第二个参数
      const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
        console.log('useModalInner data', data);
        // 下次点击弹窗的时候清空表单
        await resetFields();
        getOrgList();

        setModalProps({ confirmLoading: false, showCancelBtn: !!data?.showFooter, showOkBtn: !!data?.showFooter, title: data.title });
        isUpdate.value = !!data?.isUpdate;
        showFooter.value = !!data?.showFooter;
        // title.value = data.title;
        if (unref(isUpdate)) {
          departOptions.value = [];
          let params = {};
          params.orgCode = data.record.orgCode;
          params.pageSize = 9999;
          params.pageNo = 1;
          await getDepartmentList(params).then((res) => {
            res.map((item) => {
              departOptions.value.push({
                label: item.departName,
                value: item.orgCode,
              });
            });
          });
          updateSchema({
            field: 'departCode',
            componentProps: {
              options: departOptions.value,
            },
          });
          await getResponsePlanOptions(data.record.orgCode);
          updateSchema({
            field: 'responsePlanId',
            componentProps: {
              options: responsePlanOptions.value,
            },
          });
          //表单赋值
          await setFieldsValue({
            ...data.record,
          });
          console.log('data.record', data.record);
          roleId.value = data.record.id;
        } else {
          departOptions.value = [];
          responsePlanOptions.value = [];
          getResponsePlanOptions(getFieldsValue().orgCode);
          updateSchema({
            field: 'responsePlanId',
            componentProps: {
              options: responsePlanOptions.value,
            },
          });
        }
        // 隐藏底部时禁用整个表单
        setProps({ disabled: !data?.showFooter });
      });

      return {
        registerModal,
        registerForm,
        // getTitle,
        onSubmit,
      };
    },
  };
</script>

<style></style>
