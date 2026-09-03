<template>
  <div class="assessHome">
    <div class="main">
      <div class="top">
        <div class="t">
          <div class="l"> 当前进度 </div>
          <div class="r">
            <!-- <marquee behavior="scroll" direction="" style="display: flex; align-items: center">新增8条法律条款需要评估，请及时进行评估！</marquee> -->
            <a-button style="margin-left: 16px" type="primary" @click="openDetail(null, 'report')">评估报告查看</a-button>
          </div>
        </div>
        <div class="b">
          <dl>
            <dt></dt>
            <dd>
              <span>总计</span>
              <h3>{{ statisticsData.total }}<span>项</span></h3>
            </dd>
          </dl>
          <dl style="cursor: pointer;" @click="open('edit', '0', '合规')">
            <dt></dt>
            <dd>
              <span>合规</span>
              <h3>{{ statisticsData.complianceNum }}<span>项</span></h3>
            </dd>
          </dl>
          <dl style="cursor: pointer;" @click="open('edit', 1, '不合规')">
            <dt></dt>
            <dd>
              <span>不合规</span>
              <h3>{{ statisticsData.notComplianceNum }}<span>项</span></h3>
            </dd>
          </dl>
          <dl style="cursor: pointer;" @click="open('edit', 2, '不相关')">
            <dt></dt>
            <dd>
              <span>不相关</span>
              <h3>{{ statisticsData.notRelevantNum }}<span>项</span></h3>
            </dd>
          </dl>
          <dl style="cursor: pointer;" @click="open('add', 3, '未评估')">
            <dt></dt>
            <dd>
              <span>未评估</span>
              <h3>{{ statisticsData.notAssessedNum }}<span>项</span></h3>
            </dd>
          </dl>
        </div>
      </div>
      <div class="content">
        <div class="t">
          <a-button @click="open('add')" type="primary">发起评估</a-button>
        </div>
        <div class="list">
          <div class="item" v-for="(item, index) in pageListData" :style="{ marginRight: index % 4 == 3 ? '0' : '1.3%' }" :key="item.id">
            <h3 :title="item.assessName">{{ item.assessName }}</h3>
            <div class="info">
              <span>评估人：{{ item.assessUserName }}</span>
              <span>评估时间：{{ item.assessTime }}</span>
            </div>
            <div class="tag">
              <div>
                <span
                  >评估总数：<i style="color: #3e87f8">{{ item.assessNum }}</i></span
                >
                <span
                  >不合规：<i style="color: #f43328">{{ item.notComplianceNum }}</i></span
                >
              </div>
              <div>
                <span
                  >合规：<i style="color: #09c199">{{ item.complianceNum }}</i></span
                >
                <span
                  >不相关：<i>{{ item.notRelevantNum }}</i></span
                >
              </div>
            </div>
            <div class="btn">
              <a-button style="width: 100%" @click="openDetail(item)" ghost type="primary">查看详情</a-button>
            </div>
          </div>
        </div>
        <div class="f">
          <Pagination :pageSizeOptions="pageSizeOptions" @change="pageChange" v-model:current="pageNo" v-model:pageSize="pageSize" :total="total" />
        </div>
      </div>
    </div>
  </div>
  <AssessmentDrawer @close="pageInit()" @register="register" />
  <AssessDetailDrawer @close="pageInit()" @register="registerDetail" />
</template>
<script lang="ts" setup>
  import AssessmentDrawer from '../assessmentDrawer/index.vue';
  import AssessDetailDrawer from '../assessDetailDrawer/index.vue';
  import { statistics, pageList } from '../url/index';
  import { useDrawer } from '/@/components/Drawer';
  import { Pagination } from 'ant-design-vue';
  import { ref } from 'vue';

  interface statisticsData {
    total?: number;
    complianceNum?: number;
    notAssessedNum?: number;
    notComplianceNum?: number;
    notRelevantNum?: number;
  }

  const [register, { openDrawer }] = useDrawer();
  const [registerDetail, { openDrawer: openDetailDrawer }] = useDrawer();

  const pageSizeOptions = ref<string[]>(['8', '16', '32', '64', '128']);
  const pageSize = ref(8);
  const pageNo = ref(1);
  const total = ref(0);
  const pageListData = ref<any[]>([]);

  // 统计
  const statisticsData = ref<statisticsData>({});
  pageInit();

  function pageInit() {
    statistics().then((res) => {
      statisticsData.value = res;
    });
    getPageList();
  }
  function getPageList () {
    pageList({
      pageNo: pageNo.value,
      pageSize: pageSize.value,
    }).then((res) => {
      total.value = res.total;
      pageListData.value = res.records;
    });
  }
  const pageChange = () => {
    console.log(pageSize.value);
    getPageList();
  }

  // 评估 type: add 新增, edit 编辑; status: 0 未评估, 1 已评估, 2 已提交, 3 未评估
  const open = (type: string, status?: number | string, title?: string) => {
    openDrawer(true, { type, status: status || '', title: title || '' });
  };

  // 查看详情
  const openDetail = (item: any, pageType?: string) => {
    openDetailDrawer(true, {...item, pageType: pageType || '' });
  };

