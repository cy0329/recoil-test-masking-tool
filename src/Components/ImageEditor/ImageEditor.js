import React, {useEffect, useRef} from 'react';

import './imageEditor.css'
import {useRecoilState, useRecoilValue} from "recoil";
import {filterState} from "../../stateManagement/atoms/canvasFilter/canvasFilterAtom";
import Toolbar from "../Layouts/Toolbar";
import Jobsbar from "../Layouts/jobsbar";
import TopMenu from "../Layouts/topMenu";
import MouseCoordinator from "../Layouts/mouseCoordinator";
import {MemoNukki} from "../Nukki/Nukki";


const ImageEditor = () => {
  const maxCanvasWidth = window.innerWidth;
  const maxCanvasHeight = window.innerHeight;

  const filter = useRecoilValue(filterState)
  // -------------------------
  console.log("imageEditor 리렌더")

  // -------------------------


  // 캔버스 useRef로 계속 트래킹
  const canvasRef1 = useRef(null);
  const canvasRef2 = useRef(null);
  const canvasRef3 = useRef(null);


  const image = new Image();
  image.src = 'sample2.jpg'

  // 초기 이미지 세팅 + 필터링 변경시마다 캔버스 적용
  useEffect(() => {
    // const frontCanvas = canvasRef2.current;
    // const frtCtx = frontCanvas.getContext('2d')
    const imgCanvas = canvasRef1.current;
    const imgCtx = imgCanvas.getContext('2d');
    const resultCanvas = canvasRef3.current;
    const rstCtx = resultCanvas.getContext('2d')

    const mcDiv = canvasRef2.current;

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
      imgCtx.filter = filter
      imgCtx.drawImage(image, 0, 0, width, height);

      mcDiv.style.width = `${width}px`
      console.log("width: ", width)
      console.log("height: ", height)
      mcDiv.style.height = `${height}px`
    }
  });



  // 캔버스 누끼 이벤트 핸들러 --> 누끼 컴포넌트에서 함수만 가져다 쓰기..?
  // onMouseDown, onMouseMove 등등 함수들에 상태값 변경을 redux action으로 변경


  return (
    <div className="section">
      <TopMenu/>
      <MemoNukki imgRef={canvasRef1} rstRef={canvasRef3}/>
      {/*<canvas id="front-layer" ref={canvasRef2}/>*/}
      <div id="mouse-coordinator" ref={canvasRef2}>
        <MouseCoordinator ref1={canvasRef1}/>
        <canvas id="image-layer" ref={canvasRef1}/>
        <canvas id="result-layer" ref={canvasRef3}/>
      </div>
      <Toolbar/>
      <Jobsbar/>
    </div>
  );
}

export default ImageEditor;
