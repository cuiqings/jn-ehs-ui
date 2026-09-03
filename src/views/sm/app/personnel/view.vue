<template>
  <div class="enterprise">
    <div class="container">
      <p>{{ info.name }}</p>
      <divider style="margin: 5px 0" />
      <div>
        <label>企业名称：</label>
        <span>{{ info.companyName }}</span>
      </div>
      <div>
        <label>工号：</label>
        <span> {{ info.workNo }}</span>
      </div>
      <div>
        <label>性别：</label>
        <span> {{ info.sex === '1' ? '男' : info.sex === '2' ? '女' : '' }}</span>
      </div>
      <div>
        <label>年龄：</label>
        <span>{{ info.age }}</span>
      </div>
      <div>
        <label>联系方式：</label>
        <span>{{ info.phone }}</span>
      </div>
      <div>
        <label>合同单位：</label>
        <span>{{ info.contractOrgName }}</span>
      </div>
      <div>
        <label>分数：</label>
        <span>{{ info.score }}</span>
      </div>
      <div>
        <label>健康状况：</label>
        <span>{{ info.healthStatus }}</span>
      </div>
      <div>
        <label>身份证号：</label>
        <span>{{ info.idNumber }}</span>
      </div>
      <div>
        <label>身份证复印件：</label>
        <AppCustomizeUpload v-if="info.idNumberFile" disabled v-model:fileList="info.idNumberFile" />
      </div>
      <div>
        <label>保险类型：</label>
        <span>{{ info.insType === '1' ? '工伤保险' : info.insType === '2' ? '意外伤害险' : '' }}</span>
      </div>
      <div v-if="info.insType === '1'">
        <label>工伤保险缴纳证明：</label>
        <AppCustomizeUpload v-if="info.icInsFile" disabled v-model:fileList="info.icInsFile" />
      </div>
      <div v-if="info.insType === '2'">
        <label>意外伤害险期限：</label>
        <span>{{ info.aiInsDateStart ? info.aiInsDateStart + '至' + info.aiInsDateEnd : '' }}</span>
      </div>
      <div v-if="info.insType === '2'">
        <label>意外伤害险缴纳证明：</label>
        <AppCustomizeUpload v-if="info.aiInsFile" disabled v-model:fileList="info.aiInsFile" />
      </div>
      <div>
        <label>账号状态：</label>
        <span>{{ info.status === '2' ? '冻结' : '正常' }}</span>
      </div>
      <div>
        <label>工种：</label>
        <span>{{ info.workType }}</span>
      </div>
      <div>
        <label>是否特种作业人员：</label>
        <span>{{ info.ifSpecialOperator === '1' ? '是' : '否' }}</span>
      </div>
      <div>
        <label>体检报告到期时间：</label>
        <span>{{ info.physicalReportOvertime }}</span>
      </div>
      <div>
        <label>体检报告：</label>
        <AppCustomizeUpload v-if="info.physicalReportFile" disabled v-model:fileList="info.physicalReportFile" />
      </div>
      <div v-if="blackFlag">
        <label>列入原因：</label>
        <span>{{ info.blackRemark }}</span>
      </div>
    </div>
    <template v-if="info.certificateList && info.certificateList.length > 0">
      <div>
        <div class="container" v-for="(item, index) in info.certificateList" :key="item.id">
          <p>{{ '作业证' + (index + 1) }}</p>
          <div>
            <label>证书类型：</label>
            <span>{{ dictText(item.certificateType, 'pq_certificate_type') }}</span>
          </div>
          <div>
            <label>作业类别：</label>
            <span>{{ dictText(item.workType, 'person_list_work_type') }}</span>
          </div>
          <div>
            <label>准操项目：</label>
            <span>{{ dictText(item.allowableItem, item.workType) }}</span>
          </div>
          <div>
            <label>证书名称：</label>
            <span>{{ item.certificateName }}</span>
          </div>
          <div>
            <label>证书编号：</label>
            <span>{{ item.certificateNo }}</span>
          </div>
          <div>
            <label>取证日期：</label>
            <span>{{ item.obtainDate }}</span>
          </div>
          <div>
            <label>复审日期：</label>
            <span>{{ item.reviewDate }}</span>
          </div>
          <div>
            <label>证书复印件：</label>
            <AppCustomizeUpload v-if="item.certificateFile" disabled v-model:fileList="item.certificateFile" />
          </div>
        </div>
      </div>
    </template>
    <div class="container">
      <p>安全教育培训</p>
      <divider style="margin: 5px 0" />
      <div>
        <label>教育培训状态：</label>
        <span>{{ info.trainDateStart ? info.trainDateStart : '无' }}</span>
      </div>
      <div>
        <label>安全教育卡：</label>
        <div v-if="info.trainCard?.length > 0">
          <div v-for="(item, index) in info.trainCard" :key="index" style="display: flex; align-items: center">
            <img :src="imgUrl(item)" style="width: 70px; height: 99px; cursor: pointer; margin-bottom: 10px" @click="handleCert(item)" />
            <div style="margin-left: 20px">
              <p>{{ item?.render?.name }}</p>
              <span style="color: #888888">{{ item.issueDate }}</span>
            </div>
          </div>
        </div>
        <span v-else>无</span>
      </div>
    </div>
    <div class="container" v-if="logList.length > 0">
      <p> 违章记录明细</p>
      <divider style="margin: 5px 0" />
      <div class="assessment-list" v-for="(item, index) in logList" :key="index">
        <div class="assessment-list-nav">
          <div>-{{ item.score }}分</div>
          <span>{{ item.examineTime }}</span>
        </div>
        <div>{{ item.remark }}</div>
        <div style="color: #666; font-size: 14px"><span>考核人：</span>{{ item.examineByName }}</div>
      </div>
    </div>
  </div>
  <CertDetailDialog ref="certDetailDialogRef" />
