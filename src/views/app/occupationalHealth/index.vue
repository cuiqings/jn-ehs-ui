<template>
  <div class="ledger">
    <div class="hd">
      <van-search v-model="queryParams.name" show-action placeholder="请输入姓名" @search="onSearch">
        <template #action>
          <div style="display: flex; align-items: center">
            <span @click="onSearch">搜索</span>
            <div class="filter-btn" @click="openSearch">
              <img src="../../../assets/images/app/hazardous/filter.png" />
            </div>
          </div>
        </template>
      </van-search>
    </div>
    <van-tabs v-model:active="activeIndex" class="main" @click-tab="onClickTab">
      <van-tab title="需要体检" :name="1">
        <div class="tabinner">
          <List :total="total1" :tabtype="1" ref="listRef1" @onLoad="onLoad" @openDetail="openDetail" @onRefresh="onRefresh" :list="datalist1">
            <template #btn="{ item }">
              <div style="display: flex; justify-content: flex-end">
                <van-button v-auth="'occupationalHealth:checkup:edit'" type="primary" @click.stop="approveClick(item, 'edit')">上传</van-button>
                <van-button
                  v-auth="'occupationalHealth:checkup:edit1'"
                  v-if="item.editStatus == 1"
                  style="margin-left: 10px"
                  type="primary"
                  @click.stop="approveClick(item, 'update')"
                  >编辑</van-button
                >
                <van-button v-auth="'occupationalHealth:checkup:del'" style="margin-left: 10px" type="danger" @click.stop="delClick(item)"
                  >删除</van-button
                >
                <van-button style="margin-left: 10px" plain type="primary" @click.stop="openDetail(item)">查看详情</van-button>
                <van-button
                  style="margin-left: 10px"
                  v-if="item.status === '待体检'"
                  v-auth="'occupationalHealth:checkup:uncheck'"
                  type="primary"
                  @click.stop="noCheckClick(item, 1)"
                  >无需体检</van-button
                >
                <van-button
                  style="margin-left: 10px"
                  v-if="item.status === '无需体检'"
                  v-auth="'occupationalHealth:checkup:check'"
                  type="primary"
                  @click.stop="noCheckClick(item, 2)"
                  >需要体检</van-button
                >
              </div>
            </template>
          </List>
        </div>
      </van-tab>
      <van-tab title="无需体检" :name="2">
        <div class="tabinner">
          <List :total="total2" :tabtype="2" ref="listRef2" @onLoad="onLoad" @openDetail="openDetail" @onRefresh="onRefresh" :list="datalist2">
            <template #btn="{ item }">
              <div style="display: flex; justify-content: flex-end">
                <van-button v-auth="'occupationalHealth:checkup:edit'" type="primary" @click.stop="approveClick(item, 'edit')">上传</van-button>
                <van-button
                  v-auth="'occupationalHealth:checkup:edit1'"
                  v-if="item.editStatus == 1"
                  style="margin-left: 10px"
                  type="primary"
                  @click.stop="approveClick(item, 'update')"
                  >编辑</van-button
                >
                <van-button v-auth="'occupationalHealth:checkup:del'" style="margin-left: 10px" type="danger" @click.stop="delClick(item)"
                  >删除</van-button
                >
                <van-button style="margin-left: 10px" plain type="primary" @click.stop="openDetail(item)">查看详情</van-button>
              </div>
            </template>
          </List>
        </div>
      </van-tab>
      <van-tab title="待检测录入" :name="3">
        <div class="tabinner">
          <List :total="total3" :tabtype="3" ref="listRef3" @onLoad="onLoad" @openDetail="openDetail" @onRefresh="onRefresh" :list="datalist3">
            <template #btn="{ item }">
              <div style="display: flex; justify-content: flex-end">
                <van-button v-auth="'occupationalHealth:checkup:edit'" type="primary" @click.stop="approveClick(item, 'edit')">上传</van-button>
                <van-button
                  v-auth="'occupationalHealth:checkup:edit1'"
                  v-if="item.editStatus == 1"
                  style="margin-left: 10px"
                  type="primary"
                  @click.stop="approveClick(item, 'update')"
                  >编辑</van-button
                >
                <van-button v-auth="'occupationalHealth:checkup:del'" style="margin-left: 10px" type="danger" @click.stop="delClick(item)"
                  >删除</van-button
                >
                <van-button style="margin-left: 10px" plain type="primary" @click.stop="openDetail(item)">查看详情</van-button>
              </div>
            </template>
          </List>
        </div>
      </van-tab>
    </van-tabs>

    <van-dialog v-model:show="dialogShow" title="标题" :beforeClose="beforeClose" show-cancel-button @cancel="dialogCancel">
      <van-form ref="formRef">
        <van-field required label="原因：" label-align="top"  v-model="reason" :rules="[{ required: true, message: '请输入无需体检原因' }]"
          rows="3"
          autosize
          type="textarea" placeholder="请输入无需体检原因" />
      </van-form>

    </van-dialog>

    <SearchWrap v-model:visible="isShowSearch" @confirm="onSearch" @reset="resetSearch">
      <template #default>
        <van-field
          label-align="top"
          v-model="queryParams.orgCodeName"
          readonly
          name="orgCodeName"
          label="所属单位："
          placeholder="请选择"
          @click="showPicker.orgCode = true"
        />

        <van-field
          label-align="top"
          v-model="queryParams.workshopName"
          readonly
          name="workshopName"
          label="所属车间："
          placeholder="请选择"
          @click="showPicker.workshop = true"
        />

        <van-field label-align="top" v-model="queryParams.post" name="post" label="岗位：" placeholder="请输入" />

        <van-field label-align="top" v-model="queryParams.name" name="name" label="姓名：" placeholder="请输入" />

        <van-field
          label-align="top"
          v-model="queryParams.statusName"
          readonly
          name="status"
          label="状态："
          placeholder="请选择"
          @click="showPicker.status = true"
        />

        <van-field
          label-align="top"
          v-model="queryParams.checkResultName"
          readonly
          name="checkResult"
          label="检查结果："
          placeholder="请选择"
          @click="showPicker.checkResult = true"
        />

        <van-field
          label-align="top"
          v-model="queryParams.typeName"
          readonly
          name="type"
          label="体检种类："
          placeholder="请选择"
          @click="showPicker.type = true"
        />
      </template>
    </SearchWrap>

    <!--所属单位-->
    <van-popup v-model:show="showPicker.orgCode" position="bottom">
      <van-picker
        :columns-field-names="{ text: 'departName', value: 'orgCode' }"
        :columns="selectList.orgCode"
        @cancel="showPicker.orgCode = false"
        @confirm="onConfirm($event, 'orgCode')"
      />
    </van-popup>

    <!--所属车间-->
    <van-popup v-model:show="showPicker.workshop" position="bottom">
      <van-picker
        :columns-field-names="{ text: 'departName', value: 'orgCode' }"
        :columns="selectList.workshop"
        @cancel="showPicker.workshop = false"
        @confirm="onConfirm($event, 'workshop')"
      />
    </van-popup>

    <!--状态：-->
    <van-popup v-model:show="showPicker.status" position="bottom">
      <van-picker :columns="selectList.status" @cancel="showPicker.status = false" @confirm="onConfirm($event, 'status')" />
    </van-popup>

    <!--检查结果：-->
    <van-popup v-model:show="showPicker.checkResult" position="bottom">
      <van-picker :columns="selectList.checkResult" @cancel="showPicker.checkResult = false" @confirm="onConfirm($event, 'checkResult')" />
    </van-popup>
    <!--体检种类：-->
    <van-popup v-model:show="showPicker.type" position="bottom">
      <van-picker :columns="selectList.type" @cancel="showPicker.type = false" @confirm="onConfirm($event, 'type')" />
    </van-popup>
  </div>
