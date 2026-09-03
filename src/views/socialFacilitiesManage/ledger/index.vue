<template>
  <div class="ledger-page" style="display: flex; flex-direction: column">
    <a-spin :spinning="spinning" :tip="tip">
      <!-- 顶部统计卡片 -->
      <div style="display: flex; gap: 10px; margin-bottom: 10px">
        <div>
          <a-card style="width: 280px; text-align: center; border-radius: 8px; padding: 5px">
            <div>检验即将到期</div>
            <div style="font-size: 32px; color: #faad14; font-weight: 600; cursor: pointer" @click="handleCheckStatus(statistics.checkExpire, '2')"
              >{{ statistics.checkExpire }}
            </div>
            <a-tag color="orange" style="border-radius: 8px">7天内到期</a-tag>
          </a-card>
          <a-card style="width: 280px; text-align: center; margin-top: 10px; border-radius: 8px">
            <div>超期未检验</div>
            <div style="font-size: 32px; color: #ff4d4f; font-weight: 600; cursor: pointer" @click="handleCheckStatus(statistics.checkOverdue, '3')"
              >{{ statistics.checkOverdue }}
            </div>
            <a-tag color="red" style="border-radius: 8px">已超期</a-tag>
          </a-card>
        </div>
        <!-- 柱状图统计（ECharts） -->
        <a-card class="echarts-card" style="margin-bottom: 0; width: calc(100% - 290px); border-radius: 8px">
          <template #title>{{ pointTitle }}统计（总计：{{ pointTotal }}个）</template>
          <div ref="echartsRef" style="width: 100%; height: 222px"></div>
        </a-card>
      </div>
      <div style="display: flex">
        <!-- 左侧台账类型菜单 -->
        <a-card style="width: 280px; padding: 0; border-radius: 8px">
          <a-menu v-model:selectedKeys="selectedMenu" mode="inline" style="border: none" @select="handleMenuSelect">
            <a-menu-item v-for="item in ledgerTypeOptions" :key="item.value">
              <div style="display: flex; justify-content: space-between">
                <a-tooltip>
                  <template #title>{{ item.label }}</template>
                  <span style="display: inline-block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap">{{ item.label }}</span>
                </a-tooltip>
                <span>（{{ item.count }}）</span>
              </div>
            </a-menu-item>
          </a-menu>
        </a-card>
        <!-- 右侧主内容 -->
        <div class="ledger-content" style="background-color: #fff; border-radius: 8px; border: 1px solid #e5e7eb">
          <!-- 查询表单 -->
          <a-card :style="toggleSearchStatus ? 'margin-bottom: 16px' : 'margin-bottom: 0'" style="border-radius: 8px">
            <a-form
              :label-col="{
                xs: { span: 24 },
                sm: { span: 7 },
              }"
              :model="queryParams"
              :wrapper-col="{
                xs: { span: 24 },
                sm: { span: 17 },
              }"
            >
              <a-row :gutter="24">
                <a-col v-if="!selectedMenu.includes('8')" :md="6" :sm="12">
                  <a-form-item label="所属单位">
                    <a-select
                      v-model:value="queryParams.org"
                      :disabled="orgOptions.length === 1"
                      :filterOption="(input, option) => option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0"
                      :options="orgOptions"
                      allowClear
                      placeholder="请选择"
                      showSearch
                      @change="changeOrg"
                    />
                  </a-form-item>
                </a-col>
                <a-col v-if="!selectedMenu.includes('8')" :md="6" :sm="12">
                  <a-form-item label="所属车间">
                    <a-select
                      v-model:value="queryParams.depart"
                      :filterOption="(input, option) => option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0"
                      :options="departOptions"
                      allowClear
                      placeholder="请选择"
                      showSearch
                    />
                  </a-form-item>
                </a-col>
                <a-col v-if="selectedMenu.includes('1')" :md="6" :sm="12">
                  <a-form-item label="岗位">
                    <a-input v-model:value="queryParams.post" allowClear placeholder="请输入" />
                  </a-form-item>
                </a-col>
                <a-col v-if="selectedMenu.includes('2')" :md="6" :sm="12">
                  <a-form-item label="工具名称">
                    <a-input v-model:value="queryParams.name" allowClear placeholder="请输入" />
                  </a-form-item>
                </a-col>
                <a-col v-if="selectedMenu.includes('3')" :md="6" :sm="12">
                  <a-form-item label="检测地点">
                    <a-input v-model:value="queryParams.position" allowClear placeholder="请输入" />
                  </a-form-item>
                </a-col>
                <a-col v-if="['4', '10', '13', '14'].includes(selectedMenu[0])" :md="6" :sm="12">
                  <a-form-item label="设备设施">
                    <a-input v-model:value="queryParams.equipmentFacilities" allowClear placeholder="请输入" />
                  </a-form-item>
                </a-col>
                <a-col v-if="selectedMenu.includes('5')" :md="6" :sm="12">
                  <a-form-item label="区域">
                    <a-input v-model:value="queryParams.region" allowClear placeholder="请输入" />
                  </a-form-item>
                </a-col>
                <a-col v-if="selectedMenu.includes('7')" :md="6" :sm="12">
                  <a-form-item label="脱水器编号">
                    <a-input v-model:value="queryParams.code" allowClear placeholder="请输入" />
                  </a-form-item>
                </a-col>
                <a-col v-if="selectedMenu.includes('8')" :md="6" :sm="12">
                  <a-form-item label="建设单位">
                    <a-select
                      v-model:value="queryParams.org"
                      :disabled="orgOptions.length === 1"
                      :filterOption="(input, option) => option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0"
                      :options="orgOptions"
                      allowClear
                      placeholder="请选择"
                      showSearch
                    />
                  </a-form-item>
                </a-col>
                <a-col v-if="selectedMenu.includes('8')" :md="6" :sm="12">
                  <a-form-item label="建设项目">
                    <a-input v-model:value="queryParams.constructProject" allowClear placeholder="请输入" />
                  </a-form-item>
                </a-col>
                <template v-if="toggleSearchStatus && !['4', '6', '8', '10', '13', '14'].includes(selectedMenu[0])">
                  <a-col v-if="selectedMenu.includes('1')" :md="6" :sm="12">
                    <a-form-item label="责任人">
                      <a-input v-model:value="queryParams.principalName" allowClear placeholder="请输入" />
                    </a-form-item>
                  </a-col>
                  <a-col v-if="(selectedMenu.includes('1') && activeTab === '1') || selectedMenu.includes('2')" :md="6" :sm="12">
                    <a-form-item label="检验状态">
                      <a-select
                        v-model:value="queryParams.checkStatus"
                        :options="[
                          {
                            label: '正常',
                            value: '1',
                          },
                          {
                            label: '即将到期',
                            value: '2',
                          },
                          {
                            label: '超期未检验',
                            value: '3',
                          },
                        ]"
                        allowClear
                        placeholder="请选择"
                      />
                    </a-form-item>
                  </a-col>
                  <a-col v-if="['3', '5'].includes(selectedMenu[0])" :md="6" :sm="12">
                    <a-form-item label="设备设施">
                      <a-input v-model:value="queryParams.equipmentFacilities" allowClear placeholder="请输入" />
                    </a-form-item>
                  </a-col>
                  <a-col v-if="['5'].includes(selectedMenu[0])" :md="6" :sm="12">
                    <a-form-item label="作业指导书">
                      <a-input v-model:value="queryParams.workingInstruction" allowClear placeholder="请输入" />
                    </a-form-item>
                  </a-col>
                  <a-col v-if="['5'].includes(selectedMenu[0])" :md="6" :sm="12">
                    <a-form-item label="隔离点位名称">
                      <a-input v-model:value="queryParams.quarantineSiteName" allowClear placeholder="请输入" />
                    </a-form-item>
                  </a-col>
                  <a-col v-if="selectedMenu.includes('7')" :md="6" :sm="12">
                    <a-form-item label="安装位置">
                      <a-input v-model:value="queryParams.position" allowClear placeholder="请输入" />
                    </a-form-item>
                  </a-col>
                </template>
                <a-col :md="6" :sm="12">
                  <a-button preIcon="ant-design:search-outlined" type="primary" @click="init">查询</a-button>
                  <a-button preIcon="ant-design:reload-outlined" style="margin-left: 8px" @click="searchReset">重置 </a-button>
                  <a
                    v-if="!['4', '6', '8', '10', '13', '14'].includes(selectedMenu[0])"
                    style="margin-left: 8px"
                    @click="toggleSearchStatus = !toggleSearchStatus"
                  >
                    {{ toggleSearchStatus ? '收起' : '展开' }}
                    <Icon :icon="toggleSearchStatus ? 'ant-design:up-outlined' : 'ant-design:down-outlined'" />
                  </a>
                </a-col>
              </a-row>
            </a-form>
          </a-card>
          <div :style="!selectedMenu.includes('1') ? 'margin-bottom: 10px' : ''" style="margin-left: 25px">
            <a-button v-auth="'ledger:add'" type="primary" @click="handleAdd">新增</a-button>
            <j-upload-button
              v-if="['1', '2', '3', '4', '5', '6', '7'].includes(selectedMenu[0])"
              v-auth="'ledger:import'"
              preIcon="ant-design:import-outlined"
              style="margin-left: 8px"
              type="primary"
              @click="onImportXls"
            >
              导入
            </j-upload-button>
            <a-button
              v-if="['1', '2', '3', '4', '5', '6', '7'].includes(selectedMenu[0])"
              style="margin-left: 10px"
              type="primary"
              preIcon="ant-design:export-outlined"
              @click="onExportXls"
            >
              导出</a-button
            >
            <a-button
              v-if="['1', '2', '3', '4', '5', '6', '7'].includes(selectedMenu[0])"
              preIcon="ant-design:export-outlined"
              style="margin-left: 8px"
              type="primary"
              @click="onExportTemplateXls"
            >
              导入模版下载
            </a-button>
            <a-button v-if="selectedRowKeys.length > 0" v-auth="'ledger:del'" danger style="margin-left: 8px" @click="handleBatchDelete">
              批量删除
            </a-button>
            <a-button
              v-if="selectedRowKeys.length > 0 && ['1', '2'].includes(selectedMenu[0])"
              v-auth="'ledger:check'"
              style="margin-left: 8px"
              type="primary"
              @click="handleCheck"
            >
              批量检验
            </a-button>
          </div>
          <!-- Tab切换 -->
          <a-tabs v-if="selectedMenu.includes('1')" v-model:activeKey="activeTab" style="padding: 0 25px" @change="handleTabChange">
            <a-tab-pane v-for="item in equipmentTypeOptions" :key="item.value" :tab="item.label + '（' + item.count + '）'" />
          </a-tabs>
          <a-tabs v-if="selectedMenu.includes('6')" v-model:activeKey="activeTab" style="padding: 0 25px" @change="handleTabChange">
            <a-tab-pane v-for="item in coalFireAlarmOptions" :key="item.value" :tab="item.label + '（' + item.count + '）'" />
          </a-tabs>
          <a-table
            :columns="getCurrentColumns()"
            :data-source="tableData"
            :loading="loading"
            :pagination="pagination"
            :rowSelection="rowSelection"
            :scroll="tableData.length > 0 ? { x: 1200 } : false"
            bordered
            rowKey="id"
            style="background: #fff; padding: 0 12px"
            @change="handleTableChange"
          >
            <template #bodyCell="{ column, record, index }">
              <template v-if="column.key === 'index'">
                <div style="text-align: center">{{ index + 1 }}</div>
              </template>
              <template v-if="column.key === 'attachment'">
                <div :title="record.attachment" style="text-align: center; overflow: hidden; text-overflow: ellipsis; white-space: nowrap"
                  >{{ getTrimmedFileName(record.attachment) }}
                </div>
              </template>
              <template v-if="column.key === 'checkStatus'">
                <a-tag :color="record.checkStatus === '1' ? 'green' : record.checkStatus === '2' ? 'orange' : 'red'">
                  {{ record.checkStatus === '1' ? '正常' : record.checkStatus === '2' ? '即将到期' : '超期未检验' }}
                </a-tag>
              </template>
              <template v-if="column.key === 'action'">
                <a v-auth="'ledger:edit'" @click="handleEdit(record)">编辑</a>
                <a-divider type="vertical" />
                <a v-auth="'ledger:del'" style="color: #ff4d4f" @click="handleDelete(record)">删除</a>
                <a-divider
                  v-if="(selectedMenu.includes('1') && activeTab === '1') || selectedMenu.includes('2') || selectedMenu.includes('8')"
                  type="vertical"
                />
                <a
                  v-if="(selectedMenu.includes('1') && activeTab === '1') || selectedMenu.includes('2') || selectedMenu.includes('8')"
                  @click="handleView(record)"
                  >查看</a
                >
                <a-divider v-if="(selectedMenu.includes('1') && activeTab === '1') || selectedMenu.includes('2')" type="vertical" />
                <a
                  v-if="(selectedMenu.includes('1') && activeTab === '1') || selectedMenu.includes('2')"
                  v-auth="'ledger:check'"
                  @click="handleCheck(record, '1')"
                  >检验</a
                >
                <a-divider v-if="['8', '10', '13', '14'].includes(selectedMenu[0])" type="vertical" />
                <a v-if="['8', '10', '13', '14'].includes(selectedMenu[0])" v-auth="'ledger:download'" @click="handleDownload(record)">下载</a>
              </template>
            </template>
          </a-table>
        </div>
      </div>
    </a-spin>
    <!-- 消防设备 -->
    <FirefightingModal @register="registerModal" @success="init" />
    <!-- 绝缘工具 -->
    <InsulationToolModal @register="registerInsulationModal" @success="init" />
    <!-- 灭火器|绝缘工具详情 -->
    <ExtinguisherDetailModal @register="registerExtinguisherDetailModal" />
    <!-- 灭火器|绝缘工具检验 -->
    <TestModal
      @register="registerTestModal"
      @success="
        () => {
          init();
          selectedRowKeys = [];
        }
      "
    />
    <!-- 防雷检测点位台账 -->
    <LightningProtectionModal @register="registerLightningProtectionModal" @success="init" />
    <!-- 煤气设施隔断装置台账 -->
    <GasCuttingModal @register="registerGasCuttingModal" @success="init" />
    <!-- 能源隔离点台账 -->
    <EnergyIsolationModal @register="registerEnergyIsolationModal" @success="init" />
    <!-- 煤防报警器材台账 -->
    <CoalFireAlarmModal @register="registerCoalFireAlarmModal" @success="init" />
    <!-- 煤气脱水器台账 -->
    <GasDehydratorModal @register="registerGasDehydratorModal" @success="init" />
    <!-- 三同时台账 -->
    <ThreeSimultaneityModal @register="registerThreeSimultaneityModal" @success="init" />
    <!-- 三同时台账详情 -->
    <ThreeSimultaneityViewModal @register="registerThreeSimultaneityViewModal" />
    <!-- 材料台账 -->
    <MaterialModal @register="registerMaterialModal" @success="init" />
    <!-- 检测状态 -->
    <CheckStatusModal @register="registerCheckStatusModal" />
  </div>
