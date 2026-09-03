<template>
  <BasicModal
    @cancel="close"
    title="详情查看"
    :canFullscreen="false"
    :showOkBtn="false"
    @register="register"
    width="70%"
    v-bind="$attrs"
    :bodyStyle="{ height: '600px' }"
  >
    <div class="content">
      <div class="left">
        <h1><span>法规名称：</span>{{ detailInfo.statuteName }}</h1>
        <p><span>法律效力：</span>{{ detailInfo.legalEffect }}</p>
        <p><span>颁布部门：</span>{{ detailInfo.promulgatingSector }}</p>
        <p><span>生效日期：</span>{{ detailInfo.effectiveDate }}</p>
        <div class="co"
          ><span>条款及内容：</span><p>{{ detailInfo.content }}</p></div
        >
        <div class="co"
          ><span>条款摘要：</span><p>{{ detailInfo.enterpriseImplementation }}</p></div
        >
      </div>
      <div class="right">
        <a-steps progress-dot v-if="detailInfo.infoList" direction="vertical" size="small" :current="1">
          <a-step v-for="item in detailInfo.infoList">
            <template #title>
              <div class="ct">
                <div class="s-left">
                  <div :class="'icon' + item.assessResult">{{ { 0: '合规', 1: '不合规', 2: '不相关', 3: '未评估' }[item.assessResult] }}</div>
                </div>
                <div class="s-right">
                  <div class="b">{{ item.dataTime }}</div>
                  <div class="b" v-if="item.headUserName"><span>评估人：</span>{{ item.headUserName }}</div>
                  <template v-if="item.assessResult == 0">
                    <div v-if="item.description"
                      ><span>整改说明：</span><p>{{ item.description }}</p>
                    </div>
                    <div v-if="item.rectifyPeople">整改人：{{ item.rectifyPeopleName }}</div>
                    <div v-if="item.rectifyTime">整改时间：{{ item.rectifyTime.substr(0, 10) }}</div>
                  </template>
                  <template v-if="item.assessResult == 1">
                    <div v-if="item.notComplianceDesc">
                      <span>不合规说明：</span>
                      <p>{{ item.notComplianceDesc }}</p></div
                    >
                    <div v-if="item.correctiveActions">
                      <span>纠正措施：</span><p>{{ item.correctiveActions }}</p>
                    </div>
                    <div v-if="item.assessUserName"><span>整改责任人：</span>{{ item.assessUserName }}</div>
                    <div v-if="item.finishTime"><span>整改完成期限：</span>{{ item.finishTime }}</div>
                  </template>
                </div>
              </div>
            </template>
          </a-step>
        </a-steps>
      </div>
    </div>
  </BasicModal>
</template>
<script lang="ts" setup>
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { getItemInfo, getStatuteItemInfo } from '../url/index';
  import { ref } from 'vue';
  const detailInfo = ref<any>({});
  const [register] = useModalInner((item) => {
    if (item.pageType === 'detail') {
      getItemInfo({ id: item.wid || item.id, infoId: item.statuteId || item.id }).then((res) => {
        detailInfo.value = res;
      });
    } else {
      getStatuteItemInfo({ id: item.id }).then((res) => {
        detailInfo.value = res;
      });
    }
  });
  const close = () => {
    detailInfo.value = {};
  };
</script>
<style lang="less" scoped>
  p {
    padding: 0;
    margin: 0;
  }
  .content {
    width: 100%;
    display: flex;
    padding: 0;
    margin: 0;
    height: 572px;
    overflow: hidden;
    h1 {
      font-size: 18px;
      font-weight: 600;
    }
    .left {
      width: 50%;
      height: 100%;
      overflow-y: auto;
      & > p,
      & > div {
        padding-left: 0px;
      }
      div p{
        padding-left: 110px;
      }
      span{
        display: inline-block;
        width: 110px;
        text-align: right;
      }
    }
    .right {
      width: 50%;
      height: 100%;
      overflow-y: auto;
      padding-left: 20px;
    }
    .icon0,
    .icon1,
    .icon2 {
      text-align: center;
      font-size: 14px;
      color: #ffffff;
      width: 50px;
      height: 28px;
      display: flex;
      align-items: center;
      border-radius: 4px;
      background-color: #1890ff;
      justify-content: center;
    }
    .icon1 {
      background-color: #f5222d;
    }
    .icon2 {
      background-color: #faad14;
    }
    .icon3 {
      background-color: #aaaaaa;
    }
    .ct {
      width: 100%;
      display: flex;
      .s-left {
        width: 60px;
      }
      .s-right {
        flex: 1;
        color: #333333;
        .b {
          color: #000000;
        }
        div {
          padding-bottom: 5px;
          display: flex;
          span{
            word-wrap: nowrap;
            width: 110px;
            text-align: left;
          }
          p {
            flex: 1;
            word-break: break-all;
          }
        }
      }
    }
    .co {
      p {
        font-weight: 600;
        padding-left: 70px;
      }
    }
  }
</style>
