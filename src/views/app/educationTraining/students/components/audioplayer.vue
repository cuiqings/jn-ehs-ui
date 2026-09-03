<template>
    <div :id="id"> </div>
  </template>
  <script lang="ts" name="playedu-player" setup>
    import 'xgplayer/dist/index.min.css';
    import Player from 'xgplayer';
    import { onMounted, ref, onBeforeUnmount, nextTick, watchEffect } from 'vue';
    import PlayerFullscreenIcon from '/@/assets/player/fullscreen.svg';
    import PlayerExitFullscreenIcon from '/@/assets/player/exitfullscreen.svg';
    import PlayerPlayIcon from '/@/assets/player/play.svg';
    import PlayerPauseIcon from '/@/assets/player/pause.svg';
    import PlayerVolumeLargeIcon from '/@/assets/player/volumelarge.svg';
    import PlayerVolumeSmallIcon from '/@/assets/player/volumesmall.svg';
    import PlayerVolumeMuteIcon from '/@/assets/player/volumemuted.svg';
    import PlayerStartPlayIcon from '/@/assets/player/startplay.svg';
    import PlayerStartPauseIcon from '/@/assets/player/startpause.svg';
    import { getFileAccessHttpUrl } from '/@/utils/common/compUtils';
    const emits = defineEmits(['start', 'pause', 'ended']);
    const props = defineProps({
      id: {
        type: String,
        default: () => '',
      },
      // 已观看秒数
      watchedSeconds: {
        type: Number,
        default: 0,
      },
      height: {
        type: Number,
        default: 400,
      },
      //是否可以拖拽播放
      draggable: {
        type: Boolean,
        default: false,
      },
      // 播放地址
      url: {
        type: String,
        default: () => '',
      },
      onTimeupdate: {
        type: Function,
      },
      currentTime: {
        type: Number,
        default: 0
      }
    });
    const player: any = ref(null);
    const refLocalPlayedTime = ref(props.watchedSeconds || 0);
    watchEffect(() => {
      if (props.url.length > 0) {
        nextTick(() => {
          player.value = new Player({
            id: props.id, //元素id
            width: '100%',
            height: props.height,
            lang: 'zh', //设置中文
            autoplay: false, //自动播放
            miniprogress: true,
            fitVideoSize: 'fixed',
            nullUrlStart: true,
            //视频地址
            url: getFileAccessHttpUrl(props.url),
            // 图标替换
            icons: {
              play: PlayerPlayIcon,
              pause: PlayerPauseIcon,
              fullscreen: PlayerFullscreenIcon,
              exitFullscreen: PlayerExitFullscreenIcon,
              volumeMuted: PlayerVolumeMuteIcon,
              volumeSmall: PlayerVolumeSmallIcon,
              volumeLarge: PlayerVolumeLargeIcon,
              startPlay: PlayerStartPlayIcon,
              startPause: PlayerStartPauseIcon,
            },
            poster: '', // 视频封面
            ignores: ['replay', 'fullscreen'], // 禁用控件
            // 内联模式
            playsinline: true,
            'x5-playsinline': true,
            'x5-video-orientation': 'portraint',
            // 进度条配置
            progress: {
              closeMoveSeek: props.draggable, //是否可以拖拽
            },
            // 记忆播放
            lastSee: {
              duration: props.watchedSeconds,
            },
            keyShortcut: props.draggable, // 禁止键盘快进
          });
          player.value.currentTime = props.currentTime;
          // 监听播放进度
          player.value.on('timeupdate', () => {
            // 进度时间
            let currentTime = parseInt(player.value.video.currentTime);
            // // 逻辑：当禁止拖拽播放下，如果播放的最新秒数减去已看秒数大于2则认定为拖拽播放
            // if (!props.draggable && currentTime - refLocalPlayedTime.value > 2 && currentTime > props.watchedSeconds) {
            //   player.value.seek(refLocalPlayedTime.value >= props.watchedSeconds ? refLocalPlayedTime.value : props.watchedSeconds);
            //   message.info('禁止拖拽播放！');
            //   // 此次拖拽无效
            //   return;
            // } else {
            //   refLocalPlayedTime.value = currentTime;
            // }
  
            // props.onTimeupdate && props.onTimeupdate(currentTime);
          });
          // 监听开始播放
          player.value.on('play', () => {
            emits('start');
          })
          // 监听暂停播放
          player.value.on('pause', () => {
            emits('pause');
          })
          // // 监听播放结束
          player.value.on('ended', () => {
            emits('ended');
          //   // 结尾时间
          //   const duration = parseInt(player.value.video.duration);
          //   if (!props.draggable && duration - refLocalPlayedTime.value > 2) {
          //     player.value.seek(refLocalPlayedTime.value >= props.watchedSeconds ? refLocalPlayedTime.value : props.watchedSeconds);
          //     message.info('禁止拖拽播放！');
          //     // 此次拖拽无效
          //     return;
          //   }
          });
        });
      }
    });
    onMounted(() => {});
    onBeforeUnmount(() => {
      if (player.value) {
        player.value.destroy();
        player.value = null;
      }
    });
    
    const currentTime = () => {
      return player.value.currentTime;
    }
  
    defineExpose({
      currentTime
    })
  </script>
  <style lang="less"></style>
