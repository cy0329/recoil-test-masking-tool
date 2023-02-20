import React, {useEffect, useState} from 'react';
import Draggable from 'react-draggable';
import $ from '../../../node_modules/jquery/dist/jquery.min.js';

import './toolbar.css'
import appear1 from '../../assets/appear1.png'
import appear2 from '../../assets/appear2.png'
import {useRecoilState} from "recoil";
import {toolbarCoordinateState, toolbarIsOpenState} from "../../stateManagement/atoms/layout/toolbarAtom";
import ImageFilters from "../ImageFilters/imageFilters";


function Toolbar() {
  const [tbIsOpen, setTbIsOpen] = useRecoilState(toolbarIsOpenState)
  const [tbCoord, setTbCoord] = useRecoilState(toolbarCoordinateState)

  const [isDrgable, setIsDragable] = useState(false)

  function onTBClose() {
    $('#toolbar').css({
      'transition': 'all ease-out .2s'
    })
    setTbIsOpen(false)
    setTbCoord({x: -320, y: 0})
  }

  function onTBOpen() {
    $('#toolbar').css({
      'transition': 'all ease-in .2s'
    })
    setTbIsOpen(true)
    setTbCoord({x: 0, y: 0})
  }

  function handleDragPosition(e) {
    console.log(e)
    if (e.x < 0 || e.x > window.innerWidth || e.y < 0 || e.y > window.innerHeight) {
      onTBClose()
    } else {
        setTbCoord({x: e.layerX - e.offsetX, y: e.layerY - e.offsetY})
    }
  }


  return (
    <Draggable disabled={!tbIsOpen || !isDrgable} position={tbCoord} onStop={(e) => handleDragPosition(e)} defaultClassName={'tbtop'}>
      <div
        id="toolbar"
        onTransitionEnd={() => {
          $('#toolbar').css({
            'transition': 'none'
          })
        }}
      >
        <div className="tbtop" onMouseEnter={() => setIsDragable(true)}>
          <p>옵션</p>
          <img id="toggle-toolbar" src={!tbIsOpen ? appear1 : appear2} alt=""
               onClick={tbIsOpen ? onTBClose : onTBOpen}/>
        </div>
        <div className="tbbody" onMouseEnter={() => setIsDragable(false)}>
          <div className="datasetname"><p>[VQA] BBOX 데이터셋</p></div>
          <div>
            <ImageFilters />
          </div>
        </div>
      </div>
    </Draggable>
  )
}

export default Toolbar;
