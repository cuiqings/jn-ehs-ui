<template>
  <div class="plan-form">
    <a-form ref="formRef" :model="formState" name="basic" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
      <a-row :gutter="24">
        <a-col :span="12">
          <a-form-item label="演练计划名称" name="name" :rules="[{ required: true, message: '请输入' }]">
            <a-input v-model:value="formState.name" placeholder="请输入" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="计划年份" name="yearDate" :rules="[{ required: true, message: '请选择' }]">
            <a-date-picker format="YYYY" valueFormat="YYYY" style="width: 100%;" v-model:value="formState.yearDate" picker="year" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="计划单位" name="orgCode" :rules="[{ required: true, message: '请选择' }]">
           <a-tree-select v-model:value="formState.orgCode" placeholder="请选择" :tree-data="applicationUnitList" showSearch
          tree-node-filter-prop="title" :field-names="{ label: 'title', value: 'key', children: 'children' }" />
          </a-form-item>
        </a-col>
        <a-col :span="24" style="margin: 16px 0;">
          <a-space :size="8">
          <a-button type="primary" @click="add">新增</a-button>
          <a-upload name="file" :showUploadList="false" :customRequest="(file) => onImportXls(file)">
            <a-button type="primary" preIcon="ant-design:import-outlined">导入</a-button>
          </a-upload>
          <a-button type="primary" @click="onExportTemplateXls">导入模板下载</a-button>
          </a-space>
        </a-col>
        <a-col span="24"> 
          <a-table :pagination="false" :scroll="{ x: 1000, y: 400 }" :dataSource="formState.planItemList" :columns="columns">
            <template #bodyCell="{column, record, index}">
              <template v-if="column.dataIndex === 'index'">
                {{ index+1 }}
              </template>
              <template v-if="column.dataIndex === 'annexUrl'">
                <span style="color: #1890ff;">{{ record.annexUrl }}</span>
              </template>
              <template v-if="column.dataIndex === 'handle'">
                <a-space :size="8">
                  <a-button size="small" type="link" link @click="edit(record, index)">编辑</a-button>
                  <a-button size="small" type="link" danger @click="del(index)">删除</a-button>
                </a-space>
              </template>
            </template>
          </a-table>
        </a-col>
      </a-row>
    </a-form>
  </div>
  <addModal @register="register" @submitSuccess="submitSuccess" />
</template>
<script lang="ts" setup>
  import { useDepartList } from '/@/views/hazardousOperation/hooks/useDepartList'
  import { reactive, ref, onMounted } from 'vue';
  import addModal from './addModal.vue';
  import { useModal } from '/@/components/Modal';
  import { useMethods } from '/@/hooks/system/useMethods';

  const applicationUnitList = ref<any[]>([])
  const formRef = ref();
  const formState = reactive({
    name: '',
    yearDate: null,
    orgCode: null,
    planItemList: []
  });
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
      width: 100,
    },
    {
      title: '演练方式',
      dataIndex: 'rehearsalType',
      key: 'rehearsalType',
      width: 120,
      ellipsis: true,
    },
    {
      title: '演练内容',
      dataIndex: 'rehearsalContent',
      key: 'rehearsalContent',
      width: 180,
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
      width: 110,
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
    {
      title: '操作',
      dataIndex: 'handle',
      key: 'handle',
      width: 120,
      fixed: 'right',
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

  const add = () => {
    openModal(true, {title: '新增'});
  }
  const edit = (data:any, idx: number) => { 
    openModal(true, {title: '编辑', record: JSON.parse(JSON.stringify({...data, idx: idx}))});
  }
  const del = (index:number) => { 
    formState.planItemList.splice(index, 1);
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
  const reset = () => { 
    formState.name = '';
    formState.yearDate = null;
    formState.orgCode = null;
    formState.planItemList = [];
    formRef.value.resetFields();
  }
  function onExportTemplateXls() {
    const { handleExportXlsx } = useMethods();
    let params = {};
    handleExportXlsx('演练计划申请模板', '/rehearsalPlan/downloadTemplate', params);
  }
  function onImportXls(file) { 
    const { handleImportXls } = useMethods();
    handleImportXls(file, '/rehearsalPlan/import', (res) => {
      console.log(res.result);
      formState.planItemList.push(...res.result);
    });
  }
  defineExpose({ submit, save, init, reset })
</script>