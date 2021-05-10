"use strict";
//
var SCALE = 69;
var CANVAS_W = 800;
var CANVAS_H = 600;
var WF_TRANSLATE = 250;
var DT = 0.0125;
var DIV_ID = 'p5-sketch';
// Square Wave
var squareWave = function (o) {
    var k = 2 * o + 1;
    return {
        amplitude: (SCALE * 4) / (k * PI),
        angularVelocity: k,
        initialOffset: 0,
    };
};
var sawWave = function (o) {
    var k = o + 1;
    var sign = k % 2 === 0 ? 1 : -1;
    return {
        amplitude: (SCALE * 2) / (sign * k * PI),
        angularVelocity: 2 * k,
        initialOffset: 0,
    };
};
// e super powers
var lolWave = function (o) {
    var k = 2 * (o + 1);
    return {
        amplitude: (SCALE * 4) / (k * PI),
        angularVelocity: k ^ (2.71 ^ k),
        initialOffset: 0,
    };
};
var waveForm = function (name) {
    var wfs = new Map();
    wfs.set('square', squareWave);
    wfs.set('sawtooth', sawWave);
    wfs.set('sin', lolWave);
    var wf = wfs.get(name);
    return wf ? wf : squareWave;
};
var incrementTime = function (t, dt) {
    return (t + dt) % TWO_PI;
};
// for an epicycle we can find the position of the next one
// at any given time with the following function:
var nextEpicylePos = function (t, e) {
    var theta = t * e.wave.angularVelocity + e.wave.initialOffset;
    return createVector(e.wave.amplitude * cos(-theta) + e.pos.x, e.wave.amplitude * sin(-theta) + e.pos.y);
};
// inject the initial position into a recursive call
// n is the number of octaves
var epicycles = function (t, n, wf) {
    return epicyclesRecurse(t, n, wf, createVector(0, 0), []);
};
// the underlying recursive builder
var epicyclesRecurse = function (t, n, wf, pos, epis) {
    if (epis.length === n)
        return epis;
    var o = epis.length;
    var epi = {
        pos: pos,
        wave: wf(o),
    };
    epis.push(epi);
    return epicyclesRecurse(t, n, wf, nextEpicylePos(t, epi), epis);
};
var radialLines = function (t, epis) {
    var radials = [];
    for (var i = 0; i < epis.length; i++) {
        radials.push({
            p1: epis[i].pos,
            p2: i === epis.length - 1 ? nextEpicylePos(t, epis[i]) : epis[i + 1].pos,
        });
    }
    return radials;
};
var trajectory = [];
// drawing functions
var drawEpicycle = function (e) {
    noFill();
    stroke(192, 66);
    circle(e.pos.x, e.pos.y, e.wave.amplitude * 2);
};
var drawRadialLine = function (l) {
    stroke(255);
    line(l.p1.x, l.p1.y, l.p2.x, l.p2.y);
};
var drawTrajectory = function (t) {
    noFill();
    stroke(192, 192);
    beginShape();
    for (var _i = 0, t_1 = t; _i < t_1.length; _i++) {
        var v = t_1[_i];
        vertex(v.x, v.y);
    }
    endShape();
};
var drawProjectionLine = function (last) {
    stroke(192, 56, 87, 205);
    line(last.x, last.y, WF_TRANSLATE, last.y);
    fill(192, 56, 87, 205);
    circle(WF_TRANSLATE, last.y, 4);
};
var drawWaveForm = function (t) {
    noFill();
    stroke(46, 166, 204, 240);
    beginShape();
    for (var i in t) {
        vertex(+i, t[i].y);
    }
    endShape();
};
// p5 things
var time = 0;
var octavesSlider;
var wfSelect;
var wfPrevious;
var setup = function () {
    var c = createCanvas(CANVAS_W, CANVAS_H);
    c.parent(DIV_ID);
    octavesSlider = createSlider(2, 24, 5, 1);
    octavesSlider.parent(DIV_ID);
    wfSelect = createSelect();
    wfSelect.option('square');
    wfSelect.option('sawtooth');
    wfSelect.option('sin');
    wfSelect.selected('square');
    wfPrevious = 'square';
    wfSelect.parent(DIV_ID);
};
var draw = function () {
    var octaves = octavesSlider.value();
    var wf = wfSelect.value();
    if (wf !== wfPrevious)
        trajectory = [];
    wfPrevious = wf;
    background(51);
    translate(width / 4, height / 2);
    fill(235, 219, 178);
    stroke(235, 219, 178);
    textSize(16);
    text("Octaves: " + octaves, -width / 4 + 20, height / 2 - 20);
    var epis = epicycles(time, octaves, waveForm(wf));
    var radials = radialLines(time, epis);
    epis.map(drawEpicycle);
    radials.map(drawRadialLine);
    // add last `pencil` position to trajectory
    var lastPos = radials[radials.length - 1].p2;
    trajectory.unshift(lastPos);
    if (trajectory.length > 512)
        trajectory.pop();
    drawTrajectory(trajectory);
    drawProjectionLine(lastPos);
    translate(WF_TRANSLATE, 0);
    drawWaveForm(trajectory);
    time = incrementTime(time, DT);
};
