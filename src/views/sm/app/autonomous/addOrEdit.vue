<template>
  <div class="review-page">
    <van-form ref="formRef" @submit="onSubmit">
      <van-field
        required
        v-model="form.companyName"
        is-link
        readonly
        name="companyName"
        label="相关方名称"
        placeholder="请选择"
        label-align="top"
        :rules="[{ required: true, message: '请选择相关方名称' }]"
        @click="showPicker = true && !isDisabled && title !== '修改'"
      />
      <van-popup v-model:show="showPicker" destroy-on-close position="bottom">
        <van-picker :columns="columns" @confirm="onConfirm" @cancel="showPicker = false" />
      </van-popup>
      <JUserModal
        v-model:value="form.personId"
        :userStyle="{ width: '100%' }"
        url="/xgf/xgfPerson/findByCompany"
        :fieldKeys="{
          realname: 'name',
        }"
        :params="{
          companyId: form.companyId,
        }"
        :elInfo="{ type: 'vant', attr: { label: '人员', required: true, labelAlign: 'top', rules: [{ required: true, message: '请选择人员' }] } }"
        isSerchId
        :isInit="isInit"
        :readonly="title === '修改'"
        @confirm="userConfirm"
      />
      <van-field
        required
        name="score"
        v-model="form.score"
        type="digit"
        label="考核减分分值"
        placeholder="请输入"
        label-align="top"
        :rules="[{ required: true, message: '请输入考核减分分值' }]"
        @update:model-value="updateScore"
      >
        <template #button> 当前人员分数：{{ score }} </template>
      </van-field>
      <van-field
        required
        v-model="form.remark"
        name="remark"
        label="考核原因"
        placeholder="请输入"
        :maxlength="200"
        label-align="top"
        :rules="[{ required: true, message: '请输入考核原因' }]"
      />
      <div style="margin: 16px">
        <van-button round block type="primary" :loading="loading" native-type="submit">确定</van-button>
      </div>
    </van-form>
  </div>
</template>

<script lang="ts" setup>
  import { ref, onMounted, computed } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { examine } from '../../personnelList/url/index';
  import { setAppTitle } from '/@/utils/index';
  import JUserModal from '/@/components/App/JUserModal.vue';
  import { useUserStore } from '/@/store/modules/user';
  import { getDetailList } from '../../admissionApplication/url/index';
  import { editExamine } from '../../autonomous/url/index';
  import { showToast } from 'vant';
  const userStore: any = useUserStore();
  const route: any = useRoute();
  const router = useRouter();
  const loading = ref(false);
  const formRef = ref();
  const title = ref('');
  const isDisabled = ref(false);
  const form: any = ref({
    id: '',
    companyName: '',
    companyId: undefined,
    personId: undefined,
    score: null,
    remark: '',
  });
  const showPicker = ref(false);
  const columns: any = ref([]);
  const score: any = ref('');
  const isInit = computed(() => form.value.companyId !== undefined && form.value.companyId !== '');
  onMounted(() => {
    if (route.query?.title) {
      title.value = route.query.title;
      setAppTitle(`人员考核${title.value}`);
    }
    if (route.query?.data) {
      const data = JSON.parse(route.query.data);
      Object.assign(form.value, data);
      score.value = data.totalScore;
    }
    getDetailList().then((res) => {
      columns.value = res.map((item) => {
        return { text: item.companyName, value: item.id, key: item.orgCode };
      });
      if (userStore.userInfo.orgCode.includes('A04B12') && route.query?.title === '新增') {
        isDisabled.value = true;
        const data = columns.value.filter((item) => userStore.userInfo.orgCode.includes(item.key));
        form.value.companyId = data[0].value;
        form.value.companyName = data[0].text;
      } else {
        if (route.query?.title === '新增') {
          form.value.companyId = undefined;
          form.value.companyName = '';
          isDisabled.value = false;
        }
      }
    });
  });
  const updateScore = (value) => {
    let maxScore = Number(score.value);
    if (title.value === '修改') {
      maxScore = Number(score.value) + Number(form.value.score);
    }
    if ((Number(value) <= 0 || Number(value) > maxScore) && value && score.value !== '') {
      showToast(`考核减分分值区间在1-${maxScore}之间`);
      form.value.score = null;
    }
  };
  const onConfirm = (res) => {
    form.value.companyId = res.selectedOptions[0].value;
    if (form.value.companyName !== res.selectedOptions[0].text) {
      form.value.score = null;
      form.value.personId = undefined;
      score.value = '';
    }
    form.value.companyName = res.selectedOptions[0].text;
    showPicker.value = false;
  };
  const userConfirm = (_name, _nameWorkNo, _orgCode, resultList) => {
    score.value = resultList[0].score;
  };
  const onSubmit = async () => {
    await formRef.value.validate();
    const data = JSON.parse(JSON.stringify(form.value));
    loading.value = true;
    try {
      let res = null;
      if (title.value === '新增') {
        res = await examine(data);
      } else {
        res = await editExamine(data);
      }
      if (res) {
        router.push({
          path: '/app/sm/autonomous/list',
          query: {
            active: '2',
          },
        });
      }
    } finally {
      loading.value = false;
    }
  };
</script>

<style lang="less">
  .review-page {
    padding: 12px 16px;
  }
</style>
