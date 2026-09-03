<template>
  <div>
    <BasicModal
      v-bind="$attrs"
      @register="registerModal"
      defaultFullscreen
      :canFullscreen="false"
      :footer="null"
      :title="title"
      destroyOnClose
      @cancel="closeModal"
    >
      <div>
        <div>
          <div class="flex-align_center">
            <div>
              <div>培训人数</div>
              <div>{{ statisticsInfo.personNum }}</div>
            </div>
            <div>
              <div>已参与</div>
              <div>{{ statisticsInfo.involvementNum }}</div>
            </div>
            <div>
              <div>参与率</div>
              <div>{{ statisticsInfo.involvementRate }}%</div>
            </div>
            <div>
              <div>已合格</div>
              <div>{{ statisticsInfo.passNum }}</div>
            </div>
            <div>
              <div>合格率</div>
              <div>{{ statisticsInfo.passRate }}%</div>
            </div>
            <div>
              <div>第一次考试合格</div>
              <div>{{ statisticsInfo.firstPass }}</div>
            </div>
            <div>
              <div>第一次考试合格率</div>
              <div>{{ statisticsInfo.firstPassRate }}%</div>
            </div>
            <div>
              <div>待考试</div>
              <div>{{ statisticsInfo.examNum }}</div>
            </div>
          </div>
        </div>
        <div class="study-nav"></div>
        <div class="study-tabs">
          <div>
            <div :class="activeKey === '0' ? 'active' : ''" @click="handleTabChange('0')">培训对象（{{ statisticsInfo.personNum }} ）</div>
            <div :class="activeKey === '1' ? 'active' : ''" @click="handleTabChange('1')">已合格（ {{ statisticsInfo.passNum }} ）</div>
            <div :class="activeKey === '2' ? 'active' : ''" @click="handleTabChange('2')">学习中（ {{ statisticsInfo.learning }} ）</div>
            <div :class="activeKey === '3' ? 'active' : ''" @click="handleTabChange('3')">未参与（ {{ statisticsInfo.notInvolvement }} ）</div>
            <div :class="activeKey === '4' ? 'active' : ''" @click="handleTabChange('4')">第一次考试合格（ {{ statisticsInfo.firstPass }} ）</div>
            <div :class="activeKey === '6' ? 'active' : ''" @click="handleTabChange('6')">待模拟考试 （ {{ statisticsInfo.mockExamNum }} ）</div>
            <div :class="activeKey === '5' ? 'active' : ''" @click="handleTabChange('5')">待考试 （ {{ statisticsInfo.examNum }} ）</div>
          </div>
        </div>
        <basic-table @register="registerTable" :rowSelection="rowSelection">
          <template #tableTitle>
            <a-button
              v-if="['未开始', '评审中', '进行中'].includes(status)"
              preIcon="ant-design:plus-outlined"
              type="primary"
              v-auth="'trainingTasks:viewAdd'"
              @click="onAdd"
              >新增</a-button
            >
            <a-button type="primary" preIcon="ant-design:export-outlined" @click="onExportXls"> 导出</a-button>
            <a-button
              preIcon="ant-design:delete-outlined"
              v-auth="'trainingTasks:viewDel'"
              v-if="selectedRowKeys.length > 0"
              @click="batchHandleDelete"
            >
              批量删除</a-button
            >
            <a-button v-if="selectedRowKeys.length > 0 && activeKey === '5'" type="primary" :loding="examLoding" @click="handleExam">
              开始考试</a-button
            >
          </template>
          <template #details="{ record }">
            <span style="color: #1890ff; cursor: pointer" @click="handleDetails(record)">明细</span>
          </template>
          <template #confirmStatus="{ record }">
            <span style="color: #1890ff; cursor: pointer" @click="handleConfirmStatus">{{ record.confirmStatus }}</span>
          </template>
          <template #action="{ record }">
            <TableAction :actions="getTableAction(record)" />
          </template>
        </basic-table>
        <div class="group">
          <!-- 试题详情 -->
          <div v-show="paperList.length > 0" style="margin-bottom: 10px">
            <div class="group-title">试题详情</div>
            <div v-for="(item, index) in paperList" :key="item.id">
              <div v-if="paperList.length > 1">
                <div class="group-title-nav">{{ xgData[index] }}</div>
                <div>
                  <span class="group-active" @click="handleOpen(item)">
                    <a-tag v-if="item.type === '1'">试卷</a-tag>
                    <a-tag v-else>题库</a-tag>
                    {{ item.name }}
                  </span>
                </div>
              </div>
              <div v-else>
                <span class="group-active" @click="handleOpen(item)">
                  <a-tag v-if="item.type === '1'">试卷</a-tag>
                  <a-tag v-else>题库</a-tag>
                  {{ item.name }}
                </span>
              </div>
            </div>
          </div>
          <!-- 教材会审详情 -->
          <div v-show="reviewList.length > 0">
            <div class="group-title">教材会审详情</div>
            <a-steps :current="reviewCurrent" direction="vertical" progress-dot class="accident-report-steps">
              <a-step v-for="item in reviewList" :key="item">
                <template #title>
                  <div>{{ item.node }}</div>
                </template>
                <template #description>
                  <div class="personnel-list">
                    <div v-for="(ite, inx) in item.vettingInfoList" :key="inx">
                      <div>
                        <div class="info-row">
                          <span>{{ ite.userName }}</span>
                          <span>{{ ite.operateTime }}</span>
                          <img v-if="ite.sign" :src="getFileAccessHttpUrl(ite.sign)" style="width: 90px; height: 55px" />
                        </div>
                        <div><span class="info-label">职务：</span>{{ ite.position }}</div>
                        <div><span class="info-label">审批意见：</span>{{ ite.reviewComment }}</div>
                        <div><span class="info-label">会审意见：</span>{{ ite.triageComment }}</div>
                      </div>
                    </div>
                  </div>
                </template>
              </a-step>
            </a-steps>
          </div>
          <!-- 签字评价记录 -->
          <div v-show="appraiseList.length > 0">
            <div class="group-title">签字评价记录</div>
            <a-steps :current="appraiseCurrent" direction="vertical" progress-dot class="accident-report-steps">
              <a-step v-for="item in appraiseList" :key="item">
                <template #title>
                  <div>{{ item.node }}</div>
                </template>
                <template #description>
                  <div class="personnel-list">
                    <div v-for="(ite, inx) in item.vettingInfoList" :key="inx">
                      <div>
                        <div v-if="item.node === '评价人员'">
                          <div><span class="info-label">讲师授课情况：</span>{{ ite.lecturerCourse }}</div>
                          <div><span class="info-label">员工学习情况：</span>{{ ite.employeeLearning }}</div>
                          <div><span class="info-label">评价结果：</span>{{ ite.appraiseResult }}</div>
                        </div>
                        <div class="info-row">
                          <span>{{ ite.userName }}</span>
                          <span>{{ ite.operateTime }}</span>
                          <img v-if="ite.sign" :src="getFileAccessHttpUrl(ite.sign)" style="width: 90px; height: 55px" />
                        </div>
                        <div v-if="ite.annex && item.node === '记录人员'">
                          <div style="display: flex; align-items: center">
                            <span class="info-label">记录图片：</span>
                            <img
                              v-for="it in ite.images"
                              :key="it"
                              :src="getFileAccessHttpUrl(it)"
                              style="width: 100px; height: 100px; margin: 10px 10px 0 0"
                              @click="onPreview(it)"
                            />
                          </div>
                          <div style="display: flex; align-items: center">
                            <span class="info-label">记录视频：</span>
                            <video
                              v-for="it in ite.videos"
                              :key="it"
                              :src="getFileAccessHttpUrl(it)"
                              style="width: 100px; height: 100px; margin: 10px 10px 0 0"
                              @click="onPreview(it)"
                            ></video>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </template>
              </a-step>
            </a-steps>
          </div>
        </div>
      </div>
    </BasicModal>
  </div>
  <a-modal v-model:visible="visible" :width="1200" :body-style="{ padding: '20px' }" title="学习明细" z-index="1001" :footer="null">
    <div>
      <div v-for="item in detailsArray" :key="item.stageName" style="margin-bottom: 20px">
        <div style="display: flex; line-height: 50px; align-items: center; justify-content: space-between">
          <div style="display: flex; align-items: center">
            <div style="width: 4px; background-color: #1890ff; height: 30px; margin-right: 10px"></div>
            {{ item.stageName }} <a-tag style="margin-left: 10px">{{ item.trainType }}</a-tag>
          </div>
          <div> 实施单位：{{ item.enforceCode }} </div>
          <div> 教育者：{{ item.trainPerson }} </div>
          <div> 结束时间：{{ item.endTime }} </div>
        </div>
        <a-table v-if="item.itemList.length > 0" :columns="columns1" :data-source="item.itemList" :pagination="false" style="margin-left: 8px">
          <template #name="{ record, text }">
            <span v-if="record.examType && record.examType === '1'">（模拟）{{ text }}</span>
            <span v-else>{{ text }}</span>
          </template>
          <template #progress="{ record, text }">
            <span v-if="text?.includes('合格')" style="color: #52c41a">{{ text }}</span>
            <span v-else-if="text?.includes('不合格')" style="color: red">{{ text }}</span>
            <span v-else>{{ text }}</span>
            <span
              v-if="text?.includes('合格') || text?.includes('不合格')"
              style="color: #1890ff; cursor: pointer; margin-left: 16px"
              @click="goExamResult(record, item)"
              >明细</span
            >
          </template>
        </a-table>
      </div>
    </div>
  </a-modal>
  <a-modal v-model:visible="visible1" :width="600" :body-style="{ padding: '20px' }" title="新增" z-index="1001" :maskClosable="false">
    <a-form :model="viewForm" ref="viewFormRef" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }" autocomplete="off">
      <a-form-item label="新增人员" name="ids" :rules="[{ required: true, message: '新增人员为必填项！' }]">
        <JUserModal v-model:value="viewForm.ids" type="checkbox" placeholder="请选择" :zIndex="1200" />
      </a-form-item>
    </a-form>
    <template #footer>
      <a-button key="back" @click="() => (visible1 = false)">取消</a-button>
      <a-button key="submit" type="primary" :loading="loading" @click="handleOk">确认</a-button>
    </template>
  </a-modal>
  <ExamRecord ref="examRecordRef" @register="register" />
  <questionsModal @register="questionRegister" />
