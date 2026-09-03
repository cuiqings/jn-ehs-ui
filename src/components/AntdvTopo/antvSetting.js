import thumb from "../../assets/thumb.png"
// 基本设置
export const configSetting = (Shape) => {
  return {
    width: 1760,
    height: 800,
    grid: true,
    autoResize: true,
    translating: { restrict: true },
    mousewheel: {
      enabled: false,
      // zoomAtMousePosition: true,
      // modifiers: 'ctrl',
      // minScale: 0.5,
      // maxScale: 3,
    },
    connecting: {
      router: {
        name: 'manhattan',
        args: {
          // padding: 1,
        },
      },
      connector: {
        name: 'rounded',
        args: {
          radius: 8,
        },
      },
      anchor: 'center',
      connectionPoint: 'anchor',
      allowBlank: false,
      snap: {
        radius: 20,
      },
      createEdge() {
        return new Shape.Edge({
          attrs: {
            line: {
              stroke: '#A2B1C3',
              strokeWidth: 2,
              targetMarker: {
                name: 'block',
                width: 12,
                height: 8
              },
            },
          },
          zIndex: 0,
        })
      },
      validateConnection({ targetMagnet }) {
        return !!targetMagnet
      },
    },
    onToolItemCreated({ tool }) {
      const handle = tool
      const options = handle.options
      if (options && options.index % 2 === 1) {
        tool.setAttrs({ fill: 'red' })
      }
    },
    highlighting: {
      magnetAdsorbed: {
        name: 'stroke',
        args: {
          attrs: {
            fill: '#5F95FF',
            stroke: '#5F95FF',
          },
        },
      },
    },
    resizing: true,
    rotating: true,
    selecting: {
      enabled: true,
      rubberband: true,
      showNodeSelectionBox: true,
      // showEdgeSelectionBox: true
    },
    snapline: true,
    keyboard: true,
    clipboard: true,
    history: true,
  }
}

