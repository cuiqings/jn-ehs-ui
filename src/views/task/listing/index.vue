<template>
  <div>
    <!-- tab汇报 -->
    <div class="others-wrap">
      <div class="tab-search">
        <a-tabs v-model:activeKey="activeKey" @change="handleTab" type="card">
          <a-tab-pane key="1" :tab="`进行中(${count.jxz || 0})`"></a-tab-pane>
          <a-tab-pane key="2" :tab="`已完成(${count.ywc || 0})`"></a-tab-pane>
          <a-tab-pane key="3" :tab="`我参与的(${count.wcy || 0})`"></a-tab-pane>
        </a-tabs>
      </div>
      <!-- 列表区域 -->
      <div>
        <!--自定义查询区域-->
        <div class="jeecg-basic-table-form-container" @keyup.enter="searchQuery">
          <a-form ref="formRef" :model="queryParam" :label-col="labelCol" :wrapper-col="wrapperCol">
            <a-row :gutter="24">
              <a-col :md="5" :sm="12">
                <a-form-item label="任务分类">
                  <JDictSelectTag
                    placeholder="请选择"
                    v-model:value="queryParam.taskType"
                    :show-choose-option="false"
                    dictCode="jn_publish_task_type"
                  >
                  </JDictSelectTag>
                </a-form-item>
              </a-col>
              <a-col :md="5" :sm="12">
                <a-form-item label="汇报要求">
                  <a-select v-model:value="queryParam.reportRequire" placeholder="请选择">
                    <a-select-option value="1"> 长期 </a-select-option>
                    <a-select-option value="2"> 日常 </a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col :md="5" :sm="12">
                <a-form-item label="工作任务">
                  <a-input allowClear placeholder="请输入" v-model:value="queryParam.workContent"></a-input>
                </a-form-item>
              </a-col>
              <a-col :md="5" :sm="12">
                <a-form-item label="完成时限">
                  <a-range-picker
                    v-model:value="queryParam.rangeValue"
                    @change="handleTimeChange"
                    :placeholder="placeholder"
                    valueFormat="YYYY-MM-DD"
                  />
                </a-form-item>
              </a-col>
              <a-col :md="4" :sm="12">
                <div class="btn-list">
                  <a-button type="primary" @click="searchQuery">查询</a-button>
                  <a-button type="primary" @click="searchReset" style="margin-left: 8px">重置</a-button>
                </div>
              </a-col>
            </a-row>
          </a-form>
        </div>
        <div class="content-wrap">
          <!-- 左侧卡片 -->
          <div class="fl-list">
            <div>
              <!--列表-->
              <div class="fl-list-1">
                <!-- 只看验收 -->
                <div v-if="activeKey == 1" class="only-check">
                  <a-checkbox v-model:checked="checked" @change="onChangeCheck">只看待验收 ({{ totalCheck }}) </a-checkbox>
                </div>
                <div v-if="listData.length > 0">
                  <div
                    class="item-wrap"
                    :class="{ 'item-active': currentId == item.id }"
                    v-for="item in listData"
                    :key="item.id"
                    @click="getRightDetail(item)"
                  >
                    <div v-if="(item.status == 2 || item.status == 3) && activeKey == 3" class="task-finished-icon">
                      <img src="../../../assets/images/task/task-finished.png" alt="" />
                    </div>
                    <div v-if="(item.status == 2 || item.status == 3) && activeKey == 2">
                      <div class="task-finished-tag" v-if="item.completeTag && item.completeTag == '延期完成'">{{ item.completeTag }}</div>
                      <div class="task-finished-tag task-finished-tag-1" v-if="item.completeTag && item.completeTag == '按期完成'">{{
                        item.completeTag
                      }}</div>
                      <div class="task-finished-tag task-finished-tag-2" v-if="item.completeTag && item.completeTag == '超期完成'">{{
                        item.completeTag
                      }}</div>
                      <div class="task-finished-tag task-finished-tag-3" v-if="item.completeTag && item.completeTag == '已关闭'">{{
                        item.completeTag
                      }}</div>
                    </div>
                    <div class="label-wrap">
                      <span class="item-label">{{ item.taskType_dictText }}</span>
                      <span v-if="item.reportRequire == 1" class="item-label-1">长期</span>
                      <span v-if="item.reportRequire == 2" class="item-label-1">日常</span>
                      <div v-if="Number(item.toCheckCount) > 0" class="item-status"
                        ><span>待验收{{ item.toCheckCount }}</span></div
                      >
                    </div>
                    <div class="item-content"> 工作任务：{{ item.workContent }} </div>
                    <!-- 虚线 -->
                    <div class="dash-line"></div>
                    <div class="date-wrap">
                      <div class="date-1">
                        <span class="item-date">完成时限：{{ item.completeTimeLimit }}</span>
                        <span>完成进度：</span><a-progress class="item-process" :percent="Number(item.rate)" size="small" />
                      </div>
                      <div>
                        <span v-if="item.reportRequire == 2">汇报时间：{{ item.reportTime }}</span>
                        <span v-if="item.reportRequire == 1">汇报周期：{{ item.reportTime }}</span>
                        汇报完成{{ item.currentCycleReportedCount }}/{{ item.currentCycleCount }} 验收完成{{ item.currentCycleCheckedCount }}/{{
                          item.currentCycleCount
                        }}</div
                      >
                    </div>
                  </div>
                </div>
                <a-empty v-else description="暂无数据" style="position: relative; top: 20px" />
              </div>
              <!-- 分页 -->
              <div v-if="listData.length > 0" class="page-wrap">
                <a-pagination
                  v-model:current="current"
                  v-model:page-size="pageSizeRef"
                  :total="total"
                  @change="onChange"
                  showLessItems
                  @showSizeChange="onShowSizeChange"
                /> </div
            ></div>
          </div>
          <!-- 右侧详情 -->
          <div class="fr-detail">
            <div v-if="rightDetail.status">
              <div class="action-btns">
                <a-button
                  v-if="rightDetail.status == 1 && rightDetail.publishBy == userInfo.id"
                  type="primary"
                  shape="round"
                  style="margin-right: 10px"
                  @click="handleExtension(rightDetail)"
                  >延期</a-button
                >
                <a-button
                  v-if="activeKey == 1 && rightDetail.publishBy == userInfo.id"
                  type="primary"
                  shape="round"
                  style="margin-right: 10px"
                  danger
                  ghost
                  @click="handleClose(rightDetail)"
                  >关闭</a-button
                >
                <a-button type="primary" shape="round" ghost @click="handleTaskExportXls" v-auth="'taskManagement:jn_list:exportXls'">导出</a-button>
              </div>
              <div class="task-detail">
                <div class="detail-content">
                  <div class="label-fl">{{ rightDetail.taskType_dictText }}</div>
                  <div class="label-fr">
                    <div v-if="rightDetail.reportRequire == 1" class="label-1">长期</div>
                    <div v-if="rightDetail.reportRequire == 2" class="label-1">日常</div>
                    <div class="label-1 label-2">{{ rightDetail.reportWay_dictText }} {{ rightDetail.reportTime }}</div>
                    <div class="label-date">
                      <span class="item-date">完成时限：{{ rightDetail.completeTimeLimit }}</span>
                      <span>完成进度：</span><a-progress class="item-process" :percent="Number(rightDetail.rate)" size="small" />
                    </div>
                  </div>
                </div>
                <div class="detail-desc"> 工作任务：{{ rightDetail.workContent }} </div>
                <div class="info-4">
                  <div class="info-4-fl">
                    <div v-if="rightDetail.checkPeopleName">验收人：{{ rightDetail.checkPeopleName }}</div>
                    <div v-if="rightDetail.attachmentFileList && rightDetail.attachmentFileList.length > 0" class="attachment-wrap">
                      <span style="display: inline-block; width: 56px; text-align: right">附件：</span>
                      <div style="display: inline-block; margin-left: -17px; width: 500px; vertical-align: text-top;margin-top: -5px;">
                        <p style="margin-bottom: -6px;">
                          <a-button type="link" v-for="(item, index) in rightDetail.attachmentFileList" :key="index" @click="handlePreview(item)">{{
                          item.split('/')[item.split('/').length - 1]
                        }}</a-button>
                        </p>
                      </div>
                    </div>
                  </div>
                  <div class="info-4-fr">
                    <p>发布单位：{{ rightDetail.publishOrgName }}</p>
                    <p>发布时间：{{ rightDetail.publishTime }}</p>
                  </div>
                </div>
                <div v-if="activeKey == 2 || (activeKey == 3 && rightDetail.status != 1)" class="tab-2-show">
                  <span style="display: inline-block; margin-right: 15px">完成时间：{{ rightDetail.completeTime }}</span>
                  <span v-if="rightDetail.closeReason"
                    >完成说明：{{ closeReason[Number(rightDetail.closeReason) - 1] }} {{ rightDetail.closeDesc }}</span
                  >
                  <span v-else>完成说明： {{ rightDetail.status_dictText }}</span>
                </div>
              </div>
              <div class="detail-tab-search">
                <a-tabs v-model:activeKey="activeKeyDetail" @change="handleDetailTab">
                  <a-tab-pane key="1" tab="汇报信息">
                    <div class="search-wrap">
                      <a-select v-model:value="searchType" style="width: 120px" @change="handleSearchTypeChange">
                        <a-select-option value="1">按汇报周期</a-select-option>
                        <a-select-option value="2">按责任单位</a-select-option>
                        <a-select-option value="3">按工作要求</a-select-option>
                      </a-select>
                      <!-- dd v-if="rightDetail.canCheck" -->
                      <span v-if="rightDetail.canCheck && rightDetail.status === '1'" class="search-num" @click="handleDelayReview"
                        >延期申请·待审核({{ reviewListCount }})</span
                      >
                    </div>
                    <div class="data-list">
                      <a-collapse v-model:activeKey="activeKeyPanel1" v-if="searchType == '1'">
                        <a-collapse-panel v-for="(item, index) in dataSource1" :key="index + 1">
                          <template #header>
                            <span class="header-date">汇报周期：{{ item.reportCycle }}</span>
                            <span class="header-percent" v-if="rightDetail.ifCheckPeople == 1"
                              >汇报完成：{{ item.reportedCount }}/{{ item.total }}</span
                            >
                            <span
                              v-if="item.reportedCount != item.total && rightDetail.ifPublishPeople == 1"
                              class="header-btn"
                              @click="handleOneRemind(item)"
                              >一键提醒</span
                            >
                            <span class="header-percent" v-if="rightDetail.ifCheckPeople == 1"
                              >验收完成：{{ item.checkedCount }}/{{ item.total }}</span
                            >
                          </template>
                          <a-table :bordered="true" :dataSource="item.recordList" :columns="columns1" :pagination="false">
                            <template #bodyCell="{ column, text, record }">
                              <template v-if="column.dataIndex === 'checkStatus'">
                                <span v-if="record.checkStatus == '通过'" style="color: #09c199">通过</span>
                                <span v-if="record.checkStatus == '不通过'" style="color: #cd2b1d">不通过</span>
                              </template>
                              <template v-if="column.dataIndex === 'operation'">
                                <a-button type="link" @click="handleHistoryProcess(record)">查看</a-button>
                                <a-button
                                  v-if="activeKey == 1 && record.status == '2' && rightDetail.canCheck"
                                  type="link"
                                  @click="handleCheck(record)"
                                  >验收</a-button
                                >
                                <a-button
                                  v-if="record.attachmentFileList && record.attachmentFileList.length > 0"
                                  type="link"
                                  @click="handleDownloadZip(record)"
                                  >下载附件</a-button
                                >
                              </template>
                              <template v-if="column.dataIndex == 'attachmentFile'">
                                <div v-if="record.attachmentFileList && record.attachmentFileList.length > 0">
                                  <div v-for="(filePath, index) in record.attachmentFileList" @click="handlePreview(filePath)" :key="index">
                                    <div class="attachment-btn">
                                      {{ filePath.split('/')[filePath.split('/').length - 1] }}
                                    </div>
                                  </div>
                                </div>
                              </template>
                            </template>
                          </a-table>
                        </a-collapse-panel>
                      </a-collapse>
                      <a-collapse v-model:activeKey="activeKeyPanel2" accordion v-if="searchType === '2'">
                        <a-collapse-panel v-for="(item, index) in dataSource2" :key="index + 1">
                          <template #header>
                            <div class="header-depart">责任单位：{{ item.dutyUnitName }}</div>
                          </template>
                          <div class="detail-desc">
                            工作要求：
                            <span class="content">{{ item.jobRequirement }}</span>
                          </div>
                          <a-table :bordered="true" :dataSource="item.recordList" :columns="columns2" :pagination="false">
                            <template #bodyCell="{ column, text, record }">
                              <template v-if="column.dataIndex === 'checkStatus'">
                                <span v-if="record.checkStatus == '通过'" style="color: #09c199">通过</span>
                                <span v-if="record.checkStatus == '不通过'" style="color: #cd2b1d">不通过</span>
                              </template>
                              <template v-if="column.dataIndex === 'operation'">
                                <a-button type="link" @click="handleHistoryProcess(record)">查看</a-button>
                                <a-button
                                  v-if="activeKey == 1 && record.status == '2' && rightDetail.canCheck"
                                  type="link"
                                  @click="handleCheck(record)"
                                  >验收</a-button
                                >
                                <a-button
                                  v-if="record.attachmentFileList && record.attachmentFileList.length > 0"
                                  type="link"
                                  @click="handleDownloadZip(record)"
                                  >下载附件</a-button
                                >
                              </template>
                              <template v-if="column.dataIndex == 'attachmentFile'">
                                <div v-if="record.attachmentFileList && record.attachmentFileList.length > 0">
                                  <div v-for="(filePath, index) in record.attachmentFileList" @click="handlePreview(filePath)" :key="index">
                                    <p class="attachment-btn">
                                      {{ filePath.split('/')[filePath.split('/').length - 1] }}
                                    </p>
                                  </div>
                                </div>
                              </template>
                            </template>
                          </a-table>
                        </a-collapse-panel>
                      </a-collapse>
                      <a-collapse v-model:activeKey="activeKeyPanel3" accordion v-if="searchType === '3'">
                        <a-collapse-panel v-for="(item, index) in dataSource3" :key="index + 1">
                          <template #header>
                            <div class="detail-desc">
                              工作要求：
                              <span class="content">{{ item.jobRequirement }}</span>
                            </div>
                          </template>
                          <a-table :bordered="true" :dataSource="item.recordList" :columns="columns3" :pagination="false">
                            <template #bodyCell="{ column, text, record }">
                              <template v-if="column.dataIndex === 'checkStatus'">
                                <span v-if="record.checkStatus == '通过'" style="color: #09c199">通过</span>
                                <span v-if="record.checkStatus == '不通过'" style="color: #cd2b1d">不通过</span>
                              </template>
                              <template v-if="column.dataIndex === 'operation'">
                                <a-button type="link" @click="handleHistoryProcess(record)">查看</a-button>
                                <a-button
                                  v-if="activeKey == 1 && record.status == '2' && rightDetail.canCheck"
                                  type="link"
                                  @click="handleCheck(record)"
                                  >验收</a-button
                                >
                                <a-button
                                  v-if="record.attachmentFileList && record.attachmentFileList.length > 0"
                                  type="link"
                                  @click="handleDownloadZip(record)"
                                  >下载附件</a-button
                                >
                              </template>
                              <template v-if="column.dataIndex == 'attachmentFile'">
                                <div v-if="record.attachmentFileList && record.attachmentFileList.length > 0">
                                  <div v-for="(filePath, index) in record.attachmentFileList" @click="handlePreview(filePath)" :key="index">
                                    <p class="attachment-btn">
                                      {{ filePath.split('/')[filePath.split('/').length - 1] }}
                                    </p>
                                  </div>
                                </div>
                              </template>
                            </template>
                          </a-table>
                        </a-collapse-panel>
                      </a-collapse>
                    </div>
                  </a-tab-pane>
                  <a-tab-pane key="2" tab="参与人">
                    <a-button
                      v-if="isShowAddParticipant"
                      type="dashed"
                      style="color: #00bef7; border: 1px solid #00bef7; border-radius: 15px"
                      ghost
                      preIcon="ant-design:user-add-outlined"
                      @click="addParticipant()"
                    >
                      <span>添加参与人</span>
                    </a-button>
                    <div class="participant-list" v-if="participantList.length > 0">
                      <span v-for="(item, index) in participantList" :key="index" class="item-wrap">
                        <span class="participant-item" :class="{ 'green-bg': index % 2 == 0 }">{{ item.realname2.slice(0, 1) }}</span>
                        {{ item.realname }}</span
                      >
                    </div>
                    <div v-else style="margin-top: 24px">暂无参与人</div>
                  </a-tab-pane>
                  <a-tab-pane key="3" tab="评论">
                    <CommentList :dataId="currentId"></CommentList>
                  </a-tab-pane>
                  <a-tab-pane key="4" tab="流程">
                    <div class="step-wrap">
                      <a-steps progress-dot :current="current1">
                        <a-step v-for="(item, index) in process1List" :key="index" :title="item.name" :status="item.status">
                          <template #description>
                            <div>{{ item.time }}</div>
                            <div v-if="(item.statusText == '已完成'||item.statusText == '已关闭')" style="color: #09c199">
                              <div v-if="item.total">汇报进度：{{ item.reportedCount }}/{{ item.total }}</div>
                              <div v-if="item.total">验收进度：{{ item.checkedCount }}/{{ item.total }}</div></div
                            >
                            <div v-if="item.statusText == '进行中'" style="color: #3e87f8">
                              <div v-if="item.total">汇报进度：{{ item.reportedCount }}/{{ item.total }}</div>
                              <div v-if="item.total">验收进度：{{ item.checkedCount }}/{{ item.total }}</div>
                            </div>
                            <div v-if="item.statusText == '验收未通过'" style="color: #cd2b1d">
                              <div v-if="item.total">汇报进度：{{ item.reportedCount }}/{{ item.total }}</div>
                              <div v-if="item.total">验收进度：{{ item.checkedCount }}/{{ item.total }}</div></div
                            >
                          </template>
                        </a-step>
                      </a-steps>
                      <a-divider />
                      <div style="margin-left: 20px">
                        <a-steps progress-dot :current="process2List.length" direction="vertical">
                          <a-step v-for="(item, index) in process2List" :key="index" :title="item.name" :description="item.time" />
                        </a-steps>
                      </div>
                    </div>
                  </a-tab-pane>
                </a-tabs>
              </div>
            </div>
            <a-empty v-else description="暂无数据" style="position: relative; top: 20px" />
          </div>
        </div>
      </div>
    </div>
    <CheckModal @register="registerCheckModal" @success="handleCheckOk" />
    <UserMultipleSelectModal @register="registerCheckUserModal" @success="handleCheckUser" />
    <HistoryProcessModal @register="registerHistoryProcessModal" />
    <ApplyExtensionModal @register="registerExtensionModal" @success="handleApplyExtension" />
    <DelayReviewModal @register="registeDelayReviewModal" @success="delayReviewOK" />
    <CloseTaskModal @register="registerCloseModal" @success="closeTaskSuccess" />
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, h } from 'vue';
import type { Ref } from 'vue';
import JDictSelectTag from '/@/components/Form/src/jeecg/components/JDictSelectTag.vue';
import {
  list,
  getReportInfo1,
  getReportInfo2,
  getReportInfo3,
  getParticipantList,
  getProcess1,
  getProcess2,
  endTask,
  canCheck,
  getTabCount,
  reviewList,
  oneRemind,
  canAddParticipant,
} from './listing.api';
import { useMethods } from '/@/hooks/system/useMethods';
import { Pagination } from 'ant-design-vue';
import { useModal } from '/@/components/Modal';
import CheckModal from './CheckModal.vue';
import UserMultipleSelectModal from '../report/UserMultipleSelectModal.vue';
import CommentList from '/@/components/jeecg/comment/CommentList.vue';
import HistoryProcessModal from '../report/HistoryProcessModal.vue';
import ApplyExtensionModal from '../publish/ApplyExtensionModal.vue';
import DelayReviewModal from './DelayReviewModal.vue';
import { useMessage } from '/@/hooks/web/useMessage';
import { downloadFileAll, previewFile, uploadFile } from '/@/api/common/api';
import { useUserStore } from '/@/store/modules/user';
import { formatToDateTime } from '/@/utils/dateUtil';
import CloseTaskModal from '../publish/CloseTaskModal.vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const { createConfirm, createMessage } = useMessage();
//导入导出方法
const { handleExportXlsx, handleImportXls } = useMethods();
const { userInfo } = useUserStore();
const APagination = Pagination;
const activeKey = ref('1');
const queryParam = reactive({
  taskType: '',
  reportRequire: undefined,
  workContent: '',
  rangeValue: [],
});
const closeReason = ['已完成', '目标变更', '重复任务', '其它原因'];
const placeholder = ['开始日期', '结束日期'];
const current = ref<number>(1);
// const pageSizeOptions = ref<string[]>(['4', '8', '12', '24']);
const pageSizeRef = ref(4);
const total = ref(0);
const loading = ref(false);
const labelCol = reactive({
  xs: { span: 24 },
  sm: { span: 5 },
});
const wrapperCol = reactive({
  xs: { span: 24 },
  sm: { span: 19 },
});
const checked = ref(false);
const listData = ref([{ id: '1' }, { id: '2' }, { id: '3' }, { id: '4' }]);
const currentId = ref('');
const activeKeyDetail = ref('1');
const searchType = ref('1');
const activeKeyPanel1 = ref(['1']);
const activeKeyPanel2 = ref(['1']);
const activeKeyPanel3 = ref(['1']);
const dataSource1 = ref([]);
const dataSource2 = ref([]);
const dataSource3 = ref([]);
const process1List = ref([]);
const process2List = ref([]);
const current1 = ref(0);
const current2 = ref(0);
const isShowAddParticipant = ref(true);

