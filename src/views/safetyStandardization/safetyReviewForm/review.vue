<template>
  <div>
    <basic-modal
      :bodyStyle="{ padding: '10px 0 0 0' }"
      :maskClosable="false"
      :title="title"
      destroyOnClose
      v-bind="$attrs"
      width="100%"
      wrapClassName="review-modal"
      @cancel="close"
      @register="registerModal"
    >
      <div>
        <div v-if="!isView" class="current-operator">
          <div>
            <a-icon type="user" />
            <span class="operator-label">当前操作人：</span>
          </div>
          <span class="operator-name">{{ currentOperator }}</span>
        </div>
        <div v-if="isView">
          <h4
            >整改报告：<span style="color: #1890ff; font-size: 15px; cursor: pointer" @click="handleDownloadReport('repairReportFile')">{{
              repairReportFile
            }}</span></h4
          >
          <h4
            >分析报告：<span style="color: #1890ff; font-size: 15px; cursor: pointer" @click="handleDownloadReport('analysisReportFile')">{{
              analysisReportFile
            }}</span>
          </h4>
        </div>
        <a-tabs v-model:activeKey="activeKey" :style="{ '--tabs-height': tabsHeight }" @change="changeTabs">
          <a-tab-pane v-for="(item, index) in itemList" :key="index">
            <template #tab>
              <span :class="getTabClass(item)">
                <span class="tab-item-number">{{ index + 1 }}</span>
                <span class="tab-item-title">{{ item.module }}</span>
              </span>
            </template>
            <div v-if="item.module !== '评审总结'" class="review-content">
              <div class="review-content-title">
                {{ item.module }}评审
                <a-button v-if="selectedRows.length > 0 && !isView" style="margin-left: 20px" type="primary" @click="handleBatchUser">
                  批量选择负责人
                </a-button>
                <span v-if="selectedRows.length > 0" style="margin-left: 20px; font-weight: normal; color: #000; font-size: 14px"
                  >已选中<span style="color: #1890ff; font-size: 15px">{{ selectedRows.length }}</span
                  >条记录</span
                >
              </div>
              <!-- 虚拟滚动表格 -->
              <div class="virtual-table-container">
                <!-- 表格头部 -->
                <div class="virtual-table-header">
                  <div class="header-cell" style="width: 3%; text-align: center">
                    <a-checkbox
                      :checked="isAllSelected"
                      :indeterminate="selectedRows.length !== 0 && selectedRows.length < reviewData.length"
                      @change="handleSelectAll"
                    />
                  </div>
                  <div class="header-cell" style="width: 4%; text-align: center"> 序号</div>
                  <div class="header-cell" style="width: 9%; text-align: center"> 审核内容</div>
                  <div class="header-cell" style="width: 9%; text-align: center"> 涉及项目</div>
                  <div class="header-cell" style="width: 17%"> 审核依据</div>
                  <div class="header-cell" style="width: 17%"> 审核标准</div>
                  <div class="header-cell" style="width: 9%; text-align: center"> Y/N/- </div>
                  <div class="header-cell" style="width: 12%; text-align: center"> 审核描述和问题图片 </div>
                  <div class="header-cell" style="width: 4%; text-align: center">分值</div>
                  <div class="header-cell" style="width: 4%; text-align: center">得分</div>
                  <div class="header-cell" style="width: 12%; text-align: center"> 负责人 </div>
                </div>
                <a-spin :spinning="listLoading" tip="加载中...">
                  <VScroll :bench="5" :height="isView ? 520 : 497" :item-height="140" :items="reviewData" class="virtual-scroll-table">
                    <template #default="{ item: ite, index: inx }">
                      <div :key="inx" class="virtual-table-row">
                        <div class="table-cell" style="width: calc(3% + 1px); justify-content: center; align-items: center">
                          <a-checkbox :checked="selectedRows.includes(inx)" @change="(e) => handleRowSelect(inx, e.target.checked)" />
                        </div>
                        <div class="table-cell" style="width: calc(4% - 1px); justify-content: center; align-items: center"> {{ inx + 1 }} </div>
                        <div class="table-cell" style="width: calc(9% + 1px); justify-content: center; align-items: center">
                          {{ ite.content }}
                        </div>
                        <div class="table-cell" style="width: calc(9% + 1px); justify-content: center; align-items: center">{{ ite.project }} </div>
                        <div class="table-cell" style="width: calc(17% + 1.5px); white-space: normal; word-break: break-word">{{ ite.basis }} </div>
                        <div class="table-cell" style="width: calc(17% + 1px); white-space: normal; word-break: break-word">
                          {{ ite.standard }}
                        </div>
                        <div class="table-cell" style="width: calc(9% + 0.5px); justify-content: center; align-items: center">
                          <a-select
                            v-model:value="ite.yn"
                            :disabled="isView"
                            :options="[
                              { label: 'Y(合格)', value: 'Y' },
                              { label: 'N(不合格)', value: 'N' },
                              { label: '-(不涉及)', value: '-' },
                            ]"
                            allowClear
                            placeholder="请选择"
                            style="width: 100%"
                            @change="changeYn(ite)"
                          />
                        </div>
                        <div class="table-cell" style="width: calc(12% + 1px); align-items: center">
                          <div v-if="ite.yn === 'N'" style="margin: 0 auto">
                            <a-button v-if="!isView" style="margin-right: 10px" type="primary" @click="handleDescription(inx, 'add')">添加</a-button>
                            <a-badge v-if="getBadgeCount(ite) > 0" :count="getBadgeCount(ite)">
                              <a-button @click="handleDescription(inx, 'view')">查看</a-button>
                            </a-badge>
                          </div>
                          <div v-else style="width: 100%">
                            <InputTextArea
                              v-model:value="ite.description"
                              :auto-size="{ minRows: 1, maxRows: 2 }"
                              :disabled="ite.yn === '-' || isView"
                              placeholder="请输入"
                              style="width: 100%"
                            />
                            <div style="width: 100%; display: flex; justify-content: center; align-items: center; margin-top: 10px">
                              <a-button v-if="!isView" shape="round" type="primary" @click="handleImg(ite, inx, '1')">
                                <DownloadOutlined />
                              </a-button>
                              <template v-if="ite.problemPicture">
                                <a-badge :count="getPictureList(ite.problemPicture).length" style="margin-left: 8px">
                                  <img
                                    :src="getFileAccessHttpUrl(getPictureList(ite.problemPicture)[0])"
                                    :style="{ width: isView ? '50px' : '40px', height: isView ? '50px' : '40px' }"
                                    style="cursor: pointer; display: inline-block"
                                    @click="openImg(ite.problemPicture)"
                                  />
                                </a-badge>
                              </template>
                            </div>
                          </div>
                        </div>
                        <div class="table-cell" style="width: calc(4% + 1px); justify-content: center; align-items: center">{{ ite.point }} </div>
                        <div class="table-cell" style="width: 4%; justify-content: center; align-items: center">
                          {{ ite.score }}
                        </div>
                        <div class="table-cell" style="width: calc(12% - 8px); justify-content: center; align-items: center">
                          <JUserModal
                            v-model:value="ite.supervisorId"
                            :auto-size="{ minRows: 1, maxRows: 4 }"
                            :disabled="isView"
                            :z-index="1001"
                            type="checkbox"
                          />
                        </div>
                      </div>
                    </template>
                  </VScroll>
                </a-spin>
              </div>
            </div>
            <div v-else class="review-summarize">
              <!-- 评分摘要卡片 -->
              <div style="margin-bottom: 20px">
                <div class="summary-item">
                  <div>不涉及项目数</div>
                  <div>{{ summaryData.uninvolvedNum }}项</div>
                  <div>不合格项目数</div>
                  <div>{{ summaryData.unqualifiedNum }}项</div>
                  <div>合格项目数</div>
                  <div>{{ summaryData.qualifiedNum }}项</div>
                </div>
                <div class="summary-item">
                  <div>审核得分</div>
                  <div>{{ summaryData.reviewScore }}</div>
                </div>
              </div>
              <!-- 审核说明 -->
              <div class="audit-explanation">
                <div class="explanation-title">审核说明</div>
                <div class="explanation-content">
                  <div>1.审核共9个大项，239个小项，总分为239分。</div>
                  <div>2.审核时如有不涉及项，则该项得分为0分。</div>
                  <div>3.审核得分 = 合格项得分 ÷ (239 - 不涉及项得分) × 100。</div>
                  <div>4.合格项数量 = 239 - 不涉及项数量 - 不合格项数量。</div>
                </div>
              </div>

              <!-- 安全标准化评审扣分项表格 -->
              <div class="deduction-table-section">
                <div class="table-title">
                  <span>安全标准化评审扣分项</span>
                </div>
                <a-table
                  :columns="deductionColumns"
                  :data-source="indexList"
                  :pagination="false"
                  :show-header="false"
                  bordered
                  class="deduction-table"
                  size="middle"
                >
                  <template #standard="{ record }">
                    <div v-if="record.deduct !== '扣分'" class="deduction-standard">{{ record.standard }}</div>
                    <div v-else>{{ record.standard }}</div>
                  </template>
                  <template #yn="{ record }">
                    <a-select
                      v-if="record.deduct !== '扣分'"
                      v-model:value="record.yn"
                      :disabled="isView"
                      :options="[
                        { label: 'Y', value: 'Y' },
                        { label: 'N', value: 'N' },
                      ]"
                      allowClear
                      placeholder="请选择"
                      style="width: 100%"
                      @change="changeDeductionYn(record)"
                    />
                    <div v-else>{{ record.yn }}</div>
                  </template>
                  <template #description="{ record }">
                    <a-input
                      v-if="record.deduct !== '扣分'"
                      v-model:value="record.description"
                      :disabled="record.yn === 'N' || isView"
                      allowClear
                      placeholder="请输入描述"
                      style="width: 100%"
                    />
                    <div v-else>{{ record.description }}</div>
                  </template>
                  <template #deduct="{ record }">
                    <a-input-number
                      v-if="record.deduct !== '扣分'"
                      v-model:value="record.deduct"
                      :controls="false"
                      :disabled="record.yn === 'N' || isView"
                      :min="0"
                      :precision="3"
                      @change="changeDeduct(record)"
                    />
                    <div v-else>{{ record.deduct }}</div>
                  </template>
                </a-table>
              </div>
              <!-- 参加审核人员 -->
              <div class="auditor-section">
                <div class="auditor-names">
                  <span class="auditor-label"
                    >最终得分：<span>{{ formattedFinalScore }}</span></span
                  >
                </div>
                <div class="auditor-names">
                  <span class="auditor-label">参加审核人员：</span>
                  <span class="auditor-name">{{ reviewParticipantsName || '暂无审核人员' }}</span>
                </div>
              </div>
            </div>
          </a-tab-pane>
        </a-tabs>
      </div>
      <template #footer>
        <div style="text-align: center">
          <a-button style="margin-right: 15px; line-height: 42px; height: 52px; width: 180px; border-radius: 10px" @click="close">取消 </a-button>
          <a-button
            v-if="!isView && activeKey !== 9"
            :loading="loading"
            style="margin-right: 15px; line-height: 42px; height: 52px; width: 180px; border-radius: 10px"
            type="primary"
            @click="save"
            >保存
          </a-button>
          <a-button
            v-if="!isView && activeKey === 9 && isSubmit"
            :loading="loading"
            style="line-height: 42px; height: 52px; width: 180px; border-radius: 10px"
            type="primary"
            @click="confirmClose"
            >提交评审
          </a-button>
        </div>
      </template>
    </basic-modal>
    <a-modal v-model:visible="visible" :z-index="1002" title="上传" @ok="handleOk">
      <div style="margin: 15px 10px 10px 10px">
        <JImageUpload v-model:value="imgUrl" :fileMax="9" bizPath="safetyStandardization" />
      </div>
    </a-modal>
    <a-modal v-model:visible="userVisible" :bodyStyle="{ margin: '40px 10px' }" :z-index="1001" title="批量选择负责任" @ok="handleUserOk">
      <div style="margin: 15px 10px 10px 10px">
        <JUserModal v-model:value="supervisorId" :auto-size="{ minRows: 1, maxRows: 4 }" :z-index="1002" type="checkbox" />
      </div>
    </a-modal>
    <a-modal
      v-model:visible="descriptionVisible"
      :maskClosable="false"
      :z-index="1001"
      title="审核描述和问题图片"
      width="700px"
      body-style="padding: 10px;max-height: 600px;overflow-y: auto"
    >
      <div v-for="(item, index) in descriptionOrImgData" :key="index" class="description-item-card">
        <div class="card-header">
          <span class="card-title">问题 {{ index + 1 }}</span>
          <DeleteOutlined v-if="!isView && !isDisabled" class="delete-icon" @click="handleDeleteDescription(index)" />
        </div>
        <div class="card-content">
          <div class="form-item">
            <span class="label">审核描述：</span>
            <InputTextArea
              v-model:value="item.description"
              :auto-size="{ minRows: 2, maxRows: 4 }"
              :disabled="isView || isDisabled"
              placeholder="请输入审核描述"
              style="width: 100%"
            />
          </div>
          <div class="form-item">
            <span class="label">问题图片：</span>
            <div class="image-action-area">
              <a-button v-if="!isView && !isDisabled" type="primary" size="small" shape="round" @click="handleImg(item, index, '2')">
                <DownloadOutlined /> 上传图片
              </a-button>
              <template v-if="item.problemPicture">
                <div class="image-preview animated-preview">
                  <a-badge :count="item.problemPicture.split(',').length">
                    <img :src="getFileAccessHttpUrl(item.problemPicture.split(',')[0])" class="preview-thumb" @click="openImg(item.problemPicture)" />
                  </a-badge>
                </div>
              </template>
              <span v-if="!item.problemPicture && (isView || isDisabled)" class="no-data-text">无</span>
            </div>
          </div>
        </div>
      </div>
      <div v-if="!isView && !isDisabled" class="add-btn-wrapper">
        <a-button block type="dashed" @click="handleAddDescription"> <PlusOutlined /> 添加问题 </a-button>
      </div>
      <template #footer>
        <a-button @click="() => (descriptionVisible = false)">取消</a-button>
        <a-button v-if="!isView && !isDisabled" type="primary" @click="handleDescriptionOk">确定</a-button>
      </template>
    </a-modal>
  </div>
