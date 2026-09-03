<!-- app 端二级树形下拉多选，一级多选/单选 -->
<template>
    <van-popup v-model:show="show" @click-overlay="clickOverlay" position="top" close-on-click-overlay teleport="body">
      <curLoading v-show="loading" />
      <div class="poup-hd">
        <van-button style="border: none; color: #969799; font-size: 16px" @click="cancel">取消</van-button>
        <van-search @input="searchValueChange" v-model="searchValue" placeholder="请输入" @clear="clear" @search="onSearch" />
        <van-button style="border: none; color: #6398fb; font-size: 16px" @click="confirm">确认</van-button>
      </div>
      <van-tree-select v-if="!notTree && !isRadio" @click-item="itemClick" v-model:active-id="ids" v-model:main-active-index="activeIndex" :items="items">
      </van-tree-select>
      <van-tree-select v-if="!notTree && isRadio" @click-item="itemClick" v-model:active-id="id" v-model:main-active-index="activeIndex" :items="items">
      </van-tree-select>
      <div style="height: 50%; padding-right: 10px" v-if="notTree">
        <div class="nodata" v-if="notTree && items.length == 0">暂无数据！</div>
  
        <van-checkbox-group v-if="!isRadio" style="height: 300px" v-model="notTreeSelectList">
          <VirtualScroll height="300" :items="items" item-height="35" v-slot="{ item }">
            <van-cell :title="item[titleKey]">
              <template #right-icon>
                <van-checkbox :name="item[valueKey]" />
              </template>
            </van-cell>
          </VirtualScroll>
        </van-checkbox-group>
        <van-radio-group v-else style="height: 300px" v-model="checked">
          <VirtualScroll height="300" :items="items" item-height="35" v-slot="{ item }">
            <van-cell :title="item[titleKey]">
              <template #right-icon>
                <van-radio :name="item[valueKey]" />
              </template> </van-cell
          ></VirtualScroll>
        </van-radio-group>
      </div>
    </van-popup>
  </template>
  <script lang="ts" setup>
    import curLoading from '../../components/loading.vue';
    import { computed, ref, watch } from 'vue';
    import { isArray } from '/@/utils/is';
  
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
      }
    });
  
    const activeIndex = ref(0);
    const ids = ref<string[]>([]);
    const id = ref<string>('');
    const names = ref<any[]>([]);
    const loading = ref<boolean>(false);
  
    const emit = defineEmits(['update:show', 'change']);
  
    const items = ref<any[]>(JSON.parse(JSON.stringify(props.items)));
    const notTreeSelectList = ref<any[]>([]);
    const checked = ref<string>('');
  
    const originPerson = ref<any[]>([]);
    const searchValue = ref<string>('');
    
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
        items.value[activeIndex.value].children = originPerson.value[activeIndex.value].children.filter((item) => {
          console.log(props.titleKey, item)
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
        items.value[activeIndex.value].children = originPerson.value[activeIndex.value].children;
      }
    };
  
    watch(
      () => props.value,
      (newVal) => {
        console.log(newVal);
  
        if (!newVal) {
          ids.value = []
          activeIndex.value = 0
          return
        };
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
        console.log(notTreeSelectList.value);
      }
    );
  
    watch(
      () => props.items,
      (n, o) => {
        items.value = JSON.parse(JSON.stringify(props.items));
        if(items.value.length > 0) {
          // originPerson.value = props.notTree
          //   ? JSON.parse(JSON.stringify(items.value))
          //   : JSON.parse(JSON.stringify(items.value[activeIndex.value].children));
          originPerson.value = JSON.parse(JSON.stringify(items.value));
        }
      },
      { deep: true }
    );
  
    const show = computed(() => props.show);
  
    const itemClick = (e) => {
      if (ids.value.includes(e.id)) {
        if (!names.value.some((val) => val.id === e.id)) {
          items.value.map((item) => {
            if (e.orgCode && e.orgCode.includes(item.value)) {
              e.realname = item.text + '-' + e.text;
            } else {
              e.realname = e.text;
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
      let result:any = null;
      if(!props.notTree && !props.isRadio){ // 树形多选
        result = computedResult();
      } else if(!props.notTree && props.isRadio) { // 树形单选
        result = getTreeItemById(id.value);
      } else if(props.notTree && props.isRadio) { // 非树形单选
        result = getItemById(checked.value);
      } else { // 非树形多选
        result = getItemByIds(notTreeSelectList.value);
      }
      
      emit('change', result);
      activeIndex.value = 0;
      resetSearch();
      emit('update:show', false);
    };
  
    const getItemById = (id: string) => props.items.filter((val: any) => val[props.valueKey] == id)[0];
    const getTreeItemById = (id: string) => {
      let obj = { name: '', id: '' };
      props.items[activeIndex.value].children.map((val: any) => {
        if (val[props.valueKey] == id) {
          obj.name = val[props.titleKey];
          obj.id = val[props.valueKey];
        }
      });
      return obj;
    }
  
    const getItemByIds = (ids: string[]) => {
      let obj:{
        names: string;
        ids: string;
        values: any[];
      } = { names: '', ids: '', values: [] };
      props.items.map((val: any) => {
        if (ids.includes(val[props.valueKey])) {
          // obj.names += (val.realname || val.text || val.title) + ',';item[props.titleKey].includes(val);
          obj.names += val[props.titleKey] + ',';
          obj.ids += val[props.valueKey] + ',';
          obj.values.push(val)
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
  