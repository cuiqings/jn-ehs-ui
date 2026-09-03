<template>
  <div class="panel-container">
    <BasicForm @register="registerForm" @submit="onSubmit" @reset="resetForm" />
    <div class="panel-content">
      <a-row :span="24" :gutter="[10, 10]">
        <a-col :span="6" v-for="item in dataList" :key="item.id">
          <div class="card">
            <h1>{{ item.name }}</h1>
            <p><span>演练年份:</span> {{ item.yearDate }}</p>
            <p><span>计划单位:</span> {{ item.orgCodeName }}</p>
            <div class="foot">
              <a-space :size="10">
                <a-button type="primary" v-if="status == 2" @click="approveClick(item, 'start')">去审批</a-button>
                <a-button type="primary" @click="viewDetail(item)">查看详情</a-button>
              </a-space>
            </div>
          </div>
        </a-col>
      </a-row>
    </div>
    <div style="margin: 10px; text-align: right">
      <pagination
        v-model:current="pageNo"
        v-model:page-size="pageSize"
        :total="total"
        show-quick-jumper
        showSizeChanger
        :pageSizeOptions="['12', '24', '36', '48', '60']"
        @change="pageSizeChange"
        :defaultPageSize="pageSize"
        :show-total="(total: number) => `共${total}条记录  第${pageNo}/${Math.ceil(total / pageSize)}页`"
      />
    </div>
  </div>
  <PlanDrawer @register="registerDrawer" @success="handleSuccess" />
</template>
<script setup lang="ts">
  import { Pagination } from 'ant-design-vue';
  import { examineList } from '../api';
  import { BasicForm } from '/@/components/Form';
  import { useContent } from './hooks/useContent';
  import PlanDrawer from './drawer.vue';
  import { ref, onMounted } from 'vue';
  const { status } = defineProps({
    status: {
      type: String,
      default: '1',
    },
  });

  const queryParams = ref({
    orgCode: '',
    pageNo: 1,
    pageSize: 12,
    total: 0,
    totalPage: 0,
    loading: false,
  });
  const { registerForm, getFieldsValue, registerDrawer, openDrawer, orgTree, setFieldsValue } = useContent();

  onMounted(() => {
    setTimeout(() => {
      pageInit();
    }, 200);
  });
  // 总条数
  const total = ref(0);
  // 页数
  const pageNo = ref<number>(1);
  // 页数和条数
  const pageSize = ref<number>(12);
  const dataList = ref([]);

  const resetForm = () => {
    pageInit();
  };
  // 页数和条数变化
  const pageSizeChange = (page: any, pageS: any) => {
    pageNo.value = page;
    pageSize.value = pageS;
    pageInit();
  };

  async function pageInit() {
    Object.assign(queryParams.value, getFieldsValue());
    setFieldsValue({ orgCode: orgTree.value[0].key })
    if(!queryParams.value.orgCode) queryParams.value.orgCode = orgTree.value[0].key;
    let res = await examineList({ ...queryParams.value, status: status, pageNo: pageNo.value, pageSize: pageSize.value });
    total.value = res.total;
    dataList.value = res.records;
  }

  const onSubmit = (value) => {
    Object.assign(queryParams.value, value);
    pageInit();
  };

  const handleSuccess = () => {
    pageInit();
  };

  const approveClick = (item, type) => {
    openDrawer(true, { ...item, title: '计划审批' });
  };

  const viewDetail = (item) => {
    openDrawer(true, { ...item, title: '详情' });
  };
  defineExpose({
    resetForm
  })
</script>

<style lang="less" scoped>
  .card {
    padding: 16px;
    border-radius: 7px;
    box-shadow: 5px 5px 5px rgba(0, 0, 0, 0.3);
    h1 {
      font-size: 16px;
      word-break: break-all;
      // 两行省略号
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      line-height: 1.5;
    }
    span {
      color: #666;
    }
    .foot {
      display: flex;
      justify-content: flex-end;
    }
  }
</style>
