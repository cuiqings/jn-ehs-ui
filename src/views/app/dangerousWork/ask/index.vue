<template>
  <div class="hiddendanger">
    <div class="hd">
      <div class="add-btn" v-if="hasPermission('WorkRequisition:add')" @click="toAdd">
        <img src="../../../../assets/images/app/hazardous/icon_plus.png" alt="" class="add" />
      </div>
      <div style="flex: 1; padding: 0 10px">
        <van-field size="normal" clearable v-model="queryParams.contentOrCode" placeholder="请输入关键词" />
      </div>
      <div class="right">
        <span class="search-btn" @click="searchClick">筛选</span>
        <div class="filter-btn" @click="openSearch">
          <img src="../../../../assets/images/app/hazardous/filter.png" />
        </div>
      </div>
    </div>
    <div class="tab-inner">
      <List :listType="8" :total="total1" ref="listRef1" @edit="edit" @del="del" :list="list" @onLoad="onLoad" @onRefresh="onRefresh">
        <template #btn="{ item }">
          <van-button type="primary" size="mini" @click.stop="openDetail(item)">查看</van-button>
          <van-button type="warning" v-if="hasPermission('WorkRequisition:add')" size="mini" @click.stop="copy(item)">复用</van-button>
          <van-button
            type="primary"
            v-if="!['审批中', '审批通过'].includes(item.stateName) && userStore.getUserInfo.username == item.createBy"
            size="mini"
            @click.stop="edit(item)"
            >编辑</van-button
          >
          <van-button
            type="danger"
            v-if="
              userStore.getUserInfo.orgCode == 'A04B01C11' ||
              userStore.getUserInfo.username == item.createBy ||
              userStore.getUserInfo.username == 'admin'
            "
            size="mini"
            @click.stop="del(item)"
            >删除</van-button
          >
          <van-button
            type="primary"
            v-auth="'WorkRequisition:updateGuardian'"
            v-if="item.sceneHead && item.sceneHead.includes(userStore.getUserInfo.id) && (item.state == 2 || item.state == 0)"
            size="mini"
            @click.stop="changePersonClick(item)"
            >添加人员</van-button
          >
        </template>
      </List>
    </div>
    <van-popup v-model:show="show" position="right" :style="{ height: '100%' }">
      <div class="search-box">
        <van-field
          v-model="queryParams.stateText"
          is-link
          readonly
          label-align="top"
          name="stateText"
          label="审批状态"
          placeholder="请选择"
          @click="showPicker = true"
        />

        <van-field
          v-model="queryParams.workTypeText"
          v-if="!isUnhazardousWork"
          is-link
          readonly
          name="workTypeText"
          label="作业类型"
          label-align="top"
          placeholder="请选择"
          @click="showPicker1 = true"
        />

        <van-field v-model="queryParams.workApplyCode" label-align="top" name="workApplyCode" label="编号" placeholder="请输入编号" />

        <van-field v-model="queryParams.applicationUnitText" label-align="top" readonly name="applicationUnitText" label="申请单位">
          <template #input>
            <a-tree-select
              style="width: 100%"
              v-model:value="queryParams.applicationUnit"
              placeholder="请选择"
              :tree-data="applicantUnit"
              showSearch
              @change="applicationUnitChange"
              tree-node-filter-prop="name"
              :dropdownStyle="{ zIndex: 3000 }"
              :field-names="{ label: 'name', value: 'code', children: 'children' }"
            />
          </template>
        </van-field>

        <JUserModal :elInfo="{ type: 'vant', attr: { 'label-align': 'top', label: '申请人', required: false } }" v-model:value="queryParams.applicant" />

        <TreeSelect
          :value="queryParams.applicant"
          :isRadio="true"
          :not-tree="true"
          value-key="id"
          title-key="title"
          v-model:show="applicantShow"
          :items="person"
          @change="onConfirm($event, 'applicant')"
        />

        <div class="foot">
          <van-button size="small" @click="reset">重置</van-button>
          <van-button size="small" @click="searchClick" type="primary">搜索</van-button>
        </div>
      </div>
    </van-popup>
    <!--审批状态-->
    <van-popup v-model:show="showPicker" position="bottom">
      <div class="poup-hd">
        <van-button style="border: none; color: #969799; font-size: 16px" @click="cancel">取消</van-button>
        <van-button style="border: none; color: #6398fb; font-size: 16px" @click="onConfirm($event, 'state')">确认</van-button>
      </div>
      <van-checkbox-group v-for="item in stateOptions" v-model="queryParams.state">
        <van-cell :title="item.text">
          <template #right-icon>
            <van-checkbox :name="item.value" />
          </template>
        </van-cell>
      </van-checkbox-group>
    </van-popup>
    <van-popup v-model:show="showPicker1" position="bottom">
      <div class="poup-hd">
        <van-button style="border: none; color: #969799; font-size: 16px" @click="cancel2">取消</van-button>
        <van-button style="border: none; color: #6398fb; font-size: 16px" @click="onConfirm($event, 'workType')">确认</van-button>
      </div>
      <van-checkbox-group v-for="item in work_typeList" v-model="queryParams.workType">
        <van-cell :title="item.text">
          <template #right-icon>
            <van-checkbox :name="item.value" />
          </template>
        </van-cell>
      </van-checkbox-group>
    </van-popup>
    <CurLoading v-if="loading" />
    <!-- 添加人员 -->
    <van-popup v-model:show="changePersonShow" position="bottom" style="height: 500px">
      <div style="text-align: center; font-size: 16px; font-weight: 600">添加人员</div>
      <JUserModal
        :elInfo="{ type: 'vant', attr: { 'label-align': 'top', label: '监护人', required: false } }"
        v-model:value="addPersonForm.workUnitGuardian"
      />

      <template v-for="item in addPersonForm.workUsers" :key="item.value">
        <JUserModal
          type="checkbox"
          url="/workApply/getIdCode"
          :params="{ workType: item.workType }"
          :elInfo="{ type: 'vant', attr: { 'label-align': 'top', label: item.name, required: false } }"
          v-model:value="item.userId"
        />
      </template>
      <div class="footer">
        <van-button @click="changePersonShowHandleCancel" :loading="confirmLoading" type="primary" plain size="small" color="#1f7cf8"
          >取消</van-button
        >
        <van-button @click="changePersonShowHandleOk" :loading="confirmLoading" type="primary" size="small" color="#1f7cf8">确认</van-button>
      </div>
    </van-popup>
  </div>
