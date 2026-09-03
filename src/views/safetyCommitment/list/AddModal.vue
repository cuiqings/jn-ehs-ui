<template>
  <BasicModal v-bind="$attrs" @register="registerModal" :title="title" width="900px">
    <template #footer v-if="showFooter">
      <a-button @click="closeModal">取消</a-button>
      <a-button @click="handleSaveDraft">保存草稿</a-button>
      <a-button type="primary" @click="handleSubmit">上传并发布</a-button>
    </template>
    <BasicForm @register="registerForm">
      <template #contentSlot="{ model, field }">
        <div class="flex flex-col">
          <div class="mb-2 text-right">
            <a-button v-if="showFooter" type="primary" ghost size="small" @click="handleUseExample">使用示例</a-button>
          </div>
          <JEditor :disabled="!showFooter" v-model:value="model[field]" :height="300" />
        </div>
      </template>
    </BasicForm>
    <a-modal v-model:visible="visible" width="1000px" title="使用示例" @ok="handleExampleOk" :bodyStyle="{ height: '600px' }">
      <iframe :srcdoc="exampleContent.example" frameborder="0" style="width: 100%; height: 100%"></iframe>
    </a-modal>
  </BasicModal>
</template>

<script lang="ts" setup>
  import { ref, nextTick } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicForm, useForm, FormSchema, JEditor } from '/@/components/Form';
  import { getTeamList1, getDepartTreeBy34, getUserById } from '/@/api/common/api';
  import { getTemplateExample, add, edit, getDetail, getSupervisorList } from './api';
  import { useUserStore } from '/@/store/modules/user';

  const emit = defineEmits(['success', 'register']);

  const userStore = useUserStore();
  const currentYear = new Date().getFullYear();
  const visible = ref(false);
  const isUpdate = ref(false);
  const showFooter = ref(true);
  const id = ref('');
  const title = ref('');
  const exampleContent = ref({
    example: '',
    content: '',
  });
  const originalSupervisor = ref({ id: '', name: '' });
  //   const [registerExampleModal, { openModal: openExampleModal, closeModal: closeExampleModal }] = useModal();

  const getSupervisorListWrapper = async (params) => {
    // 岗位层级是3和4的时候必须传承诺单位
    if (['3', '4'].includes(params.postLevel) && !params.orgCode) {
      return Promise.resolve([]);
    }
    return getSupervisorList(params);
  };

  const schemas: FormSchema[] = [
    {
      field: 'name',
      label: '模板名称',
      component: 'Input',
      required: true,
      componentProps: {
        placeholder: '请输入模板名称（50字以内）',
        maxLength: 50,
      },
      colProps: { span: 12 },
    },
    {
      field: 'year',
      label: '年度',
      component: 'Select',
      required: true,
      componentProps: {
        options: [
          { label: `${currentYear}`, value: `${currentYear}` },
          { label: `${currentYear + 1}`, value: `${currentYear + 1}` },
        ],
        placeholder: '请选择年度',
      },
      defaultValue: `${currentYear}`,
      colProps: { span: 12 },
    },
    {
      field: 'postLevel',
      label: '岗位层级',
      component: 'Select',
      required: true,
      componentProps: ({ formActionType, formModel }) => {
        return {
          options: [
            { label: '各事业部部长', value: '1' },
            { label: '科段级以上干部', value: '2' },
            { label: '班组长', value: '3' },
            { label: '一般员工', value: '4' },
          ],
          placeholder: '请选择岗位层级',
          onChange: (e: any) => {
            formModel.promiseUnit = undefined;
            formModel.team = undefined;
            formModel.promiserPost = undefined;
            const { updateSchema, clearValidate } = formActionType;
            clearValidate(['promiseUnit', 'team', 'promiserPost']);

            if (['1', '2', '3'].includes(e)) {
              updateSchema({
                field: 'promiserPost',
                component: 'JSelectRole',
                componentProps: {
                  isRadioSelection: false,
                  multi: true,
                  placeholder: '请选择角色',
                  api: undefined,
                  params: undefined,
                  labelField: undefined,
                  rowKey: 'roleCode',
                  resultField: undefined,
                  showSearch: undefined,
                  filterOption: undefined,
                  onOptionsChange: (options) => {
                    if (options && options.length > 0) {
                      formModel.promiserPostName = options.map((item) => item.roleName || item.label).join(',');
                    } else {
                      formModel.promiserPostName = '';
                    }
                  },
                },
              });
            } else if (e === '4') {
              updateSchema({
                field: 'promiserPost',
                component: 'JUserModal',
                componentProps: {
                  placeholder: '请选择用户',
                  orgCode: userStore.getUserInfo.orgCode,
                  teamId: formModel.team,
                  type: 'checkbox',
                  onConfirm: (namesStr) => {
                    formModel.promiserPostName = namesStr;
                  },
                },
              });
            }
          },
        };
      },
      colProps: { span: 24 },
    },
    {
      field: 'promiseUnit',
      label: '承诺单位',
      component: 'ApiTreeSelect',
      required: true,
      ifShow: ({ values }) => ['3', '4'].includes(values.postLevel),
      componentProps: ({ formModel, formActionType }) => {
        return {
          api: getDepartTreeData,
          fieldNames: { label: 'departName', value: 'orgCode', children: 'children' },
          treeDefaultExpandAll: true,
          placeholder: '请选择组织四级',
          onChange: async (e: any) => {
            formModel.team = undefined;
            formModel.supervisor = undefined;
            const { updateSchema } = formActionType;
            if (!e) {
              updateSchema({
                field: 'team',
                componentProps: { options: [] },
              });
            } else {
              let res = await getTeamList1({ workShopCode: e });
              // 如果res的长度大于0，过滤掉id为all的项
              if (res.length > 0) {
                res = res.filter((item: any) => item.id !== 'all');
              }
              const options = res.map((item: any) => ({
                label: item.sectionName,
                value: item.id,
              }));
              updateSchema({
                field: 'team',
                componentProps: {
                  options,
                  onChange: (e: any) => {
                    formModel.promiserPost = undefined;
                    if (formModel.postLevel === '4') {
                      updateSchema({
                        field: 'promiserPost',
                        componentProps: {
                          orgCode: formModel.promiseUnit,
                          teamId: e,
                        },
                      });
                    } else {
                      updateSchema({
                        field: 'promiserPost',
                        componentProps: {
                          params: { orgCode: formModel.promiseUnit, teamId: e },
                        },
                      });
                    }
                  },
                },
              });
            }
            if (formModel.postLevel === '4') {
              formModel.promiserPost = undefined;
              updateSchema({
                field: 'promiserPost',
                componentProps: {
                  orgCode: e,
                  teamId: undefined,
                },
              });
            }
          },
        };
      },
      colProps: { span: 12 },
    },
    {
      field: 'team',
      label: '所属班组',
      component: 'Select',
      ifShow: ({ values }) => ['3', '4'].includes(values.postLevel),
      //   required: ({ values }) => values.postLevel === '4',
      componentProps: {
        placeholder: '请选择班组',
        options: [],
        showSearch: true,
        filterOption: (input: string, option: any) => {
          return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
        },
      },
      colProps: { span: 12 },
    },
    {
      field: 'promiserPost',
      label: '承诺人',
      component: 'JSelectRole',
      required: true,
      componentProps: ({ formModel }) => {
        return {
          isRadioSelection: false,
          placeholder: '请选择',
          rowKey: 'roleCode',
          onOptionsChange: (options) => {
            if (options && options.length > 0) {
              formModel.promiserPostName = options.map((item) => item.roleName || item.label).join(',');
            } else {
              formModel.promiserPostName = '';
            }
          },
        };
      },
      colProps: { span: 24 },
    },
    {
      field: 'promiserPostName',
      label: '承诺人姓名',
      component: 'Input',
      show: false,
    },
    {
      field: 'supervisor',
      label: '监督人',
      component: 'ApiSelect',
      required: true,
      componentProps: ({ formModel }) => {
        return {
          api: getSupervisorListWrapper,
          params: {
            postLevel: formModel.postLevel ? formModel.postLevel : '1',
            orgCode: formModel.promiseUnit,
            team: formModel.team,
          },
          labelField: 'realname',
          valueField: 'id',
          placeholder: '请选择监督人',
          showSearch: true,
          filterOption: (input: string, option: any) => {
            return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
          },
          onChange: (e: any, option: any) => {
            formModel.supervisorName = option?.label ?? '';
          },
        };
      },
      colProps: { span: 24 },
    },
    {
      field: 'supervisorName',
      label: '监督人姓名',
      component: 'Input',
      show: false,
    },
    {
      field: 'templateValue',
      label: '编辑模板',
      component: 'Input',
      slot: 'contentSlot',
      required: true,
      colProps: { span: 24 },
      defaultValue: '',
    },
  ];

  const [registerForm, { setProps, validate, resetFields, setFieldsValue, getFieldsValue, updateSchema, clearValidate }] = useForm({
    labelWidth: 100,
    schemas: schemas,
    showActionButtonGroup: false,
    actionColOptions: { span: 24 },
  });

  const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
    console.log('useModalInnerv', data);
    resetFields();
    setModalProps({ confirmLoading: false });
    isUpdate.value = !!data?.isUpdate;

    // 重置动态修改的Schema，防止上次打开的配置影响本次
    await updateSchema([
      {
        field: 'team',
        componentProps: { options: [] },
      },
      {
        field: 'promiserPost',
        component: 'JSelectRole',
        componentProps: ({ formModel }) => {
          return {
            isRadioSelection: false,
            placeholder: '请选择',
            rowKey: 'roleCode',
            onOptionsChange: (options) => {
              if (options && options.length > 0) {
                formModel.promiserPostName = options.map((item) => item.roleName || item.label).join(',');
              } else {
                formModel.promiserPostName = '';
              }
            },
          };
        },
      },
    ]);
    await nextTick();
    clearValidate();
    //设置标题
    if (!data?.showFooter) {
      title.value = '查看';
    } else if (data?.isUpdate) {
      title.value = '编辑';
    } else {
      title.value = '新增';
    }
    // If editing, set values here
    if (data.isUpdate) {
      id.value = data.record.id;
      const res = await getDetail({ id: data.record.id });
      originalSupervisor.value = {
        id: res.supervisor,
        name: res.supervisorName,
      };
      // 如果 postLevel 为 4，将 promiserUser 赋值给 promiserPost，防止后续 setFieldsValue(res) 覆盖为空
      if (res.postLevel === '4') {
        if (res.promiserUser) {
          try {
            const parsedUser = JSON.parse(res.promiserUser);
            if (Array.isArray(parsedUser)) {
              res.promiserUser = parsedUser.join(',');
            }
          } catch (e) {
            console.warn('promiserUser parse error', e);
          }
        }
        res.promiserPost = res.promiserUser;
      }
      if (['1', '2', '3'].includes(res.postLevel)) {
        let options = [];
        if (res.promiserPost && res.promiserPostName) {
          const codes = res.promiserPost.split(',');
          const names = res.promiserPostName.split(',');
          if (codes.length === names.length) {
            options = codes.map((code, index) => ({
              label: names[index],
              value: code,
            }));
          }
        }
        await updateSchema({
          field: 'promiserPost',
          component: 'JSelectRole',
          componentProps: {
            isRadioSelection: false,
            multi: true,
            placeholder: '请选择角色',
            rowKey: 'roleCode',
            options: options,
            onOptionsChange: (options) => {
              if (options && options.length > 0) {
                setFieldsValue({
                  promiserPostName: options.map((item) => item.roleName || item.label).join(','),
                });
              } else {
                setFieldsValue({ promiserPostName: '' });
              }
            },
          },
        });
      } else if (res.postLevel === '4') {
        await updateSchema({
          field: 'promiserPost',
          component: 'JUserModal',
          componentProps: {
            placeholder: '请选择用户',
            orgCode: res.promiseUnit,
            teamId: res.team,
            type: 'checkbox',
            onConfirm: (namesStr) => {
              setFieldsValue({ promiserPostName: namesStr });
            },
          },
        });
        // 回显承诺人姓名
        if (res.promiserUser) {
          const userRes = await getUserById({ userIds: res.promiserUser });
          if (userRes && userRes.length > 0) {
            const names = userRes.map((item) => item.realname).join(',');
            setFieldsValue({
              promiserPostName: names,
            });
            await updateSchema({
              field: 'promiserPost',
              componentProps: {
                label: names,
              },
            });
          }
        }
      }
      if (['3', '4'].includes(res.postLevel) && res.promiseUnit) {
        let teams = await getTeamList1({ workShopCode: res.promiseUnit });
        if (teams.length > 0) {
          teams = teams.filter((item: any) => item.id !== 'all');
        }
        const options = teams.map((item: any) => ({
          label: item.sectionName,
          value: item.id,
        }));
        await updateSchema({
          field: 'team',
          componentProps: {
            options,
            onChange: (e: any) => {
              setFieldsValue({ promiserPost: undefined });
              const currentPostLevel = getFieldsValue().postLevel;
              if (currentPostLevel === '4') {
                updateSchema({
                  field: 'promiserPost',
                  componentProps: {
                    orgCode: getFieldsValue().promiseUnit,
                    teamId: e,
                  },
                });
              } else {
                updateSchema({
                  field: 'promiserPost',
                  componentProps: {
                    params: { orgCode: getFieldsValue().promiseUnit, teamId: e },
                  },
                });
              }
            },
          },
        });
      }
      setFieldsValue(res);
    }
    //showFooter 为false时，不显示提交按钮，表单禁用
    showFooter.value = !!data?.showFooter;
    setModalProps({ footer: !data?.showFooter ? null : undefined });
    // 隐藏底部时禁用整个表单
    setProps({ disabled: !data?.showFooter });
  });

  async function handleUseExample() {
    const res = await getTemplateExample();
    exampleContent.value = res;
    visible.value = true;
  }

  function handleExampleOk() {
    setFieldsValue({
      templateValue: exampleContent.value.content,
    });
    visible.value = false;
  }

  async function getDepartTreeData(params) {
    const result = await getDepartTreeBy34(params);
    if (result && result.length > 0) {
      result.forEach((node: any) => {
        // 禁用三级单位（根节点）
        node.disabled = true;
        node.selectable = false;
        node.checkable = false; // 禁用复选框
        node.disableCheckbox = true; // 禁用复选框（ant-design-vue 属性）
        // 确保四级车间（子节点）可选
        if (node.children && node.children.length > 0) {
          node.children.forEach((child: any) => {
            child.disabled = false;
            child.selectable = true;
            child.checkable = true;
            child.disableCheckbox = false;
          });
        }
      });
    }
    return result;
  }

  /**
   * 保存草稿
   */
  async function handleSaveDraft() {
    try {
      const values = getFieldsValue();
      setModalProps({ confirmLoading: true });
      console.log('Save Draft Values:', values);
      if (values.postLevel === '4') {
        values.promiserUser = Array.isArray(values.promiserPost) ? values.promiserPost.join(',') : values.promiserPost;
        delete values.promiserPost;
      }
      if (isUpdate.value && !values.supervisorName && values.supervisor === originalSupervisor.value.id) {
        values.supervisorName = originalSupervisor.value.name;
      }
      if (isUpdate.value) {
        await edit({ ...values, status: '0', id: id.value });
      } else {
        await add({ ...values, status: '0' });
      }
      closeModal();
      emit('success');
    } catch (error) {
      console.error(error);
    } finally {
      setModalProps({ confirmLoading: false });
    }
  }

  async function handleSubmit() {
    try {
      const values = await validate();
      setModalProps({ confirmLoading: true });
      console.log('Form Values:', values);
      if (values.postLevel === '4') {
        values.promiserUser = Array.isArray(values.promiserPost) ? values.promiserPost.join(',') : values.promiserPost;
        delete values.promiserPost;
      }
      if (isUpdate.value && !values.supervisorName && values.supervisor === originalSupervisor.value.id) {
        values.supervisorName = originalSupervisor.value.name;
      }
      if (isUpdate.value) {
        await edit({ ...values, status: '1', id: id.value });
      } else {
        await add({ ...values, status: '1' });
      }
      closeModal();
      emit('success');
    } catch (error) {
      console.error(error);
    } finally {
      setModalProps({ confirmLoading: false });
    }
  }
</script>
