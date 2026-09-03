<template>
  <BasicDrawer
    :showFooter="false"
    forceRender
    v-bind="$attrs"
    @register="register"
    :title="title"
    width="65%"
    @close="close"
    @ok="handleSubmit"
    destroyOnClose
  >
    <div style="width: 100%; padding-bottom: 60px">
      <a-form ref="formRef" :model="formState" name="basic" :label-col="{ span: 4 }" :wrapper-col="{ span: 20 }">
        <a-row :gutter="12">
          <a-col :span="12">
            <a-form-item label="所属单位" name="orgCode" :rules="[{ required: true, message: '请选择' }]">
              <a-select
                v-model:value="formState.orgCode"
                :options="departList"
                @change="orgChange"
                :disabled="readonly"
                placeholder="请选择"
                :fieldNames="{ label: 'departName', value: 'orgCode' }"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="所属车间" name="workshop" :rules="[{ required: true, message: '请选择' }]">
              <a-select
                v-model:value="formState.workshop"
                :options="departList2"
                :disabled="readonly"
                placeholder="请选择"
                @change="workshopChange"
                :fieldNames="{ label: 'departName', value: 'orgCode' }"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="姓名" name="userId" :rules="[{ required: true, message: '请选择' }]">
              <a-select
                v-model:value="formState.userId"
                show-search
                :options="userList"
                :disabled="readonly"
                placeholder="请选择"
                @change="userChange"
                :fieldNames="{ label: 'label', value: 'id' }"
                :filter-option="filterOption"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="工号" name="workNo" :rules="[{ required: true, message: '请输入' }]">
              <a-input disabled v-model:value="formState.workNo" placeholder="请输入" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="岗位" name="post" :rules="[{ required: true, message: '请输入' }]">
              <a-input v-model:value="formState.post" :disabled="readonly" placeholder="请输入" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="身份证号" name="idCard" :rules="[{ required: true, validator: idCardValidator }]">
              <a-input @change="idcodeChange" v-model:value="formState.idCard" :disabled="readonly" placeholder="请输入" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="出生日期" name="birthDate" :rules="[{ required: true, message: '请输入' }]">
              <a-input disabled v-model:value="formState.birthDate" placeholder="请输入" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="年龄" name="age" :rules="[{ required: true, message: '请输入' }]">
              <a-input disabled v-model:value="formState.age" placeholder="请输入" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="性别" name="gender" :rules="[{ required: true, message: '请选择' }]">
              <a-radio-group v-model:value="formState.gender" :disabled="readonly">
                <a-radio value="1">男</a-radio>
                <a-radio value="2">女</a-radio>
              </a-radio-group>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="手机号码" name="phone" :rules="[{ required: true ,validator: phoneValidator }]">
              <a-input v-model:value="formState.phone" :disabled="readonly" placeholder="请输入" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="籍贯" name="nativePlace" :rules="[{ required: true, message: '请输入' }]">
              <a-input v-model:value="formState.nativePlace" :disabled="readonly" placeholder="请输入" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="入厂日期" name="joinDate" :rules="[{ required: true, message: '请选择' }]">
              <a-date-picker
                @change="onJoinDateChange"
                format="YYYY-MM-DD"
                valueFormat="YYYY-MM-DD"
                style="width: 100%"
                :disabledDate="disabledDate"
                v-model:value="formState.joinDate"
                :disabled="readonly"
                placeholder="请选择"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="总工龄" name="totalWorkAge" :rules="[{ required: true, message: '请输入' }]">
              <a-input disabled v-model:value="formState.totalWorkAge" placeholder="请输入" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="接害日期" name="harmDate" :rules="[{ required: true, message: '请选择' }]">
              <a-date-picker
                @change="onHarmDateChange"
                format="YYYY-MM-DD"
                valueFormat="YYYY-MM-DD"
                style="width: 100%"
                :disabledDate="disabledDate"
                v-model:value="formState.harmDate"
                :disabled="readonly"
                placeholder="请选择"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="接害工龄" name="harmWorkAge" :rules="[{ required: true, message: '请输入' }]">
              <a-input disabled v-model:value="formState.harmWorkAge" placeholder="请输入" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="危害因素" name="hazardFactors" :rules="[{ required: true, message: '请选择' }]">
              <a-select mode="multiple" v-model:value="formState.hazardFactors" :disabled="readonly" placeholder="请选择">
                <a-select-option v-for="item in categoryOptions" :value="item.id">{{ item.name }}</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="曾用名" name="formerName">
              <a-input v-model:value="formState.formerName" :disabled="readonly" placeholder="请输入" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label=" 婚姻" name="maritalStatus">
              <a-radio-group v-model:value="formState.maritalStatus" :disabled="readonly">
                <a-radio value="1">未婚</a-radio>
                <a-radio value="2">已婚</a-radio>
                <a-radio value="3">离异</a-radio>
              </a-radio-group>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="嗜好" name="hobbies">
              <a-input v-model:value="formState.hobbies" :disabled="readonly" placeholder="请输入" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="文化程度" name="educationLevel">
              <a-select v-model:value="formState.educationLevel" :disabled="readonly" placeholder="请选择">
                <a-select-option v-for="item in pq_education_list" :value="item.value">{{ item.text }}</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        <a-collapse v-model:activeKey="activeKey">
          <a-collapse-panel key="1" header="职业史">
            <a-row
              :gutter="12"
              v-for="(item, idx) in formState.professionalHistory"
              :style="{ 'background-color': idx % 2 === 1 ? '#f5f5f5' : '', paddingTop: '16px' }"
            >
              <a-col :span="12">
                <a-form-item
                  :label-col="{ span: 5 }"
                  :wrapper-col="{ span: 19 }"
                  label="用人单位名称"
                  :name="['professionalHistory', idx, 'companyName']"
                  :rules="[{ required: true, message: '请输入' }]"
                >
                  <a-input v-model:value="item.companyName" :disabled="readonly" placeholder="请输入" />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item
                  :label-col="{ span: 5 }"
                  :wrapper-col="{ span: 19 }"
                  label="从事工种"
                  :name="['professionalHistory', idx, 'workType']"
                  :rules="[{ required: true, message: '请输入' }]"
                >
                  <a-input v-model:value="item.workType" :disabled="readonly" placeholder="请输入" />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item
                  :label-col="{ span: 5 }"
                  :wrapper-col="{ span: 19 }"
                  label="工作起止时间"
                  :name="['professionalHistory', idx, 'time']"
                  :rules="[{ required: true, validator: (ru, v) => timeValidator(idx) }]"
                >
                  <div class="my-time-picker">
                    <div class="time">
                      <a-date-picker :showToday="false" format="YYYY-MM-DD" :disabled="readonly" placeholder="请选择开始日期"
                        valueFormat="YYYY-MM-DD" :disabledDate="disabledDate" style="width: 100%;" v-model:value="item.workStartTime" >
                      </a-date-picker>
                    </div>
                    <span class="line">~</span>
                    <div class="time">
                      <a-input class="t-input" :disabled="readonly" v-model:value="item.workEndTime" placeholder="请选择结束日期">
                        <template #suffix>
                          <a-tooltip title="Extra information">
                            <calendar-outlined style="color: rgba(0, 0, 0, 0.45)" />
                          </a-tooltip>
                        </template>
                      </a-input>
                      <a-date-picker :disabledDate="disabledDate" class="t-picker" style="width: 100%;opacity: 0;" :showToday="false"  :disabled="readonly"
                        @change="timeChange($event, idx)"
                        format="YYYY-MM-DD"
                        valueFormat="YYYY-MM-DD"
                        v-model:value="item.workEndTimeStr" ref="rangePickerRef">
                        <template #renderExtraFooter>
                          <div style="text-align: right;">
                            <a-button type="link" @click="handleTodayClick(idx)">至今</a-button>
                          </div>
                        </template>
                      </a-date-picker>
                    </div>
                  </div>
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item
                  :label-col="{ span: 6 }"
                  :wrapper-col="{ span: 18 }"
                  label="接触危害因素名称"
                  :name="['professionalHistory', idx, 'hazardFactors']"
                  :rules="[{ required: true, message: '请输入' }]"
                >
                  <a-input v-model:value="item.hazardFactors" :disabled="readonly" placeholder="请输入" />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item
                  :label-col="{ span: 5 }"
                  :wrapper-col="{ span: 19 }"
                  label="证明人"
                  :name="['professionalHistory', idx, 'proofPerson']"
                  :rules="[{ required: true, message: '请输入' }]"
                >
                  <a-input v-model:value="item.proofPerson" :disabled="readonly" placeholder="请输入" />
                </a-form-item>
              </a-col>
              <a-col :span="12" style="text-align: center">
                <a-button danger @click="cut(idx, 1)" :disabled="readonly">删除</a-button>
              </a-col>
            </a-row>
            <div style="text-align: center; padding-top: 16px">
              <a-button type="primary" @click="add(1)" :disabled="readonly">
                <template #icon>
                  <PlusOutlined />
                </template>
                添加职业史
              </a-button>
            </div>
          </a-collapse-panel>
          <a-collapse-panel key="2" header="既往病史">
            <a-row
              :gutter="12"
              v-for="(item, idx) in formState.diseaseHistory"
              :style="{ 'background-color': idx % 2 === 1 ? '#f5f5f5' : '', paddingTop: '16px' }"
            >
              <a-col :span="12">
                <a-form-item label="曾患病" :name="['diseaseHistory', idx, 'diseaseHistory']" :rules="[{ required: true, message: '请输入' }]">
                  <a-input v-model:value="item.diseaseHistory" :disabled="readonly" placeholder="请输入" />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="诊断日期" :name="['diseaseHistory', idx, 'diagnosisDate']" :rules="[{ required: true, message: '请输入' }]">
                  <a-date-picker
                    style="width: 100%"
                    :disabledDate="disabledDate"
                    format="YYYY-MM-DD"
                    valueFormat="YYYY-MM-DD"
                    v-model:value="item.diagnosisDate"
                    :disabled="readonly"
                    placeholder="请选择"
                  />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="诊断单位" :name="['diseaseHistory', idx, 'diagnosisUnit']" :rules="[{ required: true, message: '请输入' }]">
                  <a-input v-model:value="item.diagnosisUnit" :disabled="readonly" placeholder="请输入" />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="诊疗结果" :name="['diseaseHistory', idx, 'diagnosisResult']" :rules="[{ required: true, message: '请输入' }]">
                  <a-input v-model:value="item.diagnosisResult" :disabled="readonly" placeholder="请输入" />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="备注" :name="['diseaseHistory', idx, 'remark']">
                  <a-input v-model:value="item.remark" :disabled="readonly" placeholder="请输入" />
                </a-form-item>
              </a-col>
              <a-col :span="12" style="text-align: center">
                <a-button danger @click="cut(idx, 2)" :disabled="readonly">删除</a-button>
              </a-col>
            </a-row>
            <div style="text-align: center; padding-top: 16px">
              <a-button type="primary" @click="add(2)" :disabled="readonly">
                <template #icon>
                  <PlusOutlined />
                </template>
                添加职业史
              </a-button>
            </div>
          </a-collapse-panel>
          <a-collapse-panel
            key="3"
            header="职业病危害因素检测结果"
            v-if="formState.detectionResult && formState.detectionResult.length > 0 && title == '详情'"
          >
            <div v-for="fitem in formState.detectionResult" :key="fitem.id">
              <a-row :gutter="12">
                <a-col :span="12">
                  <a-form-item :label-col="{ span: 5 }" :wrapper-col="{ span: 19 }" label="检测机构" name="testingAgencies">
                    <a-input disabled v-model:value="fitem.testingAgencies" placeholder="请输入" />
                  </a-form-item>
                </a-col>
                <a-col :span="12">
                  <a-form-item :label-col="{ span: 5 }" :wrapper-col="{ span: 19 }" label="检测时间" name="detectionTime">
                    <a-date-picker
                      disabled
                      style="width: 100%"
                      :disabledDate="disabledDate"
                      format="YYYY-MM-DD"
                      valueFormat="YYYY-MM-DD"
                      v-model:value="fitem.detectionTime"
                      placeholder="请选择"
                    />
                  </a-form-item>
                </a-col>
                <a-col :span="24"> 检测结果： </a-col>
              </a-row>
              <a-row :gutter="12" v-for="(item, idx) in fitem.detectionResult">
                <a-col :offset="1" :span="11">
                  <a-form-item :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }" label="接触危害因素名称">
                    <a-input disabled v-model:value="item.hazardFactorsName" placeholder="请输入" />
                  </a-form-item>
                </a-col>
                <a-col :span="12">
                  <a-form-item :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }" label="检测结果">
                    <a-input :addon-after="item.unit" disabled v-model:value="item.detectionResult" placeholder="请输入" />
                  </a-form-item>
                </a-col>
                <a-col :offset="1" :span="11">
                  <a-form-item :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }" label="体检周期">
                    <template v-if="title == '详情'">
                      <a-input disabled v-model:value="item.cycle" placeholder="请输入" />
                    </template>
                    <template v-else>
                      <a-radio-group disabled v-model:value="item.cycle">
                        <a-radio v-for="citem in item.options" :value="citem">{{ citem }}</a-radio>
                      </a-radio-group>
                    </template>
                  </a-form-item>
                </a-col>
                <a-col :span="12">
                  <a-form-item :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }" label="是否符合">
                    <a-radio-group disabled v-model:value="item.accordWith">
                      <a-radio value="符合">符合</a-radio>
                      <a-radio value="不符合">不符合</a-radio>
                    </a-radio-group>
                  </a-form-item>
                </a-col>
                <a-col :offset="1" :span="11">
                  <a-form-item :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }" label="防护措施">
                    <a-input disabled v-model:value="item.protectiveMeasures" placeholder="请输入" />
                  </a-form-item>
                </a-col>
                <a-col :span="12">
                  <a-form-item :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }" label="备注">
                    <a-input disabled v-model:value="item.remark" placeholder="请输入" />
                  </a-form-item>
                </a-col>
              </a-row>
            </div>
          </a-collapse-panel>
          <a-collapse-panel key="4" header="职业健康检查结果" v-if="formState.reportList && formState.reportList.length > 0 && title == '详情'">
            <a-row :gutter="12" v-if="title === '详情'" v-for="item in formState.reportList">
              <a-col :span="12">
                <a-form-item
                  :label-col="{ span: 6 }"
                  :wrapper-col="{ span: 18 }"
                  label="检查日期"
                  name="checkDate"
                  :rules="[{ required: true, message: '请选择' }]"
                >
                  <a-date-picker disabled format="YYYY-MM-DD" value-format="YYYY-MM-DD" style="width: 100%" v-model:value="item.checkDate" />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item
                  :label-col="{ span: 6 }"
                  :wrapper-col="{ span: 18 }"
                  label="体检种类"
                  name="type"
                  :rules="[{ required: true, message: '请输入' }]"
                >
                  <!-- <a-input v-model:value="item.type" placeholder="请输入" /> -->
                  <a-select disabled v-model:value="item.type" placeholder="请选择">
                    <a-select-option value="1">岗前</a-select-option>
                    <a-select-option value="2">在岗</a-select-option>
                    <a-select-option value="3">离职</a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item
                  :label-col="{ span: 6 }"
                  :wrapper-col="{ span: 18 }"
                  label="接触危害因素名称"
                  name="hazardFactors"
                  :rules="[{ required: true, message: '请输入' }]"
                >
                  <a-input disabled v-model:value="item.hazardFactors" placeholder="" />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item
                  :label-col="{ span: 6 }"
                  :wrapper-col="{ span: 18 }"
                  label="检查结果"
                  name="checkResult"
                  :rules="[{ required: true, message: '请选择' }]"
                >
                  <a-select v-model:value="item.checkResult" disabled :options="checkResultList" placeholder="请选择" />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item
                  :label-col="{ span: 6 }"
                  :wrapper-col="{ span: 18 }"
                  label="检测机构"
                  name="inspectionAgency"
                  :rules="[{ required: true, message: '请输入' }]"
                >
                  <a-input disabled v-model:value="item.inspectionAgency" placeholder="请输入" />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item
                  :label-col="{ span: 6 }"
                  :wrapper-col="{ span: 18 }"
                  label="岗位"
                  name="post"
                  :rules="[{ required: true, message: '请输入' }]"
                >
                  <a-input disabled v-model:value="item.post" placeholder="请输入" />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item
                  :label-col="{ span: 6 }"
                  :wrapper-col="{ span: 18 }"
                  label="人员处理情况"
                  name="personnelHandling"
                  :rules="[{ required: true, message: '请选择' }]"
                >
                  <a-select disabled v-model:value="item.personnelHandling" placeholder="请选择">
                    <a-select-option value="1">无</a-select-option>
                    <a-select-option value="2">调离</a-select-option>
                    <a-select-option value="3">暂时脱离工作岗位</a-select-option>
                    <a-select-option value="4">复查</a-select-option>
                    <a-select-option value="5">医学观察</a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item
                  :label-col="{ span: 6 }"
                  :wrapper-col="{ span: 18 }"
                  label="现场处理情况"
                  name="processingSituation"
                  :rules="[{ required: true, message: '请选择' }]"
                >
                  <a-select disabled v-model:value="item.processingSituation" placeholder="请选择">
                    <a-select-option value="1">无</a-select-option>
                    <a-select-option value="2">整改完成</a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item
                  :label-col="{ span: 6 }"
                  :wrapper-col="{ span: 18 }"
                  label="体检报告"
                  name="reportFile"
                  :rules="[{ required: true, message: '请输入' }]"
                >
                  <JUpload ref="uploadRef" :maxCount="5" disabled v-model:value="item.reportFile" text="上传附件" />
                </a-form-item>
              </a-col>
            </a-row>
          </a-collapse-panel>
        </a-collapse>
      </a-form>
    </div>
    <template #footer>
      <div style="display: flex; align-items: center; justify-content: center; height: 60px">
        <a-space :size="24">
          <a-button @click="close">取消</a-button>
          <a-button :loading="submitIng" v-if="!readonly" type="primary" @click="handleSubmit">确定</a-button>
        </a-space>
      </div>
    </template>
  </BasicDrawer>