// 节点预设类型 （0椭圆形: defaultOval, 1矩形: defaultSquare, 2圆角矩形: defaultYSquare, 3菱形: defaultRhombus, 4平行四边形: defaultRhomboid, 5圆形: defaultCircle, 6图片: otherImage)
export const configNodeShape = (type) => {
  const nodeShapeList =  [
    {
      data: {
        type: 'textBlock',
        device: '',
        field: '',
        limit: 0,
        maxLimit: 5,
        minLimit: 5,
        lessLimit: '#000',
        moreLimit: '#000',
        apiUrl: ''
      },
      width: 80,
      height: 30,
      shape: 'text-block',
      // text: `Text`,
      attrs: {
        body: {
          fill: 'transparent',
          stroke: '',
        },
        label: {
          text: 'Text',
          style: {
            fontSize: 13,
            cursor: 'default'
          }
        },
        foreignObject: {
          color: '#000',
          fontFamily: '宋体',
        }
      },
    },
    {
      data: {
        type: 'textField',
        device: '',
        field: '',
        limit: 0,
        maxLimit: 5,
        minLimit: 5,
        lessLimit: '#000',
        moreLimit: '#000',
        apiUrl: ''
      },
      width: 80,
      height: 30,
      shape: 'text-block',
      text: `Field`,
      attrs: {
        body: {
          fill: 'transparent',
          stroke: '',
        },
        label: {
          text: 'Field',
          style: {
            fontSize: 13,
            cursor: 'default'
          }
        },
        foreignObject: {
          color: '#000',
          fontFamily: '宋体',
        }
      },
    },
    {
      data: {
        type: 'pathImage',
        device: '',
        field: '',
        limit: 0,
        maxLimit: 5,
        minLimit: 5,
        lessLimit: '#000',
        moreLimit: '#000',
        apiUrl: ''
      },
      shape: 'path',
      width: 80,
      height: 80,
      attrs: {
        body: {
          fill: '#000',
          stroke: 'none',
          refD: 'M24.85,10.126c2.018-4.783,6.628-8.125,11.99-8.125c7.223,0,12.425,6.179,13.079,13.543c0,0,0.353,1.828-0.424,5.119c-1.058,4.482-3.545,8.464-6.898,11.503L24.85,48L7.402,32.165c-3.353-3.038-5.84-7.021-6.898-11.503c-0.777-3.291-0.424-5.119-0.424-5.119C0.734,8.179,5.936,2,13.159,2C18.522,2,22.832,5.343,24.85,10.126z',
          style:{
            cursor: 'default'
          }
        },
      },
    },
    {
      data: {
        type: 'baseImage'
      },
      shape: 'image',
      width: 80,
      height: 80,
      // imageUrl: DefaultImg
      attrs: {
        image: {
          xlinkHref: location.protocol + '//' + window.location.host + thumb,
          preserveAspectRatio: 'none'
        },
      },
    },{
      label: '椭圆形',
      /**
       *
       *  加入data里面的标识type是为了方便编辑的时候找到相对应的类型进行不同的编辑处理
       *  另外获取初始对应的设置
      */
      data: {
        type: 'defaultOval'
      },
      shape: 'rect',
      width: 100,
      height: 50,
      attrs: {
        body: {
          rx: 20,
          ry: 26,
          fill: '#fff',
          stroke: '#333'
        },
        label: {
          text: '椭圆形',
          fontSize: 16,
          fill: '#333'
        }
      }
    },
    {
      label: '矩形',
      data: {
        type: 'defaultSquare',
      },
      shape: 'rect',
      width: 100,
      height: 50,
      attrs: {
        label: {
          text: '矩形',
          fontSize: 16,
          fill: '#333'
        },
        body: {
          fill: '#fff',
          stroke: '#333'
        }
      },
    },
    {
      label: '圆角矩形',
      data: {
        type: 'defaultYSquare'
      },
      shape: 'rect',
      width: 100,
      height: 50,
      attrs: {
        body: {
          rx: 6,
          ry: 6,
          fill: '#fff',
          stroke: '#333'
        },
        label: {
          text: '圆角矩形',
          fontSize: 16,
          fill: '#333'
        }
      },
    },
    {
      label: '菱形',
      data: {
        type: 'defaultRhombus'
      },
      shape: 'polygon',
      width: 120,
      height: 50,
      attrs: {
        body: {
          refPoints: '0,10 10,0 20,10 10,20',
          fill: '#fff',
          stroke: '#333'
        },
        label: {
          text: '菱形',
          fontSize: 16,
          fill: '#333'
        }
      },
    },
    {
      label: '平行四边形',
      data: {
        type: 'defaultRhomboid'
      },
      shape: 'polygon',
      width: 120,
      height: 50,
      attrs: {
        body: {
          refPoints: '10,0 40,0 30,20 0,20',
          fill: '#fff',
          stroke: '#333'
        },
        label: {
          text: '平行四边形',
          fontSize: 16,
          fill: '#333'
        }
      }
    },
    {
      label: '圆形',
      data: {
        type: 'defaultCircle'
      },
      shape: 'circle',
      width: 80,
      height: 80,
      attrs: {
        label: {
          text: '圆形',
          fontSize: 16,
          fill: '#333'
        },
        body: {
          fill: '#fff',
          stroke: '#333'
        }
      }
    }
  ]
  if(type) {
    const obj = nodeShapeList.find(item => {return item.data.type === type})
    return obj || nodeShapeList
  }
  return nodeShapeList
}

