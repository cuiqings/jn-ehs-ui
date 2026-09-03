<template>
  <div class="ranking-panel">
    <!-- Section 1: 得分排名 -->
    <div class="ranking-section">
      <!-- 顶部标题栏 -->
      <div class="panel-top-header">
        <div class="left-title">
          <span class="indicator"></span>
          <span class="text">得分排名</span>
        </div>
        <div class="right-controls">
          <a-date-picker v-model:value="currentDate" picker="month" format="YYYY年 M月" :allowClear="false" @change="handleDateChange" />
        </div>
      </div>

      <!-- 内容区域 -->
      <div class="ranking-content">
        <!-- 左侧：各事业部部长得分排名 -->
        <div class="sub-panel">
          <div class="sub-header">
            <div class="left-part">
              <span class="indicator"></span>
              <span class="text">各事业部部长得分排名</span>
            </div>
          </div>
          <div class="table-container">
            <a-spin :spinning="loadingMinister">
              <table class="custom-table">
                <thead>
                  <tr>
                    <th width="10%">排名</th>
                    <th width="35%">单位</th>
                    <th width="20%">姓名</th>
                    <th width="15%">分数</th>
                    <th width="20%">考评结果</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, index) in ministerRankings" :key="index" :class="getRowClass(index, ministerRankings.length)">
                    <td>
                      <div class="rank-badge" :class="getRankClass(index + 1, ministerRankings.length)">{{ index + 1 }}</div>
                    </td>
                    <td>{{ item.orgName }}</td>
                    <td>{{ item.userName }}</td>
                    <td class="score-text" :class="getTextClass(index, ministerRankings.length)">{{ item.score || '-' }}</td>
                    <td :class="getTextClass(index, ministerRankings.length)">{{ item.result || '-' }}</td>
                  </tr>
                </tbody>
              </table>
            </a-spin>
          </div>
        </div>

        <!-- 右侧：各事业部安全副部长得分排名 -->
        <div class="sub-panel">
          <div class="sub-header">
            <div class="left-part">
              <span class="indicator"></span>
              <span class="text">各事业部安全副部长得分排名</span>
            </div>
          </div>
          <div class="table-container">
            <a-spin :spinning="loadingSafetyDeputy">
              <table class="custom-table">
                <thead>
                  <tr>
                    <th width="10%">排名</th>
                    <th width="35%">单位</th>
                    <th width="20%">姓名</th>
                    <th width="15%">分数</th>
                    <th width="20%">考评结果</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, index) in safetyDeputyRankings" :key="index" :class="getRowClass(index, safetyDeputyRankings.length)">
                    <td>
                      <div class="rank-badge" :class="getRankClass(index + 1, safetyDeputyRankings.length)">{{ index + 1 }}</div>
                    </td>
                    <td>{{ item.orgName }}</td>
                    <td>{{ item.userName }}</td>
                    <td class="score-text" :class="getTextClass(index, safetyDeputyRankings.length)">{{ item.score || '-' }}</td>
                    <td :class="getTextClass(index, safetyDeputyRankings.length)">{{ item.result || '-' }}</td>
                  </tr>
                </tbody>
              </table>
            </a-spin>
          </div>
        </div>
      </div>
    </div>

    <!-- Section 2: 各单位考评完成率 -->
    <div class="ranking-section">
      <!-- 顶部标题栏 -->
      <div class="panel-top-header" style="margin-top: 20px">
        <div class="left-title">
          <span class="indicator"></span>
          <span class="text">各单位考评完成率</span>
        </div>
      </div>

      <!-- 内容区域 -->
      <div class="ranking-content">
        <!-- 左侧：科段级及以上考评完成率 -->
        <div class="sub-panel">
          <div class="sub-header">
            <div class="left-part">
              <span class="indicator"></span>
              <span class="text">科段级及以上考评完成率</span>
            </div>
            <div class="right-controls">
              <a-date-picker v-model:value="completionMonth" picker="month" format="YYYY年 M月" :allowClear="false" @change="handleDateChange3" />
            </div>
          </div>
          <div class="table-container">
            <a-spin :spinning="loadingCompletionHigh">
              <table class="custom-table">
                <thead>
                  <tr>
                    <th width="15%">排名</th>
                    <th width="45%">单位</th>
                    <th width="40%">考评完成率</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, index) in completionHighRankings" :key="index" :class="getRowClass(index, completionHighRankings.length)">
                    <td>
                      <div class="rank-badge" :class="getRankClass(index + 1, completionHighRankings.length)">{{ index + 1 }}</div>
                    </td>
                    <td>{{ item.orgName }}</td>
                    <td class="score-text" :class="getTextClass(index, completionHighRankings.length)">{{ item.completeRate? item.completeRate +'%' : '-' }}</td>
                  </tr>
                </tbody>
              </table>
            </a-spin>
          </div>
        </div>

        <!-- 右侧：科段级以下考评完成率 -->
        <div class="sub-panel">
          <div class="sub-header">
            <div class="left-part">
              <span class="indicator"></span>
              <span class="text">科段级以下考评完成率</span>
            </div>
            <div class="right-controls">
              <a-date-picker
                style="width: 90px; margin-right: 5px"
                v-model:value="completionQuarter"
                picker="year"
                format="YYYY"
                :allowClear="false" 
                @change="handleDateChange4"
              />
              <a-select style="width: 120px" v-model:value="quarter" @change="handleDateChange4">
                <a-select-option value="第一季度">第一季度</a-select-option>
                <a-select-option value="第二季度">第二季度</a-select-option>
                <a-select-option value="第三季度">第三季度</a-select-option>
                <a-select-option value="第四季度">第四季度</a-select-option>
              </a-select>
            </div>
          </div>
          <div class="table-container">
            <a-spin :spinning="loadingCompletionLow">
              <table class="custom-table">
                <thead>
                  <tr>
                    <th width="15%">排名</th>
                    <th width="45%">单位</th>
                    <th width="40%">考评完成率</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, index) in completionLowRankings" :key="index" :class="getRowClass(index, completionLowRankings.length)">
                    <td>
                      <div class="rank-badge" :class="getRankClass(index + 1, completionLowRankings.length)">{{ index + 1 }}</div>
                    </td>
                    <td>{{ item.orgName }}</td>
                    <td class="score-text" :class="getTextClass(index, completionLowRankings.length)">{{ item.completeRate? item.completeRate +'%' : '-' }}</td>
                  </tr>
                </tbody>
              </table>
            </a-spin>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { ref, onMounted } from 'vue';
  import dayjs, { Dayjs } from 'dayjs';
  import { getSafetyDutyStatistics } from '/@/views/dashboard/home/api';

  // 状态变量
  const currentDate = ref<Dayjs>(dayjs());
  const completionMonth = ref<Dayjs>(dayjs());
  const completionQuarter = ref<Dayjs>(dayjs());
  const quarter = ref('第一季度');

  const ministerRankings = ref([]);
  const safetyDeputyRankings = ref([]);
  const completionHighRankings = ref([]);
  const completionLowRankings = ref([]);

  const loadingMinister = ref(false);
  const loadingSafetyDeputy = ref(false);
  const loadingCompletionHigh = ref(false);
  const loadingCompletionLow = ref(false);

  /**
   * 模拟获取数据
   * @param date 日期
   */
  const fetchRankings = async (date: string, type: string) => {
    // 调用接口获取数据
    return await getSafetyDutyStatistics({ queryDate: date, type });
  };

  /**
   * 获取排名样式类名
   * @param rank 排名
   * @param total 总数
   */
  const getRankClass = (rank: number, total: number) => {
    if (rank <= 3) return 'rank-top';
    if (rank > total - 3) return 'rank-bottom';
    return 'rank-middle';
  };

  /**
   * 获取行样式类名
   * @param index 索引
   * @param total 总数
   */
  const getRowClass = (index: number, total: number) => {
    const rank = index + 1;
    if (rank <= 3) return 'row-top';
    if (rank > total - 3) return 'row-bottom';
    return '';
  };

  /**
   * 获取文字颜色样式类名
   * @param index 索引
   * @param total 总数
   */
  const getTextClass = (index: number, total: number) => {
    const rank = index + 1;
    if (rank <= 3) return 'text-top';
    if (rank > total - 3) return 'text-bottom';
    return 'text-middle';
  };

  /**
   * 处理日期变化
   */
  const handleDateChange = () => {
    loadingMinister.value = true;
    fetchRankings(currentDate.value.format('YYYY年MM月'), '1')
      .then((res) => (ministerRankings.value = res || []))
      .finally(() => (loadingMinister.value = false));

    loadingSafetyDeputy.value = true;
    fetchRankings(currentDate.value.format('YYYY年MM月'), '2')
      .then((res) => (safetyDeputyRankings.value = res || []))
      .finally(() => (loadingSafetyDeputy.value = false));
  };

  /**
   * 处理日期变化3
   */
  const handleDateChange3 = () => {
    loadingCompletionHigh.value = true;
    fetchRankings(completionMonth.value.format('YYYY年MM月'), '3')
      .then((res) => (completionHighRankings.value = res || []))
      .finally(() => (loadingCompletionHigh.value = false));
  };
  /**
   * 处理日期变化4
   */
  const handleDateChange4 = () => {
    loadingCompletionLow.value = true;
    fetchRankings(completionQuarter.value.format('YYYY') + '-' + quarter.value, '4')
      .then((res) => (completionLowRankings.value = res || []))
      .finally(() => (loadingCompletionLow.value = false));
  };

  // 初始化
  onMounted(() => {
    handleDateChange();
    handleDateChange3();
    handleDateChange4();
  });

  // 暴露方法供外部调用（如果有需要）
  const init = (dateRange: [Dayjs, Dayjs]) => {
    console.log('RankingPanel init', dateRange);
  };

  const resize = () => {
    console.log('RankingPanel resize');
  };

  defineExpose({
    init,
    resize,
  });
