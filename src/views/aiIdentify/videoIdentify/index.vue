<template>
  <div class="videoIdentify videoIdentify-form">
    <a-form
      ref="formRef"
      :model="queryParams"
      :label-col="{
        xs: { span: 12 },
        sm: { span: 5 },
      }"
      :wrapper-col="{
        xs: { span: 24 },
        sm: { span: 19 },
      }"
    >
      <a-row :gutter="24">
        <a-col :md="6" :sm="12">
          <a-form-item label="所属机构">
            <a-select
              v-model:value="queryParams.orgCode"
              :disabled="orgCodeDisabled"
              :options="orgOptions"
              label-field="departName"
              value-field="orgCode"
              placeholder="请选择"
              allow-clear
              @change="changeOrg"
            />
          </a-form-item>
        </a-col>
        <a-col :md="6" :sm="12">
          <a-form-item label="工序">
            <a-select
              v-model:value="queryParams.structureId"
              :options="structureOptions"
              label-field="name"
              value-field="id"
              placeholder="请选择"
              allow-clear
              @change="changeStructure"
            />
          </a-form-item>
        </a-col>
        <a-col :md="6" :sm="12">
          <a-form-item label="子工序">
            <a-select
              v-model:value="queryParams.structureChildId"
              :options="structureChildOptions"
              label-field="name"
              value-field="id"
              allow-clear
              placeholder="请选择"
            />
          </a-form-item>
        </a-col>
        <template v-if="toggleSearchStatus">
          <a-col :md="6" :sm="12">
            <a-form-item label="摄像头名称">
              <a-input placeholder="请输入" v-model:value="queryParams.cameraName" />
            </a-form-item>
          </a-col>
          <a-col :md="6" :sm="12">
            <a-form-item label="IP">
              <a-input placeholder="请输入" v-model:value="queryParams.cameraIp" />
            </a-form-item>
          </a-col>
        </template>
        <a-col :md="6" :sm="12">
          <a-button type="primary" preIcon="ant-design:search-outlined" @click="searchQuery">查询</a-button>
          <a-button preIcon="ant-design:reload-outlined" @click="searchReset" style="margin-left: 8px">重置</a-button>
          <a @click="toggleSearchStatus = !toggleSearchStatus" style="margin-left: 8px">
            {{ toggleSearchStatus ? '收起' : '展开' }}
            <Icon :icon="toggleSearchStatus ? 'ant-design:up-outlined' : 'ant-design:down-outlined'" />
          </a>
        </a-col>
      </a-row>
    </a-form>
  </div>
  <div class="videoIdentify videoIdentify-content">
    <a-row type="flex" style="height: 100%">
      <a-col :md="4">
        <a-card style="min-height: calc(100% - 10px); margin-top: 6px">
          <a-spin :spinning="treeLoading">
            <div class="tree-list" v-if="treeData.length > 0">
              <p>AI识别场景：</p>
              <div v-for="item in treeData" :key="item.name">
                <span
                  :class="item.name === queryParams.cameraType || (item.name === '全部' && queryParams.cameraType === '') ? 'active' : ''"
                  @click="handleListData(item)"
                  >{{ item.name }}{{ item.numVal }}</span
                >
              </div>
            </div>
            <a-empty v-if="treeData.length === 0" :image="Empty.PRESENTED_IMAGE_SIMPLE" />
          </a-spin>
        </a-card>
      </a-col>
      <a-col :md="20">
        <a-card style="height: 100%; padding-left: 25px" :bordered="false">
          <a-spin :spinning="tableLoading">
            <div v-if="listData.length > 0">
              <div class="book-list">
                <div
                  :class="item.alarmId ? 'row-item callThePolice' : 'row-item'"
                  :data-index="index"
                  v-for="(item, index) in listData"
                  :key="item.id"
                >
                  <div @click="handleView(item)">
                    <img v-if="item.coverUrl" style="margin: 0 auto; height: 210px" :src="getFileAccessHttpUrl(item.coverUrl)" />
                    <img v-else style="height: 210px; margin: 0 auto" src="/@/assets/images/video.png"
                  /></div>
                  <div>
                    <div>{{ item.cameraName }} </div>
                    <a-tag v-if="item.alarmId" color="#f21" style="cursor: pointer" @click="viewCallThePolice(item)">查看报警</a-tag>
                  </div>
                  <div>
                    <div>{{ item.orgCode }}</div>
                    <div>
                      <a-tag v-for="tag in item.cameraType.split(',')" color="#2db7f5" :key="tag">{{ tag }}</a-tag>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <a-empty v-else description="暂无数据" style="position: relative; margin: 40px 20px 20px 20px" :image="Empty.PRESENTED_IMAGE_SIMPLE" />
          </a-spin>
        </a-card>
      </a-col>
    </a-row>
    <!-- 分页 -->
    <div class="bottom-page" v-if="listData.length > 0">
      <pagination
        v-model:current="page.pageNo"
        v-model:pageSize="page.pageSize"
        style="margin: 10px 0"
        size="small"
        :pageSizeOptions="[]"
        show-quick-jumper
        :total="page.total"
        :show-total="(total) => `共 ${total} 条数据`"
        @change="onChange"
      />
    </div>
  </div>
  <video-modal @register="registerModal" />
  <alarm-modal @register="registerAlarmModal" />
