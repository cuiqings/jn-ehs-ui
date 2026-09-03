<template>
  <BasicDrawer v-bind="$attrs" @register="registerDrawer" :title="title" @close="closeDrawer" :width="1200" show-footer destroyOnClose>
    <a-spin
      style="height: 100%; position: absolute; top: 0; left: 0; right: 0; bottom: 0; z-index: 1000; background-color: rgba(230, 244, 255, 0.4)"
      :spinning="spinning"
      tip="上传中..."
    />
    <a-form :model="info" ref="infoForm" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
      <a-row :gutter="24">
        <a-col class="gutter-row" :span="12">
          <a-form-item label="培训计划" name="trainPlanId" :rules="[{ required: showOkBtn, message: '请选择培训计划!' }]">
            <a-select
              v-model:value="info.trainPlanId"
              :options="trainPlanOptions"
              placeholder="请选择"
              show-search
              :filter-option="(input: string, option: any) =>  option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0"
              @change="changeTrainPlan"
            />
          </a-form-item>
        </a-col>
        <a-col class="gutter-row" :span="12">
          <a-form-item label="培训项目" name="trainProjectId" :rules="[{ required: showOkBtn, message: '请选择培训项目!' }]">
            <a-select
              v-model:value="info.trainProjectId"
              :options="trainProjectOptions"
              placeholder="请选择"
              show-search
              :filter-option="(input: string, option: any) =>  option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0"
              @change="changeTrainProject"
            />
          </a-form-item>
        </a-col>
      </a-row>
      <a-row :gutter="24">
        <a-col class="gutter-row" :span="12">
          <a-form-item label="培训内容" name="trainContent" :rules="[{ required: showOkBtn, message: '请输入培训内容!' }]">
            <InputTextArea v-model:value="info.trainContent" :disabled="!showOkBtn" placeholder="请输入" :auto-size="{ minRows: 1, maxRows: 3 }" />
          </a-form-item>
        </a-col>
        <!-- <a-col class="gutter-row" :span="12">
          <a-form-item label="培训分类" name="category">
            <JTreeSelect1
              v-model:value="info.category"
              :treeDataArr="categoryTreeData"
              :isLeaf="false"
              :load="false"
              treeNodeFilterProp="title"
              :fieldNames="{
                label: 'title',
                value: 'code',
                options: 'children',
              }"
              placeholder="请选择"
              :disabled="!showOkBtn"
            />
          </a-form-item>
        </a-col> -->
        <a-col class="gutter-row" :span="12">
          <a-form-item label="任务名称" name="taskName" :rules="[{ required: showOkBtn, message: '请输入任务名称!' }]">
            <a-input v-model:value="info.taskName" placeholder="请输入" :disabled="!showOkBtn" :maxlength="50" />
          </a-form-item>
        </a-col>
      </a-row>
      <a-row :gutter="24">
        <a-col class="gutter-row" :span="12">
          <a-form-item label="任务时间" name="taskTime" :rules="[{ required: showOkBtn, message: '请选择任务时间!' }]">
            <a-range-picker
              style="width: 100%"
              v-model:value="info.taskTime"
              valueFormat="YYYY-MM-DD HH:mm:ss"
              show-time
              :disabled-date="disabledDate"
              @change="handleTaskTimeChange"
            />
          </a-form-item>
        </a-col>
        <a-col class="gutter-row" :span="12" v-if="trainProjectCode === '1'">
          <a-form-item label="是否补培" name="replant" :rules="[{ required: showOkBtn, message: '请选择补培!' }]">
            <a-select
              v-model:value="info.replant"
              :options="[
                {
                  label: '是',
                  value: '1',
                },
                {
                  label: '否',
                  value: '0',
                },
              ]"
              placeholder="请选择"
            />
          </a-form-item>
        </a-col>
      </a-row>
      <a-row :gutter="24">
        <a-col class="gutter-row" :labelCol="{ span: 3 }" :wrapperCol="{ span: 21 }">
          <a-form-item label="培训对象" name="trainObject" :rules="[{ required: showOkBtn, message: '请选择培训对象!' }]">
            <div style="margin-bottom: 10px">
              <a-button type="primary" @click="downloadTemplate" style="margin-right: 10px">下载模版</a-button>
              <j-upload-button type="primary" preIcon="ant-design:import-outlined" @click="onImportXls"> 上传培训对象 </j-upload-button>
            </div>
            <InputTextArea v-model:value="info.trainObject" readonly placeholder="请选择" auto-size="auto" @click="handleTrainModal" />
          </a-form-item>
        </a-col>
      </a-row>
      <a-row :gutter="24">
        <a-col class="gutter-row" :span="24">
          <a-form-item label="证书发放" name="cert" required>
            <a-radio-group v-model:value="info.cert" name="radioGroup" @change="changeCert">
              <a-radio value="1">无证书</a-radio>
              <a-radio value="2">及格发证</a-radio>
            </a-radio-group>
            <a-button v-if="info.cert === '2'" @click="handleCertificateModal">选择证书</a-button>
            <span style="padding-left: 15px">{{ info.certName }}</span>
          </a-form-item>
        </a-col>
      </a-row>
      <a-row :gutter="24">
        <a-col class="gutter-row" :span="12">
          <a-form-item label="学习模式" name="learnMode" required>
            <a-radio-group v-model:value="info.learnMode" :disabled="!showOkBtn" name="radioGroup">
              <a-radio value="2">自由模式</a-radio>
              <a-radio value="1">闯关模式</a-radio>
            </a-radio-group>
          </a-form-item>
        </a-col>
      </a-row>
      <a-row :gutter="24">
        <a-col class="gutter-row" :span="12">
          <a-form-item label="禁止快进" name="forbidFastForward" required>
            <a-switch v-model:checked="info.forbidFastForward" checkedValue="0" unCheckedValue="1" /><span
              style="color: rgb(199, 199, 199); display: inline-block; line-height: 32px"
              >（开启后禁止首次学习拖动进度条）</span
            >
          </a-form-item>
        </a-col>
      </a-row>
      <a-row :gutter="24">
        <a-col class="gutter-row" :span="12">
          <a-form-item label="视频随机暂停" name="randomStop" required>
            <a-switch v-model:checked="info.randomStop" checkedValue="1" unCheckedValue="0" /><span
              style="color: rgb(199, 199, 199); display: inline-block; line-height: 32px"
              >（开启后任务中视频均会随机暂停）</span
            >
          </a-form-item>
        </a-col>
      </a-row>
      <a-row :gutter="24">
        <a-col class="gutter-row" :span="24">
          <a-form-item label="视频中答题" name="videoAnswer" required>
            <a-switch v-model:checked="info.videoAnswer" checkedValue="0" unCheckedValue="1" /><span
              style="color: rgb(199, 199, 199); display: inline-block; line-height: 32px"
              >（开启后任务中视频设置了题目的需要答题，答对后可继续观看，否则跳回到上一个答题时间点或者视频开头）</span
            >
          </a-form-item>
        </a-col>
      </a-row>
      <a-row :gutter="24">
        <a-col class="gutter-row" :span="12">
          <a-form-item label="教材会审" name="review" required>
            <a-switch v-model:checked="info.review" :disabled="reviewDisabled" checkedValue="1" unCheckedValue="0" />
          </a-form-item>
        </a-col>
      </a-row>
      <a-row :gutter="24">
        <a-col class="gutter-row" :span="12">
          <a-form-item label="签字评价" name="appraise" required>
            <a-switch v-model:checked="info.appraise" disabled checkedValue="1" unCheckedValue="0" />
          </a-form-item>
        </a-col>
      </a-row>
      <div class="approval" v-if="info.review === '1'">
        <div class="approval-title">教材会审流程：</div>
        <a-steps :current="5" direction="vertical" progress-dot class="accident-report-steps">
          <a-step v-for="(item, index) in manyHills" :key="item">
            <template #title>
              <div><span style="color: red; margin-right: 5px" v-if="!['注册安全工程师'].includes(item.node)">*</span>{{ item.node }}</div>
            </template>
            <template #description>
              <div style="display: flex">
                <a-select
                  style="width: 200px"
                  v-model:value="item.vettingType"
                  :options="approvalTypeOptions"
                  placeholder="请选择"
                  @change="changeType($event, manyHills, index)"
                />
                <div class="personnel-list">
                  <div v-for="(ite, inx) in item.vettingInfoList" :key="inx">
                    <div>
                      <JUserModal
                        :userStyle="{ width: '300px', marginLeft: '20px' }"
                        v-model:value="ite.userId"
                        type="checkbox"
                        :url="['注册安全工程师'].includes(item.node) ? '/edu/common/getUserListByCertificate' : ''"
                        :orgCode="orgCode9()"
                        @click-user="(cb) => handleUserIds(cb, item)"
                      />
                      <span
                        v-if="item.vettingType === '2' && inx === 0 && inx <= 4"
                        style="color: #4498f0; margin-left: 20px"
                        @click="manyAdd(manyHills, index)"
                        >添加</span
                      >
                      <span v-if="item.vettingType === '2' && inx !== 0" style="color: red; margin-left: 20px" @click="remove(manyHills, index, inx)"
                        >删除</span
                      >
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </a-step>
        </a-steps>
      </div>
      <div class="approval" v-if="info.appraise === '1'">
        <div class="approval-title">签字评价流程：</div>
        <a-steps :current="5" direction="vertical" progress-dot class="accident-report-steps">
          <a-step v-for="(item, index) in manyHills1" :key="item">
            <template #title>
              <div><span style="color: red; margin-right: 5px">*</span>{{ item.node }}</div>
            </template>
            <template #description>
              <div style="display: flex">
                <a-select
                  style="width: 200px"
                  v-model:value="item.vettingType"
                  :options="approvalTypeOptions"
                  placeholder="请选择"
                  @change="changeType($event, manyHills1, index)"
                />
                <div class="personnel-list">
                  <div v-for="(ite, inx) in item.vettingInfoList" :key="inx">
                    <div>
                      <JUserModal
                        :userStyle="{ width: '300px', marginLeft: '20px' }"
                        v-model:value="ite.userId"
                        type="checkbox"
                        :orgCode="['安全生产管理机构负责人', '考核人员'].includes(item.node) ? orgCode9() : undefined"
                        @click-user="(cb) => handleUserIds(cb, item)"
                      />
                      <span
                        v-if="item.vettingType === '2' && inx === 0 && inx <= 4"
                        style="color: #4498f0; margin-left: 20px"
                        @click="manyAdd(manyHills1, index)"
                        >添加</span
                      >
                      <span v-if="item.vettingType === '2' && inx !== 0" style="color: red; margin-left: 20px" @click="remove(manyHills1, index, inx)"
                        >删除</span
                      >
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </a-step>
        </a-steps>
      </div>
      <a-tabs v-if="info.taskContent && info.taskContent.length > 0" v-model:activeKey="activeKey" type="card">
        <a-tab-pane
          v-for="(item, index) in tabsPanes"
          :key="item.key"
          :tab="item.title"
          :closable="showOkBtn || ['2', '6', '8'].includes(trainProjectCode)"
        >
          <a-row :gutter="24">
            <a-col class="gutter-row" :span="12" v-if="trainProjectCode === '2'">
              <a-form-item label="阶段名称" :rules="[{ required: showOkBtn, message: '请输入' }]" :name="['taskContent', index, 'stageName']">
                <a-select
                  style="width: 100%"
                  v-model:value="info.taskContent[index].stageName"
                  :options="stageNameOptions"
                  placeholder="请选择"
                  allow-clear
                />
              </a-form-item>
            </a-col>
            <a-col class="gutter-row" :span="12" v-if="trainProjectCode === '8'">
              <a-form-item label="阶段名称" :rules="[{ required: showOkBtn, message: '请输入' }]" :name="['taskContent', index, 'stageName']">
                <a-input v-model:value="info.taskContent[index].stageName" placeholder="请输入" disabled :maxlength="50" />
              </a-form-item>
            </a-col>
            <a-col class="gutter-row" :span="12">
              <a-form-item label="培训方式" :required="showOkBtn">
                <a-radio-group
                  v-model:value="info.taskContent[index].trainType"
                  name="radioGroup"
                  @change="
                    () => {
                      info.taskContent[index].signIn = '2';
                      info.taskContent[index].location = '';
                    }
                  "
                >
                  <a-radio value="1">线上</a-radio>
                  <a-radio value="2">线下</a-radio>
                </a-radio-group>
              </a-form-item>
            </a-col>
          </a-row>
          <a-row :gutter="24">
            <a-col class="gutter-row" :span="12">
              <a-form-item label="实施单位" :rules="[{ required: showOkBtn, message: '请选择' }]" :name="['taskContent', index, 'enforceCode']">
                <JTreeSelect1
                  v-model:value="info.taskContent[index].enforceCode"
                  :treeDataArr="orgOptions"
                  placeholder="请选择"
                  :isLeaf="false"
                  :load="false"
                  :treeDefaultExpandAll="false"
                  :treeDefaultExpandedKeys="expandedKeys"
                  treeNodeFilterProp="title"
                  :fieldNames="{ label: 'title', value: 'orgCode', key: 'orgCode', options: 'children' }"
                  :showCheckedStrategy="SHOW_ALL"
                />
              </a-form-item>
            </a-col>
            <a-col class="gutter-row" :span="12">
              <a-form-item label="教育者" :name="['taskContent', index, 'trainPerson']" :rules="[{ required: showOkBtn, message: '请选择' }]">
                <JUserModal v-model:value="info.taskContent[index].trainPerson" placeholder="请选择" @confirm="() => userConfirm(index)" />
              </a-form-item>
            </a-col>
          </a-row>
          <a-row :gutter="24">
            <a-col class="gutter-row" :span="12">
              <a-form-item label="课时要求" :name="['taskContent', index, 'courseConfig']" :rules="[{ required: showOkBtn, message: '请输入' }]">
                <a-input-number
                  style="width: 100%"
                  v-model:value="info.taskContent[index].courseConfig"
                  placeholder="请输入"
                  :controls="false"
                  :precision="0"
                  :max="99"
                  :min="['2', '6'].includes(trainProjectCode) ? 8 : 0"
                />
              </a-form-item>
            </a-col>
            <a-col class="gutter-row" :span="12">
              <a-form-item label="签到" :required="showOkBtn">
                <a-radio-group v-model:value="info.taskContent[index].signIn" name="radioGroup">
                  <a-radio value="1" v-if="info.taskContent[index].trainType === '2'">二维码</a-radio>
                  <a-radio value="2">无</a-radio>
                </a-radio-group>
              </a-form-item>
            </a-col>
          </a-row>
          <a-row :gutter="24">
            <a-col class="gutter-row" :span="12" v-if="info.taskContent[index].trainType === '2'">
              <a-form-item label="培训地点" :name="['taskContent', index, 'location']" :rules="[{ required: showOkBtn }]">
                <a-input v-model:value="info.taskContent[index].location" placeholder="请输入" :maxlength="50" />
              </a-form-item>
            </a-col>
          </a-row>
          <a-row :gutter="24">
            <a-col class="gutter-row" :span="12">
              <a-form-item label="课件" :name="['taskContent', index, 'course']" :required="showOkBtn">
                <a-button type="primary" @click="addCourse(info.taskContent[index])">添加课件</a-button>
                <div v-if="info.taskContent[index]?.course?.length > 0">
                  <div :style="{ marginTop: '20px' }">
                    <div class="course-list" v-for="ite in info.taskContent[index]?.course" :key="ite.id">
                      <li style="width: 392px; display: flex; align-items: center">
                        <span
                          style="display: inline-block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap"
                          :style="{
                            width: '282px',
                          }"
                          :title="ite.name"
                          >{{ ite.name }}</span
                        >
                        <span style="width: 62px; text-align: right">{{
                          formatDuration(ite.type === '2' ? (ite.duration ? ite.duration * 60 : 0) : ite.duration)
                        }}</span>
                        <span
                          :style="{
                            width: ite.type === '2' ? '0' : '25px',
                          }"
                        ></span>
                        <FormOutlined
                          v-if="ite.type === '2'"
                          style="width: 14px; margin-left: 10px; cursor: pointer"
                          @click="handleVisible(index, ite)"
                        />
                        <DeleteOutlined style="width: 14px; margin-left: 10px; cursor: pointer" @click="removeFile('course', index, ite.id)" />
                      </li>
                    </div>
                  </div>
                </div>
              </a-form-item>
            </a-col>
          </a-row>
          <a-row :gutter="24">
            <a-col class="gutter-row" :span="12">
              <a-form-item label="试卷" :name="['taskContent', index, 'exam']" :required="showOkBtn">
                <a-button type="primary" @click="addTestPaper(1)">添加试卷</a-button>
                <div v-if="info.taskContent[index]?.exam?.examName">
                  <div :style="{ marginTop: '20px' }">
                    <div class="course-list">
                      <li style="width: 392px; display: flex; align-items: center">
                        <span
                          style="display: inline-block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap"
                          :style="{
                            width: '282px',
                          }"
                          :title="info.taskContent[index]?.exam?.examName"
                          >{{ info.taskContent[index]?.exam?.examName }}</span
                        >
                        <span style="width: 62px; text-align: right">{{ formatDuration(info.taskContent[index]?.exam?.examTime * 60) }}</span>
                        <FormOutlined style="width: 14px; margin-left: 10px; cursor: pointer" @click="handleExamVisible('exam', index, 1)" />
                        <DeleteOutlined style="width: 14px; padding-left: 10px; cursor: pointer" @click="removeFile('exam', index)" />
                      </li>
                    </div>
                  </div>
                </div>
              </a-form-item>
            </a-col>
          </a-row>
          <a-row :gutter="24">
            <a-col class="gutter-row" :span="12">
              <a-form-item label="模拟试卷" :name="['taskContent', index, 'mockExam']" :required="showOkBtn">
                <a-button type="primary" @click="addTestPaper(2)">添加模拟试卷</a-button>
                <div v-if="info.taskContent[index]?.mockExam?.examName">
                  <div :style="{ marginTop: '20px' }">
                    <div class="course-list">
                      <li style="width: 392px; display: flex; align-items: center">
                        <span
                          style="display: inline-block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap"
                          :style="{
                            width: '282px',
                          }"
                          :title="info.taskContent[index]?.mockExam?.examName"
                          >{{ info.taskContent[index]?.mockExam?.examName }}</span
                        >
                        <span style="width: 62px; text-align: right">{{ formatDuration(info.taskContent[index]?.mockExam?.examTime * 60) }}</span>
                        <FormOutlined style="width: 14px; margin-left: 10px; cursor: pointer" @click="handleExamVisible('mockExam', index, 2)" />
                        <DeleteOutlined style="width: 14px; padding-left: 10px; cursor: pointer" @click="removeFile('mockExam', index)" />
                      </li>
                    </div>
                  </div>
                </div>
              </a-form-item>
            </a-col>
          </a-row>
        </a-tab-pane>
      </a-tabs>
    </a-form>
    <template #footer>
      <div style="height: 60px; line-height: 60px">
        <a-button v-if="showOkBtn" :loading="loading" type="primary" @click="handleSave">保存</a-button>
        <a-button v-if="showOkBtn" :loading="loading" style="margin-left: 15px" type="primary" @click="handleSubmit">提交</a-button>
        <a-button style="margin-left: 15px" @click="closeDrawer">取消</a-button>
      </div>
    </template>
  </BasicDrawer>
  <!-- 培训对象 -->
  <userModal @register="registerUserModal" @success="userSuccess" />
  <!-- 试卷 -->
  <paperModal @register="registerPaperModal" @success="paperSuccess" />
  <!-- 课件 -->
  <resourceModal @register="registerResourceModal" @success="resourceSuccess" />
  <!--证书-->
  <certificateModal @register="registerCertificateModal" @success="certificateSuccess" />
  <!-- 时长设置弹框 -->
  <a-modal v-model:visible="visible" :body-style="{ margin: '20px' }" title="考试设置" z-index="1100">
    <template #footer>
      <a-button key="back" @click="() => (visible = false)">取消</a-button>
      <a-button key="submit" type="primary" @click="handleReturnOk">确认</a-button>
    </template>
    <a-form :model="documentInfo" ref="infoRef" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }" autocomplete="off">
      <a-form-item label="最少观看时间" name="duration" :rules="[{ required: true, message: '最少观看时间为必填项！' }]">
        <a-input-number
          style="width: 100%"
          addon-after="分"
          v-model:value="documentInfo.duration"
          placeholder="请输入"
          :controls="false"
          :precision="0"
          :min="0"
        />
      </a-form-item>
    </a-form>
  </a-modal>
  <!-- 试卷设置弹框 -->
  <a-modal v-model:visible="examVisible" :body-style="{ margin: '20px' }" title="考试设置" z-index="1100">
    <template #footer>
      <a-button key="back" @click="() => (examVisible = false)">取消</a-button>
      <a-button key="submit" type="primary" @click="handleExamOk">确认</a-button>
    </template>
    <a-form :model="examInfo" ref="examInfoRef" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }" autocomplete="off">
      <a-form-item label="试题顺序" name="questionsSort" :rules="[{ required: true, message: '试题顺序为必填项！' }]">
        <a-radio-group v-model:value="examInfo.questionsSort" name="radioGroup">
          <a-radio value="1">固定排序</a-radio>
          <a-radio value="2">打乱顺序</a-radio>
        </a-radio-group>
      </a-form-item>
      <a-form-item label="选项顺序" name="optionsSort" :rules="[{ required: true, message: '选项顺序为必填项！' }]">
        <a-radio-group v-model:value="examInfo.optionsSort" name="radioGroup">
          <a-radio value="1">固定排序</a-radio>
          <a-radio value="2">打乱顺序</a-radio>
        </a-radio-group>
      </a-form-item>
      <a-form-item label="考试次数" name="examNum" :rules="[{ required: true, message: '考试次数为必填项！' }]">
        <a-radio-group v-model:value="examInfo.examNum" name="radioGroup">
          <a-radio value="1" v-if="examType === 1">1次</a-radio>
          <a-radio value="2" v-if="examType === 1">2次</a-radio>
          <a-radio value="3" v-if="examType === 2 || examType === 1">不限</a-radio>
          <a-radio value="4" v-if="examType === 1">及格为止</a-radio>
        </a-radio-group>
      </a-form-item>
      <a-form-item label="考试时间" name="examTime" :rules="[{ required: true, message: '考试时间为必填项！' }]">
        <a-input-number
          style="width: 100%"
          addon-after="分钟"
          v-model:value="examInfo.examTime"
          placeholder="请输入"
          :controls="false"
          :precision="0"
          :min="1"
          :max="180"
        />
      </a-form-item>
      <a-form-item label="及格分" name="passScore" :rules="[{ required: true, message: '及格分为必填项！' }]">
        <a-input-number
          style="width: 70%"
          addon-after="分"
          v-model:value="examInfo.passScore"
          placeholder="请输入"
          :controls="false"
          :precision="0"
          :min="examType === 2 ? Number(examInfo.score) * 0.85 : 1"
          :max="examInfo.score"
          :maxlength="3"
        /><div style="line-height: 32px; display: inline-block">（总分：{{ examInfo.score }}）</div>
      </a-form-item>
      <a-form-item label="考试验证" name="smsFlag" :rules="[{ required: true, message: '考试验证为必填项！' }]">
        <a-radio-group v-model:value="examInfo.smsFlag" name="radioGroup">
          <a-radio value="0">短信验证</a-radio>
          <a-radio value="1">无</a-radio>
        </a-radio-group>
      </a-form-item>
      <a-form-item label="防切屏" name="cutScreen" :rules="[{ required: true, message: '防切屏为必填项！' }]">
        <a-switch v-model:checked="examInfo.cutScreen" :checkedValue="true" :unCheckedValue="false" />
        <span style="color: #999; font-size: 12px; margin-left: 10px">（开启后考试切屏超过10秒将自动交卷）</span>
      </a-form-item>
    </a-form>
  </a-modal>
  <!-- 人员选择 -->
