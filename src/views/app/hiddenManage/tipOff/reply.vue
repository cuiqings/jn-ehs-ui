<template>
  <div class="tip-off-reply">
    <!-- 顶部导航 -->
    <!-- <van-nav-bar title="举报答复" left-text="返回" left-arrow @click-left="onClickLeft" /> -->

    <div class="content">
      <!-- 举报信息 -->
      <van-cell-group title="举报信息">
        <van-cell title="隐患照片">
          <template #label>
            <AppUpload v-if="record.yhPicture" v-model:fileList="record.yhPicture" :disabled="true" />
            <span v-else>无照片</span>
          </template>
        </van-cell>
        <van-cell title="隐患描述" :label="record.yhDescription" />
        <van-cell title="隐患地点" :value="record.yhPlace" />
        <van-cell title="举报层级" :value="record.reportLevel === '2' ? '厂部' : '安全部'" />
        <van-cell title="归属单位" :value="record.orgName" />
        <van-cell title="发现时间" :value="record.findTime" />
        <van-cell title="举报人" :value="record.reporterName" />
        <van-cell title="举报人电话" :value="record.reporterPhone" />
      </van-cell-group>

      <!-- 查看模式下的答复信息 -->
      <div v-if="isView && record.replyResult">
        <van-divider>答复（处理）信息</van-divider>
        <van-cell-group>
          <van-cell title="确认是否隐患" :value="record.replyResult === '1' ? '是，确认为隐患' : '否，不是隐患'" />
          <van-cell v-if="record.replyReason" title="答复理由" :label="record.replyReason" />
          <van-cell v-if="record.replyYhLevel" title="隐患等级" :value="record.replyYhLevel === '1' ? '一般隐患' : '重大隐患'" />
          <van-cell v-if="record.replyRepairPersonName" title="整改责任人" :value="record.replyRepairPersonName" />
        </van-cell-group>
      </div>

      <!-- 编辑模式下的表单 -->
      <div class="form-section">
        <van-divider>答复处理</van-divider>
        <van-form @submit="onSubmit">
          <template v-if="!oneLevelHandle">
            <van-field name="replyResult" label="确认是否隐患" label-width="8em" required :rules="[{ required: true, message: '请确认是否隐患' }]">
              <template #input>
                <van-radio-group v-model="formData.replyResult" direction="horizontal" @change="handleReplyResultChange">
                  <van-radio name="1">是</van-radio>
                  <van-radio name="2">否</van-radio>
                </van-radio-group>
              </template>
            </van-field>
          </template>

          <template v-if="oneLevelHandle || (twoReply && formData.replyResult === '1')">
            <van-field
              v-model="replyYhLevelLabel"
              is-link
              readonly
              name="replyYhLevel"
              label="隐患等级"
              placeholder="请选择隐患等级"
              required
              :rules="[{ required: true, message: '请选择隐患等级' }]"
              @click="showYhLevelPicker = true"
            />
            <van-popup v-model:show="showYhLevelPicker" position="bottom">
              <van-picker :columns="yhLevelOptions" @confirm="onYhLevelConfirm" @cancel="showYhLevelPicker = false" />
            </van-popup>
            <van-field
              required
              name="replyRepairPersonName"
              v-model="formData.replyRepairPersonName"
              label="班组长（整改责任人）"
              placeholder="请选择班组长（整改责任人）"
              :rules="[{ required: true, message: '请选择班组长（整改责任人）' }]"
            >
              <template #input>
                <JUserModal :userStyle="{ width: '100%' }" v-model:value="formData.replyRepairPerson" type="radio" @confirm="onUserSelect" />
              </template>
            </van-field>
            <van-field
              v-model="formData.replyReason"
              name="replyReason"
              rows="3"
              autosize
              label="答复理由"
              type="textarea"
              placeholder="请输入答复理由"
              required
              :rules="[{ required: true, message: '请输入答复理由' }]"
            />
          </template>

          <template v-if="showorgCodeSelect">
            <van-field
              v-model="orgCodeLabel"
              is-link
              readonly
              name="orgCode"
              label="归属单位"
              placeholder="请选择归属单位"
              required
              :rules="[{ required: true, message: '请选择归属单位' }]"
              @click="showOrgPicker = true"
            />
            <van-popup v-model:show="showOrgPicker" position="bottom">
              <van-picker
                :columns="orgCodeOptions"
                @confirm="onOrgConfirm"
                @cancel="showOrgPicker = false"
              />
            </van-popup>
          </template>

          <template v-if="formData.replyResult === '2'">
            <van-field
              v-model="formData.replyReason"
              name="replyReason"
              rows="3"
              autosize
              label="答复理由"
              type="textarea"
              placeholder="请输入答复理由"
              required
              :rules="[{ required: true, message: '请输入答复理由' }]"
            />
          </template>

          <div style="margin: 16px">
            <van-button round block type="primary" native-type="submit"> 提交 </van-button>
          </div>
        </van-form>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { ref, reactive, computed, onMounted } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { showToast } from 'vant';
  import { reply, getOwnDepartList, handleDanger, tipOffDetail } from '../index.api';
  import AppUpload from '/@/components/App/AppUpload.vue';
  import JUserModal from '/@/components/App/JUserModal.vue';

  const route = useRoute();
  const router = useRouter();

  const record = ref<any>({});
  const isView = ref(false);

  const fileList = ref<any[]>([]);

  const formData = reactive({
    replyResult: undefined,
    replyYhLevel: undefined,
    replyRepairPerson: undefined,
    replyRepairPersonName: undefined,
    replyReason: '',
    orgCode: undefined,
  });

  const replyYhLevelLabel = ref('');

  const orgCodeLabel = ref('');
  const orgCodeOptions = ref<any[]>([]);

  const showYhLevelPicker = ref(false);
  const showUserModal = ref(false);
  const showOrgPicker = ref(false);

  const yhLevelOptions = [
    { text: '一般隐患', value: '1' },
    { text: '重大隐患', value: '2' },
  ];

  const showorgCodeSelect = computed(() => {
    return record.value.reportLevel === '1' && record.value.canReply && formData.replyResult === '1';
  });
  const isSafetyNoDanger = computed(() => {
    return record.value.reportLevel === '1' && record.value.canReply && formData.replyResult === '2';
  });
  // 安全部举报-确认是隐患-归属单位处理
  const oneLevelHandle = computed(() => {
    const isSafetyWithorgCode = record.value.reportLevel === '1' && record.value.canHandle;
    formData.replyReason =
      '感谢您对安全生产工作的关注与监督。对于您反映的问题，我单位第一时间组织专业人员核查，确认情况属实。我们将严格按照隐患治理流程完成整改。安全生产无小事，感谢您的监督。期待您继续关注公司安全工作。';
    return isSafetyWithorgCode;
  });

  // 厂部答复
  const twoReply = computed(() => {
    const isSafetyWithorgCode = record.value.reportLevel === '2' && record.value.canReply;
    return isSafetyWithorgCode;
  });

  const onClickLeft = () => {
    router.back();
  };

  const loadData = async () => {
    const id = route.query.id as string;
    let res: any = null;

    if (id) {
      try {
        res = await tipOffDetail({ id });
        if (res) {
          record.value = res;
        }
      } catch (error) {
        console.error('获取详情失败', error);
      }
    }
  };

  const initOrgOptions = async () => {
    const res = await getOwnDepartList();
    if (res && Array.isArray(res)) {
      orgCodeOptions.value = res.map((item) => ({
        text: item.departName,
        value: item.orgCode,
      }));
    }
  };

  const onYhLevelConfirm = ({ selectedOptions }) => {
    formData.replyYhLevel = selectedOptions[0].value;
    replyYhLevelLabel.value = selectedOptions[0].text;
    showYhLevelPicker.value = false;
  };

  const onOrgConfirm = ({ selectedOptions }) => {
    formData.orgCode = selectedOptions[0].value;
    orgCodeLabel.value = selectedOptions[0].text;
    showOrgPicker.value = false;
  };

  const onUserSelect = (realNames, selectedNames, orgCode, users) => {
    // JUserModal might return an array or single object depending on config.
    // Assuming array of objects with realname/username/id
    if (users && users.length > 0) {
      const user = users[0];
      formData.replyRepairPerson = user.id; // Or user.id depending on backend requirement. Web uses JSelectUser which usually returns username or id.
      formData.replyRepairPersonName = user.realname;
    }
  };
  const handleReplyResultChange = () => {
    if (!formData.replyReason) {
      if (formData.replyResult === '1') {
        formData.replyReason =
          '感谢您对安全生产工作的关注与监督。对于您反映的问题，我单位第一时间组织专业人员核查，确认情况属实。我们将严格按照隐患治理流程完成整改。安全生产无小事，感谢您的监督。期待您继续关注公司安全工作。';
      }
      if (formData.replyResult === '2') {
        formData.replyReason =
          '感谢您对安全生产工作的关注与监督。对于您反映的问题，我单位第一时间组织专业人员现场核查：符合[对应安全规范] 的要求；查阅管理资料，未发现违规。综上，您反映的隐患事项不属实。安全生产无小事，感谢您的监督。期待您继续关注公司安全工作。';
      }
    }
  };

  const onSubmit = async () => {
    try {
      let params: any = {};
      if (showorgCodeSelect.value) {
        // 安全部1 答复
        params.orgCode = formData.orgCode;
        await reply({ ...params, id: record.value.id });
      }
      if (isSafetyNoDanger.value) {
        // 安全部1 - 确认不是隐患
        params.replyResult = formData.replyResult;
        params.replyReason = formData.replyReason;
        await reply({ ...params, id: record.value.id });
      }
      if (oneLevelHandle.value) {
        // 安全部1 - 归属单位处理
        params.replyYhLevel = formData.replyYhLevel;
        params.replyRepairPerson = formData.replyRepairPerson;
        params.replyReason = formData.replyReason;
        await handleDanger({ ...params, id: record.value.id });
      }
      if (twoReply.value) {
        // 厂部2 - 答复
        await reply({ ...formData, id: record.value.id });
      }
      // 跳转到详情页
      router.push({
        path: '/app/hiddenManage/tipOff/detail',
        query: {
          id: record.value.id,
        },
      });
    } catch (error) {
      console.error(error);
    }
  };

  onMounted(() => {
    loadData();
    initOrgOptions();
  });
</script>

<style lang="less" scoped>
  .tip-off-reply {
    min-height: 100vh;
    background-color: #f7f8fa;
    .content {
      padding-bottom: 20px;
    }
    .form-section {
      background-color: #fff;
      margin-top: 10px;
      padding: 10px;
    }
  }
</style>
