<!-- 审批任务 -->
<template>
  <div class="hd-edit">
    <div class="main">
      <van-form ref="formRef" class="myform" label-width="75px">
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
                  <van-field name="approveResult" label="审批意见">
                    <template #input>
                      <van-radio-group v-model="item.approveResult" direction="horizontal" @change="approveResultChange(item)">
                        <van-radio name="1">合格</van-radio>
                        <van-radio name="2">不合格</van-radio>
                      </van-radio-group>
                    </template>
                  </van-field>
                  <van-field
                    v-if="item.approveResult == '2'"
                    v-model="item.approveOpinion"
                    name="approveOpinion"
                    label=" "
                    placeholder="请输入审批意见"
                    type="textarea"
                    :rules="[{ required: true, message: '请输入审批意见' }]"
                  />
                </div>
              </div>
          </div>
      </van-form>
      <Sign ref="signRef" v-model:value="handSignPictureUrl" :resetSign="false" @submit="submitSignHand" />
    </div>
    <div class="foot" v-if="handSignPictureUrl">
      <van-button :loading="loading" @click="editClick" type="primary" block>提交</van-button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { useRouter, useRoute } from 'vue-router';
  import { repairPlanDetail, repairApproval } from '../index.api';
  import Sign from '/@/views/app/components/sign.vue';
  const route = useRoute();
  const router = useRouter();
  const dataSource = ref<any[]>([]);
  const loading = ref(true);
  const handSignPictureUrl = ref('');
  const signRef = ref();
  const submitSignHand = (sign) => {
    console.log('submitSignHand', sign);
  };
  getDetail();
  function getDetail() {
    repairPlanDetail({
      id: route.query.id,
    })
      .then((res) => {
        console.log('res', res);
        dataSource.value = res;
        dataSource.value.forEach((item) => {
          item.approveResult = '1';
        });
        loading.value = false;
      })
      .catch((err) => (loading.value = false));
  }

  // 编辑
  const editClick = () => {
    // 提交
    console.log('edit', dataSource.value);
    let params = {
      taskId: route.query.id, 
      itemList: dataSource.value,
      signPicture: handSignPictureUrl.value,
    };
    repairApproval(params).then((res) => {
      router.replace({ path: '/app/hiddenManage/repairPlan/detail', query: { id: route.query.id} });
    });
  };
  const approveResultChange = (item) => {
    console.log('approveResultChange', item);
    item.approveOpinion = '';
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
</style>
