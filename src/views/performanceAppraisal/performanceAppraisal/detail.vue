<template>
  <BasicModal
    v-bind="$attrs"
    @register="registerModal"
    wrapClassName="performanceAppraisalDetail"
    :title="title"
    defaultFullscreen
    :canFullscreen="false"
    :bodyStyle="{ padding: 0 }"
    :footer="null"
    @cancel="closeModal"
    destroyOnClose
  >
    <div class="performance-appraisal-detail">
      <!-- 内容 -->
      <div class="content">
        <a-tabs style="margin: 0 15px 10px 15px" v-model:activeKey="activeKey" @change="handleChange">
          <a-tab-pane key="1" tab="基本信息">
            <div class="content-nav">
              <a-button @click="handleExport">导出</a-button>
              <a-button type="primary" v-auth="'performanceAppraisal:edit'" v-if="!isEdit" @click="handleEdit">编辑</a-button>
              <a-button type="primary" v-auth="'performanceAppraisal:edit'" v-if="isEdit" :loading="saveLoading" @click="handleSave">保存</a-button>
              <a-button type="primary" v-auth="'performanceAppraisal:edit'" v-if="isEdit" @click="handleCancel">取消</a-button>
            </div>
            <div class="content-main">
              <a-table
                :columns="columns"
                :data-source="tableData"
                :pagination="false"
                :loading="loading"
                :scroll="{ y: 'calc(100vh - 267px)' }"
                bordered
              >
                <template #bodyCell="{ column, text, record, index }">
                  <template v-if="column.dataIndex === 'operation'">
                    <div>
                      <a v-auth="'performanceAppraisal:extra'" @click="handleExtra(record)">加分</a>
                      <a style="margin-left: 10px" v-auth="'performanceAppraisal:sub'" @click="handleSub(record)">扣分</a>
                    </div>
                  </template>
                  <template v-else-if="column.dataIndex === 'key'">
                    <span>{{ index + 1 }}</span>
                  </template>
                  <template v-else-if="['lzjz', 'gbft', 'gbaqzsck', 'ggcxgsal', 'zhjc', 'jcgl', 'gwfgwzy'].includes(column.dataIndex)">
                    <a-input-number
                      v-if="isEdit"
                      style="width: 100%"
                      v-model:value="record[column.dataIndex]"
                      :min="0"
                      :max="maximum[column.dataIndex]"
                      :precision="2"
                      :controls="false"
                    />
                    <span v-else>{{ text }}</span>
                  </template>
                  <template v-else>
                    <span>{{ text }}</span>
                  </template>
                </template>
              </a-table>
            </div>
          </a-tab-pane>
          <a-tab-pane key="2" tab="考核明细">
            <div>
              <a-tabs type="card" v-model:activeKey="detailsActiveKey" @change="handleDetailsChange">
                <a-tab-pane key="1" tab="履职尽责" />
                <a-tab-pane key="2" tab="干部安全知识抽考" />
                <a-tab-pane key="3" tab="综合检查" />
                <a-tab-pane key="4" tab="高危、非高危作业" />
                <a-tab-pane key="5" tab="基础管理" />
                <a-tab-pane key="6" tab="加分/扣分" />
                <template #rightExtra v-if="!['4', '6'].includes(detailsActiveKey)">
                  <div style="font-size: 17px; font-weight: 600; display: flex; align-items: center; margin-right: 10px">
                    <div v-if="!['3', '5'].includes(detailsActiveKey)">平均分：{{ score }}</div>
                    <div v-else>总扣分：{{ score }}</div>
                  </div>
                </template>
              </a-tabs>
            </div>
            <div style="margin-bottom: 10px">
              <div v-if="isMenu" class="standard-menu-container">
                <!-- 左侧单位类型菜单 -->
                <a-card class="standard-menu">
                  <a-menu v-model:selectedKeys="selectedMenu" mode="inline" style="border: none" @select="handleMenuSelect">
                    <a-menu-item v-for="item in orgOptions" :key="item.value">
                      {{ item.label }}
                    </a-menu-item>
                  </a-menu>
                </a-card>
                <div class="standard-content">
                  <a-table
                    :columns="getDetailColumns()"
                    :scroll="{ y: 'calc(100vh - 356px)' }"
                    :data-source="tableData"
                    :pagination="detailsActiveKey !== '5' ? pagination : false"
                    :loading="notLoading"
                    bordered
                    @change="tableChange"
                  >
                    <template #bodyCell="{ column, text, record, index }">
                      <template v-if="column.dataIndex === 'operation'">
                        <div>
                          <a v-if="detailsActiveKey === '1'" @click="handleView(record)">查看</a>
                          <a v-if="detailsActiveKey === '2'" @click="handleDetails(record)">明细</a>
                        </div>
                      </template>
                      <template v-else-if="column.dataIndex === 'key'">
                        <span>{{ index + 1 }}</span>
                      </template>
                      <template v-else-if="column.dataIndex === 'status' && detailsActiveKey === '1'">
                        <a-tag :color="record.status === '2' ? 'green' : 'red'">{{ record.status === '2' ? '完成' : '未完成' }}</a-tag>
                      </template>
                      <template v-else-if="column.dataIndex === 'status' && detailsActiveKey === '2'">
                        <a-tag :color="record.status === '合格' ? 'green' : record.status === '不合格' ? 'red' : ''">{{ text }}</a-tag>
                      </template>
                      <template v-else-if="column.dataIndex === 'score' && detailsActiveKey === '1'">
                        <span :style="{ color: record.status !== '2' ? 'red' : 'green' }">{{ record.score }}</span>
                      </template>
                      <template v-else>
                        <span>{{ text }}</span>
                      </template>
                    </template>
                  </a-table>
                </div>
              </div>
              <div v-else>
                <a-table
                  :columns="getSimpleColumns()"
                  :data-source="tableData"
                  :pagination="false"
                  :loading="notLoading"
                  bordered
                  :scroll="{ y: 'calc(100vh - 268px)' }"
                >
                  <template #bodyCell="{ column, text, index }">
                    <template v-if="column.dataIndex === 'key'">
                      <span>{{ index + 1 }}</span>
                    </template>
                    <template v-else>
                      <span>{{ text }}</span>
                    </template>
                  </template>
                </a-table>
              </div>
            </div>
          </a-tab-pane>
        </a-tabs>
      </div>
      <FractionModal @register="registerModalFraction" @success="handleModalSuccess" />
      <ExamRecord @register="registerExamRecord" />
      <DutyReviewDrawer @register="registerDutyReviewDrawer" />
    </div>
  </BasicModal>
