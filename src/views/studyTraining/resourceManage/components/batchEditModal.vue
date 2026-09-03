<template>
  <basic-modal v-bind="$attrs" @register="registerModal" :width="600" title="编辑" destroyOnClose>
    <div>
      <a-form :model="info" ref="infoRef" :label-col="{ span: 5 }" :wrapper-col="{ span: 19 }" autocomplete="off">
        <a-form-item :label="labelText + '分类：'" name="category" :rules="[{ required: true, message: `${labelText}分类为必填项！` }]">
          <a-tree-select
            v-model:value="info.category"
            show-search
            :field-names="{
              children: 'children',
              label: 'title',
              value: 'code',
            }"
            style="width: 100%"
            :dropdown-style="{ maxHeight: '500px', overflow: 'auto' }"
            placeholder="请选择"
            allow-clear
            tree-default-expand-all
            tree-node-filter-prop="title"
            :tree-data="treeData"
            :getPopupContainer="(node) => node.parentNode"
          />
        </a-form-item>
      </a-form>
    </div>
    <template #footer>
      <div style="text-align: right">
        <a-button style="margin-right: 15px" @click="close">取消</a-button>
        <a-button type="primary" @click="confirmClose">提交</a-button>
      </div>
    </template>
  </basic-modal>
</template>
<script lang="ts" name="batch-edit-modal" setup>
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { ref } from 'vue';
  import { batchEdit, loadTreeData } from '../url/index';
  defineProps({
    labelText: {
      type: String,
      default: '',
    },
  });
  const emit = defineEmits(['success']);
  const infoRef: any = ref(null);
  const treeData: any = ref([]);
  const info: any = ref({
    id: '',
    category: undefined,
  });
  const [registerModal, { closeModal }] = useModalInner(async (data) => {
    await infoRef.value.resetFields();
    info.value.id = data.ids;
    info.value.category = undefined;
    loadRootTreeData();
  });
  // 类型
  const loadRootTreeData = async () => {
    try {
      treeData.value = [];
      const result = await loadTreeData({
        async: false,
        pcode: 'A02',
      });
      if (Array.isArray(result)) {
        treeData.value = result;
        treeData.value.unshift({
          title: '全部',
          code: '0',
          key: '0',
          children: [],
        });
        processTreeData(treeData.value);
      }
    } catch (e) {
      console.error(e);
    }
  };
  const processTreeData = (data) => {
    return data.map((item) => {
      // 递归处理子节点
      if (item.children && item.children.length > 0) {
        item.children = processTreeData(item.children);
      }
      // 删除 key 字段
      delete item.key;
      return item;
    });
  };
  const confirmClose = async () => {
    await infoRef.value.validate();
    const data = JSON.parse(JSON.stringify(info.value));
    batchEdit(data).then(() => {
      //关闭弹窗
      closeModal();
      //刷新列表
      emit('success');
    });
  };
  const close = () => {
    closeModal();
  };
</script>
