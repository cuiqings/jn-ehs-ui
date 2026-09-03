<template>
  <div>
    <BasicDrawer v-bind="$attrs" @register="registerDrawer" :width="1000" title="巡检任务处理" @close="handleCancel">
      <a-divider orientation="left">基本信息</a-divider>
      <div class="info-content" v-if="detailsData.id">
        <div class="item">
          <div class="item-title">检查类型：</div>
          <div class="item-content">{{ filterDictTextByCache('special_check_type', detailsData.checkType) }}</div>
        </div>
        <div class="item">
          <div class="item-title">任务名称：</div>
          <div class="item-content">{{ detailsData.taskName }}</div>
        </div>
        <div class="item">
          <div class="item-title">检查范围：</div>
          <div class="item-content">{{ detailsData.orgNameRangeCurrent || detailsData.orgNameRange }}</div>
        </div>
        <div class="item">
          <div class="item-title">任务时间：</div>
          <div class="item-content">{{ detailsData.taskTimeStart }} ~ {{ detailsData.taskTimeEnd }}</div>
        </div>
        <div class="item">
          <div class="item-title">检查人：</div>
          <div class="item-content">{{ detailsData.checkPersonName }}</div>
        </div>
      </div>
      <!-- 签到记录 / 按钮 -->
      <a-divider orientation="left">签到记录</a-divider>
      <div class="info-content">
        <div class="item">
          <div class="item-title">签到记录：</div>
          <div class="item-content">
            <template v-if="detailsData.signPicture">
              <img :src="detailsData.signPicture" alt="签名" style="width: 150px; height: 90px; border: 1px solid #e1e1e1; border-radius: 4px" />
            </template>
            <template v-else>
              <a-button type="primary" @click="submitSign">签到</a-button>
            </template>
          </div>
        </div>
      </div>
      <div v-if="detailsData.signPicture">
        <a-divider orientation="left">检查记录</a-divider>
        <a-tabs v-model:activeKey="activeOrgCodeKey" type="card" @change="changeActiveOrgCode">
          <a-tab-pane v-for="(item, idx) in orgButtons" :key="item.orgCode" :tab="item.text"></a-tab-pane>
        </a-tabs>
        <div style="margin-bottom: 20px">
          <a-collapse v-model:activeKey="subActiveKey">
            <a-collapse-panel v-for="(item, index1) in orgDetailInfo.itemList" :key="index1 + 1" :header="`检查项${index1 + 1}`">
              <div class="tab-inner">
                <div class="projectinfo" v-if="item.checkType == '3' || item.checkType == '4' || item.checkType == '5' || item.checkType == '6'">
                  <div><label>检查内容及标准：</label>{{ item.contentStandard }}</div>
                </div>
                <div class="projectinfo" v-if="item.checkType == '7'">
                  <div><label>违法行为描述：</label>{{ item.illegalDesc }}</div>
                  <div><label>判定情形：</label>{{ item.illegalBasis }}</div>
                </div>
                <div class="projectinfo" v-if="item.checkType == '8'">
                  <div><label>辨识单元：</label>{{ item.recogUnit }}</div>
                  <div><label>风险部位：</label>{{ item.riskName }}</div>
                  <div><label>风险失控表现：</label>{{ item.riskFactor }}</div>
                </div>
              </div>
              <a-form ref="formRef" :model="item" :label-col="{ span: 5 }" :wrapper-col="{ span: 18 }">
                <a-form-item label="检查结果" name="checkResult" :rules="[{ required: true, message: '请选择检查方式' }]">
                  <a-radio-group v-model:value="item.checkResult" :disabled="item.saveFlag == 1">
                    <a-radio value="1">合格</a-radio>
                    <a-radio value="2">不合格</a-radio>
                  </a-radio-group>
                </a-form-item>

                <a-form-item v-if="item.checkResult == '1'" label="检查照片" name="checkPicture">
                  <JImageUpload :key="item.id" :disabled="item.saveFlag == 1" :isYhWatermark="true" v-model:value="item.checkPicture" />
                </a-form-item>

                <div v-if="item.checkResult == '2' && item.saveFlag != 1">
                  <div
                    class="yh-item"
                    v-for="(item1, idx1) in item.yhList"
                    :key="idx1"
                    style="position: relative; border: 1px dashed #d9d9d9; padding: 10px; margin-bottom: 10px; border-radius: 4px"
                  >
                    <DeleteOutlined
                      v-if="idx1 != 0"
                      class="delete-icon"
                      @click="deleteYh(item, idx1)"
                      style="position: absolute; right: 10px; top: 10px; color: #ff4d4f; cursor: pointer; font-size: 20px; z-index: 1"
                    />

                    <a-row :gutter="24">
                      <a-col :span="12">
                        <a-form-item
                          label="隐患描述"
                          :name="['yhList', idx1, 'yhDescription']"
                          :rules="[{ required: true, message: '请输入隐患描述' }]"
                        >
                          <a-textarea v-model:value="item1.yhDescription" placeholder="请输入隐患描述" />
                        </a-form-item>
                      </a-col>
                      <a-col :span="12">
                        <a-form-item
                          label="检查照片"
                          :name="['yhList', idx1, 'checkPicture']"
                          :rules="[{ required: true, message: '请上传检查照片' }]"
                        >
                          <JImageUpload :key="item1.id" :disabled="formData.saveFlag == 1" :isYhWatermark="true" v-model:value="item1.checkPicture" />
                        </a-form-item>
                      </a-col>
                      <a-col :span="12">
                        <a-form-item label="隐患等级" :name="['yhList', idx1, 'yhLevel']" :rules="[{ required: true, message: '请选择隐患等级' }]">
                          <a-select
                            v-model:value="item1.yhLevel"
                            :options="yh_hidden_levelList"
                            placeholder="请选择隐患等级"
                            @change="(val, opt) => (item1.yhLevelLabel = opt.label)"
                          />
                        </a-form-item>
                      </a-col>
                      <a-col :span="12">
                        <a-form-item label="隐患类别" :name="['yhList', idx1, 'yhType']" :rules="[{ required: true, message: '请选择' }]">
                          <a-select v-model:value="item1.yhType" :options="sk_yh_type" placeholder="请选择" @change="yhTypeChange(item1)" />
                        </a-form-item>
                      </a-col>
                      <a-col :span="12">
                        <a-form-item label="隐患子类别" :name="['yhList', idx1, 'yhTypeSub']" :rules="[{ required: true, message: '请选择' }]">
                          <a-select
                            v-model:value="item1.yhTypeSub"
                            :options="sk_yh_type_sub"
                            placeholder="请选择"
                            @change="(val, opt) => (item1.yhTypeSubLabel = opt.label)"
                          />
                        </a-form-item>
                      </a-col>
                      <a-col :span="12">
                        <a-form-item label="责任部门" :name="['yhList', idx1, 'dutyDepart']" :rules="[{ required: true, message: '请选择责任部门' }]">
                          <a-select v-model:value="item1.dutyDepart" :options="deptList" placeholder="请选择" />
                        </a-form-item>
                      </a-col>
                    </a-row>
                  </div>
                  <div style="text-align: center">
                    <a-button type="primary" @click="addYh(item)" style="margin: 5px 0; width: 150px">+ 新增隐患</a-button>
                  </div>
                </div>

                <div v-if="item.checkResult == '2' && item.saveFlag == 1">
                  <div v-for="(item1, idx1) in item.yhList" :key="idx1" style="border-bottom: 1px solid #f0f0f0; margin-bottom: 10px">
                    <a-descriptions
                      :column="2"
                      bordered
                      size="small"
                      :labelStyle="{ width: '120px' }"
                      :contentStyle="{ width: '350px' }"
                    >
                      <a-descriptions-item label="隐患描述">{{ item1.yhDescription }}</a-descriptions-item>
                      <a-descriptions-item label="检查照片">
                        <JImageUpload :disabled="true" :isYhWatermark="true" :value="item1.checkPicture" />
                      </a-descriptions-item>
                      <a-descriptions-item label="隐患等级">{{ item1.yhLevelLabel || '一般' }}</a-descriptions-item>
                      <a-descriptions-item label="隐患类别">{{ item1.yhTypeLabel || item1.yhType_dictText }}</a-descriptions-item>
                      <a-descriptions-item label="隐患子类别">{{ item1.yhTypeSubLabel || item1.yhTypeSub_dictText }}</a-descriptions-item>
                      <a-descriptions-item label="责任部门">{{ item1.dutyDepartName }}</a-descriptions-item>
                    </a-descriptions>
                  </div>
                </div>
              </a-form>
            </a-collapse-panel>
          </a-collapse>
          <div style="margin: 10px 0; float: right; clear: both">
            <a-button @click="handleCancel" style="margin-right: 10px" type="defalut"> 取消 </a-button>
            <a-button v-if="subDisable && !checkedOrg.includes(activeOrgCodeKey)" @click="onSave" type="primary" :loading="saveLoading">
              保存
            </a-button>
            <a-button
              v-if="!subDisable && !checkedOrg.includes(activeOrgCodeKey) && orgDetailInfo.status != '1'"
              @click="handleSubmit"
              type="primary"
              :loading="submitLoading"
              >提交</a-button
            >
          </div>
        </div>
      </div>
    </BasicDrawer>
    <RiskModalInfo @register="registerRiskInfoModal" />
    <BasicModal @register="registerSignModal" title="上传签名" @ok="handleSignModalOk">
      <div style="padding: 20px; display: flex; justify-content: center">
        <JImageUpload :fileMax="1" text="上传签名" v-model:value="manualSignUrl" />
      </div>
    </BasicModal>
  </div>
