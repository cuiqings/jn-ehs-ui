<template>
  <div class="containBox">
    <!-- <div v-if="data.id" class="treeBox"> -->
    <div class="treeBox">
      <a-spin tip="加载中..." v-if="data.length === 0" />
      <vue3-tree-org
        :label-class-name="labelClassName"
        :data="data"
        :horizontal="horizontal"
        :collapsable="true"
        :scalable="true"
        :toolBar="false"
        :default-expand-level="1"
        :center="true"
        :disabled="true"
        @on-node-drag="nodeDragMove"
        @on-node-drag-end="nodeDragEnd"
        @on-contextmenu="onMenus"
        @on-expand="onExpand"
        @on-node-dblclick="onNodeDblclick"
        @on-node-click="onNodeClick"
      >
        <!-- 自定义节点内容 -->
        <template v-slot="{ node }">
          <div class="treeStyle">
            <a-popover placement="bottom">
              <template #content v-if="node.$$data.treeUserVoList && node.$$data.treeUserVoList.length > 0">
                <div class="treeStyle3">
                  <div v-for="(item, index) in node.$$data.treeUserVoList" :key="index" :id="item.id" @click="showPersonDetails(item)">
                    <img class="treeimage" :src="node.$$data.avatar ? getAvatarView(item.avatar) : defaultAvatar" />
                    <div :id="item.id" class="treeStyle5">
                      <span class="treeStyle4">
                        {{ item.realname }}
                      </span>
                      <span style="color: #1890ff; width: 70px">{{ item.safetyManagementPost }}</span>
                    </div>
                  </div>
                </div>
              </template>
              <div class="treeStyle2">{{ node.$$data.label }} </div>
            </a-popover>
          </div>
        </template>
      </vue3-tree-org>
    </div>

    <a-modal title="人员信息" :visible="visiblePerson" @cancel="handleCancel" :footer="null" width="610px" z-index="9999">
      <div class="person-detail">
        <div class="person-detail-top">
          <div class="person-detail-top-left fl">
            <img :src="basicInfo.avatar ? getAvatarView(basicInfo.avatar) : defaultAvatar" />
          </div>
          <div class="person-detail-top-right">
            <div class="name">{{ basicInfo.realname ? basicInfo.realname : '-' }}</div>
            <div class="position">
              <span class="ellipsisStyle"> {{ basicInfo.safetyManagementPost ? basicInfo.safetyManagementPost : '-' }}</span>
            </div>
            <div class="gw fl"
              >岗位 <span>{{ basicInfo.gw ? basicInfo.gw : '-' }}</span></div
            >
            <div class="gw fl"
              >联系方式 <span>{{ basicInfo.contactInformation ? basicInfo.contactInformation : '-' }}</span></div
            >
          </div>
        </div>
        <div class="person-detail-bottom">
          <div class="title">安全生产职责：</div>
          <ul class="otherScroll" v-if="basicInfo.strings && basicInfo.strings.length != 0">
            <li v-for="(item, index) in basicInfo.strings" :key="index"> {{ index + 1 }}. {{ item }} </li>
          </ul>
          <ul v-else>
            <li>暂无数据</li>
          </ul>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="jsx">
  import { ref, onMounted } from 'vue';
  import { queryAlltree } from './demo.api';
  import { getFileAccessHttpUrl } from '/@/utils/common/compUtils';
  import defaultAvatar from '/@/assets/images/default-avatar.png';
  const labelClassName = 'bg-color-orange';
  let data = ref([]);
  const horizontal = ref(false);
  const visiblePerson = ref(false);
  let basicInfo = ref([]);
  function nodeDragMove(data) {
    console.log(data);
  }
  function nodeDragEnd(data, isSelf) {
    console.log(data, isSelf);
  }
  function onMenus({ node, command }) {
    console.log(node, command);
  }
  function onExpand(e, data) {
    console.log(e, data);
  }
  function onNodeDblclick() {}
  function onNodeClick(e, data) {
    console.log(data.label);
  }
  function getAvatarView(avatar) {
    return getFileAccessHttpUrl(avatar);
  }
  // 获取图谱数据
  async function getTreeData() {
    const res = await queryAlltree();
    if (Array.isArray(res)) {
      data.value = res[0];
    }
  }
  getTreeData();
  function showPersonDetails(e) {
    visiblePerson.value = true;
    basicInfo.value = e;
  }
  function handleCancel() {
    visiblePerson.value = false;
  }
  // 挂载
  onMounted(async () => {});
</script>

