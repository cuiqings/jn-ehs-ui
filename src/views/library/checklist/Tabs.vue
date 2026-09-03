<script setup lang="ts">
  import { ref, onMounted, onUnmounted, watch } from 'vue';
  const props = defineProps({
    tabsList: {
      type: Array,
      default: () => [],
    },
    maxWidth: {
      type: Number,
      default: 1920,
    },
    activeKey: {
      type: String,
      default: '',
    },
  });
  const emit = defineEmits(['tabsChange']);
  const scrollWrapper: any = ref(null);
  const showButtons = ref(false);
  const isStart = ref(false);
  const isEnd = ref(false);
  const tabsIndex: any = ref(null);
  let resizeObserver: any = null;
  const checkScrollState = () => {
    if (!scrollWrapper.value) return;
    const { scrollWidth, clientWidth, scrollLeft } = scrollWrapper.value;
    showButtons.value = scrollWidth > clientWidth;
    isStart.value = scrollLeft <= 0;
    isEnd.value = scrollLeft + clientWidth >= scrollWidth - 1;
  };

  const scroll = (direction) => {
    if (!scrollWrapper.value) return;
    const scrollAmount = 200 * direction;
    scrollWrapper.value.scrollBy({
      left: scrollAmount,
      behavior: 'smooth',
    });
  };
  watch(
    () => props.activeKey,
    (val) => {
      if (val) {
        tabsIndex.value = val;
      }
    },
    {
      deep: true,
    }
  );
  onMounted(() => {
    // 初始检测
    checkScrollState();
    // 监听滚动事件
    scrollWrapper.value?.addEventListener('scroll', checkScrollState);

    // 监听窗口变化
    resizeObserver = new ResizeObserver(checkScrollState);
    if (scrollWrapper.value) {
      resizeObserver.observe(scrollWrapper.value);
    }
  });
  const handlerTab = (item) => {
    tabsIndex.value = item.key;
    emit('tabsChange', item.key);
  };
  onUnmounted(() => {
    scrollWrapper.value?.removeEventListener('scroll', checkScrollState);
    resizeObserver?.disconnect();
  });
</script>

<template>
  <div class="scroll-container" :style="{ maxWidth: maxWidth + 'px' }">
    <button class="scroll-btn scroll-left" :class="{ hidden: !showButtons }" :disabled="isStart" @click="scroll(-1)"> ← </button>
    <div class="items-wrapper" ref="scrollWrapper">
      <ul class="items-list">
        <li v-for="item in tabsList" :key="item.key" :class="tabsIndex === item.key ? 'item activeItem' : 'item'" @click="handlerTab(item)">
          {{ item.title }}
        </li>
      </ul>
    </div>
    <button class="scroll-btn scroll-right" :class="{ hidden: !showButtons }" :disabled="isEnd" @click="scroll(1)"> → </button>
  </div>
</template>

<style scoped lang="less">
  .scroll-container {
    position: relative;
    padding: 0 10px;
  }

  .items-wrapper {
    overflow-x: hidden;
    scroll-behavior: smooth;
  }

  .items-list {
    display: flex;
    list-style: none;
    margin: 0;
    flex-wrap: nowrap;
  }

  .item {
    padding: 8px 20px;
    background: #fff;
    border: 1px solid #f5f5f5;
    border-right: none;
    white-space: nowrap;
    cursor: pointer;
    transition: background 0.3s;
  }
  .item:last-child {
    border-right: 1px solid #f5f5f5;
  }
  .activeItem {
    border-bottom: none;
    color: #0a8fe9;
  }

  .scroll-btn {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 20px;
    height: 38px;
    border: none;
    background: white;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    cursor: pointer;
    transition: 0.3s;
    z-index: 1;
  }

  .scroll-btn.hidden {
    display: none;
  }

  .scroll-btn:hover:not(:disabled) {
    background: #f5f5f5;
  }

  .scroll-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    box-shadow: none;
  }

  .scroll-left {
    left: -12px;
  }

  .scroll-right {
    right: -12px;
  }
</style>
