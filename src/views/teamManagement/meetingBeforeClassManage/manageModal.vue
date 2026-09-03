<template>
  <basic-modal
    v-bind="$attrs"
    @register="registerModal"
    :width="600"
    :title="title"
    :body-style="{ padding: '0 10px', maxHeight: '600px', overflow: 'auto' }"
    destroyOnClose
    :canFullscreen="false"
    :maskClosable="false"
    @ok="confirmClose"
  >
    <BasicForm @register="registerForm" />
  </basic-modal>
</template>
<script lang="ts" name="manage-modal" setup>
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { ref, computed } from 'vue';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import { FormSchema } from '/@/components/Table';
  import { selectDeptNew, getDepart3ListWithSecurity, getTeamList1 } from '/@/api/common/api';
  import { useUserStore } from '/@/store/modules/user';
  import { add, edit } from './api';
  const emit = defineEmits(['success']);
  const userStore: any = useUserStore();
  const userInfo = computed(() => userStore.getUserInfo);
  const loginInfo = computed(() => userStore.getLoginInfo);
  const isSecuritySector = loginInfo.value.departs[0]?.isSecuritySector;
  const title = ref('');
  const type = ref('');
  const orgOptions: any = ref([]);
  const departOptions: any = ref([]);
  const teamOptions: any = ref([]);
  const formSchema: FormSchema[] = [
    {
      label: '',
      field: 'id',
      component: 'Input',
      show: false,
    },
    {
      label: '所属单位',
      field: 'orgCode',
      required: true,
      component: 'Select',
      componentProps: () => {
        return {
          options: [],
          placeholder: '请选择',
          showSearch: true,
          filterOption: (input: string, option: any) => {
            return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
          },
          getPopupContainer: () => document.body,
        };
      },
    },
    {
      label: '',
      field: 'orgName',
      component: 'Input',
      show: false,
    },
    {
      label: '所属车间',
      field: 'departCode',
      component: 'Select',
      required: true,
      componentProps: {
        options: [],
        showSearch: true,
        filterOption: (input: string, option: any) => {
          return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
        },
        getPopupContainer: () => document.body,
      },
    },
    {
      label: '',
      field: 'departName',
      component: 'Input',
      show: false,
    },
    {
      label: '班组名称',
      field: 'teamId',
      component: 'Select',
      required: true,
      componentProps: {
        options: [],
        showSearch: true,
        mode: 'multiple',
        filterOption: (input: string, option: any) => {
          return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
        },
        getPopupContainer: () => document.body,
      },
    },
    {
      label: '',
      field: 'teamName',
      component: 'Input',
      show: false,
    },
    {
      label: '上班方式',
      field: 'workType',
      required: true,
      component: 'Select',
      componentProps: {
        placeholder: '请选择',
        options: [
          { label: '三班倒', value: '1' },
          { label: '两班倒', value: '2' },
          { label: '长白班', value: '3' },
        ],
      },
    },
  ];
  //表单配置
  const [registerForm, { resetFields, validate, updateSchema, setFieldsValue, clearValidate, setProps }] = useForm({
    schemas: formSchema,
    showActionButtonGroup: false,
    labelCol: {
      xs: { span: 24 },
      sm: { span: 4 },
    },
    wrapperCol: {
      xs: { span: 24 },
      sm: { span: 20 },
    },
  });
  const [registerModal, { closeModal, setModalProps }] = useModalInner(async (data) => {
    await resetFields();
    title.value = data.title;
    type.value = data.type;
    init();
    setModalProps({
      showOkBtn: type.value !== 'view',
    });
    if (type.value !== 'add') {
      const obj = JSON.parse(JSON.stringify(data.data));
      obj.teamId = obj.teamId.split(',');
      getDepartList(obj.orgCode);
      getTeam(obj.departCode);
      setFieldsValue({ ...obj });
      setProps({ disabled: type.value === 'view' });
    }
  });
  const init = () => {
    getDepart3ListWithSecurity().then((res) => {
      orgOptions.value = res.map((item) => {
        return {
          label: item.departName,
          value: item.orgCode,
        };
      });
      updateSchema({
        field: 'orgCode',
        componentProps: {
          options: orgOptions.value,
          showSearch: true,
          disabled: orgOptions.value.length === 1,
          filterOption: (input: string, option: any) => {
            return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
          },
          getPopupContainer: () => document.body,
          onChange: (value, extra) => {
            setFieldsValue({
              departCode: undefined,
              teamId: undefined,
              orgName: undefined,
              departName: undefined,
              teamName: undefined,
            });
            updateSchema({
              field: 'departCode',
              componentProps: {
                options: [],
              },
            });
            updateSchema({
              field: 'teamId',
              componentProps: {
                options: [],
              },
            });
            clearValidate(['departCode', 'teamId']);
            if (value) {
              setFieldsValue({
                orgName: extra.label,
              });
              getDepartList(value);
            }
          },
        },
      });
      if (orgOptions.value.length === 1 && type.value === 'add') {
        setFieldsValue({
          orgCode: orgOptions.value[0]?.value,
          orgName: orgOptions.value[0]?.label,
        });
        getDepartList(orgOptions.value[0].value);
      }
    });
  };
  // 车间
  const getDepartList = (orgCode) => {
    selectDeptNew({ orgCode }).then(async (res) => {
      departOptions.value = res.map((item: any) => {
        return {
          label: item.departName,
          value: item.orgCode,
        };
      });
      updateSchema({
        field: 'departCode',
        componentProps: {
          options: departOptions.value,
          showSearch: true,
          disabled: userInfo.value.orgCode.length > 9 && isSecuritySector !== '1',
          filterOption: (input: string, option: any) => {
            return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
          },
          onChange: (value, extra) => {
            setFieldsValue({
              teamId: undefined,
              departName: undefined,
              teamName: undefined,
            });
            updateSchema({
              field: 'teamId',
              componentProps: {
                options: [],
              },
            });
            clearValidate(['teamId']);
            if (value) {
              setFieldsValue({
                departName: extra.label,
              });
              getTeam(value);
            }
          },
        },
      });
      if (userInfo.value.orgCode.length > 9 && isSecuritySector !== '1' && type.value === 'add') {
        setFieldsValue({
          departCode: userInfo.value.orgCode,
          departName: departOptions.value.filter((item) => item.value === userInfo.value.orgCode)[0].label,
        });
        getTeam(userInfo.value.orgCode);
      }
    });
  };
  const getTeam = (workShopCode) => {
    getTeamList1({
      workShopCode,
    }).then((res) => {
      teamOptions.value = res.map((item: any) => {
        return {
          label: item.sectionName,
          value: item.id,
        };
      });
      updateSchema({
        field: 'teamId',
        componentProps: {
          options: teamOptions.value,
          onChange: (value, extra) => {
            setFieldsValue({
              teamName: undefined,
            });
            if (value) {
              setFieldsValue({
                teamName: extra.map((item) => item.label).join(','),
              });
            }
          },
        },
      });
    });
  };
  const confirmClose = async () => {
    const values = await validate();
    const data = JSON.parse(JSON.stringify(values));
    setModalProps({
      confirmLoading: true,
    });
    try {
      let res = null;
      if (type.value === 'add') {
        res = await add(data);
      } else {
        res = await edit(data);
      }
      if (res) {
        setModalProps({
          confirmLoading: false,
        });
        closeModal();
        emit('success');
      }
    } catch {
      setModalProps({
        confirmLoading: false,
      });
    }
  };
</script>
<style lang="less" scoped></style>
