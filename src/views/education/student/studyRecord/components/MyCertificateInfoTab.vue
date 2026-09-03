<template>
  <div>
    <!-- 卡片区域 -->
    <div style="clear: both" v-if="listData.length > 0">
      <div class="study-list">
        <a-card
          hoverable
          style="position: relative; display: inline-block; margin-bottom: 20px"
          :style="{ marginRight: (index + 1) % 8 == 0 ? '0px' : '50px' }"
          v-for="(item, index) in listData"
          :key="item.id"
          @click="showCertModal(item)"
        >
          <template #cover>
            <img alt="example" :src="cert1" style="width: 180px" />
          </template>
          <a-card-meta v-if="item.certData" :title="item.render.name">
            <template #description>证书有效期：{{ item.certData.split('~')[1] }}</template>
          </a-card-meta>
          <div class="tag-text">
            <a-tag v-if="item.status == 1" color="#07c160">正常</a-tag>
            <a-tag v-if="item.status == 2" color="#f90">已过期</a-tag>
            <a-tag v-if="item.status == 3" color="#f00">已撤销</a-tag>
          </div>
          <div class="alert-text">
            <div class="content" v-if="item.status == 2 && item.certData">
              <div>过期时间：{{ item.certData.split('~')[1] }}</div>
            </div>
            <div class="content-1" v-if="item.status == 3">
              <div>撤销原因：{{ item.reason }}</div>
              <div>撤销时间：{{ item.revocationTime }}</div>
            </div>
          </div>
        </a-card>
      </div>
    </div>
    <a-empty v-else description="暂无数据" style="position: relative; top: 20px" />
    <!-- 分页 -->
    <div class="page-wrap" v-if="listData.length > 0">
      <a-pagination
        v-model:current="current"
        :page-size-options="pageSizeOptions"
        v-model:page-size="pageSize"
        :total="total"
        show-size-changer
        @change="onChange"
        @show-size-change="onShowSizeChange"
      />
    </div>
  </div>
  <CertModal @register="registerModal" @success="successOk" />
</template>

<script setup lang="ts">
  import { ref, watch } from 'vue';
  import { useModal } from '/@/components/Modal';
  import CertModal from './CertModal.vue';
  import { getCertList } from '../studyRecord.api';
  import { Pagination } from 'ant-design-vue';
  import cert1 from '/@/assets/images/certificate/cert1.png';
  const props = defineProps({
    currentKey: { require: true, type: String },
  });
  const [registerModal, { openModal }] = useModal();
  const APagination = Pagination;
  const current = ref(1);
  const pageSize = ref(8);
  const loading = ref(false);
  const pageSizeOptions = ref<string[]>(['8', '12', '16', '20']);
  const total = ref(0);
  const listData: any = ref([]);
  loadData(1);
  watch(
    () => props.currentKey,
    () => loadData(1)
  );
  async function loadData(arg) {
    if (arg === 1) {
      current.value = 1;
    }
    loading.value = true;
    let param = {};
    param['pageNo'] = current.value;
    param['pageSize'] = pageSize.value;
    await getCertList(param).then((res) => {
      if (res.records.length > 0) {
        res.records.forEach((data) => {
          data.render = JSON.parse(data.render);
        });
      }
      listData.value = res.records;
      total.value = res.total;
      loading.value = false;
    });
  }
  const onShowSizeChange = () => {
    loadData(0);
  };
  const onChange = () => {
    loadData(0);
  };
  function showCertModal(item) {
    if (item.status == 1 && item.render) {
      openModal(true, item);
    }
  }
  const successOk = () => {
    loadData(0);
  };
</script>

<style lang="less" scoped>
  .study-list {
    padding: 20px;
    margin: 0 auto;
  }
  .page-wrap {
    float: right;
    margin-top: 50px;
  }
  :deep(.ant-card-meta-detail) {
    overflow: hidden;
    text-align: left;
  }
  :deep(.ant-card-meta-title) {
    overflow: visible;
    color: rgba(0, 0, 0, 0.85);
    font-weight: 500;
    font-size: 14px;
    white-space: normal;
    text-overflow: initial;
  }
  :deep(.ant-card-body) {
    padding: 5px;
  }
  .tag-text {
    position: absolute;
    top: 10px;
    right: 4px;
  }
  .alert-text {
    position: absolute;
    top: 40px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 12px;
    .content {
      width: 146px;
      background-color: #fffbe6;
      border: 1px solid #ffe58f;
      border-radius: 2px;
      padding: 5px;
    }
    .content-1 {
      width: 146px;
      background-color: #fff1f0;
      border: 1px solid #ffa39e;
      border-radius: 2px;
      padding: 5px;
    }
  }
  :deep(.ant-card-meta-title) {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    width: 168px;
  }
</style>