</template>

<script lang="ts" setup>
  import { computed, ref, unref } from 'vue';
  import { BasicDrawer, useDrawerInner, useDrawer } from '/@/components/Drawer';
  import { BasicModal, useModalInner, useModal } from '/@/components/Modal';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import { getTaskDetail, saveWebItemsForSpecial } from './history.api';
  import { specialTaskSubmit, specialSetRange, submitTaskForSpecial } from '/@/views/app/hiddenManage/index.api';
  import { useUserStore } from '/@/store/modules/user';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { initDictOptions } from '/@/utils/dict';
  import { getOrgCodeList, getDepartmentList } from '/@/api/common/api';
  import { getUserList, getRiskLibraryListByIds } from '../task/task.api';
  import { JImageUpload } from '/@/components/Form';
  import RiskModalInfo from '/@/views/risk/component/riskModalInfo.vue';
  import { DeleteOutlined } from '@ant-design/icons-vue';

  const [registerRiskInfoModal, RiskInfoProps] = useModal();
  const { createConfirm } = useMessage();
  const { createMessage } = useMessage();
  const userStore = useUserStore();
  const userinfo: any = computed(() => userStore.getUserInfo);
  const emit = defineEmits(['success', 'register']);
  const isUpdate = ref<Boolean>(true);
  const showFooter = ref<Boolean>(true);
  const modalTitle = ref('查看');
  const orgOptions: any = ref([]);
  const departOptions: any = ref([]);
  const dataSource: any = ref([]);
  const itemTypeOptions: any = ref([]);
  const remindMessage = ref(true);
  const detailsData: any = ref({});
  const checkTypeOptions: any = ref([]);
  const planType = ref('');
  const flowType = ref('');
  const orgButtons = ref([]);
  const checkedOrg = ref<string[]>([]);
  const selectedOrg = ref<string>('');
  const subDisable = ref(true);
  const activeOrgCodeKey = ref('');
  const subActiveKey = ref(['1']);
  const orgDetailInfo = ref<any>({});
  const manualSignUrl = ref<any[]>([]);
  const saveLoading = ref(false);
  const submitLoading = ref(false);
  const [registerSignModal, { openModal: openSignModal, closeModal: closeSignModal }] = useModal();

  // Form Data and Dictionaries
  const formRef = ref([]);
  const formData = ref<any>({
    checkResult: undefined,
    checkPicture: [],
    yhList: [],
    saveFlag: 0,
  });
  const yh_hidden_levelList = ref<any[]>([]);
  const sk_yh_type = ref<any[]>([]);
  const sk_yh_type_sub = ref<any[]>([]);
  const deptList = ref<any[]>([]);

  import { filterDictTextByCache } from '/@/utils/dict/JDictSelectUtil';
  import { getFileAccessHttpUrl } from '/@/utils/common/compUtils';

  const editType = ref('');

  // 注册表单
  const [registerForm, { validate, setFieldsValue, resetFields, setProps, updateSchema }] = useForm({
    schemas: [
      {
        label: 'id',
        field: 'id',
        component: 'Input',
        show: false,
      },
      {
        field: 'table1',
        component: 'Input',
        label: '',
        //   colProps: {
        //     span: 5,
        //   },
        slot: 'table1',
        ifShow: ({ values }) => {
          if (values.planType == '1') {
            return true;
          } else {
            return false;
          }
        },
      },
      {
        field: 'table2',
        component: 'Input',
        label: '',
        //   colProps: {
        //     span: 5,
        //   },
        slot: 'table2',
        ifShow: ({ values }) => {
          if (values.planType != '1') {
            return true;
          } else {
            return false;
          }
        },
      },
    ],
    showActionButtonGroup: false,
    labelCol: {
      xs: { span: 24 },
      sm: { span: 6 },
    },
    wrapperCol: {
      xs: { span: 24 },
      sm: { span: 18 },
    },
  });
  // 新增隐患
  function addYh(item) {
    item.yhList.push({
      yhDescription: '',
      checkPicture: [],
      yhLevel: undefined,
      yhType: undefined,
      yhTypeSub: undefined,
      dutyDepart: undefined,
    });
  }

  function deleteYh(item, idx) {
    item.yhList.splice(idx, 1);
  }

  /**
   * 批量保存当前组织的检查项（专项任务），保存后刷新当前组织数据
   */
  async function onSave() {
    // 校验表单
    if (formRef.value && formRef.value.length > 0) {
      try {
        const validForms = formRef.value.filter((f) => f);
        await Promise.all(validForms.map((form) => form.validate()));
      } catch (e) {
        console.log('校验失败', e);
        return;
      }
    }
    setDrawerProps({ confirmLoading: true });
    saveLoading.value = true;
    try {
      await saveWebItemsForSpecial(orgDetailInfo.value.itemList);
      await refreshOrgItems();
    } finally {
      saveLoading.value = false;
      setTimeout(() => setDrawerProps({ confirmLoading: false }), 100);
    }
  }
  /**
   * 提交专项任务（仅当所有检查项校验通过）
   */
  async function handleSubmit() {
    setDrawerProps({ confirmLoading: true });
    submitLoading.value = true;
    try {
      await submitTaskForSpecial({ id: orgDetailInfo.value.id });
      await refreshOrgItems();
    } finally {
      submitLoading.value = false;
      setDrawerProps({ confirmLoading: false });
    }
    // emit('success');
    // setDrawerProps({ confirmLoading: false });
  }
  // 注册弹窗
  // 这个方法执行需要openModal传入第二个参数
  /**
   * 弹窗打开时加载专项任务详情并构建分组按钮
   */
  const [registerDrawer, { setDrawerProps, closeDrawer }] = useDrawerInner(async (data) => {
    await resetFields();
    dataSource.value = [];
    setDrawerProps({ confirmLoading: false, showCancelBtn: !!data?.showFooter, showOkBtn: !!data?.showFooter });
    isUpdate.value = !!data?.isUpdate;
    showFooter.value = !!data?.showFooter;
    editType.value = data.editType;

    // Load dictionaries
    initDictOptions('yh_hidden_level').then((res) => {
      if (res) {
        yh_hidden_levelList.value = res.map((item) => ({ label: item.text, value: item.value }));
      }
    });
    initDictOptions('sk_yh_type').then((res) => {
      if (res) {
        sk_yh_type.value = res.map((item) => ({ label: item.text, value: item.value }));
      }
    });

    // 加载专项任务详情
    const res = await getTaskDetail({ id: data.record.id });
    detailsData.value = res;
    // 处理签到图片为完整URL
    if (detailsData.value.signPicture && !/^http/i.test(detailsData.value.signPicture)) {
      detailsData.value.signPicture = getFileAccessHttpUrl(detailsData.value.signPicture);
    }
    // 分组按钮（只显示包含当前用户的分组）
    orgButtons.value = [];
    checkedOrg.value = res.checkedOrg ? res.checkedOrg.split(',') : [];
    const orgNameRangeCurrent = (res.orgNameRangeCurrent || '').split(',').filter(Boolean);
    orgNameRangeCurrent.forEach((name) => {
      const org = res.itemMap?.[name]?.[0];
      if (org) {
        orgButtons.value.push({ text: org.orgName, orgCode: org.org, status: org.status });
      }
    });
    activeOrgCodeKey.value = orgButtons.value[0].orgCode;
    getSetRangeByOrgCode(activeOrgCodeKey.value);
    console.log('orgButtons', orgButtons.value);

    // 设置表单禁用
    setProps({ disabled: true });
  });
  function getSetRangeByOrgCode(orgCode: string) {
    specialSetRange({
      id: detailsData.value.id,
      org: orgCode,
    }).then((res) => {
      console.log('getSetRangeByOrgCode', res);
      if (res.itemList && res.itemList.length > 0) {
        res.itemList = res.itemList.map((it) => {
          if (!it.yhList) {
            it.yhList = [
              {
                yhDescription: '',
                checkPicture: '',
                yhLevelLabel: '',
                yhTypeLabel: '',
                yhTypeSubLabel: '',
                dutyDepartName: '',
              },
            ];
          }
          return it;
        });
        // res.itemList中 检查是否有saveFlag为1的项
        subDisable.value = (res.itemList || []).some((it) => it.saveFlag != 1); // false时显示 提交按钮，true显示保存按钮

        // 默认展开所有面板
        subActiveKey.value = res.itemList.map((_, index) => String(index + 1));
      }
      if (res.org) {
        getDepartmentList({ orgCode: res.org }).then((res) => {
          console.log('getDepartmentList', res);
          deptList.value = res.map((item) => ({ label: item.departName, value: item.orgCode }));
        });
      }
      orgDetailInfo.value = res;
    });
  }
  function changeActiveOrgCode(key: string) {
    activeOrgCodeKey.value = key;
    getSetRangeByOrgCode(key);
  }
  async function handleSignModalOk() {
    let sign = '';
    const val = unref(manualSignUrl);
    if (Array.isArray(val)) {
      if (val.length > 0) sign = val[0];
    } else {
      sign = val as unknown as string;
    }

    if (!sign) {
      createMessage.warning('请上传签名图片');
      return;
    }

    const signUrl = /^http/i.test(sign) ? sign : getFileAccessHttpUrl(sign);

    try {
      await specialTaskSubmit({ taskId: detailsData.value.id, signPicture: sign });
      detailsData.value.signPicture = signUrl;
      closeSignModal();
      getSetRangeByOrgCode(activeOrgCodeKey.value);
    } catch (e) {
      createMessage.error('签到失败');
    }
  }

  /**
   * 签到：优先使用个人签名；成功后展示分组按钮
   */
  function submitSign() {
    const sign = userStore.getUserInfo.signature;
    if (!sign) {
      manualSignUrl.value = [];
      openSignModal(true);
      return;
    }
    const signUrl = /^http/i.test(sign) ? sign : getFileAccessHttpUrl(sign);
    specialTaskSubmit({ taskId: detailsData.value.id, signPicture: sign })
      .then(() => {
        detailsData.value.signPicture = signUrl;
      })
      .catch(() => {
        createMessage.error('签到失败');
      });
  }

  /**
   * 选择分组并加载检查项，初始化提交按钮禁用状态
   */
  async function selectOrg(item: { text: string; orgCode: string }) {
    selectedOrg.value = item.orgCode;
    const res = await specialSetRange({ id: detailsData.value.id, org: item.orgCode });
    planType.value = res.checkType == '8' ? '1' : '2';
    dataSource.value = (res.itemList || []).map((it) => ({ ...it, checkResult: it.checkResult || '1' }));
    subDisable.value = (res.itemList || []).some((it) => it.saveFlag != 1);
    await setFieldsValue({ planType: planType.value });
  }

  /**
   * 刷新当前组织的检查项并更新提交禁用状态
   */
  async function refreshOrgItems() {
    if (!activeOrgCodeKey.value) return;
    orgDetailInfo.value = await specialSetRange({ id: detailsData.value.id, org: activeOrgCodeKey.value });
    // res.itemList中 检查是否有saveFlag为1的项
    subDisable.value = (orgDetailInfo.value.itemList || []).some((it) => it.saveFlag != 1); // false时显示 提交按钮，true显示保存按钮
  }

  function yhTypeChange(itemData) {
    console.log('yhTypeChange', itemData);
    itemData.yhTypeSub = undefined;
    initDictOptions(itemData.yhType).then((res) => {
      if (res) {
        sk_yh_type_sub.value = res.map((item) => ({ label: item.text, value: item.value }));
      }
    });
  }

  function handleCancel() {
    closeDrawer();
    emit('success');
  }
</script>

<style lang="less" scoped>
  .red-require {
    display: inline-block;
    margin-right: 4px;
    color: #ff4d4f;
    font-size: 14px;
    font-family: SimSun, sans-serif;
    line-height: 1;
  }
  .info-content {
    // display: flex;
    margin-top: 20px;
    margin-left: 20px;
    .item {
      // width: 50%;
      display: flex;
      margin-bottom: 15px;
      margin-right: 20px;
      .item-title {
        width: 120px;
        font-size: 14px;
        font-family: SourceHanSansCN-Regular, SourceHanSansCN;
        font-weight: normal;
        color: rgba(0, 0, 0, 0.68);
        text-align: right;
      }
      .item-content {
        width: calc(100% - 120px);
        font-size: 14px;
        font-family: SourceHanSansCN-Regular, SourceHanSansCN;
        font-weight: normal;
        color: rgba(0, 0, 0, 1);
      }
    }
  }
  .sign-btn {
    margin-left: 30px;
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
</style>
