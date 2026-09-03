<template>
  <div class="topo-wrap" :class="{ 'full-screen': isFullScreen }">
    <HeaderTools
      :isOpen="!!selectCell"
      :selectCells="selectCells || []"
      :historyObj="historyObj"
      @changePreview="handlerSend('preview')"
      @changeSave="handlerSend('save')"
      @changeUndo="handleUndo()"
      @changeRedo="handleRedo()"
      @fullScreen="fullScreen"
      @changeCellNode="changeCellNode"
    />
    <div class="antv-content">
      <!-- 左侧组件列表 -->
      <div class="antv-menu">
        <LeftMenu @menuDrag="menuDrag" />
      </div>

      <!-- main画布渲染区域 -->
      <div class="antv-wrapper">
        <div class="wrapper-canvas" id="wrapper" @drop="drop($event)" @dragover.prevent></div>
      </div>

      <!-- 右侧浮层设置区域 -->
      <div v-if="editDrawer" class="edit-main">
        <div class="edit-main-title">
          <h3>{{ editTitle[editType] }} </h3>
          <a-icon type="close" @click="closeEditForm" style="cursor: pointer" />
        </div>
        <div>
          <div class="resizer" ref="resizer" @mousedown="onMouseDown"></div>
          <div class="form-main" ref="formMain">
            <PageForm v-if="editType === 'page'" v-model:value="form" @changePage="changePage" />
            <BaseImageForm v-if="editType === 'baseImage'" v-model:value="form" @changeBaseImage="changeImageNode" />
            <PathImageForm v-if="editType === 'pathImage'" v-model:value="form" :apiUrl="apiUrl" @changePathImage="changePathImage" />
            <TextBlockForm
              v-if="editType === 'textBlock'"
              v-model:value="form"
              :apiUrl="apiUrl"
              @blurTextBlock="blurTextBlock"
              @changeTextBlock="changeTextBlock"
              :showAnimation="showAnimation"
            />
            <TextFieldForm
              v-if="editType === 'textField'"
              v-model:value="form"
              :apiUrl="apiUrl"
              :showAnimation="showAnimation"
              @changeTextField="changeTextBlock"
            />
            <EdgeForm v-if="editType === 'edge'" v-model:value="form" @changeEdge="changeEdge" />
            <DefaultForm v-if="editType.includes('default')" v-model:value="form" @changeDefault="changeDefault" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import { getFileAccessHttpUrl } from '/@/utils/common/compUtils';
  import { Graph, Shape, DataUri } from '@antv/x6';
  import { configSetting, configNodeShape, configNodePorts, graphBindKey } from './antvSetting';
  import BaseImageForm from './BaseImageForm.vue';
  import PageForm from './PageForm.vue';
  import PathImageForm from './PathImageForm.vue';
  import TextBlockForm from './TextBlockForm.vue';
  import TextFieldForm from './TextFieldForm.vue';
  import EdgeForm from './EdgeForm.vue';
  import DefaultForm from './DefaultForm.vue';
  import HeaderTools from './HeaderTools.vue';
  import LeftMenu from './LeftMenu.vue';
  const EditTitle = {
    baseImage: '编辑基础图片',
    pathImage: '编辑矢量图片',
    textField: '编辑变量',
    textBlock: '编辑文字',
    page: '编辑页面',
    edge: '编辑连线',
    defaultOval: '编辑椭圆形',
    defaultSquare: '编辑矩形',
    defaultYSquare: '编辑圆角矩形',
    defaultRhombus: '编辑菱形',
    defaultRhomboid: '编辑平行四边形',
    defaultCircle: '编辑圆形',
  };

  export default {
    name: 'AntdvTopo',
    props: {
      value: {
        type: String,
        default: '',
      },
      showAnimation: {
        type: Boolean,
        default: false,
      },
    },
    components: {
      BaseImageForm,
      PageForm,
      PathImageForm,
      TextBlockForm,
      TextFieldForm,
      EdgeForm,
      HeaderTools,
      LeftMenu,
      DefaultForm,
    },
    data() {
      return {
        labelCol: {
          xs: { span: 24 },
          sm: { span: 7 },
        },
        wrapperCol: {
          xs: { span: 24 },
          sm: { span: 17 },
        },
        graph: null,
        isChange: false,
        menuItem: '',
        selectCell: '',
        selectCells: '',
        editDrawer: false,
        editTitle: EditTitle,
        editType: '',
        form: {},
        apiUrl: '',
        loopStep: 3,
        labelForm: {
          fontColor: '#333',
          fill: '#FFF',
          stroke: '#555',
        },
        historyObj: {
          canUndo: false,
          canRedo: false,
        },
        isFullScreen: false,
        isResizing: false,
      };
    },
    created() {},
    watch: {
      value: {
        handler: function () {
          if (this.graph) {
            this.isChange = false;
            this.isPortsShow = false;
            this.menuItem = '';
            this.selectCell = '';
            this.editDrawer = false;
            this.graph.dispose();
            this.initGraph();
          }
        },
        deep: true,
        immediate: true,
      },
    },
    mounted() {
      this.initGraph();
      document.addEventListener('mouseup', this.onMouseUp);
    },
    beforeDestroy() {
      this.graph.dispose();
      document.removeEventListener('mousemove', this.onMouseMove);
      document.removeEventListener('mouseup', this.onMouseUp);
    },
    methods: {
      onMouseMove(e) {
        if (!this.isResizing) return;
        if (this.$refs.formMain.getBoundingClientRect().width >= 280) {
          const newWidth = e.clientX - this.$refs.resizer.getBoundingClientRect().left;
          this.$refs.formMain.style.width = `${this.$refs.formMain.getBoundingClientRect().width - newWidth}px`;
        }
      },

      onMouseUp() {
        this.isResizing = false;
        document.removeEventListener('mousemove', this.onMouseMove);
        document.removeEventListener('mouseup', this.onMouseUp);
      },

      onMouseDown() {
        this.isResizing = true;
        document.addEventListener('mousemove', this.onMouseMove);
        document.addEventListener('mouseup', this.onMouseUp);
      },
      // 链接桩的显示与隐藏，主要是照顾菱形
      changePortsShow(val) {
        const container = document.getElementById('wrapper');
        const ports = container.querySelectorAll('.x6-port-body');
        for (let i = 0, len = ports.length; i < len; i = i + 1) {
          ports[i].style.visibility = val ? 'visible' : 'hidden';
        }
      },
      // 初始化渲染画布
      initGraph() {
        const graph = new Graph({
          container: document.getElementById('wrapper'),
          ...configSetting(Shape),
        });
        // 画布事件
        // graph.on('node:mouseenter', () => {
        //   this.changePortsShow(true)
        // })
        graph.on('node:mouseleave', () => {
          if (this.isPortsShow) return;
          this.changePortsShow(false);
        });
        graph.on('blank:click', () => {
          this.editPage();
        });
        // 点击编辑
        // graph.on('cell:click', ({ cell }) => {
        //   console.log(cell,'------=')
        //   this.editForm(cell)
        // })
        // 组件移动
        graph.on('node:moved', ({ node }) => {
          this.cellNodeChanged(node);
        });
        // 组件缩放
        graph.on('node:resized', ({ node }) => {
          this.cellNodeChanged(node);
        });
        // 画布键盘事件
        graphBindKey(graph);
        // 删除
        graph.bindKey(['delete', 'backspace'], () => {
          this.handlerDel();
        });
        // 节点/边被选中时触发
        graph.on('cell:selected', ({ cell }) => {
          // console.log(cell,'2222')
          this.selectCells = graph.getSelectedCells();
          if (this.selectCells.length === 1) {
            this.selectCell = this.selectCells[0];
            this.editForm(cell);
          }
          // console.log(this.selectCells,'000')
        });
        // 节点被取消选中时触发
        // graph.on('cell:unselected', () => {
        //   if(this.selectCell){
        //     this.selectCell.removeTools()
        //     this.selectCell = ''
        //   }
        //   this.selectCells = ''
        // })
        // 监听 组件增减变化
        graph.history.on('change', () => {
          this.historyObj = {
            canUndo: graph.canUndo(),
            canRedo: graph.canRedo(),
          };
        });
        // 赋值
        this.graph = graph;
        // 返现方法
        if (this.value) {
          const { graphOpts, cellsOpts } = JSON.parse(this.value);
          graph.drawBackground({
            image: getFileAccessHttpUrl(graphOpts.background),
            position: { x: 0, y: 0 },
          });
          graph.resize(graphOpts.width, graphOpts.height);
          this.apiUrl = graphOpts.apiUrl;
          this.loopStep = graphOpts.loopStep;
          // 导出的时候删除了链接桩设置加回来
          if (cellsOpts.length) {
            const portsGroups = configNodePorts().groups;
            const jsonTemp = cellsOpts.map((item) => {
              if (item.ports) item.ports.groups = portsGroups;
              return item;
            });
            graph.fromJSON(jsonTemp);
          }
        }
        // 画布有变化
        graph.on('cell:changed', () => {
          this.isChangeValue();
        });
      },
      // 画布是否有变动
      isChangeValue() {
        if (!this.isChange) {
          this.isChange = true;
          this.$emit('cellChanged', true);
        }
      },
      menuDrag(type) {
        this.menuItem = configNodeShape(type);
      },
      drop(event) {
        const nodeItem = {
          ...this.menuItem,
          x: event.offsetX - this.menuItem.width / 2,
          y: event.offsetY - this.menuItem.height / 2,
          ports: configNodePorts(),
        };
        // 创建节点
        this.graph.addNode(nodeItem);
        this.isChangeValue();
      },
      // 设置页面属性
      editPage() {
        this.editType = 'page';
        if (this.selectCell) {
          this.selectCell.removeTools();
          this.selectCell = '';
        }
        this.selectCells = '';
        const { width, height } = this.graph.options;
        const { optionsCache = {}, options } = this.graph.background;
        this.form = {
          bgImg: (optionsCache && optionsCache.image) || '',
          width,
          height,
          background: !!options.background,
          loopStep: this.loopStep || 3,
          apiUrl: this.apiUrl,
        };
        this.editDrawer = true;
      },
      // 组件节点 改变事件
      cellNodeChanged(cell) {
        const { id = '' } = this.selectCell;
        if (cell.isNode() && cell.id === id) {
          const { x, y } = cell.position();
          const { width, height } = cell.size();
          this.form.x = Math.round(x);
          this.form.y = Math.round(y);
          this.form.width = width;
          this.form.height = height;
        }
      },
      // 设置组件属性
      editForm(cell) {
        if (this.selectCell) this.selectCell.removeTools(); // 删除修改线的工具
        this.selectCell = cell;
        console.log(cell, '99999-----');
        let { deviceId } = this.$route.query;
        deviceId = deviceId ? Number(deviceId) : '';
        console.log('deviceId', deviceId, '99999-deviceid----');
        // 编辑基础图片
        if (cell.isNode() && cell.data.type && cell.data.type === 'baseImage') {
          this.editType = cell.data.type;
          const { image } = cell.attrs;
          const { width, height } = cell.size();
          const { x, y } = cell.position();
          this.form = {
            height,
            width,
            x: Math.round(x),
            y: Math.round(y),
            xlinkHref: image.xlinkHref || '',
          };
          return (this.editDrawer = true);
        }
        // 编辑path图片
        if (cell.isNode() && cell.data.type && cell.data.type === 'pathImage') {
          this.editType = cell.data.type;
          const { body } = cell.attrs;
          const { device, field, limit, maxLimit, minLimit, lessLimit, moreLimit } = cell.data;
          const { width, height } = cell.size();
          const { x, y } = cell.position();
          this.form = {
            height,
            width,
            x: Math.round(x),
            y: Math.round(y),
            path: body.refD || '',
            fill: body.fill || '',
            device: device || deviceId || undefined,
            deviceDisabled: !!deviceId,
            field: field || undefined,
            limit: limit || 0,
            maxLimit: maxLimit,
            minLimit: minLimit,
            lessLimit: lessLimit || '',
            moreLimit: moreLimit || '',
            compId: cell.id,
          };
          return (this.editDrawer = true);
        }
        // 编辑文字、变量
        if (cell.isNode() && cell.data.type && (cell.data.type === 'textBlock' || cell.data.type === 'textField')) {
          this.editType = cell.data.type;
          // 如果地址栏参数有deviceid 直接设置死值 不可更改
          if (deviceId) {
            this.selectCell.setData({
              ...this.selectCell.data,
              device: deviceId || '',
            });
          }
          const { label, foreignObject } = cell.attrs;
          const { device, field, limit, maxLimit, minLimit, lessLimit, moreLimit } = cell.data;
          const { width, height } = cell.size();
          const { x, y } = cell.position();
          this.form = {
            height,
            width,
            x: Math.round(x),
            y: Math.round(y),
            text: label.text,
            color: foreignObject.color,
            fontSize: label.style.fontSize,
            fontFamily: foreignObject.fontFamily,
            device: device || deviceId || undefined,
            deviceDisabled: !!deviceId,
            field: field || undefined,
            limit: limit || 0,
            maxLimit: maxLimit,
            minLimit: minLimit,
            lessLimit: lessLimit || '',
            moreLimit: moreLimit || '',
            compId: cell.id,
          };
          return (this.editDrawer = true);
        }
        // 编辑线
        if (!cell.isNode() && cell.shape === 'edge') {
          this.editType = cell.shape;
          this.form = {
            label: cell.labels && cell.labels[0] ? cell.labels[0].attrs.labelText.text : '',
            stroke: cell.attrs.line.stroke || '',
            connector: (cell.connector && cell.connector.name) || 'rounded',
            strokeWidth: cell.attrs.line.strokeWidth || '',
            isArrows: cell.attrs.line.sourceMarker ? true : false,
            isAnit: cell.attrs.line.strokeDasharray ? true : false,
            isTools: false,
          };
          // 看是否有label
          const edgeCellLabel = (cell.labels && cell.labels[0] && cell.labels[0].attrs) || false;
          if (this.form.label && edgeCellLabel) {
            this.labelForm = {
              fontColor: edgeCellLabel.labelText.fill || '#333',
              fill: edgeCellLabel.labelBody.fill || '#fff',
              stroke: edgeCellLabel.labelBody.stroke || '#555',
            };
          } else {
            this.labelForm = { fontColor: '#333', fill: '#FFF', stroke: '#555' };
          }
          return (this.editDrawer = true);
        }
        // 编辑图形节点
        if (cell.isNode() && cell.data.type && cell.data.type.includes('default')) {
          this.editType = cell.data.type;
          const body = cell.attrs.body || cell.attrs.rect || cell.attrs.polygon || cell.attrs.circle;
          const { width, height } = cell.size();
          const { x, y } = cell.position();
          this.form = {
            height,
            width,
            x: Math.round(x),
            y: Math.round(y),
            labelText: cell.attrs.label.text || '',
            fontSize: cell.attrs.label.fontSize || 16,
            fontFill: cell.attrs.label.fill || '',
            fill: body.fill || '',
            stroke: body.stroke || '',
          };
          return (this.editDrawer = true);
        }
      },
      closeEditForm() {
        this.editDrawer = false;
        if (this.selectCell) {
          this.graph.cleanSelection();
          this.selectCell.removeTools();
          this.selectCell = '';
        }
        this.selectCells = '';
      },
      // 修改页面属性
      changePage(obj) {
        const { type, value } = obj;
        console.log(obj, 'wwwwwww1111');
        console.log(getFileAccessHttpUrl(value), 'wwwwwww');
        switch (type) {
          case 'bgImg':
            this.graph.drawBackground({
              image: getFileAccessHttpUrl(value),
              position: { x: 0, y: 0 },
            });
            break;
          case 'height':
            this.graph.resize(this.form.width, value);
            break;
          case 'width':
            this.graph.resize(value, this.form.height);
            break;
          case 'background':
            this.graph.clearBackground();
            this.form.bgImg = '';
            break;
          case 'loopStep':
            this.loopStep = value;
            break;
          case 'apiUrl':
            this.apiUrl = value;
            break;
        }
      },
      // 修改基础图片节点
      changeImageNode(obj) {
        const { type, value } = obj;
        switch (type) {
          case 'xlinkHref':
            this.selectCell.attr('image/xlinkHref', getFileAccessHttpUrl(value));
            break;
          case 'height':
            this.selectCell.resize(this.form.width, value);
            break;
          case 'width':
            this.selectCell.resize(value, this.form.height);
            break;
          case 'x':
            this.selectCell.position(Number(value), Number(this.form.y));
            break;
          case 'y':
            this.selectCell.position(Number(this.form.x), Number(value));
            break;
        }
      },
      // 修改path图片节点
      changePathImage(obj) {
        const { type, value } = obj;
        switch (type) {
          case 'path':
            if (value === '') return;
            this.selectCell.attr('body/refD', value);
            break;
          case 'height':
            this.selectCell.resize(this.form.width, value);
            break;
          case 'width':
            this.selectCell.resize(value, this.form.height);
            break;
          case 'x':
            this.selectCell.position(Number(value), Number(this.form.y));
            break;
          case 'y':
            this.selectCell.position(Number(this.form.x), Number(value));
            break;
          case 'fill':
            this.selectCell.attr('body/fill', value);
            break;
          case 'device':
            this.selectCell.setData({
              ...this.selectCell.data,
              device: value || '',
              field: '',
            });
            this.form.field = undefined;
            break;
          case 'field':
            this.selectCell.setData({
              ...this.selectCell.data,
              field: value || '',
            });
            break;
          case 'limit':
            this.selectCell.setData({
              ...this.selectCell.data,
              limit: value,
            });
            break;
          case 'maxLimit':
            this.selectCell.setData({
              ...this.selectCell.data,
              maxLimit: value,
            });
            break;
          case 'minLimit':
            this.selectCell.setData({
              ...this.selectCell.data,
              minLimit: value,
            });
            break;
          case 'lessLimit':
            this.selectCell.setData({
              ...this.selectCell.data,
              lessLimit: value,
            });
            break;
          case 'moreLimit':
            this.selectCell.setData({
              ...this.selectCell.data,
              moreLimit: value,
            });
            break;
          // case 'apiUrl':
          //   this.selectCell.setData({
          //     ...this.selectCell.data,
          //     apiUrl: value
          //   })
          //   break;
        }
      },
      // 修改文字、变量节点
      changeTextBlock(obj) {
        const { type, value } = obj;
        switch (type) {
          case 'text':
            this.selectCell.attr('label/text', value);
            break;
          case 'height':
            this.selectCell.resize(this.form.width, value);
            break;
          case 'width':
            this.selectCell.resize(value, this.form.height);
            break;
          case 'x':
            this.selectCell.position(Number(value), Number(this.form.y));
            break;
          case 'y':
            this.selectCell.position(Number(this.form.x), Number(value));
            break;
          case 'color':
            this.selectCell.attr('foreignObject/color', value);
            break;
          case 'fontSize':
            this.selectCell.attr('label/style/fontSize', value);
            break;
          case 'fontFamily':
            this.selectCell.attr('foreignObject/fontFamily', value);
            break;
          case 'device':
            this.selectCell.setData({
              ...this.selectCell.data,
              device: value || '',
              field: '',
            });
            this.form.field = undefined;
            break;
          case 'field':
            this.selectCell.setData({
              ...this.selectCell.data,
              field: value || '',
            });
            break;
          case 'limit':
            this.selectCell.setData({
              ...this.selectCell.data,
              limit: value,
            });
            break;
          case 'maxLimit':
            this.selectCell.setData({
              ...this.selectCell.data,
              maxLimit: value,
            });
            break;
          case 'minLimit':
            this.selectCell.setData({
              ...this.selectCell.data,
              minLimit: value,
            });
            break;
          case 'lessLimit':
            this.selectCell.setData({
              ...this.selectCell.data,
              lessLimit: value,
            });
            break;
          case 'moreLimit':
            this.selectCell.setData({
              ...this.selectCell.data,
              moreLimit: value,
            });
            break;
          // case 'apiUrl':
          //   this.selectCell.setData({
          //     ...this.selectCell.data,
          //     apiUrl: value
          //   })
          //   break;
        }
      },
      blurTextBlock(obj) {
        const { value } = obj;
        if (value === '') {
          this.selectCell.attr('label/text', 'Text');
          this.form.text = 'Text';
        }
      },
      // 修改边 节点
      changeEdge(obj) {
        const { type, value } = obj;
        switch (type) {
          case 'stroke':
            this.selectCell.attr('line/stroke', value);
            break;
          case 'connector':
            if (type === 'rounded' || type === 'jumpover') {
              this.selectCell.setConnector(value, { radius: 20 });
            } else {
              this.selectCell.setConnector(value);
            }
            break;
          case 'strokeWidth':
            this.changeEdgeStrokeWidth(value);
            break;
          case 'isArrows':
            this.changeEdgeArrows(value);
            break;
          case 'isAnit':
            this.changeEdgeAnit(value);
            break;
          case 'isTools':
            this.changeEdgeTools(value);
            break;
        }
      },
      // 修改图形 节点
      changeDefault(obj) {
        const { type, value } = obj;
        switch (type) {
          case 'height':
            this.selectCell.resize(this.form.width, value);
            break;
          case 'width':
            this.selectCell.resize(value, this.form.height);
            break;
          case 'x':
            this.selectCell.position(Number(value), Number(this.form.y));
            break;
          case 'y':
            this.selectCell.position(Number(this.form.x), Number(value));
            break;
          case 'labelText':
            this.selectCell.attr('label/text', value);
            break;
          case 'fontFill':
            this.selectCell.attr('label/fill', value);
            break;
          case 'fontSize':
            this.selectCell.attr('label/fontSize', value);
            break;
          case 'fill':
            this.selectCell.attr('body/fill', value);
            break;
          case 'stroke':
            this.selectCell.attr('body/stroke', value);
            break;
        }
      },
      // 边的宽度设置
      changeEdgeStrokeWidth(val) {
        if (this.form.isArrows) {
          this.selectCell.attr({
            line: {
              strokeWidth: val,
              sourceMarker: {
                width: 12 * (val / 2) || 12,
                height: 8 * (val / 2) || 8,
              },
              targetMarker: {
                width: 12 * (val / 2) || 12,
                height: 8 * (val / 2) || 8,
              },
            },
          });
        } else {
          this.selectCell.attr({
            line: {
              strokeWidth: val,
              targetMarker: {
                width: 12 * (val / 2) || 12,
                height: 8 * (val / 2) || 8,
              },
            },
          });
        }
      },
      // 边的箭头
      changeEdgeArrows(val) {
        if (val) {
          this.selectCell.attr({
            line: {
              sourceMarker: {
                name: 'block',
                width: 12 * (this.form.strokeWidth / 2) || 12,
                height: 8 * (this.form.strokeWidth / 2) || 8,
              },
              targetMarker: {
                name: 'block',
                width: 12 * (this.form.strokeWidth / 2) || 12,
                height: 8 * (this.form.strokeWidth / 2) || 8,
              },
            },
          });
        } else {
          this.selectCell.attr({
            line: {
              sourceMarker: '',
              targetMarker: {
                name: 'block',
                size: 10 * (this.form.strokeWidth / 2) || 10,
              },
            },
          });
        }
      },
      // 边的添加蚂蚁线
      changeEdgeAnit(val) {
        if (val) {
          this.selectCell.attr({
            line: {
              strokeDasharray: 5,
              style: {
                animation: 'ant-line 30s infinite linear',
              },
            },
          });
        } else {
          this.selectCell.attr({
            line: {
              strokeDasharray: 0,
              style: {
                animation: '',
              },
            },
          });
        }
      },
      // 给线添加调节工具
      changeEdgeTools(val) {
        if (val) this.selectCell.addTools(['vertices', 'segments']);
        else this.selectCell.removeTools();

        console.log(this.selectCell);
      },
      // header 设置节点
      changeCellNode(value) {
        // if(!this.selectCell && value !== 'paste'){
        //   this.$message.warning('请先选择节点！')
        //   return
        // }

        switch (value) {
          case 'arrowUp':
            this.selectCell.setZIndex(this.selectCell.getZIndex() + 1.5);
            break;
          case 'topic':
            this.selectCell.toFront();
            break;
          case 'arrowDown':
            this.selectCell.setZIndex(this.selectCell.getZIndex() - 1.5);
            break;
          case 'tobot':
            this.selectCell.toBack();
            break;
          case 'copy':
            // console.log(this.graph.getSelectedCells(),'0000')
            const cells = this.graph.getSelectedCells();
            if (cells.length) {
              this.graph.copy(cells);
            }
            break;
          case 'paste':
            if (!this.graph.isClipboardEmpty()) {
              const cells = this.graph.paste({ offset: 32 });
              this.graph.cleanSelection();
              this.graph.select(cells);
            }
            break;
          case 'del':
            this.handlerDel();
            break;
        }
      },
      // 撤销
      handleUndo() {
        if (this.graph.canUndo()) {
          this.graph.undo();
        }
      },
      // 重做
      handleRedo() {
        if (this.graph.canRedo()) {
          this.graph.redo();
        }
      },
      // 全屏
      fullScreen(val) {
        this.isFullScreen = val;
      },
      // 删除节点
      handlerDel() {
        if (!this.selectCell && !this.selectCells) return;

        const cells = this.graph.getSelectedCells();
        if (cells.length) {
          this.graph.removeCells(cells);
          this.form = {};
          if (this.selectCell) {
            this.selectCell.removeTools();
            this.selectCell = '';
          }
          this.selectCells = '';
          this.editDrawer = false;
          // this.$message.success('删除成功')
        }

        // this.$confirm({
        //   content: `此操作将删除此${this.editType !== 'edge' ? '节点' : '连线'}, 是否继续?`,
        //   onOk: () => {
        //     const cells = this.graph.getSelectedCells()
        //     if (cells.length) {
        //       this.graph.removeCells(cells)
        //       this.form = {}
        //       if(this.selectCell){
        //         this.selectCell.removeTools()
        //         this.selectCell = ''
        //       }
        //       this.selectCells = ''
        //       this.editDrawer = false
        //       this.$message.success('删除成功')
        //     }
        //   }
        // })
      },
      // 导出 预览 保存
      handlerSend(type) {
        // if(!this.isChange) return
        // 我在这里删除了链接桩的设置，和工具（为了减少数据），反显的时候要把删除的链接桩加回来
        const { cells: jsonArr } = this.graph.toJSON();
        const tempGroupJson = jsonArr.map((item) => {
          if (item.ports && item.ports.groups) delete item.ports.groups;
          if (item.tools) delete item.tools;
          return item;
        });
        if (this.selectCell) {
          this.graph.cleanSelection();
          this.selectCell.removeTools();
          this.selectCell = '';
        }
        this.selectCells = '';
        this.editDrawer = false;
        console.log(tempGroupJson);
        const { width, height } = this.graph.options;
        const { optionsCache = {} } = this.graph.background;
        const tempObj = {
          graphOpts: {
            width,
            height,
            background: (optionsCache && optionsCache.image) || '',
            apiUrl: this.apiUrl || '',
            loopStep: this.loopStep,
          },
          cellsOpts: tempGroupJson,
        };
        if (type === 'preview') {
          this.$emit('handlePreview', JSON.stringify(tempObj));
        } else if (type === 'save') {
          this.$emit('handleSave', JSON.stringify(tempObj));
        }
      },
      // 导出图片
      handleExport() {
        this.graph.toPNG((dataUri) => {
          console.log(dataUri, '00----');
          // 下载
          DataUri.downloadDataUri(dataUri, 'chart.png');
        });
      },
    },
  };
