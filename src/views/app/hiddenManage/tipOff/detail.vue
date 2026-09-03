<template>
  <div class="tip-off-detail">
    <van-cell-group title="举报详情">
      <!-- 隐患照片 -->
      <van-cell title="隐患照片">
        <template #label>
          <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px">
            <van-image v-for="(url, index) in imageUrls" :key="index" width="80" height="80" fit="cover" :src="url" @click="previewImage(index)" />
            <span v-if="!imageUrls.length" style="color: #969799">无照片</span>
          </div>
        </template>
      </van-cell>

      <!-- 举报层级 -->
      <van-cell title="举报层级" :value="getLevelName(detail.reportLevel)" />

      <!-- 归属单位 -->
      <van-cell title="归属单位" :value="detail.orgName" />

      <!-- 隐患描述 -->
      <van-cell title="隐患描述" :label="detail.yhDescription" />

      <!-- 隐患地点 -->
      <van-cell title="隐患地点" :label="detail.yhPlace" />

      <!-- 发现时间 -->
      <van-cell title="发现时间" :value="detail.findTime" />

      <!-- 举报人 -->
      <van-cell title="举报人" :value="detail.reporterName" />

      <!-- 举报人电话 -->
      <van-cell title="举报人电话" :value="detail.reporterPhone" />
    </van-cell-group>

    <van-cell-group title="答复（处理）信息" v-if="detail.replyResult" style="margin-top: 10px">
      <!-- 确认是否隐患 -->
      <van-cell title="确认是否隐患" :value="detail.replyResult === '1' ? '是，确认为隐患' : '否，不是隐患'" />
      
      <!-- 隐患等级 -->
      <van-cell v-if="detail.replyYhLevel" title="隐患等级" :value="detail.replyYhLevel === '1' ? '一般隐患' : '重大隐患'" />
      
      <!-- 整改责任人 -->
      <van-cell v-if="detail.replyRepairPersonName" title="班组长（整改责任人）" :value="detail.replyRepairPersonName" />
        <!-- 答复理由 -->
      <van-cell v-if="detail.replyReason" title="答复理由" :label="detail.replyReason" />
      
    </van-cell-group>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import { useRoute } from 'vue-router';
  import { showImagePreview, showToast } from 'vant';
  import { getFileAccessHttpUrl } from '/@/utils/common/compUtils';
  import { tipOffDetail } from '../index.api';

  const route = useRoute();
  const detail = ref<any>({});
  const imageUrls = ref<string[]>([]);

  // 举报层级映射
  const levelMap: Record<string, string> = {
    '1': '安全部',
    '2': '厂部',
  };

  /**
   * 获取举报层级名称
   * @param val 层级值
   */
  const getLevelName = (val: string) => {
    return levelMap[val] || val;
  };

  /**
   * 初始化数据
   */
  const initData = async () => {
    const id = route.query.id as string;
    let res: any = null;

    if (id) {
      try {
        res = await tipOffDetail({ id });
      } catch (error) {
        console.error('获取详情失败', error);
      }
    }

    if (res) {
      detail.value = res;
      // 处理图片
      if (res.yhPicture && typeof res.yhPicture === 'string') {
        const paths = res.yhPicture.split(',');
        imageUrls.value = paths.map((path: string) => getFileAccessHttpUrl(path));
      }
    } else {
      // 如果既没有 id 也没有 params，或者请求失败
      if (!id) {
        // 可以选择提示用户，或者什么都不做
        // showToast('参数错误');
      }
    }
  };

  /**
   * 预览图片
   * @param startPosition 起始位置
   */
  const previewImage = (startPosition: number) => {
    showImagePreview({
      images: imageUrls.value,
      startPosition,
    });
  };

  onMounted(() => {
    initData();
  });
</script>

<style scoped>
  .tip-off-detail {
    background-color: #f7f8fa;
    min-height: 100vh;
    padding-top: 10px;
  }
</style>