<style lang="less" scoped>
  .containBox {
    padding: 10px;
    height: 100%;
    .treeBox {
      position: relative;
      height: 100%;
      overflow: auto;
      text-align: center;
      background: #fff;
    }
  }
  // 图谱插槽样式
  .treeStyle {
    background: #fff;
    box-shadow: 0 4px 8px 0 rgba(100, 149, 237, 0.2), 0 6px 20px 0 rgba(100, 149, 237, 0.19);
    border-radius: 4px;
    position: relative;
  }
  .treeStyle2 {
    color: #fff;
    background: #1890ff;
    width: 100%;
    padding: 10px 0;
    line-height: 40px;
    writing-mode: vertical-lr; /* 将文本从左向右垂直显示 */
    text-orientation: upright; /* 文本方向保持正常 */
    white-space: nowrap; /* 禁止换行 */
  }
  .treeStyle3 {
    cursor: pointer;
    clear: both;
    margin-bottom: 3px;
    padding: 3px 10px;
    // position: absolute;
    // z-index: 99;
    width: 180px;
    background: rgba(255, 255, 255, 0.8);
    box-shadow: 0 4px 8px 0 rgba(100, 149, 237, 0.2), 0 6px 20px 0 rgba(100, 149, 237, 0.19);
    border-radius: 4px;
    line-height: 30px;
  }
  .treeimage {
    width: 23px;
    height: 30px;
    float: left;
    border-radius: 4px;
  }
  .treeStyle4 {
    color: #1890ff;
    display: inline-block;
    margin-right: 8px;
    width: 50px;
    text-align: left;
  }
  .treeStyle5 {
    padding-top: 4px;
    margin-left: 32px;
    text-align: left;
  }
  .treeStyle6 {
    min-width: 60px;
    overflow: hidden;
    padding: 10px 10px;
    background: #1890ff;
    box-shadow: 0 4px 8px 0 rgba(100, 149, 237, 0.2), 0 6px 20px 0 rgba(100, 149, 237, 0.19);
    border-radius: 4px;
  }

  // 人员信息
  .person-detail {
    padding: 24px;
    &-top {
      margin-bottom: 30px;
      overflow: auto;
      .fl {
        float: left;
      }
      &-left {
        width: 57px;
        height: 80px;
        img {
          width: 100%;
          height: 100%;
        }
      }
      &-right {
        overflow: auto;
        float: right;
        width: 490px;
        .name {
          font-size: 20px;
          font-weight: normal;
          color: #000000;
        }
        .position {
          height: 18px;
          margin: 0 0 12px;
          span {
            background: rgba(3, 115, 253, 0.15);
            box-shadow: 2px 3px 4px 1px rgba(0, 0, 0, 0.08);
            border-radius: 3px 3px 3px 3px;
            font-size: 12px;
            color: #0373fd;
            text-align: center;
            display: inline-block;
            padding: 1px 4px;
          }
        }
        .gw {
          font-size: 14px;
          color: rgba(0, 0, 0, 0.38);
          margin-right: 30px;
          span {
            color: rgba(0, 0, 0, 0.87);
          }
        }
      }
    }
    &-bottom {
      width: 100%;
      // height: 270px;
      background: rgba(0, 0, 0, 0.02);
      border-radius: 4px 4px 4px 4px;
      padding: 16px;
      .title {
        font-size: 14px;
        font-family: Source Han Sans CN-Medium, Source Han Sans CN;
        font-weight: 600;
        color: rgba(0, 0, 0, 0.6);
        line-height: 21px;
        margin-bottom: 8px;
      }
      ul {
        overflow-y: auto;
        height: 260px;
        margin: 0;
        li {
          font-size: 14px;
          font-family: Source Han Sans CN-Regular, Source Han Sans CN;
          font-weight: 400;
          color: rgba(0, 0, 0, 0.6);
          line-height: 21px;
          word-break: break-all; // html连续字符或数字换行的问题
          margin-bottom: 6px;
        }
      }
    }
  }
  .otherScroll::-webkit-scrollbar {
    width: 4px;
    /*滚动条宽度*/
    background: none;
    /*去除滚动条背景设置*/
  }
  .otherScroll::-webkit-scrollbar-thumb {
    background-color: #3e87f8;
    /*滚动条颜色*/
    border-radius: 5px;
  }
  .otherScroll::-webkit-scrollbar-track {
    background-color: #e0e0e0;
  }
  // 超出部分...
  .ellipsisStyle {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    -o-text-overflow: ellipsis;
  }
  /deep/.ant-spin {
    height: 400px;
    position: absolute;
    z-index: 999;
    width: 100%;
    left: 0;
    .ant-spin-dot {
      margin-top: 200px;
    }
  }
</style>
