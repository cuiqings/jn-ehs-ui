<template>
  <BasicModal v-bind="$attrs" @register="registerModal" title="举报答复" @ok="handleSubmit" width="800px" destroyOnClose>
    <div style="padding: 10px 20px">
      <!-- Report Details -->
      <a-descriptions title="举报信息" :labelStyle="{ width: '120px' }" bordered :column="1" size="small">
        <a-descriptions-item label="隐患照片">
          <JImageUpload v-model:value="record.yhPicture" :disabled="true" />
        </a-descriptions-item>
        <a-descriptions-item label="隐患描述" :span="2">{{ record.yhDescription }}</a-descriptions-item>
        <a-descriptions-item label="隐患地点">{{ record.yhPlace }}</a-descriptions-item>
        <a-descriptions-item label="举报层级">
          {{ record.reportLevel === '2' ? '厂部' : '安全部' }}
        </a-descriptions-item>
        <a-descriptions-item label="归属单位">{{ record.orgName }}</a-descriptions-item>
        <a-descriptions-item label="发现时间">{{ record.findTime }}</a-descriptions-item>
        <a-descriptions-item label="举报人">{{ record.reporterName }}</a-descriptions-item>
        <a-descriptions-item label="举报人电话">{{ record.reporterPhone }}</a-descriptions-item>
      </a-descriptions>

      <div v-if="isView && record.replyResult">
        <a-divider />
        <a-descriptions title="答复（处理）信息" :labelStyle="{ width: '120px' }" bordered :column="1" size="small">
          <a-descriptions-item v-if="record.replyResult" label="确认是否隐患">{{
            record.replyResult === '1' ? '是，确认为隐患' : '否，不是隐患'
          }}</a-descriptions-item>
          <a-descriptions-item v-if="record.replyYhLevel" label="隐患等级">{{
            record.replyYhLevel === '1' ? '一般隐患' : '重大隐患'
          }}</a-descriptions-item>
          <a-descriptions-item v-if="record.replyRepairPersonName" label="班组长（整改责任人）">{{
            record.replyRepairPersonName
          }}</a-descriptions-item>
          <a-descriptions-item v-if="record.replyReason" label="答复理由">{{ record.replyReason }}</a-descriptions-item>
        </a-descriptions>
      </div>
      <div v-if="!isView">
        <a-divider />
        <!-- Reply Form -->
        <a-form ref="formRef" :model="formData" :rules="rules" :label-col="{ span: 24 }" :wrapper-col="{ span: 24 }">
          <template v-if="!oneLevelHandle">
            <a-form-item label="确认是否隐患" name="replyResult" required>
              <div class="radio-group-vertical">
                <a-radio-group v-model:value="formData.replyResult" @change="handleReplyResultChange">
                  <div class="radio-item">
                    <a-radio value="1">是，确认为隐患</a-radio>
                  </div>
                  <div class="radio-item">
                    <a-radio value="2">否，不是隐患</a-radio>
                  </div>
                </a-radio-group>
              </div>
            </a-form-item>
          </template>

          <template v-if="(twoReply && formData.replyResult === '1') || oneLevelHandle">
            <a-form-item label="隐患等级" name="replyYhLevel">
              <a-select v-model:value="formData.replyYhLevel" placeholder="请选择隐患等级" style="width: 220px">
                <a-select-option value="1">一般隐患</a-select-option>
                <a-select-option value="2">重大隐患</a-select-option>
              </a-select>
            </a-form-item>
            <a-form-item label="选择班组长（整改责任人）" name="replyRepairPerson">
              <JSelectUser v-model:value="formData.replyRepairPerson" placeholder="请选择整改责任人" :isRadioSelection="true" style="width: 220px" />
            </a-form-item>
            <a-form-item label="答复理由" name="replyReason">
              <a-textarea v-model:value="formData.replyReason" placeholder="请输入答复理由" :rows="4" />
            </a-form-item>
          </template>

          <template v-if="showorgCodeSelect">
            <a-form-item label="归属单位" name="orgCode">
              <a-select
                style="width: 220px"
                v-model:value="formData.orgCode"
                placeholder="请选择归属单位"
                :options="orgCodeOptions"
                show-search
                optionFilterProp="label"
                allowClear
              />
            </a-form-item>
          </template>

          <template v-if="formData.replyResult === '2'">
            <a-form-item label="答复理由" name="replyReason">
              <a-textarea v-model:value="formData.replyReason" placeholder="请输入答复理由" :rows="4" />
            </a-form-item>
          </template>
        </a-form>
      </div>
    </div>
  </BasicModal>
