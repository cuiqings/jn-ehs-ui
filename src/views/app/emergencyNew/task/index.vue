<template>
  <div class="ledger">
    <div class="hd">
      <van-search v-model="queryParams.drillContent" show-action placeholder="请输入搜索关键词" @search="onSearch">
        <template #action>
          <div style="display: flex; align-items: center">
            <span @click="onSearch">搜索</span>
            <div class="filter-btn" @click="openSearch">
              <img src="../../../../assets/images/app/hazardous/filter.png" />
            </div>
          </div>
        </template>
      </van-search>
    </div>
    <div class="main">
      <List list-type="task" :immediate-check="false" :total="total" ref="listRef" @openDetail="openDetail"
        @onLoad="onLoad" @onRefresh="onRefresh" :list="list">
        <template #btn="{ item }">
          <van-button v-if="!item.startDrill && item.startDrill !== '0'" type="primary"
            @click.stop="approveClick(item, '演练方案')">演练方案</van-button>

          <van-button v-if="!item.startDrill && item.startDrill !== '0'" type="primary"
            @click.stop="approveClick(item, '开始演练')">开始演练</van-button>

          <van-button v-if="item.startDrill === '0'" type="primary"
            @click.stop="approveClick(item, '影像资料')">影像资料</van-button>

          <van-button v-if="item.startDrill === '0' && item.trainContentFlag" type="primary"
            @click.stop="approveClick(item, '动员培训')">动员培训</van-button>

          <van-button v-if="item.startDrill === '0' && !item.approvalStatus && !item.trainContentFlag" type="primary"
            @click.stop="approveClick(item, '签到二维码')">签到二维码</van-button>

          <van-button v-if="(item.startDrill === '0' && !item.approvalStatus && !item.trainContentFlag) || item.approvalStatus == 2" type="primary"
            @click.stop="approveClick(item, '演练记录')">演练记录</van-button>
            
          <van-button v-if="item.approvalStatus === '1'" type="primary"
            @click.stop="approveClick(item, '演练总结')">演练总结</van-button>

          <van-button type="primary" @click.stop="openDetail(item)">查看详情</van-button>
        </template>
      </List>
    </div>
    <SearchWrap v-model:visible="isShowSearch" @confirm="onSearch" @reset="resetSearch">
      <template #default>
        <van-field label-align="top" v-model="queryParams.drillContent" name="drillContent" label="演练内容："
          placeholder="请输入" />
        <van-field readonly label-align="top" label="所属单位:" label-width="70px" placeholder="请选择">
          <template #input>
            <a-tree-select style="width: 100%" v-model:value="queryParams.orgCode" placeholder="请选择"
              :tree-data="applicationUnitList" showSearch :dropdownStyle="{ zIndex: 3000 }"
              tree-node-filter-prop="title" :field-names="{ label: 'title', value: 'key', children: 'children' }" />
          </template>
        </van-field>
        <van-field label-align="top" v-model="queryParams.enforceDate" readonly name="enforceDate" label="实施时间："
          placeholder="请选择" @click="calendarShow = true" />
        <van-field label-align="top" v-model="queryParams.drillLocation" name="drillLocation" label="演练地点："
          placeholder="请输入" />
      </template>
    </SearchWrap>
    <van-calendar v-model:show="calendarShow" @confirm="onConfirm" />
    <a-modal v-model:visible="signShow" title="扫码签到" @ok="handleOk" style="text-align: center">
      <div class="sign-body">
        <img class="sign-img" :src="'data:image/png;base64,' + signSrc" alt="" />
      </div>
      <template #footer>
        <a-button key="back" @click="handleOk">取消</a-button>
      </template>
    </a-modal>
  </div>
</template>
<script setup lang="ts">
import { useDepartList } from '/@/views/hazardousOperation/hooks/useDepartList';
import { taskList, startDrill, signInQrCode, getDrillPersonNum } from '/@/views/emergencyNew/api';
import SearchWrap from '../../components/searchWrap.vue';
import { ref, nextTick, onMounted } from 'vue';
import List from '../components/list.vue';
import { showConfirmDialog } from 'vant';
import { useRouter } from 'vue-router';
import dayjs from 'dayjs';
const listRef = ref<InstanceType<typeof List> | null>(null);
const list = ref([]);
const total = ref(0);
const pageSize = ref(10);
const name = ref('');
const router = useRouter();
const queryParams = ref({
  drillContent: '',
  orgCode: undefined,
  drillLocation: '',
  enforceDate: '',
});

const applicationUnitList = ref<any[]>([]);
onMounted(async () => {
  const { applicationUnitList: list } = await useDepartList(9, 1);
  applicationUnitList.value = list.value;
  queryParams.value.orgCode = applicationUnitList.value[0].key;
  onLoad({
    pageNo: 1,
    pageSize: 10,
  });
});
const isShowSearch = ref(false);
const openSearch = () => {
  isShowSearch.value = true;
};
const onLoad = async (params) => {
  await pageInit(params);
  nextTick(() => {
    listRef.value?.loadEnd();
  });
};
const onSearch = () => {
  onRefresh({
    name: name.value,
    pageNo: 1,
    pageSize: pageSize.value,
  });
};
const resetSearch = () => {
  queryParams.value = {
    drillContent: '',
    orgCode: undefined,
    drillLocation: '',
    enforceDate: '',
  };
  onRefresh({
    name: name.value,
    pageNo: 1,
    pageSize: pageSize.value,
  });
};
const onRefresh = async (params) => {
  await pageInit(params);
  nextTick(() => {
    listRef.value?.refreshEnd();
  });
};
const pageInit = async (params) => {
  const res = await taskList({ ...queryParams.value, ...params });
  total.value = res.total;
  list.value = res.records;
};

const openDetail = (item) => {
  router.push({
    path: '/app/emergencyNew/taskDetail',
    query: {
      id: item.id,
    },
  });
};
const signShow = ref(false);
const signSrc = ref('');
const approveClick = (item, title) => {
  if (title === '签到二维码') {
    signInQrCode(item.id).then((res) => {
      console.log(res);
      signSrc.value = res;
      nextTick(() => {
        signShow.value = true;
      });
    });
    return;
  }
  if (title == '开始演练') {
    showConfirmDialog({
      message: '是否确认开始演练？',
    })
      .then(() => {
        startDrill(item.id).then((res) => {
          onSearch();
        });
      })
    return;
  }
  if (title == '演练记录') {
    getDrillPersonNum({
      id: item.id,
    }).then(res => {
      showConfirmDialog({
        message: `当前有${res}人参加动员培训签到，请确认已全部签到后，再上传演练记录!`,
      })
        .then(() => {
          sessionStorage.setItem('drillId', JSON.stringify(item.jsonObject))
          router.push({
            path: '/app/emergencyNew/taskCreate',
            query: {
              id: item.id,
              title: title,
            },
          });
        })
    })
    return;
  }
  router.push({
    path: '/app/emergencyNew/taskCreate',
    query: {
      id: item.id,
      title: title,
    },
  });

};
const calendarShow = ref(false);
const onConfirm = (value) => {
  queryParams.value.enforceDate = dayjs(value).format('YYYY-MM-DD');
  calendarShow.value = false;
};
const handleOk = () => {
  signShow.value = false;
};
</script>
<style lang="less" scoped>
.ledger {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;

  .hd {
    height: 54px;
    line-height: 54px;
    font-size: 14px;
    color: #333;
  }

  .filter-btn {
    margin-left: 10px;

    img {
      width: 25px;
      height: 25px;
    }
  }

  .main {
    flex: 1;
    overflow-y: auto;
    padding: 10px 16px;
  }
}
</style>
