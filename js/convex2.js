// var dist = 120;
// var ten = 0.9;

function dist(p1,p2) {
	return Math.sqrt(Math.pow(p1[0] - p2[0],2) + Math.pow(p1[1] - p2[1],2));
}

function canvas_to_array(canvas) {
	var ctx = canvas.getContext("2d");
	var h = ctx.canvas.height;
	var w = ctx.canvas.width;
	var imgData = ctx.getImageData(0, 0, w, h);
	var data = imgData.data;  // the array of RGBA values
	var canvas_array = [];
	//var tmp_cnt = find_nonzeros(data);
	//alert(tmp_cnt);
	for(var i = 0; i < h; i++) {
		for(var j = 0; j < w; j++) {
			canvas_array.push(data[4 * i * w + 4 * j+3]);
		}
	}
	return canvas_array;
}

function find_non_zeros(dt, canvas) {
	var ctx = canvas.getContext("2d");
	var h = ctx.canvas.height;
	var w = ctx.canvas.width;
	var arr_nz = [];
	for (var r=0; r<h; r++) {
		for (var c=0; c<w; c++) {
			if (dt[r*w+c] > 0) {
				arr_nz.push([c, r]);
			}
		}
	}
	return arr_nz;
}

function augment_pointset(ch, dst_max) {	
	var chcp = JSON.parse(JSON.stringify(ch));
	chcp.push(ch[0]);
	var augmented_set = [];
	for (var cnt = 0; cnt < chcp.length - 1; cnt++) {
		augmented_set.push(chcp[cnt]);
		var dst = pdist(chcp[cnt],chcp[cnt+1]);
		// generate points with equal distance so that length of each segment is less than predefined
		var p_num = Math.ceil(dst/dst_max);
		var seg_dst = dst/p_num;
		var dir_unit = [(chcp[cnt+1][0]-chcp[cnt][0])/dst, (chcp[cnt+1][1]-chcp[cnt][1])/dst];
		for (var i = 1; i < p_num; i++) {
			augmented_set.push([chcp[cnt][0] + dir_unit[0]*i*seg_dst, chcp[cnt][1] + dir_unit[1]*i*seg_dst]);
		}
	}
	return augmented_set;
}

function convex_contour(canvas) {
	//if (!cc_init) {
	//	cc_init = true;
		var dt = canvas_to_array(canvas);
		var points = find_non_zeros(dt,canvas);
		ch = edge_to_seq(getConvexHull(points));
	//}
	var dst_min = document.getElementById("dist").value;
	sparse_border = [];
	sparse_border.push(ch[0]);
	var last_point = ch[0];
	for (var cnt=1; cnt < ch.length; cnt++) {
		if (dist(ch[cnt],last_point) > dst_min) {
			sparse_border.push(ch[cnt]);
			last_point = ch[cnt];
		}
	}
	if (dist(sparse_border[0],sparse_border[sparse_border.length-1]) <= dst_min*(2/3)) {
		sparse_border.pop();
	}
	//clearImage(id);
	var ctx = canvas.getContext("2d");
	
	draw_closed_curve(sparse_border, canvas, document.getElementById("tension").value);
	for (var cnt=0; cnt<sparse_border.length; cnt++) {
		var pnt = sparse_border[cnt];
		showPt(pnt[0], pnt[1], 'yellow', canvas);
	}	
}

function get_support_points(canvas) {
	//if (!cc_init) {
	//	cc_init = true;
		var dt = canvas_to_array(canvas);
		var points = find_non_zeros(dt,canvas);
		ch = edge_to_seq(getConvexHull(points));
	//}
    var distScroll = document.getElementById("dist");

	var dst_min = distScroll != null ? distScroll.value : 60;
	sparse_border = [];
	sparse_border.push(ch[0]);
	var last_point = ch[0];
	for (var cnt=1; cnt < ch.length; cnt++) {
		if (dist(ch[cnt],last_point) > dst_min) {
			sparse_border.push(ch[cnt]);
			last_point = ch[cnt];
		}
	}
	if (dist(sparse_border[0],sparse_border[sparse_border.length-1]) <= dst_min*(2/3)) {
		sparse_border.pop();
	}
	return sparse_border;
}

function showPt(x,y,fill_color,canvas) {
	var ctx = canvas.getContext("2d");
	ctx.save();
	ctx.beginPath();
	if (fill_color) {
		ctx.fillStyle = fill_color;
	}
	ctx.arc(x, y, 3, 0, 2*Math.PI);
	ctx.fill();
	ctx.restore();
}

function clearImage(canvas){
	canvas.width = canvas.width;
}

function edge_to_seq(edg) {
	var seq = new Array(edg.length);
	for (var cnt=0; cnt<edg.length; cnt++) {
		seq[cnt] = edg[cnt][0];
	}
	return seq;
}

function getDistant(cpt, bl) {
    var Vy = bl[1][0] - bl[0][0];
    var Vx = bl[0][1] - bl[1][1];
    return (Vx * (cpt[0] - bl[0][0]) + Vy * (cpt[1] -bl[0][1]))
}