</template>
<script lang="ts" setup>
  import { getDepart3ListWithSecurity, selectDeptNew, userListByOrg } from '/@/api/common/api';
  import { archivesAdd, archivesEdit, hazardFactors, archivesDetail } from '../api';
  import { JUpload } from '/@/components/Form/src/jeecg/components/JUpload';
  import { CalendarOutlined, PlusOutlined } from '@ant-design/icons-vue';
  import { BasicDrawer, useDrawerInner } from '/@/components/Drawer';
  import { getDictItemsByCode } from '/@/utils/dict';
  import type { FormInstance } from 'ant-design-vue';
  import dayjs, { Dayjs } from 'dayjs';
  import { ref, reactive } from 'vue';

  const activeKey = ref(['1', '2', '3', '4']);
  const readonly = ref(false);
  const categoryOptions = ref<any[]>([]);
  const formRef = ref<FormInstance | null>(null);
  const title = ref('新增');
  const departList = ref<any[]>([]);
  const departList2 = ref<any[]>([]);
  const formState = reactive<any>({
    workNo: undefined,
    orgCode: undefined,
    workshop: undefined,
    post: '',
    name: undefined,
    userId: undefined,
    idCard: '',
    birthDate: '',
    gender: '',
    phone: '',
    nativePlace: '',
    joinDate: '',
    totalWorkAge: '',
    harmDate: '',
    harmWorkAge: '',
    hazardFactors: [],
    formerName: '',
    maritalStatus: '',
    hobbies: '',
    educationLevel: '',
    professionalHistory: [
      // {
      //   companyName: '',
      //   workType: '',
      //   workStartTime: '',
      //   workEndTime: '',
      //   hazardFactors: '',
      //   proofPerson: '',
      // },
    ],
    diseaseHistory: [
      // {
      //   diseaseHistory: '',
      //   diagnosisDate: '',
      //   diagnosisResult: '',
      //   diagnosisUnit: '',
      //   remark: '',
      // },
    ],
  });

  const checkResultList = ref([
    { label: '未见异常', value: '1' },
    { label: '疑似职业病', value: '2' },
    { label: '禁忌证', value: '3' },
    { label: '其他疾患', value: '4' },
    { label: '复查', value: '5' },
  ]);

  const pq_education_list = getDictItemsByCode('pq_education');

  const emits = defineEmits(['submitSuccess']);
  const submitIng = ref(false);
  const [register, { closeDrawer }] = useDrawerInner(async (data) => {
    title.value = data.title;
    departList.value = await getDepart3ListWithSecurity();
    if (title.value == '编辑') {
      let res = await archivesDetail({ id: data.record.id });
      Object.assign(formState, res);
      orgChange(formState.orgCode, 'edit');
      workshopChange(formState.workshop, 'edit');
      onJoinDateChange(formState.joinDate);
      onHarmDateChange(formState.harmDate);
      formState.hazardFactors = res.hazardFactors.split(',').map((item) => item * 1);
      formState.professionalHistory.forEach((item) => {
        item.time = [item.workStartTime, item.workEndTime];
        item.workEndTimeStr = item.workEndTime == '至今' ? dayjs().format('YYYY-MM-DD') : item.workEndTime;
      });
    }
    let hazardFactorsRes = await hazardFactors();
    categoryOptions.value = hazardFactorsRes;
    if (title.value == '详情') {
      readonly.value = true;
      let res = await archivesDetail({ id: data.record.id });
      Object.assign(formState, res);
      formState.hazardFactors = res.hazardFactors.split(',').map((item) => item * 1);
      formState.professionalHistory.forEach((item) => {
        item.time = [item.workStartTime, item.workEndTime];
        item.workEndTimeStr = item.workEndTime == '至今' ? dayjs().format('YYYY-MM-DD') : item.workEndTime;
      });
      formState.detectionResult.forEach((item) => {
        item.detectionResult.forEach((citem) => {
          let c = categoryOptions.value.find((item) => item.id == citem.hazardFactors);
          citem.hazardFactorsName = c.name;
          citem.unit = c.unit;
        });
      });
      orgChange(formState.orgCode, 'edit');
      workshopChange(formState.workshop, 'edit');
    }
    console.log(formState);
  });

  const idcodeChange = (e) => {
    if (e.target.value.length >= 15) {
      // 根据身份证号计算出生年月日和年龄
      const birth = calculateInfo(e.target.value);
      formState.birthDate = birth.birthDate;
      formState.age = birth.age;
      formState.gender = birth.gender;
    }
  };
  const onJoinDateChange = (e) => {
    const now = new Date();
    let date = new Date(e);
    let year = now.getFullYear() - date.getFullYear();
    let month = Math.abs(now.getMonth() - date.getMonth());
    formState.totalWorkAge = year > 0 ? year + '年' + month + '月' : month + '月';
  };
  const onHarmDateChange = (e) => {
    const now = new Date();
    let date = new Date(e);
    let year = now.getFullYear() - date.getFullYear();
    let month = Math.abs(now.getMonth() - date.getMonth());
    formState.harmWorkAge = year > 0 ? year + '年' + month + '月' : month + '月';
  };
  // 时间选择器 至今逻辑处理
  const rangePickerRef = ref<any>(null);
  const timeChange = (e, idx) => {
    console.log(e);
    formState.professionalHistory[idx].workEndTime = e;
  };
  const handleTodayClick = (idx) => {
    try {
      rangePickerRef.value[idx]?.blur();
    } catch (error) {}
    formState.professionalHistory[idx].workEndTime = '至今';
  };
  const timeValidator = (idx) => {
    if (!formState.professionalHistory[idx].workStartTime || !formState.professionalHistory[idx].workEndTime) {
      return Promise.reject('请选择工作起止日期！');;
    }
    if (
      formState.professionalHistory[idx].workStartTime && 
      formState.professionalHistory[idx].workEndTime && 
      dayjs(formState.professionalHistory[idx].workStartTime).isAfter(formState.professionalHistory[idx].workEndTime) ) {
      return Promise.reject('工作开始日期不能大于结束日期！');;
    }
    return Promise.resolve(true);
  }

  const userList = ref<any[]>([]);
  const orgChange = async (value, tag) => {
    departList2.value = await selectDeptNew({ orgCode: value });
    const users = await userListByOrg({ orgCode: value, pageSize: 100000 });
    users.records.forEach((user) => {
      user.label = `${user.realname}-${user.workNo}-${user.org3Name}`;
    });
    userList.value = users.records;
    if (tag != 'edit') {
      formState.name = undefined;
      formState.userId = undefined;
      formState.workNo = undefined;
      formState.workshop = undefined;
    }
  };

  const workshopChange = async (value, tag) => {
    const users = await userListByOrg({ orgCode: value, pageSize: 100000 });
    users.records.forEach((user) => {
      user.label = `${user.realname}-${user.workNo}-${user.org3Name}`;
    });
    userList.value = users.records;
    if (tag != 'edit') {
      formState.name = '';
      formState.userId = '';
      formState.workNo = '';
    }
  };

  const filterOption = (input: string, option: any) => {
    return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
  };
  const userChange = (value, opt) => {
    formState.workNo = opt.workNo;
    formState.name = opt.realname;
  };

  const add = (type) => {
    if (type == 1) {
      formState.professionalHistory.push({workStartTime: '', workEndTime: ''});
    } else {
      formState.diseaseHistory.push({});
    }
  };
  const cut = (idx, type) => {
    if (type == 1) {
      formState.professionalHistory.splice(idx, 1);
    } else {
      formState.diseaseHistory.splice(idx, 1);
    }
  };
  const handleSubmit = () => {
    formRef.value
      ?.validate()
      .then(() => {
        submitIng.value = true;
        const params = JSON.parse(JSON.stringify(formState));
        params.hazardFactors = params.hazardFactors.join(',');
        submitIng.value = true;
        if (title.value == '新增') {
          archivesAdd(params)
            .then((res) => {
              submitIng.value = false;
              emits('submitSuccess', res);
              closeDrawer();
              close();
              submitIng.value = false;
            })
            .catch((err) => {
              submitIng.value = false;
            });
        } else {
          archivesEdit(params)
            .then((res) => {
              submitIng.value = false;
              emits('submitSuccess', res);
              closeDrawer();
              close();
            })
            .catch((err) => {
              submitIng.value = false;
            });
        }
      })
      .catch(() => {
        submitIng.value = false;
      });
  };

  const close = () => {
    closeDrawer();
    readonly.value = false;
    submitIng.value = false;
    formRef.value?.resetFields();
    formState.professionalHistory = [];
    formState.diseaseHistory = [];
  };

  const disabledDate = (current: Dayjs) => {
    return current && current > dayjs().endOf('day');
  };
  function calculateInfo(idNumber) {
    // 提取出生日期
    const birthDate = idNumber.slice(6, 14);
    const year = birthDate.slice(0, 4);
    const month = birthDate.slice(4, 6);
    const day = birthDate.slice(6, 8);

    // 计算年龄
    const currentYear = new Date().getFullYear();
    const age = currentYear - parseInt(year);

    // 判断性别
    const genderCode = parseInt(idNumber.slice(16, 17));
    const gender = genderCode % 2 === 0 ? '2' : '1';

    return {
      birthDate: `${year}-${month}-${day}`,
      age: age,
      gender: gender,
    };
  }
  const idCardValidator = (rule, value, callback) => {
    if (!value) {
      callback(new Error('请输入身份证号'));
    }
    if (value.length != 18) {
      callback(new Error('身份证号长度不正确'));
    }
    if (!/^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[0-1])\d{3}[0-9Xx]$/.test(value)) {
      callback(new Error('身份证号格式不正确'));
    }
    callback();
  };
  const phoneValidator = (rule, value, callback) => {
    if (!value) {
      callback(new Error('请输入手机号码'));
    }
    if (!/^1[3-9]\d{9}$/.test(value)) {
      callback(new Error('手机号码格式不正确'));
    }
    callback();
  };
</script>
<style lang="less" scoped>
.my-time-picker{
  width: 100%;
  display: flex;
  align-items: center;
  .line{
    width: 18px;
    text-align: center;
  }
  .time{
    flex: 1;
    position: relative;
    .t-picker{
      position: absolute;
      left: 0;
      top: 0
    }
  }
}
</style>