</template>
<script lang="ts" name="examineRecord-drawer" setup>
  import useDrawer from './hooks/useDrawer';
  import { ref } from 'vue';
  import { Input, TreeSelect } from 'ant-design-vue';
  import { JTreeSelect1, JUserModal } from '/@/components/Form';
  import userModal from './userModal.vue';
  import paperModal from './paperModal.vue';
  import resourceModal from './resourceModal.vue';
  import certificateModal from './certificateModal.vue';
  import { DeleteOutlined, FormOutlined } from '@ant-design/icons-vue';
  const InputTextArea = Input.TextArea;
  const SHOW_ALL = TreeSelect.SHOW_ALL;
  const emit = defineEmits(['success']);
  const infoForm = ref();
  const infoRef = ref();
  const examInfoRef = ref();
  const {
    BasicDrawer,
    registerDrawer,
    title,
    showOkBtn,
    handleSubmit,
    info,
    changeTrainPlan,
    changeTrainProject,
    trainPlanOptions,
    trainProjectOptions,
    // categoryTreeData,
    orgOptions,
    addCourse,
    addTestPaper,
    registerUserModal,
    userSuccess,
    handleTrainModal,
    trainProjectCode,
    closeDrawer,
    registerPaperModal,
    paperSuccess,
    activeKey,
    tabsPanes,
    registerResourceModal,
    resourceSuccess,
    disabledDate,
    handleTaskTimeChange,
    handleCertificateModal,
    registerCertificateModal,
    certificateSuccess,
    changeCert,
    removeFile,
    handleVisible,
    visible,
    documentInfo,
    handleReturnOk,
    handleExamVisible,
    examVisible,
    examInfo,
    handleExamOk,
    approvalTypeOptions,
    changeType,
    manyHills,
    manyAdd,
    remove,
    manyHills1,
    examType,
    stageNameOptions,
    handleUserIds,
    userConfirm,
    handleSave,
    loading,
    expandedKeys,
    orgCode9,
    onImportXls,
    downloadTemplate,
    spinning,
    reviewDisabled,
  } = useDrawer(emit, infoForm, infoRef, examInfoRef);
  const formatDuration = (duration: number) => {
    const h = Math.trunc(duration / 3600);
    const m = Math.trunc((duration % 3600) / 60);
    const s = Math.trunc((duration % 3600) % 60);
    return `${h ? `${h}:` : ''}${m >= 10 ? `${m}:` : `0${m}:`}${s >= 10 ? `${s}` : `0${s}`}`;
  };
