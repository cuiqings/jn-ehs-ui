<template>
  <div>
    <BasicModal v-bind="$attrs" @register="registerModal" :title="getTitle" @ok="onSubmit" width="700px">
      <BasicForm @register="registerForm"></BasicForm>
    </BasicModal>
  </div>
</template>
  
<script lang="ts">
import { computed, ref, unref } from 'vue';
import { BasicModal, useModalInner } from '/@/components/Modal';
import { BasicForm, useForm } from '/@/components/Form/index';
import { saveOrUpdate } from './plan.api';
import { defHttp } from '/@/utils/http/axios';
// import { useMessage } from '/@/hooks/web/useMessage';
// const { createMessage } = useMessage();
export default {
  name: 'ProjectModal',
  components: { BasicModal, BasicForm },
  emits: ['success', 'register'],
  setup(_props, { emit }) {
    const isUpdate = ref<Boolean>(true);
    const getTitle = ref('')
    const roleId = ref('');
    const orgOptions:any = ref([]);
    const responsePlanOptions:any = ref([]);
    const oldRecord:any = ref({})
    async function getOrgList() {
      await defHttp.get({ url: '/jn/common/getOrganizationNew' }).then((res) => {
        res.map((item:any) => {
          orgOptions.value.push({
            label: item.departName,
            value: item.orgCode,
          });
        });
      });
    }
    async function getResponsePlanOptions() {
      let params:any = {};
      params.pageSize = 9999;
      params.pageNo = 1;
      await defHttp.get({ url: '/emergency/emergencyResponsePlan/list', params }).then((res) => {
        res.records.map((item:any) => {
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
    // 注册表单
    const [registerForm, { validate, setFieldsValue, resetFields,setProps}] = useForm({
      schemas: [
        {
          label: '所属机构',
          field: 'organizationCode',
          component: 'Select',
          required: true,
          componentProps: () => {
            return {
              options: orgOptions,
              placeholder: '请选择'
            };
          }
        },
        {
          label: '项目名称',
          field: 'entryName',
          component: 'Input',
          required: true,
          componentProps: {
            showCount: true,
            maxLength: 50,
            suffix: '/50'
          }
        },
        {
          label: '清理类型',
          field: 'clearType',
          component: 'JDictSelectTag',
          required: true,
          defaultValue: '0',
          componentProps: () => {
            return {
              dictCode: 'clean_plan_type',
              type: 'radio',
              placeholder: '请选择',
              onChange: (e: any) => {
                // console.log('e-----', e)
                // console.log('e-----999', oldRecord.value.clearType)
                if(oldRecord.value.clearType && e === oldRecord.value.clearType) {
                  // 编辑
                  setFieldsValue({
                    [`qlqzp`]: oldRecord.value.qlqzp || '0',
                    [`qlhzp`]: oldRecord.value.qlhzp || '0',
                    [`hcghsl`]: oldRecord.value.hcghsl || '0',
                    [`csfpzl`]: oldRecord.value.csfpzl || '0',
                    [`csfpqx`]: oldRecord.value.csfpqx || '0',
                    [`qlsm`]: oldRecord.value.qlsm || '0',
                    [`wbzp`]: oldRecord.value.wbzp || '0'
                  });
                } else {
                  setFieldsValue({
                    [`qlqzp`]: '0',
                    [`qlhzp`]: '0',
                    [`hcghsl`]: '0',
                    [`csfpzl`]: '0',
                    [`csfpqx`]: '0',
                    [`qlsm`]: '0',
                    [`wbzp`]: '0'
                  });
                }
              }
            }
          }
        },
        {
          label: '方法',
          field: 'method',
          component: 'JDictSelectTag',
          required: true,
          defaultValue: '0',
          componentProps: {
            dictCode: 'ql_method',
            placeholder: '请选择'
          },
          ifShow: ({ values }) => {
            return values.clearType === '0'
          }
        },
        {
          label: '方式',
          field: 'method',
          component: 'JDictSelectTag',
          required: true,
          defaultValue: '0',
          componentProps: {
            dictCode: 'wb_method',
            placeholder: '请选择'
          },
          ifShow: ({ values }) => {
            return values.clearType === '1'
          }
        },
        {
          field: 'divider-basic',
          component: 'Divider',
          label: '执行项设置',
        },
        {
          label: '清理前照片',
          field: 'qlqzp',
          component: 'JDictSelectTag',
          required: true,
          defaultValue: '0',
          componentProps: {
            dictCode: 'execution_item',
            type: 'radio',
            placeholder: '请选择'
          },
          ifShow: ({ values }) => {
            return values.clearType === '0'
          }
        },{
          label: '清理后照片',
          field: 'qlhzp',
          component: 'JDictSelectTag',
          required: true,
          defaultValue: '0',
          componentProps: {
            dictCode: 'execution_item',
            type: 'radio',
            placeholder: '请选择'
          },
          ifShow: ({ values }) => {
            return values.clearType === '0'
          }
        },{
          label: '耗材更换数量',
          field: 'hcghsl',
          component: 'JDictSelectTag',
          required: true,
          defaultValue: '0',
          componentProps: {
            dictCode: 'execution_item',
            type: 'radio',
            placeholder: '请选择'
          },
          ifShow: ({ values }) => {
            return values.clearType === '1'
          }
        },{
          label: '产生废品重量',
          field: 'csfpzl',
          component: 'JDictSelectTag',
          required: true,
          defaultValue: '0',
          componentProps: {
            dictCode: 'execution_item',
            type: 'radio',
            placeholder: '请选择'
          },
        },{
          label: '产生废品去向',
          field: 'csfpqx',
          component: 'JDictSelectTag',
          required: true,
          defaultValue: '0',
          componentProps: {
            dictCode: 'execution_item',
            type: 'radio',
            placeholder: '请选择'
          },
        },{
          label: '清理说明',
          field: 'qlsm',
          component: 'JDictSelectTag',
          required: true,
          defaultValue: '0',
          componentProps: {
            dictCode: 'execution_item',
            type: 'radio',
            placeholder: '请选择'
          },
          ifShow: ({ values }) => {
            return values.clearType === '0'
          }
        },{
          label: '维保照片',
          field: 'wbzp',
          component: 'JDictSelectTag',
          required: true,
          defaultValue: '0',
          componentProps: {
            dictCode: 'execution_item',
            type: 'radio',
            placeholder: '请选择'
          },
          ifShow: ({ values }) => {
            return values.clearType === '1'
          }
        }
      ],
      showActionButtonGroup: false,
      labelCol: {
        xs: { span: 24 },
        sm: { span: 5 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 18 },
      },
    });

    async function onSubmit() {
      const values = await validate();
      console.log('validate value', values);
      const orgArr = orgOptions.value.filter(v => v.value === values.organizationCode)
      values.organizationName = orgArr[0].label
      
      if(values.clearType==='1'){
        values.qlqzp = ''
        values.qlhzp = ''
        values.qlsm = ''
      } else {
        values.hcghsl = ''
        values.wbzp = ''
      }

      setModalProps({ confirmLoading: true});
      if (unref(isUpdate)) {
        values.id = roleId.value;
        await saveOrUpdate(values, isUpdate.value);
      } else {
        await saveOrUpdate(values, isUpdate.value);
      }
      closeModal();
      setModalProps({ confirmLoading: false});
      emit('success');
    }
    // 注册弹窗
    // 这个方法执行需要openModal传入第二个参数
    const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
      console.log('useModalInner data', data, data.a);
      if(!data?.showFooter){
        getTitle.value='查看'
      } else if(data?.isUpdate) {
        getTitle.value='编辑'
      } else {
        getTitle.value='新增'
      }
      // 下次点击弹窗的时候清空表单
      await resetFields();
      oldRecord.value = {}
      setModalProps({ confirmLoading: false,showCancelBtn:!!data?.showFooter,showOkBtn:!!data?.showFooter });
      isUpdate.value = !!data?.isUpdate;
      if (unref(isUpdate)) {
        // 处理机构被删除的 数据
        const orgCodes = orgOptions.value.map(v => v.value)
        if(data.record.organizationCode && !orgCodes.includes(data.record.organizationCode)){
          data.record.organizationCode=''
        }
        //表单赋值
        await setFieldsValue({
          ...data.record,
        });
        oldRecord.value = data.record
        console.log('data.record', data.record);
        roleId.value = data.record.id;
      }
      // 隐藏底部时禁用整个表单
      setProps({ disabled: !data?.showFooter })
    });

    return {
      registerModal,
      registerForm,
      getTitle,
      onSubmit
    };
  },
};
</script>
  
<style lang="less" scoped>
/deep/.ant-input-suffix{
  color: #999;
}
</style>
  