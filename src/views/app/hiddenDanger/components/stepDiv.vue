<template>
  <div class="step-div">
    <van-steps direction="vertical" :active="0">
      <van-step v-for="item in logList" :key="item">
        <div class="time-tit">{{ item.handleTime }} {{ item.handlerOrgName }} > {{ item.handlerName }}</div>
        <div class="history-explain" style="display: flex;">
          <div
            class="explain-label"
            v-if="item.node == '31' || item.node == '32' || item.node == '1' || (item.node == '21' && item.handleResult == '2')"
            >整改反馈：
          </div>
          <div
            class="explain-label"
            v-if="item.node == '41' || item.node == '42' || item.node == '43' || item.node == '44' || item.node == '45' || item.node == '21'|| item.node == '46' || item.node == '47'"
            >验收结论：
          </div>
          <div class="explain-text">
            <span v-if="item.node == '41' || item.node == '42' || item.node == '43' || item.node == '44' || item.node == '45' || item.node == '21'|| item.node == '46' || item.node == '47'">
              <span v-if="item.handleResult == '2'">验收不通过</span>
              <span v-if="item.handleResult == '1'">验收通过</span>
            </span>
            <span style="display: inline-block; width: 100%" v-else>{{ item.description }}</span>
          </div>
        </div>
        <div style="display: flex; margin-top: 20px" v-if="item.node == '31' || item.node == '32' || item.node == '1'">
          <div style="white-space: nowrap;" v-if="item.picture">整改后照片：</div>
          <div class="img-wrap">
            <van-image
              v-for="(img, idx) in item.pictureList"
              @click="preview(idx, item.pictureList)"
              :key="idx"
              width="100"
              height="100"
              :src="img"
              style="margin-right: 16px; margin-bottom: 16px"
            />
          </div>
        </div>
        <div v-if="item.node == '41' || item.node == '42' || item.node == '43' || item.node == '44' || item.node == '45' || item.node == '21'|| item.node == '46' || item.node == '47'">
          <div style="margin-top: 20px;display: flex;">
            <div style="display: inline-block;white-space: nowrap;">处理说明：</div>
            <div style="display: inline-block; width: 550px">{{ item.description }}</div>
          </div>
          <div class="img-wrap" style="margin-top: 8px">
            <van-image
              v-for="(img, idx) in item.pictureList"
              @click="preview(idx, item.pictureList)"
              :key="idx"
              width="100"
              height="100"
              :src="img"
              style="margin-right: 16px; margin-bottom: 16px"
            />
          </div>
        </div>
        <!-- <div class="history-explain">
          <template v-if="item.node == '31' || item.node == '32' || item.node == '1' || item.node == '21'">
            <div class="explain-label" style="display: inline-block">整改反馈： {{ item.description }}</div>
          </template>
          <div class="explain-label" v-if="item.node == '41' || item.node == '42' || item.node == '43' || item.node == '44' || item.node == '45'">
            验收结论：
            <span v-if="item.handleResult == '2'">验收不通过</span>
            <span v-if="item.handleResult == '1'">验收通过</span>
          </div>
        </div>
        <div style="display: flex; margin-top: 20px" v-if="item.node == '31' || item.node == '32' || item.node == '1' || item.node == '21'">
          <div style="width: 90px; white-space: nowrap" v-if="item.picture">整改后照片：</div>
          <div class="img-wrap">
            <van-image
              v-for="(img, idx) in item.pictureList"
              @click="preview(idx, item.pictureList)"
              :key="idx"
              width="100"
              height="100"
              :src="img"
              style="margin-right: 16px; margin-bottom: 16px"
            />
          </div>
        </div>
        <div v-if="item.node == '41' || item.node == '42' || item.node == '43' || item.node == '44' || item.node == '45'">
          <div style="margin-top: 20px;display: flex;">
            <span style="white-space: nowrap;">处理说明：</span>
            <div style="display: inline-block">{{ item.description }}</div>
          </div>
          <div style="margin-left: 90px; margin-top: 8px" v-if="item.pictureList">
            <div class="img-wrap">
              <van-image
                v-for="(img, idx) in item.pictureList"
                @click="preview(idx, item.pictureList)"
                :key="idx"
                width="100"
                height="100"
                :src="img"
                style="margin-right: 16px; margin-bottom: 16px"
              />
            </div>
          </div>
        </div> -->
      </van-step>
    </van-steps>
  </div>
</template>

<script lang="ts" setup>
  import { getFileAccessHttpUrl } from '/@/utils/common/compUtils';
  import { showImagePreview } from 'vant';
  const props = withDefaults(
    defineProps<{
      logList: any[];
    }>(),
    {
      logList: () => [],
    }
  );
  const { logList } = props;
  const splitImg = (item: any) => {
    if (!item.picture) return [];
    let arr = item.picture.split(',').map((item) => getFileAccessHttpUrl(item));
    item.pictureList = arr;
  };
  logList.forEach((item) => {
    splitImg(item);
  });
  console.log(logList);

  // 图片预览
  const preview = (idx, list) => {
    showImagePreview({
      images: list,
      startPosition: idx,
    });
  };
</script>

<style lang="less" scoped>
  .step-div {
    padding: 0 15px;
    .tag {
      display: inline-block;
      width: 14px;
      height: 14px;
      border-radius: 7px;
      background-color: #ccc;
      position: absolute;
      left: -7px;
      top: 50%;
      transform: translateY(-50%);
    }
    .time-tit {
      height: 45px;
    }
    .main {
      position: relative;
    }
    .myfield {
      .van-field__value {
        max-width: 100%;
      }
    }
    .img-wrap {
      width: auto;
      height: 100px;
      display: flex;
      overflow-y: hidden;
      overflow-x: auto;
      // padding-bottom: 20px;
      // box-sizing: content-box;
      .van-image {
        flex-shrink: 0;
        width: 100px;
        margin: 0px 5px;
      }
    }
  }
  .explain-label{
    white-space: nowrap;
  }
</style>