</script>
<style lang="less" scoped>
  :deep(.ant-tabs-nav-add) {
    line-height: 40px;
    width: 106px;
  }
  :deep(.ant-tabs) {
    overflow: initial;
  }
  :deep(.ant-col-6),
  :deep(.ant-col-3) {
    width: 150px !important;
    flex: none !important;
    max-width: 150px !important;
  }
  :deep(.ant-col-21),
  :deep(.ant-col-18) {
    width: calc(100% - 150px) !important;
    max-width: calc(100% - 150px) !important;
    flex: none !important;
  }
  .course-list {
    border-radius: 5px;
    padding: 0 15px;
    line-height: 35px;
    cursor: pointer;
  }
  .course-list:hover {
    background: rgb(234, 242, 255);
  }
  .approval {
    padding: 0 0 20px 40px;
    .approval-title {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 10px;
    }
    :deep(.ant-steps-item-title) {
      margin-bottom: 10px;
    }
    :deep(.ant-select-arrow) {
      top: 17px;
    }
    :deep(.ant-select-clear) {
      top: 15px;
    }
    .personnel-list {
      & > div {
        margin-top: 15px;
      }
      & > div:nth-child(1) {
        margin-top: 0;
      }
    }
  }
  :deep(.ant-spin-dot-spin) {
    margin-top: 20%;
  }
</style>
