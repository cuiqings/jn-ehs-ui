<template>
  <div class="hiddendanger">
    <van-tabs v-model:active="active" @change="tabChange">
      <van-tab title="审批中" name="1">
        <div class="tab-inner">
          <List
            :listType="2"
            :total="total1"
            ref="listRef1"
            :needBtn="false"
            @openDetail="openDetail($event)"
            :list="list"
            @onLoad="onLoad"
            @onRefresh="onRefresh"
            @del="del"
          >
            <template #del="{ item }">
              <img
                v-auth="'WorkRequisition:delet'"
                class="del-icon"
                @click.stop="del(item.id)"
                src="../../../../assets/images/delete.png"
                alt=""
                srcset=""
              />
            </template>
            <template #btn="{ item }">
              <van-button v-if="item.flagPerm" type="primary" size="mini" @click.stop="edit(item)">去审批</van-button>
              <van-button
                type="primary"
                v-auth="'WorkRequisition:updateGuardian'"
                v-if="item.sceneHead.includes(userStore.getUserInfo.id)"
                size="mini"
                @click.stop="changePersonClick(item)"
                >添加人员</van-button
              >
              <van-button type="primary" size="mini" @click.stop="openDetail(item)">查看详情</van-button>
            </template>
          </List>
        </div>
      </van-tab>
      <van-tab title="待作业" name="2">
        <div class="tab-inner">
          <List
            :listType="2"
            :total="total2"
            :needBtn="false"
            ref="listRef2"
            @openDetail="openDetail($event)"
            :list="list2"
            @onLoad="onLoad"
            @onRefresh="onRefresh"
            @del="del"
          >
            <template #del="{ item }">
              <img
                v-auth="'WorkRequisition:delet'"
                class="del-icon"
                @click.stop="del(item.id)"
                src="../../../../assets/images/delete.png"
                alt=""
                srcset=""
              />
            </template>
            <template #btn="{ item }">
              <van-button v-if="item.fxFlag && item.workType.includes(2)" type="primary" size="mini" @click.stop="addAnaly(item, true, 2, 2)"
                >有限空间分析</van-button
              >
              <van-button v-if="item.fxFlag && item.workType.includes(3)" type="primary" size="mini" @click.stop="addAnaly(item, true, 3)"
                >动火作业分析</van-button
              >
              <van-button
                v-auth="'WorkRequisition:start'"
                v-if="item.startWorkFlag && !item.workAnalysisMark && !item.checkMark"
                type="primary"
                size="mini"
                @click.stop="startWork(item)"
                >开始作业</van-button
              >
              <van-button
                type="primary"
                v-auth="'WorkRequisition:updateGuardian'"
                v-if="item.sceneHead.includes(userStore.getUserInfo.id)"
                size="mini"
                @click.stop="changePersonClick(item)"
                >添加人员</van-button
              >
              <van-button type="primary" size="mini" @click.stop="safetyCheck(item)" v-if="item.flagPerm && item.checkMark">安全检查确认</van-button>
              <van-button type="primary" size="mini" @click.stop="openDetail(item)">查看详情</van-button>
            </template>
          </List>
        </div>
      </van-tab>
      <van-tab title="作业中" name="3">
        <div class="tab-inner">
          <List
            :listType="2"
            :total="total3"
            :needBtn="false"
            ref="listRef3"
            @openDetail="openDetail($event)"
            :list="list3"
            @onLoad="onLoad"
            @onRefresh="onRefresh"
            @del="del"
          >
            <template #del="{ item }">
              <img
                v-auth="'WorkRequisition:delet'"
                class="del-icon"
                @click.stop="del(item.id)"
                src="../../../../assets/images/delete.png"
                alt=""
                srcset=""
              />
            </template>
            <template #btn="{ item }">
              <van-button v-if="item.fxFlag && item.workType.includes(2)" type="primary" size="mini" @click.stop="addAnaly(item, true, 2)"
                >有限空间分析</van-button
              >
              <van-button v-if="item.fxFlag && item.workType.includes(3)" type="primary" size="mini" @click.stop="addAnaly(item, true, 3)"
                >动火作业分析</van-button
              >
              <van-button type="primary" size="mini" v-if="item.jkjFlag && item.workType.includes(2)" @click.stop="inOutClick(item, true)">
                进空间
              </van-button>
              <van-button type="primary" size="mini" v-if="item.ckjFlag && item.workType.includes(2)" @click.stop="inOutClick(item, false)">
                出空间
              </van-button>
              <van-button type="primary" size="mini" v-if="item.confirmFlag && item.workType.includes(2)" @click.stop="checkInOutClick(item)">
                确认进出
              </van-button>
              <van-button
                size="mini"
                style="background-color: #f59a23; border-color: #f59a23"
                type="primary"
                @click.stop="safetyWorkCheckClick(item)"
                v-auth="'WorkRequisition:safetycheck'"
              >
                安全作业检查
              </van-button>
              <van-button type="primary" size="mini" v-if="['6', '7'].includes(item.workType) && item.czBzFlag" @click.stop="operateClick(item, 1)"
                >操作步骤记录</van-button
              >
              <van-button type="primary" size="mini" v-if="['6', '7'].includes(item.workType) && item.qrBzFlag" @click.stop="operateClick(item, 2)"
                >操作步骤确认</van-button
              >
              <van-button size="mini" v-if="item.reformFlag && item.reformNum > 0" type="primary" @click.stop="reformClick(item, 1)"
                >去整改</van-button
              >
              <van-button size="mini" v-if="item.reformConfirm" type="primary" @click.stop="reformClick(item, 2)">整改确认</van-button>
              <van-button v-if="item.flagPerm" type="primary" size="mini" @click.stop="finishWorkClick(item)">完结验收</van-button>
              <van-button
                type="primary"
                v-auth="'WorkRequisition:updateGuardian'"
                v-if="item.sceneHead.includes(userStore.getUserInfo.id)"
                size="mini"
                @click.stop="changePersonClick(item)"
                >添加人员</van-button
              >
              <van-button
                type="primary"
                size="mini"
                v-auth="'WorkRequisition:end'"
                v-if="!['1', '2', '3', '4'].includes(item.workType)"
                @click.stop="finishWorkFn(item)"
              >
                结束作业
              </van-button>
              <van-button type="primary" size="mini" @click.stop="openDetail(item)">查看详情</van-button>
              <van-button type="primary" size="mini" v-auth="'WorkRequisition:startOrStopFlag'" v-if="item.workStopMark && item.startOrStopFlag" @click.stop="continueWorkClick(item)"
                >继续作业</van-button
              >
              <van-button type="primary" size="mini" v-if="!item.workStopMark && item.startOrStopFlag" @click.stop="workStop(item)"
                >作业中断</van-button
              >

              <!-- <van-button
                type="primary"
                size="mini"
                v-if="item.workStopMark"
                
                @click.stop="continueWorkClick(item)"
                >继续作业</van-button
              > -->
            </template>
          </List>
        </div>
      </van-tab>
      <van-tab title="作业中断" name="7">
        <div class="tab-inner">
          <List
            :listType="2"
            :total="total7"
            :needBtn="false"
            ref="listRef7"
            @openDetail="openDetail($event)"
            :list="list7"
            @onLoad="onLoad"
            @onRefresh="onRefresh"
            @del="del"
          >
            <template #del="{ item }">
              <img
                v-auth="'WorkRequisition:delet'"
                class="del-icon"
                @click.stop="del(item.id)"
                src="../../../../assets/images/delete.png"
                alt=""
                srcset=""
              />
            </template>
            <template #btn="{ item }">
              <van-button size="mini" v-if="item.reformFlag && item.reformNum > 0" type="primary" @click.stop="reformClick(item, 1)"
                >去整改</van-button
              >
              <van-button size="mini" v-if="item.reformConfirm" type="primary" @click.stop="reformClick(item, 2)">整改确认</van-button>
              <van-button type="primary" size="mini" v-if="item.workStopMark && item.startOrStopFlag" v-auth="'WorkRequisition:startOrStopFlag'" @click.stop="continueWorkClick(item)"
                >继续作业</van-button
              >
              <!-- <van-button
                type="primary"
                size="mini"
                v-if="!['1', '2', '3', '4'].includes(item.workType)"
                v-auth="'WorkRequisition:startOrStopFlag'"
                @click.stop="continueWorkClick(item)"
                >继续作业</van-button
              > -->

              <van-button v-if="item.fxFlag && item.workType.includes(2)" type="primary" size="mini" @click.stop="addAnaly(item, true, 2)"
                >有限空间分析</van-button
              >
              <van-button v-if="item.fxFlag && item.workType.includes(3)" type="primary" size="mini" @click.stop="addAnaly(item, true, 3)"
                >动火作业分析</van-button
              >
              <van-button
                v-if="item.flagPerm"
                type="primary"
                size="mini"
                @click.stop="finishWorkClick(item)"
                >完结验收</van-button
              >
              <van-button
                type="primary"
                v-auth="'WorkRequisition:updateGuardian'"
                v-if="item.sceneHead.includes(userStore.getUserInfo.id)"
                size="mini"
                @click.stop="changePersonClick(item)"
                >添加人员</van-button
              >
            </template>
          </List>
        </div>
      </van-tab>
      <van-tab title="已验收" name="5">
        <div class="tab-inner">
          <List
            :listType="2"
            :total="total5"
            :needBtn="false"
            ref="listRef5"
            @openDetail="openDetail($event)"
            :list="list5"
            @onLoad="onLoad"
            @onRefresh="onRefresh"
          >
            <template #btn="{ item, index }">
              <van-button
                size="mini"
                style="background-color: #f59a23; border-color: #f59a23"
                type="primary"
                @click.stop="safetyWorkCheckClick(item)"
                v-auth="'WorkRequisition:safetycheck'"
                v-if="showSafetyWorkCheck(item) &&item.checkButton "
              >
                安全作业检查
              </van-button>
              <van-button size="mini" v-if="item.reformFlag && item.reformNum > 0" type="primary" @click.stop="reformClick(item, 1)"
                >去整改</van-button
              >
              <van-button size="mini" v-if="item.reformConfirm" type="primary" @click.stop="reformClick(item, 2)">整改确认</van-button>
              <van-button type="primary" size="mini" :loading="item.exportLoading" @click.stop="derive(item.id, index)">导出作业票</van-button>
              <van-button type="primary" size="mini" @click.stop="openDetail(item)">查看详情</van-button>
            </template>
          </List>
        </div>
      </van-tab>
    </van-tabs>
    <van-floating-bubble :size="'30px'" axis="xy" @click="searchShow = true" icon="filter-o" magnetic="x" />
    <van-popup v-model:show="searchShow" position="right" :style="{ width: '78%', height: '100%' }">
      <div class="search-box">
        <van-field
          v-model="queryParams.workTypeText"
          v-if="!isUnhazardousWork"
          label-align="top"
          is-link
          readonly
          name="workTypeText"
          label="作业类型"
          placeholder="请选择"
          @click="showPicker1 = true"
        />
        <van-field label-align="top" v-model="queryParams.workContent" name="workContent" label="作业内容" placeholder="请输入" />
        <van-popup v-model:show="showPicker1" position="bottom">
          <div class="poup-hd">
            <van-button style="border: none; color: #969799; font-size: 16px" @click="cancel2">取消</van-button>
            <van-button style="border: none; color: #6398fb; font-size: 16px" @click="onConfirm($event, 'workType')">确认</van-button>
          </div>
          <van-checkbox-group v-for="(item, idx) in work_typeList" v-model="queryParams.workType">
            <van-cell :title="item.text" @click="toggle(idx)">
              <template #right-icon>
                <van-checkbox :ref="el => checkboxRefs[idx] = el" @click.stop :name="item.value" />
              </template>
            </van-cell>
          </van-checkbox-group>
        </van-popup>

        <van-field label-align="top" v-model="queryParams.workApplyCode" name="workApplyCode" label="编号" placeholder="请输入编号" />

        <van-field v-model="queryParams.applicationUnitText" label-align="top" readonly name="applicationUnitText" label="申请单位">
          <template #input>
            <a-tree-select
              style="width: 100%"
              v-model:value="queryParams.applicationUnit"
              placeholder="请选择"
              :tree-data="applicationUnitOptions"
              multiple
              showSearch
              dropdownClassName="my-tree"
              @change="applicationUnitChange"
              tree-node-filter-prop="name"
              :dropdownStyle="{ zIndex: 3000 }"
              :field-names="{ label: 'title', value: 'key', children: 'children' }"
            >
            </a-tree-select>
          </template>
        </van-field>

        <van-field v-if="!isUnhazardousWork" label-align="top" readonly name="workUnit" label="生产/作业单位">
          <template #input>
            <a-tree-select
              style="width: 100%"
              v-model:value="queryParams.workUnit"
              placeholder="请选择"
              :tree-data="applicantUnit"
              multiple
              showSearch
              dropdownClassName="my-tree"
              @change="applicationUnitChange"
              tree-node-filter-prop="name"
              :dropdownStyle="{ zIndex: 3000 }"
              :field-names="{ label: 'title', value: 'key', children: 'children' }"
            >
            </a-tree-select>
          </template>
        </van-field>

        <van-field v-if="isUnhazardousWork" label-align="top" readonly name="workUnit" label="生产单位">
          <template #input>
            <a-tree-select
              style="width: 100%"
              v-model:value="queryParams.workUnit"
              placeholder="请选择"
              :tree-data="applicantUnit"
              multiple
              showSearch
              dropdownClassName="my-tree"
              @change="applicationUnitChange"
              tree-node-filter-prop="name"
              :dropdownStyle="{ zIndex: 3000 }"
              :field-names="{ label: 'title', value: 'key', children: 'children' }"
            >
            </a-tree-select>
          </template>
        </van-field>


        <JUserModal :elInfo="{ type: 'vant', attr: {label: '申请人', labelAlign: 'top'}, required: true }" v-model:value="queryParams.applicant" />

        <van-field
          v-if="!isUnhazardousWork"
          v-model="queryParams.workGrade"
          label-align="top"
          readonly
          @click="workGradeShow = true"
          name="workGrade"
          label="高危等级"
          placeholder="请选择"
        />

        <TreeSelect
          :value="queryParams.workGrade"
          :not-tree="true"
          value-key="value"
          title-key="text"
          v-model:show="workGradeShow"
          :items="workGradeList"
          @change="onConfirm($event, 'workGrade')"
        />

        <van-field
          v-model="queryParams.checkMarkText"
          label-align="top"
          readonly
          @click="checkMarkShow = true"
          name="checkMarkText"
          label="安全作业检查"
          placeholder="请选择"
        />
        <TreeSelect
          :value="queryParams.checkMark"
          :isRadio="true"
          :not-tree="true"
          value-key="value"
          title-key="text"
          v-model:show="checkMarkShow"
          :items="checkMarkList"
          @change="onConfirm($event, 'checkMark')"
        />

        <van-field label-align="top" v-model="queryParams.date" readonly @click="dateShow = true" name="date" label="申请时间" placeholder="请选择">
          <template #input>
            <span v-if="queryParams.date">{{ queryParams.date }}</span>
            <span v-else style="color: #c8c9cc">请选择</span>
          </template>
        </van-field>

        <van-field label-align="top" v-model="queryParams.workDate" readonly @click="workDateShow = true" name="workDate" label="作业时间" placeholder="请选择">
          <template #input>
            <span v-if="queryParams.workDate">{{ queryParams.workDate }}</span>
            <span v-else style="color: #c8c9cc">请选择</span>
          </template>
        </van-field>

        <div class="foot">
          <van-button size="small" @click="reset">重置</van-button>
          <van-button size="small" @click="searchClick" type="primary">搜索</van-button>
        </div>
      </div>
    </van-popup>
    <van-calendar allow-same-day :min-date="minDate" :max-date="maxDate" v-model:show="dateShow" type="range" @confirm="onConfirm($event, 'date')" />
    <van-calendar allow-same-day :min-date="minDate" :max-date="maxDate" v-model:show="workDateShow" type="range" @confirm="onConfirm($event, 'workDate')" />
    <CurLoading v-if="loading" />
    <!-- 气体分析-->
    <analyDialog @submit="analySubmit" :curItem="curItem" v-model:show="dialogShow" />
    <!-- 安全检查确认 -->
    <van-popup v-model:show="delayDialogShow" position="bottom" style="height: 100%">
      <delayDialog ref="safetySubmitRef" :curItem="curItem" :formData="detailInfo" />
      <div class="footer">
        <van-button @click="cancelSafetySubmit" type="primary" plain size="small" color="#1f7cf8">取消</van-button>
        <van-button @click="confirmSafetySubmit" type="primary" size="small" color="#1f7cf8">确认</van-button>
      </div>
    </van-popup>
    <finishWorkDialog :item="curItem" @submit="finishSubmit" v-model:show="finishWorkShow" />
    <workStopVue @submit="workStopSubmit" v-model:show="workStopShow" />
    <expectDialog :item="expectCurItem" @submit="expectSubmit" v-model:show="expectDialogShow" />
    <!-- 开始作业-->
    <ecsDialog :item="curItem" @submit="ecsSubmit" v-model:show="ecsDialogShow" />
    <van-dialog v-model:show="signShow" title="签名" :before-close="beforeClose" @confirm="dialogConfirm" show-cancel-button>
      <Sign v-model:value="signature" />
    </van-dialog>
    <SafetyWorkCheck :curItem="curItem" @submit="safetyWorkCheckSubmit" v-model:show="safetyWorkCheckShow" />
    <!-- 延迟续签 -->
    <DelayFinishDialog :delayInfo="delayInfo" @submit="delaySubmit" v-model:show="delayFinishDialogShow" />
    <!-- 进出空间 -->
    <InOutModel v-model:show="inOutShow" :curItem="curItem" :isIn="isIn" @submit="successSubmit" />
    <!-- 确认进出 -->
    <CheckInOut v-model:show="checkInOutShow" :curItem="curItem" :isIn="isIn" @submit="successSubmit" />
    <!-- 去整改 -->
    <CheckWorkModel v-model:show="checkWorkShow" :curItem="curItem" @submit="safetyWorkCheckSubmit" />
    <!-- 操作步骤 -->
    <OperateModal v-model:show="operateShow" :curItem="curItem" @submit="safetyWorkCheckSubmit" />
    <!-- 添加人员 -->
    <van-popup v-model:show="changePersonShow" position="bottom" style="height: 500px">
      <div style="text-align: center; font-size: 16px; font-weight: 600">添加人员</div>
      <JUserModal
        :elInfo="{ type: 'vant', attr: { 'label-align': 'top', label: '监护人', required: false } }"
        v-model:value="addPersonForm.workUnitGuardian"
      />

      <template v-for="item in addPersonForm.workUsers" :key="item.value">
        <JUserModal
          type="checkbox"
          url="/workApply/getIdCode"
          :params="{ workType: item.workType }"
          :elInfo="{ type: 'vant', attr: { 'label-align': 'top', label: item.name, required: false } }"
          v-model:value="item.userId"
        />
      </template>
      <div class="footer">
        <van-button @click="changePersonShowHandleCancel" :loading="confirmLoading" type="primary" plain size="small" color="#1f7cf8"
          >取消</van-button
        >
        <van-button @click="changePersonShowHandleOk" :loading="confirmLoading" type="primary" size="small" color="#1f7cf8">确认</van-button>
      </div>
    </van-popup>
  </div>
