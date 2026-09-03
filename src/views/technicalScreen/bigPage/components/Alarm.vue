<script setup lang="ts">
  import { computed, ref } from 'vue';
  import { GetAbnormalAlarm } from '../page.api';
  import HistoryDrawer from '/@/views/warn/history/HistoryDrawer.vue';
  import { useModal } from '/@/components/Modal';
  const [registerModal, { openModal }] = useModal();
  //报警数据
  const alarmData = ref([]);
  //一级报警数据
  const firstLevelAlarms: any = ref([]);
  //二级报警数据
  const secondLevelAlarms: any = ref([]);
  // 三级
  const threeAlarms: any = ref([]);
  // 四级
  const fourAlarms: any = ref([]);
  const callThePolice = ref([
    {
      title: '一级报警',
      type: '一级',
    },
    {
      title: '二级报警',
      type: '二级',
    },
  ]);
  const typeActive = ref('一级');
  const data: any = ref([]);
  function getAlarm(val: any) {
    GetAbnormalAlarm({
      organizationCode: val,
    })
      .then((res: any) => {
        alarmData.value = res.result;
        // 获取一级报警和二级报警数组，并使用排序方法
        firstLevelAlarms.value = alarmData.value['一级报警'].map((item) => {
          item.warnConfigName = '一级-' + item.warnConfigName;
          return item;
        });
        secondLevelAlarms.value = alarmData.value['二级报警'].map((item) => {
          item.warnConfigName = '二级-' + item.warnConfigName;
          return item;
        });
        threeAlarms.value = alarmData.value['三级报警'].map((item) => {
          item.warnConfigName = '三级-' + item.warnConfigName;
          return item;
        });
        fourAlarms.value = alarmData.value['四级报警'].map((item) => {
          item.warnConfigName = '四级-' + item.warnConfigName;
          return item;
        });
        data.value = sortAlarms(firstLevelAlarms.value);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  }

  // 新增一个排序方法
  const sortAlarms = (alarms) => {
    return alarms.sort((a, b) => {
      // 第一排序：警告 > 消警
      if (a.warnState !== b.warnState) {
        return a.warnState - b.warnState;
      }
      // 第二排序：按报警时间倒序排列
      return new Date(b.warnDate) - new Date(a.warnDate);
    });
  };

  // 计算一级报警的数量
  const countFirstLevel = computed(() => {
    return firstLevelAlarms.value.length;
  });

  // 计算二级报警的数量
  const countSecondLevel = computed(() => {
    return secondLevelAlarms.value.length;
  });
  const handleLeft = () => {
    if (callThePolice.value[0].type === '三级') {
      callThePolice.value = [
        {
          title: '一级报警',
          type: '一级',
        },
        {
          title: '二级报警',
          type: '二级',
        },
      ];
    }
  };
  const handleRight = () => {
    if (callThePolice.value[0].type === '一级') {
      callThePolice.value = [
        {
          title: '三级报警',
          type: '三级',
        },
        {
          title: '四级报警',
          type: '四级',
        },
      ];
    }
  };
  const handleList = (type) => {
    typeActive.value = type;
    switch (type) {
      case '一级':
        data.value = sortAlarms(firstLevelAlarms.value);
        break;
      case '二级':
        data.value = sortAlarms(secondLevelAlarms.value);
        break;
      case '三级':
        data.value = sortAlarms(threeAlarms.value);
        break;
      case '四级':
        data.value = sortAlarms(fourAlarms.value);
        break;
    }
  };
  const handleView = (data) => {
    openModal(true, {
      record: data,
      isUpdate: true,
      actionType: 'detail',
    });
  };
  defineExpose({
    getAlarm,
  });
</script>

<template>
  <div class="alarm">
    <div class="card-title">
      <div class="title">报警记录</div>
    </div>
    <div class="alarm-level">
      <div :class="callThePolice[0].type === '一级' ? 'lf lf_b' : 'lf lf_c'" @click="handleLeft">{{ '<' }}</div>
      <div class="content">
        <div
          :class="callThePolice[0].type === typeActive ? 'alarmfont level_b level1' : 'alarmfont level level1'"
          @click="handleList(callThePolice[0].type)"
          >{{ callThePolice[0].title }} ({{ callThePolice[0].type === '一级' ? countFirstLevel : threeAlarms.length }})</div
        >
        <div
          :class="callThePolice[1].type === typeActive ? 'alarmfont level_b level2' : 'alarmfont level level2'"
          @click="handleList(callThePolice[1].type)"
          >{{ callThePolice[1].title }} ({{ callThePolice[1].type === '二级' ? countSecondLevel : fourAlarms.length }})</div
        >
      </div>
      <div :class="callThePolice[0].type === '三级' ? 'ri ri_b' : 'ri ri_c'" @click="handleRight">{{ '>' }}</div>
    </div>

    <div class="alarm-level-main">
      <div class="scroll-container">
        <!-- 一级报警内容 -->
        <div class="detail-alarm" v-for="(item, index) in data" :key="index" @click="handleView(item)">
          <img src="../../../../assets/images/controlScreen/alarmsg1.png" class="alarm-sign" />
          <div>
            <div class="level-alarm-name">
              <div :title="item.warnConfigName">{{ item.warnConfigName }}</div>
              <a-tag v-if="item.warnState == 1" color="green">销警</a-tag>
              <a-tag v-else color="red">报警</a-tag>
            </div>
            <div class="level-alarm-time"
              ><span style="width: 150px">{{ item.warnDate }}</span
              ><span :title="item.departName">{{ item.departName }}</span></div
            >
          </div>
        </div>
        <div v-if="!data.length" style="padding-top: 50px">
          <a-empty />
        </div>
      </div>
    </div>
  </div>
  <history-drawer @register="registerModal" />
</template>

<style scoped>
  .alarm {
    display: flex;
    flex-direction: column;
    width: 392px;
    height: 380px;
    .card-title {
      height: 40px;
      background: url('../../../../assets/images/controlScreen/alarmbg.png') no-repeat;
      position: relative;
      .title {
        font-size: 18px;
        text-align: left;
        font-weight: bold;
        color: #f4fffe;
        margin-left: 58px;
        line-height: 38px;
        /* font-family:PangMenZhengDao-Regular; */
      }
    }

    .alarm-level {
      width: 380px;
      height: 40px;
      display: flex;
      margin-top: 7px;
      padding-left: 7px;
      padding-right: 7px;
      position: relative;
      .lf,
      .ri {
        width: 20px;
        font-size: 15px;
        text-align: center;
        line-height: 36px;
        cursor: pointer;
      }
      .lf_c,
      .ri_c {
        background: url('../../../../assets/images/controlScreen/alarm_level1.png') no-repeat;
      }
      .lf_b,
      .ri_b {
        background: url('../../../../assets/images/controlScreen/alarm_level4.png') no-repeat;
        cursor: not-allowed;
      }
      .lf {
        margin-right: 7px;
      }
      .ri {
        margin-left: 7px;
      }
      .content {
        width: 312px;
      }
      .level1 {
        margin-right: 8px;
      }
      .level1,
      .level2 {
        cursor: pointer;
        height: 39px;
        width: 152px;
        font-size: 15px;
        text-align: center;
        line-height: 36px;
        display: inline-block;
      }
      .level {
        background: url('../../../../assets/images/controlScreen/alarm_level1.png') no-repeat;
      }
      .level_b {
        background: url('../../../../assets/images/controlScreen/alarm_level3.png') no-repeat;
      }
    }
    .scroll-container {
      max-height: 210px; /* 最大高度为280px */
      overflow-y: auto; /* 创建垂直滚动容器 */
    }
    .alarm-level-main {
      width: 392px;
      height: 210px;
      display: flex;
      flex-direction: column;
      margin-top: 11px;
      overflow: hidden;
      .detail-alarm {
        margin-top: 9px;
        margin-left: 9px;
        width: 370px;
        height: 60px;
        border-left: 2px solid #334c92;
        border-bottom: 1px solid #1f2b43;
        border-top: 1px solid #1f2b43;
        border-right: 1px solid #1f2b43;
        background-color: #0a162c;
        padding: 0 15px 0 10px;
        cursor: pointer;
        display: flex;
        align-items: center;
        .alarm-sign {
          width: 39px;
          height: 24px;
          padding-right: 15px;
        }
        & > div {
          height: 46px;
          .level-alarm-name {
            display: flex;
            width: 311px;
            font-size: 15px;
            color: #e4eaf2;
            & > div {
              width: 263px;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            }
            & > span {
              height: 20px;
            }
          }
          .level-alarm-time {
            width: 311px;
            font-size: 14px;
            color: #adc9e9;
            display: flex;
            justify-content: space-between;
            & > span:nth-child(2) {
              padding-right: 5px;
              color: #fff;
              width: calc(100% - 160px);
              text-align: right;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }
          }
          .alarm-state {
            width: 56px;
          }
        }
      }
    }
  }
</style>
