<template>
  <div class="plan-form">
    <a-form ref="formRef" :model="formState" name="basic" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
      <a-row :gutter="24">
        <a-col :span="12">
          <a-form-item label="演练计划名称" name="name" :rules="[{ required: true, message: '请输入' }]">
            <a-input disabled v-model:value="formState.name" placeholder="请输入" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="计划年份" name="yearDate" :rules="[{ required: true, message: '请选择' }]">
            <a-date-picker disabled format="YYYY" valueFormat="YYYY" style="width: 100%;" v-model:value="formState.yearDate" picker="year" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="计划单位" name="orgCode" :rules="[{ required: true, message: '请选择' }]">
            <a-tree-select disabled v-model:value="formState.orgCode" placeholder="请选择" :tree-data="applicationUnitList" showSearch
              tree-node-filter-prop="title" :field-names="{ label: 'title', value: 'key', children: 'children' }" />
          </a-form-item>
        </a-col>
        <a-col span="24"> 
          <a-table :pagination="false" :dataSource="formState.planItemList" :columns="columns">
            <template #bodyCell="{column, record, index}">
              <template v-if="column.dataIndex === 'index'">
                {{ index+1 }}
              </template>
              <template v-if="column.dataIndex === 'annex'">
                <span style="color: #1890ff;" @click="previewFn(record.annex)">{{ record.annex }}</span>
              </template>
            </template>
          </a-table>
        </a-col>
      </a-row>
    </a-form>
  </div>
</template>
<script lang="ts" setup>
import { useDepartList } from '/@/views/hazardousOperation/hooks/useDepartList'
  import { previewFile } from '/@/api/common/api';
  import { reactive, ref, onMounted } from 'vue';
  import { useModal } from '/@/components/Modal';

  const applicationUnitList = ref<any[]>([])
  const formRef = ref();
  const formState = reactive({
    name: '',
    yearDate: null,
    orgCode: null,
    planItemList: []
  });
  const dataSource = ref<any[]>([]);
  const columns = [
    {
      title: '序号',
      dataIndex: 'index',
      key: 'index',
      width: 80,
    },
    {
      title: '实施时间',
      dataIndex: 'enforceDate',
      key: 'enforceDate',
      width: 90,
    },
    {
      title: '演练方式',
      dataIndex: 'rehearsalType',
      key: 'rehearsalType',
      width: 100,
      ellipsis: true,
    },
    {
      title: '演练内容',
      dataIndex: 'rehearsalContent',
      key: 'rehearsalContent',
      ellipsis: true,
    },
    {
      title: '演练地点',
      dataIndex: 'rehearsalLocation',
      key: 'rehearsalLocation',
      width: 160,
      ellipsis: true,
    },
    {
      title: '参演人数',
      dataIndex: 'personNum',
      key: 'personNum',
      width: 90,
      ellipsis: true,
    },
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
      width: 120,
      ellipsis: true,
    },
    {
      title: '应急预案',
      dataIndex: 'annex',
      key: 'annex',
      width: 180,
      ellipsis: true,
    },
  ]
  const [register, { openModal }] = useModal();

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

  const submitSuccess = (data:any) => {
    console.log(data);
    if(data.type === 'edit'){
      formState.planItemList.splice(data.idx, 1, data);
    } else {
      formState.planItemList.push(data);
    }
}

const previewFn = (src) => {
  previewFile(src).then((res) => {
    window.open(res, '_blank');
  });
};
  defineExpose({ submit, save, init })
</script>