</template>
<script lang="ts" name="view-modal" setup>
  import { ref, nextTick, computed } from 'vue';
  import { useModal, BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicTable, BasicColumn, FormSchema, TableAction } from '/@/components/Table';
  import { useListPage } from '/@/hooks/system/useListPage';
  import {
    trainInfo,
    infoStatistics,
    details,
    examRecord,
    deleteTrainUser,
    getTrainVettingList,
    addTrainUser,
    updateTrainUser,
    orgList,
    allowUserExam,
  } from './url/index';
  import { useMessage } from '/@/hooks/web/useMessage';
  import ExamRecord from './examRecord.vue';
  import { getFileAccessHttpUrl } from '/@/utils/common/compUtils';
  import { previewFile } from '/@/api/common/api';
  import { JUserModal } from '/@/components/Form';
  import { TreeSelect } from 'ant-design-vue';
  import questionsModal from './questionsModal.vue';
  import { useUserStore } from '/@/store/modules/user';
  import dayjs from 'dayjs';
  const userStore: any = useUserStore();
  const userInfo = computed(() => userStore.getUserInfo);
  const SHOW_ALL = TreeSelect.SHOW_ALL;
  const emits = defineEmits(['success']);
  const { createMessage } = useMessage();
  const title = ref('');
  const visible = ref(false);
  const activeKey = ref('0');
  const id = ref('');
  const visible1 = ref(false);
  const viewForm = ref({
    ids: '',
  });
  const loading = ref(false);
  const viewFormRef = ref();
  const status = ref('');
  const [register, { openModal }] = useModal();
  const [questionRegister, { openModal: questionOpenModal }] = useModal();
  const statisticsInfo = ref({
    personNum: 0,
    involvementNum: 0,
    involvementRate: 0,
    passNum: 0,
    passRate: 0,
    learning: 0,
    notInvolvement: 0,
    firstPass: 0,
    firstPassRate: 0,
    examNum: 0,
    mockExamNum: 0
  });
  const examLoding = ref(false);
  const detailsArray: any = ref([]);
  const reviewList: any = ref([]);
  const appraiseList: any = ref([]);
  const reviewCurrent = ref(-1);
  const appraiseCurrent = ref(-1);
  const orgOptions: any = ref([]);
  const paperList: any = ref([]);
  const xgData = ref(['公司级', '分厂级', '车间级']);
  const trainProjectName = ref('');
  const searchFormSchema: FormSchema[] = [
    {
      label: '姓名',
      field: 'userName',
      component: 'Input',
      colProps: { span: 6 },
    },
    {
      label: '所属单位',
      field: 'orgCode',
      component: 'JTreeSelect1',
      componentProps: {
        treeDataArr: [],
        isLeaf: false,
        load: false,
        treeNodeFilterProp: 'title',
        fieldNames: {
          label: 'title',
          value: 'key',
          key: 'key',
        },
        showCheckedStrategy: SHOW_ALL,
        getPopupContainer: () => document.body,
      },
      colProps: { span: 6 },
    },
  ];
  const columns: BasicColumn[] = [
    {
      title: '参与人员',
      width: 200,
      align: 'center',
      dataIndex: 'userName',
    },
    {
      title: '所属单位',
      width: 300,
      align: 'center',
      dataIndex: 'orgCode',
    },
    {
      title: '培训状态',
      width: 150,
      align: 'center',
      dataIndex: 'trainStatus',
    },
    {
      title: '首次学习时间',
      width: 200,
      align: 'center',
      dataIndex: 'firstTime',
    },
    {
      title: '任务合格时间',
      width: 200,
      align: 'center',
      dataIndex: 'taskPassTime',
    },
    {
      title: '任务进度',
      width: 150,
      align: 'center',
      dataIndex: 'taskProgress',
    },
    {
      title: '教育者确认',
      width: 150,
      align: 'center',
      dataIndex: 'confirmStatus',
      slots: { customRender: 'confirmStatus' },
    },
    {
      title: '当前阶段',
      width: 200,
      align: 'center',
      dataIndex: 'stage',
    },
    {
      title: '学习记录',
      width: 150,
      align: 'center',
      dataIndex: '',
      slots: { customRender: 'details' },
    },
    {
      title: '培训学时',
      width: 150,
      align: 'center',
      dataIndex: 'duration',
    },
  ];
  const columns1: BasicColumn[] = [
    {
      title: '课时',
      align: 'left',
      dataIndex: 'name',
      slots: { customRender: 'name' },
    },
    {
      title: '学习进度',
      width: 200,
      align: 'center',
      dataIndex: 'progress',
      slots: { customRender: 'progress' },
    },
  ];
  const { tableContext, operateRequest, onExportXls } = useListPage({
    tableProps: {
      api: trainInfo,
      columns: columns,
      formConfig: {
        schemas: searchFormSchema,
        labelWidth: 120,
        autoAdvancedCol: 3,
      },
      beforeFetch: (params) => {
        params.id = id.value;
        params.type = activeKey.value;
        return params;
      },
      immediate: false,
      rowKey: 'userId',
      actionColumn: {
        width: 200,
        fixed: 'right',
      },
    },
    exportConfig: {
      name: '学习明细-' + dayjs(new Date()).format('YYYY-MM-DD'),
      url: '/edu/trainTask/trainInfoExport',
      suffix: 'xlsx',
    },
  });
  const [registerTable, { reload, getForm }, { rowSelection, selectedRowKeys, selectedRows }] = tableContext;
  const [registerModal, { closeModal }] = useModalInner(async (data) => {
    title.value = data.title;
    id.value = data.data.id;
    status.value = data.data.status;
    activeKey.value = '0';
    trainProjectName.value = data.data.trainProjectName;
    reload();
    initTabTotal();
    appraiseList.value = [];
    reviewList.value = [];
    reviewCurrent.value = -1;
    appraiseCurrent.value = -1;
    initOrgList();
    getTrainVettingList({
      id: id.value,
    }).then((res) => {
      if (res) {
        reviewList.value = res.reviewList;
        appraiseList.value = res.appraiseList;
        paperList.value = res.paperList || [];
        reviewCurrent.value = findLastIndex(reviewList.value);
        appraiseCurrent.value = findLastIndex(appraiseList.value);
        if (appraiseList.value.length > 0) {
          appraiseList.value = appraiseList.value.map((item) => {
            if (item.node === '记录人员') {
              item.vettingInfoList.forEach((ite) => {
                if (ite.annex) {
                  const files = ite.annex.split(',');
                  const { images, videos } = files.reduce(
                    (acc, file) => {
                      const fileType = getImageOrVideoExt(file);
                      if (fileType === 'image') {
                        acc.images.push(file);
                      } else if (fileType === 'video') {
                        acc.videos.push(file);
                      }
                      return acc;
                    },
                    { images: [], videos: [] }
                  );
                  ite.images = images;
                  ite.videos = videos;
                }
                return ite;
              });
            }
            return item;
          });
        }
      }
    });
  });
  const initOrgList = () => {
    orgList({
      level: 4,
    }).then((res) => {
      if (res) {
        orgOptions.value = res;
        getForm().updateSchema({
          field: 'orgCode',
          componentProps: {
            treeDataArr: orgOptions.value,
            placeholder: '请选择',
            isLeaf: false,
            load: false,
            treeNodeFilterProp: 'title',
            fieldNames: {
              label: 'title',
              value: 'key',
              key: 'key',
              options: 'children',
            },
            showCheckedStrategy: SHOW_ALL,
            getPopupContainer: () => document.body,
          },
        });
      }
    });
  };
  const findLastIndex = (arr) => {
    if (!Array.isArray(arr) || arr.length === 0) return -1;
    for (let i = arr.length - 1; i >= 0; i--) {
      if (arr[i]?.status === '0') return i;
    }
    return -1;
  };
  const initTabTotal = () => {
    infoStatistics({
      id: id.value,
    }).then((res) => {
      if (res) {
        const keys = Object.keys(statisticsInfo.value);
        for (const key of keys) {
          statisticsInfo.value[key] = res[key];
        }
        emits('success');
      }
    });
  };
  const handleTabChange = (type) => {
    activeKey.value = type;
    selectedRowKeys.value = [];
    reload();
  };
  // 当前任务item
  const currentTask = ref<any>({});
  const handleDetails = (data) => {
    currentTask.value = data;
    details({
      id: id.value,
      userId: data.userId,
    }).then((res) => {
      if (res) {
        detailsArray.value = res || [];
        visible.value = true;
      }
    });
  };
  const handleConfirmStatus = () => {
    createMessage.info('请在手机端完成签字确认！');
  };
  const goExamResult = (record, item) => {
    examRecord({
      taskId: currentTask.value.taskId,
      contentId: item.id,
      userId: currentTask.value.userId,
      examType: record.examType,
    }).then((res) => {
      openModal(true, res);
    });
  };
  function getTableAction(record) {
    return [
      {
        label: '删除',
        onClick: handleDelete.bind(null, record),
        auth: ['trainingTasks:viewDel'],
      },
      {
        label: '更新状态',
        onClick: handleUpdStatus.bind(null, record),
        auth: ['trainingTasks:viewUpd'],
        ifShow: record.taskProgress == '100%' && record.trainStatus == '学习中',
      },
      {
        label: '开始考试',
        onClick: handleExam.bind(null, record),
        ifShow: activeKey.value === '5' && userInfo.value.id === record.educator,
      },
    ];
  }
  const handleDelete = (record) => {
    operateRequest(
      () => deleteTrainUser({ taskId: record.taskId, ids: [record.userId] }),
      {
        confirm: true,
        isBatch: false,
      },
      () => {
        reload();
        initTabTotal();
      }
    );
  };
  const handleUpdStatus = (record) => {
    updateTrainUser({ taskId: record.taskId, userId: record.userId });
  };
  const batchHandleDelete = () => {
    operateRequest(
      () => deleteTrainUser({ taskId: id.value, ids: selectedRowKeys.value }),
      {
        confirm: true,
        isBatch: true,
      },
      () => {
        reload();
        initTabTotal();
      }
    );
  };
  const onAdd = () => {
    visible1.value = true;
    nextTick(() => {
      viewFormRef.value.resetFields();
    });
  };
  const handleOk = async () => {
    await viewFormRef.value.validate();
    loading.value = true;
    addTrainUser({
      taskId: id.value,
      ids: viewForm.value.ids.split(','),
    })
      .then((res) => {
        if (res) {
          visible1.value = false;
          reload();
          initTabTotal();
        }
      })
      .finally(() => {
        loading.value = false;
      });
  };
  // 定义过滤函数
  const getImageOrVideoExt = (file) => {
    const ext = file.split('.').pop().toLowerCase(); // 获取文件扩展名并转换为小写
    if (['png', 'jpg', 'jpeg'].includes(ext)) return 'image'; // 图片格式
    if (['mp4', 'avi', 'mov'].includes(ext)) return 'video'; // 视频格式
    return 'other'; // 其他格式
  };
  const onPreview = (file) => {
    previewFile(file).then((res) => {
      window.open(res, '_blank');
    });
  };
  const handleOpen = (data) => {
    questionOpenModal(true, {
      id: data.id,
      name: data.name,
      type: data.type,
    });
  };
  // 开始考试
  const handleExam = async (data?) => {
    let userId = '';
    if (data.type === 'click') {
      if (selectedRows.value.some((item) => item.educator !== userInfo.value.id)) {
        return createMessage.info('当前所选项存在教育者与登录人不匹配的情况！');
      }
      userId = selectedRowKeys.value.join(',');
    } else {
      userId = data.userId;
    }
    examLoding.value = true;
    try {
      const res = await allowUserExam({
        taskId: id.value,
        userId,
      });
      if (res) {
        examLoding.value = false;
        selectedRowKeys.value = [];
        reload();
        initTabTotal();
      }
    } catch (e) {
      examLoding.value = false;
    }
  };
