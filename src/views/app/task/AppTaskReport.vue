<template>
  <div class="taskReport">
    <section>
      <div class="report-each">
        <dl>
          <dt>{{ statusCount.dhb }}</dt>
          <dd>待汇报</dd>
        </dl>
        <dl>
          <dt>{{ statusCount.jxz }}</dt>
          <dd>进行中</dd>
        </dl>
        <dl>
          <dt>{{ statusCount.wcy }}</dt>
          <dd>我的参与</dd>
        </dl>
      </div>
      <div class="report-main">
        <van-tabs v-model:active="active" @click-tab="onClickTab">
          <van-tab>
            <template #title>
              <span>进行中 {{ statusCount.jxz }}</span>
            </template>
            <div class="report-box">
              <van-list v-model:loading="loading" v-model:error="error" :finished="finished" finished-text="没有更多了" @load="onLoad1">
                <div class="task-list" @click="onMyPar(1, v)" v-for="(v, i) in records1" :key="i">
                  <div class="report-limit">
                    <span class="finish-limit">
                      <van-tag color="#ddebfe" text-color="#3E87F8" type="primary" size="medium">{{ v.taskType_dictText }}</van-tag>
                      <span class="limit-date">完成时限：{{ v.completeTimeLimit }}</span>
                    </span>
                    <span :class="v.status != 2 ? '' : 'hide'">
                      <span :class="v.reportTag == '验收未通过' ? 'acceptance-red' : 'acceptance-yell'">{{ v.reportTag }}</span>
                    </span>
                    <img :class="v.status == 2 ? '' : 'hide'" src="../../../assets/images/done.png" alt="" />
                  </div>
                  <p> 工作任务：{{ v.workContent }} </p>
                  <div class="report-comments">
                    <span class="comments-new" v-if="false">有1条新评论</span>
                    <van-button :class="v.canReport == true ? '' : 'hide'" type="primary" size="mini" @click.stop="onMyPar(1, v, true)"
                      >汇报</van-button
                    >
                  </div>
                </div>
              </van-list>
            </div>
          </van-tab>
          <van-tab>
            <template #title>
              <span>我参与的 {{ statusCount.wcy }}</span>
            </template>
            <div class="report-box">
              <van-list v-model:loading="loading" v-model:error="error" :finished="finished" finished-text="没有更多了" @load="onLoad1">
                <div @click="onMyPar(2, v)" class="task-list" v-for="(v, i) in records1" :key="i">
                  <div class="report-limit">
                    <span class="finish-limit">
                      <van-tag color="#ddebfe" text-color="#3E87F8" type="primary" size="medium">{{ v.taskType_dictText }}</van-tag>
                      <span class="limit-date">完成时限：{{ v.completeTimeLimit }}</span>
                    </span>
                    <span :class="v.status != 2 ? '' : 'hide'">
                      <span :class="v.reportTag == '验收未通过' ? 'acceptance-red' : 'acceptance-yell'">{{ v.reportTag }}</span>
                    </span>
                    <img :class="v.status == 2 ? '' : 'hide'" src="../../../assets/images/done.png" alt="" />
                  </div>
                  <p> 工作任务:{{ v.workContent }} </p>
                  <div class="report-comments" v-if="false">
                    <span class="comments-new">有1条新评论</span>
                    <!-- <van-button type="primary" plain size="mini">查看</van-button> -->
                  </div>
                </div>
              </van-list>
            </div>
          </van-tab>
          <van-tab>
            <template #title>
              <span>已完成 {{ statusCount.ywc }}</span>
            </template>
            <div class="report-box">
              <van-list v-model:loading="loading" v-model:error="error" :finished="finished" finished-text="没有更多了" @load="onLoad1">
                <div @click="onMyPar(3, v)" class="task-list" v-for="(v, i) in records1" :key="i">
                  <div class="report-limit">
                    <span class="finish-limit">
                      <van-tag color="#ddebfe" text-color="#3E87F8" type="primary" size="medium">{{ v.taskType_dictText }}</van-tag>
                      <span class="limit-date">完成时限：{{ v.completeTimeLimit }}</span>
                    </span>
                    <span :class="v.status != 2 ? '' : 'hide'">
                      <span :class="v.reportTag == '验收未通过' ? 'acceptance-red' : 'acceptance-yell'">{{ v.reportTag }}</span>
                    </span>
                    <img :class="v.status == 2 ? '' : 'hide'" src="../../../assets/images/done.png" alt="" />
                  </div>
                  <p> 工作任务:{{ v.workContent }} </p>
                  <div class="report-comments" v-if="false">
                    <span class="comments-new">有1条新的回复</span>
                    <!-- <van-button type="primary" plain size="mini">查看</van-button> -->
                  </div>
                </div>
              </van-list>
            </div>
          </van-tab>
        </van-tabs>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
  import { toDebriefed, debriefedCount } from './appTask.api';
  import { ref } from 'vue';
  import { useRouter, useRoute } from 'vue-router';
  const router = useRouter();
  const route = useRoute();
  const active = ref(0);
  const statusCount = ref({});
  const typeNum = ref(1);
  const loading = ref(false);
  const finished = ref(false);
  const current = ref(1);
  const pageSizeRef = ref(10);
  const total1 = ref(0);
  const records1 = ref([]);
  //跳详情
  const onMyPar = (taskStatus, item, isShow) => {
    router.push({
      name: 'AppTaskDetail',
      query: {
        taskStatus,
        id: item.id,
        isReport: isShow, // 是否是汇报
      },
    });
  };
  //tab
  const onClickTab = ({ name }) => {
    if (name == 0) {
      typeNum.value = 1;
      records1.value = [];
      current.value = 1;
      total1.value = 0;
      debriefedData(1);
    } else if (name == 1) {
      //3
      typeNum.value = 3;
      records1.value = [];
      current.value = 1;
      total1.value = 0;
      debriefedData(1);
    } else if (name == 2) {
      typeNum.value = 2;
      records1.value = [];
      current.value = 1;
      total1.value = 0;
      debriefedData(1);
    }
  };
  debriefedNumber();
  debriefedData(1);
  //应用状态的数量
  async function debriefedNumber() {
    await debriefedCount().then((res) => {
      // console.log(res);
      statusCount.value = res;
    });
  }
  //下拉加载
  const onLoad1 = () => {
    // 数据全部加载完成
    if (records1.value.length >= total1.value) {
      finished.value = true;
    } else {
      finished.value = false;
      // 加载状态结束
      loading.value = false;
      current.value += 1;
      debriefedData(current.value);
    }
  };
  //应用列表
  async function debriefedData(arg) {
    if (arg === 1) {
      current.value = 1;
      records1.value = [];
    }
    loading.value = true;
    let params = {
      type: typeNum.value,
      pageNo: current.value,
      pageSize: pageSizeRef.value,
    };
    await toDebriefed(params).then((res) => {
      records1.value = records1.value.concat(res.records);
      total1.value = res.total;
      loading.value = false;
    });
  }
