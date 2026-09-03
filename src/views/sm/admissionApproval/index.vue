<template>
  <div class="admissionApproval admissionApproval-content">
    <a-tabs size="large" v-model:activeKey="activeKey" :destroyInactiveTabPane="true" @change="changeTabs">
      <a-tab-pane v-for="item in tabsArr" :key="item.keys" :tab="item.title">
        <a-spin :spinning="spinning">
          <div>
            <a-form
              style="margin-bottom: 20px; width: 99%"
              :model="queryParams"
              :label-col="{
                xs: { span: 24 },
                sm: { span: 5 },
              }"
              :wrapper-col="{
                xs: { span: 24 },
                sm: { span: 19 },
              }"
            >
              <a-row :gutter="24">
                <a-col :md="6" :sm="12">
                  <a-form-item label="项目名称">
                    <a-input allowClear placeholder="请输入" v-model:value="queryParams.projectName" />
                  </a-form-item>
                </a-col>
                <a-col :md="6" :sm="12">
                  <a-form-item label="发包单位">
                    <a-select
                      v-model:value="queryParams.publishCode"
                      :options="orgOptions"
                      placeholder="请选择"
                      showSearch
                      allowClear
                      :filterOption="(input, option) => option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0"
                    />
                  </a-form-item>
                </a-col>
                <a-col :md="6" :sm="12" v-if="userInfo.orgCode.slice(0, 6) !== 'A04B12'">
                  <a-form-item label="承包单位">
                    <a-input allowClear placeholder="请输入" v-model:value="queryParams.contractName" />
                  </a-form-item>
                </a-col>
                <template v-if="toggleSearchStatus">
                  <a-col :md="6" :sm="12">
                    <a-form-item label="施工期限">
                      <a-range-picker style="width: -webkit-fill-available" valueFormat="YYYY-MM-DD" v-model:value="queryParams.time" />
                    </a-form-item>
                  </a-col>
                </template>
                <a-col :md="6" :sm="12">
                  <a-button type="primary" preIcon="ant-design:search-outlined" @click="init">查询</a-button>
                  <a-button preIcon="ant-design:reload-outlined" @click="searchReset" style="margin-left: 8px">重置</a-button>
                  <a @click="toggleSearchStatus = !toggleSearchStatus" style="margin-left: 8px">
                    {{ toggleSearchStatus ? '收起' : '展开' }}
                    <Icon :icon="toggleSearchStatus ? 'ant-design:up-outlined' : 'ant-design:down-outlined'" />
                  </a>
                </a-col>
              </a-row>
            </a-form>
            <div class="book-list" v-if="listData.length > 0">
              <div class="row-item" :data-index="index" v-for="(ite, index) in listData" :key="ite.id">
                <div style="display: flex; justify-content: space-between; align-items: center">
                  <div>{{ activeKey !== '4' ? ite.contractName : ite.projectName }}</div>
                  <a-tag color="orange" v-if="ite.delayFlag">延期</a-tag>
                </div>
                <div>
                  <div>发包单位：{{ ite.publishName }}</div>
                  <div>申请类型：{{ ite.type }}</div>
                  <div>项目名称：{{ ite.projectName }}</div>
                  <div v-if="activeKey === '4'">施工期限：{{ ite.workDateStart ? ite.workDateStart + '至' + ite.workDateEnd : '' }}</div>
                  <div v-else>申请时间：{{ ite.submitTime }}</div>
                </div>
                <div>
                  <a-button v-if="activeKey === '1' && ite.canHandle" type="primary" style="margin-right: 20px" @click="handleApproval(ite)"
                    >去审批</a-button
                  >
                  <a-button type="primary" @click="handleView(ite)">查看详情</a-button>
                </div>
              </div>
            </div>
          </div>
        </a-spin>
        <a-empty v-if="listData.length === 0" description="暂无数据" style="position: relative; margin: 20px" />
      </a-tab-pane>
    </a-tabs>
    <!-- 分页 -->
    <div class="bottom-page" v-if="listData.length > 0">
      <pagination
        v-model:current="page.pageNo"
        v-model:pageSize="page.pageSize"
        style="margin: 10px 0"
        size="small"
        :page-size-options="pageSizeOptions"
        show-quick-jumper
        show-size-changer
        :total="page.total"
        :show-total="(total) => `共 ${total} 条数据`"
        @change="onChange"
      >
        <template #buildOptionText="props">
          <span>{{ props.value }}条/页</span>
        </template>
      </pagination>
    </div>
  </div>
  <project-drawer @register="approvalDrawer" @success="reset" />