const columns1 = [
  {
    title: '责任单位',
    dataIndex: 'dutyUnitName',
    key: 'dutyUnitName',
    align: 'center',
    width: 150,
  },
  {
    title: '工作要求',
    dataIndex: 'jobRequirement',
    key: 'jobRequirement',
    align: 'center',
    width: 140,
    ellipsis: true,
  },
  {
    title: '完成说明',
    dataIndex: 'finishExplain',
    key: 'finishExplain',
    align: 'center',
    width: 140,
    ellipsis: true,
  },
  {
    title: '附件',
    dataIndex: 'attachmentFile',
    key: 'attachmentFile',
    align: 'center',
    width: 180,
  },
  {
    title: '汇报时间',
    dataIndex: 'reportTime',
    key: 'reportTime',
    align: 'center',
    width: 150,
  },
  {
    title: '验收状态',
    dataIndex: 'checkStatus',
    key: 'checkStatus',
    align: 'center',
    width: 100,
    customRender: ({ text }) => {
      if (!text) {
        return '--';
      } else {
        return text;
      }
    },
  },
  {
    title: '是否延期',
    dataIndex: 'delayStatus',
    key: 'delayStatus',
    align: 'center',
    width: 180,
    customRender: ({ text, record }) => {
      // 延期状态（1审核中 2通过 3拒绝）
      if (text == 1) {
        return h('span', { style: 'color: #3e87f8' }, '审核中');
      } else if (text == 2) {
        return h('span', { style: 'color: #09c199' }, `延期至${record.delayTime}`);
      } else if (text == 3) {
        return h('span', { style: 'color: #3e87f8' }, '拒绝');
      }
    },
  },
  {
    title: '操作',
    dataIndex: 'operation',
    align: 'center',
    width: 100,
  },
];
const columns2 = [
  {
    title: '汇报周期',
    dataIndex: 'reportCycle',
    key: 'reportCycle',
    align: 'center',
    width: 140,
  },
  {
    title: '汇报时间',
    dataIndex: 'reportTime',
    key: 'reportTime',
    align: 'center',
    width: 150,
  },
  {
    title: '完成说明',
    dataIndex: 'finishExplain',
    key: 'finishExplain',
    align: 'center',
    width: 140,
    ellipsis: true,
  },
  {
    title: '附件',
    dataIndex: 'attachmentFile',
    key: 'attachmentFile',
    align: 'center',
    width: 180,
  },
  {
    title: '验收状态',
    dataIndex: 'checkStatus',
    key: 'checkStatus',
    align: 'center',
    width: 100,
  },
  {
    title: '是否延期',
    dataIndex: 'delayStatus',
    key: 'delayStatus',
    align: 'center',
    width: 180,
    customRender: ({ text, record }) => {
      // 延期状态（1审核中 2通过 3拒绝）
      if (text == 1) {
        return h('span', { style: 'color: #3e87f8' }, '审核中');
      } else if (text == 2) {
        return h('span', { style: 'color: #09c199' }, `延期至${record.delayTime}`);
      } else if (text == 3) {
        return h('span', { style: 'color: #3e87f8' }, '拒绝');
      }
    },
  },
  {
    title: '操作',
    dataIndex: 'operation',
    align: 'center',
    width: 100,
  },
];

