
String.prototype.stripSlashes = function(){
    return this.replace(/\\(.)/mg, "$1");
}

function addslashes(string) {
    return string.replace(/\\/g, '\\\\').
        replace(/\u0008/g, '\\b').
        replace(/\t/g, '\\t').
        replace(/\n/g, '\\n').
        replace(/\f/g, '\\f').
        replace(/\r/g, '\\r').
        replace(/'/g, '\\\'').
        replace(/"/g, '\\"');
}

fn = {

        preloadImg :function(pictureUrls, callback) {
            
            var i,j,loaded = 0;
        
            for (i = 0, j = pictureUrls.length; i < j; i++) {
                (function (img, src) {
                    img.onload = function () {                               
                        if (++loaded == pictureUrls.length && callback) {
                            callback();
                        }
                    };
        
                    // Use the following callback methods to debug
                    // in case of an unexpected behavior.
                    img.onerror = function () {};
                    img.onabort = function () {};
        
                    img.src = src;
                } (new Image(), pictureUrls[i]));
            }
        },
        createImg : function( opc = { src: '', class : '' , 'onclick' : '' }){
            return  '<img class="img-reposive pre-load '+opc.class+'" data-origName="" onclick="'+opc.onclick+'" src="'+opc.src+'" />';
        },
        createH1 : function( opc = { src: '', class : '' , 'onclick' : '' }){
            return  '<h1 class="'+opc.class+'" onclick="'+opc.onclick+'">'+opc.text+'</h1>';
        },
        createBoxProduct : function( opc = {}){
                   
                  if (opc.enabled == 1){
                        var title     =  (opc.smtitulo) ? opc.smtitulo : opc.titulo;
                        var classname =  'lotiene';
                  }else{
                        var title     =  (opc.smtitulo) ? opc.smtitulo : opc.titulo;
                        var classname =  'nolotiene';
                  }
                  
                  if (!title) title = '';
                  var box =  '<div class="boxProduc '+classname+'" data-product="'+opc.id+'" onclick="app.openProduct(this)">'+title.stripSlashes()+'</div>';
                  return box;
        },

        getExt : function (nameFile=''){
            return nameFile.substr(nameFile.lastIndexOf('.') + 1);
        },
 
        sleep : function(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        },
 
        alert : function(opc = { msg : '', title : '', buttonName:'', Callback: '' } ){
                    var msg = (opc.msg) ? opc.msg : opc;
                    
                    if (navigator.notification){
                        navigator.notification.alert( opc.msg , opc.Callback, opc.title, opc.buttonName);
                    }else{
                        alert( msg )
                    }
        },

        articleCategori  : function(categoria){
            var aCategorias  =  categoria.split(',');
            var strCategoria = '';
            for(i=0;i<aCategorias.length;i++){
                var info     = fn.getValueInObjectById(app.LoginData.categorias.actialidad,aCategorias[i]);
                var tag      = this.tagOnclick('span',info.label, 'app.filterActualidad(\'categoria\','+info.id+')');
                strCategoria = (!strCategoria) ? tag : ','+tag;
            }

            return strCategoria;
        },

        tagOnclick : function (tag, value, onclick=''){
            return '<'+tag+' onclick="'+onclick+'">'+value+'</'+tag+'>';
        },

        article : function(opc = {} ){

            if (!opc.autorpic) opc.autorpic = 'svg/logo.svg';
            
            
            opc.categoria = this.articleCategori(opc.categoria);

            var box =  '<article>\
                                <div class="box-card-img pre-load-bg" onclick="app.openActualiadd('+opc.id+')" >\
                                        <img class="img-reposive" data-origName="" src="'+opc.imgPOST+'" />\
                                </div>\
                                <div class="text">\
                                        <div class="info">\
                                                <div class="avatar-escritor"><img class="img-reposive pre-load" onclick="app.filterActualidad(\'autor\','+opc.autorId+')" data-origName="" src="'+opc.autorpic+'" /></div>\
                                                <h3 onclick="app.openActualiadd('+opc.id+')">'+opc.title+'</h3>\
                                                <div class="col-6 date">'+opc.fpublic+'</div>\
                                                <div class="col-6 categoria tr">'+opc.categoria+'</div>\
                                                <p onclick="app.openActualiadd('+opc.id+')">'+opc.textinto+'</p>\
                                        </div>\
                                </div>\
                        </article>';
            return box;  
        },

        confirm : function(opc = { msg : '', title : '', buttonName:'', Callback: '' } ){
            var msg = (opc.msg) ? opc.msg : opc;
            if (navigator.notification){
                navigator.notification.confirm(opc.msg, function(buttonIndex){ if (buttonIndex === 1) eval(opc.Callback) }, opc.title, opc.buttonName);
            }else{
                if (confirm(opc.msg)){
                    if (opc.Callback) eval(opc.Callback);
                }
            }
        },

        contador : function(n = ''){
             if (n){
                 return '<span class="contador">'+n+'</span>';
             }        
        },

        isObject : function(val){
            return (typeof val === 'object') ? true : false;
        },

        getValueInObjectById : function(myArray , keyValue){
                for (var i=0; i < myArray.length; i++) {
                    if (myArray[i].id == keyValue) {
                        return myArray[i];
                    }
                }
                return new Array();
        },
      
        convertDataURIToBinary : function(dataURI) {
            var BASE64_MARKER = ';base64,';
            var base64Index = dataURI.indexOf(BASE64_MARKER) + BASE64_MARKER.length;
            var base64 = dataURI.substring(base64Index);
            var raw = window.btoa(unescape(encodeURIComponent(base64)));
            var rawLength = raw.length;
            var array = new Uint8Array(new ArrayBuffer(rawLength));

            for(var i = 0; i < rawLength; i++) {
                array[i] = raw.charCodeAt(i);
            }
            return array;
        },

        uri2array : function (uri, buffer) {
            var marker = ';base64,',
                raw = window.atob(uri.substring(uri.indexOf(marker) + marker.length)),
                n = raw.length,
                a = new Uint8Array(new ArrayBuffer(n));
            for(var i = 0; i < n ; i++){
                a[i] = raw.charCodeAt(i);
            }
            return buffer ? a.buffer : a;
        },

        openDocumentPdf : function($url ,$canvas){

                var url = atob($url)
               //  pdfjsLib.GlobalWorkerOptions.workerSrc = 'pdfjs/build/pdf.worker.js';

                // var pdfAsArray = this.convertDataURIToBinary(url);

                var loadingTask = pdfjsLib.getDocument({ data: url});
                loadingTask.promise.then(function(pdf) {
                    pdf.getPage(1).then(function(page) {
                    var scale = 1.5;
                    var viewport = page.getViewport({ scale: scale, });
                    var canvas = document.getElementById($canvas);
                    var context = canvas.getContext('2d');
                    canvas.height = viewport.height;
                    canvas.width = viewport.width;

                    var renderContext = {
                        canvasContext: context,
                        viewport: viewport,
                    };
                    page.render(renderContext);
                    });
                });
        },

        getMobileOperatingSystem : function() {

            var userAgent = navigator.userAgent || navigator.vendor || window.opera;
          
                // Windows Phone must come first because its UA also contains "Android"
              if (/windows phone/i.test(userAgent)) {
                  return "Windows Phone";
              }
          
              if (/android/i.test(userAgent)) {
                  return "Android";
              }
          
              // iOS detection from: http://stackoverflow.com/a/9039885/177710
              if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
                  return "iOS";
              }
          
              return false;
          },
       
          setHeightWindow : function(obj){
                $(obj).height($(window).height());
          },
          
          setWidthWindow : function(obj){
            $(obj).width($(window).width());
          }
        
}