</template>

<script lang="ts" name="socialFacilitiesManage-ledger" setup>
  import { ref, reactive, onMounted, computed } from 'vue';
  import * as echarts from 'echarts';
  import { getDepart3ListWithSecurity, selectDeptNew, downloadFileAll } from '/@/api/common/api';
  import { list, del, batchDel, statisticsOvertime, statisticsBusinessDepart, statisticsCount, statisticsSubCount } from './api';
  import { useModal } from '/@/components/Modal';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useMethods } from '/@/hooks/system/useMethods';
  import FirefightingModal from './firefightingModal.vue';
  import InsulationToolModal from './insulationToolModal.vue';
  import ExtinguisherDetailModal from './ExtinguisherDetailModal.vue';
  import LightningProtectionModal from './lightningProtectionModal.vue';
  import EnergyIsolationModal from './energyIsolationModal.vue';
  import TestModal from './testModal.vue';
  import GasCuttingModal from './gasCuttingModal.vue';
  import CoalFireAlarmModal from './coalFireAlarmModal.vue';
  import GasDehydratorModal from './gasDehydratorModal.vue';
  import ThreeSimultaneityModal from './ThreeSimultaneityModal.vue';
  import ThreeSimultaneityViewModal from './threeSimultaneityViewModal.vue';
  import MaterialModal from './materialModal.vue';
  import CheckStatusModal from './checkStatusModal.vue';
  import {
    columns,
    columns1,
    columns2,
    columns3,
    columns4,
    columns5,
    columns6,
    columns7,
    columns8,
    columns10,
    columns11,
    columns12,
    columns13,
    columns15,
    columns18,
    columns19,
  } from './columns';

  const { handleImportXls, handleExportXlsx } = useMethods();
  const { createConfirm } = useMessage();
  const toggleSearchStatus = ref(false);
  const loading = ref(false);
  const spinning = ref(false);
  const tip = ref('下载中...');
  // 查询条件
  const queryParams = reactive({
    org: undefined,
    depart: undefined,
    post: '',
    name: '',
    equipmentFacilities: '',
    region: '',
    code: '',
    constructProject: '',
    principalName: '',
    workingInstruction: '',
    quarantineSiteName: '',
    position: '',
    checkStatus: undefined,
    pageNo: 1,
    pageSize: 10,
  });
  const tableData = ref([]);
  const total = ref(0);
  const pagination = computed(() => ({
    total: total.value,
    current: queryParams.pageNo,
    pageSize: queryParams.pageSize,
  }));
  const orgOptions: any = ref([]);
  const departOptions: any = ref([]);
  const ledgerTypeOptions: any = ref([]);
  const equipmentTypeOptions: any = ref([
    {
      label: '灭火器',
      value: '1',
      count: 0,
    },
    {
      label: '消防栓',
      value: '2',
      count: 0,
    },
    {
      label: '消防泵',
      value: '3',
      count: 0,
    },
  ]);
  const coalFireAlarmOptions: any = ref([
    {
      label: '空气呼吸器',
      value: '1',
      count: 0,
    },
    {
      label: '长管呼吸器',
      value: '2',
      count: 0,
    },
    {
      label: '苏生器台账',
      value: '3',
      count: 0,
    },
    {
      label: '担架台账',
      value: '4',
      count: 0,
    },
    {
      label: '空气充填泵',
      value: '5',
      count: 0,
    },
    {
      label: '防爆手电',
      value: '6',
      count: 0,
    },
    {
      label: '模拟人',
      value: '7',
      count: 0,
    },
  ]);
  const selectedMenu = ref(['1']);
  const activeTab = ref('1');
  const selectedRowKeys = ref<string[]>([]);
  const statistics = ref({
    checkExpire: 0,
    checkOverdue: 0,
  });
  const pointTotal = ref(0);
  const pointTitle = ref('消防设备台账（灭火器）');
  const rowSelection = computed(() => {
    return {
      onChange: (keys) => {
        selectedRowKeys.value = keys;
      },
      selectedRowKeys: selectedRowKeys.value,
    };
  });
  const [registerModal, { openModal }] = useModal();
  const [registerInsulationModal, { openModal: openInsulationModal }] = useModal();
  const [registerExtinguisherDetailModal, { openModal: openExtinguisherDetailModal }] = useModal();
  const [registerTestModal, { openModal: openTestModal }] = useModal();
  const [registerLightningProtectionModal, { openModal: openLightningProtectionModal }] = useModal();
  const [registerGasCuttingModal, { openModal: openGasCuttingModal }] = useModal();
  const [registerEnergyIsolationModal, { openModal: openEnergyIsolationModal }] = useModal();
  const [registerCoalFireAlarmModal, { openModal: openCoalFireAlarmModal }] = useModal();
  const [registerGasDehydratorModal, { openModal: openGasDehydratorModal }] = useModal();
  const [registerThreeSimultaneityModal, { openModal: openThreeSimultaneityModal }] = useModal();
  const [registerThreeSimultaneityViewModal, { openModal: openThreeSimultaneityViewModal }] = useModal();
  const [registerMaterialModal, { openModal: openMaterialModal }] = useModal();
  const [registerCheckStatusModal, { openModal: openCheckStatusModal }] = useModal();
  const echartsRef = ref<HTMLDivElement | null>(null);
  const initMenu = async () => {
    await statisticsCount().then((res) => {
      ledgerTypeOptions.value = res;
    });
  };
  onMounted(async () => {
    await initMenu();
    pointTotal.value = 0;
    await getOrgOptions();
    await init();
  });
  const getOrgOptions = async () => {
    const res = await getDepart3ListWithSecurity();
    orgOptions.value = res.map((item) => {
      return {
        label: item.departName,
        value: item.orgCode,
      };
    });
    if (orgOptions.value.length === 1) {
      queryParams.org = orgOptions.value[0].value;
      getDepartList(orgOptions.value[0].value);
    }
  };
  const getDepartList = (orgCode) => {
    selectDeptNew({ orgCode }).then(async (res) => {
      departOptions.value = res.map((item: any) => {
        return {
          label: item.departName,
          value: item.orgCode,
        };
      });
    });
  };
  const changeOrg = (value) => {
    queryParams.depart = undefined;
    departOptions.value = [];
    if (value) {
      getDepartList(value);
    }
  };
  const init = async () => {
    if (selectedMenu.value[0] === '2' || (selectedMenu.value[0] === '1' && activeTab.value === '1')) {
      statisticsOvertimeFn();
    }
    loading.value = true;
    tableData.value = [];
    const params: any = {
      ...queryParams,
      ledgerType: selectedMenu.value[0],
    };
    if (selectedMenu.value.includes('1')) {
      params.fireEquipmentType = activeTab.value;
    } else if (selectedMenu.value.includes('6')) {
      params.coalAlarmEquipmentType = activeTab.value;
    }
    statisticsBusinessDepartFn();
    if (selectedMenu.value.includes('1') || selectedMenu.value.includes('6')) {
      await statisticsSubCount(params).then((res) => {
        if (res) {
          if (selectedMenu.value.includes('1')) {
            equipmentTypeOptions.value = equipmentTypeOptions.value.map((item, index) => {
              item.count = res[`fireEquipmentType${index + 1}`];
              return item;
            });
          } else if (selectedMenu.value.includes('6')) {
            coalFireAlarmOptions.value = coalFireAlarmOptions.value.map((item, index) => {
              item.count = res[`coalAlarmEquipmentType${index + 1}`];
              return item;
            });
          }
        }
      });
    }
    try {
      const res = await list(params);
      tableData.value = res.records;
      total.value = res.total;
    } catch (error) {
      tableData.value = [];
      total.value = 0;
    } finally {
      loading.value = false;
    }
  };
  // 统计检验即将到期、超期未检验
  const statisticsOvertimeFn = () => {
    statisticsOvertime().then((res) => {
      statistics.value = {
        checkExpire: res['检验即将到期'],
        checkOverdue: res['超期未检验'],
      };
    });
  };
  // 各事业部能源隔离点位台账统计
  const statisticsBusinessDepartFn = () => {
    const ledgerTypeText = ledgerTypeOptions.value.filter((item) => item.value === selectedMenu.value[0])[0].label;
    pointTitle.value = ledgerTypeText;
    const addText = (arr) => {
      const text = arr.filter((item) => item.value === activeTab.value)[0].label;
      pointTitle.value += `（${text}）`;
    };
    if (selectedMenu.value.includes('1')) {
      addText(equipmentTypeOptions.value);
    } else if (selectedMenu.value.includes('6')) {
      addText(coalFireAlarmOptions.value);
    }
    const params = {
      ledgerType: selectedMenu.value[0],
      fireEquipmentType: selectedMenu.value.includes('1') ? activeTab.value : undefined,
      coalAlarmEquipmentType: selectedMenu.value.includes('6') ? activeTab.value : undefined,
    };
    statisticsBusinessDepart(params).then((res) => {
      pointTotal.value = res.datas.reduce((a, b) => a + b, 0);
      if (echartsRef.value) {
        const chart = echarts.init(echartsRef.value);
        const echartsOption = {
          tooltip: {
            trigger: 'axis',
            formatter: function (params) {
              const colors = [
                '#1890ff',
                '#13c2c2',
                '#faad14',
                '#fa541c',
                '#52c41a',
                '#eb2f96',
                '#722ed1',
                '#f5222d',
                '#a0d911',
                '#fa8c16',
                '#b37feb',
                '#36cfc9',
                '#ffec3d',
              ];
              const param = params[0];
              const color = colors[param.dataIndex % colors.length];
              return `<span style="display:inline-block;margin-right:5px;border-radius:50%;width:10px;height:10px;background-color:${color}"></span>${param.name}: ${param.value}`;
            },
          },
          grid: {
            top: 18,
            left: 0,
            right: 0,
            bottom: 0,
            containLabel: true,
          },
          xAxis: {
            type: 'category',
            data: res.names,
            axisLabel: {
              rotate: 20,
              fontSize: 12,
            },
          },
          yAxis: { type: 'value' },
          series: [
            {
              type: 'bar',
              data: res.datas,
              itemStyle: {
                color: function (params: any) {
                  const colors = [
                    '#1890ff',
                    '#13c2c2',
                    '#faad14',
                    '#fa541c',
                    '#52c41a',
                    '#eb2f96',
                    '#722ed1',
                    '#f5222d',
                    '#a0d911',
                    '#fa8c16',
                    '#b37feb',
                    '#36cfc9',
                    '#ffec3d',
                  ];
                  return colors[params.dataIndex % colors.length];
                },
              },
              label: { show: true, position: 'top' },
            },
          ],
        };
        chart.setOption(echartsOption);
        window.addEventListener('resize', () => chart.resize());
      }
    });
  };
  const handleTableChange = ({ current, pageSize }) => {
    queryParams.pageNo = current;
    queryParams.pageSize = pageSize;
    init();
  };
  const searchReset = () => {
    if (orgOptions.value.length === 1) {
      queryParams.org = orgOptions.value[0].value;
    } else {
      queryParams.org = undefined;
    }
    queryParams.depart = undefined;
    queryParams.post = '';
    queryParams.name = '';
    queryParams.equipmentFacilities = '';
    queryParams.region = '';
    queryParams.code = '';
    queryParams.constructProject = '';
    queryParams.principalName = '';
    queryParams.workingInstruction = '';
    queryParams.quarantineSiteName = '';
    queryParams.position = '';
    queryParams.checkStatus = undefined;
    queryParams.pageNo = 1;
    queryParams.pageSize = 10;
    init();
  };

  // 查询、重置、新增、导入、操作事件
  function handleAdd() {
    // 根据当前选中的菜单项决定打开哪个模态框
    if (selectedMenu.value.includes('1')) {
      // 消防设备
      openModal(true, { type: 'add', fireEquipmentType: activeTab.value });
    } else if (selectedMenu.value.includes('2')) {
      // 绝缘工具
      openInsulationModal(true, { type: 'add' });
    } else if (selectedMenu.value.includes('3')) {
      // 防雷检测点位台账
      openLightningProtectionModal(true, { type: 'add' });
    } else if (selectedMenu.value.includes('4')) {
      // 煤气设施切割装置台账
      openGasCuttingModal(true, { type: 'add' });
    } else if (selectedMenu.value.includes('5')) {
      // 能源隔离点台账
      openEnergyIsolationModal(true, { type: 'add' });
    } else if (selectedMenu.value.includes('6')) {
      // 煤防报警器材台账
      openCoalFireAlarmModal(true, { type: 'add', coalAlarmEquipmentType: activeTab.value });
    } else if (selectedMenu.value.includes('7')) {
      // 煤气脱水器台账
      openGasDehydratorModal(true, { type: 'add' });
    } else if (selectedMenu.value.includes('8')) {
      // 三同时台账
      openThreeSimultaneityModal(true, { type: 'add' });
    } else {
      // 其他类型暂时使用消防设备模态框
      openMaterialModal(true, { type: 'add', ledgerType: selectedMenu.value[0] });
    }
  }

  function handleEdit(record: any) {
    // 根据当前选中的菜单项决定打开哪个模态框
    if (selectedMenu.value.includes('1')) {
      // 消防设备
      openModal(true, { record, type: 'edit', fireEquipmentType: activeTab.value });
    } else if (selectedMenu.value.includes('2')) {
      // 绝缘工具
      openInsulationModal(true, { record, type: 'edit' });
    } else if (selectedMenu.value.includes('3')) {
      // 防雷检测点位台账
      openLightningProtectionModal(true, { record, type: 'edit' });
    } else if (selectedMenu.value.includes('4')) {
      // 煤气设施切割装置台账
      openGasCuttingModal(true, { record, type: 'edit' });
    } else if (selectedMenu.value.includes('5')) {
      // 能源隔离点台账
      openEnergyIsolationModal(true, { record, type: 'edit' });
    } else if (selectedMenu.value.includes('6')) {
      // 煤防报警器材台账
      openCoalFireAlarmModal(true, { record, type: 'edit', coalAlarmEquipmentType: activeTab.value });
    } else if (selectedMenu.value.includes('7')) {
      // 煤气脱水器台账
      openGasDehydratorModal(true, { record, type: 'edit' });
    } else if (selectedMenu.value.includes('8')) {
      // 三同时台账
      openThreeSimultaneityModal(true, { record, type: 'edit' });
    } else {
      // 其他类型暂时使用消防设备模态框
      openMaterialModal(true, { record, type: 'edit', ledgerType: selectedMenu.value[0] });
    }
  }

  function handleDelete(record: any) {
    createConfirm({
      iconType: 'warning',
      title: '删除',
      content: '是否确认删除？',
      onOk: () => {
        return new Promise<void>((resolve, reject) => {
          del({ id: record.id })
            .then((res) => {
              if (res) {
                init();
                resolve();
              } else {
                reject(new Error('删除失败！'));
              }
            })
            .catch(() => {
              resolve();
            });
        });
      },
    });
  }

  function handleBatchDelete() {
    if (selectedRowKeys.value.length === 0) return;
    createConfirm({
      iconType: 'warning',
      title: '批量删除',
      content: `确定要删除选中的${selectedRowKeys.value.length}条数据吗？`,
      onOk: async () => {
        return new Promise<void>((resolve, reject) => {
          batchDel({ ids: selectedRowKeys.value.join(',') })
            .then((res) => {
              if (res) {
                init();
                selectedRowKeys.value = [];
                resolve();
              } else {
                reject(new Error('删除失败！'));
              }
            })
            .catch(() => {
              resolve();
            });
        });
      },
    });
  }

  function handleView(record: any) {
    if ((selectedMenu.value.includes('1') && activeTab.value === '1') || selectedMenu.value.includes('2')) {
      openExtinguisherDetailModal(true, {
        title: selectedMenu.value.includes('1') ? '灭火器详情' : '绝缘工具详情',
        type: selectedMenu.value[0],
        record,
      });
    } else if (selectedMenu.value.includes('8')) {
      openThreeSimultaneityViewModal(true, {
        record,
      });
    }
  }

  function handleCheck(record, type = '2') {
    if ((selectedMenu.value.includes('1') && activeTab.value === '1') || selectedMenu.value.includes('2')) {
      let id = '';
      let name = '';
      let name1 = '';
      if (type === '1') {
        id = record.id;
        name = '灭火器检验';
        name1 = '绝缘工具检验';
      } else {
        id = selectedRowKeys.value.join(',');
        name = '灭火器批量检验';
        name1 = '绝缘工具批量检验';
      }
      openTestModal(true, {
        title: selectedMenu.value.includes('1') ? name : name1,
        type: selectedMenu.value[0],
        ledgerType: selectedMenu.value[0],
        ledgerId: id,
        record,
      });
    }
  }

  async function handleDownload(record: any) {
    let fileName = '';
    switch (selectedMenu.value[0]) {
      case '8':
        fileName = '三同时附件.zip';
        break;
      case '10':
        fileName = '设备设施检维修计划.zip';
        break;
      case '13':
        fileName = '设备设施检验合格资料.zip';
        break;
      case '14':
        fileName = '设备设施拆除报废记录.zip';
        break;
    }
    spinning.value = true;
    tip.value = '下载中...';
    try {
      await downloadFileAll(selectedMenu.value[0] === '10' ? '/dev/devLedger/downloadPlanFile' : '/dev/devLedger/downloadFile', fileName, {
        id: record.id,
      });
    } finally {
      spinning.value = false;
    }
  }

  function handleMenuSelect() {
    toggleSearchStatus.value = false;
    activeTab.value = '1';
    queryParams.pageNo = 1;
    queryParams.pageSize = 10;
    selectedRowKeys.value = [];
    init();
  }

  function handleTabChange() {
    queryParams.pageNo = 1;
    queryParams.pageSize = 10;
    init();
  }

  function getCurrentColumns() {
    if (selectedMenu.value.includes('1')) {
      if (activeTab.value === '1') return columns;
      if (activeTab.value === '2') return columns1;
      if (activeTab.value === '3') return columns2;
    } else if (selectedMenu.value.includes('2')) {
      return columns3;
    } else if (selectedMenu.value.includes('3')) {
      return columns4;
    } else if (selectedMenu.value.includes('4')) {
      return columns5;
    } else if (selectedMenu.value.includes('5')) {
      return columns6;
    } else if (selectedMenu.value.includes('6')) {
      if (activeTab.value === '1' || activeTab.value === '3') return columns7;
      if (activeTab.value === '2') return columns8;
      if (activeTab.value === '4') return columns10;
      if (['5', '6', '7'].includes(activeTab.value)) return columns11;
    } else if (selectedMenu.value.includes('7')) {
      return columns12;
    } else if (selectedMenu.value.includes('8')) {
      return columns13;
    } else if (selectedMenu.value.includes('10')) {
      return columns15;
    } else if (selectedMenu.value.includes('13')) {
      return columns18;
    } else if (selectedMenu.value.includes('14')) {
      return columns19;
    }
    return [];
  }

  const handleCheckStatus = (value, status) => {
    if (Number(value) > 0) {
      openCheckStatusModal(true, {
        title: status === '2' ? '检验即将到期' : '超期未检验',
        checkStatus: status,
      });
    }
  };
  // 使用 Map 缓存已处理的文件名，避免重复计算
  const fileNameCache = new Map<string, string>();
  const getTrimmedFileName = (fileName: string) => {
    if (!fileName) return '';
    // 检查缓存
    if (fileNameCache.has(fileName)) {
      return fileNameCache.get(fileName)!;
    }
    // 处理文件名
    const list = fileName.split(',');
    let result = '';
    for (const item of list) {
      // 删除第一个 / 及其前面的内容
      const slashIndex = item.indexOf('/');
      let processedItem = item;
      if (slashIndex !== -1) {
        processedItem = item.substring(slashIndex + 1);
      }
      const index = processedItem.lastIndexOf('_');
      const pointIndex = processedItem.lastIndexOf('.');
      if (index !== -1) {
        result += processedItem.substring(0, index) + '.' + processedItem.substring(pointIndex + 1) + ',';
      }
    }
    const trimmedName = result.slice(0, -1);
    // 缓存结果
    fileNameCache.set(fileName, trimmedName);
    return trimmedName;
  };
  const paramsOrName = (isName = false) => {
    let obj = {};
    if (selectedMenu.value[0] === '1') {
      obj = {
        ledgerType: selectedMenu.value[0],
        fireEquipmentType: activeTab.value,
      };
    } else if (selectedMenu.value[0] === '6') {
      obj = {
        ledgerType: selectedMenu.value[0],
        coalAlarmEquipmentType: activeTab.value,
      };
    } else {
      obj = {
        ledgerType: selectedMenu.value[0],
      };
    }
    let name = '';
    if (isName) {
      name = ledgerTypeOptions.value.filter((item) => item.value === selectedMenu.value[0])?.[0]?.label;
      if (selectedMenu.value[0] === '1') {
        name += '-' + equipmentTypeOptions.value.filter((item) => item.value === activeTab.value)?.[0]?.label;
      }
      if (selectedMenu.value[0] === '6') {
        name += '-' + coalFireAlarmOptions.value.filter((item) => item.value === activeTab.value)?.[0]?.label;
      }
    }
    return {
      obj,
      name,
    };
  };
  const onImportXls = (file) => {
    const { obj } = paramsOrName();
    spinning.value = true;
    tip.value = '导入中...';
    handleImportXls(
      file,
      '/dev/devLedger/importExcel',
      (res) => {
        spinning.value = false;
        if (res.success) init();
      },
      obj
    );
  };
  // 导出
  const onExportXls = () => {
    const { obj, name } = paramsOrName(true);
    const selections = selectedRowKeys.value.join(',');
    handleExportXlsx(`${name}`, '/dev/devLedger/exportXls', { ...queryParams, ...obj, selections }, selectedRowKeys);
  };
  //导入模版下载
  const onExportTemplateXls = () => {
    const { obj, name } = paramsOrName(true);
    handleExportXlsx(`${name}模版`, '/dev/devLedger/downloadTemplate', obj);
  };
