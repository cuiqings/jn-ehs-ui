<template>
  <div class="plan-detail">
    <header>
      <div><van-icon color="#1890ff" size="18" name="manager-o" /><h1>职业健康档案</h1></div>
      <div>员工：{{ formState.name }} <span>{{ formState.workNo }}</span></div>
    </header>
    <div class="main">
      <div class="card" :style="{height: active ? 'auto' : '50px'}">
        <div class="hd" @click="active = !active">
          <div>
            <van-icon color="#1890ff" size="18" name="manager-o" />基本信息
          </div>
          <div>
            <van-icon name="arrow-down" v-show="!active" />
            <van-icon name="arrow-up" v-show="active" />
          </div>
        </div>
        <div class="content">
          <van-field readonly v-model="formState.orgName" label="所属单位" />
          <van-field readonly v-model="formState.workshopName" label="所属车间" />
          <van-field readonly v-model="formState.post" label="岗位" />
          <van-field readonly v-model="formState.idCard" label="身份证号" />
          <van-field readonly v-model="formState.birthDate" label="出生日期" />
          <van-field readonly v-model="formState.age" label="年龄" />
          <van-field readonly v-model="formState.gender" label="性别">
            <template #input>
              {{ formState.gender == 1 ? '男' : '女' }}
            </template>
          </van-field>
          <van-field readonly v-model="formState.phone" label="手机号码" />
          <van-field readonly v-model="formState.nativePlace" label="籍贯" />
          <van-field readonly v-model="formState.joinDate" label="入厂日期" />
          <van-field readonly v-model="formState.totalWorkAge" label="总工龄" />
          <van-field readonly v-model="formState.harmDate" label="接害日期" />
          <van-field readonly v-model="formState.harmWorkAge" label="接害工龄" />
          <van-field readonly v-model="formState.hazardFactorsName" label="危害因素">
            <template #input>
              {{ formState.hazardFactorsName }}
            </template>
          </van-field>
          <van-field readonly v-model="formState.formerName" label="曾用名" />
          <van-field readonly v-model="formState.maritalStatus" label="婚姻">
            <template #input>
              {{ {1: '未婚', 2: '已婚', 3: '离异'}[formState.maritalStatus] }}
            </template>
          </van-field>
          <van-field readonly v-model="formState.hobbies" label="嗜好" />
          <van-field readonly v-model="formState.educationLevelName" label="文化程度" />
        </div>
      </div>

      <div class="card" :style="{height: active2 ? 'auto' : '50px'}" v-if="formState.professionalHistory && formState.professionalHistory.length > 0">
        <div class="hd" @click="active2 = !active2">
          <div>
            <van-icon color="#7e22ce" size="18" name="send-gift-o" />职业史
          </div>
          <div>
            <van-icon name="arrow-down" v-show="!active2" />
            <van-icon name="arrow-up" v-show="active2" />
          </div>
        </div>
        <div class="content">
          <div class="item" v-for="item in formState.professionalHistory">
            <van-field readonly v-model="item.companyName" label="用人单位名称" />
            <van-field readonly v-model="item.workType" label="从事工种" />
            <van-field readonly label="工作起止时间">
              <template #input>{{ item.workStartTime }}~{{ item.workEndTime }}</template>
            </van-field>
            <van-field readonly v-model="item.hazardFactors" label="接触危害因素名称" />
            <van-field readonly v-model="item.proofPerson" label="证明人" />
          </div>
        </div>
      </div>

      <div class="card" :style="{height: active3 ? 'auto' : '50px'}" v-if="formState.diseaseHistory && formState.diseaseHistory.length > 0">
        <div class="hd" @click="active3 = !active3">
          <div>
            <van-icon color="#15805f" size="18" name="todo-list-o" />既往病史
          </div>
          <div>
            <van-icon name="arrow-down" v-show="!active3" />
            <van-icon name="arrow-up" v-show="active3" />
          </div>
        </div>
        <div class="content">
          <div class="item" v-for="item in formState.diseaseHistory">
            <van-field readonly v-model="item.diseaseHistory" label="曾患病" />
            <van-field readonly v-model="item.diagnosisDate" label="诊断日期" />
            <van-field readonly v-model="item.diagnosisUnit" label="诊断单位" />
            <van-field readonly v-model="item.diagnosisResult" label="诊疗结果" />
            <van-field readonly v-model="item.remark" label="备注" />
          </div>
        </div>
      </div>

      <div class="card" :style="{height: active4 ? 'auto' : '50px'}" v-if="formState.detectionResult && formState.detectionResult.length > 0">
        <div class="hd" @click="active4 = !active4">
          <div>
            <van-icon color="#bb5309" size="18" name="points" />职业病危害因素检测结果
          </div>
          <div>
            <van-icon name="arrow-down" v-show="!active4" />
            <van-icon name="arrow-up" v-show="active4" />
          </div>
        </div>
        <div class="content">
          <div class="item" v-for="item in formState.detectionResult">
            <van-field readonly v-model="item.testingAgencies" label="检测机构" />
            <van-field readonly v-model="item.detectionTime" label="检测时间" />
            检测结果：
            <div class="result" v-for="value in item.detectionResult">
              <van-field readonly v-model="value.hazardFactorsName" label="接触危害因素名称" />
              <van-field readonly v-model="value.cycle" label="体检周期" />
              <van-field readonly v-model="value.accordWith" label="是否符合" />
              <van-field readonly v-model="value.protectiveMeasures" label="防护措施" />
              <van-field readonly v-model="value.remark" label="备注" />
            </div>

          </div>
        </div>
      </div>

      <div class="card" :style="{height: active5 ? 'auto' : '50px'}" v-if="formState.reportList && formState.reportList.length > 0">
        <div class="hd" @click="active5 = !active5">
          <div>
            <van-icon color="#534fcc" size="18" name="goods-collect-o" />职业健康检查结果
          </div>
          <div>
            <van-icon name="arrow-down" v-show="!active5" />
            <van-icon name="arrow-up" v-show="active5" />
          </div>
        </div>
        <div class="content">
          <div class="item" v-for="item in formState.reportList">
            <van-field readonly v-model="item.checkDate" label="检查日期" />
            <van-field readonly v-model="item.type" label="体检种类">
              <template #input>{{ {'1': '岗前', '2': '在岗', '3': '离职'}[item.type] }}</template>
            </van-field>
            <van-field readonly v-model="item.checkResult" label="检查结果">
              <template #input>{{ {1: '未见异常', 2: '疑似职业病', 3: '禁忌证', 4: '其他疾患', 5: '复查'}[item.checkResult] }}</template>
            </van-field>
            <van-field readonly v-model="item.hazardFactorsName" label="接触危害因素名称" />
            <van-field readonly v-model="item.inspectionAgency" label="检测机构" />
            <van-field readonly v-model="item.post" label="岗位" />
            <van-field readonly v-model="item.personnelHandling" label="人员处理情况">
              <template #input>{{ {1: '无', 2: '调离', 3: '暂时脱离工作岗位', 4: '复查', 5: '医学观察'}[item.personnelHandling] }}</template>
            </van-field>
            <van-field readonly v-model="item.processingSituation" label="现场处理情况">
              <template #input>{{ {1: '无', 2: '整改完成'}[item.processingSituation] }}</template>
            </van-field>
            <van-field
              :disabled="pageType == 'detail'"
              v-model="formState.reportFile"
              readonly
              name="reportFile"
              label="体检报告："
              :rules="[{ required: true, message: '请上传' }]"
              placeholder="请选择"
            >
              <template #input>
                <AppCustomizeUpload
                  v-model:fileList="item.reportFile"
                  multiple
                  :disabled="pageType == 'detail'"
                  accept=".docx,.doc,.xlsx,.xls,.pdf,.png,.jpeg,.jpg"
                />
              </template>
            </van-field>
          </div>
        </div>
      </div>
    </div>
    
    <van-popup v-model:show="htmlShow" closeable position="bottom" style="height: 100%" :title="htmlTitle" show-cancel-button>
      <iframe ref="htmlRef" :srcdoc="htmlContent" frameborder="0" width="100%" height="100%"></iframe>
    </van-popup>
  </div>
