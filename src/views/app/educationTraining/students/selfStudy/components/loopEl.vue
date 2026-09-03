<template>
  <!-- 递归组件核心：自身调用自身 + 终止条件 -->
  <div class="menu-level">
    <!-- 遍历当前层级的节点 -->
    <div v-for="item in list" :key="item.key" class="menu-item">
      <!-- 当前节点内容 -->
      <div class="menu-label" @click="itemClick(item)">
        <div class="oc" v-if="!item.name">
          <van-icon v-show="!refsShow[`btn_${item.key}`]" color="#1989fa" name="plus" />
          <van-icon v-show="refsShow[`btn_${item.key}`]" color="#1989fa" name="minus" />
        </div>
        <span v-if="!item.name"> {{ item.label || item.name }}</span>
      </div>
      <div class="menu-label" v-if="item.name" @click="itemClick(item)">
        <slot v-if="!!item.name"></slot>
        <div class="inner">
          <span v-if="item.name">
            {{ item.label || item.name }}
          </span>
          <div class="time" v-if="item.name"
            >学习进度：<span style="color: #1989fa">{{ item.progress || '0%' }}</span></div
          >
        </div>
      </div>
        <div class="main" :ref="(el) => setBtnRef(el, item.key)">
          <!-- 递归终止条件：只有当子节点存在且非空时，才渲染子组件 -->
          <RecursiveMenu @item-click="itemClick" v-slot="slotProps" v-if="item.children && item.children.length > 0" :list="item.children">
            <slot v-bind="slotProps"></slot>
          </RecursiveMenu>
        </div>

    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, watchEffect } from 'vue';

  const props = defineProps<{
    list: any[]
  }>();

  const show = ref(false);

  const emits = defineEmits(['itemClick', 'update:list']);
  const itemClick = (item: any) => {
    if (!!item.name) {
      emits('itemClick', item);
    } else {
      refsShow.value[`btn_${item.key}`] = !refsShow.value[`btn_${item.key}`];
      btnRefs.value[`btn_${item.key}`].el.style.display = refsShow.value[`btn_${item.key}`] ? 'block' : 'none';
    }
  };

  const btnRefs = ref({});
  const refsShow = ref({})
  const setBtnRef = (el, key) => {
    if(!key) return;
    const refKey = `btn_${key}`;
    if (el) {
      if(!btnRefs.value[refKey]){
        // 挂载DOM实例到响应式容器
        btnRefs.value[refKey] = { el, show: false};
        refsShow.value[refKey] = false;
        btnRefs.value[refKey].el.style.display = refsShow.value[refKey] ? 'block' : 'none';
      }
    } else {
      // 卸载时删除，避免内存泄漏
      delete btnRefs.value[refKey];
    }
  };

  watchEffect(() => {
    if (props.list && props.list.length > 0 && props.list[0].key == 'A02A01') {
      show.value = true;
    }
  });

  defineOptions({
    name: 'RecursiveMenu', // 与模板中自调用的组件名一致
  });
</script>

<style scoped lang="less">
  .oc {
    padding: 0 5px;
  }
  .menu-item {
    margin: 8px 0;
    padding: 4px;
    border: 1px solid #eeeeee;
    border-radius: 4px;
    background-color: #ffffff;
    .time {
      color: #666;
      font-size: 12px;
    }
  }
  .menu-label {
    cursor: pointer;
    display: flex;
    align-items: center;
  }
</style>
