<template>
  <div class="execute-task">
    <!-- 顶部搜索按钮 -->
    <div class="search-header">
      <van-button type="primary" size="small" @click="searchPopup = true" class="search-btn"> 搜索 </van-button>
    </div>

    <div v-if="itemList.length > 0">
      <van-tabs v-model:active="active" @change="tabChange">
        <van-tab
          v-for="(item, idx) in itemList || []"
          :key="'tab' + idx"
          :title-class="[
            { on_pass: (item.checkResult == '1' || item.checkResult == '3') && item.saveFlag == '1' },
            { off_pass: item.checkResult == '2' && item.saveFlag == '1' },
          ]"
          :title="idx + 1 + ''"
          :name="idx"
        >
          <div class="tab-inner">
            <div class="projectinfo">
              <div><label>所属车间：</label>{{ item.departName }}</div>
              <div><label>辨识单元：</label>{{ item.recogUnit }}</div>
              <div><label>风险部位：</label>{{ item.riskName }}</div>
              <div><label>风险失控表现：</label>{{ item.riskFactor }}</div>
            </div>
          </div>
        </van-tab>
      </van-tabs>
      <van-form ref="formRef" class="myform" label-width="80px">
        <van-field required name="checkResult" label="检查结果" :rules="[{ required: true, message: '请选择检查方式' }]">
          <template #input>
            <van-radio-group :disabled="formData.saveFlag == 1" v-model="formData.checkResult" direction="horizontal" @change="checkResultChange">
              <van-radio name="1">合格</van-radio>
              <van-radio name="2">不合格</van-radio>
              <van-radio v-if="itemList[active] && itemList[active].isWork && itemList[active].isWork == '1'" name="3">不涉及</van-radio>
            </van-radio-group>
          </template>
        </van-field>
        <div v-if="formData.checkResult == '1'">
          <van-field v-model="formData.checkPicture" required name="checkPicture" label="检查照片" :rules="[{ required: true, message: '请上传检查照片！！' }]">
            <template #input>
              <!-- <RealCameraUpload :maxCount="10" :disabled="formData.saveFlag == 1" v-model:value="formData.checkPicture" /> -->
              <AppUpload :disabled="formData.saveFlag == 1" :watermarkText="watermarkText" v-model:fileList="formData.checkPicture" />
            </template>
          </van-field>
        </div>
        <div v-if="formData.checkResult == '2'">
          <van-field
            required
            v-model="formData.yhDescription"
            name="yhDescription"
            label="隐患描述"
            type="textarea"
            placeholder="请输入隐患描述"
            show-word-limit
            maxlength="200"
            rows="4"
            :rules="[{ required: true, message: '请输入隐患描述！' }]"
          />
          <van-field v-model="formData.checkPicture" required name="checkPicture" label="检查照片" :rules="[{ required: true, message: '请上传检查照片！！' }]">
            <template #input>
              <!-- <RealCameraUpload :maxCount="10" :disabled="formData.saveFlag == 1" v-model:value="formData.checkPicture" /> -->
              <AppUpload :disabled="formData.saveFlag == 1" :watermarkText="watermarkText" v-model:fileList="formData.checkPicture" />
            </template>
          </van-field>
          <van-field
            :required="!ifPost"
            v-model="formData.yhLevelLabel"
            is-link
            readonly
            name="yhLevelLabel"
            label="隐患等级"
            placeholder="请选择隐患等级"
            @click="showYhLevel = true"
            :rules="[{ required: !ifPost, message: '请选择隐患等级' }]"
          />
          <van-popup v-model:show="showYhLevel" position="bottom">
            <van-picker :columns="yh_hidden_levelList" @confirm="onConfirm($event, 'showYhLevel', 'yhLevel')" @cancel="showYhLevel = false" />
          </van-popup>
          <van-field
            v-if="ifPost && formData.saveFlag !== '1'"
            v-model="formData.teamLeaderName"
            required
            name="teamLeaderName"
            label="班组长"
            placeholder="请选择"
            :rules="[{ required: true, message: '请选择班组长' }]"
          >
            <template #input>
              <JUserModal :userStyle="{ width: '100%' }" v-model:value="formData.teamLeader" type="radio" @confirm="confirmTeamPerson" />
            </template>
          </van-field>
            <van-field
            v-if="formData.postFlag == '1' && formData.saveFlag !== '1'"
            v-model="formData.teamLeaderName"
            required
            name="teamLeaderName"
            label="班组长"
            placeholder="请选择"
            :rules="[{ required: true, message: '请选择班组长' }]"
          >
            <template #input>
              <JUserModal :userStyle="{ width: '100%' }" v-model:value="formData.teamLeader" type="radio" @confirm="confirmTeamPerson" :disabled="formData.saveFlag == 1" />
            </template>
          </van-field>
          <div v-if="!ifPost && formData.saveFlag !== '1'">
            <!-- 非岗位工：隐患类别 -->
            <van-field
              required
              v-model="formData.yhTypeLabel"
              is-link
              readonly
              name="yhTypeLabel"
              label="隐患类别"
              placeholder="请选择"
              @click="showyhType = true"
              :rules="[{ required: true, message: '请选择隐患类别' }]"
            />
            <van-popup v-model:show="showyhType" position="bottom">
              <van-picker :columns="sk_yh_type" @confirm="onConfirm($event, 'showyhType', 'yhType')" @cancel="showyhType = false" />
            </van-popup>

            <!-- 非岗位工：隐患子类别 -->
            <van-field
              required
              v-model="formData.yhTypeSubLabel"
              is-link
              readonly
              name="yhTypeSubLabel"
              label="隐患子类别"
              placeholder="请选择"
              @click="showyhTypeSub = true"
              :rules="[{ required: true, message: '请选择隐患子类别' }]"
            />
            <van-popup v-model:show="showyhTypeSub" position="bottom">
              <van-picker :columns="sk_yh_type_sub" @confirm="onConfirm($event, 'showyhTypeSub', 'yhTypeSub')" @cancel="showyhTypeSub = false" />
            </van-popup>

            <!-- 非岗位工：完成时限 -->
            <van-field
              v-model="formData.repairTimeLimit"
              is-link
              required
              name="repairTimeLimit"
              label="完成时限"
              placeholder="点击选择"
              @click="showCalendar1 = true"
              :rules="[{ required: true, message: '请选择完成时限' }]"
            >
              <template #input>
                <div style="width: 100%; display: flex; justify-content: space-between; align-items: center">
                  <span v-if="formData.repairTimeLimit">{{ formData.repairTimeLimit }}</span>
                  <span v-else style="color: #c8c9cc">请选择</span>
                  <van-icon
                    style="padding-right: 10px; opacity: 0.4"
                    v-if="formData.repairTimeLimit"
                    @click.stop="formData.repairTimeLimit = ''"
                    name="cross"
                  />
                </div>
              </template>
            </van-field>

            <van-calendar :min-date="minDate" v-model:show="showCalendar1" @confirm="endDtConfirm($event, 'repairTimeLimit')" />

            <!-- 非岗位工：整改责任人 -->
            <van-field
              required
              name="repairPersonName"
              v-model="formData.repairPersonName"
              label="整改责任人"
              placeholder="请选择"
              :rules="[{ required: true, message: '请选择整改责任人' }]"
            >
              <template #input>
                <JUserModal :userStyle="{ width: '100%' }" v-model:value="formData.repairPerson" type="radio" @confirm="confirmPerson" />
              </template>
            </van-field>

            <!-- 非岗位工：车间主任（仅重大隐患时显示） -->
            <van-field
              v-if="formData.yhLevel == '2'"
              required
              v-model="formData.workshopDirectorName"
              name="workshopDirectorName"
              label="车间主任"
              placeholder="请选择"
              :rules="[{ required: true, message: '请选择车间主任' }]"
            >
              <template #input>
                <JUserModal
                  :userStyle="{ width: '100%' }"
                  v-model:value="formData.workshopDirector"
                  type="radio"
                  @confirm="confirmWorkshopDirector"
                />
              </template>
            </van-field>
          </div>
          <div v-if="formData.postFlag == '2' && formData.saveFlag == '1'">
            <!-- 非岗位工：隐患类别 -->
            <van-field
              required
              v-model="formData.yhTypeLabel"
              is-link
              readonly
              name="yhTypeLabel"
              label="隐患类别"
              placeholder="请选择"
              @click="showyhType = true"
              :rules="[{ required: true, message: '请选择隐患类别' }]"
            />
            <van-popup v-model:show="showyhType" position="bottom">
              <van-picker :columns="sk_yh_type" @confirm="onConfirm($event, 'showyhType', 'yhType')" @cancel="showyhType = false" />
            </van-popup>

            <!-- 非岗位工：隐患子类别 -->
            <van-field
              required
              v-model="formData.yhTypeSubLabel"
              is-link
              readonly
              name="yhTypeSubLabel"
              label="隐患子类别"
              placeholder="请选择"
              @click="showyhTypeSub = true"
              :rules="[{ required: true, message: '请选择隐患子类别' }]"
            />
            <van-popup v-model:show="showyhTypeSub" position="bottom">
              <van-picker :columns="sk_yh_type_sub" @confirm="onConfirm($event, 'showyhTypeSub', 'yhTypeSub')" @cancel="showyhTypeSub = false" />
            </van-popup>

            <!-- 非岗位工：完成时限 -->
            <van-field
              v-model="formData.repairTimeLimit"
              is-link
              required
              name="repairTimeLimit"
              label="完成时限"
              placeholder="点击选择"
              @click="showCalendar1 = true"
              :rules="[{ required: true, message: '请选择完成时限' }]"
            >
              <template #input>
                <div style="width: 100%; display: flex; justify-content: space-between; align-items: center">
                  <span v-if="formData.repairTimeLimit">{{ formData.repairTimeLimit }}</span>
                  <span v-else style="color: #c8c9cc">请选择</span>
                  <van-icon
                    style="padding-right: 10px; opacity: 0.4"
                    v-if="formData.repairTimeLimit"
                    @click.stop="formData.repairTimeLimit = ''"
                    name="cross"
                  />
                </div>
              </template>
            </van-field>

            <van-calendar :min-date="minDate" v-model:show="showCalendar1" @confirm="endDtConfirm($event, 'repairTimeLimit')" />

            <!-- 非岗位工：整改责任人 -->
            <van-field
              required
              name="repairPersonName"
              v-model="formData.repairPersonName"
              label="整改责任人"
              placeholder="请选择"
              :rules="[{ required: true, message: '请选择整改责任人' }]"
            >
              <template #input>
                <JUserModal :userStyle="{ width: '100%' }" v-model:value="formData.repairPerson" type="radio" @confirm="confirmPerson" />
              </template>
            </van-field>

            <!-- 非岗位工：车间主任（仅重大隐患时显示） -->
            <van-field
              v-if="formData.yhLevel == '2'"
              required
              v-model="formData.workshopDirectorName"
              name="workshopDirectorName"
              label="车间主任"
              placeholder="请选择"
              :rules="[{ required: true, message: '请选择车间主任' }]"
            >
              <template #input>
                <JUserModal
                  :userStyle="{ width: '100%' }"
                  v-model:value="formData.workshopDirector"
                  type="radio"
                  @confirm="confirmWorkshopDirector"
                />
              </template>
            </van-field>
          </div>
        </div>
      </van-form>
      <div class="foot" v-if="status != 1">
        <van-button native-type="submit" :disabled="formData.saveFlag == 1" :loading="saveLoading" @click="saveFn" type="primary">保存</van-button>
        <van-button native-type="submit" v-if="active == (itemList?.length || 0) - 1" :loading="submiting" @click="submitFn" type="primary"
          >提交</van-button
        >
        <!-- <van-button :loading="allSubmiting" @click="allSubmitFn" type="primary">全部合格</van-button> -->
      </div>
    </div>
    <div v-else>
      <van-empty description="暂无数据" />
    </div>

    <!-- 搜索弹框 -->
    <van-popup v-model:show="searchPopup" title="搜索筛选" position="right" :style="{ height: '100%', width: '68%' }">
      <div class="search-box">
        <div class="hd">
          <span>筛选</span>
          <van-icon @click="searchPopup = false" name="cross" />
        </div>

        <!-- 车间选择 -->
        <van-field v-model="searchForm.departLabel" is-link readonly label="车间" placeholder="请选择车间" @click="showWorkshopPicker = true" />

        <!-- 辨识单元选择 -->
        <van-field
          v-model="searchForm.recogUnitLabel"
          is-link
          readonly
          label="辨识单元"
          placeholder="请选择辨识单元"
          @click="showRecogUnitPicker = true"
        />

        <!-- 风险部位选择 -->
        <van-field
          v-model="searchForm.riskNameLabel"
          is-link
          readonly
          label="风险部位"
          placeholder="请选择风险部位"
          @click="showRiskNamePicker = true"
        />
        <div class="btns">
          <p>风险类别</p>
          <div class="btn-wrap">
            <van-button
              @click="riskClick(item.value)"
              v-for="item in riskList"
              :key="item.value"
              size="small"
              round
              :type="searchForm.riskType === String(item.value) ? 'primary' : 'default'"
            >
              {{ item.text }}</van-button
            >
          </div>
        </div>
        <div class="btns">
          <p>检查结果</p>
          <div class="btn-wrap">
            <van-button
              @click="resultClick(item.value)"
              v-for="item in resultList"
              :key="item.value"
              size="small"
              round
              :type="searchForm.checkResult == item.value ? 'primary' : 'default'"
            >
              {{ item.text }}</van-button
            >
          </div>
        </div>
        <div class="foot">
          <van-button size="small" style="margin-right: 30px" @click="resetSearch">重置</van-button>
          <van-button size="small" @click="searchClick" type="primary">搜索</van-button>
        </div>
      </div>
    </van-popup>

    <!-- 车间选择器 -->
    <van-popup v-model:show="showWorkshopPicker" position="bottom">
      <van-picker :columns="workshopList" @confirm="onWorkshopConfirm" @cancel="showWorkshopPicker = false" />
    </van-popup>

    <!-- 辨识单元选择器 -->
    <van-popup v-model:show="showRecogUnitPicker" position="bottom">
      <van-picker :columns="recogUnitList" @confirm="onRecogUnitConfirm" @cancel="showRecogUnitPicker = false" />
    </van-popup>

    <!-- 风险部位选择器 -->
    <van-popup v-model:show="showRiskNamePicker" position="bottom">
      <van-picker :columns="riskNameList" @confirm="onRiskNameConfirm" @cancel="showRiskNamePicker = false" />
    </van-popup>

    <!-- 检查结果选择器 -->
    <van-popup v-model:show="showCheckResultPicker" position="bottom">
      <van-picker :columns="checkResultList" @confirm="onCheckResultConfirm" @cancel="showCheckResultPicker = false" />
    </van-popup>
  </div>
