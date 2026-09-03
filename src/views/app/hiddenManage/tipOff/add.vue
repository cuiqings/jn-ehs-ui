<template>
  <div class="tip-off-add">
    <van-form @submit="onSubmit" label-width="100px">
      <!-- 隐患照片 -->
      <van-field name="yhPicture" label="隐患照片" required :rules="[{ required: true, message: '请上传隐患照片' }]">
        <template #input>
          <AppUpload :watermarkText="watermarkText" v-model:fileList="formData.yhPicture" />
        </template>
      </van-field>

      <!-- 举报层级 -->
      <van-field
        v-model="formData.reportLevelName"
        name="reportLevelName"
        label="举报层级"
        required
        is-link
        readonly
        placeholder="请选择举报层级"
        @click="showLevelPicker = true"
        :rules="[{ required: true, message: '请选择举报层级' }]"
      />
      <van-popup v-model:show="showLevelPicker" position="bottom">
        <van-picker :columns="reportLevelOptions" @confirm="onReportLevelConfirm" @cancel="showLevelPicker = false" />
      </van-popup>

      <!-- 归属单位 -->
      <!-- 举报层级为安全部时非必填，默认登录人所属事业部 -->
      <van-field
        v-model="formData.orgName"
        name="orgName"
        label="归属单位"
        :required="formData.reportLevel === '2'"
        is-link
        readonly
        placeholder="请选择归属单位"
        @click="showUnitPicker = true"
        :rules="[{ required: formData.reportLevel === '2', message: '请选择归属单位' }]"
      />
      <van-popup v-model:show="showUnitPicker" position="bottom">
        <van-picker
          :columns="unitOptions"
          :columns-field-names="{ text: 'departName', value: 'orgCode' }"
          @confirm="onUnitConfirm"
          @cancel="showUnitPicker = false"
        />
      </van-popup>

      <!-- 隐患描述 -->
      <van-field
        v-model="formData.yhDescription"
        name="yhDescription"
        label="隐患描述"
        required
        type="textarea"
        maxlength="200"
        show-word-limit
        placeholder="请输入隐患描述"
        :rules="[{ required: true, message: '请输入隐患描述' }]"
      />

      <!-- 隐患地点 -->
      <van-field
        v-model="formData.yhPlace"
        name="yhPlace"
        label="隐患地点"
        required
        type="textarea"
        maxlength="100"
        show-word-limit
        placeholder="请输入隐患地点"
        :rules="[{ required: true, message: '请输入隐患地点' }]"
      />

      <!-- 发现时间 -->
      <van-field
        v-model="formData.findTime"
        name="findTime"
        label="发现时间"
        required
        is-link
        readonly
        placeholder="请选择发现时间"
        @click="showCalendar = true"
        :rules="[{ required: true, message: '请选择发现时间' }]"
      />
      <van-calendar v-model:show="showCalendar" @confirm="onDateConfirm" :min-date="minDate" :max-date="maxDate" />

      <!-- 举报人 -->
      <van-field v-model="formData.reporterName" name="reporterName" label="举报人" readonly />

      <!-- 举报人电话 -->
      <van-field
        v-model="formData.reporterPhone"
        name="reporterPhone"
        label="举报人电话"
        type="tel"
        maxlength="11"
        placeholder="请输入举报人电话"
        :rules="[{ pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' }]"
      />

      <div style="margin: 16px">
        <van-button round block type="primary" native-type="submit" :loading="loading"> 提交 </van-button>
      </div>
    </van-form>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import { showToast, showSuccessToast } from 'vant';
  import AppUpload from '/@/components/App/AppUpload.vue';
  import { useUserStore } from '/@/store/modules/user';
  import { tipOffAddSubmit, getOwnOrgList } from '../index.api';
  import { dateFormat } from '/@/utils/common/compUtils';
  import dayjs from 'dayjs';

  const router = useRouter();
  const userStore = useUserStore();
  const loading = ref(false);

  // 表单数据
  const formData = reactive({
    yhPicture: '', // 隐患照片
    reportLevel: '', // 举报层级 value
    reportLevelName: '', // 举报层级 label
    orgCode: '', // 归属单位 orgCode
    orgName: '', // 归属单位 label
    yhDescription: '', // 隐患描述
    yhPlace: '', // 隐患地点
    findTime: dayjs().format('YYYY-MM-DD'), // 发现时间，默认当前时间
    reporterName: '', // 举报人
    reporter: '', // 举报人id
    reporterPhone: '', // 举报人电话
  });
  const watermarkText = ref(
    `${userStore.getUserInfo.realname} ${userStore.getUserInfo.workNo} ${dateFormat(new Date(), 'yyyy-MM-dd  hh:mm:ss')} 上传`
  );

  // 举报层级选项
  const reportLevelOptions = [
    { text: '安全部', value: '1' },
    { text: '厂部', value: '2' },
  ];
  const showLevelPicker = ref(false);

  const onReportLevelConfirm = ({ selectedOptions }) => {
    const option = selectedOptions[0];
    formData.reportLevel = option.value;
    formData.reportLevelName = option.text;
    showLevelPicker.value = false;
  };

  // 归属单位选项
  const unitOptions = ref([]);
  const showUnitPicker = ref(false);

  const onUnitConfirm = ({ selectedOptions }) => {
    const option = selectedOptions[0];
    formData.orgCode = option.orgCode;
    formData.orgName = option.departName;
    showUnitPicker.value = false;
  };

  // 日期选择
  const showCalendar = ref(false);
  const minDate = new Date(2020, 0, 1);
  const maxDate = new Date();

  const onDateConfirm = (date) => {
    formData.findTime = dayjs(date).format('YYYY-MM-DD');
    showCalendar.value = false;
  };

  // 获取归属单位列表
  const fetchUnitOptions = async () => {
    try {
      const res = await getOwnOrgList({});
      unitOptions.value = res || [];

      // 设置默认归属单位（登录人所属事业部）
      // 假设 userStore.getUserInfo.orgCode 是当前用户的 orgCode
      // 需要在 unitOptions 中找到对应的 orgCode 或者其父级？
      // 题目要求：默认登录人所属事业部，可选全部三级
      // 这里假设 unitOptions 包含了所有事业部，尝试匹配
      const userOrgCode = userStore.getUserInfo?.orgCode;
      if (userOrgCode && unitOptions.value.length > 0) {
        // 简单匹配，如果用户orgCode在列表中
        const match = unitOptions.value.find((item) => item.orgCode === userOrgCode);
        if (match) {
          formData.orgCode = match.orgCode;
          formData.orgName = match.departName;
        }
      }
    } catch (error) {
      console.error('获取归属单位失败', error);
    }
  };

  // 初始化
  onMounted(() => {
    const userInfo = userStore.getUserInfo;
    if (userInfo) {
      formData.reporterName = userInfo.realname || '';
      formData.reporter = String(userInfo.id || '');
      formData.reporterPhone = userInfo.phone || '';
    }
    fetchUnitOptions();
  });

  // 提交
  const onSubmit = async () => {
    loading.value = true;
    try {
      console.log('formData', formData);
      await tipOffAddSubmit({ ...formData });
      showSuccessToast('提交成功');
       router.push('/app/hiddenManage/tipOff/list');
    } catch (error) {
      // showToast('提交失败');
      console.error(error);
    } finally {
      loading.value = false;
    }
  };
</script>

<style scoped lang="less">
  .tip-off-add {
    padding-bottom: 20px;
  }
</style>
