<template>
  <div class="newsUserTraining">
    <div class="static-info">
      今日已完成每日一练，学分<span>+{{ staticInfo.dayCredits }}</span
      >； 已学习视频<span>{{ staticInfo.videoCount }}</span
      >个， 学习时长<span>{{ computeTime(staticInfo.videoDuration) }}</span
      >，学分<span>+{{ staticInfo.videoCredits }}</span
      >； 已学习文档<span>{{ staticInfo.docCount }}</span
      >个，学习时长<span>{{ computeTime(staticInfo.docDuration) }}</span
      >，学分<span>+{{ staticInfo.docCredits }}</span
      >； 刷题<span>{{ staticInfo.practiseCount }}</span
      >个，刷题时长<span>{{ computeTime(staticInfo.practiseDuration) }}</span
      >，学分<span>+{{ staticInfo.practiseCredits }}</span
      >， 总学分<span>{{ staticInfo.totalCredits }}</span
      >。
      <a-button type="primary" ghost @click="router.push('/student/selfStudyDetail')">详情</a-button>
    </div>
    <div class="newsUserTraining-tabs">
      <div>
        <div :class="activeKey === '1' ? 'active' : ''" @click="handleTabChange('1')">每日一练</div>
        <div :class="activeKey === '2' ? 'active' : ''" @click="handleTabChange('2')">视频学习</div>
        <div :class="activeKey === '3' ? 'active' : ''" @click="handleTabChange('3')">文档学习</div>
        <div :class="activeKey === '4' ? 'active' : ''" @click="handleTabChange('4')">自由答题</div>
        <div :class="activeKey === '5' ? 'active' : ''" @click="handleTabChange('5')">自主刷题</div>
      </div>
    </div>
    <div class="list" v-loading="loading" v-if="activeKey != '5'">
      <a-table :columns="['2', '3'].includes(activeKey) ? columns23 : columns" :data-source="list" :pagination="false" size="small">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'name'">
            <span style="cursor: pointer" @click="getStudyDetail(record)">{{ record.name }}</span>
          </template>
          <template v-if="column.key === 'progress'">
            <div v-if="record.progress && ['1', '4'].includes(activeKey)"
              ><span :class="record.progress.startsWith('合格') ? 'green' : 'red'">{{ record.progress }}</span>
              <a-button type="link" @click="goDetail(record)">明细</a-button>
            </div>
          </template>
          <template v-if="column.key === 'action'">
            <a-button type="link" @click="goDetail(record)">详情</a-button>
          </template>
        </template>
      </a-table>
    </div>
     <div class="list" v-loading="loading" v-else>
      <a-table :columns="examColumns" :data-source="examList" :pagination="ipagination"
                @change="tableChange">
        <template #title>
          <a-button type="primary" @click="add">
            新增刷题
          </a-button>
        </template>
        <template #bodyCell="{ column, text, record }">
          <template v-if="column.key === 'questionNum'">
            <span style="color: #1989fa;">{{text || 0}}</span>
          </template>
          <template v-if="column.key === 'correctNum'">
            <span style="color: #389e0d;">{{text || 0}}</span>
          </template>
          <template v-if="column.key === 'errorNum'">
            <span style="color: #ff4d4f;">{{text || 0}}</span>
          </template>
          <template v-if="column.key === 'action'">
            <a-button type="link" @click="openExamModal(record)">详情</a-button>
          </template>
        </template>
      </a-table>
    </div>
    <a-modal v-model:visible="openAddModal" title="选择题库" :confirm-loading="submiting" @ok="handleOk" width="50%" :ok-text="'开始答题'" :cancel-text="'取消'">
      <a-form ref="formRef" :model="formState" :label-col="{ span: 8 }" :wrapper-col="{ span: 16 }" style="padding: 10px 16px 10px 0">
        <a-row>
          <a-col span="8">
            <a-form-item label="分类" name="category">
              <a-tree-select
                v-model:value="formState.category"
                show-search
                placeholder="请选择"
                tree-default-expand-all
                :tree-data="categoryTreeData"
                tree-node-filter-prop="label"
                @change="selectChange"
                :fieldNames="{label:'title', value: 'code' }"
              >
              </a-tree-select>
            </a-form-item>
          </a-col>
          <a-col span="8">
            <a-form-item label="选择事业部" name="orgCode">
              <a-select
                v-model:value="formState.orgCode"
                :options="departList"
                @change="selectChange"
                placeholder="请选择"
                allow-clear
                :fieldNames="{ label: 'departName', value: 'orgCode' }"
              ></a-select>
            </a-form-item>
          </a-col>
          <a-col span="8">
            <a-form-item label="选择题库" :rules="[{ required: true, message: '请选择' }]" name="questionBankId">
              <a-select
                v-model:value="formState.questionBankId"
                :options="questionBankList"
                @change="questionChange"
                placeholder="请选择"
                :fieldNames="{ label: 'name', value: 'id' }"
              ></a-select>
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
      <a-table :columns="columns2" :data-source="examTableData" :pagination="false"> </a-table>
    </a-modal>
    <a-modal v-model:visible="openAddModalDetail" title="答题详情" @ok="handleOk" width="50%" :ok-text="'查看详情'" :cancel-text="'取消'">
      <a-form ref="formRef" :model="formState" :label-col="{ span: 8 }" :wrapper-col="{ span: 16 }" style="padding: 10px 16px 10px 0">
        <a-row>
          <a-col span="8">
            <a-form-item label="分类" name="category">
              <a-tree-select
                v-model:value="formState.category"
                show-search
                placeholder="请选择"
                allow-clear
                tree-default-expand-all
                :tree-data="categoryTreeData"
                tree-node-filter-prop="label"
                :fieldNames="{label:'title', value: 'code' }"
                disabled
              >
              </a-tree-select>
            </a-form-item>
          </a-col>
          <a-col span="8">
            <a-form-item label="选择事业部" name="orgCode">
              <a-select
                v-model:value="formState.orgCode"
                :options="departList"
                @change="selectChange"
                placeholder="请选择"
                disabled
                :fieldNames="{ label: 'departName', value: 'orgCode' }"
              ></a-select>
            </a-form-item>
          </a-col>
          <a-col span="8">
            <a-form-item label="选择题库" :rules="[{ required: true, message: '请选择' }]" name="questionBankId">
              <a-select
                v-model:value="formState.questionBankId"
                :options="questionBankList"
                @change="questionChange"
                placeholder="请选择"
                disabled
                :fieldNames="{ label: 'name', value: 'id' }"
              ></a-select>
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-modal>
  </div>
  <ExamRecord @register="registerRecord" />
  <div class="study" v-if="studyPageShow">
    <div class="tit">
      <div>
        <ArrowLeftOutlined @click="closeStudy" style="font-size: 30px; color: #ffffff" />
        <span class="name">{{ currentClass.name }}</span>
      </div>
      <!-- <div v-if="currentClass.type == 2">
        <span class="label">已学习：</span><i>{{ computeTime(alreadyStudyTime) }}</i> <span class="label">应学习：</span
        >{{ computeTime(currentClass.duration) }}</div
      > -->
    </div>
    <div class="study-main">
      <player
        v-if="activeKey == 2"
        height="100%"
        ref="playerRef"
        :url="currentClass.resourceUrl"
        :id="'player' + 12"
        @start="playStart"
        @pause="playPause"
        @ended="playEnd"
        :draggable="forbidFastForward"
        :currentTime="currentClass.studyDuration || 0"
      />
      <iframe v-if="['3'].includes(activeKey)" ref="iframeRef" :src="previewUrl" frameborder="0" style="width: 100%; height: 100%"></iframe>
    </div>
  </div>