</template>

<script setup name="performanceAppraisal-detail" lang="ts">
  import { ref, onMounted } from 'vue';
  import { useMethods } from '/@/hooks/system/useMethods';
  import { useModalInner, BasicModal, useModal } from '/@/components/Modal';
  import { useDrawer } from '/@/components/Drawer';
  import FractionModal from './fractionModal.vue';
  import ExamRecord from '/@/views/studyTraining/trainingTasks/examRecord.vue';
  import DutyReviewDrawer from '/@/views/safetyResponsibility/dutyReview/DutyReviewDrawer.vue';
  import { examRecord } from '/@/views/education/trainingManage/exam/url/index';
  import { getOrgInfoList, getLzjzList, getGbaqzsckList, getZhjcList, getGwfgwzyList, getJcglList, editOrgInfo } from './api';
  const { handleExportXlsx } = useMethods();

  const loading = ref(false);
  const isEdit = ref(false);
  const activeKey = ref('1');
  const detailsActiveKey = ref('1');
  const selectedMenu = ref(['A04B01C01']);
  const isMenu = ref(true);
  const score = ref(0);
  const notLoading = ref(false);
  const saveLoading = ref(false);

  const title = ref('');
  const detailId = ref('');

  const [registerModal, { redoModalHeight, closeModal }] = useModalInner(async (data) => {
    detailId.value = data.id;
    title.value = data.name;
    activeKey.value = '1';
    detailsActiveKey.value = '1';
    isEdit.value = false;
    resetData();
    init();
    redoModalHeight();
  });

  // 数据缓存
  const dataCache = ref({});
  // 完整的组织信息数据（用于过滤）
  const allOrgData = ref([]);
  // 原始数据备份（用于取消时还原）
  const originalTableData = ref([]);
  const pagination = ref({
    current: 1,
    pageSize: 10,
    pageSizeOptions: ['10', '50', '80', '100'],
    showTotal: (total) => {
      return ' 共' + total + '条';
    },
    showQuickJumper: true,
    showSizeChanger: true,
    total: 0,
  });
  const [registerModalFraction, { openModal: openModalFraction }] = useModal();
  const [registerExamRecord, { openModal: openModalExamRecord }] = useModal();
  const [registerDutyReviewDrawer, { openDrawer: openDutyReviewDrawer }] = useDrawer();

  const orgOptions = ref([
    {
      label: '第一炼铁事业部',
      value: 'A04B01C01',
    },
    {
      label: '第二炼铁事业部',
      value: 'A04B01C02',
    },

    {
      label: '第三炼铁事业部',
      value: 'A04B01C03',
    },
    {
      label: '第一炼钢事业部',
      value: 'A04B01C04',
    },
    {
      label: '第二炼钢事业部',
      value: 'A04B01C05',
    },
    {
      label: '棒材事业部',
      value: 'A04B01C07',
    },
    {
      label: '热卷板事业部',
      value: 'A04B01C06',
    },
    {
      label: '原料管理部',
      value: 'A04B01C18',
    },
    {
      label: '辅料事业部',
      value: 'A04B01C19',
    },
    {
      label: '动力事业部',
      value: 'A04B01C10',
    },
    {
      label: '维修事业部',
      value: 'A04B01C16',
    },
    {
      label: '高品钢科技有限公司',
      value: 'A04B01C08',
    },
  ]);
  // 可输入最大值
  const maximum = ref({
    lzjz: 5,
    gbft: 5,
    gbaqzsck: 10,
    ggcxgsal: 10,
    zhjc: 20,
    jcgl: 30,
    gwfgwzy: 20,
  });
  const tableData = ref([]);
  const columns = ref([
    {
      title: '序号',
      dataIndex: 'key',
      align: 'center',
      width: 65,
      fixed: 'left',
    },
    {
      title: '单位',
      dataIndex: 'orgName',
      align: 'center',
      width: 180,
    },
    {
      title: '履职尽责',
      dataIndex: 'lzjz',
      align: 'center',
      width: 121,
    },
    {
      title: '干部访谈',
      dataIndex: 'gbft',
      align: 'center',
      width: 120,
    },
    {
      title: '干部安全知识抽考',
      dataIndex: 'gbaqzsck',
      align: 'center',
      width: 150,
    },
    {
      title: '改革创新改善案例',
      dataIndex: 'ggcxgsal',
      align: 'center',
      width: 151,
    },
    {
      title: '综合检查',
      dataIndex: 'zhjc',
      align: 'center',
      width: 120,
    },
    {
      title: '基础管理',
      dataIndex: 'jcgl',
      align: 'center',
      width: 120,
    },
    {
      title: '高危、非高危作业',
      dataIndex: 'gwfgwzy',
      align: 'center',
      width: 159,
    },
    {
      title: '扣分',
      dataIndex: 'deductScore',
      align: 'center',
      width: 110,
    },
    {
      title: '加分',
      dataIndex: 'increaseScore',
      align: 'center',
      width: 110,
    },
    {
      title: '总得分',
      dataIndex: 'finalScore',
      align: 'center',
    },
    {
      title: '责任人',
      dataIndex: 'supervisorName',
      align: 'center',
      width: 118,
    },
    {
      title: '排名',
      dataIndex: 'scoreRank',
      align: 'center',
      width: 100,
    },
    {
      title: '操作',
      dataIndex: 'operation',
      align: 'center',
      fixed: 'right',
      width: 120,
    },
  ]);
  // 履职尽责
  const columns1 = ref([
    {
      title: '序号',
      dataIndex: 'key',
      align: 'center',
      width: 70,
      fixed: 'left',
    },
    {
      title: '类型',
      dataIndex: 'type',
      align: 'center',
      width: 150,
    },
    {
      title: '所属单位',
      dataIndex: 'orgName',
      align: 'center',
      width: 200,
    },
    {
      title: '所属车间',
      dataIndex: 'departName',
      align: 'center',
      width: 200,
    },
    {
      title: '岗位',
      dataIndex: 'postName',
      align: 'center',
    },
    {
      title: '姓名',
      dataIndex: 'name',
      align: 'center',
      width: 150,
    },
    {
      title: '填报人',
      dataIndex: 'reporter',
      align: 'center',
      width: 150,
    },
    {
      title: '填报时间',
      dataIndex: 'reportTime',
      align: 'center',
      width: 180,
    },
    {
      title: '得分',
      dataIndex: 'score',
      align: 'center',
      width: 120,
    },
    {
      title: '履职状态',
      dataIndex: 'status',
      align: 'center',
      width: 120,
    },
    {
      title: '操作',
      dataIndex: 'operation',
      align: 'center',
      width: 100,
      fixed: 'right',
    },
  ]);
  // 干部安全知识抽考
  const columns2 = ref([
    {
      title: '序号',
      dataIndex: 'key',
      align: 'center',
      width: 70,
      fixed: 'left',
    },
    {
      title: '学员',
      dataIndex: 'name',
      align: 'center',
      width: 250,
    },
    {
      title: '所属部门',
      dataIndex: 'orgName',
      align: 'center',
    },
    {
      title: '考试状态',
      dataIndex: 'status',
      align: 'center',
      width: 200,
    },
    {
      title: '考试次数',
      dataIndex: 'examTime',
      align: 'center',
      width: 200,
    },
    {
      title: '考试最高分',
      dataIndex: 'maxScore',
      align: 'center',
      width: 200,
    },
    {
      title: '考试记录',
      dataIndex: 'operation',
      align: 'center',
      width: 200,
      fixed: 'right',
    },
  ]);
  // 综合检查
  const columns3 = ref([
    {
      title: '序号',
      dataIndex: 'key',
      align: 'center',
      width: 70,
      fixed: 'left',
    },
    {
      title: '所属单位',
      dataIndex: 'orgName',
      align: 'center',
      width: 300,
    },
    {
      title: '扣分项',
      dataIndex: 'deductItem',
      align: 'left',
    },
    {
      title: '扣分值',
      dataIndex: 'deductScore',
      align: 'center',
      width: 200,
    },
  ]);
  // 基础管理
  const columns4 = ref([
    {
      title: '序号',
      dataIndex: 'key',
      align: 'center',
      width: 70,
      fixed: 'left',
    },
    {
      title: '项目',
      dataIndex: 'itemName',
      align: 'center',
    },
    {
      title: '出现次数',
      dataIndex: 'appearTime',
      align: 'center',
      width: 350,
    },
    {
      title: '扣分',
      dataIndex: 'deductScore',
      align: 'center',
      width: 350,
    },
  ]);
  // 高危、非高危作业
  const columns5 = ref([
    {
      title: '序号',
      dataIndex: 'key',
      align: 'center',
      width: 70,
      fixed: 'left',
    },
    {
      title: '申请单位',
      dataIndex: 'orgName',
      align: 'center',
    },
    {
      title: '全厂平均问题占比',
      dataIndex: 'allProportion',
      align: 'center',
    },
    {
      title: '分厂平均问题占比',
      dataIndex: 'subProportion',
      align: 'center',
    },
    {
      title: '差值',
      dataIndex: 'differenceValue',
      align: 'center',
    },
    {
      title: '扣分',
      dataIndex: 'deductScore',
      align: 'center',
    },
    {
      title: '得分',
      dataIndex: 'score',
      align: 'center',
    },
  ]);
  // 加分/扣分
  const columns6 = ref([
    {
      title: '序号',
      dataIndex: 'key',
      align: 'center',
      width: 70,
      fixed: 'left',
    },
    {
      title: '单位',
      dataIndex: 'orgName',
      align: 'center',
      width: 300,
    },
    {
      title: '加分分值',
      dataIndex: 'increaseScore',
      align: 'center',
      width: 200,
    },
    {
      title: '加分原因',
      dataIndex: 'increaseReason',
      align: 'center',
    },
    {
      title: '扣分分值',
      dataIndex: 'deductScore',
      align: 'center',
      width: 200,
    },
    {
      title: '扣分原因',
      dataIndex: 'deductReason',
      align: 'center',
    },
  ]);
  onMounted(() => {
    init();
  });
  const init = async () => {
    const cacheKey = `orgInfo_${detailId.value}`;
    // 检查缓存
    if (dataCache.value[cacheKey]) {
      allOrgData.value = dataCache.value[cacheKey];
      tableData.value = dataCache.value[cacheKey];
      return;
    }
    loading.value = true;
    try {
      const res = await getOrgInfoList({ id: detailId.value });
      if (res) {
        allOrgData.value = res;
        tableData.value = res;
        // 缓存数据
        dataCache.value[cacheKey] = res;
      }
    } catch (error) {
      console.error('初始化失败:', error);
    } finally {
      loading.value = false;
    }
  };
  const handleChange = (key) => {
    activeKey.value = key;
    isMenu.value = true;
    detailsActiveKey.value = '1';
    isEdit.value = false;
    resetData();

    if (key === '1') {
      init();
    } else if (key === '2') {
      initLzjz();
    }
  };

  const resetData = () => {
    tableData.value = [];
    score.value = 0;
    selectedMenu.value = ['A04B01C01'];
    pagination.value.current = 1;
    pagination.value.pageSize = 10;
  };
  // 清理特定缓存
  const clearSpecificCache = (cacheKey) => {
    const keys = Object.keys(dataCache.value);
    keys.forEach((key) => {
      if (key.startsWith(cacheKey)) {
        delete dataCache.value[key];
      }
    });
  };

  // 清理基本信息相关缓存
  const clearBasicInfoCache = () => {
    clearSpecificCache('orgInfo');
  };
  // 通用数据处理函数
  const initDetailData = async (apiFunc, hasPagination = true, cacheKey) => {
    // 生成缓存键（不包含 selectedMenu，因为我们要缓存所有数据）
    const baseKey = `${cacheKey}_${detailId.value}`;
    const menuKey = `${baseKey}_${selectedMenu.value[0]}_${pagination.value.current}_${pagination.value.pageSize}`;

    // 检查当前菜单的缓存
    if (dataCache.value[menuKey]) {
      const cachedData = dataCache.value[menuKey];
      score.value = cachedData.score;
      tableData.value = cachedData.tableData;
      if (hasPagination) {
        pagination.value.total = cachedData.total;
      }
      return;
    }

    // 检查是否有基础数据缓存
    if (dataCache.value[baseKey]) {
      // 从基础数据中过滤当前菜单的数据
      const baseData = dataCache.value[baseKey];
      const selectedData = baseData.filter((item) => item.orgCode === selectedMenu.value[0])[0];
      if (selectedData) {
        score.value = selectedData.score;
        tableData.value = hasPagination ? selectedData.data.records : selectedData.data;
        if (hasPagination) {
          pagination.value.total = selectedData.data.total;
        }
        // 缓存当前菜单的数据
        dataCache.value[menuKey] = {
          score: selectedData.score,
          tableData: hasPagination ? selectedData.data.records : selectedData.data,
          total: hasPagination ? selectedData.data.total : 0,
        };
      }
      return;
    }

    notLoading.value = true;
    try {
      const params = {
        id: detailId.value,
        ...(hasPagination && {
          pageNo: pagination.value.current,
          pageSize: pagination.value.pageSize,
        }),
      };
      const res = await apiFunc(params);
      if (res) {
        // 缓存基础数据
        dataCache.value[baseKey] = res;

        const selectedData = res.filter((item) => item.orgCode === selectedMenu.value[0])[0];
        if (selectedData) {
          score.value = selectedData.score;
          tableData.value = hasPagination ? selectedData.data.records : selectedData.data;
          if (hasPagination) {
            pagination.value.total = selectedData.data.total;
          }

          // 缓存当前菜单的数据
          dataCache.value[menuKey] = {
            score: selectedData.score,
            tableData: hasPagination ? selectedData.data.records : selectedData.data,
            total: hasPagination ? selectedData.data.total : 0,
          };
        }
      }
    } finally {
      notLoading.value = false;
    }
  };

  // 通用数据处理函数（分页时刷新，不使用缓存）
  const initDetailDataWithRefresh = async (apiFunc, hasPagination = true, _cacheKey) => {
    notLoading.value = true;
    try {
      const params = {
        id: detailId.value,
        ...(hasPagination && {
          pageNo: pagination.value.current,
          pageSize: pagination.value.pageSize,
        }),
      };

      const res = await apiFunc(params);
      if (res) {
        const selectedData = res.filter((item) => item.orgCode === selectedMenu.value[0])[0];
        if (selectedData) {
          score.value = selectedData.score;
          tableData.value = hasPagination ? selectedData.data.records : selectedData.data;
          if (hasPagination) {
            pagination.value.total = selectedData.data.total;
          }
        }
      }
    } finally {
      notLoading.value = false;
    }
  };

  const initSimpleData = async (apiFunc, cacheKey) => {
    // 生成缓存键
    const key = `${cacheKey}_${detailId.value}`;
    // 检查缓存
    if (dataCache.value[key]) {
      tableData.value = dataCache.value[key];
      return;
    }
    notLoading.value = true;
    try {
      const res = await apiFunc({ id: detailId.value });
      if (res) {
        tableData.value = res;
        // 缓存数据
        dataCache.value[key] = res;
      }
    } finally {
      notLoading.value = false;
    }
  };
  const handleDetailsChange = (key) => {
    detailsActiveKey.value = key;
    isMenu.value = !['4', '6'].includes(key);
    resetData();
    const initMap = {
      '1': initLzjz,
      '2': initGbaqzsck,
      '3': initZhjc,
      '4': initGwfgwzy,
      '5': initJcgl,
      '6': initExtra,
    };
    initMap[key]?.();
  };
  // 表格分页
  const tableChange = (page) => {
    pagination.value.current = page.current;
    pagination.value.pageSize = page.pageSize;
    const initMap = {
      '1': initLzjzWithRefresh,
      '2': initGbaqzsckWithRefresh,
      '3': initZhjcWithRefresh,
      '5': initJcglWithRefresh,
    };
    initMap[detailsActiveKey.value]?.();
  };
  // 履职尽责
  const initLzjz = () => {
    initDetailData(getLzjzList, true, 'lzjz');
  };
  // 履职尽责（分页时刷新）
  const initLzjzWithRefresh = () => {
    initDetailDataWithRefresh(getLzjzList, true, 'lzjz');
  };
  // 干部安全知识抽考
  const initGbaqzsck = () => {
    initDetailData(getGbaqzsckList, true, 'gbaqzsck');
  };
  // 干部安全知识抽考（分页时刷新）
  const initGbaqzsckWithRefresh = () => {
    initDetailDataWithRefresh(getGbaqzsckList, true, 'gbaqzsck');
  };
  // 综合检查
  const initZhjc = () => {
    initDetailData(getZhjcList, true, 'zhjc');
  };
  // 综合检查（分页时刷新）
  const initZhjcWithRefresh = () => {
    initDetailDataWithRefresh(getZhjcList, true, 'zhjc');
  };
  // 高危、非高危作业
  const initGwfgwzy = () => {
    initSimpleData(getGwfgwzyList, 'gwfgwzy');
  };
  // 基础管理
  const initJcgl = () => {
    initDetailData(getJcglList, false, 'jcgl');
  };
  // 基础管理（分页时刷新）
  const initJcglWithRefresh = () => {
    initDetailDataWithRefresh(getJcglList, false, 'jcgl');
  };
  // 加分/扣分
  const initExtra = () => {
    // 直接使用已有的组织数据，不需要重新调用接口
    tableData.value = allOrgData.value;
  };
  const handleMenuSelect = () => {
    tableData.value = [];
    score.value = 0;
    pagination.value.current = 1;
    const initMap = {
      '1': initLzjz,
      '2': initGbaqzsck,
      '3': initZhjc,
      '4': initGwfgwzy,
      '5': initJcgl,
      '6': initExtra,
    };

    initMap[detailsActiveKey.value]?.();
  };
  // 编辑逻辑
  const handleEdit = () => {
    // 保存原始数据备份
    originalTableData.value = JSON.parse(JSON.stringify(tableData.value));
    isEdit.value = true;
  };

  // 取消逻辑
  const handleCancel = () => {
    // 还原原始数据
    tableData.value = JSON.parse(JSON.stringify(originalTableData.value));
    isEdit.value = false;
  };

  // 保存逻辑
  const handleSave = async () => {
    saveLoading.value = true;
    try {
      await editOrgInfo(tableData.value);
      isEdit.value = false;
      // 保存成功后只清理基本信息相关缓存，重新加载数据
      clearBasicInfoCache();
      init();
    } catch (error) {
      console.error('保存失败:', error);
      isEdit.value = true;
    } finally {
      saveLoading.value = false;
    }
  };
  // 加分逻辑
  const handleExtra = (data) => {
    openModalFraction(true, {
      title: '加分',
      type: '1',
      data,
    });
  };
  // 扣分逻辑
  const handleSub = (data) => {
    openModalFraction(true, {
      title: '扣分',
      type: '2',
      data,
    });
  };
  // 履职尽责查看
  const handleView = (data) => {
    const record = JSON.parse(JSON.stringify(data));
    record.id = record.busId;
    openDutyReviewDrawer(true, {
      record,
      showFooter: false,
    });
  };
  // 干部安全知识抽考明细
  const handleDetails = async (record) => {
    try {
      const res = await examRecord({
        taskId: record.busId,
        userId: record.userId,
      });
      openModalExamRecord(true, res);
    } catch (error) {
      console.error('获取考试记录失败:', error);
    }
  };
  // 获取详情表格列配置
  const getDetailColumns = () => {
    const columnMap = {
      '1': columns1.value,
      '2': columns2.value,
      '3': columns3.value,
      '5': columns4.value,
    };
    return columnMap[detailsActiveKey.value] || [];
  };

  // 获取简单表格列配置
  const getSimpleColumns = () => {
    const columnMap = {
      '4': columns5.value,
      '6': columns6.value,
    };
    return columnMap[detailsActiveKey.value] || [];
  };

  // 处理模态框成功回调
  const handleModalSuccess = () => {
    // 只清理基本信息相关缓存，重新加载数据
    clearBasicInfoCache();
    init();
  };

  const handleExport = () => {
    // 导出逻辑
    handleExportXlsx(`${title.value}`, '/pa/paMonthly/exportExcel', {
      id: detailId.value,
    });
  };
