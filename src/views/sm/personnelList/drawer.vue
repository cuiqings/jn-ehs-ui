<template>
  <BasicDrawer
    v-bind="$attrs"
    @register="registerDrawer"
    :title="title"
    ok-text="提交"
    @ok="handleSubmit"
    :width="1000"
    :show-footer="showFooter"
    :show-ok-btn="showOkBtn"
    destroyOnClose
  >
    <a-form :model="info" ref="infoForm" :label-col="{ span: 8 }" :wrapper-col="{ span: 16 }">
      <div class="nav" v-if="type !== 'add'"> 基本信息</div>
      <a-row :gutter="24">
        <a-col class="gutter-row" :span="12" v-if="type !== 'add'">
          <a-form-item label="企业名称" name="companyName" :rules="[{ required: showOkBtn }]">
            <InputTextArea v-model:value="info.companyName" placeholder="请输入" disabled autoSize />
          </a-form-item>
        </a-col>
        <a-col class="gutter-row" :span="12" v-else>
          <a-form-item label="企业名称" name="companyId" :rules="[{ required: showOkBtn, message: '请选择企业名称!' }]">
            <a-select
              v-model:value="info.companyId"
              :options="companyOptions"
              placeholder="请选择"
              :disabled="!showOkBtn || companyIdDisabled"
              show-search
              :filterOption="(input: string, option: any) =>  option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0"
            />
          </a-form-item>
        </a-col>
        <a-col class="gutter-row" :span="12">
          <a-form-item label="姓名" name="name" :rules="[{ required: showOkBtn, message: '请输入姓名!' }]">
            <a-input v-model:value="info.name" placeholder="请输入" :disabled="!showOkBtn" :maxlength="10" />
          </a-form-item>
        </a-col>
      </a-row>
      <a-row :gutter="24">
        <a-col class="gutter-row" :span="12" v-if="type !== 'add'">
          <a-form-item label="工作证号" name="workNo">
            <a-input v-model:value="info.workNo" placeholder="请输入" disabled />
          </a-form-item>
        </a-col>
        <a-col class="gutter-row" :span="12">
          <a-form-item label="性别" name="sex" :rules="[{ required: showOkBtn, message: '请选择性别!' }]">
            <a-select
              v-model:value="info.sex"
              :disabled="!showOkBtn"
              :options="[
                { label: '男', value: '1' },
                { label: '女', value: '2' },
              ]"
              placeholder="请选择"
            />
          </a-form-item>
        </a-col>
        <a-col class="gutter-row" :span="12">
          <a-form-item label="年龄" name="age" :rules="[{ required: showOkBtn, message: '请输入年龄!' }]">
            <a-input-number
              v-model:value="info.age"
              style="width: 100%"
              placeholder="请输入"
              :min="18"
              :max="99"
              :controls="false"
              :disabled="!showOkBtn"
              :maxlength="2"
            />
          </a-form-item>
        </a-col>
        <a-col class="gutter-row" :span="12">
          <a-form-item label="联系方式" name="phone" :rules="[{ required: showOkBtn, validator: validatorPhone }]">
            <a-input v-model:value="info.phone" :maxlength="11" placeholder="请输入" :disabled="!showOkBtn" />
          </a-form-item>
        </a-col>
      </a-row>
      <a-row :gutter="24">
        <a-col class="gutter-row">
          <a-form-item label="合同单位" name="contractOrgCode" :rules="[{ required: showOkBtn, message: '请选择企业名称!' }]">
            <JSelectMultiple
              v-if="type !== 'view'"
              v-model:value="info.contractOrgCode"
              :options="contractOrgCodeOptions"
              :show-choose-option="false"
              show-search
              placeholder="请选择"
            />
            <a-input v-else v-model:value="info.contractOrgName" disabled />
          </a-form-item>
        </a-col>
      </a-row>
      <a-row :gutter="24">
        <a-col class="gutter-row">
          <a-form-item label="健康状况" name="healthStatus">
            <InputTextArea v-model:value="info.healthStatus" :disabled="!showOkBtn" placeholder="请输入" autoSize :maxlength="200" />
          </a-form-item>
        </a-col>
      </a-row>
      <a-row :gutter="24">
        <a-col class="gutter-row" :span="12">
          <a-form-item
            label="身份证号"
            name="idNumber"
            :rules="[
              {
                pattern: /^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[1-2]\d|3[0-1])\d{3}[\dX]$/,
                required: showOkBtn,
                message: '请输入正确的身份证号!',
              },
            ]"
          >
            <a-input v-model:value="info.idNumber" placeholder="请输入" :disabled="!showOkBtn" />
          </a-form-item>
        </a-col>
        <a-col class="gutter-row" :span="12">
          <a-form-item label="身份证复印件" name="idNumberFile">
            <customize-upload v-model:value="info.idNumberFile" :disabled="!showOkBtn" :max-count="2" />
          </a-form-item>
        </a-col>
      </a-row>
      <a-row :gutter="24">
        <a-col class="gutter-row" :span="12">
          <a-form-item label="保险类型" name="insType" :rules="[{ required: showOkBtn, message: '请选择保险类型!' }]">
            <a-select
              v-model:value="info.insType"
              :disabled="!showOkBtn"
              :options="[
                { label: '工伤保险', value: '1' },
                { label: '意外伤害险', value: '2' },
              ]"
              placeholder="请选择"
              @change="changeInsType"
            />
          </a-form-item>
        </a-col>
        <a-col class="gutter-row" :span="12" v-if="info.insType === '1'">
          <a-form-item label="工伤保险缴纳证明" name="icInsFile" :rules="[{ required: showOkBtn, message: '请上传工伤保险缴纳证明!' }]">
            <customize-upload v-model:value="info.icInsFile" :disabled="!showOkBtn" :max-count="5" />
          </a-form-item>
        </a-col>
      </a-row>
      <a-row :gutter="24" v-if="info.insType === '2'">
        <a-col class="gutter-row" :span="12">
          <a-form-item label="意外伤害险期限" name="aiInsDate" :rules="[{ required: showOkBtn, message: '请选择意外伤害险期限!' }]">
            <a-range-picker style="width: 100%" valueFormat="YYYY-MM-DD" :disabled="!showOkBtn" v-model:value="info.aiInsDate" />
          </a-form-item>
        </a-col>
        <a-col class="gutter-row" :span="12">
          <a-form-item label="意外伤害险缴纳证明" name="aiInsFile" :rules="[{ required: showOkBtn, message: '请上传意外伤害险缴纳证明!' }]">
            <customize-upload v-model:value="info.aiInsFile" :disabled="!showOkBtn" :max-count="15" />
          </a-form-item>
        </a-col>
      </a-row>
      <a-row :gutter="24">
        <a-col class="gutter-row" :span="12">
          <a-form-item label="工种" name="workType" :rules="[{ required: showOkBtn, message: '请输入工种!' }]">
            <InputTextArea v-model:value="info.workType" :disabled="!showOkBtn" placeholder="请输入" autoSize :maxlength="50" />
          </a-form-item>
        </a-col>
        <a-col class="gutter-row" :span="12">
          <a-form-item label="是否特种作业人员" name="ifSpecialOperator" :rules="[{ required: showOkBtn, message: '请选择是否特种作业人员!' }]">
            <a-select
              v-model:value="info.ifSpecialOperator"
              :disabled="!showOkBtn"
              :options="[
                { label: '是', value: '1' },
                { label: '否', value: '2' },
              ]"
              placeholder="请选择"
              @change="changeIfSpecialOperator"
            />
          </a-form-item>
        </a-col>
      </a-row>
      <a-row :gutter="24">
        <a-col class="gutter-row" :span="12">
          <a-form-item label="体检报告到期时间" name="physicalReportOvertime" :rules="[{ required: showOkBtn, message: '请选择!' }]">
            <a-date-picker
              style="width: 100%"
              format="YYYY-MM-DD"
              valueFormat="YYYY-MM-DD"
              placeholder="请选择"
              v-model:value="info.physicalReportOvertime"
              :disabled="!showOkBtn"
              :disabledDate="(current) => current && dayjs(current).isBefore(dayjs(new Date()).endOf('day'))"
            />
          </a-form-item>
        </a-col>
        <a-col class="gutter-row" :span="12">
          <a-form-item label="体检报告" name="physicalReportFile" :rules="[{ required: showOkBtn, message: '请上传体检报告!' }]">
            <customize-upload v-model:value="info.physicalReportFile" :disabled="!showOkBtn" :max-count="5" />
          </a-form-item>
        </a-col>
      </a-row>
      <a-row :gutter="24" v-if="isBlacklist">
        <a-col class="gutter-row" :span="12">
          <a-form-item label="列入黑名单原因" name="blackRemark">
            <a-textarea v-model:value="info.blackRemark" disabled autoSize />
          </a-form-item>
        </a-col>
      </a-row>
      <a-tabs v-model:activeKey="activeKey" :type="!showOkBtn ? 'card' : 'editable-card'" @edit="onEdit">
        <template #addIcon>
          <div> <PlusOutlined />&nbsp;新增作业证 </div>
        </template>
        <a-tab-pane v-for="(item, index) in tabsPanes" :key="item.key" :tab="item.title" :closable="item.closable">
          <div v-if="info.certificateList.length > 0">
            <a-row :gutter="24">
              <a-col class="gutter-row" :span="12">
                <a-form-item
                  label="证书类型"
                  :name="['certificateList', index, 'certificateType']"
                  :rules="[{ required: showOkBtn, message: '请选择证书类型!' }]"
                >
                  <j-dict-select-tag
                    v-model:value="info.certificateList[index].certificateType"
                    style="width: 100%"
                    dictCode="pq_certificate_type"
                    :show-choose-option="false"
                    placeholder="请选择"
                    :string-to-number="false"
                    :disabled="!showOkBtn"
                  />
                </a-form-item>
              </a-col>
              <a-col class="gutter-row" :span="12">
                <a-form-item
                  label="作业类别"
                  :name="['certificateList', index, 'workType']"
                  :rules="[{ required: showOkBtn && info.certificateList[index].certificateType === '1', message: '请选择作业类别!' }]"
                >
                  <j-dict-select-tag
                    v-model:value="info.certificateList[index].workType"
                    style="width: 100%"
                    dictCode="person_list_work_type"
                    :show-choose-option="false"
                    placeholder="请选择"
                    :string-to-number="false"
                    :disabled="!showOkBtn"
                    @change="changeWorkType($event, index)"
                  />
                </a-form-item>
              </a-col>
            </a-row>
            <a-row :gutter="24">
              <a-col class="gutter-row" :span="12">
                <a-form-item
                  label="准操项目"
                  :name="['certificateList', index, 'allowableItem']"
                  :rules="[{ required: showOkBtn && info.certificateList[index].certificateType === '1', message: '请选择准操项目!' }]"
                >
                  <j-dict-select-tag
                    v-model:value="info.certificateList[index].allowableItem"
                    style="width: 100%"
                    :dictCode="info.certificateList[index].workType"
                    :show-choose-option="false"
                    placeholder="请选择"
                    :string-to-number="false"
                    :disabled="!showOkBtn"
                  />
                </a-form-item>
              </a-col>
              <a-col class="gutter-row" :span="12">
                <a-form-item
                  label="证书名称"
                  :name="['certificateList', index, 'certificateName']"
                  :rules="[{ required: showOkBtn && info.certificateList[index].certificateType !== '1', message: '请输入证书名称!' }]"
                >
                  <a-input v-model:value="info.certificateList[index].certificateName" placeholder="请输入" :disabled="!showOkBtn" :maxlength="30" />
                </a-form-item>
              </a-col>
            </a-row>
            <a-row :gutter="24">
              <a-col class="gutter-row" :span="12">
                <a-form-item
                  label="证书编号"
                  :name="['certificateList', index, 'certificateNo']"
                  :rules="[{ required: showOkBtn, message: '请输入证书编号!' }]"
                >
                  <a-input v-model:value="info.certificateList[index].certificateNo" placeholder="请输入" :disabled="!showOkBtn" :maxlength="50" />
                </a-form-item>
              </a-col>
              <a-col class="gutter-row" :span="12">
                <a-form-item label="取证日期" name="obtainDate">
                  <a-date-picker
                    style="width: 100%"
                    format="YYYY-MM-DD"
                    valueFormat="YYYY-MM-DD"
                    placeholder="请选择"
                    v-model:value="info.certificateList[index].obtainDate"
                    :disabled="!showOkBtn"
                    :disabledDate="(current) => current && dayjs(current).isAfter(dayjs(new Date()).endOf('day'))"
                  />
                </a-form-item>
              </a-col>
            </a-row>
            <a-row :gutter="24">
              <a-col class="gutter-row" :span="12">
                <a-form-item
                  label="下一次复审/换证日期"
                  :name="['certificateList', index, 'reviewDate']"
                  :rules="[{ required: showOkBtn, message: '请选择下一次复审/换证日期!' }]"
                >
                  <a-date-picker
                    style="width: 100%"
                    format="YYYY-MM-DD"
                    valueFormat="YYYY-MM-DD"
                    placeholder="请选择"
                    v-model:value="info.certificateList[index].reviewDate"
                    :disabled="!showOkBtn"
                    :disabledDate="(current) => current && dayjs(current).isBefore(dayjs(info.certificateList[index].obtainDate).endOf('day'))"
                  />
                </a-form-item>
              </a-col>
              <a-col class="gutter-row" :span="12">
                <a-form-item
                  label="证书复印件"
                  :name="['certificateList', index, 'certificateFile']"
                  :rules="[{ required: showOkBtn, message: '请上传证书复印件!' }]"
                >
                  <customize-upload v-model:value="info.certificateList[index].certificateFile" :disabled="!showOkBtn" :max-count="5" />
                </a-form-item>
              </a-col>
            </a-row>
          </div>
        </a-tab-pane>
      </a-tabs>
      <div v-if="type === 'view'">
        <div class="nav"> 安全教育培训</div>
        <a-row :gutter="24">
          <a-col class="gutter-row" :span="12">
            <a-form-item label="教育培训状态" name="trainDateStart">
              <a-input :value="info.trainDateStart ? info.trainDateStart : '无'" disabled />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="24">
          <a-col class="gutter-row" :span="24">
            <a-form-item label="安全教育卡" name="trainCard">
              <div v-if="info.trainCard?.length > 0">
                <div v-for="(item, index) in info.trainCard" :key="index" style="display: flex; align-items: center">
                  <img :src="imgUrl(item)" style="width: 70px; height: 99px; cursor: pointer; margin-bottom: 15px" @click="handleCert(item)" />
                  <div style="margin-left: 40px">
                    <p>{{ item?.render?.name }}</p>
                    <span style="color: #888888">{{ item.issueDate }}</span>
                  </div>
                </div>
              </div>
              <span v-else>无</span>
            </a-form-item>
          </a-col>
        </a-row>
        <div v-if="logList.length > 0">
          <div class="nav"> 违章记录明细</div>
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
    </a-form>
  </BasicDrawer>
  <cert-modal @register="registerModal" />
