<template>
  <div class="exam">
    <div class="hd">
      <div class="left">
        <a-button @click="back" type="link">退出</a-button>
        <div class="line"></div>
        <span class="examName">{{ paperes.paperName }}</span>
      </div>
      <div class="right">
        <a-button :loading="submiting" type="primary" @click="submitExam">交卷</a-button>
      </div>
    </div>

    <div class="main">
      <!-- 左侧答题卡 -->
      <div class="left">
        <div class="title">答题卡</div>
        <div class="list">
          <div
            v-for="(item, idx) in questionList"
            :key="questionKey(item, idx)"
            class="item"
            :class="{
              correct: item.answered && isCorrect(item.correctFlag),
              wrong: item.answered && !isCorrect(item.correctFlag),
            }"
            @click="goQuestion(item, idx)"
          >
            <span class="num">{{ idx + 1 }}</span>
          </div>
        </div>
        <div class="legend-row">
          <span class="legend correct">答对</span>
          <span class="legend wrong">答错</span>
          <span class="legend unanswered">未作答</span>
        </div>
        <div class="stat-text">
          已作答 <b>{{ questionList.length - unansweredCount }}/{{ questionList.length }}</b> 题·答对 <b>{{ correctCount }}</b> 题
        </div>
      </div>

      <!-- 右侧题目列表（全部一页滚动） -->
      <div class="right" ref="questionWrapRef">
        <div
          class="question-item"
          v-for="(item, idx) in questionList"
          :key="questionKey(item, idx)"
          :id="'q_' + questionKey(item, idx)"
        >
          <!-- 单选题 -->
          <Radio
            v-if="item.questionType == 1"
            :currentIdx="idx"
            v-model:currentQuestion="questionList[idx]"
            :disabled="item.answered"
            :rod="item.answered"
            @answer="handleAutoSubmit(idx)"
          />
          <!-- 多选题 -->
          <Select
            v-if="item.questionType == 2"
            :currentIdx="idx"
            v-model:currentQuestion="questionList[idx]"
            :disabled="item.answered"
            :rod="item.answered"
          />
          <!-- 填空题 -->
          <QInput
            v-if="item.questionType == 3"
            :currentIdx="idx"
            v-model:currentQuestion="questionList[idx]"
            :disabled="item.answered"
            :rod="item.answered"
          />
          <!-- 判断题 -->
          <Judge
            v-if="item.questionType == 4"
            :currentIdx="idx"
            v-model:currentQuestion="questionList[idx]"
            :disabled="item.answered"
            :rod="item.answered"
            @answer="handleAutoSubmit(idx)"
          />
          <!-- 问答题 -->
          <Ask
            v-if="item.questionType == 5"
            :currentIdx="idx"
            v-model:currentQuestion="questionList[idx]"
            :disabled="item.answered"
            :rod="item.answered"
          />

          <!-- 多选/填空/问答：确认作答按钮 -->
          <div
            class="confirm-btn-row"
            v-if="[2, 3, 5].includes(Number(item.questionType)) && !item.answered"
          >
            <a-button
              type="primary"
              :loading="judgingIdx === idx"
              @click="handleManualSubmit(idx)"
            >确认作答</a-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script name="SelfStudyExam" lang="ts" setup>
  import { computed, ref } from 'vue';
  import { useRouter } from 'vue-router';
  import Radio from './components/question/radio.vue';
  import Select from './components/question/select.vue';
  import QInput from './components/question/input.vue';
  import Judge from './components/question/judge.vue';
  import Ask from './components/question/ask.vue';
  import { submitExamApi, onceAnswerApi } from './url/index';
  import { Modal } from 'ant-design-vue';
  import { useEduStore } from '/@/store/modules/education';

  const eduStore = useEduStore();
  const router = useRouter();

  const paperes = ref<any>({});
  const questionList = ref<any[]>([]);
  const judgingIdx = ref<number>(-1); // 当前正在判卷的题下标
  const submiting = ref(false);

  const questionWrapRef = ref<HTMLElement | null>(null);

  const isCorrect = (flag: any) => flag === true || flag === 1 || flag === '1';
  const questionKey = (item: any, idx: number) => item?.id ?? item?.questionId ?? idx;
  const correctCount = computed(() => questionList.value.filter(q => q.answered && isCorrect(q.correctFlag)).length);
  const unansweredCount = computed(() => questionList.value.filter(q => !q.answered).length);

  const goQuestion = (item: any, idx: number) => {
    const el = document.getElementById('q_' + questionKey(item, idx));
    const wrap = questionWrapRef.value;
    if (!el || !wrap) return;
    const top = el.getBoundingClientRect().top - wrap.getBoundingClientRect().top + wrap.scrollTop;
    wrap.scrollTo({ top, behavior: 'smooth' });
  };

  pageInit();
  function pageInit() {
    try {
      paperes.value = JSON.parse(sessionStorage.getItem('examPaper') || 'null') || {};
    } catch {
      paperes.value = {};
    }
    const list = paperes.value.questionList || [];
    questionList.value = list.map((item: any) => {
      const questionType = Number(item.questionType);
      let userAnswer: any = questionType === 2 ? [] : '';
      if (questionType === 2 && Array.isArray(item.userAnswer)) userAnswer = item.userAnswer;
      else if (questionType !== 2 && Array.isArray(item.userAnswer)) userAnswer = item.userAnswer[0] ?? '';
      else if (item.userAnswer && questionType !== 2) userAnswer = item.userAnswer;
      return {
        ...item,
        userQuestionInfoList: item.userQuestionInfoList || item.questionList || [],
        answered: false,
        userAnswer,
      };
    });
  }

  function normalizeUserAnswer(questionType: number, userAnswer: any, fallback: any) {
    const val = userAnswer ?? fallback;
    if (questionType === 2) {
      if (Array.isArray(val)) return val;
      if (typeof val === 'string' && val) return val.split(',').map((s) => s.trim()).filter(Boolean);
      return [];
    }
    if (Array.isArray(val)) return val[0] ?? '';
    return val ?? '';
  }

  // 单选/判断：选完自动提交
  const handleAutoSubmit = async (idx: number) => {
    await submitOnce(idx);
  };

  // 多选/填空/问答：手动确认后提交
  const handleManualSubmit = async (idx: number) => {
    const q = questionList.value[idx];
    if (q.questionType == 2 && (!q.userAnswer || q.userAnswer.length === 0)) {
      Modal.warning({ title: '请至少选择一个选项' });
      return;
    }
    if (q.questionType == 3) {
      const hasEmpty = q.userQuestionInfoList?.some((item: any) => !item.userAnswer?.trim());
      if (hasEmpty) {
        Modal.warning({ title: '请填写所有空格' });
        return;
      }
    }
    if (q.questionType == 5 && !q.userAnswer?.trim()) {
      Modal.warning({ title: '请输入答案' });
      return;
    }
    await submitOnce(idx);
  };

  // 提交单题到后端，拿回判卷结果更新该题
  const submitOnce = async (idx: number) => {
    const q = questionList.value[idx];
    if (q.answered || judgingIdx.value === idx) return;

    let userAnswer: string[] = [];
    if (q.questionType == 2) {
      userAnswer = Array.isArray(q.userAnswer) ? q.userAnswer : [q.userAnswer];
    } else if (q.questionType == 3) {
      userAnswer = q.userQuestionInfoList.map((item: any) => item.userAnswer || '');
    } else if (q.questionType == 5) {
      userAnswer = [q.userAnswer || ''];
    } else {
      userAnswer = q.userAnswer ? [q.userAnswer] : [];
    }

    judgingIdx.value = idx;
    try {
      const qid = q.id ?? q.questionId;
      const res = await onceAnswerApi({
        questionList: [{ id: qid, userAnswer }],
        practiseId: paperes.value.practiseId,
      });
      const list = res?.questionList || res?.result?.questionList;
      const resultQ =
        list?.find((item: any) => String(item.id ?? item.questionId) === String(qid)) ||
        list?.[0] ||
        (res && res.correctFlag !== undefined && !res.questionList ? res : null);
      if (resultQ) {
        const questionType = Number(q.questionType);
        questionList.value[idx] = {
          ...q,
          ...resultQ,
          id: q.id ?? resultQ.id,
          questionId: q.questionId ?? resultQ.questionId,
          userAnswer: normalizeUserAnswer(questionType, resultQ.userAnswer, q.userAnswer),
          // 填空题保留本地 userQuestionInfoList（含用户输入）用于显示
          userQuestionInfoList: questionType === 3 ? q.userQuestionInfoList : (resultQ.userQuestionInfoList || q.userQuestionInfoList),
          answered: true,
        };
      } else {
        questionList.value[idx] = { ...q, answered: true };
      }
    } finally {
      judgingIdx.value = -1;
    }
  };

  // 提交整卷
  const submitExam = () => {
    Modal.confirm({
      title: '交卷',
      content: '是否确认交卷？',
      okText: '确认交卷',
      cancelText: '继续答题',
      async onOk() {
        submiting.value = true;
        try {
          const result = questionList.value.map((item: any) => {
            let userAnswer: string[] = [];
            if (item.questionType == 2) {
              userAnswer = Array.isArray(item.userAnswer) ? item.userAnswer : [item.userAnswer];
            } else if (item.questionType == 3) {
              userAnswer = item.userQuestionInfoList.map((sub: any) => sub.userAnswer || '');
            } else if (item.questionType == 5) {
              userAnswer = [item.userAnswer || ''];
            } else {
              userAnswer = item.userAnswer ? [item.userAnswer] : [];
            }
            return { id: item.id ?? item.questionId, userAnswer };
          });
          const res = await submitExamApi({
            questionList: result,
            practiseId: paperes.value.practiseId,
          });
          eduStore.setExamConfig({});
          sessionStorage.setItem('examResult', JSON.stringify(res));
          sessionStorage.removeItem('examPaper');
          router.replace({ path: '/selfexamResult', query: { status: '1' } });
        } finally {
          submiting.value = false;
        }
      },
    });
  };

  // 退出：作废
  const back = () => {
    Modal.confirm({
      title: '提示',
      content: '退出后此次刷题作废，确认要退出吗？',
      okText: '确认退出',
      cancelText: '继续答题',
      onOk() {
        sessionStorage.removeItem('examPaper');
        router.replace('/student/selfStudy');
      },
    });
  };
