<template>
  <div class="accidentInquiry accidentInquiry-form">
    <a-form
      ref="formRef"
      :model="queryParams"
      :label-col="{
        xs: { span: 12 },
        sm: { span: 5 },
      }"
      :wrapper-col="{
        xs: { span: 24 },
        sm: { span: 19 },
      }"
    >
      <a-row :gutter="24">
        <a-col :md="6" :sm="12">
          <a-form-item label="发生单位">
            <a-select
              v-model:value="queryParams.orgCodes"
              mode="multiple"
              :options="orgOptions"
              label-field="departName"
              value-field="orgCode"
              placeholder="请选择"
            />
          </a-form-item>
        </a-col>
        <a-col :md="6" :sm="12">
          <a-form-item label="事件类型">
            <j-dict-select-tag
              v-model:value="queryParams.types"
              mode="multiple"
              :show-choose-option="false"
              dictCode="event_type"
              placeholder="请选择"
              :string-to-number="false"
            />
          </a-form-item>
        </a-col>
        <a-col :md="6" :sm="12">
          <a-form-item label="事件结果">
            <j-dict-select-tag
              v-model:value="queryParams.results"
              mode="multiple"
              :show-choose-option="false"
              dictCode="event_result"
              placeholder="请选择"
              :string-to-number="false"
            />
          </a-form-item>
        </a-col>
        <template v-if="toggleSearchStatus">
          <a-col :md="6" :sm="12">
            <a-form-item label="事件描述">
              <a-input allowClear placeholder="请输入" v-model:value="queryParams.description" />
            </a-form-item>
          </a-col>
          <a-col :md="6" :sm="12">
            <a-form-item label="发生时间">
              <a-range-picker style="width: -webkit-fill-available" valueFormat="YYYY-MM-DD" v-model:value="queryParams.time" />
            </a-form-item>
          </a-col>
        </template>
        <a-col :md="6" :sm="12">
          <a-button type="primary" preIcon="ant-design:search-outlined" @click="searchQuery">查询</a-button>
          <a-button preIcon="ant-design:reload-outlined" @click="searchReset" style="margin-left: 8px">重置</a-button>
          <a @click="toggleSearchStatus = !toggleSearchStatus" style="margin-left: 8px">
            {{ toggleSearchStatus ? '收起' : '展开' }}
            <Icon :icon="toggleSearchStatus ? 'ant-design:up-outlined' : 'ant-design:down-outlined'" />
          </a>
        </a-col>
      </a-row>
    </a-form>
  </div>
  <div class="accidentInquiry accidentInquiry-content">
    <a-row :gutter="24">
      <a-col :md="6" :sm="12">
        <div class="btn-list">
          <a-button @click="handleAdd" type="primary">历史事故存档</a-button>
        </div>
      </a-col>
    </a-row>
    <a-spin :spinning="spinning">
      <div v-if="listData.length > 0" style="overflow-x: scroll">
        <div class="book-list">
          <div class="row-item" :data-index="index" v-for="(item, index) in listData" :key="item.id">
            <div @click="handleView(item)">
              <div>{{ item.name }}</div>
              <div>
                <a-tag :color="item.result === '1' ? 'green' : item.result === '2' ? 'blue' : 'orange'">{{
                  renderDict(item.result, 'event_result')
                }}</a-tag></div
              >
            </div>
            <div @click="handleView(item)">损失天数：{{ item.lostWorkday ? Number(item.lostWorkday) : '--' }}</div>
            <div @click="handleView(item)">
              事故描述：
              <div
                style="
                  overflow: hidden;
                  word-break: break-all;
                  text-overflow: ellipsis;
                  display: -webkit-box;
                  -webkit-box-orient: vertical;
                  -webkit-line-clamp: 2;
                "
                >{{ item.description }}</div
              >
            </div>
            <div>
              <j-image-upload :value="imgText(item.photo)" disabled text="" />
            </div>
            <div>
              <div @click="handleView(item)">发生时间：{{ item.eventTime }}</div>
              <div @click="dayCorrection(item)">损失天数补正</div>
              <a-button type="primary" @click="handleReplenishMaterial(item)">补充资料</a-button>
            </div>
          </div>
        </div>
      </div>
      <a-empty v-else description="暂无数据" style="position: relative; margin: 20px" />
    </a-spin>
    <!-- 分页 -->
    <div class="bottom-page" v-if="listData.length > 0">
      <pagination
        v-model:current="page.pageNo"
        v-model:pageSize="page.pageSize"
        style="margin: 10px 0"
        size="small"
        :pageSizeOptions="[]"
        show-quick-jumper
        :total="page.total"
        :show-total="(total) => `共 ${total} 条数据`"
        @change="onChange"
      />
    </div>
    <day-correction-modal @register="registerModal" @success="onSuccess" />
    <replenish-material @register="materialRegisterModal" />
    <event-history-archive @register="registerDrawer" @success="onSuccess" />
    <view-modal @register="viewRegisterModal" />
  </div>
</template>
<script setup name="accident-inquiry" lang="ts">
  import dayCorrectionModal from './dayCorrectionModal.vue';
  import ReplenishMaterial from '../incidentExpress/component/ReplenishMaterial.vue';
  import eventHistoryArchive from './eventHistoryArchive.vue';
  import viewModal from './viewModal.vue';
  import { Pagination } from 'ant-design-vue';
  import { JImageUpload } from '/@/components/Form';
  import { JDictSelectTag } from '/@/components/Form';
  import { useContent } from './hooks/useContent';
  const {
    queryParams,
    searchQuery,
    searchReset,
    listData,
    handleAdd,
    toggleSearchStatus,
    onChange,
    page,
    dayCorrection,
    registerModal,
    onSuccess,
    materialRegisterModal,
    handleReplenishMaterial,
    registerDrawer,
    viewRegisterModal,
    handleView,
    imgText,
    renderDict,
    spinning,
    orgOptions,
  } = useContent();
</script>
<style lang="less" scoped>
  .accidentInquiry {
    margin: 10px;
    border-radius: 2px;
    background-color: #ffffff;
  }
  .accidentInquiry-form {
    padding: 12px 10px 6px;
  }
  .accidentInquiry-content {
    padding: 6px;
    .book-list {
      .row-item {
        width: calc((100% - 2%) / 3);
        min-height: 286px;
        display: inline-table;
        border: 1px solid rgba(170, 170, 170, 1);
        border-radius: 8px;
        padding: 15px;
        margin: 6px 0;
        margin-right: calc(2% / 2);
        &:nth-child(3n) {
          margin-right: 0;
        }
        & > div:nth-child(1) {
          display: flex;
          justify-content: space-between;
          & > div:nth-child(1) {
            font-weight: bold;
            font-size: 14px;
          }
        }
        & > div:last-child {
          display: flex;
          justify-content: space-between;
          line-height: 32px;
          & > div:nth-child(2) {
            color: #02a7f0;
            text-decoration: underline;
            cursor: pointer;
          }
        }
      }
    }
    .bottom-page {
      width: 100%;
      display: flex;
      justify-content: flex-end;
      align-items: center;
      padding-right: 20px;
    }
  }
  /deep/ .ant-form-item {
    margin-bottom: 8px !important;
  }
</style>
