import React from 'react';
import {
  RecoilRoot,
  atom,
  selector,
  useRecoilState,
  useRecoilValue,
} from 'recoil';
import { Route, Routes } from "react-router-dom";

import './App.css'

import ImageEditor from "./Components/ImageEditor/ImageEditor";
// import PolygonEditor from "./Components/Test/testPolygonEditor";

function App() {
  return (
    <RecoilRoot>
      <Routes>
        <Route path="/" element={<ImageEditor/>}/>
        {/*<Route path="/polygon" element={<PolygonEditor/>}/>*/}
      </Routes>
    </RecoilRoot>
  );
}

export default App;