</script>

<style lang="less" scoped>
  .ledger-page {
    padding: 10px;
    background: #f5f7fa;
  }

  :deep(.ant-menu-item) {
    padding: 0 10px !important;
  }

  .ledger-content {
    margin-left: 10px;
    width: calc(100% - 290px);

    :deep(.ant-card-body) {
      padding-bottom: 0 !important;
    }

    :deep(.ant-card-bordered) {
      border: none !important;
    }

    // 修复表格滚动条问题
    :deep(.ant-table-wrapper) {
      overflow: hidden;
      border-radius: 0 0 8px 8px;
      //max-height: calc(100vh - 400px);
    }

    //:deep(.ant-table) {
    //  overflow: auto;
    //}

    //:deep(.ant-table-body) {
    //  overflow-x: auto;
    //  overflow-y: auto;
    //  max-height: calc(100vh - 450px);
    //}
    // 空数据时隐藏多余的滚动条
    :deep(.ant-table-empty) {
      .ant-table-body {
        overflow: hidden;
        min-height: 200px;
      }
    }

    // 确保表格容器不会产生多余的滚动条
    :deep(.ant-table-container) {
      overflow: hidden;
    }
  }

  .echarts-card {
    :deep(.ant-card-body) {
      padding: 15px 24px !important;
    }
  }
</style>
