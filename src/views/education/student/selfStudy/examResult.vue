<template>
  <div class="exam">
    <div class="hd">
      <div class="left">
        <a-button @click="back" type="link">退出</a-button>
        <div class="line"></div>
        <span class="examName">{{ paperes.paperName }}</span>
      </div>
    </div>
    <div class="main">
      <!-- 左侧答题卡 -->
      <div class="left">
        <div class="title">答题卡</div>
        <div class="list">
          <a v-for="(item, idx) in questionList" :key="item.id || idx" :href="'#r_' + (item.id || idx)">
            <div
              class="item"
              :class="{
                correct: item.correctFlag,
                wrong: !item.correctFlag,
              }"
            >
              <span class="num">{{ idx + 1 }}</span>
            </div>
          </a>
        </div>
        <div class="legend-row">
          <span class="legend correct">答对</span>
          <span class="legend wrong">答错</span>
        </div>
        <div class="stat-text">
          共 <b>{{ questionList.length }}</b> 题·答对 <b>{{ correctCount }}</b> 题
        </div>
      </div>

      <!-- 右侧题目列表 -->
      <div class="right">
        <div
          class="question-item"
          v-for="(item, idx) in questionList"
          :key="item.id || idx"
          :id="'r_' + (item.id || idx)"
        >
          <Radio
            v-if="item.questionType == 1"
            :currentIdx="idx"
            v-model:currentQuestion="questionList[idx]"
            :disabled="true"
            :rod="true"
          />
          <Select
            v-if="item.questionType == 2"
            :currentIdx="idx"
            v-model:currentQuestion="questionList[idx]"
            :disabled="true"
            :rod="true"
          />
          <QInput
            v-if="item.questionType == 3"
            :currentIdx="idx"
            v-model:currentQuestion="questionList[idx]"
            :disabled="true"
            :rod="true"
          />
          <Judge
            v-if="item.questionType == 4"
            :currentIdx="idx"
            v-model:currentQuestion="questionList[idx]"
            :disabled="true"
            :rod="true"
          />
          <Ask
            v-if="item.questionType == 5"
            :currentIdx="idx"
            v-model:currentQuestion="questionList[idx]"
            :disabled="true"
            :rod="true"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script name="SelfStudyExamResult" lang="ts" setup>
  import { computed, ref } from 'vue';
  import { useRouter, useRoute } from 'vue-router';
  import Radio from './components/question/radio.vue';
  import Select from './components/question/select.vue';
  import QInput from './components/question/input.vue';
  import Judge from './components/question/judge.vue';
  import Ask from './components/question/ask.vue';
  import { getExamReult } from './url/index';

  const router = useRouter();
  const route = useRoute();

  const paperes = ref<any>({});
  const questionList = ref<any[]>([]);

  const correctCount = computed(() => questionList.value.filter(q => q.correctFlag).length);

  pageInit();
  async function pageInit() {
    if (route.query.id) {
      paperes.value = await getExamReult({ id: route.query.id });
    } else {
      paperes.value = JSON.parse(sessionStorage.getItem('examResult') as string) || {};
    }
    const list = paperes.value.questionList || [];
    questionList.value = list.map((item: any) => {
      // 单选/判断：userAnswer 是数组则取第一个
      if (['1', '4'].includes(String(item.questionType))) {
        if (Array.isArray(item.userAnswer)) item.userAnswer = item.userAnswer[0] ?? '';
      }
      // 填空/问答：把 userAnswer 数组映射回 userQuestionInfoList
      if (['3', '5'].includes(String(item.questionType))) {
        item.userQuestionInfoList?.forEach((subItem: any, idx: number) => {
          subItem.userAnswer = Array.isArray(item.userAnswer)
            ? (item.userAnswer[idx] || '')
            : (item.userAnswer || '');
        });
      }
      return { ...item };
    });
  }

  const back = () => {
    router.back();
  };
</script>

<style lang="less" scoped>
  .exam {
    width: 100%;
    height: 100%;
    font-size: 18px;
    display: flex;
    flex-direction: column;

    .hd {
      height: 55px;
      display: flex;
      justify-content: space-between;
      padding: 0 16px;
      align-items: center;
      flex-shrink: 0;
      border-bottom: 1px solid #f0f0f0;
      background: #fff;

      .left {
        display: flex;
        align-items: center;
        button {
          font-size: 18px;
          padding: 0;
          padding-right: 16px;
        }
      }
      .line {
        width: 1px;
        height: 20px;
        background: #cccccc;
        margin-right: 16px;
      }
    }

    .main {
      flex: 1;
      overflow: hidden;
      display: flex;

      .left {
        width: 210px;
        flex-shrink: 0;
        overflow-y: auto;
        padding: 16px 12px 16px 16px;
        border-right: 1px solid #f0f0f0;
        background: #fff;

        .title {
          font-size: 15px;
          font-weight: 600;
          margin-bottom: 12px;
        }

        .list {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 14px;

          a { text-decoration: none; }

          .item {
            width: 38px;
            height: 38px;
            border: 1px solid #d9d9d9;
            border-radius: 6px;
            background: #fff;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;

            .num { color: #333; font-size: 14px; }

            &.correct {
              background-color: #f6ffed;
              border-color: #b7eb8f;
              .num { color: #52c41a; }
            }
            &.wrong {
              background-color: #fff2f0;
              border-color: #ffccc7;
              .num { color: #ff4d4f; }
            }
          }
        }

        .legend-row {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 10px;

          .legend {
            display: flex;
            align-items: center;
            gap: 4px;
            font-size: 12px;
            color: #666;

            &::before {
              content: '';
              display: inline-block;
              width: 12px;
              height: 12px;
              border-radius: 2px;
              border: 1px solid #d9d9d9;
            }
            &.correct::before { background: #f6ffed; border-color: #b7eb8f; }
            &.wrong::before   { background: #fff2f0; border-color: #ffccc7; }
          }
        }

        .stat-text {
          font-size: 13px;
          color: #333;
          line-height: 1.6;
          b { color: #1890ff; }
        }
      }

      .right {
        flex: 1;
        overflow-y: auto;
        padding: 16px;
        background-color: #f5f5f5;

        .question-item {
          background: #fff;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 16px;
        }
      }
    }
  }
</style>

<style lang="less">
  .question-option {
    line-height: 38px;
  }
</style>
