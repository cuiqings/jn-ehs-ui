<template>
  <div
    v-if="buttonVisible"
    class="floating-tree-handle"
    :style="buttonStyle"
    @mousedown.stop="handlePointerDown"
    @click.stop="handleButtonClick"
  >
    <img class="floating-tree-handle__icon" src="../../../assets/images/handle.png" alt="操作说明" />
  </div>

  <Teleport to="body">
    <div v-if="visible" class="floating-tree-handle__mask" @click="closeModal">
      <div class="floating-tree-handle__panel" @click.stop>
        <div class="floating-tree-handle__header">
          <div>
            <div class="floating-tree-handle__title">操作说明</div>
            <div class="floating-tree-handle__subtitle">安全生产管控系统</div>
          </div>
          <a-button type="text" @click="closeModal">
            <Icon icon="ant-design:close-outlined" />
          </a-button>
        </div>

        <div class="floating-tree-handle__desc">后台统一配置文件库，点击分类可展开查看。</div>

        <div class="floating-tree-handle__body">
          <a-spin :spinning="loadingTree">
            <a-directory-tree
              v-if="treeData.length"
              v-model:expandedKeys="expandedKeys"
              class="floating-tree-handle__tree"
              :tree-data="treeData"
              :load-data="handleLoadData"
              :field-names="fieldNames"
              block-node
              @select="handleSelect"
            >
              <template #title="node">
                <div class="floating-tree-handle__node">
                  <Icon v-if="node.isSourceItem" :icon="resolveFileIcon(node)" class="floating-tree-handle__node-icon" />
                  <span class="floating-tree-handle__node-text">{{ node.title }}</span>
                </div>
              </template>
            </a-directory-tree>
            <a-empty v-else class="floating-tree-handle__empty" description="暂无数据" />
          </a-spin>
        </div>
      </div>
    </div>
  </Teleport>

  <Teleport to="body">
    <div v-if="previewVisible" class="floating-tree-handle__preview-mask" @click="closePreview">
      <div class="floating-tree-handle__preview" @click.stop>
        <div class="floating-tree-handle__preview-header">
          <div class="floating-tree-handle__preview-title">{{ previewTitle }}</div>
          <a-button type="text" @click="closePreview">
            <Icon icon="ant-design:close-outlined" />
          </a-button>
        </div>
        <div class="floating-tree-handle__preview-body">
          <video v-if="previewType === 'video'" :src="previewUrl" controls class="floating-tree-handle__video"></video>
          <iframe v-else-if="previewUrl" :src="previewUrl" frameborder="0" class="floating-tree-handle__iframe"></iframe>
          <a-empty v-else description="暂无预览内容" />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script lang="ts" setup>
  import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
  import Icon from '/@/components/Icon';
  import { previewFile } from '/@/api/common/api';
  import { loadTreeData, list } from '/@/views/studyTraining/resourceManage/url/index';
  import { useUserStore } from '/@/store/modules/user';
  import { getFileAccessHttpUrl } from '/@/utils/common/compUtils';

  interface TreeNodeItem {
    title: string;
    key: string;
    code?: string;
    children?: TreeNodeItem[];
    isLeaf?: boolean;
    loaded?: boolean;
    isSourceItem?: boolean;
    fileType?: string;
    path?: string;
    raw?: Recordable;
  }

  const HANDLE_SIZE = 56;
  const EDGE_GAP = 24;
  const BOTTOM_GAP = 120;
  const CLICK_DISTANCE = 4;
  const HIDE_EDGE_THRESHOLD = 20;

  const userStore = useUserStore();
  const loginInfo = computed(() => userStore.getLoginInfo);

  const buttonVisible = ref(true);
  const visible = ref(false);
  const previewVisible = ref(false);
  const loadingTree = ref(false);
  const treeData = ref<TreeNodeItem[]>([]);
  const expandedKeys = ref<string[]>([]);
  const previewUrl = ref('');
  const previewTitle = ref('资源预览');
  const previewType = ref<'document' | 'video'>('document');

  const position = ref({ x: 0, y: 0 });
  const dragState = {
    dragging: false,
    moved: false,
    startX: 0,
    startY: 0,
    originX: 0,
    originY: 0,
  };

  const fieldNames = {
    title: 'title',
    key: 'key',
    children: 'children',
  };

  const buttonStyle = computed(() => ({
    left: `${position.value.x}px`,
    top: `${position.value.y}px`,
  }));

  onMounted(() => {
    resetPosition();
    window.addEventListener('resize', handleResize);
  });

  onBeforeUnmount(() => {
    window.removeEventListener('resize', handleResize);
    detachPointerListeners();
  });

  function handleResize() {
    const maxX = Math.max(window.innerWidth - HANDLE_SIZE, 0);
    const maxY = Math.max(window.innerHeight - HANDLE_SIZE, 0);
    position.value = {
      x: clamp(position.value.x, 0, maxX),
      y: clamp(position.value.y, 0, maxY),
    };
  }

  function resetPosition() {
    buttonVisible.value = true;
    position.value = {
      x: Math.max(window.innerWidth - HANDLE_SIZE - EDGE_GAP, 0),
      y: Math.max(window.innerHeight - HANDLE_SIZE - BOTTOM_GAP, 0),
    };
  }

  function handlePointerDown(event: MouseEvent) {
    dragState.dragging = true;
    dragState.moved = false;
    dragState.startX = event.clientX;
    dragState.startY = event.clientY;
    dragState.originX = position.value.x;
    dragState.originY = position.value.y;
    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', handlePointerUp);
  }

  function handlePointerMove(event: MouseEvent) {
    if (!dragState.dragging) {
      return;
    }
    const deltaX = event.clientX - dragState.startX;
    const deltaY = event.clientY - dragState.startY;
    if (Math.abs(deltaX) > CLICK_DISTANCE || Math.abs(deltaY) > CLICK_DISTANCE) {
      dragState.moved = true;
    }
    const maxX = Math.max(window.innerWidth - HANDLE_SIZE, 0);
    const maxY = Math.max(window.innerHeight - HANDLE_SIZE, 0);
    position.value = {
      x: clamp(dragState.originX + deltaX, 0, maxX),
      y: clamp(dragState.originY + deltaY, 0, maxY),
    };
  }

  function handlePointerUp() {
    dragState.dragging = false;
    if (shouldHideButton()) {
      buttonVisible.value = false;
      visible.value = false;
      previewVisible.value = false;
    }
    window.setTimeout(() => {
      dragState.moved = false;
    }, 0);
    detachPointerListeners();
  }

  function detachPointerListeners() {
    window.removeEventListener('mousemove', handlePointerMove);
    window.removeEventListener('mouseup', handlePointerUp);
  }

  function shouldHideButton() {
    const maxX = Math.max(window.innerWidth - HANDLE_SIZE, 0);
    const maxY = Math.max(window.innerHeight - HANDLE_SIZE, 0);
    return (
      position.value.x <= HIDE_EDGE_THRESHOLD ||
      position.value.x >= maxX - HIDE_EDGE_THRESHOLD ||
      position.value.y <= HIDE_EDGE_THRESHOLD ||
      position.value.y >= maxY - HIDE_EDGE_THRESHOLD
    );
  }

  async function handleButtonClick() {
    if (dragState.moved) {
      return;
    }
    visible.value = true;
    if (!treeData.value.length) {
      await loadRootNodes();
    }
  }

  async function loadRootNodes() {
    loadingTree.value = true;
    try {
      const result = await loadTreeData({ async: false, pcode: 'A02A01' });
      const normalized = normalizeTree(Array.isArray(result) ? result : []);
      treeData.value = normalized;
      expandedKeys.value = normalized.length ? [normalized[0].key] : [];
    } finally {
      loadingTree.value = false;
    }
  }

  function normalizeTree(nodes: Recordable[]): TreeNodeItem[] {
    return nodes.map((item) => ({
      title: item.title,
      key: String(item.code || item.key || item.id),
      code: item.code,
      isLeaf: false,
      loaded: false,
      children: Array.isArray(item.children) ? normalizeTree(item.children) : [],
    }));
  }

  async function handleLoadData(treeNode: Recordable) {
    const currentNode = (treeNode.dataRef || treeNode) as TreeNodeItem;
    if (currentNode.isSourceItem || currentNode.loaded) {
      return;
    }
    const category = currentNode.code || currentNode.key;
    const orgCode = (loginInfo.value?.userInfo as Recordable | undefined)?.orgCode;
    const [videos, documents] = await Promise.all([
      list({ pageNo: 1, pageSize: 2000, category, type: 'VIDEO', orgCode }),
      list({ pageNo: 1, pageSize: 2000, category, type: 'DOCUMENT', orgCode }),
    ]);
    const currentChildren = Array.isArray(currentNode.children) ? currentNode.children.filter((item) => !item.isSourceItem) : [];
    const resourceNodes = [...mapRecords(videos?.records), ...mapRecords(documents?.records)];
    treeData.value = updateTreeNode(treeData.value, currentNode.key, {
      children: [...currentChildren, ...resourceNodes],
      loaded: true,
    });
  }

  function updateTreeNode(nodes: TreeNodeItem[], targetKey: string, patch: Partial<TreeNodeItem>): TreeNodeItem[] {
    return nodes.map((item) => {
      if (item.key === targetKey) {
        return {
          ...item,
          ...patch,
        };
      }

      if (item.children?.length) {
        return {
          ...item,
          children: updateTreeNode(item.children, targetKey, patch),
        };
      }

      return item;
    });
  }

  function mapRecords(records: Recordable[] = []): TreeNodeItem[] {
    return records.map((item, index) => ({
      title: item.name || item.title || item.fileName || `资源${index + 1}`,
      key: String(item.id || `${item.category || 'res'}-${index}`),
      isLeaf: true,
      isSourceItem: true,
      fileType: String(item.fileType || '').toLowerCase(),
      path: item.path || item.resourceUrl || item.url,
      raw: item,
      children: [],
    }));
  }

  async function handleSelect(_: string[], payload: { node: Recordable }) {
    const node = (payload.node?.dataRef || payload.node) as TreeNodeItem;
    if (!node?.isSourceItem) {
      return;
    }
    previewTitle.value = node.title;
    if (isVideo(node.fileType)) {
      previewType.value = 'video';
      previewUrl.value = getFileAccessHttpUrl(node.path || '');
    } else {
      previewType.value = 'document';
      previewUrl.value = node.path ? await previewFile(node.path) : '';
    }
    previewVisible.value = true;
  }

  function resolveFileIcon(node: TreeNodeItem) {
    if (isVideo(node.fileType)) {
      return 'fluent:video-clip-28-filled';
    }
    if (['doc', 'docx'].includes(String(node.fileType))) {
      return 'vscode-icons:file-type-word';
    }
    if (String(node.fileType) === 'pdf') {
      return 'bi:file-earmark-pdf';
    }
    if (['ppt', 'pptx'].includes(String(node.fileType))) {
      return 'icon-park-outline:file-pdf';
    }
    return 'teenyicons:attach-outline';
  }

  function isVideo(fileType?: string) {
    return ['mp4', 'avi', 'mov', 'video'].includes(String(fileType || '').toLowerCase());
  }

  function closeModal() {
    visible.value = false;
  }

  function closePreview() {
    previewVisible.value = false;
    previewUrl.value = '';
  }

  function clamp(value: number, min: number, max: number) {
    return Math.min(Math.max(value, min), max);
  }
