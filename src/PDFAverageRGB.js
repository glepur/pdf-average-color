(function (window, document, undefined) {

    'use strict';

    window.PDFAverageRGB = function (file, callback, options) {
        
        var options = options || {}, 
            blockSize = options.sampling || 100,
            defaultRGB = options.defaultColor || {r:0,g:0,b:0},
            canvas = options.canvas || document.createElement('canvas'),
            context = canvas.getContext && canvas.getContext('2d'),
            data,
            i = -4,
            length,
            rgb = {r:0,g:0,b:0},
            count = 0;
            
        if (!context) {
            return defaultRGB;
        }
        
        PDFJS.getDocument(file).then(function(pdf) {

            pdf.getPage(1).then(function(page) {
                var scale = 1.5;
                var viewport = page.getViewport(scale);

                canvas.height = viewport.height;
                canvas.width = viewport.width;

                var renderContext = {
                  canvasContext: context,
                  viewport: viewport
                };
                page.render(renderContext).then(function () {
                    try {
                        data = context.getImageData(0, 0, canvas.width, canvas.height);
                    } catch(e) {
                        /* security error, img on diff domain */alert('x');
                        return defaultRGB;
                    }
                    
                    length = data.data.length;
                    
                    while ( (i += blockSize * 4) < length ) {
                        ++count;
                        rgb.r += data.data[i];
                        rgb.g += data.data[i+1];
                        rgb.b += data.data[i+2];
                    }
                    
                    // ~~ used to floor values
                    rgb.r = ~~(rgb.r/count);
                    rgb.g = ~~(rgb.g/count);
                    rgb.b = ~~(rgb.b/count);

                    callback(rgb);
                });

            });

        });
    }

})(window, document);