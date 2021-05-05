"use strict";
//
var SCALE = 75;
var DT = 0.025;
var time = 0;
var trajectory = [];
var octaves;
var waveForm;
/**
 *
 */
var Epicycle = /** @class */ (function () {
    function Epicycle(position, radius, k, phase) {
        this.pos = position ? position : createVector();
        this.r = radius ? radius * SCALE : SCALE;
        this.phi = phase ? phase : 0;
        this.k = k ? k : 1;
    }
    Epicycle.prototype.show = function () {
        var radialPosition = this.getRadialPhasePoint();
        noFill();
        stroke('#689d6aaa');
        ellipse(this.pos.x, this.pos.y, this.r * 2);
        stroke('#d79921ff');
        line(this.pos.x, this.pos.y, radialPosition.x, radialPosition.y);
    };
    Epicycle.prototype.getRadialPhasePoint = function () {
        var theta = this.k * time + this.phi;
        return createVector(cos(-theta) * this.r + this.pos.x, sin(-theta) * this.r + this.pos.y);
    };
    return Epicycle;
}());
var squareWaveKByIndex = function (i) {
    return 2 * i + 1;
};
var triangleWaveKByIndex = function (i) {
    return 2 * (i + 1);
};
var buildEpicycles = function (octaves, fn) {
    var epicycles = [];
    var actual_pos = createVector();
    for (var n = 0; n < octaves; n++) {
        var k = fn(n);
        var radius = 4 / (k * PI);
        var epi = new Epicycle(actual_pos, radius, k);
        actual_pos = epi.getRadialPhasePoint();
        if (n === octaves - 1) {
            trajectory.unshift(actual_pos);
            if (trajectory.length > 256)
                trajectory.pop();
        }
        epicycles.push(epi);
    }
    return epicycles;
};
/**********************************************************************
 * p5 hooks
 *
 */
function setup() {
    console.log('p5 is alive!');
    createCanvas(800, 600);
    octaves = createSlider(2, 24, 5);
    waveForm = createRadio();
    waveForm.option('square');
    waveForm.option('triangle');
    waveForm.selected('square');
    waveForm.style('width', '60px');
}
function draw() {
    //console.log('octaves', octaves);
    //
    translate(width / 4, height / 2);
    background('#282828');
    // Text stuff
    textSize(22);
    fill('#ebdbb2');
    text("octaves: " + octaves.value(), -180, 278);
    // Epicycles
    var fn = waveForm.value() === 'square' ? squareWaveKByIndex : triangleWaveKByIndex;
    for (var _i = 0, _a = buildEpicycles(+octaves.value(), fn); _i < _a.length; _i++) {
        var e = _a[_i];
        e.show();
    }
    // trajectory
    noFill();
    stroke('#d5c4a1aa');
    beginShape();
    for (var _b = 0, trajectory_1 = trajectory; _b < trajectory_1.length; _b++) {
        var v = trajectory_1[_b];
        vertex(v.x, v.y);
    }
    endShape();
    // y-projection line
    stroke('#d65d0e');
    var actual = trajectory[0];
    line(actual.x, actual.y, 250, actual.y);
    // wave
    translate(250, 0);
    noFill();
    stroke('#98971a');
    beginShape();
    for (var i in trajectory) {
        vertex(+i, trajectory[i].y);
    }
    endShape();
    time += DT;
    if (time > TWO_PI)
        time -= TWO_PI;
}
