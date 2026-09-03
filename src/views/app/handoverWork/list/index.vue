<template>
  <div class="handoverWork">
    <List :listType="8" :total="total" ref="listRef" :list="list" @onLoad="onLoad" @onRefresh="onRefresh">
      <template #btn="{ item }">
        <van-button type="primary" size="mini" @click.stop="openDetail(item)">查看</van-button>
        <van-button type="warning" v-if="hasPermission('handoverWork:change') && item.status == 1 && userInfo.orgCode == item.workshop" size="mini" @click.stop="submitWork(item)"
          >交班</van-button
        >
        <van-button type="primary" v-if="hasPermission('handoverWork:change') && item.status == 2 && userInfo.workSection == item.successionTeamId && userInfo.orgCode == item.workshop" size="mini" @click.stop="catchWork(item)"
          >接班</van-button
        >
        <van-button type="danger" size="mini" v-if="hasPermission('handoverWork:sign') && item.status == 3" @click.stop="confirmSign(item)"
          >签字</van-button
        >
      </template>
    </List>
    <van-floating-bubble icon="filter-o" @click="searchClick" />
    <van-popup v-model:show="showSearch" position="right" :style="{ height: '100%' }">
      <div class="search-box">
        <van-field
          v-model="queryParams.orgName"
          is-link
          readonly
          label-align="top"
          name="orgName"
          label="所属单位"
          placeholder="请选择"
          @click="showOrgPicker = true"
        />

        <van-field
          v-model="queryParams.workshopName"
          is-link
          readonly
          name="workshopName"
          label="所属车间"
          label-align="top"
          placeholder="请选择"
          @click="showDepartPicker = true"
        />

        <van-field
          v-model="queryParams.workTime"
          is-link
          readonly
          name="workshopName"
          label="上班时间"
          label-align="top"
          placeholder="请选择"
          @click="showTimePicker = true"
        />

        <van-field label-align="top" name="workApplyCode" label="状态">
          <template #input>
            <van-radio-group v-model="queryParams.status" direction="horizontal">
              <van-radio name="1">待交班</van-radio>
              <van-radio name="2">待接班</van-radio>
              <van-radio name="3">待签字</van-radio>
            </van-radio-group>
          </template>
        </van-field>

        <div class="foot">
          <van-button size="small" @click="reset">重置</van-button>
          <van-button size="small" @click="submitSearch" type="primary">搜索</van-button>
        </div>
      </div>
    </van-popup>
    <!-- 所属单位 -->
    <van-popup v-model:show="showOrgPicker" position="bottom">
      <van-picker :columns="orgList" @cancel="showOrgPicker = false" @confirm="onOrgConfirm" />
    </van-popup>
    <!-- 所属车间 -->
    <van-popup v-model:show="showDepartPicker" position="bottom">
      <van-picker :columns="departList" @cancel="showDepartPicker = false" @confirm="onDepartConfirm" />
    </van-popup>
    <DateTimePicker :values="queryParams.workTime" @changeValue="showTimePicker = false" :showPicker="showTimePicker" @confirm="onTimeConfirm" />
  </div>
