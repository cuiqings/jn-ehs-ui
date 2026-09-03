<template>
  <div class="projectManage">
    <van-tabs v-model:active="active" @change="changeTabs">
      <van-tab v-for="tab in tabsArr" :key="tab.keys" :name="tab.keys" :title="tab.title">
        <div class="search-wrap">
          <van-search
            v-if="active === '1'"
            class="search-left"
            shape="round"
            v-model="queryForm.companyName"
            placeholder="请输入"
            @search="handleConfirm"
          />
          <van-search v-else class="search-left" shape="round" v-model="companyName" placeholder="请输入" @search="handleConfirm" />
          <div class="search-right" @click="showSearchDrawer">
            <span class="btn-text">筛选</span>
            <img class="btn-icon" :src="down" />
          </div>
        </div>
        <div>
          <van-list
            v-if="listArr.length > 0"
            v-model:loading="loading"
            :finished="finished"
            :finished-text="listArr.length > 0 ? '没有更多了' : ''"
            @load="onLoad"
          >
            <div class="list" v-for="item in listArr" :key="item.id">
              <div v-if="active === '1'" class="list-type">
                <div>
                  <p style="width: 170px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; display: inline-block">
                    {{ item.companyName }}
                  </p>
                  <div>
                    <span v-if="item.status === '1'" v-auth="'autonomous:examine'" @click="handleApproval(item)">检查</span>
                    <span v-if="userId === item.uploadBy && item.status === '2'" v-auth="'autonomous:rectify'" @click="handleApproval(item)"
                      >整改</span
                    >
                    <span v-if="userId === item.checkBy && item.status === '3'" v-auth="'autonomous:acceptance'" @click="handleApproval(item)"
                      >验收</span
                    >
                    <span v-auth="'autonomous:del'" @click="handleDel(item)">删除</span>
                    <span @click="handleView(item)">查看</span>
                  </div>
                </div>
                <div> 资料类型：{{ item.dataType === '1' ? '周例会' : item.dataType === '2' ? '周检查' : '培训' }} </div>
                <div> 上传人：{{ item.uploadByName }} </div>
                <div> 上传时间：{{ item.uploadTime }} </div>
                <div> 相关文档：<AppCustomizeUpload disabled v-model:fileList="item.file" /> </div>
                <div
                  :style="{
                    color: item.status === '4' || item.status === '5' ? '#52c41a' : '',
                  }"
                >
                  状态：{{
                    item.status === '1'
                      ? '待检查'
                      : item.status === '2'
                      ? '待整改'
                      : item.status === '3'
                      ? '待验收'
                      : item.status === '4'
                      ? '验收合格'
                      : item.status === '5'
                      ? '合格'
                      : ''
                  }}
                </div>
                <div> 检查人：{{ item.checkByName }} </div>
              </div>
              <div v-if="active === '2'" class="list-type">
                <div>
                  <p style="width: 170px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; display: inline-block">
                    {{ item.companyName }}
                  </p>
                  <div>
                    <span v-if="userInfo.username === item.createBy || userInfo.username === 'admin'" @click="handleEdit(item)">编辑</span>
                    <span v-if="userInfo.username === item.createBy || userInfo.username === 'admin'" @click="handleDel(item)">删除</span>
                  </div>
                </div>
                <div> 人员姓名：{{ item.personName }} </div>
                <div> 人员身份证号：{{ item.idNumber }} </div>
                <div
                  :style="{
                    color: item.aptitudeStatus === '2' ? '#FFA500' : item.aptitudeStatus === '3' ? 'red' : '',
                  }"
                >
                  资质状态：{{
                    item.aptitudeStatus === '1'
                      ? '正常'
                      : item.aptitudeStatus === '5'
                      ? '即将到期'
                      : item.aptitudeStatus === '2'
                      ? '限制进厂'
                      : item.aptitudeStatus === '3'
                      ? '离场'
                      : ''
                  }}
                </div>
                <div> 考核减分：{{ item.score }} </div>
                <div> 考核原因：{{ item.remark }} </div>
                <div> 考核人：{{ item.examineByName }} </div>
                <div> 考核时间：{{ item.examineTime }} </div>
              </div>
            </div>
          </van-list>
          <a-empty v-if="listArr.length === 0" style="margin-top: 50%" />
        </div>
      </van-tab>
    </van-tabs>
    <van-popup
      v-model:show="showRight"
      closeable
      position="right"
      :style="{ width: '294px', height: '100%' }"
      @click-overlay="handleReset"
      @click-close-icon="handleReset"
    >
      <div>
        <div class="search-title">筛选</div>
        <div class="search-split"></div>
        <div v-if="active === '1'" class="content-box">
          <div class="content-item">
            <div class="item-label">相关方名称</div>
            <a-input v-model:value="queryForm.companyName" placeholder="请输入" />
          </div>
          <div class="content-item">
            <div class="item-label">资料类型</div>
            <a-select
              v-model:value="queryForm.dataType"
              :getPopupContainer="getPopupContainer"
              placeholder="请选择"
              :options="[
                { label: '周例会', value: '1' },
                { label: '周检查', value: '2' },
                { label: '培训', value: '3' },
              ]"
            />
          </div>
          <div class="content-item">
            <div class="item-label">审核状态</div>
            <a-select
              v-model:value="queryForm.status"
              :getPopupContainer="getPopupContainer"
              placeholder="请选择"
              :options="[
                { label: '待检查', value: '1' },
                { label: '待整改', value: '2' },
                { label: '待验收', value: '3' },
                { label: '验收合格', value: '4' },
                { label: '合格', value: '5' },
              ]"
            />
          </div>
        </div>
        <div v-if="active === '2'" class="content-box">
          <div class="content-item">
            <div class="item-label">相关方名称</div>
            <a-select v-model:value="queryForm1.companyId" :getPopupContainer="getPopupContainer" placeholder="请选择" :options="companyOptions" />
          </div>
          <div class="content-item">
            <div class="item-label">人员姓名</div>
            <a-input v-model:value="queryForm1.personName" placeholder="请输入" />
          </div>
          <div class="content-item">
            <div class="item-label">资质状态</div>
            <a-select
              v-model:value="queryForm1.aptitudeStatus"
              :getPopupContainer="getPopupContainer"
              placeholder="请选择"
              :options="[
                { label: '正常', value: '1' },
                { label: '即将到期', value: '5' },
                { label: '限制进厂', value: '2' },
                { label: '离场', value: '3' },
              ]"
            />
          </div>
        </div>
        <div class="action-btn">
          <div class="btn-item-1" @click="handleReset">重置</div>
          <div class="btn-item-2" @click="handleConfirm">查询</div>
        </div>
      </div>
    </van-popup>
    <div class="go-add" @click="handleAdd"><plus-outlined /></div>
    <van-dialog v-model:show="show" title="新增" :before-close="beforeClose" show-cancel-button destroyOnClose>
      <a-form :model="form" ref="formRef" :rules="rules" :label-col="{ span: 4 }" :wrapper-col="{ span: 14 }">
        <a-form-item label="相关方名称" name="companyId">
          <a-select
            v-model:value="form.companyId"
            placeholder="请选择"
            :getPopupContainer="getPopupContainer"
            :options="companyOptions"
            :disabled="companyIdDisabled"
            @change="handleCompanyChange"
          />
        </a-form-item>
        <a-form-item label="项目名称" name="enterId">
          <a-select
            v-model:value="form.enterId"
            placeholder="请选择"
            :getPopupContainer="getPopupContainer"
            :options="projectOptions"
            @change="handleProjectChange"
          />
        </a-form-item>
        <a-form-item label="发包单位" name="publishName">
          <a-input v-model:value="form.publishName" disabled />
        </a-form-item>
        <a-form-item label="资料类型" name="dataType">
          <a-select
            v-model:value="form.dataType"
            placeholder="请选择"
            :getPopupContainer="getPopupContainer"
            :options="[
              { label: '周例会', value: '1' },
              { label: '周检查', value: '2' },
              { label: '培训', value: '3' },
            ]"
          />
        </a-form-item>
        <a-form-item label="相关文档" name="file">
          <app-customize-upload v-model:fileList="form.file" accept="pdf,doc,docx,xls,xlsx" />
        </a-form-item>
      </a-form>
    </van-dialog>
  </div>
