<template>
  <BasicModal
    v-bind="$attrs"
    width="70%"
    :z-index="100"
    :mask="false"
    @register="registerModal"
    @cancel="cancel"
    :maskClosable="false"
    @ok="handleSubmit"
    :title="title"
    :loading="loading"
    :confirmLoading="confirmLoading"
  >
  <a-form class="operat-form" label-width="0" :model="listInfo" ref="formRef" :label-col="{ span: 0 }" :wrapper-col="{ span: 24 }">
    <a-table
      :columns="colum3"
      :dataSource="listInfo.recordList"
      :pagination="false"
      rowKey="index"
      bordered
    >
      <template #bodyCell="{ column, index, record }">
        <template v-if="column.dataIndex === 'operatingTime'">
           <a-form-item  :name="['recordList', index, 'operatingTime']" required :rules="{
                required: true,
                message: '请选择',
              }">
          <a-date-picker :disabled="title === '操作步骤确认'" 
            valueFormat="YYYY-MM-DD hh:mm:ss" format="YYYY-MM-DD hh:mm:ss" v-model:value="record.operatingTime" show-time placeholder="请选择" />
        </a-form-item>
          </template>
        <template v-if="column.dataIndex === 'operatingUser'">
          <a-form-item >
            <a-select
              
              :disabled="title === '操作步骤确认'"
              placeholder="请选择"
              v-model:value="record.operatingUser"
              :options="userList"
              :fieldNames="{ label: 'realname', value: 'id' }"
            ></a-select>
          </a-form-item>
        </template>
        <template v-if="column.dataIndex === 'confirmUser'">
          <a-form-item :name="['recordList', index, 'confirmUser']" required :rules="{
                required: true,
                message: '请选择',
              }">
          <a-select
            :disabled="title === '操作步骤确认'"
            v-model:value="record.confirmUser"
            :options="userList"
            placeholder="请选择"
            :fieldNames="{ label: 'realname', value: 'id' }"
          ></a-select></a-form-item>
        </template>
        
      </template>
    </a-table>
  </a-form>
  <my-model @register="registerMyModal" @cancle="myModelCancle" @next-step="nextStep" />
  </BasicModal>
</template>

<script setup lang="ts">
  import { BasicModal, useModalInner, useModal } from '/@/components/Modal';
  import { ref } from 'vue';
  import MyModel from '../MyModel.vue';
  import { queryOperation, recordOperation, operationSign, queryConfirmOperation, queryWorkUser } from '../../api';

    const [registerMyModal, { openModal: openMyModal, closeModal: closeMyModal }] = useModal();

  const emit = defineEmits(['close']);
  const confirmLoading = ref<boolean>(false);
  const listInfo = ref<any>({recordList: []});
  const curItem = ref({});
  const [registerModal, { closeModal }] = useModalInner((data) => {
    data.type == 1 ? title.value = '操作步骤记录' : title.value = '操作步骤确认';
    curItem.value = data;
    confirmLoading.value = false;
    getList(data);
  });
  const loading = ref<boolean>(false);
  const formRef = ref<any>();
  const title = ref<string>('操作步骤记录');
  const userList = ref<any[]>([]);
  const getList = (data) => {
    loading.value = true;
    listInfo.value.recordList = [];
    getUsers();
    if(title.value == '操作步骤记录') {
      queryOperation({
        id: data.id,
      }).then((res) => {
        console.log(res);
        loading.value = false;
        res.forEach(item => item.workApplyId = curItem.value.id);
        listInfo.value.recordList = res;
      });
    } else {
      queryConfirmOperation({
        id: data.id
      }).then((res) => {
        console.log(res);
        loading.value = false;
        listInfo.value.recordList = res;
      });
      
    }
  }
  
  const colum3 = [
    {
      title: '操作步骤',
      dataIndex: 'workProcedure',
      align: 'center',
    },
    {
      title: '完成时间',
      dataIndex: 'operatingTime',
      align: 'center',
      width: 220
    },
    {
      title: '操作者',
      dataIndex: 'operatingUser',
      align: 'center',
      width: 220
    },
    {
      title: '确认人',
      dataIndex: 'confirmUser',
      align: 'center',
      width: 220
    },
  ];
  const handleSubmit = async () => {
    confirmLoading.value = true;
    formRef.value
      .validate()
      .then(async (res) => {
        if(title.value == '操作步骤记录') {
          recordOperation(listInfo.value.recordList).then(res => {
            confirmLoading.value = false;
            emit('close');
            closeModal();
          }).catch((err) => {
            confirmLoading.value = false;
            emit('close');
          });
        } else {
          openMyModal(true, {})
        }
      })
      .catch((err) => {
        confirmLoading.value = false;
      });
  };
  const nextStep = (val) => {
    operationSign({
        workApplyId: curItem.value.id,
      sign: val.sign,
    }).then((res) => {
      confirmLoading.value = false;
      closeMyModal();
      closeModal();
      emit('close');
    }).catch((err) => {
      confirmLoading.value = false;
    });
  }
  const getUsers = () => {
    queryWorkUser({id: curItem.value.id}).then((res) => {
      userList.value = res;
    }).catch((err) => {
      userList.value = [];
    });
  }
  const cancel = () => {
    formRef.value.resetFields();
    emit('close');
  };
</script>

<style lang="less" scoped>
.operat-form{
  :deep(.ant-form-item) {
    margin-bottom: 0;
  }
}
</style>
