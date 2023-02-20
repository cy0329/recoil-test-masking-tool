import React from 'react';
import {
  RecoilRoot,
  atom,
  selector,
  useRecoilState,
  useRecoilValue,
} from 'recoil';
import ImageEditor from "./Components/ImageEditor/ImageEditor";
import './App.css'


function App() {
  return (
    <RecoilRoot>
      <ImageEditor />
    </RecoilRoot>
  );
}

export default App;
