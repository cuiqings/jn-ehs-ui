<template>
  <div style="height: 500px; width: 500px; margin: auto; padding: 100px 10px">
    <a-form ref="formUserRef" :model="userFormState" name="userBasic" :label-col="{ span: 7 }" :wrapper-col="{ span: 12 }">
      <a-form-item label="任务类型" name="dataType" :rules="[{ required: true, message: '请选择任务类型' }]">
        <a-select v-model:value="userFormState.dataType">
          <a-select-option value="1">培训任务</a-select-option>
          <a-select-option value="2">考试任务</a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item label="用户工号" name="userId" :rules="[{ required: true, message: '请输入用户工号' }]">
        <a-input v-model:value="userFormState.userId" placeholder="请输入用户工号" />
      </a-form-item>
      <a-form-item label="任务" name="taskId" :rules="[{ required: true, message: '请选择任务' }]">
        <a-input v-model:value="taskName" placeholder="请选择任务" @click="openTask" />
      </a-form-item>
      <a-form-item label="引用用户数据工号" name="reUserId" :rules="[{ required: true, message: '请输入引用用户数据工号' }]">
        <a-input v-model:value="userFormState.reUserId" placeholder="请输入引用用户数据工号" />
      </a-form-item>
      <a-form-item v-if="userFormState.dataType === '1'" label="类型" name="type" :rules="[{ required: true, message: '请选择类型' }]">
        <a-radio-group v-model:value="userFormState.type" name="type">
          <a-radio value="1">只完成考试</a-radio>
          <a-radio value="2">只完成学习视频</a-radio>
          <a-radio value="3">全部完成</a-radio>
        </a-radio-group>
      </a-form-item>
      <a-form-item>
        <div style="text-align: right">
          <a-button type="primary" @click="handleOk">提交</a-button>
          <span style="margin-left: 20px"></span>
          <a-button @click="handleCancel">取消</a-button>
        </div>
      </a-form-item>
    </a-form>
    <a-modal v-model:visible="visible" title="选择任务" @ok="handleTask" style="width: 60%">
      <a-table
        :pagination="false"
        size="small"
        :row-selection="rowSelection"
        :columns="userFormState.dataType === '1' ? columns : columns1"
        :data-source="data"
        row-key="id"
      />
    </a-modal>
  </div>
</template>
<script setup lang="ts">
  import { backDoor } from '/@/views/studyTraining/trainingTasks/url';
  import { ref } from 'vue';
  import { list, trainInfo } from './url/index';
  import { message } from 'ant-design-vue';
  import { defHttp } from '/@/utils/http/axios';
  const userFormState = ref<any>({
    userId: '',
    reUserId: '',
    taskId: '',
    type: '',
    dataType: '1',
  });
  const rowSelection = {
    type: 'radio',
    onChange: (selectedRowKeys: [], selectedRows: any[]) => {
      console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
      userFormState.value.taskId = selectedRows[0].id;
      if (userFormState.value.dataType === '1') {
        taskName.value = selectedRows[0].taskName;
      } else {
        taskName.value = selectedRows[0].examTaskName;
      }
    },
  };
  const formUserRef = ref<any>();
  const visible = ref<false>();
  const taskName = ref<''>();
  const columns = [
    {
      title: '任务名称',
      dataIndex: 'taskName',
      key: 'taskName',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
    },
    {
      title: '任务时间',
      dataIndex: 'taskDate',
      key: 'taskDate',
    },
  ];
  const columns1 = [
    {
      title: '任务名称',
      dataIndex: 'examTaskName',
      key: 'examTaskName',
    },
    {
      title: '试卷名称',
      dataIndex: 'examPaperName',
      key: 'examPaperName',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
    },
    {
      title: '任务时间',
      dataIndex: 'taskDate',
      customRender: ({ text, record }) => {
        return record.examStrTime + '~' + record.examEndTime;
      },
    },
  ];
  const data = ref([]);
  const handleOk = () => {
    if (userFormState.value.dataType === '1') {
      formUserRef.value.validate().then(() => {
        backDoor(userFormState.value).then((ressult) => {
          taskName.value = '';
        formUserRef.value.resetFields();
        });
      });
    } else {
      if (userFormState.value.userId === '') {
        message.warning('请先输入用户工号');
        return;
      }
      if (userFormState.value.taskId === '') {
        message.warning('请先选择任务');
        return;
      }
      if (userFormState.value.reUserId === '') {
        message.warning('请输入引用用户数据工号');
        return;
      }
      userFormState.value.type = '3';
      backDoor(userFormState.value).then((ressult) => {
        taskName.value = '';
      formUserRef.value.resetFields();
      });
    }
  };
  const handleCancel = () => {
    formUserRef.value.resetFields();
  };
  const handleTask = () => {
    visible.value = false;
    console.log(userFormState.value);
    //查询任务用户数据
    // trainInfo({ id: userFormState.value.taskId, type: 1, pageNo: 1, pageSize: 1000 }).then((result) => {});
  };
  const openTask = () => {
    data.value = [];

    console.log(userFormState.value);
    if (userFormState.value.userId === '') {
      message.warning('请先输入用户工号');
      return;
    }
    visible.value = true;
    if (userFormState.value.dataType === '1') {
      //查询任务
      let params = {
        pageNo: 1,
        pageSize: 1000,
        status: 2,
        workNo: userFormState.value.userId,
      };
      list(params).then((result) => {
        data.value = result.records;
      });
    } else {
      let params = {
        pageNo: 1,
        pageSize: 1000,
        workNo: userFormState.value.userId,
      };
      defHttp.get({ url: '/edu/examTask/pageList', params }).then((result) => {
        data.value = result.records;
      });
    }
  };
</script>
<style scoped lang="less"></style>
