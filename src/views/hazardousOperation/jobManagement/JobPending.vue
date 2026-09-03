<template>
  <div v-loading="loading">
    <template v-if="cardData.length > 0">
      <a-row :span="24" :gutter="[10, 10]">
        <a-col :span="6" v-for="item in cardData" :key="item.id">
          <a-card
            class="fixed-height-card"
            :style="{
              boxShadow:
                ['3', '7'].includes(state) && dayjs(new Date()).isAfter(item.workEndTime)
                  ? 'inset 5px 5px 5px rgba(255, 77, 79, 0.3), inset -5px -5px 5px rgba(255, 77, 79, 0.3), 5px 5px 5px rgba(0, 0, 0, 0.3)'
                  : '',
              borderColor: ['3', '7'].includes(state) && dayjs(new Date()).isAfter(item.workEndTime) ? '#ff4d4f' : '',
            }"
          >
            <a-row :span="24">
              <a-col :span="24" style="margin-bottom: 10px">
                <div class="tag-wrap">
                  <div class="tags">
                    <span
                      v-if="item.workGrade"
                      style="display: inline-block"
                      class="grade-tag"
                      :class="item.workGrade == '一级' ? 'red' : item.workGrade == '二级' ? 'orange' : item.workGrade == '三级' ? 'blue' : ''"
                      >{{ item.workGrade }}</span
                    >
                    <div v-if="item.ballCameraCode" style="cursor: pointer; display: inline-block" @click="handleCamera(item)">
                      <span
                        v-if="['2', '3'].includes(state)"
                        class="iconify"
                        style="font-size: 24px; color: #1890ff; margin: 0 10px 0 5px"
                        :style="{ color: item.ballStatus == '1' ? '#1890ff' : '' }"
                        data-icon="solar:videocamera-outline"
                        data-inline="false"
                      ></span>
                    </div>
                    <a-tag v-if="item.delayedMark" color="red" style="border: 0; background-color: rgb(242, 242, 242)">{{ item.delayedMark }}</a-tag>
                    <a-tag v-if="item.timeoutMark" color="red" style="border: 0; background-color: rgb(242, 242, 242)">{{ item.timeoutMark }}</a-tag>
                    <a-tag v-if="item.checkMark" color="red" style="border: 0; background-color: rgb(242, 242, 242)">{{ item.checkMark }}</a-tag>
                    <a-tag v-if="item.workAnalysisMark" color="red" style="border: 0; background-color: rgb(242, 242, 242)">
                      {{ item.workAnalysisMark }}
                    </a-tag>
                    <span v-if="item.reformNum && item.reformNum > 0" style="display: inline-block; margin-left: 5px; color: #ff4d4f"
                      >待整改({{ item.reformNum }})</span
                    >
                    <span
                      v-if="['3', '7'].includes(state) && dayjs(new Date()).isAfter(item.workEndTime)"
                      style="display: inline-block; margin-left: 5px; color: #ff4d4f; background-color: rgba(255, 77, 79, 0.1)"
                      >待验收</span
                    >
                  </div>
                  <div class="del" v-auth="'WorkRequisition:delet'">
                    <img @click="del(item.id)" src="../../../assets/images/delete.png" alt="" srcset="" />
                  </div>
                </div>
              </a-col>
              <a-col :span="24">
                <div style="display: flex; justify-content: space-between">
                  <div class="card-title">
                    <span style="font-weight: bold; display: inline-block">
                      {{ item.workContent }}
                    </span>
                  </div>
                </div>
              </a-col>
              <a-col :span="24" style="margin-top: 10px"> 编号：{{ item.workApplyCode }}</a-col>
              <a-col :span="24" style="margin-top: 10px">作业类型：{{ item.workTypeName }}</a-col>
              <a-col :span="24" style="margin-top: 10px"> 作业地点：{{ item.workLocation }}</a-col>
              <a-col :span="24" style="margin-top: 10px">申请单位：{{ item.applicationUnitName }}</a-col>
              <a-col v-if="item.workOrgCodeName" :span="24" style="margin-top: 10px">生产单位：{{ item.workOrgCodeName }}</a-col>
              <a-col :span="24" style="margin-top: 10px">计划作业时间：{{ item.workStartTime }}</a-col>
              <a-col :span="24" style="margin-top: 10px" v-if="Number(state) > 2">开始时间：{{ item.workTime }}</a-col>
              <a-col :span="24" style="margin-top: 10px" v-if="Number(state) == 3 || Number(state) == 5"
                >待检查:
                <template v-for="(item1, idx) in setCheckRole(item.checkRole)" :key="idx">
                  <span style="color: #b7eb8f; padding-right: 2px" v-if="item1.status">{{ item1.text }}</span>
                  <span style="color: #ff4d4f; padding-right: 2px" v-else>{{ item1.text }}</span>
                </template>
              </a-col>
              <a-col :span="24" style="margin-top: 10px" v-if="['4'].includes(state)">作业结束时间：{{ item.workEndTime }}</a-col>
              <a-col :span="24" style="margin-top: 10px" v-if="['5'].includes(state)">完结验收时间：{{ item.workFinishTime }}</a-col>
              <a-col v-if="item.workStopMark == '作业中断'" :span="24" style="margin-top: 5px; color: #907f7f">
                <a-tooltip v-if="item.reason && item.workState == '7'">
                  <template #title>{{ item.reason }}</template>
                  <div class="reason">中断原因：{{ item.reason || '' }}</div>
                </a-tooltip>
              </a-col>
              <a-col
                v-if="item.workStopMark == '作业中断' && item.stopTime && item.workState == '7'"
                :span="24"
                style="margin-top: 5px; color: #907f7f"
              >
                中断时间：{{ item.stopTime || '' }}
              </a-col>
            </a-row>
            <a-row :span="24" v-if="state == '1'" justify="end" :gutter="[20, 10]" style="margin-top: 15px">
              <div class="btn-wrap">
                <a-button v-if="item.flagPerm" type="primary" @click="viewDetail(item, 'apply')">去审批</a-button>
                <a-button
                  type="primary"
                  v-auth="'WorkRequisition:updateGuardian'"
                  v-if="item.sceneHead.includes(userStore.getUserInfo.id)"
                  @click="changePersonClick(item)"
                  >添加人员</a-button
                >
                <a-button type="primary" @click="viewDetail(item)"> 查看详情</a-button>
              </div>
            </a-row>
            <a-row :span="24" v-if="state == '2'" :gutter="[20, 10]" style="margin-top: 15px">
              <div class="btn-wrap">
                <a-button type="primary" v-if="item.fxFlag && item.workType.includes(2)" @click="addAnalysis(item, true, 2, 2)">
                  有限空间分析
                </a-button>
                <a-button type="primary" v-if="item.fxFlag && item.workType.includes(3)" @click="addAnalysis(item, true, 3)"> 动火作业分析 </a-button>
                <a-button
                  type="primary"
                  v-auth="'WorkRequisition:start'"
                  v-if="item.startWorkFlag && !item.workAnalysisMark && !item.checkMark"
                  @click="startWork(item)"
                  >开始作业</a-button
                >
                <a-button
                  type="primary"
                  v-auth="'WorkRequisition:updateGuardian'"
                  v-if="item.sceneHead.includes(userStore.getUserInfo.id)"
                  @click="changePersonClick(item)"
                  >添加人员</a-button
                >
                <a-button type="primary" @click="viewDetail(item)"> 查看详情</a-button>
              </div>
            </a-row>
            <a-row :span="24" v-if="state == '3'" :gutter="[20, 10]" style="margin-top: 15px">
              <div class="btn-wrap">
                <a-button v-if="item.reformFlag && item.reformNum > 0" type="primary" @click="reformClick(item, 1)">去整改</a-button>
                <a-button v-if="item.reformConfirm" type="primary" @click="reformClick(item, 2)">整改确认</a-button>
                <a-button type="primary" v-if="item.jkjFlag && item.workType.includes(2)" @click="inOutClick(item, true)"> 进空间 </a-button>
                <a-button type="primary" v-if="item.ckjFlag && item.workType.includes(2)" @click="inOutClick(item, false)"> 出空间 </a-button>
                <a-button type="primary" v-if="item.confirmFlag && item.workType.includes(2)" @click="checkInOutClick(item)"> 确认进出 </a-button>
                <a-button type="primary" v-if="item.fxFlag && item.workType.includes(2)" @click="addAnalysis(item, true, 2)"> 有限空间分析 </a-button>
                <a-button type="primary" v-if="item.fxFlag && item.workType.includes(3)" @click="addAnalysis(item, true, 3)"> 动火作业分析 </a-button>
                <a-button v-if="item.startOrStopFlag" type="primary" @click="workStop(item)">{{
                  item.workStopMark ? '继续作业' : '作业中断'
                }}</a-button>
                <!-- <a-button
                  v-if="!['1', '2', '3', '4'].includes(item.workType)"
                  v-auth="'WorkRequisition:startOrStopFlag'"
                  type="primary"
                  @click="workStop(item)"
                  >{{ item.workStopMark ? '继续作业' : '作业中断' }}</a-button
                > -->
                <a-button v-if="item.flagPerm" type="primary" @click="completeAcceptance(item)"> 完结验收</a-button>
                <a-button
                  type="primary"
                  style="background-color: #f59a23; border-color: #f59a23"
                  @click="safetyWorkCheck(item)"
                  v-auth="'WorkRequisition:safetycheck'"
                  >安全作业检查</a-button
                >
                <a-button
                  type="primary"
                  v-auth="'WorkRequisition:updateGuardian'"
                  v-if="item.sceneHead.includes(userStore.getUserInfo.id)"
                  @click="changePersonClick(item)"
                  >添加人员</a-button
                >
                <a-button type="primary" v-if="['6', '7'].includes(item.workType) && item.czBzFlag" @click="operateClick(item, 1)"
                  >操作步骤记录</a-button
                >
                <a-button type="primary" v-if="['6', '7'].includes(item.workType) && item.qrBzFlag" @click="operateClick(item, 2)"
                  >操作步骤确认</a-button
                >
                <a-button type="primary" @click="viewDetail(item)">查看详情</a-button>
              </div>
            </a-row>
            <a-row :span="24" v-if="state == '7'" :gutter="[20, 10]" style="margin-top: 15px">
              <div class="btn-wrap">
                <a-button v-if="item.reformFlag && item.reformNum > 0" type="primary" @click="reformClick(item, 1)">去整改</a-button>
                <a-button v-if="item.reformConfirm" type="primary" @click="reformClick(item, 2)">整改确认</a-button>
                <a-button type="primary" v-if="item.startOrStopFlag" @click="workStop(item)">{{
                  item.workStopMark ? '继续作业' : '作业中断'
                }}</a-button>
                <a-button v-if="item.flagPerm" type="primary" @click="completeAcceptance(item)"> 完结验收</a-button>
                <a-button type="primary" v-if="item.fxFlag && item.workType.includes(2)" @click="addAnalysis(item, true, 2)"> 有限空间分析 </a-button>
                <a-button type="primary" v-if="item.fxFlag && item.workType.includes(3)" @click="addAnalysis(item, true, 3)"> 动火作业分析 </a-button>
                <a-button
                  type="primary"
                  v-auth="'WorkRequisition:updateGuardian'"
                  v-if="item.sceneHead.includes(userStore.getUserInfo.id)"
                  @click="changePersonClick(item)"
                  >添加人员</a-button
                >
                <a-button type="primary" @click="viewDetail(item)">查看详情</a-button>
              </div>
            </a-row>
            <a-row :span="24" v-if="state == '4'" :gutter="[20, 10]" justify="end" style="margin-top: 15px">
              <div class="btn-wrap">
                <a-button v-if="item.flagPerm" type="primary" @click="completeAcceptance(item)"> 完结验收</a-button>
                <a-button type="primary" @click="viewDetail(item)"> 查看详情</a-button>
              </div>
            </a-row>
            <a-row :span="24" v-if="state == '5'" :gutter="[20, 10]" justify="end" style="margin-top: 15px">
              <div class="btn-wrap">
                <a-button
                  v-if="showSafetyWorkCheck(item) && item.checkButton"
                  type="primary"
                  style="background-color: #f59a23; border-color: #f59a23"
                  @click="safetyWorkCheck(item)"
                  v-auth="'WorkRequisition:safetycheck'"
                  >安全作业检查</a-button
                >
                <a-button style="background: rgb(112, 182, 3); color: #fff" @click="derive(item.id)">导出作业票</a-button>
                <a-button v-if="item.reformFlag && item.reformNum > 0" type="primary" @click="reformClick(item, 1)">去整改</a-button>
                <a-button v-if="item.reformConfirm" type="primary" @click="reformClick(item, 2)">整改确认</a-button>
                <a-button type="primary" @click="viewDetail(item)"> 查看详情</a-button>
              </div>
            </a-row>
            <div class="oneline" style="color: #ff4d4f" :title="item.workBackReason" v-if="item.workState == 3 && item.workBackReason"
              ><span style="color: rgba(0, 0, 0, 0.85)">验收退回：</span><span>{{ item.workBackReason }}</span></div
            >
          </a-card>
        </a-col>
      </a-row>
      <div style="margin: 10px; text-align: right">
        <pagination
          v-model:current="current"
          v-model:page-size="pageSize"
          :total="total"
          show-quick-jumper
          showSizeChanger
          :pageSizeOptions="['12', '24', '36', '48', '60']"
          @change="pageSizeChange"
          :defaultPageSize="pageSize"
          :show-total="(total: number) => `共${total}条记录  第${current}/${Math.ceil(total / pageSize)}页`"
        />
      </div>
    </template>
    <template v-else>
      <a-empty style="margin-top: 100px" v-if="!loading" />
    </template>
    <Modal
      width="50%"
      :bodyStyle="{ padding: '4px 10px' }"
      v-model:visible="AddAnalysis"
      title="添加气体分析"
      :mask-closable="false"
      centered
      :zIndex="900"
    >
      <template v-if="currentItem.workType == 2">
        <a-tabs v-if="currentItem.workStatus == 2" v-model:activeKey="activeKey" centered>
          <a-tab-pane key="1" tab="上" forceRender>
            <div class="inner">
              <AnalysisForm :currentWorkType="currentWorkType" ref="dialogFormRef1" local="上" :curItem="currentItem" />
            </div>
          </a-tab-pane>
          <a-tab-pane key="2" tab="中" forceRender>
            <div class="inner">
              <AnalysisForm :currentWorkType="currentWorkType" ref="dialogFormRef2" local="中" :curItem="currentItem" />
            </div>
          </a-tab-pane>
          <a-tab-pane key="3" tab="下" forceRender>
            <div class="inner">
              <AnalysisForm :currentWorkType="currentWorkType" ref="dialogFormRef3" local="下" :curItem="currentItem" />
            </div>
          </a-tab-pane>
        </a-tabs>
        <div v-else class="inner">
          <AnalysisForm :currentWorkType="currentWorkType" ref="dialogFormRef1" local="" :curItem="currentItem" />
        </div>
      </template>
      <div v-else class="inner">
        <AnalysisForm :currentWorkType="currentWorkType" ref="dialogFormRef1" local="" :curItem="currentItem" />
      </div>
      <template #footer>
        <a-space>
          <a-button @click="addAnalysisCancel">取消 </a-button>
          <a-button :loading="confirmLoading" type="primary" @click="addAnalysisOk">确定</a-button>
        </a-space>
      </template>
    </Modal>
    <!-- 进出空间 -->
    <Modal
      width="50%"
      :bodyStyle="{ padding: '4px 10px' }"
      v-model:visible="inOutShow"
      :title="currentType == '3' ? '进入空间' : '出来空间'"
      :mask-closable="false"
      centered
      :footer="null"
      :zIndex="900"
    >
      <a-form :model="inOutForm" ref="inOutFormRef" :rules="inOutRules" autocomplete="off" :label-col="{ span: 4 }" :wrapper-col="{ span: 18 }">
        <a-form-item v-if="currentType == '3'" label="进入时间" name="inTime" :colon="false" required>
          <a-date-picker
            style="width: 100%"
            show-time
            placeholder="年月日时分"
            value-format="YYYY-MM-DD HH:mm:ss"
            format="YYYY-MM-DD HH:mm:ss"
            v-model:value="inOutForm.inTime"
            :disabledDate="(current) => current > new Date()"
          />
        </a-form-item>
        <a-form-item v-if="currentType == '4'" label="出来时间" name="outTime" :colon="false" required>
          <a-date-picker
            style="width: 100%"
            show-time
            placeholder="年月日时分"
            value-format="YYYY-MM-DD HH:mm:ss"
            format="YYYY-MM-DD HH:mm:ss"
            v-model:value="inOutForm.outTime"
            :disabledDate="(current) => current > new Date()"
          />
        </a-form-item>
        <a-form-item label="有限空间名称" name="spaceName" :colon="false" required>
          <a-input placeholder="请输入" disabled v-model:value="inOutForm.spaceName" :maxlength="30" />
        </a-form-item>
        <a-form-item label="检修部位" name="accessParts" :colon="false" required>
          <a-input placeholder="请输入" v-model:value="inOutForm.accessParts" :maxlength="30" />
        </a-form-item>
        <a-form-item label="携带工具" name="carryTools" :colon="false" required>
          <a-input placeholder="请输入" v-model:value="inOutForm.carryTools" :maxlength="30" />
        </a-form-item>
        <a-form-item :wrapper-col="{ offset: 9 }">
          <a-space>
            <a-button
              @click="
                inOutShow = false;
                inOutFormRef.resetFields();
              "
              >取消
            </a-button>
            <a-button :loading="confirmLoading" type="primary" @click="inOutOk">确定</a-button>
          </a-space>
        </a-form-item>
      </a-form>
    </Modal>
    <!-- 确认进出空间 -->
    <Modal
      width="50%"
      :bodyStyle="{ padding: '4px 10px' }"
      v-model:visible="checkInOutShow"
      title="进出空间确认"
      :mask-closable="false"
      centered
      :footer="null"
      :zIndex="900"
    >
      <a-form :model="checkInOutInfo" ref="checkInOutFormRef" autocomplete="off" :label-col="{ span: 4 }" :wrapper-col="{ span: 18 }">
        <a-form-item label="有限空间名称" name="spaceName" :colon="false" required>
          <a-input placeholder="请输入" disabled v-model:value="checkInOutInfo.spaceName" :maxlength="30" />
        </a-form-item>
        <template v-for="(item, idx) in checkInOutInfo.userList" :key="idx">
          <h3>{{ item.userName }}</h3>
          <a-form-item label="进入时间" :name="['item', idx, 'inTime']" :colon="false" required>
            <a-date-picker
              style="width: 100%"
              show-time
              placeholder="年月日时分"
              value-format="YYYY-MM-DD HH:mm:ss"
              format="YYYY-MM-DD HH:mm:ss"
              v-model:value="item.inTime"
              :rules="{
                required: true,
                message: '请输入',
                trigger: 'change',
              }"
              :disabledDate="(current) => current > new Date()"
            />
          </a-form-item>
          <a-form-item label="出来时间" :name="['item', idx, 'outTime']" :colon="false" required>
            <a-date-picker
              style="width: 100%"
              show-time
              placeholder="年月日时分"
              value-format="YYYY-MM-DD HH:mm:ss"
              format="YYYY-MM-DD HH:mm:ss"
              v-model:value="item.outTime"
              :rules="{
                required: true,
                message: '请输入',
                trigger: 'change',
              }"
              :disabledDate="(current) => current > new Date()"
            />
          </a-form-item>
          <a-form-item label="检修部位" :name="['item', idx, 'accessParts']" :colon="false" required>
            <a-input placeholder="请输入" disabled v-model:value="item.accessParts" :maxlength="30" />
          </a-form-item>
          <a-form-item label="携带工具" :name="['item', idx, 'carryTools']" :colon="false" required>
            <a-input placeholder="请输入" disabled v-model:value="item.carryTools" :maxlength="30" />
          </a-form-item>
        </template>

        <a-form-item :wrapper-col="{ offset: 9 }">
          <a-space>
            <a-button
              @click="
                checkInOutShow = false;
                checkInOutFormRef.resetFields();
              "
              >取消
            </a-button>
            <a-button :loading="confirmLoading" type="primary" @click="checkInOutOk">确定</a-button>
          </a-space>
        </a-form-item>
      </a-form>
    </Modal>

    <Modal
      :width="520"
      v-model:visible="safetyWorkCheckShow"
      title="安全作业检查"
      :bodyStyle="{ padding: '4px 10px' }"
      :mask-closable="false"
      @cancel="safetyWorkCheckShow = false"
      centered
      :confirm-loading="confirmLoading"
      @ok="saretyWorkCheckOk"
      :zIndex="900"
    >
      <a-form
        :model="safetyWorkCheckForm"
        ref="saretyWorkCheckFormRef"
        :rules="safetyWorkCheckRules"
        :label-col="{ span: 4 }"
        :wrapper-col="{ span: 18 }"
      >
        <a-form-item label="检查描述" name="desc" :colon="false" required>
          <a-input :maxlength="200" v-model:value="safetyWorkCheckForm.desc" placeholder="请输入" />
        </a-form-item>
        <a-form-item name="result" label="检查结果" required>
          <a-radio-group style="padding-left: 10px" v-model:value="safetyWorkCheckForm.result">
            <a-radio value="1">合格</a-radio>
            <a-radio value="2">不合格</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item name="yhlb" label="隐患类别" v-if="safetyWorkCheckForm.result == '2'" required>
          <JSelectMultiple v-model:value="safetyWorkCheckForm.yhlb" :show-choose-option="false" placeholder="请选择" dictCode="sk_yh_type" />
        </a-form-item>
        <a-form-item v-if="!UnhazardousWork" label="检查照片" name="imgMap" required>
          <CheckImgUpload ref="checkImgUploadRef" v-model:value="safetyWorkCheckForm.imgMap" />
        </a-form-item>
        <a-form-item v-else label="检查照片" name="imgUrl" required>
          <JImageUpload v-model:value="safetyWorkCheckForm.imgUrl" :isYhWatermark="true" :fileMax="10" text="" bizPath="hiddenTrouble" />
        </a-form-item>
        <a-form-item label="责任人" name="sceneHead" :colon="false" v-if="safetyWorkCheckForm.result == '2'">
          <a-input readonly v-model:value="currentItem.sceneHeadName" placeholder="请输入" />
        </a-form-item>
      </a-form>
    </Modal>
    <Modal
      :width="300"
      v-model:visible="startWorkShow"
      title="开始作业"
      :bodyStyle="{ padding: '4px 10px' }"
      :mask-closable="false"
      @cancel="startWorkCancel"
      :confirm-loading="confirmLoading"
      centered
      @ok="startWorkOk"
      :zIndex="900"
    >
      <a-form :model="workStopForm" ref="workStopFormRef" autocomplete="off">
        <a-form-item label="开始时间" name="reason" :colon="false" required :label-col="{ span: 6 }" :wrapper-col="{ flex: 1 }">
          <a-date-picker
            style="width: 100%"
            show-time
            disabled
            placeholder="年月日时分"
            value-format="YYYY-MM-DD HH:mm:ss"
            format="YYYY-MM-DD HH:mm:ss"
            v-model:value="startTime"
            :disabledDate="(current) => current > new Date()"
          />
        </a-form-item>
      </a-form>
    </Modal>
    <Modal
      :width="450"
      v-model:visible="WorkStop"
      title="作业中断"
      :bodyStyle="{ padding: '4px 10px' }"
      :mask-closable="false"
      @cancel="
        WorkStop = false;
        workStopFormRef.resetFields();
      "
      :confirm-loading="confirmLoading"
      centered
      @ok="handleOk"
      :zIndex="900"
    >
      <a-form :model="workStopForm" ref="workStopFormRef" autocomplete="off">
        <a-form-item labelAlign="left" label="中断原因" name="reason" :colon="false" required :label-col="{ span: 6 }" :wrapper-col="{ flex: 1 }">
          <a-textarea :rows="4" placeholder="请输入" :maxlength="100" v-model:value="workStopForm.reason" />
        </a-form-item>
        <a-form-item labelAlign="left" label="作业状态" name="reason" :colon="false" required :label-col="{ span: 6 }" :wrapper-col="{ flex: 1 }">
          <a-radio-group v-model:value="workStopForm.desc" name="radioGroup">
            <a-radio :value="0">今日未作业</a-radio>
            <a-radio :value="1">今日已作业</a-radio>
          </a-radio-group>
        </a-form-item>
      </a-form>
    </Modal>
    <Modal
      :width="500"
      v-model:visible="Acceptance"
      title="完结验收"
      :bodyStyle="{ padding: '4px 10px' }"
      :mask-closable="false"
      @cancel="
        Acceptance = false;
        AcceptanceFormRef.resetFields();
      "
      :confirm-loading="confirmLoading"
      centered
      :footer="null"
      :zIndex="900"
    >
      <a-form :model="AcceptanceForm" ref="AcceptanceFormRef" autocomplete="off" :label-col="{ span: 6 }">
        <a-row :span="24">
          <a-col :span="24">
            <a-form-item
              name="status"
              :rules="{
                required: true,
                message: '请选择',
                trigger: 'change',
              }"
              style="margin: 20px 0 !important"
              label="完结状态"
              class="my-form-item"
            >
              <a-radio-group v-model:value="AcceptanceForm.status">
                <a-radio value="正常完结">正常完结</a-radio>
                <a-radio value="取消作业">取消作业</a-radio>
              </a-radio-group>
            </a-form-item>
            <a-form-item
              name="reviewComments"
              :rules="{
                required: true,
                message: '请输入',
                trigger: 'change',
              }"
              style="margin: 20px 0 !important"
              label="验收意见"
              class="my-form-item"
            >
              <a-textarea v-model:value="AcceptanceForm.reviewComments" placeholder="请输入" :maxlength="300" />
            </a-form-item>
            <a-form-item :wrapper-col="{ offset: 8 }">
              <a-space :size="22">
                <a-button type="default" @click="acceptCancel">取消</a-button>
                <a-button type="primary" @click="AcceptanceOk">验收通过</a-button>
              </a-space>
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </Modal>
    <!-- 添加人员 -->
    <Modal
      :width="450"
      v-model:visible="changePersonShow"
      title="添加人员"
      :bodyStyle="{ padding: '4px 10px' }"
      :mask-closable="false"
      @cancel="
        WorkStop = false;
        workStopFormRef.resetFields();
      "
      :confirm-loading="confirmLoading"
      centered
      @ok="changePersonShowHandleOk"
      :zIndex="900"
    >
      <a-form>
        <a-form-item labelAlign="left" label="监护人:" name="workUnitGuardian" :colon="false" :label-col="{ span: 6 }" :wrapper-col="{ flex: 1 }">
          <JUserModal v-model:value="addPersonForm.workUnitGuardian" placeholder="请选择" />
        </a-form-item>
        <template v-for="item in addPersonForm.workUsers" :key="item.value">
          <a-form-item labelAlign="left" :label="item.name" :colon="false" :wrapper-col="{ flex: 1 }">
            <JUserModal
              type="checkbox"
              url="/workApply/getIdCode"
              :curColumns="curColumns"
              :params="{ workType: item.workType }"
              v-model:value="item.userId"
              placeholder="请选择"
            />
          </a-form-item>
        </template>
      </a-form>
    </Modal>
    <!-- 去整改 -->
    <ReformModal @register="reformRegister" @close="refresh" @success="refresh" />
    <!-- 操作步骤 -->
    <OperateModal @register="operateRegister" @close="refresh" />

    <job-pop-up-box
      :data-sauce="dataSauce"
      :readonly="readOnly"
      :title="title"
      :possible-danger="possibleDanger"
      :value="type"
      ref="jobPopUpBox"
      :data="cardData"
      :view-edit-data="viewEditData"
      @register="applyRegister"
      @renewal="renewal"
    />
    <DetailDrawer @register="register" />
    <my-model @register="registerMyModal" :dataSauce="dataSauce" @cancle="myModelCancle" @next-step="nextStep" />
    <playerModal @register="registerPlayerModal" />
  </div>
