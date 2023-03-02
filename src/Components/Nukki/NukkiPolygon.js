import React, {useCallback, useEffect, useMemo, useState} from 'react'
import MagicWand from "magic-wand-tool"
import {useRecoilState, useRecoilValue, useResetRecoilState, useSetRecoilState} from "recoil";


import {
  allowDrawState,
  alreadyDrewPolygonState,
  csState,
  imageInfoState,
  nukkiModeState,
  polygonObjListState
} from "../../stateManagement/atoms/Nukki/nukkiAtom";
import {drawPolygon, drawVertex, /*handleResultCanvasClickEvent*/} from "../../Polygon/Polygon";

let rerenderCount = 0

function NukkiPolygon({imgRef, rstRef}) {
  const setTempCs = useSetRecoilState(csState)
  const resetTempCs = useResetRecoilState(csState)
  const [tempImageInfo, setTempImageInfo] = useRecoilState(imageInfoState)

  const [polygonObjList, setPolygonObjList] = useRecoilState(polygonObjListState)
  const [drewPlgList, setDrewPlgList] = useRecoilState(alreadyDrewPolygonState)
  const [nukkiMode, setNukkiMode] = useRecoilState(nukkiModeState)

  // 누끼에서 필요한 변수들 (상태값이면 안됨)
  let colorThreshold = 15;
  let blurRadius = 5;
  let simplifyTolerant = 2;
  let simplifyCount = 30;
  let imageInfo = null
  let mask = null;
  let oldMask = null;
  let downPoint = null;
  let allowDraw = false;
  let addMode = false;
  let currentThreshold = colorThreshold;


  // ===== console log 영역 =====
  rerenderCount++
  console.log('Nukki 리렌더', rerenderCount)
  // console.log('tempImageInfo: ', tempImageInfo)
  console.log('nukkiMode in nukki.js : ', nukkiMode)

  // ============================
  // imageInfo 초기 설정
  useEffect(() => {
    function initImageInfo() {
      const imgCtx = imgRef.current.getContext('2d')
      const rstCtx = rstRef.current.getContext('2d')
      const imageData = imgCtx.getImageData(0, 0, imgCtx.canvas.width, imgCtx.canvas.height)
      imageInfo = {
        width: imageData.width,
        height: imageData.height,
        context: imgCtx,
        rstCtx: rstCtx,
        data: imageData
      };
      mask = null;
      setTempImageInfo(imageInfo)
    }

    setTimeout(() => initImageInfo(), 50)
  }, [imgRef.current])

  useEffect(() => {
    console.log('nukkiMode in addeventlistener useeffect : ', nukkiMode)
    if (rstRef.current.id === 'result-layer' && nukkiMode) {
      console.log('=====누끼모드 true=====')
      rstRef.current.addEventListener('mousedown', onMouseDown)
      rstRef.current.addEventListener('mousemove', onMouseMove)
      rstRef.current.addEventListener('mouseup', onMouseUp)
    } else if (rstRef.current.id === 'result-layer' && !nukkiMode) {
      console.log('=====누끼모드 false=====')
      rstRef.current.removeEventListener('mousedown', onMouseDown)
      rstRef.current.removeEventListener('mousemove', onMouseMove)
      rstRef.current.removeEventListener('mouseup', onMouseUp)
    }
    // return () => {
    //   rstRef.current.removeEventListener('mousedown', onMouseDown)
    //   rstRef.current.removeEventListener('mousemove', onMouseMove)
    //   rstRef.current.removeEventListener('mouseup', onMouseUp)
    // }

  }, [nukkiMode])


  useEffect(() => {
    for (let plgObj of polygonObjList) {
      if (!drewPlgList.includes(plgObj.key)) {
        drawPolygon({plgObj, rstRef})
        setDrewPlgList([...drewPlgList, plgObj.key])
      }
      if (plgObj.selected) {
        drawVertex({points: plgObj.points, rstRef})
      }
    }

    rstRef.current.addEventListener('mousedown', mouseDownHandler)

    return () => {
      rstRef.current.removeEventListener('mousedown', mouseDownHandler)
    }
  }, [polygonObjList])

  function mouseDownHandler(e) {
    handleResultCanvasClickEvent(e)
  }

  function getMousePosition(e) {
    let canvas = rstRef.current
    let rect = canvas.getBoundingClientRect();
    let x = Math.round((e.clientX || e.pageX) - rect.left),
      y = Math.round((e.clientY || e.pageY) - rect.top);
    return {x: x, y: y};
  }

  // polygonObjList가 바뀔때 재생성 되어야 함
  function onMouseDown(e) {
    if (e.button === 0) {
      allowDraw = nukkiMode;
      addMode = e.ctrlKey;
      downPoint = getMousePosition(e);
      // drawMask(downPoint.x, downPoint.y, true);
      resetTempCs()
    } else {
      allowDraw = false;
      addMode = false;
      oldMask = null;
    }
  }

  function onMouseMove(e) {
    if (allowDraw) {
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
  }

  function onMouseUp(e) {
    allowDraw = false;
    addMode = false;
    oldMask = null;
    currentThreshold = colorThreshold;
  }

  function drawMask(x, y, fromMouseDownEvent) {
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

    mask = MagicWand.floodFill(image, x, y, currentThreshold, old, true);
    if (mask) mask = MagicWand.gaussBlurOnlyBorder(mask, blurRadius, old);

    if (addMode && oldMask) {
      mask = mask ? concatMasks(mask, oldMask) : oldMask;
    }

    if (!fromMouseDownEvent){
      trace()
    }
  }

  function trace() {
    if (!mask) return;
    // console.log('mask: ', mask)
    let cs = MagicWand.traceContours(mask);
    cs = MagicWand.simplifyContours(cs, simplifyTolerant, simplifyCount);
    cs = cs.filter(x => !x.inner);

    // draw contours
    let ctx = imageInfo.rstCtx;
    ctx.clearRect(0, 0, imageInfo.width, imageInfo.height);

    // cs변경시키는 놈은 얘 뿐
    setTempCs(cs)
    //outer
    let poly = new Path2D()
    // ctx.beginPath();
    for (let k = 0; k < cs.length; k++) {
      let pts2 = cs[k].points;
      poly.moveTo(pts2[0].x, pts2[0].y);
      for (let l = 1; l < pts2.length; l++) {
        poly.lineTo(pts2[l].x, pts2[l].y);
      }
    }
    ctx.strokeStyle = "blue";
    ctx.stroke(poly);
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

  /**
   * 로컬 변수 사용하기 위해 함수 이전
   */
  function handleResultCanvasClickEvent(e) {

    let clickedPlgKey = 0;
    for (let k = 0; k < polygonObjList.length; k++) {
      let polygon = new Path2D()
      if (polygonObjList[k].points.length > 0) {
        polygon.moveTo(polygonObjList[k].points[0].x, polygonObjList[k].points[0].y);
        for (let i = 1; i < polygonObjList[k].points.length; i++) {
          polygon.lineTo(polygonObjList[k].points[i].x, polygonObjList[k].points[i].y);
        }
      }

      let mousePoint = getMousePosition(e)
      let inPolygon = rstRef.current.getContext('2d').isPointInPath(polygon, mousePoint.x, mousePoint.y)

      if (inPolygon) {
        // polygon click
        clickedPlgKey = polygonObjList[k].key
        setNukkiMode(false)
      }
    }

    if (clickedPlgKey === 0) {
      let copyPlgList = [...polygonObjList]
      for (let i = 0; i < copyPlgList.length; i++) {
        let copyObj = {...copyPlgList[i]}
        copyObj.selected = false;
        copyPlgList[i] = copyObj
      }
      setPolygonObjList(copyPlgList)
      setNukkiMode(true)
    } else {
      let copyPlgList = [...polygonObjList]
      for (let i = 0; i < copyPlgList.length; i++) {
        let copyObj = {...copyPlgList[i]}
        copyObj.selected = copyObj.key === clickedPlgKey;
        copyPlgList[i] = copyObj
      }
      setPolygonObjList(copyPlgList)
    }

    // 지우고 다시 그리기
    rstRef.current.getContext('2d').clearRect(0, 0, tempImageInfo.width, tempImageInfo.height)
    for (let plgObj of polygonObjList) {
      drawPolygon({plgObj, rstRef})
    }
  }


  /**
   * 아직 안씀
   * paint
   * hexToRgb
   * showThreshold
   */
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

    // mask = null;

    ctx.putImageData(imgData, 0, 0);
  }

  function hexToRgb(hex, alpha) {
    let int = parseInt(hex, 16);
    let r = (int >> 16) & 255;
    let g = (int >> 8) & 255;
    let b = int & 255;

    return [r, g, b, Math.round(alpha * 255)];
  }

  async function showThreshold() {
    let thresholdDiv = await document.getElementById("tooltip-span")
    if (thresholdDiv) {
      thresholdDiv.innerHTML += "<br>Threshold: " + currentThreshold;
    }
  }
}

export default NukkiPolygon
