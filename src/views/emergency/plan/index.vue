<template>
  <a-card :bordered="false" style="margin: 24px">
    <!--自定义查询区域-->
    <div class="jeecg-basic-table-form-container" @keyup.enter="searchQuery">
      <a-form ref="formRef" :model="queryParam" :label-col="labelCol" :wrapper-col="wrapperCol">
        <a-row :gutter="24">
          <a-col :md="6" :sm="12">
            <a-form-item label="上传时间">
              <a-range-picker :format="dateFormat" v-model:value="uploadDate" @change="onChangeTime" />
            </a-form-item>
          </a-col>
          <a-col :md="6" :sm="12">
            <a-form-item label="预案名称">
              <a-input allowClear placeholder="请输入" v-model:value="queryParam.name"></a-input>
            </a-form-item>
          </a-col>
          <a-col :md="6" :sm="12">
            <div class="btn-list">
              <a-button type="primary" @click="searchQuery">查询</a-button>
              <a-button type="primary" @click="searchReset" style="margin-left: 8px">重置</a-button>
            </div>
          </a-col>
          <a-col :md="4" :sm="12" style="float: right">
            <div class="btn-list">
              <a-button @click="handleDownload">全部下载</a-button>
              <a-button @click="handleAdd" type="primary" style="margin-left: 8px" v-auth="'emergencyplan:add'">新增</a-button>
            </div>
          </a-col>
        </a-row>
      </a-form>
    </div>
    <!-- 分割线 -->
    <div class="split-line"></div>
    <!-- 卡片区域 -->
    <div v-if="listData.length > 0" style="overflow-x: scroll">
      <div class="book-list">
        <div
          class="row-item"
          :data-index="index"
          v-for="(item, index) in listData"
          :key="index"
          @mouseover="handleMouseOver($event)"
          @mouseleave="handleMouseLeave"
        >
          <div class="item-title" v-html="item.name"></div>
          <div class="item-time">{{ item.createTime }}</div>
          <div v-show="showBtn && index == hoverIndex" class="item-btn">
            <span class="btn" @click="handlePreview(item)">预览</span>
            <span class="btn" @click="handleEdit(item)" v-auth="'emergencyplan:edit'">编辑</span>
            <span class="btn" style="margin-right: -10px" @click="downloadFile(item.filePath)">下载</span>
          </div>
          <div v-show="showBtn && index == hoverIndex" class="delete-img" @click="handleDelete(item)" v-auth="'emergencyplan:delete'">
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
        v-model:page-size="pageSizeRef"
        :total="total"
        show-size-changer
        @change="onChange"
        showLessItems
        @showSizeChange="onShowSizeChange"
      />
    </div>
    <PlanModal @register="registerModal" @success="onSuccess" />
  </a-card>
</template>
<script lang="ts" setup>
  import { ref, unref, reactive, toRaw, watch, computed } from 'vue';
  import type { Dayjs } from 'dayjs';
  import { useModal } from '/@/components/Modal';
  import PlanModal from './PlanModal.vue';
  import { list, deleteOne } from './plan.api';
  import { Pagination } from 'ant-design-vue';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { downloadFile } from '/@/utils/common/renderUtils';
  import { downloadFileAll, previewFile } from '/@/api/common/api';

  const { createConfirm } = useMessage();
  const APagination = Pagination;
  const [registerModal, { openModal: openRoleModal }] = useModal();
  type RangeValue = [Dayjs, Dayjs];
  const queryParam = reactive({
    name: '',
    startTime: '',
    endTime: '',
  });
  const current = ref<number>(1);
  const pageSizeOptions = ref<string[]>(['8', '12', '24', '32']);
  const pageSizeRef = ref(8);
  const total = ref(0);
  const dateFormat = 'YYYY-MM-DD';
  const uploadDate = ref<RangeValue>();
  const formElRef = ref();
  const labelCol = reactive({
    xs: { span: 24 },
    sm: { span: 5 },
  });
  const wrapperCol = reactive({
    xs: { span: 24 },
    sm: { span: 19 },
  });
  const loading = ref(false);
  const showBtn = ref(false);
  const hoverIndex = ref(-1);
  const listData = ref([]);
  // onCreated
  loadData(1);
  const onShowSizeChange = (current: number, pageSize: number) => {
    console.log(current, pageSize);
    pageSizeRef.value = pageSize;
    loadData(1);
  };
  const onChange = (pageNumber: number) => {
    console.log('Page: ', pageNumber);
    current.value = pageNumber;
    loadData(0);
  };
  async function loadData(arg) {
    if (arg === 1) {
      current.value = 1;
    }
    loading.value = true;
    let param = Object.assign({}, queryParam);
    param['pageNo'] = current.value;
    param['pageSize'] = pageSizeRef.value;
    console.log('param', param);
    await list(param).then((res) => {
      console.log('res', res);
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
        console.log('this.listData.value', listData.value);
      }
    });
  }
  function onSuccess() {
    loadData(1);
  }
  function handleMouseOver(event) {
    console.log('event', event);
    hoverIndex.value = event.currentTarget.getAttribute('data-index');
    console.log('this.hoverIndex', hoverIndex.value);
    showBtn.value = true;
  }
  function handleMouseLeave() {
    hoverIndex.value = -1;
    showBtn.value = false;
  }
  // 上传时间
  function onChangeTime(date, dateString) {
    console.log(date, dateString);
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
    Object.assign(queryParam, { name: '', startTime: '', endTime: '' });
    uploadDate.value = null;
    loadData(1);
  }
  // 全部下载
  function handleDownload(record) {
    console.log('handleDownload');
    let param = Object.assign({}, queryParam);
    delete param['pageNo'];
    delete param['pageSize'];
    downloadFileAll('/investLedger/download', `${record.year}敬业集团生产系统安全投入费用预算.pdf`, {id: record.id});
  }
  // 新增
  function handleAdd() {
    console.log('handleAdd');
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
    console.log('handleEdit', record);
    openRoleModal(true, { record, isUpdate: true });
  }
  // 删除
  function handleDelete(item) {
    console.log('handleDelete', item);
    createConfirm({
      iconType: 'warning',
      title: '删除',
      content: '确定要删除吗？',
      onOk: () => {
        deleteOne({ id: item.id }).then((res) => {
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
    // margin: 24px 0;
    width: 100%;
    height: 0px;
    opacity: 1;
    border: 1px solid rgba(0, 0, 0, 0.1);
  }

  .book-list {
    margin-right: -24px;
    //   overflow: hidden;
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
      background: url('/@/assets/images/emergency/book.png');
      background-size: 100% 100%;
      background-repeat: no-repeat;
      width: 373px;
      height: 400px;

      .item-title {
        width: 270px;
        position: absolute;
        top: 84px;
        left: 52px;
        font-size: 26px;
        font-family: Source Han Sans CN-Bold, Source Han Sans CN;
        font-weight: bold;
        color: #724315;
        word-break: break-all;
      }

      .item-time {
        position: absolute;
        bottom: 32px;
        left: 52px;
        font-size: 16px;
        font-family: SourceHanSansCN-Medium-, SourceHanSansCN-Medium;
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
