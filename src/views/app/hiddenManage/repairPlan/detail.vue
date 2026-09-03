<!-- 审批任务 -->
<template>
  <div class="hd-edit">
    <div class="main">
      <van-collapse v-model="activeNames">
        <van-collapse-item title="整改计划" name="1">
          <div v-if="dataSource.length > 0">
            <div class="ex-result" v-for="(item, idx) in dataSource" :key="'c' + idx">
              <div class="ex-inner">
                <span class="label">{{ idx + 1 }}</span>
                <div class="projectinfo">
                  <div><label>责任车间：</label>{{ item.dutyDepartName }}</div>
                  <div><label>隐患描述：</label>{{ item.yhDescription }}</div>
                  <div><label>隐患等级：</label>{{ item.yhLevel == 1 ? '一般' : '重大' }}</div>
                  <div><label>治理措施：</label>{{ item.handleMsr }}</div>
                  <div><label>完成时限：</label>{{ item.repairTimeLimit }}</div>
                  <div><label>整改责任人：</label>{{ item.repairPersonName }}</div>
                </div>
              </div>
            </div>
          </div>
          <div v-else>
            <div class="sign-wrap">
              <div class="sign-text">暂无整改计划</div>
            </div>
          </div>
        </van-collapse-item>
        <van-collapse-item title="审批记录" name="2">
          <div v-if="signList.length > 0">
            <div class="sign-wrap" v-for="(item, idx) in signList" :key="'c' + idx">
              <div style="font-weight: 500; color: #1890ff"> 安全科长（{{ item.orgName || '无' }}） </div>
              <div class="sign-item">
                <div class="sign-text">{{ item.signByName }}</div>
                <div class="sign-text">{{ item.signTime }}</div>
                <div class="sign-text"> <img :src="item.signPicture" alt="" style="width: 50px; height: 30px" /></div>
              </div>
              <div class="sign-option" v-if="item.approveLog.length > 0">
                <p>审批意见：</p>
                <a-table :columns="columnsLog" :data-source="item.approveLog" :pagination="false" />
              </div>
            </div>
          </div>
          <div v-else>
            <div class="sign-wrap">
              <div class="sign-text">暂无审批记录</div>
            </div>
          </div>
        </van-collapse-item>
      </van-collapse>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { useRouter, useRoute } from 'vue-router';
  import { getRepairPlanAndApproveLog, repairApproval } from '../index.api';
  const route = useRoute();
  const router = useRouter();
  const dataSource = ref<any[]>([]);
  const signList = ref<any[]>([]);
  const loading = ref(true);
  const activeNames = ref(['1']);
  const columnsLog = ref<any[]>([
    {
      title: '责任车间',
      dataIndex: 'dutyDepartName',
    },
    {
      title: '隐患描述',
      dataIndex: 'yhDescription',
    },
    {
      title: '意见',
      dataIndex: 'approveOpinion',
    },
  ]);

  getDetail();
  function getDetail() {
    getRepairPlanAndApproveLog({
      id: route.query.id,
    })
      .then((res) => {
        console.log('res', res);
        dataSource.value = res.itemList;
        signList.value = res.signList;
        loading.value = false;
      })
      .catch((err) => (loading.value = false));
  }

  // 编辑
  const editClick = () => {
    // 提交
    console.log('edit', dataSource.value);
    let params = {
      id: route.query.id,
      itemList: dataSource.value,
    };
    repairApproval(params).then((res) => {
      router.replace({ path: '/app/hiddenManage/repairPlan' });
    });
  };
  // 空班
  const restShow = ref(false);
  const restClick = () => {
    restShow.value = true;
  };
  const approveResultChange = (item) => {
    console.log('approveResultChange', item);
  };
</script>
<style scoped lang="less">
  .hd-edit {
    width: 100%;
    height: 100%;
    padding-bottom: 55px;
    .main {
      width: 100%;
      height: 100%;
      overflow-y: auto;
      .ex-result {
        padding: 10px;
        .ex-inner {
          display: flex;
          padding-left: 16px;
          background: #eff1f5;
          align-items: center;
          border-radius: 4px;
          color: #333333;
          .label {
            width: 18px;
            height: 18px;
            border: 1px solid #999999;
            border-radius: 50%;
            text-align: center;
            line-height: 16px;
          }
          .van-cell {
            padding: 10px 5px;
            background: none !important;
          }
          .projectinfo {
            flex: 1;
            font-size: 14px;
            padding: 10px;
            line-height: 32px;
            color: #333333;
            label {
              width: 80px;
              text-align: left;
              font-weight: 600;
            }
          }
        }
      }
    }
    .foot {
      width: 100%;
      height: 55px;
      padding: 0 16px;
      position: fixed;
      bottom: 0;
      left: 0;
      background: #fff;
      display: flex;
      justify-content: center;
      align-items: center;
      border-top: 1px solid #f5f5f5;
    }
  }
  :deep(.van-collapse-item) {
    .van-collapse-item__title {
      .van-cell__title {
        color: #1989fa !important;
      }
    }
  }
  :deep(.van-collapse-item__content) {
    padding: 0 !important;
  }
  .restmain {
    font-size: 14px;
    padding: 10px 30px;
    line-height: 32px;
    color: #333;
    span {
      display: inline-block;
      width: 70px;
      color: #111;
    }
  }
  .org-name {
    font-size: 16px;
    font-weight: 600;
    color: #333;
    padding: 10px;
    text-align: center;
  }
  .sign-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px;
    .sign-text {
      //   width: 100px;
      text-align: left;
      color: #333;
    }
  }
  .sign-wrap {
    padding: 16px;
    border-bottom: 1px solid #f5f5f5;
  }
  .sign-option {
    margin-left: 10px;
    p {
      font-weight: 500;
      color: #333;
    }
  }
</style>