// 节点连接装设置
export const configNodePorts = () => {
  return {
    groups: {
      top: {
        position: 'top',
        attrs: {
          circle: {
            r: 4,
            magnet: true,
            stroke: '#5F95FF',
            strokeWidth: 1,
            fill: '#fff',
            style: {
              visibility: 'hidden',
            },
          },
        },
      },
      right: {
        position: 'right',
        attrs: {
          circle: {
            r: 4,
            magnet: true,
            stroke: '#5F95FF',
            strokeWidth: 1,
            fill: '#fff',
            style: {
              visibility: 'hidden',
            },
          },
        },
      },
      bottom: {
        position: 'bottom',
        attrs: {
          circle: {
            r: 4,
            magnet: true,
            stroke: '#5F95FF',
            strokeWidth: 1,
            fill: '#fff',
            style: {
              visibility: 'hidden',
            },
          },
        },
      },
      left: {
        position: 'left',
        attrs: {
          circle: {
            r: 4,
            magnet: true,
            stroke: '#5F95FF',
            strokeWidth: 1,
            fill: '#fff',
            style: {
              visibility: 'hidden',
            },
          },
        },
      },
    },
    items: [
      {
        group: 'top',
      },
      {
        group: 'right',
      },
      {
        group: 'bottom',
      },
      {
        group: 'left',
      },
    ]
  }
}

// 连线 label 设置
export const configEdgeLabel = (labelText, fontColor, fill, stroke) => {
  if(!labelText) return { attrs: { labelText: { text: '' }, labelBody: { fill: '', stroke: '' } } }
  return {
      markup: [
        {
          tagName: 'rect',
          selector: 'labelBody',
        },
        {
          tagName: 'text',
          selector: 'labelText',
        },
      ],
      attrs: {
        labelText: {
          text: labelText || '',
          fill: fontColor || '#333',
          textAnchor: 'middle',
          textVerticalAnchor: 'middle',
        },
        labelBody: {
          ref: 'labelText',
          refX: -8,
          refY: -5,
          refWidth: '100%',
          refHeight: '100%',
          refWidth2: 16,
          refHeight2: 10,
          stroke: stroke || '#555',
          fill: fill || '#fff',
          strokeWidth: 2,
          rx: 5,
          ry: 5,
        },
      }
    }
}

// 键盘事件
export const graphBindKey = (graph) => {
    graph.bindKey(['meta+c', 'ctrl+c'], () => {
      const cells = graph.getSelectedCells()
      if (cells.length) {
        graph.copy(cells)
      }
      return false
    })
    graph.bindKey(['meta+x', 'ctrl+x'], () => {
      const cells = graph.getSelectedCells()
      if (cells.length) {
        graph.cut(cells)
      }
      return false
    })
    graph.bindKey(['meta+v', 'ctrl+v'], () => {
      if (!graph.isClipboardEmpty()) {
        const cells = graph.paste({ offset: 32 })
        graph.cleanSelection()
        graph.select(cells)
      }
      return false
    })
    //undo redo
    graph.bindKey(['meta+z', 'ctrl+z'], () => {
      if (graph.history.canUndo()) {
        graph.history.undo()
      }
      return false
    })
    graph.bindKey(['meta+shift+z', 'ctrl+shift+z'], () => {
      if (graph.history.canRedo()) {
        graph.history.redo()
      }
      return false
    })
    // select all
    graph.bindKey(['meta+a', 'ctrl+a'], () => {
      const nodes = graph.getNodes()
      if (nodes) {
        graph.select(nodes)
      }
    })
    //delete
    /*
    graph.bindKey('delete', () => {
      const cells = graph.getSelectedCells()
      if (cells.length) {
        graph.removeCells(cells)
      }
    })
    */
    // zoom
    // graph.bindKey(['ctrl+1', 'meta+1'], () => {
    //   const zoom = graph.zoom()
    //   if (zoom < 1.5) {
    //     graph.zoom(0.1)
    //   }
    // })
    // graph.bindKey(['ctrl+2', 'meta+2'], () => {
    //   const zoom = graph.zoom()
    //   if (zoom > 0.5) {
    //     graph.zoom(-0.1)
    //   }
    // })
    return graph
}