<template>
  <a-card :bordered="false" style="margin: 24px">
    <!--自定义查询区域-->
    <div class="jeecg-basic-table-form-container" @keyup.enter="searchQuery">
      <a-form ref="formRef" :model="queryParam" :label-col="labelCol" :wrapper-col="wrapperCol">
        <a-row :gutter="24">
          <a-col :md="6" :sm="12">
            <a-form-item label="所属机构">
              <a-select v-model:value="queryParam.orgCode" @change="orgCodeChange" allowClear placeholder="请选择" :disabled="isCanSelectLine">
                <template v-for="item in orgOptions" :key="`${item.value}`">
                  <a-select-option :value="item.value">{{ item.label }}</a-select-option>
                </template>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :md="6" :sm="12">
            <a-form-item label="所属部门">
              <a-select v-model:value="queryParam.departCode" allowClear placeholder="请选择">
                <template v-for="item in departOptions" :key="`${item.value}`">
                  <a-select-option :value="item.value">{{ item.label }}</a-select-option>
                </template>
              </a-select>
            </a-form-item>
          </a-col>
          <template v-if="toggleSearchStatus">
            <a-col :md="6" :sm="12">
              <a-form-item label="分类">
                <JDictSelectTag v-model:value="queryParam.typeCode" placeholder="请选择" dictCode="emergency_disposal_classify" />
              </a-form-item>
            </a-col>
            <a-col :md="6" :sm="12">
              <a-form-item label="名称">
                <a-input allowClear placeholder="输入名称" v-model:value="queryParam.name" />
              </a-form-item>
            </a-col>
            <a-col :md="6" :sm="12">
              <a-form-item label="录入时间">
                <a-range-picker style="width: -webkit-fill-available" :format="dateFormat" v-model:value="uploadDate" @change="onChangeTime" />
              </a-form-item>
            </a-col>
          </template>
          <span style="float: left; overflow: hidden" class="table-page-search-submitButtons">
            <a-col :md="6" :sm="12">
              <a-button type="primary" preIcon="ant-design:search-outlined" @click="searchQuery">查询</a-button>
              <a-button type="primary" preIcon="ant-design:reload-outlined" @click="searchReset" style="margin-left: 8px">重置</a-button>
              <a @click="toggleSearchStatus = !toggleSearchStatus" style="margin-left: 8px">
                {{ toggleSearchStatus ? '收起' : '展开' }}
                <Icon :icon="toggleSearchStatus ? 'ant-design:up-outlined' : 'ant-design:down-outlined'" />
              </a>
            </a-col>
          </span>
        </a-row>
        <!-- 分割线 -->
        <div class="split-line"></div>
        <a-row :gutter="24">
          <a-col :md="6" :sm="12">
            <div class="btn-list">
              <a-button @click="handleAdd" type="primary" v-auth="'disposal:add'">新增</a-button>
              <a-button @click="handleDownload" style="margin-left: 8px">打包下载</a-button>
            </div>
          </a-col>
        </a-row>
      </a-form>
    </div>
    <!-- 卡片区域 -->
    <div v-if="listData.length > 0" style="overflow-x: scroll">
      <div class="book-list">
        <div
          class="row-item"
          :data-index="index"
          v-for="(item, index) in listData"
          :key="item.id"
          @mouseover="handleMouseOver($event)"
          @mouseleave="handleMouseLeave"
        >
          <div v-if="item.typeCode == 999" class="item-label-999">{{ filterMultiDictText(dictOptionsECL, item.typeCode) }}</div>
          <div v-else class="item-label">{{ filterMultiDictText(dictOptionsECL, item.typeCode) }}</div>
          <div v-if="item.orgCodeText || item.departText" class="item-info">
            <span v-if="item.orgCodeText" class="item-info-label label-one">{{ item.orgCodeText }}</span>
            <span v-if="item.departText" class="item-info-label">{{ item.departText }}</span>
          </div>
          <div class="item-title" v-html="item.name"></div>
          <div class="item-time">
            <span style="display: inline-block; margin-right: 8px">{{ item.createName ? item.createName : item.createBy }}</span>
            {{ item.createTime }}</div
          >
          <div v-show="showBtn && index == hoverIndex" class="item-btn">
            <span class="btn" @click="handlePreview(item)">预览</span>
            <span class="btn" v-auth="'disposal:edit'" @click="handleEdit(item)">编辑</span>
            <span class="btn" style="margin-right: -10px" @click="downloadFile(item.filePath)">下载</span>
          </div>
          <div v-show="showBtn && index == hoverIndex" class="delete-img" v-auth="'disposal:del'" @click="handleDelete(item)">
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
    <DisposalModal @register="registerModal" @success="onSuccess" />
  </a-card>
