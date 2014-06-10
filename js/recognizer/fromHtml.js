var data_loaded;
var net1;

function to_canvas(id,dt) {
    var canvas = document.getElementById(id);
    var ctx = canvas.getContext("2d");
    var w = canvas.width; //dt[0].length;
    var h = canvas.height;
    var g = ctx.createImageData(w, h);
    //var h = dt.length;
    /*
     h = ctx.canvas.height;
     ctx.canvas.width = w;
     */
    //alert('height = ' + String(h) + ' width = ' + String(w));
    //var imgData = ctx.getImageData(0, 0, w, h);
    //var data = new Array(4*dt.length);
    /*
     for(var i = 0; i < g.data.length; i++) {
     g.data[i] = 100;
     }
     */
    for(var i = 0; i < h; i++) {
        for(var j = 0; j < w; j++) {
            pos_bitmap = (i*w + j)*4 + 3;
            pos_array = i*w + j;
            g.data[pos_bitmap] = dt[pos_array];
        }
    }
    /*
     for(var i = 0; i < h; i++) {
     for(var j = 0; j < w; j++) {
     data[4 * i * w + 4 * j + 3] = dt[i*w + j];
     }
     }
     var img = new Image();
     img.src = data[0];
     ctx.drawImage(img, 100, 30);
     */
    ctx.putImageData(g, 0, 0);
}
function clearImage(canvas_id){
    canvas = document.getElementById(canvas_id);
    canvas.width = canvas.width;
}
function clear1() {
    clearImage('pad1');
    change_status('Draw kolobok in the field above');
    right_blocked = true;
    left_blocked = false;
}
function clear2() {
    clearImage('pad2');
}
function write_text() {
    var c=document.getElementById("pad1");
    var ctx=c.getContext("2d");
    ctx.font="10px Georgia";
    ctx.fillText("Hello World!",10,50);
    ctx.font="30px Verdana";
    // Create gradient
    var gradient=ctx.createLinearGradient(0,0,c.width,0);
    gradient.addColorStop("0","magenta");
    gradient.addColorStop("0.5","blue");
    gradient.addColorStop("1.0","red");
    // Fill with gradient
    ctx.fillStyle=gradient;
    ctx.fillText("Big smile!",10,90);
}
function getnet2() {
    if (network_prepared) {
        clearInterval(net2get);
        net2 = net; //net2 = JSON.parse(JSON.stringify(net));
        console.log('net2 is loaded');
        //console.log(JSON.stringify(net1) === JSON.stringify(net2));
        //.log(JSON.stringify(net1) === JSON.stringify(net1));
    }
}
function getnet1() {
    if (network_prepared) {
        clearInterval(net1get);
        net1 = net; //JSON.parse(JSON.stringify(net));
        load_classifier('http://mrtgo.com/jscode/dirtmp/class5_net.txt');
        net2get = setInterval(getnet2,1000);
        console.log('net1 is loaded');
    }
}
function classify_loc() {
    //classify("pad1");
    classify_modified2("pad1", net1, 'status_check', class_list1);
    classify_modified2	("pad2", net2, 'status_check2', class_list2);
    //console.log(get_center("pad1"));
    var cntr = get_center("pad1");
    var txt = "Hi! Nice to meet you!";
    draw_dialog3("pad1", 90, 10, cntr[0], cntr[1] + 50, 15, txt);
    var msg = new SpeechSynthesisUtterance(txt);
    window.speechSynthesis.speak(msg);
}
function classify_kol() {
    //classify("pad1");
    ans = classify_modified2("pad1", net1, 'status_check', class_list1);
    //classify_modified2	("pad2", net2, 'status_check2', class_list2);
    //console.log(get_center("pad1"));
    var c = document.getElementById("pad1");
    var ctx = c.getContext("2d");
    imgData = ctx.getImageData(0,0, c.width, c.height);
    //ctx.putImageData(imgData,0,0);
    switch(ans) {
        case 1:
            change_status('Add mouth and eyes!');
            break;
        case 2:
            change_status('Draw mouth properly!');
            break;
        case 3:
            change_status('Draw eyes properly!');
            break;
        case 4:
            var cntr = get_center("pad1");
            var txt = "Hi! Nice to meet you!";
            //draw_dialog3("pad1", 90, 10, cntr[0], cntr[1] + 50, 15, txt);
            draw_dialog4("pad1", 90, 10, 5, txt);
            var msg = new SpeechSynthesisUtterance(txt);
            window.speechSynthesis.speak(msg);
            change_status('Nice! Now you can draw object in the right field!');
            right_blocked = false;
            left_blocked = true;
            break;
        case 5:
            change_status('Something has gone wrong! Redraw or add some details please.');
    }
    /*
     if (ans === 4) {
     var cntr = get_center("pad1");
     var txt = "Hi! Nice to meet you!";
     draw_dialog3("pad1", 90, 10, cntr[0], cntr[1] + 50, 15, txt);
     var msg = new SpeechSynthesisUtterance(txt);
     window.speechSynthesis.speak(msg);
     } else {
     alert('try again!');
     var canvas = document.getElementById('pad1');
     canvas.width = canvas.width;
     }
     */
}
function classify_obj() {
    //classify("pad1");
    //classify_modified2("pad1", net1, 'status_check', class_list1);
    ans = classify_modified3("pad2", net2, 'status_check2', class_list2);
    var c = document.getElementById("pad1");
    var ctx = c.getContext("2d");
    //imgData = ctx.getImageData(0,0, canvas.width, canvas.height);
    c.width = c.width;
    ctx.putImageData(imgData,0,0);
    var txt = "You drew a " + class_list2[ans-1] + "!";
    //draw_dialog3("pad1", 90, 10, cntr[0], cntr[1] + 50, 15, txt);
    draw_dialog4("pad1", 90, 10, 5, txt);
    var msg = new SpeechSynthesisUtterance(txt);
    window.speechSynthesis.speak(msg);
}
function load_data() {
    var request = new XMLHttpRequest();
    //request.open('GET', 'http://mrtgo.com/numbers.txt', true);
    request.open('GET', 'http://mrtgo.com/dirtmp/samples.txt', true);
    request.onreadystatechange = function() {
        // Makes sure the document is ready to parse.
        if(request.readyState == 4) {
            // Makes sure it's found the file.
            if(request.status == 200) {
                data = request.responseText;
                data_loaded = true;
            }
        }
    };
    request.send(null);
}
var process_data = function() {
    if (!data_loaded)
        return;
    dt = data.split("\n");
    dt_sep = [];
    for (var cnt = 0; cnt < dt.length; cnt++) {
        str_arr = dt[cnt].split(' ');
        num_arr = [];
        for (var i = 0; i < str_arr.length; i++) {
            num_arr.push(parseFloat(str_arr[i]));
        }
        dt_sep.push(num_arr);
    }
    to_canvas('pad_small1', dt_sep[0]);
    to_canvas('pad_small2', dt_sep[1]);
    to_canvas('pad_small3', dt_sep[2]);
    to_canvas('pad_small4', dt_sep[3]);
    to_canvas('pad_small5', dt_sep[4]);
    clearInterval(data_inter);
    // convert data to array
    /*
     network_saved = network_saved.replace(/\\/g, '');
     var json = JSON.parse(network_saved);
     net = new convnetjs.Net();
     net.fromJSON(json);
     clearInterval(data_inter);
     alert('data processed!');
     */
    //$('#status_check').html('classifier successfully loaded');
};
function change_status(txt) {
    var y = document.getElementById("status_message");
    y.innerHTML = txt;
}
//var load_from_server = function() {
//    load_data();
//    data_inter = setInterval(process_data, 100);
//}