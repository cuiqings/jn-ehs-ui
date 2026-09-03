<template>
  <div class="step-circle">
    <span v-for="(item, idx) in steps" :key="idx + props.active" ref="items" :class="{ active: item.state == 0, line: idx > 0 }">
      {{ idx + 1 }}
      <i v-if="idx > 0"></i>
    </span>
  </div>
</template>

<script lang="ts" setup>
  import { ref, onMounted, nextTick, watch } from 'vue';
  const props = withDefaults(
    defineProps<{
      steps: any[];
      active: number;
    }>(),
    {
      steps: () => [],
      active: 1,
    }
  );
  const items = ref<any[]>([]);
  console.log(props.steps);
  watch(
    () => [props.steps, props.active],
    (newVal, oldVal) => {
      nextTick(() => {
        if (newVal.length > 0) {
          let w = items.value[2].offsetLeft - items.value[1].offsetLeft - 15;
          items.value.map((el) => {
            if (el.children.length > 0) {
              el.children[0].style.width = w + 'px';
            }
          });
        }
      });
    },
    {
      deep: true,
    }
  );

  onMounted(() => {
    if (props.steps.length > 0) {
      nextTick(() => {
        let w = items.value[2].offsetLeft - items.value[1].offsetLeft - 15;
        items.value.map((el) => {
          if (el.children.length > 0) {
            el.children[0].style.width = w + 'px';
          }
        });
      });
    }
  });
</script>
<style lang="less" scoped>
  .step-circle {
    display: flex;
    justify-content: space-between;
    padding: 15px;
    background-color: #ffffff;

    span {
      width: 15px;
      height: 15px;
      display: flex;
      border-radius: 50%;
      justify-content: center;
      background: #a0a1a2;
      align-items: center;
      color: #ffffff;
      font-size: 12px;
      line-height: 15px;
    }

    .active {
      background: #1989fa;

      i {
        background: #1989fa !important;
      }
    }

    .line {
      position: relative;

      i {
        content: '';
        height: 1px;
        background: #a0a1a2;
        position: absolute;
        right: 100%;
      }
    }
  }
</style>