</template>
<script setup name="app-autonomous-list" lang="ts">
  import { list, add, del, getEnterList, getExaminePage, deleteExamine } from '../../autonomous/url/index';

  import { getDetailList } from '../../admissionApplication/url/index';
  import down from '/@/assets/images/emergency/down.png';
  import { PlusOutlined } from '@ant-design/icons-vue';
  import { ref, onMounted, reactive, nextTick, computed } from 'vue';
  import { getPopupContainer } from '/@/utils';
  import { setAppTitle } from '/@/utils/index';
  import AppCustomizeUpload from '../components/AppCustomizeUpload.vue';
  import { showDialog } from 'vant';
  import { useUserStore } from '/@/store/modules/user';
  import { useRouter, useRoute } from 'vue-router';
  const userStore: any = useUserStore();
  const userId: any = ref('');
  const userInfo = computed(() => userStore.getUserInfo);
  userId.value = userInfo.value.id;
  const router = useRouter();
  const route: any = useRoute();
  setAppTitle('自主管理');
  const active = ref('1');
  const tabsArr = [
    {
      title: '自主管理',
      keys: '1',
    },
    {
      title: '人员考核',
      keys: '2',
    },
  ];
  const orgCode: any = ref('');
  orgCode.value = userInfo.value.orgCode;
  const showRight = ref(false);
  const loading = ref(false);
  const finished = ref(false);
  const total = ref(0);
  const show = ref(false);
  const formRef = ref();
  const companyOptions: any = ref([]);
  const projectOptions: any = ref([]);
  const page = reactive({
    pageNo: 1,
    pageSize: 10,
  });
  const companyName = ref('');
  const queryForm = reactive({
    companyId: undefined,
    companyName: '',
    dataType: undefined,
    status: undefined,
  });
  const companyIdDisabled = ref(false);
  const rules = ref({
    companyId: [{ required: true, message: '请选择相关方名称' }],
    enterId: [{ required: true, message: '请选择项目名称' }],
    dataType: [{ required: true, message: '请选择资料类型' }],
    file: [{ required: true, message: '请上传相关文档' }],
  });
  const form = ref({
    companyId: undefined,
    companyName: '',
    dataType: undefined,
    file: '',
    enterId: undefined,
    publishName: '',
  });
  const queryForm1 = reactive({
    companyId: undefined,
    personName: '',
    aptitudeStatus: undefined,
    type: '2',
  });
  const listArr = ref<any[]>([]);
  onMounted(() => {
    if (route.query?.active) {
      active.value = route.query.active;
    }
    init();
    getDetailList().then((res) => {
      companyOptions.value = res.map((item) => {
        return { label: item.companyName, value: item.id, key: item.orgCode };
      });
      if (userStore.userInfo.orgCode.includes('A04B12')) {
        form.value.companyId = companyOptions.value.filter((item) => userStore.userInfo.orgCode.includes(item.key))[0].value;
        companyIdDisabled.value = true;
      } else {
        form.value.companyId = undefined;
        companyIdDisabled.value = false;
      }
    });
  });
  const init = async (is = true) => {
    loading.value = true;
    finished.value = true;
    if (active.value === '1') {
      list({ ...page, ...queryForm })
        .then((res) => {
          if (res) {
            total.value = res.total;
            if (is) listArr.value = res.records;
            else listArr.value = listArr.value.concat(res.records);
          }
        })
        .finally(() => {
          loading.value = false;
          finished.value = false;
        });
    } else {
      getExaminePage({ ...page, ...queryForm1, companyName: companyName.value })
        .then((res) => {
          if (res) {
            total.value = res.total;
            if (is) listArr.value = res.records;
            else listArr.value = listArr.value.concat(res.records);
          }
        })
        .finally(() => {
          loading.value = false;
          finished.value = false;
        });
    }
  };
  const showSearchDrawer = () => {
    // reset();
    showRight.value = true;
  };
  const handleReset = () => {
    reset();
    page.pageNo = 1;
    init();
  };
  const reset = () => {
    if (active.value === '1') {
      queryForm.companyName = '';
      queryForm.dataType = undefined;
      queryForm.status = undefined;
    } else {
      companyName.value = '';
      queryForm1.personName = '';
      queryForm1.companyId = undefined;
      queryForm1.aptitudeStatus = undefined;
    }
  };
  const changeTabs = (value) => {
    active.value = value;
    router.push({
      path: '/app/sm/autonomous/list',
      query: {
        active: value,
      },
    });
    listArr.value = [];
    companyName.value = '';
    if (value === '1') {
      queryForm1.personName = '';
      queryForm1.companyId = undefined;
      queryForm1.aptitudeStatus = undefined;
    } else {
      queryForm.companyName = '';
      queryForm.dataType = undefined;
      queryForm.status = undefined;
    }
    page.pageNo = 1;
    init();
  };
  const handleConfirm = () => {
    page.pageNo = 1;
    showRight.value = false;
    init();
  };
  const onLoad = () => {
    if (listArr.value.length == total.value) {
      finished.value = true;
    } else {
      finished.value = false;
      // 加载状态结束
      loading.value = false;
      scrollCallback();
    }
  };
  //滚动后继续加载的回调函数
  const scrollCallback = () => {
    page.pageNo++;
    init(false);
  };
  const handleDel = (data) => {
    showDialog({
      title: '删除',
      message: '确定要删除吗？',
    }).then(async () => {
      try {
        let res = null;
        if (active.value === '1') {
          res = await del({ id: data.id });
        } else {
          res = await deleteExamine({ id: data.id });
        }
        if (res) {
          handleReset();
          return;
        }
        return Promise.reject();
      } catch (e) {
        return Promise.reject();
      }
    });
  };
  const handleAdd = () => {
    if (active.value === '1') {
      show.value = true;
      nextTick(() => {
        formRef.value.resetFields();
      });
      if (userStore.userInfo.orgCode.includes('A04B12')) {
        initEnter(userStore.userInfo.orgCode);
      } else {
        projectOptions.value = [];
      }
    } else {
      router.push({
        path: '/app/sm/autonomous/assessment',
        query: {
          title: '新增',
        },
      });
    }
  };
  const handleEdit = (data) => {
    router.push({
      path: '/app/sm/autonomous/assessment',
      query: {
        title: '修改',
        data: JSON.stringify(data),
      },
    });
  };
  const beforeClose = async (cb) => {
    if (cb == 'cancel') {
      show.value = false;
      return true;
    }
    try {
      await formRef.value.validate();
      const res = await add({
        ...form.value,
        status: '1',
      });
      if (res) {
        show.value = false;
        handleReset();
        return true;
      }
      return false;
    } catch (e) {
      // 校验未通过
      return false;
    }
  };
  const handleCompanyChange = (value, option) => {
    form.value.enterId = undefined;
    form.value.publishName = '';
    if (value) {
      form.value.companyName = option.label;
      initEnter(option.key);
    } else {
      projectOptions.value = [];
      form.value.companyName = '';
    }
  };
  const initEnter = (orgCode) => {
    projectOptions.value = [];
    getEnterList({
      orgCode,
    }).then((res) => {
      projectOptions.value = res.map((item) => {
        return {
          label: item.projectName,
          value: item.id,
          publishName: item.publishName,
        };
      });
    });
  };
  const handleProjectChange = (value, extra) => {
    if (value) {
      form.value.publishName = extra.publishName;
    } else {
      form.value.publishName = '';
    }
  };
  // 检查 | 整改 | 验收
  const handleApproval = (data) => {
    router.push({
      path: '/app/sm/autonomous/approval',
      query: {
        id: data.id,
        status: data.status,
      },
    });
  };
  // 查看
  const handleView = (data) => {
    router.push({
      path: '/app/sm/autonomous/view',
      query: {
        id: data.id,
      },
    });
  };
