/*
	we take the whole canvas and recognize it
*/
var destinationCanvas = document.getElementById('small_canvas');
canvas = document.getElementById('pad');
function canvas_to_array_fake(id) {
	var ctx = document.getElementById(id).getContext("2d");
	var h = ctx.canvas.height;
	var w = ctx.canvas.width;
	
	//alert('h = ' + String(h) + '. w =' + String(w));
	//return w;
	var imgData = ctx.getImageData(0, 0, w, h);
	var data = imgData.data;  // the array of RGBA values
	//return data;
	
	//alert(String(data));
	var canvas_array = [];
	for(var i = 0; i < h; i++) {
		for(var j = 0; j < w; j++) {
			canvas_array.push(data[4 * i * w + 4 * j+3]);
		}
	}
	//alert(String(canvas_array.length));
	return canvas_array;
}
function get_small_image(canvas_id) {
	var width = 28;
	var height = 28;
	var canvas = document.getElementById(canvas_id);
	destinationCanvas.width = destinationCanvas.width;
	var destCtx = destinationCanvas.getContext('2d');
	destCtx.drawImage(canvas, 0, 0, height, width);
	var data = destinationCanvas.toDataURL();
	var arr = canvas_to_array_fake('small_canvas'); 
	return arr;
}
function get_small_image2(canvas_id,x,y,w,h) {
	var width = 28;
	var height = 28;
	var canvas = document.getElementById(canvas_id);
	var ctx = canvas.getContext("2d")
	var myImageData = ctx.getImageData(x,y,w,h);
	destinationCanvas.width = destinationCanvas.width;
	var destCtx = destinationCanvas.getContext('2d');
	destCtx.putImageData(myImageData, 0, 0);
	var data = destinationCanvas.toDataURL();
	var arr = canvas_to_array_fake('small_canvas'); 
	return arr;
}
function fit_image(data) {
	var x = new convnetjs.Vol(28,28,1,0.0);
	var W = 28*28;
	for (var i=0;i<W;i++) {
		x.w[i] = data[i]/255.0;
	}
	return x;
}
			
function classify(canvas_id) {
	var img28 = get_small_image(canvas_id);
	var img_fit = fit_image(img28);
	x = convnetjs.augment(img_fit, 24);
	net.forward(x);
	var yhat = net.getPrediction();
	$('#status_check').html(classes_txt[yhat-1]);
	return x;
}
function classify_modified(canvas_id, net_id, output_id) {
	var img28 = get_small_image(canvas_id);
	var img_fit = fit_image(img28);
	x = convnetjs.augment(img_fit, 24);
	net_id.forward(x);
	var yhat = net_id.getPrediction();
	$('#' + String(output_id)).html(classes_txt[yhat-1]);
	return x;
}
function classify_modified2(canvas_id, net_id, output_id, class_list) {
	/*
	var canvas = document.getElementById(canvas_id);
	var img28 = get_small_image2(canvas_id,0,0,canvas.width,canvas.height);
	*/
	var img28 = get_small_image(canvas_id);
	var img_fit = fit_image(img28);
	x = convnetjs.augment(img_fit, 24);
	net_id.forward(x);
	var yhat = net_id.getPrediction();
	$('#' + String(output_id)).html(class_list[yhat-1]);
	return yhat;
}
	
function mode(array) {
	if(array.length == 0)
		return null;
	var modeMap = {};
	var maxEl = array[0], maxCount = 1;
	for(var i = 0; i < array.length; i++)
	{
		var el = array[i];
		if(modeMap[el] == null)
			modeMap[el] = 1;
		else
			modeMap[el]++;	
		if(modeMap[el] > maxCount)
		{
			maxEl = el;
			maxCount = modeMap[el];
		}
	}
	return maxEl;
}
function classify_modified3(canvas_id, net_id, output_id, class_list) {
	var img28 = get_small_image(canvas_id);
	var img_fit = fit_image(img28);
	var itn = 1;
	var yy = new Array(itn);
	var yhat;
	for (var cnt = 0; cnt < itn; cnt++) {
		x = convnetjs.augment(img_fit, 24);
		net_id.forward(x);
		yhat = net_id.getPrediction();
		yy[cnt] = yhat;
	}
	yhat = mode(yy);
	$('#' + String(output_id)).html(class_list[yhat-1]);
	return yhat;
}