</template>
<script setup name="student-selfStudy" lang="ts">
  import { getExamContent, studylist, studylist23, dailyStatistics, getVideo, addDuration, getQuestionBank, startExam, autoBrushQuestionList, getLastConfig } from './url/index';
  import player from '../../../studyTraining/resourceManage/video/playedu-player/index.vue';
  import { get3DepartList } from '/@/api/common/api';
  import { useRouter, onBeforeRouteLeave } from 'vue-router';
  import { ArrowLeftOutlined } from '@ant-design/icons-vue';
  import ExamRecord from './components/examRecord.vue';
  import { loadTreeData } from '/@/api/common/api';
  import { previewFile } from '/@/api/common/api';
  import { useModal } from '/@/components/Modal';
  import { Modal } from 'ant-design-vue';
  import { ref, onMounted } from 'vue';

  // 考试记录弹框
  const [registerRecord, { openModal: openModalRecord }] = useModal();

  const router = useRouter();
  const activeKey = ref(sessionStorage.getItem('activeKey') || '1');

  // 去考试返回保持选中状态
  onMounted(async () => {
    sessionStorage.removeItem('activeKey');
    handleTabChange(activeKey.value);
    departList.value = await get3DepartList();
  });
  onBeforeRouteLeave((to: any, from) => {
    sessionStorage.setItem('activeKey', activeKey.value);
  });

  const examList = ref<any[]>([]);
  const handleTabChange = (idx) => {
    activeKey.value = idx;
    if (idx == '5') {
      getExamList();
      return;
    }
    getList();
  };
  const loading = ref(false);

  // 学习页面
  const studyPageShow = ref(false);
  const currentClass = ref<any>({});
  const columns = ref<any[]>([
    {
      title: '课时',
      key: 'name',
      dataIndex: 'name',
    },
    {
      title: '学习进度',
      key: 'progress',
      dataIndex: 'progress',
    },
  ]);
  const columns23 = ref<any[]>([
    {
      title: '类型',
      key: 'label',
      dataIndex: 'label',
      width: '240px'
    },
    {
      title: '课时',
      key: 'name',
      dataIndex: 'name',
    },
    {
      title: '学习进度',
      key: 'progress',
      dataIndex: 'progress',
    },
  ]);
  const columns2 = ref<any[]>([
    {
      title: '单选题',
      key: 'question1',
      dataIndex: 'question1',
    },
    {
      title: '多选题',
      key: 'question2',
      dataIndex: 'question2',
    },
    {
      title: '判断题',
      key: 'question4',
      dataIndex: 'question4',
    },
    {
      title: '填空题',
      key: 'question3',
      dataIndex: 'question3',
    },
    {
      title: '问答题',
      key: 'question5',
      dataIndex: 'question5',
    },
  ]);
  const examTableData = ref<any[]>([]);
  const examColumns = ref<any[]>([
    {
      title: '单位',
      key: 'questionBankOrgCodeName',
      dataIndex: 'questionBankOrgCodeName',
    },
    {
      title: '分类',
      key: 'category',
      dataIndex: 'category',
    },
    {
      title: '题库名称',
      key: 'questionBankName',
      dataIndex: 'questionBankName',
    },
    {
      title: '做题数',
      key: 'questionNum',
      dataIndex: 'questionNum',
    },
    {
      title: '正确数',
      key: 'correctNum',
      dataIndex: 'correctNum',
    },
    {
      title: '错误数',
      key: 'errorNum',
      dataIndex: 'errorNum',
    },
    {
      title: '答题时间',
      key: 'answerTime',
      dataIndex: 'answerTime',
    },
    {
      title: '操作',
      key: 'action',
      dataIndex: 'action',
    },
  ]);
  const  ipagination = ref({
    current: 1,
    pageSize: 5,
    pageSizeOptions: ['10', '20', '30'],
    showTotal: (total, range) => {
      return range[0] + '-' + range[1] + ' 共' + total + '条';
    },
    showQuickJumper: true,
    showSizeChanger: true,
    total: 0,
  })

  const list = ref<any[]>([]);
  const getList = async () => {
    loading.value = true;
    let res = [];
    if(['2', '3'].includes(activeKey.value)){
      res = await studylist23(activeKey.value);
      res = copyTreeFilterEmptyChildren(copyTreeFilterEmptyChildren(res));
    } else {
      res = await studylist(activeKey.value);
    }
    loading.value = false;
    list.value = res;
    console.log(list.value);
    
  };
  function copyTreeFilterEmptyChildren(tree) {
  // 空树直接返回空数组
  if (!Array.isArray(tree) || tree.length === 0) return [];

  return tree.reduce((newTree, node) => {
    // 1. 判定当前节点是否需要保留：children必须是【非空数组】
    const hasValidChildren = Array.isArray(node.children) && node.children.length > 0;
    if (!hasValidChildren && !node.key) {
      const newNode = { ...node };
      newTree.push(newNode)
      return newTree;
    }
    if (!hasValidChildren) {
      return newTree; // 无有效children，跳过不复制
    }

    // 2. 浅拷贝当前节点（仅复制自身属性，避免引用原对象）
    // 若节点有复杂属性（如Date/RegExp），可替换为深拷贝：const newNode = JSON.parse(JSON.stringify(node))
    const newNode = { ...node };

    // 3. 递归处理子节点，复制并过滤子节点中的空children节点
    newNode.children = copyTreeFilterEmptyChildren(node.children);

    // 4. 将符合条件的新节点加入结果集
    newTree.push(newNode);
    return newTree;
  }, []);
}

  const staticInfo = ref<any>({});
  pageInit();
  function pageInit() {
    getList();
    dailyStatistics().then((res) => {
      staticInfo.value = res;
    });
  }

  const goDetail = (item) => {
    openModalRecord(true, item);
  };

  // 自主刷题
  const openAddModal = ref(false);
  const openAddModalDetail = ref<any>(false);
  const formState = ref({
    category: '1',
    orgCode: undefined,
    questionBankId: undefined
  });
  const departList = ref<any[]>([]);
  const categoryTreeData = ref<any[]>([]);
  const questionBankList = ref<any>([]);
  const getExamList = () => {
    loading.value = true;
    autoBrushQuestionList({
      pageNo: ipagination.value.current,
      pageSize: ipagination.value.pageSize
    }).then(res => {
      examList.value = res.records;
      ipagination.value.total = res.total;
    }).finally(() => {
      loading.value = false;
    })
  }
  const tableChange = (pagination) => {
    ipagination.value = pagination;
    getExamList();
  } 
  const openExamModal = (record) => { 
    router.push({
      path: '/selfexamResult',
      query: {
        id: record.id,
        status: 1
      }
    })
  };
  // 获取分类树结构
  const getTreeData = async (code) => {
    return await loadTreeData({
      async: false,
      pcode: code
    })
  };
  const initTreeData = async () => {
    categoryTreeData.value = await getTreeData('A02');
    categoryTreeData.value = categoryTreeData.value.filter((item) => item.code == 'A02A18');
    categoryTreeData.value[0].children = await getTreeData('A02A18');
  };
  initTreeData();
  // 获取题库
  const getQuestionBankList = () => {
    getQuestionBank({
      orgCode: formState.value.orgCode,
      category: formState.value.category,
    }).then((res) => {
      questionBankList.value = res;
      if(formState.value.questionBankId){
        questionChange(formState.value.questionBankId);
      }
    });
  }
  const add = () => {
    getLastConfig().then(res => {
      if(res && res.orgCode && res.orgCode.length > 9) res.orgCode = res.orgCode.substring(0, 9);
      Object.assign(formState.value, res);
      getQuestionBankList();
      openAddModal.value = true;
    })
  };
  // 开始答题
  const submiting = ref(false);
  const handleOk = () => {
    if(!formState.value.questionBankId) {
      Modal.error({
        title: '请选择题库！'
      });
      return;
    }
    submiting.value = true;
    startExam({
      questionBankId: formState.value.questionBankId,
      orgCode: formState.value.orgCode,
      category: formState.value.category
    }).then(res => {
      sessionStorage.setItem('examPaper', JSON.stringify(res));
      router.push({
        path: '/selfexam',
        query: {
          category: formState.value.category,
          orgCode: formState.value.orgCode,
        }
      });
    }).finally(() => {
      openAddModal.value = false;
      setTimeout(() => {
        submiting.value = false;
      }, 500);
    })
  };
  const selectChange = (val) => {
    getQuestionBankList();
    formState.value.questionBankId = undefined;
    examTableData.value = [];
  };

  const questionChange = (val) => {
    formState.value.questionBankId = val;
    const arr = questionBankList.value.filter((item) => item.id == val);
    examTableData.value = arr;
  };

  // 点击课时名称
  const getStudyDetail = (item) => {
    if (['1', '4'].includes(activeKey.value) && item.progress && item.progress.startsWith('合格')) {
      return;
    }
    if (['1', '4'].includes(activeKey.value)) {
      examStart(item);
    }
    if (activeKey.value == '2') {
      currentClass.value = item;
      videoStart(item);
    }
    if (activeKey.value == '3') {
      currentClass.value = item;
      videoStart(item);
    }
  };

  // 考试开始
  function examStart(item) {
    Modal.confirm({
      title: '点击确认后，将开始考试！',
      onOk() {
        getExamContent({
          type: activeKey.value,
          examId: item.id,
          practiseId: item.practiseId || '',
        }).then((res) => {
          sessionStorage.setItem('examPaper', JSON.stringify({ ...res, exercise: 1 }));
          router.push(`/exam?taskId=${item.id}&type=${activeKey.value}`);
          sessionStorage.setItem('activeKey', activeKey.value);
        });
      },
      onCancel() {
        console.log('Cancel');
      },
      class: 'test',
    });
  }

  // 视频学习开始
  const forbidFastForward = ref(false);
  function videoStart(item) {
    studyPageShow.value = true;
    forbidFastForward.value = item.studyDuration <= item.duration;
    getVideo(item.id).then((res) => {
      currentClass.value.resourceUrl = res[0];
      currentClass.value.currentTime = item.studyDuration;
      if (activeKey.value == '3') {
        studyTime.value = new Date().getTime();
        docStart(res[0]);
      }
    });
  }
  // 文档学习开始
  const previewUrl = ref('');
  function docStart(path) {
    previewFile(path).then((res) => {
      sessionStorage.setItem('startStudyTime', new Date().getTime().toString());
      previewUrl.value = res;
    });
  }

  // 学习时长
  const studyTime = ref(0);
  const playerRef = ref<any>(null);

  const playStart = () => {
    sessionStorage.setItem('startStudyTime', new Date().getTime().toString());
  };
  const playPause = () => {
    studyTime.value = studyTime.value + computedStudyTime();
    sessionStorage.setItem('startStudyTime', '0');
  };
  const playEnd = () => {
    studyTime.value = studyTime.value + computedStudyTime();
    sessionStorage.setItem('startStudyTime', '0');
  };

  const computedStudyTime = () => {
    if (Number(sessionStorage.getItem('startStudyTime')) == 0) return 0;
    return (new Date().getTime() - Number(sessionStorage.getItem('startStudyTime'))) / 1000;
  };

  // 关闭学习页面 添加学习时长
  const closeStudy = async () => {
    studyPageShow.value = false;
    // 观看视频时长
    let time = 0;
    if (activeKey.value == '2') {
      time = parseInt(playerRef.value.currentTime());
    } else if (activeKey.value == '3') {
      time = sessionStorage.getItem('startStudyTime') ? (new Date().getTime() - Number(sessionStorage.getItem('startStudyTime'))) / 1000 : 0;
    }

    await addDuration({
      type: activeKey.value,
      resourceId: currentClass.value.id,
      duration: time,
    }).catch(() => {
      studyTime.value = 0;
      sessionStorage.setItem('startStudyTime', '0');
    });
    pageInit();
    sessionStorage.setItem('startStudyTime', '0');
  };

  const computeTime = (time: number) => {
    if(!time) return '';
    let day = Math.floor(time / 3600 / 24);
    let hour = Math.floor((time / 3600) % 24);
    let minute = Math.floor((time / 60) % 60);
    let second = Math.floor(time % 60);
    return day ? `${day}天${hour}时${minute}分${second}秒` : hour ? `${hour}时${minute}分${second}秒` : `${minute}分${second}秒`;
  };
