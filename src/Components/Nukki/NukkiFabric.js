// import React, {useEffect, useMemo, useState} from 'react'
// import MagicWand from "magic-wand-tool"
// import {useRecoilState} from "recoil";
// import {fabric} from "fabric";
//
//
// function NukkiFabric({imgRef, rstRef, plgRef}) {
//
//   let colorThreshold = 15;
//   let blurRadius = 5;
//   let simplifyTolerant = 3;
//   let simplifyCount = 30;
//   let hatchLength = 4;
//   let hatchOffset = 0;
//   let imageInfo = null
//   let cacheInd = null;
//   let mask = null;
//   let oldMask = null;
//   let downPoint = null;
//   let allowDraw = false;
//   let addMode = false;
//   let currentThreshold = colorThreshold;
//
//
//   let cs = null;
//
//   // imageInfo 초기 설정
//   useEffect(() => {
//     function initImageInfo() {
//       const imgCtx = imgRef.current.getContext('2d')
//       const rstCtx = rstRef.current.getContext('2d')
//       const plgCtx = plgRef.current.getContext('2d')
//       const imageData = imgCtx.getImageData(0, 0, imgCtx.canvas.width, imgCtx.canvas.height)
//       // console.log(imgCtx.canvas.width, imgCtx.canvas.height)
//       imageInfo = {
//         width: imageData.width,
//         height: imageData.height,
//         context: imgCtx,
//         rstCtx: rstCtx,
//         plgCtx: plgCtx,
//         data: imageData
//       };
//       mask = null;
//     }
//
//     setTimeout(() => initImageInfo(), 50)
//   }, [imgRef.current, rstRef.current, plgRef.current])
//
//   useEffect(() => {
//     if (rstRef.current.id === 'result-layer') {
//       rstRef.current.addEventListener('mousedown', (e) => onMouseDown(e))
//       rstRef.current.addEventListener('mousemove', (e) => onMouseMove(e))
//       rstRef.current.addEventListener('mouseup', (e) => onMouseUp(e))
//     }
//   }, [rstRef.current])
//
//
//   function getMousePosition(e) {
//     let canvas = rstRef.current
//     let rect = canvas.getBoundingClientRect();
//     let x = Math.round((e.clientX || e.pageX) - rect.left),
//       y = Math.round((e.clientY || e.pageY) - rect.top);
//     return {x: x, y: y};
//   }
//
//   function onMouseDown(e) {
//     if (e.button === 0) {
//       // console.log('되고 있는거?')
//       console.log('onMouseDown 타짐')
//       allowDraw = true;
//       addMode = e.ctrlKey;
//       downPoint = getMousePosition(e);
//       drawMask(downPoint.x, downPoint.y);
//     } else {
//       allowDraw = false;
//       addMode = false;
//       oldMask = null;
//     }
//     // console.log('allowDraw: ', allowDraw)
//   }
//
//   function onMouseMove(e) {
//     if (allowDraw) {
//       console.log('onMouseMove 타짐')
//       e.preventDefault()
//       let p = getMousePosition(e);
//       if (p.x !== downPoint.x || p.y !== downPoint.y) {
//         let dx = p.x - downPoint.x,
//           dy = p.y - downPoint.y,
//           len = Math.sqrt(dx * dx + dy * dy),
//           adx = Math.abs(dx),
//           ady = Math.abs(dy),
//           sign = adx > ady ? dx / adx : dy / ady;
//         sign = sign < 0 ? sign / 5 : sign / 3;
//         let thres = Math.min(Math.max(colorThreshold + Math.floor(sign * len), 1), 255);
//         //let thres = Math.min(colorThreshold + Math.floor(len / 3), 255);
//         if (thres !== currentThreshold) {
//           currentThreshold = thres;
//           drawMask(downPoint.x, downPoint.y);
//         }
//       }
//     }
//     // console.log("실행 완료")
//   }
//
//
//   function onMouseUp(e) {
//     allowDraw = false;
//     addMode = false;
//     oldMask = null;
//     currentThreshold = colorThreshold;
//   }
//
//   async function showThreshold() {
//     let thresholdDiv = await document.getElementById("tooltip-span")
//     if (thresholdDiv) {
//       thresholdDiv.innerHTML += "<br>Threshold: " + currentThreshold;
//     }
//   }
//
//   function drawMask(x, y) {
//     if (!imageInfo) return;
//
//     // showThreshold();
//
//     let image = {
//       data: imageInfo.data.data,
//       width: imageInfo.width,
//       height: imageInfo.height,
//       bytes: 4
//     };
//
//     if (addMode && !oldMask) {
//       oldMask = mask;
//     }
//
//     let old = oldMask ? oldMask.data : null;
//
//     // console.log("image: ", image)
//     mask = MagicWand.floodFill(image, x, y, currentThreshold, old, true);
//     if (mask) mask = MagicWand.gaussBlurOnlyBorder(mask, blurRadius, old);
//
//     // console.log('mask:', mask)
//     if (addMode && oldMask) {
//       mask = mask ? concatMasks(mask, oldMask) : oldMask;
//     }
//
//     drawBorder(false);
//   }
//
//   function drawBorder(noBorder) {
//     if (!mask) return;
//
//     // console.log("imageWidth", imageInfo.width)
//     // console.log("imageHeight", imageInfo.height)
//     let x, y, i, j, k,
//       w = imageInfo.width,
//       h = imageInfo.height,
//       ctx = imageInfo.context,
//       rstCtx = imageInfo.rstCtx,
//       imgData = rstCtx.createImageData(w, h),
//       res = imgData.data;
//
//
//     if (!noBorder) cacheInd = MagicWand.getBorderIndices(mask);
//
//     // console.log("drawborder 탐", imgData)
//     // console.log("cacheInd: ", cacheInd)
//
//     rstCtx.clearRect(0, 0, w, h);
//
//     let len = cacheInd.length;
//     for (j = 0; j < len; j++) {
//       i = cacheInd[j];
//       x = i % w; // calc x by index
//       y = (i - x) / w; // calc y by index
//       k = (y * w + x) * 4;
//       if ((x + y + hatchOffset) % (hatchLength * 2) < hatchLength) { // detect hatch color
//         res[k + 3] = 255; // black, change only alpha
//       } else {
//         res[k] = 255; // white
//         res[k + 1] = 255;
//         res[k + 2] = 255;
//         res[k + 3] = 255;
//       }
//     }
//
//     trace()
//     // rstCtx.putImageData(imgData, 0, 0);
//   }
//
//   document.addEventListener('keypress', function (e) {
//     if (e.key === "Enter") {
//       let ctx = imageInfo.rstCtx;
//       ctx.clearRect(0, 0, imageInfo.width, imageInfo.height);
//       // trace()
//       // paint("5c6fff", 0.5)
//       setPolygon(cs)
//     }
//   })
//
//   function trace() {
//     console.log("mask: ", mask)
//     if (!mask) return;
//     cs = MagicWand.traceContours(mask);
//     cs = MagicWand.simplifyContours(cs, simplifyTolerant, simplifyCount);
//     // mask = null;
//     cs = cs.filter(x => !x.inner);
//     // draw contours
//     let ctx = imageInfo.rstCtx;
//     // ctx.clearRect(0, 0, imageInfo.width, imageInfo.height);
//
//     //outer
//     let poly = new Path2D()
//     // ctx.beginPath();
//     for (let k = 0; k < cs.length; k++) {
//       let pts2 = cs[k].points;
//       poly.moveTo(pts2[0].x, pts2[0].y);
//       for (let l = 1; l < pts2.length; l++) {
//         poly.lineTo(pts2[l].x, pts2[l].y);
//       }
//     }
//     ctx.strokeStyle = "blue";
//     ctx.stroke(poly);
//   }
//
//   // =pt================= polygon test ======================
//   // =pt================= polygon test ======================
//   // =pt================= polygon test ======================
//   const [points, setPoints] = useState([]); // 폴리곤 꼭짓점들을 상태값으로 설정
//   let plgCanvas;
//   let polygon;
//   useEffect(() => {
//     function initPolygon() {
//       plgCanvas = new fabric.Canvas(plgRef.current)
//       console.log(plgCanvas)
//       // 그릴 폴리곤 option 넣고 생성
//       polygon = new fabric.Polygon(points, {
//         opacity: 0.5,
//         fill: 'skyblue',
//         strokeWidth: 2,
//         stroke: 'green',
//         cornerColor: 'red',
//         lockMovementX: true,
//         lockMovementY: true,
//         cornerStyle: 'rect',
//         cornerSize: 5,
//         edit: true,
//         objectCaching: false,
//       })
//       // plgCanvas.setActiveObject(polygon)
//       // polygon.controls 는 폴리곤의 꼭짓점들에 컨트롤이 가능하도록해주는 컨트롤러 객체들
//       // fabric.Control을 통해서 컨트롤러들에 대한 설정을 해줌
//       let lastControl = polygon.points.length - 1;
//       polygon.controls = polygon.points.reduce(function (acc, point, index) {
//         acc['p' + index] = new fabric.Control({
//           positionHandler: polygonPositionHandler,
//           actionHandler: anchorWrapper(index > 0 ? index - 1 : lastControl, actionHandler),
//           actionName: 'modifyPolygon',
//           pointIndex: index
//         });
//         return acc;
//       }, {});
//       polygon.hasBorders = !polygon.edit;
//
//       plgCanvas.add(polygon)
//       plgCanvas.requestRenderAll();
//     }
//
//     initPolygon()
//     // setTimeout(() => initPolygon(), 100) // 폴리곤을 그릴 캔버스를 패브릭으로 설정
//   }, [plgRef.current, points])
//
//
//   // useEffect(() => {
//   //   if (plgCanvas !== null) {
//   //     if (drawMode) {
//   //       // plgCanvas.sendToBack()
//   //     } else {
//   //       // plgCanvas.bringToFront()
//   //     }
//   //   }
//   // }, [drawMode, plgCanvas])
//
//
//   function polygonPositionHandler(dim, finalMatrix, fabricObject) {
//     let x = (fabricObject.points[this.pointIndex].x - fabricObject.pathOffset.x),
//       y = (fabricObject.points[this.pointIndex].y - fabricObject.pathOffset.y);
//     return fabric.util.transformPoint(
//       {x: x, y: y},
//       fabric.util.multiplyTransformMatrices(
//         fabricObject.canvas.viewportTransform,
//         fabricObject.calcTransformMatrix()
//       )
//     );
//   }
//
//   function anchorWrapper(anchorIndex, fn) {
//     return function (eventData, transform, x, y) {
//       let fabricObject = transform.target,
//         absolutePoint = fabric.util.transformPoint({
//           x: (fabricObject.points[anchorIndex].x - fabricObject.pathOffset.x),
//           y: (fabricObject.points[anchorIndex].y - fabricObject.pathOffset.y),
//         }, fabricObject.calcTransformMatrix()),
//         actionPerformed = fn(eventData, transform, x, y),
//         newDim = fabricObject._setPositionDimensions({}),
//         polygonBaseSize = getObjectSizeWithStroke(fabricObject),
//         newX = (fabricObject.points[anchorIndex].x - fabricObject.pathOffset.x) / polygonBaseSize.x,
//         newY = (fabricObject.points[anchorIndex].y - fabricObject.pathOffset.y) / polygonBaseSize.y;
//       fabricObject.setPositionByOrigin(absolutePoint, newX + 0.5, newY + 0.5);
//       return actionPerformed;
//     }
//   }
//
//   function getObjectSizeWithStroke(object) {
//     let stroke = new fabric.Point(
//       object.strokeUniform ? 1 / object.scaleX : 1,
//       object.strokeUniform ? 1 / object.scaleY : 1
//     ).multiply(object.strokeWidth);
//     return new fabric.Point(object.width + stroke.x, object.height + stroke.y);
//   }
//
//   function actionHandler(eventData, transform, x, y) {
//     let polygon = transform.target,
//       currentControl = polygon.controls[polygon.__corner],
//       mouseLocalPosition = polygon.toLocalPoint(new fabric.Point(x, y), 'center', 'center'),
//       polygonBaseSize = getObjectSizeWithStroke(polygon),
//       size = polygon._getTransformedDimensions(0, 0),
//       finalPointPosition = {
//         x: mouseLocalPosition.x * polygonBaseSize.x / size.x + polygon.pathOffset.x,
//         y: mouseLocalPosition.y * polygonBaseSize.y / size.y + polygon.pathOffset.y
//       };
//     polygon.points[currentControl.pointIndex] = finalPointPosition;
//     return true;
//   }
//
//
//   function setPolygon(cs) {
//     setPoints(cs[0].points)
//   }
//
//
//   // =======================================
//   // =======================================
//   // =======================================
//
//   function paint(color, alpha) {
//     if (!mask) return;
//
//     let rgba = hexToRgb(color, alpha);
//
//     let x, y,
//       data = mask.data,
//       bounds = mask.bounds,
//       maskW = mask.width,
//       w = imageInfo.width,
//       h = imageInfo.height,
//       ctx = imageInfo.plgCtx,
//       imgData = ctx.createImageData(w, h),
//       res = imgData.data;
//
//     for (y = bounds.minY; y <= bounds.maxY; y++) {
//       for (x = bounds.minX; x <= bounds.maxX; x++) {
//         if (data[y * maskW + x] === 0) continue;
//         let k = (y * w + x) * 4;
//         res[k] = rgba[0];
//         res[k + 1] = rgba[1];
//         res[k + 2] = rgba[2];
//         res[k + 3] = rgba[3];
//       }
//     }
//
//     mask = null;
//
//     ctx.putImageData(imgData, 0, 0);
//   }
//
//   function hexToRgb(hex, alpha) {
//     let int = parseInt(hex, 16);
//     let r = (int >> 16) & 255;
//     let g = (int >> 8) & 255;
//     let b = int & 255;
//
//     return [r, g, b, Math.round(alpha * 255)];
//   }
//
//   function concatMasks(mask, old) {
//     let
//       data1 = old.data,
//       data2 = mask.data,
//       w1 = old.width,
//       w2 = mask.width,
//       b1 = old.bounds,
//       b2 = mask.bounds,
//       b = { // bounds for new mask
//         minX: Math.min(b1.minX, b2.minX),
//         minY: Math.min(b1.minY, b2.minY),
//         maxX: Math.max(b1.maxX, b2.maxX),
//         maxY: Math.max(b1.maxY, b2.maxY)
//       },
//       w = old.width, // size for new mask
//       h = old.height,
//       i, j, k, k1, k2, len;
//
//     let result = new Uint8Array(w * h);
//
//     // copy all old mask
//     len = b1.maxX - b1.minX + 1;
//     i = b1.minY * w + b1.minX;
//     k1 = b1.minY * w1 + b1.minX;
//     k2 = b1.maxY * w1 + b1.minX + 1;
//     // walk through rows (Y)
//     for (k = k1; k < k2; k += w1) {
//       result.set(data1.subarray(k, k + len), i); // copy row
//       i += w;
//     }
//
//     // copy new mask (only "black" pixels)
//     len = b2.maxX - b2.minX + 1;
//     i = b2.minY * w + b2.minX;
//     k1 = b2.minY * w2 + b2.minX;
//     k2 = b2.maxY * w2 + b2.minX + 1;
//     // walk through rows (Y)
//     for (k = k1; k < k2; k += w2) {
//       // walk through cols (X)
//       for (j = 0; j < len; j++) {
//         if (data2[k + j] === 1) result[i + j] = 1;
//       }
//       i += w;
//     }
//
//     return {
//       data: result,
//       width: w,
//       height: h,
//       bounds: b
//     };
//   }
// }
//
// export default NukkiFabric