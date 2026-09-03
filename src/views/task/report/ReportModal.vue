<template>
  <BasicDrawer v-bind="$attrs" @register="registerDrawer" :showFooter="false" width="1100px" @close="onClose">
    <template #title> <img class="report-add" src="../../../assets/images/task/report-add.png" alt="" />任务汇报 </template>
    <!-- 任务发布信息 -->
    <div class="publish-info">
      <div class="info-1">
        <div class="info-1-fl">
          <span v-if="detailTask.taskType == 1">填报任务</span>
          <span v-if="detailTask.taskType == 2">检查任务</span>
        </div>
        <div class="info-1-fr">
          <span class="fr-1">
            <span v-if="detailTask.reportRequire == 1">长期</span>
            <span v-if="detailTask.reportRequire == 2">日常</span>
          </span>
          <span v-if="detailTask.reportRequire == 1" class="fr-2">{{ detailTask.reportWay_dictText }} {{ detailTask.reportTime }}</span>
          <span v-if="detailTask.reportRequire == 2 && detailTask.reportCycle" class="fr-2">{{ detailTask.reportCycle.slice(0, 10) }}</span>
          <span>完成时限：{{ detailTask.completeTimeLimit }}</span>
        </div>
      </div>
      <div class="info-2">
        {{ detailTask.workContent }}
      </div>
      <div class="info-3" v-if="reportType == 'wait'"> 工作要求：{{ reportData.jobRequirement }} </div>
      <div class="info-3" v-else> 工作要求：{{ jobRequirement }} </div>
      <div class="info-4">
        <div class="info-4-fl">
          <p v-if="detailTask.checkPeopleName">验收人：{{ detailTask.checkPeopleName }}</p>
          <p v-if="detailTask.attachment"
            >附件：<a-button style="display: inline-block" type="primary" ghost shape="round" size="small" @click="handleDownloadZip(detailTask)">
              <span>下载附件</span> <download-outlined
            /></a-button>
            <span style="display: block; margin: 6px 0 0 20px">
              <a-button type="link" v-for="(item, index) in detailTask.attachmentList" :key="index" @click="handlePreviewFile(item)">{{
                item.split('/')[item.split('/').length - 1]
              }}</a-button>
            </span>
          </p>
        </div>
        <div class="info-4-fr">
          <p>发布单位：{{ detailTask.publishOrgName }}</p>
          <p>发布时间：{{ detailTask.publishTime }}</p>
        </div>
      </div>
    </div>
    <!-- 任务汇报 -->
    <div class="report-info" v-if="canReport">
      <div class="info-1">
        <div style="margin-bottom: 20px" v-if="reportData.tag == '验收未通过'">
          <div>验收结果：<span style="color: #cd2b1d">不通过</span></div>
          <div v-if="reportData.checkExplain">验收说明：{{ reportData.checkExplain }}</div>
        </div>
        <div class="info-1-fl">
          汇报周期：{{ reportData.reportCycle }} <span v-if="reportData.tag && reportData.tag == '即将到期'" class="dot"></span
          ><span v-if="reportData.tag && reportData.tag == '即将到期'" class="status">{{ reportData.tag }}</span>
          <span v-if="reportData.tag && (reportData.tag == '验收未通过' || reportData.tag == '逾期未汇报')" class="dot dot-red"></span
          ><span v-if="reportData.tag && (reportData.tag == '验收未通过' || reportData.tag == '逾期未汇报')" class="status status-red">{{
            reportData.tag
          }}</span>
        </div>
        <div class="info-1-fr">
          <span class="fr-1" @click="handleApplyExtension">申请延期</span>
        </div>
      </div>
      <div class="form-wrap">
        <BasicForm @register="registerForm"> </BasicForm>
        <a-button v-if="reportData.tag == '验收未通过'" class="report-btn" type="primary" @click="handleSubmit">重新提交</a-button>
        <a-button v-else class="report-btn" type="primary" @click="handleSubmit">提交汇报</a-button>
      </div>
    </div>
    <!-- 历史汇报 -->
    <div class="split"></div>
    <!-- Tab部分 -->
    <div>
      <a-tabs v-model:activeKey="activeKey" @change="tabChange" :destroyInactiveTabPane="true">
        <a-tab-pane key="1" :tab="title1">
          <div v-if="listKey !== '3'">
            <a-timeline style="margin-top: 24px">
              <a-timeline-item v-for="item in historyReport" :key="item.id">
                <div class="his-detail">
                  <a-button class="more-btn" type="link" @click="handleHistoryProcess(item)">更多信息</a-button>
                  <div class="his-time">汇报周期</div>
                  <div class="his-content">
                    <p
                      >{{ item.reportCycle }}
                      <span v-if="item.tag == '逾期未汇报'" style="display: inline-block; margin-left: 10px; color: #cd2b1d">{{ item.tag }}</span>
                      <span v-if="item.tag == '即将到期'" style="display: inline-block; margin-left: 10px; color: #ff8d04">{{ item.tag }}</span>
                      <span v-if="item.tag == '验收未通过'" style="display: inline-block; margin-left: 10px; color: #cd2b1d">{{ item.tag }}</span>
                      <span v-if="!item.tag && item.overtimeFlag" style="display: inline-block; margin-left: 10px; color: #cd2b1d">{{
                        item.overtimeFlag
                      }}</span>
                    </p>
                    <a-button
                      style="margin-left: -16px"
                      v-if="item.tag == '逾期未汇报' && item.status == 1 && item.reportCycle !== reportData.reportCycle"
                      type="link"
                      @click="handleMissedReport(item)"
                      >补交汇报</a-button
                    >
                    <a-button
                      style="margin-left: -16px"
                      v-if="item.tag == '验收未通过' && item.status == 3"
                      type="link"
                      @click="handleMissedReport(item)"
                      >重新提交</a-button
                    >
                    <p>汇报时间：{{ item.reportTime }}</p>
                    <div class="history-explain">
                      <div class="explain-label">完成说明： </div> <div class="explain-text">{{ item.finishExplain }}</div>
                    </div>
                    <div style="display: flex; margin-top: 20px" v-if="item.attachmentImgList && item.attachmentImgList.length > 0">
                      <div style="width: 70px; text-align: right">图片：</div>
                      <div>
                        <a-upload
                          list-type="picture-card"
                          v-model:file-list="item.attachmentImgList"
                          :max-count="10"
                          @preview="handlePreview"
                          :disabled="true"
                        >
                        </a-upload>
                        <a-modal :visible="previewVisible" :footer="null" @cancel="handleCancel(item)">
                          <img alt="example" style="width: 100%" :src="previewImage" /> </a-modal
                      ></div>
                    </div>
                    <div v-if="item.attachmentFileList && item.attachmentFileList.length > 0">
                      <div class="work-item">
                        <span class="label">附件：</span>
                        <div class="content">
                          <!-- <div v-for="(filePath, index) in item.attachmentFileList" @click="handlePreviewFile(filePath)" :key="index">
                            <span class="attachment-btn">
                              {{ filePath.split('/')[filePath.split('/').length - 1] }}
                            </span>
                          </div> -->
                          <div v-for="(filePath, index) in item.attachmentFileList" :key="index">
                            <a :href="filePath" download> {{ filePath.split('/')[filePath.split('/').length - 1] }}</a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </a-timeline-item>
            </a-timeline>
          </div>
          <!-- 我参与的 -->
          <div v-else>
            <div class="search-wrap">
              <a-select v-model:value="searchType" style="width: 120px" @change="handleSearchTypeChange">
                <a-select-option value="1">按汇报周期</a-select-option>
                <a-select-option value="2">按责任单位</a-select-option>
                <a-select-option value="3">按工作要求</a-select-option>
              </a-select>
              <!-- <span class="search-num">延期申请·待审核(2)</span> -->
            </div>
            <div class="data-list">
              <a-collapse v-model:activeKey="activeKeyPanel1" v-if="searchType == '1'">
                <a-collapse-panel v-for="(item, index) in dataSource1" :key="index + 1">
                  <template #header>
                    <span class="header-date">汇报周期：{{ item.reportCycle }}</span>
                    <!-- <span class="header-percent">汇报完成：2/3</span>
                          <span class="header-btn">一键提醒</span> -->
                  </template>
                  <a-table :bordered="true" :dataSource="item.recordList" :columns="columns1" :pagination="false">
                    <template #bodyCell="{ column, text, record }">
                      <template v-if="column.dataIndex === 'operation'">
                        <a-button type="link" @click="handleHistoryProcess(record)">查看</a-button>
                        <!-- <a-button type="link" @click="handleCheck(record)">验收</a-button> -->
                      </template>
                      <template v-if="column.dataIndex === 'attachmentFile'">
                        <span class="attachment-btn" v-if="record.attachmentFile" @click="handlePreviewFile(record.attachmentFile)">{{
                          record.attachmentFile.split('/')[record.attachmentFile.split('/').length - 1]
                        }}</span>
                      </template>
                    </template>
                  </a-table>
                </a-collapse-panel>
              </a-collapse>
              <a-collapse v-model:activeKey="activeKeyPanel2" v-if="searchType === '2'">
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
                      <template v-if="column.dataIndex === 'operation'">
                        <a-button type="link" @click="handleHistoryProcess(record)">查看</a-button>
                        <!-- <a-button type="link" @click="handleCheck(record)">验收</a-button> -->
                      </template>
                      <template v-if="column.dataIndex === 'attachmentFile'">
                        <span class="attachment-btn" v-if="record.attachmentFile" @click="handlePreviewFile(record.attachmentFile)">{{
                          record.attachmentFile.split('/')[record.attachmentFile.split('/').length - 1]
                        }}</span>
                      </template>
                    </template>
                  </a-table>
                </a-collapse-panel>
              </a-collapse>
              <a-collapse v-model:activeKey="activeKeyPanel3" v-if="searchType === '3'">
                <a-collapse-panel v-for="(item, index) in dataSource3" :key="index + 1">
                  <template #header>
                    <div class="detail-desc">
                      工作要求：
                      <span class="content">{{ item.jobRequirement }}</span>
                    </div>
                  </template>
                  <a-table :bordered="true" :dataSource="item.recordList" :columns="columns3" :pagination="false">
                    <template #bodyCell="{ column, text, record }">
                      <template v-if="column.dataIndex === 'operation'">
                        <a-button type="link" @click="handleHistoryProcess(record)">查看</a-button>
                        <!-- <a-button type="link" @click="handleCheck(record)">验收</a-button> -->
                      </template>
                      <template v-if="column.dataIndex === 'attachmentFile'">
                        <span class="attachment-btn" v-if="record.attachmentFile" @click="handlePreviewFile(record.attachmentFile)">{{
                          record.attachmentFile.split('/')[record.attachmentFile.split('/').length - 1]
                        }}</span>
                      </template>
                    </template>
                  </a-table>
                </a-collapse-panel>
              </a-collapse>
            </div>
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
              <span class="participant-item" :class="{ 'green-bg': index % 2 == 0 }">{{ item.realname.split('-')[1].slice(0, 1) }}</span>
              {{ item.realname }}</span
            >
          </div>
          <div v-else style="margin-top: 24px">暂无参与人</div>
        </a-tab-pane>
        <a-tab-pane key="3" tab="评论">
          <CommentList :dataId="publishId"></CommentList>
        </a-tab-pane>
        <a-tab-pane key="4" tab="流程">
          <div class="step-wrap">
            <a-steps progress-dot :current="current1">
              <a-step v-for="(item, index) in process1List" :key="index" :title="item.name" :status="item.status">
                <template #description>
                  <div>{{ item.time }}</div>
                  <div v-if="(item.statusText == '已完成'||item.statusText == '已关闭') && index != '0'" style="color: #09c199">{{ item.statusText }}</div>
                  <div v-if="item.statusText == '进行中'" style="color: #3e87f8">{{ item.statusText }}</div>
                  <div v-if="item.statusText == '验收未通过'" style="color: #cd2b1d">{{ item.statusText }}</div>
                </template>
              </a-step>
            </a-steps>
            <a-divider />
            <div style="margin-left: 20px">
              <a-steps progress-dot :current="current2" direction="vertical">
                <a-step v-for="(item, index) in process2List" :key="index" :title="item.name" :description="item.time" />
              </a-steps>
            </div>
          </div>
        </a-tab-pane>
      </a-tabs>
    </div>
    <UserMultipleSelectModal @register="registerCheckUserModal" @success="handleCheckUser" />
    <ApplyExtensionModal @register="registerApplyExtensionModal" @success="onSuccessApplyExtension" />
    <MissedReportModal @register="registerMissedReportModal" @success="onSuccessMissedReport" />
    <HistoryProcessModal @register="registerHistoryProcessModal" />
  </BasicDrawer>
