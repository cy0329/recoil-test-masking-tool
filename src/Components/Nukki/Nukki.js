import React, {useEffect, useState} from 'react'
import MagicWand from "magic-wand-tool"
import $ from '../../../node_modules/jquery/dist/jquery.min.js';

import Paper from 'paper'


export function Nukki({imgRef, rstRef}) {
  let colorThreshold = 15;
  let blurRadius = 5;
  let simplifyTolerant = 0;
  let simplifyCount = 30;
  let hatchLength = 4;
  let hatchOffset = 0;
  let imageInfo = null
  let cacheInd = null;
  let mask = null;
  let oldMask = null;
  let downPoint = null;
  let allowDraw = false;
  let addMode = false;
  let currentThreshold = colorThreshold;

  let resultLayer = null;

  console.log('리렌더')

  // imageInfo 초기 설정
  useEffect(() => {
    function initImageInfo() {

      const imgCtx = imgRef.current.getContext('2d')
      const rstCtx = rstRef.current.getContext('2d')
      const imageData = imgCtx.getImageData(0, 0, imgCtx.canvas.width, imgCtx.canvas.height)
      // console.log(imgCtx.canvas.width, imgCtx.canvas.height)
      imageInfo = {
        width: imageData.width,
        height: imageData.height,
        context: imgCtx,
        rstCtx: rstCtx,
        data: imageData
      };
      mask = null;
      // console.log('initImageInfo 실행')
      // console.log(imageInfo)
    }

    setTimeout(() => initImageInfo(), 1000)

  }, [imgRef.current, rstRef.current])

  useEffect(() => {
    if (rstRef.current.id === 'result-layer') {
      rstRef.current.addEventListener('mousedown', (e) => onMouseDown(e))
      rstRef.current.addEventListener('mousemove', (e) => onMouseMove(e))
      rstRef.current.addEventListener('mouseup', (e) => onMouseUp(e))
      // frtRef.current.removeEventListener('mouseclick')
      // console.log('이벤트리스너 등록')
    }
  }, [rstRef.current])


  function getMousePosition(e) {
    let canvas = rstRef.current
    let rect = canvas.getBoundingClientRect();
    let x = Math.round((e.clientX || e.pageX) - rect.left),
      y = Math.round((e.clientY || e.pageY) - rect.top);
    return {x: x, y: y};
  }

  let hatchTickInterval = setInterval(function () {
    hatchTick();
  }, 300);

  function onMouseDown(e) {
    if (e.button === 0) {
      // console.log('되고 있는거?')
      allowDraw = true;
      addMode = e.ctrlKey;
      downPoint = getMousePosition(e);
      drawMask(downPoint.x, downPoint.y);
    } else {
      allowDraw = false;
      addMode = false;
      oldMask = null;
    }
    // console.log('allowDraw: ', allowDraw)
  }

  function onMouseMove(e) {
    if (allowDraw) {
      // console.log('허용쪽 실행')
      e.preventDefault()
      let p = getMousePosition(e);
      if (p.x !== downPoint.x || p.y !== downPoint.y) {
        let dx = p.x - downPoint.x,
          dy = p.y - downPoint.y,
          len = Math.sqrt(dx * dx + dy * dy),
          adx = Math.abs(dx),
          ady = Math.abs(dy),
          sign = adx > ady ? dx / adx : dy / ady;
        sign = sign < 0 ? sign / 5 : sign / 3;
        let thres = Math.min(Math.max(colorThreshold + Math.floor(sign * len), 1), 255);
        //let thres = Math.min(colorThreshold + Math.floor(len / 3), 255);
        if (thres !== currentThreshold) {
          currentThreshold = thres;
          drawMask(downPoint.x, downPoint.y);
        }
      }
    }
    // console.log("실행 완료")
  }


  function onMouseUp(e) {
    allowDraw = false;
    addMode = false;
    oldMask = null;
    currentThreshold = colorThreshold;
    // clearInterval(hatchTickInterval)
  }

  async function showThreshold() {
    let thresholdDiv = await document.getElementById("tooltip-span")
    if (thresholdDiv) {
      thresholdDiv.innerHTML += "<br>Threshold: " + currentThreshold;
    }
  }

  function drawMask(x, y) {
    if (!imageInfo) return;

    // showThreshold();

    let image = {
      data: imageInfo.data.data,
      width: imageInfo.width,
      height: imageInfo.height,
      bytes: 4
    };

    if (addMode && !oldMask) {
      oldMask = mask;
    }

    let old = oldMask ? oldMask.data : null;

    // console.log("image: ", image)
    mask = MagicWand.floodFill(image, x, y, currentThreshold, old, true);
    if (mask) mask = MagicWand.gaussBlurOnlyBorder(mask, blurRadius, old);

    // console.log('mask:', mask)
    if (addMode && oldMask) {
      mask = mask ? concatMasks(mask, oldMask) : oldMask;
    }

    drawBorder(false);
  }

  function hatchTick() {
    hatchOffset = (hatchOffset + 1) % (hatchLength * 2);
    drawBorder(true);
  }

  function drawBorder(noBorder) {
    if (!mask) return;

    // console.log("imageWidth", imageInfo.width)
    // console.log("imageHeight", imageInfo.height)
    let x, y, i, j, k,
      w = imageInfo.width,
      h = imageInfo.height,
      ctx = imageInfo.context,
      rstCtx = imageInfo.rstCtx,
      imgData = rstCtx.createImageData(w, h),
      res = imgData.data;


    if (!noBorder) cacheInd = MagicWand.getBorderIndices(mask);

    // console.log("drawborder 탐", imgData)
    // console.log("cacheInd: ", cacheInd)

    rstCtx.clearRect(0, 0, w, h);

    let len = cacheInd.length;
    for (j = 0; j < len; j++) {
      i = cacheInd[j];
      x = i % w; // calc x by index
      y = (i - x) / w; // calc y by index
      k = (y * w + x) * 4;
      if ((x + y + hatchOffset) % (hatchLength * 2) < hatchLength) { // detect hatch color
        res[k + 3] = 255; // black, change only alpha
      } else {
        res[k] = 255; // white
        res[k + 1] = 255;
        res[k + 2] = 255;
        res[k + 3] = 255;
      }
    }

    trace()
    // rstCtx.putImageData(imgData, 0, 0);
  }

  document.addEventListener('keypress', function (e) {
    if (e.key === "Enter"){
      // trace()
      paint("5c6fff", 0.5)
    }
  })
  function trace() {
    if (!mask) return;
    let cs = MagicWand.traceContours(mask);
    cs = MagicWand.simplifyContours(cs, simplifyTolerant, simplifyCount);
    // mask = null;

    // draw contours
    let ctx = imageInfo.rstCtx;
    // ctx.clearRect(0, 0, imageInfo.width, imageInfo.height);
    //inner
    ctx.beginPath();
    for (let i = 0; i < cs.length; i++) {
      if (!cs[i].inner) continue;
      let ps = cs[i].points;
      ctx.moveTo(ps[0].x, ps[0].y);
      for (let j = 1; j < ps.length; j++) {
        ctx.lineTo(ps[j].x, ps[j].y);
      }
    }
    ctx.strokeStyle = "red";
    ctx.stroke();
    //outer
    ctx.beginPath();
    for (let k = 0; k < cs.length; k++) {
      if (cs[k].inner) continue;
      let ps2 = cs[k].points;
      ctx.moveTo(ps2[0].x, ps2[0].y);
      for (let l = 1; l < ps2.length; l++) {
        ctx.lineTo(ps2[l].x, ps2[l].y);
      }
    }
    ctx.strokeStyle = "blue";
    ctx.stroke();
  }

  function paint(color, alpha) {
    if (!mask) return;

    let rgba = hexToRgb(color, alpha);

    let x, y,
      data = mask.data,
      bounds = mask.bounds,
      maskW = mask.width,
      w = imageInfo.width,
      h = imageInfo.height,
      ctx = imageInfo.rstCtx,
      imgData = ctx.createImageData(w, h),
      res = imgData.data;

    for (y = bounds.minY; y <= bounds.maxY; y++) {
      for (x = bounds.minX; x <= bounds.maxX; x++) {
        if (data[y * maskW + x] === 0) continue;
        let k = (y * w + x) * 4;
        res[k] = rgba[0];
        res[k + 1] = rgba[1];
        res[k + 2] = rgba[2];
        res[k + 3] = rgba[3];
      }
    }

    mask = null;

    ctx.putImageData(imgData, 0, 0);
  }

  function hexToRgb(hex, alpha) {
    let int = parseInt(hex, 16);
    let r = (int >> 16) & 255;
    let g = (int >> 8) & 255;
    let b = int & 255;

    return [r, g, b, Math.round(alpha * 255)];
  }

  function concatMasks(mask, old) {
    let
      data1 = old.data,
      data2 = mask.data,
      w1 = old.width,
      w2 = mask.width,
      b1 = old.bounds,
      b2 = mask.bounds,
      b = { // bounds for new mask
        minX: Math.min(b1.minX, b2.minX),
        minY: Math.min(b1.minY, b2.minY),
        maxX: Math.max(b1.maxX, b2.maxX),
        maxY: Math.max(b1.maxY, b2.maxY)
      },
      w = old.width, // size for new mask
      h = old.height,
      i, j, k, k1, k2, len;

    let result = new Uint8Array(w * h);

    // copy all old mask
    len = b1.maxX - b1.minX + 1;
    i = b1.minY * w + b1.minX;
    k1 = b1.minY * w1 + b1.minX;
    k2 = b1.maxY * w1 + b1.minX + 1;
    // walk through rows (Y)
    for (k = k1; k < k2; k += w1) {
      result.set(data1.subarray(k, k + len), i); // copy row
      i += w;
    }

    // copy new mask (only "black" pixels)
    len = b2.maxX - b2.minX + 1;
    i = b2.minY * w + b2.minX;
    k1 = b2.minY * w2 + b2.minX;
    k2 = b2.maxY * w2 + b2.minX + 1;
    // walk through rows (Y)
    for (k = k1; k < k2; k += w2) {
      // walk through cols (X)
      for (j = 0; j < len; j++) {
        if (data2[k + j] === 1) result[i + j] = 1;
      }
      i += w;
    }

    return {
      data: result,
      width: w,
      height: h,
      bounds: b
    };
  }

  // return (
  //   <>
  //     <div style={{overflow: "auto"}}>
  //       <div style={{float: "left", marginRight: "10px"}}>Blur radius:</div>
  //       <input id="blurRadius" type="text" onChange={(e) => onRadiusChange(e)}
  //              style={{float: "left", width: "20px", marginRight: "10px"}}/>
  //       <div id="threshold"></div>
  //     </div>
  //     <div>(hold left mouse button and move to change the color threshold)</div>
  //     <div>(hold the CTRL key to add selection)</div>
  //     <div className='wrapper'>
  //       <div className='content'>
  //         <img id="test-picture" className="picture"/>
  //         <canvas className="canvas" id="resultCanvas" onMouseUp={(e) => onMouseUp(e)}
  //                 onMouseDown={(e) => onMouseDown(e)}
  //                 onMouseMove={(e) => onMouseMove(e)}></canvas>
  //       </div>
  //     </div>
  //   </>
  // )
}

export const MemoNukki = React.memo(Nukki)