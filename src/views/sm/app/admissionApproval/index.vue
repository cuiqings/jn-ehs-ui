<template>
  <div class="admissionApproval">
    <van-tabs v-model:active="queryForm.status" @change="changTabs">
      <van-tab v-for="item in tabsArr" :name="item.keys" :key="item.keys" :title="item.title">
        <van-list
          v-if="listArr.length > 0"
          v-model:loading="loading"
          :finished="finished"
          :finished-text="listArr.length > 0 ? '没有更多了' : ''"
          @load="onLoad"
        >
          <div class="list" :data-index="index" v-for="(ite, index) in listArr" :key="ite.id">
            <div style="display: flex; justify-content: space-between; align-items: center">
              <div>{{ queryForm.status !== '4' ? ite.contractName : ite.projectName }}</div>
              <a-tag color="orange" v-if="ite.delayFlag">延期</a-tag>
            </div>
            <div>
              <div>发包单位：{{ ite.publishName }}</div>
              <div>申请类型：{{ ite.type }}</div>
              <div>项目名称：{{ ite.projectName }}</div>
              <div v-if="queryForm.status === '4'">施工期限：{{ ite.workDateStart ? ite.workDateStart + '至' + ite.workDateEnd : '' }}</div>
              <div v-else>申请时间：{{ ite.submitTime }}</div>
            </div>
            <div style="margin-top: 10px">
              <a-button v-if="queryForm.status === '1' && ite.canHandle" type="primary" style="margin: 0 10px 10px 0" @click="handleApproval(ite)"
                >去审批</a-button
              >
              <a-button type="primary" @click="handleView(ite)">查看详情</a-button>
            </div>
          </div>
        </van-list>
        <a-empty v-if="listArr.length === 0" style="margin-top: 50%" />
      </van-tab>
    </van-tabs>
  </div>
</template>
<script setup name="app-admissionApproval-list" lang="ts">
  import { ref, reactive, onMounted } from 'vue';
  import { approvallist, waitWorklist, workinglist } from '../../admissionApproval/url/index';
  import { useRouter } from 'vue-router';
  const router = useRouter();
  const tabsArr = [
    {
      title: '审批中',
      keys: '1',
    },
    {
      title: '待作业',
      keys: '3',
    },
    {
      title: '施工作业中',
      keys: '4',
    },
  ];
  const listArr: any = ref([]);
  const loading = ref(false);
  const finished = ref(false);
  const total = ref(0);
  const queryForm = reactive({
    pageNo: 1,
    pageSize: 10,
    status: '1',
  });
  onMounted(() => {
    init();
  });
  const init = async (is = true) => {
    loading.value = true;
    finished.value = true;
    if (is) listArr.value = [];
    if (queryForm.status === '3') {
      waitWorklist(queryForm)
        .then((res) => {
          total.value = res.total;
          if (is) listArr.value = res.records;
          else listArr.value = listArr.value.concat(res.records);
        })
        .finally(() => {
          loading.value = false;
          finished.value = false;
        });
    } else if (queryForm.status === '4') {
      workinglist(queryForm)
        .then((res) => {
          total.value = res.total;
          if (is) listArr.value = res.records;
          else listArr.value = listArr.value.concat(res.records);
        })
        .finally(() => {
          loading.value = false;
          finished.value = false;
        });
    } else {
      approvallist(queryForm)
        .then((res) => {
          if (res) {
            total.value = res.total;
            if (is) listArr.value = res.records;
            else listArr.value = listArr.value.concat(res.records);
          }
        })
        .finally(() => {
          loading.value = false;
          finished.value = false;
        });
    }
  };
  const onLoad = () => {
    if (listArr.value.length == total.value) {
      finished.value = true;
    } else {
      finished.value = false;
      // 加载状态结束
      loading.value = false;
      scrollCallback();
    }
  };
  //滚动后继续加载的回调函数
  const scrollCallback = () => {
    queryForm.pageNo++;
    init(false);
  };
  const changTabs = () => {
    queryForm.pageNo = 1;
    init();
  };
  const handleView = (data) => {
    router.push({
      path: '/app/sm/details',
      query: {
        type: 'view',
        addType: queryForm.status !== '4' ? data.type : '入场申请',
        id: data.id,
      },
    });
  };
  const handleApproval = (data) => {
    router.push({
      path: '/app/sm/task',
      query: {
        type: 'approval',
        addType: data.type,
        id: data.id,
      },
    });
  };
</script>
<style lang="less" scoped>
  .admissionApproval {
    background: #eff1f5;
    width: 100%;
    height: 100%;
    overflow-y: auto;
    .list {
      background: #ffffff;
      border-radius: 4px;
      opacity: 1;
      padding: 16px 13px;
      width: calc(100% - 26px);
      margin: 10px 13px 8px 13px;
      & > div {
        font-size: 13px;
        font-family: Source Han Sans CN, Source Han Sans CN;
        font-weight: 400;
        color: #b0afaf;
      }
      & > div:nth-child(1) {
        font-size: 15px;
        font-family: Source Han Sans CN, Source Han Sans CN;
        font-weight: 400;
        color: rgba(0, 0, 0, 0.87);
      }
    }
  }
  .person-list {
    margin: 0 10px;
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
</style>
