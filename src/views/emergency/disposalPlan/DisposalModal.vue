<template>
  <div>
    <BasicModal v-bind="$attrs" @register="registerModal" :title="getTitle" @ok="onSubmit">
      <BasicForm @register="registerForm" />
    </BasicModal>
  </div>
</template>
  
  <script lang="ts">
import { computed, ref, unref } from 'vue';
import { BasicModal, useModalInner } from '/@/components/Modal';
import { BasicForm, useForm } from '/@/components/Form/index';
import { add, edit } from './disposal.api';
import { duplicateCheck } from '/@/views/system/user/user.api';
import { defHttp } from '/@/utils/http/axios';
import { useUserStore } from '/@/store/modules/user';
import { message, Upload } from 'ant-design-vue';
import { getOrgCodeList, getDepartmentList } from '/@/api/common/api';

const userStore = useUserStore();
console.log('userStore', userStore);
const userinfo = computed(() => userStore.getUserInfo);
console.log('userinfo', userinfo);
const loginInfo = computed(() => userStore.getLoginInfo);
console.log('loginInfo', loginInfo);
// let isSecuritySector = loginInfo.value.departs[0].isSecuritySector;

export default {
  name: 'DisposalModal',
  components: { BasicModal, BasicForm },
  emits: ['success', 'register'],
  setup(_props, { emit }) {
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
          console.log('1111111', params, res);
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

      return queryParam.orgCode;
    }
    function initDeptCode() {
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
      return queryParam.departCode;
    }
    const isUpdate = ref<Boolean>(true);
    const getTitle = computed(() => (!unref(isUpdate) ? '新增' : '编辑'));
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
    async function getResponsePlanOptions() {
      let params = {};
      params.pageSize = 9999;
      params.pageNo = 1;
      await defHttp.get({ url: '/emergency/emergencyResponsePlan/list', params }).then((res) => {
        res.records.map((item) => {
          responsePlanOptions.value.push({
            label: item.name,
            value: item.id,
          });
        });
      });
      console.log('options', orgOptions.value);
    }
    getOrgList();
    getResponsePlanOptions();
    // 注册弹窗
    // 这个方法执行需要openModal传入第二个参数
    const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
      console.log('useModalInner data', data);
      // 下次点击弹窗的时候清空表单
      await resetFields();
      setModalProps({ confirmLoading: false });
      isUpdate.value = !!data?.isUpdate;
      departOptions.value = [];
      if (unref(isUpdate)) {
        // let params = {};
        // params.orgCode = data.record.orgCode;
        // params.pageSize = 9999;
        // params.pageNo = 1;
        // departOptions.value = [];
        // await defHttp.get({ url: '/jn/common/selectDept?orgCategories=1,2,4', params }).then((res) => {
        //   console.log('222222', params, res);
        //   res.records.map((item) => {
        //     departOptions.value.push({
        //       label: item.departName,
        //       value: item.orgCode,
        //     });
        //   });
        // });
        // updateSchema({
        //   field: 'departCode',
        //   componentProps: {
        //     options: departOptions.value,
        //   },
        // });
        //表单赋值
        await setFieldsValue({
          ...data.record,
        });
        console.log('data.record', data.record, data.record.id);
        roleId.value = data.record.id;
      }
      // else {
      //   let params = {};
      //   // departOptions.value = [];
      //   params.orgCode = getFieldsValue().orgCode;
      //   params.pageSize = 9999;
      //   params.pageNo = 1;
      //   await defHttp.get({ url: '/sys/sysDepart/selectDept', params }).then((res) => {
      //     console.log('333333', params, res);
      //     if (res && res.records && res.records.length) {
      //       res.records.map((item) => {
      //         departOptions.value.push({
      //           label: item.departName,
      //           value: item.orgCode,
      //         });
      //       });
      //     } else {
      //       departOptions.value = [];
      //     }
      //   });
      //   updateSchema({
      //     field: 'departCode',
      //     componentProps: {
      //       options: departOptions.value,
      //     },
      //   });
      //   // await setFieldsValue({
      //   //   orgCode: orgCode,
      //   //   departCode: initDeptCode(),
      //   // });
      // }
    });
    // 注册表单
    const [registerForm, { validate, setFieldsValue, getFieldsValue, resetFields, updateSchema }] = useForm({
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
          required: true,
          defaultValue: initOrgCode(),
          dynamicDisabled: ({ values }) => {
            // let orgCode = initOrgCode();
            // console.log('orgCode', orgCode);
            // if (orgCode && orgCode.length > 3 && isSecuritySector != 1 && orgCode.slice('0', '6') != 'A04B01') {
            //   return true;
            // } else {
            //   return false;
            // }
          },
          componentProps: ({ formModel, formActionType }) => {
            return {
              options: orgOptions,
              placeholder: '请选择',
              onChange: async (e: any) => {
                console.log('e', e);
                // getResponsePlanOptions(e);
                departOptions.value = [];
                formModel.departCode = undefined; //  reset city value
                if (e) {
                  let params = {};
                  params.orgCode = e;
                  params.pageSize = 9999;
                  params.pageNo = 1;
                  await getDepartmentList(params).then((res) => {
                    console.log('444444', params, res);
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
                    console.log('departOptions.value', departOptions.value);
                    const { updateSchema } = formActionType;
                    updateSchema({
                      field: 'departCode',
                      componentProps: {
                        options: departOptions.value,
                      },
                    });
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
          component: 'JDictSelectTag',
          required: true,
          componentProps: {
            dictCode: 'emergency_disposal_classify',
            placeholder: '请选择分类',
            stringToNumber: false,
          },
        },
        {
          field: 'name',
          label: '名称',
          required: true,
          component: 'Input',
          dynamicRules: ({ model }) => {
            console.log('model', model);
            return [
              { required: true, message: '名称不能为空！' },
              { min: 0, max: 50, message: '请输入50字内的名称！', trigger: 'blur' },
              {
                validator: (_, value) => {
                  if (value) {
                    value = value.trim();
                  }
                  return new Promise((resolve, reject) => {
                    let params = {
                      tableName: 'emergency_response_plan',
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
          field: 'filePath',
          label: '文件',
          component: 'JUpload',
          rules: [
            {
              required: true,
              message: '文件不能为空！',
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
      if (unref(isUpdate)) {
        values.id = roleId.value;
        await edit(values);
      } else {
        await add(values);
      }
      closeModal();
      emit('success');
    }

    return {
      registerModal,
      registerForm,
      getTitle,
      onSubmit,
    };
  },
};
</script>
  
  <style></style>
  