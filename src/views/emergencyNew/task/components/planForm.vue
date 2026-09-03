<template>
  <div class="plan-form">
    <div class="step-tit">演练信息</div>
    <a-form ref="formRef" :model="formState" name="basic" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
      <a-row :gutter="24">
        <a-col :span="12">
          <a-form-item label="演练单位" name="orgCode">
            <a-input disabled v-model:value="formState.orgCode" placeholder="请输入" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="演练内容" name="rehearsalContent">
            <a-input disabled v-model:value="formState.rehearsalContent" placeholder="请输入" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="演练地点" name="rehearsalLocation">
            <a-input disabled v-model:value="formState.rehearsalLocation" placeholder="请输入" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="演练方式" name="rehearsalType">
            <a-input disabled v-model:value="formState.rehearsalType" placeholder="请输入" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="实施时间" name="enforceDate">
            <a-input disabled v-model:value="formState.enforceDate" placeholder="请输入" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="参演人数" name="personNum">
            <a-input disabled v-model:value="formState.personNum" placeholder="请输入" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="备注" name="remark">
            <a-input disabled v-model:value="formState.remark" placeholder="请输入" />
          </a-form-item>
        </a-col>
      </a-row>
    </a-form>
  </div>
</template>
<script lang="ts" setup>
  import { useDepartList } from '/@/views/hazardousOperation/hooks/useDepartList'
  import { reactive, ref, onMounted } from 'vue';

  const applicationUnitList = ref<any[]>([])
  const formRef = ref();
  const formState = reactive({
    name: '',
    yearDate: null,
    orgCode: null,
    planItemList: []
  });

  onMounted(async () => {
    const { applicationUnitList: list } = await useDepartList(9);
    applicationUnitList.value = list.value;
  })

  const init = (data) => { 
    Object.assign(formState, data);
  }



  const save = () => {
    formState.planItemList.forEach((item:any, idx:number) => { 
      item.sort = idx+1
    })
    return formState;
  }
  const submit = async () => { 
    await formRef.value.validate();
    return save();
  }

  defineExpose({ submit, save, init })
</script>