<template>
  <BasicDrawer v-bind="$attrs" @register="registerDrawer" title="查看" width="800px" destroyOnClose>
    <a-modal :visible="previewVisible" :footer="null" @cancel="handleCancel">
      <img alt="example" style="width: 100%" :src="previewImage" />
    </a-modal>
    <div style="float: right; margin-right: 10px">
      <a-button type="primary" @click="exportDataPdf()" preIcon="ant-design:plus-outlined">下载</a-button>
    </div>
    <div id="downLoadPdf">
      <a-row style="text-align: center; margin-right: 90px">
        <a-col :span="4">
          <img src="/resource/img/logo.png" style="width: 50px; height: 50px" alt="" />
        </a-col>
        <a-col :span="20">
          <div class="STYLE1">中信重工公司</div>
          <div class="STYLE2">{{ ehsNoticeInfoForm.ehsNoticeInfo.title }}{{ typeName }}</div>
        </a-col>
      </a-row>
      <a-row style="float: right; margin-right: 25px">
        <a-col :span="24">
          <div class="STYLE3"> 编号: {{ ehsNoticeInfoForm.ehsNoticeInfo.noticeNo }}</div>
        </a-col>
      </a-row>

      <table
        width="762"
        cellpadding="0"
        cellspacing="0"
        bordercolor="#000000"
        style="margin: auto; margin-top: 25px; border-collapse: collapse; table-layout: fixed; border: 2px solid #000"
      >
        <tbody>
          <tr style="height: 50px; border: 1px solid #000">
            <td colspan="13" class="STYLE3" style="text-align: left"> {{ ehsNoticeInfoForm.ehsNoticeInfo.receiveOrgName }}: </td>
          </tr>
          <tr>
            <td v-if="type1 || type4" colspan="13" class="STYLE3" style="font-weight: normal; text-align: left">
              <div class="STYLE3">
                {{ typeNameTip }}
              </div>
              <div
                v-for="(item, index) in ehsNoticeInfoForm.ehsNoticeInfo.enpInfo"
                :key="item.id"
                style="margin-bottom: 8px; margin-left: 10px"
                align="baseline"
              >
                <a-row>
                  <a-form-item :name="['enpInfo', index, 'problemContent']">
                    <span>{{ index + 1 }}.{{ item.problemContent }}</span>
                  </a-form-item>
                </a-row>
                <a-row>
                  <a-upload
                    list-type="picture-card"
                    :headers="headers"
                    v-model:file-list="item.reviewImgList"
                    :max-count="10"
                    disabled
                    @preview="handlePreview"
                  />
                </a-row>
              </div>
            </td>
            <td v-if="type2 || type3 || type5" colspan="6" class="STYLE3" style="font-weight: normal; text-align: left">
              <div class="STYLE3">
                {{ typeNameTip }}
              </div>
              <div style="margin-bottom: 8px; margin-left: 10px" align="baseline">
                <a-form-item label="" :style="'width:738px;margin-left: 10px;height:' + noticeContentHeight + 'px'">
                  {{ ehsNoticeInfoForm.ehsNoticeInfo.noticeContent }}
                </a-form-item>
              </div>
            </td>
          </tr>
          <tr v-if="type1 || type2 || type3 || type4" style="height: 200px; border: 1px solid #000">
            <td colspan="2" class="STYLE3" style="text-align: center; border: 1px solid #000">整改要求</td>
            <td colspan="12" style="text-align: left">
              <a-row>
                {{ demandName }}
              </a-row>
              <a-row>
                {{ ehsNoticeInfoForm.ehsNoticeInfo.content }}
              </a-row>
            </td>
          </tr>
          <tr v-if="type1 || type2 || type3 || type4" style="height: 50px; border: 1px solid #000">
            <td colspan="2" class="STYLE3" style="text-align: center; border: 1px solid #000">整改期限</td>
            <td colspan="12" class="STYLE3" style="font-weight: normal; text-align: left">{{ ehsNoticeInfoForm.ehsNoticeInfo.endDt }}</td>
          </tr>
          <tr v-if="type1 || type2 || type3 || type4" style="height: 160px; border: 1px solid #000">
            <td colspan="7" style="text-align: left; border: 1px solid #000">
              <div class="STYLE3" style="margin-top: 5px; margin-left: 5px"> 签发人签字： </div>
              <div style="width: 30px; height: 30px; margin-left: 15px">
                <a-upload
                  list-type="picture-card"
                  :headers="headers"
                  v-model:file-list="signatureImg"
                  :max-count="10"
                  disabled
                  @preview="handlePreview"
                />
              </div>
              <div style="float: right; margin-top: 70px; margin-right: 10px">
                {{
                  ehsNoticeInfoForm.ehsNoticeInfo.initiatorTime != ''
                    ? dayjs(ehsNoticeInfoForm.ehsNoticeInfo.initiatorTime).format('YYYY年 MM月 DD日')
                    : '年  月  日'
                }}
              </div>
            </td>
            <td colspan="7" style="text-align: left; border: 1px solid #000">
              <div class="STYLE3" style="margin-top: 5px; margin-left: 5px"> 接收单位签字： </div>
              <div style="width: 30px; height: 30px; margin-left: 15px">
                <a-upload
                  list-type="picture-card"
                  :headers="headers"
                  v-model:file-list="recipientSignImg"
                  :max-count="10"
                  disabled
                  @preview="handlePreview"
                />
              </div>
              <div style="float: right; margin-top: 70px; margin-right: 10px">
                {{
                  ehsNoticeInfoForm.ehsNoticeInfo.receiveTime != ''
                    ? dayjs(ehsNoticeInfoForm.ehsNoticeInfo.receiveTime).format('YYYY年 MM月 DD日')
                    : '年  月  日'
                }}
              </div>
            </td>
          </tr>
          <tr v-if="type1 || type2 || type3 || type4" style="height: 100px; border: 1px solid #000">
            <td colspan="2" class="STYLE3" style="text-align: center; border: 1px solid #000">整改反馈</td>
            <td colspan="12">
              <div v-for="(item, index) in noticeModel.correctionList" :key="item.id">
                <div> 第{{ index + 1 }}次整改反馈： </div>
                <div>
                  &nbsp;
                  {{ item.correctionFeedback }}
                </div>
                <div :style="{ position: 'relative', 'min-height': index + 1 == noticeModel.correctionList.length ? '180px' : '0' }">
                  <div style="display: inline-block">
                    <a-upload
                      list-type="picture-card"
                      :headers="headers"
                      v-model:file-list="item.img"
                      :max-count="10"
                      @preview="handlePreview"
                      disabled
                    />
                  </div>
                </div>
              </div>
              <div style="width: 240px; margin-bottom: 10px; margin-right: 20px">
                <div style="float: right; margin-right: -295px">
                  签字：
                  <a-upload
                    list-type="picture-card"
                    :headers="headers"
                    v-model:file-list="correctorSignImg"
                    :max-count="10"
                    disabled
                    @preview="handlePreview"
                  />
                </div>
                <div style="float: right; margin-right: -291px; margin-top: 137px; margin-bottom: 10px">
                  {{
                    ehsNoticeInfoForm.ehsNoticeInfo.correctorTime != ''
                      ? dayjs(ehsNoticeInfoForm.ehsNoticeInfo.correctorTime).format('YYYY年 MM月 DD日')
                      : '年  月  日'
                  }}
                </div>
              </div>
            </td>
          </tr>
          <tr v-if="type1 || type2 || type3 || type4" style="height: 100px; border: 1px solid #000">
            <td colspan="2" class="STYLE3" style="text-align: center; border: 1px solid #000">复查结果</td>
            <td colspan="12">
              <div v-for="(item, index) in noticeModel.correctionList" :key="item.id">
                <div> 第{{ index + 1 }}次复查结果： </div>
                <div>
                  &nbsp;
                  {{ item.reviewOpinion }}
                </div>
                <div :style="{ position: 'relative', 'min-height': index + 1 == noticeModel.correctionList.length ? '180px' : '0' }">
                  <div style="display: inline-block">
                    <a-upload
                      list-type="picture-card"
                      :headers="headers"
                      v-model:file-list="item.reviewImg"
                      :max-count="10"
                      @preview="handlePreview"
                      disabled
                    />
                  </div>
                </div>
              </div>
              <div style="width: 240px; margin-bottom: 10px; margin-right: 20px">
                <div style="float: right; margin-right: -295px">
                  签字：
                  <a-upload
                    list-type="picture-card"
                    :headers="headers"
                    v-model:file-list="reviewSignImg"
                    :max-count="10"
                    @preview="handlePreview"
                    disabled
                  />
                </div>
                <div style="float: right; margin-right: -291px; margin-top: 137px; margin-bottom: 10px">
                  {{
                    ehsNoticeInfoForm.ehsNoticeInfo.reviewTime != ''
                      ? dayjs(ehsNoticeInfoForm.ehsNoticeInfo.correctorTime).format('YYYY年 MM月 DD日')
                      : '年  月  日'
                  }}
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </BasicDrawer>
</template>