</script>

<style lang="less" scoped>
  .exam {
    width: 100%;
    height: 100vh;
    font-size: 18px;
    display: flex;
    flex-direction: column;
    overflow: hidden;

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
      min-height: 0;
      overflow: hidden;
      display: flex;

      /* 左侧答题卡 */
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
            transition: background 0.2s;

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
          flex-wrap: wrap;

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
            &.correct::before    { background: #f6ffed; border-color: #b7eb8f; }
            &.wrong::before      { background: #fff2f0; border-color: #ffccc7; }
            &.unanswered::before { background: #fff;    border-color: #d9d9d9; }
          }
        }

        .stat-text {
          font-size: 13px;
          color: #333;
          line-height: 1.6;
          b { color: #1890ff; }
        }
      }

      /* 右侧题目区（滚动） */
      .right {
        flex: 1;
        min-width: 0;
        overflow-y: auto;
        padding: 16px;
        background-color: #f5f5f5;

        .question-item {
          background: #fff;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 16px;

          .confirm-btn-row {
            margin-top: 16px;
          }
        }

        :deep(.question-title) {
          font-size: 16px;
          font-weight: 600;
          color: rgba(0, 0, 0, 0.88);
          line-height: 32px;
          margin-bottom: 8px;
        }
        :deep(.question-text) {
          font-size: 16px;
          color: #333;
          line-height: 28px;
          margin-bottom: 12px;
        }
      }
    }
  }
</style>

<style lang="less">
  .question-option {
    line-height: 38px;
  }
  .analysis {
    width: 100%;
    background: #f6f6f6;
    border-radius: 8px;
    padding: 16px;
    margin-top: 16px;

    .answer {
      font-size: 15px;
      font-weight: 500;
      color: #333;
      line-height: 24px;
    }
    .remark-tit {
      font-size: 15px;
      font-weight: 500;
      color: #333;
      line-height: 24px;
      margin-top: 8px;
    }
    .exam-diffiCulty {
      color: #00000073;
      font-size: 13px;
    }
  }
</style>
