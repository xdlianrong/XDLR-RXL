/**
 * 
 * @authors 王昱森
 * @date    2015-08-14 11:31:44
 * @version 1.0.3
 */

var Radar = (function(){

    var options = {

        styles: {
            offset: {
                top: 15,
                left: 0
            },
            border: {
                width: 2,
                color: '#2EC8CA'
            },
            splitLine: {
                color: '#ccc'
            },
            title: {
                font: 'bold 52px Microsoft YaHei',
                color: '#F56948'
            },
            valueRange: {
                border: {
                    width: 4,
                    color: '#FF0101'
                },
                background: '#F56948',
                arrow: 2
            },
            inner: {
                radius: 70,
                background: '#fff'
            },
            label: {
                image: '',
                font: '16px Microsoft YaHei',
                color: '#666'
            }
        }
    };

    var element,
        styles,
        borderStyle,
        splitLineStyle,
        titleStyle,
        valueRangeStyle,
        innerStyle,
        labelStyle;
    
    var extend = function(obj1, obj2){
        for(var k in obj2) {
            if(obj1.hasOwnProperty(k) && typeof obj1[k] == 'object') {
                extend(obj1[k], obj2[k]);
            } else {
                obj1[k] = obj2[k];
            }
        }
    }

    var calcLocation = function(cp, r, end){

        return {
            x: cp[0] + r * Math.cos(Math.PI * end),
            y: cp[1] + r * Math.sin(Math.PI * end)
        };
    }

    var drawLine = function(line) {
        var lines = line.lines;
        context.beginPath();
        context.moveTo(lines[0].x, lines[0].y);

        for(var i = 1; i < lines.length; i++){
            context.lineTo(lines[i].x, lines[i].y);
        }
        
        context.closePath();

        if(line.style) {
            context.strokeStyle = line.style;
            context.lineWidth = line.width || 1;
            context.stroke();
        }

        if(line.fill) {
            context.fillStyle = line.fill;
            context.fill();
        }
    }

    var fillText = function(opts){
        context.font = opts.font; 
        context.fillStyle = opts.color;
        context.textAlign = opts.align || 'center';
        context.textBaseline = opts.vertical || 'middle';  
        context.moveTo(opts.x, opts.y);  
        context.fillText(opts.text, opts.x, opts.y); 
    }

    var drawIcon = function(borderLoc, polar) {

        var img = new Image();
        img.src = labelStyle.image;
        img.onload = function(){
            for(var n = 0; n < borderLoc.length; n++){
                var text = polar[n].text,
                    icon = polar[n].icon,
                    loc = borderLoc[n],
                    x = loc.x + icon.l,
                    y = loc.y + icon.t;

                context.drawImage(img, icon.sx, icon.sy, icon.w, icon.h, x, y, icon.w, icon.h);

                fillText({
                    font: labelStyle.font,
                    color: labelStyle.color,
                    text: text,
                    x: x + icon.w/2,
                    y: y + icon.h + 10
                });
            }
        }
    }

    var drawInner = function(cp, valueRangeLoc, borderLoc, innerLoc, valueSum) {
        drawLine({
            lines: borderLoc,
            style: borderStyle.color,
            width: borderStyle.width
        });

        drawLine({
            lines: valueRangeLoc,
            style: valueRangeStyle.border.color,
            width: valueRangeStyle.border.width,
            fill: valueRangeStyle.background
        });

        for(var j = 0; j < borderLoc.length; j++){
            drawLine({
                lines: [{x: cp[0], y: cp[1]}, borderLoc[j]],
                style: splitLineStyle.color
            });
        }

        drawLine({
            lines: innerLoc,
            fill: innerStyle.background
        }); 

        fillText({
            font: titleStyle.font,
            color: titleStyle.color,
            text: options.title.replace('{v}', valueSum),
            x: cp[0],
            y: cp[1]
        });

        for (var k = valueRangeLoc.length - 1; k >= 0; k--) {
            var x = valueRangeLoc[k].x,
                y = valueRangeLoc[k].y;

            context.beginPath();
            context.moveTo(x, y);
            context.arc(x, y, valueRangeStyle.arrow, 0, Math.PI*2);
            context.closePath();
            context.strokeStyle = valueRangeStyle.border.color;
            context.lineWidth = valueRangeStyle.border.width;
            context.stroke();
            context.fillStyle = '#fff';
            context.fill();
        }
    }

    var calcRedrawPath = function(borderLoc){
        var startLoc = borderLoc[0];
        var minX = startLoc.x, 
            minY = startLoc.y, 
            maxX = startLoc.x, 
            maxY = startLoc.y;

        for(var i = 1; i < borderLoc.length; i ++) {
            var loc = borderLoc[i];
            minX = loc.x < minX ? loc.x : minX;
            minY = loc.y < minY ? loc.y : minY;
            maxX = loc.x > maxX ? loc.x : maxX;
            maxY = loc.y > maxY ? loc.y : maxY;
        }

        var borderW = borderStyle.width;
        return {
            x: minX - borderW,
            y: minY - borderW,
            w: maxX - minX + borderW * 2,
            h: maxY - minY + borderW * 2
        };
    }

    var drawing = function(cp, w, h){
        var polar = options.polar,
            polarCount = polar.length,
            radius = options.radius,
            data = options.data;
            angles = [],
            borderLoc = [];
            

        var dataTemp = [];
        for(var i = 0; i < polarCount; i++) {
            dataTemp.push(0);

            var end = 1.5 + i * (2/polarCount);
            angles.push(end);
            borderLoc.push(calcLocation(cp, radius, end));
        }

        context.fillStyle = "#fff";
        context.fillRect(0, 0, w, h);

        drawIcon(borderLoc, polar);

        var redrawPath = calcRedrawPath(borderLoc);

        var timer = setInterval(function(){

            var eqCount = 0,
                valueSum = 0,
                valueRangeLoc = [],
                innerLoc = [];

            for(var i = 0; i < polarCount; i++){
                dataTemp[i] = dataTemp[i] + 5 > data[i] ? data[i]: dataTemp[i] + 5;
                if(dataTemp[i] === data[i]) {
                    ++eqCount;
                }

                var end = angles[i];

                // inner
                var ir = innerStyle.radius;
                innerLoc.push(calcLocation(cp, innerStyle.radius, end));

                // valueRange
                var vr = dataTemp[i]/polar[i].max * (radius - ir) + ir;
                valueRangeLoc.push(calcLocation(cp, vr, end));

                valueSum += dataTemp[i];
            }

            if(eqCount === polarCount) {
                clearInterval(timer);
            }

            context.clearRect(redrawPath.x, redrawPath.y, redrawPath.w, redrawPath.h);
            context.fillStyle = "#fff";
            context.fillRect(redrawPath.x, redrawPath.y, redrawPath.w, redrawPath.h);

            drawInner(cp, valueRangeLoc, borderLoc, innerLoc, valueSum);

        }, 10);

                
    }

    var exports = {};

    exports.setOptions = function(opts){
        extend(options, opts);

        styles = options.styles;
        borderStyle = styles.border;
        splitLineStyle = styles.splitLine;
        titleStyle = styles.title,
        valueRangeStyle = styles.valueRange,
        innerStyle = styles.inner;
        labelStyle = styles.label;

        element = typeof options.element == 'string' ? document.getElementById(options.element) : options.element;
        context = element.getContext('2d');
        return exports;
    };

    exports.init = function(){
        var w = element.offsetWidth,
            h = element.offsetHeight;

        var ofs = options.styles.offset;
        drawing([w/2 + ofs.left, h/2 + ofs.top], w, h);
        
        return exports;
    }

    return exports;
    
})();

