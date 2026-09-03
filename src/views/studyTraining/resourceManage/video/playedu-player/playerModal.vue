<template>
  <basic-modal v-bind="$attrs" @register="registerModal" :width="800" title="预览" destroyOnClose @cancel="close">
    <player :url="url" :id="'player' + id" />
    <template #footer>
      <div>
        <a-button @click="close">取消</a-button>
      </div>
    </template>
  </basic-modal>
</template>
<script lang="ts" name="review-release-modal" setup>
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import player from './index.vue';
  import { ref } from 'vue';
  const url: any = ref([]);
  const id = ref('');
  const [registerModal, { closeModal }] = useModalInner((data) => {
    id.value = data.id;
    url.value = data.url[0];
  });
  const close = () => {
    closeModal();
  };
</script>
