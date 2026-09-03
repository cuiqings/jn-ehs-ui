<template>
  <div class="ihome">
    <div class="home-content" v-if="isContent === 'content'">
      <a-row style="height: 100%">
        <a-col :span="6" style="height: 100%">
          <div class="home-content_tree">
            <div
              >主题分类（{{ count }}）<div>
                <a-tooltip>
                  <template #title>展开目录</template>
                  <a-button type="link" @click="onExpandAll">
                    <a-icon type="menu-fold" class="icon icon2" />
                  </a-button>
                </a-tooltip>
                <a-tooltip>
                  <template #title>关闭目录</template>
                  <a-button type="link" @click="onExpand">
                    <a-icon type="menu-unfold" class="icon icon2" />
                  </a-button>
                </a-tooltip> </div
            ></div>
            <a-spin :spinning="treeLoading">
              <a-tree
                v-model:expandedKeys="expandedKeys"
                :tree-data="treeData"
                block-node
                @select="selectTree"
                :field-names="{
                  title: 'name',
                  key: 'name',
                  options: 'children',
                }"
              />
            </a-spin>
          </div>
        </a-col>
        <a-col :span="18" style="height: 100%">
          <div class="home-content_search">
            <div class="home-content_search_div"
              ><span class="home-content_search_div_lable">关键字：</span>
              <a-input-group compact style="margin-left: 6px">
                <a-select v-model:value="conditionsValue">
                  <a-select-option value="标题">标题</a-select-option>
                  <a-select-option value="内容">内容</a-select-option>
                </a-select>
                <a-input
                  v-model:value="value"
                  style="width: calc(40% - 158px); border-left: none"
                  placeholder="请输入"
                  @keydown.enter="enterPressHadlerSearc"
                />
                <a-button style="margin-left: 20px" type="primary" @click="onSearch">查询</a-button>
                <a-button style="margin-left: 20px" @click="onReset">重置</a-button>
              </a-input-group>
            </div>
            <div class="home-content_search_div">
              <span class="home-content_search_div_lable">法规层级：</span>
              <div class="legalHierarchySelect">
                <div>
                  <span
                    v-for="item in legalHierarchyArr"
                    :key="item.value"
                    :class="legalHierarchySelected.includes(item.value) ? 'selected' : ''"
                    @click="onLegalHierarchy(item.value)"
                    >{{ item.label }}</span
                  >
                </div>
              </div>
            </div>
            <div class="home-content_search_div">
              <span class="home-content_search_div_lable">法规状态：</span>
              <div class="legalHierarchySelect">
                <div>
                  <span
                    v-for="item in statusArr"
                    :key="item.value"
                    :class="statusSelected.includes(item.value) ? 'selected' : ''"
                    @click="onStatus(item.value)"
                    >{{ item.label }}</span
                  >
                </div>
                <div style="width: calc(40% + 20px)">
                  <span class="home-content_search_div_lable">发布部门：</span>
                  <a-input style="width: calc(100% - 110px)" placeholder="请输入" v-model:value="queryParams.publishDepart" :maxlength="100" />
                </div>
              </div>
            </div>
            <div class="home-content_search_div">
              <span class="home-content_search_div_lable">实施日期：</span>
              <div class="dateSelect">
                <div>
                  <span :class="executeSelected === '全部' ? 'selected' : ''" @click="onDateSelect('全部')">全部</span>
                  <span :class="executeSelected === '近一月' ? 'selected' : ''" @click="onDateSelect('近一月')">近一月</span>
                  <span :class="executeSelected === '近三月' ? 'selected' : ''" @click="onDateSelect('近三月')">近三月</span>
                  <span :class="executeSelected === '近一年' ? 'selected' : ''" @click="onDateSelect('近一年')">近一年</span>
                  <span :class="executeSelected === '近两年' ? 'selected' : ''" @click="onDateSelect('近两年')">近两年</span>
                </div>
                <a-range-picker style="width: 40%" valueFormat="YYYY-MM-DD" v-model:value="executeDate" @change="onDate" />
              </div>
            </div>
          </div>
          <div class="home-content_result">
            <a-spin :spinning="spinning">
              <div v-if="dataSource.length > 0" class="content_result_w">
                <p style="color: rgb(24, 144, 255)"
                  >为您搜索到相关结果<span style="padding: 0 5px">{{ page.total }}</span
                  >条</p
                >
                <div class="content_result_n">
                  <div v-for="item in dataSource" :key="item.id" class="home-content_result_list">
                    <div>
                      <p v-html="item.fileName" @click="onView(item)"></p>
                      <a-tag style="margin-left: 20px" color="#2db7f5">{{ renderDict(item.hierarchyStatus, 'law_status') }}</a-tag>
                      <span>{{ item.publishDepart }}</span>
                    </div>
                    <div v-html="item.fileContent"></div>
                    <div style="display: flex; justify-content: space-between">
                      <span>实施日期：{{ item.executeDate }}</span>
                      <span>阅读量：{{ item.readCount }}</span>
                    </div>
                  </div>
                </div>
              </div>
              <a-empty v-else :image="Empty.PRESENTED_IMAGE_SIMPLE" />
            </a-spin>
            <!-- 分页 -->
            <div class="bottom-page" v-if="dataSource.length > 0">
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
          </div>
        </a-col>
      </a-row>
    </div>
    <home-view :list-obj="listObj" :breadcrumb-text="breadcrumbText" @success="onSuccess" v-if="isContent === 'view'" />
  </div>
