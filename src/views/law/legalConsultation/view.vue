<template>
  <div class="home-view">
    <div class="home-view_breadcrumb"
      ><a-breadcrumb separator=">">
        当前位置：<a-breadcrumb-item @click="onBack" style="cursor: pointer">心安模型</a-breadcrumb-item>
        <a-breadcrumb-item>{{ list.fileName }}</a-breadcrumb-item> </a-breadcrumb
      ><a-button @click="onBack"> 返回 </a-button></div
    >
    <div style="height: calc(100vh - 182px)">
      <div class="view_nav">
        <div style="width: 60%">
          <p style="display: flex"
            >文件名称：<span class="ellipsis" style="max-width: calc(100% - 162px)">{{ list.fileName }}</span
            ><a-tag v-if="list.hierarchyStatus" style="margin-left: 20px" color="#2db7f5">{{
              renderDict(list.hierarchyStatus, 'law_status')
            }}</a-tag></p
          >
          <div>
            <span>发布日期：{{ list.publishDate }}</span>
            <span style="margin-left: 80px">实施日期：{{ list.executeDate }}</span>
          </div>
        </div>
        <div style="display: flex; align-items: center">
          <a-button style="margin: 0 10px" type="primary" size="large" @click="onPreview(list.fileUrl)">PDF预览</a-button>
          <a-button style="margin: 0 10px" type="primary" size="large" @click="downloadFileManage(list.fileUrl)">下载</a-button>
          <Icon
            :style="`font-size: 25px; padding: 0 20px; cursor: pointer; color: ${list.hasCollection ? '#ffc53d' : ''}`"
            icon="fa6-regular:star"
            @click="onCollect"
          />
        </div>
      </div>
      <div class="home-view_content">
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
      </div>
    </div>
  </div>
</template>
<script lang="ts" name="law-home-view" setup>
  import { getDictItemsByCode } from '/@/utils/dict/index';
  import { doPreview } from '/@/api/common/api';
  import { downloadFileManage } from '/@/utils/common/renderUtils';
  import Icon from '/@/components/Icon';
  import { ref, watch } from 'vue';
  import { details, collect, collectCancel } from '../lawHome/url/index';
  import { fileDetails } from './url/index';
  import { useMessage } from '/@/hooks/web/useMessage';
  const props = defineProps({
    id: {
      type: String,
      required: true,
    },
    scrollTop: {
      type: Number,
    },
  });
  const emits = defineEmits(['success']);
  const { createMessage } = useMessage();
  const list: any = ref({});
  watch(
    () => props.id,
    (value) => {
      fileDetails({ id: value }).then((res) => {
        list.value = { ...res };
      });
    },
    { immediate: true }
  );
  const onBack = () => {
    emits('success', props.scrollTop);
  };
  const renderDict = (v, code) => {
    let text = '';
    const array = getDictItemsByCode(code) || [];
    const obj = array.filter((item) => item.value == v);
    if (obj.length > 0) {
      text = obj[0].text;
    }
    return text;
  };
  // 预览
  const onPreview = (name) => {
    doPreview(name).then((res) => {
      window.open(res, '_blank');
    });
  };
  // 相关文件
  const goView = async (id) => {
    initdetails(id);
  };
  const initdetails = (id) => {
    details({ id }).then((res) => {
      list.value = res;
    });
  };
  const onCollect = () => {
    if (!list.value.hasCollection) {
      collect({ jnFileManageId: list.value.id }).then((res) => {
        if (res.success) {
          createMessage.success('收藏成功！');
          list.value.hasCollection = true;
        } else {
          createMessage.error(res.message);
        }
      });
    } else {
      collectCancel({ jnFileManageId: list.value.id }).then((res) => {
        if (res.success) {
          createMessage.success('取消收藏成功！');
          list.value.hasCollection = false;
        } else {
          createMessage.error(res.message);
        }
      });
    }
  };
</script>
<style lang="less">
  .highlight {
    background-color: #ffffff;
    color: #1890ff;
    text-decoration: underline;
    cursor: pointer;
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
  .home-view {
    width: 90%;
    margin: 0 auto;
    .home-view_breadcrumb {
      padding: 15px 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .view_nav {
      border: 1px solid rgba(215, 215, 215, 1);
      border-radius: 6px;
      margin-bottom: 20px;
      padding: 15px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background-color: #ffffff;
    }
    .home-view_content {
      height: calc(100% - 130px);
      border: 1px solid rgba(215, 215, 215, 1);
      background-color: #ffffff;
      border-radius: 6px;
      overflow-y: auto;
    }
    .view_soa {
      padding: 15px 15px 0;
      border-bottom: none;
      border-radius: 6px 6px 0 0;
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
      padding: 20px 15px;
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
      background-color: #ffffff;
      padding: 10px 15px;
      border-radius: 0 0 6px 6px;
      p {
        padding: 0 15px;
      }
      & > div {
        padding-left: 30px;
      }
      .zw {
        color: rgb(127, 127, 127);
      }
    }
    /deep/ .ant-breadcrumb {
      width: 95%;
    }
    /deep/.ant-breadcrumb-link {
      max-width: 88%;
      display: inline-block;
      text-overflow: ellipsis;
      white-space: nowrap;
      overflow: hidden;
      height: 17px;
    }
  }
</style>