</template>
<script lang="ts" setup>
  import { getWorkApplyList, deleteManage, updateGuardian, addWorkUser, contractorList } from '../../../hazardousOperation/api/index';
  import { showSuccessToast, showConfirmDialog, showFailToast } from 'vant';
  import { getOrgToWork34, userListByOrg } from '/@/api/common/api';
  import { usePermission } from '/@/hooks/web/usePermission';
  import JUserModal from '/@/components/App/JUserModal.vue';
  import TreeSelect from '../../components/treeSelect.vue';
  import { ref, nextTick, reactive, computed } from 'vue';
  import CurLoading from '../../components/loading.vue';
  import { useUserStore } from '/@/store/modules/user';
  import { useRoute, useRouter } from 'vue-router';
  import { setAppTitle } from '/@/utils/index';
  import List from '../components/list.vue';
  setAppTitle();
  //按钮权限问题
  const { hasPermission } = usePermission();
  const router = useRouter();
  const route = useRoute();
  const list = ref<any[]>([]);
  const loading = ref(true);
  const pageNo = ref(1);
  const pageSize = ref(10);
  const showPicker = ref(false);
  const showPicker1 = ref(false);
  const showPicker2 = ref(false);

  const applicantUnit = ref([]);
  const customFieldName = {
    text: 'departName',
    value: 'orgCode',
  };

  // 申请人下拉
  const applicantShow = ref(false);

  const isUnhazardousWork = computed(() => {
    return route.name === 'AppUnhazardousWorkAsk';
  });

  const queryParams = reactive<{
    state: [];
    stateText: string;
    workType: [];
    workTypeText: string;
    applicationUnit?: string;
    applicationUnitText?: string;
    workApplyCode?: string;
    contentOrCode?: string;
    applicant?: string;
    applicantText?: string;
  }>({
    state: [],
    stateText: '',
    workType: [],
    workTypeText: '',
  });

  const userStore: any = useUserStore();
  const work_typeList = userStore.getAllDictItems.work_type;
  const stateOptions = [
    { text: '待提交', value: '1' },
    { text: '审批中', value: '2' },
    { text: '审批退回', value: '3' },
    { text: '审批通过', value: '4' },
  ];
  const cancel = () => {
    // queryParams.state = [];
    showPicker.value = false;
  };
  const cancel2 = () => {
    // queryParams.workType = [];
    showPicker1.value = false;
  };

