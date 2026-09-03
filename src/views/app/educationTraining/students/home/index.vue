<template>
  <div class="student-home" v-watermark>
    <div class="hd">
      <div class="imgwrap">
        <img v-if="detailInfo.avatar" :src="getFileAccessHttpUrl(detailInfo.avatar)" alt="" />
        <img v-else src="../../../../../assets/images/default-avatar.png" alt="" />
      </div>
      <div>
        <div class="title">{{ detailInfo.userName }}</div>
        <div class="desc">{{ detailInfo.orgName }}</div>
      </div>
    </div>
    <div class="task-progress">
      <div class="left">
        <span>{{ detailInfo.duration == 0 ? '0时0分' : formatTime(detailInfo.duration) }}</span>
        <div>今日学习</div>
      </div>
      <div class="right">
        <span>{{ detailInfo.totalDuration == 0 ? '0时0分' : formatTime(detailInfo.totalDuration) }}</span>
        <div>累计学习</div>
      </div>
    </div>
    <div class="icon">
      <dl @click="$router.push('/app/student/trainingTask')">
        <dd><img src="../../../../../assets/images/app/edu/ttask.png" alt="" /></dd>
        <dt>培训任务</dt>
      </dl>
      <dl @click="$router.push('/app/student/examTask')">
        <dd><img src="../../../../../assets/images/app/edu/etask.png" alt="" /></dd>
        <dt>考试任务</dt>
      </dl>
      <!-- <dl @click="$router.push('/app/students/selfStudy')">
        <dd
          ><div class="lx"><img src="../../../../../assets/images/app/edu/lx.png" alt="" /></div
        ></dd>
        <dt>每日一练</dt>
      </dl> -->
      <dl @click="$router.push('/app/student/studyRecord')">
        <dd><img src="../../../../../assets/images/app/edu/record.png" alt="" /></dd>
        <dt>学习记录</dt>
      </dl>
      <dl @click="$router.push('/app/student/certificate')">
        <dd><img src="../../../../../assets/images/app/edu/cert.png" alt="" /></dd>
        <dt>我的证书</dt>
      </dl>
    </div>
    <div class="tit">当前任务</div>
    <div class="tasklist" v-loading="loading">
      <template v-for="item in detailInfo.taskList">
        <div v-if="item.taskType == 1" class="item" @click="openExamDetail(item)">
          <span class="tag">考试</span>
          <div class="name">{{ item.taskName }}</div>
          <div class="gress"
            ><div class="bar"><span :style="{ width: '0%' }"></span></div>{{ item.taskStatus }}</div
          >
        </div>
        <div v-if="item.taskType == 2" class="item" @click="openDetail(item)">
          <span class="tag">培训</span>
          <div class="name">{{ item.taskName }}</div>
          <div class="gress"
            ><div class="bar"><span :style="{ width: item.taskProgress + '%' }"></span></div>{{ item.taskProgress }}%</div
          >
        </div>
      </template>
    </div>
    <examDescribe :examConfigInfo="examConfigInfo" :taskItem="curItem" v-model:show="showBottom" />
  </div>
</template>

