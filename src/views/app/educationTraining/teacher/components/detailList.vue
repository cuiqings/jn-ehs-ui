<template>
  <div class="detail-list" v-for="item in contentList" :key="item.id">
    <div class="name">
      {{ item.stageName }}
    </div>
    <div class="itemtop">
      <div v-if="item.courseList && item.courseList.length > 0">
        <template v-for="(citem, cidx) in item.courseList" :key="citem.id">
          <div class="item" @click="go('video', item.id, citem.id, cidx, item)">
            <div class="title">{{ citem.name }}</div>
            <div class="top">
              <div>
                <van-icon v-if="citem.type == 1" size="18px" color="#1890ff" name="video" />
                <van-icon v-if="citem.type == 2" size="18px" color="#1890ff" name="description" />
                <van-icon v-if="citem.type == 3" size="18px" color="#1890ff" name="audio" />
                <van-icon v-if="!citem.type" size="18px" color="#1890ff" name="todo-list-o" />
                <span>{{ { 1: '视频', 2: '文档', 3: '音频' }[citem.type] }}</span>
              </div>
              <div class="right">
                <span class="n" :class="{ y: citem.studyStatus === '0' }">{{ citem.progress }}</span>
              </div>
            </div>
          </div>
        </template>
      </div>
      <div v-if="item.itemList && item.itemList.length > 0">
        <template v-for="(citem, cidx) in item.itemList" :key="citem.id">
          <div class="item" @click="go('video', item.id, citem.id, cidx, item)">
            <div class="title">{{ citem.name }}</div>
            <div class="top">
              <div>
                <van-icon v-if="citem.type == 1" size="18px" color="#1890ff" name="video" />
                <van-icon v-if="citem.type == 2" size="18px" color="#1890ff" name="description" />
                <van-icon v-if="citem.type == 3" size="18px" color="#1890ff" name="audio" />
                <van-icon v-if="!citem.type" size="18px" color="#1890ff" name="todo-list-o" />
                <span>
                  {{ { 1: '视频', 2: '文档', 3: '音频' }[citem.type] }} 
                  {{ citem.type ? '' : citem.examType === '0' ? '考试' : '模拟考试' }}
                </span>
              </div>
              <div class="right">
                <span class="n" :class="{ y: citem.studyStatus === '0' }">{{ citem.progress }}</span>
                <img v-if="item.lock" src="../../../../../assets/images/app/lock.png" alt="" />
              </div>
            </div>
          </div>
        </template>
      </div>

      <div class="item" @click="startExam(item.mockExam)" v-if="item.mockExam">
        <div class="title">模拟考试</div>
        <div class="top">
          <div>
            <van-icon size="18px" color="#1890ff" name="todo-list" />
            <span>{{ item.mockExam.examName }}</span>
          </div>
        </div>
      </div>

      <div class="item" @click="startExam(item.exam)" v-if="item.exam">
        <div class="title">考试</div>
        <div class="top">
          <div>
            <van-icon size="18px" color="#1890ff" name="todo-list" />
            <span>{{ item.exam.examName }}</span>
          </div>
        </div>
      </div>

      <van-field readonly input-align="right" :border="false" v-model="item.enforceCodeName" label="实施单位：" />
      <van-field readonly input-align="right" :border="false" v-model="item.trainPerson" label="教育者：" />
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { useRouter } from 'vue-router';
  import { ref } from 'vue';
  import { useRoute } from 'vue-router';
  import { trainExamConfig, studentSign, correctionMistakes } from '../../index.api';
  import { useEduStore } from '/@/store/modules/education';
  const route = useRoute();

  const eduStore = useEduStore();
  interface Item {
    itemList: any[];
    id: string;
    stageName: string;
    courseList: any[];
    exam: any;
    enforceCode: string;
    trainPerson: string;
    trainType: string;
  }
  // pageType 1 任务列表页 2 任务详情页 9 教材会审
  const props = withDefaults(
    defineProps<{
      contentList: Array<Item>;
      pageType: string;
      id?: string;
    }>(),
    {
      pageType: '1',
    }
  );

  const emit = defineEmits(['changeClass', 'signed']);
  const router = useRouter();
  // 签到二维码
  const codeUrl = ref('');
  // 去考试，学习
  const go = (tag, contentId, resourceId, cidx, item) => {
    if(route.name == 'AppTeacherStudentDetail') return;
    if (item.lock) return;
    if (props.pageType == '2') {
      emit('changeClass', cidx);
      return;
    }
    if (tag == 'video') {
      router.push(`/app/student/study?id=${route.query.id}&contentId=${contentId}&resourceId=${resourceId}&cidx=${cidx}&pageType=${props.pageType}`);
    } else {
      // router.push('/app/student/exam');
      router.push('/app/student/identify');
    }
  };

  // 订正
  const goQuestion = (item, idx) => {
    sessionStorage.setItem('identify', 'true');
    sessionStorage.setItem(
      'examResult',
      JSON.stringify({
        taskName: '',
        questionList: questionList.value,
      })
    );
    let query = {
      status: 1,
      index: idx,
    };
    router.push({
      path: '/app/student/exam?status=1',
      query: query,
    });
  };

  const showBottom = ref(false);
  const examConfigInfo = ref({});
  const curItem = ref({});
  const startExam = (item) => {
    router.push(`/app/teacher/examPaper?id=${item.id}&status=1`);
  };

  const signShow = ref(false);
  const showHold = ref(false);
  const signature = ref('');
  const dialogConfirm = async () => {
    signShow.value = false;
    showHold.value = false;
    await studentSign({
      id: route.query.id,
      contentId: currentContentId.value,
      sign: signature.value,
    });
    emit('signed');
  };

  const questionList = ref<any[]>([]);
  const currentContentId = ref('');
  const holdSign = (contentId) => {
    showHold.value = true;
    currentContentId.value = contentId;
    correctionMistakes({ taskId: route.query.id, contentId: contentId }).then((res) => {
      questionList.value = res;
    });
  };

  const canExam = (item) => {
    if (item.trainType == 2) return false;
    if (!item.courseList || item.courseList.length == 0) return item.lock;
    let h = item.courseList.every((c) => c.studyStatus === '0');

    return !h;
  };

  const computeTime = (time: number) => {
    let day = Math.floor(time / 3600 / 24);
    let hour = Math.floor((time / 3600) % 24);
    let minute = Math.floor((time / 60) % 60);
    let second = Math.floor(time % 60);
    return day ? `${day}天${hour}时${minute}分${second}秒` : hour ? `${hour}时${minute}分${second}秒` : `${minute}分${second}秒`;
  };
