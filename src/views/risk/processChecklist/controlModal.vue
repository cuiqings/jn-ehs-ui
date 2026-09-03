<template>
  <div>
    <basic-modal v-bind="$attrs" @register="registerModal" :width="1400" title="管控责任" destroyOnClose>
      <basic-table @register="registerTable" :scroll="{ y: 235 }" style="margin-bottom: 20px">
        <template #riskLevel="{ record }">
          <div
            style="color: #fff"
            :class="
              record.riskLevel === '1'
                ? 'major'
                : record.riskLevel === '2'
                ? 'larger'
                : record.riskLevel === '3'
                ? 'generally'
                : record.riskLevel === '4'
                ? 'low'
                : ''
            "
            >{{
              record.riskLevel === '1' ? '重大风险' : record.riskLevel === '2' ? '较大风险' : record.riskLevel === '3' ? '一般风险' : '低风险'
            }}</div
          >
        </template>
      </basic-table>
      <a-table :columns="columns1" :data-source="dataSource" :pagination="false" bordered style="width: 900px; margin: 0 auto">
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
  import { BasicTable } from '/@/components/Table';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { useListPage } from '/@/hooks/system/useListPage';
  import { nextTick, ref } from 'vue';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { JUserModal } from '/@/components/Form';
  import { edit } from '../riskPointManagement/url/index';
  const emit = defineEmits(['success']);
  const { createMessage } = useMessage();
  const loading = ref(false);
  const obj = ref({});
  const columns: any = [
    {
      title: '所属单位',
      width: 150,
      align: 'center',
      dataIndex: 'orgName',
    },
    {
      title: '所属车间',
      width: 150,
      align: 'center',
      dataIndex: 'departName',
    },
    {
      title: '辨识单元',
      width: 200,
      align: 'center',
      dataIndex: 'recogUnit',
    },
    {
      title: '风险点',
      width: 150,
      align: 'center',
      dataIndex: 'pointName',
    },
    {
      title: '风险类别',
      width: 150,
      align: 'center',
      dataIndex: 'type',
      customRender: ({ text }) => {
        return text === '1' ? '设备设施' : '作业活动';
      },
    },
    {
      title: '风险因素',
      width: 250,
      align: 'center',
      dataIndex: 'riskFactor',
    },
    {
      title: '可能导致的事故类型',
      width: 250,
      align: 'center',
      dataIndex: 'accidentType',
    },
    {
      title: '风险分级',
      width: 150,
      align: 'center',
      dataIndex: 'riskLevel',
      slots: { customRender: 'riskLevel' },
    },
    {
      title: '现有管控措施',
      children: [
        {
          title: '工程技术措施',
          width: 250,
          align: 'center',
          dataIndex: 'existingGcjsMsr',
        },
        {
          title: '组织管理措施',
          width: 250,
          align: 'center',
          dataIndex: 'existingZzglMsr',
        },
        {
          title: '培训教育措施',
          width: 250,
          align: 'center',
          dataIndex: 'existingPxjyMsr',
        },
        {
          title: '个体防护措施',
          width: 250,
          align: 'center',
          dataIndex: 'existingGrfhMsr',
        },
        {
          title: '应急处置措施',
          width: 250,
          align: 'center',
          dataIndex: 'existingYjclMsr',
        },
      ],
    },
    {
      title: '责任部门',
      width: 200,
      align: 'center',
      dataIndex: 'dutyDepart',
    },
    {
      title: '责任人',
      width: 200,
      align: 'center',
      dataIndex: 'dutyPerson',
    },
  ];
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
  const columns1: any = [
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
  const { tableContext } = useListPage({
    tableProps: {
      dataSource: [],
      useSearchForm: false,
      showActionColumn: false,
      columns: columns,
      pagination: false,
      indexColumnProps: {
        fixed: 'left',
      },
    },
  });
  const [registerTable, { setTableData }] = tableContext;
  const [registerModal, { closeModal }] = useModalInner(async (data) => {
    obj.value = JSON.parse(JSON.stringify(data));
    dataSource.value = dataSource.value.map((item) => {
      item.head = obj.value[item.key];
      return item;
    });
    nextTick(() => {
      setTableData([obj.value]);
    });
  });
  const close = () => {
    closeModal();
  };
  const confirmClose = async () => {
    const arr = dataSource.value;
    for (let i = 0; i < arr.length; i++) {
      if (!arr[i].head || arr[i].head === '') {
        return createMessage.info(`${arr[i].name}为必填项！`);
      }
    }
    arr.forEach((item) => {
      obj.value[item.key] = item.head;
    });
    loading.value = true;
    edit({
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
<style lang="less" scoped>
  .major {
    background: rgb(200, 0, 22);
  }
  .larger {
    background: rgb(236, 115, 14);
  }
  .generally {
    background: rgb(220, 228, 15);
  }
  .low {
    background: rgb(29, 209, 255);
  }
</style>