</template>
<script lang="ts" name="evaluate-fun-modal" setup>
  import { ref, computed, onUnmounted, nextTick } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { Input, message } from 'ant-design-vue';
  import { JUserModal, JImageUpload } from '/@/components/Form';
  import { DownloadOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons-vue';
  import { VScroll } from '/@/components/VirtualScroll';
  import { queryById, getItemList, editItem, submit, addEditing, getEditing } from './api';
  // import { useUserStore } from '/@/store/modules/user';
  import { getFileAccessHttpUrl } from '/@/utils/common/compUtils';
  import { downloadFile } from '/@/utils/common/renderUtils';
  import { createImgPreview } from '/@/components/Preview/index';
  import { useMessage } from '/@/hooks/web/useMessage';
  const { createMessage } = useMessage();
  const emit = defineEmits(['success']);
  const InputTextArea = Input.TextArea;
  // const userInfo = computed(() => useUserStore().getUserInfo);
  const currentOperator = ref('');
  const loading = ref(false);
  const title = ref('');
  const activeKey = ref(0);
  const isView = ref(false);
  const id = ref('');
  const currentOperatorHeight = ref(0);
  const listLoading = ref(false);
  const repairReportFile = ref('');
  const analysisReportFile = ref('');
  // 是否可以提交评审
  const isSubmit = ref(false);
  const visible = ref(false);
  const imgUrl = ref('');
  const reviewDataIndex = ref(0);
  // 表格分页
  const tablePagination = ref<any>({ current: 1, pageSize: 10, showSizeChanger: false });
  // 动态计算tabs高度
  const tabsHeight = computed(() => {
    const baseHeight = isView.value ? 290 : 254;
    const dynamicHeight = baseHeight + currentOperatorHeight.value;
    return `calc(100vh - ${dynamicHeight}px)`;
  });
  // 评审总结相关数据
  const summaryData = ref({
    uninvolvedNum: 0,
    unqualifiedNum: 0,
    qualifiedNum: 0,
    reviewScore: 0,
  });
  const finalScore = ref(0);
  const reviewParticipantsName = ref('');
  const supervisorId = ref('');
  const userVisible = ref(false);
  // 添加多选相关状态
  const selectedRows = ref<number[]>([]);
  const isAllSelected = computed(() => {
    return selectedRows.value.length > 0 && selectedRows.value.length === reviewData.value.length;
  });
  // 格式化最终得分，确保不为负数且保留合适的小数位数
  const formattedFinalScore = computed(() => {
    return Math.max(0, Number(finalScore.value)).toFixed(3);
  });
  const itemList = ref<any[]>([
    {
      module: '安全管理',
      saveFlag: false,
    },
    {
      module: '作业安全管理',
      saveFlag: false,
    },
    {
      module: '设备安全管理',
      saveFlag: false,
    },
    {
      module: '职业健康',
      saveFlag: false,
    },
    {
      module: '外委施工管理',
      saveFlag: false,
    },
    {
      module: '危化品管理',
      saveFlag: false,
    },
    {
      module: '现场安全管理',
      saveFlag: false,
    },
    {
      module: '应急管理',
      saveFlag: false,
    },
    {
      module: '重大危险源管理',
      saveFlag: false,
    },
    {
      module: '评审总结',
      saveFlag: false,
    },
  ]);
  const reviewData = ref<any[]>([]);
  // 定时器变量
  let addEditingTimer: NodeJS.Timeout | null = null;
  let getEditingTimer: NodeJS.Timeout | null = null;
  // 扣分项表格列定义
  const deductionColumns = ref<any[]>([
    {
      dataIndex: 'index',
      width: 120,
      align: 'center',
      customCell: (_, index: any) => {
        return {
          rowSpan: indexRowSpan.value[index],
        };
      },
    },
    {
      dataIndex: 'accident',
      width: 120,
      align: 'center',
      customCell: (_, index: any) => {
        return {
          rowSpan: accidentRowSpan.value[index],
        };
      },
    },
    {
      dataIndex: 'degree',
      width: 120,
      align: 'center',
      customCell: (_, index: any) => {
        return {
          rowSpan: degreeRowSpan.value[index],
        };
      },
    },
    {
      dataIndex: 'basis',
      width: 150,
      align: 'center',
      customCell: (_, index: any) => {
        return {
          rowSpan: basisRowSpan.value[index],
        };
      },
    },
    {
      dataIndex: 'standard',
      width: 200,
      slots: {
        customRender: 'standard',
      },
    },
    {
      dataIndex: 'yn',
      width: 100,
      align: 'center',
      slots: {
        customRender: 'yn',
      },
    },
    {
      dataIndex: 'description',
      width: 300,
      slots: {
        customRender: 'description',
      },
    },
    {
      dataIndex: 'deduct',
      width: 100,
      align: 'center',
      slots: {
        customRender: 'deduct',
      },
    },
  ]);
  // 扣分项数据
  const indexList = ref<any[]>([]);
  const indexRowSpan = computed(() => getRowSpan(indexList.value, ['index']));
  const accidentRowSpan = computed(() => getRowSpan(indexList.value, ['accident']));
  const degreeRowSpan = computed(() => getRowSpan(indexList.value, ['degree']));
  const basisRowSpan = computed(() => getRowSpan(indexList.value, ['basis']));
  // 计算 rowSpan 的工具函数（支持多字段联合判断）
  const getRowSpan = (data, fields: string | string[]) => {
    const spans: any = [];
    let count = 0;
    const fieldArr = Array.isArray(fields) ? fields : [fields];
    const isSame = (a: any, b: any) => fieldArr.every((field) => a[field] === b[field]);
    data.forEach((record, i) => {
      if (i === 0 || !isSame(record, data[i - 1])) {
        count = 1;
        let j = i + 1;
        while (j < data.length && isSame(data[j], record)) {
          count++;
          j++;
        }
        spans[i] = count;
      } else {
        spans[i] = 0;
      }
    });
    return spans;
  };

  // 扣分项Y/N变更处理
  const changeDeductionYn = (record: any) => {
    if (record.yn === 'N') {
      record.deduct = 0;
      record.description = '无事故发生';
    } else {
      record.description = '';
    }
  };
  const changeDeduct = (record: any) => {
    finalScore.value = summaryData.value.reviewScore - record.deduct;
  };
  const [registerModal, { closeModal }] = useModalInner(async (data) => {
    visible.value = false;
    imgUrl.value = '';
    reviewDataIndex.value = 0;
    id.value = data.data.id;
    title.value = data.title;
    tablePagination.value = { ...tablePagination.value, current: 1 };
    activeKey.value = 0;
    currentOperator.value = '';
    isView.value = data.isView || false;
    currentOperatorHeight.value = 0;
    selectedRows.value = [];
    repairReportFile.value = data.data.repairReportFile || '';
    analysisReportFile.value = data.data.analysisReportFile || '';
    await updateTopList();
    // 测量current-operator高度
    measureCurrentOperatorHeight();
    if (!isView.value) {
      await addEditing({ id: id.value });
      await getEditing({ id: id.value }).then((res) => {
        if (res) {
          currentOperator.value = res.result;
        }
      });
      // 启动定时器
      startTimers();
    }
  });
  // 切换标签页
  const changeTabs = (key) => {
    selectedRows.value = [];
    activeKey.value = key;
    // 重置分页到第一页
    tablePagination.value = { ...tablePagination.value, current: 1 };
    // 滚动内容容器到顶部
    scrollToTop();
    if (key !== 9) {
      isSubmit.value = false;
      updateTopList(false);
    } else {
      queryById({ id: id.value }).then((res) => {
        getReviewSummary(res);
      });
    }
  };
  // 滚动容器到顶部
  const scrollToTop = () => {
    nextTick(() => {
      const holder = document.querySelector('.review-modal .ant-tabs-content-holder') as HTMLElement;
      if (holder) {
        holder.scrollTop = 0;
      }
    });
  };
  // 获取评审总结
  const getReviewSummary = async (res) => {
    const keys = Object.keys(summaryData.value);
    keys.forEach((key) => {
      summaryData.value[key] = res[key] || 0;
    });
    reviewParticipantsName.value = res.reviewParticipantsName;
    if (!isView.value) {
      finalScore.value = summaryData.value.reviewScore;
      isSubmit.value = res.moduleList.every((item) => item.saveFlag);
    } else {
      finalScore.value = res.finalScore;
    }
    const list = res.indexList;
    list.unshift({
      index: '安全绩效指标',
      accident: '安全事故',
      degree: '事故程度',
      basis: '《生产安全事故事件管理制度》',
      standard: '扣分标准',
      yn: 'Y/N',
      description: '描述',
      deduct: '扣分',
    });
    indexList.value = list;
  };
  // 更新顶部状态
  const updateTopList = async (is = true) => {
    listLoading.value = true;
    reviewData.value = [];
    try {
      await queryById({ id: id.value }).then((res) => {
        const data = res.moduleList;
        itemList.value = itemList.value.map((item) => {
          item.saveFlag = data.filter((ite) => ite.module === item.module)?.[0]?.saveFlag;
          if (item.module === '评审总结' && isView.value && (res.finalScore != '0' || !res.finalScore)) {
            item.saveFlag = data.every((ite) => ite.saveFlag);
          }
          return item;
        });
        if (!isView.value) {
          isSubmit.value = res.moduleList.every((item) => item.saveFlag);
        }
        if (is && !isView.value) {
          // 设置默认激活的项目为第一个未完成的
          const firstIncomplete = itemList.value.findIndex((item) => !item.saveFlag);
          if (firstIncomplete !== -1) {
            activeKey.value = firstIncomplete; // activeKey 从 1 开始
          } else {
            // 如果所有项目都已完成，默认显示第一个
            activeKey.value = 0;
          }
        }
        if (activeKey.value == 9) {
          getReviewSummary(res);
        }
      });
      if (activeKey.value != 9) {
        await new Promise<void>((resolve) => {
          setTimeout(async () => {
            await getItemListData({
              id: id.value,
              module: itemList.value[activeKey.value].module,
            });
            resolve();
          }, 200);
        });
      }
    } catch (_error) {
      listLoading.value = false;
    }
  };
  // 获取模块下的项目
  const getItemListData = async (params) => {
    getItemList(params).then((res) => {
      const list = res.map((item) => {
        return {
          ...item,
          score: !item.score ? 0 : item.score,
          // supervisorId: !isView.value && !itemList.value[activeKey.value].saveFlag ? userInfo.value.id : item.supervisorId,
        };
      });
      reviewData.value = list;
      listLoading.value = false;
    });
  };
  // 获取标签页样式类
  const getTabClass = (item: any) => {
    if (item.saveFlag) {
      return 'tab-item-completed';
    } else {
      return 'tab-item-incomplete';
    }
  };
  const changeYn = (record) => {
    if (record.yn === 'Y') {
      record.score = 1;
      record.description = '符合要求，制度健全，执行到位。';
    } else if (record.yn === 'N') {
      record.score = 0;
      record.description = '';
    } else if (record.yn === '-') {
      record.score = 0;
      record.description = '不涉及此项目。';
    } else {
      record.score = 0;
      record.description = '';
    }
  };
  const close = () => {
    closeModal();
    clearTimers();
  };
  const save = async () => {
    const list = reviewData.value;
    loading.value = true;
    listLoading.value = true;
    try {
      await editItem(list);
      emit('success');
      await updateTopList();
    } finally {
      loading.value = false;
      listLoading.value = false;
    }
  };
  const confirmClose = async () => {
    const list = JSON.parse(JSON.stringify(indexList.value));
    for (let i = 0; i < list.length; i++) {
      if (!list[i].yn || list[i].yn === '') {
        message.error('请选择Y/N!');
        return;
      }
      if (!list[i].description || list[i].description === '') {
        message.error('请填写描述!');
        return;
      }
      if ((!list[i].deduct || list[i].deduct === '') && list[i].deduct != 0) {
        message.error('请填写扣分!');
        return;
      }
    }
    loading.value = true;
    submit({ id: id.value, indexList: list.slice(1) })
      .then((res) => {
        if (res) {
          //关闭弹窗
          closeModal();
          //刷新列表
          emit('success');
        }
      })
      .finally(() => {
        loading.value = false;
      });
  };
  // 处理全选/取消全选
  const handleSelectAll = (e: any) => {
    if (e.target.checked) {
      // 全选
      selectedRows.value = Array.from({ length: reviewData.value.length }, (_, i) => i);
    } else {
      // 取消全选
      selectedRows.value = [];
    }
  };
  // 处理单行选择
  const handleRowSelect = (index: number, checked: boolean) => {
    if (checked) {
      // 添加到选中列表
      selectedRows.value = [...selectedRows.value, index];
    } else {
      // 从选中列表移除
      selectedRows.value = selectedRows.value.filter((i) => i !== index);
    }
  };
  const handleBatchUser = () => {
    supervisorId.value = '';
    userVisible.value = true;
  };
  const handleUserOk = () => {
    if (supervisorId.value === '' || !supervisorId.value) {
      message.error('请选择负责人!');
      return;
    }
    reviewData.value.forEach((item, index) => {
      if (selectedRows.value.includes(index)) {
        item.supervisorId = supervisorId.value;
      }
    });
    userVisible.value = false;
    selectedRows.value = [];
  };
  const descriptionVisible = ref(false);
  const descriptionOrImgIndex = ref(0);
  const ynType = ref('1');
  const isDisabled = ref(false);
  const descriptionOrImgData = ref([
    {
      description: '',
      problemPicture: '',
    },
  ]);
  // 添加审核描述和问题图片
  const handleDescription = (inx, type) => {
    isDisabled.value = type === 'view';
    reviewDataIndex.value = inx;
    const currentData = reviewData.value[inx];
    try {
      const descList = currentData.description ? currentData.description.split('&') : [];
      const picList = currentData.problemPicture ? currentData.problemPicture.split('&') : [];
      const maxLength = Math.max(descList.length, picList.length);
      if (maxLength > 0) {
        const list: any[] = [];
        for (let i = 0; i < maxLength; i++) {
          list.push({
            description: descList[i] || '',
            problemPicture: picList[i] || '',
          });
        }
        descriptionOrImgData.value = list;
      } else {
        if (currentData.description || currentData.problemPicture) {
          descriptionOrImgData.value = [
            {
              description: currentData.description || '',
              problemPicture: currentData.problemPicture || '',
            },
          ];
        } else {
          descriptionOrImgData.value = [{ description: '', problemPicture: '' }];
        }
      }
    } catch (e) {
      descriptionOrImgData.value = [
        {
          description: currentData.description || '',
          problemPicture: currentData.problemPicture || '',
        },
      ];
    }
    descriptionVisible.value = true;
  };

  const handleDescriptionOk = () => {
    const validItems = descriptionOrImgData.value;
    if (validItems.length === 0) {
      reviewData.value[reviewDataIndex.value].description = '';
      reviewData.value[reviewDataIndex.value].problemPicture = '';
    } else {
      const descStr = validItems.map((item) => item.description || '').join('&');
      const picStr = validItems.map((item) => item.problemPicture || '').join('&');
      reviewData.value[reviewDataIndex.value].description = descStr;
      reviewData.value[reviewDataIndex.value].problemPicture = picStr;
    }
    descriptionVisible.value = false;
  };

  const handleAddDescription = () => {
    descriptionOrImgData.value.push({ description: '', problemPicture: '' });
  };

  const handleDeleteDescription = (index) => {
    descriptionOrImgData.value.splice(index, 1);
  };
  const getBadgeCount = (item) => {
    if (item.description) {
      return item.description.split('&').length;
    }
    if (item.problemPicture) {
      return item.problemPicture.split('&').length;
    }
    return 0;
  };
  const getPictureList = (str) => {
    if (!str) return [];
    return str
      .replace(/&/g, ',')
      .split(',')
      .filter((p) => !!p);
  };

  const handleImg = (ite, inx, type) => {
    ynType.value = type;
    if (ynType.value === '1') {
      reviewDataIndex.value = inx;
    } else {
      descriptionOrImgIndex.value = inx;
    }
    imgUrl.value = ite.problemPicture;
    visible.value = true;
  };
  const handleOk = () => {
    if (ynType.value === '1') {
      reviewData.value[reviewDataIndex.value].problemPicture = imgUrl.value;
    } else {
      descriptionOrImgData.value[descriptionOrImgIndex.value].problemPicture = imgUrl.value;
    }
    visible.value = false;
  };
  const openImg = (data) => {
    // Handle both & and , for preview
    let imageList = data
      .replace(/&/g, ',')
      .split(',')
      .filter(Boolean)
      .map((item) => getFileAccessHttpUrl(item));
    createImgPreview({
      imageList: imageList,
      defaultWidth: 380,
      rememberState: true,
      scaleStep: 10,
    });
  };
  // 启动定时器
  const startTimers = () => {
    // 清理已存在的定时器
    clearTimers();
    // addEditing 每分钟调用一次 (60000ms)
    addEditingTimer = setInterval(() => {
      if (id.value) {
        addEditing({ id: id.value });
      }
    }, 60000);
    // getEditing 每10秒调用一次 (10000ms)
    getEditingTimer = setInterval(() => {
      if (id.value) {
        getEditing({ id: id.value }).then((res) => {
          if (res) {
            currentOperator.value = res.result;
            // 重新测量高度
            measureCurrentOperatorHeight();
          }
        });
      }
    }, 10000);
  };
  // 清理定时器
  const clearTimers = () => {
    if (addEditingTimer) {
      clearInterval(addEditingTimer);
      addEditingTimer = null;
    }
    if (getEditingTimer) {
      clearInterval(getEditingTimer);
      getEditingTimer = null;
    }
  };
  // 测量current-operator的高度
  const measureCurrentOperatorHeight = () => {
    nextTick(() => {
      const operatorElement = document.querySelector('.current-operator') as HTMLElement;
      if (operatorElement) {
        currentOperatorHeight.value = operatorElement.offsetHeight;
      }
    });
  };

  const handleDownloadReport = (key) => {
    const data = key === 'repairReportFile' ? repairReportFile.value : analysisReportFile.value;
    if (!data) {
      createMessage.warning('暂无报告');
      return;
    }
    downloadFile(data);
  };

  // 组件卸载时清理定时器
  onUnmounted(() => {
    clearTimers();
  });
</script>
<style lang="less" scoped>
  .tab-item-completed {
    .tab-item-number {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 30px;
      height: 30px;
      border-radius: 50%;
      border: 2px solid #52c41a;
      background: linear-gradient(135deg, #52c41a, #73d13d);
      color: #fff;
      font-weight: 600;
      font-size: 14px;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      cursor: pointer;
      box-shadow: 0 2px 8px rgba(82, 196, 26, 0.2);
      margin-right: 10px;
    }

    .tab-item-title {
      color: #52c41a;
    }
  }

  .tab-item-incomplete {
    .tab-item-number {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 30px;
      height: 30px;
      border-radius: 50%;
      border: 1px solid #d9d9d9;
      background: #fff;
      color: #666;
      font-weight: 600;
      font-size: 14px;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      cursor: pointer;
      margin-right: 10px;
    }

    .tab-item-title {
      color: #666;
    }
  }

  :deep(.ant-tabs-nav) {
    background: #fff;
    margin: 0;
    border-bottom: 1px solid #f0f0f0;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

    .ant-tabs-tab {
      margin: 0 15px 0 0;
      padding: 12px 0;
    }

    .ant-tabs-tab-active {
      .tab-item-completed,
      .tab-item-incomplete {
        .tab-item-number {
          background: linear-gradient(135deg, #1890ff, #40a9ff);
          border-color: #1890ff;
          color: #fff;
          box-shadow: 0 2px 8px rgba(24, 144, 255, 0.3);
          width: 30px;
          height: 30px;
          border-radius: 50%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          margin-right: 10px;
        }

        .tab-item-title {
          color: #1890ff;
        }
      }
    }
  }

  // 当前操作人样式
  .current-operator {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    background: linear-gradient(135deg, #fff5f5, #fed7d7);
    border: 1px solid #feb2b2;
    border-radius: 12px;
    margin-bottom: 20px;
    box-shadow: 0 4px 12px rgba(245, 101, 101, 0.1);
    position: relative;
    overflow: hidden;

    .anticon {
      color: #e53e3e;
      font-size: 18px;
      margin-right: 12px;
      filter: drop-shadow(0 2px 4px rgba(229, 62, 62, 0.2));
    }

    .operator-label {
      color: #c53030;
      font-weight: 600;
      font-size: 15px;
      margin-right: 8px;
      width: 90px;
    }

    .operator-name {
      color: #e53e3e;
      font-weight: 700;
      font-size: 16px;
      width: calc(100% - 126px);
      background: linear-gradient(135deg, #e53e3e, #c53030);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      text-shadow: 0 2px 4px rgba(229, 62, 62, 0.1);
    }
  }

  .review-content {
    .review-content-title {
      font-size: 16px;
      font-weight: 600;
      line-height: 60px;

      span {
        color: #999;
        font-size: 12px;
      }
    }
  }

  // 评审总结样式
  .review-summarize {
    padding-top: 15px;
    margin: 0 15px;

    .summary-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 16px;
      color: #333;
      font-weight: 600;

      div {
        border: 1px solid #f0f0f0;
        padding: 15px 0;
        border-left: none;
      }

      & > div:nth-child(2n - 1) {
        text-align: center;
        width: 25%;
        background: #fafafa;
      }

      & > div:nth-child(2n) {
        text-align: center;
        width: calc(25% / 3);
      }

      & > div:nth-child(1) {
        border-left: 1px solid #f0f0f0;
        border-radius: 10px 0 0 0;
      }

      & > div:last-child {
        border-radius: 0 10px 0 0;
      }
    }

    .summary-item:nth-child(2) {
      div {
        border-top: none;
      }

      & > div:nth-child(2n) {
        text-align: center;
        width: 75%;
      }

      & > div:nth-child(1) {
        border-radius: 0 0 0 10px;
      }

      & > div:nth-child(2) {
        border-radius: 0 0 10px 0;
      }
    }

    // 审核说明
    .audit-explanation {
      background: #fff;
      border-radius: 16px;
      padding: 28px;
      margin-bottom: 15px;
      border: 1px solid #fbbf24;
      background: rgba(251, 191, 36, 0.1);

      .explanation-title {
        font-size: 16px;
        font-weight: 600;
        line-height: 1.5;
        margin-bottom: 15px;
        color: #92400e;
      }
    }

    // 扣分项表格
    .deduction-table-section {
      background: #fff;
      border-radius: 16px;
      padding: 15px;
      margin-bottom: 15px;
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.06);
      border: 1px solid #f0f0f0;
      position: relative;
      overflow: hidden;

      .table-title {
        display: flex;
        align-items: center;
        font-size: 16px;
        font-weight: 700;
        margin-bottom: 24px;
        padding-bottom: 16px;
        border-bottom: 1px solid #f0f0f0;

        .anticon {
          margin-right: 12px;
          font-size: 18px;
        }
      }

      .deduction-table {
        :deep(.ant-table-thead > tr > th) {
          background: #fafafa;
          font-weight: 600;
          border-bottom: 1px solid #f0f0f0;
          font-size: 14px;
        }

        :deep(.ant-table-tbody > tr > td) {
          border-bottom: 1px solid #f0f0f0;
          border-right: 1px solid #f0f0f0;
          padding: 12px 8px;
          color: #37474f;
        }

        :deep(.ant-table-tbody .ant-select) {
          color: #37474f;
        }

        :deep(.ant-table-tbody .ant-input) {
          color: #37474f;
        }

        :deep(.ant-table-tbody .ant-input::placeholder) {
          color: #999;
        }

        // 为表格列标题添加高亮样式，适配外部颜色主题
        :deep(.ant-table-tbody > tr:first-child > td:first-child) {
          border-left: 1px solid #f0f0f0;
        }

        :deep(.ant-table-tbody > tr:first-child > td) {
          background: #fafafa;
          border-top: 1px solid #f0f0f0;
          font-weight: 600;
          text-align: center;
          position: relative;
          transition: all 0.3s ease;
          // 所有列标题保持统一的颜色
          &:nth-child(1),
          &:nth-child(2),
          &:nth-child(3),
          &:nth-child(4),
          &:nth-child(5),
          &:nth-child(6),
          &:nth-child(7),
          &:nth-child(8) {
            background: #fafafa;
            border-color: #f0f0f0;
          }
        }

        .deduction-standard {
          font-weight: 600;
          color: #37474f;
          line-height: 1.6;
          font-size: 14px;
        }
      }
    }

    // 参加审核人员
    .auditor-section {
      background: #fff;
      border-radius: 20px;
      padding: 32px;
      margin-bottom: 24px;
      border: 1px solid #f0f0f0;
      position: relative;
      overflow: hidden;

      .auditor-names {
        position: relative;
        z-index: 2;

        .auditor-label {
          font-size: 16px;
          font-weight: 600;
          line-height: 1.5;
          display: block;
          margin-bottom: 10px;
        }

        .auditor-name {
          display: block;
          padding: 16px 20px;
          background: #fafafa;
          border: 1px solid #f0f0f0;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 600;
          line-height: 1.5;
          transition: all 0.3s ease;
          min-height: 56px;
          display: flex;
          align-items: center;

          &:empty::before {
            content: '暂无审核人员';
            color: #999;
            font-weight: 400;
          }
        }
      }
    }
  }

  :deep(.ant-tabs-content-holder) {
    height: var(--tabs-height);
    overflow-y: auto;
  }

  // 虚拟滚动表格样式
  .virtual-table-container {
    border: 1px solid #d9d9d9;
    border-bottom: none;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    background: #fff;

    // 确保容器边框与行边框协调
    .virtual-scroll-table {
      .virtual-table-row:first-child {
        border-top: none;
      }
    }
  }

  .virtual-scroll-table {
    // 确保虚拟滚动容器有正确的滚动行为
    overflow-y: auto;
    // max-height: 500px;
    // height: 500px;

    .virtual-table-row {
      display: flex;
      min-height: 100px;
      align-items: flex-start;
      background: #fff;
      transition: all 0.2s ease;

      &:hover {
        background: #f8f9fa;
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
      }

      &:nth-child(even) {
        background: #fafbfc;
      }

      &:nth-child(even):hover {
        background: #f0f2f5;
      }
    }

    .table-cell {
      padding: 12px 16px;
      border-right: 1px solid #f0f0f0;
      border-bottom: 1px solid #f0f0f0;
      display: flex;
      align-items: center;
      min-height: 140px;
      font-size: 14px;
      line-height: 1.6;
      word-wrap: break-word;
      word-break: break-all;
      white-space: normal;
      overflow: visible;

      &:last-child {
        border-right: none;
      }

      // 选择器样式优化
      .ant-select {
        width: 100%;

        .ant-select-selector {
          border-radius: 4px;
          border: 1px solid #d9d9d9;
          transition: all 0.2s ease;

          &:hover {
            border-color: #40a9ff;
          }
        }
      }

      // 文本域样式优化
      .ant-input {
        border-radius: 4px;
        border: 1px solid #d9d9d9;
        transition: all 0.2s ease;

        &:hover {
          border-color: #40a9ff;
        }

        &:focus {
          border-color: #1890ff;
          box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
        }
      }

      // 长文本列特殊处理
      &[style*='width: 250px'],
      &[style*='width: 300px'] {
        white-space: normal !important;
        word-break: break-word !important;
        overflow-wrap: break-word !important;
        hyphens: auto;

        // 确保文字完全显示
        text-overflow: unset !important;
        overflow: visible !important;
      }
    }
  }

  // 虚拟滚动表格头部
  .virtual-table-header {
    display: flex;
    background: linear-gradient(135deg, #fafbfc 0%, #f5f7fa 100%);
    border-bottom: 1px solid #e8eaed;
    font-weight: 600;
    position: sticky;
    top: 0;
    z-index: 10;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);

    .header-cell {
      padding: 16px;
      border-right: 1px solid #e8eaed;
      // display: flex;
      // align-items: center;
      min-height: 48px;
      font-size: 14px;
      color: #262626;
      position: relative;

      &:last-child {
        border-right: none;
      }

      // 必填标识样式
      span[style*='color: #ff4d4f'] {
        font-weight: 700;
        font-size: 16px;
        margin-right: 6px;
      }

      &:last-child::after {
        display: none;
      }
    }
  }

  // 虚拟滚动容器优化
  .virtual-scroll-table {
    // 滚动条样式优化
    &::-webkit-scrollbar {
      width: 8px;
    }

    &::-webkit-scrollbar-track {
      background: #f1f1f1;
      border-radius: 4px;
    }

    &::-webkit-scrollbar-thumb {
      background: #c1c1c1;
      border-radius: 4px;

      &:hover {
        background: #a8a8a8;
      }
    }

    // 确保滚动容器有足够的空间
    .virtual-scroll__container {
      min-height: 100%;
      padding-bottom: 20px; // 添加底部间距，确保能滚动到最底部
    }
  }

  // 加载状态优化
  .virtual-table-container {
    position: relative;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(255, 255, 255, 0.8);
      z-index: 100;
      opacity: 0;
      transition: opacity 0.3s ease;
      pointer-events: none;
    }

    &.loading::before {
      opacity: 1;
      pointer-events: all;
    }
  }

  // 表格行状态样式
  .virtual-table-row {
    &.row-selected {
      background: #e6f7ff !important;
      border-left: 3px solid #1890ff;
    }

    &.row-error {
      background: #fff2f0 !important;
      border-left: 3px solid #ff4d4f;
    }

    &.row-warning {
      background: #fffbe6 !important;
      border-left: 3px solid #faad14;
    }
  }

  // 表格单元格状态
  .table-cell {
    &.cell-required {
      position: relative;

      &::before {
        content: '*';
        position: absolute;
        top: 4px;
        right: 4px;
        color: #ff4d4f;
        font-weight: bold;
        font-size: 12px;
      }
    }

    &.cell-error {
      .ant-select-selector,
      .ant-input {
        border-color: #ff4d4f !important;
        box-shadow: 0 0 0 2px rgba(255, 77, 79, 0.2) !important;
      }
    }
  }

  .description-item-card {
    background: #fff;
    border: 1px solid #e8e8e8;
    border-radius: 8px;
    margin-bottom: 16px;
    padding: 16px;
    transition: all 0.3s;

    &:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
      border-color: #d9d9d9;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      border-bottom: 1px dashed #f0f0f0;
      padding-bottom: 8px;

      .card-title {
        font-weight: 600;
        color: #333;
        font-size: 14px;
        display: flex;
        align-items: center;

        &::before {
          content: '';
          display: inline-block;
          width: 4px;
          height: 14px;
          background: #1890ff;
          margin-right: 8px;
          border-radius: 2px;
        }
      }

      .delete-icon {
        color: #ff4d4f;
        cursor: pointer;
        font-size: 16px;
        transition: all 0.3s;
        padding: 4px;
        border-radius: 4px;

        &:hover {
          background: rgba(255, 77, 79, 0.1);
        }
      }
    }

    .card-content {
      .form-item {
        margin-bottom: 12px;

        &:last-child {
          margin-bottom: 0;
        }

        .label {
          display: block;
          margin-bottom: 6px;
          color: #666;
          font-size: 13px;
          font-weight: 500;
        }

        .image-action-area {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 12px;

          .image-preview {
            display: inline-block;
            border: 1px solid #f0f0f0;
            border-radius: 4px;
            padding: 4px;
            background: #fafafa;
            transition: all 0.3s;

            &:hover {
              border-color: #1890ff;
              box-shadow: 0 0 8px rgba(24, 144, 255, 0.1);
            }

            .preview-thumb {
              width: 48px;
              height: 48px;
              object-fit: cover;
              cursor: pointer;
              display: block;
              border-radius: 4px;
            }
          }

          .no-data-text {
            color: #ccc;
            font-size: 12px;
            font-style: italic;
          }
        }
      }
    }
  }

  .add-btn-wrapper {
    margin-top: 8px;
    padding-top: 8px;
  }
</style>
<style lang="less">
  .review-modal {
    .ant-modal {
      max-width: 100% !important;
      top: 0 !important;

      .scroll-container {
        padding-bottom: 0 !important;
      }
    }
  }
</style>