</script>

<style lang="less" scoped>
  .taskReport {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;

    section {
      flex: 1;
      background: #eff1f5;

      .report-each {
        width: 100%;
        height: 13%;
        background-color: white;
        display: flex;
        justify-content: space-around;
        padding-top: 2%;
        text-align: center;
        border-bottom: 1px solid #eee;

        dl {
          dt {
            font-size: 23px;
            font-weight: bold;
          }

          dd {
            color: #999;
          }
        }
      }
      .report-box {
        width: 100%;
        height: 77vh;
        overflow: auto;
        padding: 3% 3% 0 3%;
        .task-list {
          width: 100%;
          background-color: white;
          padding: 3%;
          border-radius: 3px;
          margin-bottom: 2%;
          position: relative;

          .report-limit {
            width: 100%;
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 3%;

            .finish-limit {
              flex: 1;

              .limit-date {
                color: #999;
                margin-left: 2%;
              }
            }

            .acceptance-yell {
              color: #ff8d04;
            }

            .acceptance-red {
              color: #d0372a;
            }

            img {
              position: absolute;
              top: 0;
              right: 0;
            }
          }

          .report-comments {
            width: 100%;
            display: flex;
            justify-content: space-between;

            .comments-new {
              color: #1f7cf8;
            }

            .van-button {
              width: 16%;
            }
          }
        }
      }
      ::-webkit-scrollbar {
        display: none;
      }

      .hide {
        display: none;
      }
    }
  }
</style>
