import React, {useEffect, useMemo, useRef} from 'react';
import $ from '../../../node_modules/jquery/dist/jquery.min.js';

import {RecoilRoot, useRecoilState, useRecoilValue} from "recoil";

import Toolbar from "../Layouts/Toolbar";
import Jobsbar from "../Layouts/Jobsbar";
import TopMenu from "../Layouts/TopMenu";
import MouseCoordinator from "../Layouts/MouseCoordinator";
import NukkiFabric from "../Nukki/NukkiFabric";

import {filterState} from "../../stateManagement/atoms/canvasFilter/canvasFilterAtom";
import {csState, nukkiModeState, polygonObjListState} from "../../stateManagement/atoms/Nukki/nukkiAtom";

import './ImageEditor.css'
import NukkiPolygon from "../Nukki/NukkiPolygon";
import Polygon from "../../Polygon/Polygon";

const ImageEditor = () => {
  const maxCanvasWidth = window.innerWidth;
  const maxCanvasHeight = window.innerHeight;

  const filter = useRecoilValue(filterState)
  // const [nukkiMode, setNukkiMode] = useRecoilState(nukkiModeState)
  // const [polygonObjList, setPolygonObjList] = useRecoilState(polygonObjListState)

  // -----console.log 영역-----
  console.log("리렌더")

  // -------------------------


  // 캔버스 useRef로 계속 트래킹
  const imageCanvasRef = useRef(null);
  const mouseCdRef = useRef(null);
  const nukkiResultCanvasRef = useRef(null);
  // const polygonCanvasRef = useRef(null);


  const image = new Image();
  image.src = 'sample2.jpg'

  // 초기 이미지 세팅 + 필터링 변경시마다 캔버스 적용
  useEffect(() => {
    // const frontCanvas = mouseCdRef.current;
    // const frtCtx = frontCanvas.getContext('2d')
    const imgCanvas = imageCanvasRef.current;
    const imgCtx = imgCanvas.getContext('2d');
    const resultCanvas = nukkiResultCanvasRef.current;
    const rstCtx = resultCanvas.getContext('2d')
    // const plgCanvas = polygonCanvasRef.current;
    // const plgCtx = plgCanvas.getContext('2d')

    const mcDiv = mouseCdRef.current;

    let width;
    let height;

    // 이미지 스케일링
    image.onload = () => {
      let imageRatio = image.height / image.width
      // console.log('image.width: ', image.width, 'image.height: ', image.height, 'maxCanvasWidth: ', maxCanvasWidth, 'maxCanvasHeight: ', maxCanvasHeight, 'imageRatio: ', imageRatio)
      if (imageRatio < 1) {
        // 가로가 세로보다 긴 경우
        if (image.width > maxCanvasWidth) {
          let newHeight = image.height * (maxCanvasWidth / image.width)
          if (newHeight > maxCanvasHeight - 31) {
            height = maxCanvasHeight - 31
            width = image.width * ((maxCanvasHeight - 31) / image.height)
          } else {
            width = maxCanvasWidth
            height = newHeight
          }
        } else {
          if (image.height > maxCanvasHeight - 31) {
            width = image.width * ((maxCanvasHeight - 31) / image.height)
            height = maxCanvasHeight - 31
          } else {
            width = image.width
            height = image.height
          }
        }
      } else {
        // 가로가 세로보다 짧은 경우
        if (image.height > maxCanvasHeight - 31) {
          height = maxCanvasHeight - 31
          width = image.width * ((maxCanvasHeight - 31) / image.height)
        }
      }
      // canvas 3종 w, h 설정
      imgCtx.canvas.width = width
      imgCtx.canvas.height = height
      // frtCtx.canvas.width = width
      // frtCtx.canvas.height = height
      rstCtx.canvas.width = width
      rstCtx.canvas.height = height
      // plgCtx.canvas.width = width
      // plgCtx.canvas.height = height
      imgCtx.filter = filter
      imgCtx.drawImage(image, 0, 0, width, height);

      mcDiv.style.width = `${width}px`
      // console.log("width: ", width)
      // console.log("height: ", height)
      mcDiv.style.height = `${height}px`
    }
  });

  document.oncontextmenu = function () {
    return false
  }

  return (
    <div className="section">
      <TopMenu/>
      <NukkiPolygon imgRef={imageCanvasRef} rstRef={nukkiResultCanvasRef}/>
      <Polygon rstRef={nukkiResultCanvasRef}/>
      {/*<NukkiFabric imgRef={imageCanvasRef} rstRef={nukkiResultCanvasRef} plgRef={polygonCanvasRef}/>*/}
      <div id="mouse-coordinator" ref={mouseCdRef}>
        <MouseCoordinator ref1={imageCanvasRef}/>
        <canvas id="image-layer" ref={imageCanvasRef}/>
        <canvas id="result-layer" ref={nukkiResultCanvasRef}/>
        {/*<canvas id="polygon-layer" ref={polygonCanvasRef} />*/}
      </div>
      <Toolbar/>
      <Jobsbar/>
    </div>
  );
}

export default ImageEditor;
