<template>
  <div>
    <BasicModal v-bind="$attrs" @register="registerModal" :width="800" :bodyStyle="{ padding: '10px 20px 0 0' }" title="选择证书" destroyOnClose>
      <div class="modalinner">
        <a-table
          rowKey="id"
          :columns="columns"
          :row-selection="rowSelection"
          :data-source="dataSource"
          :pagination="pagination"
          :loading="loading"
          @change="handleTableChange"
        />
      </div>
      <template #footer>
        <div style="text-align: center">
          <a-button style="margin-right: 15px" @click="close">取消</a-button>
          <a-button v-if="showOkBtn" type="primary" :loading="loading" @click="confirmClose">确定</a-button>
        </div>
      </template>
    </BasicModal>
  </div>
</template>
<script lang="ts" name="evaluate-fun-modal" setup>
  import { ref, computed } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import type { TableProps } from 'ant-design-vue';
  import { list } from '../resourceManage/certificate/url/index';
  import { useMessage } from '/@/hooks/web/useMessage';
  const emit = defineEmits(['success']);
  const { createMessage } = useMessage();
  const showOkBtn = ref(true);
  const loading = ref(false);
  const dataSource = ref([]);
  const selectedRowKeys: any = ref([]);
  const certName = ref('');
  const total = ref(0);
  const pagination = computed(() => ({
    total: total.value,
    current: queryParams.value.pageNo,
    pageSize: queryParams.value.pageSize,
  }));
  const columns = [
    {
      title: '证书名称',
      dataIndex: 'name',
      ellipsis: true,
    },
  ];
  const [registerModal, { closeModal }] = useModalInner(async (data) => {
    selectedRowKeys.value = [];
    initList();
    if (data.certId && data.certId !== '') {
      selectedRowKeys.value = [data.certId];
      certName.value = data.certName;
    }
  });
  const rowSelection = computed((): TableProps['rowSelection'] => {
    return {
      type: 'radio',
      selectedRowKeys: selectedRowKeys.value, // 绑定响应式的 key
      onChange: (_selectedRowKeys: string[], selectedRows: any[]) => {
        selectedRowKeys.value = _selectedRowKeys; // 只会包含一个选中的 key
        certName.value = selectedRows[0].name;
      },
    };
  });
  const handleTableChange = ({ current }) => {
    queryParams.value.pageNo = current;
    initList();
  };
  const queryParams = ref({
    pageNo: 1,
    pageSize: 10,
  });

  const initList = () => {
    list(queryParams.value).then((res) => {
      dataSource.value = res.records;
      total.value = res.total;
    });
  };

  const close = () => {
    closeModal();
  };
  const confirmClose = async () => {
    if (selectedRowKeys.value.length > 0) {
      emit('success', selectedRowKeys.value[0], certName.value);
      close();
    } else {
      createMessage.info('请选择证书！');
    }
  };
</script>
<style lang="less" scoped></style>
