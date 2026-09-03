<template>
  <BasicDrawer v-bind="$attrs" @register="registerDrawerView" title="查看" :width="900" :show-ok-btn="false" show-footer destroyOnClose>
    <div>
      <div class="view_nav">
        <div>
          <p style="display: flex"
            >文件名称：<span class="ellipsis" style="max-width: 400px">{{ list.fileName }}</span
            ><a-tag v-if="list.hierarchyStatus" style="margin-left: 20px" color="#2db7f5">{{
              renderDict(list.hierarchyStatus, 'law_status')
            }}</a-tag></p
          >
          <div>
            <span>发布日期：{{ list.publishDate }}</span>
            <span style="margin-left: 80px">实施日期：{{ list.executeDate }}</span>
          </div>
        </div>
        <div>
          <a-button style="margin: 0 10px" type="primary" size="large" @click="onPreview(list.fileUrl)">PDF预览</a-button>
          <a-button style="margin: 0 10px" type="primary" size="large" @click="downloadFileManage(list.fileUrl)">下载</a-button>
        </div>
      </div>
      <div class="view_soa">
        <p>适用范围</p>
        <p style="color: #666666">{{ list.scopeUse }}</p>
        <div>
          <div class="view_soa_tr">
            <div>{{ list.fileType === '1' ? '发文字号' : '标准编号' }}</div>
            <div>{{ list.standardNumber }}</div>
          </div>
          <div class="view_soa_tr">
            <div>主题分类</div>
            <div>{{ list.topicTwoCategory ? list.topicCategory + '>' + list.topicTwoCategory : list.topicCategory }}</div>
          </div>
          <div class="view_soa_tr" v-if="list.fileType === '1'">
            <div>法律层级</div>
            <div>{{ renderDict(list.legalHierarchy, 'law_level') }}</div>
          </div>
          <div class="view_soa_tr" v-if="list.fileType !== '1'">
            <div>中国标准分类号</div>
            <div>{{ list.chinaStandardNumber }}</div>
          </div>
          <div class="view_soa_tr" v-if="list.fileType !== '1'">
            <div>国际标准分类号</div>
            <div>{{ list.internalStandardNumber }}</div>
          </div>
          <div class="view_soa_tr" v-if="list.fileType !== '1'">
            <div>标准体系分类</div>
            <div>{{ renderDict(list.fileType, 'law_file_type') }}</div>
          </div>
          <div class="view_soa_tr" v-if="list.fileType === '3'">
            <div>行业标准分类</div>
            <div>{{ list.tradeStandardCategort }}</div>
          </div>
          <div class="view_soa_tr" v-if="list.fileType === '4'">
            <div>地区</div>
            <div>{{ list.area }}</div>
          </div>
          <div class="view_soa_tr">
            <div>发布部门</div>
            <div>{{ list.publishDepart }}</div>
          </div>
          <div class="view_soa_tr" v-if="list.fileType !== '1'">
            <div>归口单位</div>
            <div>{{ list.technicalOmmittees }}</div>
          </div>
          <div class="view_soa_tr" v-if="list.fileType !== '1'">
            <div>起草单位</div>
            <div>{{ list.draftingUnit }}</div>
          </div>
          <div class="view_soa_tr" v-if="list.fileType !== '1'">
            <div>起草人</div>
            <div>{{ list.drafter }}</div>
          </div>
        </div>
      </div>
      <div class="view_file">
        <p>相关文件</p>
        <template v-if="list.associationFile?.length > 0">
          <div v-for="item in list.associationFile" :key="item.id" @click="goView(item.id)">{{
            item.fileName + '【' + item.standardNumber + '】'
          }}</div>
        </template>
        <div v-else class="zw">暂无</div>
      </div>
      <div class="view_content">
        <p>正文</p>
        <div v-if="list.fileContent" ref="contentRef" v-html="list.fileContent"></div>
        <div v-else class="zw">暂无</div>
      </div>
      <div class="view_bottom">
        <div>
          <span>录入人：{{ realname }}</span>
          <span>录入时间：{{ list.createTime }}</span>
        </div>
      </div>
    </div>
  </BasicDrawer>
</template>
<script lang="ts" name="law-view-drawer" setup>
  import { useViewDrawer } from '../hooks/useViewDrawer';
  import { downloadFileManage } from '/@/utils/common/renderUtils';
  const { BasicDrawer, registerDrawerView, list, renderDict, onPreview, goView, realname } = useViewDrawer();
</script>
<style lang="less">
  .highlight {
    cursor: pointer;
    background-color: #ffffff;
    color: #1890ff;
    text-decoration: underline;
  }
  .content-modal {
    .ant-modal-header {
      .ant-modal-title {
        width: calc(100% - 56px);
      }
    }
    .ant-modal-close-x {
      width: 70px;
    }
    .ant-modal-body {
      padding: 15px;
    }
  }
</style>
<style lang="less" scoped>
  .ellipsis {
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
    display: inline-block;
  }
  .view_nav {
    border: 1px solid rgba(215, 215, 215, 1);
    border-radius: 6px;
    margin: 20px 0;
    padding: 15px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .view_soa {
    margin: 0 15px;
    & > div {
      border: 1px solid #e5e7eb;
      .view_soa_tr {
        line-height: 35px;
        height: 35px;
        & > div:nth-child(1) {
          width: 150px;
          text-align: center;
          border-right: 1px solid #e5e7eb;
          text-overflow: ellipsis;
          white-space: nowrap;
          overflow: hidden;
          display: inline-block;
        }
        & > div:nth-child(2) {
          padding: 0 10px;
          color: #666666;
          width: calc(100% - 150px);
          text-overflow: ellipsis;
          white-space: nowrap;
          overflow: hidden;
          display: inline-block;
        }
        & > div {
          display: inline-block;
        }
      }
      .view_soa_tr:nth-child(2n) {
        background-color: #e5e7eb;
      }
    }
  }
  .view_file {
    margin: 20px 15px;
    & > div {
      color: #1890ff;
      padding-left: 15px;
      cursor: pointer;
    }
    .zw {
      color: rgb(127, 127, 127);
      cursor: none;
    }
  }
  .view_content {
    border: 1px solid rgba(215, 215, 215, 1);
    border-radius: 6px;
    padding: 10px 0;
    p {
      padding: 0 0 0 20px;
    }
    & > div {
      padding: 0 25px;
    }
    .zw {
      color: rgb(127, 127, 127);
    }
  }
  .view_bottom {
    border: 1px solid rgba(215, 215, 215, 1);
    border-radius: 6px;
    margin-top: 20px;
    & > div {
      line-height: 40px;
      display: flex;
      justify-content: space-between;
      padding: 0 10px;
      & > span:nth-child(2) {
        padding-right: 30px;
      }
    }
  }
</style>