</script>
<style lang="less" scoped>
  .static-info {
    font-size: 14px;
    font-weight: 600;
    padding: 10px;
    background-color: #fff;
    border-bottom: 1px solid #f0f0f0;
  }
  :deep(.ant-table-title){
    padding: 10px 0;
  }
  .newsUserTraining {
    width: 100%;
    height: 100%;
    padding: 0px;
    background-color: #ffffff;
    .list {
      width: 100%;
      height: calc(100% - 65px);
      padding: 10px 15px;
      background-color: #fff;
      display: flex;
      flex-direction: column;
      .items {
        flex: 1;
      }
    }
    .newsUserTraining-tabs {
      display: flex;
      justify-content: space-between;
      padding: 10px;
      padding-bottom: 0;
      background-color: #fff;
      border-bottom: 1px solid #f0f0f0;
      & > div:nth-child(1) {
        display: flex;
        div {
          width: 104px;
          text-align: center;
          margin-right: 10px;
          background-color: #fafafa;
          border: 1px solid #f0f0f0;
          font-size: 16px;
          color: #666;
          padding: 7px 0px;
          border-radius: 2px 2px 0 0;
          cursor: pointer;
          position: relative;
          z-index: 999;
          margin-bottom: -1px;
        }
        .active {
          color: #1890ff;
          background-color: #fff;
          font-weight: normal;
          border-bottom-color: #fff;
        }
        & > div:nth-child(1) {
          margin-right: 10px;
        }
      }
    }
    .item {
      display: flex;
      flex-direction: column;
      justify-content: space-around;
      height: auto;
      border-radius: 4px;
      position: relative;
      margin-bottom: 10px;
      .name {
        width: 100%;
        line-height: 32px;
        font-weight: 800;
        font-size: 16px;
        padding: 10px 0;
      }
      .gress {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        .bar {
          width: calc(100% - 60px);
          height: 10px;
          margin-right: 10px;
          background-color: #d7d7d7;
          border-radius: 5px;
          overflow: hidden;
          display: flex;
          span {
            display: block;
            height: 100%;
            background-color: #1890ff;
          }
        }
      }
      .high {
        color: #1890ff;
      }
      .tag {
        font-size: 12px;
        padding: 5px 8px;
        border-radius: 4px;
        border: 1px solid transparent;
        background-color: rgb(239, 239, 239);
      }
      .ing {
        border: 1px solid #b7eb8f;
        background-color: #f6ffed;
        color: #389e0d;
      }
    }
    .fixed-height-card {
      border-radius: 7px;
      box-shadow: 5px 5px 5px rgba(0, 0, 0, 0.3);
    }
  }
  .study {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 99999;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    background-color: #0e0e1e;
    .tit {
      height: 65px;
      display: flex;
      align-items: center;
      background-color: #262634;
      color: #ffffff;
      padding: 0 16px;
      justify-content: space-between;
      .name {
        font-size: 18px;
        font-weight: 800;
        padding-left: 16px;
      }
      i {
        font-style: normal;
        font-weight: 600;
      }
      .label {
        padding-left: 16px;
        color: #c9c9c9;
      }
    }
    .study-main {
      flex: 1;
      overflow: hidden;
    }
  }
  .green {
    color: #389e0d;
  }
  .red {
    color: #f5222d;
  }
</style>
