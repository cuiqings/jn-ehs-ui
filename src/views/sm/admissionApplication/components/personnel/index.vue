<template>
  <div class="person-container" :style="bodyStyle">
    <div :class="isTitle ? 'title' : ''">
      <span v-if="isTitle">入场人员</span>
      <a-button
        v-if="(status === '0' || status === '' || status === '2') && !disabled && orgCode && (applicationType === '入场申请' ? publishCode : true)"
        type="primary"
        @click="addPersonnel"
        >添加人员</a-button
      >
    </div>
    <a-table
      size="middle"
      bordered
      :pagination="false"
      row-key="id"
      :columns="!disabled && (status === '0' || status === '' || status === '2') ? columns : columnsView"
      :data-source="dataSource"
    >
      <template #index="{ index }">
        {{ index + 1 }}
      </template>
      <template #operation="{ record, index }">
        <span v-if="!disabled" style="cursor: pointer; color: #1890ff" @click="onDelete(record, index)">移出</span>
        <span v-else style="cursor: pointer; color: #1890ff" @click="handleView(record)">查看</span>
      </template>
    </a-table>
  </div>
  <basic-modal v-bind="$attrs" @register="registerModal" :width="900" title="入场人员" @ok="onSubmit" destroyOnClose>
    <basic-table @register="registerTable" :row-selection="rowSelection" />
  </basic-modal>
  <personnel-drawer @register="registerDrawer" />
