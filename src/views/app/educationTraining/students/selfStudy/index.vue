<template>
  <div class="hiddendanger">
    <div class="static-info">
      <div>
        今日已完成每日一练，学分+{{ staticInfo.dayCredits }}； 已学习视频{{ staticInfo.videoCount }}个， 学习时长{{
          computeTime(staticInfo.videoDuration)
        }}，学分+{{ staticInfo.videoCredits }}； 已学习文档{{ staticInfo.docCount }}个，学习时长{{ computeTime(staticInfo.docDuration) }}，学分+{{
          staticInfo.docCredits
        }}； 刷题{{ staticInfo.practiseCount }}个，刷题时长{{ computeTime(staticInfo.practiseDuration) }}，学分+{{ staticInfo.practiseCredits }}，
        总学分{{ staticInfo.totalCredits }}。<span class="detailbtn" @click="goDetail">详情>></span>
      </div>
    </div>
    <van-tabs v-model:active="active" @change="tabChange">
      <van-tab title="每日一练" name="1">
        <div class="tab-inner">
          <div class="item" v-for="item in list" :key="item.id" @click="startExam(item)">
            <div class="tit"><van-icon name="todo-list-o" style="font-size: 22px; color: #1989fa" />{{ item.name }}</div>
            <div class="info">
              <div class="status">{{ item.progress }}</div>
              <van-button v-if="item.progress" plain type="primary" @click.stop="showExamRecord(item)">明细</van-button>
            </div>
          </div>
        </div>
      </van-tab>
      <van-tab title="视频学习" name="2">
        <div class="tab-inner">
          <RecursiveMenu @item-click="startExam" :list="list2">
            <template v-slot>
              <van-icon name="video-o" style="font-size: 22px; color: #1989fa; margin-right: 10px;" />
            </template>
          </RecursiveMenu>
        </div>
      </van-tab>
      <van-tab title="文档学习" name="3">
        <div class="tab-inner">
          <RecursiveMenu @item-click="startExam" :list="list3">
            <template v-slot>
              <van-icon name="description-o" style="font-size: 22px; color: #1989fa; margin-right: 10px;" />
            </template>
          </RecursiveMenu>
        </div>
      </van-tab>
      <van-tab title="自由答题" name="4">
        <div class="tab-inner">
          <div class="item" v-for="item in list4" :key="item.id" @click="startExam(item)">
            <div class="tit"><van-icon name="todo-list-o" style="font-size: 22px; color: #1989fa" />{{ item.name }}</div>
            <div class="info">
              <div class="status">{{ item.progress }}</div>
              <van-button plain v-if="item.progress" type="primary" @click.stop="showExamRecord(item)">明细</van-button>
            </div>
          </div>
        </div>
      </van-tab>
      <van-tab title="自主刷题" name="5">
        <div class="tab-inner">
          <ListEl
            :list="examList" 
            ref="listRef" 
            :total="total"
            :immediateCheck="true"
            @openDetail="openDetail"
            @onLoad="onLoad"
            @onRefresh="onRefresh" />
        </div>
      </van-tab>
    </van-tabs>
    <FloatingBubble @click="addExam" v-if="active == '5'" icon="plus" /> 
    <ExamRecord ref="examRecordRef" v-if="showRecord" :practiseId="practiseId" v-model:show="showRecord" />
    <!--新增自主刷题-->
    <van-popup v-model:show="showAddExam" position="bottom" :style="{ height: '70%' }">
      <div class="title">选择题库</div>
      <van-field @clear="clearCategory" clearable v-model="formState.categoryName" readonly label="分类" placeholder="请选择分类" @click="showCategoryPicker = true" />
      <van-field @clear="clearOrg" clearable v-model="formState.orgName" readonly label="选择事业部" placeholder="请选择所属单位" @click="showOrgPicker = true" />
      <van-field required v-model="formState.questionBankName" readonly label="选择题库" placeholder="请选择题库" @click="showQuestionBankPicker = true" />
      <a-table :columns="columns2" :data-source="examTableData" :pagination="false"> </a-table>
      <div class="footer">
        <van-button type="default" @click="cancelExam">取消</van-button>
        <van-button type="primary" :loading="submiting" @click="submitExam">开始答题</van-button>
      </div>
    </van-popup>
    <!-- 所属单位选择器 -->
    <van-popup v-model:show="showOrgPicker" position="bottom">
      <van-picker
        :columns="orgList"
        :columns-field-names="{ text: 'departName', value: 'orgCode' }"
        @confirm="onOrgConfirm"
        @cancel="showOrgPicker = false"
      />
    </van-popup>
    <!-- 分类 -->
    <van-popup v-model:show="showCategoryPicker" position="bottom">
      <van-picker
        :columns="categoryTreeData"
        :columns-field-names="{ text: 'title', value: 'code' }"
        @confirm="onCategoryConfirm"
        @cancel="showCategoryPicker = false"
      />
    </van-popup>
    <!-- 题库 -->
    <van-popup v-model:show="showQuestionBankPicker" position="bottom">
      <van-picker
        :columns="questionBankList"
        :columns-field-names="{ text: 'name', value: 'id' }"
        @confirm="onQuestionBankConfirm"
        @cancel="showQuestionBankPicker = false"
      />
    </van-popup>
  </div>
