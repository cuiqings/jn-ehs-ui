<template>
  <div class="app-upload-wrap">
    <van-uploader
      v-model="fileList"
      :multiple="multiple"
      :max-count="maxCount"
      :max-size="300 * 1024 * 1024"
      :after-read="afterRead"
      :accept="accept"
      :capture="capture"
      :disabled="disabled"
      :deletable="!disabled"
      @oversize="onOversize"
      :before-read="beforeRead"
    />
    <!-- <van-uploader
      v-else
      v-model="fileList"
      :multiple="multiple"
      :max-count="maxCount"
      :max-size="300 * 1024 * 1024"
      :after-read="afterRead"
      :accept="accept"
      :disabled="disabled"
      :deletable="!disabled"
      @oversize="onOversize"
      :before-read="beforeRead"
    /> -->
  </div>
</template>

<script lang="ts" setup>
  import { ref, onMounted, watch } from 'vue';
  import { showToast } from 'vant';
  // import { getToken } from '/@/utils/auth';
  import { uploadFile } from '/@/api/common/api';
  import { getFileAccessHttpUrl, dateFormat } from '/@/utils/common/compUtils';
  import { useUserStore } from '/@/store/modules/user';
  const emit = defineEmits(['update:fileList', 'change']);
  const props = defineProps({
    fileList: { type: String, default: '' }, // 例：‘1.png,2.jpg’
    multiple: { type: Boolean, default: false },
    maxCount: { type: Number, default: 10 },
    maxSize: { type: Number, default: 300 }, // 300M
    accept: { type: String, default: 'image/*' },
    disabled: { type: Boolean, default: false },
    watermark: { type: Boolean, default: true }, // 是否加水印
    watermarkText: { type: String, default: '' }, // 水印文字
    capture: { type: String, default: 'camera' }, // 直接吊起相机
    biz: { type: String, default: 'app' },
  });
  const userStore: any = useUserStore();
  let watermarkText = `${dateFormat(new Date(), 'yyyy-MM-dd  hh:mm:ss')} ${userStore.getUserInfo.workNo}上传`;
  if (props.watermarkText) {
    watermarkText = props.watermarkText;
  }
  console.log(props.capture);

  const fileList = ref<any[]>([]);
  onMounted(() => {
    if (props.fileList) {
      props.fileList.split(',').forEach((item) => {
        fileList.value.push({
          url: getFileAccessHttpUrl(item),
          uri: item,
        });
      });
    }
  });

  watch(
    () => fileList.value,
    (v: any) => {
      // 先筛选上传成功的
      const val = v.filter((item) => item.uri).map((item) => item.uri);
      emit('update:fileList', val.join(','));
    },
    {
      deep: true,
    }
  );
  // watch(
  //   () => props.fileList,
  //   (v: any) => {
  //     if(v){
  //       fileList.value = [];
  //       v.split(',').forEach(item => {
  //       fileList.value.push({
  //         url: getFileAccessHttpUrl(item)
  //       })
  //     })
  //   }
  //   }
  // )

  // 文件上传完毕后会触发
  const afterRead = async (file) => {
    // console.log(file,'sssss----')
    if (file instanceof Array && file.length) {
      file.forEach(async (item) => {
        let params = {};
        if (props.watermark) {
          const res = await watermark(item.file);
          params = {
            file: res,
            data: { biz: props.biz },
          };
        } else {
          params = {
            file: item.file,
            data: { biz: props.biz },
          };
        }
        uploadFile(params, (res) => {
          if (res.success) {
            item.status = 'done';
            item.message = '';
            item.objectUrl = '';
            item.content = '';
            item.url = getFileAccessHttpUrl(res.message);
            item.uri = res.message;
          } else {
            showToast(res.message);
            item.status = 'failed';
            item.message = '上传失败';
          }
        });
      });
    } else {
      file.status = 'uploading';
      file.message = '上传中...';
      let params = {};
      if (props.watermark) {
        const res = await watermark(file.file);
        params = {
          file: res,
          data: { biz: 'app' },
        };
      } else {
        params = {
          file: file.file,
          data: { biz: 'app' },
        };
      }
      uploadFile(params, (res) => {
        if (res.success) {
          file.status = 'done';
          file.message = '';
          file.objectUrl = '';
          file.content = '';
          file.url = getFileAccessHttpUrl(res.message);
          file.uri = res.message;
        } else {
          showToast(res.message);
          file.status = 'failed';
          file.message = '上传失败';
        }
        // console.log(fileList.value,'fileList00000-----')
      });
    }
  };

  const onOversize = (file) => {
    console.log(file);
    showToast('文件大小不能超过 300M');
  };
  const beforeRead = (file) => {
    if (file instanceof Array && file.length) {
      // let arr:any=[]
      file.forEach(async (item) => {
        // if (item.type !== 'image/jpeg' && item.type !== 'image/png' && item.type !== 'image/jpg') {
        //   showToast('请选择正确图片格式上传');
        //   return false;
        // }
        // const res = await watermark(item)
        // console.log(res, 'item===')
        // arr.push(res)
        // if(index === file.length-1){
        //   console.log(arr, '00009999===')
        //   return arr
        // }
      });
      return file;
    } else {
      // if (file.type !== 'image/jpeg' && file.type !== 'image/png' && file.type !== 'image/jpg') {
      //   showToast('请选择正确图片格式上传');
      //   return false;
      // }
      return file;
      // return watermark(file)
    }
  };

  const watermark = (file: any) => {
    return new Promise((resolve) => {
      //把文件转换为base64
      fileByBase64(file, async (base64) => {
        // 1.调用方法1： 把文件转换为base64字符串
        // 把文件转换为Canvas
        let tempCanvas = await imgToCanvas(base64); // 2. 调用方法2：把base64转换为Canvas
        // 把水印写入
        const canvas = addWatermark(tempCanvas, watermarkText); //3.调用方法3： 写入水印到Canvas
        // canvas转成img
        const img = convasToImg(canvas, file.type); //4. 调用方法4：把Canvas转换为image文件
        //被canvas转换为文件
        let newFile = base64ToFile(img.src, file.name); //5.调用方法5：被image转换为File文件
        resolve(newFile);
      });
    });
  };

  function fileByBase64(file, callback) {
    let reader = new FileReader();
    // 传入一个参数对象即可得到基于该参数对象的文本内容
    reader.readAsDataURL(file);
    reader.onload = function (e) {
      // target.result 该属性表示目标对象的DataURL
      callback(e.target?.result);
    };
  }

  async function imgToCanvas(base64) {
    // 创建img元素
    const img = document.createElement('img');
    img.setAttribute('src', base64);
    await new Promise((resolve) => (img.onload = resolve));
    // 创建canvas DOM元素，并设置其宽高和图片一样
    const canvas = document.createElement('canvas');
    console.log(img.height);
    console.log(img.width);
    canvas.width = img.width;
    canvas.height = img.height;
    // 坐标(0,0) 表示从此处开始绘制，相当于偏移。
    canvas.getContext('2d')?.drawImage(img, 0, 0);
    return canvas;
  }

  function addWatermark(canvas, text) {
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#fff';
    ctx.font = (ctx.canvas.width / text.length) * 1.2 + 'px Arial';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    // ctx.rotate(45);
    // ctx.rotate((45 * Math.PI) / 180);
    // 加阴影 防止白色背景图看不见字
    ctx.shadowColor = '#000';
    ctx.shadowBlur = '2';
    ctx.fillText(text, 20, 30);
    return canvas;
  }

  function convasToImg(canvas, type) {
    // 新建Image对象，可以理解为DOM
    let image = new Image();
    // canvas.toDataURL 返回的是一串Base64编码的URL
    // 指定格式 PNG
    image.src = canvas.toDataURL(type);
    return image;
  }

  function base64ToFile(urlData, fileName) {
    let arr = urlData.split(',');
    let mime = arr[0].match(/:(.*?);/)[1];
    let bytes = atob(arr[1]); // 解码base64
    let n = bytes.length;
    let ia = new Uint8Array(n);
    while (n--) {
      ia[n] = bytes.charCodeAt(n);
    }
    return new File([ia], fileName, { type: mime });
  }
</script>

<style lang="less" scoped></style>
