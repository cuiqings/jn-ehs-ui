<template>
  <BasicModal
    v-bind="$attrs"
    @register="register"
    title="异常情况查看"
    width="700px"
    okText=""
    cancelText="关闭">
    <BasicForm @register="registerForm">
      <template #qlid="{ field }">
        <span style="padding-left: 10px;"
        >{{ field.slice(2) }}、</span>
      </template>
    </BasicForm>
  </BasicModal>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { BasicModal, useModalInner } from '/@/components/Modal'
import { BasicForm, useForm } from '/@/components/Form/index'
import { getDetail } from '/@/views/periodicClean/plan/plan.api';

const schemas:any = [
  {
    field: 'abnormal-basic',
    component: 'Divider',
    label: '基本信息'
  },
  {
    label: '类型',
    field: 'type',
    component: 'JDictSelectTag',
    componentProps: {
      dictCode: 'clean_plan_type',
      placeholder: '请选择'
    }
  },
  {
    label: '工序',
    field: 'productionProcessse',
    component: 'Input'
  },
  {
    label: '设备/区域',
    field: 'deviceRegion',
    component: 'Input'
  },
  {
    label: '周期',
    field: 'cycle',
    component: 'JDictSelectTag',
    required: true,
    componentProps: {
      dictCode: 'cycle',
      type: 'radio'
    }
  },
  {
    label: '周期天数',
    field: 'dayNum',
    required: true,
    component: 'InputNumber',
    ifShow: ({ values }) => {
      return values.cycle === '5'
    }
  },
  {
    label: '上次执行时间',
    field: 'lastExecutionTime',
    required: true,
    component: 'DatePicker',
    componentProps: {
      valueFormat: 'YYYY-MM-DD',
      style: {
        width: '100%'
      }
    }
  },
  {
    label: '执行人',
    field: 'executor',
    required: true,
    component: 'Input'
  },
  {
    label: '监督人',
    field: 'supervisor',
    component: 'Input'
  },
  {
    field: 'divider-basic2',
    component: 'Divider',
    label: '清理部位信息'
  },
  {
    field: 'id1',
    component: 'Input',
    label: '',
    colProps: {
      span: 2
    },
    slot: 'qlid'
  },
  {
    field: 'buwei1',
    component: 'Input',
    label: '清理部位',
    required: true,
    colProps: {
      span: 12
    }
  },
  {
    field: 'fangfa1',
    component: 'JDictSelectTag',
    label: '方法',
    colProps: {
      span: 10
    },
    defaultValue: '0',
    required: true,
    componentProps: {
      dictCode: 'ql_method',
      placeholder: '请选择'
    }
  }
]
const [registerForm, { setFieldsValue, resetFields, setProps, appendSchemaByField, updateSchema, resetSchema }] = useForm({
  schemas: schemas,
  showActionButtonGroup: false,
  labelCol: {
    xs: {
      span: 24
    },
    sm: {
      span: 6
    }
  },
  wrapperCol: {
    xs: {
      span: 24
    },
    sm: {
      span: 17
    }
  }
})

const n = ref(2);
// 初始化设置清理信息列表
function initCleanList(opts:any){
  const {jnClearPositionList,type} = opts
  if(type === '1'){
    updateSchema({
      field: 'divider-basic2',
      label: `维保内容信息 ${jnClearPositionList.length} 项`,
    });
    updateSchema({
      field: 'buwei1',
      label: '维保内容',
    });
    updateSchema({
      field: 'fangfa1',
      label: '维保方式',
      componentProps: {
        dictCode: 'wb_method'
      }
    });
  } else {
    updateSchema({
      field: 'divider-basic2',
      label: `清理部位信息 ${jnClearPositionList.length} 项`,
    });
    updateSchema({
      field: 'buwei1',
      label: '清理部位',
    });
    updateSchema({
      field: 'fangfa1',
      label: '方法',
      componentProps: {
        dictCode: 'ql_method'
      }
    });
  }
  setFieldsValue({
    id1: jnClearPositionList[0].clearMaintenanceId,
    buwei1: jnClearPositionList[0].clearPosition,
    fangfa1: jnClearPositionList[0].clearMethod,
  });
  // list赋值
  jnClearPositionList.forEach((item:any,index:number) => {
    if(index > 0){
      appendSchemaByField(
        {
          field: `id${n.value}`,
          component: 'Input',
          label: ``,
          colProps: {
            span: 2,
          },
          slot: 'qlid'
        },
        ''
      );
      appendSchemaByField(
        {
          field: `buwei${n.value}`,
          component: 'Input',
          label: type==='1' ? '维保内容' : '清理部位',
          colProps: {
            span: 12,
          },
          required: true,
          componentProps: {
            showCount: true,
            maxLength: 50,
            suffix: '/50'
          },
        },
        ''
      );
      appendSchemaByField(
        {
          field: `fangfa${n.value}`,
          component: 'JDictSelectTag',
          label: type==='1' ? '维保方式' : '方法',
          colProps: {
            span: 10,
          },
          required: true,
          // defaultValue: '0',
          componentProps: {
            dictCode: type==='1' ? 'wb_method' : 'ql_method',
            placeholder: '请选择'
          }
        },
        ''
      );
      // appendSchemaByField(
      //   {
      //     field: `q${n.value}`,
      //     component: 'Input',
      //     label: '',
      //     colProps: {
      //       span: 2,
      //     },
      //     slot: 'add',
      //   },
      //   ''
      // );
      setFieldsValue({
        [`id${n.value}`]: item.clearMaintenanceId,
        [`buwei${n.value}`]: item.clearPosition,
        [`fangfa${n.value}`]: item.clearMethod,
      });
      n.value++;
    }
  })
}
const [register, {}] = useModalInner(async (data) => {
  console.log(data, 'dddd====')
  await resetSchema(schemas)
  await resetFields()
  // 清除动态添加的list
  n.value = 2
  const record = await getDetail({id:data.record.id,type:'web'})
  await setFieldsValue({
    ...record
  })
  setFieldsValue({
    executor: record.executorName,
    supervisor: record.supervisorName
  });
  initCleanList(record)
  setProps({ disabled: true })
})

// function handleOk() {
//   closeModal()
// }

</script>

<style scoped>

</style>
