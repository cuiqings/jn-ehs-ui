<template>
  <van-dialog v-model:show="show" title="我的证书" show-cancel-button confirmButtonText="下载" @confirm="handleConfirm" @cancel="handleCancel">
    <div class="left-box">
      <div
        id="downLoadPdf"
        class="certificate-img"
        :style="{
          backgroundImage: `url(${imgUrl})`,
          backgroundPosition: 'center center',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
        }"
      >
        <div :style="styleArr[0]" v-if="render.title.checked">{{ render.title.value }}</div>
        <div :style="styleArr[1]"
          >姓{{ '\u3000'.repeat(2) }}名：<span>{{ itemData.userName }}</span></div
        >
        <div :style="styleArr[2]"
          >性{{ '\u3000'.repeat(2) }}别：<span>{{ itemData.sex }}</span></div
        >
        <div :style="styleArr[3]"
          >证书编号：<span>{{ itemData.certNo }}</span></div
        >
        <div :style="styleArr[4]" v-if="render.content4.checked"
          >{{ ['监护人', '其他'].includes(render.certificateType) ? '上岗证号：' : '身份证号：'
          }}<span>{{ ['监护人', '其他'].includes(render.certificateType) ? itemData.workIdNo : itemData.idCard }}</span></div
        >
        <div :style="styleArr[5]" v-if="render.content1.checked"
          >{{ ['监护人', '其他'].includes(render.certificateType) ? '厂' + '\u3000'.repeat(2) + '部：' : '用工单位：'
          }}<span>{{ ['监护人', '其他'].includes(render.certificateType) ? itemData.factory : itemData.workUnit }}</span></div
        >
        <div :style="styleArr[6]" v-if="render.content2.checked"
          >{{ ['监护人', '其他'].includes(render.certificateType) ? '车' + '\u3000'.repeat(2) + '间：' : '施工单位：'
          }}<span>{{ ['监护人', '其他'].includes(render.certificateType) ? itemData.workshop : itemData.constructionUnit }}</span></div
        >
        <div :style="styleArr[7]" v-if="render.content3.checked"
          >{{ ['监护人', '其他'].includes(render.certificateType) ? '岗' + '\u3000'.repeat(2) + '位：' : '工' + '\u3000'.repeat(2) + '种：'
          }}<span>{{ ['监护人', '其他'].includes(render.certificateType) ? itemData.team : itemData.workType }}</span></div
        >
        <div v-if="itemData.photo" :style="styleArr[8]" style="height: 84px; width: 60px; line-height: 84px; text-align: center">
          <img :src="getFileAccessHttpUrl(itemData.photo)" alt="" />
        </div>
        <div
          :style="styleArr[9]"
          v-if="itemData.qrCode"
          style="background-color: rgb(242, 242, 242); width: 60px; height: 60px; line-height: 60px; text-align: center"
        >
          <img :src="'data:image/png;base64,' + itemData.qrCode" alt="" />
        </div>
        <div :style="styleArr[10]"
          >发证单位：<span>{{ render.seal.value ? render.seal.value : 'XXX' }}</span></div
        >
        <div :style="styleArr[11]" v-if="render.issueDate.checked"
          >颁发日期：<span>{{ itemData.issueDate }}</span></div
        >
        <div :style="styleArr[12]" v-if="render.validDate.checked"
          >有效日期：<span>{{ itemData.certData }}</span></div
        >
        <seal :style="styleArr[13]" v-if="render.seal.checked" :value="render.seal.value" />
      </div>
    </div>
  </van-dialog>
</template>