</script>
<style lang="less">
  .performanceAppraisalDetail {
    .jeecg-modal-content {
      .scroll-container {
        padding: 0 !important;
      }
    }
  }
</style>
<style lang="less" scoped>
  .performance-appraisal-detail {
    background-color: #e5e7eb;
    // height: 100%;
    height: calc(100vh - 87px);
    // padding: 10px;
    .content {
      height: 100%;
      background-color: #fff;
      // border-radius: 10px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      .content-nav {
        // padding: 10px 15px 0 15px;
        margin-bottom: 10px;
        button {
          margin-right: 10px;
        }
      }
      .content-main {
        // flex: 1;
        overflow: hidden;
        // padding: 0 15px;
      }
    }
  }
  .standard-menu-container {
    display: flex;
    height: 100%;
    .standard-menu {
      width: 200px;
      padding: 0;
      border-radius: 8px;
      overflow-y: auto;
      height: 100%;
    }
    .standard-content {
      border-radius: 8px;
      margin-left: 10px;
      width: calc(100% - 210px);
      height: 100%;
    }
  }
  // 加载覆盖层样式
  .loading-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }
  :deep(.ant-table-wrapper) {
    height: 100%;
    .ant-spin-nested-loading {
      height: 100%;
      .ant-spin-container {
        height: 100%;
        display: flex;
        flex-direction: column;
        .ant-table {
          flex: 1;
          overflow: hidden;
          .ant-table-container {
            // height: 100%;
            display: flex;
            flex-direction: column;
            .ant-table-body {
              flex: 1;
              // max-height: none !important;
            }
          }
        }
      }
    }
  }
  :deep(.ant-tabs) {
    height: 100%;
    display: flex;
    flex-direction: column;
    .ant-tabs-content {
      flex: 1;
      height: 100%;
      .ant-tabs-tabpane {
        height: 100%;
        display: flex;
        flex-direction: column;
      }
    }
  }
  :deep(.ant-tabs-card) {
    .ant-tabs-nav {
      margin: 0 0 10px 0;
    }
    .ant-tabs-nav::before {
      border-bottom: none !important;
    }
  }
</style>
