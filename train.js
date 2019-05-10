/*jshint esversion: 6 */
// @ts-check

import {draggablePoints} from "./Libs/dragPoints.js";
import {RunCanvas} from "./Libs/runCanvas.js";

/**
 * Have the array of control points for the track be a
 * "global" (to the module) variable
 *
 * Note: the control points are stored as Arrays of 2 numbers, rather than
 * as "objects" with an x,y. Because we require a Cardinal Spline (interpolating)
 * the track is defined by a list of points.
 *
 * things are set up with an initial track
 */
/** @type Array<number[]> */
let thePoints = [ [150,150], [150,450], [450,450], [450,150]];
/**
 * Draw function - this is the meat of the operation
 *
 * It's the main thing that needs to be changed
 *
 * @param {HTMLCanvasElement} canvas
 * @param {number} param
 */
function draw(canvas, param) {
    let context = canvas.getContext("2d");
    // clear the screen
    context.clearRect(0,0,canvas.width,canvas.height);

    // draw the control points
    thePoints.forEach(function(pt) {
        context.beginPath();
        context.arc(pt[0],pt[1],5,0,Math.PI*2);
        context.closePath();
        context.fill();
    });

    // now, the student should add code to draw the track and train
    /**
     * Get control points positions
     * @param {Array<number[]>} pt 
     * @param {number} curr 
     * @returns info of positions
     */
    function cps_pos(pt, curr) {
        let sf = 0.5;  // scaling factor
        let next = curr + 1;
        if (curr == pt.length - 1) next = 0;
        let prev = curr - 1;
        if (curr == 0) prev = pt.length - 1;
        let nnext = next + 1;
        if (next == pt.length - 1) nnext = 0;
        let nprev = next - 1;
        if (next == 0) nprev = pt.length - 1;
        // calculating the positions
        let sx = pt[curr][0],
            sy = pt[curr][1],
            ex = pt[next][0],
            ey = pt[next][1];
        let dx1 = sf * (pt[next][0] - pt[prev][0]),
            dy1 = sf * (pt[next][1] - pt[prev][1]),
            dx2 = sf * (pt[nnext][0] - pt[nprev][0]),
            dy2 = sf * (pt[nnext][1] - pt[nprev][1]);
        let cpx1 = sx + dx1 / 3,
            cpy1 = sy + dy1 / 3,
            cpx2 = ex - dx2 / 3,
            cpy2 = ey - dy2 / 3;
        return {sx: sx, sy: sy, 
                cpx1: cpx1, cpy1: cpy1, 
                cpx2: cpx2, cpy2: cpy2, 
                ex: ex, ey: ey};
    }
    // conneting control points
    context.beginPath();
    context.moveTo(thePoints[0][0], thePoints[0][1]);    
    for (let curr = 0; curr < thePoints.length; curr++) {
        let cps = cps_pos(thePoints, curr);
        context.bezierCurveTo(cps.cpx1, cps.cpy1, cps.cpx2, cps.cpy2, cps.ex, cps.ey);
    }
    context.closePath();
    context.lineWidth = 3;
    context.strokeStyle = "#212F3C";
    context.stroke();
    /**
     * Get positon on the curve
     * @param {number} t 
     * @param {Array<number[]>} pt 
     * @param {number} curr 
     * @returns positions
     */
    function get_tripos(t, pt, curr) {
        let cps = cps_pos(pt, curr);
        let t2 = t**2,
            t3 = t2 * t;
        let ot = 1 - t,
            ot2 = ot**2,
            ot3 = ot2 * ot;
        // calculating the positions on the curve
        let trix = ot3 * cps.sx + 3 * ot2 * t * cps.cpx1 + 
                    3 * ot * t2 * cps.cpx2 + t3 * cps.ex,
            triy = ot3 * cps.sy + 3 * ot2 * t * cps.cpy1 +
                    3 * ot * t2 * cps.cpy2 + t3 * cps.ey;
        return {trix: trix, triy: triy};
    }
    /**
     * Get distance information for arc-length calculating
     * @param {Array<number[]>} pt 
     * @param {number} curr 
     * @returns ditance information
     */
    function dist_info(pt, curr) {
        let seg_dist = 0,
            total_dist = 0;  // total length of all segments
        let steps = 10, segs = pt.length;
        /** 
         * Store the length of each segments
         * @type {Array<number>} 
        */
        let seg_info = [];
        for (let n = 0; n < segs; n++) {
            let t = 0, new_dist = 0;
            for (let i = 0; i < steps; i++) {
                let curr_pt = get_tripos(t, pt, curr),
                    next_pt = get_tripos(t + 0.1, pt, curr);
                new_dist = Math.sqrt(Math.pow(curr_pt.trix - next_pt.trix, 2) +
                        Math.pow(curr_pt.triy - next_pt.triy, 2));
                total_dist += new_dist;
                seg_dist += new_dist;
                t += 0.1;
                if (t == 9) t = 0;
            }
            if (curr < pt.length - 1) curr++;
            seg_info.push(seg_dist);
            seg_dist = 0;
        }
        return {td: total_dist, sd: seg_info};
    }
    /**
     * Get anlge based on the tangent lines
     * @param {number} t 
     * @param {Array<number[]>} pt 
     * @param {number} curr 
     * @returns rotation angle
     */
    function get_angle(t, pt, curr) {
        let cps = cps_pos(pt, curr);
        let t2 = t**2,
            ot = 1 - t,
            ot2 = ot**2;
        //  calculating the tangent vector
        let dirx = 3 * ot2 * (cps.cpx1 - cps.sx) + 6 * t * ot * (cps.cpx2 - cps.cpx1) +
                    3 * t2 * (cps.ex - cps.cpx2),
            diry = 3 * ot2 * (cps.cpy1 - cps.sy) + 6 * t * ot * (cps.cpy2 - cps.cpy1) +
                    3 * t2 * (cps.ey - cps.cpy2);
        return -Math.atan2(dirx, diry) + Math.PI / 2;
    }
    /**
     * Make arc-length parameterization
     * @param {number} st 
     * @param {Array<number[]>} pt
     * @param {number} par
     * @returns needed new parameter && indx
     */
    function arc_len(st, pt, par) {
        let ndx = 0;  // new index
        let dist = dist_info(pt, 0);
        let avg = dist.td / pt.length;  // average length
        let pd = 0;  // total passed length
        /** @type {Array<number>} */
        let avd = [];  // needed length to pass before reach next index
        let asu = 0;
        for (let i = 0; i < dist.sd.length; i++) {
            asu += (dist.sd[i] / avg)
            avd.push(asu);
        }
        for (let i = 0; i < avd.length; i++) {
            if (ndx == i)
                if (par >= avd[i])
                    ndx++;
        }
        let rp = dist.sd[ndx];
        for (let i = 0; i < ndx; i++) {
            pd += dist.sd[i];
        }
        let p = (st - pd) / rp;
        return {p: p, ndx: ndx};
    }
    /**
     * Draw rails
     * @param {Array<number[]>} pt 
     * @param {CanvasRenderingContext2D} ctx
     */
    function rails(pt, ctx) {
        let d = dist_info(pt, 0);
        let rapos = {trix: 0, triy: 0};
        let angle = 0;
        /** @type {boolean} */
        for(let par = 0; par <= pt.length; par += 0.05) {
            let st = par * (d.td / pt.length);
            let cost = arc_len(st, pt, par);
            rapos = get_tripos(cost.p, pt, cost.ndx);
            angle = get_angle(cost.p, pt, cost.ndx);
            ctx.save();
            ctx.translate(rapos.trix, rapos.triy);
            ctx.rotate(angle + Math.PI / 2);
            ctx.translate(-rapos.trix, -rapos.triy);
            ctx.beginPath();
            ctx.moveTo(rapos.trix - 15, rapos.triy);
            ctx.lineTo(rapos.trix + 15, rapos.triy);
            ctx.closePath();
            ctx.lineWidth = 2;
            ctx.strokeStyle = "#AF601A";
            ctx.stroke();
            ctx.restore();
        }
    }
    let t = param;
    let idx = Math.floor(param);
    if (param >= 1) t = param - idx;
    let dist = dist_info(thePoints, 0);
    let st = param * (dist.td / thePoints.length);
    let cosp = arc_len(st, thePoints, param);
    
    /** @type {boolean} */
    let arc_check = document.getElementById("arc-length").checked;
    let tripos = {trix: 0, triy: 0};
    let angle = 0;
    if (arc_check) {
        tripos = get_tripos(cosp.p, thePoints, cosp.ndx);
        angle = get_angle(cosp.p, thePoints, cosp.ndx);
        rails(thePoints, context);
    }
    else {
        tripos = get_tripos(t, thePoints, idx);
        angle = get_angle(t, thePoints, idx);
        rails(thePoints, context);
    }
    context.save();
    context.translate(tripos.trix, tripos.triy);
    context.rotate(angle);
    context.translate(-tripos.trix, -tripos.triy);
    context.fillStyle = "#00897B";
    context.fillRect(tripos.trix - 15, tripos.triy - 7, 30, 14);
    context.beginPath();
    context.moveTo(tripos.trix + 15, tripos.triy + 7);
    context.lineTo(tripos.trix + 20, tripos.triy + 10);
    context.lineTo(tripos.trix + 20, tripos.triy - 10);
    context.lineTo(tripos.trix + 15, tripos.triy - 7);
    context.closePath();
    context.fillStyle = 'rgba(' + 251 + ", " + 192 + ", " + 45 + ", " + 0.7 +")"; 
    context.fill();
    context.restore();
}