</template>
<script setup name="video-identify" lang="ts">
  import { Pagination, Empty } from 'ant-design-vue';
  import { ref, onMounted, reactive } from 'vue';
  import { list, getOrganizationNew, getCameraTypeList } from './url/index';
  import { useModal } from '/@/components/Modal';
  import videoModal from './videoModal.vue';
  import alarmModal from '../alarmRecord/alarmModal.vue';
  import { getFileAccessHttpUrl } from '/@/utils/common/compUtils';
  import { getStructureData } from '../../configuration/processProductionLineManage/url/index';
  const [registerModal, { openModal }] = useModal();
  const [registerAlarmModal, alarm] = useModal();
  const queryParams = reactive({
    orgCode: undefined,
    structureId: undefined,
    structureChildId: undefined,
    cameraName: '',
    cameraIp: '',
    cameraType: '',
  });
  const page = reactive({
    total: 0, // 共多少条
    pageSize: 6,
    pageNo: 1,
  });
  const listData = ref<any[]>([]);
  const treeData = ref<any[]>([]);
  const orgOptions: any = ref([]);
  const structureOptions: any = ref([]);
  const structureChildOptions: any = ref([]);
  const orgCodeDisabled = ref(false);
  const treeLoading = ref(false);
  const tableLoading = ref(false);
  const toggleSearchStatus = ref(false);
  const init = () => {
    initList();
    treeLoading.value = true;
    getCameraTypeList(queryParams)
      .then((res) => {
        if (res) {
          treeData.value = res;
        }
      })
      .finally(() => {
        treeLoading.value = false;
      });
  };
  const initList = () => {
    tableLoading.value = true;
    const params: any = Object.assign({}, queryParams);
    list({ ...params, pageNo: page.pageNo, pageSize: page.pageSize })
      .then((data) => {
        listData.value = data.records;
        page.total = data.total;
      })
      .finally(() => {
        tableLoading.value = false;
      });
  };
  onMounted(async () => {
    await getOrganizationNew().then((res) => {
      orgOptions.value = res.map((item) => {
        return {
          label: item.departName,
          value: item.orgCode,
        };
      });
      orgCodeDisabled.value = orgOptions.value.length === 1;
      if (orgOptions.value.length === 1) {
        queryParams.orgCode = orgOptions.value[0].value;
        structureList();
      }
    });
    page.pageNo = 1;
    init();
  });
  const onChange = (pageNumber: number) => {
    page.pageNo = pageNumber;
    initList();
  };
  const searchQuery = () => {
    page.pageNo = 1;
    init();
  };
  const searchReset = () => {
    Object.assign(queryParams, {
      orgCode: undefined,
      structureId: undefined,
      structureChildId: undefined,
      cameraName: '',
      cameraIp: '',
      cameraType: '',
    });
    structureOptions.value = [];
    structureChildOptions.value = [];
    page.pageNo = 1;
    init();
  };
  const changeOrg = (value) => {
    queryParams.structureId = undefined;
    queryParams.structureChildId = undefined;
    structureChildOptions.value = [];
    if (value) structureList();
    else {
      structureOptions.value = [];
    }
  };
  const changeStructure = (value) => {
    queryParams.structureChildId = undefined;
    if (value) structureChildList();
    else structureChildOptions.value = [];
  };
  // 工序
  const structureList = () => {
    getStructureData({ id: '0', orgCode: queryParams.orgCode }).then((res) => {
      structureOptions.value = res.map((item) => {
        return {
          label: item.name,
          value: item.id,
        };
      });
    });
  };
  // 子工序
  const structureChildList = () => {
    getStructureData({ id: queryParams.structureId, orgCode: queryParams.orgCode }).then((res) => {
      structureChildOptions.value = res.map((item) => {
        return {
          label: item.name,
          value: item.id,
        };
      });
    });
  };
  const handleListData = (data) => {
    queryParams.cameraType = data.name === '全部' ? '' : data.name;
    searchQuery();
  };
  const handleView = (data) => {
    openModal(true, {
      data,
    });
  };
  const viewCallThePolice = (data) => {
    alarm.openModal(true, {
      id: data.alarmId,
    });
  };
</script>
<style lang="less" scoped>
  .videoIdentify {
    margin: 10px;
    border-radius: 2px;
    background-color: #ffffff;
  }
  .videoIdentify-form {
    padding: 12px 10px 6px;
    border-radius: 5px;
  }
  .videoIdentify-content {
    padding: 10px 15px 10px 30px;
    border-radius: 5px;
    .tree-list {
      padding: 20px;
      & > p {
        margin-bottom: 10px;
        font-size: 16px;
        font-weight: bold;
      }
      & > div {
        padding-left: 15px;
        & > span {
          line-height: 30px;
          cursor: pointer;
        }
        .active {
          color: rgb(35, 142, 255);
          font-weight: bold;
        }
      }
    }
    .book-list {
      .row-item {
        padding: 10px;
        width: calc((100% - 3%) / 3);
        min-height: 286px;
        display: inline-table;
        border: 1px solid rgba(170, 170, 170, 1);
        border-radius: 8px;
        margin: 6px 0;
        margin-right: calc(3% / 3);
        & > div {
          margin-bottom: 10px;
        }
        & > div:nth-child(2) {
          display: flex;
          justify-content: space-between;
        }
        & > :last-child {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 16px;
          font-weight: bold;
          span {
            font-weight: normal;
          }
        }
      }
      .callThePolice {
        border: 1px solid red;
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
  /deep/ .ant-card-body {
    padding: 0;
  }
  /deep/.ant-card-bordered {
    border: 1px solid rgba(170, 170, 170, 1);
    border-radius: 8px;
  }
</style>
