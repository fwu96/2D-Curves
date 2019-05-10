/*jshint esversion: 6 */
// @ts-check

import {draggablePoints} from "./Libs/dragPoints.js";
import {RunCanvas} from "./Libs/runCanvas.js";

/**
 * drawing function for box 1
 *
 * draw something. The canvas is has id "box8-1"
 **/
 function exercise81()
 {
  let canvas = /** @type {HTMLCanvasElement} */ (document.getElementById("box8-1"));
  let ctx = canvas.getContext("2d");
  ctx.beginPath();
  ctx.moveTo(100, 50);
  ctx.lineTo(300, 50);
  ctx.lineTo(270, 150);
  ctx.bezierCurveTo(300, 150, 330, 140, 360, 110);
  ctx.bezierCurveTo(360, 170, 300, 190, 260, 190);
  ctx.bezierCurveTo(200, 360, 320, 270, 320, 260);
  ctx.bezierCurveTo(320, 320, 160, 400, 220, 190);
  ctx.lineTo(180, 190);
  ctx.moveTo(100, 50);
  ctx.lineTo(130, 150);
  ctx.bezierCurveTo(100, 150, 70, 140, 40, 110);
  ctx.bezierCurveTo(40, 170, 100, 190, 140, 190);
  ctx.bezierCurveTo(200, 360, 80, 270, 80, 260);
  ctx.bezierCurveTo(80, 320, 240, 400, 180, 190);
  ctx.closePath();
  ctx.fillStyle = "#EF5350";
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(150, 90);
  ctx.lineTo(250, 90);
  ctx.lineTo(230, 150);
  ctx.lineTo(170, 150);
  ctx.closePath();
  ctx.fillStyle = "white";
  ctx.fill();
 }



 /**
  * Use my UI code!
  */
function exercise82()
{
  let theCanvas = /** @type {HTMLCanvasElement} */ (document.getElementById("box8-2"));
  let thePoints = [ [100,100], [200,100], [200,200], [100,200]];

  function draw() {
    /** student does stuff here **/
    let ctx = theCanvas.getContext("2d");
    ctx.clearRect(0, 0, theCanvas.width, theCanvas.height);
    ctx.beginPath();
    ctx.moveTo(thePoints[0][0], thePoints[0][1]);
    for (let i = 1; i < thePoints.length; i++) {
      ctx.lineTo(thePoints[i][0], thePoints[i][1]);
    }
    ctx.closePath();
    ctx.strokeStyle = "#37474F";
    ctx.lineWidth = 2.5;
    ctx.stroke();
    thePoints.forEach(function(pt) {
      ctx.beginPath();
      ctx.arc(pt[0], pt[1], 7, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.fillStyle = "#43A047";
      ctx.fill();
    });
    ctx.beginPath();
    ctx.arc(thePoints[0][0], thePoints[0][1], 7, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fillStyle = "#EC407A";
    ctx.fill();
  }
  draggablePoints(theCanvas,thePoints,draw);
  draw();
}

/**
 * start things up!
 **/
 window.onload = function() {
   exercise81();
   exercise82();
 }