</template>
<script lang="ts" name="law-lawLaw" setup>
  import { useContent } from './hooks/useContent';
  import { Empty } from 'ant-design-vue';
  import { Pagination } from 'ant-design-vue';
  import homeView from './component/view.vue';
  const {
    conditionsValue,
    value,
    onSearch,
    enterPressHadlerSearc,
    isContent,
    expandedKeys,
    treeData,
    count,
    onDateSelect,
    executeSelected,
    dataSource,
    renderDict,
    executeDate,
    onDate,
    page,
    onChange,
    selectTree,
    onView,
    listObj,
    onSuccess,
    breadcrumbText,
    legalHierarchyArr,
    legalHierarchySelected,
    onLegalHierarchy,
    statusArr,
    statusSelected,
    onStatus,
    queryParams,
    onReset,
    onExpandAll,
    onExpand,
    spinning,
    treeLoading,
  } = useContent('1');
</script>
<style lang="less" scoped>
  .home {
    background-color: rgba(251, 250, 250, 1);
    height: 100%;
  }
  .home-content {
    padding: 20px 0;
    width: 90%;
    margin: 0 auto;
    height: calc(100vh - 100px);
    .home-content_tree {
      margin-right: 15px;
      border: 1px solid rgb(215, 215, 215);
      border-radius: 5px;
      height: calc(100vh - 140px);
      & > div:nth-child(1) {
        height: 60px;
        line-height: 60px;
        background-color: rgb(242, 242, 242);
        font-size: 18px;
        text-align: center;
        border-radius: 5px 5px 0 0;
        position: relative;
        & > div {
          position: absolute;
          top: 0;
          right: 0;
        }
      }
    }
    .home-content_search {
      background-color: #ffffff;
      border: 1px solid rgb(215, 215, 215);
      border-radius: 5px;
      margin-bottom: 20px;
      padding: 15px;
      .home-content_search_div {
        display: flex;
        margin-bottom: 20px;
        .home-content_search_div_lable {
          width: 100px;
          text-align: right;
          line-height: 32px;
        }
        .dateSelect {
          display: flex;
          justify-content: space-between;
          width: 100%;
          & div > span {
            display: inline-block;
            min-width: 90px;
            height: 32px;
            line-height: 32px;
            text-align: center;
            cursor: pointer;
            margin: 0 5px;
          }
          .selected {
            background-color: #1890ff;
            color: #ffffff;
          }
        }
        .legalHierarchySelect {
          display: flex;
          justify-content: space-between;
          width: 100%;
          & div > span {
            display: inline-block;
            height: 32px;
            line-height: 32px;
            min-width: 90px;
            text-align: center;
            cursor: pointer;
            margin: 0 5px;
          }
          .selected {
            background-color: #1890ff;
            color: #ffffff;
          }
        }
      }
    }
    .home-content_result {
      background-color: #ffffff;
      border: 1px solid rgb(215, 215, 215);
      border-radius: 5px;
      padding: 15px;
      height: calc(100% - 260px);
      .content_result_w {
        height: calc(100% - 40px);
        .content_result_n {
          height: 100%;
          overflow-y: auto;
        }
      }
      .home-content_result_list {
        margin-bottom: 20px;
        padding-right: 10px;
        & > div:nth-child(1) {
          display: flex;
          align-items: center;
          & > p {
            font-size: 18px;
            max-width: 21em; /* 控制宽度为最多10个字的宽度 */
            white-space: nowrap; /* 禁止文本换行 */
            overflow: hidden; /* 隐藏超出容器的部分 */
            text-overflow: ellipsis; /* 超出部分显示省略号 */
            height: 32px;
            line-height: 32px;
            margin-bottom: 0;
            cursor: pointer;
          }
          & > span:nth-child(2) {
            margin: 0 15px;
          }
          & > span:nth-child(3) {
            color: rgb(127, 127, 127);
            max-width: 16em;
            white-space: nowrap; /* 禁止文本换行 */
            overflow: hidden; /* 隐藏超出容器的部分 */
            text-overflow: ellipsis; /* 超出部分显示省略号 */
            height: 32px;
            line-height: 32px;
          }
        }
        & > div:nth-child(2) {
          text-indent: 2em;
          overflow: hidden;
          word-break: break-all;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
        }
        & > div:nth-child(3) {
          span {
            color: rgb(127, 127, 127);
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
  }
  .home-search {
    /deep/ .ant-input,
    /deep/.ant-btn,
    /deep/.ant-select-selector {
      height: 60px !important;
      font-size: 18px;
    }
    /deep/.ant-btn {
      border-top-right-radius: 8px !important;
      border-bottom-right-radius: 8px !important;
    }
    /deep/.ant-select-selector {
      border-top-left-radius: 8px !important;
      border-bottom-left-radius: 8px !important;
      text-align: center;
    }
    /deep/ .ant-select-arrow {
      top: 28px;
      font-size: 18px;
    }
    /deep/ .ant-select-selection-item {
      line-height: 60px !important;
    }
  }
  /deep/ .ant-tree {
    height: 100%;
    overflow-y: auto;
    padding: 20px;
    font-size: 16px;
    border-radius: 0 0 5px 5px;
  }
  /deep/ .ant-empty-normal {
    padding: 10% 0;
  }
  /deep/ .ant-spin-nested-loading {
    height: calc(100% - 60px);
    .ant-spin-container {
      height: 100%;
    }
  }
  .home-content_result {
    /deep/ .ant-spin-nested-loading {
      height: calc(100% - 36px);
      .ant-spin-container {
        height: 100%;
      }
    }
  }
</style>