/**
 * Setup stuff - make a "window.onload" that sets up the UI and starts
 * the train
 */
let oldOnLoad = window.onload;
window.onload = function() {
    let theCanvas = /** @type {HTMLCanvasElement} */ (document.getElementById("canvas"));
    let theContext = theCanvas.getContext("2d");
    // we need the slider for the draw function, but we need the draw function
    // to create the slider - so create a variable and we'll change it later
    let theSlider; // = undefined;

    // note: we wrap the draw call so we can pass the right arguments
    function wrapDraw() {
        // do modular arithmetic since the end of the track should be the beginning
        draw(theCanvas, Number(theSlider.value) % thePoints.length);
    }
    // create a UI
    let runcavas = new RunCanvas(theCanvas,wrapDraw);
    // now we can connect the draw function correctly
    theSlider = runcavas.range;

    function addCheckbox(name,initial=false) {
        let checkbox = document.createElement("input");
        checkbox.setAttribute("type","checkbox");
        document.getElementsByTagName("body")[0].appendChild(checkbox);
        checkbox.id = name;
        checkbox.onchange = wrapDraw;
        checkbox.checked = initial;
        let checklabel = document.createElement("label");
        checklabel.setAttribute("for","simple-track");
        checklabel.innerText = name;
        document.getElementsByTagName("body")[0].appendChild(checklabel);
    }
    // note: if you add these features, uncomment the lines for the checkboxes
    // in your code, you can test if the checkbox is checked by something like:
    // document.getElementById("simple-track").checked
    // in your drawing code
    //
    // lines to uncomment to make checkboxes
    // addCheckbox("simple-track",false);
     addCheckbox("arc-length",true);
    // addCheckbox("bspline",false);

    // helper function - set the slider to have max = # of control points
    function setNumPoints() {
        runcavas.setupSlider(0,thePoints.length,0.05);
    }

    setNumPoints();
    runcavas.setValue(0);

    // add the point dragging UI
    draggablePoints(theCanvas,thePoints,
                    wrapDraw,
                    10,setNumPoints);


};