const columns3 = [
  {
    title: '责任单位',
    dataIndex: 'dutyUnitName',
    key: 'dutyUnitName',
    align: 'center',
    width: 150,
  },
  {
    title: '汇报周期',
    dataIndex: 'reportCycle',
    key: 'reportCycle',
    align: 'center',
    width: 140,
  },
  {
    title: '汇报时间',
    dataIndex: 'reportTime',
    key: 'reportTime',
    align: 'center',
    width: 150,
  },
  {
    title: '完成说明',
    dataIndex: 'finishExplain',
    key: 'finishExplain',
    align: 'center',
    width: 140,
    ellipsis: true,
  },
  {
    title: '附件',
    dataIndex: 'attachmentFile',
    key: 'attachmentFile',
    align: 'center',
    width: 180,
  },
  {
    title: '验收状态',
    dataIndex: 'checkStatus',
    key: 'checkStatus',
    align: 'center',
    width: 100,
  },
  {
    title: '是否延期',
    dataIndex: 'delayStatus',
    key: 'delayStatus',
    align: 'center',
    width: 180,
    customRender: ({ text, record }) => {
      // 延期状态（1审核中 2通过 3拒绝）
      if (text == 1) {
        return h('span', { style: 'color: #3e87f8' }, '审核中');
      } else if (text == 2) {
        return h('span', { style: 'color: #09c199' }, `延期至${record.delayTime}`);
      } else if (text == 3) {
        return h('span', { style: 'color: #3e87f8' }, '拒绝');
      }
    },
  },
  {
    title: '操作',
    dataIndex: 'operation',
    align: 'center',
    width: 100,
  },
];
const participantList = ref([]);
const rightDetail: Ref<any> = ref({});
const count = ref({});
const reviewListCount = ref(0);
const totalCheck = ref(0);