</template>
<script lang="ts" setup>
  import { studylist, studylist23, getExamContent, dailyStatistics, getQuestionBank, startExam as slefStartExam, autoBrushQuestionList, getLastConfig } from '/@/views/education/student/selfStudy/url/index';
  import { showConfirmDialog, FloatingBubble, showFailToast  } from 'vant';
  import { get3DepartList, loadTreeData } from '/@/api/common/api';
  import { ref, onMounted } from 'vue';
  import { useRouter, onBeforeRouteLeave } from 'vue-router';
  import ListEl from './components/list.vue'
  import ExamRecord from './emamRecord.vue';
  import RecursiveMenu from './components/loopEl.vue'

  const router = useRouter();
  const list = ref<any[]>([]);
  const list2 = ref<any[]>([]);
  const list3 = ref<any[]>([]);
  const list4 = ref<any[]>([]);
  const active = ref(sessionStorage.getItem('activeKey') || '1');
  const examFlag = ref(false);
  onBeforeRouteLeave((to: any, from: any) => {
    sessionStorage.setItem('activeKey', active.value);
  });
  const staticInfo = ref<any>({});
  onMounted(() => {
    console.log('mounted');
    
    sessionStorage.removeItem('activeKey');
    // 首次加载列表
    setTimeout(() => {
      tabChange(active.value);
      dailyStatistics().then((res) => {
        staticInfo.value = res;
      });
    }, 300)
  });

  const showRecord = ref(false);
  const practiseId = ref('');
  const showExamRecord = (item) => {
    showRecord.value = true;
    practiseId.value = item.practiseId;
  };

  const tabChange = (e) => {
    active.value = e;
    getList().then((res) => {
      if (active.value == '1') {
        list.value = res;
      } else if (active.value == '2') {
        list2.value = copyTreeFilterEmptyChildren(res);
      } else if (active.value == '3') {
        list3.value = copyTreeFilterEmptyChildren(copyTreeFilterEmptyChildren(res));
      } else if (active.value == '4') {
        list4.value = res;
      }
    });
  };

  function getList() {
    if(['2', '3'].includes(active.value)){
      return studylist23(active.value);
    } else {
      return studylist(active.value);
    }
  }

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

  // 卡片跳转
  const goDetail = () => {
    router.push('/app/students/selfStudyDetail');
  };

  // 开始学习
  const startExam = (item) => {
    console.log('startExam', item);
    
    if (['1', '4'].includes(active.value) && item.progress && item.progress.startsWith('合格')) {
      return;
    }
    if (['1', '4'].includes(active.value)) {
      if (examFlag.value) return;
      examFlag.value = true;
      showConfirmDialog({
        title: '提示',
        message: '点击确认后，将开始考试！',
      }).then(async () => {
        await getExamContent({ type: active.value, examId: item.id, practiseId: item.practiseId }).then((res) => {
          sessionStorage.setItem('examPaper', JSON.stringify({ ...res, exercise: 1 }));
          sessionStorage.setItem('identify', 'true');
          router.push(`/app/student/exam?taskId=${item.id}&type=${active.value}`);
        });
      }).finally(() => {
        setTimeout(() => {
          examFlag.value = false
        }, 1000)
      })
    }
    // 视频学习
    if (active.value == '2') {
      router.push(`/app/students/selfStudying?id=${item.id}&type=${active.value}&selfStudy=1&name=${item.name}&s=${item.duration}&t=${item.duration-1000}&st=${item.studyDuration}`);
    }
    // 文档学习
    if (active.value == '3') {
      router.push(`/app/students/selfStudying?id=${item.id}&type=${active.value}&selfStudy=1&name=${item.name}`);
    }
  };

  const computeTime = (time: number) => {
    if(!time) return '';
    let day = Math.floor(time / 3600 / 24);
    let hour = Math.floor((time / 3600) % 24);
    let minute = Math.floor((time / 60) % 60);
    let second = Math.floor(time % 60);
    return day ? `${day}天${hour}时${minute}分${second}秒` : hour ? `${hour}时${minute}分${second}秒` : `${minute}分${second}秒`;
  };

  // 自主刷题
  const loading = ref(false);
  const showAddExam = ref(false);
  const orgList = ref<any[]>([]);
  const showOrgPicker = ref(false);
  // 自主刷题
  const showQuestionBankPicker = ref(false);
  const showCategoryPicker = ref<any>(false);
  const formState = ref({
    category: 'A02A181',
    categoryName: '自主刷题',
    orgName: '',
    orgCode: undefined,
    questionBankName: '',
    questionBankId: ''
  });
  const categoryTreeData = ref<any[]>([]);
  const questionBankList = ref<any>([]);
  const examList = ref<any[]>([]);
  const total = ref(0);
  const listRef = ref();
  
  const onLoad = async (params) => {
    const res = await getExamList(params);
    total.value = res.total;
    examList.value = [...examList.value, ...res.records]
    listRef.value.loadEnd(examList.value.length >= total.value);
  }
  const onRefresh = async (params) => {
    const res = await getExamList(params);
    total.value = res.total;
    examList.value = res.records
    listRef.value.refreshEnd(examList.value.length >= total.value);
  }

  const openDetail = (item) => {
    console.log(item);
    router.push({
      path: `/app/students/selfStudyExamResult`,
      query: {
        status: 1,
        id: item.id
      }
    });
  }
  const getExamList = async (params) => {
    return await autoBrushQuestionList({
      pageNo: 1,
      pageSize: 10,
      ...params
    })
  }

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
    categoryTreeData.value[0].children = [ {title: '全部', code: ''}, ...await getTreeData('A02A18')];
  };
  initTreeData();
  // 获取题库
  const getQuestionBankList = () => {
    getQuestionBank({
      orgCode: formState.value.orgCode,
      category: formState.value.category,
    }).then((res) => {
      questionBankList.value = res;
      const current = res.filter(val => val.id == formState.value.questionBankId);
      if(current && current.length > 0){
        questionChange(formState.value.questionBankId);
        // formState.value.questionBankName = res.filter(val => val.id == formState.value.questionBankId)[0].name;
      } else {
        formState.value.questionBankName = '';
        formState.value.questionBankId = '';
      }
    });
  }

  const clearCategory = () => {
    formState.value.category = '';
    formState.value.categoryName = '';
    getQuestionBankList();
  }
  const clearOrg = () => {
    formState.value.orgCode = '';
    formState.value.orgName = '';
    getQuestionBankList();
  }

  const questionChange = (val) => {
    formState.value.questionBankId = val;
    const arr = questionBankList.value.filter((item) => item.id == val);
    formState.value.questionBankName = arr[0].name;
    examTableData.value = arr;
  };
  const addExam = () => {
    getLastConfig().then(res => {
      if(res) {
        Object.assign(formState.value, res);
        if(res.orgCode) {
          const orgs = orgList.value.filter(item => res.orgCode.startsWith(item.orgCode));
          formState.value.orgName = orgs[0].departName;
        }
      }
      getQuestionBankList();
      showAddExam.value = true;
    })
  }
  const onOrgConfirm = ({selectedOptions}) => {
    showOrgPicker.value = false;
    formState.value.orgName = selectedOptions[0].departName;
    formState.value.orgCode = selectedOptions[0].orgCode;
    getQuestionBankList();
  }
  const onCategoryConfirm = ({selectedOptions}) => {
    console.log(selectedOptions);
    showCategoryPicker.value = false;
    formState.value.categoryName = selectedOptions[1].title;
    formState.value.category = selectedOptions[1].code;
    if(formState.value.categoryName == '全部'){
      formState.value.categoryName = selectedOptions[0].title;
      formState.value.category = selectedOptions[0].code;
    }
    getQuestionBankList();
  }
  const onQuestionBankConfirm = ({selectedOptions}) => {
    showQuestionBankPicker.value = false;
    formState.value.questionBankName = selectedOptions[0].name;
    formState.value.questionBankId = selectedOptions[0].id;
    examTableData.value = [selectedOptions[0]];
    questionChange(formState.value.questionBankId);
  }
  const submiting = ref(false);
  const submitExam = () => { 
    loading.value = true;
    if(!formState.value.questionBankId) {
      showFailToast('请选择题库！');
      return;
    }
    submiting.value = true;
    slefStartExam({
      questionBankId: formState.value.questionBankId,
      orgCode: formState.value.orgCode,
      category: formState.value.category
    }).then(res => {
      sessionStorage.setItem('examPaper', JSON.stringify(res));
      router.push({
        path: '/app/students/selfStudyExam'
      })
    }).finally(() => {
      setTimeout(() => {
        submiting.value = false;
      }, 500);
    })
    
  }; 
  const cancelExam = () => {
    showAddExam.value = false;
    formState.orgName = '';
    formState.orgCode = '';
  };
   // 获取所属单位
  const getOrgList = async () => {
    const res: any = await get3DepartList();
    const rows: any[] = Array.isArray(res) ? res : Array.isArray(res?.records) ? res.records : [];
    if (rows.length > 0) {
      orgList.value = rows;
    }
  };
  getOrgList();

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
</script>

