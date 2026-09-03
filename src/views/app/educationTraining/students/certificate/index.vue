<template>
  <div class="certificate-container">
    <!-- Tab标签页 -->
    <van-tabs v-model:active="activeTab" @change="onTabChange" sticky>
      <van-tab title="正常" name="1">
        <van-pull-refresh v-model="refreshing" ref="pullRefresh" @refresh="onRefresh">
          <van-list v-model:loading="loading" :finished="finished" finished-text="没有更多了" @load="onLoad">
            <!-- 卡片区域 -->
            <div style="clear: both" v-if="listData.length > 0">
              <div class="study-list">
                <div class="study-item" v-for="item in listData" :key="item.id" @click="openDialog(item)">
                  <img :src="cert1" alt="" />
                  <div class="study-item-content">
                    <div style="font-size: 14px; color: #000; margin-bottom: 4px">{{ item.render.name }}</div>
                    <div v-if="item.certData" style="font-size: 12px; color: #666">证书有效期：{{ item.certData.split('~')[1] }}</div>
                  </div>
                  <div class="study-item-status">
                    <van-tag color="#07c160" plain>正常</van-tag>
                  </div>
                </div>
              </div>
            </div>
            <van-empty v-else description="暂无数据" />
          </van-list>
        </van-pull-refresh>
      </van-tab>
      
      <van-tab title="已过期" name="2">
        <van-pull-refresh v-model="refreshing" ref="pullRefresh" @refresh="onRefresh">
          <van-list v-model:loading="loading" :finished="finished" finished-text="没有更多了" @load="onLoad">
            <!-- 卡片区域 -->
            <div style="clear: both" v-if="listData.length > 0">
              <div class="study-list">
                <div class="study-item" v-for="item in listData" :key="item.id" @click="openDialog(item)">
                  <img :src="cert1" alt="" />
                  <div class="study-item-content">
                    <div style="font-size: 14px; color: #000; margin-bottom: 4px">{{ item.render.name }}</div>
                    <div v-if="item.certData" style="font-size: 12px; color: #666">证书有效期：{{ item.certData.split('~')[1] }}</div>
                    <div v-if="item.certData">
                      <div style="color: #ff8917">过期时间：{{ item.certData.split('~')[1] }}</div>
                    </div>
                  </div>
                  <div class="study-item-status">
                    <van-tag color="#ff8917" plain>已过期</van-tag>
                  </div>
                </div>
              </div>
            </div>
            <van-empty v-else description="暂无数据" />
          </van-list>
        </van-pull-refresh>
      </van-tab>
      
      <van-tab title="已撤销" name="3">
        <van-pull-refresh v-model="refreshing" ref="pullRefresh" @refresh="onRefresh">
          <van-list v-model:loading="loading" :finished="finished" finished-text="没有更多了" @load="onLoad">
            <!-- 卡片区域 -->
            <div style="clear: both" v-if="listData.length > 0">
              <div class="study-list">
                <div class="study-item" v-for="item in listData" :key="item.id" @click="openDialog(item)">
                  <img :src="cert1" alt="" />
                  <div class="study-item-content">
                    <div style="font-size: 14px; color: #000; margin-bottom: 4px">{{ item.render.name }}</div>
                    <div v-if="item.certData" style="font-size: 12px; color: #666">证书有效期：{{ item.certData.split('~')[1] }}</div>
                    <div>
                      <div style="color: #ad0000">撤销原因：{{ item.reason }}</div>
                      <div style="color: #ad0000">撤销时间：{{ item.revocationTime }}</div>
                    </div>
                  </div>
                  <div class="study-item-status">
                    <van-tag color="#ad0000" plain>已撤销</van-tag>
                  </div>
                </div>
              </div>
            </div>
            <van-empty v-else description="暂无数据" />
          </van-list>
        </van-pull-refresh>
      </van-tab>
    </van-tabs>
  </div>
  <CertDetailDialog ref="certDetailDialogRef" />
</template>
<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import cert1 from '/@/assets/images/certificate/cert1.png';
  import { getFileAccessHttpUrl } from '/@/utils/common/compUtils';
  import { getCertList } from '../../index.api';
  import CertDetailDialog from './CertDetailDialog.vue';
  
  // 响应式数据定义
  const loading = ref(false);
  const finished = ref(false);
  const refreshing = ref(false);
  const pageNo = ref(0);
  const pageSize = ref(10);
  const pullRefresh = ref();
  const total = ref(0);
  const listData: any = ref([]);
  const certDetailDialogRef = ref();
  const activeTab = ref('1'); // 当前激活的tab，默认为正常状态
  /**
   * 下拉刷新处理函数
   */
  function onRefresh() {
    console.log('onRefresh');
    pageNo.value = 0;
    onLoad();
  }
  
  /**
   * 上拉加载更多数据
   */
  async function onLoad() {
    if (pageNo.value == 0) {
      listData.value = [];
    }
    loading.value = true;
    pageNo.value += 1;
    let params = {
      pageNo: pageNo.value,
      pageSize: pageSize.value,
      status: activeTab.value, // 根据当前tab传递status参数
    };

    await getCertList(params).then((res) => {
      total.value = res.total;
      loadEnd();
      if (res.records.length > 0) {
        res.records.map((data) => {
          data.render = JSON.parse(data.render);
          data.render.imgUrl = data.render.imgUrl && data.render.imgUrl !== '' ? getFileAccessHttpUrl(data.render.imgUrl) : cert1;
        });
        listData.value = listData.value.concat(res.records);
      }
      loading.value = false;
      refreshing.value = false;
      console.log('listData', listData.value);
    });
  }

  /**
   * 加载状态结束处理
   */
  function loadEnd() {
    loading.value = false;
    if (listData.value.length >= total.value) {
      finished.value = true;
    }
  }
  
  /**
   * Tab切换处理函数
   * @param name - tab名称
   */
  function onTabChange(name: string) {
    activeTab.value = name;
    // 重置分页数据
    pageNo.value = 0;
    finished.value = false;
    listData.value = [];
    // 加载新数据
    onLoad();
  }
  
  /**
   * 打开证书详情弹窗
   * @param item - 证书项目数据
   */
  function openDialog(item) {
    if (item.status == 1 && item.render) {
      certDetailDialogRef.value.init(item, true);
    }
  }
  
  /**
   * 组件挂载时初始化数据
   */
  onMounted(() => {
    onLoad();
  });
</script>

<style lang="less" scoped>
  .certificate-container {
    height: 100vh;
    background-color: #f5f5f5;
  }
  
  .study-list {
    // display: flex;
    //   justify-content: space-between;
    padding: 16px;
    margin: 0 auto;
    height: 100%;
    .study-item {
      position: relative;
      font-size: 12px;
      display: flex;
      border: 1px solid #e1e1e1;
      border-radius: 4px;
      padding: 8px;
      margin-bottom: 10px;
      cursor: pointer;
      img {
        width: 70px;
        height: 90px;
      }
      .study-item-content {
        margin-left: 10px;
      }
      .study-item-status {
        position: absolute;
        top: 5px;
        right: 5px;
      }
    }
  }
  :deep(.ant-card-meta-detail) {
    overflow: hidden;
    text-align: left;
  }
  :deep(.ant-card-meta-title) {
    overflow: visible;
    color: rgba(0, 0, 0, 0.85);
    font-weight: 500;
    font-size: 14px;
    white-space: normal;
    text-overflow: initial;
  }
  :deep(.ant-card-body) {
    padding: 0px;
  }
  .page-wrap {
    float: right;
    margin-top: 50px;
  }
</style>