</template>
<script lang="ts" setup>
  import { ref, reactive, onMounted, computed } from 'vue';
  import type { Dayjs } from 'dayjs';
  import { useModal } from '/@/components/Modal';
  import DisposalModal from './DisposalModal.vue';
  import { list, deleteOne } from './disposal.api';
  import { Pagination } from 'ant-design-vue';
  import JDictSelectTag from '/@/components/Form/src/jeecg/components/JDictSelectTag.vue';
  import { initDictOptions } from '/@/utils/dict';
  import { filterMultiDictText } from '/@/utils/dict/JDictSelectUtil.js';
  import { downloadFile } from '/@/utils/common/renderUtils';
  import { downloadFileAll, previewFile, getOrgCodeList, getDepartmentList } from '/@/api/common/api';
  import { useMessage } from '/@/hooks/web/useMessage';
  const { createConfirm } = useMessage();
  import { useUserStore } from '/@/store/modules/user';

  const userStore = useUserStore();
  const userinfo = computed(() => userStore.getUserInfo);
  const APagination = Pagination;
  const [registerModal, { openModal: openRoleModal }] = useModal();
  type RangeValue = [Dayjs, Dayjs];
  const queryParam = reactive({
    name: '',
    orgCode: undefined,
    departCode: undefined,
    typeCode: undefined,
    startTime: '',
    endTime: '',
  });
  const pageSizeOptions = ref<string[]>(['8', '12', '24', '32']);
  const total = ref(60);

  const dateFormat = 'YYYY-MM-DD';
  const uploadDate = ref<RangeValue>();
  const labelCol = reactive({
    xs: { span: 24 },
    sm: { span: 5 },
  });
  const wrapperCol = reactive({
    xs: { span: 24 },
    sm: { span: 19 },
  });
  const toggleSearchStatus = ref(false);
  const current = ref(1);
  const pageSize = ref(8);
  const loading = ref(false);
  const showBtn = ref(false);
  const hoverIndex = ref(-1);
  const listData = ref([]);
  const orgOptions = ref<any>([]);
  const departOptions = ref<any>([]);
  const dictOptionsECL = ref<any>([]);
  const isCanSelectLine = ref(false);

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
    await getOrgCodeList().then((res) => {
      res.map((item) => {
        orgOptions.value.push({
          label: item.departName,
          value: item.orgCode,
        });
      });
    });
    initOrgCode();
  }
  function orgCodeChange(val) {
    departOptions.value = [];
    queryParam.departCode = undefined;
    if (val) {
      let params = {};
      params.orgCode = val;
      params.pageSize = 9999;
      params.pageNo = 1;
      getDepartmentList(params).then((res) => {
        res.map((item) => {
          departOptions.value.push({
            label: item.departName,
            value: item.orgCode,
          });
        });
      });
    }
  }
  // onCreated
  loadData(1);
  async function initOrgCode() {
    if (userinfo.value.orgCode.length > 6) {
      queryParam.orgCode = userinfo.value.orgCode.slice('0', '6');
      await orgCodeChange(queryParam.orgCode);
    } else if (userinfo.value.orgCode.length == 6) {
      queryParam.orgCode = userinfo.value.orgCode;
      await orgCodeChange(queryParam.orgCode);
      queryParam.departCode = undefined;
    } else {
      queryParam.orgCode = undefined;
      queryParam.departCode = undefined;
    }
    if (userinfo.value.orgCode.length > 3 && userinfo.value.orgCode.slice('0', '6') != 'A04B01') {
      isCanSelectLine.value = true;
    } else {
      isCanSelectLine.value = false;
    }
    loadData(1);
  }
  onMounted(() => {
    //初始化字典选项
    initDictConfig();
    getOrgList();
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
      listData.value = res.records;
      total.value = res.total;
      loading.value = false;
      if (queryParam.name.valueOf() != '') {
        let listDataBak = listData.value.map((item) => {
          if (item.name.indexOf(queryParam.name.valueOf()) > -1) {
            item.name = item.name.replace(queryParam.name.valueOf(), "<span style='color:red'>" + queryParam.name.valueOf() + '</span>');
          }
          return item;
        });
        listData.value = listDataBak;
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
    if (date) {
      queryParam['startTime'] = dateString[0] + ' 00:00:00';
      queryParam['endTime'] = dateString[1] + ' 23:59:59';
    } else {
      queryParam['startTime'] = '';
      queryParam['endTime'] = '';
    }
  }
  // 搜索
  function searchQuery() {
    loadData(1);
  }
  // 重置
  function searchReset() {
    Object.assign(queryParam, { name: '', orgCode: undefined, departCode: undefined, typeCode: undefined, startTime: '', endTime: '' });
    uploadDate.value = undefined;
    loadData(1);
  }
  // 新增
  function handleAdd() {
    openRoleModal(true, { isUpdate: false });
  }
  // 预览
  function handlePreview(record) {
    if (record && record.filePath) {
      previewFile(record.filePath).then((res) => {
        window.open(res, '_blank');
      });
    }
  }
  // 编辑
  function handleEdit(record) {
    openRoleModal(true, { record, isUpdate: true });
  }
  // 全部下载
  function handleDownload() {
    let param = Object.assign({}, queryParam);
    delete param['pageNo'];
    delete param['pageSize'];
    downloadFileAll('/emergency/emergencyResponsePlan/downloadALL', '应急处置方案.zip', param);
  }
  // 删除
  function handleDelete(item) {
    createConfirm({
      iconType: 'warning',
      title: '删除',
      content: '确定要删除吗？',
      onOk: () => {
        deleteOne({ id: item.id }).then(() => {
          loadData(1);
        });
      },
      onCancel() {},
    });
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
    margin-right: -24px;
    width: 1612px;
    .list-row {
      display: flex;
    }
    .row-item {
      display: inline-block;
      position: relative;
      margin-top: 15px;
      margin-right: 24px;
      margin-bottom: 24px;
      background: url('/@/assets/images/emergency/book1.png');
      background-size: 100% 100%;
      background-repeat: no-repeat;
      width: 373px;
      height: 400px;
      clear: both;
      .item-info {
        position: absolute;
        margin-left: 52px;
        margin-top: 85px;
        .item-info-label {
          display: inline-block;
          /* width: 56px; */
          padding: 0 5px;
          height: 24px;
          background: #f9d099;
          border-radius: 2px 2px 2px 2px;
          font-size: 16px;
          font-family: PingFang SC-Regular, PingFang SC;
          font-weight: 400;
          color: #724315;
          text-align: center;
        }
        .label-one {
          margin-right: 16px;
        }
      }
      .item-title {
        width: 270px;
        position: absolute;
        top: 124px;
        left: 52px;
        font-size: 26px;
        font-family: Source Han Sans CN-Bold, Source Han Sans CN;
        font-weight: bold;
        color: #724315;
        word-break: break-all;
      }
      .item-label {
        position: absolute;
        top: 12px;
        right: 50px;
        font-size: 16px;
        font-family: SourceHanSansCN-Medium-, SourceHanSansCN-Medium;
        color: #724315;
      }
      .item-label-999 {
        position: absolute;
        top: 12px;
        right: 65px;
        font-size: 16px;
        font-family: SourceHanSansCN-Medium-, SourceHanSansCN-Medium;
        color: #724315;
      }
      .item-time {
        position: absolute;
        bottom: 32px;
        left: 52px;
        font-size: 16px;
        font-family: Source Han Sans CN-Medium, Source Han Sans CN;
        color: #724315;
      }
      .item-btn {
        position: absolute;
        bottom: 88px;
        left: 52px;
        .btn {
          display: inline-block;
          width: 84px;
          height: 40px;
          line-height: 40px;
          background: #ffffff;
          border-radius: 4px 4px 4px 4px;
          text-align: center;
          margin-right: 10px;
          opacity: 1;
          border: 1px solid #3e87f8;
          font-size: 16px;
          color: #3e87f8;
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
    top: -12px;
    right: -5px;
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