</template>
<script lang="ts" setup>
  import AppCustomizeUpload from '../../components/AppCustomizeUpload.vue';
  import {
    hazardFactors,
    archivesDetail,
  } from '/@/views/occupationalHealth/api';
  import { useRoute, useRouter } from 'vue-router';
  import { computed, ref } from 'vue';
  import { useUserStore } from '/@/store/modules/user';
  import { getDictItemsByCode } from '/@/utils/dict';
  const route = useRoute();
  const signature = ref('');
  const { userInfo } = useUserStore(); // 类型断言
  const pageType: any = computed(() => route.query.type);
  const active = ref(true);
  const active2 = ref(false);
  const active3 = ref(false);
  const active4 = ref(false);
  const active5 = ref(false);
  const checkResult = {
    1: '未见异常',
    2: '疑似职业病',
    3: '禁忌证',
    4: '其他疾患',
    5: '复查',
  };
  const personnelHandling = {
    1: '无',
    2: '调离',
    3: '暂时脱离工作岗位',
    4: '复查',
    5: '医学观察',
  };
   const pq_education_list = getDictItemsByCode('pq_education');
  const formState = ref<any>({
    orgCode: undefined,
    workshop: undefined,
    location: '',
    type: '',
    model: '',
    number: '',
    dutyUser: '',
    checkDate: '',
    expirationDate: '',
    checkResult: '',
    personnelHandlingName: '',
  });

  const categoryOptions = ref<any[]>([]);
  const pageInit = async () => {
    formState.value.id = route.query.id;
    let res = await archivesDetail({ id: route.query.id });
    if (route.query.type === 'detail') {
      Object.assign(formState.value, res);
    }
    let hazardFactorsRes = await hazardFactors();
    categoryOptions.value = hazardFactorsRes;
    formState.value.detectionResult.forEach((item) => {
      item.detectionResult.forEach((citem) => {
        let c = categoryOptions.value.find((item) => item.id == citem.hazardFactors);
        if(c) {
          citem.hazardFactorsName = c.name;
          citem.unit = c.unit;
        }
      });
    });
    formState.value.reportList.forEach((item) => {
        let c = categoryOptions.value.find((item) => item.id == item.hazardFactors);
        if(c) {
          item.hazardFactorsName = c.name;
          item.unit = c.unit;
        }
    });
    if(formState.value.hazardFactors) {
      formState.value.hazardFactors.split(',').forEach((item) => {
        let c = categoryOptions.value.find((val) => val.id == item);
        if(c) {
          if(!formState.value.hazardFactorsName) formState.value.hazardFactorsName = '';
          formState.value.hazardFactorsName += c.name + ',';
        }
      });
    }
    if(formState.value.educationLevel){
      formState.value.educationLevelName = pq_education_list.find((item) => item.value == formState.value.educationLevel).label;
    }

    if (res.infoList) {
      res.infoList.forEach((item) => {
        item.checkResultName = checkResult[item.checkResult];
        item.personnelHandlingName = personnelHandling[item.personnelHandling];
        item.processingSituationName = checkResult[item.processingSituation];
      });
    }
    // Object.assign(formState.value, res)
    if (userInfo?.signature) {
      if (/^http/i.test(userInfo.signature)) signature.value = userInfo.signature;
    }
  };
  pageInit();

  const htmlShow = ref(false);
  const htmlTitle = ref('');
  const htmlContent = ref('');
  const htmlRef = ref(null);