<style lang="less" scoped>
  .static-info {
    color: #555;
    font-size: 14px;
    font-weight: 600;
    padding: 10px;
    background-color: #fff;
    border-bottom: 1px solid #f0f0f0;
    display: flex;
    .detailbtn {
      color: #1989fa;
      cursor: pointer;
    }
  }
  .hiddendanger {
    width: 100%;
    height: 100%;

    .tab-inner {
      height: calc(100vh - 87px);
      overflow-y: scroll;
      padding: 10px;
      background-color: #f5f5f5;
      .item {
        padding: 10px;
        background-color: #fff;
        border-radius: 10px;
        margin-bottom: 10px;
        .tit {
          color: #333;
          font-size: 14px;
          font-weight: 600;
          line-height: 22px;
          margin-bottom: 10px;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          i {
            margin-right: 5px;
            transform: translateY(3px);
          }
        }
        .info {
          display: flex;
          align-items: center;
          justify-content: space-between;
          .status {
            font-size: 14px;
          }
        }
      }
    }

    .add-btn {
      position: fixed;
      bottom: 30px;
      right: 25px;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 50px;
      height: 50px;
      background-color: #1989fa;
      border-radius: 50%;
    }

    .add {
      width: 36px;
      height: 36px;
      transform: translateY(-2px);
    }
  }
  .title{
    font-size: 16px;
    font-weight: 600;
    text-align: center;
    padding: 10px;
  }
  .footer{ 
    width: 100%;
    position: absolute;
    bottom: 0;
    left: 0;
    display: flex;
    justify-content: space-around;
    height: 45px;
    align-items: center;
    background-color: #fff;
  }
</style>
