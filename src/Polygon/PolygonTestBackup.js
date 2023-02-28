import {useCallback, useEffect, useMemo, useState} from "react";
import $ from '../../node_modules/jquery/dist/jquery.min.js';
import {useRecoilState, useRecoilValue} from "recoil";
import {
  csState,
  drawPolygonState,
  imageInfoState,
  polygonObjListState, polygonKeyState, pointsState, alreadyDrewPolygonState
} from "../stateManagement/atoms/Nukki/nukkiAtom";

// let rerenderCount = 0
// let points = []
let imageInfo = {}

export default function Polygon({rstRef}) {
  // recoil state
  const tempCs = useRecoilValue(csState)
  const tempImageInfo = useRecoilValue(imageInfoState)
  const [polygonKey, setPolygonKey] = useRecoilState(polygonKeyState)
  const [draw, setDraw] = useRecoilState(drawPolygonState)
  const [points, setPoints] = useRecoilState(pointsState)
  const [polygonObjList, setPolygonObjList] = useRecoilState(polygonObjListState)
  const [drewPlgList, setDrewPlgList] = useRecoilState(alreadyDrewPolygonState)
  // local state


  // ===== console.log 영역 =====
  // rerenderCount ++
  // console.log("Polygon 리렌더", rerenderCount)
  // console.log("polygonObjList: ", polygonObjList)
  // console.log("points: ", points)
  // console.log("tempCs: ", tempCs)

  // console.log("drewPlgList: ", drewPlgList)
  // ===========================

  /**
   * polygon 을 그리는데 필요한 points 를
   * param 으로 받아온 cs를 가지고 상태값으로 설정해줌
   */

  useEffect(() => {
    if (tempCs[0]) {
      setPoints(tempCs[0].points)
    }
  }, [tempCs])

  useEffect(() => {
    imageInfo = tempImageInfo
  }, [tempImageInfo])

  function savePolygonObjects({polygonObjList, setPolygonObjList, polygonKey, points}) {
    setPolygonKey(polygonKey + 1)
    let polygonObj = {key: polygonKey, points: points, selected: false}

    let newObjList = [...polygonObjList, polygonObj]
    setPolygonObjList(newObjList)
  }

  document.addEventListener('keypress', (e) => {
    if (e.key === "Enter") {
      setDraw(true)
    }
  })

  document.addEventListener('mousemove', (e) => {
    if (draw) {
      setDraw(false)
    }
  })


  useEffect(() => {
    if (draw) {
      savePolygonObjects({polygonObjList, setPolygonObjList, polygonKey, points})
    }
  }, [draw])

  useEffect(() => {
    for (let plgObj of polygonObjList) {
      if (!drewPlgList.includes(plgObj.key)) {
        drawPolygon({plgObj, rstRef, drewPlgList, setDrewPlgList})
      }
    }
  }, [polygonObjList])
}


/**
 * points 가 정해지면 polygon 과 vertex(꼭짓점)를 그림
 * 외부 함수로 있고, 호출되는 타이밍에만 points를 읽어야함
 * (컴포넌트 내부에 있으면 상태값이 바뀔 때마다 함수가 재생성됨)
 */
export function drawPolygon({plgObj, rstRef, drewPlgList, setDrewPlgList}) {
  const resultCanvas = rstRef.current
  const rstCtx = resultCanvas.getContext('2d')

  // rstCtx.clearRect(0, 0, imageInfo.width, imageInfo.height);

  if (plgObj.points.length !== 0) {
    let polygon = new Path2D()
    polygon.moveTo(plgObj.points[0].x, plgObj.points[0].y);
    for (let i = 1; i < plgObj.points.length; i++) {
      polygon.lineTo(plgObj.points[i].x, plgObj.points[i].y);
    }
    rstCtx.fillStyle = "rgba(0, 100, 100, 0.5)"
    rstCtx.strokeStyle = "green";
    rstCtx.stroke(polygon);
    rstCtx.fill(polygon)

    if (plgObj.selected) {
      drawVertex({points: plgObj.points, rstRef})
    }

    if (!drewPlgList.includes(plgObj.key)) {
      setDrewPlgList([...drewPlgList, plgObj.key])
    }
  }

}

function drawVertex({points, rstRef}) {
  const resultCanvas = rstRef.current
  const rstCtx = resultCanvas.getContext('2d')

  let vert = new Path2D()
  for (let j = 0; j < points.length; j++) {
    vert.moveTo(points[j].x, points[j].y)
    vert.arc(points[j].x, points[j].y, 3, 0, Math.PI * 2, true)
  }


  vert.strokeWidth = 1
  rstCtx.fillStyle = 'red'
  rstCtx.strokeStyle = "red"
  rstCtx.stroke(vert)
  rstCtx.fill(vert)

  // resultCanvas.onClick = onVertMouseDown(window.event)
  //
  // function onVertMouseDown(e) {
  //   console.log("onVertMouseDown: ", e)
  //   let x = e.pageX;
  //   let y = e.pageY;
  //   if(rstCtx.isPointInPath(vert, x,  y)) {
  //
  //   }
  // }
  //
  // function onVertMouseMove() {
  //
  // }
  //
  // function onVertMouseUp() {
  //
  // }
}



// polygon.js로 nukki에 있던 상태값 관련된 내용 옮기기 전 백업 02271007