</script>
<style lang="less" scoped>
  .assessHome {
    width: 100%;
    height: 100%;
    background-color: #eff1f5;
    padding: 10px 16px;
    .main {
      background-color: #ffffff;
      width: 100%;
      padding: 10px 16px;
      border-radius: 4px 4px 4px 4px;
    }
    .top {
      width: 100%;
      background: linear-gradient(63deg, #e3f1ff 0%, #f2f7fc 26%, #ebf3fe 53%, #d9e6fe 100%);
      border-radius: 8px 8px 8px 8px;
      padding: 0 16px;
      padding-bottom: 16px;
      .t {
        display: flex;
        justify-content: space-between;
        padding: 10px 0px;
        .l {
          font-family: Source Han Sans CN, Source Han Sans CN;
          font-weight: 500;
          font-size: 20px;
          color: #000000;
          line-height: 22px;
          text-align: left;
          font-style: normal;
          text-transform: none;
        }
        .r {
          display: flex;
        }
      }
      .b {
        width: 100%;
        height: 120px;
        background: #ffffff;
        border-radius: 8px 8px 8px 8px;
        display: flex;
        dl {
          width: 20%;
          display: flex;
          justify-content: center;
          align-items: center;
          margin: 0;
          padding: 0;
          position: relative;
          &::after {
            content: '';
            border-right: 1px solid rgba(0, 0, 0, 0.1);
            position: absolute;
            right: 0;
            height: 80px;
            top: 20px;
          }
          dt {
            width: 56px;
            height: 56px;
            background: url(../../../assets/images/hgk/1.png) no-repeat;
            border-radius: 50%;
            background-size: 100%;
          }

          dd {
            margin: 0;
            padding: 0;
            margin-left: 10px;
            span {
              font-size: 16px;
              color: rgba(0, 0, 0, 0.65);
              padding-left: 5px;
            }
            h3 {
              font-weight: 500;
              font-size: 32px;
              color: rgba(0, 0, 0, 0.65);
              margin: 0;
            }
          }
        }
        dl:nth-child(2) dt {
          background: url(../../../assets/images/hgk/2.png) no-repeat;
          background-size: 100%;
        }
        dl:nth-child(3) dt {
          background: url(../../../assets/images/hgk/3.png) no-repeat;
          background-size: 100%;
        }
        dl:nth-child(4) dt {
          background: url(../../../assets/images/hgk/4.png) no-repeat;
          background-size: 100%;
        }
        dl:nth-child(5) dt {
          background: url(../../../assets/images/hgk/5.png) no-repeat;
          background-size: 100%;
        }
        dl:last-child {
          &::after {
            border: none;
          }
        }
      }
    }
    .content {
      .t {
        padding: 16px 0;
      }
      .list {
        display: flex;
        flex-wrap: wrap;
        padding: 16px 0;
        padding-bottom: 0;
        border-top: 1px solid rgba(0, 0, 0, 0.1);
        .item {
          width: 24%;
          height: 243px;
          margin-right: 1.25%;
          margin-bottom: 16px;
          border-radius: 4px 4px 4px 4px;
          border: 1px solid rgba(0, 0, 0, 0.16);
          padding: 16px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          h3 {
            width: 100%;
            font-size: 18px;
            color: rgba(0, 0, 0, 0.87);
            font-weight: 600;
            margin: 0;
            display: -webkit-box;
            -webkit-box-orient: vertical; 
            -webkit-line-clamp: 2;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          .info {
            display: flex;
            flex-direction: column;
            font-size: 14px;
            color: rgba(0, 0, 0, 0.6);
            span {
              padding: 4px 0;
            }
          }
          .tag {
            color: rgba(0, 0, 0, 0.6);
            div {
              display: flex;
              justify-content: space-between;
              padding: 4px 0;
              span {
                width: 50%;
                i {
                  font-style: normal;
                }
              }
            }
          }
          .btn {
            display: flex;
            justify-content: flex-end;
          }
        }
      }
      .f {
        text-align: right;
      }
    }
  }
</style>
