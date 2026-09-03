<template>
  <div v-loading="loading">
    <div v-show="show">
      <BasicForm ref="registerFormRef" @register="registerForm" @submit="onSubmit" @reset="resetForm" />
    </div>
    <template v-if="cardData.length > 0">
      <a-row :span="24" :gutter="[20, 10]">
        <a-col :span="6" v-for="item in cardData" :key="item.id">
          <a-card class="fixed-height-card">
            <a-row :span="24">
              <a-col :span="13">
                <span style="font-weight: bold; display: inline-block">
                  {{ item.workContent }}
                </span>
                <a-tag v-if="item.workGrade" style="display: inline-block; margin-left: 5px">{{ item.workGrade }}</a-tag>
              </a-col>
              <a-col :span="11">
                <a-tag color="red" style="border: 0; background-color: rgb(242, 242, 242)">{{ item.delayedMark }}</a-tag>
                <a-tag color="red" style="border: 0; background-color: rgb(242, 242, 242)">{{ item.timeoutMark }}</a-tag>
                <a-tag color="red" style="border: 0; background-color: rgb(242, 242, 242)">{{ item.workStopMark }}</a-tag>
              </a-col>
              <a-col :span="24" style="margin-top: 10px"> 编号：{{ item.workApplyCode }}</a-col>
              <a-col :span="24" style="margin-top: 10px"> 作业类型：{{ item.workTypeName }}</a-col>
              <a-col :span="24" style="margin-top: 10px"> 作业地点：{{ item.workLocation }}</a-col>
              <a-col :span="24" style="margin-top: 10px">申请单位：{{ item.applicationUnitName }}</a-col>
              <a-col :span="24" style="margin-top: 10px" v-if="item.workTime">开始时间：{{ item.workTime }}</a-col>
              <!-- <a-col :span="24" style="margin-top: 10px">申请人：{{ item.applicantName }}</a-col>
              <a-col :span="24" style="margin-top: 20px; color: #907f7f">申请时间：{{ item.applicationTimeStr }}</a-col> -->
            </a-row>
            <a-row justify="end" :span="24" style="margin-top: 30px">
              <a-space :size="20">
                <a-col :span="7" v-if="state == '1'">
                  <a-button type="primary" size="small" @click="review(item, false)">去审核</a-button>
                </a-col>
                <a-col :span="7">
                  <a-button type="primary" size="small" @click="review(item, true)">查看详情</a-button>
                </a-col>
              </a-space>
            </a-row>
          </a-card>
        </a-col>
      </a-row>
      <div style="margin: 10px; text-align: right">
        <pagination
          v-model:current="current"
          v-model:page-size="pageSize"
          :total="total"
          show-quick-jumper
          showSizeChanger
          :pageSizeOptions="['12', '24', '36', '48', '60']"
          @change="pageSizeChange"
          :defaultPageSize="pageSize"
          :show-total="(total: number) => `共${total}条记录 第${current}/${Math.ceil(total / pageSize)}页`"
        />
      </div>
    </template>
    <template v-else>
      <a-empty style="margin-top: 100px" v-if="!loading" />
    </template>
    <job-pop-up-box :readonly="readOnly" ref="jobPopUpBox" @renewal="renewal" @register="applyRegister" />
    <DetailDrawer @register="register" />
  </div>
</template>

