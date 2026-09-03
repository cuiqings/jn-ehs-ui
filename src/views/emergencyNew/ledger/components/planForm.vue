<template>
  <div class="plan-form">
    <a-form layout="inline" :model="formState" name="basic" :label-col="{ span: 3 }" :wrapper-col="{ span: 12 }">
      <a-row :gutter="24">
        <a-col sapn="10">
          <a-form-item label="演练计划名称" name="username" :rules="[{ required: true, message: '请输入' }]">
            <a-input v-model:value="formState.username" placeholder="请输入" />
          </a-form-item>
        </a-col>
        <a-col :sapn="10">
          <a-form-item label="计划年份" name="years" :rules="[{ required: true, message: '请选择' }]">
            <a-select v-model:value="formState.years" placeholder="请选择">
              <a-select-option value="2024">2024年</a-select-option>
              <a-select-option value="2025">2025年</a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :sapn="12">
          <a-form-item label="计划单位" name="orgCode" :rules="[{ required: true, message: '请选择' }]">
            <a-select v-model:value="formState.years" placeholder="请选择">
              <a-select-option value="2024">2024年</a-select-option>
              <a-select-option value="2025">2025年</a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
      </a-row>
    </a-form>
  </div>
  <addModal @register="register" @submitSuccess="submitSuccess" />
</template>
<script lang="ts" setup>
  import { reactive, ref } from 'vue';
  import addModal from './addModal.vue';
  import { useModal } from '/@/components/Modal';
  const formState = reactive({
    username: '',
    years: null,
    orgCode: null,
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
      dataIndex: 'time',
      key: 'time',
      width: 100,
    },
    {
      title: '演练方式',
      dataIndex: 'method',
      key: 'method',
      width: 120,
      ellipsis: true,
    },
    {
      title: '演练内容',
      dataIndex: 'content',
      key: 'content',
      width: 180,
      ellipsis: true,
    },
    {
      title: '演练地点',
      dataIndex: 'local',
      key: 'local',
      width: 160,
      ellipsis: true,
    },
    {
      title: '参演人数',
      dataIndex: 'num',
      key: 'num',
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
      dataIndex: 'annexUrl',
      key: 'annexUrl',
      width: 180,
      ellipsis: true,
    },
    {
      title: '操作',
      dataIndex: 'handle',
      key: 'handle',
      width: 210,
      fixed: 'right',
    },
  ]
  const [register, { openModal }] = useModal();

  const add = () => {
    openModal(true, {title: '新增'});
  }
  const edit = (data:any, idx: number) => { 
    openModal(true, {title: '编辑', record: JSON.parse(JSON.stringify({...data, idx: idx}))});
  }
  const del = (index:number) => { 
    dataSource.value.splice(index, 1);
  }

  const submitSuccess = (data:any) => {
    console.log(data);
    if(data.type === 'edit'){
      dataSource.value.splice(data.idx, 1, data);
    } else {
      dataSource.value.push(data);
    }
  }
</script>