const [registerCheckUserModal, { openModal: openCheckUserModal }] = useModal();
const [registerCheckModal, { openModal: openCheckModal }] = useModal();
const [registerHistoryProcessModal, { openModal: openHistoryProcessModal }] = useModal();
const [registerExtensionModal, { openModal: openExtensionModal }] = useModal();
const [registeDelayReviewModal, { openModal: openDelayReviewModal }] = useModal();
const [registerCloseModal, { openModal: openCloseModal }] = useModal();
// 验收成功-更改状态-停留在当前页
async function handleCheckOk(val: any) {
  console.log('handleCheckOk val', val);
  // {id: 'b44c53da4ce0864df2e60ba883837661', checkExplain: 'dddd', opinion: 'disagree'}
  if (val.opinion == 'disagree') {
    //更新此id的验收状态
    if (searchType.value == '1') {
      dataSource1.value.forEach((item) => {
        item.recordList.forEach((record) => {
          if (record.id == val.id) {
            record.checkStatus = '不通过';
            record.status = '3';
          }
        });
      });
    } else if (searchType.value == '2') {
      dataSource2.value.forEach((item) => {
        item.recordList.forEach((record) => {
          if (record.id == val.id) {
            record.checkStatus = '不通过';
            record.status = '3';
          }
        });
      });
    } else if (searchType.value == '3') {
      dataSource3.value.forEach((item) => {
        item.recordList.forEach((record) => {
          if (record.id == val.id) {
            record.checkStatus = '不通过';
            record.status = '3';
          }
        });
      });
    }
  } else {
    //更新此id的验收状态
    if (searchType.value == '1') {
      dataSource1.value.forEach((item) => {
        item.recordList.forEach((record) => {
          if (record.id == val.id) {
            record.checkStatus = '通过';
            record.status = '4';
          }
        });
      });
    } else if (searchType.value == '2') {
      dataSource2.value.forEach((item) => {
        item.recordList.forEach((record) => {
          if (record.id == val.id) {
            record.checkStatus = '通过';
            record.status = '4';
          }
        });
      });
    } else if (searchType.value == '3') {
      dataSource3.value.forEach((item) => {
        item.recordList.forEach((record) => {
          if (record.id == val.id) {
            record.checkStatus = '通过';
            record.status = '4';
          }
        });
      });
    }
  }
}
// 选择用户
function handleCheckUser(val: any) {
  console.log('handleCheckUser', val);
  handleParticipantList();
  handleTabCount();
}
// 判断当前登陆人能否添加参与人
function getCanAddParticipant() {
  // 发起请求
  canAddParticipant({ publishId: currentId.value }).then((res) => {
    console.log('canAddParticipant', res);
    isShowAddParticipant.value = res;
  });
}
// 延期成功
function handleApplyExtension(val: any) {
  console.log('handleApplyExtension', val);
  rightDetail.value.completeTimeLimit = val.completeTimeLimit;
}
// 导出
function handleTaskExportXls() {
  let title = '任务完成情况' + formatToDateTime(new Date());
  let url = '/taskManagement/publishList/exportXls';
  return handleExportXlsx(title as string, url, { id: currentId.value });
}
function onChangeCheck() {
  console.log('checked', checked.value);
  if (checked.value) {
    queryParam['onlyCheck'] = '1';
    loadData(1);
  } else {
    queryParam['onlyCheck'] = '0';
    loadData(1);
  }
}
// 预览
function handlePreview(filePath) {
  if (filePath) {
    previewFile(filePath).then((res) => {
      window.open(res, '_blank');
    });
  }
}
// 申请延期
function handleExtension(record: any) {
  openExtensionModal(true, {
    isUpdate: false,
    record: record,
  });
}
// 延期申请·待审核
function handleDelayReview() {
  console.log('handleDelayReview rightDetail', rightDetail.value);
  openDelayReviewModal(true, {
    isUpdate: true,
    record: rightDetail.value,
  });
}
// 延期申请·待审核-成功
function delayReviewOK() {
  loadData(1);
}
// 关闭
function handleClose(record: any) {
  console.log('handleEnd', record);
  openCloseModal(true, {
    isUpdate: false,
    record: record,
  });
}
// onCreated
if (route.query && route.query.hasOwnProperty('workContent')) {
  queryParam.workContent = route.query.workContent;
  queryParam.completeTimeLimit_begin = route.query.completeTimeLimit;
  queryParam.completeTimeLimit_end = route.query.completeTimeLimit;
  queryParam.rangeValue = [route.query.completeTimeLimit, route.query.completeTimeLimit];
}
loadData(1);
handleTabCount();
// 获取tab数量
function handleTabCount() {
  getTabCount({}).then((res) => {
    console.log('res', res);
    count.value = res;
  });
}
// 搜索
function searchQuery() {
  loadData(1);
}
function searchReset() {
  queryParam['taskType'] = '';
  queryParam['reportRequire'] = undefined;
  queryParam['workContent'] = '';
  queryParam['rangeValue'] = [];
  queryParam['completeTimeLimit_begin'] = '';
  queryParam['completeTimeLimit_end'] = '';
  loadData(1);
}
async function loadData(arg) {
  if (arg === 1) {
    current.value = 1;
  }
  loading.value = true;
  console.log('loadData', queryParam);
  let param = Object.assign({}, queryParam);
  param['pageNo'] = current.value;
  param['pageSize'] = pageSizeRef.value;
  param['type'] = activeKey.value;
  console.log('param', param);
  await list(param).then((res) => {
    console.log('res', res);
    listData.value = res.records;
    total.value = res.total;
    loading.value = false;
    if (res.records.length > 0) {
      currentId.value = res.records[0].id;
      rightDetail.value = res.records[0];
      if (res.records[0].attachment) {
        res.records[0].attachmentFileList = res.records[0].attachment.split(',');
      }
      // 按汇报周期
      handleReportInfo1(currentId.value);
      // 按责任单位
      handleReportInfo2(currentId.value);
      // 按工作要求
      handleReportInfo3(currentId.value);
      getCanCheck(currentId.value);
      getReviewList(currentId.value);
    } else {
      rightDetail.value = {};
      currentId.value = '';
      dataSource1.value = [];
      dataSource2.value = [];
      dataSource3.value = [];
    }
  });
  await getToCheckCount();
}
// 获取待验收的总数
async function getToCheckCount() {
  let param = Object.assign({}, queryParam);
  param['pageNo'] = 1;
  param['pageSize'] = 9999;
  param['type'] = 1;
  param['onlyCheck'] = '1';
  console.log('param', param);
  await list(param).then((res) => {
    console.log('res', res);
    totalCheck.value = res.total;
  });
}
// 获取延期申请列表
function getReviewList(id) {
  let params = {
    publishId: id,
  };
  // 请求接口逻辑
  reviewList(params).then((res) => {
    console.log('reviewList', res);
    if (res && res.length > 0) {
      reviewListCount.value = res.length;
    } else {
      reviewListCount.value = 0;
    }
    rightDetail.value['reviewList'] = res;
  });
}
// 查看历史信息
function handleHistoryProcess(record) {
  console.log('handleHistoryProcess');
  openHistoryProcessModal(true, {
    record: record,
  });
}
// 按汇报周期
function handleReportInfo1(publishId) {
  console.log('handleReportInfo1');
  getReportInfo1({ id: publishId }).then((res) => {
    console.log('getReportInfo1', res);
    res.map((item) => {
      if (item.recordList && item.recordList.length > 0) {
        item.recordList.map((item1) => {
          if (item1.attachmentFile) {
            item1.attachmentFileList = item1.attachmentFile.split(',');
          }
        });
      }
    });

    dataSource1.value = res;
    console.log('dataSource1', dataSource1.value);
  });
}

