<template>
  <div class="safetyProductionSystem_view">
    <a-divider>人员信息</a-divider>
    <div class="safetyProductionSystem_view-item">
      <span>所属单位：</span>
      <span>{{ viewObj.organizationName }}</span>
    </div>
    <div class="safetyProductionSystem_view-item">
      <span>车间：</span>
      <span>{{ viewObj.departName }}</span>
    </div>
    <div class="safetyProductionSystem_view-item">
      <span>工作证号：</span>
      <span>{{ viewObj.jobNum }}</span>
    </div>
    <div class="safetyProductionSystem_view-item">
      <span>人员姓名：</span>
      <span>{{ viewObj.userRealname }}</span>
    </div>
    <div class="safetyProductionSystem_view-item">
      <span>性别：</span>
      <span>{{ viewObj.userSex === '1' ? '男' : '女' }}</span>
    </div>
    <div class="safetyProductionSystem_view-item">
      <span>手机号码：</span>
      <span>{{ viewObj.userPhone }}</span>
    </div>
    <div class="safetyProductionSystem_view-item">
      <span>学历：</span>
      <span>{{ render.renderDictText(viewObj.degree, 'pq_education') }}</span>
    </div>
    <a-divider>证书信息</a-divider>
    <div class="safetyProductionSystem_view-item">
      <span>证书类型：</span>
      <span>{{ viewObj.certificationsType_dictText }}</span>
    </div>
    <div class="safetyProductionSystem_view-item" v-if="viewObj.certificationsType === '1'">
      <span>作业类别：</span>
      <span>{{ viewObj.workType_dictText }}</span>
    </div>
    <div class="safetyProductionSystem_view-item" v-if="viewObj.certificationsType === '1'">
      <span>操作项目：</span>
      <span>{{ viewObj.actionItems_dictText }}</span>
    </div>
    <div class="safetyProductionSystem_view-item">
      <span>证书名称：</span>
      <span style="word-break: break-all">{{ viewObj.certificationsName }}</span>
    </div>
    <div class="safetyProductionSystem_view-item">
      <span>发证机关：</span>
      <span style="word-break: break-all">{{ viewObj.issuingAuthority }}</span>
    </div>
    <div class="safetyProductionSystem_view-item">
      <span>培训机构：</span>
      <span style="word-break: break-all">{{ viewObj.trainOrg }}</span>
    </div>
    <div class="safetyProductionSystem_view-item" v-if="viewObj.certificationsType === '1'">
      <span>培训时间：</span>
      <span style="word-break: break-all">{{ viewObj.trainTimeStart ? viewObj.trainTimeStart + '-' + viewObj.trainTimeEnd : '' }}</span>
    </div>
    <div class="safetyProductionSystem_view-item" v-if="viewObj.certificationsType === '1'">
      <span>培训地点：</span>
      <span style="word-break: break-all">{{ viewObj.trainAddress }}</span>
    </div>
    <div class="safetyProductionSystem_view-item" v-if="viewObj.certificationsType === '1'">
      <span>培训机构电话：</span>
      <span style="word-break: break-all">{{ viewObj.trainOrgPhone }}</span>
    </div>
    <div class="safetyProductionSystem_view-item">
      <span>证书编号：</span>
      <span style="word-break: break-all">{{ viewObj.certificationsCode }}</span>
    </div>
    <div class="safetyProductionSystem_view-item">
      <span>取证日期：</span>
      <span>{{ viewObj.issueDate }}</span>
    </div>
    <div class="safetyProductionSystem_view-item">
      <span>有效期至：</span>
      <span>{{ viewObj.isLongTerm === '0' ? viewObj.expireDate : '长期有效' }}</span>
    </div>
    <div class="safetyProductionSystem_view-item">
      <span>下次复审/换证日期：</span>
      <span>{{ viewObj.whetherReview === '1' ? viewObj.reviewTime : '长期有效' }}</span>
    </div>
    <div class="safetyProductionSystem_view-item">
      <span>到期提醒：</span>
      <span>{{ viewObj.remindStatus === '1' ? '开启' : '关闭' }}</span>
    </div>
    <div class="safetyProductionSystem_view-item">
      <span>备注：</span>
      <span style="word-break: break-all">{{ viewObj.remark }}</span>
    </div>
    <div class="safetyProductionSystem_view-item">
      <div>文件上传：</div>
      <customize-upload style="width: calc(100% - 70px)" lable="" isType="app" :value="viewObj.filePath ? viewObj.filePath : ''" type="view" />
    </div>
    <a-divider v-if="viewObj.reviewList">复审记录</a-divider>
    <div class="reviewRecord" v-for="item in viewObj.reviewList ? viewObj.reviewList : []" :key="item.id">
      <div class="reviewRecord-text"
        >操作人：<span>{{ item.operator }}</span></div
      >
      <div class="reviewRecord-text"
        >操作时间：<span>{{ item.createTime }}</span></div
      >
      <div class="reviewRecord-text"
        >下次复审/换证日期：<span>{{ dayjs(item.reviewTime).format('YYYY年M月D日') }}</span></div
      >
      <div class="reviewRecord-text"
        ><div style="width: 42px">备注：</div
        ><span style="width: calc(100% - 42px); word-break: break-all">{{ item.remark ? item.remark : '无' }}</span></div
      >
      <div class="safetyProductionSystem_view-item">
        <div>文件上传：</div>
        <customize-upload style="width: calc(100% - 70px)" lable="" isType="app" :value="item.filePath ? item.filePath : ''" type="view"
      /></div>
    </div>
    <a-divider v-if="viewObj.checkSignImg">检查签字记录</a-divider>
    <div v-if="viewObj.checkSignImg">
      <span>{{ viewObj.checkSignByName }}</span>
      <span style="margin-left: 20px">{{ viewObj.checkSignTime }}</span>
      <img
        v-if="viewObj.checkSignImg"
        :src="getFileAccessHttpUrl(viewObj.checkSignImg)"
        style="width: 90px; height: 55px; margin-top: 10px; display: block"
      />
    </div>
    <a-divider v-if="viewObj.confirmSignImg">确认签字记录</a-divider>
    <div v-if="viewObj.confirmSignImg">
      <span>{{ viewObj.confirmSignByName }}</span>
      <span style="margin-left: 20px">{{ viewObj.confirmSignTime }}</span>
      <img
        v-if="viewObj.confirmSignImg"
        :src="getFileAccessHttpUrl(viewObj.confirmSignImg)"
        style="width: 90px; height: 55px; margin-top: 10px; display: block"
      />
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { useRoute } from 'vue-router';
  import { ref, onMounted } from 'vue';
  import dayjs from 'dayjs';
  import { render } from '/@/utils/common/renderUtils';
  import CustomizeUpload from '../component/CustomizeUpload.vue';
  import { getFileAccessHttpUrl } from '/@/utils/common/compUtils';
  const route: any = useRoute();
  const viewObj: any = ref({});
  onMounted(() => {
    viewObj.value = JSON.parse(route.query.obj);
  });
</script>
<style lang="less" scoped>
  .safetyProductionSystem_view {
    padding: 15px;
    .safetyProductionSystem_view-item {
      // display: flex;
      line-height: 30px;
      font-size: 14px;
      word-wrap: break-word;
      & > span {
        color: #9f9d9d;
        word-wrap: break-word;
      }
      & > span:nth-child(1) {
        color: #000;
      }
    }
    .reviewRecord {
      border: 1px solid #e8e8e8;
      padding: 20px;
      margin-bottom: 10px;
      border-radius: 8px;
      .reviewRecord-text {
        line-height: 30px;
        display: flex;
        & > span {
          color: #888888;
          word-wrap: break-word;
        }
      }
    }
  }
  :deep(.ant-divider) {
    .ant-divider-inner-text {
      color: #1890ff;
    }
  }
</style>
