<template>
  <div>
    <BasicModal v-bind="$attrs" @register="registerModal" :title="getTitle" @ok="onSubmit" width="700px">
      <BasicForm @register="registerForm">
        <template #qlid="{ field }">
          <span style="padding-left: 10px" v-if="getTitle === '查看'">{{ field.slice(2) }}、</span>
        </template>
        <template #add="{ field, model }">
          <a-button :disabled="getTitle === '查看'" type="button" v-if="Number(field.slice(1)) === 1" @click="add(model)" style="cursor: pointer"
            >+</a-button
          >
          <a-button :disabled="getTitle === '查看'" type="button" v-if="field.slice(1) > 1" @click="del(field.slice(1))" style="cursor: pointer"
            >-</a-button
          >
        </template>
      </BasicForm>
    </BasicModal>
    <RoleUserModal @register="registerUserModal" @success="handleUser" />
  </div>
</template>

<script lang="ts" setup>
  import { ref, unref } from 'vue';
  import { BasicModal, useModalInner, useModal } from '/@/components/Modal';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import RoleUserModal from './RoleUserModal.vue';
  import { saveOrUpdate, getDetail } from './plan.api';
  import { defHttp } from '/@/utils/http/axios';
  // import { useMessage } from '/@/hooks/web/useMessage';
  // const { createMessage } = useMessage();
  const [registerUserModal, { openModal }] = useModal();
  const emit = defineEmits(['success', 'register']);

  const isUpdate = ref<Boolean>(true);
  // const getTitle = computed(() => (!unref(isUpdate) ? '新增' : '编辑'));
  const getTitle = ref('查看');
  const curRecord: any = ref({});
  const curClearObj: any = ref({});
  // const departOptions:any = ref([]);
  const entryOptions: any = ref([]);
  async function getEntryOptions() {
    let params: any = {};
    params.pageSize = 9999;
    params.pageNo = 1;
    await defHttp.get({ url: '/jnClearEntry/list', params }).then((res) => {
      res.records.map((item: any) => {
        entryOptions.value.push({
          label: item.entryName,
          value: item.id,
          clearType: item.clearType,
          method: item.method,
        });
      });
    });
  }
  getEntryOptions();

  const entryOptionsAdd: any = ref([]);
  async function getEntryOptionsAdd() {
    let params: any = {};
    params.pageSize = 9999;
    params.pageNo = 1;
    await defHttp.get({ url: '/jnClearEntry/getAll', params }).then((res) => {
      res.map((item: any) => {
        entryOptionsAdd.value.push({
          label: item.entryName,
          value: item.id,
          clearType: item.clearType,
          method: item.method,
        });
      });
    });
  }
  getEntryOptionsAdd();

  const schemas: any = [
    {
      label: '',
      field: 'id',
      component: 'Input',
      show: false,
    },
    {
      field: 'divider-basicf',
      component: 'Divider',
      label: '计划状态',
      ifShow: () => {
        return getTitle.value === '查看';
      },
    },
    {
      label: '是否启用',
      field: 'isEnable',
      component: 'JDictSelectTag',
      componentProps: {
        dictCode: 'whether_or_not',
        type: 'radio',
      },
      ifShow: () => {
        return getTitle.value === '查看';
      },
    },
    {
      label: '计划状态',
      field: 'planStatus',
      component: 'JDictSelectTag',
      componentProps: {
        dictCode: 'plan_status',
        showChooseOption: false,
      },
      ifShow: () => {
        return getTitle.value === '查看';
      },
    },
    {
      label: '变更状态',
      field: 'changeStatus',
      component: 'JDictSelectTag',
      componentProps: {
        dictCode: 'plan_status',
        showChooseOption: false,
      },
      ifShow: () => {
        return getTitle.value === '查看' && !!curRecord.value.changeStatus;
      },
    },
    {
      field: 'divider-basic',
      component: 'Divider',
      label: '基本信息',
    },
    {
      label: '项目',
      field: 'clearEntryId',
      component: 'Select',
      required: true,
      componentProps: ({ formActionType }) => {
        return {
          options: entryOptionsAdd.value,
          placeholder: '请选择',
          onChange: (e: any, opts: any) => {
            console.log('e-----', e);
            // console.log('e-----111', opts)
            curClearObj.value = opts;
            const { updateSchema } = formActionType;
            if (opts.clearType === '1') {
              updateSchema({
                field: 'divider-basic2',
                label: '维保内容信息',
              });
              updateSchema({
                field: 'buwei1',
                label: '维保内容',
              });
              updateSchema({
                field: 'fangfa1',
                label: '维保方式',
                componentProps: {
                  dictCode: 'wb_method',
                },
              });
            } else {
              updateSchema({
                field: 'divider-basic2',
                label: '清理部位信息',
              });
              updateSchema({
                field: 'buwei1',
                label: '清理部位',
              });
              updateSchema({
                field: 'fangfa1',
                label: '方法',
                componentProps: {
                  dictCode: 'ql_method',
                },
              });
            }
            setFieldsValue({
              [`buwei1`]: '',
            });
            setFieldsValue({
              [`fangfa1`]: opts.method,
            });
            // 清除动态添加清理部位信息list
            const nl = n.value;
            if (nl > 2) {
              const nl = n.value;
              for (let i = 2; i <= nl; i++) {
                del(i);
              }
            }
            n.value = 2;
          },
        };
      },
    },
    {
      label: '工序',
      field: 'productionProcessse',
      component: 'Input',
      componentProps: {
        maxLength: 20,
      },
    },
    {
      label: '设备/区域',
      field: 'deviceRegion',
      component: 'Input',
      componentProps: {
        maxLength: 50,
      },
    },
    {
      label: '周期',
      field: 'cycle',
      helpMessage: [],
      component: 'JDictSelectTag',
      required: true,
      componentProps: ({ formActionType }) => {
        return {
          dictCode: 'cycle',
          type: 'radio',
          placeholder: '请选择',
          onChange: (e: any) => {
            // console.log(e,'eeeee====')
            const { updateSchema } = formActionType;
            switch (e) {
              case '0':
                updateSchema({
                  field: 'cycle',
                  helpMessage: ['每次任务执行后下一次执行时间为1天之后'],
                });
                break;
              case '1':
                updateSchema({
                  field: 'cycle',
                  helpMessage: ['每次任务执行后下一次执行时间为7天之后'],
                });
                break;
              case '2':
                updateSchema({
                  field: 'cycle',
                  helpMessage: ['每次任务执行后下一次执行时间为30天之后'],
                });
                break;
              case '3':
                updateSchema({
                  field: 'cycle',
                  helpMessage: ['每次任务执行后下一次执行时间为90天之后'],
                });
                break;
              case '4':
                updateSchema({
                  field: 'cycle',
                  helpMessage: ['每次任务执行后下一次执行时间为365天之后'],
                });
                break;
              case '5':
                updateSchema({
                  field: 'cycle',
                  helpMessage: [`每次任务执行后下一次执行时间为##天之后`],
                });
                break;
            }
          },
        };
      },
    },
    {
      label: '周期天数',
      field: 'dayNum',
      required: true,
      component: 'InputNumber',
      componentProps: ({ formActionType }) => {
        return {
          placeholder: '请输入',
          min: 1,
          precision: 0,
          onChange: (e: any) => {
            // console.log(e,'eeeee====')
            const { updateSchema } = formActionType;
            updateSchema({
              field: 'cycle',
              helpMessage: [`每次任务执行后下一次执行时间为${e}天之后`],
            });
          },
        };
      },
      ifShow: ({ values }) => {
        return values.cycle === '5';
      },
    },
    {
      label: '上次执行时间',
      field: 'lastExecutionTime',
      required: true,
      component: 'DatePicker',
      defaultValue: new Date(),
      componentProps: {
        valueFormat: 'YYYY-MM-DD',
        style: {
          width: '100%',
        },
        disabledDate: (current) => {
          const today = new Date();
          // 将当前日期转换为时间戳
          const todayTimestamp = today.getTime();
          // 将当前日期之前的日期转换为时间戳
          const currentTimestamp = current.valueOf();
          // 判断当前日期是否在当前日期之前
          return currentTimestamp > todayTimestamp;
        },
      },
    },
    {
      label: '执行人',
      field: 'executorName',
      required: true,
      component: 'Input',
      componentProps: ({ formModel }) => {
        return {
          placeholder: '请选择',
          readOnly: true,
          onClick: () => {
            openModal(true, {
              field: 'executor',
              data: formModel,
            });
          },
          onChange: (e: any) => {
            // 清空重置
            if (!e.target.value) {
              formModel.executor = undefined;
              formModel.executorName = undefined;
              formModel.executorType = undefined;
            }
          },
        };
      },
    },
    {
      label: '',
      field: 'executor',
      component: 'Input',
      show: false,
    },
    {
      label: '',
      field: 'executorType',
      component: 'Input',
      show: false,
    },
    {
      label: '监督人',
      field: 'supervisorName',
      component: 'Input',
      componentProps: ({ formModel }) => {
        return {
          placeholder: '请选择',
          readOnly: true,
          onClick: () => {
            openModal(true, {
              field: 'supervisor',
              data: formModel,
            });
          },
          onChange: (e: any) => {
            // 清空重置
            if (!e.target.value) {
              formModel.supervisor = undefined;
              formModel.supervisorName = undefined;
              formModel.supervisorType = undefined;
            }
          },
        };
      },
    },
    {
      label: '',
      field: 'supervisor',
      component: 'Input',
      show: false,
    },
    {
      label: '',
      field: 'supervisorType',
      component: 'Input',
      show: false,
    },
    {
      field: 'divider-basic2',
      component: 'Divider',
      label: '清理部位信息',
    },
    {
      field: 'id1',
      component: 'Input',
      label: '',
      colProps: {
        span: 2,
      },
      slot: 'qlid',
    },
    {
      field: 'buwei1',
      component: 'Input',
      label: '清理部位',
      colProps: {
        span: 10,
      },
      required: true,
      componentProps: {
        showCount: true,
        maxLength: 50,
        suffix: '/50',
      },
    },
    {
      field: 'fangfa1',
      component: 'JDictSelectTag',
      label: '方法',
      colProps: {
        span: 10,
      },
      required: true,
      // defaultValue: '0',
      componentProps: {
        dictCode: 'ql_method',
        placeholder: '请选择',
        showChooseOption: false,
      },
    },
    {
      field: 'q1',
      component: 'Input',
      label: '',
      colProps: {
        span: 2,
      },
      slot: 'add',
    },
  ];
  // 注册表单
  const [registerForm, { validate, setFieldsValue, resetFields, setProps, appendSchemaByField, removeSchemaByFiled, updateSchema, resetSchema }] =
    useForm({
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

  const n = ref(2);
  function add(model: any) {
    console.log(model, 'ewewewe');
    const { clearType, method } = curClearObj.value;
    appendSchemaByField(
      {
        field: `id${n.value}`,
        component: 'Input',
        label: ``,
        colProps: {
          span: 2,
        },
        slot: 'qlid',
      },
      ''
    );
    appendSchemaByField(
      {
        field: `buwei${n.value}`,
        component: 'Input',
        label: clearType === '1' ? '维保内容' : '清理部位',
        colProps: {
          span: 10,
        },
        required: true,
        componentProps: {
          showCount: true,
          maxLength: 50,
          suffix: '/50',
        },
      },
      ''
    );
    appendSchemaByField(
      {
        field: `fangfa${n.value}`,
        component: 'JDictSelectTag',
        label: clearType === '1' ? '维保方式' : '方法',
        colProps: {
          span: 10,
        },
        required: true,
        // defaultValue: '0',
        componentProps: {
          dictCode: clearType === '1' ? 'wb_method' : 'ql_method',
          placeholder: '请选择',
          showChooseOption: false,
        },
      },
      ''
    );
    setFieldsValue({
      [`fangfa${n.value}`]: method,
    });
    appendSchemaByField(
      {
        field: `q${n.value}`,
        component: 'Input',
        label: '',
        colProps: {
          span: 2,
        },
        slot: 'add',
      },
      ''
    );
    n.value++;
  }
  function del(field) {
    removeSchemaByFiled([`id${field}`, `buwei${field}`, `fangfa${field}`, `q${field}`]);
    n.value--;
  }

  // 选择角色或人回调
  function handleUser(val: any) {
    setFieldsValue({
      [val.field]: val ? val.keyStr : undefined,
      [val.field + 'Name']: val ? val.valueStr : undefined,
      [val.field + 'Type']: val ? val.approvalType : undefined,
    });
  }

  async function onSubmit() {
    const values = await validate();
    let list: any = [];
    Object.keys(values).forEach((item: any) => {
      if (item.includes('buwei')) {
        const index = item.replace('buwei', '');
        list.push({
          clearMaintenanceId: values['id' + index],
          clearMethod: values['fangfa' + index],
          clearPosition: values[item],
        });
      }
    });
    let params: any = {
      list: list,
    };
    if (unref(isUpdate)) {
      params.planStatus = curRecord.value.planStatus;
      if (curRecord.value.planStatus === '1') {
        params.changeRecord = '计划内容变更';
        params.changeType = '1';
      }
    }
    setModalProps({ confirmLoading: true });
    try {
      await saveOrUpdate(Object.assign(params, values), isUpdate.value);
      closeModal();
      emit('success');
      setModalProps({ confirmLoading: false });
    } catch {
      setModalProps({ confirmLoading: false });
    }
  }

  // 初始化设置清理信息列表
  function initCleanList(opts: any) {
    const { jnClearPositionList, type } = opts;
    if (type === '1') {
      updateSchema({
        field: 'divider-basic2',
        label: '维保内容信息',
      });
      updateSchema({
        field: 'buwei1',
        label: '维保内容',
      });
      updateSchema({
        field: 'fangfa1',
        label: '维保方式',
        componentProps: {
          dictCode: 'wb_method',
        },
      });
    } else {
      updateSchema({
        field: 'divider-basic2',
        label: '清理部位信息',
      });
      updateSchema({
        field: 'buwei1',
        label: '清理部位',
      });
      updateSchema({
        field: 'fangfa1',
        label: '方法',
        componentProps: {
          dictCode: 'ql_method',
        },
      });
    }
    setFieldsValue({
      id1: jnClearPositionList[0].clearMaintenanceId,
      buwei1: jnClearPositionList[0].clearPosition,
      fangfa1: jnClearPositionList[0].clearMethod,
    });
    // list赋值
    jnClearPositionList.forEach((item: any, index: number) => {
      if (index > 0) {
        appendSchemaByField(
          {
            field: `id${n.value}`,
            component: 'Input',
            label: ``,
            colProps: {
              span: 2,
            },
            slot: 'qlid',
          },
          ''
        );
        appendSchemaByField(
          {
            field: `buwei${n.value}`,
            component: 'Input',
            label: type === '1' ? '维保内容' : '清理部位',
            colProps: {
              span: 10,
            },
            required: true,
            componentProps: {
              showCount: true,
              maxLength: 50,
              suffix: '/50',
            },
          },
          ''
        );
        appendSchemaByField(
          {
            field: `fangfa${n.value}`,
            component: 'JDictSelectTag',
            label: type === '1' ? '维保方式' : '方法',
            colProps: {
              span: 10,
            },
            required: true,
            // defaultValue: '0',
            componentProps: {
              dictCode: type === '1' ? 'wb_method' : 'ql_method',
              placeholder: '请选择',
              showChooseOption: false,
            },
          },
          ''
        );
        appendSchemaByField(
          {
            field: `q${n.value}`,
            component: 'Input',
            label: '',
            colProps: {
              span: 2,
            },
            slot: 'add',
          },
          ''
        );
        setFieldsValue({
          [`id${n.value}`]: item.clearMaintenanceId,
          [`buwei${n.value}`]: item.clearPosition,
          [`fangfa${n.value}`]: item.clearMethod,
        });
        n.value++;
      }
    });
  }
  // 查看 添加表单
  function addShowField(record: any) {
    console.log(record, '11111111111');
    const { jnPlanChangeRecordList, jnPlanChangeRecordJhList } = record;
    // 计划审批
    if (jnPlanChangeRecordJhList.length > 0) {
      jnPlanChangeRecordJhList.forEach((item: any, index: number) => {
        appendSchemaByField(
          {
            field: 'divider-basicf2' + index,
            component: 'Divider',
            label: '计划审批',
          },
          ''
        );
        appendSchemaByField(
          {
            label: '计划状态',
            field: 'planStatus' + index,
            component: 'JDictSelectTag',
            componentProps: {
              dictCode: 'plan_status',
              showChooseOption: false,
            },
          },
          ''
        );
        setFieldsValue({
          ['planStatus' + index]: item.changeStatus,
        });
        if (item.changeStatus !== '1') {
          appendSchemaByField(
            {
              label: '审批说明',
              field: 'approverIllustrate' + index,
              component: 'Input',
              componentProps: {
                placeholder: '无',
                title: item.approverIllustrate,
              },
            },
            ''
          );
          setFieldsValue({
            ['approverIllustrate' + index]: item.approverIllustrate,
          });
        }
        appendSchemaByField(
          {
            label: '审批人',
            field: 'approver' + index,
            component: 'Input',
          },
          ''
        );
        setFieldsValue({
          ['approver' + index]: item.approver,
        });
        appendSchemaByField(
          {
            label: '审批时间',
            field: 'approverTime' + index,
            component: 'Input',
            componentProps: {
              placeholder: '--',
            },
          },
          ''
        );
        setFieldsValue({
          ['approverTime' + index]: item.approverTime,
        });
      });
    }
    // 添加变更记录
    if (record.changeStatus && jnPlanChangeRecordList.length > 0) {
      jnPlanChangeRecordList.forEach((item: any, index: number) => {
        // 变更记录
        appendSchemaByField(
          {
            field: 'divider-bg' + index,
            component: 'Divider',
            label: '变更记录',
          },
          ''
        );
        appendSchemaByField(
          {
            label: '变更内容',
            field: 'changeRecord' + index,
            component: 'Input',
          },
          ''
        );
        setFieldsValue({
          ['changeRecord' + index]: item.changeRecord,
        });
        appendSchemaByField(
          {
            label: '申请人',
            field: 'applicant' + index,
            component: 'Input',
          },
          ''
        );
        setFieldsValue({
          ['applicant' + index]: item.applicant,
        });
        appendSchemaByField(
          {
            label: '申请时间',
            field: 'createTime' + index,
            component: 'Input',
          },
          ''
        );
        setFieldsValue({
          ['createTime' + index]: item.createTime,
        });
        // 变更审批
        //if(!(record.changeStatus === '0' && index === 0)){
        appendSchemaByField(
          {
            field: 'divider-bgsp' + index,
            component: 'Divider',
            label: '变更审批',
          },
          ''
        );
        appendSchemaByField(
          {
            label: '变更审批',
            field: 'changeStatus2' + index,
            component: 'JDictSelectTag',
            componentProps: {
              dictCode: 'plan_status',
              showChooseOption: false,
            },
          },
          ''
        );
        setFieldsValue({
          ['changeStatus2' + index]: item.changeStatus,
        });
        appendSchemaByField(
          {
            label: '审批说明',
            field: 'approverIllustrate2' + index,
            component: 'Input',
            componentProps: {
              placeholder: '无',
              title: item.approverIllustrate,
            },
          },
          ''
        );
        setFieldsValue({
          ['approverIllustrate2' + index]: item.approverIllustrate,
        });
        appendSchemaByField(
          {
            label: '审批人',
            field: 'approver2' + index,
            component: 'Input',
            componentProps: {
              placeholder: '无',
            },
          },
          ''
        );
        setFieldsValue({
          ['approver2' + index]: item.approver,
        });
        appendSchemaByField(
          {
            label: '审批时间',
            field: 'approverTime2' + index,
            component: 'Input',
            componentProps: {
              placeholder: '无',
            },
          },
          ''
        );
        setFieldsValue({
          ['approverTime2' + index]: item.approverTime,
        });
        //}
      });
    }
  }
  // 初始化表单周期 提示信息
  function initCycleHelpMessage(record: any) {
    switch (record.cycle) {
      case '0':
        updateSchema({
          field: 'cycle',
          helpMessage: ['每次任务执行后下一次执行时间为1天之后'],
        });
        break;
      case '1':
        updateSchema({
          field: 'cycle',
          helpMessage: ['每次任务执行后下一次执行时间为7天之后'],
        });
        break;
      case '2':
        updateSchema({
          field: 'cycle',
          helpMessage: ['每次任务执行后下一次执行时间为30天之后'],
        });
        break;
      case '3':
        updateSchema({
          field: 'cycle',
          helpMessage: ['每次任务执行后下一次执行时间为90天之后'],
        });
        break;
      case '4':
        updateSchema({
          field: 'cycle',
          helpMessage: ['每次任务执行后下一次执行时间为365天之后'],
        });
        break;
      case '5':
        updateSchema({
          field: 'cycle',
          helpMessage: [`每次任务执行后下一次执行时间为${record.dayNum}天之后`],
        });
        break;
    }
  }

  // 注册弹窗
  // 这个方法执行需要openModal传入第二个参数
  const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
    if (data.type === '2') {
      getTitle.value = '申请变更';
    } else if (data.type === '1') {
      getTitle.value = '编辑';
    } else if (data.type === '0') {
      getTitle.value = '新增';
    } else {
      getTitle.value = '查看';
    }
    curClearObj.value = {};
    // 清除动态添加的list
    n.value = 2;
    await resetSchema(schemas);
    await resetFields();
    updateSchema({
      field: 'cycle',
      helpMessage: [],
    });
    setModalProps({ confirmLoading: false, showCancelBtn: !!data?.showFooter, showOkBtn: !!data?.showFooter });
    isUpdate.value = !!data?.isUpdate;
    if (unref(isUpdate)) {
      const record = await getDetail({ id: data.record.id, type: 'web' });
      curRecord.value = record;
      curClearObj.value = {
        clearType: data.record.type,
        method: entryOptions.value.filter((v) => v.value === data.record.clearEntryId)[0].method,
      };
      //表单赋值
      await setFieldsValue({
        ...record,
      });
      initCycleHelpMessage(record);
      initCleanList(record);
      console.log('data.record', record);
      updateSchema({
        field: 'lastExecutionTime',
        componentProps: {
          disabled: true,
        },
      });
      // 如果查看 增加表单
      if (data.type === '3') {
        addShowField(record);
      }
    }
    // 隐藏底部时禁用整个表单
    setProps({ disabled: !data?.showFooter });
  });
</script>

<style lang="less" scoped>
  /deep/.ant-input-suffix {
    color: #999;
  }
</style>