</template>
<script lang="ts" setup>
  import { getDepart3ListWithSecurity, selectDeptNew } from '/@/api/common/api';
  import DateTimePicker from '../../components/appDateTimePicker.vue';
  import { usePermission } from '/@/hooks/web/usePermission';
  import { handoverList } from '../../../handoverWork/api';
  import { ref, nextTick, onMounted } from 'vue';
  import List from '../components/list.vue';
  import { useRouter } from 'vue-router';
  import { showFailToast, showSuccessToast } from 'vant';
  import { useUserStore } from '/@/store/modules/user';

  const userStore = useUserStore();
  const userInfo: any = userStore.getUserInfo;
  const { hasPermission } = usePermission();
  const router = useRouter();

  const listRef = ref(null);
  const total = ref(0);
  const list = ref<any[]>([]);
  const showOrgPicker = ref(false);
  const showDepartPicker = ref(false);
  const showTimePicker = ref(false);
  const orgList = ref([]);
  const departList = ref([]);

  const loading = ref(false);
  const queryParams = ref({
    pageNum: 1,
    pageSize: 10,
    orgCode: null,
    orgName: '',
    workshop: null,
    workshopName: '',
    workTime: '',
    status: null,
    statusName: '',
  });

  onMounted(() => {
    pageInit();
  });

  const onRefresh = async (params) => {
    const res = await handoverList({ ...queryParams.value, ...params });
    loading.value = false;
    list.value = res.records;
    total.value = res.total;
    nextTick(() => {
      listRef.value?.refreshEnd();
    });
  };

  const onLoad = async (params) => {
    const res = await handoverList({ ...queryParams.value, ...params });
    loading.value = false;
    list.value = [...list.value, ...res.records];
    total.value = res.total;
    nextTick(() => {
      listRef.value?.loadEnd();
    });
  };

  function pageInit() {
    getDepart3ListWithSecurity().then((res) => {
      orgList.value = res.map((item) => {
        return {
          text: item.departName,
          value: item.orgCode,
        };
      });
      if(res && res.length == 1) {
        queryParams.value.orgCode = res[0].orgCode;
        queryParams.value.orgName = res[0].departName;
        selectDeptNew({ orgCode: res[0].orgCode }).then((res) => {
          departList.value = res.map((item) => {
            return {
              text: item.departName,
              value: item.orgCode,
            };
          })
        })
      }
      onLoad(queryParams.value);
      console.log(orgList.value);
    });
  }

  const showSearch = ref(false);
  const searchClick = () => {
    showSearch.value = true;
  };

  const submitSearch = () => {
    showSearch.value = false;
    loading.value = true;
    onRefresh({ pageNum: 1, pageSize: 10 });
  };
  const reset = () => {
    queryParams.value = {
      pageNum: 1,
      pageSize: 10,
      orgCode: null,
      orgName: '',
      workshop: null,
      workshopName: '',
      workTime: '',
      status: null,
      statusName: '',
    };
    pageInit();
    showSearch.value = false;
  };
  const onOrgConfirm = (e) => {
    queryParams.value.orgCode = e.selectedOptions[0].value;
    queryParams.value.orgName = e.selectedOptions[0].text;
    showOrgPicker.value = false;
    selectDeptNew({ orgCode: e.selectedOptions[0].value }).then((res) => {
      departList.value = res.map((item) => {
        return {
          text: item.departName,
          value: item.orgCode,
        };
      });
    });
  };
  const onDepartConfirm = (e) => {
    queryParams.value.workshop = e.selectedOptions[0].value;
    queryParams.value.workshopName = e.selectedOptions[0].text;
    showDepartPicker.value = false;
  };
  const onTimeConfirm = (e) => {
    queryParams.value.workTime = e;
    showTimePicker.value = false;
  };

  const submitWork = (item) => {
    if (item.teamName == null) {
      showFailToast('班组为空，不允许交班');
      return;
    }
    router.push({ path: '/app/handoverWorkSubmit', query: { id: item.id, type: 1, orgCode: item.orgCode, workshop: item.workshop } });
  };

  const catchWork = (item) => {
    router.push({ path: '/app/handoverWorkCatch', query: { id: item.id, type: 2, orgCode: item.orgCode, workshop: item.workshop } });
  };
  const confirmSign = (item) => {
    router.push({ path: '/app/handoverWorkSign', query: { id: item.id, type: 3, orgCode: item.orgCode, workshop: item.workshop } });
  };

  const openDetail = (item) => {
    router.push({ path: '/app/handoverWorkDetail', query: { id: item.id, type: 0, orgCode: item.orgCode, workshop: item.workshop } });
  };
</script>
<style lang="less" scoped>
  .handoverWork {
    height: 100%;
    width: 100%;
    background-color: #f5f5f5;
    padding: 10px;
    overflow-y: scroll;
    .foot {
      height: 55px;
      display: flex;
      text-align: center;
      align-items: center;
      justify-content: space-around;
    }
  }
</style>
