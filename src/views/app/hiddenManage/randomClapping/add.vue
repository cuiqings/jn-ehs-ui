<!-- 随手拍新增 -->
<template>
  <div class="hd-add">
    <van-form @submit="onSubmit" label-width="80px" ref="formRef">
      <van-field
        required
        v-model="formData.yhDescription"
        name="yhDescription"
        autosize
        type="textarea"
        label=" 隐患描述"
        :maxlength="300"
        placeholder="请输入"
        :rules="[{ required: true, message: '请填写隐患描述' }]"
      />

      <van-field v-model="formData.yhPicture" name="yhPicture" label="检查照片" required :rules="[{ required: true, message: '请选择检查照片！' }]">
        <template #input>
          <!-- <RealCameraUpload v-model:value="formData.yhPicture" /> -->
          <AppUpload v-model:fileList="formData.yhPicture" />
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
        v-model="formData.riskName"
        is-link
        readonly
        name="riskName"
        label="关联风险点"
        required
        placeholder="请选择"
        @click="showriskId = true"
        :rules="[{ required: true, message: '请选择关联风险点' }]"
      />
      <!-- required
      :rules="[{ required: true, message: '请选择' }]" -->
      <van-popup v-model:show="showriskId" position="bottom" :style="{ height: '100%' }">
        <div class="risk-select">
          <van-nav-bar title="选择风险点" left-arrow @click="showriskId = false" />
          <van-tabs v-model:active="riskTab" type="card" @change="onRiskTabChange">
            <van-tab title="与我相关" name="self" />
            <van-tab title="全部" name="all" />
          </van-tabs>

          <van-collapse v-model="filterCollapse">
            <van-collapse-item title="筛选条件" name="1">
              <van-field v-model="filter.orgLabel" is-link readonly label="所属单位" placeholder="请选择所属单位" @click="showOrgPicker = true" />
              <van-field
                v-model="filter.departLabel"
                is-link
                readonly
                label="所属车间"
                placeholder="请选择所属车间"
                @click="showDepartPicker = true"
              />
              <van-field
                v-model="filter.recogUnit"
                is-link
                readonly
                label="辨识单元"
                placeholder="请选择辨识单元"
                @click="showRecogUnitPicker = true"
              />
              <van-field v-model="filter.pointName" label="风险点" placeholder="请输入风险点名称" />
              <div class="btns">
                <p style="color: #323233; font-size: 14px; margin-left: 6px">风险等级</p>
                <div class="btn-wrap">
                  <van-button
                    v-for="item in riskLevelOptions"
                    :key="item.value"
                    size="small"
                    round
                    :type="filter.riskLevel === item.value ? 'primary' : 'default'"
                    @click="onRiskLevelClick(item.value)"
                  >
                    {{ item.text }}
                  </van-button>
                </div>
              </div>
              <div class="foot">
                <van-button size="small" style="margin-right: 30px" @click="resetFilter">重置</van-button>
                <van-button size="small" type="primary" @click="searchRiskPoints">搜索</van-button>
              </div>
            </van-collapse-item>
          </van-collapse>
          <div class="risk-list">
            <van-list v-model:loading="riskLoading" :finished="riskFinished" finished-text="没有更多了" @load="onRiskLoad">
              <div
                v-for="item in riskList"
                :key="item.id"
                class="risk-item"
                @click="selectRisk(item)"
                :class="{ selected: selectedRisk && selectedRisk.id === item.id }"
              >
                <div class="risk-item__header">
                  <div class="title">{{ item.pointName }}</div>
                  <van-tag class="level" :type="getLevelTagType(item.riskLevel)">{{ getLevelText(item.riskLevel) }}</van-tag>
                </div>
                <div class="risk-item__meta">
                  <van-tag plain type="primary">{{ item.orgName }}</van-tag>
                  <van-tag plain type="primary">{{ item.departName }}</van-tag>
                  <van-tag plain type="primary">{{ item.recogUnit }}</van-tag>
                </div>
              </div>
            </van-list>
            <div v-if="!riskLoading && riskList.length === 0" class="empty">
              <van-empty description="暂无数据" />
            </div>
          </div>

          <div class="bottom-btn">
            <van-button block type="primary" @click="confirmRiskSelect">确认选择</van-button>
          </div>

          <!-- 所属单位选择器 -->
          <van-popup v-model:show="showOrgPicker" position="bottom">
            <van-picker
              :columns="orgList"
              :columns-field-names="{ text: 'departName', value: 'orgCode' }"
              @confirm="onOrgConfirm"
              @cancel="showOrgPicker = false"
            />
          </van-popup>
          <!-- 所属车间选择器 -->
          <van-popup v-model:show="showDepartPicker" position="bottom">
            <van-picker
              :columns="departList"
              :columns-field-names="{ text: 'departName', value: 'orgCode' }"
              @confirm="onDepartConfirm"
              @cancel="showDepartPicker = false"
            />
          </van-popup>
          <!-- 辨识单元选择器 -->
          <van-popup v-model:show="showRecogUnitPicker" position="bottom">
            <van-picker
              :columns="recogUnitOptions"
              :columns-field-names="{ text: 'recogUnit', value: 'id' }"
              @confirm="onRecogUnitConfirm"
              @cancel="showRecogUnitPicker = false"
            />
          </van-popup>
        </div>
      </van-popup>
      <!-- 岗位工：班组长 -->
      <van-field
        v-if="ifPost"
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

      <!-- 非岗位工：隐患类别 -->
      <van-field
        v-if="!ifPost"
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
        v-if="!ifPost"
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
        v-if="!ifPost"
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
        v-if="!ifPost"
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
        v-if="!ifPost && formData.yhLevel == 2"
        required
        v-model="formData.workshopDirectorName"
        name="workshopDirectorName"
        label="车间主任"
        placeholder="请选择"
        :rules="[{ required: true, message: '请选择车间主任' }]"
      >
        <template #input>
          <JUserModal :userStyle="{ width: '100%' }" v-model:value="formData.workshopDirector" type="radio" @confirm="confirmPerson1" />
        </template>
      </van-field>
      <div style="padding: 16px">
        <van-button round block type="primary" :loading="submiting" native-type="submit"> 提交 </van-button>
      </div>
    </van-form>
  </div>