</template>

<script lang="ts" setup>
  import { ref, reactive, computed, unref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { useMessage } from '/@/hooks/web/useMessage';
  import JSelectUser from '/@/components/Form/src/jeecg/components/JSelectUser.vue';
  import JImageUpload from '/@/components/Form/src/jeecg/components/JImageUpload.vue';
  import { reply, getOwnDepartList, handleDanger } from './api';

  const emit = defineEmits(['success', 'register']);
  const { createMessage } = useMessage();
  const formRef = ref();
  const record = ref<any>({});
  const orgCodeOptions = ref<any[]>([]);
  const isView = ref<boolean>(false);

  const formData = reactive({
    replyResult: undefined,
    replyYhLevel: undefined,
    replyRepairPerson: undefined,
    replyReason: '',
    orgCode: undefined,
  });

  const showorgCodeSelect = computed(() => {
    return record.value.reportLevel === '1' && record.value.canReply && formData.replyResult === '1';
  });
  const isSafetyNoDanger = computed(() => {
    return record.value.reportLevel === '1' && record.value.canReply && formData.replyResult === '2';
  });
  // 安全部举报-确认是隐患-归属单位处理
  const oneLevelHandle = computed(() => {
    const isSafetyWithorgCode = record.value.reportLevel === '1' && record.value.canHandle;
    return isSafetyWithorgCode;
  });
  // 厂部答复
  const twoReply = computed(() => {
    const isSafetyWithorgCode = record.value.reportLevel === '2' && record.value.canReply;
    return isSafetyWithorgCode;
  });

  const rules = computed(() => {
    return {
      replyResult: [{ required: true, message: '请确认是否隐患' }],
      replyYhLevel: [{ required: oneLevelHandle.value || twoReply.value, message: '请选择隐患等级' }],
      replyRepairPerson: [{ required: oneLevelHandle.value || twoReply.value, message: '请选择整改责任人' }],
      replyReason: [{ required: true, message: '请输入答复理由' }],
      orgCode: [{ required: showorgCodeSelect.value, message: '请选择归属单位' }],
    };
  });
  // 确认是否隐患 改变时 处理回复理由必填
  function handleReplyResultChange() {
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
  }

  const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
    setModalProps({ confirmLoading: false });
    record.value = data || {};
    isView.value = record.value.isView;
    // 如果是查看 不显示footer按钮
    setModalProps({ confirmLoading: false, minHeight: 80, showCancelBtn: !data?.isView, showOkBtn: !data?.isView });

    // Reset form
    formData.replyResult = undefined;
    formData.replyYhLevel = undefined;
    formData.replyRepairPerson = undefined;
    formData.orgCode = undefined;
    if (record.value.canHandle) {
      formData.replyResult = '1';
      formData.replyReason =
        '  感谢您对安全生产工作的关注与监督。对于您反映的问题，我单位第一时间组织专业人员核查，确认情况属实。我们将严格按照隐患治理流程完成整改。安全生产无小事，感谢您的监督。期待您继续关注公司安全工作。';
    }
    formRef.value?.clearValidate();
    const res = await getOwnDepartList();
    if (res && Array.isArray(res)) {
      orgCodeOptions.value = res.map((item) => ({
        label: item.departName,
        value: item.orgCode,
      }));
    }
  });

  async function handleSubmit() {
    try {
      await formRef.value.validate();
      setModalProps({ confirmLoading: true });
      console.log(showorgCodeSelect.value, oneLevelHandle.value, twoReply.value);
      let params = {};
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

      // handleDanger
      closeModal();
      emit('success');
    } catch (error) {
      console.error(error);
    } finally {
      setModalProps({ confirmLoading: false });
    }
  }
</script>

<style lang="less" scoped>
  .radio-group-vertical {
    .radio-item {
      margin-bottom: 10px;
      padding: 10px;
      border: 1px solid #d9d9d9;
      border-radius: 4px;
      &:last-child {
        margin-bottom: 0;
      }
    }
  }
</style>