function findMostDistantPointFromBaseLine(baseLine, points) {
    var maxD = 0;
    var maxPt = new Array();
    var newPoints = new Array();
    for (var idx in points) {
        var pt = points[idx];
        var d = getDistant(pt, baseLine);
        
        if ( d > 0) {
            newPoints.push(pt);
        } else {
            continue;
        }
        
        if ( d > maxD ) {
            maxD = d;
            maxPt = pt;
        }
    
    } 
    return {'maxPoint':maxPt, 'newPoints':newPoints}
}

var allBaseLines = new Array();
function buildConvexHull(baseLine, points) {
    
    allBaseLines.push(baseLine)
    var convexHullBaseLines = new Array();
    var t = findMostDistantPointFromBaseLine(baseLine, points);
    if (t.maxPoint.length) { // if there is still a point "outside" the base line
        convexHullBaseLines = 
            convexHullBaseLines.concat( 
                buildConvexHull( [baseLine[0],t.maxPoint], t.newPoints) 
            );
        convexHullBaseLines = 
            convexHullBaseLines.concat( 
                buildConvexHull( [t.maxPoint,baseLine[1]], t.newPoints) 
            );
        return convexHullBaseLines;
    } else {  // if there is no more point "outside" the base line, the current base line is part of the convex hull
        return [baseLine];
    }    
}

function getConvexHull(points) {
    //find first baseline
    var maxX, minX;
    var maxPt, minPt;
    for (var idx in points) {
        var pt = points[idx];
        if (pt[0] > maxX || !maxX) {
            maxPt = pt;
            maxX = pt[0];
        }
        if (pt[0] < minX || !minX) {
            minPt = pt;
            minX = pt[0];
        }
    }
    var ch = [].concat(buildConvexHull([minPt, maxPt], points),
                       buildConvexHull([maxPt, minPt], points))
    return ch;
}

function getRandomPoints(numPoint, xMax, yMax) {
    var points = new Array();
    var phase = Math.random() * Math.PI * 2;
    for (var i = 0; i < numPoint/2; i++) {
        var r =  Math.random()*xMax/4;
        var theta = Math.random() * 1.5 * Math.PI + phase;
        points.push( [ xMax /4 + r * Math.cos(theta), yMax/2 + 2 * r * Math.sin(theta) ] )
    }
    var phase = Math.random() * Math.PI * 2;
    for (var i = 0; i < numPoint/2; i++) {
        var r =  Math.random()*xMax/4;
        var theta = Math.random() * 1.5 * Math.PI + phase;
        points.push( [ xMax /4 * 3 +  r * Math.cos(theta), yMax/2 +  r * Math.sin(theta) ] )
    }
    return points
}


function plotBaseLine(baseLine,color) {
    var ctx = document.getElementById('qh_demo').getContext('2d');
    var pt1 = baseLine[0]
    var pt2 = baseLine[1];
    ctx.save()
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(pt1[0],pt1[1]);
    ctx.lineTo(pt2[0],pt2[1]);
    ctx.stroke();
    ctx.restore();
}   



var pts;

function qhPlotPoints() {
    ctx = document.getElementById('qh_demo').getContext('2d');
    ctx.clearRect(0,0,200,200);
    ctx.fillStyle = 'rgb(0,0,0)';
    pts = getRandomPoints(250,200,200);
    for (var idx in pts) {
        var pt = pts[idx];
        ctx.fillRect(pt[0],pt[1],2,2);
    }
}



function qhPlotConvexHull() {
    var ch = getConvexHull(pts);
    var eBL = allBaseLines[0];
    function plotIntermediateBL() {
        var l = allBaseLines.shift();
        if (l) {
            plotBaseLine(l, 'rgb(180,180,180)');
            setTimeout(plotIntermediateBL, 250);
        } else {
            for (var idx in ch) {    
                var baseLine = ch[idx];
                plotBaseLine(baseLine, 'rgb(255,0,0)');
            }
            plotBaseLine(eBL,'rgb(0,255,0)');
        }
    }
    plotIntermediateBL();
}

function edge_to_seq(edg) {
	var seq = new Array(edg.length);
	for (var cnt=0; cnt<edg.length; cnt++) {
		seq[cnt] = edg[cnt][0];
	}
	return seq;
}

function draw_closed_curve(pnt, canvas, smooth_value) {
/*
	draw closed bezier curve
*/
	var ctx = canvas.getContext("2d");
	if (pnt.length < 2) {
		return;
	} else if (pnt.length == 2) {
		// draw just line 
		ctx.beginPath();
		ctx.moveTo(pnt[0][0],pnt[0][1]);
		ctx.lineTo(pnt[1][0],pnt[1][1]);
	} else if (pnt.length == 3) {
		// just skip for now, not that necessary
	} else {
		var edge, ctrl;
		// can use bezier already
		for (var cnt=0; cnt<pnt.length; cnt++) {
			edge = pnt.slice(cnt,cnt+4);
			if (cnt + 4 - pnt.length >= 0) {
				edge = edge.concat(pnt.slice(0,cnt + 4 - pnt.length));
			}
			ctrl = get_control_points(edge, smooth_value);
			draw_curve(edge, ctrl, canvas);
		}
	}
}