</template>
<script setup name="app-personnel-view" lang="ts">
  import { ref, onMounted } from 'vue';
  import { useRoute } from 'vue-router';
  import { Divider } from 'vant';
  import { getDictItemsByCode } from '/@/utils/dict/index';
  import { queryById } from './url/index';
  import { getExamineLog } from '../../personnelList/url/index';
  import { setAppTitle } from '/@/utils/index';
  import AppCustomizeUpload from '../components/AppCustomizeUpload.vue';
  import cert1 from '/@/assets/images/certificate/cert1.png';
  import cert2 from '/@/assets/images/certificate/cert3.png';
  import cert3 from '/@/assets/images/certificate/cert4.png';
  import CertDetailDialog from '../../../app/educationTraining/students/certificate/CertDetailDialog.vue';
  setAppTitle('人员信息查看');
  const route: any = useRoute();
  const info: any = ref({});
  const blackFlag = ref(false);
  const logList: any = ref([]);
  const certDetailDialogRef: any = ref();
  onMounted(() => {
    if (route.query.id) {
      queryById({ id: route.query.id }).then((res) => {
        info.value = res;
        if (info.value.trainCard) {
          info.value.trainCard.forEach((item) => {
            item.render = JSON.parse(item.render);
          });
        }
      });
      getExamineLog({ id: route.query.id }).then((res) => {
        if (res && res.length > 0) {
          logList.value = res;
        }
      });
    }
    if (route.query.blackFlag) {
      blackFlag.value = route.query.blackFlag === '1';
    }
  });
  const imgUrl = (item) => {
    if (item.render.imgUrl) {
      return item.render.imgUrl;
    } else {
      if (item.render.type === 'v1') {
        return cert1;
      } else if (item.render.type === 'v2') {
        return cert2;
      } else if (item.render.type === 'v3') {
        return cert3;
      }
    }
  };
  const handleCert = (data) => {
    certDetailDialogRef.value.init(data, true);
  };
  const dictText = (type, dict) => {
    if (type && type !== '') {
      let text = '';
      let array = getDictItemsByCode(dict) || [];
      let obj = array.filter((item) => {
        return item.value == type;
      });
      if (obj.length > 0) {
        text = obj[0].text;
      }
      return text;
    } else {
      return '';
    }
  };
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
    }
    .assessment-list {
      margin-bottom: 10px;
      border: 1px solid #e5e7eb;
      border-radius: 5px;
      padding: 10px;
      background: #ededef;
      div {
        line-height: 30px;
        font-size: 14px;
      }
      .assessment-list-nav {
        display: flex;
        justify-content: space-between;
        align-items: center;
        div {
          color: red;
          font-weight: bold;
          font-size: 16px;
        }
        span {
          color: #666;
          font-size: 14px;
        }
      }
    }
  }
</style>
