import {useCallback, useEffect, useMemo, useState} from "react";
import $ from '../../node_modules/jquery/dist/jquery.min.js';
import {useRecoilState, useRecoilValue} from "recoil";
import {
  csState,
  drawPolygonState,
  imageInfoState,
  polygonObjListState, polygonKeyState, pointsState, alreadyDrewPolygonState, nukkiModeState
} from "../stateManagement/atoms/Nukki/nukkiAtom";

// let rerenderCount = 0
// let points = []
let imageInfo = {}

export default function Polygon({rstRef}) {
  // recoil state
  const tempCs = useRecoilValue(csState)
  // const tempImageInfo = useRecoilValue(imageInfoState)
  const [polygonKey, setPolygonKey] = useRecoilState(polygonKeyState)
  const [draw, setDraw] = useRecoilState(drawPolygonState)
  const [points, setPoints] = useRecoilState(pointsState)
  const [polygonObjList, setPolygonObjList] = useRecoilState(polygonObjListState)
  const [drewPlgList, setDrewPlgList] = useRecoilState(alreadyDrewPolygonState)
  const [nukkiMode, setNukkiMode] = useRecoilState(nukkiModeState)
  // local state


  // ===== console.log 영역 =====
  // console.log("Polygon 리렌더", rerenderCount)
  // console.log("polygonObjList: ", polygonObjList)
  // console.log("points: ", points)
  // console.log("tempCs: ", tempCs)
  // console.log("drewPlgList: ", drewPlgList)
  // console.log('nukkiMode in polygon.js : ', nukkiMode)
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

  // useEffect(() => {
  //   imageInfo = tempImageInfo
  // }, [tempImageInfo])

  useEffect(() => {
    if (draw) {
      savePolygonObjects({polygonObjList, setPolygonObjList, polygonKey, points})
    }
  }, [draw])

  useEffect(() => {
    for (let plgObj of polygonObjList) {
      console.log("key: ", plgObj.key)
      if (!drewPlgList.includes(plgObj.key)) {
        drawPolygon({plgObj, rstRef, drewPlgList, setDrewPlgList})
      }
      if (plgObj.selected) {
        drawVertex({points: plgObj.points, rstRef})
      }
    }
  }, [polygonObjList])


  // nukki 에서 가져와봄
  useEffect(() => {
    console.log("tempCs 변경되서 다시 탐")
    // console.log('tempCs: ', tempCs)
    for (let plgObj of polygonObjList) {
      drawPolygon({plgObj, rstRef, drewPlgList, setDrewPlgList})
    }
  }, [tempCs])


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
    document.addEventListener('mousedown', (e) => {
      handleResultCanvasClickEvent({
        plgObjList: polygonObjList,
        rstRef,
        event: e,
        setPolygonObjList,
        nukkiMode,
        setNukkiMode
      })
    })
    console.log("added")
  }, [rstRef.current, polygonObjList])

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

    // if (plgObj.selected) {
    //   drawVertex({points: plgObj.points, rstRef})
    // }

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


/**
 * 마우스가 폴리곤 안에 들어갔는지 감지
 */
function handleResultCanvasClickEvent({plgObjList, rstRef, event, setPolygonObjList, nukkiMode, setNukkiMode}) {

  let polygon
  let inPolygon = false

  if (nukkiMode) {
    for (let key = 0; key < plgObjList.length; key++) {
      polygon = new Path2D()
      polygon.moveTo(plgObjList[key].points[0].x, plgObjList[key].points[0].y);
      for (let i = 1; i < plgObjList[key].points.length; i++) {
        polygon.lineTo(plgObjList[key].points[i].x, plgObjList[key].points[i].y);
      }

      // let inPolygon = isInside({mousePoint: getMousePosition(event, rstRef), points: plgObjList[key].points})
      let mousePoint = getMousePosition(event, rstRef)
      inPolygon = rstRef.current.getContext('2d').isPointInPath(polygon, mousePoint.x, mousePoint.y)

      if (inPolygon) {
        // 마우스가 폴리곤 내부로 들어감
        console.log('폴리곤', key, '내부')
        let copyPlgList = [...plgObjList]
        for (let i = 0; i < copyPlgList.length; i++) {
          if (copyPlgList[i].key === key + 1) {
            // console.log(copyPlgList[i])
            let thisPolygon = {...copyPlgList[i]}
            thisPolygon.selected = true
            copyPlgList[i] = thisPolygon
          } else {
            let notThisPolygon = {...copyPlgList[i]}
            notThisPolygon.selected = false
            copyPlgList[i] = notThisPolygon
          }
        }
        console.log('바뀜 : ', copyPlgList)
        setPolygonObjList(copyPlgList)
        inPolygon = true
        break;
      } else {
        console.log('폴리곤 외부')
        let copyPlgList = [...plgObjList]
        for (let i = 0; i < copyPlgList.length; i++) {
          // console.log(copyPlgList[i])
          let resetPlg = {...copyPlgList[i]}
          resetPlg.selected = false
          copyPlgList[i] = resetPlg
        }
        console.log('바뀜 : ', copyPlgList)
        setPolygonObjList(copyPlgList)
        inPolygon = false
      }
    }
  }

  if (inPolygon) {
    setNukkiMode(false)
  } else {
    setNukkiMode(true)
  }
}

function getMousePosition(e, rstRef) {
  let canvas = rstRef.current
  let rect = canvas.getBoundingClientRect();
  let x = Math.round((e.clientX || e.pageX) - rect.left),
    y = Math.round((e.clientY || e.pageY) - rect.top);
  return {'x': x, 'y': y};
}

function isInside({mousePoint, points}) {
  console.log(mousePoint)
  console.log(points)

  let crosses = 0;
  for (let i = 0; i < points.length; i++) {
    let j = (i + 1) % points.length;
    // 마우스가 point[i]와 point[j] 사이에 있음
    // console.log("pointiy: ", points[i].y)
    console.log("mousey: ", mousePoint.y)
    console.log("mousex: ", mousePoint.x)
    if (((points[i].y > mousePoint.y) !== (points[j].y > mousePoint.y))) {
      console.log('i: ', i, 'j: ', j)
      let atX = Math.abs(points[j].x - points[i].x) * Math.abs(mousePoint.y - points[i].y) / Math.abs(points[j].y - points[i].y) + (points[i].x > points[j].x ? points[j].x : points[i].x);
      console.log("let atX = ( jx", points[j].x, " - ix", points[i].x, ") * ( my", mousePoint.y, " - iy", points[i].y, ") / ( jy", points[j].y, " - iy", points[i].y, ") + ix | jx", (points[i].x > points[j].x ? points[j].x : points[i].x), " = ", atX)
      if (mousePoint.x < atX) {
        console.log("여기서 올라감")
        crosses++;
      }
    }
  }
  console.log(crosses)
  return crosses % 2 > 0;
}