<template>
  <div class="autonomous-view">
    <div class="container">
      <p>基本信息</p>
      <divider style="margin: 5px 0" />
      <div>
        <label>相关方名称：</label>
        <span>{{ info.companyName }}</span>
      </div>
      <div>
        <label>项目名称：</label>
        <span>{{ info.enterName }}</span>
      </div>
      <div>
        <label>发包单位：</label>
        <span>{{ info.publishName }}</span>
      </div>
      <div>
        <label>资料类型：</label>
        <span>{{ info.dataType === '1' ? '周例会' : info.dataType === '2' ? '周检查' : info.dataType === '3' ? '培训' : '' }}</span>
      </div>
      <div>
        <label>相关文档：</label>
        <AppCustomizeUpload v-if="info.file && info.file !== ''" disabled v-model:fileList="info.file" />
        <span v-else>无</span>
      </div>
    </div>
    <div class="container" v-if="repairList && repairList.length > 0">
      <p>整改记录</p>
      <divider style="margin: 5px 0" />
      <div class="record" v-for="(item, index) in repairList" :key="index">
        <div class="record-header">
          <span class="record-person">{{ item.handlerName }}</span>
          <span class="record-time">{{ item.handleTime }}</span>
        </div>
        <div class="record-content">
          <div v-if="item.node === '3'">
            <label>验收结果：</label>
            <span :style="{ color: item.checkResult === '1' ? '#52c41a' : '#ff4d4f' }">
              {{ item.checkResult === '1' ? '合格' : '不合格' }}
            </span>
          </div>
          <div v-if="item.checkResult === '2' && item.node === '3'">
            <label>不合格原因：</label>
            <span>{{ item.checkReason }}</span>
          </div>
          <div v-if="item.node === '2'">
            <label>整改措施：</label>
            <span>{{ item.repairMsr }}</span>
          </div>
          <div v-if="item.node === '2'">
            <label>整改后照片：</label>
            <div>
              <JImageUpload v-model:value="item.repairPicture" disabled />
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="container" v-if="info.checkResult">
      <p>检查结果</p>
      <divider style="margin: 5px 0" />
      <div>
        <label>检查人：</label>
        <span>{{ info.checkByName }}</span>
      </div>
      <div>
        <label>检查时间：</label>
        <span>{{ info.checkTime }}</span>
      </div>
      <div>
        <label>检查结果：</label>
        <span :style="{ color: info.checkResult === '1' ? '#52c41a' : '#ff4d4f' }">
          {{ info.checkResult === '1' ? '合格' : '不合格' }}
        </span>
      </div>
      <div v-if="info.checkResult === '2'">
        <label>不合格原因：</label>
        <span>{{ info.checkComment }}</span>
      </div>
      <div>
        <label>相关图片：</label>
        <div>
          <JImageUpload v-if="info.checkImg && info.checkImg !== ''" v-model:value="info.checkImg" disabled />
          <span v-else>无</span>
        </div>
      </div>
      <div v-if="info.checkFile">
        <label>相关文件：</label>
        <div>
          <AppCustomizeUpload v-if="info.checkFile && info.checkFile !== ''" disabled v-model:fileList="info.checkFile" />
          <span v-else>无</span>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup name="app-autonomous-view" lang="ts">
  import { ref, onMounted } from 'vue';
  import { useRoute } from 'vue-router';
  import { Divider } from 'vant';
  import { setAppTitle } from '/@/utils/index';
  import { queryById } from '../../autonomous/url/index';
  import { JImageUpload } from '/@/components/Form';
  import AppCustomizeUpload from '../components/AppCustomizeUpload.vue';
  setAppTitle('自主管理查看');
  const route: any = useRoute();
  const info: any = ref({});
  const repairList: any = ref([]);

  onMounted(async () => {
    if (route.query.id) {
      await queryById({ id: route.query.id }).then((res) => {
        info.value = res || {};
        repairList.value = res?.repairList || [];
      });
    }
  });
</script>
<style lang="less" scoped>
  .autonomous-view {
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
      & > div {
        line-height: 25px;
        & > label {
          color: #7f7f7f;
        }
        & > span {
          color: #333333;
        }
        font-family: Source Han Sans CN, Source Han Sans CN;
      }
      .record {
        border: 1px solid #d9d9d9;
        padding: 10px;
        margin-bottom: 12px;
        border-radius: 6px;
        .record-header {
          display: flex;
          align-items: center;
          margin: 6px 4px 10px;
          .record-person {
            font-weight: 500;
            color: #333;
          }
          .record-time {
            color: #666;
            font-size: 13px;
            margin-left: 10px;
          }
        }
        .record-content {
          padding-left: 4px;
        }
      }
    }
  }
</style>
