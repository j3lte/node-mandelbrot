var Canvas = require('canvas');

function Mandeliter(cx, cy, maxiter)
{
  var i;
  var x = 0.0;
  var y = 0.0;
  for (i = 0; i < maxiter && x*x + y*y <= 4; ++i)
  {
    var tmp = 2*x*y;
    x = x*x - y*y + cx;
    y = tmp + cy;
  }
  return i;
}

function getMandel(data,callback){

    var minX = data.x - data.scaleX,
        maxX = data.x + data.scaleX,
        minY = data.y - data.scaleY,
        maxY = data.y + data.scaleY;

    console.dir({ min : minX, max: maxX, mY : minY, mxY : maxY });
    
    var canvas = new Canvas(data.width, data.height);
    var ctx = canvas.getContext("2d");

    var img = ctx.getImageData(0, 0, data.width, data.height);
    var pix = img.data;
    
    for (var ix = 0; ix < data.width; ++ix)
    for (var iy = 0; iy < data.height; ++iy)
    {
      var x = minX + (maxX-minX)*ix/(data.width-1);
      var y = minY + (maxY-minY)*iy/(data.height-1);
      var i = Mandeliter(x, y, data.iter);

      var ppos = 4*(900*iy + ix);
      if (i == data.iter)
      {
        pix[ppos] = 0;
        pix[ppos+1] = 0;
        pix[ppos+2] = 0;
      }
      else
      {
        var c = 3*Math.log(i)/Math.log(data.iter - 1.0);
        if (c < 1)
        {
          pix[ppos] = 255*c;
          pix[ppos+1] = 0;
          pix[ppos+2] = 0;
        }
        else if (c < 2)
        {
          pix[ppos] = 255;
          pix[ppos+1] = 255*(c-1);
          pix[ppos+2] = 0;
        }
        else
        {
          pix[ppos] = 255;
          pix[ppos+1] = 255;
          pix[ppos+2] = 255*(c-2);
        }
      }
      pix[ppos+3] = 255;
    }
    ctx.putImageData(img,0,0);
    callback(canvas);
}

exports.mandel = function(req,res){
    
    data = {
        x : req.query.x ? parseFloat(req.query.x) : -0.5,
        y : req.query.y ? parseFloat(req.query.y) : -0,
        scaleX : req.query.scaleX ? parseFloat(req.query.scaleX) : 1.5,
        scaleY : req.query.scaleY ? parseFloat(req.query.scaleY) : 1,
        iter : req.query.iter ? parseInt(req.query.iter) : 1000,
        width : req.query.width ? parseInt(req.query.width) : 500,
        height : req.query.height ? parseInt(req.query.height) : 500
    }

    console.dir(data);

    getMandel(data,function(canvas){
        if (req.query.text){
            res.writeHead(200, {'Content-Type':'text'});
            canvas.toDataURL(function(err,str){
                if (!err){
                    res.write(str);
                    res.end();
                } else {
                    throw 'DataURL error!';
                }
            });

        } else {
            res.writeHead(200, {'Content-Type':'image/png'});
            canvas.toBuffer(function(err,buf){
                if (!err){
                    res.write(buf);
                    res.end();
                } else {
                    throw 'Buffer error!';
                }
            });
        }
    });
}

exports.index = function(req, res){
  res.render('index', { title: 'Mandelbrot' });
};