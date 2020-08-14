
String.prototype.stripSlashes = function(){
    return this.replace(/\\(.)/mg, "$1");
}


fn = {

        createImg : function( opc = { src: '', class : '' , 'onclick' : '' }){
            return  '<div class="preloadimg"><img class="img-reposive pre-load '+opc.class+'" onclick="'+opc.onclick+'" src="'+opc.src+'" /></div>';
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
                   
                  var box =  '<div class="boxProduc '+classname+'" data-product="'+opc.id+'" onclick="app.openProduct(this)">'+title.stripSlashes()+'</div>';
                  return box;
        },

        alert : function(opc = { msg : '', title : '', buttonName:'', Callback: '' } ){
                    var msg = (opc.msg) ? opc.msg : opc;
                    if (navigator.notification){
                        navigator.notification.alert(opc.msg, opc.Callback, opc.title, opc.buttonName);
                    }else{
                        alert( msg )
                    }
        },

        confirm : function(opc = { msg : '', title : '', buttonName:'', Callback: '' } ){
            var msg = (opc.msg) ? opc.msg : opc;
            if (navigator.notification){
                navigator.notification.confirm(opc.msg, function(){ eval(opc.Callback) }, opc.title, opc.buttonName);
            }else{
                if (confirm(opc.msg)){
                    if (opc.Callback) eval(opc.Callback);
                }
            }
}
}