<template>
  <BasicModal v-bind="$attrs" @register="registerModal" wrapClassName="cert-modal" title="我的证书" @ok="exportDataPdf" ok-text="下载" :width="480">
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
        <div :style="render.styleArr[0]" v-if="render.title.checked">{{ render.title.value }}</div>
        <div :style="render.styleArr[1]"
          >姓&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;名：<span>{{ itemData.userName }}</span></div
        >
        <div :style="render.styleArr[2]"
          >性&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;别：<span>{{ itemData.sex }}</span></div
        >
        <div :style="render.styleArr[3]"
          >证书编号：<span>{{ itemData.certNo }}</span></div
        >
        <div :style="render.styleArr[4]" v-if="render.content4?.checked"
          >{{ ['监护人', '其他'].includes(render.certificateType) ? '上岗证号：' : '身份证号：'
          }}<span>{{ ['监护人', '其他'].includes(render.certificateType) ? itemData.workIdNo : itemData.idCard }}</span></div
        >
        <div :style="render.styleArr[5]" v-if="render.content1?.checked"
          >{{ ['监护人', '其他'].includes(render.certificateType) ? '厂&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;部' : '用工单位' }}：<span>{{
            ['监护人', '其他'].includes(render.certificateType) ? itemData.factory : itemData.workUnit
          }}</span></div
        >
        <div :style="render.styleArr[6]" v-if="render.content2?.checked"
          >{{ ['监护人', '其他'].includes(render.certificateType) ? '车&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;间' : '施工单位' }}：<span>{{
            ['监护人', '其他'].includes(render.certificateType) ? itemData.workshop : itemData.constructionUnit
          }}</span></div
        >
        <div :style="render.styleArr[7]" v-if="render.content3?.checked"
          >{{
            ['监护人', '其他'].includes(render.certificateType)
              ? '岗&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;位'
              : '工&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;种'
          }}：<span>{{ ['监护人', '其他'].includes(render.certificateType) ? itemData.team : itemData.workType }}</span></div
        >
        <div v-if="itemData.photo" :style="render.styleArr[8]" style="height: 120px; width: 95px; line-height: 120px; text-align: center">
          <img :src="getFileAccessHttpUrl(itemData.photo)" alt="" />
        </div>
        <div
          :style="render.styleArr[9]"
          v-if="render.qrCode"
          style="background-color: rgb(242, 242, 242); width: 88px; height: 88px; line-height: 88px; text-align: center"
        >
          <img :src="'data:image/png;base64,' + itemData.qrCode" alt="" />
        </div>
        <div :style="render.styleArr[10]"
          >发证单位：<span>{{ render.seal.value ? render.seal.value : 'XXX' }}</span></div
        >
        <div :style="render.styleArr[11]" v-if="render.issueDate.checked"
          >颁发日期：<span>{{ itemData.issueDate }}</span></div
        >
        <div :style="render.styleArr[12]" v-if="render.validDate.checked"
          >有效日期：<span>{{ itemData.certData }}</span></div
        >
        <seal :style="render.styleArr[13]" v-if="render.seal.checked" :value="render.seal.value" />
      </div>
    </div>
  </BasicModal>
</template>
<script lang="ts" setup>
  import { ref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import cert1 from '/@/assets/images/certificate/cert1.png';
  import cert2 from '/@/assets/images/certificate/cert3.png';
  import cert3 from '/@/assets/images/certificate/cert4.png';
  import Seal from '/@/views/studyTraining/resourceManage/certificate/seal.vue';
  import html2canvas from 'html2canvas';
  import jsPDF from 'jspdf';
  import { getFileAccessHttpUrl } from '/@/utils/common/compUtils';
  const itemData: any = ref({});
  const render: any = ref({
    certificateType: '其他',
    name: '',
    type: 'v1',
    certNo: '',
    qrCode: true,
    imgUrl: '',
    styleArr: [
      {
        position: 'absolute',
        top: '90px',
        textAlign: 'center',
        width: '450px',
        fontSize: '26px',
      },
      {
        position: 'absolute',
        top: '190px',
        left: '80px',
      },
      {
        position: 'absolute',
        top: '225px',
        left: '80px',
      },
      {
        position: 'absolute',
        top: '260px',
        left: '80px',
      },
      {
        position: 'absolute',
        top: '295px',
        left: '80px',
      },
      {
        position: 'absolute',
        top: '330px',
        left: '80px',
      },
      {
        position: 'absolute',
        top: '365px',
        left: '80px',
      },
      {
        position: 'absolute',
        top: '400px',
        left: '80px',
      },
      {
        position: 'absolute',
        top: '190px',
        left: '340px',
      },
      {
        position: 'absolute',
        bottom: '130px',
        left: '50px',
      },
      {
        position: 'absolute',
        top: '480px',
        left: '180px',
      },
      {
        position: 'absolute',
        top: '515px',
        left: '180px',
      },
      {
        position: 'absolute',
        top: '550px',
        left: '180px',
      },
      {
        position: 'absolute',
        top: '450px',
        left: '280px',
        color: 'red',
      },
    ],
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
  const imgUrl = ref(cert1);
  //表单赋值
  const [registerModal] = useModalInner((data) => {
    itemData.value = data;
    render.value = data.render;
    // 底图
    if (render.value.imgUrl) {
      imgUrl.value = render.value.imgUrl;
    } else {
      if (data.render.type === 'v1') {
        imgUrl.value = cert1;
      } else if (data.render.type === 'v2') {
        imgUrl.value = cert2;
      } else if (data.render.type === 'v3') {
        imgUrl.value = cert3;
      }
    }
  });
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
      canvas2PDF(canvas);
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
  }
</script>
<style lang="less" scoped>
  :deep(.scroll-container .scrollbar__wrap) {
    margin-bottom: 18px !important;
    overflow: unset;
  }

  :deep(.scrollbar__wrap) {
    height: 100%;
    overflow: unset;
  }

  .left-box {
    position: relative;
    & > div:nth-child(1) {
      width: 450px;
      height: 670px;
    }
    .certificate-img {
      & > div {
        font-size: 15px;
        color: #000;
        font-weight: 600;
        span {
          font-size: 15px;
          color: rgba(0, 0, 0, 0.7);
          font-weight: 400;
        }
      }
    }
  }
</style>
