<template>
  <div class="real-camera-upload-wrapper">
    <div class="camera-action-row" v-if="!disabled || albumPhotos.length">
      <van-button
        v-if="imageObjects.length < props.maxCount && !disabled"
        class="launch-button"
        icon="photo-o"
        size="mini"
        type="default"
        @click="launchCamera"
      >
        拍照
      </van-button>
      <van-button
        v-if="allowGallery && !disabled && imageObjects.length < props.maxCount"
        class="gallery-button"
        icon="photo-o"
        size="mini"
        type="default"
        @click="pickFromGallery"
      >
        从相册选择
      </van-button>
      <input ref="galleryInputRef" class="gallery-input" type="file" accept="image/*" multiple @change="onGalleryInputChange" />
      <van-button v-if="albumPhotos.length && !disabled" class="album-button" icon="photo" size="mini" type="primary" plain @click="openAlbum">
        {{ albumText || (allowGallery ? '离线相册' : '相册') }}({{ albumPhotos.length }})
      </van-button>
    </div>
    <!-- <div v-for="(image, index) in imageObjects">{{ image }}</div> -->
    <div v-for="(image, index) in imageObjects" :key="image.url + index" class="image-preview-container">
      <img :src="image.url" class="uploaded-image" @click="handelImagePreview(index)" />
      <van-icon class="delete-icon" name="cross" @click="deletePhoto(index)" v-if="!disabled" />
    </div>
    <RealCamera v-if="showCamera" :biz="biz" class="full-screen-camera" @close="showCamera = false" @photo-taken="onPhotoTaken" />
    <van-popup v-model:show="showAlbum" class="album-popup" round teleport="body" :z-index="10001">
      <div class="album-panel">
        <div class="album-header">
          <div>
            <div class="album-title">离线相册</div>
            <div class="album-subtitle">成功与失败的照片都会保存在本机</div>
          </div>
          <div class="album-header-actions">
            <van-button v-if="albumPhotos.length" size="mini" type="danger" plain :disabled="isAlbumConfirming" @click="confirmClearAlbum">清除</van-button>
            <van-icon name="cross" class="album-close" @click="showAlbum = false" />
          </div>
        </div>
        <div v-if="albumPhotos.length" class="album-grid">
          <div v-for="(photo, index) in albumPhotos" :key="photo.id" class="album-item">
            <img :src="photo.previewUrl" class="album-image" @click="previewAlbumPhoto(index)" />
            <div class="album-check" :class="{ checked: isPhotoSelected(photo.id) }" @click.stop="togglePhotoSelected(photo.id)">
              <van-icon v-if="isPhotoSelected(photo.id)" name="success" />
            </div>
          </div>
        </div>
        <div v-else class="album-empty">暂无照片</div>
        <div class="album-footer">
          <van-button class="album-footer-button" :disabled="isAlbumConfirming" @click="cancelAlbumSelect">取消</van-button>
          <van-button
            class="album-footer-button"
            type="primary"
            :loading="isAlbumConfirming"
            loading-text="处理中..."
            @click="confirmAlbumSelected"
          >
            确定
          </van-button>
        </div>
      </div>
    </van-popup>
  </div>