</template>
<script lang="ts" name="examineRecord-drawer" setup>
  import useDrawer from './hooks/useDrawer';
  import { JDictSelectTag } from '/@/components/Form';
  import CustomizeUpload from '../components/CustomizeUpload.vue';
  import { ref } from 'vue';
  import dayjs from 'dayjs';
  import { Input } from 'ant-design-vue';
  import CertModal from '../../education/student/studyRecord/components/CertModal.vue';
  import { JSelectMultiple } from '/@/components/Form';
  const InputTextArea = Input.TextArea;
  const emit = defineEmits(['success']);
  const infoForm = ref();
  const {
    BasicDrawer,
    registerDrawer,
    title,
    showFooter,
    showOkBtn,
    handleSubmit,
    info,
    activeKey,
    onEdit,
    tabsPanes,
    changeWorkType,
    validatorPhone,
    type,
    isBlacklist,
    imgUrl,
    registerModal,
    handleCert,
    changeIfSpecialOperator,
    changeInsType,
    companyOptions,
    companyIdDisabled,
    logList,
    contractOrgCodeOptions,
  } = useDrawer(emit, infoForm);
</script>
<style lang="less" scoped>
  :deep(.ant-tabs-nav-add) {
    line-height: 40px;
    width: 106px;
  }
  :deep(.ant-tabs) {
    overflow: initial;
  }
  .nav {
    color: #1890ff;
    margin-bottom: 10px;
  }
  :deep(.ant-col-8) {
    width: 160px !important;
    flex: none !important;
    max-width: 160px !important;
  }
  :deep(.ant-col-16) {
    width: calc(100% - 160px) !important;
    max-width: calc(100% - 160px) !important;
    flex: none !important;
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
</style>
