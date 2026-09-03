<template>
  <BasicModal v-bind="$attrs" @register="registerModal" destroyOnClose :title="title" :width="800" @ok="handleSubmit">
    <BasicForm @register="registerForm"/>
<!--    <div>-->
<!--      <div class="ant-col ant-col-24">-->
<!--        <div class="ant-row ant-form-item" style="row-gap: 0px;">-->
<!--          <div class="ant-col ant-form-item-label" style="width: 150px;font-size: 13px">-->
<!--            <label for="form_item_type" class="ant-form-item-required" title="所属单位">所属单位</label>-->
<!--          </div>-->
<!--          <div class="ant-col ant-col-xs-24 ant-col-sm-18 ant-form-item-control"-->
<!--               style="width: calc(100% - 150px);">-->
<!--            <div class="ant-form-item-control-input">-->
<!--              <div class="ant-form-item-control-input-content">-->
<!--                <div style="display: flex;">-->
<!--                  <div style="flex: 110%; width: 100%;">&lt;!&ndash; 显示加载效果 &ndash;&gt;-->
<!--                    <a-select-->
<!--                      placeholder="所属单位"-->
<!--                      v-model:value="ehsEiaInfoForm.ehsEiaInfo.orgId"-->
<!--                      style="width: 550px;font-size: 13px"-->
<!--                      :options="orgInfo"-->
<!--                      @change="orgIdSelectChange"-->
<!--                      label-in-value-->
<!--                    ></a-select>-->
<!--                  </div>-->
<!--                </div>-->
<!--              </div>-->
<!--            </div>-->
<!--          </div>-->
<!--        </div>-->
<!--      </div>-->
<!--    </div>-->
  </BasicModal>
</template>

<script lang="ts" setup>
    import {ref, computed, unref,reactive} from 'vue';
    import {BasicModal, useModalInner} from '/@/components/Modal';
    import {BasicForm, useForm} from '/@/components/Form/index';
    import {formSchemaEdit} from '../EhsEiaInfo.data';
    import {saveOrUpdate} from '../EhsEiaInfo.api';
    import {SelectProps} from "ant-design-vue";
    import {defHttp} from "/@/utils/http/axios";
    // Emits声明
    const emit = defineEmits(['register','success']);
    // interface EhsEiaInfo {
    //   id:string;
    //   orgId:string;
    //   orgName:string;
    //   orgCode:string;
    // }
    // const ehsEiaInfoForm = reactive<{ ehsEiaInfo: EhsEiaInfo}>({
    //   ehsEiaInfo: {
    //     id:'',
    //     orgId:'',
    //     orgName:'',
    //     orgCode:'',
    //   },
    // });
    // const orgInfo = ref<SelectProps['options']>([]);
    const isUpdate = ref(true);
    // async function getOrgName() {
    //   let params = {};
    //   let res = await defHttp.get({url: '/jn/common/getOrgInfo', params}, {isTransformResponse: false});
    //   if (res.success && res.result) {
    //     orgInfo.value = [...res.result];
    //
    //   } else {
    //     console.log('数根节点查询结果异常', res);
    //   }
    // }
    //
    // function orgIdSelectChange(v) { //{key,label}
    //   ehsEiaInfoForm.ehsEiaInfo.orgId = v.key;
    //   ehsEiaInfoForm.ehsEiaInfo.orgName = v.label;
    // }


    //表单配置
    const [registerForm, {setProps,resetFields, setFieldsValue, validate}] = useForm({
        //labelWidth: 150,
        schemas: formSchemaEdit,
        showActionButtonGroup: false,
        baseColProps: {span: 24}
    });
    //表单赋值
    const [registerModal, {setModalProps, closeModal}] = useModalInner(async (data) => {
        //重置表单
        await resetFields();
        setModalProps({confirmLoading: false,showCancelBtn:!!data?.showFooter,showOkBtn:!!data?.showFooter});
        // getOrgName();
        isUpdate.value = !!data?.isUpdate;
        if (unref(isUpdate)) {
            // ehsEiaInfoForm.ehsEiaInfo.id= data.record.id;
            // ehsEiaInfoForm.ehsEiaInfo.orgCode = data.record.orgCode;
            // ehsEiaInfoForm.ehsEiaInfo.orgName = data.record.orgName;
          // if(data.record.orgCode.indexOf("~|~")==-1){
          //   data.record.orgCode = data.record.orgCode+"~|~"+data.record.orgName;
          // }
            //表单赋值
            await setFieldsValue({
                ...data.record,
            });
        }
        // 隐藏底部时禁用整个表单
       setProps({ disabled: !data?.showFooter })
    });
    //设置标题
    const title = computed(() => (!unref(isUpdate) ? '新增' : '编辑'));
    //表单提交事件
    async function handleSubmit(v) {
        try {
            let values = await validate();
            setModalProps({confirmLoading: true});
            // var orgInfoArry = values.orgCode.split("~|~");
            // values.orgCode = orgInfoArry[0];
            // values.orgName = orgInfoArry[1];
            //提交表单
            await saveOrUpdate(values, isUpdate.value);
            //关闭弹窗
            closeModal();
            //刷新列表
            emit('success');
        } finally {
            setModalProps({confirmLoading: false});
        }
    }
</script>

<style lang="less" scoped>
	/** 时间和数字输入框样式 */
  :deep(.ant-input-number){
		width: 100%
	}

	:deep(.ant-calendar-picker){
		width: 100%
	}
</style>