<script lang="ts" setup>
  import { ref, reactive } from 'vue';
  import { getToken } from '/@/utils/auth';
  import { picPreviewUrl, previewFile } from '/@/api/common/api';
  import dayjs, { Dayjs } from 'dayjs';
  import { BasicDrawer, useDrawerInner } from '/src/components/Drawer';
  import html2canvas from 'html2canvas';
  import jsPDF from 'jspdf';
  import { defHttp } from '/@/utils/http/axios';
  import { render } from '/@/utils/common/renderUtils';
  import { SelectProps, UploadProps } from 'ant-design-vue';
  import { getFileAccessHttpUrl } from '/@/utils/common/compUtils';
  const emit = defineEmits(['register']);
  //传参接口对象
  interface EhsNoticeProblem {
    id: string;
    problemContent: string;
    img: string;
    reviewImgList: any;
  }
  interface EhsNoticeInfo {
    id: string;
    orgId: string;
    orgCode: string;
    orgName: string;
    entryMethod: string;
    title: string;
    type: string;
    noticeNo: string;
    receiveOrgName: string;
    receiveOrgId: any;
    receiveUserId: any;
    receiveUserName: string;
    noticeContent: string;
    content: string;
    attachment: string;
    endDt: string;
    auditorId: any;
    auditorName: any;
    signature: string;
    status: string;
    initiatorTime: string;
    enpInfo: EhsNoticeProblem[];
    receiveTime: string;
    correctorTime: string;
    reviewTime: string;
  }

  const ehsNoticeInfoForm = reactive<{ ehsNoticeInfo: EhsNoticeInfo }>({
    ehsNoticeInfo: {
      id: '',
      orgId: '',
      orgCode: '',
      orgName: '',
      entryMethod: '1',
      title: '',
      type: '',
      noticeNo: '',
      receiveOrgName: '',
      receiveOrgId: null,
      receiveUserId: null,
      receiveUserName: '',
      content: '',
      noticeContent: '',
      attachment: '',
      endDt: '',
      auditorId: null,
      auditorName: null,
      signature: '',
      status: '',
      initiatorTime: '',
      enpInfo: [] as any,
      receiveTime: '',
      correctorTime: '',
      reviewTime: '',
    },
  });
  const headers = { 'X-Access-Token': getToken() };
  const previewVisible = ref(false);
  const previewImage = ref('');
  const previewTitle = ref('');
  const dateFormat = 'YYYY-MM-DD';
  const endDt = ref<Dayjs>();
  const visibleNotice = ref<boolean>(false);
  const type1 = ref(true);
  const type2 = ref(false);
  const type3 = ref(false);
  const type4 = ref(false);
  const type5 = ref(false);
  const noticeContentHeight = ref(400);
  const typeName = ref('');
  const demandName = ref('');
  const typeNameTip = ref('');
  let fileList = ref<UploadProps['fileList']>([]);
  let correctorSignImg = ref<UploadProps['fileList']>([]);
  let reviewSignImg = ref<UploadProps['fileList']>([]);
  let recipientSignImg = ref<UploadProps['fileList']>([]);
  let signatureImg = ref<UploadProps['fileList']>([]);
  const noticeInfoType = ref<SelectProps['options']>([]);
  const buttonAddHeight = ref(0);
  let correctionList;
  const noticeModel = reactive({
    correctionList: [],
  });
  const noticeNo = ref('');
  const [registerDrawer, { setDrawerProps, closeDrawer }] = useDrawerInner(async (data) => {
    setDrawerProps({ confirmLoading: false });
    console.log('useDrawerInner data', data);
    noticeNo.value = data.noticeNo;
    // 通过noticeNo查询数据
    defHttp.get({ url: '/notice/ehsNoticeInfo/getByNoticeNo', params: { noticeNo: data.noticeNo } }).then((res) => {
      console.log('useDrawerInner data', res);
      showViewModal(res);
    });
  });
  function showViewModal(record: Recordable) {
    if (record.orgCode == '' || record.orgCode == null) {
      record.isOther = '1';
    } else {
      record.isOther = '0';
    }

    ehsNoticeInfoForm.ehsNoticeInfo = {
      id: '',
      orgId: '',
      orgCode: '',
      orgName: '',
      entryMethod: '1',
      title: '',
      type: '',
      noticeNo: '',
      receiveOrgName: '',
      receiveOrgId: null,
      receiveUserId: null,
      receiveUserName: '',
      content: '',
      noticeContent: '',
      attachment: '',
      endDt: '',
      auditorId: null,
      auditorName: null,
      signature: '',
      status: '',
      initiatorTime: '',
      enpInfo: [] as any,
      receiveTime: '',
      correctorTime: '',
      reviewTime: '',
    };

    Object.keys(ehsNoticeInfoForm.ehsNoticeInfo).forEach((item) => {
      ehsNoticeInfoForm.ehsNoticeInfo[item] = record[item] ? record[item] : '';
    });
    ehsNoticeInfoForm.ehsNoticeInfo.enpInfo = [];
    const imgList = record.enpInfo;
    if (imgList.length > 0) {
      buttonAddHeight.value = -175;
    } else {
      buttonAddHeight.value = 0;
    }
    for (let i = 0; i < imgList.length; i++) {
      let reviewImgList = [] as any;
      var imgArry = imgList[i].img.split(',');
      for (let j = 0; j < imgArry.length; j++) {
        if (imgArry[j].indexOf('http') == 0) {
          reviewImgList.push({
            uid: Math.random(),
            name: 'image.png',
            status: 'done',
            path: imgArry[j],
            url: imgArry[j],
          });
        } else {
          reviewImgList.push({
            uid: Math.random(),
            name: 'image.png',
            status: 'done',
            path: imgArry[j],
            url: picPreviewUrl + imgArry[j],
          });
        }
      }
      ehsNoticeInfoForm.ehsNoticeInfo.enpInfo.push({
        problemContent: imgList[i].problemContent,
        id: imgList[i].id,
        img: imgList[i].img,
        reviewImgList: reviewImgList,
      });
    }
    fileList = ref<UploadProps['fileList']>([]);
    if (record.attachment != '' && record.attachment != null) {
      const attachment = record.attachment;
      const attachmentArry = attachment.split(',');
      fileList.value = attachmentArry.map((e) => {
        return fileSign(e);
      });
    }

    if (record.signature != '' && record.signature != null) {
      const signature = record.signature;
      const signatureArry = signature.split(',');
      signatureImg.value = signatureArry.map((e) => {
        return fileSign(e);
      });
    }

    if (record.recipientSign != '' && record.recipientSign != null) {
      const recipientSign = record.recipientSign;
      let recipientSignArry = [];
      if (recipientSign.indexOf('data:image/png;base64') == 0) {
        recipientSignArry.push(recipientSign);
        recipientSignImg.value = recipientSignArry.map((e) => {
          return {
            uid: Math.random(),
            name: e,
            status: 'done',
            path: e,
            url: e,
          };
        });
      } else {
        recipientSignArry = recipientSign.split(',');
        recipientSignImg.value = recipientSignArry.map((e) => {
          return fileSign(e);
        });
      }
    }
    if (record.correctorSign != '' && record.correctorSign != null) {
      const correctorSign = record.correctorSign;
      let correctorSignArry = [];
      if (correctorSign.indexOf('data:image/png;base64') == 0) {
        correctorSignArry.push(correctorSign);
        correctorSignImg.value = correctorSignArry.map((e) => {
          return {
            uid: Math.random(),
            name: e,
            status: 'done',
            path: e,
            url: e,
          };
        });
      } else {
        correctorSignArry = correctorSign.split(',');
        correctorSignImg.value = correctorSignArry.map((e) => {
          return fileSign(e);
        });
      }
    }
    if (record.reviewSign != '' && record.reviewSign != null) {
      const reviewSign = record.reviewSign;
      let reviewSignArry = [];
      if (reviewSign.indexOf('data:image/png;base64') == 0) {
        reviewSignArry.push(reviewSign);
        reviewSignImg.value = reviewSignArry.map((e) => {
          return {
            uid: Math.random(),
            name: e,
            status: 'done',
            path: e,
            url: e,
          };
        });
      } else {
        reviewSignArry = reviewSign.split(',');
        reviewSignImg.value = reviewSignArry.map((e) => {
          return fileSign(e);
        });
      }
    }

    endDt.value = dayjs(record.endDt, dateFormat);

    if (record.type == 1) {
      type1.value = true;
      type2.value = false;
      type3.value = false;
      type4.value = false;
      type5.value = false;
      noticeContentHeight.value = 100;
      demandName.value = '针对上述问题，整改要求如下：';
      typeNameTip.value = '经检查发现你单位存在以下问题，请及时整改：';
    } else if (record.type == 2) {
      type1.value = false;
      type2.value = true;
      type3.value = false;
      type4.value = false;
      type5.value = false;
      noticeContentHeight.value = 100;
      demandName.value = '针对上述预警内容，整改要求如下：';
      typeNameTip.value = '';
    } else if (record.type == 3) {
      type1.value = false;
      type2.value = false;
      type3.value = true;
      type4.value = false;
      type5.value = false;
      noticeContentHeight.value = 100;
      demandName.value = '针对上述管控内容，整改要求如下：';
      typeNameTip.value = '';
    } else if (record.type == 4) {
      type1.value = false;
      type2.value = false;
      type3.value = false;
      type4.value = true;
      type5.value = false;
      noticeContentHeight.value = 100;
      demandName.value = '针对上述问题，进行考核：';
      typeNameTip.value = '考核问题：';
    } else if (record.type == 5) {
      type1.value = false;
      type2.value = false;
      type3.value = false;
      type4.value = false;
      type5.value = true;
      noticeContentHeight.value = 400;
      demandName.value = '';
      typeNameTip.value = '';
    }

    // for (let i = 0; i < noticeInfoType._value.length; i++) {
    //   if (ehsNoticeInfoForm.ehsNoticeInfo.type == noticeInfoType._value[i].value) {
    //     typeName.value = noticeInfoType._value[i].text;
    //   }
    // }
    typeName.value = render.renderDict(record.type, 'notice_info_type').children;
    //加载整改记录
    let url = '/notice/ehsNoticeCorrection/listByInfoId';
    defHttp.get({ url: url, params: { noticeInfoId: record.id } }).then((res) => {
      console.log(res);
      correctionList = res;
      noticeModel.correctionList = [];
      if (res.length > 0) {
        res.forEach((item) => {
          let modolItem = Object.assign({}, item);
          if (modolItem.img != '' && modolItem.img != null) {
            modolItem.img = modolItem.img.split(',').map((e) => {
              return {
                uid: Math.random(),
                name: 'image.png',
                status: 'done',
                url: picPreviewUrl + e,
              };
            });
          } else {
            modolItem.img = [];
          }
          if (modolItem.attachment != '' && modolItem.attachment != null) {
            modolItem.attachment = modolItem.attachment.split(',').map((e) => {
              return {
                uid: Math.random(),
                name: e.split('/')[e.split('/').length - 1],
                status: 'done',
                url: picPreviewUrl + e,
              };
            });
          } else {
            modolItem.attachment = [];
          }
          if (modolItem.reviewImg != '' && modolItem.reviewImg != null) {
            modolItem.reviewImg = modolItem.reviewImg.split(',').map((e) => {
              return {
                uid: Math.random(),
                name: 'image.png',
                status: 'done',
                url: picPreviewUrl + e,
              };
            });
          } else {
            modolItem.reviewImg = [];
          }
          modolItem.correctorName = record.correctorName;
          noticeModel.correctionList.push(modolItem);
        });
      }
    });

    visibleNotice.value = true;
  }
  const handlePreview = async (file: UploadProps['fileList'][number]) => {
    if (!file.url && !file.preview) {
      file.preview = (await getBase64(file.originFileObj)) as string;
    }
    previewImage.value = file.url || file.preview;
    previewVisible.value = true;
    previewTitle.value = file.name || file.url.substring(file.url.lastIndexOf('/') + 1);
  };

  function getBase64(file: File) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  }
  function exportDataPdf() {
    const el = document.getElementById('downLoadPdf');
    html2canvas(el, {
      scale: 3, // 设置缩放
      useCORS: true, // 允许canvas画布内 可以跨域请求外部链接图片, 允许跨域请求。
      allowTaint: true,
      logging: false, // 打印日志用的 可以不加默认为false
      backgroundColor: '#ffffff',
    }).then((canvas) => {
      canvas2PDF(canvas);
    });

    const canvas2PDF = (canvas) => {
      const contentWidth = canvas.width;
      const contentHeight = canvas.height;

      // 一页pdf显示html页面生成的canvas高度;a4纸的尺寸[595.28,841.89],pageHeight是应有高度吗，leftHeight是实际高度
      const pageHeight = (contentWidth / 592.28) * 841.89;
      // 未生成pdf的html页面高度
      let leftHeight = contentHeight;
      // 页面偏移
      let position = 0;
      // a4纸的尺寸[595.28,841.89]，html页面生成的canvas在pdf中图片的宽高
      const imgWidth = 595.28;
      const imgHeight = (595.28 / contentWidth) * contentHeight;

      const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
      ctx.font = '15px Microsoft Yahei';
      const pageData = canvas.toDataURL('image/jpeg', 1.0);
      const pdf = new jsPDF('p', 'pt', 'a4');
      if (leftHeight < pageHeight) {
        // 在pdf.addImage(pageData, 'JPEG', 左，上，宽度，高度)设置在pdf中显示；
        pdf.addImage(pageData, 'JPEG', 0, 0, imgWidth, imgHeight);
      } else {
        // 分页
        while (leftHeight > 0) {
          pdf.addImage(pageData, 'JPEG', 0, position, imgWidth, imgHeight);
          leftHeight -= pageHeight;
          position -= 841.89;
          // 避免添加空白页
          if (leftHeight > 0) {
            pdf.addPage();
          }
        }
      }
      // 可动态生成
      const fileName = ehsNoticeInfoForm.ehsNoticeInfo.title + typeName.value + ehsNoticeInfoForm.ehsNoticeInfo.noticeNo;
      pdf.save(`${fileName}.pdf`);
    };
  }
  const fileSign = (val) => {
    return {
      uid: Math.random(),
      name: val,
      status: 'done',
      path: val,
      url: /^http/i.test(val) ? val : getFileAccessHttpUrl(val),
    };
  };
  const handleCancel = () => {
    previewVisible.value = false;
    previewTitle.value = '';
  };
</script>

<style scoped lang="less">
  tr > td {
    padding: 5px;
  }

  .STYLE1 {
    font-family: '宋体';
    font-weight: bold;
    font-size: 24px;
  }
  .STYLE2 {
    font-family: '宋体';
    font-weight: bold;
    font-size: 20px;
  }
  .STYLE3 {
    font-family: '宋体';
    font-size: 16px;
    font-weight: bold;
  }
  .STYLE4 {
    font-family: '宋体';
    font-size: 18px;
    font-weight: bold;
  }
  .STYLE6 {
    font-family: '宋体';
    font-size: 12px;
    font-weight: bold;
  }
</style>
