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
            <a-form-item label="单位" name="orgCode" :rules="[{ required: true, message: '请选择' }]">
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
            <a-form-item label="车间/科室" name="workshop">
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
            <a-form-item label="性别" name="sex" :rules="[{ required: true, message: '请选择' }]">
              <a-select v-model:value="formState.sex" disabled placeholder="请选择">
                <a-select-option value="1">男</a-select-option>
                <a-select-option value="2">女</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="年龄" name="age" :rules="[{ required: true, message: '请输入' }]">
              <a-input v-model:value="formState.age" placeholder="请输入" />
            </a-form-item>
          </a-col>

          <a-col :span="12">
            <a-form-item label="岗位" name="post" :rules="[{ required: true, message: '请输入' }]">
              <a-input v-model:value="formState.post" :disabled="readonly" :maxLength="20" placeholder="请输入" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="疾病或指标" name="disease" :rules="[{ required: true, message: '请选择' }]">
              <a-select
                v-model:value="formState.disease"
                :options="diseases_types"
                :fieldNames="{ label: 'label', value: 'value' }"
                :disabled="readonly"
                placeholder="请选择"
                @change="diseaseChange"
                show-search
                :filter-option="filterOption"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12" v-if="['16', '22', '26'].includes(formState.disease)">
            <a-form-item label="疾病详情" name="diseaseDetail" :rules="[{ required: true, message: '请输入疾病详情' }]">
              <a-textarea
                v-model:value="formState.diseaseDetail"
                :maxLength="200"
                :disabled="readonly"
                placeholder="请输入疾病详情"
                :auto-size="{ minRows: 2, maxRows: 4 }"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="数值" name="numValue">
              <a-input v-model:value="formState.numValue" :maxLength="20" :disabled="readonly" placeholder="请输入" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="互保人员" name="mutualInsurancePersonName">
              <JUserModal
                type="checkbox"
                :disabled="readonly"
                :orgCode="formState.workshop ? formState.workshop : formState.orgCode"
                v-model:value="formState.mutualInsurancePersonName"
                placeholder="请选择"
              />
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item
              :label-col="{ span: 2 }"
              :wrapper-col="{ span: 22 }"
              label="采取的措施"
              name="measures"
              :rules="[{ required: true, message: '请输入' }]"
            >
              <a-textarea
                v-model:value="formState.measures"
                :maxLength="200"
                :disabled="readonly"
                placeholder="请输入"
                :auto-size="{ minRows: 2, maxRows: 5 }"
              />
            </a-form-item>
          </a-col>
          <!--          提醒频率-->
          <a-col :span="12">
            <a-form-item label="提醒频率" name="frequency" :rules="[{ required: true, message: '请选择' }]">
              <!--             数字框-->
              每
              <a-input-number v-model:value="formState.frequency" :min="1" :max="12" :disabled="readonly" placeholder="请输入" />小时一次
            </a-form-item>
          </a-col>
          <!--          提醒升级（通知高危人员负责人）-->
          <a-col :span="12">
            <a-form-item
              :label-col="{ span: 10 }"
              :wrapper-col="{ span: 10 }"
              label="提醒升级（通知高危人员负责人）"
              name="upgrade"
              :rules="[{ required: true, message: '请选择' }]"
            >
              <a-radio-group v-model:value="formState.upgrade">
                <a-radio value="1">是</a-radio>
                <a-radio value="0">否</a-radio>
              </a-radio-group>
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
      <div v-if="title == '详情'">
        <h3>历史检测记录</h3>
        <div v-bind="containerProps" class="virtual-steps-container">
          <div v-bind="wrapperProps">
            <div v-for="{ data: item, index } in virtualList" :key="index" class="virtual-step-item">
              <div class="step-indicator">
                <span class="step-dot"></span>
                <span v-if="index < (formState.items?.length ?? 0) - 1" class="step-line"></span>
              </div>
              <div class="step-content">
                <div class="step-title">{{ item.checkTime }} 记录人{{ item.userName }}</div>
                <div class="step-desc">
                  <div>数值：{{ item.numValue }}</div>
                  <div>
                    <JUpload ref="uploadRef" disabled fileType="image" :maxCount="2" v-model:value="item.checkFile" text="上传附件" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
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
  import { JUpload } from '/@/components/Form/src/jeecg/components/JUpload';
  import { archivesAdd, archivesEdit, archivesDetail, getOneByOrgCode } from '../api';
  import { BasicDrawer, useDrawerInner } from '/@/components/Drawer';
  import { FormInstance, message } from 'ant-design-vue';
  import { useUserStore } from '/@/store/modules/user';
  import { JUserModal } from '/@/components/Form';
  import { ref, reactive, computed, watch, nextTick } from 'vue';
  import { useVirtualList } from '@vueuse/core';

  const userStore: any = useUserStore();
  const diseases_types = ref<any[]>(userStore.getAllDictItems.diseases_types);
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
    sex: undefined,
    phone: '',
    nativePlace: '',
    joinDate: '',
    totalWorkAge: '',
    harmDate: '',
    harmWorkAge: '',
    formerName: '',
    maritalStatus: '',
    hobbies: '',
    educationLevel: '',
    upgrade: '',
    frequency: 0,
    diseaseDetail: undefined,
  });
  const initFlag = ref(false);
  const itemsSource = computed(() => formState.items ?? []);
  const {
    list: virtualList,
    containerProps,
    wrapperProps,
  } = useVirtualList(itemsSource, {
    itemHeight: 140,
  });

  const emits = defineEmits(['submitSuccess']);
  const submitIng = ref(false);
  const isInitializing = ref(false);
  const [register, { closeDrawer }] = useDrawerInner(async (data) => {
    isInitializing.value = true;
    initFlag.value = true;
    title.value = data.title;
    departList.value = await getDepart3ListWithSecurity();
    if (title.value == '编辑') {
      let res = await archivesDetail({ id: data.record.id });
      Object.assign(formState, res);
      orgChange(formState.orgCode, 'edit');
      workshopChange(formState.workshop, 'edit');
    }
    if (title.value == '详情') {
      readonly.value = true;
      let res = await archivesDetail({ id: data.record.id });
      Object.assign(formState, res);
      orgChange(formState.orgCode, 'edit');
      workshopChange(formState.workshop, 'edit');
      // 确保互保人员字段正确赋值
      if (res.mutualInsurancePersonName) {
        nextTick(() => {
          formState.mutualInsurancePersonName = res.mutualInsurancePersonName;
        });
      }
    }
    console.log(formState);
    nextTick(() => {
      isInitializing.value = false;
    });
  });
  const isClosing = ref(false);
  const userList = ref<any[]>([]);
  const orgChange = async (value, tag) => {
    departList2.value = await selectDeptNew({ orgCode: value });
    const users = await userListByOrg({ orgCode: value, pageSize: 100000 });
    users.records.forEach((user) => {
      user.label = `${user.realname}-${user.workNo}-${user.org3Name}`;
    });
    userList.value = users.records;
    if (!initFlag.value) {
      formState.mutualInsurancePersonName = undefined;
    }
    if (tag != 'edit') {
      formState.name = undefined;
      formState.userId = undefined;
      formState.workNo = undefined;
      formState.workshop = undefined;
      formState.sex = undefined;
    }
    diseaseChange();
  };
  // 监听疾病值改变，请求后台获取提醒规则
  const diseaseChange = async () => {
    if (isClosing.value || isInitializing.value) {
      return;
    }
    if (formState.disease == null) {
      return;
    }
    if (formState.orgCode == null) {
      return;
    }
    // 切换到非"其他"选项时清空疾病详情
    if (!['16', '22', '26'].includes(formState.disease)) {
      formState.diseaseDetail = undefined;
    }
    const res = await getOneByOrgCode({ disease: formState.disease, orgCode: formState.orgCode });
    if (formState.frequency == null) formState.frequency = res?.frequency || 0;
    if (formState.upgrade == null) formState.upgrade = res?.upgrade || '0';
  };
  const workshopChange = async (value, tag) => {
    const users = await userListByOrg({ orgCode: value, pageSize: 100000 });
    users.records.forEach((user) => {
      user.label = `${user.realname}-${user.workNo}-${user.org3Name}`;
    });
    userList.value = users.records;
    if (!initFlag.value) {
      formState.mutualInsurancePersonName = undefined;
    }
    if (tag != 'edit') {
      formState.name = undefined;
      formState.userId = undefined;
      formState.workNo = undefined;
      formState.sex = undefined;
    }
  };

  const filterOption = (input: string, option: any) => {
    return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
  };
  const userChange = (value, opt) => {
    formState.workNo = opt.workNo;
    formState.userName = opt.realname;
    formState.sex = opt.sex + '';
  };

  const handleSubmit = () => {
    formRef.value
      ?.validate()
      .then(() => {
        submitIng.value = true;
        const params = JSON.parse(JSON.stringify(formState));
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
    nextTick(() => {
      isClosing.value = false;
    });
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
  .virtual-steps-container {
    height: 480px;
    overflow-y: auto;
  }

  .virtual-step-item {
    display: flex;
    padding: 0 8px 0 0;
    min-height: 140px;
    box-sizing: border-box;
  }

  .step-indicator {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-right: 12px;
    padding-top: 4px;
    width: 16px;
    flex-shrink: 0;
  }

  .step-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: #1890ff;
    flex-shrink: 0;
  }

  .step-line {
    flex: 1;
    width: 2px;
    background: #e8e8e8;
    margin-top: 4px;
  }

  .step-content {
    flex: 1;
    padding-bottom: 16px;
  }

  .step-title {
    font-weight: 500;
    color: rgba(0, 0, 0, 0.85);
    margin-bottom: 8px;
    line-height: 22px;
  }

  .step-desc {
    color: rgba(0, 0, 0, 0.65);
    font-size: 13px;
  }

  .my-time-picker {
    width: 100%;
    display: flex;
    align-items: center;
    .line {
      width: 18px;
      text-align: center;
    }
    .time {
      flex: 1;
      position: relative;
      .t-picker {
        position: absolute;
        left: 0;
        top: 0;
      }
    }
  }
</style>
