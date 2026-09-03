<template>
  <BasicDrawer forceRender showFooter v-bind="$attrs" @register="register" :title="title" width="65%" @ok="handleSubmit"
    destroyOnClose>
    <div style="width: 100%;">
      <a-form ref="formRef" :model="formState" name="basic" :label-col="{ span: 3 }" :wrapper-col="{ span: 10 }">
        <a-form-item label="所属单位" name="orgCode" :rules="[{ required: true, message: '请选择' }]">
          <a-select v-model:value="formState.orgCode" :options="departList" @change="orgChange" placeholder="请选择"
            :fieldNames="{ label: 'departName', value: 'orgCode' }"></a-select>
        </a-form-item>
        <!-- <a-form-item label="所属车间" name="workshop" :rules="[{ required: true, message: '请选择' }]">
          <a-select v-model:value="formState.workshop" :options="departList2" placeholder="请选择"
            :fieldNames="{ label: 'departName', value: 'orgCode' }"></a-select>
        </a-form-item> -->
        <a-form-item label="年份" name="year" :rules="[{ required: true, message: '请输入' }]">
          <a-date-picker v-model:value="formState.year" format="YYYY" valueFormat="YYYY" picker="year" style="width: 100%;" />
        </a-form-item>
        <a-form-item label="上传附件" name="fileUrl" :rules="[{ required: true, message: '请输入' }]">
          <JUpload ref="uploadRef" :maxCount="1" v-model:value="formState.fileUrl" text="上传附件" />
        </a-form-item>
      </a-form>
    </div>
  </BasicDrawer>
</template>
<script lang="ts" setup>
import { JUpload } from '/@/components/Form/src/jeecg/components/JUpload';
import { getDepart3ListWithSecurity, selectDeptNew } from '/@/api/common/api';
import { fileAdd, fileEdit } from '../api'
import { BasicDrawer, useDrawerInner } from '/@/components/Drawer';
import { ref, reactive } from 'vue';
import { FormInstance } from 'ant-design-vue/es/form';

const readonly = ref(false);
const formRef = ref<FormInstance|null>(null);
const title = ref('新增');
const departList = ref<any[]>([]);
const departList2 = ref<any[]>([]);
const formState = reactive({
  orgCode: undefined,
  workshop: undefined,
  year: '',
  fileUrl: ''
});

const emits = defineEmits(['submitSuccess']);

const [register, { closeDrawer, changeOkLoading }] = useDrawerInner(async (data) => {
  title.value = data.title;
  departList.value = await getDepart3ListWithSecurity();
  if (title.value == '编辑') {
    Object.assign(formState, data.record);
    // orgChange(formState.orgCode);
  }
  if (title.value == '详情') {
    Object.assign(formState, data.record);
    readonly.value = true;
  }
});

const orgChange = async (value) => {
  // departList2.value = await selectDeptNew({ orgCode: value });
}

const handleSubmit = () => {
  formRef.value?.validate().then(() => {
    changeOkLoading(true);
    if (title.value == '新增') {
      fileAdd(formState).then(res => {
        changeOkLoading(false);
        emits('submitSuccess', res);
        closeDrawer();
        formRef.value?.resetFields();
      }).catch(err => {
        changeOkLoading(false);
      })
    } else {
      fileEdit(formState).then(res => {
        changeOkLoading(false);
        emits('submitSuccess', res);
        closeDrawer();
        formRef.value?.resetFields();
      }).catch(err => {
        changeOkLoading(false);
      })
    }

  }).catch(() => {
    changeOkLoading(false);
  })
};

</script>