</template>
<script lang="ts" setup>
  import {
    getYhItemList,
    saveItem,
    submitTaskApp,
    getTeamLeaderList,
    ifPostPerson,
    getUserListByOrgAndRole,
    skYhPlanQueryById,
    getWorkshopList,
    getRecogUnitList,
    getRiskNameList,
  } from '../index.api';
  import { showConfirmDialog, showToast } from 'vant';
  import type { FormInstance } from 'vant';
  // import RealCameraUpload from '/@/components/App/RealCameraUpload.vue';
  import AppUpload from '../../../../components/App/AppUpload.vue';
  import { dateFormat } from '/@/utils/common/compUtils';
  import { useUserStore } from '/@/store/modules/user';
  import { getDictItemsByCode } from '/@/utils/dict';
  import { useRouter, useRoute } from 'vue-router';
  import { reactive, ref, watch, nextTick } from 'vue';
  import TreeSelect from '../../components/treeSelect.vue';
  import { userListByOrg } from '/@/api/common/api';
  import JUserModal from '/@/components/App/JUserModal.vue';
  import { itemFormSchema } from '/@/views/system/dict/dict.data';
  import { get } from 'sortablejs';

  const route = useRoute();
  const router = useRouter();
  const userStore: any = useUserStore();
  const formRef = ref<FormInstance>();
  const active = ref(0);
  const minDate = ref(new Date(dateFormat(new Date(), 'yyyy-MM-dd')));
  const showCalendar1 = ref(false);
  const userShow1 = ref(false);
  const loadingUser = ref(false);
  const itemList = ref<any[]>([]); // 隐患检查项列表
  const status = ref(0); // 任务状态
  const ifPost = ref(false); // true是岗位工 false不是岗位工
  const formData = reactive<{
    id?: string;
    checkResult?: string;
    checkPicture: string;
    saveFlag?: number | string;
    postFlag?: number | string;
    recogUnit?: string;
    riskName?: string;
    riskFactor?: string;
    riskId?: string;
    yhDescription?: string;
    yhLevel?: string;
    yhLevelLabel?: string;
    yhType?: string;
    yhTypeLabel?: string;
    yhTypeSub?: string;
    yhTypeSubLabel?: string;
    repairTimeLimit?: string;
    repairPerson?: string;
    repairPersonName?: string;
    workshopDirector?: string;
    workshopDirectorName?: string;
    teamLeader?: string;
    teamLeaderName?: string;
  }>({
    checkResult: '1',
    checkPicture: '',
    id: route.query.id as string,
    saveFlag: '0',
    recogUnit: '',
    riskName: '',
    riskFactor: '',
    riskId: '',
    yhDescription: '',
    yhLevel: '',
    yhLevelLabel: '',
    yhType: '',
    yhTypeLabel: '',
    yhTypeSub: '',
    yhTypeSubLabel: '',
    repairTimeLimit: '',
    repairPerson: '',
    repairPersonName: '',
    workshopDirector: '',
    workshopDirectorName: '',
    teamLeader: '',
    teamLeaderName: '',
  });
  const userShow = ref(false);
  const userList = ref<any[]>([]);
  const watermarkText = ref(
    `${userStore.getUserInfo.realname} ${userStore.getUserInfo.workNo} ${dateFormat(new Date(), 'yyyy-MM-dd  hh:mm:ss')} 上传`
  );

  const subDisable = ref(true);
  const saveLoading = ref(false);
  const submiting = ref(false);
  const picflag = ref(false);
  const showTeam = ref(false);
  const showYhLevel = ref(false);
  const showyhType = ref(false);
  const showyhTypeSub = ref(false);
  const showriskId = ref(false);

  // 搜索相关状态
  const searchPopup = ref(false);
  const showWorkshopPicker = ref(false);
  const showRecogUnitPicker = ref(false);
  const showRiskNamePicker = ref(false);
  const showCheckResultPicker = ref(false);
  const resultList = ref([
    { text: '合格', value: '1' },
    { text: '不合格', value: '2' },
    { text: '不涉及', value: '3' },
  ]);
  const riskList = ref([
    { text: '设备设施', value: 1 },
    { text: '作业活动', value: 2 },
  ]);
  // 搜索表单数据
  const searchForm = reactive({
    depart: '',
    departLabel: '',
    recogId: '',
    recogUnitLabel: '',
    riskId: '',
    riskNameLabel: '',
    checkResult: '',
    riskType: '',
  });

  // 原始数据备份
  const originalItemList = ref<any[]>([]);
  const yh_hidden_levelList = [
    { text: '一般', value: 1 },
    { text: '重大', value: 2 },
  ];
  const sk_yh_type = userStore.getAllDictItems.sk_yh_type;
  const sk_yh_type_sub = ref<any[]>([]);

  // 搜索选择器数据
  const workshopList = ref<any[]>([]);
  const recogUnitList = ref<any[]>([]);
  const riskNameList = ref<any[]>([]);
  const checkResultList = ref([
    { text: '合格', value: '1' },
    { text: '不合格', value: '2' },
    { text: '不涉及', value: '3' },
  ]);
  const getPostPerson = () => {
    ifPostPerson().then((res) => {
      ifPost.value = res;
    });
  };
  getPostPerson();
  const getStatus = () => {
    skYhPlanQueryById({
      id: route.query.id,
    }).then((res) => {
      status.value = res.status || 0;
    });
  };
  // 获取status
  getStatus();
  const getList = (params) => {
    return getYhItemList({
      id: route.query.id,
      ...params,
    });
  };

  const getDetail = async (skipFormDataUpdate?, params?) => {
    await getList(params).then((res) => {
      itemList.value = res || [];
    });

    // originalItemList.value = [...itemList.value];
    // 给数组增加yhLevelLabel
    itemList.value.forEach((item) => {
      item.yhLevelLabel = yh_hidden_levelList.find((i) => i.value == item.yhLevel)?.text;
      item.yhTypeLabel = sk_yh_type.find((i) => i.value == item.yhType)?.text;
      item.yhTypeSubLabel = sk_yh_type_sub.value.find((i) => i.value == item.yhTypeSub)?.text;
    });

    // 只在初始化时更新formData，保存后刷新数据时不更新
    if (!skipFormDataUpdate) {
      Object.assign(formData, itemList.value[active.value]);
    }
    nextTick(() => {
      formRef.value?.resetValidation();
    });
  };
  getDetail(false, {});
  async function getUser() {
    loadingUser.value = true;
    await userListByOrg({}).then((res) => {
      userList.value = res.records;
      loadingUser.value = true;
    });
  }
  const onConfirm = (value, show, key) => {
    console.log('value', value);
    switch (key) {
      case 'yhLevel':
        formData.yhLevel = value.selectedOptions[0].value;
        formData.yhLevelLabel = value.selectedOptions[0].text;
        showYhLevel.value = false;
        break;
      case 'yhType':
        formData.yhType = value.selectedOptions[0].value;
        formData.yhTypeLabel = value.selectedOptions[0].text;
        showyhType.value = false;
        sk_yh_type_sub.value = formData.yhType ? userStore.getAllDictItems[formData.yhType] : [];
        formData.yhTypeSub = '';
        formData.yhTypeSubLabel = '';
        break;
      case 'yhTypeSub':
        formData.yhTypeSub = value.selectedOptions[0].value;
        formData.yhTypeSubLabel = value.selectedOptions[0].text;
        showyhTypeSub.value = false;
        break;
      case 'riskId':
        showriskId.value = false;
        console.log('选择的风险点：', value);
        formData.riskId = value.selectedValues[0];
        formData.riskName = value.selectedOptions[0].text;
        console.log('设置的风险点ID：', formData.riskId);
        console.log('设置的风险点名称：', formData.riskName);
        break;
      case 'workshopDirector':
        userShow1.value = false;
        formData.workshopDirector = value.id;
        formData.workshopDirectorName = value.realname;
        break;
      case 'repairPerson':
        userShow.value = false;
        formData.repairPerson = value.id;
        formData.repairPersonName = value.realname;
        break;
      case 'teamLeader':
        showTeam.value = false;
        formData.teamLeader = value.id;
        formData.teamLeaderName = value.realname;
        break;
    }
  };
  const confirmTeamPerson = (userName: string, userValue: string, orgCode: string) => {
    formData.teamLeaderName = userValue;
  };
  const confirmWorkshopDirector = (userName: string, userValue: string, orgCode: string) => {
    formData.workshopDirectorName = userValue;
  };
  const resultClick = (e) => {
    searchForm.checkResult = e;
  };
  const riskClick = (e) => {
    searchForm.riskType = e;
  };
  function getTeamLeaders() {
    loadingUser.value = true;
    getTeamLeaderList().then((res) => {
      if (res && res.length > 0) {
        formData.teamLeader = res[0].id;
      }
      loadingUser.value = false;
    });
  }
  getTeamLeaders();

  function pageInit() {
    Promise.all([
      getDictItemsByCode('check_sort'), // 检查项分类
    ]).then((res) => {
      let flag = false; // 初始化提交按钮状态
      if (res[0].length && res[0].length > 0) {
        res[0].map((val) => {
          if (itemList.value.length && itemList.value.length > 0) {
            itemList.value.map((item) => {
              // if (!item.checkPicture) {
              //   item.checkPicture = '';
              // }
              if (item.itemType == val.value) {
                item['itemTypeName'] = val.text; // 初始化字典值
              }
              if (item.saveFlag == 0) {
                flag = true;
              }
            });
          }
        });
        for (var i = itemList.value.length - 1; i >= 0; i--) {
          active.value = i;
          tabChange(active.value);
          if (itemList.value[i].saveFlag == 1) {
            break;
          }
        }
      }
      subDisable.value = flag;
    });
  }

  const beforeChange = async () => {
    // 确保将当前表单数据完全同步到列表项中
    Object.assign(itemList.value[active.value], formData);
    console.log('beforeChange - 同步数据到列表项:', itemList.value[active.value]);

    // 当前项保存之后才能切换
    // if (formData.saveFlag != 1) {
    //   showToast({ message: '请先保存当前项', duration: 1000 });
    //   return false;
    // }
    // return true;
  };
  // getUser();
  const tabChange = (idx) => {
    console.log('tabChange', idx);
    // 改成对象展开的写法
    Object.assign(formData, itemList.value[idx]);
    formData.checkPicture = itemList.value[idx].checkPicture;
    console.log(formData, itemList.value);
  };
  const confirmPerson = (userName: string, userValue: string, orgCode: string) => {
    formData.repairPersonName = userValue;
    //根据组织编码获取车间主任
    if (orgCode && orgCode.length > 9) {
      getUserListByOrgAndRole({ orgCode: orgCode, roleCode: 'workshop_director' }).then((res) => {
        console.log('getUserListByOrgAndRole res', res);
        if (res.length > 0) {
          formData.workshopDirector = res[0].id;
          formData.workshopDirectorName = res[0].realname;
        }
      });
    }
  };
  /**
   * 保存当前检查项
   * 保存成功后：如果不是最后一项则跳转到下一项，如果是最后一项则停留在当前项
   */
  async function saveFn() {
    await formRef.value?.validate();
    console.log('formData', formData);
    console.log('saveFn', itemList.value[active.value]);
    // 检查照片不能为空
    if (formData.checkResult !== '3' && !formData.checkPicture) {
      showToast({ message: '请上传检查照片', duration: 1000 });
      return;
    }
    saveLoading.value = true;
    await saveItem({ ...formData, id: itemList.value[active.value].id, postFlag: ifPost.value ? '1' : '2' })
      .then(async () => {
        // showSuccessToast({ message: '保存成功！', duration: 300 });
        saveLoading.value = false;
        // 获取最新数据并更新当前项视图
        await getDetail(false, searchForm);

        // 保存成功后的跳转逻辑：如果不是最后一项，则跳转到下一项
        const currentIndex = active.value;
        const totalItems = itemList.value?.length || 0;

        if (currentIndex < totalItems - 1) {
          // 不是最后一项，跳转到下一项
          active.value = currentIndex + 1;
          tabChange(active.value);
          console.log('保存成功，已跳转到下一项:', active.value);
        } else {
          // 是最后一项，停留在当前项
          console.log('保存成功，已停留在最后一项:', active.value);
        }
      })
      .catch(() => {
        saveLoading.value = false;
      });
  }
  const checkResultChange = (item) => {
    console.log('checkResultChange', item);
    // 重置输入项
    // formData.checkPicture = '';
  };
  const endDtConfirm = (value, key) => {
    formData[key] = dateFormat(value, 'yyyy-MM-dd');
    showCalendar1.value = false;
  };

  const submitFn = async () => {
    // 所有检查项都保存之后才能点提交
    let flag = true;
    // 重置搜索表单
    Object.assign(searchForm, {
      depart: '',
      departLabel: '',
      recogId: '',
      recogUnitLabel: '',
      riskId: '',
      riskNameLabel: '',
      checkResult: '',
      riskType: '',
    });

    await getDetail(false, searchForm);
    itemList.value.forEach((item) => {
      if (item.saveFlag != 1) {
        flag = false;
      }
    });
    if (!flag) {
      showToast({ message: '请先保存所有检查项', duration: 1000 });
      return;
    }
    showConfirmDialog({
      title: '提交',
      message: '是否确认提交！',
    }).then(async () => {
      submiting.value = true;
      console.log('submitFn', itemList.value);
      submitTaskApp({ id: route.query.id }).then((res) => {
        setTimeout(() => {
          submiting.value = false;
          router.replace({ path: '/app/hiddenManage/dailyTasks/detail', query: { id: route.query.id } });
        }, 300);
      });
    });
  };

  /**
   * 初始化搜索选择器数据
   */
  const initSearchData = () => {
    // itemList.value = originalItemList.value;

    // 提取车间数据（假设从组织架构或其他接口获取，这里先用模拟数据）
    getWorkshopList({ id: route.query.id }).then((res) => {
      console.log('getWorkshopList', res);
      workshopList.value = res.map((workshop) => ({ text: workshop.departName, value: workshop.orgCode }));
    });

    // 提取辨识单元数据
    getRecogUnitList({ id: route.query.id }).then((res) => {
      recogUnitList.value = res.map((unit) => ({ text: unit.recogUnit, value: unit.id }));
    });

    // 提取风险部位数据
    getRiskNameList({ id: route.query.id }).then((res) => {
      riskNameList.value = res.map((item) => ({ text: item.pointName, value: item.id }));
    });
  };
  // 初始化搜索选择器数据
  initSearchData();
  /**
   * 车间选择确认
   */
  const onWorkshopConfirm = (value) => {
    searchForm.depart = value.selectedOptions[0].value;
    searchForm.departLabel = value.selectedOptions[0].text;
    showWorkshopPicker.value = false;
  };

  /**
   * 辨识单元选择确认
   */
  const onRecogUnitConfirm = (value) => {
    if (!value.selectedOptions[0].value) {
      return;
    }
    searchForm.recogId = value.selectedOptions[0].value;
    searchForm.recogUnitLabel = value.selectedOptions[0].text;
    showRecogUnitPicker.value = false;

    // 重置依赖项
    searchForm.riskId = '';
    searchForm.riskNameLabel = '';

    // 提取风险部位数据
    getRiskNameList({ id: route.query.id, recogId: searchForm.recogId }).then((res) => {
      riskNameList.value = res.map((item) => ({ text: item.pointName, value: item.id }));
    });
  };

  /**
   * 风险部位选择确认
   */
  const onRiskNameConfirm = (value) => {
    searchForm.riskId = value.selectedOptions[0].value;
    searchForm.riskNameLabel = value.selectedOptions[0].text;
    showRiskNamePicker.value = false;
  };

  /**
   * 检查结果选择确认
   */
  const onCheckResultConfirm = (value) => {
    searchForm.checkResult = value.selectedOptions[0].value;
    showCheckResultPicker.value = false;
  };

  /**
   * 搜索
   */
  const searchClick = async () => {
    await getStatus();
    await getDetail(false, searchForm);
    searchPopup.value = false;
    console.log('searchClick', originalItemList.value, itemList.value);
  };

  /**
   * 重置搜索
   */
  const resetSearch = async () => {
    // 重置搜索表单
    Object.assign(searchForm, {
      depart: '',
      departLabel: '',
      recogId: '',
      recogUnitLabel: '',
      riskId: '',
      riskNameLabel: '',
      checkResult: '',
      riskType: '',
    });

    await getDetail(false, searchForm);

    // 重置到第一个tab
    if (itemList.value.length > 0) {
      active.value = 0;
      tabChange(0);
    }
    searchPopup.value = false;
  };
