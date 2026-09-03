<!-- app 端二级树形下拉多选，一级多选/单选 -->
<template>
  <van-popup v-model:show="show" @click-overlay="clickOverlay" position="top" close-on-click-overlay teleport="body">
    <curLoading v-show="loading" />
    <div class="poup-hd">
      <van-button style="border: none; color: #969799; font-size: 16px" @click="cancel">取消</van-button>
      <van-search @input="searchValueChange" v-model="searchValue" placeholder="请输入" @clear="clear" @search="onSearch" />
      <van-button style="border: none; color: #6398fb; font-size: 16px" @click="confirm">确认</van-button>
    </div>
    <van-tree-select v-if="!notTree" @click-item="itemClick" v-model:active-id="ids" v-model:main-active-index="activeIndex" :items="items">
    </van-tree-select>
    <div style="height: 50%; padding-right: 10px" v-else>
      <div class="nodata" v-if="notTree && items.length == 0"><van-empty description="暂无数据" /></div>
      <van-checkbox-group v-if="!isRadio" style="height: 300px" v-model="notTreeSelectList">
        <VirtualScroll height="300" :items="items" item-height="35" v-slot="{ item, index }">
          <van-cell :title="item[titleKey]" @click="toggle(index)">
            <template #right-icon>
              <van-checkbox  :name="item[valueKey]" :ref="el => checkboxRefs[index] = el"
                @click.stop/>
            </template>
          </van-cell>
        </VirtualScroll>
      </van-checkbox-group>
      <van-radio-group v-else style="height: 300px" v-model="checked">
        <VirtualScroll height="300" :items="items" item-height="35" v-slot="{ item }">
          <van-cell :title="item[titleKey]" @click="checked = item[valueKey]">
            <template #right-icon>
              <van-radio :name="item[valueKey]" />
            </template> </van-cell
        ></VirtualScroll>
      </van-radio-group>
    </div>
  </van-popup>
</template>
<script lang="ts" setup>
  import curLoading from './loading.vue';
  import { computed, ref, watch } from 'vue';
  import { isArray } from '/@/utils/is';