</template>
<script lang="ts" personName="personnel" setup>
  import { ref, h, watch } from 'vue';
  import { BasicModal, useModal } from '/@/components/Modal';
  import { BasicTable } from '/@/components/Table';
  import { useListPage } from '/@/hooks/system/useListPage';
  import { xgfList } from '../../url/index';
  import { useDrawer } from '/@/components/Drawer';
  import personnelDrawer from '../../../personnelList/drawer.vue';
  import dayjs from 'dayjs';
  import { Tag } from 'ant-design-vue';
  defineProps({
    disabled: {
      type: Boolean,
      default: false,
    },
    // 当前状态
    status: {
      type: String,
      default: '',
    },
    bodyStyle: {
      type: Object,
      default: () => {},
    },
    isTitle: {
      type: Boolean,
      default: true,
    },
    applicationType: {
      type: String,
      default: '',
    },
  });
  const emits = defineEmits(['table-value']);
  const [registerDrawer, { openDrawer }] = useDrawer();
  const [registerModal, { setModalProps, openModal, closeModal }] = useModal();
  const dataSource: any = ref([]);
  const publishCode = ref(null);
  const orgCode = ref(null);
  const columns = [
    {
      title: '序号',
      dataIndex: 'index',
      width: 60,
      slots: { customRender: 'index' },
      align: 'center',
    },
    {
      title: '姓名',
      dataIndex: 'name',
      align: 'center',
    },
    {
      title: '联系方式',
      dataIndex: 'phone',
      align: 'center',
    },
    {
      title: '证书状态',
      dataIndex: 'certificateStatus',
      align: 'center',
      customRender: ({ text }) => {
        return h(
          Tag,
          { color: text === '1' ? 'green' : text === '2' ? 'red' : text === '3' ? 'orange' : '' },
          text === '1' ? '正常' : text === '2' ? '过期' : text === '3' ? '即将到期' : ''
        );
      },
    },
    {
      title: '保险期限',
      dataIndex: 'insuranceStatus',
      align: 'center',
      customRender: ({ text }) => {
        return h(
          Tag,
          { color: text === '1' ? 'green' : text === '2' ? 'red' : text === '3' ? 'orange' : '' },
          text === '1' ? '有效' : text === '2' ? '过期' : text === '3' ? '即将到期' : ''
        );
      },
    },
    {
      title: '体检期限',
      dataIndex: 'physicalStatus',
      align: 'center',
      customRender: ({ text }) => {
        return h(Tag, { color: text === '1' ? 'green' : text === '2' ? 'red' : '' }, text === '1' ? '有效' : text === '2' ? '过期' : '');
      },
    },
    {
      title: '操作',
      dataIndex: 'operation',
      width: 65,
      slots: { customRender: 'operation' },
      align: 'center',
    },
  ];
  const columnsView: any = [
    {
      title: '序号',
      dataIndex: 'index',
      width: 60,
      slots: { customRender: 'index' },
      align: 'center',
    },
    {
      title: '姓名',
      dataIndex: 'name',
      align: 'center',
    },
    {
      title: '联系方式',
      dataIndex: 'phone',
      align: 'center',
    },
    {
      title: '证书状态',
      dataIndex: 'certificateStatus',
      align: 'center',
      customRender: ({ text }) => {
        return h(
          Tag,
          { color: text === '1' ? 'green' : text === '2' ? 'red' : text === '3' ? 'orange' : '' },
          text === '1' ? '正常' : text === '2' ? '过期' : text === '3' ? '即将到期' : ''
        );
      },
    },
    {
      title: '保险期限',
      dataIndex: 'insuranceStatus',
      align: 'center',
      customRender: ({ text }) => {
        return h(
          Tag,
          { color: text === '1' ? 'green' : text === '2' ? 'red' : text === '3' ? 'orange' : '' },
          text === '1' ? '有效' : text === '2' ? '过期' : text === '3' ? '即将到期' : ''
        );
      },
    },
    {
      title: '体检期限',
      dataIndex: 'physicalStatus',
      align: 'center',
      customRender: ({ text }) => {
        return h(Tag, { color: text === '1' ? 'green' : text === '2' ? 'red' : '' }, text === '1' ? '有效' : text === '2' ? '过期' : '');
      },
    },
    {
      title: '操作',
      dataIndex: 'operation',
      width: 65,
      slots: { customRender: 'operation' },
      align: 'center',
    },
  ];
  const columns1: any = [
    {
      title: '姓名',
      dataIndex: 'name',
    },
    {
      title: '联系方式',
      dataIndex: 'phone',
    },
    {
      title: '证书状态',
      dataIndex: 'certificateStatus',
      align: 'center',
      customRender: ({ text }) => {
        return h(
          Tag,
          { color: text === '1' ? 'green' : text === '2' ? 'red' : text === '3' ? 'orange' : '' },
          text === '1' ? '正常' : text === '2' ? '过期' : text === '3' ? '即将到期' : ''
        );
      },
    },
    {
      title: '保险期限',
      dataIndex: 'insuranceStatus',
      align: 'center',
      customRender: ({ text }) => {
        return h(
          Tag,
          { color: text === '1' ? 'green' : text === '2' ? 'red' : text === '3' ? 'orange' : '' },
          text === '1' ? '有效' : text === '2' ? '过期' : text === '3' ? '即将到期' : ''
        );
      },
    },
    {
      title: '体检期限',
      dataIndex: 'physicalStatus',
      align: 'center',
      customRender: ({ text }) => {
        return h(Tag, { color: text === '1' ? 'green' : text === '2' ? 'red' : '' }, text === '1' ? '有效' : text === '2' ? '过期' : '');
      },
    },
  ];
  const originPersonList = ref<any[]>([]);
  const xzSelectedRowKeys = ref<any[]>([]);
  const addPersonnel = () => {
    selectedRowKeys.value = dataSource.value.map((item) => item.id);
    openModal(true);
  };
  // 列表页面公共参数、方法
  const { tableContext } = useListPage({
    tableProps: {
      api: xgfList,
      columns: columns1,
      defSort: {
        column: 'updateTime',
        order: 'desc',
      },
      beforeFetch: (params) => {
        params.orgCode = orgCode.value;
        params.publishCode = publishCode.value;
        params.blackFlag = '0';
        return params;
      },
      rowSelection: {
        getCheckboxProps: (record: any) => {
          // 若证书状态不是正常||保险期限不是有效||培训状态不是正常||体检报告到期，则为true
          let disabled =
            // 证书状态
            record.certificateStatus === '2' ||
            // 保险期限
            record.insuranceStatus === '2' ||
            // 培训状态
            record.trainStatus !== '2' ||
            !record.canEnter ||
            // 体检报告时间
            !dayjs(record.physicalReportOvertime).isAfter(dayjs());
          // 根据项目带出人员，若包含，则不可选择
          if (originPersonList.value.includes(record.id)) {
            disabled = true;
          }
          // xzSelectedRowKeys 当前入场人员有效的，前提是非新增
          if (
            !record.canEnter && xzSelectedRowKeys.value.length > 0
              ? xzSelectedRowKeys.value.includes(record.id) // 若非新增，存在则可以进行选取操作
              : selectedRowKeys.value.includes(record.id) // 若新增，当前选中进行选取操作
          ) {
            disabled = false;
          }
          return {
            disabled: disabled,
          };
        },
      },
      useSearchForm: false,
      showActionColumn: false,
    },
  });
  const [registerTable, {}, { rowSelection, selectedRowKeys }] = tableContext;
  // 根据id查
  const initUserList = async (personIds) => {
    await xgfList({
      orgCode: orgCode.value,
      blackFlag: '0',
      pageSize: -1,
      selections: personIds.join(','),
    }).then((res) => {
      if (res) {
        let arr: any = [];
        res.records.forEach((item) => {
          item.personId = item.id;
          if (!originPersonList.value.includes(item.id)) {
            arr.push(item);
          }
        });
        dataSource.value = [...arr];
      }
    });
  };
  const onSubmit = async () => {
    selectedRowKeys.value = selectedRowKeys.value.filter((item) => !originPersonList.value.includes(item));
    setModalProps({ confirmLoading: true });
    if (selectedRowKeys.value.length === 0) {
      dataSource.value = [];
    } else {
      await initUserList(selectedRowKeys.value);
    }
    setModalProps({ confirmLoading: false });
    closeModal();
  };
  const onDelete = (data, index) => {
    dataSource.value.splice(index, 1);
    selectedRowKeys.value = selectedRowKeys.value.filter((item) => item !== data.id);
  };
  const handleView = (data) => {
    openDrawer(true, {
      title: '人员基本信息查看',
      type: 'view',
      showOkBtn: false,
      showFooter: true,
      data: {
        id: data.id,
      },
    });
  };
  watch(
    () => dataSource.value,
    () => {
      emits('table-value', dataSource.value);
    },
    {
      deep: true,
    }
  );
  defineExpose({ dataSource, selectedRowKeys, orgCode, initUserList, originPersonList, xzSelectedRowKeys, publishCode });
</script>
<style lang="less" scoped>
  .person-container {
    width: 100%;
    .title {
      height: 55px;
      line-height: 55px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      color: #1890ff;
      span {
        font-size: 16px;
        font-weight: 600;
      }
    }
    /deep/.ant-upload-select-picture-card,
    /deep/.ant-upload-list-picture-card-container {
      width: 60px;
      height: 60px;
    }
  }
</style>
