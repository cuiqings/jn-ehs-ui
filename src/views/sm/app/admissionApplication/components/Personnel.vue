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
    <div class="person-list">
      <div v-for="(item, index) in dataSource" :key="index">
        <div style="display: flex; justify-content: space-between">
          <p>{{ item.name }}</p>
          <span v-if="!disabled" style="color: #1890ff" @click="onDelete(item, index)">移除</span>
          <span v-else style="color: #1890ff" @click="onDetail(item)">查看</span>
        </div>
        <div>
          <div>
            <div class="person-list-flex">
              <div
                ><span>联系方式：</span><span>{{ item.phone }}</span></div
              >
              <div
                ><span>证书状态：</span
                ><span
                  :style="
                    item.certificateStatus === '2'
                      ? 'color: red'
                      : item.certificateStatus === '3'
                      ? 'color: orange'
                      : item.certificateStatus === '1'
                      ? 'color: green'
                      : ''
                  "
                  >{{
                    item.certificateStatus === '1'
                      ? '正常'
                      : item.certificateStatus === '2'
                      ? '过期'
                      : item.certificateStatus === '3'
                      ? '即将到期'
                      : ''
                  }}</span
                ></div
              >
            </div>
            <div class="person-list-flex">
              <div
                ><span>保险期限：</span
                ><span
                  :style="
                    item.insuranceStatus === '2'
                      ? 'color: red'
                      : item.insuranceStatus === '3'
                      ? 'color: orange'
                      : item.insuranceStatus === '1'
                      ? 'color: green'
                      : ''
                  "
                  >{{
                    item.insuranceStatus === '1' ? '正常' : item.insuranceStatus === '2' ? '过期' : item.insuranceStatus === '3' ? '即将到期' : ''
                  }}</span
                ></div
              >
              <div
                ><span>体检期限：</span
                ><span :style="item.physicalStatus === '2' ? 'color: red' : item.physicalStatus === '1' ? 'color: green' : ''">{{
                  item.physicalStatus === '1' ? '有效' : item.physicalStatus === '2' ? '过期' : ''
                }}</span></div
              >
            </div>
          </div>
        </div>
      </div>
      <a-empty v-if="dataSource.length === 0" />
    </div>
  </div>
  <basic-modal v-bind="$attrs" @register="registerModal" :width="900" title="入场人员" @ok="onSubmit" destroyOnClose>
    <basic-table @register="registerTable" :row-selection="rowSelection" />
  </basic-modal>
</template>
<script lang="ts" name="personnel" setup>
  import { ref, h, watch } from 'vue';
  import { BasicModal, useModal } from '/@/components/Modal';
  import { BasicTable } from '/@/components/Table';
  import { useListPage } from '/@/hooks/system/useListPage';
  import { xgfList } from '../../../admissionApplication/url/index';
  import { useRouter } from 'vue-router';
  import dayjs from 'dayjs';
  import { Tag } from 'ant-design-vue';
  const router = useRouter();
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
  const [registerModal, { setModalProps, openModal, closeModal }] = useModal();
  const dataSource: any = ref([]);
  const orgCode = ref(null);
  const publishCode = ref(null);
  const originPersonList = ref<any[]>([]);
  const xzSelectedRowKeys = ref<any[]>([]);
  const columns: any = [
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
  const addPersonnel = () => {
    selectedRowKeys.value = dataSource.value.map((item) => item.id);
    openModal(true);
  };
  // 列表页面公共参数、方法
  const { tableContext } = useListPage({
    tableProps: {
      api: xgfList,
      columns: columns,
      defSort: {
        column: 'updateTime',
        order: 'desc',
      },
      beforeFetch: (params) => {
        params.orgCode = orgCode.value;
        params.blackFlag = '0';
        params.publishCode = publishCode.value;
        return params;
      },
      rowSelection: {
        getCheckboxProps: (record: any) => {
          let disabled =
            record.certificateStatus === '2' ||
            record.insuranceStatus === '2' ||
            record.trainStatus !== '2' ||
            !record.canEnter ||
            !dayjs(record.physicalReportOvertime).isAfter(dayjs());
          if (originPersonList.value.includes(record.id)) {
            disabled = true;
          }
          if (
            !record.canEnter && xzSelectedRowKeys.value.length > 0
              ? xzSelectedRowKeys.value.includes(record.id)
              : selectedRowKeys.value.includes(record.id)
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
  // 根据id查人员
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
  const onDetail = (data) => {
    console.log(data);
    router.push({
      path: '/app/sm/personnel/view',
      query: {
        id: data.personId,
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
  defineExpose({ dataSource, selectedRowKeys, orgCode, initUserList, originPersonList, publishCode });
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
    :deep(.ant-upload-select-picture-card),
    :deep(.ant-upload-list-picture-card-container) {
      width: 60px;
      height: 60px;
    }
    .person-list {
      padding-bottom: 20px;
      .person-list-flex {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      & > div {
        border-bottom: 1px solid #eff1f5;
        background-color: #ffffff;
        padding: 10px 0;
        & > div {
          line-height: 35px;
          p {
            margin: 0;
            font-size: 15px;
          }
        }
        span:first-child {
          color: #7f7f7f;
        }
      }
      & > div:last-child {
        border-bottom: none;
      }
    }
  }
</style>