</template>

<script setup lang="ts">
  import { message, Modal, Pagination } from 'ant-design-vue';
  import dayjs from 'dayjs';
  import { saveAs } from 'file-saver';
  import { provide, reactive, readonly, Ref, ref, nextTick, computed } from 'vue';
  import JobPopUpBox from '../JobApproval/JobPopUpBox.vue';
  import { useDrawer } from '/@/components/Drawer';
  import DetailDrawer from '../detail/detailDaver.vue';
  import MyModel from './MyModel.vue';
  import { JUserModal } from '/@/components/Form';
  import ReformModal from './component/reformModal.vue';
  import OperateModal from './component/operateModal.vue';
  import AnalysisForm from './component/AnalysisForm.vue';
  import playerModal from './playedu-player/playerModal.vue';
  import {
    getAddAnalysis,
    inSpace,
    outSpace,
    userGetData,
    getWaitConfirmData,
    spaceConfirm,
    getCompleteAcceptance,
    getContinueWork,
    getDerive,
    getInterruptWork,
    getStartWork,
    getWorkManageList,
    securityConfirmation,
    deleteManage,
    updateGuardian,
    addWorkUser,
  } from '../api';
  import type { CardList, JobApplyForFrom, searchJobList } from '../type';
  import CheckImgUpload from '../components/CheckImgUpload.vue';
  import { JImageUpload } from '/@/components/Form';
  import { buildImgList, createCheckImgMap, IMG_TYPE_NEW, IMG_TYPE_OLD } from '../constants/checkImg';
  import { useUserStore } from '/@/store/modules/user';
  import { useRoute } from 'vue-router';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useModal } from '/@/components/Modal';
  import { useData } from '../hooks/usePublicData';
  import { getUrl } from '../api/index';
  import JSelectMultiple from "../../../components/Form/src/jeecg/components/JSelectMultiple.vue";
  const { curColumns } = useData();
  const props = defineProps({
    show: {
      type: Boolean,
    },
    thisState: {
      type: String,
    },
    getFieldsValue: {
      type: Function,
    },
  });
  const activeKey = ref('1');
  const { createMessage } = useMessage();
  const userStore = useUserStore();
  const [registerMyModal, { openModal: openMyModal, closeModal: closeMyModal }] = useModal();
  // 去整改
  const [reformRegister, { openModal: openReformModal, closeModal: closeReformModal }] = useModal();
  // 操作步骤
  const [operateRegister, { openModal: openOperateModal, closeModal: closeOperateModal }] = useModal();
  const [applyRegister, { openDrawer: applyOpenDrawer }] = useDrawer();
  const [registerPlayerModal, open] = useModal();
  const route = useRoute();
  const confirmLoading = ref(false);
  const readOnly = ref(false);
  const disabled = ref(false);
  const visible = ref(false);
  const viewEditData = ref<JobApplyForFrom>({});
  const dataSauce = ref<any>([]);
  const possibleDanger = ref<any>([]);
  const formRules = ref<any>([]);
  const title = ref('');
  const type = ref();
  // 状态
  const state = ref(props.thisState) as Ref<string>;

  //作业中断弹窗
  const WorkStop = ref(false);
  //作业中断表单
  const workStopForm = reactive({
    reason: '',
    desc: '',
    workApplyId: '',
    delayDate: '',
    workExamineId: '',
  });
  //作业表单
  const workStopFormRef = ref();
  const UnhazardousWork = computed(() => route.name === 'UnhazardousWork-jobManagement');
  //添加分析表单
  const addAnalysisForm = reactive({
    analysisSite: '',
    analysisTime: dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss'),
    oxygenContent: '',
    toxicHarmfulMedia: '',
    toxicHarmfulMediaUnit: 'mg/m³',
    carbonMonoxideUnit: 'mg/m³',
    otherGas: '无',
    otherGasUnit: 'mg/m³',
    carbonMonoxide: '',
    gas: '',
    workApplyId: '',
    determination: '',
    analystName: userStore.getUserInfo.realname,
    analyst: userStore.getUserInfo.id,
    analysisData: '',
    dust: '无',
  });

  //添加分析表单
  const addAnalysisFormRef = ref();
  const Acceptance = ref(false);
  const AcceptanceForm = reactive({
    reviewComments: '',
    reviewImg: '', //@ts-ignore
    sign: userStore.getUserInfo.signature,
    workApplyId: '',
    workExamineId: '',
    status: '正常完结',
  });

  const AcceptanceFormRef = ref();
  // 总条数
  const total = ref(0);
  // 页数
  const current = ref<number>(1);
  // 页数和条数
  const pageSize = ref<number>(12);
  // 表单数据
  let formState = ref<searchJobList>({});
  // 卡片数据
  let cardData = ref<any[]>([]);

  const pageInit = async (state, formData) => {
    loading.value = true;
    current.value = 1;
    pageSize.value = 12;
    nextTick(() => {
      getList({ state: state, ...formData });
    });
  };
  const loading = ref(false);
  // 获取列表数据
  const getList = async (data: searchJobList) => {
    loading.value = true;
    let params = { ...data };
    params.pageSize = data.pageSize || pageSize.value;
    params.pageNo = data.pageNo || current.value;
    if (params.endTime) {
      params.endTime = params.endTime + ' 23:59:59';
    }
    if (params.startTime) {
      params.startTime = params.startTime + ' 00:00:00';
    }
    if (params.workStartTime) {
      params.workStartTime = params.workStartTime + ' 00:00:00';
    }
    if (params.workEndTime) {
      params.workEndTime = params.workEndTime + ' 23:59:59';
    }
    params['type'] = UnhazardousWork.value ? '2' : '1'; // 1:有害作业 2:无害作业
    //@ts-ignore
    const res = await getWorkManageList(params).finally(() => (loading.value = false));
    cardData.value = [];
    total.value = res.total;
    current.value = res.current;
    pageSize.value = res.size;
    cardData.value = res.records;
  };

  // 进出空间
  const inOutRules = {
    inTime: [
      {
        required: true,
        message: '请选择',
        trigger: 'change',
      },
    ],
    outTime: [
      {
        required: true,
        message: '请选择',
        trigger: 'change',
      },
    ],
    spaceName: [
      {
        required: true,
        message: '请输入',
        trigger: 'change',
      },
    ],
    accessParts: [
      {
        required: true,
        message: '请输入',
        trigger: 'change',
      },
    ],
    carryTools: [
      {
        required: true,
        message: '请输入',
        trigger: 'change',
      },
    ],
  };


  // 页数和条数变化
  const pageSizeChange = (page: any, pageSize: any) => {
    getList({ ...formState.value, state: state.value, pageNo: page, pageSize: pageSize, ...props?.getFieldsValue() });
  };

  // 开始作业
  const startWorkShow = ref(false);
  const currentItem = ref<any>({});
  const startTime = ref('');
  const startWork = async (item: CardList) => {
    const allowStart = dayjs(new Date()).isAfter(item.workStartTime) && dayjs(new Date()).isBefore(item.workEndTime);
    if (!allowStart) {
      message.error('当前时间未在作业时间内');
      return;
    }
    startWorkShow.value = true;
    currentItem.value = item;
    startTime.value = dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss');
  };
  const startWorkCancel = () => {
    WorkStop.value = false;
    workStopFormRef.value.resetFields();
    confirmLoading.value = false;
  };
  const startWorkOk = async () => {
    confirmLoading.value = true;
    let res = await getStartWork({ workApplyId: currentItem.value.id, workExamineId: currentItem.value.workExamineId }).catch((_) => {
      return false;
    });
    if (res) {
      startWorkShow.value = false;
      getList({ state: state.value });
    }
    confirmLoading.value = false;
  };
  const [register, { openDrawer }] = useDrawer();
  // 点击查看详情
  const viewDetail = async (item, apply?) => {
    if (apply) {
      applyOpenDrawer(true, {
        id: item.id,
        title: '作业审批',
      });
    } else {
      openDrawer(true, {
        id: item.id,
        title: item.workTypeName,
      });
    }
  };

  // 安全作业检查
  const safetyWorkCheckShow = ref(false);
  const safetyWorkCheckForm = ref({
    id: '',
    result: '',
    desc: '',
    imgMap: createCheckImgMap(),
    imgUrl: '',
    yhlb: undefined,
  });
  const safetyWorkCheckRules = {
    result: [
      {
        required: true,
        message: '请选择',
        trigger: 'change',
      },
    ],
    desc: [
      {
        required: true,
        message: '请输入',
        trigger: 'change',
      },
    ],
    yhlb: [
      {
        required: true,
        message: '请选择',
        trigger: 'change',
      },
    ],
    imgMap: [
      {
        validator: () => checkImgUploadRef.value?.validate(),
        trigger: 'change',
      },
    ],
    imgUrl: [
      {
        required: true,
        message: '请上传',
        trigger: 'change',
      },
    ],
  };
  const saretyWorkCheckFormRef = ref();
  const checkImgUploadRef = ref();
  const safetyWorkCheck = (item) => {
    currentItem.value = item;
    safetyWorkCheckForm.value.desc = '';
    safetyWorkCheckForm.value.result = '';
    safetyWorkCheckForm.value.imgMap = createCheckImgMap();
    safetyWorkCheckForm.value.imgUrl = '';
    safetyWorkCheckShow.value = true;
    safetyWorkCheckForm.value.id = item.id;
  };
  // 安全作业检查确认
  const saretyWorkCheckOk = async () => {
    await saretyWorkCheckFormRef.value.validate();
    confirmLoading.value = true;
    const { imgMap, imgUrl, ...rest } = safetyWorkCheckForm.value;
    // 非高危作业只传默认检查照片（imgUrl），不分5类
    const imgData = UnhazardousWork.value ? { imgUrl, imgType: IMG_TYPE_OLD } : { imgList: buildImgList(imgMap), imgType: IMG_TYPE_NEW };
    await securityConfirmation({
      ...rest,
      ...imgData,
    });
    confirmLoading.value = false;
    safetyWorkCheckShow.value = false;
    saretyWorkCheckFormRef.value.resetFields();
    getList({ state: state.value });
  };
  // 安全检查确认提交
  const currentSubmitData = ref<any>({});
  const currentType = ref<string>('1'); // 1安全检查确认 2 气体分析 3 进空间 4 出空间 10完结验收
  // 签名提交
  const nextStep = async (data) => {
    if (currentType.value == '1') {
      await securityConfirmation({
        ...currentSubmitData.value,
        ...data,
      }).catch((_) => (confirmLoading.value = false));
      getList({ state: state.value });
      tempElectricityRef.value.resetFields();
      tempElectricity.value = false;
    } else if (currentType.value == '2') {
      currentSubmitData.value.forEach((item) => Object.assign(item, data));
      await getAddAnalysis(currentSubmitData.value).catch((err) => (confirmLoading.value = false));
      AddAnalysis.value = false;
      addAnalysisFormRef.value.resetFields();
      getList({ state: state.value });
      needSign.value = false;
      currentType.value = '1';
      dialogFormRef1.value?.cancel();
      dialogFormRef2.value?.cancel();
      dialogFormRef3.value?.cancel();
    } else if (currentType.value == '3') {
      await inSpace({
        ...inOutForm.value,
        inSign: data.sign,
      }).catch((err) => (confirmLoading.value = false));
      inOutShow.value = false;
      getList({ state: state.value });
      currentType.value = '1';
      inOutFormRef.value?.resetFields();
    } else if (currentType.value == '4') {
      await outSpace({
        ...inOutForm.value,
        outSign: data.sign,
      }).catch((err) => (confirmLoading.value = false));
      inOutShow.value = false;
      getList({ state: state.value });
      currentType.value = '1';
      inOutFormRef.value?.resetFields();
    } else if (currentType.value == '5') {
      await spaceConfirm({
        ...checkInOutInfo.value,
        ...data,
      });
      checkInOutShow.value = false;
      checkInOutInfo.value = {};
      getList({ state: state.value });
    } else if (currentType.value == '10') {
      await getCompleteAcceptance({ ...AcceptanceForm, ...data }).catch((_) => AcceptanceFormRef.value.resetFields());
      AcceptanceFormRef.value.resetFields();
      getList({ state: state.value });
    }

    confirmLoading.value = false;
    // closeMyModal();
  };
  const myModelCancle = () => {
    confirmLoading.value = false;
  };

  const renewal = () => {
    viewEditData.value = {};
    visible.value = false;
    getList({ state: state.value });
  };
  //添加分析
  const AddAnalysis = ref(false);
  const needSign = ref<boolean>(false);
  const currentWorkType = ref<string | number>('');
  const addAnalysis = (item: CardList, needSigns: boolean, workType: string | number, workStatus = 8) => {
    addAnalysisForm.workApplyId = item.id as string;
    addAnalysisForm.workExamineId = item.workExamineId;
    currentItem.value = item;
    currentItem.value.workStatus = workStatus;
    AddAnalysis.value = true;
    needSign.value = needSigns;
    currentType.value = '2';
    currentWorkType.value = workType;
  };
  const addAnalysisCancel = () => {
    AddAnalysis.value = false;
    dialogFormRef1.value?.cancel();
    dialogFormRef2.value?.cancel();
    dialogFormRef3.value?.cancel();
  };
  const getIng = ref(false);

  // 进出空间
  const inOutShow = ref(false);
  const inOutForm = ref<any>({
    workApplyId: '',
    inTime: dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss'),
    outTime: dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss'),
    spaceName: '',
    accessParts: '',
    carryTools: '',
    inSign: '',
  });
  const inOutFormRef = ref(null);
  const inOutClick = async (item, flag) => {
    currentType.value = flag ? '3' : '4';
    inOutForm.value.spaceName = item.limitSpaceName || '';
    let res = await userGetData({ workApplyId: item.id });
    if (!flag) {
      if (!res) {
        createMessage.warning('您还没有进空间记录！');
        return;
      }
      if (res) {
        Object.assign(inOutForm.value, res);
      }
      inOutForm.value.outTime = dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss');
    }
    if (flag && res) {
      createMessage.warning('您已有进空间记录！');
      return;
    }
    inOutForm.value.workApplyId = item.id;
    inOutShow.value = true;
    currentItem.value = item;
  };
  const inOutOk = async () => {
    await inOutFormRef.value?.validate();
    currentSubmitData.value = inOutForm;
    confirmLoading.value = true;
    openMyModal(true, {});
  };
  // 确认进出
  const checkInOutShow = ref(false);
  const checkInOutInfo = ref<any>({});
  const checkInOutFormRef = ref(null);
  const checkInOutClick = async (item) => {
    currentType.value = '5';
    currentItem.value = item;
    checkInOutInfo.value = await getWaitConfirmData({ workApplyId: item.id });
    checkInOutShow.value = true;
  };
  const checkInOutOk = async () => {
    await inOutFormRef.value?.validate();
    currentSubmitData.value = inOutForm;
    openMyModal(true, {});
    confirmLoading.value = true;
  };
  // 添加分析弹窗关闭
  const dialogFormRef1 = ref<InstanceType<typeof AnalysisForm>>();
  const dialogFormRef2 = ref<InstanceType<typeof AnalysisForm>>();
  const dialogFormRef3 = ref<InstanceType<typeof AnalysisForm>>();
  const addAnalysisOk = async () => {
    if (currentItem.value.workType == 2) {
      let promises: any = [];
      if (currentItem.value.workStatus == 2) {
        promises = [dialogFormRef1.value?.validate(), dialogFormRef2.value?.validate(), dialogFormRef3.value?.validate()];
        currentSubmitData.value = [dialogFormRef1.value?.getData(), dialogFormRef2.value?.getData(), dialogFormRef3.value?.getData()];
      } else {
        promises = [dialogFormRef1.value?.validate()];
        currentSubmitData.value = [dialogFormRef1.value?.getData()];
      }
      Promise.all(promises)
        .then(async () => {
          openMyModal(true, {});
        })
        .catch(() => {
          message.error('请填写所有位置的分析数据！');
        });
    } else {
      Promise.all([dialogFormRef1.value?.validate()])
        .then(async () => {
          currentSubmitData.value = [dialogFormRef1.value?.getData()];
          openMyModal(true, {});
        })
        .catch(() => {
          message.error('请填写所有位置的分析数据！');
        });
    }
  };

  //完结验收
  const completeAcceptance = async (item: CardList) => {
    AcceptanceForm.workApplyId = item.id;
    AcceptanceForm.workExamineId = item.workExamineId as string;
    Acceptance.value = true;
  };

  // 验收弹窗关闭
  const AcceptanceOk = async () => {
    AcceptanceFormRef.value.validate().then(async (values) => {
      confirmLoading.value = true;
      currentType.value = '10';
      openMyModal(true, {});
      Acceptance.value = false;
    });
  };
  const acceptCancel = () => {
    Acceptance.value = false;
  };

  // 作业中断
  const workStop = async (item: CardList) => {
    if (item.workStopMark) {
      const allowStart = dayjs(new Date()).isBefore(item.workEndTime);
      if (!allowStart) {
        message.error('当前作业已过作业时间，不允许继续作业!');
        return;
      }
      await getContinueWork({ workApplyId: item.id });
      getList({ state: state.value });
    } else {
      workStopForm.workApplyId = item.id;
      workStopForm.workExamineId = item.workExamineId as string;
      WorkStop.value = true;
    }
  };
  // 弹窗关闭
  const handleOk = async () => {
    await workStopFormRef.value.validate();
    confirmLoading.value = true;
    await getInterruptWork(workStopForm).catch((err) => console.log(err));
    confirmLoading.value = false;
    getList({ state: state.value });
    workStopFormRef.value.resetFields();
    workStopForm.desc = '';
    WorkStop.value = false;
  };
  // 导出
  const derive = async (id: string) => {
    const res = await getDerive({ id });
    var reader = new FileReader();
    reader.onload = function (event) {
      //@ts-ignore
      var textData = event.target.result; //@ts-ignore
      if (!JSON.parse(textData).success) message.error(JSON.parse(textData).message); //@ts-ignore
      if (JSON.parse(textData).success) message.success(JSON.parse(textData).message);
    };
    reader.readAsText(res.data); // 这里的 blobData 是从响应中获取的 Blob 数据
    const fileName = decodeURIComponent(res.headers['content-disposition'].split('=')[1]);
    // const binaryData = new Uint8Array([res.data]);
    const blob = new Blob([res.data], { type: 'application/octet-stream' });
    saveAs(blob, fileName);
  };

  // 删除
  const del = async (id: string) => {
    Modal.confirm({
      title: '删除',
      content: '是否确认删除？',
      bodyStyle: { top: '40%' },
      onOk() {
        deleteManage({ id: id }).then((res) => {
          console.log(res);
          getList({ state: state.value });
        });
      },
    });
  };

  // 根据氧气浓度判断是否合格
  const changeOxygenContent = ({ target }) => {
    if (target.value < 23.5 && target.value > 19.5) {
      addAnalysisForm.determination = '1';
    } else {
      addAnalysisForm.determination = '2';
    }
  };
  // 去整改
  const reformClick = (item, type) => {
    openReformModal(true, { ...item, type });
  };
  // 操作步骤
  const operateClick = (item, type) => {
    openOperateModal(true, { ...item, type });
  };

  const setCheckRole = (role) => {
    const statusmaps = [
      { text: '安全部', status: false, id: '1' },
      { text: '副部长', status: false, id: '2' },
      { text: '安全科长', status: false, id: '6' },
      { text: '安全科', status: false, id: '3' },
      { text: '车间主任', status: false, id: '4' },
      { text: '班组长', status: false, id: '5' },
    ];
    let res = statusmaps.map((v) => {
      if (!role.includes(v.id)) {
        v.status = true;
      }
      return v;
    });
    return res;
  };
  const refresh = () => {
    getList({ state: state.value });
  };
  // 添加人员
  const workUnitGuardian = ref('');
  const changePersonShow = ref(false);
  const addPersonForm = ref<any>({
    workUnitGuardian: '',
    workUnit: '',
    workUsers: [],
  });
  const changePersonClick = (item) => {
    currentItem.value = item;
    let names = item.workTypeName.split('、');
    let values = item.workType.split(',');
    addPersonForm.value.workUsers = values.map((v, i) => ({ name: `${names[i]}-作业人员:`, workType: v, userId: '' }));
    console.log(addPersonForm.value);

    changePersonShow.value = true;
  };
  const changePersonShowHandleOk = async () => {
    let workUsers = addPersonForm.value.workUsers.filter((item) => item.userId);
    if (!addPersonForm.value.workUnitGuardian && workUsers.length === 0) return createMessage.warning('请选择监护人或作业人员！');
    confirmLoading.value = true;
    if (addPersonForm.value.workUnitGuardian) {
      await updateGuardian({
        workApplyId: currentItem.value.id,
        userId: addPersonForm.value.workUnitGuardian,
      })
        .then((res) => {
          addPersonForm.value.workUnitGuardian = '';
          changePersonShow.value = false;
          confirmLoading.value = false;
        })
        .catch((e) => {
          confirmLoading.value = false;
        });
    }
    if (workUsers.length > 0) {
      await addWorkUser({
        workApplyId: currentItem.value.id,
        workUsers: workUsers,
      })
        .then((res) => {
          addPersonForm.value.workUsers = [];
          changePersonShow.value = false;
          confirmLoading.value = false;
        })
        .catch((e) => {
          confirmLoading.value = false;
        });
    }
  };
  // 已验收展示 安全作业检查
  const showSafetyWorkCheck = (item) => {
    const now = dayjs(new Date()).format('YYYY-MM-DD');
    return item.workFinishTime.startsWith(now);
  };
  const handleCamera = (data) => {
    getUrl({
      code: data.ballCameraCode,
    })
      .then((res) => {
        if (res.code == 200) {
          open.openModal(true, {
            url: res.result,
            id: data.id,
          });
        } else {
          message.error('请确认布控球设备是否开机！');
        }
      })
      .catch(() => {
        message.error('网络超时！');
      });
  };
  defineExpose({
    pageInit,
  });
  provide('formState', viewEditData);
  provide('formRules', formRules);
  provide('readOnly', readonly(disabled));
  provide('title', type);
  provide('open', visible);
