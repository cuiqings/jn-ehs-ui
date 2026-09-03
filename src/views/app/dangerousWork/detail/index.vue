<template>
  <div class="hiddendanger">
    <van-tabs v-model:active="active" @change="tabChange">
      <van-tab title="待处理" name="1">
        <div class="tab-inner">
          <List
            :listType="2"
            :total="total1"
            ref="listRef1"
            @openDetail="openDetail"
            @edit="edit"
            :list="list"
            @onLoad="onLoad"
            @onRefresh="onRefresh">
            <template #btn="{ item }">
              <van-button type="primary" size="mini" @click.stop="edit(item)">去审批</van-button>
            </template>
          </List>
        </div>
      </van-tab>
      <van-tab title="已处理" name="2">
        <div class="tab-inner">
          <List
            :listType="2"
            :total="total2"
            :needBtn="false"
            ref="listRef2"
            @openDetail="openDetail"
            @edit="edit"
            :list="list2"
            @onLoad="onLoad"
            @onRefresh="onRefresh"
          />
        </div>
      </van-tab>
    </van-tabs>
    <CurLoading v-if="loading" />
  </div>
</template>
<script lang="ts" setup>
  import { getWorkExamineList, getApplyForUnit, delJobList } from '../../../hazardousOperation/api/index';
  import { showSuccessToast, showConfirmDialog } from 'vant';
  import CurLoading from '../../components/loading.vue';
  import { useUserStore } from '/@/store/modules/user';
  import { ref, nextTick, reactive } from 'vue';
  import { setAppTitle } from '/@/utils/index';
  import List from '../components/list.vue';
  import { useRouter } from 'vue-router';
  setAppTitle();
  const router = useRouter();
  const list = ref<any[]>([]);
  const list2 = ref<any[]>([]);
  const loading = ref(true);
  const pageNo = ref(1);
  const pageSize = ref(10);
  const showPicker = ref(false);
  const showPicker1 = ref(false);
  const showPicker2 = ref(false);
  const active = ref('1');

  const applicantUnit = ref([]);
  const customFieldName = {
    text: 'departName',
    value: 'orgCode',
  };

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

  const userStore: any = useUserStore();
  const work_typeList = userStore.getAllDictItems.work_type;
  const stateOptions = [
    { text: '待提交', value: '1' },
    { text: '审批中', value: '2' },
    { text: '审批退回', value: '3' },
    { text: '审批通过', value: '4' },
  ];
  console.log(work_typeList);

  getApplyForUnit().then((res) => {
    applicantUnit.value.push(...(res as never[]));
    console.log(applicantUnit.value);
  });

  const listRef1 = ref();
  const total1 = ref(0);

  const listRef2 = ref();
  const total2 = ref(0);

  const show = ref(false);

  const onRefresh = async (params) => {
    const res = await getList({ ...params, ...queryParams });
    loading.value = false;
    if (active.value == '1') {
      list.value = res.records;
      total1.value = res.total;
      nextTick(() => {
        listRef1.value.refreshEnd();
      });
    } else {
      list2.value = res.records;
      total2.value = res.total;
      nextTick(() => {
        listRef2.value.refreshEnd();
      });
    }
  };

  const onLoad = async (params) => {
    const res = await getList({ ...params, ...queryParams });
    loading.value = false;
    if (active.value == '1') {
      list.value = [...list.value, ...res.records];
      total1.value = res.total;
      nextTick(() => {
        listRef1.value.loadEnd();
      });
    } else {
      list2.value = [...list2.value, ...res.records];
      total2.value = res.total;
      nextTick(() => {
        listRef2.value.loadEnd();
      });
    }
  };

  const tabChange = (e) => {
    if (e == '1' && list.value.length == 0) {
      onRefresh({});
    }
    if (e == '2' && list2.value.length == 0) {
      onRefresh({});
    }
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
    let query = { id: item.id, workType: item.workType, pageType: 'edit', exam: true };
    if(item.delayedMark) query['delayedMark'] = true;
    router.push({ path: url, query: query });
  };

  // 卡片跳转
  const openDetail = (item) => {
    let url = `/app/dangerousWork/approvedetail`;
    router.push({ path: url, query: { id: item.id, workType: item.workType, pageType: 'detail' } });
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

  const toAdd = () => {
    router.push({ path: '/app/dangerousWork/applyItem' });
  };

  const openSearch = () => {
    show.value = true;
  };
</script>

<style lang="less" scoped>
  .hiddendanger {
    width: 100%;
    height: 100%;
    background-color: #eff1f5;
    display: flex;
    flex-direction: column;

    .tab-inner {
      height: calc(100vh - 55px);
      overflow-y: scroll;
      background: #eff1f5;
      padding: 10px 15px;
    }

    .hd {
      width: 100%;
      height: 55px;
      padding: 0 15px;
      display: flex;
      align-items: center;
      justify-content: space-around;
      // background-color: #ffffff;

      .add {
        width: 28px;
        height: 28px;
        transform: translateY(-2px);
      }

      .right {
        width: 70px;
        display: flex;
        align-items: center;
        justify-content: flex-end;

        .search-btn {
          color: #1989fa;
        }
      }

      .filter-btn {
        margin-left: 10px;

        img {
          width: 25px;
          height: 25px;
        }
      }

      .van-cell {
        padding: 3px !important;
      }
    }
  }
</style>
