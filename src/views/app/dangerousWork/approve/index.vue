<template>
  <div class="hiddendanger">
    <List :listType="2" :total="total1" ref="listRef1" @openDetail="openDetail" @edit="edit" :list="list" @onLoad="onLoad" @onRefresh="onRefresh">
      <template #btn="{ item }">
        <van-button type="primary" size="mini" @click.stop="edit(item)">去审批</van-button>
        <van-button type="primary" size="mini" @click.stop="openDetail(item)">查看详情</van-button>
      </template>
    </List>
    <CurLoading v-if="loading" />
  </div>
</template>
<script lang="ts" setup>
  import { getWorkExamineList, getApplyForUnit, delJobList } from '../../../hazardousOperation/api/index';
  import { showSuccessToast, showConfirmDialog } from 'vant';
  import CurLoading from '../../components/loading.vue';
  import { ref, nextTick, reactive, computed } from 'vue';
  import { setAppTitle } from '/@/utils/index';
  import List from '../components/list.vue';
  import { useRoute, useRouter } from 'vue-router';
  setAppTitle();
  const router = useRouter();
  const list = ref<any[]>([]);
  const loading = ref(true);
  const pageNo = ref(1);
  const pageSize = ref(10);
  const active = ref('1');
  const route = useRoute();
  const isUnhazardousWork = computed(() => {
    return route.name === 'AppUnhazardousWorkApprove';
  });
  const applicantUnit = ref([]);
 

  const queryParams = reactive<{
    state?: string;
    stateText?: string;
    workType?: string;
    workTypeText?: string;
    applicationUnit?: string;
    applicationUnitText?: string;
    workApplyCode?: string;
    applicant?: string;
  }>({});


  getApplyForUnit().then((res) => {
    applicantUnit.value.push(...(res as never[]));
  });

  const listRef1 = ref();
  const total1 = ref(0);

  const show = ref(false);

  const onRefresh = async (params) => {
    const res = await getList({ ...params, ...queryParams, type: isUnhazardousWork.value ? '2' : '1' });
    loading.value = false;
    list.value = res.records;
    total1.value = res.total;
    nextTick(() => {
      listRef1.value.refreshEnd();
    });
  };

  const onLoad = async (params) => {
    const res = await getList({ ...params, ...queryParams, type: isUnhazardousWork.value ? '2' : '1'});
    loading.value = false;
    list.value = [...list.value, ...res.records];
    total1.value = res.total;
    nextTick(() => {
      listRef1.value.loadEnd();
    });
    
  };

  // 首次加载列表
  onLoad({});

  function getList(params?) {
    return getWorkExamineList({
      state: active.value,
      pageNo: pageNo.value,
      pageSize: pageSize.value,
      ...params,
    });
  }

  // 按钮跳转
  const edit = (item) => {
    console.log(item);
    let url = `/app/dangerousWork/approvedetail`;
    if (isUnhazardousWork.value) {
      url = `/app/unhazardousWork/approvedetail`;
    }
    let query = { id: item.id, workType: item.workType, pageType: 'edit', exam: true };
    if (item.delayedMark) query['delayedMark'] = true;
    router.push({ path: url, query: query });
  };

  // 卡片跳转
  const openDetail = (item) => {
    let url = `/app/dangerousWork/detail`;
    if (isUnhazardousWork.value) {
      url = `/app/unhazardousWork/detail`;
    }
    let query = { id: item.id, workType: item.workType, pageType: 'detail' };
    if (item.delayedMark) query['delayedMark'] = true;
    router.push({ path: url, query: query });
  };

  // 删除
  const del = (item) => {
    console.log(item);
    showConfirmDialog({
      title: '删除',
      message: '是否确认删除，删除后不可恢复！',
    })
      .then(() => {
        delJobList({ id: item.id }).then((res) => {
          showSuccessToast({ message: '删除成功！', duration: 300 });
          onRefresh({});
        });
      })
      .catch((err) => {
        console.log(err);
      });
  };
</script>

<style lang="less" scoped>
  .hiddendanger {
    width: 100%;
    height: 100%;
    background-color: #eff1f5;
    overflow-y: scroll;
  }
</style>