</script>
<style lang="less" scoped>
  .flex-align_center {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 100px;
    margin-top: 20px;
    margin-bottom: 20px;
    & > div {
      border-right: 1px solid #eee;
      width: 20%;
      height: 80px;
      text-align: center;
      & > div:nth-child(1) {
        line-height: 50px;
        color: #888888;
      }
      & > div:nth-child(2) {
        font-size: 24px;
        font-weight: bold;
      }
    }
    & > div:last-child {
      border-right: none;
    }
  }
  .study-nav {
    height: 1px;
    background-color: #e5e7eb;
    margin-bottom: 20px;
  }
  .study-tabs {
    margin-left: 16px;
    & > div {
      display: flex;
      div {
        margin-right: 15px;
        background-color: rgb(239, 239, 239);
        font-size: 16px;
        color: #666;
        padding: 10px 20px;
        border-radius: 10px 10px 0 0;
        cursor: pointer;
      }
      .active {
        background-color: #1890ff;
        color: #fff;
        font-weight: normal;
      }
      & > div:nth-child(1) {
        margin-right: 10px;
      }
    }
  }
  :deep(.ant-table-title) {
    min-height: 0 !important;
  }
  .group {
    margin: 0 20px 0;
  }
  .group-title {
    font-size: 18px;
    font-weight: bold;
    margin-bottom: 10px;
  }
  .group-title-nav {
    font-size: 16px;
    margin-bottom: 10px;
  }
  .group-active {
    cursor: pointer;
    color: #1890ff;
    font-size: 15px;
  }
  .info-row {
    display: flex;
    align-items: center;
    margin-bottom: 5px;
    & > span {
      margin-right: 10px;
    }
    & > img {
      width: 20px;
      height: 20px;
      margin-left: 5px;
    }
  }
  .info-label {
    font-weight: bold;
    line-height: 30px;
  }
  :deep(.ant-steps-item-title) {
    margin-bottom: 10px;
  }
  .personnel-list {
    & > div {
      margin-top: 15px;
    }
    & > div:nth-child(1) {
      margin-top: 0;
    }
  }
</style>