</template>
  <script lang="ts">
import { defineComponent, ref, reactive, h } from 'vue';
import { BasicForm, useForm } from '/@/components/Form/index';
import { BasicDrawer, useDrawerInner } from '/@/components/Drawer';
import { useModal } from '/@/components/Modal';
import { formSchema } from './report.data';
import UserMultipleSelectModal from './UserMultipleSelectModal.vue';
import CommentList from '/@/components/jeecg/comment/CommentList.vue';
import ApplyExtensionModal from './ApplyExtensionModal.vue';
import MissedReportModal from './MissedReportModal.vue';
import HistoryProcessModal from './HistoryProcessModal.vue';
import {
  getReportDetail,
  reportTask,
  getHistoryReport,
  getParticipantList,
  getProcess1,
  getProcess2,
  getReportInfo1,
  getReportInfo2,
  getReportInfo3,
  canAddParticipant,
  getPreviousReportDetail,
} from './report.api';
import type { UploadProps } from 'ant-design-vue';
import { getFileAccessHttpUrl } from '/@/utils/common/compUtils';
import { UserOutlined, DownloadOutlined } from '@ant-design/icons-vue';
import { previewFile, downloadFileAll } from '/@/api/common/api';
import { filterDictTextByCache } from '/@/utils/dict/JDictSelectUtil';