</template>
<script lang="ts" setup>
  import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
  import {
    Button as VanButton,
    Icon as VanIcon,
    Popup as VanPopup,
    showConfirmDialog,
    showImagePreview,
    showToast,
  } from 'vant';
  import RealCamera from './RealCamera.vue';
  import { getFileAccessHttpUrl } from '/@/utils/common/compUtils';
  import { uploadFile } from '/@/api/common/api';
  import uni from '@dcloudio/uni-webview-js';

  interface ImageObject {
    url: string;
    shortPath: string;
  }

  type AlbumPhotoStatus = 'uploaded' | 'failed';

  interface AlbumPhoto {
    id: string;
    cacheKey: string;
    biz: string;
    componentId: string;
    source: string;
    previewUrl: string;
    shortPath: string;
    status: AlbumPhotoStatus;
    createdAt: number;
    updatedAt: number;
  }

  interface AppPhotoPayload {
    url?: string;
    path?: string;
    base64?: string;
    message?: string;
    data?: string;
  }

  const DB_NAME = 'real-camera-upload-album';
  const DB_VERSION = 1;
  const STORE_NAME = 'photos';
  const LOCAL_STORAGE_KEY = 'real-camera-upload-album-photos';
  const ALBUM_CHANGE_EVENT = 'real-camera-upload-album-change';
  const PHOTO_CACHE_EXPIRE_TIME = 24 * 60 * 60 * 1000;

  const props = defineProps({
    value: {
      type: Array,
      default: () => [],
    },
    // 相册边界id 如果不存在用下面的id
    businessId: {
      type: String,
      default: '',
    },
    id: {
      type: String,
      default: 'realCameraUpload',
    },
    biz: {
      type: String,
      default: 'ehs',
    },
    maxCount: {
      type: Number,
      default: 1,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    // 开启后除拍照外，还可以从系统相册选图
    allowGallery: {
      type: Boolean,
      default: false,
    },
    // 本地缓存相册按钮文案，不传时按 allowGallery 显示 离线相册/相册
    albumText: {
      type: String,
      default: '',
    },
  });
  const emit = defineEmits(['update:value']);
  const showCamera = ref(false);
  const showAlbum = ref(false);
  const galleryInputRef = ref<HTMLInputElement | null>(null);
  const isAlbumConfirming = ref(false);
  const selectedPhotoIds = ref<string[]>([]);
  const albumPhotos = ref<AlbumPhoto[]>([]);
  let expirationTimer: number | undefined;
  const resolvedCacheKey = computed(() => props.businessId || props.id);
  const imageObjects = computed<ImageObject[]>({
    get() {
      const modelValue = props.value;
      if (!modelValue) return [];
      // 服务端可能返回逗号拼接的字符串，拆分后统一处理
      const list: string[] =
        typeof modelValue === 'string'
          ? (modelValue as string).split(',').filter(Boolean)
          : (modelValue as string[]);
      return list.map((shortPath) => ({
        url: shortPath.startsWith('data:image') ? shortPath : getFileAccessHttpUrl(shortPath),
        shortPath: shortPath,
      }));
    },
    set(newList: ImageObject[]) {
      emit('update:value', newList.map((f) => f.shortPath).filter(Boolean));
    },
  });
  const launchCamera = () => {
    if (imageObjects.value.length >= props.maxCount) {
      showToast(`最多只能上传 ${props.maxCount} 张照片`);
      return;
    }
    if (!(window.plus && window.plus.webview)) {
      showCamera.value = true;
      return;
    }
    try {
      uni.webView.postMessage({
        data: {
          action: 'launchCamera',
          params: {
            id: props.id,
            biz: props.biz
          }
        }
      });
    } catch (err) {
      console.error('launchCamera-err', err);
    }
  };
  const openDb = () => {
    return new Promise<IDBDatabase>((resolve, reject) => {
      if (!window.indexedDB) {
        reject(new Error('当前浏览器不支持 IndexedDB，无法缓存离线照片'));
        return;
      }
      const request = window.indexedDB.open(DB_NAME, DB_VERSION);
      request.onerror = () => reject(request.error || new Error('IndexedDB 打开失败'));
      request.onsuccess = () => resolve(request.result);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('cacheKey', 'cacheKey', { unique: false });
        }
      };
    });
  };

  const useStore = async <T>(mode: IDBTransactionMode, action: (store: IDBObjectStore) => IDBRequest<T>) => {
    const db = await openDb();
    return new Promise<T>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, mode);
      const store = transaction.objectStore(STORE_NAME);
      const request = action(store);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error('IndexedDB 操作失败'));
      transaction.oncomplete = () => db.close();
      transaction.onerror = () => {
        db.close();
        reject(transaction.error || new Error('IndexedDB 事务失败'));
      };
    });
  };

  // localStorage 只作为 IndexedDB 不可用时的兜底，容量小，不能长期大量存图。
  const readLocalPhotos = () => {
    try {
      const value = window.localStorage?.getItem(LOCAL_STORAGE_KEY);
      return value ? JSON.parse(value) as AlbumPhoto[] : [];
    } catch (err) {
      console.error('readLocalPhotos-err', err);
      return [];
    }
  };

  const writeLocalPhotos = (photos: AlbumPhoto[]) => {
    window.localStorage?.setItem(LOCAL_STORAGE_KEY, JSON.stringify(photos));
  };

  // 统一读取入口：优先 IndexedDB，失败时降级到 localStorage。
  const getStoredPhotos = async (cacheKey: string) => {
    try {
      return await useStore<AlbumPhoto[]>('readonly', (store) => store.index('cacheKey').getAll(cacheKey));
    } catch (err) {
      console.error('getStoredPhotos-indexedDb-err', err);
      return readLocalPhotos().filter((photo) => photo.cacheKey === cacheKey);
    }
  };

  // 统一写入入口：移动端 WebView 不支持 IndexedDB 时仍能尽量保留当前业务照片。
  const putStoredPhoto = async (photo: AlbumPhoto) => {
    try {
      await useStore('readwrite', (store) => store.put(photo));
    } catch (err) {
      console.error('putStoredPhoto-indexedDb-err', err);
      const photos = readLocalPhotos();
      const index = photos.findIndex((item) => item.id === photo.id);
      if (index > -1) {
        photos.splice(index, 1, photo);
      } else {
        photos.push(photo);
      }
      writeLocalPhotos(photos);
    }
  };

  // 统一删除入口，确保 IndexedDB/localStorage 两种存储都能走同一套业务逻辑。
  const deleteStoredPhoto = async (id: string) => {
    try {
      await useStore('readwrite', (store) => store.delete(id));
    } catch (err) {
      console.error('deleteStoredPhoto-indexedDb-err', err);
    }
    writeLocalPhotos(readLocalPhotos().filter((photo) => photo.id !== id));
  };

  const deleteStoredPhotosByCacheKey = async (cacheKey: string) => {
    let indexedDbPhotos: AlbumPhoto[] = [];
    try {
      indexedDbPhotos = await useStore<AlbumPhoto[]>('readonly', (store) => store.index('cacheKey').getAll(cacheKey));
    } catch (err) {
      console.error('deleteStoredPhotosByCacheKey-indexedDb-err', err);
    }
    const localPhotos = readLocalPhotos().filter((photo) => photo.cacheKey === cacheKey);
    const photos = [...indexedDbPhotos, ...localPhotos].filter(
      (photo, index, list) => list.findIndex((item) => item.id === photo.id) === index
    );
    await Promise.all(photos.map((photo) => deleteStoredPhoto(photo.id)));
  };

  // 组件初始化和打开相册时清理超过 24 小时的照片，避免弹窗复用时过期数据一直保留。
  const clearExpiredStoredPhotos = async () => {
    const now = Date.now();
    let indexedDbPhotos: AlbumPhoto[] = [];
    try {
      indexedDbPhotos = await useStore<AlbumPhoto[]>('readonly', (store) => store.getAll());
    } catch (err) {
      console.error('clearExpiredStoredPhotos-indexedDb-err', err);
    }
    const localPhotos = readLocalPhotos();
    const expiredPhotos = [...indexedDbPhotos, ...localPhotos]
      .filter((photo, index, list) => list.findIndex((item) => item.id === photo.id) === index)
      .filter((photo) => photo.createdAt && now - photo.createdAt > PHOTO_CACHE_EXPIRE_TIME);
    if (!expiredPhotos.length) return;
    await Promise.all(expiredPhotos.map((photo) => deleteStoredPhoto(photo.id)));
    Array.from(new Set(expiredPhotos.map((photo) => photo.cacheKey).filter(Boolean))).forEach((cacheKey) => notifyAlbumChanged(cacheKey));
  };

  // 当页面长时间不卸载时，也要在最早一张照片到期后主动清理。
  const scheduleExpiredPhotoCleanup = () => {
    if (expirationTimer !== undefined) {
      window.clearTimeout(expirationTimer);
      expirationTimer = undefined;
    }
    const expirationTimes = albumPhotos.value
      .map((photo) => photo.createdAt && photo.createdAt + PHOTO_CACHE_EXPIRE_TIME)
      .filter((time): time is number => Boolean(time));
    if (!expirationTimes.length) return;

    const delay = Math.max(0, Math.min(...expirationTimes) - Date.now()) + 100;
    expirationTimer = window.setTimeout(async () => {
      expirationTimer = undefined;
      try {
        await clearExpiredStoredPhotos();
      } finally {
        await loadAlbumPhotos();
      }
    }, delay);
  };

  const normalizeSource = (data: string | AppPhotoPayload) => {
    if (typeof data === 'string') return data;
    return data.base64 || data.url || data.path || data.message || data.data || '';
  };

  const isBase64Image = (source: string) => source.startsWith('data:image');

  const getPreviewUrl = (source: string) => isBase64Image(source) ? source : getFileAccessHttpUrl(source);

  const getPhotoIdentity = (source: string) => getPreviewUrl(source);

  const createAlbumPhoto = (source: string, status: AlbumPhotoStatus): AlbumPhoto => {
    const now = Date.now();
    return {
      id: `${resolvedCacheKey.value}:${now}:${Math.random().toString(36).slice(2)}`,
      cacheKey: resolvedCacheKey.value,
      biz: props.biz,
      componentId: props.id,
      source,
      previewUrl: getPreviewUrl(source),
      shortPath: source,
      status,
      createdAt: now,
      updatedAt: now,
    };
  };

  const putAlbumPhoto = async (photo: AlbumPhoto) => {
    await putStoredPhoto(photo);
  };

  const deleteAlbumPhoto = async (id: string) => {
    await deleteStoredPhoto(id);
  };

  // 同一页面可能渲染多个上传组件，用事件让相同 businessId 的相册数量实时同步。
  const notifyAlbumChanged = (cacheKey = resolvedCacheKey.value) => {
    window.dispatchEvent(new CustomEvent(ALBUM_CHANGE_EVENT, {
      detail: {
        cacheKey,
      },
    }));
  };

  const loadAlbumPhotos = async () => {
    try {
      let photos = await getStoredPhotos(resolvedCacheKey.value);
      // 兼容旧缓存：之前按组件 id 存的照片，在传入 businessId 后迁移到业务相册。
      if (props.businessId && props.businessId !== props.id) {
        const legacyPhotos = await getStoredPhotos(props.id);
        if (legacyPhotos.length) {
          const migratedPhotos = legacyPhotos.map((photo) => ({
            ...photo,
            cacheKey: resolvedCacheKey.value,
            updatedAt: Date.now(),
          }));
          await Promise.all(migratedPhotos.map((photo) => putAlbumPhoto(photo)));
          photos = [...photos, ...migratedPhotos];
        }
      }
      // 服务端短路径和完整访问地址可能指向同一张图，这里按最终预览地址去重。
      const photoMap = new Map<string, AlbumPhoto>();
      const duplicateIds: string[] = [];
      photos
        .sort((a, b) => a.createdAt - b.createdAt)
        .forEach((photo) => {
          const identity = getPhotoIdentity(photo.shortPath || photo.source);
          if (photoMap.has(identity)) {
            duplicateIds.push(photo.id);
            return;
          }
          photoMap.set(identity, {
            ...photo,
            previewUrl: getPreviewUrl(photo.shortPath || photo.source),
          });
        });
      albumPhotos.value = Array.from(photoMap.values());
      if (duplicateIds.length) {
        await Promise.all(duplicateIds.map((id) => deleteAlbumPhoto(id)));
      }
      scheduleExpiredPhotoCleanup();
    } catch (err) {
      console.error('loadAlbumPhotos-err', err);
      showToast('读取本地相册失败');
    }
  };

  // 拍照回调统一进入相册；上传成功存服务端路径，失败/超时存 base64。
  const savePhotoToAlbum = async (source: string, status: AlbumPhotoStatus) => {
    if (!source) return;
    const previewUrl = getPreviewUrl(source);
    const existed = albumPhotos.value.find((photo) => photo.shortPath === source || photo.source === source || photo.previewUrl === previewUrl);
    const photo = existed
      ? { ...existed, status, source, shortPath: source, previewUrl, updatedAt: Date.now() }
      : createAlbumPhoto(source, status);
    albumPhotos.value = existed
      ? albumPhotos.value.map((item) => item.id === photo.id ? photo : item)
      : [...albumPhotos.value, photo];
    try {
      await putAlbumPhoto(photo);
      notifyAlbumChanged();
    } catch (err) {
      console.error('savePhotoToAlbum-err', err);
      showToast('照片本地缓存失败');
    }
    scheduleExpiredPhotoCleanup();
  };

  const updateAlbumPhoto = async (oldPhoto: AlbumPhoto, source: string, status: AlbumPhotoStatus) => {
    const photo: AlbumPhoto = {
      ...oldPhoto,
      source,
      shortPath: source,
      previewUrl: getPreviewUrl(source),
      status,
      updatedAt: Date.now(),
    };
    albumPhotos.value = albumPhotos.value.map((item) => item.id === photo.id ? photo : item);
    try {
      await putAlbumPhoto(photo);
      notifyAlbumChanged();
    } catch (err) {
      console.error('updateAlbumPhoto-err', err);
      showToast('照片本地缓存更新失败');
    }
    scheduleExpiredPhotoCleanup();
    return photo;
  };

  const removePhotoFromAlbum = async (source: string) => {
    const photo = albumPhotos.value.find((item) => item.shortPath === source);
    if (!photo) return;
    albumPhotos.value = albumPhotos.value.filter((item) => item.id !== photo.id);
    try {
      await deleteAlbumPhoto(photo.id);
      notifyAlbumChanged();
    } catch (err) {
      console.error('removePhotoFromAlbum-err', err);
      showToast('删除本地照片缓存失败');
    }
  };

  const addPhoto = async (data: string | AppPhotoPayload) => {
    const source = normalizeSource(data);
    if (!source) {
      showToast('未获取到照片数据');
      return;
    }
    if (imageObjects.value.length >= props.maxCount) {
      showCamera.value = false;
      showToast(`最多只能上传 ${props.maxCount} 张照片`);
      return;
    }
    const newFile: ImageObject = {
      url: getPreviewUrl(source),
      shortPath: source,
    };
    imageObjects.value = [...imageObjects.value, newFile];
    await savePhotoToAlbum(source, isBase64Image(source) ? 'failed' : 'uploaded');
  };

  const onPhotoTaken = async (uploadedUrl: string) => {
    await addPhoto(uploadedUrl);
    showCamera.value = false;
  };

  // 从系统相册选图：与拍照走同一条上传/离线缓存路径，失败则缓存 base64 等提交前补传
  const uploadGalleryFile = (item: { file: File; content: string }) => {
    return new Promise<void>((resolve) => {
      const params = {
        file: item.file,
        data: { biz: props.biz },
      };
      uploadFile(
        params,
        async (res) => {
          if (res.success) {
            await addPhoto(res.message);
          } else {
            showToast(res.message || '上传失败，照片已缓存');
            await addPhoto(item.content);
          }
          resolve();
        },
        async () => {
          showToast('图片上传超时已缓存，请改善网络环境后提交！');
          await addPhoto(item.content);
          resolve();
        }
      );
    });
  };

  const onGalleryRead = async (files: any) => {
    const list = Array.isArray(files) ? files : [files];
    for (const item of list) {
      if (imageObjects.value.length >= props.maxCount) {
        showToast(`最多只能上传 ${props.maxCount} 张照片`);
        break;
      }
      await uploadGalleryFile(item);
    }
  };

  const pickFromGallery = () => {
    galleryInputRef.value?.click();
  };

  // 上传失败要缓存 base64，所以这里得把 content 读出来
  const readFileAsDataUrl = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error || new Error('读取图片失败'));
      reader.readAsDataURL(file);
    });

  const onGalleryInputChange = async (event: Event) => {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files || []);
    // 重选同一张图也要能触发 change
    input.value = '';
    if (!files.length) return;
    try {
      const list = await Promise.all(files.map(async (file) => ({ file, content: await readFileAsDataUrl(file) })));
      await onGalleryRead(list);
    } catch (err) {
      console.error('onGalleryInputChange-err', err);
      showToast('读取图片失败，请重试');
    }
  };
  const deletePhoto = (index: number) => {
    const newList = [...imageObjects.value];
    const removed = newList[index];
    newList.splice(index, 1);
    imageObjects.value = newList;
    if (removed) removePhotoFromAlbum(removed.shortPath);
  };
  const handelImagePreview = (startIndex: number) => {
    const urls = imageObjects.value.map((f) => f.url);
    showImagePreview({
      images: urls,
      startPosition: startIndex,
      closeable: true,
    });
  };
  const openAlbum = async () => {
    await clearExpiredStoredPhotos();
    await loadAlbumPhotos();
    showAlbum.value = true;
  };

  const isPhotoSelected = (id: string) => selectedPhotoIds.value.includes(id);

  const togglePhotoSelected = (id: string) => {
    selectedPhotoIds.value = isPhotoSelected(id)
      ? selectedPhotoIds.value.filter((item) => item !== id)
      : [...selectedPhotoIds.value, id];
  };

  const cancelAlbumSelect = () => {
    selectedPhotoIds.value = [];
    showAlbum.value = false;
  };

  const previewAlbumPhoto = (startIndex: number) => {
    showImagePreview({
      images: albumPhotos.value.map((photo) => photo.previewUrl),
      startPosition: startIndex,
      closeable: true,
    });
  };

  const base64ToFile = async (base64Str: string, fileName: string) => {
    const res = await fetch(base64Str);
    const blob = await res.blob();
    return new File([blob], fileName, { type: blob.type });
  };

  // 相册确认时复用 RealCamera.confirmPhoto 的上传思路：base64 转 File 后调用 uploadFile。
  const uploadAlbumPhoto = async (photo: AlbumPhoto) => {
    if (!isBase64Image(photo.shortPath)) {
      return photo.shortPath;
    }
    try {
      const file = await base64ToFile(photo.shortPath, 'photo.jpg');
      const params = {
        file,
        data: { biz: props.biz },
      };
      return await new Promise<string>((resolve) => {
        uploadFile(params, (res) => {
          if (res.success) {
            resolve(res.message);
          } else {
            showToast(res.message || '上传失败，照片已缓存');
            resolve(photo.shortPath);
          }
        }, () => {
          showToast('图片上传超时已缓存，请改善网络环境后提交！');
          resolve(photo.shortPath);
        });
      });
    } catch (err) {
      console.error('uploadAlbumPhoto-err', err);
      showToast('上传失败，请重试');
      return photo.shortPath;
    }
  };

  // 确认相册照片后，同步替换当前 v-model 中的 base64/旧路径，避免重复追加。
  const upsertImageObject = (oldSource: string, newSource: string) => {
    const previewUrl = getPreviewUrl(newSource);
    const oldPreviewUrl = getPreviewUrl(oldSource);
    const newList = [...imageObjects.value];
    const oldIndex = newList.findIndex((image) => image.shortPath === oldSource || image.url === oldPreviewUrl);
    const newIndex = newList.findIndex((image) => image.shortPath === newSource || image.url === previewUrl);
    const newFile = {
      url: previewUrl,
      shortPath: newSource,
    };
    if (oldIndex > -1) {
      newList.splice(oldIndex, 1, newFile);
      imageObjects.value = newList;
      return true;
    }
    if (newIndex > -1) {
      newList.splice(newIndex, 1, newFile);
      imageObjects.value = newList;
      return true;
    }
    if (newList.length >= props.maxCount) {
      return false;
    }
    imageObjects.value = [...newList, newFile];
    return true;
  };

  // 对勾选照片执行上传确认；失败照片继续保留本地缓存，成功照片替换为服务端路径。
  const confirmAlbumSelected = async () => {
    const selectedPhotos = albumPhotos.value.filter((photo) => selectedPhotoIds.value.includes(photo.id));
    if (!selectedPhotos.length) {
      showToast('请选择照片');
      return;
    }
    isAlbumConfirming.value = true;
    try {
      for (const photo of selectedPhotos) {
        const uploadedSource = await uploadAlbumPhoto(photo);
        const nextStatus = isBase64Image(uploadedSource) ? 'failed' : 'uploaded';
        const added = upsertImageObject(photo.shortPath, uploadedSource);
        if (!added) {
          showToast(`最多只能上传 ${props.maxCount} 张照片`);
          break;
        }
        await updateAlbumPhoto(photo, uploadedSource, nextStatus);
      }
      selectedPhotoIds.value = [];
      showAlbum.value = false;
    } finally {
      isAlbumConfirming.value = false;
    }
  };

  const confirmClearAlbum = () => {
    showConfirmDialog({
      title: '确认清除相册？',
      message: '将清除当前业务下所有本地缓存照片，清除后不可恢复。',
      confirmButtonText: '清除',
      confirmButtonColor: '#ee0a24',
      cancelButtonText: '取消',
    }).then(() => {
      selectedPhotoIds.value = [];
      clearCachedPhotos(true);
    });
  };

  const getCachedPhotos = async () => {
    await loadAlbumPhotos();
    return albumPhotos.value;
  };

  const normalizePhotoSources = (sources: string | string[] | undefined) => {
    if (!sources) return [];
    const list = Array.isArray(sources) ? sources : sources.split(',');
    return list.map((source) => source?.trim()).filter(Boolean) as string[];
  };

  /** 只删除已成功提交的照片，未使用照片继续在离线相册中保留 24 小时。 */
  const removeCachedPhotos = async (sources: string | string[]) => {
    try {
      const sourceList = normalizePhotoSources(sources);
      if (!sourceList.length) return;

      await loadAlbumPhotos();
      const rawSources = new Set(sourceList);
      const sourceIdentities = new Set(sourceList.map((source) => getPhotoIdentity(source)));
      const removedPhotos = albumPhotos.value.filter((photo) => {
        const source = photo.shortPath || photo.source;
        return rawSources.has(source) || rawSources.has(photo.previewUrl) || sourceIdentities.has(getPhotoIdentity(source));
      });
      if (!removedPhotos.length) return;

      const removedIds = new Set(removedPhotos.map((photo) => photo.id));
      await Promise.all(removedPhotos.map((photo) => deleteAlbumPhoto(photo.id)));
      albumPhotos.value = albumPhotos.value.filter((photo) => !removedIds.has(photo.id));
      selectedPhotoIds.value = selectedPhotoIds.value.filter((id) => !removedIds.has(id));
      scheduleExpiredPhotoCleanup();
      notifyAlbumChanged();
    } catch (err) {
      console.error('removeCachedPhotos-err', err);
      showToast('提交已成功，但本地照片缓存清理失败');
    }
  };

  const clearCachedPhotosByBusinessId = async (businessId: string, clearValue = false) => {
    if (!businessId) {
      showToast('业务ID不能为空');
      return;
    }
    try {
      await deleteStoredPhotosByCacheKey(businessId);
      if (businessId === resolvedCacheKey.value) {
        albumPhotos.value = [];
        scheduleExpiredPhotoCleanup();
      }
      notifyAlbumChanged(businessId);
      if (clearValue && businessId === resolvedCacheKey.value) {
        imageObjects.value = [];
      }
    } catch (err) {
      console.error('clearCachedPhotosByBusinessId-err', err);
      showToast('清除本地相册失败');
    }
  };

  const clearCachedPhotos = async (clearValue = false) => {
    await clearCachedPhotosByBusinessId(resolvedCacheKey.value, clearValue);
  };

  const getAppCallbackName = (id = props.id) => id ? `receiveFromApp${id}` : '';
  const appPhotoReceiver = (data: string | AppPhotoPayload) => {
    console.log(getAppCallbackName());
    addPhoto(data);
  };
  let registeredAppCallbackName = '';

  const unregisterAppCallback = (callbackName = registeredAppCallbackName) => {
    if (callbackName && window[callbackName] === appPhotoReceiver) {
      delete window[callbackName];
    }
    if (callbackName === registeredAppCallbackName) {
      registeredAppCallbackName = '';
    }
  };

  const registerAppCallback = (id = props.id) => {
    const callbackName = getAppCallbackName(id);
    if (!callbackName || callbackName === registeredAppCallbackName) return;
    unregisterAppCallback();
    window[callbackName] = appPhotoReceiver;
    registeredAppCallbackName = callbackName;
  };

  defineExpose({
    id: props.businessId || props.id,
    getCachedPhotos,
    removeCachedPhotos,
    clearCachedPhotos,
    clearCachedPhotosByBusinessId,
    reloadAlbumPhotos: loadAlbumPhotos,
  });

  watch(resolvedCacheKey, async () => {
    selectedPhotoIds.value = [];
    await loadAlbumPhotos();
  });

  watch(
    () => props.id,
    (id, oldId) => {
      unregisterAppCallback(getAppCallbackName(oldId));
      registerAppCallback(id);
    }
  );

  const onAlbumChanged = (event: Event) => {
    const detail = (event as CustomEvent<{ cacheKey: string }>).detail;
    if (detail?.cacheKey === resolvedCacheKey.value) {
      loadAlbumPhotos();
    }
  };

  onMounted(async () => {
    window.addEventListener(ALBUM_CHANGE_EVENT, onAlbumChanged);
    await clearExpiredStoredPhotos();
    await loadAlbumPhotos();
    registerAppCallback();
  })

  onUnmounted(() => {
    if (expirationTimer !== undefined) window.clearTimeout(expirationTimer);
    window.removeEventListener(ALBUM_CHANGE_EVENT, onAlbumChanged);
    unregisterAppCallback();
  })