</template>
<script setup name="sm-admissionApproval" lang="ts">
  import { Pagination } from 'ant-design-vue';
  import { ref, reactive } from 'vue';
  import { approvallist, getDepart3ListWithSecurity, waitWorklist, workinglist } from './url/index';
  import ProjectDrawer from '../components/ProjectDrawer.vue';
  import { useDrawer } from '/@/components/Drawer';
  import { useUserStore } from '/@/store/modules/user';
  const userStore: any = useUserStore();
  const userInfo: any = userStore.getUserInfo;
  const page = reactive({
    total: 0, // 共多少条
    pageSize: 8,
    pageNo: 1,
  });
  const queryParams = reactive({
    projectName: '',
    publishCode: undefined,
    contractName: '',
    time: [],
    workDateStart: '',
    workDateEnd: '',
  });
  const toggleSearchStatus = ref(false);
  const [approvalDrawer, { openDrawer }] = useDrawer();
  const pageSizeOptions = ref<string[]>(['8', '16', '32', '40']);
  const activeKey = ref('1');
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
  const listData = ref<any[]>([]);
  const spinning = ref(false);
  const orgOptions: any = ref([]);
  // 发包单位
  const initOrgOptions = () => {
    getDepart3ListWithSecurity().then((res) => {
      orgOptions.value = res.map((item) => {
        return {
          label: item.departName,
          value: item.orgCode,
        };
      });
      searchReset();
    });
  };
  const init = () => {
    spinning.value = true;
    listData.value = [];
    const params: any = Object.assign({}, queryParams);
    if (params.time && params.time.length > 0) {
      params.workDateStart = params.time[0];
      params.workDateEnd = params.time[1];
    } else {
      params.workDateStart = '';
      params.workDateEnd = '';
    }
    const obj = Object.assign({}, { status: activeKey.value, pageNo: page.pageNo, pageSize: page.pageSize, ...params });
    if (activeKey.value === '3') {
      waitWorklist(obj)
        .then((data) => {
          listData.value = data.records;
          page.total = data.total;
        })
        .finally(() => {
          spinning.value = false;
        });
    } else if (activeKey.value === '4') {
      workinglist({ pageNo: page.pageNo, pageSize: page.pageSize, ...params })
        .then((data) => {
          listData.value = data.records;
          page.total = data.total;
        })
        .finally(() => {
          spinning.value = false;
        });
    } else {
      approvallist(obj)
        .then((data) => {
          listData.value = data.records;
          page.total = data.total;
        })
        .finally(() => {
          spinning.value = false;
        });
    }
  };
  initOrgOptions();

  const changeTabs = () => {
    page.pageNo = 1;
    listData.value = [];
    initOrgOptions();
  };
  // 分页
  const onChange = (pageNo: number, pageSize: number) => {
    page.pageNo = pageNo;
    page.pageSize = pageSize;
    init();
  };
  const handleApproval = (data) => {
    openDrawer(true, {
      title: '审批',
      type: 'approval',
      addType: data.type,
      data,
    });
  };
  // 查看详情
  const handleView = (data) => {
    openDrawer(true, {
      title: '查看',
      type: 'view',
      addType: activeKey.value !== '4' ? data.type : '入场申请',
      data,
    });
  };
  const reset = () => {
    activeKey.value = '1';
    searchReset();
  };
  const searchReset = () => {
    Object.assign(queryParams, {
      projectName: '',
      publishCode: undefined,
      contractName: '',
      time: [],
      workDateStart: '',
      workDateEnd: '',
    });
    init();
  };
</script>
<style lang="less" scoped>
  .admissionApproval {
    margin: 10px;
    border-radius: 2px;
    background-color: #ffffff;
  }
  .admissionApproval-content {
    padding: 15px;
    .book-list {
      .row-item {
        width: calc((100% - 3%) / 4);
        min-height: 286px;
        display: inline-table;
        border: 1px solid rgba(170, 170, 170, 0.3);
        box-shadow: 5px 5px 10px rgba(0, 0, 0, 0.3);
        border-radius: 8px;
        padding: 15px;
        margin-bottom: 15px;
        margin-right: calc(3% / 3);
        & > div {
          line-height: 35px;
        }
        & > div:nth-child(1) {
          font-size: 16px;
          font-weight: bold;
        }
        &:nth-child(4n) {
          margin-right: 0;
        }
        & > div:last-child {
          line-height: 32px;
          margin-top: 10px;
          & > div:nth-child(2) {
            color: #02a7f0;
            text-decoration: underline;
            cursor: pointer;
          }
        }
      }
    }
    .bottom-page {
      width: 100%;
      display: flex;
      justify-content: flex-end;
      align-items: center;
      padding-right: 20px;
    }
  }
  /deep/ .ant-form-item {
    margin-bottom: 8px !important;
  }
</style>
