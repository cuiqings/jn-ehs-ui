<template>
    <div class="panel-container"> 
      <BasicForm @register="registerForm" @submit="onSubmit" @reset="resetForm" />
      <div class="panel-content">
        <a-row :span="24" :gutter="[10, 10]">
          <a-col :span="6" v-for="item in dataList" :key="item.id">
            <div class="card">
            <h1>{{ item.planName }}</h1>
            <p><span>演练单位:</span> {{ item.orgName }}</p>
            <p><span>演练地点:</span> {{ item.drillPlace }}</p>
            <p><span>演练应急预案:</span> <span style="color: #1890ff;"
                @click="previewFn(item.drillEmergencyPlan)">{{ item.drillEmergencyPlan }}</span></p>
            <p><span>实施时间:</span> {{ item.drillTime }}</p>
            <div class="foot">
              <a-space :size="10" wrap>
                <a-button v-if="status == '0'" type="primary" @click="approveClick(item)">去审批</a-button>
                <a-button type="primary"
                  @click="viewDetail(item)">查看详情</a-button>
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
    <DetailDrawer @register="registerDrawer" @success="handleSuccess" />
</template>
<script setup lang="ts">
  import { Pagination } from 'ant-design-vue';
  import { approvalList } from '../api';
  import { BasicForm } from '/@/components/Form';
  import { useContent } from './hooks/useContent';
  import DetailDrawer from './detailDrawer.vue'
  import { ref, onMounted } from 'vue';
  import { previewFile } from '/@/api/common/api';
  const { status } = defineProps({
    status: {
      type: String,
      default: '0',
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
    pageInit();
  });
    // 总条数
  const total = ref(0);
  // 页数
  const pageNo = ref<number>(1);
  // 页数和条数
  const pageSize = ref<number>(12);
  const dataList = ref<any[]>([]);

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
    if(!queryParams.value.orgCode) queryParams.value.orgCode = orgTree.value[0].key;
    setFieldsValue({ orgCode: orgTree.value[0].key })
     let res = await approvalList({ ...queryParams.value, status: status, pageNo: pageNo.value, pageSize: pageSize.value });
    total.value = res.total;
    res.records.forEach((item) => {
      item.drillEmergencyPlan = item.drillEmergencyPlan ? JSON.parse(item.drillEmergencyPlan).join(',') : '';
    });
    dataList.value = res.records;
  }

  const onSubmit = (value) => {
    Object.assign(queryParams.value, value);
    pageInit();
  };

  const handleSuccess = () => {
    pageInit();
  }

  const approveClick = (item, type) => { 
    openDrawer(true, {...item, title: '演练审批'})
  };

  const viewDetail = (item) => { 
    openDrawer(true, {...item, title: '详情'})
  };

  const previewFn = (src) => {
    previewFile(src).then((res) => {
      window.open(res, '_blank');
    });

  };
  defineExpose({
    resetForm
  })
</script>

<style lang="less" scoped>
.card{
  padding: 16px;
  border-radius: 7px;
  box-shadow: 5px 5px 5px rgba(0, 0, 0, 0.3);
  h1{
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
  span{
    color: #666;
  }
  .foot{
    display: flex;
    justify-content: flex-end;
  }
}
</style>
