<template>
  <div class="examine">
    <a-tabs v-model:activeKey="activeKey" @change="changeTabs">
      <a-tab-pane :key="item.serialNumber" v-for="item in arr">
        <template #tab>
          <span :class="item.bs === '0' ? 'tab_nav tab_nav-green' : 'tab_nav'">
            {{ item.serialNumber }}
          </span>
        </template>
        <div class="list">
          <div class="list_label">工序：</div>
          <div class="list_value">{{ item.processes }}</div>
        </div>
        <div class="list">
          <div class="list_label">检查项目：</div>
          <div class="list_value">{{ item.checkEntry }}</div>
        </div>
        <div class="list">
          <div class="list_label">检查要求：</div>
          <div class="list_value">{{ item.checkRecord }}</div>
        </div>
        <div class="list">
          <div class="list_label"><span>*</span>检查结果：</div>
          <div class="list_value">
            <a-radio-group v-model:value="item.checkResult">
              <a-radio value="0">正常</a-radio>
              <a-radio value="1">异常</a-radio>
            </a-radio-group>
          </div>
        </div>
        <div class="list">
          <div class="list_label">检查照片：</div>
          <div class="list_value">
            <j-image-upload v-model:value="item.checkPhoto" :file-max="10" text="" is-watermark :show-remove-icon="false" />
          </div>
        </div>
        <div class="list">
          <div class="list_label">影响评估：</div>
          <div class="list_value">
            <a-textarea v-model:value="item.impactAssessment" placeholder="请输入" allow-clear rows="4" :maxlength="200" />
          </div>
        </div>
      </a-tab-pane>
    </a-tabs>
    <div class="btn">
      <a-button type="primary" @click="onSave" :loading="loading"> 保存 </a-button>
      <a-button v-if="isSubmit" type="primary" style="margin-left: 15px" @click="onSubmit" :loading="loading1"> 提交 </a-button>
    </div>
  </div>
</template>
<script lang="ts" name="app-checkPlan-examine" setup>
  import { ref, onMounted } from 'vue';
  import { JImageUpload } from '/@/components/Form';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { appStartInspection, save, submit } from '../url/index';
  import { useRoute, useRouter } from 'vue-router';
  const { createMessage } = useMessage();
  const activeKey = ref('1');
  const route = useRoute();
  const router = useRouter();
  const arr = ref<any[]>([]);
  const isSubmit = ref(false);
  const loading = ref(false);
  const loading1 = ref(false);
  onMounted(() => {
    if (route.query.recordId) {
      init();
    }
  });
  const init = () => {
    appStartInspection({ recordId: route.query.recordId, planId: route.query.planId }).then((res) => {
      arr.value = res;
      isSubmit.value = arr.value.every((item) => item.bs === '0');
    });
  };
  const changeTabs = (type) => {
    activeKey.value = type;
  };
  const onSave = () => {
    if (arr.value[Number(activeKey.value) - 1].checkResult === '' || !arr.value[Number(activeKey.value) - 1].checkResult) {
      return createMessage.info('检查结果不能为空！');
    }
    loading.value = true;
    save(arr.value[Number(activeKey.value) - 1])
      .then(() => {
        if (Number(activeKey.value) < arr.value.length) activeKey.value = String(Number(activeKey.value) + 1);
        init();
      })
      .finally(() => {
        loading.value = false;
      });
  };
  const onSubmit = () => {
    loading1.value = true;
    submit({
      id: route.query.recordId,
      checkPlanId: arr.value[0].checkPlanId,
      subTaskCode: route.query.subTaskCode,
    })
      .then((res) => {
        if (res) {
          router.push({
            path: '/app/checkPlan/details',
            query: {
              recordId: route.query.recordId,
            },
          });
        }
      })
      .finally(() => {
        loading1.value = false;
      });
  };
</script>
<style lang="less" scoped>
  .examine {
    padding: 20px 15px 0 15px;
    height: calc(100% - 60px);
    overflow-y: auto;
    .list {
      display: flex;
      line-height: 40px;
      .list_label {
        width: 100px;
        text-align: left;
        color: rgb(127, 127, 127);
        position: relative;
        span {
          color: #ff4d4f;
          font-size: 14px;
          font-family: SimSun, sans-serif;
          display: inline-block;
          position: absolute;
          left: -7px;
        }
      }
      .list_value {
        width: calc(100% - 100px);
        line-height: normal;
        margin-top: 10px;
      }
    }
    .tab_nav {
      width: 35px;
      height: 35px;
      display: inline-block;
      border-radius: 50%;
      text-align: center;
      line-height: 33px;
      border: 1px solid rgba(0, 0, 0, 0.3);
    }
    .ant-tabs-tabpane {
      padding: 0 7px;
    }
    .tab_nav-green {
      border: 1px solid green;
      color: #000000;
      background: green;
    }
    .ant-tabs-tab-active {
      .tab_nav {
        width: 35px;
        height: 35px;
        display: inline-block;
        border-radius: 50%;
        text-align: center;
        line-height: 33px;
        border: 1px solid #1890ff;
        color: #ffffff;
        background: #1890ff;
      }
    }
    .btn {
      position: fixed;
      width: 100%;
      bottom: 0;
      left: 0;
      height: 60px;
      text-align: center;
      line-height: 60px;
      button {
        height: 40px;
        width: 150px;
      }
    }
  }
  /deep/.ant-btn-icon-only.ant-btn-sm {
    position: absolute;
    top: -30px;
    left: 28px;
  }
</style>