function draw_curve(edge, ctrl,canvas) {
	var ctx = canvas.getContext("2d");
	ctx.beginPath();
	var start_point = edge[1];
	var end_point = edge[2];
	ctx.moveTo(start_point[0],start_point[1]);
	ctx.bezierCurveTo(ctrl[0][0],ctrl[0][1],ctrl[1][0],ctrl[1][1],end_point[0],end_point[1]);
	ctx.stroke();
}

function get_points(pt_sq, step) {
	//points to be connected and control points are given
	ax = pt_sq[0][0]; ay = pt_sq[0][1]; 
	bx = pt_sq[1][0]; by = pt_sq[1][1]; 
	cx = pt_sq[2][0]; cy = pt_sq[2][1]; 
	dx = pt_sq[3][0]; dy = pt_sq[3][1]; 
	//var step = 0.01;
	var pt = [];
	for (t = 0; t < 1; t+=step) {
		B0_t = Math.pow(1-t, 3); //(1-t)^3;
		B1_t = 3 * t * Math.pow(1-t, 2);
		B2_t = 3 * Math.pow(t,2) * (1-t);
		B3_t = Math.pow(t, 3);
		px_t = (B0_t * ax) + (B1_t * bx) + (B2_t * cx) + (B3_t * dx);
		py_t = (B0_t * ay) + (B1_t * by) + (B2_t * cy) + (B3_t * dy);
		pt.push([px_t, py_t]);
	}
	pt.push(pt_sq[pt_sq.length-1]);
	return pt;
}

function get_bezier_points(pnt, smooth_value, step) {
/*
	get bezier curve points
*/
	var points = [];
	if (pnt.length > 3) {
		var edge, ctrl;
		for (var cnt = 0; cnt<pnt.length; cnt++) {
			edge = pnt.slice(cnt,cnt+4);
			if (cnt + 4 - pnt.length >= 0) {
				edge = edge.concat(pnt.slice(0,cnt + 4 - pnt.length));
			}
			ctrl = get_control_points(edge, smooth_value);
			var proceed_points = [];
			proceed_points.push(edge[1]);
			proceed_points.push(ctrl[0]);
			proceed_points.push(ctrl[1]);
			proceed_points.push(edge[2]);
			points = points.concat(get_points(proceed_points, step));
		}
	}
	return points;
}

function draw_bezier_points(curve, points, colour) {
	for (var cnt = 0; cnt < points.length; cnt++) {
        var pnt = points[cnt];
        showPt(pnt[0], pnt[1], colour, curve);
    }
}

function get_control_points(points, smooth_value) {
/*
	bezier control points
*/
	var x0 = points[0][0];
	var y0 = points[0][1];
	var x1 = points[1][0];
	var y1 = points[1][1];
	var x2 = points[2][0];
	var y2 = points[2][1];
	var x3 = points[3][0];
	var y3 = points[3][1];
				
	var xc1 = (x0 + x1) / 2.0;
	var yc1 = (y0 + y1) / 2.0;
	var xc2 = (x1 + x2) / 2.0;
	var yc2 = (y1 + y2) / 2.0;
	var xc3 = (x2 + x3) / 2.0;
	var yc3 = (y2 + y3) / 2.0;

	var len1 = Math.sqrt((x1-x0) * (x1-x0) + (y1-y0) * (y1-y0));
	var len2 = Math.sqrt((x2-x1) * (x2-x1) + (y2-y1) * (y2-y1));
	var len3 = Math.sqrt((x3-x2) * (x3-x2) + (y3-y2) * (y3-y2));

	var k1 = len1 / (len1 + len2);
	var k2 = len2 / (len2 + len3);

	var xm1 = xc1 + (xc2 - xc1) * k1;
	var ym1 = yc1 + (yc2 - yc1) * k1;

	var xm2 = xc2 + (xc3 - xc2) * k2;
	var ym2 = yc2 + (yc3 - yc2) * k2;

	// Resulting control points. Here smooth_value is mentioned
	// above coefficient K whose value should be in range [0...1].
	//var smooth_value = 0.5;//$("tension").value;
	//var smooth_value = $("tension").value;
	//var smooth_value = 0.5;
	var ctrl1_x = xm1 + (xc2 - xm1) * smooth_value + x1 - xm1;
	var ctrl1_y = ym1 + (yc2 - ym1) * smooth_value + y1 - ym1;

	var ctrl2_x = xm2 + (xc2 - xm2) * smooth_value + x2 - xm2;
	var ctrl2_y = ym2 + (yc2 - ym2) * smooth_value + y2 - ym2;
	return [[ctrl1_x,ctrl1_y],[ctrl2_x,ctrl2_y]];
}