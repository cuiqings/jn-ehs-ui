<template>
  <div class="p-2">
    <!-- 查询条件 -->
    <div class="main p-2">
      <div class="mb-6">
        <a-space>
          <span>年度</span>
          <a-date-picker
            picker="year"
            allowClear
            v-model:value="queryParams.year"
            format="YYYY"
            value-format="YYYY"
            style="width: 120px"
            placeholder="请选择年度"
            :allowClear="false"
          />
          <a-button type="primary" @click="search">查询</a-button>
        </a-space>
      </div>

      <!-- 卡片列表 -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="record in recordList"
          :key="record.year"
          class="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
        >
          <!-- 卡片头部 -->
          <div class="p-4 border-b border-gray-100 title">
            <span class="bg-blue-500 text-white px-2 py-1 rounded text-sm">{{ record.year }}年</span>
            <h3 class="text-gray-800 text-base font-medium mb-4 leading-relaxed"> 敬业集团本部基地安全投入费用预算 </h3>
          </div>

          <!-- 卡片内容 -->
          <div class="p-4">
            <div class="text-2xl font-bold text-blue-600 mb-6 flex items-center justify-between">
              <span>{{ formatMoney(record.amount) }}</span>
              <a-button type="success" size="small" ghost>已完成</a-button>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="p-4 border-t border-gray-100">
            <div class="flex space-x-2">
              <a-button @click="handleDownload(record)"> 下载 </a-button>
              <a-button type="success" ghost @click="handleUpload(record)"> 上传签字版 </a-button>
              <a-button type="primary" @click="handleView(record)"> 查看 </a-button>
            </div>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="!loading && recordList.length === 0" class="text-center py-12">
        <a-empty style="margin-top: 100px" v-if="!loading" />
      </div>

      <!-- 加载状态 -->
      <div v-if="loading" class="text-center py-12">
        <a-spin size="large" />
      </div>
      <div style="margin: 10px; text-align: right">
        <pagination
          v-model:current="queryParams.pageNo"
          v-model:page-size="queryParams.pageSize"
          :total="total"
          show-quick-jumper
          showSizeChanger
          :pageSizeOptions="['12', '24', '36', '48', '60']"
          @change="pageSizeChange"
          :defaultPageSize="queryParams.pageSize"
          :show-total="(total: number) => `共${total}条记录  第${queryParams.pageNo}/${Math.ceil(total / queryParams.pageSize)}页`"
        />
      </div>
    </div>
    <!-- 查看弹窗 -->
    <ViewModal @register="registerViewModal" />
    <a-modal v-model:visible="openUploadModal" title="上传签字版" @ok="handleUploadOk" @cancel="closeUploadModal">
      <a-form layout="vertical" style="padding: 16px;" :model="formState" ref="formRef" autocomplete="off">
        <a-form-item label="年度" name="year">
          <a-input v-model:value="formState.year" style="width: 100px;" disabled />
        </a-form-item>
        <a-form-item label="选择签字版文件：" name="fileUrl" :rules="[{ required: true, message: '请上传文件' }]">
          <JUpload ref="uploadRef" :maxCount="5" v-model:value="formState.fileUrl" text="上传附件" />
        </a-form-item>
        <a-alert type="success" show-icon :closable="false" style="margin-top: 16px">
          <template #message>
            <span>
              <span style="color: #52c41a; font-weight: bold">支持文件格式：</span>
              <span style="color: #52c41a">PDF、Word、Excel文件</span>
            </span>
            <br />
            <span style="color: #666">请确保签字文件清晰完整</span>
          </template>
        </a-alert>
      </a-form>
    </a-modal>
  </div>
</template>

<script lang="ts" name="inSafetyProduction-inputRecord" setup>
  import { Pagination } from 'ant-design-vue';
  import { useContent } from './hooks/useContent';
  import { JUpload } from '/@/components/Form/src/jeecg/components/JUpload';
  import ViewModal from './viewModal.vue';
  import { uploadInputRecord } from './api';
  import { ref } from 'vue';
  import dayjs from 'dayjs';
  import { FormInstance } from 'ant-design-vue';
  const { loading, recordList, handleQuery, total, handleDownload, handleView, registerViewModal } = useContent();

  const queryParams = ref({
    pageNo: 1,
    pageSize: 12,
    total: 0,
    year: dayjs(new Date()).format('YYYY'),
  });

  const pageSizeChange = async (page, pageSize) => {
    queryParams.value.pageNo = page;
    queryParams.value.pageSize = pageSize;
    handleQuery(queryParams.value);
  };
  const search = async () => {
    queryParams.value.pageNo = 1;
    handleQuery(queryParams.value);
  };
  search();

  // 转换为万元
  const formatMoney = (money: number) => {
    return (money / 10000).toFixed(2) + '万元';
  };

  const formState = ref({
    year: '',
    fileUrl: '',
    id: '',
  });
  const openUploadModal = ref(false);
  const formRef = ref<FormInstance | null>(null);
  const handleUpload = (record) => {
    formState.value.year = record.year;
    formState.value.id = record.id;
    openUploadModal.value = true;
  };
  const handleUploadOk = () => {
    formRef.value?.validate().then((res) => {
      uploadInputRecord(formState.value).then((res) => {
        openUploadModal.value = false;
        search();
        formRef.value?.resetFields();
      });
    });
};

  const closeUploadModal = () => {
    openUploadModal.value = false;
    formRef.value?.resetFields();
  };
</script>

<style scoped>
  .main {
    background-color: #fff;
  }
  .grid {
    display: grid;
  }

  .grid-cols-1 {
    grid-template-columns: repeat(1, minmax(0, 1fr));
  }

  @media (min-width: 768px) {
    .md\:grid-cols-2 {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (min-width: 1024px) {
    .lg\:grid-cols-3 {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
  }
  .title {
    h3 {
      padding: 0;
      margin: 0;
      margin-top: 10px;
    }
  }

  .gap-6 {
    gap: 1.5rem;
  }
</style>
