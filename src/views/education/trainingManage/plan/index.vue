<template>
  <a-card :bordered="false" style="margin: 24px">
    <!--自定义查询区域-->
    <div class="jeecg-basic-table-form-container" @keyup.enter="searchQuery">
      <a-form ref="formRef" :model="queryParam" :label-col="labelCol" :wrapper-col="wrapperCol">
        <a-row :gutter="24">
          <a-col :md="6" :sm="12">
            <a-form-item label="计划年度">
              <a-date-picker style="width: 100%" v-model:value="planYear" picker="year" @change="onChangeTime" />
            </a-form-item>
          </a-col>
          <a-col :md="6" :sm="12">
            <a-form-item label="所属单位">
              <a-select :disabled="orgDisabled" v-model:value="queryParam.orgCode" allowClear placeholder="请选择" @change="onChangeOrg">
                <template v-for="item in orgOptions" :key="`${item.value}`">
                  <a-select-option :value="item.value">{{ item.label }}</a-select-option>
                </template>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :md="6" :sm="12">
            <a-form-item label="所属部门">
              <a-select :disabled="departDisabled" v-model:value="queryParam.workshop" allowClear placeholder="请选择">
                <template v-for="item in departOptions" :key="`${item.value}`">
                  <a-select-option :value="item.value">{{ item.label }}</a-select-option>
                </template>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :md="6" :sm="12">
            <a-form-item label="计划名称">
              <a-input allowClear placeholder="请输入" v-model:value="queryParam.planName" />
            </a-form-item>
          </a-col>
          <span style="float: left; overflow: hidden" class="table-page-search-submitButtons">
            <a-col :md="6" :sm="12">
              <a-button type="primary" preIcon="ant-design:search-outlined" @click="searchQuery">查询</a-button>
              <a-button type="primary" preIcon="ant-design:reload-outlined" @click="searchReset" style="margin-left: 8px">重置</a-button>
            </a-col>
          </span>
        </a-row>
        <!-- 分割线 -->
        <div class="split-line"></div>
        <a-row :gutter="24">
          <a-col :md="6" :sm="12">
            <div class="btn-list">
              <a-button @click="handleAdd" type="primary" v-auth="'trainPlan:add'">新增</a-button>
            </div>
          </a-col>
        </a-row>
      </a-form>
    </div>
    <!-- 卡片区域 -->
    <div v-if="listData.length > 0">
      <div class="book-list">
        <div
          class="row-item"
          :data-index="index"
          v-for="(item, index) in listData"
          :key="item.id"
          :style="{ marginLeft: (index + 1) % 4 == 1 ? '0' : '20px' }"
          @mouseover="handleMouseOver($event)"
          @mouseleave="handleMouseLeave"
        >
          <div class="item-info">
            <span class="item-info-label label-one">{{ item.planYear }}</span>
          </div>
          <div class="item-btn">
            <span class="btn" v-auth="'trainPlan:edit'" @click="handleEdit(item)">编辑</span>
            <!-- <span class="btn" style="margin-right: -10px" @click="downloadFile(item.fileUrl)">下载</span> -->
          </div>
          <div class="item-title" v-html="item.planName1"></div>
          <div class="item-org" v-if="item.orgName">{{ item.orgName }}</div>
          <div class="item-file" v-if="item.fileUrl" @click="handlePreview(item)">{{
            item.fileUrl.split('/')[item.fileUrl.split('/').length - 1]
          }}</div>
          <div class="item-detail">
            <a-button type="link" style="font-size: 20px" @click="handleDetail(item)">查看计划</a-button>
          </div>
          <div v-show="showBtn && index == hoverIndex" class="delete-img" v-auth="'trainPlan:del'" @click="handleDelete(item)">
            <img src="/@/assets/images/emergency/delete.png" alt="" />
          </div>
        </div>
      </div>
    </div>
    <a-empty v-else description="暂无数据" style="position: relative; top: 20px" />
    <!-- 分页 -->
    <div class="page-wrap" v-if="listData.length > 0">
      <a-pagination
        v-model:current="current"
        :page-size-options="pageSizeOptions"
        v-model:page-size="pageSize"
        :total="total"
        show-size-changer
        @change="onChange"
        @show-size-change="onShowSizeChange"
      />
    </div>
    <PlanModal @register="registerModal" @success="onSuccess" />
    <DetailTableDrawer @register="detailTableDrawer" />
  </a-card>
