<template>
  <div class="tree-select">
    <curLoading v-show="loading" />
    <van-tree-select
      @click-item="itemClick"
      v-model:active-id="ids"
      v-model:main-active-index="activeIndex"
      :items="personnel"
    />
  </div>
</template>
<script lang="ts" setup>
  import curLoading from '../../../components/loading.vue';
  import { ref, watch } from 'vue';
  import { isArray } from '/@/utils/is';

  const activeIndex = ref(0);
  const ids = ref<string[]>([]);
  const names = ref<any[]>([]);
  const loading = ref(false);

  const props = defineProps({
    personnel: {
      type: Array,
      default: () => [],
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    value: {
      type: Array,
      default: () => [],
    },
    curWorkExamineInfoList: {
      type: Array,
      default: () => [],
    },
  });

  const personnel = ref(JSON.parse(JSON.stringify(props.personnel)));

  watch(
    () => props.value,
    (newVal) => {
      if (isArray(newVal)) newVal = newVal.toString();
      ids.value = newVal.split(',') as string[];
    }
  );

  function setNames () {
    if(ids.value.length){
      if(!Array.isArray(ids.value)){
        ids.value = ids.value.split(',');
      }
      ids.value.map(id => {
        if(!names.value.some(val => val.id == id)){
          personnel.value.map(o => {
            o.children.map(co => {
              if(co.id == id){
                names.value.push({...co, realname: o.text + '-' + co.text});
              }
            })
          })
        }
      })
    }
  }

  const setvalues = (val) => {
    ids.value = val;
    console.log(val);
    setNames();
  }

  watch(
    () => props.personnel,
    async () => {
      personnel.value = JSON.parse(JSON.stringify(props.personnel));
    },
    { deep: true }
  );

  init();
  async function init() {
    if (props.value.length > 0) {
      ids.value = props.value as string[];
    }
    if (!personnel.value[0].children) {
      loading.value = true;
      loading.value = false;
    }
  }

  const itemClick = (e) => {
    if (ids.value.includes(e.id)) {
      if (!names.value.some((val) => val.id === e.id)) {
        personnel.value.map((item) => {
          if (e.orgCode.includes(item.value)) {
            e.realname = item.text + '-' + e.text;
          }
        });
        names.value.push(e);
      }
    }
  };

  const computedResult = () => {
    let obj = { names: '', ids: '' };
    names.value.map((val) => {
      if (ids.value.includes(val.id)) {
        obj.names += val.realname + ',';
        obj.ids += val.id + ',';
      }
    });
    obj.names = obj.names.substring(0, obj.names.length - 1);
    obj.ids = obj.ids.substring(0, obj.ids.length - 1);
    return obj;
  };

  defineExpose({
    setvalues,
    computedResult,
  });
</script>
<style lang="less" scoped>
  .tree-select {
    width: 100%;
    height: auto;
    position: relative;
  }
</style>
