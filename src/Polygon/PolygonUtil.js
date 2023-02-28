// export function drawPolygon({points, plgRef}) {
//   console.log("몇번 호출됨?")
//   console.log("plgRef: ", plgRef)
//   const polygonCanvas = plgRef.current
//   const plgCtx = polygonCanvas.getContext('2d')
//
//
//   if (points.length !== 0) {
//     let polygon = new Path2D()
//     polygon.moveTo(points[0].x, points[0].y);
//     for (let i = 1; i < points.length; i++) {
//       polygon.lineTo(points[i].x, points[i].y);
//     }
//     plgCtx.strokeStyle = "green";
//     plgCtx.stroke(polygon);
//
//     drawVertex({points, plgRef})
//   }
// }
//
// export function drawVertex({points, plgRef}) {
//   const polygonCanvas = plgRef.current
//   const plgCtx = polygonCanvas.getContext('2d')
//
//
//   let vert = new Path2D()
//   for (let j = 0; j < points.length; j++) {
//     vert.moveTo(points[j].x, points[j].y)
//     vert.arc(points[j].x, points[j].y, 3, 0, Math.PI * 2, true)
//   }
//   plgCtx.strokeStyle = "red"
//   plgCtx.strokeWidth = 1
//   plgCtx.stroke(vert)
// }