</script>

<style scoped>
  .real-camera-upload-wrapper {
    width: 100%;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    gap: 10px;
    position: relative;
  }

  .camera-action-row {
    display: flex;
    align-items: center;
    width: 100%;
    gap: 8px;
    flex-wrap: nowrap;
    min-width: 0;
    margin-bottom: 10px;
  }

  .launch-button,
  .album-button,
  .gallery-button {
    flex: 1 1 0;
    min-width: 0;
    max-width: 110px;
    font-size: 14px;
    white-space: nowrap;
  }

  .gallery-input {
    display: none;
  }

  .launch-button :deep(.van-button__content),
  .album-button :deep(.van-button__content),
  .gallery-button :deep(.van-button__content) {
    white-space: nowrap;
  }

  .launch-button :deep(.van-button__text),
  .album-button :deep(.van-button__text),
  .gallery-button :deep(.van-button__text) {
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .image-preview-container {
    position: relative;
    width: 80px;
    height: 80px;
    border-radius: 4px;
    overflow: hidden;
    flex-shrink: 0;
  }

  .uploaded-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    cursor: pointer;
  }

  .delete-icon {
    position: absolute;
    top: 0;
    right: 0;
    color: #fff;
    background-color: rgba(0, 0, 0, 0.6);
    border-radius: 0 0 0 8px;
    padding: 2px;
    font-size: 14px;
    cursor: pointer;
    z-index: 5;
  }

  .full-screen-camera {
    z-index: 10000;
  }

  .album-popup {
    width: min(86vw, 340px);
    height: 420px;
    max-height: 68vh;
    overflow: hidden;
  }

  .album-panel {
    height: 100%;
    display: flex;
    flex-direction: column;
    background: #f7f8fa;
  }

  .album-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    background: #fff;
    border-bottom: 1px solid #ebedf0;
  }

  .album-title {
    color: #323233;
    font-size: 16px;
    font-weight: 600;
    line-height: 22px;
  }

  .album-subtitle {
    margin-top: 2px;
    color: #969799;
    font-size: 12px;
    line-height: 18px;
  }

  .album-close {
    color: #646566;
    font-size: 20px;
    padding: 4px;
  }

  .album-header-actions {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .album-grid {
    flex: 1;
    overflow-y: auto;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
    padding: 12px 12px 72px;
  }

  .album-item {
    position: relative;
    aspect-ratio: 1;
    border-radius: 6px;
    overflow: hidden;
    background: #fff;
  }

  .album-image {
    width: 100%;
    height: 100%;
    display: block;
    object-fit: cover;
  }

  .album-check {
    position: absolute;
    top: 6px;
    right: 6px;
    width: 22px;
    height: 22px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 14px;
    border: 2px solid #fff;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.28);
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.25);
  }

  .album-check.checked {
    border-color: #1989fa;
    background: #1989fa;
  }

  .album-footer {
    position: sticky;
    bottom: 0;
    z-index: 1099;
    display: flex;
    gap: 10px;
    padding: 10px 12px calc(10px + env(safe-area-inset-bottom));
    background: #fff;
    border-top: 1px solid #ebedf0;
  }

  .album-footer-button {
    flex: 1;
  }

  .album-empty {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #969799;
    font-size: 14px;
  }
</style>