</script>

<style lang="less" scoped>
  .floating-tree-handle {
    position: fixed;
    z-index: 910;
    width: 56px;
    height: 56px;
    border-radius: 50%;
    box-shadow: 0 16px 30px rgba(13, 95, 211, 0.28);
    cursor: move;
    display: flex;
    align-items: center;
    justify-content: center;
    user-select: none;

    &__icon {
      width: 100%;
      height: 100%;
      pointer-events: none;
    }

    &__mask,
    &__preview-mask {
      position: fixed;
      inset: 0;
      z-index: 1000;
      background: rgba(15, 23, 42, 0.34);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }

    &__panel {
      width: min(880px, calc(100vw - 48px));
      max-height: min(720px, calc(100vh - 48px));
      background: linear-gradient(180deg, #f8fbff 0%, #f2f8ff 100%);
      border-radius: 20px;
      box-shadow: 0 28px 64px rgba(15, 23, 42, 0.2);
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    &__header,
    &__preview-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 18px 20px;
      background: linear-gradient(90deg, #e9f4ff 0%, #dff3ff 100%);
      border-bottom: 1px solid #cfe5fb;
    }

    &__title,
    &__preview-title {
      font-size: 20px;
      font-weight: 600;
      color: #183b68;
    }

    &__subtitle {
      margin-top: 4px;
      font-size: 13px;
      color: #5a7698;
    }

    &__desc {
      padding: 14px 20px 0;
      font-size: 14px;
      color: #607a99;
      line-height: 1.6;
    }

    &__body,
    &__preview-body {
      min-height: 0;
      flex: 1;
      padding: 16px 20px 20px;
      overflow: auto;
      background: transparent;
    }

    &__tree {
      padding: 12px;
      background: rgba(255, 255, 255, 0.82);
      border: 1px solid #d6e8fb;
      border-radius: 16px;
      min-height: 360px;
    }

    &__node {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      min-width: 0;
    }

    &__node-icon {
      flex: none;
      color: #1677ff;
    }

    &__node-text {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    &__empty {
      padding-top: 80px;
    }

    &__preview {
      width: min(1080px, calc(100vw - 48px));
      height: min(760px, calc(100vh - 48px));
      background: #fff;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 28px 64px rgba(15, 23, 42, 0.2);
      display: flex;
      flex-direction: column;
    }

    &__iframe,
    &__video {
      width: 100%;
      height: 100%;
      border: 0;
      background: #000;
      border-radius: 12px;
    }
  }

  @media screen and (max-width: 768px) {
    .floating-tree-handle {
      display: none;
    }
  }
</style>