</template>

<script setup lang="ts">
  import { jnYhSspSubmit, getTeamLeaderList, getRkPointList, ifPostPerson, jnYhSspEditSubmit, jnYhSspDetail } from '../index.api';
  // import RealCameraUpload from '/@/components/App/RealCameraUpload.vue';
  import AppUpload from '../../../../components/App/AppUpload.vue';
  import { showFailToast } from 'vant';
  import { dateFormat } from '/@/utils/common/compUtils';
  import { useUserStore } from '/@/store/modules/user';
  import { useRouter } from 'vue-router';
  import { useRoute } from 'vue-router';
  import { ref, reactive, computed, watch, nextTick } from 'vue';
  import { getRgLcList } from '/@/views/hiddenManage/dailyCheck/manage/manage.api';
  import { userListByOrg } from '/@/api/common/api';
  import JUserModal from '/@/components/App/JUserModal.vue';
  import { get3DepartList, selectDeptNew } from '/@/api/common/api';

  const router = useRouter();
  const route = useRoute();
  console.log(route.query);
  const isEdit = ref(!!route.query.id);
  const showTeam = ref(false);
  const submiting = ref(false);
  const userStore: any = useUserStore();
  const userShow = ref(false);
  const userShow1 = ref(false);
  const loadingUser = ref(false);
  const ifPost = ref(false); // true是岗位工 false不是岗位工
  const formRef = ref(null);
  const recogUnitOptions = ref<any[]>([]);
  const getPostPerson = () => {
    ifPostPerson().then((res) => {
      ifPost.value = res;

    });
  };
  getPostPerson();

  /**
   * 编辑模式：根据路由中的 id 拉取详情并回填表单
   * - 仅在存在 id 时执行
   * - 回填基础字段与选择器展示的 label/value
   */
  const getDetail = async () => {
    try {
      const detail: any = await jnYhSspDetail({ id: route.query.id });
      const keys = [
        'yhDescription',
        'yhPicture',
        'yhLevel',
        'yhLevelLabel',
        'riskId',
        'riskName',
        'teamLeader',
        'teamLeaderName',
        'repairPerson',
        'repairPersonName',
        'workshopDirector',
        'workshopDirectorName',
        'repairTimeLimit',
        'yhType',
        'yhTypeLabel',
        'yhTypeSub',
        'yhTypeSubLabel',
      ];
      keys.forEach((k) => {
        if (detail && Object.prototype.hasOwnProperty.call(detail, k)) {
          formData[k] = detail[k];
        }
      });
      if (detail && detail.yhType) {
        formData.yhTypeLabel = detail['yhType_dictText'];
      }
      if (detail && detail.yhTypeSub) {
        formData.yhTypeSubLabel = detail['yhTypeSub_dictText'];
      }
      if (detail && detail.yhLevel) {
        formData.yhLevelLabel = detail.yhLevel == '1' ? '一般' : '重大';
      }
    } catch (e) {
      console.warn('获取随手拍详情失败：', e);
    }
  };
  // 存在 id 时，触发编辑数据回填
  if (isEdit.value) {
    getDetail();
  }
  const watermarkText = ref(
    `${userStore.getUserInfo.realname} ${userStore.getUserInfo.workNo} ${dateFormat(new Date(), 'yyyy-MM-dd  hh:mm:ss')} 上传`
  );
  const showCalendar1 = ref(false);
  const showCalendar2 = ref(false);
  const showYhLevel = ref(false);
  const showyhType = ref(false);
  const showyhTypeSub = ref(false);
  const showriskId = ref(false);
  const yh_hidden_levelList = [
    { text: '一般', value: 1 },
    { text: '重大', value: 2 },
  ];
  const sk_yh_type = userStore.getAllDictItems.sk_yh_type;
  const sk_yh_type_sub = ref<any[]>([]);

  const riskList = ref<any[]>([]);
  const riskLoading = ref(false);
  const riskFinished = ref(false);
  const riskPageNo = ref(1);
  const riskPageSize = ref(10);
  watch(showriskId, async (val) => {
    if (val) {
      riskList.value = [];
      riskPageNo.value = 1;
      riskFinished.value = false;
      riskTab.value = 'self';
      await nextTick();
      await onRiskLoad();
    }
  });

  // 风险点选择弹窗状态与筛选
  const riskTab = ref('self');
  const filterCollapse = ref<string[]>([]);
  const selectedRisk = ref<any>(null);
  const riskLevelOptions = [
    { text: '全部', value: '' },
    { text: '重大风险', value: '1' },
    { text: '较大风险', value: '2' },
    { text: '一般风险', value: '3' },
    { text: '低风险', value: '4' },
  ];
  const filter = reactive<any>({
    orgCode: '',
    orgLabel: '',
    depart: '',
    departLabel: '',
    recogUnit: '',
    recogId: '',
    riskLevel: '',
    pointName: '',
  });

  const orgList = ref<any[]>([]);
  const departList = ref<any[]>([]);
  const showOrgPicker = ref(false);
  const showDepartPicker = ref(false);
  const showRecogUnitPicker = ref(false);

  /**
   * 加载风险点列表（分页滚动，每次10条）
   */
  const fetchRiskPoints = async () => {
    const params: any = {
      pageNo: riskPageNo.value,
      pageSize: riskPageSize.value,
      tabType: riskTab.value,
    };
    if (filter.orgCode) params.orgCode = filter.orgCode;
    if (filter.departCode) params.departCode = filter.departCode;
    if (filter.riskLevel) params.riskLevel = filter.riskLevel;
    if (filter.pointName) params.pointName = filter.pointName;
    if (filter.recogId) params.recogId = filter.recogId;
    const res: any = await getRkPointList(params);
    const rows: any[] = Array.isArray(res) ? res : Array.isArray(res?.records) ? res.records : [];
    if (rows.length > 0) {
      riskList.value = riskList.value.concat(rows);
      riskPageNo.value += 1;
      if (rows.length < riskPageSize.value) {
        riskFinished.value = true;
      }
    } else {
      riskFinished.value = true;
    }
  };

  /**
   * van-list 加载事件
   */
  const onRiskLoad = async () => {
    if (riskFinished.value) return;
    riskLoading.value = true;
    try {
      await fetchRiskPoints();
    } catch (e) {
      riskFinished.value = true;
    } finally {
      riskLoading.value = false;
    }
  };

  /**
   * Tab 切换后重置分页并重新加载
   */
  const onRiskTabChange = async () => {
    selectedRisk.value = null;
    riskList.value = [];
    riskPageNo.value = 1;
    riskFinished.value = false;
    if (riskTab.value === 'all') {
      const userOrgCode = userStore.getUserInfo.orgCode;
      if (userOrgCode) {
        let org = orgList.value.find((item) => item.orgCode === userOrgCode);
        if (!org) {
          // 如果精确匹配失败，尝试前缀匹配（用户所属部门可能是单位的子部门）
          org = orgList.value.find((item) => userOrgCode.startsWith(item.orgCode));
        }

        if (org) {
          filter.orgCode = org.orgCode;
          filter.orgLabel = org.departName;
          selectDeptNew({ orgCode: org.orgCode, pageSize: 9999, pageNo: 1 }).then((res) => (departList.value = res || []));
        }
      }
    }
    await onRiskLoad();
  };
  // 获取所属单位
  const getOrgList = async () => {
    const res: any = await get3DepartList();
    const rows: any[] = Array.isArray(res) ? res : Array.isArray(res?.records) ? res.records : [];
    if (rows.length > 0) {
      orgList.value = rows;
    }
  };
  getOrgList();
  /**
   * 选择所属单位
   */
  const onOrgConfirm = (e) => {
    const opt = e.selectedOptions?.[0] || {};
    filter.orgCode = opt.orgCode || '';
    filter.orgLabel = opt.departName || '';
    filter.departCode = '';
    filter.departLabel = '';
    showOrgPicker.value = false;
    if (filter.orgCode) {
      selectDeptNew({ orgCode: filter.orgCode, pageSize: 9999, pageNo: 1 }).then((res) => (departList.value = res || []));
    } else {
      departList.value = [];
    }
  };

  /**
   * 选择所属车间
   */
  const onDepartConfirm = (e) => {
    const opt = e.selectedOptions?.[0] || {};
    filter.departCode = opt.orgCode || '';
    filter.departLabel = opt.departName || '';
    showDepartPicker.value = false;
    if (e) {
      getRgLcList({ departCode: filter.departCode }).then((res) => (recogUnitOptions.value = res || []));
    } else {
      recogUnitOptions.value = [];
    }
  };

  /**
   * 选择辨识单元
   */
  const onRecogUnitConfirm = (e) => {
    const opt = e.selectedOptions?.[0] || {};
    console.log('onRecogUnitConfirm',opt);
    filter.recogId = opt.id || '';
    filter.recogUnit = opt.recogUnit || '';
    showRecogUnitPicker.value = false;
  };

  /**
   * 风险等级点击
   */
  const onRiskLevelClick = (val) => {
    filter.riskLevel = val;
  };

  /**
   * 搜索风险点（重置分页并加载）
   */
  const searchRiskPoints = async () => {
    riskList.value = [];
    riskPageNo.value = 1;
    riskFinished.value = false;
    await onRiskLoad();
    filterCollapse.value = [];
  };

  /**
   * 重置筛选并回到第一页
   */
  const resetFilter = async () => {
    Object.assign(filter, {
      orgCode: '',
      orgLabel: '',
      departCode: '',
      departLabel: '',
      recogUnit: '',
      recogId: '',
      riskLevel: '',
      pointName: '',
    });
    riskList.value = [];
    riskPageNo.value = 1;
    riskFinished.value = false;
    await onRiskLoad();
  };
  /**
   * 选择某个风险点
   */
  const selectRisk = (item: any) => {
    selectedRisk.value = item;
  };

  /**
   * 确认风险点选择并回填表单
   */
  const confirmRiskSelect = () => {
    if (!selectedRisk.value) return;
    formData.riskId = selectedRisk.value.id;
    formData.riskName = selectedRisk.value.pointName;
    showriskId.value = false;
  };

  /**
   * 风险等级文本
   */
  const getLevelText = (level: string | number) => {
    const v = String(level);
    return v === '1' ? '重大风险' : v === '2' ? '较大风险' : v === '3' ? '一般风险' : v === '4' ? '低风险' : '';
  };

  /**
   * 风险等级Tag类型
   */
  const getLevelTagType = (level: string | number) => {
    const v = String(level);
    return v === '1' ? 'danger' : v === '2' ? 'warning' : v === '3' ? 'primary' : 'success';
  };

  const formData = reactive<any>({
    yhPicture: '',
    yhDescription: '',
    yhLevel: '',
    yhLevelLabel: '',
    repairTimeLimit: '',
    riskId: '',
    riskName: '',
    teamLeader: '',
    teamLeaderName: '',
    repairPerson: '',
    repairPersonName: '',
    workshopDirector: '',
    workshopDirectorName: '',
  });
  if (route.query.yhPicture) {
    formData.yhPicture = route.query.yhPicture;
  }
  if (route.query.yhDescription) {
    formData.yhDescription = route.query.yhDescription;
  }
  const minDate = ref(new Date(dateFormat(new Date(), 'yyyy-MM-dd')));
  const userOrgCode = userStore.getUserInfo.orgCode;
  const teamClick = () => {
    getTeamLeaders();
    showTeam.value = true;
  };
  getTeamLeaders();
  function getTeamLeaders() {
    loadingUser.value = true;
    getTeamLeaderList().then((res) => {
      console.log('getTeamLeaders res', res);
      if (res && res.length > 0) {
        formData.teamLeader = res[0].id;
        formData.teamLeaderName = res[0].realname;
      }
      loadingUser.value = false;
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
        sk_yh_type_sub.value = userStore.getAllDictItems[formData.yhType];
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
        formData.workshopDirector = value.selectedOptions[0].id;
        formData.workshopDirectorName = value.selectedOptions[0].sectionName;
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

  const getRiskList = () => {
    getRkPointList({}).then((res) => {
      console.log('API返回的原始风险点数据：', res);
      if (res.length) {
        res.forEach((item, index) => {
          console.log(`风险点${index}:`, item);
          item.text = item.pointName;
          // 检查id字段是否存在且唯一
          if (!item.id) {
            console.warn('风险点缺少id字段：', item);
            item.value = index; // 如果没有id，使用索引作为value
          } else {
            item.value = item.id;
          }
        });
      }
      riskList.value = res;
      console.log('处理后的风险点列表：', riskList.value);
    });
  };
  const endDtConfirm = (value, key) => {
    formData[key] = dateFormat(value, 'yyyy-MM-dd');
    showCalendar1.value = false;
    showCalendar2.value = false;
  };
  const confirmPerson = (userName: string, userValue: string) => {
    console.log('confirmPerson', userName, userValue);
    // formData.repairPerson = userValue;
    formData.repairPersonName = userValue;
  };
  const onSubmit = (values) => {
    submiting.value = true;
    let params = { ...formData };

    console.log('values', values);

    if (ifPost.value) {
      // 岗位工提交逻辑：只需要基本信息和班组长
      // 岗位工不需要隐患类别、子类别、完成时限、整改责任人、车间主任
      delete params.yhType;
      delete params.yhTypeSub;
      delete params.repairTimeLimit;
      delete params.repairPerson;
      delete params.workshopDirector;
    }
    // 编辑模式：携带 id 以便后端进行更新
    if (isEdit.value && route.query.id) {
      params.id = route.query.id as any;
      submitEditForm(params);
    } else {
      // 新增
      submitForm(params);
    }
  };

  /**
   * 表单提交：新增或编辑均通过同一接口提交
   * - 新增：不携带 id
   * - 编辑：携带 id，由后端根据 id 进行更新
   */
  const submitForm = (params) => {
    jnYhSspSubmit(params)
      .then((res) => {
        submiting.value = false;
        router.push('/app/hiddenManage/randomClapping/list');
      })
      .catch((err) => {
        console.log(err);
        showFailToast('新增失败，请联系管理员');
        submiting.value = false;
      });
  };
  /**
   * 表单提交：编辑通过同一接口提交
   */
  const submitEditForm = (params) => {
    jnYhSspEditSubmit(params)
      .then((res) => {
        submiting.value = false;
        router.push('/app/hiddenManage/randomClapping/list');
      })
      .catch((err) => {
        console.log(err);
        showFailToast('编辑失败，请联系管理员');
        submiting.value = false;
      });
  };

  const userList = ref([]);
  async function getUser() {
    loadingUser.value = true;
    await userListByOrg({}).then((res) => {
      userList.value = res;
      loadingUser.value = true;
    });
  }
  const confirmPerson1 = (userName: string, userValue: string, orgCode: string) => {
    formData.workshopDirectorName = userValue;
  };
  const confirmTeamPerson = (userName: string, userValue: string, orgCode: string) => {
    formData.teamLeaderName = userValue;
  };
</script>
<style scoped lang="less">
  .gary {
    color: #9a9b9b;
  }

  .gary-text {
    color: #9a9b9b !important;
  }

  * {
    --van-field-input-disabled-text-color: #9a9b9b;
    --van-field-disabled-text-color: #9a9b9b;
  }

  .risk-select {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: #eff1f5;
    .risk-list {
      flex: 1;
      overflow-y: auto;
      padding: 10px 15px 80px;
    }
    .risk-item {
      background: #fff;
      border-radius: 10px;
      padding: 12px 14px;
      margin-bottom: 12px;
      position: relative;
      &.selected {
        border: 1px solid #1989fa;
        box-shadow: 0 0 0 2px rgba(25, 137, 250, 0.15);
      }
      .risk-item__header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        .title {
          font-weight: 600;
          font-size: 14px;
        }
        .level {
          transform: translateY(-2px);
        }
      }
      .risk-item__meta {
        margin-top: 8px;
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }
    }
    .bottom-btn {
      position: fixed;
      left: 0;
      right: 0;
      bottom: 0;
      padding: 10px 16px 20px;
      background: #eff1f5;
    }
    .btns {
      padding: 0 10px;
      .btn-wrap {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
      }
    }
    .foot {
      padding: 0 10px;
      text-align: center;
    }
    .empty {
      padding: 30px 0;
    }
  }
</style>
