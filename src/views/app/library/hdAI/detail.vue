<template>
  <div class="detail-wrap">
    <div class="content">
      <div class="left">
        <div class="title">Ai识隐患</div>
        <div class="btn" @click="reuploadPicture">
          <img :src="reupload" alt="" />
          <span>重新上传</span>
        </div>
      </div>
      <div class="right">
        <van-image width="80" height="100" :src="getFileAccessHttpUrl(yhPicture)" />
      </div>
    </div>
    <div v-if="!loadingAI">
      <!-- 卡片区域 -->
      <div style="clear: both" v-if="listData.length > 0">
        <div class="study-list">
          <div class="study-item" v-for="(item, index) in listData" :key="item.id">
            <div class="item-title">
              <div class="title">{{ item.yhDescription }}</div>
              <div class="btn" @click="openDialog(item)">使用</div>
            </div>
            <div style="display: flex; align-items: center; flex-direction: column">
              <div class="study-item-content">
                <div class="text-perf"> <span>整改建议：</span>{{ item.repairSuggestion }} </div>
                <div class="text-perf"> <span>管控依据：</span>{{ item.checkStandard }}</div>
              </div></div
            >
          </div>
        </div>
      </div>
      <a-empty v-else description="暂无结果" />
    </div>
    <div style="clear: both" v-if="loadingAI">
      <div class="gif-wrap">
        <div class="loading-gif">
          <img :src="loadingAiImg" alt="" />
          <div>小安努力识别中...</div>
        </div>
      </div>
    </div>
    <van-dialog v-model:show="show" title="" :showCancelButton="true" confirmButtonText="使用" @confirm="handleUseItem">
      <div class="dialog-title"> 隐患详情 </div>
      <div style="padding: 15px; font-size: 14px; color: rgba(0, 0, 0, 0.87)">
        <div style="display: flex; margin-bottom: 12px">
          <div style="font-size: 14px; color: rgba(0, 0, 0, 0.38); width: 72px">隐患描述</div
          ><div style="width: 220px; text-align: left">{{ itemData.yhDescription }}</div>
        </div>
        <div style="display: flex; margin-bottom: 12px">
          <div style="font-size: 14px; color: rgba(0, 0, 0, 0.38); width: 72px">整改建议</div>
          <div style="width: 220px; text-align: left">{{ itemData.repairSuggestion }}</div></div
        >
        <div style="display: flex">
          <div style="font-size: 14px; color: rgba(0, 0, 0, 0.38); width: 72px">管控依据</div>
          <div style="width: 220px; text-align: left">{{ itemData.checkStandard }}</div></div
        >
      </div>
    </van-dialog>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { useRoute } from 'vue-router';
  import { useRouter } from 'vue-router';
  import reupload from '/@/assets/app/reupload@2x.png';
  import loadingAiImg from '/@/assets/app/loading.gif';
  import { getYhAIRecognizeList } from '../library.api';
  import { getFileAccessHttpUrl } from '/@/utils/common/compUtils';
  const route = useRoute();
  const router = useRouter();
  console.log(route.query);
  const loadingAI = ref(true);
  const listData = ref([]);
  const show = ref(false);
  const itemData = ref({});
  const yhPicture = ref(route.query.yhPicture);
  getRecognizeList();
  //发送请求
  async function getRecognizeList() {
    await getYhAIRecognizeList({ path: yhPicture.value })
      .then((res) => {
        console.log(res);
        loadingAI.value = false;
        listData.value = res;
      })
      .catch(() => {
        loadingAI.value = false;
      });
  }
  function openDialog(item) {
    console.log(item);
    itemData.value = item;
    show.value = true;
  }
  function handleUseItem() {
    console.log(itemData.value);
    show.value = false;
    router.push({
      path: '/app/hiddenDangerNew/randomClapping/add',
      query: { yhPicture: yhPicture.value, yhDescription: itemData.value.yhDescription },
    });
  }
  const reuploadPicture = () => {
    router.push('/app/library/hdAI/camera');
  };
</script>

<style lang="less" scoped>
  .detail-wrap {
    background-image: url('/src/assets/app/ai-bg@2x.png');
    background-size: 100% 100%;
    height: 100%;
    width: 100%;
    font-family: Source Han Sans CN, Source Han Sans CN;
    .content {
      display: flex;
      height: 132px;
      .left {
        width: 50%;
        margin: 38px 0 0 26px;
        .title {
          font-family: Source Han Sans CN, Source Han Sans CN;
          font-weight: 500;
          font-size: 20px;
          color: rgba(0, 0, 0, 0.87);
        }
        .btn {
          font-size: 14px;
          color: #3e87f8;
          margin-top: 8px;
          img {
            width: 20px;
            height: 20px;
            display: inline-block;
            vertical-align: bottom;
            margin-right: 5px;
          }
        }
      }
      .right {
        width: 50%;
        text-align: right;
        margin: 16px 24px 0 0;
      }
    }
  }
  .study-list {
    // 水平居中
    padding: 18px;
    margin: 0 auto;
    height: 100%;
  }
  .study-item {
    width: 100%;
    height: 112px;
    border-radius: 8px;
    margin-bottom: 20px;
    border: 1px solid #f1f1f1;
    background-color: #fff;
    .item-title {
      display: flex;
      justify-content: space-between;
      padding: 10px 20px;
      .title {
        width: 225px;
        display: -webkit-box;
        overflow: hidden;
        text-overflow: ellipsis;
        -webkit-line-clamp: 1;
        -webkit-box-orient: vertical;
      }
      .btn {
        width: 58px;
        height: 24px;
        border-radius: 4px 4px 4px 4px;
        border: 1px solid #3e87f8;
        text-align: center;
        line-height: 24px;
        font-size: 13px;
        color: #3e87f8;
      }
    }
    .study-item-content {
      width: 316px;
      height: 54px;
      background: #f7f8fa;
      border-radius: 4px 4px 4px 4px;
      padding: 8px;
      .text-perf {
        // 超出2行显示省略号
        display: -webkit-box;
        overflow: hidden;
        text-overflow: ellipsis;
        -webkit-line-clamp: 1;
        -webkit-box-orient: vertical;
        font-size: 11px;
        color: #666666;
      }
    }
  }
  .dialog-title {
    background-image: url('/@/assets/app/dialog-title@2x.png');
    background-size: 100% 100%;
    height: 80px;
    line-height: 80px;
    width: 100%;
    padding-left: 16px;
    border-bottom: 1px solid #f1f1f1;
    font-weight: 500;
    font-size: 18px;
    color: rgba(0, 0, 0, 0.87);
  }
  :deep(.van-dialog) {
    border-radius: 4px;
    width: 311px;
  }
  .gif-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .loading-gif {
    // 水平居中
    margin: 0 16px;
    width: 343px;
    height: 525px;
    background: #ffffff;
    border-radius: 8px 8px 8px 8px;
    padding-top: 100px;
    display: flex;
    flex-direction: column;
    align-items: center;
    img {
      width: 84px;
      height: 84px;
    }
    div {
      margin-top: 5px;
      font-size: 14px;
      color: rgba(0, 0, 0, 0.38);
    }
  }
</style>
