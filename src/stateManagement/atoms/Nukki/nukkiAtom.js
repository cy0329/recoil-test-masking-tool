import {atom} from "recoil";

// 사용 불가 : downPoints

// 누끼
export const nukkiModeState = atom({
  key: 'nukki/nukkiMode',
  default: true,
})

export const csState = atom({
  key: 'nukki/Contours',
  default: [],
})

export const maskState = atom({
  key: 'nukki/maskData',
  default: {},
})

export const imageInfoState = atom({
  key: 'nukki/imageInfo',
  default: {},
})

export const clickSomethingState = atom({
  key: 'nukki/clickSomething',
  default: false,
})



// 폴리곤
export const drawPolygonState = atom({
  key: 'polygon/drawPolygon',
  default: false,
})

export const polygonObjListState = atom({
  key: 'polygon/polygonObjectList',
  default: [],
})

export const polygonKeyState = atom({
  key: 'polygon/polygonKey',
  default: 1,
})

export const pointsState = atom({
  key: 'polygon/pointsOfPolygon',
  default: []
})

export const alreadyDrewPolygonState = atom({
  key: 'polygon/alreadyDrewPolygon',
  default: []
})