</template>
<script lang="ts" setup name="train-plan">
  import { ref, reactive, onMounted, computed } from 'vue';
  import type { Dayjs } from 'dayjs';
  import { useModal } from '/@/components/Modal';
  import { useDrawer } from '/@/components/Drawer';
  import PlanModal from './PlanModal.vue';
  import DetailTableDrawer from './DetailTableDrawer.vue';
  import { list, deletePlan } from './plan.api';
  import { Pagination } from 'ant-design-vue';
  import { initDictOptions } from '/@/utils/dict';
  import { getDepart3ListWithSecurity, previewFile, selectDeptNew } from '/@/api/common/api';
  import { useMessage } from '/@/hooks/web/useMessage';
  const { createConfirm } = useMessage();
  import { useUserStore } from '/@/store/modules/user';

  const userStore = useUserStore();
  const userinfo: any = computed(() => userStore.getUserInfo);
  const loginInfo: any = computed(() => userStore.getLoginInfo);
  const APagination = Pagination;
  const [registerModal, { openModal }] = useModal();
  const [detailTableDrawer, { openDrawer: openDetailDrawer }] = useDrawer();
  const queryParam: any = reactive({
    planName: '',
    orgCode: undefined,
    planYear: '',
    workshop: undefined,
  });
  const pageSizeOptions = ref<string[]>(['8', '12', '24', '32']);
  const total = ref(60);
  const planYear: any = ref<Dayjs>();

  const labelCol = reactive({
    xs: { span: 24 },
    sm: { span: 5 },
  });
  const wrapperCol = reactive({
    xs: { span: 24 },
    sm: { span: 19 },
  });
  const current = ref(1);
  const pageSize = ref(8);
  const loading = ref(false);
  const showBtn = ref(false);
  const hoverIndex = ref(-1);
  const listData: any = ref([]);
  const orgOptions = ref<any>([]);
  const departOptions = ref<any>([]);
  const dictOptionsECL = ref<any>([]);
  const orgDisabled = ref(false);
  const departDisabled = ref(false);
  /**
   * 初始化字典选项
   */
  async function initDictConfig() {
    dictOptionsECL.value = await initDictOptions('emergency_disposal_classify');
  }
  /**
   * 所属机构change事件
   */
  async function getOrgList() {
    orgOptions.value = [];
    // 给所属单位和所属部门赋值
    if (userinfo.value.orgCode.length > 9) {
      queryParam.orgCode = userinfo.value.orgCode.slice(0, 9);
      queryParam.workshop = userinfo.value.orgCode.slice(0, 12);
    } else if (userinfo.value.orgCode.length == 9) {
      queryParam.orgCode = userinfo.value.orgCode;
      queryParam.workshop = undefined;
    } else {
      queryParam.orgCode = undefined;
      queryParam.workshop = undefined;
    }
    await getDepart3ListWithSecurity().then((res) => {
      res.map((item) => {
        orgOptions.value.push({
          label: item.departName,
          value: item.orgCode,
        });
      });
      if (orgOptions.value.length == 1) {
        orgDisabled.value = true;
        // 如果只有一个机构，当前登录人所属部门是安全科，部门可选
        if (userinfo.value.orgCode.length > 9) {
          if (loginInfo.value.departs?.length > 0) {
            if (loginInfo.value.departs[0].departName == '安全科') {
              departDisabled.value = false;
            }
          }
        } else {
          departDisabled.value = false;
        }
      } else {
        orgDisabled.value = false;
        departDisabled.value = false;
      }
    });
    getDepartList(queryParam.orgCode);
  }
  async function getDepartList(orgCode: string) {
    await selectDeptNew({ orgCode: orgCode }).then((res) => {
      if (res && res.length > 0) {
        let isSecuritySector = 0;
        departOptions.value = res.map((item) => {
          if(item.orgCode == userinfo.value.orgCode && item.isSecuritySector == 1){
            isSecuritySector = 1;
          }
          return {
            label: item.departName,
            value: item.orgCode,
          };
        });
        departDisabled.value = isSecuritySector !== 1;
      } else {
        departOptions.value = [];
      }
    });
  }
  onMounted(() => {
    //初始化字典选项
    initDictConfig();
    getOrgList();
    loadData(1);
  });
  const onShowSizeChange = () => {
    loadData(0);
  };
  const onChange = () => {
    loadData(0);
  };
  async function loadData(arg) {
    if (arg === 1) {
      current.value = 1;
    }
    loading.value = true;
    let param = Object.assign({}, queryParam);
    param['pageNo'] = current.value;
    param['pageSize'] = pageSize.value;
    await list(param).then((res) => {
      listData.value = res.records.map((item) => {
        item.planName1 = item.planName;
        return item;
      });
      total.value = res.total;
      loading.value = false;
      if (queryParam.planName.valueOf() != '') {
        listData.value.forEach((item) => {
          if (item.planName1.indexOf(queryParam.planName.valueOf()) > -1) {
            item.planName1 = item.planName1.replace(
              queryParam.planName.valueOf(),
              "<span style='color:red'>" + queryParam.planName.valueOf() + '</span>'
            );
          }
        });
      }
    });
  }
  function onSuccess() {
    loadData(1);
  }
  function handleMouseOver(event) {
    hoverIndex.value = event.currentTarget.getAttribute('data-index');
    showBtn.value = true;
  }
  function handleMouseLeave() {
    hoverIndex.value = -1;
    showBtn.value = false;
  }
  // 上传时间
  function onChangeTime(date, dateString) {
    console.log(date, dateString);
    queryParam.planYear = dateString;
  }
  // 搜索
  function searchQuery() {
    loadData(1);
  }
  // 重置
  function searchReset() {
    planYear.value = null;
    queryParam.planYear = undefined;
    queryParam.planName = '';
    getOrgList();
    loadData(1);
  }
  // 新增
  function handleAdd() {
    openModal(true, { isUpdate: false, showFooter: true });
  }
  // 预览
  function handlePreview(record) {
    if (record && record.fileUrl) {
      previewFile(record.fileUrl).then((res) => {
        window.open(res, '_blank');
      });
    }
  }
  // 编辑
  function handleEdit(record) {
    openModal(true, { record, isUpdate: true, showFooter: true });
  }
  // 删除
  function handleDelete(item) {
    createConfirm({
      iconType: 'warning',
      title: '删除',
      content: '确定要删除吗？',
      onOk: () => {
        deletePlan({ ids: item.id }).then(() => {
          loadData(1);
        });
      },
      onCancel() {},
    });
  }
  /**
   * 查看
   */
  function handleDetail(record) {
    console.log('record', record);
    openDetailDrawer(true, record);
  }
  function onChangeOrg(value) {
    console.log('value', value);
    if (value) {
      queryParam.workshop = undefined;
      getDepartList(value);
    } else {
      queryParam.workshop = undefined;
      departOptions.value = [];
    }
  }
