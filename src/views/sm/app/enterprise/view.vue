<template>
  <div class="enterprise">
    <div class="container">
      <div>
        <label>企业名称：</label>
        <span>{{ info.companyName }}</span>
      </div>
      <div>
        <label>主要负责人：</label>
        <span>{{ info.companyManager }}</span>
      </div>
      <div>
        <label>主要负责人电话：</label>
        <span>{{ info.projectPhone }}</span>
      </div>
      <div>
        <label>经营范围：</label>
        <span>{{ info.businessScope }}</span>
      </div>
      <div>
        <label>企业档案备注：</label>
        <span>{{ info.businessRemark }}</span>
      </div>
      <div>
        <label>分数：</label>
        <span>{{ info.score }}</span>
      </div>
      <div>
        <label>创建人：</label>
        <span>{{ info.createUserName }}</span>
      </div>
      <div>
        <label>创建人单位：</label>
        <span>{{ info.createOrgName }}</span>
      </div>
      <div v-if="blackFlag">
        <label>列入原因：</label>
        <span>{{ info.blackRemark }}</span>
      </div>
    </div>
  </div>
</template>
<script setup name="app-enterprise-view" lang="ts">
  import { ref, onMounted } from 'vue';
  import { useRoute } from 'vue-router';
  import { setAppTitle } from '/@/utils/index';
  setAppTitle('企业信息查看');
  const route: any = useRoute();
  const info: any = ref({
    companyName: '',
    companyManager: '',
    projectPhone: '',
    businessScope: '',
    businessRemark: '',
    score: '',
    createUserName: '',
    createOrgName: '',
    blackRemark: '',
  });
  const blackFlag = ref(false);
  onMounted(() => {
    if (route.query.data) info.value = JSON.parse(route.query.data);
    if (route.query.blackFlag) {
      blackFlag.value = route.query.blackFlag === '1';
    }
  });
</script>
<style lang="less" scoped>
  .enterprise {
    background: #eff1f5;
    width: 100%;
    height: 100%;
    overflow-y: auto;
    .container {
      padding: 10px 10px;
      width: calc(100% - 26px);
      margin: 10px 13px 8px 13px;
      background-color: #fff;
      border-radius: 5px;
      & > p {
        font-size: 18px;
        margin: 0;
      }
      & > h3 {
        font-size: 16px;
      }
      & > div {
        line-height: 25px;
        padding: 10px 0;
        border-bottom: 1px solid #fbf7f7;
        & > label {
          color: #7f7f7f;
        }
        & > span {
          color: #333333;
        }
        font-family: Source Han Sans CN, Source Han Sans CN;
        word-break: break-all;
      }
      & > div:last-child {
        border-bottom: none;
      }
    }
  }
</style>