</script>

<style lang="less" scoped>
  .btn-wrap {
    width: 100%;
    display: flex;
    justify-content: flex-start;
    flex-wrap: wrap;

    button {
      margin-right: 5px;
      margin-bottom: 5px;
    }
  }

  .my-form-item {
    margin: 0 !important;
  }

  .fixed-height-card {
    border-radius: 7px;
    box-shadow: 5px 5px 5px rgba(0, 0, 0, 0.3);
  }

  :deep(.ant-select-selection-overflow) {
    flex-wrap: nowrap !important;
    overflow: auto !important;
  }

  .foot {
    display: flex;
    justify-content: center;
    padding: 16px;

    button {
      margin-right: 15px;
    }
  }

  .reason {
    text-overflow: ellipsis;
    overflow: hidden;
    word-break: break-all;
    white-space: nowrap;
  }

  .my-table {
    width: 100%;
    border-right: 1px solid #f0f0f0;
    border-bottom: 1px solid #f0f0f0;
    text-align: center;
    margin-top: 16px;

    tr {
      border-left: 1px solid #f0f0f0;
      border-top: 1px solid #f0f0f0;

      td:nth-child(3),
      td:nth-child(1) {
        width: 18%;
      }
    }

    td {
      height: 42px;
      padding: 0px 15px;
      border-left: 1px solid #f0f0f0;
      border-top: 1px solid #f0f0f0;
    }
  }

  .modal-body {
    height: 80vh;
    overflow-y: auto;
  }

  .t-left {
    text-align: left;
  }

  .oneline {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    -o-text-overflow: ellipsis;
  }

  .card-title {
    display: flex;
    align-items: center;
    justify-content: space-between;

    button {
      margin-left: 8px;
    }
  }

  .tag-wrap {
    display: flex;
    justify-content: space-between;
  }

  .del {
    display: inline-block;

    img {
      width: 20px;
      height: 20px;
    }
  }

  :deep(.ant-tag) {
    height: 24px;
    line-height: 24px;
  }

  .tags {
    flex: 1;
    display: flex;
    align-items: center !important;
    span {
      border-radius: 4px;
      font-size: 12px;
      padding: 0 5px;
    }
  }
  .grade-tag {
    display: inline-block;
    font-size: 12px;
    background-color: #f0f0f0;
    color: #000;
    padding: 2px 5px;
    border-radius: 4px;
    margin-right: 5px;
  }
  .red {
    color: rgb(255, 77, 79);
    background-color: #fff1f0;
  }
  .orange {
    color: #faad14;
    background-color: #fffbe6;
  }
  .blue {
    color: #1890ff;
    background-color: #e6f7ff;
  }
</style>
