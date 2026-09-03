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
  import { add, edit } from './plan.api';
  import { duplicateCheck } from '/@/views/system/user/user.api';
  import { useUserStore } from '/@/store/modules/user';
  import { message, Upload } from 'ant-design-vue';
  import { getDepart3ListWithSecurity, selectDeptNew } from '/@/api/common/api';

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
      const isUpdate = ref<Boolean>(true);
      const getTitle = ref('');
      const roleId = ref('');
      const orgOptions: any = ref([]);
      const departOptions: any = ref([]);
      const orgDisabled = ref(false);
      const departDisabled = ref(false);
      async function getOrgList() {
        await getDepart3ListWithSecurity().then((res) => {
          if (res.length > 0) {
            res.map((item) => {
              orgOptions.value.push({
                label: item.departName,
                value: item.orgCode,
              });
            });
          }
          if (res.length > 1) {
            // 所属单位可以编辑
            orgDisabled.value = false;
            departDisabled.value = false;
          }
          if (res.length == 1) {
            // 所属单位不可编辑
            orgDisabled.value = true;
            // 如果只有一个机构，当前登录人所属部门是安全科，部门可选
            if (userinfo.value.orgCode.length > 9) {
              if (loginInfo.value.departs?.length > 0) {
                if (loginInfo.value.departs[0].departName == '安全科') {
                  departDisabled.value = false;
                } else {
                  departDisabled.value = true;
                }
              }
            } else {
              departDisabled.value = false;
            }
          }
        });
        console.log('options', orgOptions.value);
      }
      getOrgList();
      // 注册弹窗
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
        // 下次点击弹窗的时候清空表单
        await resetFields();
        setModalProps({ confirmLoading: false, minHeight: 80, showCancelBtn: !!data?.showFooter, showOkBtn: !!data?.showFooter });
        isUpdate.value = !!data?.isUpdate;
        departOptions.value = [];
        if (unref(isUpdate)) {
          //表单赋值
          await setFieldsValue({
            ...data.record,
          });
          console.log('data.record', data.record, data.record.id);
          roleId.value = data.record.id;
        } else {
          // 获取部门列表
          const orgCode = userinfo.value?.orgCode || '';
          if (orgCode.length > 9) {
            await setFieldsValue({
              orgCode: orgCode.slice(0, 9),
              workshop: orgCode.slice(0, 12),
            });
          } else if (orgCode.length == 9) {
            await setFieldsValue({
              orgCode: orgCode,
            });
          }
        }
        getDepartList(getFieldsValue().orgCode);
        // 隐藏底部时禁用整个表单
        setProps({ disabled: !data?.showFooter });
      });
      async function getDepartList(orgCode: string) {
        await selectDeptNew({ orgCode: orgCode }).then((res) => {
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
      // 注册表单
      const [registerForm, { validate, setFieldsValue, setProps, resetFields, getFieldsValue }] = useForm({
        schemas: [
          {
            label: 'id',
            field: 'id',
            component: 'Input',
            show: false,
          },
          {
            field: 'planYear',
            label: '计划年度',
            component: 'DatePicker',
            required: true,
            defaultValue: new Date(),
            componentProps: {
              picker: 'year',
              valueFormat: 'YYYY',
              style: { width: '100%' },
            },
          },
          {
            label: '所属单位',
            field: 'orgCode',
            component: 'Select',
            required: true,
            componentProps: () => {
              return {
                disabled: orgDisabled.value,
                options: orgOptions,
                getPopupContainer: () => document.body,
                showSearch: true,
                filterOption: (input: string, option: any) => {
                  return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
                },
                onChange: (value) => {
                  if (value) {
                    getDepartList(value);
                  } else {
                    departOptions.value = [];
                    setFieldsValue({
                      workshop: undefined,
                    });
                  }
                },
              };
            },
          },
          // 所属部门
          {
            field: 'workshop',
            label: '所属部门',
            component: 'Select',
            required: true,
            componentProps: () => {
              return {
                options: departOptions,
                getPopupContainer: () => document.body,
                showSearch: true,
                filterOption: (input: string, option: any) => {
                  return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
                },
                disabled: departDisabled.value,
              };
            },
          },
          {
            field: 'planName',
            label: '计划名称',
            required: true,
            component: 'Input',
            dynamicRules: ({ model }) => {
              console.log('model', model);
              return [
                { required: true, message: '计划名称不能为空！' },
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
            field: 'fileUrl',
            label: '相关文件',
            component: 'JUpload',
            // rules: [
            //   {
            //     required: true,
            //     message: '相关文件不能为空！',
            //   },
            // ],
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