</template>

<script lang="ts" setup>
  import TreeSelect from '../../components/treeSelect.vue';
  import {
    getWorkManageList,
    getAddAnalysis,
    postStartWork,
    getDerive,
    finishWork,
    finishBack,
    getCompleteAcceptance,
    getContinueWork,
    getInterruptWork,
    getWorkExamineInfo,
    securityConfirmation,
    deleteManage,
    userGetData,
    updateGuardian,
    addWorkUser,
    contractorList,
  } from '../../../hazardousOperation/api/index';
  import Sign from '../../components/sign.vue';
  import { ref, nextTick, reactive, computed, watch } from 'vue';
  import finishWorkDialog from '../components/finishWork.vue';
  import expectDialog from '../components/expectDialog.vue';
  import { showSuccessToast, showConfirmDialog, showFailToast, showToast } from 'vant';
  import SafetyWorkCheck from '../components/safetyWorkCheck.vue';
  import DelayFinishDialog from '../components/delayFinish.vue';
  import delayDialog from '../components/delayDialog.vue';
  import analyDialog from '../components/anlyDialog.vue';
  import CurLoading from '../../components/loading.vue';
  import workStopVue from '../components/workStop.vue';
  import { useUserStore } from '/@/store/modules/user';
  import ecsDialog from '../components/ecsDialog.vue';
  import { useAppStore } from '/@/store/modules/app';
  import { useRouter, useRoute, onBeforeRouteLeave } from 'vue-router';
  import { setAppTitle } from '/@/utils/index';
  import List from '../components/list.vue';
  import uni from '@dcloudio/uni-webview-js';
  import { getToken } from '/@/utils/auth';
  import { useGlobSetting } from '/@/hooks/setting';
  import CheckInOut from '../components/checkInOut.vue';
  import InOutModel from '../components/inOut.vue';
  import CheckWorkModel from '../components/checkWork.vue';
  import OperateModal from '../components/operateDialog.vue';
  import { getEduOrgList, userListByOrg } from '/@/api/common/api';
  import JUserModal from '/@/components/App/JUserModal.vue';
  import dayjs from 'dayjs';

  setAppTitle();
  const globSetting = useGlobSetting();
  const appStore = useAppStore();
  const activeIdx = computed(() => appStore.getActiveIdx);
  const router = useRouter();
  const route = useRoute();
  const active = ref('1');
  const signShow = ref(false);
  const signature = ref('');

  const searchShow = ref(false);
  const showPicker = ref(false);
  const showPicker1 = ref(false);
  const checkboxRefs = ref([]);
  const toggle = (index) => {
    checkboxRefs.value[index].toggle();
  };
  const showPicker2 = ref(false);
  // 申请人下拉
  const applicantShow = ref(false);
  const workGradeShow = ref(false);
  const workGradeList = ref([
    { text: '一级', label: '一级', value: '一级' },
    { text: '二级', label: '二级', value: '二级' },
    { text: '三级', label: '三级', value: '三级' },
  ]);
  const checkMarkShow = ref(false);
  const checkMarkList = ref([
    { text: '安全部待检查', label: '安全部待检查', value: '1' },
    { text: '副部长待检查', label: '副部长待检查', value: '2' },
    { text: '安全科待检查', label: '安全科待检查', value: '3' },
    { text: '车间主任待检查', label: '车间主任待检查', value: '4' },
    { text: '班组长待检查', label: '班组长待检查', value: '5' },
    { text: '安全部已检查', label: '安全部已检查', value: '6' },
    { text: '副部长已检查', label: '副部长已检查', value: '7' },
    { text: '安全科已检查', label: '安全科已检查', value: '8' },
    { text: '车间主任已检查', label: '车间主任已检查', value: '9' },
    { text: '班组长已检查', label: '班组长已检查', value: '10' },
    { text: '安全科长已检查', label: '班组长已检查', value: '11' },
    { text: '安全科长待检查', label: '班组长已检查', value: '12' },
  ]);
  // 申请时间
  const dateShow = ref(false);
  const workDateShow = ref(false);
  const personList = ref<any[]>([]);
  const userStore: any = useUserStore();
  const minDate = new Date(2020, 0, 1);
  const maxDate = new Date();

  const isUnhazardousWork = computed(() => {
    return route.name === 'AppUnhazardousWorkManage';
  });

  watch(
    () => router,
    (n) => {
      active.value = activeIdx.value + '';
    },
    { immediate: true, deep: true }
  );

  const list = ref<any[]>([]);
  const list2 = ref<any[]>([]);
  const list3 = ref<any[]>([]);
  const list7 = ref<any[]>([]);
  const list4 = ref<any[]>([]);
  const list5 = ref<any[]>([]);
  const loading = ref(true);
  const pageNo = ref(1);
  const pageSize = ref(10);

  const applicantUnit = ref<any[]>([]);
  const applicationUnitRoot = computed(() => {
    if (applicantUnit.value.length !== 1) return undefined;
    const root = applicantUnit.value[0];
    return root?.title === '敬业集团' && Array.isArray(root.children) ? root : undefined;
  });
  // 申请单位筛选从集团下一级开始展示，生产/作业单位仍使用完整机构树。
  const applicationUnitOptions = computed(() => applicationUnitRoot.value?.children || applicantUnit.value);

  const removeApplicationUnitRoot = (values?: Array<string>) => {
    const rootKey = applicationUnitRoot.value?.key;
    return rootKey ? values?.filter((value) => value !== rootKey) : values;
  };
  const queryParams = reactive<{
    state?: string;
    stateText?: string;
    workType?: string;
    workTypeText?: string;
    applicationUnit?: Array<string>;
    applicationUnitText?: string;
    workApplyCode?: string;
    applicant?: string;
    startTime?: string;
    endTime?: string;
    date?: string | undefined;
    type: number;
    workGrade?: string;
    workContent?: string;
    checkMark?: string;
    code?: string;
    workDate?: string;
    workEndTime?: string;
    workStartTime?: string;
    checkMarkText?: string;
    workUnit?: string;
    workOrgCode?: string;
  }>({
    state: active.value,
    date: undefined,
    workGrade: '',
    workContent: '',
    checkMark: '',
    type: 1,
  });

  onBeforeRouteLeave((to, from, next) => {
    if (['Approvedetail', 'WorkDetail', 'AppUnhazardousWorkDetail', 'AppUnhazardousWorkApprovedetail'].includes(to.name as string)) {
      sessionStorage.setItem('queryParams', JSON.stringify(queryParams));
    } else {
      sessionStorage.removeItem('queryParams');
    }
    next();
  });

  const work_typeList = userStore.getAllDictItems.work_type;

  // 延迟记录
  const delayInfo = reactive({});

  const customFieldName = {
    text: 'departName',
    value: 'orgCode',
  };

  let dialogShow = ref(false);
  let delayDialogShow = ref(false);
  let delayFinishDialogShow = ref(false);
  let finishWorkShow = ref(false);
  let workStopShow = ref(false);
  let ecsDialogShow = ref(false);
  console.log(work_typeList);

  getEduOrgList({level: 4}).then(async (res) => {
    applicantUnit.value = res;
    const orgCode = await defaultCompany();
    queryParams.applicationUnit = removeApplicationUnitRoot(orgCode);
    getUser();
    pageInit();
  });
  const applicationUnitChange = () => {
    getUser();
  };

  // 包厂人员默认选中
  async function defaultCompany() {
    const res = await contractorList();
    let code:string[] = [];
    res.map((item) => {
      if (item.user && item.user.includes(userStore.getUserInfo.id)) {
        code.push(item.orgCode);
      }
    });
    if(userStore.getUserInfo.isSecuritySector == 1) {
      if(userStore.getUserInfo.orgCode.startsWith('A04B01C11')) {
        code.push('A04')
      } else {
        code.push(userStore.getUserInfo.orgCode.substr(0, 9))
      }
    } else {
      code.push(userStore.getUserInfo.orgCode)
    }
    return code;
  }

  async function getUser() {
    queryParams.applicantText = '';
    queryParams.applicant = '';
    const applicationUnit = Array.isArray(queryParams.applicationUnit) ? queryParams.applicationUnit.join(',') : queryParams.applicationUnit;
    let res = await userListByOrg({ orgCode: applicationUnit, pageSize: 100000 });
    res.records.map((item) => {
      item.title = item.realname + '-' + item.workNo;
      if (item.orgSx) {
        item.title = item.title + '-' + item.orgSx;
      }
    });
    personList.value = res.records;
  }

  const listRef1 = ref();
  const total1 = ref(0);

  const listRef2 = ref();
  const total2 = ref(0);

  const listRef3 = ref();
  const total3 = ref(0);

  const listRef4 = ref();
  const total4 = ref(0);

  const listRef5 = ref();
  const total5 = ref(0);

  const listRef7 = ref();
  const total7 = ref(0);

  const onRefresh = async (params) => {
    loading.value = true;
    let data = { ...params, ...queryParams };
    if (data.workType?.length > 0) {
      data.workType = queryParams.workType.join(',');
    }
    if (data.applicationUnit?.length > 0) {
      data.applicationUnit = queryParams.applicationUnit.join(',');
    }
    const res = await getList(data);
    loading.value = false;
    if (active.value == '1') {
      list.value = res.records;
      total1.value = res.total;
      nextTick(() => {
        listRef1.value.refreshEnd();
      });
    } else if (active.value == '2') {
      list2.value = res.records;
      total2.value = res.total;
      nextTick(() => {
        listRef2.value.refreshEnd();
      });
    } else if (active.value == '3') {
      list3.value = res.records;
      total3.value = res.total;
      nextTick(() => {
        listRef3.value.refreshEnd();
      });
    } else if (active.value == '4') {
      list4.value = res.records;
      total4.value = res.total;
      nextTick(() => {
        listRef4.value.refreshEnd();
      });
    } else if (active.value == '5') {
      list5.value = res.records;
      total5.value = res.total;
      nextTick(() => {
        listRef5.value.refreshEnd();
      });
    } else if (active.value == '7') {
      list7.value = res.records;
      total7.value = res.total;
      nextTick(() => {
        listRef7.value.refreshEnd();
      });
    }
  };

  const onLoad = async (params) => {
    loading.value = true;
    let data = { ...params, ...queryParams };
    if (data.workType?.length > 0) {
      data.workType = queryParams.workType.join(',');
    }
    if (data.applicationUnit?.length > 0) {
      data.applicationUnit = queryParams.applicationUnit.join(',');
    }
    const res = await getList(data);
    loading.value = false;
    if (active.value == '1') {
      list.value = [...list.value, ...res.records];
      total1.value = res.total;
      nextTick(() => {
        listRef1.value.loadEnd();
      });
    } else if (active.value == '2') {
      list2.value = [...list2.value, ...res.records];
      total2.value = res.total;
      nextTick(() => {
        listRef2.value.loadEnd();
      });
    } else if (active.value == '3') {
      list3.value = [...list3.value, ...res.records];
      total3.value = res.total;
      nextTick(() => {
        listRef3.value.loadEnd();
      });
    } else if (active.value == '4') {
      list4.value = [...list4.value, ...res.records];
      total4.value = res.total;
      nextTick(() => {
        listRef4.value.loadEnd();
      });
    } else if (active.value == '5') {
      list5.value = [...list5.value, ...res.records];
      total5.value = res.total;
      nextTick(() => {
        listRef5.value.loadEnd();
      });
    } else if (active.value == '7') {
      list7.value = [...list7.value, ...res.records];
      total7.value = res.total;
      nextTick(() => {
        listRef7.value.loadEnd();
      });
    }
  };

  const tabChange = (e) => {
    if(queryParams.code) delete queryParams.code;
    queryParams.state = e;
    if (e == '1' && list.value.length == 0) {
      loading.value = true;
      onRefresh({});
    }
    if (e == '2' && list2.value.length == 0) {
      loading.value = true;
      onRefresh({});
    }
    if (e == '3' && list3.value.length == 0) {
      loading.value = true;
      onRefresh({});
    }
    if (e == '4' && list4.value.length == 0) {
      loading.value = true;
      onRefresh({});
    }
    if (e == '5' && list5.value.length == 0) {
      loading.value = true;
      onRefresh({});
    }
    if (e == '7' && list7.value.length == 0) {
      loading.value = true;
      onRefresh({});
    }
  };

  function pageInit() {
    if (route.query.active) {
      active.value = route.query.active as string;
      queryParams.state = active.value;
      queryParams.code = route.query.workApplyCode as string;
    }
    let obj = sessionStorage.getItem('queryParams');
    if (obj) {
      Object.assign(queryParams, JSON.parse(obj));
      queryParams.applicationUnit = removeApplicationUnitRoot(queryParams.applicationUnit);
      sessionStorage.removeItem('queryParams');
    }
    // 首次加载列表
    onLoad({});
  }

  function getList(params?) {
    if(params.applicationUnit && Array.isArray(params.applicationUnit)) {
      params.applicationUnit = params.applicationUnit.join(',')
    }
    if (!params.applicationUnit && applicantUnit.value && applicantUnit.value.length) {
      params.applicationUnit = applicantUnit.value[0].key;
    }
    if(params.workUnit && params.workUnit.length > 0) {
      params.workUnit = params.workUnit.join(',')
    } else {
      delete params.workUnit;
    }
    return getWorkManageList({
      state: active.value,
      pageNo: pageNo.value,
      pageSize: pageSize.value,
      ...params,
      type: isUnhazardousWork.value ? 2 : 1,
    });
  }

  // 去审批按钮跳转
  const edit = (item) => {
    console.log(item);
    let url = `/app/dangerousWork/approvedetail`;
    if (isUnhazardousWork.value) {
      url = `/app/unhazardousWork/approvedetail`;
    }
    let query = { id: item.id, workType: item.workType, pageType: 'edit', exam: true };
    router.push({ path: url, query: query });
  };

  // 卡片跳转
  const openDetail = (item) => {
    console.log(item);
    let url = `/app/dangerousWork/detail`;
    if (isUnhazardousWork.value) {
      url = `/app/unhazardousWork/detail`;
    }
    appStore.setActiveIdx(active.value);
    router.push({ path: url, query: { id: item.id, workType: item.workType, pageType: 'detail', delayedMark: item.delayedMark ? '1' : '0' } });
  };

  const curItem = ref<any | undefined>();
  // 添加分析
  const needSign = ref(false);
  const curWorkType = ref('');
  const addAnaly = (item, needSigns, workType, workStatus=8) => {
    dialogShow.value = true;
    curItem.value = JSON.parse(JSON.stringify(item));
    curItem.value.workType = workType;
    curItem.value.myType = '气体分析';
    curItem.value.workStatus = workStatus;
    needSign.value = needSigns;
    curWorkType.value = workType;
  };
  const analyData = ref<any>({});
  const analySubmit = (data) => {
    dialogShow.value = false;
    if (needSign.value) {
      analyData.value = data;
      signShow.value = true;
      return;
    }
    getAddAnalysis(data).then((res) => {
      onRefresh({});
      console.log(res);
    });
  };

  // 安全检查确认
  const detailInfo = ref<any>({});
  const safetyCheck = async (item) => {
    curItem.value = item;
    delayDialogShow.value = true;
    const detail = await getWorkExamineInfo({ id: item.id });
    detailInfo.value = detail;
  };

  const cancelSafetySubmit = () => {
    delayDialogShow.value = false;
  };
  const safetySubmitRef = ref(null);
  const safetySubmitData = ref<any>({});
  const confirmSafetySubmit = async () => {
    safetySubmitData.value = await safetySubmitRef.value?.getData();
    signShow.value = true;
    delayDialogShow.value = false;
  };

  // 安全作业检查
  const safetyWorkCheckShow = ref(false);
  const safetyWorkCheckClick = (item) => {
    curItem.value = item;
    safetyWorkCheckShow.value = true;
  };
  const safetyWorkCheckSubmit = async (data) => {
    onRefresh({});
  };
  // 去整改
  const checkWorkShow = ref(false);
  const reformClick = (item, type) => {
    curItem.value = item;
    curItem.value.reformType = type;
    checkWorkShow.value = true;
  };

  const confirmLoading = ref(false);
  const beforeClose = (c) => {
    if (c == 'cancel') {
      signShow.value = false;
      return Promise.resolve(false);
    }
    return new Promise(async (resolve, reject) => {
      if (!signature.value) {
        showFailToast('请签名！');
        resolve(false);
      } else {
        if (curItem.value?.myType == '气体分析') {
          analyData.value.forEach(item => item.sign = signature.value)
          getAddAnalysis(analyData.value)
            .then((res) => {
              showSuccessToast('添加成功！');
              onRefresh({});
              resolve(true);
            })
            .finally(() => {
              needSign.value = false;
              confirmLoading.value = false;
            });
        }
        if (curItem.value?.checkMark == '待安全检查') {
          securityConfirmation({
            ...safetySubmitData.value,
            sign: signature.value,
          })
            .then((res) => {
              showSuccessToast('添加成功！');
              onRefresh({});
              resolve(true);
            })
            .finally(() => {
              needSign.value = false;
              confirmLoading.value = false;
            });
        }
      }
    });
  };

  // 开始作业
  const startWork = (item) => {
    const allowStart = dayjs(new Date()).isAfter(item.workStartTime) && dayjs(new Date()).isBefore(item.workEndTime);
    if (!allowStart) {
      showFailToast('当前时间未在作业时间内');
      return;
    }
    ecsDialogShow.value = true;
    curItem.value = item;
  };

  // 导出
  const exportLoading = ref(false);
  const derive = async (id: string, index: number) => {
    uni.getEnv(async (res) => {
      if (res.h5) {
        list5.value[index].exportLoading = true;
        const res = await getDerive({ id }).catch((err) => {
          exportLoading.value = false;
        });
        list5.value[index].exportLoading = false;
        let fileSuffix = '.docx';
        let url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/octet-stream' }));
        let link = document.createElement('a');
        link.style.display = 'none';
        link.href = url;
        link.setAttribute('download', `作业票-${dayjs(new Date()).format('YYYY-MM-DD')}${fileSuffix}`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
        list5.value[index].exportLoading = true;
        setTimeout(() => {
          list5.value[index].exportLoading = false;
        }, 3000);
        uni.webView.postMessage({
          data: {
            action: 'download',
            params: {
              url: `${location.origin}${globSetting.apiUrl}/workManage/exportWork?id=${id}`,
              name: `作业票-${dayjs(new Date()).format('YYYY-MM-DD')}.docx`,
              tk: getToken(),
            },
          },
        });
      }
    });
  };
  // 结束作业
  const finishWorkFn = (item) => {
    showConfirmDialog({
      title: '结束作业',
      message: '是否确认结束作业！',
    }).then((res) => {
      finishWork({ workApplyId: item.id, workExamineId: item.workExamineId }).then((res) => {
        showSuccessToast('操作成功！');
        onRefresh({});
      });
    });
  };
  // 继续作业
  const continueWorkClick = (item) => {
    const allowStart = dayjs(new Date()).isBefore(item.workEndTime);
    if (!allowStart) {
      showFailToast('当前作业已过作业时间，不允许继续作业!');
      return;
    }
    showConfirmDialog({
      title: '继续',
      message: '是否确认继续作业！',
    }).then((res) => {
      getContinueWork({ workApplyId: item.id }).then((res) => {
        showSuccessToast('操作成功！');
        onRefresh({});
      });
    });
  };

  // 完结验收
  const finishWorkClick = (item) => {
    finishWorkShow.value = true;
    curItem.value = item;
  };
  const finishSubmit = (data) => {
    console.log(data);
    if (data.stag == 1) {
      getCompleteAcceptance({ workExamineId: curItem.value?.workExamineId, ...data, workApplyId: curItem.value?.id }).then((res) => {
        showSuccessToast('操作成功！');
        onRefresh({});
      });
    } else {
      AcceptanceBack(data);
    }
  };
  // 验收退回
  const AcceptanceBack = async (data) => {
    confirmLoading.value = true;
    await finishBack({ reason: data.reviewComments, id: curItem.value?.id });
    onRefresh({});
  };

  // 作业中断
  const workStop = (item) => {
    workStopShow.value = true;
    curItem.value = item;
  };
  const workStopSubmit = (data) => {
    getInterruptWork({ workExamineId: curItem.value?.workExamineId, ...data, workApplyId: curItem.value?.id }).then((res) => {
      showSuccessToast('操作成功！');
      onRefresh({});
    });
  };

  // 开始作业
  const ecsSubmit = () => {
    postStartWork({ workApplyId: curItem.value?.id, workExamineId: curItem.value?.workExamineId }).then((res) => {
      showSuccessToast('操作成功！');
      onRefresh({});
    });
  };

  const searchClick = () => {
    searchShow.value = false;
    loading.value = true;

    onRefresh(queryParams);
  };

  function reset() {
    queryParams.state = active.value;
    queryParams.workType = [];
    queryParams.workTypeText = '';
    queryParams.workApplyCode = '';
    queryParams.applicant = '';
    queryParams.applicantText = '';
    queryParams.workUnit = [];
    if(applicantUnit.value.length == 1 && applicantUnit.value[0].children){
      queryParams.applicationUnit = undefined;
      queryParams.applicationUnitText = '';
    }
    queryParams.startTime = '';
    queryParams.endTime = '';
    queryParams.date = '';
    queryParams.workDate = '';
    queryParams.workEndTime = '';
    queryParams.workStartTime = '';
    queryParams.workGrade = '';
    queryParams.workContent = '';
    queryParams.checkMark = '';
    queryParams.checkMarkText = '';
    personList.value = [];
  }

  // 下拉框确认
  const onConfirm = (value, showType) => {
    console.log(value);
    switch (showType) {
      case 'state':
        queryParams.stateText = '';
        if (queryParams.state?.length) {
          stateOptions.map((val) => {
            if (queryParams.state.includes(val.value)) {
              queryParams.stateText += val.text + '，';
            }
          });
          queryParams.stateText = queryParams.stateText.substr(0, queryParams.stateText.length - 1);
        }
        showPicker.value = false;
        break;
      case 'workType':
        queryParams.workTypeText = '';
        if (queryParams.workType?.length) {
          work_typeList.map((val) => {
            if (queryParams.workType.includes(val.value)) {
              queryParams.workTypeText += val.text + '，';
            }
          });
          queryParams.workTypeText = queryParams.workTypeText.substr(0, queryParams.workTypeText.length - 1);
        }
        showPicker1.value = false;
        break;
      case 'applicant':
        queryParams.applicantText = value.title;
        queryParams.applicant = value.id;
        applicantShow.value = false;
        break;
      case 'date':
        let start = dayjs(value[0]).format('YYYY-MM-DD');
        let end = dayjs(value[1]).format('YYYY-MM-DD');
        queryParams.date = start + '~' + end;
        queryParams.startTime = start + ' 00:00:00';
        queryParams.endTime = end + ' 23:59:59';
        dateShow.value = false;
        break;
      case 'workDate':
        let s = dayjs(value[0]).format('YYYY-MM-DD');
        let e = dayjs(value[1]).format('YYYY-MM-DD');
        queryParams.workDate = s + '~' + e;
        queryParams.workStartTime = s + ' 00:00:00';
        queryParams.workEndTime = e + ' 23:59:59';
        workDateShow.value = false;
        break;
      case 'workGrade':
        queryParams.workGrade = value.names;
        break;
      case 'checkMark':
        queryParams.checkMarkText = value.text;
        queryParams.checkMark = value.value;
        break;
    }
  };
  // 删除
  const del = async (id: string) => {
    showConfirmDialog({
      title: '删除',
      message: '是否确认删除？',
    }).then(() => {
      deleteManage({ id: id }).then((res) => {
        console.log(res);
        onRefresh({});
      });
    });
  };

  const cancel2 = () => {
    showPicker1.value = false;
  };
  // 进出空间
  const isIn = ref(false);
  const inOutShow = ref(false);
  const inOutClick = async (item, tag) => {
    let res = await userGetData({ workApplyId: item.id });
    if (!tag && !res) {
      showToast('您还没有进空间记录！');
      return;
    }
    if (tag && res) {
      showToast('您已有进空间记录！');
      return;
    }
    curItem.value = item;
    isIn.value = tag;
    inOutShow.value = true;
  };
  const checkInOutShow = ref(false);
  const checkInOutClick = async (item) => {
    curItem.value = item;
    checkInOutShow.value = true;
  };
  const successSubmit = () => {
    onRefresh({});
  };
  // 操作步骤
  const operateShow = ref(false);
  const operateClick = async (item, type) => {
    item.myType = type;
    curItem.value = item;
    operateShow.value = true;
  };
  // 添加人员
  const addPersonForm = ref<any>({
    workUnitGuardian: '',
    workUnit: '',
    workUsers: [],
  });
  const changePersonShow = ref(false);
  const changePersonClick = (item) => {
    curItem.value = item;
    let names = item.workTypeName.split('、');
    let values = item.workType.split(',');
    addPersonForm.value.workUsers = values.map((v, i) => ({ name: `${names[i]}-作业人员:`, workType: v, userId: '' }));
    changePersonShow.value = true;
  };

  const changePersonShowHandleOk = async () => {
    let workUsers = addPersonForm.value.workUsers.filter((item) => item.userId);
    if (!addPersonForm.value.workUnitGuardian && workUsers.length === 0) return showFailToast('请选择监护人或作业人员！');
    confirmLoading.value = true;
    if (addPersonForm.value.workUnitGuardian) {
      await updateGuardian({
        workApplyId: curItem.value.id,
        userId: addPersonForm.value.workUnitGuardian,
      })
        .then((res) => {
          addPersonForm.value.workUnitGuardian = '';
          changePersonShow.value = false;
          confirmLoading.value = false;
          showSuccessToast('添加成功！');
        })
        .catch((e) => {
          confirmLoading.value = false;
        });
    }
    if (workUsers.length) {
      await addWorkUser({
        workApplyId: curItem.value.id,
        workUsers: workUsers,
      })
        .then((res) => {
          addPersonForm.value.workUsers = [];
          changePersonShow.value = false;
          confirmLoading.value = false;
          showSuccessToast('添加成功！');
        })
        .catch((e) => {
          confirmLoading.value = false;
        });
    }
  };

  const changePersonShowHandleCancel = () => {
    addPersonForm.value.workUnitGuardian = '';
    changePersonShow.value = false;
  };

  // 已验收展示 安全作业检查
  const showSafetyWorkCheck = (item) => {
    const now = dayjs(new Date()).format('YYYY-MM-DD');
    return item.workFinishTime.startsWith(now);
  }
</script>
<style lang="less">
  .my-tree{
    svg{
        font-size: 18px !important;
      }
  }
</style>
<style lang="less" scoped>
  .hiddendanger {
    width: 100%;
    height: 100%;
    background-color: #eff1f5;
    display: flex;
    flex-direction: column;

    .tab-inner {
      height: calc(100vh - 55px);
      overflow-y: scroll;
      background: #eff1f5;
      padding: 10px 15px;
    }

    .hd {
      width: 100%;
      height: 55px;
      padding: 0 15px;
      display: flex;
      align-items: center;
      justify-content: space-around;
      // background-color: #ffffff;

      .add {
        width: 28px;
        height: 28px;
        transform: translateY(-2px);
      }

      .right {
        width: 70px;
        display: flex;
        align-items: center;
        justify-content: flex-end;

        .search-btn {
          color: #1989fa;
        }
      }

      .filter-btn {
        margin-left: 10px;

        img {
          width: 25px;
          height: 25px;
        }
      }

      .van-cell {
        padding: 3px !important;
      }
    }
  }

  .foot {
    height: 55px;
    display: flex;
    text-align: center;
    align-items: center;
    justify-content: space-around;
  }

  .poup-hd {
    display: flex;
    justify-content: space-between;
    height: 54px;
    line-height: 54px;
    align-items: center;
    padding: 0 6px;

    .van-search {
      flex: 1;
    }
  }

  :deep(.van-field--disabled .van-field__label) {
    color: #323233;
  }

  .footer {
    background-color: #ffffff;
    position: fixed;
    bottom: 0;
    width: 100%;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: space-around;
  }

  .del-icon {
    height: 20px;
    width: 20px;
  }
  .search-box{
    height: 100%;
    overflow-y: auto;
    padding-bottom: 45px;
    position: relative;
    .foot{
      width: 100%;
      height: 44px;
      background-color: #ffffff;
      border-top: 1px solid #eee;
      position: fixed;
      bottom: 0;
      display: flex;
      align-items: center;
      justify-content: space-around;
    }
  }
  :deep(.ant-select-tree-node-icon) {
  font-size: 66px !important; /* 调整图标大小（默认14px） */
  width: 66px !important;
  height: 66px !important;
  line-height: 66px !important;
}
</style>