<script lang="ts" setup>
  import { ref } from 'vue';
  import html2canvas from 'html2canvas';
  import jsPDF from 'jspdf';
  import cert1 from '/@/assets/images/certificate/cert1.png';
  import cert2 from '/@/assets/images/certificate/cert3.png';
  import cert3 from '/@/assets/images/certificate/cert4.png';
  import Seal from '/@/views/studyTraining/resourceManage/certificate/seal.vue';
  import { getFileAccessHttpUrl } from '/@/utils/common/compUtils';
  import uni from '@dcloudio/uni-webview-js';
  import { uploadFile } from '/@/api/common/api';
  import { showToast } from 'vant';
  const render: any = ref({
    certificateType: '其他',
    name: '',
    type: 'v1',
    certNo: '',
    qrCode: true,
    imgUrl: '',
    title: {
      value: '',
      checked: true,
    },
    seal: {
      value: '',
      checked: true,
    },
    issueDate: {
      value: '',
      checked: true,
    },
    validDate: {
      value: '',
      checked: true,
    },
    content1: {
      value: '',
      checked: true,
    },
    content2: {
      value: '',
      checked: true,
    },
    content3: {
      value: '',
      checked: true,
    },
    content4: {
      value: '',
      checked: true,
    },
  });
  const styleArr: any = ref([
    {
      position: 'absolute',
      top: '75px',
      textAlign: 'center',
      width: '300px',
      fontSize: '16px',
    },
    {
      position: 'absolute',
      top: '150px',
      left: '45px',
    },
    {
      position: 'absolute',
      top: '175px',
      left: '45px',
    },
    {
      position: 'absolute',
      top: '200px',
      left: '45px',
    },
    {
      position: 'absolute',
      top: '225px',
      left: '45px',
    },
    {
      position: 'absolute',
      top: '250px',
      left: '45px',
    },
    {
      position: 'absolute',
      top: '275px',
      left: '45px',
    },
    {
      position: 'absolute',
      top: '300px',
      left: '45px',
    },
    {
      position: 'absolute',
      top: '150px',
      left: '230px',
    },
    {
      position: 'absolute',
      bottom: '70px',
      left: '30px',
    },
    {
      position: 'absolute',
      top: '335px',
      left: '110px',
    },
    {
      position: 'absolute',
      top: '360px',
      left: '110px',
    },
    {
      position: 'absolute',
      top: '385px',
      left: '110px',
    },
    {
      position: 'absolute',
      top: '300px',
      left: '180px',
      fontSize: '12px',
      width: 100,
      height: 100,
      color: 'red',
    },
  ]);
  const imgUrl = ref(cert1);
  const itemData: any = ref({});
  const show = ref(false);
  function init(data, is) {
    show.value = is;
    Object.assign(render.value, data.render);
    itemData.value = data;
    // 底图
    if (render.value.imgUrl) {
      imgUrl.value = render.value.imgUrl;
    } else {
      if (render.value.type === 'v1') {
        imgUrl.value = cert1;
      } else if (render.value.type === 'v2') {
        imgUrl.value = cert2;
      } else if (render.value.type === 'v3') {
        imgUrl.value = cert3;
      }
    }
    updateContentTop();
  }
  function exportDataPdf() {
    const el: any = document.getElementById('downLoadPdf');
    html2canvas(el, {
      scale: 3, // 降低缩放比例以减小文件大小
      useCORS: true, // 允许canvas画布内 可以跨域请求外部链接图片, 允许跨域请求。
      allowTaint: true,
      logging: false, // 打印日志用的 可以不加默认为false
      backgroundColor: '#ffffff',
      // 添加压缩选项
      imageTimeout: 0,
      removeContainer: true,
    }).then((canvas) => {
      uni.getEnv(async (res) => {
        if (res.h5) {
          // H5环境下生成PDF
          canvas2PDF(canvas);
        } else {
          // 非H5环境下直接下载图片
          downloadAsImage(canvas);
        }
      });
    });
    const canvas2PDF = (canvas) => {
      const contentWidth = canvas.width;
      const contentHeight = canvas.height;
      // A4纸的尺寸[595.28,841.89]
      const pageWidth = 595.28;
      const pageHeight = 841.89;
      // 计算图片在PDF中的尺寸，确保适应一页
      let imgWidth = pageWidth;
      let imgHeight = (pageWidth / contentWidth) * contentHeight;
      // 如果高度超过页面高度，按比例缩放
      if (imgHeight > pageHeight) {
        const scale = pageHeight / imgHeight;
        imgWidth = imgWidth * scale;
        imgHeight = pageHeight;
      }
      // 计算居中位置
      const x = (pageWidth - imgWidth) / 2;
      const y = (pageHeight - imgHeight) / 2;
      // 使用压缩的JPEG格式，质量设置为0.8以减小文件大小
      const pageData = canvas.toDataURL('image/jpeg', 0.8);
      const pdf = new jsPDF('p', 'pt', 'a4');
      // 只添加一页，居中显示
      pdf.addImage(pageData, 'JPEG', x, y, imgWidth, imgHeight);
      // 保存文件
      pdf.save(`${itemData.value.userName}-${render.value.title.value}.pdf`);
    };
    function dataURLtoBlob(dataurl) {
      const arr = dataurl.split(',');
      const mime = arr[0].match(/:(.*?);/)[1];
      const bstr = atob(arr[1]); // 解码 base64
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      return new Blob([u8arr], { type: mime });
    }
    const downloadAsImage = (canvas) => {
      const pageData = canvas.toDataURL('image/jpeg', 0.8);
      const blob = dataURLtoBlob(pageData);
      // 生成文件名
      const fileName = `${itemData.value.userName}-${render.value.title.value}.jpeg`;
      // 上传文件到服务器
      uploadFile(
        {
          file: blob,
          filename: fileName,
          data: {
            biz: 'certificate',
          },
        },
        (res) => {
          if (res && res.success) {
            // 同时发送到 uni webView 进行下载
            uni.webView.postMessage({
              data: {
                action: 'bas64Download',
                params: {
                  url: getFileAccessHttpUrl(res.message),
                  name: fileName,
                },
              },
            });
          } else {
            showToast('证书下载失败');
          }
        }
      );
    };
  }
  const updateContentTop = () => {
    // 需要自上而下排列的 key 及其 styleArr 下标
    const topDownKeys = [
      { key: 'certNo', idx: 3 },
      { key: 'content4', idx: 4 },
      { key: 'content1', idx: 5 },
      { key: 'content2', idx: 6 },
      { key: 'content3', idx: 7 },
    ];

    // 需要自下而上排列的 key 及其 styleArr 下标
    const bottomUpKeys = [
      { key: 'seal', idx: 10 },
      { key: 'issueDate', idx: 11 },
      { key: 'validDate', idx: 12 },
    ];

    const topDownBaseTop = 200;
    const bottomUpBaseTop = 385;
    const gap = 25;

    // 处理自上而下的字段
    const topDownCheckedArr = topDownKeys.filter((item) => render.value[item.key]?.checked);
    topDownCheckedArr.splice(0, 0, { key: 'certNo', idx: 3 });
    // 从上往下分配 top
    topDownCheckedArr.forEach((item, order) => {
      const top = topDownBaseTop + gap * order;
      styleArr.value[item.idx].top = `${top}px`;
    });

    // 处理自下而上的字段
    const bottomUpCheckedArr = bottomUpKeys.filter((item) => render.value[item.key]?.checked);
    // 从下往上分配 top
    bottomUpCheckedArr.forEach((item, order) => {
      const top = bottomUpBaseTop - gap * (bottomUpCheckedArr.length - 1 - order);
      styleArr.value[item.idx].top = `${top}px`;
    });

    // 隐藏的项
    topDownKeys.forEach((item) => {
      if (!render.value[item.key]?.checked && item.key !== 'certNo') {
        styleArr.value[item.idx].top = '-9999px';
      }
    });

    bottomUpKeys.forEach((item) => {
      if (!render.value[item.key]?.checked) {
        styleArr.value[item.idx].top = '-9999px';
      }
    });
  };
  function handleConfirm() {
    exportDataPdf();
  }
  function handleCancel() {
    show.value = false;
  }
  defineExpose({
    init,
  });
</script>
<style lang="less" scoped>
  .left-box {
    // 水平居中
    display: flex;
    justify-content: center;
    padding: 10px;
    position: relative;

    // font-size: 10px;
    & > div:nth-child(1) {
      width: 355px;
      height: 450px;
    }
    .certificate-img {
      & > div {
        font-size: 11px;
        color: #000;
        font-weight: 600;
        span {
          font-size: 11px;
          color: rgba(0, 0, 0, 0.7);
          font-weight: 400;
        }
      }
    }
  }
</style>