</script>
<style lang="less">
  @keyframes ant-line {
    to {
      stroke-dashoffset: -1000;
    }
  }
</style>
<style scoped lang="less">
  .topo-wrap {
    background-color: #fff;
    height: 100%;
    &.full-screen {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 555;
    }
  }
  .antv-content {
    background: #fff;
    display: flex;
    overflow: hidden;
    position: relative;
    height: calc(100% - 50px);
    .antv-menu {
      width: 160px;
      border-right: 1px solid #d5d5d5;
      overflow-y: auto;
    }
    .antv-wrapper {
      flex: 1;
      position: relative;
      overflow: auto;
      .wrapper-canvas {
        position: relative;
        height: 100%;
        width: 100%;
      }
      .wrapper-tips {
        padding: 10px;
        display: flex;
        align-items: center;
        position: absolute;
        top: 0;
        left: 0;
        .wrapper-tips-item {
          span {
            padding-left: 10px;
            font-size: 12px;
          }
        }
      }
    }
    .edit-main {
      position: absolute;
      right: 0;
      top: 0;
      height: 100%;
      // width: 280px;
      min-width: 280px;
      border-left: 1px solid #f2f2f2;
      box-shadow: 0 -10px 10px rgba(0, 0, 0, 0.3);
      padding: 16px 0;
      background: #fff;
      box-sizing: border-box;
      overflow: auto;
      background-color: #f7f7f7;
      .edit-main-title {
        padding: 0 16px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        h3 {
          flex: 1;
          margin: 0px;
        }
        i {
          cursor: pointer;
          font-size: 20px;
          opacity: 0.7;
          &:hover {
            opacity: 1;
          }
        }
      }
      & > div:nth-child(2) {
        display: flex;
        .resizer {
          width: 1px;
          background-color: #f7f7f7;
          cursor: ew-resize;
          position: absolute;
          top: 0;
          left: 0;
          bottom: 0;
        }
      }
    }
    .form-main {
      padding-bottom: 10px;
      min-width: 280px;
    }
  }
</style>
