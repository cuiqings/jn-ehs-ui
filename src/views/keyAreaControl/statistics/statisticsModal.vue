<template>
  <div>
    <BasicModal v-bind="$attrs" @register="registerModal" title="查看" width="800px" :zIndex="99" destroyOnClose>
      <BasicForm @register="registerForm">
        <template #title>
          <span>{{ title }}</span>
          <a-button class="left" type="primary" size="small" @click="exportRecord">导出</a-button>
        </template>
        <template #table>
          <a-table
            ref="table"
            size="middle"
            bordered
            rowKey="id"
            :columns="columns"
            :scroll="{ x: 3000 }"
            :loading="loading"
            :dataSource="dataSource"
            :pagination="ipagination"
            @change="tableChange"
          >
            <template #process="{ record }">
              <JEllipsis :value="record.process" :length="10" />
            </template>
            <template #line="{ record }">
              <JEllipsis :value="record.line" :length="10" />
            </template>
            <template #position="{ record }">
              <JEllipsis :value="record.position" :length="10" />
            </template>
            <template #numbers="{ record }">
              <JEllipsis :value="record.numbers" :length="10" />
            </template>
            <template #principlePurpose="{ record }">
              <JEllipsis :value="record.principlePurpose" :length="10" />
            </template>
            <template #riskDescription="{ record }">
              <JEllipsis :value="record.riskDescription" :length="10" />
            </template>
            <template #checkCycle="{ record }">
              <JEllipsis :value="record.checkCycle" :length="10" />
            </template>
            <template #cenType="{ record }">
              <span v-if="record.cenType === '0' || !record.cenType">
                <JEllipsis :value="record.censorshipWord" :length="10" />
              </span>
              <span v-if="record.cenType === '1' && record.censorshipFile">√</span>
            </template>
            <template #criType="{ record }">
              <span v-if="record.criType === '0' || !record.criType">
                <JEllipsis :value="record.criterionWord" :length="10" />
              </span>
              <span v-if="record.criType === '1' && record.criterionFile">√</span>
            </template>
            <template #cleanCheckRecordType="{ record }">
              <span v-if="record.cleanCheckRecordType === '1'">
                <JEllipsis :value="record.cleanCheckRecord" :length="10" />
              </span>
              <span v-if="record.cleanCheckRecordType === '0' && record.maintenanceRecordId">√</span>
            </template>
            <template #cleanCheckPhotoType="{ record }">
              <span v-if="record.cleanCheckPhotoType === '1'">
                <JEllipsis :value="record.cleanCheckPhotoCompare" :length="10" />
              </span>
              <span v-else>√</span>
            </template>
            <template #checkPhoto="{ record }">
              <img
                v-if="record.checkPhoto"
                :src="fmtImg(record.checkPhoto)"
                style="cursor: pointer; display: inline-block; width: 40px; height: 40px"
                @click="openImg(record.checkPhoto)"
              />
              <span v-else>无</span>
            </template>
            <template #nextCleanCheckTime="{ record }">
              <span :class="record.colour === '0' ? '' : 'red'">{{ record.nextCleanCheckTime }}</span>
            </template>
            <template #action="{ record }">
              <a @click="handleDetail(record)">查看</a>
            </template>
          </a-table>
        </template>
      </BasicForm>
    </BasicModal>
    <MonitorModal @register="monitorModal" />
  </div>
</template>

<script lang="ts" setup>
  import { ref } from 'vue';
  import { BasicModal, useModal, useModalInner } from '/@/components/Modal';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import { getList, exportXls } from './statistics.api';
  import { columns, searchFormSchema } from './statistics.data';
  import { dateFormat, getFileAccessHttpUrl } from '/@/utils/common/compUtils';
  import { createImgPreview } from '/@/components/Preview';
  import MonitorModal from '../monitor/monitorModal.vue';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { JEllipsis } from '/@/components/Form';

  const { createMessage } = useMessage();
  const [monitorModal, { openModal: openMonitorModal }] = useModal();
  const [registerForm, { setFieldsValue }] = useForm({
    schemas: searchFormSchema,
    showActionButtonGroup: false,
    labelCol: {
      xs: { span: 0 },
      sm: { span: 0 },
    },
    wrapperCol: {
      xs: { span: 24 },
      sm: { span: 24 },
    },
  });
  const title: any = ref('');
  const loading: any = ref(false);
  const ipagination: any = ref({
    current: 1,
    pageSize: 10,
    pageSizeOptions: ['10', '20', '30'],
    showTotal: (total, range) => {
      return range[0] + '-' + range[1] + ' 共' + total + '条';
    },
    showQuickJumper: true,
    showSizeChanger: true,
    total: 0,
  });
  const dataSource: any = ref([]);
  const parentData: any = ref({});
  const [registerModal, { setModalProps }] = useModalInner(async (data) => {
    title.value = data.title;
    parentData.value = data;
    loadData();
    setModalProps({
      confirmLoading: false,
      showCancelBtn: false,
      showOkBtn: false,
    });
    await setFieldsValue({
      ...data.record,
    });
  });

  function loadData() {
    loading.value = true;
    const { pageSize, current } = ipagination.value;
    getList(Object.assign(parentData.value, { pageSize, pageNo: current })).then((res) => {
      dataSource.value = res.records || [];
      ipagination.value.total = res.total;
      loading.value = false;
    });
  }

  function fmtImg(image) {
    const firstImg = image.split(',')[0];
    return getFileAccessHttpUrl(firstImg);
  }

  function openImg(image) {
    let imageList = image.split(',').map((i) => getFileAccessHttpUrl(i));
    createImgPreview({
      imageList: imageList,
      defaultWidth: 600,
      rememberState: true,
      scaleStep: 10,
    });
  }

  function tableChange(pagination) {
    ipagination.value.current = pagination.current;
    ipagination.value.pageSize = pagination.pageSize;
    loadData();
  }

  // 查看
  function handleDetail(record) {
    openMonitorModal(true, {
      isUpdate: true,
      showFooter: false,
      record: record,
      type: '1',
    });
  }

  async function exportRecord() {
    const data = await exportXls(parentData.value);
    if (!data) {
      createMessage.warning('文件下载失败');
      return;
    }
    const name = '重点部位统计' + dateFormat(new Date(), 'yyyy-MM-dd');
    const blobOptions = { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' };
    const fileSuffix = '.xlsx';
    if (typeof window.navigator.msSaveBlob !== 'undefined') {
      window.navigator.msSaveBlob(new Blob([data], blobOptions), name + fileSuffix);
    } else {
      let url = window.URL.createObjectURL(new Blob([data], blobOptions));
      let link = document.createElement('a');
      link.style.display = 'none';
      link.href = url;
      link.setAttribute('download', name + fileSuffix);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link); //下载完成移除元素
      window.URL.revokeObjectURL(url); //释放掉blob对象
    }
  }
</script>

<style lang="less" scoped>
  .left {
    margin-left: 10px;
  }

  .red {
    color: red;
  }
</style>