</script>
<style lang="less" scoped>
  .detail-list {
    width: 100%;
    height: auto;
    margin-top: 20px;
    padding: 0 15px;
    .name {
      width: 100%;
      height: 38px;
      font-size: 15px;
      font-weight: 500;
      color: rgba(0, 0, 0, 0.88);
      line-height: 15px;
      margin-bottom: 5px;
      display: flex;
      align-items: center;
      display: flex;
      justify-content: space-between;
      .type {
        font-size: 12px;
        color: #666;
        margin: 0 15px;
      }
    }
    .itemtop {
      width: 100%;
      height: auto;
      margin-top: 10px;
    }
    .hold {
      color: #ee0a24;
    }
    .item {
      width: 100%;
      height: auto;
      background: #fafafa;
      border-radius: 7px;
      display: flex;
      flex-direction: column;
      box-sizing: border-box;
      padding: 10px;
      margin-top: 10px;
      .top {
        width: 100%;
        height: 15px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        span {
          margin-left: 5px;
        }
        img {
          width: 18px;
          height: 18px;
          margin-left: 16px;
        }
        .right {
          display: flex;
          align-items: center;
        }
        div {
          display: flex;
          align-items: center;
        }
      }
      .title {
        width: 100%;
        height: auto;
        font-size: 14px;
        font-weight: 400;
        color: rgba(0, 0, 0, 0.88);
        line-height: 20px;
        text-align: left;
        padding-bottom: 10px;
      }
    }
  }
  .examinfo {
    width: 100%;
    height: 300px;
    .title {
      text-align: center;
      font-size: 16px;
      font-weight: 500;
      color: rgba(0, 0, 0, 0.88);
      line-height: 22px;
      margin-top: 20px;
      font-weight: 600;
    }
    .number-box {
      width: 100%;
      max-height: 410px;
      overflow-y: auto;
      overflow-x: hidden;
      display: grid;
      row-gap: 20px;
      column-gap: 19px;
      grid-template-columns: repeat(6, minmax(0, 1fr));
      box-sizing: border-box;
      padding: 0px 20px 30px 20px;
      margin: 10px 0;
      .num-item {
        width: 40px;
        height: 40px;
        border: 2px solid rgba(0, 0, 0, 0.1);
        border-radius: 50%;
        font-size: 16px;
        line-height: 40px;
        font-weight: 500;
        text-align: center;
        color: rgba(0, 0, 0, 0.45);
      }
      .act-num-item {
        width: 40px;
        height: 40px;
        background: rgba(238, 23, 23, 0.15);
        border-radius: 50%;
        font-size: 16px;
        line-height: 40px;
        font-weight: 500;
        text-align: center;
        color: #f12525;
      }
    }
  }
  .foot {
    position: absolute;
    bottom: 15px;
    width: 100%;
    padding: 0 16px;
  }
  .n {
    font-size: 12px;
    color: #ffffff;
    background-color: #b6b6b6;
    padding: 0px 6px;
    border-radius: 4px;
  }
  .y {
    color: #52c41a;
    background-color: rgba(82, 196, 26, 0.1);
    padding: 0px 6px;
    border-radius: 4px;
  }
</style>