// 按责任单位
function handleReportInfo2(publishId) {
  console.log('handleReportInfo2');
  getReportInfo2({ id: publishId }).then((res) => {
    console.log('getReportInfo2', res);
    res.map((item) => {
      if (item.recordList && item.recordList.length > 0) {
        item.recordList.map((item1) => {
          if (item1.attachmentFile) {
            item1.attachmentFileList = item1.attachmentFile.split(',');
          }
        });
      }
    });
    dataSource2.value = res;
  });
}
// 按工作要求
function handleReportInfo3(publishId) {
  console.log('handleReportInfo3');
  getReportInfo3({ id: publishId }).then((res) => {
    console.log('getReportInfo3', res);
    res.map((item) => {
      if (item.recordList && item.recordList.length > 0) {
        item.recordList.map((item1) => {
          if (item1.attachmentFile) {
            item1.attachmentFileList = item1.attachmentFile.split(',');
          }
        });
      }
    });
    dataSource3.value = res;
  });
}
// 获取参与人列表
function handleParticipantList() {
  getParticipantList({ publishId: currentId.value }).then((res) => {
    console.log('getParticipantList', res);
    participantList.value = res;
  });
}
// 添加参与人
function addParticipant() {
  openCheckUserModal(true, {
    publishId: currentId.value,
    participantList: participantList.value,
  });
}
// 获取横向周期流程
function handleProcess1(publishId) {
  console.log('handleProcess1');
  getProcess1({ publishId: publishId }).then((res) => {
    console.log('getProcess1', res);
    res.map((item, index) => {
      if (item.status == '已完成') {
        item.statusText = '已完成';
        item.status = 'finish';
      } else if (item.status == '已关闭') {
        item.statusText = '已关闭';
        item.status = 'finish';
      } else if (item.status == '进行中') {
        item.statusText = '进行中';
        item.status = 'process';
      } else if (item.status == '验收未通过') {
        item.statusText = '验收未通过';
        item.status = 'error';
      }
      if (item.name == '当前节点') {
        current1.value = index;
      }
    });
    process1List.value = res;
  });
}
// 获取纵向时间轴
function handleProcess2(publishId) {
  console.log('handleProcess2');
  getProcess2({ publishId: publishId }).then((res) => {
    console.log('getProcess2', res);
    process2List.value = res;
  });
}
function getRightDetail(record) {
  activeKeyDetail.value = '1';
  activeKeyPanel1.value = ['1'];
  activeKeyPanel2.value = ['1'];
  activeKeyPanel3.value = ['1'];
  console.log('getRightDetail');
  currentId.value = record.id;
  if (record.attachment) {
    record.attachmentFileList = record.attachment.split(',');
  }
  rightDetail.value = record;
  // 按汇报周期
  handleReportInfo1(currentId.value);
  // 按责任单位
  handleReportInfo2(currentId.value);
  // 按工作要求
  handleReportInfo3(currentId.value);
  getCanCheck(currentId.value);
  getReviewList(currentId.value);
}
// 判断能否验收
function getCanCheck(currentId) {
  console.log('canCheck', currentId);
  canCheck({ publishId: currentId }).then((res) => {
    console.log('canCheck', res);
    if (res) {
      rightDetail.value['canCheck'] = res.canCheck;
    }
  });
}
function handleTab(key) {
  activeKey.value = key;
  activeKeyDetail.value = '1';
  loadData(1);
}
function handleTimeChange(arr) {
  console.log('handleTimeChange', arr);
  if (arr) {
    queryParam['completeTimeLimit_begin'] = arr[0];
    queryParam['completeTimeLimit_end'] = arr[1];
  } else {
    queryParam['completeTimeLimit_begin'] = '';
    queryParam['completeTimeLimit_end'] = '';
  }
}
const onShowSizeChange = (current: number, pageSize: number) => {
  console.log(current, pageSize);
  pageSizeRef.value = pageSize;
  loadData(1);
};
const onChange = (pageNumber: number) => {
  console.log('Page: ', pageNumber);
  current.value = pageNumber;
  loadData(0);
};
const handleDetailTab = (key) => {
  activeKeyDetail.value = key;
  if (key == 2) {
    getCanAddParticipant();
    handleParticipantList();
  }
  if (key == 4) {
    // 获取横向周期流程
    handleProcess1(currentId.value);
    // 获取纵向时间轴
    handleProcess2(currentId.value);
  }
};
const handleSearchTypeChange = (value) => {
  searchType.value = value;
  activeKeyPanel1.value = ['1'];
  activeKeyPanel2.value = ['1'];
  activeKeyPanel3.value = ['1'];
};
function handleCheck(record) {
  console.log('handleCheck', record);
  // 将id存入到本地缓存
  localStorage.setItem('currentId', currentId.value);
  localStorage.setItem('currentPage', JSON.stringify(current.value));
  openCheckModal(true, {
    record,
  });
}
// 一键提醒
function handleOneRemind(record) {
  console.log('handleOneRemind', record);
  // 请求接口
  createConfirm({
    iconType: 'warning',
    title: '一键提醒',
    content: '确定要一键提醒吗？',
    onOk: () => {
      // 调用接口
      let params = {
        publishId: rightDetail.value.id,
        reportCycle: record.reportCycle,
      };
      oneRemind(params)
        .then((res) => {
          createMessage.success('提醒已发送');
          activeKeyPanel1.value = ['1'];
        })
        .catch((err) => {
          console.log('OneRemind', err);
          let errbak = JSON.stringify(err);
          saveTextAsFile(errbak, 'error.txt');
        });
    },
    onCancel() {},
  });
}
function saveTextAsFile(text, filename) {
  const blob = new Blob([text], { type: 'text/plain' });
  // const url = URL.createObjectURL(blob);
  console.log('=====blob=====', blob);
  let file = new File([blob], filename, { type: 'text/plain' });
  console.log('=====file=====', file);
  let params = {
    file: file,
    data: { biz: 'error' },
  };
  // let formData = new FormData()
  // formData.append('file', file)
  // formData.append('biz', 'error')
  // console.log('=====formData=====', formData)
  uploadFile(params, (res) => {
    if (res.success) {
      console.log('111111', res);
    }
  });
}
// 关闭任务成功
function closeTaskSuccess() {
  loadData(1);
}
// 打包下载
function handleDownloadZip(record) {
  console.log('handleDownloadZip');
  let param = {};
  param['recordId'] = record.id;
  downloadFileAll('/taskManagement/publishList/downloadFile', '任务列表附件.zip', param);
}
</script>