interface FormState {
  content: string;
  imgs: string;
  filePath: string;
}
export default defineComponent({
  name: 'ReportDrawer',
  components: {
    BasicDrawer,
    BasicForm,
    UserMultipleSelectModal,
    CommentList,
    ApplyExtensionModal,
    MissedReportModal,
    HistoryProcessModal,
    UserOutlined,
    DownloadOutlined,
  },
  emits: ['success', 'register'],
  setup(_, { emit }) {
    // const isUpdate = ref(true);
    const activeKey = ref('1');
    const detailTask = ref({});
    const isDue = ref(false);
    const formState = reactive<FormState>({
      content: '',
      imgs: '',
      filePath: '',
    });
    const participantsValue = ref('');
    const participantsNames = ref('');
    const publishId = ref('');
    const reportData = ref({});
    const historyReport = ref([]);
    // list key 进行中,已完成,3 我参与
    const listKey = ref('1');
    const [registerForm, { resetFields, setFieldsValue, updateSchema, validate }] = useForm({
      labelWidth: 100,
      schemas: formSchema,
      showActionButtonGroup: false,
    });
    const previewVisible = ref(false);
    const previewImage = ref('');
    const previewTitle = ref('');
    const jobRequirement = ref('');
    const participantList = ref([]);
    const process1List = ref([]);
    const process2List = ref([]);
    const current1 = ref(0);
    const current2 = ref(0);
    const searchType = ref('1');
    const activeKeyPanel1 = ref(['1']);
    const activeKeyPanel2 = ref(['1']);
    const activeKeyPanel3 = ref(['1']);
    const dataSource1 = ref([]);
    const dataSource2 = ref([]);
    const dataSource3 = ref([]);
    const title1 = ref('历史汇报');
    const isShowAddParticipant = ref(true);
    const canReport = ref(true);
    const reportType = ref('');
    const currentReportId = ref('');
    const columns1 = [
      {
        title: '责任单位',
        dataIndex: 'dutyUnitName',
        key: 'dutyUnitName',
        align: 'center',
        width: 100,
      },
      {
        title: '工作要求',
        dataIndex: 'jobRequirement',
        key: 'jobRequirement',
        align: 'center',
        width: 160,
      },
      {
        title: '完成说明',
        dataIndex: 'finishExplain',
        key: 'finishExplain',
        align: 'center',
        width: 100,
      },
      {
        title: '附件',
        dataIndex: 'attachmentFile',
        key: 'attachmentFile',
        align: 'center',
        width: 120,
      },
      {
        title: '汇报时间',
        dataIndex: 'reportCycle',
        key: 'reportCycle',
        align: 'center',
        width: 150,
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
        width: 150,
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
        width: 120,
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
      },
      {
        title: '附件',
        dataIndex: 'attachmentFile',
        key: 'attachmentFile',
        align: 'center',
        width: 140,
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
        width: 150,
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
        width: 100,
      },
      {
        title: '汇报周期',
        dataIndex: 'reportCycle',
        key: 'reportCycle',
        align: 'center',
        width: 120,
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
        width: 110,
      },
      {
        title: '附件',
        dataIndex: 'attachmentFile',
        key: 'attachmentFile',
        align: 'center',
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
        width: 150,
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

    const [registerDrawer, { setDrawerProps, closeDrawer }] = useDrawerInner(async (data) => {
      // setDrawerProps({ activeKey: false });
      canReport.value = true;
      await resetFields();
      console.log('registerDrawer', data);
      reportType.value = data.type; // wait 带汇报
      listKey.value = data.listKey;
      if (data.listKey == 3 && data.type != 'wait') {
        title1.value = '汇报信息';
      } else {
        title1.value = '历史汇报';
      }
      if (data.type == 'wait') {
        publishId.value = data.record.publish.id;
        currentReportId.value = data.record.id;
      } else {
        publishId.value = data.record.id;
      }
      if (data.type == 'wait') {
        // 待汇报
        detailTask.value = data.record.publish;
        reportData.value = data.record;
        // data.record.attachmentImg = 'temp/1_1720164931854.png,temp/7_1720164931866.png,temp/6_1720164931867.png';
        // data.record.attachmentFile= "app/EHS上线准备_1720160716220.docx"
        if (data.record.tag == '验收未通过') {
          // 表单赋值
          setFieldsValue({
            finishExplain: data.record.finishExplain,
            attachmentImg: data.record.attachmentImg,
            attachmentFile: data.record.attachmentFile,
          });
        }

        // 获取历史汇报
        handleHistoryReport(data.record.publish.id);
      } else {
        canReport.value = data.record.canReport;
        if (data.record.canReport) {
          currentReportId.value = data.record.reportId;
          // 汇报任务
          handleReportDetail(data.record.recordId);
        } else {
          // 不是待汇报根据id查询详情
          handleDetailByPublishId(publishId.value);
        }
        // 获取历史汇报
        handleHistoryReport(data.record.id);
      }

      // 我参与的-汇报信息
      if (listKey.value == 3) {
        // 按汇报周期
        handleReportInfo1(publishId.value);
        // 按责任单位
        handleReportInfo2(publishId.value);
        // 按工作要求
        handleReportInfo3(publishId.value);
      }
    });

    // 我参与的-按汇报周期
    function handleReportInfo1(publishId) {
      console.log('handleReportInfo1');
      getReportInfo1({ id: publishId }).then((res) => {
        console.log('getReportInfo1', res);
        dataSource1.value = res;
        console.log('dataSource1', dataSource1.value);
      });
    }
    // 我参与的-按责任单位
    function handleReportInfo2(publishId) {
      console.log('handleReportInfo2');
      getReportInfo2({ id: publishId }).then((res) => {
        console.log('getReportInfo2', res);
        dataSource2.value = res;
      });
    }
    // 我参与的-按工作要求
    function handleReportInfo3(publishId) {
      console.log('handleReportInfo3');
      getReportInfo3({ id: publishId }).then((res) => {
        console.log('getReportInfo3', res);
        dataSource3.value = res;
      });
    }
    const [registerCheckUserModal, { openModal: openCheckUserModal }] = useModal();
    const [registerApplyExtensionModal, { openModal: openApplyExtensionModal }] = useModal();
    const [registerMissedReportModal, { openModal: openMissedReportModal }] = useModal();
    const [registerHistoryProcessModal, { openModal: openHistoryProcessModal }] = useModal();
    function onClose() {
      activeKey.value = '1';
      console.log('onClose');
      publishId.value = '';
      emit('success');
    }
    async function handleSubmit() {
      try {
        const values = await validate();
        setDrawerProps({ confirmLoading: true });
        console.log('handleSubmit', values);
        values.id = currentReportId.value;
        // 汇报任务
        await reportTask(values).then((res) => {
          console.log('reportTask', res);
          if (res.indexOf('成功') > -1) {
            canReport.value = false;
            handleDetailByPublishId(publishId.value);
            handleHistoryReport(publishId.value);
          }
        });
        // closeDrawer();
        // emit('success');
      } finally {
        setDrawerProps({ confirmLoading: false });
      }
    }
    // 汇报-详情
    function handleReportDetail(recordId) {
      console.log('handleReportDetail');
      getPreviousReportDetail({ id: recordId }).then((res) => {
        console.log('getReportDetail', res);
        if (res.reportWay) {
          res.reportWay_dictText = filterDictTextByCache('jn_publish_report_way', res.reportWay);
        }
        // 格式化附件
        if (res.attachment) {
          res.attachmentList = res.attachment.split(',');
        }
        jobRequirement.value = res.job.jobRequirement;
        console.log('jobRequirement', jobRequirement.value);
        detailTask.value = res.publish;
        reportData.value = res;
      });
    }
    // 根据id查询详情
    function handleDetailByPublishId(publishId) {
      console.log('handleDetailByPublishId', publishId);
      // 如果是查看按钮
      getReportDetail({ publishId: publishId }).then((res) => {
        console.log('getReportDetail', res);
        if (res.reportWay) {
          res.reportWay_dictText = filterDictTextByCache('jn_publish_report_way', res.reportWay);
        }
        // 格式化附件
        if (res.attachment) {
          res.attachmentList = res.attachment.split(',');
        }
        detailTask.value = res;
        reportData.value = res;
        jobRequirement.value = res.jobRequirement;
      });
    }
    // 获取历史汇报
    function handleHistoryReport(publishId) {
      getHistoryReport({ publishId: publishId }).then((res) => {
        console.log('getHistoryReport', res);
        res.map((item) => {
          if (item.attachmentImg) {
            item.attachmentImgList = item.attachmentImg.split(',').map((e) => {
              return {
                uid: Math.random(),
                name: 'image.png',
                status: 'done',
                url: getFileAccessHttpUrl(e),
              };
            });
          }
          if (item.attachmentFile) {
            item.attachmentFileList = item.attachmentFile.split(',').map((item1) => {
              return getFileAccessHttpUrl(item1);
            });
            console.log('item.attachmentFileList', item.attachmentFileList);
          }
        });
        historyReport.value = res;
      });
    }

    // tab切换
    function tabChange(key) {
      console.log('tabChange', key);
      activeKey.value = key;
      if (key == 2) {
        getCanAddParticipant();
        handleParticipantList();
      }
      if (key == 4) {
        // 获取横向周期流程
        handleProcess1(publishId.value);
        // 获取纵向时间轴
        handleProcess2(publishId.value);
      }
    }
    // 获取横向周期流程
    function handleProcess1(publishId) {
      console.log('handleProcess1');
      getProcess1({ publishId: publishId }).then((res) => {
        console.log('getProcess1', res);
        if (res.length > 0) {
          current1.value = res.length - 2;
        } else {
          current1.value = 0;
        }
        res.map((item) => {
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
        current2.value = Number(res.length) - 1;
        console.log('current2', current2.value);
      });
    }
    // 添加参与人
    function addParticipant() {
      openCheckUserModal(true, {
        publishId: publishId.value,
        participantList: participantList.value,
      });
    }
    // 选择用户
    async function handleCheckUser(val: any) {
      console.log('handleCheckUser', val);
      await handleParticipantList();
      getCanAddParticipant();
    }
    // 获取参与人列表
    function handleParticipantList() {
      getParticipantList({ publishId: publishId.value }).then((res) => {
        console.log('getParticipantList', res);
        participantList.value = res;
      });
    }
    // 判断当前登陆人能否添加参与人
    function getCanAddParticipant() {
      // 发起请求
      canAddParticipant({ publishId: publishId.value }).then((res) => {
        console.log('canAddParticipant', res);
        isShowAddParticipant.value = res;
      });
    }
    // 申请延期
    function handleApplyExtension() {
      console.log('handleApplyExtension');
      openApplyExtensionModal(true, {
        isUpdate: false,
        // record: detailTask.value,
        record: reportData.value,
      });
    }
    // 申请延期成功
    function onSuccessApplyExtension() {
      console.log('onSuccessApplyExtension');
    }
    // 补交
    function handleMissedReport(record) {
      console.log('handleMissedReport registerMissedReportModal');
      record.jobRequirement = jobRequirement.value;
      openMissedReportModal(true, {
        record: record,
      });
    }
    // 查看历史信息
    function handleHistoryProcess(record) {
      console.log('handleHistoryProcess');
      openHistoryProcessModal(true, {
        record: record,
      });
    }
    // 补交成功
    function onSuccessMissedReport() {
      console.log('onSuccessMissedReport');
      handleDetailByPublishId(publishId.value);
      handleHistoryReport(publishId.value);
    }
    const handlePreview = async (file: UploadProps['fileList'][number]) => {
      if (!file.url && !file.preview) {
        file.preview = (await getBase64(file.originFileObj)) as string;
      }
      previewImage.value = file.url || file.preview;
      previewVisible.value = true;
      previewTitle.value = file.name || file.url.substring(file.url.lastIndexOf('/') + 1);
    };
    const handleCancel = () => {
      previewVisible.value = false;
      previewTitle.value = '';
    };
    // 预览
    function handlePreviewFile(filePath) {
      if (filePath) {
        previewFile(filePath).then((res) => {
          window.open(res, '_blank');
        });
      }
    }
    const handleSearchTypeChange = (value) => {
      searchType.value = value;
      activeKeyPanel1.value = ['1'];
      activeKeyPanel2.value = ['1'];
      activeKeyPanel3.value = ['1'];
    };
    // 打包下载
    function handleDownloadZip(record) {
      console.log('handleDownloadZip');
      let param = {};
      param['paths'] = record.attachment;
      downloadFileAll('/sys/common/downloadFiles', '附件.zip', param);
    }
    return {
      registerDrawer,
      handleSubmit,
      formState,
      registerForm,
      activeKey,
      detailTask,
      isDue,
      registerCheckUserModal,
      handleCheckUser,
      addParticipant,
      participantsNames,
      participantsValue,
      handleApplyExtension,
      onSuccessApplyExtension,
      registerApplyExtensionModal,
      handleMissedReport,
      registerMissedReportModal,
      registerHistoryProcessModal,
      onSuccessMissedReport,
      handlePreview,
      previewVisible,
      previewImage,
      previewTitle,
      handleHistoryReport,
      handleDetailByPublishId,
      handleReportDetail,
      historyReport,
      handleCancel,
      handlePreviewFile,
      onClose,
      handleHistoryProcess,
      publishId,
      tabChange,
      participantList,
      process1List,
      process2List,
      handleProcess1,
      handleProcess2,
      listKey,
      searchType,
      activeKeyPanel1,
      activeKeyPanel2,
      activeKeyPanel3,
      dataSource1,
      columns1,
      dataSource2,
      columns2,
      dataSource3,
      columns3,
      handleSearchTypeChange,
      title1,
      isShowAddParticipant,
      current1,
      current2,
      handleDownloadZip,
      canReport,
      reportData,
      reportType,
      jobRequirement,
      currentReportId,
    };
  },
});
</script>
<style lang="less" scoped>
.report-add {
  display: inline-block;
  width: 20px;
  height: 20px;
  margin-right: 10px;
  vertical-align: text-top;
}
.publish-info {
  width: 100%;
  //   height: 220px;
  border-radius: 4px;
  border: 1px solid rgba(0, 0, 0, 0.16);
  padding: 24px;
  clear: both;
  overflow: hidden;
  .info-1 {
    clear: both;
    width: 100%;
    .info-1-fl {
      float: left;
      width: 64px;
      height: 21px;
      background: rgba(62, 135, 248, 0.15);
      border-radius: 2px 2px 2px 2px;
      font-size: 13px;
      font-family: PingFang SC-Regular, PingFang SC;
      font-weight: 400;
      color: #3e87f8;
      padding: 2px 6px;
      vertical-align: initial;
    }
    .info-1-fr {
      float: right;
      .fr-1 {
        display: inline-block;
        margin-right: 10px;
        padding: 0 10px;
        height: 21px;
        line-height: 21px;
        background: rgba(9, 193, 153, 0.15);
        border-radius: 2px;
        color: #09c199;
        font-size: 13px;
        text-align: center;
      }
      .fr-2 {
        display: inline-block;
        height: 21px;
        line-height: 21px;
        margin-right: 10px;
        padding: 0 10px;
        background: rgba(0, 190, 247, 0.15);
        border-radius: 2px;
        color: #00bef7;
        font-size: 13px;
        text-align: center;
      }
    }
  }
  .info-2 {
    clear: both;
    padding: 20px 0;
  }
  .info-3 {
    clear: both;
  }
  .info-4 {
    clear: both;
    font-size: 14px;
    color: rgba(0, 0, 0, 0.6);
    margin-top: 20px;
    .info-4-fl {
      float: left;
      width: 60%;
    }
    .info-4-fr {
      float: right;
      width: 40%;
      text-align: right;
    }
  }
}
.report-info {
  clear: both;
  overflow: hidden;
  padding-top: 46px;
  width: 937px;
  .info-1 {
    clear: both;
    width: 100%;
    .info-1-fl {
      float: left;
      font-size: 14px;
      color: rgba(0, 0, 0, 0.87);
      .dot {
        width: 8px;
        height: 8px;
        background: #ff8d04;
        border-radius: 50%;
        display: inline-block;
        margin-right: 8px;
        margin-left: 12px;
      }
      .status {
        font-size: 16px;
        font-family: Source Han Sans CN-Regular, Source Han Sans CN;
        font-weight: 400;
        color: #ff8d04;
        vertical-align: middle;
      }
      .dot-red {
        background: #cd2b1d;
      }
      .status-red {
        color: #cd2b1d;
      }
    }
    .info-1-fr {
      float: right;
      .fr-1 {
        display: inline-block;
        padding: 0 27px;
        height: 40px;
        line-height: 40px;
        background: #fff;
        border-radius: 4px;
        border: 1px solid #ff8d04;
        color: #ff8d04;
        font-size: 16px;
        text-align: center;
        cursor: pointer;
      }
    }
  }
  .form-wrap {
    clear: both;
    overflow: hidden;
    padding-top: 20px;
    position: relative;
    padding-bottom: 20px;
    .report-btn {
      position: absolute;
      right: 0;
      bottom: 0px;
    }
  }
}
.history-report {
  margin-top: 30px;

  .box-wrap {
  }
}
.split {
  margin-top: 30px;
  width: 987px;
  height: 2px;
  background: #eff1f5;
}
.his-detail {
  display: flex;
  position: relative;
  .his-time {
    margin-right: 10px;
    width: 80px;
  }
  .more-btn {
    position: absolute;
    right: 0;
    top: 0;
  }
}
.step-wrap {
  padding: 20px;
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
.search-wrap {
}
.data-list {
  margin-top: 24px;
  .header-date {
    color: rgba(0, 0, 0, 0.65);
    font-size: 16px;
    margin-right: 15px;
    margin-top: 4px;
  }
  .header-percent {
    color: rgba(0, 0, 0, 0.6);
    font-size: 14px;
    margin-right: 15px;
    margin-top: 5px;
  }
  .header-btn {
    width: 80px;
    height: 32px;
    line-height: 32px;
    border-radius: 4px;
    border: 1px solid #3e87f8;
    text-align: center;
    color: #3e87f8;
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
:deep(.ant-steps-horizontal) {
  overflow-x: auto;
  padding: 20px 0;
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
.work-item {
  margin: 20px 0;
  display: flex;
  .label {
    display: block;
    color: #000;
    text-align: right;
    width: 70px;
  }
  .content {
    display: block;
    color: #666;
    width: 500px;
  }
}
.attachment-btn {
  color: #1890ff;
  cursor: pointer;
  white-space: normal;
}
.his-content {
  width: 850px;
  .history-explain {
    width: 100%;
    margin-top: 10px;
    display: flex;
    .explain-text {
      width: 750px;
      color: #666;
    }
  }
}
</style>