</script>

<style scoped lang="less">
  .ranking-panel {
    width: 100%;
    height: 100%;
    background-color: #fff;
    padding: 20px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    gap: 30px;
    overflow-y: auto; // 允许垂直滚动
  }

  .ranking-section {
    display: flex;
    flex-direction: column;
    gap: 15px;
    flex-shrink: 0; // 防止压缩
    min-height: 500px; // 保证每个区域有足够高度
  }

  .panel-top-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 10px;
    border-bottom: 1px solid #e8e8e8;

    .left-title {
      display: flex;
      align-items: center;

      .indicator {
        width: 4px;
        height: 18px;
        background-color: #1890ff;
        margin-right: 8px;
        border-radius: 2px;
      }

      .text {
        font-size: 18px;
        font-weight: 600;
        color: #333;
      }
    }
  }

  .ranking-content {
    display: flex;
    gap: 20px;
    flex: 1;
    overflow: hidden; // 防止内容溢出

    .sub-panel {
      flex: 1;
      display: flex;
      flex-direction: column;
      background-color: #fff;
      border-radius: 4px;
      overflow: hidden;

      .sub-header {
        display: flex;
        align-items: center;
        justify-content: space-between; // 两端对齐
        margin-bottom: 15px;
        height: 32px; // 固定高度，与DatePicker对齐

        .left-part {
          display: flex;
          align-items: center;

          .indicator {
            width: 4px;
            height: 16px;
            background-color: #1890ff;
            margin-right: 8px;
          }

          .text {
            font-size: 16px;
            font-weight: 600;
            color: #333;
          }
        }
      }

      .table-container {
        flex: 1;
        overflow-y: auto;
        padding: 1px; // 防止边框被遮挡
      }
    }
  }

  .custom-table {
    width: 100%;
    border-collapse: collapse;

    th,
    td {
      border: 1px solid #e8e8e8; // 增加表格边框
    }

    thead {
      tr {
        background: linear-gradient(90deg, #5b73e8 0%, #7d5be8 100%); // 蓝紫渐变
        color: #fff;
        height: 45px;

        th {
          text-align: center;
          font-weight: 500;
          font-size: 14px;
          // 移除圆角，因为有边框
        }
      }
    }

    tbody {
      tr {
        height: 45px;
        transition: background-color 0.3s;

        &.row-top {
          background-color: #fffbe6; // 淡黄色背景
        }

        &.row-bottom {
          background-color: #fff1f0; // 淡红色背景
        }

        td {
          text-align: center;
          font-size: 14px;
          color: #333;
        }

        &:hover {
          background-color: #f0f7ff;
        }
      }
    }
  }

  // 排名徽章样式
  .rank-badge {
    width: 24px;
    height: 24px;
    line-height: 24px;
    text-align: center;
    border-radius: 50%;
    color: #fff;
    font-weight: bold;
    font-size: 12px;
    margin: 0 auto;

    &.rank-top {
      background-color: #ffc107; // 金色
      box-shadow: 0 2px 4px rgba(255, 193, 7, 0.4);
    }

    &.rank-middle {
      background-color: #1890ff; // 蓝色
    }

    &.rank-bottom {
      background-color: #ff4d4f; // 红色
    }
  }

  // 分数样式
  .score-text {
    font-weight: 600;
    color: inherit; // 默认继承
  }

  // 文字颜色样式
  .text-top {
    color: #ffc107 !important; // 黄色
    font-weight: 600;
  }
  .text-middle {
    color: #1890ff !important; // 蓝色
    font-weight: 600;
  }
  .text-bottom {
    color: #ff4d4f !important; // 红色
    font-weight: 600;
  }
</style>