<style lang="less" scoped>
.others-wrap {
  margin: 24px 0;
  padding: 24px;
  //   height: 479px;
  background: #ffffff;
  .tab-search {
    position: relative;
  }
  .search-time {
    position: absolute;
    top: 0;
    right: 0;
  }
}
.jeecg-basic-table-form-container {
  .table-page-search-submitButtons {
    display: block;
    margin-bottom: 24px;
    white-space: nowrap;
  }
}
.page-wrap {
  float: right;
  margin: 20px 10px;
}
.only-check {
  margin: 12px;
}
.content-wrap {
  display: flex;
}
.fr-detail {
  width: 100%;
  height: 100%;
  background: #ffffff;
  padding: 24px;
  .action-btns {
    margin-bottom: 24px;
  }
  .task-detail {
    position: relative;
    width: 100%;
    // height: 220px;
    border: 1px solid rgba(0, 0, 0, 0.16);
    padding: 24px;
    padding-bottom: 60px;
    overflow: hidden;
    .detail-content {
      clear: both;
      .label-fl {
        width: 64px;
        height: 21px;
        display: inline-block;
        background: rgba(62, 135, 248, 0.15);
        border-radius: 2px 2px 2px 2px;
        font-size: 13px;
        text-align: center;
        font-family: PingFang SC-Regular, PingFang SC;
        font-weight: 400;
        color: #3e87f8;
        padding: 2px 6px;
        vertical-align: initial;
      }
      .label-fr {
        float: right;
        .label-1 {
          height: 21px;
          display: inline-block;
          background: rgba(9, 193, 153, 0.15);
          border-radius: 2px 2px 2px 2px;
          font-size: 13px;
          font-family: PingFang SC-Regular, PingFang SC;
          font-weight: 400;
          color: #09c199;
          padding: 2px 6px;
          vertical-align: initial;
          margin-left: 8px;
          text-align: center;
        }
        .label-2 {
          background: rgba(0, 190, 247, 0.15);
          color: #00bef7;
        }
        .label-date {
          display: inline-block;
          margin-left: 8px;
        }
        .item-date {
          margin-right: 8px;
        }
        .item-process {
          display: inline-block;
          width: 88px;
          padding-right: 4px;
        }
      }
    }
    .detail-desc {
      margin: 15px 0;
      font-size: 16px;
      font-family: Source Han Sans CN-Regular, Source Han Sans CN;
      font-weight: 400;
      color: #000000;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2; /* 限制在三行 */
      -webkit-box-orient: vertical;
    }
    .info-4 {
      clear: both;
      font-size: 14px;
      color: rgba(0, 0, 0, 0.6);
      margin-top: 20px;
      .info-4-fl {
        float: left;
        overflow: hidden;
      }
      .info-4-fr {
        float: right;
        line-height: 15px;
      }
    }
    .tab-2-show {
      position: absolute;
      bottom: 8px;
      left: 22px;
      div {
        font-size: 14px;
        color: rgba(0, 0, 0, 0.6);
      }
    }
  }
  .detail-tab-search {
    margin-top: 24px;
    .search-wrap {
    }
    .search-num {
      display: inline-block;
      margin-left: 15px;
      width: 186px;
      height: 32px;
      line-height: 32px;
      border-radius: 4px;
      border: 1px solid #ff8d04;
      text-align: center;
      font-size: 16px;
      color: #ff8d04;
      vertical-align: middle;
      cursor: pointer;
    }
    .search-num-1 {
      cursor: null;
    }

    .data-list {
      margin-top: 24px;
      .header-date {
        color: rgba(0, 0, 0, 0.65);
        font-size: 16px;
        margin-right: 15px;
        margin-top: 4px;
      }

      .header-depart {
        font-size: 16px;
      }
      .detail-desc {
        margin: 15px 0;
        font-size: 16px;
        font-family: Source Han Sans CN-Regular, Source Han Sans CN;
        font-weight: 400;
        color: #000000;
        .content {
          color: rgba(0, 0, 0, 0.65);
        }
      }
    }
  }
}
.header-percent {
  display: inline-block;
  margin-left: 15px;
  color: rgba(0, 0, 0, 0.6);
  font-size: 14px;
  margin-right: 15px;
  margin-top: 5px;
}
.header-btn {
  display: inline-block;
  width: 80px;
  height: 32px;
  line-height: 32px;
  border-radius: 4px;
  border: 1px solid #3e87f8;
  text-align: center;
  color: #3e87f8;
  cursor: pointer;
}
.fl-list {
  margin-top: 15px;
  width: 404px;
  height: auto;
  clear: both;
  background: #f7f9fc;
}
.item-active {
  border: 2px solid #00bef7 !important;
}
.fl-list-1 {
  width: 100%;
  //   height: 249px;
  border-radius: 0px 2px 2px 0px;
  margin: 20px auto;
  .item-wrap {
    position: relative;
    width: 372px;
    height: 221px;
    margin: 12px;
    background: #ffffff;
    border-radius: 4px;
    padding: 24px;
    cursor: pointer;
    border: 2px solid transparent;
    .task-finished-icon {
      position: absolute;
      top: 0;
      right: 0;
      img {
        width: 48px;
        height: 48px;
      }
    }
    .task-finished-tag {
      position: absolute;
      top: 24px;
      right: 24px;
      height: 21px;
      display: inline-block;
      background: rgba(255, 141, 4, 0.15);
      color: #ff8d04;
      border-radius: 2px 2px 2px 2px;
      font-size: 13px;
      font-family: PingFang SC-Regular, PingFang SC;
      padding: 2px 6px;
      vertical-align: initial;
      margin-left: 8px;
      text-align: center;
    }
    .task-finished-tag-2 {
      color: #cd2b1d;
      background: rgba(255, 141, 4, 0.15);
    }
    .task-finished-tag-1 {
      background: rgba(9, 193, 153, 0.15);
      color: #09c199;
    }
    .task-finished-tag-3 {
      background: rgba(0, 0, 0, 0.05);
      color: #999;
    }
    .label-wrap {
      position: relative;
      .item-status {
        position: absolute;
        right: 0;
        top: 0;
        span {
          // width: 64px;
          height: 21px;
          display: inline-block;
          background: rgba(205, 43, 29, 0.15);
          border-radius: 2px 2px 2px 2px;
          font-size: 13px;
          font-family: PingFang SC-Regular, PingFang SC;
          font-weight: 400;
          color: #cd2b1d;
          padding: 2px 6px;
          text-align: center;
          vertical-align: initial;
        }
      }

      .item-label {
        width: 64px;
        height: 21px;
        display: inline-block;
        background: rgba(62, 135, 248, 0.15);
        border-radius: 2px 2px 2px 2px;
        font-size: 13px;
        text-align: center;
        font-family: PingFang SC-Regular, PingFang SC;
        font-weight: 400;
        color: #3e87f8;
        padding: 2px 6px;
        vertical-align: initial;
      }
      .item-label-1 {
        width: 64px;
        height: 21px;
        display: inline-block;
        background: rgba(9, 193, 153, 0.15);
        border-radius: 2px 2px 2px 2px;
        font-size: 13px;
        font-family: PingFang SC-Regular, PingFang SC;
        font-weight: 400;
        color: #09c199;
        padding: 2px 6px;
        vertical-align: initial;
        margin-left: 8px;
        text-align: center;
      }
    }
    .item-content {
      height: 52px;
      margin: 15px 0;
      font-size: 16px;
      font-family: Source Han Sans CN-Regular, Source Han Sans CN;
      font-weight: 400;
      color: #000000;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2; /* 限制在三行 */
      -webkit-box-orient: vertical;
    }
    .dash-line {
      width: 100%;
      height: 1px;
      border: 1px dashed #e8e8e8;
      margin-bottom: 15px;
    }
    .date-wrap {
      font-size: 14px;
      color: rgba(0, 0, 0, 0.38);
      .date-1 {
        margin-bottom: 5px;
      }
      .item-date {
        margin-right: 8px;
      }
      .item-process {
        display: inline-block;
        width: 88px;
        padding-right: 4px;
      }
    }
  }
}
.participant-list {
  margin: 24px 0;
  .item-wrap {
    display: inline-block;
    margin-right: 15px;
  }
  .participant-item {
    display: inline-block;
    margin-bottom: 10px;
    padding: 0 10px;
    height: 32px;
    line-height: 32px;
    background: rgba(0, 190, 247);
    border-radius: 16px;
    color: #fff;
    font-size: 13px;
    text-align: center;
  }
  .green-bg {
    background: rgba(9, 193, 153);
  }
}
.attachment-btn {
  color: #1890ff;
  cursor: pointer;
  white-space: normal;
}
.step-wrap {
  // padding: 20px;
}
:deep(.ant-steps-horizontal) {
  overflow-x: auto;
  padding: 20px 0;
  width: 1180px;
}
/* 滚动条 */
::-webkit-scrollbar {
  width: 3px;
  height: 3px;
}
/* 滚动条轨道 */
::-webkit-scrollbar-track {
  background-color: #f0f0f0;
}
/* 滚动条滑块 */
::-webkit-scrollbar-thumb {
  background-color: #e4e0e0;
}
/* 滚动条滑块在鼠标移上时 */
::-webkit-scrollbar-thumb:hover {
  background-color: #aaa;
}
</style>