</script>
<style lang="less" scoped>
  .plan-detail {
    width: 100%;
    height: 100%;
    padding-top: 70px;
    overflow: auto;
    header{
      width: 100%;
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 15px;
      box-shadow:  0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
      position: fixed;
      top: 0;
      left: 0;
      z-index: 99;
      background-color: #ffffff;
      h1{
        padding: 0;
        margin: 0;
        color: #1890ff;
        font-weight: 600;
        font-size: 16px;
      }
      div{
        display: flex;
        align-items: center;
        span{
          padding: 3px 9px;
          color: #1890ff;
          background-color: #d4e9fd;
          border-radius: 3px;
          margin-left: 15px;
        }
      }
    }
    .main{
      width: 100%;
      padding: 0 15px;
      .card{
        width: 100%;
        height: 50px;
        border-radius: 6px;
        overflow: hidden;
        transition: all 0.3s;
        margin-bottom: 15px;
        box-shadow:  0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
        .hd{
          color: #1890ff;
          display: flex;
          font-size: 16px;
          font-weight: 600;
          justify-content: space-between;
          height: 50px;
          align-items: center;
          padding: 0 15px;
          background-color: #dbeafe;
        }
      }
      .card:nth-child(2) {
        .hd{
          color: #7e22ce;
          background-color: #f6edff;
        }
      }
      .card:nth-child(3) { 
        .hd{
          color: #15803d;
          background-color: #e2fceb;
        }
      }
      .card:nth-child(4) { 
        .hd{
          color: #bb5309;
          background-color: #fef4cd;
        }
      }
      .card:nth-child(5) { 
        .hd{
          color: #534fcc;
          background-color: #e4eafe;
        }
      }
      .content {
        padding: 10px;
        .item {
          width: 100%;
          background: #f9fafb;
          border-radius: 8px;
          padding: 10px;
          margin-bottom: 15px;
        }
      }
    }
    
  }

  .record-list {
    width: 100%;

    .tit {
      display: flex;
      align-items: center;
      justify-content: space-between;
      line-height: 36px;

      span {
        color: #1890ff;
      }
    }
  }

  .info {
    width: 100%;
    height: 100%;
    padding: 16px;

    .li {
      padding: 10px 0;
      display: flex;
      word-break: break-all;

      .lable {
        display: inline-block;
        width: 100px;
        color: #777;
      }

      .file {
        flex: 1;
        color: #1890ff;
      }
    }

    .list {
      padding-left: 10px;
      display: flex;
      align-items: center;
      background-color: #f5f5f5;

      .item {
        flex: 1;
        overflow: hidden;
      }

      .lable {
        width: 70px;
      }

      .text {
        flex: 1;
        word-break: break-all;
        word-wrap: break-word;
      }
    }

    .sort {
      width: 18px;
      height: 18px;
      border-radius: 50%;
      border: 1px solid #666;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 10px;
    }
  }
  :deep(.van-cell) {
    background-color: transparent !important;
  }
  :deep(.van-collapse-item__content) {
    padding: 0;
  }
  :deep(.van-field--disabled .van-field__label) {
    color: #323233;
  }

  .othertext {
    width: 100%;
    display: flex;
  }

  .aling-top {
    .van-checkbox {
      align-items: flex-start !important;
    }

    :deep(.van-checkbox__icon) {
      margin-top: 4px !important;
    }
  }
</style>
