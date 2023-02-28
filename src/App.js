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
import TestSelectorTemp from "./Components/Test/TestSelectorTemp";
// import PolygonEditor from "./Components/Test/testPolygonEditor";

function App() {
  return (
    <RecoilRoot>
      <Routes>
        <Route path="/" element={<ImageEditor/>}/>
        <Route path="/test" element={<TestSelectorTemp />} />
        {/*<Route path="/polygon" element={<PolygonEditor/>}/>*/}
      </Routes>
    </RecoilRoot>
  );
}

export default App;