</script>

<style lang="less" scoped>
  .execute-task {
    width: 100%;
    height: 100%;

    .search-header {
      display: flex;
      justify-content: flex-end;
      padding: 10px 16px;
      background: #fff;
      border-bottom: 1px solid #f5f5f5;

      .search-btn {
        min-width: 60px;
      }
    }

    .myform {
      padding-bottom: 70px;
    }

    .tab-inner {
      height: auto;
      overflow-y: scroll;
      background: #ffffff;
    }

    .projectinfo {
      font-size: 14px;
      padding: 10px 16px;
      background: #eff1f5;
      line-height: 32px;

      label {
        width: 80px;
        text-align: left;
      }
    }

    .foot {
      width: 100%;
      height: 55px;
      position: fixed;
      bottom: 0;
      left: 0;
      background: #fff;
      display: flex;
      justify-content: center;
      align-items: center;
      border-top: 1px solid #f5f5f5;

      .van-button {
        margin-right: 15px;
      }
    }
  }
  :deep(.off_pass) {
    span {
      display: inline-block;
      width: 20px;
      height: 20px;
      background-color: rgb(242, 97, 75);
      color: #ffffff;
      border-radius: 50%;
      text-align: center;
      line-height: 20px;
    }
  }
  :deep(.on_pass) {
    span {
      display: inline-block;
      width: 20px;
      height: 20px;
      background-color: rgb(6, 180, 6);
      color: #ffffff;
      border-radius: 50%;
      text-align: center;
      line-height: 20px;
    }
  }
  .error-message {
    color: red;
    font-size: 14px;
    margin-top: 10px;
    margin-left: 100px;
  }
  .search-box {
    // .van-button {
    //   width: 48%;
    // }

    .foot {
      padding: 0 10px;
      display: flex;
      margin-top: 30px;
      justify-content: center;
    }

    .hd {
      height: 38px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 15px;
      font-weight: 600;
    }

    .btns {
      padding: 10px 16px;

      p {
        margin-bottom: 10px;
      }

      ul li {
        display: flex;
        justify-content: space-between;
        margin-bottom: 10px;
      }
      .btn-wrap {
        button {
          margin: 6px;
        }
      }
    }
  }
</style>
