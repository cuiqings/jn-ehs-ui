<template>
  <div :id="id"> </div>
</template>
<script lang="ts" name="playedu-player" setup>
  import 'xgplayer/dist/index.min.css';
  import HlsPlugin from 'xgplayer-hls';
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
  const emits = defineEmits(['start', 'pause', 'ended', 'timeupdate']);
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
    type: {
      type: String,
      default: 'm3u8',
    },
    currentTime: {
      type: Number,
      default: 0,
    },
    deviceType: {
      type: String,
      defalut: 'pc',
    },
  });
  const player: any = ref(null);
  const maxLastTime = ref(props.currentTime || 0);
  watchEffect(() => {
    if (props.url && props.url.length > 0) {
      nextTick(() => {
        // 判断为移动端
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        player.value = new Player({
          id: props.id, //元素id
          width: '100%',
          height: props.height,
          lang: 'zh', //设置中文
          autoplay: false, //自动播放
          miniprogress: true,
          fitVideoSize: 'fixed',
          screenShot: false, // 开启截图功能
          nullUrlStart: true,
          closeVideoTouch: true,
          //视频地址
          url: getFileAccessHttpUrl(props.url),
          playbackRate: [0.5, 0.75, 1, 1.5, 2], //传入倍速可选数组
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
          fullscreen: {
            useCssFullscreen: !isMobile, // 使用网页内全屏替换全屏效果
            rotateFullscreen: isMobile,
            position: 'controlsLeft', // 按钮移动到控制栏左侧
          },
          poster: '', // 视频封面
          // plugins: [HlsPlugin], // 启用 HLS 插件
          ignores: ['replay', 'cssfullscreen'], // 禁用控件
          // 内联模式
          playsinline: true,
          'x5-playsinline': true,
          'x5-video-orientation': 'portraint',
          // 进度条配置
          progress: {
            isDragingSeek: props.draggable,
            // closeMoveSeek: props.draggable, //是否可以拖拽
          },
          // 移动端禁止快进设置
          // domEventType: props.draggable && props.deviceType == 'h5' ? 'mouse' : 'compatible',
          // disableProgress: props.draggable,
          // 记忆播放
          lastSee: {
            duration: props.watchedSeconds,
          },
          keyShortcut: props.draggable, // 禁止键盘快进
        });
        
        player.value.once('loadedmetadata',()=>{
            if (props.currentTime > 0) {
              // player.value.seek(props.currentTime);
              player.value.currentTime = props.currentTime;
            }
        })
        
        // 监听播放进度
        player.value.on('timeupdate', () => {
          // 进度时间
          let curTime = player.value.currentTime;
          if (props.draggable) {
            if (curTime > maxLastTime.value && curTime - maxLastTime.value > 0.5) {
              player.value.currentTime = maxLastTime.value;
            } else {
              // if (curTime > maxLastTime.value) {
                maxLastTime.value = Math.ceil(curTime);
              // }
            }
          } else {
            maxLastTime.value = Math.ceil(curTime);
          }
          emits('timeupdate', maxLastTime.value);
        });
        // 监听开始播放
        player.value.on('play', () => {
          emits('start');
        });
        // 监听暂停播放
        player.value.on('pause', () => {
          emits('pause');
        });
        // 监听播放结束
        player.value.on('ended', () => {
          emits('ended');
        });
        player.value.usePluginHooks('progress', 'dragstart', (plugin, event, data) => {
          if (data.currentTime > maxLastTime.value && props.draggable) {
            return false;
          }
          return true;
        });

        player.value.usePluginHooks('progress', 'drag', (plugin, event, data) => {
          if (data.currentTime > maxLastTime.value && props.draggable) {
            return false;
          }
          return true;
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
  // 暂停
  const pause = () => {
    player.value.pause();
  };
  // 播放
  const play = () => {
    player.value.play();
  };
  // 跳播
  const seek = (time: number) => {
    player.value.seek(time);
  };

  const currentTime = () => {
    if (player.value) {
      return player.value.currentTime < maxLastTime.value ? maxLastTime.value : player.value.currentTime;
    }
    return 0;
  };

  defineExpose({
    play,
    pause,
    seek,
    currentTime,
    maxLastTime,
    player, // Directly expose the player instance
  });
</script>
<style lang="less"></style>
