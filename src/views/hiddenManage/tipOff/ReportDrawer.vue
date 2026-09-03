<template>
  <BasicDrawer v-bind="$attrs" @register="registerDrawer" title="隐患举报" width="900px" showFooter @ok="handleSubmit" destroyOnClose>
    <a-form ref="formRef" :model="model" :rules="rules" :label-col="{ span: 4 }" :wrapper-col="{ span: 18 }">
      <a-form-item label="隐患照片" name="yhPicture">
        <JImageUpload v-model:value="model.yhPicture" :is-watermark="true" :fileMax="10" text="上传照片" />
      </a-form-item>
      <a-form-item label="举报层级" name="reportLevel">
        <a-select v-model:value="model.reportLevel" placeholder="请选择举报层级" @change="handlereportLevelChange">
          <a-select-option value="1">安全部</a-select-option>
          <a-select-option value="2">厂部</a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item label="归属单位" name="orgCode" :required="isorgCodeRequired">
        <a-select
          v-model:value="model.orgCode"
          placeholder="请选择归属单位"
          :options="orgCodeOptions"
          show-search
          optionFilterProp="label"
          allowClear
        />
      </a-form-item>
      <a-form-item label="隐患描述" name="yhDescription">
        <a-textarea v-model:value="model.yhDescription" :maxlength="200" show-count placeholder="请输入隐患描述" :rows="4" />
      </a-form-item>
      <a-form-item label="隐患地点" name="yhPlace">
        <a-input v-model:value="model.yhPlace" :maxlength="100" show-count placeholder="请输入隐患地点" />
      </a-form-item>
      <a-form-item label="发现时间" name="findTime">
        <a-date-picker v-model:value="model.findTime" valueFormat="YYYY-MM-DD" style="width: 100%" :allowClear="false" />
      </a-form-item>
      <a-form-item label="举报人" name="reporterName">
        <a-input v-model:value="model.reporterName" disabled />
      </a-form-item>
      <a-form-item label="举报人电话" name="reporterPhone">
        <a-input v-model:value="model.reporterPhone" :maxlength="11" placeholder="请输入举报人电话" />
      </a-form-item>
    </a-form>
  </BasicDrawer>
</template>

<script lang="ts" setup>
  import { ref, reactive, computed, unref, onMounted } from 'vue';
  import { BasicDrawer, useDrawerInner } from '/@/components/Drawer';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useUserStore } from '/@/store/modules/user';
  import JImageUpload from '/@/components/Form/src/jeecg/components/JImageUpload.vue';
  import { addReport, getOwnDepartList } from './api';
  import dayjs from 'dayjs';

  const emit = defineEmits(['success', 'register']);
  const { createMessage } = useMessage();
  const userStore = useUserStore();
  const formRef = ref();

  const model = reactive({
    yhPicture: '',
    reportLevel: undefined,
    orgCode: undefined,
    yhDescription: '',
    yhPlace: '',
    findTime: '',
    reporter: '',
    reporterName: '',
    reporterPhone: '',
  });

  const orgCodeOptions = ref<any[]>([]);
  const isorgCodeRequired = ref(false);

  const rules = computed(() => {
    return {
      yhPicture: [{ required: true, message: '请上传隐患照片' }],
      reportLevel: [{ required: true, message: '请选择举报层级' }],
      orgCode: [{ required: isorgCodeRequired.value, message: '请选择归属单位' }],
      yhDescription: [{ required: true, message: '请输入隐患描述' }],
      yhPlace: [{ required: true, message: '请输入隐患地点' }],
      findTime: [{ required: true, message: '请选择发现时间' }],
      reporterPhone: [{ pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码' }],
    };
  });

  const [registerDrawer, { setDrawerProps, closeDrawer }] = useDrawerInner(async (data) => {
    setDrawerProps({ confirmLoading: false });
    resetForm();
    await initData();
  });

  function resetForm() {
    model.yhPicture = '';
    model.reportLevel = undefined;
    model.orgCode = undefined;
    model.yhDescription = '';
    model.yhPlace = '';
    model.findTime = dayjs().format('YYYY-MM-DD');

    const userInfo = userStore.getUserInfo;
    model.reporter = String(userInfo.id);
    model.reporterName = userInfo.realname || '';
    model.reporterPhone = userInfo.phone || ''; 
  }

  async function initData() {
    // Load orgCodes
    try {
      const res = await getOwnDepartList();
      if (res && Array.isArray(res)) {
        orgCodeOptions.value = res.map((item) => ({
          label: item.departName,
          value: item.orgCode,
        }));

        const userInfo = userStore.getUserInfo;
        const userOrgCode = userInfo.orgCode;
        const match = orgCodeOptions.value.find((opt) => opt.value === userOrgCode || (userOrgCode && userOrgCode.startsWith(opt.value)));
        if (match) {
          model.orgCode = match.value;
        }
        // 举报人
        model.reporterName = userInfo.realname || '';
        model.reporterPhone = userInfo.phone || ''; // Assuming phone is stored here
      }
    } catch (e) {
      console.error(e);
    }
  }

  function handlereportLevelChange(val) {
    if (val === '2') {
      isorgCodeRequired.value = true;
    } else {
      isorgCodeRequired.value = false;
      // User said "not required" when Safety Dept.
      // Should we clear it? "非必填" implies we can keep it if selected.
    }
    formRef.value?.clearValidate(['orgCode']);
  }

  async function handleSubmit() {
    try {
      await formRef.value.validate();
      setDrawerProps({ confirmLoading: true });

      // Prepare params
      const params = {
        ...model,
      };
      console.log('addReport', params);
      await addReport(params);
      closeDrawer();
      emit('success');
    } catch (error) {
      console.error(error);
    } finally {
      setDrawerProps({ confirmLoading: false });
    }
  }
</script>