<script lang="ts" setup>
  import { ref, computed } from 'vue';
  import { useRouter } from 'vue-router';
  import { userHome, examConfig } from '../../index.api';
  import examDescribe from '../components/examDescribe.vue';
  import { getFileAccessHttpUrl } from '/@/utils/common/compUtils';
  import { useEduStore } from '/@/store/modules/education';
  import { showFailToast } from 'vant'

  const eduStore = useEduStore();
  const router = useRouter();
  const detailInfo = ref<any>({});
  // source 0培训任务 1考试任务
  const openDetail = (item) => {
    let query = { id: item.taskId, source: 0 };
    router.push({ path: '/app/student/trainingTaskDetail', query: query });
  };
  const loading = ref(false);
  pageInit();
  function pageInit() {
    loading.value = true;
    userHome().then((res) => {
      console.log(res);
      detailInfo.value = res;
    }).finally(() => {
      loading.value = false;
    });
  }

  const examConfigInfo = ref<any>({});
  const curItem = ref<any>({});
  const showBottom = ref(false);
  const openExamDetail = (item) => {
    if(['未开始', '已结束'].includes(item.taskStatus)){
      showFailToast('任务'+item.taskStatus);
      return;
    }
    examConfig({ id: item.taskId }).then((res) => {
      eduStore.setExamConfig(res);
      showBottom.value = true;
      curItem.value = { ...item, source: 1, examType: 0 };
      examConfigInfo.value = res;
    });
  };
  // 将秒转换为月天时分秒
  // const formatTime = (time) => {
  //   let h = time ? Math.floor(time / 3600) : 0;
  //   let m = time ? Math.floor((time % 3600) / 60) : 0;
  //   return `${h}时${m}分`;
  // };
  function formatTime(seconds, options = {}) {
  const { 
    separator = ' ', 
    showZero = false, 
    padZero = false 
  } = options;
  
  if (typeof seconds !== 'number' || isNaN(seconds) || seconds < 0) {
    return '0秒';
  }

  // 计算各时间单位
  // const month = Math.floor(seconds / (30 * 24 * 60 * 60));
  // seconds %= 30 * 24 * 60 * 60;
  
  const days = Math.floor(seconds / (24 * 60 * 60));
  seconds %= 24 * 60 * 60;
  
  const hours = Math.floor(seconds / (60 * 60));
  seconds %= 60 * 60;
  
  const minutes = Math.floor(seconds / 60);
  seconds %= 60;
  
  // 生成各单位的显示文本
  const units = [
    // { value: month, unit: '月' },
    { value: days, unit: '天' },
    { value: hours, unit: '时' },
    { value: minutes, unit: '分' },
    // { value: seconds, unit: '秒' }
  ];
  
  // 过滤并格式化
  return units
    .filter(unit => showZero || unit.value > 0)
    .map(unit => {
      const value = padZero && unit.value < 10 ? `0${unit.value}` : unit.value;
      return `${value}${unit.unit}`;
    })
    .join(separator) || '0秒'; // 若所有单位为0且showZero=false，返回0秒
}
</script>

<style lang="less">
  .student-home {
    width: 100%;
    height: 100%;
    background-color: #ffffff;
    .hd {
      height: 100px;
      display: flex;
      align-items: center;
      padding: 10px 16px;
      .title {
        font-weight: 600;
        font-size: 16px;
        margin-bottom: 5px;
      }
      .imgwrap {
        margin-right: 10px;
        border-radius: 50%;
        width: 80px;
        height: 80px;
        overflow: hidden;
        img {
          width: 80px;
          height: 80px;
        }
      }
    }
    .task-progress {
      display: flex;
      justify-content: space-between;
      text-align: center;
      background-color: #e9f2fa;
      padding: 10px 16px;

      .left,
      .right {
        width: 50%;
        span {
          font-size: 24px;
          font-weight: 600;
        }
        div {
          font-size: 14px;
          color: #666666;
        }
      }
    }
    .tit {
      font-size: 16px;
      color: #1890ff;
      font-weight: 600;
      padding: 10px 16px;
    }
    .icon {
      display: flex;
      justify-content: space-around;
      padding: 10px 16px;
      border-bottom: 1px solid #e9e9e9;
      border-top: 1px solid #e9e9e9;
      dl {
        display: flex;
        flex-direction: column;
        align-items: center;
        margin: 10px 0;
        text-align: center;
        dd {
          width: 50px;
          height: 50px;
          background-color: #1890ff;
          border-radius: 50%;
        }
        dt {
          font-size: 14px;
          color: #666666;
        }
      }
    }
    .tasklist {
      padding: 10px 16px;
      .item {
        display: flex;
        flex-direction: column;
        justify-content: space-around;
        background-color: #f2f2f2;
        padding: 15px 16px;
        height: auto;
        border-radius: 4px;
        position: relative;
        margin-bottom: 10px;
        .name {
          width: 100%;
          line-height: 32px;
        }
        .gress {
          width: 100%;
          display: flex;
          align-items: center;
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
        .tag {
          position: absolute;
          right: 16px;
          top: 5px;
          font-size: 12px;
        }
      }
    }
  }
  .lx {
    width: 50px;
    height: 50px;
    background-color: #1890ff;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    img {
      width: 25px;
      height: 25px;
    }
  }
</style>