</template>
<script setup lang="ts" name="app:occupationalHealth">
  import { useDepartList } from '/@/views/hazardousOperation/hooks/useDepartList';
  import { getDepart3ListWithSecurity, selectDeptNew } from '/@/api/common/api';
  import { physicalExaminationList, physicalExaminationDel, updState } from '/@/views/occupationalHealth/api';
  import SearchWrap from '../components/searchWrap.vue';
  import { ref, nextTick, onMounted } from 'vue';
  import { showConfirmDialog, showFailToast } from 'vant';
  import List from './components/list.vue';
  import { useRouter } from 'vue-router';
  const listRef1 = ref<InstanceType<typeof List> | null>(null);
  const datalist1 = ref<any[]>([]);
  const listRef2 = ref<InstanceType<typeof List> | null>(null);
  const datalist2 = ref<any[]>([]);
  const listRef3 = ref<InstanceType<typeof List> | null>(null);
  const datalist3 = ref<any[]>([]);
  const pageSize = ref(10);
  const total1 = ref(0);
  const total2 = ref(0);
  const total3 = ref(0);
  const name = ref('');
  const router = useRouter();
  const activeIndex = ref(1);
  const queryParams = ref({
    orgCode: '',
    orgCodeName: '',
    workshop: '',
    workshopName: '',
    post: '',
    name: '',
    status: '',
    statusName: '',
    checkResult: '',
    checkResultName: '',
    typeName: '',
    type: '',
  });
  const showPicker = ref({
    orgCode: false,
    workshop: false,
    status: false,
    checkResult: false,
    type: false,
  });
  const selectList = ref({
    orgCode: [],
    workshop: [],
    status: [
      {
        text: '待危害因素检测',
        value: '1',
      },
      {
        text: '完成',
        value: '2',
      },
      {
        text: '待体检',
        value: '3',
      },
      {
        text: '复查',
        value: '4',
      },
    ],
    checkResult: [
      {
        text: '未见异常',
        value: '1',
      },
      {
        text: '疑似职业病',
        value: '2',
      },
      {
        text: '禁忌证',
        value: '3',
      },
      {
        text: '其他疾患',
        value: '4',
      },
      {
        text: '复查',
        value: '5',
      },
    ],
    type: [
      {
        text: '岗前',
        value: '1',
      },
      {
        text: '在岗',
        value: '2',
      },
      {
        text: '离岗',
        value: '3',
      },
    ],
  });
  // 无需体检弹框
  const dialogShow = ref(false);
  const reason = ref('');
  const loading = ref(false);
  const applicationUnitList = ref<any[]>([]);
  onMounted(async () => {
    const { applicationUnitList: list } = await useDepartList(9);
    applicationUnitList.value = list.value;
  });
  const isShowSearch = ref(false);
  const openSearch = () => {
    isShowSearch.value = true;
  };
  const onLoad = async (params) => {
    let res = await getList(params);
    if (activeIndex.value == 1) {
      datalist1.value = [...datalist1.value, ...res];
      nextTick(() => {
        listRef1.value?.loadEnd();
      });
    }
    if (activeIndex.value == 2) {
      datalist2.value = [...datalist2.value, ...res];
      nextTick(() => {
        listRef2.value?.loadEnd();
      });
    }
    if (activeIndex.value == 3) {
      datalist3.value = [...datalist3.value, ...res];
      nextTick(() => {
        listRef3.value?.loadEnd();
      });
    }
  };
  const onSearch = () => {
    if (activeIndex.value == 1) {
      onRefresh({
        name: name.value,
        pageNo: 1,
        pageSize: pageSize.value,
      });
    }
    if (activeIndex.value == 2) {
      onRefresh({
        name: name.value,
        pageNo: 1,
        pageSize: pageSize.value,
      });
    }
    if (activeIndex.value == 3) {
      onRefresh({
        name: name.value,
        pageNo: 1,
        pageSize: pageSize.value,
      });
    }
  };
  const resetSearch = () => {
    queryParams.value = {
      drillContent: '',
      orgCode: undefined,
      drillLocation: '',
      enforceDate: '',
    };

    if (activeIndex.value == 1) {
      onRefresh({
        name: name.value,
        pageNo: 1,
        pageSize: pageSize.value,
      });
    }
    if (activeIndex.value == 2) {
      onRefresh({
        name: name.value,
        pageNo: 1,
        pageSize: pageSize.value,
      });
    }
    if (activeIndex.value == 3) {
      onRefresh({
        name: name.value,
        pageNo: 1,
        pageSize: pageSize.value,
      });
    }
  };
  const onRefresh = async (params) => {
    loading.value = true;
    let res = await getList(params).finally(() => (loading.value = false));
    if (activeIndex.value == 1) {
      datalist1.value = res;
      console.log(datalist1.value);
      nextTick(() => {
        listRef1.value?.refreshEnd();
      });
    }
    if (activeIndex.value == 2) {
      datalist2.value = res;
      nextTick(() => {
        listRef2.value?.refreshEnd();
      });
    }
    if (activeIndex.value == 3) {
      datalist3.value = res;
      nextTick(() => {
        listRef3.value?.refreshEnd();
      });
    }
  };
  const pageInit = async () => {
    selectList.value.orgCode = await getDepart3ListWithSecurity();
    if (selectList.value.orgCode.length == 1) {
      queryParams.value.orgCode = selectList.value.orgCode[0].orgCode;
      queryParams.value.orgCodeName = selectList.value.orgCode[0].departName;
      getworkshopList();
    }
  };
  pageInit();
  const onClickTab = (i) => {
    activeIndex.value = i.name;
  };
  // 无需体检
  const curItem = ref<any>({});
    const formRef = ref();
  const noCheckClick = (item, tag) => {
    curItem.value = item;
    if(tag == 1) {
      dialogShow.value = true
      return
    }
   showConfirmDialog({
      title: '需要体检',
      message:
        '确认要恢复体检吗？',
    })
    .then(() => {
      updState({
        id: item.id,
        status: 3
      }).then(_ => {
        dialogShow.value = false
        curItem.value.status = '待体检'
        reason.value = '';
      }).catch(_ => {
        showFailToast({
          message: '操作失败',
        });
      })
    })
    .catch(() => {
      // on cancel
    });
  }
  const dialogCancel = (c) => {
    reason.value = '';
  }

  const beforeClose = (c) => {
    if(c == 'cancel') return true;
    return new Promise((resolve, rej) => {
      formRef.value.validate().then(res => { 
        updState({
          id: curItem.value.id,
          reason: reason.value,
          status: 1
        }).then(_ => {
          dialogShow.value = false
          curItem.value.status = '无需体检'
          reason.value = '';
          resolve(true)
        }).catch(_ => {
          showFailToast({
            message: '操作失败',
          });
        })
      }).catch(_ => {
        resolve(false)
      })
    })
  }

  const getList = async (params) => {
    const res = await physicalExaminationList({ ...params, ...queryParams.value, dataType: activeIndex.value });
    if (activeIndex.value == 1) total1.value = res.total;
    if (activeIndex.value == 2) total2.value = res.total;
    if (activeIndex.value == 3) total3.value = res.total;
    return res.records;
  };
  const getworkshopList = async () => {
    selectList.value.workshop = await selectDeptNew({ orgCode: queryParams.value.orgCode });
  };

  const openDetail = (item) => {
    router.push({
      path: '/app/occupationalHealth/detail',
      query: {
        id: item.id,
        type: 'detail',
      },
    });
  };
  const approveClick = (item, type) => {
    router.push({
      path: '/app/occupationalHealth/detail',
      query: {
        id: item.id,
        type,
      },
    });
  };
  const delClick = (item) => {
    showConfirmDialog({
      title: '删除',
      message: '确认要删除吗？',
    })
      .then(() => {
        physicalExaminationDel({ id: item.id }).then((res) => {
          onSearch();
        });
      })
      .catch(() => {
        // on cancel
      });
  };
  const onConfirm = (value, key) => {
    switch (key) {
      case 'orgCode':
        queryParams.value[key] = value.selectedValues[0];
        queryParams.value[key + 'Name'] = value.selectedOptions[0].departName;
        showPicker.value[key] = false;
        getworkshopList();
        break;
      case 'workshop':
        queryParams.value[key] = value.selectedValues[0];
        queryParams.value[key + 'Name'] = value.selectedOptions[0].departName;
        showPicker.value[key] = false;
        break;
      default:
        queryParams.value[key] = value.selectedValues[0];
        queryParams.value[key + 'Name'] = value.selectedOptions[0].text;
        showPicker.value[key] = false;
        break;
    }
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
      overflow: hidden;
    }
    .tabinner {
      height: calc(100vh - 99px);
      overflow-y: auto;
      padding: 10px;
    }
    .tab {
      height: 45px;
      display: flex;
      justify-content: space-around;
      align-items: center;
      .active {
        border-bottom: 2px solid #1989fa;
      }
    }
  }
</style>