import { showToast } from 'vant';

  const props = defineProps({
    items: {
      type: Array,
      default: () => [],
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    value: {
      type: String,
    },
    curWorkExamineInfoList: {
      type: Array,
      default: () => [],
    },
    show: {
      type: Boolean,
      default: false,
    },
    notTree: {
      type: Boolean,
      default: false,
    },
    isRadio: {
      type: Boolean,
      default: false,
    },
    valueKey: {
      type: String,
      default: 'id',
    },
    titleKey: {
      type: String,
      default: 'realname'
    },
    maxLength: {
      type: Number,
      default: 0,
    },
    loading: {
      type: Boolean,
      default: false,
    }
  });

  const activeIndex = ref(0);
  const ids = ref<string[]>([]);
  const names = ref<any[]>([]);

  const emit = defineEmits(['update:show', 'change']);
  const loading = ref(false)
  const items = ref<any[]>(JSON.parse(JSON.stringify(props.items)));
  loading.value  =  props.loading
  const notTreeSelectList = ref<any[]>([]);
  const checked = ref<string>('');

  const originPerson = ref<any[]>([]);
  const searchValue = ref<string>('');

  const checkboxRefs = ref([]);
  const toggle = (idx) => {
    checkboxRefs.value[idx].toggle();
  };
  
  if(items.value.length > 0) {
    originPerson.value = props.notTree
      ? JSON.parse(JSON.stringify(items.value))
      : JSON.parse(JSON.stringify(items.value[activeIndex.value].children));
  }
  
  
  const onSearch = (val): void => {
    if (!val) {
      resetSearch();
      return;
    }
    if (props.notTree) {
      items.value = originPerson.value.filter((item) => {
        // if(item.realname) return item.realname.includes(val);
        // if(item.name) return item.name.includes(val);
        // if(item.title) return item.title.includes(val);
        // if(item.text) return item.text.includes(val);
        return item[props.titleKey].includes(val);
      });
    } else {
      items.value[activeIndex.value].children = originPerson.value.filter((item) => {
        return item[props.titleKey].includes(val)
        // item.realname ? item.realname.includes(val) : item.name ? 
        // item.name.includes(val) : item.title.includes(val)
    });
    }
  };

  const searchValueChange = (val) => {
    // if (!val.data) {
    //   resetSearch();
    // }
    onSearch(val.target.value)
  };

  const clear = (): void => {
    resetSearch();
  };

  const resetSearch = (): void => {
    searchValue.value = '';
    if (props.notTree) {
      items.value = originPerson.value;
    } else {
      items.value[activeIndex.value].children = originPerson.value;
    }
  };

  watch(
    () => props.value,
    (newVal) => {
      if (!newVal) return;
      if (isArray(newVal)) newVal = newVal.toString();
      if (!props.notTree) {
        ids.value = newVal.split(',');
      } else {
        if (props.isRadio) {
          checked.value = newVal;
        } else {
          notTreeSelectList.value = newVal.split(',');
        }
      }
    }
  );

  watch(
    () => props.items,
    async () => {
      items.value = JSON.parse(JSON.stringify(props.items));
      originPerson.value = props.notTree
        ? JSON.parse(JSON.stringify(items.value))
        : JSON.parse(JSON.stringify(items.value[activeIndex.value].children));
    },
    { deep: true }
  );

  const show = computed(() => props.show);

  const itemClick = (e) => {
    if (ids.value.includes(e.id)) {
      if (!names.value.some((val) => val.id === e.id)) {
        items.value.map((item) => {
          if (e.orgCode.includes(item.value)) {
            e.realname = item.text + '-' + e.text;
          }
        });
        names.value.push(e);
      }
    }
  };

  const clickOverlay = () => {
    emit('update:show', false);
  };

  const cancel = () => {
    emit('update:show', false);
    resetSearch();
  };

  const confirm = () => {
    let data = !props.notTree ? computedResult() : props.isRadio ? getItemById(checked.value) : getItemByIds(notTreeSelectList.value);
    if(!props.isRadio && props.maxLength > 0) {
      if(data.ids.split(',').length > props.maxLength) {
        showToast({message: `最多只能选择${props.maxLength}人`, position: 'top'})
        return
      }
    }
    emit('change', data);
    resetSearch();
    emit('update:show', false);
  };

  const getItemById = (id: string) => props.items.filter((val: any) => val[props.valueKey] == id)[0];

  const getItemByIds = (ids: string[]) => {
    let obj = { names: '', ids: '' };
    props.items.map((val: any) => {
      if (ids.includes(val[props.valueKey])) {
        // obj.names += (val.realname || val.text || val.title) + ',';item[props.titleKey].includes(val);
        obj.names += val[props.titleKey] + ',';
        obj.ids += val[props.valueKey] + ',';
      }
    });
    obj.names = obj.names.substring(0, obj.names.length - 1);
    obj.ids = obj.ids.substring(0, obj.ids.length - 1);
    return obj;
  };

  const computedResult = () => {
    let obj = { names: '', ids: '' };
    names.value.map((val) => {
      if (ids.value.includes(val[props.valueKey])) {
        obj.names += (val.realname || val[props.titleKey]) + ',';
        obj.ids += val[props.valueKey] + ',';
      }
    });
    obj.names = obj.names.substring(0, obj.names.length - 1);
    obj.ids = obj.ids.substring(0, obj.ids.length - 1);
    return obj;
  };

  defineExpose({
    computedResult,
  });
</script>
<style lang="less" scoped>
  .tree-select {
    width: 100%;
    height: auto;
    position: relative;
  }
  .poup-hd {
    display: flex;
    justify-content: space-between;
    height: 54px;
    line-height: 54px;
    align-items: center;
    padding: 0 6px;
    .van-search {
      flex: 1;
    }
  }
  .nodata {
    height: 45px;
    line-height: 45px;
    text-align: center;
    font-size: 14px;
    color: #e4e4e4;
  }
</style>