<script setup lang="ts">
  import { Pagination } from 'ant-design-vue';
  import { Ref, inject, onMounted, provide, reactive, readonly, ref } from 'vue';
  import { getApplyForUnit, getJobType, getWorkExamineList } from '../api';
  import { useContent } from '../hooks/useContent';
  import type { CardList, JobApplyForFrom, searchJobList } from '../type';
  import JobPopUpBox from './JobPopUpBox.vue';
  import DetailDrawer from '../detail/detailDaver.vue';
  import { BasicForm } from '/@/components/Form';
  import { useUserStore } from '/@/store/modules/user';
  import { useDrawer } from '/@/components/Drawer';
  import { useWorkStore } from '/@/store/modules/dangerousWork';
  import { useRoute } from 'vue-router';
  const workStore = useWorkStore();
  const workList = workStore.getWorkList;
  // const prop =
  defineProps({
    show: {
      type: Boolean,
    },
  });

  const total = ref(0);
  const visible = ref(false);
  const type = ref('');
  const readOnly = ref(false);
  const disabled = ref(false);
  const current = ref<number>(1);
  const pageSize = ref<number>(12);
  const dataSauce = ref<any>([]);
  const possibleDanger = ref<any>([]);
  const formRules = ref<any>([]);
  const applyForJob = reactive<any[]>([]);
  const applicantUnit = reactive<any[]>([]);
  const viewEditData = ref<JobApplyForFrom>({});
  let formState = reactive<searchJobList>({});
  let cardData = ref<CardList[]>([]);
  const state = inject<Ref<string>>('state') as Ref<string>;
  const { registerForm, getFieldsValue } = useContent();
  const userStore = useUserStore();
  const registerFormRef = ref();

  const route = useRoute();

  getJobType().then((res) => {
    applyForJob.push(...res.sort((a: { value: number }, b: { value: number }) => a.value - b.value));
  });
  getApplyForUnit().then((res) => {
    applicantUnit.push(...(res as never[]));
  });
  const onSubmit = (value) => {
    formState = { ...value };
    getList({ ...formState, state: state.value, pageNo: current.value, pageSize: pageSize.value });
  };
  const resetForm = (value) => {
    formState = { ...value };
    getList({ ...formState, state: state.value, pageNo: current.value, pageSize: pageSize.value });
  };
  // 页数和条数变化
  const pageSizeChange = (page: any, pageSize: any) => {
    getList({ ...formState, state: state.value, pageNo: page, pageSize: pageSize });
  };
  const loading = ref(false);
  const getList = async (data: searchJobList) => {
    loading.value = true;
    const formData = await getFieldsValue();
    let params = { ...data };
    params.pageSize = data.pageSize || pageSize.value;
    params.pageNo = data.pageNo || current.value;
    if (params.state == '2') {
      Object.assign(params, formData);
      if (params.endTime) {
        params.endTime = params.endTime + ' 23:59:59';
      }
      if (params.startTime) {
        params.startTime = params.startTime + ' 00:00:00';
      }
    }
    params['type'] = route.name === 'UnhazardousWork-JobApproval' ? 2 : 1;
    const res = await getWorkExamineList(params).finally(() => (loading.value = false));
    total.value = res.total;
    current.value = res.current;
    pageSize.value = res.size;
    cardData.value = res.records;
  };
  onMounted(async () => {
    getList({ state: state.value });
  });
  // 弹窗关闭
  const renewal = () => {
    viewEditData.value = {};
    visible.value = false;
    getList({ state: state.value });
  };
  const [applyRegister, { openDrawer: applyOpenDrawer }] = useDrawer();
  const [register, { openDrawer }] = useDrawer();
  //查看详情审核
  const review = async (item, isReview) => {
    if (isReview) {
      openDrawer(true, {
        id: item.id,
        title: item.workTypeName,
      });
      return;
    }
    applyOpenDrawer(true, {
      id: item.id,
      title: '作业审批',
    });
    readOnly.value = true;
    disabled.value = isReview;
  };

  provide('formState', viewEditData);
  provide('formRules', formRules);
  provide('readOnly', readonly(disabled));
  provide('title', type);
  provide('open', visible);
  defineExpose({
    getList,
  });
</script>

<style lang="less" scoped>
  .fixed-height-card {
    border-radius: 7px;
    box-shadow: 5px 5px 5px rgba(0, 0, 0, 0.3);
  }
  :deep(.ant-select-selection-overflow) {
    flex-wrap: nowrap !important;
    overflow: auto !important;
  }
</style>
