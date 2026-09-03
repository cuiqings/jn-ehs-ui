<template>
  <div>
    <basic-modal v-bind="$attrs" @register="registerModal" :width="1000" title="批量变更管控责任人" destroyOnClose>
      <a-table :columns="columns" :data-source="dataSource" :pagination="false" bordered style="width: 900px; margin: 0 auto">
        <template #head="{ record }">
          <JUserModal v-model:value="record.head" type="checkbox" />
        </template>
      </a-table>
      <template #footer>
        <div style="text-align: center">
          <a-button style="margin-right: 15px" @click="close">取消</a-button>
          <a-button type="primary" :loading="loading" @click="confirmClose">提交</a-button>
        </div>
      </template>
    </basic-modal>
  </div>
</template>
<script lang="ts" name="control-modal" setup>
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { ref } from 'vue';
  import { JUserModal } from '/@/components/Form';
  import { changeDutyPersonBatch } from './url/index';
  const emit = defineEmits(['success']);
  const loading = ref(false);
  const obj = ref({});
  const ids = ref('');
  const dataSource = ref([
    {
      name: '安全部',
      key: 'securityDepartPersonId',
      head: undefined,
      frequency: '每旬',
    },
    {
      name: '厂部主要负责人',
      key: 'factoryMajorManagerId',
      head: undefined,
      frequency: '每季',
    },
    {
      name: '厂部安全科',
      key: 'factorySecurityDepartPersonId',
      head: undefined,
      frequency: '每旬',
    },
    {
      name: '车间负责人',
      key: 'workshopManagerId',
      head: undefined,
      frequency: '每周',
    },
    {
      name: '班组负责人',
      key: 'teamManagerId',
      head: undefined,
      frequency: '每天',
    },
    {
      name: '岗位人员',
      key: 'postPersonId',
      head: undefined,
      frequency: '每班',
    },
  ]);
  const columns: any = [
    {
      title: '管控层级',
      align: 'center',
      width: 300,
      dataIndex: 'name',
    },
    {
      title: '责任人',
      align: 'center',
      width: 450,
      dataIndex: 'head',
      slots: { customRender: 'head' },
    },
    {
      title: '检查频率',
      align: 'center',
      width: 150,
      dataIndex: 'frequency',
    },
  ];
  const [registerModal, { closeModal }] = useModalInner(async (data) => {
    ids.value = data.join(',');
    dataSource.value = dataSource.value.map((item) => {
      item.head = undefined;
      return item;
    });
  });
  const close = () => {
    closeModal();
  };
  const confirmClose = async () => {
    const arr = dataSource.value;
    arr.forEach((item) => {
      obj.value[item.key] = item.head;
    });
    loading.value = true;
    changeDutyPersonBatch({
      ids: ids.value,
      ...obj.value,
    })
      .then((res) => {
        if (res) {
          //关闭弹窗
          closeModal();
          //刷新列表
          emit('success');
        }
      })
      .finally(() => {
        loading.value = false;
      });
  };
</script>
