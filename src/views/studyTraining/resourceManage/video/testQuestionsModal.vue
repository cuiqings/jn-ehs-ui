<template>
  <basic-modal v-bind="$attrs" @register="registerModal" :width="1200" title="试题" destroyOnClose @cancel="close">
    <div class="content">
      <div class="left">
        <player :url="url" :id="'player' + id" ref="playerRef" @pause="handlePlayerPause" />
      </div>
      <div class="right" ref="rightPanelRef">
        <div v-for="(item, index) in from" :key="index" :class="{ active: activeIndex === index }" class="item" @click="handleActive(index)">
          <div>
            <a-time-picker
              v-model:value="item.videoTime"
              valueFormat="HH:mm:ss"
              style="width: 250px"
              @change="(time, timeString) => handleTimePickerChange(timeString)"
            />
            <a-button type="primary" @click.stop="handleAdd(index)" style="margin-left: 15px; width: 35px; padding: 0"> + </a-button>
            <a-button v-if="index !== 0" type="primary" @click.stop="handleRemove(index)" style="margin-left: 15px; width: 35px; padding: 0">
              <DeleteOutlined />
            </a-button>
          </div>
          <a-button type="primary" @click.stop="handleQuestion(index)" style="margin-top: 15px"> 试题 </a-button>
          <div class="question-name">
            <div v-if="item.questionName">
              <div>试题名称：{{ item.questionName }}</div>
              <span class="question-name-span">{{ item.questionList.length }}个选项，</span>
              <span class="question-name-span">正确答案：选项{{ item.answer }}</span>
            </div>
            <!-- <DeleteOutlined v-if="item.questionName" style="margin-left: 10px; color: red" @click.stop="handleRemoveName(index)" /> -->
          </div>
        </div>
      </div>
    </div>
    <template #footer>
      <div>
        <a-button type="primary" @click="handleOk"> 确定 </a-button>
        <a-button @click="close">取消</a-button>
      </div>
    </template>
    <detailModal @register="registerDetailModal" @success="handleSuccess" />
  </basic-modal>
</template>
<script lang="ts" name="review-release-modal" setup>
  import { BasicModal, useModalInner, useModal } from '/@/components/Modal';
  import { addQuestion, queryQuestion } from './url';
  import player from './playedu-player/index.vue';
  import detailModal from './DetailModal.vue';
  import { ref } from 'vue';
  import { DeleteOutlined } from '@ant-design/icons-vue';
  import { message } from 'ant-design-vue';
  const [registerDetailModal, { openModal }] = useModal();
  const url: any = ref([]);
  const id = ref('');
  const activeIndex = ref(0);
  const playerRef = ref<InstanceType<typeof player> | null>(null);
  const rightPanelRef = ref<HTMLElement | null>(null);
  const from: any = ref([
    {
      videoTime: '',
      questionName: '',
      questionNameFile: '',
      analysis: '',
      analysisFile: '',
      answer: '',
      questionList: [],
    },
  ]);

  const [registerModal, { closeModal }] = useModalInner((data) => {
    id.value = data.id;
    url.value = data.url[0];
    activeIndex.value = 0;
    from.value = [
      {
        videoTime: '',
        questionName: '',
        questionNameFile: '',
        analysis: '',
        analysisFile: '',
        answer: '',
        questionList: [],
      },
    ];
    queryQuestion(id.value).then((res) => {
      if (res) {
        if (res.resourceQuestionList) {
          from.value = res.resourceQuestionList;
        }
      }
    });
  });

  const close = () => {
    closeModal();
  };

  const handleQuestion = (index: number) => {
    openModal(true, {
      index,
      from: from.value[index],
    });
  };

  const handleAdd = (index: number) => {
    from.value.splice(index + 1, 0, {
      videoTime: '',
      questionName: '',
      questionNameFile: '',
      analysis: '',
      analysisFile: '',
      answer: '',
      questionList: [],
    });
  };

  const handleRemove = (index: number) => {
    from.value.splice(index, 1);
  };

  const handleSuccess = (params: any, index: number) => {
    Object.assign(from.value[index], params);
  };
  const handleOk = () => {
    if (getDuplicateVideoTimes().length > 0) {
      return message.error(`${getDuplicateVideoTimes()}视频时间重复`);
    }
    for (let i = 0; i < from.value.length; i++) {
      if (!from.value[i].videoTime || from.value[i].videoTime === '') {
        return message.error(`请选择第${i + 1}个视频时间`);
      }
      if (!from.value[i].questionName || from.value[i].questionName === '') {
        return message.error(`请选择第${i + 1}个试题`);
      }
    }
    addQuestion(id.value, {
      resourceQuestionList: from.value,
    }).then(() => {
      close();
    });
  };
  const getDuplicateVideoTimes = () => {
    const countMap = {};
    const duplicates = new Set();
    for (const item of from.value) {
      const time = item.videoTime;
      if (!time) continue;
      countMap[time] = (countMap[time] || 0) + 1;
      if (countMap[time] > 1) {
        duplicates.add(time);
      }
    }

    return Array.from(duplicates);
  };
  const handleActive = (index: number) => {
    activeIndex.value = index;
  };

  const handlePlayerPause = () => {
    if (playerRef.value && playerRef.value.player) {
      const currentTime = playerRef.value.player.currentTime;
      if (activeIndex.value !== null && from.value[activeIndex.value]) {
        const hours = Math.floor(currentTime / 3600);
        const minutes = Math.floor((currentTime % 3600) / 60);
        const seconds = Math.floor(currentTime % 60);
        from.value[activeIndex.value].videoTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(
          2,
          '0'
        )}`;
      }
    }
  };

  const handleTimePickerChange = (timeString: string) => {
    if (playerRef.value && playerRef.value.player && timeString) {
      const totalSeconds = timeToSeconds(timeString);
      if (playerRef.value.player.seek) {
        playerRef.value.player.seek(totalSeconds);
      }
      if (playerRef.value.player.pause) {
        playerRef.value.player.pause();
      }
    }
  };
  const timeToSeconds = (timeStr: string): number => {
    if (!timeStr) return 0;
    const parts = timeStr.split(':');
    if (parts.length === 3) {
      return parseInt(parts[0], 10) * 3600 + parseInt(parts[1], 10) * 60 + parseInt(parts[2], 10);
    }
    return 0;
  };
</script>
<style scoped lang="less">
  .content {
    display: flex;
    justify-content: space-between;
    .left {
      width: 60%;
    }
    .right {
      width: 40%;
      max-height: 400px;
      overflow-y: auto;
      padding-right: 10px;
      .item {
        border: 1px solid #ccc;
        padding: 10px;
        border-radius: 5px;
        margin-bottom: 10px;
        margin-left: 20px;
        cursor: pointer;
        .question-name {
          margin-top: 10px;
          display: flex;
          .question-name-span {
            color: #999;
            font-size: 12px;
          }
        }
      }
      .item:last-child {
        margin-bottom: 0;
      }
      .item.active {
        border: 1px solid #1890ff;
      }
    }
  }
</style>