</script>
<style lang="less" scoped>
  .projectManage {
    background: #eff1f5;
    width: 100%;
    height: 100%;
    overflow-y: auto;
    .go-add {
      width: 54px;
      height: 54px;
      text-align: center;
      border-radius: 50%;
      background-color: #ffffff;
      position: fixed;
      bottom: 30px;
      right: 20px;
      box-shadow: 0px 3px 8px 1px rgba(0, 0, 0, 0.16);
      color: #3e87f8;
      font-size: 34px;
    }
    .search-wrap {
      clear: both;
      overflow: hidden;
      margin-bottom: 10px;
      background-color: #fff;
      .search-left {
        float: left;
        width: calc(100% - 86px);
      }
      .search-right {
        float: right;
        width: 74px;
        height: 40px;
        border-radius: 20px 20px 20px 20px;
        border: 1px solid rgba(0, 0, 0, 0.1);
        margin: 7px 12px 0 0;
        text-align: center;
        line-height: 40px;
        .btn-text {
          font-size: 13px;
          font-family: PingFang SC-Regular, PingFang SC;
          font-weight: 400;
          color: rgba(0, 0, 0, 0.87);
        }
        .btn-icon {
          display: inline-block;
          width: 10px;
          height: 10px;
          margin-left: 4px;
        }
      }
    }
    .list {
      background: #ffffff;
      border-radius: 4px;
      opacity: 1;
      padding: 16px 13px;
      width: calc(100% - 26px);
      margin: 0 13px 8px 13px;
      .list-type {
        & > div:first-child {
          display: flex;
          align-items: center;
          justify-content: space-between;
          span {
            color: #3e87f8;
            margin: 0 10px;
            font-size: 14px;
          }
        }
        p {
          font-size: 15px;
          font-family: Source Han Sans CN, Source Han Sans CN;
          font-weight: 400;
          color: rgba(0, 0, 0, 0.87);
          margin-bottom: 0;
          display: flex;
          justify-content: space-between;
          & > span {
            font-size: 13px;
            font-family: Source Han Sans CN, Source Han Sans CN;
            font-weight: 400;
            color: #b0afaf;
          }
        }
        div {
          font-size: 12px;
          font-family: Source Han Sans CN, Source Han Sans CN;
          font-weight: 400;
          color: #b0afaf;
        }
      }
    }
    .search-title {
      font-size: 16px;
      font-family: SourceHanSansCN-Medium-, SourceHanSansCN-Medium;
      color: rgba(0, 0, 0, 0.87);
      margin: 12px 0 12px 16px;
    }
    .search-split {
      width: 100%;
      height: 1px;
      background: #eff1f5;
      border-radius: 0px 0px 0px 0px;
    }
    .action-btn {
      width: 100%;
      .btn-item-1 {
        display: inline-block;
        cursor: pointer;
        width: 50%;
        color: rgba(0, 0, 0, 0.6);
        height: 53px;
        line-height: 53px;
        background: #f7f8fa;
        text-align: center;
      }
      .btn-item-2 {
        display: inline-block;
        cursor: pointer;
        width: 50%;
        height: 53px;
        line-height: 53px;
        font-weight: 600;
        color: #ffffff;
        background: #3e87f8;
        cursor: pointer;
        text-align: center;
      }
    }
    .content-box {
      margin: 0 0 0 16px;
      height: calc(100vh - 104px);
      overflow-y: auto;
      padding-right: 16px;
      .content-item {
        margin-top: 12px;
        .item-label {
          font-size: 13px;
          font-family: Source Han Sans CN-Regular, Source Han Sans CN;
          font-weight: 400;
          color: #000000;
        }
        .ant-input,
        :deep(.ant-select) {
          width: 100%;
          height: 46px;
          border-radius: 4px 4px 4px 4px;
          margin-top: 8px;
          .ant-select-selector {
            height: 46px;
            .ant-select-selection-search-input,
            .ant-select-selection-placeholder,
            .ant-select-selection-item,
            .ant-select-selection-item > span {
              height: 44px;
              line-height: 44px;
            }
          }
        }
        .item-select {
          margin-top: 8px;
          & > div {
            background-color: rgba(0, 0, 0, 0.2);
            height: 30px;
            width: 100px;
            border-radius: 15px;
            text-align: center;
            line-height: 30px;
            display: inline-block;
            margin: 0 10px 10px 0;
          }
          .active {
            background-color: #3e87f8;
            color: #fff;
          }
        }
      }
    }
  }
  :deep(.van-dialog__content) {
    padding: 10px 20px 20px;
  }
  :deep(.ant-form-item) {
    margin-bottom: 10px !important;
  }
  :deep(.van-dialog__content) {
    height: 300px;
    overflow-y: auto;
  }
</style>
