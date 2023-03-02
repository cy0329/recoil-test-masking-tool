import {useCallback, useEffect, useMemo, useState} from "react";
import $ from '../../node_modules/jquery/dist/jquery.min.js';
import {useRecoilCallback, useRecoilState, useRecoilValue} from "recoil";
import {
  csState,
  drawPolygonState,
  imageInfoState,
  polygonObjListState, polygonKeyState, pointsState, alreadyDrewPolygonState, nukkiModeState
} from "../stateManagement/atoms/Nukki/nukkiAtom";
import {pointsByCsSelector} from "../stateManagement/selectors/NukkiPolygon/PolygonSelector";

let rerenderCount = 0
// let points = []
let imageInfo = {}

export default function Polygon({rstRef}) {
  // recoil state
  // const tempCs = useRecoilValue(csState)
  // const [points, setPoints] = useRecoilState(pointsState)
  const points = useRecoilValue(pointsByCsSelector)

  const tempImageInfo = useRecoilValue(imageInfoState)
  const [polygonKey, setPolygonKey] = useRecoilState(polygonKeyState)
  const [draw, setDraw] = useRecoilState(drawPolygonState)

  const [polygonObjList, setPolygonObjList] = useRecoilState(polygonObjListState)
  const [drewPlgList, setDrewPlgList] = useRecoilState(alreadyDrewPolygonState)
  const [nukkiMode, setNukkiMode] = useRecoilState(nukkiModeState)
  // local state



  // ===== console.log 영역 =====
  // console.log("Polygon 리렌더", rerenderCount)
  // console.log("polygonObjList: ", polygonObjList)

  // ===========================

  useEffect(() => {
    if (draw) {
      savePolygonObjects({polygonObjList, setPolygonObjList, polygonKey, points})
    }
  }, [draw])

  // useEffect(() => {
  //   for (let plgObj of polygonObjList) {
  //     // console.log("key: ", plgObj.key)
  //     if (!drewPlgList.includes(plgObj.key)) {
  //       drawPolygon({plgObj, rstRef/*, drewPlgList, setDrewPlgList*/})
  //       setDrewPlgList([...drewPlgList, plgObj.key])
  //     }
  //     if (plgObj.selected) {
  //       drawVertex({points: plgObj.points, rstRef})
  //     }
  //   }
  //   document.addEventListener('mousedown', mouseDownHandler)
  //
  //   return () => {
  //     document.removeEventListener('mousedown', mouseDownHandler)
  //   }
  // }, [polygonObjList])
  //
  // function mouseDownHandler(e) {
  //   handleResultCanvasClickEvent({plgObjList: polygonObjList, rstRef, event: e, setPolygonObjList, setNukkiMode, tempImageInfo})
  // }

  useEffect(() => {
    console.log("cs가 변경 => points 변경 => drawPolygon")
    // rstRef.current.getContext('2d').clearRect(0, 0, tempImageInfo.width, tempImageInfo.height)
    for (let plgObj of polygonObjList) {
      drawPolygon({plgObj, rstRef/*, drewPlgList, setDrewPlgList*/})
    }
  }, [points])


  const savePolygonObjects = useCallback(({polygonObjList, setPolygonObjList, polygonKey, points}) => {
    setPolygonKey(polygonKey + 1)
    let polygonObj = {key: polygonKey, points: points, selected: false}

    let newObjList = [...polygonObjList, polygonObj]
    setPolygonObjList(newObjList)
  }, [polygonObjList])

  document.addEventListener('keydown', (e) => {
    if (e.key === "Enter") {
      setDraw(true)
    }
  })

  document.addEventListener('keyup', (e) => {
    if (e.key === "Enter") {
      setDraw(false)
    }
  })

}


/**
 * param 으로 받은 plgObj 의 points 를 가지고 폴리곤을 그림
 */
export function drawPolygon({plgObj, rstRef/*, drewPlgList, setDrewPlgList*/}) {
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
  }

}


export function drawVertex({points, rstRef}) {
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
}


/**
 * 마우스가 폴리곤 안에 들어갔는지 감지
 */
export function handleResultCanvasClickEvent({plgObjList, rstRef, event, setPolygonObjList, setNukkiMode, tempImageInfo}) {

  let clickedPlgKey = 0;
  for (let k = 0; k < plgObjList.length; k++) {
    let polygon = new Path2D()
    polygon.moveTo(plgObjList[k].points[0].x, plgObjList[k].points[0].y);
    for (let i = 1; i < plgObjList[k].points.length; i++) {
      polygon.lineTo(plgObjList[k].points[i].x, plgObjList[k].points[i].y);
    }

    let mousePoint = getMousePosition(event, rstRef)
    let inPolygon = rstRef.current.getContext('2d').isPointInPath(polygon, mousePoint.x, mousePoint.y)

    if (inPolygon) {
      // polygon click
      clickedPlgKey = plgObjList[k].key
      setNukkiMode(false)
    }
  }

  if (clickedPlgKey === 0) {
    let copyPlgList = [...plgObjList]
    for (let i = 0; i < copyPlgList.length; i++) {
      let copyObj = {...copyPlgList[i]}
      copyObj.selected = false;
      copyPlgList[i] = copyObj
    }
    setPolygonObjList(copyPlgList)
    setNukkiMode(true)
  } else {
    let copyPlgList = [...plgObjList]
    for (let i = 0; i < copyPlgList.length; i++) {
      let copyObj = {...copyPlgList[i]}
      copyObj.selected = copyObj.key === clickedPlgKey;
      copyPlgList[i] = copyObj
    }
    setPolygonObjList(copyPlgList)
  }



  rstRef.current.getContext('2d').clearRect(0, 0, tempImageInfo.width, tempImageInfo.height)
  for (let plgObj of plgObjList) {
    drawPolygon({plgObj, rstRef/*, drewPlgList, setDrewPlgList*/})
  }
}


function getMousePosition(e, rstRef) {
  let canvas = rstRef.current
  let rect = canvas.getBoundingClientRect();
  let x = Math.round((e.clientX || e.pageX) - rect.left),
    y = Math.round((e.clientY || e.pageY) - rect.top);
  return {x: x, y: y};
}


/**
 * isPointInPath 가 문제 있는게 아니었음
 * 아래 함수는 isPointInPath 를 수작업으로 구현한 것
 */
// function isInside({mousePoint, points}) {
//   console.log(mousePoint)
//   console.log(points)
//
//   let crosses = 0;
//   for (let i = 0; i < points.length; i++) {
//     let j = (i + 1) % points.length;
//     // 마우스가 point[i]와 point[j] 사이에 있음
//     // console.log("pointiy: ", points[i].y)
//     console.log("mousey: ", mousePoint.y)
//     console.log("mousex: ", mousePoint.x)
//     if (((points[i].y > mousePoint.y) !== (points[j].y > mousePoint.y))) {
//       console.log('i: ', i, 'j: ', j)
//       let atX = Math.abs(points[j].x - points[i].x) * Math.abs(mousePoint.y - points[i].y) / Math.abs(points[j].y - points[i].y) + (points[i].x > points[j].x ? points[j].x : points[i].x);
//       console.log("let atX = ( jx", points[j].x, " - ix", points[i].x, ") * ( my", mousePoint.y, " - iy", points[i].y, ") / ( jy", points[j].y, " - iy", points[i].y, ") + ix | jx", (points[i].x > points[j].x ? points[j].x : points[i].x), " = ", atX)
//       if (mousePoint.x < atX) {
//         console.log("여기서 올라감")
//         crosses++;
//       }
//     }
//   }
//   console.log(crosses)
//   return crosses % 2 > 0;
// }