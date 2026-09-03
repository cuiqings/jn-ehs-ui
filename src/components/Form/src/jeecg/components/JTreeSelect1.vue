<template>
  <a-tree-select
    :value="treeValue"
    v-bind="attrs"
    show-search
    style="width: 100%"
    :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
    :placeholder="placeholder"
    :allow-clear="allowClear"
    :tree-data="treeData"
    :load-data="onLoadData"
    :field-names="fieldNames"
    @change="onChange"
    :tree-default-expand-all="treeDefaultExpandAll"
    :tree-node-filter-prop="treeNodeFilterProp"
    :treeCheckable="treeCheckable"
    :tree-check-strictly="treeCheckStrict"
    :multiple="multiple"
  />
</template>
<script lang="ts" setup>
  import { ref, watch } from 'vue';
  import { defHttp } from '/@/utils/http/axios';
  import { propTypes } from '/@/utils/propTypes';
  import { useAttrs } from '/@/hooks/core/useAttrs';
  import { useMessage } from '/@/hooks/web/useMessage';
  const { createMessage } = useMessage();
  const props = defineProps({
    value: propTypes.string.def(''),
    placeholder: propTypes.string.def('请选择'),
    url: propTypes.string.def(''),
    params: propTypes.object.def({}),
    fieldNames: propTypes.object.def({
      label: 'label',
      value: 'value',
      options: 'children',
    }),
    treeDataArr: propTypes.array.def([]),
    isLeaf: {
      type: Boolean,
      default: true,
    },
    load: {
      type: Boolean,
      default: true,
    },
    treeNodeFilterProp: {
      type: String,
      default: 'label',
    },
    treeCheckable: {
      type: Boolean,
      default: false,
    },
    treeCheckStrict: {
      type: Boolean,
      default: false,
    },
    treeMaxLength: {
      type: Number,
      default: 0,
    },
    allowClear: {
      type: Boolean,
      default: true,
    },
    multiple: {
      type: Boolean,
      default: false,
    },
    treeDefaultExpandAll: {
      type: Boolean,
      default: true,
    },
  });
  const attrs = useAttrs();
  const emit = defineEmits(['change', 'update:value']);
  //树形下拉数据
  const treeData = ref<any[]>([]);
  //选择数据
  const treeValue = ref<any>(null);

  /**
   * 选中树节点事件
   */

  function onChange(value, _label, extra) {
    if (!value) {
      emitValue('', '', '');
    } else if (value instanceof Array) {
      if (props.treeMaxLength !== 0) {
        if (value.length > props.treeMaxLength) {
          // 还原为之前的值
          value = value.slice(0, props.treeMaxLength);
          createMessage.info(`最多只能选择${props.treeMaxLength}个！`);
        }
      }
      if (props.multiple && !props.treeCheckStrict) {
        emitValue(value.join(','), extra, _label);
      } else if (props.treeCheckStrict || props.multiple) emitValue(value.map((item) => item.value).join(','), extra, _label);
      else emitValue(value.join(','), extra, _label);
    } else {
      emitValue(value, extra, _label);
    }
    treeValue.value = value;
  }
  function emitValue(value, extra = {}, label) {
    emit('change', value, extra, label);
    emit('update:value', value);
  }
  watch(
    () => props.value,
    (value) => {
      if (!value) {
        treeValue.value = props.treeCheckable || props.multiple ? [] : null;
      } else {
        treeValue.value = props.treeCheckable || props.multiple ? props.value.split(',') : props.value;
      }
    },
    { deep: true, immediate: true }
  );
  watch(
    () => props.url,
    async (val) => {
      if (val) {
        await loadRootByUrl();
      }
    },
    {
      immediate: true,
    }
  );
  watch(
    () => props.treeDataArr,
    async (val) => {
      if (val) {
        treeData.value = val;
      }
    },
    {
      immediate: true,
    }
  );

  /**
   * 根据自定义的请求地址加载数据
   */
  async function loadRootByUrl() {
    let url = props.url;
    let params = props.params;
    let res = await defHttp.get({ url, params }, { isTransformResponse: false });
    if (res.success && res.result.length > 0) {
      //已展开的数据批量子节点
      let records = res.result;
      treeData.value = records.map((item) => {
        item.label = item.name;
        item.value = item.id;
        item.fatherName = null;
        if (item.hasChild !== '1' && props.isLeaf) item.isLeaf = true;
        return item;
      });
    }
  }
  // 异步加载树节点
  const onLoadData = async (treeNode: any) => {
    if (!props.load) {
      return Promise.resolve();
    }
    if (props.treeDataArr.length === 0) {
      const { id } = treeNode.dataRef;
      let params = { pid: id };
      let res = await defHttp.get({ url: props.url, params }, { isTransformResponse: false });
      if (res.success) {
        addChildren(id, res.result, treeData.value);
        treeData.value = [...treeData.value];
      }
      return Promise.resolve();
    }
  };
  // 加载子节点
  function addChildren(pid, children, treeArray) {
    if (treeArray && treeArray.length > 0) {
      for (let item of treeArray) {
        if (item.id == pid) {
          if (item.hasChild !== '1' && props.isLeaf) {
            item.isLeaf = true;
          } else {
            item.children = children.map((ite) => {
              if (ite.hasChild !== '1' && props.isLeaf) ite.isLeaf = true;
              ite.label = ite.name;
              ite.value = ite.id;
              ite.fatherName = treeData.value.filter((it) => it.id === ite.pid)[0]?.name;
              return ite;
            });
          }
          break;
        } else {
          addChildren(pid, children, item.children);
        }
      }
    }
  }
</script>

<style lang="less"></style>