</script>
<style lang="less" scoped>
  .list-operator {
    float: left;
  }
  .split-line {
    margin: 24px 0;
    width: 100%;
    height: 0px;
    opacity: 1;
    border: 1px solid rgba(0, 0, 0, 0.1);
  }
  .book-list {
    width: 100%;
    // 水平居中
    margin: 0 auto;

    .list-row {
      // display: flex;
      // align-items: center;
      // justify-content: space-between;
    }
    .row-item {
      display: inline-block;
      position: relative;
      margin-top: 20px;
      border: 1px solid #e1e1e1;
      border-radius: 8px;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
      width: 23%;
      height: 260px;
      clear: both;
      .item-info {
        position: absolute;
        left: 20px;
        top: 20px;
        .item-info-label {
          display: inline-block;
          /* width: 56px; */
          padding: 5px;
          height: 34px;
          background: #00a0e9;
          border-radius: 4px;
          font-size: 16px;
          font-family: PingFang SC-Regular, PingFang SC;
          font-weight: 400;
          color: #fff;
          text-align: center;
        }
        .label-one {
          margin-right: 16px;
        }
      }
      .item-title {
        width: 320px;
        position: absolute;
        top: 84px;
        left: 20px;
        font-size: 22px;
        font-family: Source Han Sans CN-Bold, Source Han Sans CN;
        word-break: break-all;
        //超过两行显示省略号
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 1;
        -webkit-box-orient: vertical;
      }
      .item-org {
        position: absolute;
        top: 140px;
        left: 20px;
        font-size: 16px;
        color: #666666;
        font-family: SourceHanSansCN-Medium-, SourceHanSansCN-Medium;
      }
      .item-file {
        position: absolute;
        bottom: 60px;
        left: 20px;
        font-size: 16px;
        font-family: SourceHanSansCN-Medium-, SourceHanSansCN-Medium;
        color: #1890ff;
        cursor: pointer;
        // border-bottom: 1px solid #1890ff;
        //超过两行显示省略号
        width: 318px;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 1;
        -webkit-box-orient: vertical;
      }
      .item-label {
        position: absolute;
        top: 12px;
        right: 50px;
        font-size: 16px;
        font-family: SourceHanSansCN-Medium-, SourceHanSansCN-Medium;
      }
      .item-label-999 {
        position: absolute;
        top: 12px;
        right: 65px;
        font-size: 16px;
        font-family: SourceHanSansCN-Medium-, SourceHanSansCN-Medium;
        color: #724315;
      }
      .item-detail {
        position: absolute;
        bottom: 20px;
        right: 20px;
      }
      .item-btn {
        position: absolute;
        top: 28px;
        right: 22px;
        .btn {
          display: inline-block;
          width: 50px;
          height: 26px;
          line-height: 26px;
          background: #ffffff;
          border-radius: 4px 4px 4px 4px;
          text-align: center;
          margin-right: 10px;
          opacity: 1;
          border: 1px solid #1890ff;
          font-size: 14px;
          color: #1890ff;
          cursor: pointer;
        }
      }
    }
  }
  .page-wrap {
    float: right;
    margin-top: 20px;
  }
  .delete-img {
    position: absolute;
    top: -14px;
    right: -9px;
    cursor: pointer;
    z-index: 100;
    img {
      width: 32px;
      height: 32px;
    }
  }
  .jeecg-basic-table-form-container {
    .table-page-search-submitButtons {
      display: block;
      margin-bottom: 24px;
      white-space: nowrap;
    }
  }
</style>
