<template>
  <div>
    <BasicModal
      v-bind="$attrs"
      @register="registerModal"
      :width="820"
      :bodyStyle="{ maxHeight: '600px', overflowY: 'auto' }"
      :title="title"
      destroyOnClose
    >
      <!-- 基本信息 -->
      <div style="margin-bottom: 24px">
        <div style="font-weight: bold; margin-bottom: 12px">基本信息</div>
        <a-row style="background: #fafafa; padding: 18px 12px; border-radius: 8px">
          <template v-for="item in type === '1' ? baseInfoList : insulationToolsList" :key="item.key">
            <a-col :span="12" style="margin-bottom: 8px">
              <span style="color: #888">{{ item.label }}：</span>{{ item.value }}
            </a-col>
          </template>
        </a-row>
      </div>
      <!-- 检验记录 -->
      <div>
        <div style="font-weight: bold; margin-bottom: 12px">检验记录</div>
        <a-table :columns="type === '1' ? columns : columns1" :dataSource="checkLogList" :pagination="false" bordered size="middle" rowKey="ledgerId">
          <template #bodyCell="{ column, record, index }">
            <template v-if="column.key === 'index'">
              <div style="text-align: center">{{ index + 1 }}</div>
            </template>
            <template v-if="column.key === 'createTime'">
              {{ dayjs(record.createTime).format('YYYY-MM-DD') }}
            </template>
            <template v-if="column.key === 'checkResult'">
              <span v-if="record.checkResult === '1'">合格</span>
              <span v-else-if="record.checkResult === '2'">不合格</span>
              <span v-else-if="record.checkResult === '3'">需要维修</span>
            </template>
          </template>
        </a-table>
      </div>
      <template #footer>
        <div style="text-align: center">
          <a-button @click="close">关闭</a-button>
        </div>
      </template>
    </BasicModal>
  </div>
</template>

<script lang="ts" name="extinguisher-detail-modal" setup>
  import { ref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { detail } from './api';
  import dayjs from 'dayjs';
  const title = ref('灭火器详情');
  const type = ref('1');
  const baseInfoList = ref([
    { key: 'orgName', label: '所属单位', value: '' },
    { key: 'departName', label: '所属车间', value: '' },
    { key: 'post', label: '岗位', value: '' },
    { key: 'model', label: '灭火器型号', value: '' },
    { key: 'quantity', label: '数量', value: '' },
    { key: 'status', label: '状况', value: '' },
    { key: 'maintenanceDate', label: '下次检验日期', value: '' },
    { key: 'principalName', label: '责任人', value: '' },
    { key: 'remark', label: '备注', value: '' },
  ]);
  const insulationToolsList = ref([
    { key: 'orgName', label: '所属单位', value: '' },
    { key: 'departName', label: '所属车间', value: '' },
    { key: 'name', label: '工具名称', value: '' },
    { key: 'unit', label: '单位', value: '' },
    { key: 'quantity', label: '数量', value: '' },
    { key: 'location', label: '存放地点', value: '' },
    { key: 'maintenanceDate', label: '检验到期时间', value: '' },
  ]);
  const columns = [
    { title: '序号', dataIndex: 'index', key: 'index', width: 60, align: 'center' },
    { title: '检验日期', dataIndex: 'createTime', key: 'createTime', align: 'center', width: 150 },
    { title: '操作人', dataIndex: 'checkPersonName', key: 'checkPersonName', align: 'center', width: 200, ellipsis: true },
    { title: '备注', dataIndex: 'remark', key: 'remark', align: 'center', ellipsis: true },
  ];
  const columns1 = [
    { title: '序号', dataIndex: 'index', key: 'index', width: 60, align: 'center' },
    { title: '检验日期', dataIndex: 'checkTime', key: 'checkTime', align: 'center', width: 150 },
    { title: '检验结果', dataIndex: 'checkResult', key: 'checkResult', align: 'center', width: 120 },
    { title: '操作人', dataIndex: 'checkPersonName', key: 'checkPersonName', align: 'center', width: 150, ellipsis: true },
    { title: '备注', dataIndex: 'remark', key: 'remark', align: 'center', width: 200, ellipsis: true },
  ];
  const checkLogList = ref([]);
  const [registerModal, { closeModal }] = useModalInner((data) => {
    title.value = data.title;
    type.value = data.type;
    checkLogList.value = [];
    detail({ id: data.record.id }).then((res) => {
      if (res) {
        if (type.value === '1') {
          baseInfoList.value.forEach((item) => {
            item.value = res[item.key] || '';
          });
        } else {
          insulationToolsList.value.forEach((item) => {
            item.value = res[item.key] || '';
          });
        }
        checkLogList.value = res.checkLogList || [];
      }
    });
  });

  const close = () => {
    closeModal();
  };
</script>