getOrgToWork34().then(async (res) => {
    const orgCode = await defaultCompany();
    // res.forEach((item) => {
    //   if (item.children) {
    //     item.selectable = false;
    //   }
    // });
    applicantUnit.value = res;
    if (res.length == 1) {
      queryParams.applicationUnit = res[0].code;
      getUser();
    }
    if (orgCode) {
      queryParams.applicationUnit = orgCode;
      getUser();
    }
    onLoad(queryParams);
});
  // 包厂人员默认选中
  async function defaultCompany() {
    const res = await contractorList();
    let code = '';
    res.map((item) => {
      if (item.user && item.user.includes(userStore.getUserInfo.id)) {
        code = item.orgCode;
      }
    });
    return code;
  }
  const person = ref([]);
  async function getUser() {
    queryParams.applicantText = '';
    queryParams.applicant = '';
    let res = await userListByOrg({ orgCode: queryParams.applicationUnit, pageSize: 100000 });
    res.records.map((item) => {
      item.title = item.realname + '-' + item.workNo;
      if (item.orgSx) {
        item.title = item.title + '-' + item.orgSx;
      }
    });
    person.value = res.records;
  }

  const applicationUnitChange = (val) => {
    getUser();
  };

  const listRef1 = ref();
  const total1 = ref(0);

  const show = ref(false);

  const onRefresh = async (params) => {
    const res = await getList({ ...params, ...queryParams, type: isUnhazardousWork.value ? 2 : 1 });
    loading.value = false;
    list.value = res.records;
    total1.value = res.total;
    nextTick(() => {
      listRef1.value.refreshEnd();
    });
  };

  const onLoad = async (params) => {
    const res = await getList({ ...params, ...queryParams, type: isUnhazardousWork.value ? 2 : 1 });
    loading.value = false;
    list.value = [...list.value, ...res.records];
    total1.value = res.total;
    nextTick(() => {
      listRef1.value.loadEnd();
    });
  };

  const searchClick = () => {
    show.value = false;
    loading.value = true;
    onRefresh(queryParams);
  };

  // 下拉框确认
  const onConfirm = (value, showType) => {
    switch (showType) {
      case 'state':
        queryParams.stateText = '';
        if (queryParams.state?.length) {
          stateOptions.map((val) => {
            if (queryParams.state.includes(val.value)) {
              queryParams.stateText += val.text + '，';
            }
          });
          queryParams.stateText = queryParams.stateText.substr(0, queryParams.stateText.length - 1);
        }
        showPicker.value = false;
        break;
      case 'workType':
        queryParams.workTypeText = '';
        if (queryParams.workType?.length) {
          work_typeList.map((val) => {
            if (queryParams.workType.includes(val.value)) {
              queryParams.workTypeText += val.text + '，';
            }
          });
          queryParams.workTypeText = queryParams.workTypeText.substr(0, queryParams.workTypeText.length - 1);
        }
        showPicker1.value = false;
        break;
      case 'applicant':
        queryParams.applicantText = value.title;
        queryParams.applicant = value.id;
        applicantShow.value = false;
        break;
    }
  };

  function getList(params?) {
    if (params.workTypeText) params.workType = params.workType?.toString();
    if (params.stateText) params.state = params.state?.toString();
    return getWorkApplyList({
      pageNo: pageNo.value,
      pageSize: pageSize.value,
      ...params,
    });
  }

  function reset() {
    queryParams.state = [];
    queryParams.stateText = '';
    queryParams.workType = [];
    queryParams.workTypeText = '';
    queryParams.workApplyCode = '';
    queryParams.contentOrCode = '';
    queryParams.applicant = '';
    queryParams.applicantText = '';
    queryParams.applicationUnit = undefined;
    person.value = [];
    if (applicantUnit.value.length == 1) {
      queryParams.applicationUnit = applicantUnit.value[0].code;
      getUser();
    }
  }

  // 按钮跳转
  const edit = (item) => {
    let url = `/app/dangerousWork/askdetail`;
    if (isUnhazardousWork.value) {
      url = `/app/unhazardousWork/askdetail`;
    }
    router.push({ path: url, query: { id: item.id, workType: item.workType, pageType: 'edit' } });
  };

  const copy = (item) => {
    let url = `/app/dangerousWork/askdetail`;
    if (isUnhazardousWork.value) {
      url = `/app/unhazardousWork/askdetail`;
    }
    router.push({ path: url, query: { id: item.id, workType: item.workType, pageType: 'copy' } });
  };

  // 卡片跳转
  const openDetail = (item) => {
    let url = `/app/dangerousWork/detail`;
    if (isUnhazardousWork.value) {
      url = `/app/unhazardousWork/detail`;
    }
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
        deleteManage({ id: item.id }).then((res) => {
          showSuccessToast({ message: '删除成功！', duration: 300 });
          onRefresh({});
        });
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const toAdd = () => {
    // router.push({ path: '/app/dangerousWork/applyItem' });
    if (isUnhazardousWork.value) {
      router.push({ path: '/app/unhazardousWork/askdetail' });
      return;
    }
    router.push({ path: '/app/dangerousWork/askdetail' });
  };

  const openSearch = () => {
    show.value = true;
  };

  // 添加人员
  const addPersonForm = ref<any>({
    workUnitGuardian: '',
    workUnit: '',
    workUsers: [],
  });
  const changePersonShow = ref(false);
  const curItem = ref<any>({});
  const confirmLoading = ref(false);
  const changePersonClick = (item) => {
    curItem.value = item;
    let names = item.workTypeName.split('、');
    let values = item.workType.split(',');
    addPersonForm.value.workUsers = values.map((v, i) => ({ name: `${names[i]}-作业人员:`, workType: v, userId: '' }));
    changePersonShow.value = true;
  };

  const changePersonShowHandleOk = async () => {
    let workUsers = addPersonForm.value.workUsers.filter((item) => item.userId);
    if (!addPersonForm.value.workUnitGuardian && workUsers.length === 0) return showFailToast('请选择监护人或作业人员！');
    confirmLoading.value = true;
    if (addPersonForm.value.workUnitGuardian) {
      await updateGuardian({
        workApplyId: curItem.value.id,
        userId: addPersonForm.value.workUnitGuardian,
      })
        .then((res) => {
          addPersonForm.value.workUnitGuardian = '';
          changePersonShow.value = false;
          confirmLoading.value = false;
          showSuccessToast('添加成功！');
        })
        .catch((e) => {
          confirmLoading.value = false;
        });
    }
    if (workUsers.length) {
      await addWorkUser({
        workApplyId: curItem.value.id,
        workUsers: workUsers,
      })
        .then((res) => {
          addPersonForm.value.workUsers = [];
          changePersonShow.value = false;
          confirmLoading.value = false;
          showSuccessToast('添加成功！');
        })
        .catch((e) => {
          confirmLoading.value = false;
        });
    }
  };

  const changePersonShowHandleCancel = () => {
    addPersonForm.value.workUnitGuardian = '';
    changePersonShow.value = false;
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

  .foot {
    height: 55px;
    display: flex;
    text-align: center;
    align-items: center;
    justify-content: space-around;
  }

  .poup-hd {
    display: flex;
    justify-content: space-between;
    height: 54px;
    line-height: 54px;
    align-items: center;
    padding: 0 6px;

    .van-search {
      flex: 1;
    }
  }

  :deep(.van-field--disabled .van-field__label) {
    color: #323233;
  }
  .footer {
    background-color: #ffffff;
    position: fixed;
    bottom: 0;
    width: 100%;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: space-around;
  }
</style>
