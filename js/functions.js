/* 
    Developer By Nick Cyrus Lemus Duque 
    Small FrameWork Movile HTML5 + jQuery + CSS3
*/ 
var LoginData = {}
var bigData = {}

document.addEventListener("deviceready",onDeviceReady,false);

function onDeviceReady() {
    StatusBar.backgroundColorByHexString('#999999');  
    navigator.splashscreen.hide();
}



jQuery(function($){

   
    $(document).on('submit','#loginAccess', {} , function(e){        
           
          var email = $('#email_token').val();
          var pass  = $('#pass_token').val();

          if (!email){ $('#email_token').focus(); return false; }
          if (!pass){ $('#pass_token').focus(); return false; }

          if (email && pass){
              app.login( email , pass)
          }

          e.preventDefault();
    })

    $(document).on('submit','#rememberPass', {} , function(e){        
           
        var email = $('#email_remember').val();
        if (!email){ $('#email_remember').focus(); return false; }
        if (email){
            app.rememberPass(email);
        }
        e.preventDefault();
  })
})

 $(document).ready(function(){
        app.main(); 
 })

 
  
app = {
        debug : false, 
        loading : '' ,
        pageBefore : '',
        wDivice : 0,
        hDivice : 0,
        baseULR : '',
        lastEvent : '',
        navApp : [],
        zIndex : 1000,
        LoginData : '',
        showLopd : false,
        loadPagesCount : 0,
        currentLang : (window.localStorage["ISO_LANG"]) ?  window.localStorage["ISO_LANG"] : 'ca',
        language : '',
        currentEntidad : (window.localStorage["EntidadID"]) ? { id: window.localStorage["EntidadID"] , name : window.localStorage["EntidadName"], rolcon : window.localStorage["rolCon"]}  : { id: '', name : '' , rolcon : ''},
    
        main : function(){
            this.setLang();
            this.loadPages();
           
        },

        checkNextStep : function(){
                this.loadPagesCount +=1;
                if (pages.pages.length == this.loadPagesCount){
                    console.log('load all pages')
                    this.setSizeMobil();
                    this.hastControl();
                    this.oauth();
                }
        },

        loadPages : function(){
            var self = this
                if (pages){
                    $(pages.pages).each(function(index, item){
                        $("#pageInsert").html('<div id="page-'+item.name+'" />')

                         
                        $.ajax({
                            url: item.path,
                            dataType: 'html',
                            success: function(data) {
                                $('body').append(self.traslate(data));
                            },
                            complete : function(){
                                 self.checkNextStep();
                            }
                        });

                       /*
                            $("#pageInsert").load(item.path , function() {
                                // Obtenemos el contenido
                                var html = $("#pageInsert").html();
                                $("#pageInsert").html('');
                                $('body').append(self.traslate(html));
                            });
                       */
                    })
                
                   

                }
         
        },

        traslate : function(html){
            var self = this    
            let path = String(html);
            const paramsPattern = /[^{{\}}]+(?=}})/g;
            let extractParams = path.match(paramsPattern);
            $(extractParams).each(function(index, item){
               path = self.replaceAll(path,'{{'+item+'}}',self.language[item]);
            })
           
            return path;
 
        },    

        replaceAll : function (string, search, replace) {
            return string.split(search).join(replace);
        },

        setLang : function (lang=''){
            var self = this
            if (!lang) lang = this.currentLang;
            var items = [];
            $.getJSON( "lang/"+lang+".json", function( data ) {
                    $.each( data, function( key, val ) {  items[key] = val; });
            });
            self.language = items;            
        },
        rememberPass : function( email ){
            var self = this
            this.ajax({
                         beforeSend : function(){
                                app.dialogWait( self.language['pleacewait']);
                         },
                         datos : { opc : 'rememberPass', email: email },
                         success: function(rs){
                                app.dialogClose();
                                if (rs.error){
                                    $('#email_token').focus();
                                    app.alertConfirm( self.language['valiLoginError'], self.language['ErrorRememberPass']);
                                }
                             
                                if (rs.success){
                                    $('[data-page="modal-mremember"] .modal-content').css('padding-top','140px');    
                                    $('[data-page="modal-mremember"] .modal-content').html(self.language['SuccessRememberPass'])
                                }
                                
                                 
                         },
                         errorCallback : function(){
                             app.dialogClose();
                         }
                      })
        },
        
        logout : function(){
            fn.confirm({msg :'Realmente desea salir', title : 'Salir', buttonName : ["SI","NO"] , Callback : 'app.closeSession()'}) 
        },

        closeSession : function(){
            window.localStorage['username'] = '';
            window.localStorage['username'] = '';
            this.animatePage('profile','out-right');
            window.location.reload();
        },

        login  : function( email , pass, token){
            var self = this
            this.ajax({
                         beforeSend : function(){
                                app.dialogWait( self.language['valiLogin']);
                         },
                         datos : { opc : 'login', user: email , pass : pass , token : token },
                         success: function( rs){
                                app.dialogClose();
                                if (rs.error){
                                    $('#email_token').focus();
                                    app.alertConfirm( self.language['valiLoginError'], self.language['valiLoginErrorMsg']);
                                }
                                
                                if (rs.inflogin){
                                    self.LoginData = rs.inflogin;
                                    $('#email_token , #pass_token').val('');
                                    window.localStorage["username"]   = self.LoginData.user.email;
                                    window.localStorage["password"]   = self.LoginData.user.pass;
                                    window.localStorage["ISO_LANG"]   = self.LoginData.user.ISO_LANG;
                                    // Definimos la versión de LOPD
                                    if (!window.localStorage["lopdverion"+self.LoginData.user.id]) {
                                        self.showLopd = true;    
                                    }
                                    // Si la version de LOPD es diferente
                                    if (!self.showLopd && window.localStorage["lopdverion"+self.LoginData.user.id] != self.LoginData.user.lopdverion){
                                        self.showLopd = true;
                                    }
                                    
                                    self.setDataUser(self.LoginData);
                                    if (self.LoginData.user.ISO_LANG != self.currentLang){
                                            window.location.reload();
                                    } 
                                    
                                    $('[data-page="modal-lopd"] #lopd-title').html(self.LoginData.lopd.title);
                                    $('[data-page="modal-lopd"] #lopd-body').html(self.LoginData.lopd.body);

                                    if (self.showLopd){
                                        app.animatePage('home','in-right', { preload : true, showEnd : true });
                                        app.animatePage('modal-lopd','in-bottom');
                                    }else{
                                        app.animatePage('home','in-right',  { endAnimation :  'app.loadHome()'});
                                    }
                                }
                         },
                         errorCallback : function(){
                             app.dialogClose();
                         }
                      })
        },
        setViewLopd : function(){
            window.localStorage["lopdverion"+this.LoginData.user.id] = this.LoginData.user.lopdverion;
            this.animatePage('home','show');
        },

        setEntidad  : function(id , gc_name, rolcon){
            window.localStorage["EntidadID"]   = id;
            window.localStorage["EntidadName"] = gc_name
            window.localStorage["rolCon"]      = rolcon  
            this.currentEntidad                =  { id: window.localStorage["EntidadID"], name : window.localStorage["EntidadName"], rolcon : window.localStorage["rolCon"] } 
            $('#entidad-select span').html(gc_name);
        },

        loadHome    : function(event = 'home' ){
            if (!this.isLogin()) return;
            var self = this;
            this.dialogClose();
            this.ajax({
                        beforeSend : function(){
                            self.dialogWait(self.language['pleacewait']);     
                        },
                       datos : {opc : event , entidad : self.currentEntidad , lang : self.currentLang , currentUser : self.LoginData.user.id }, 
                       success : function(rs){
                            self.dialogClose();
                            if (rs.info.entidad.logo){
                                $('[data-page="home"] #content .logo-cia').html( fn.createImg( {src : rs.info.entidad.logo }));
                            }else{
                                $('[data-page="home"] #content .logo-cia').html( fn.createH1( {text : rs.info.entidad.gc_alias })); 
                            }
                            if (rs.info.productos){
                                $('[data-page="home"] #content .productos').html('');
                                $(rs.info.productos).each(function(index , item){
                                    $('[data-page="home"] #content .productos').append(fn.createBoxProduct(item));
                                })
                                
                            }
                       }   
            })
            
        },
        page : function(opc = {}){
            this.loadEntidad({ id : window.localStorage["EntidadID"] , name : window.localStorage["EntidadName"] , rolcon :  window.localStorage["rolCon"] })
        },
        loadEntidad : function(ent){
              this.setEntidad(ent.id , ent.name , ent.rolcon);  
              $('.list-entidad li').removeClass('firts');
              $('[data-entidad="'+ent.id+'"]').addClass('firts');
              this.animatePage('profile','out-right');
              $('.list-entidad').toggle();
              this.loadHome();
        }, 
        setDataUser : function(data){
                self = this
                $('.name-user-login').html(data.user.displayName);

                if (data.entidades.length > 1){
                        i = 0;
                        $(data.entidades).each(function(index , item ){
                                if (!item.gc_alias) item.gc_alias =  item.gc_name;
                                if ((i == 0 && !self.currentEntidad.id) || self.currentEntidad.id == item.ID){ 
                                    $('.list-entidad').append('<li class="firts" data-entidad="'+item.ID+'" onclick="app.loadEntidad({ id : '+item.ID+' , name : \''+item.gc_alias+'\' , rolcon : '+item.rolcon+' })">'+item.gc_alias+'</li>');
                                    self.setEntidad(item.ID, item.gc_alias , item.rolcon);
                                }else{
                                    $('.list-entidad').append('<li data-entidad="'+item.ID+'" onclick="app.loadEntidad({ id : '+item.ID+' , name : \''+item.gc_alias+'\' , rolcon : '+item.rolcon+' })">'+item.gc_alias+'</li>')
                                }
                            i++;
                         })
                }else{
                         if (!data.entidades[0].gc_alias) data.entidades[0].gc_alias =  data.entidades[0].gc_name;
                        $('.list-entidad').append('<li class="active" data-entidad="'+data.entidades[0].ID+'">'+data.entidades[0].gc_alias+'</li>');
                        self.setEntidad(data.entidades[0].ID, data.entidades[0].gc_alias , data.entidades[0].rolcon);
                }
        },

        isLogin : function(){
               return (window.localStorage["username"] && window.localStorage["password"]) ? true : false;
        },
        oauth : function(){
                var oauth = window.localStorage["username"];
                if (oauth){
                        LoginData = oauth;
                        this.login(window.localStorage["username"] , window.localStorage["password"], true);
                }else{
                    var pageActive = this.getCurrentPage('.active');
                        setTimeout(function(){ $('[data-page="login"]').fadeIn().addClass('active');
                        pageActive.removeClass('active');
                    }, 500);
                    // 
                   
                }
        },
    
        hastControl : function(){
          
            if (window.history && window.history.pushState) {
                $(window).on('hashchange', function(e) {
                    
                    var hash = app.getLastNav();
                    
                    var hashLocation = location.hash.replace('#','');
                
                    if ( hash != hashLocation && hashLocation ) {
                            if (hash =='home') { location.hash = "#home"; return false; } 
                            app.animatePage(hash,'out-right');
                    }
                    
                });
          }
                
        },
        setNavigator : function(value){
                var indice = (!this.navApp.length) ? 0 : (this.navApp.length);
                this.navApp[indice] = value;
        },
        unsetNavigator : function(value){
                var indice = (!this.navApp.length) ? 0 : (this.navApp.length) - 1;
                this.navApp.splice(indice, 1);    
        },
        backNavigator: function(){
            window.history.back();
        },
        getLastNav : function(){
            var indice = (!this.navApp.length) ? 0 : (this.navApp.length - 1); 
            return this.navApp[indice];
        },
        setSizeMobil : function(){
                
               this.hDivice = $(window).height() ;   
               this.wDivice = $(window).width() ;
               this.baseULR = window.location.href;


                var addCss = '<style type="text/css">'+
                             '.page { overflow: hidden; '+
                                'height :'+$(window).height()+'px'+
                             '}'+
                             '.sibar-content {'+
                                'height :'+( $(window).height() - ($('header nav').height() + 40 )  )+'px !important'+
                             '}'+
                             '.content {'+
                                'height :'+( $(window).height() - ($('header nav').height() + $('footer nav').height() )  )+'px'+
                             '}'+
                             '.content-header {'+
                                'height :'+( $(window).height() - $('header nav').height() )+'px'+
                             '}'+
                             '.content-full {'+
                                'height :'+( $(window).height() )+'px'+
                             '}'+
                             '[data-start="bottom"] {'+
                                'top :'+( $(window).height()  )+'px'+
                             '}'+
                              '[data-start="right"] {'+
                                'top:0px; right :-'+( this.wDivice  )+'px'+
                             '}'+
                            '[data-start="left"] {'+
                                'left :-'+( this.wDivice  )+'px'+
                             '}'+
                             '</style>';
            
            
            
                $('body').append(addCss);
            
            
        },
    
        dialogWait : function (msg){
            
                msg =  (msg) ? msg : '';
            
                this.loading = $.dialog({
                    title: '',
                    content: '<div class="ajax-loading-medium"><img src="images/loading.svg" /><p>'+msg+'</p></div>',
                    closeIcon: false,
                    onClose: function () {
                        
                    }

                });
            
        },
    
        dialogClose : function(ID){
            if (!ID)
                this.loading.close();   
            else
                ID.close();   
        },
        
        getzIndex   : function(){
            this.zIndex += 10;
            return this.zIndex
        },

        getCurrentPage : function(search='.currentPageActive'){
            return $('.page'+search);     
        },

        closePage  :  function (pageName , ANIMATION , velocity = 500 ){
                
                ANIMATION = (ANIMATION) ? ANIMATION : 'basic';
                var propagation = true;
                var page = $('.page[data-page="'+pageName+'"]');
                if(!page.length) {
                    page = $('section[data-sidebar="'+pageName+'"]');
                    velocity = 100;
                }

                if(!page.length)  return false;
                var wDivice = this.wDivice;
                
                $('*').removeClass('currentPageActive');
                page.addClass('currentPageActive')
                  
                switch(ANIMATION){
                    case 'hide':{
                        page.css({'display':'none'});
                        page.stop().css({top: this.hDivice+'px' , left : 0 });
                        $('*').removeClass('currentPageActive');
                    }
                } 
        }, 

        setColorStatusBar : function(StatusBarColor){
            if (this.is_movil()) StatusBar.backgroundColorByHexString(StatusBarColor);   
        },
        
        ToggleAnimatePage: function(pageName , ANIMATIONIN , ANIMATIONOUT){
                
            var page = $('.page[data-page="'+pageName+'"]');
            if(!page.length)  page = $('section[data-sidebar="'+pageName+'"]');
             
            if (page.is('.currentPageActive')){
                    this.animatePage(pageName , ANIMATIONOUT);
            }else{
                    this.animatePage(pageName , ANIMATIONIN);
            }
            
        },

        animatePage : function (pageName , ANIMATION , opc = {} ,  velocity = 500 , ){
                
                ANIMATION = (ANIMATION) ? ANIMATION : 'basic';
                
                var propagation = true;
            
                var page = $('.page[data-page="'+pageName+'"]');
                var StatusBarColor = page.attr("data-StatusBar");

                if(!page.length) {
                    page = $('section[data-sidebar="'+pageName+'"]');
                    velocity = 100;
                }        
                 
                if(!page.length)  return false;

                if (!opc.preload)
                   page.css({'display':'block'});
                else
                   page.css({'display':'none'});

                page.addClass('animated-page');
                 
                if (page.attr("data-speed")) velocity = parseFloat(page.attr("data-speed"));
                
                if (StatusBarColor && this.is_movil()) StatusBar.backgroundColorByHexString(StatusBarColor);
            
                
                var wDivice = this.wDivice;
                
                $('*').removeClass('currentPageActive');
                page.addClass('currentPageActive')
                  
                switch(ANIMATION){
                    
                    case 'out-right':
                        page.stop().animate({'top':0,
                                      'left':(this.wDivice)+'px', 
                                      'position':'absolute'},velocity,function(){
                                    page.attr('style', '').removeClass('animated-page');
                                    if (opc.endAnimation) eval(opc.endAnimation);
                        });
                        this.lastEvent = 'out'; 
                        this.unsetNavigator(pageName);
                        $('*').removeClass('currentPageActive');
                    break;
                    case 'out-left':
                        page.stop().animate({'top':0,
                                      'left':'-'+(this.wDivice)+'px', 
                                      'position':'absolute'},velocity,function(){
                                      
                                      page.attr('style', '').removeClass('animated-page');
                                      page.attr('style', '');              
                                      page.css({'left':'-'+(wDivice)+'px' });  
                                      if (opc.endAnimation) eval(opc.endAnimation);    
                        });
                        
                        this.lastEvent = 'out';
                        this.unsetNavigator(pageName);
                        $('*').removeClass('currentPageActive');
                    break; 
                    case 'hide':{
                        // page.css({'display':'none'});
                        page.stop().css({top: this.hDivice+'px' , left : 0 });
                        page.css({'display':'block'});
                    }
                    case 'show':
                        
                        page.animate({'z-index': this.getzIndex(),
                                      top:'0px', 
                                      left : 0,
                                      'position':'absolute'},velocity,function(){

                                        if (opc.endAnimation) eval(opc.endAnimation);

                                      });
                        
                        this.setNavigator(pageName);
                        this.lastEvent = 'in';
                        window.location.href = "#"+pageName;
                        
                        
                        
                    break;
                    case 'in-right':
                        page.stop().css({'right':'-'+(this.wDivice)+'px'});
                        page.animate({'z-index': this.getzIndex(),right:'0px', 
                                      'position':'absolute'},velocity ,function(){

                                        if (opc.endAnimation) eval(opc.endAnimation);

                                      });
                        
                        this.setNavigator(pageName);
                        this.lastEvent = 'in';
                        window.location.href = "#"+pageName;

                    break;
                        
                    case 'in-left':
                        
                        page.stop().css({'left':'-'+(this.wDivice)+'px'});
                        page.animate({'z-index': this.getzIndex(),'top':0,'left':'0px', 
                                       'position':'absolute'},velocity,function(){

                                        if (opc.endAnimation) eval(opc.endAnimation);

                                      }); 
                         
                        this.setNavigator(pageName);
                        this.lastEvent = 'in';
                        window.location.href = "#"+pageName;
                    break;
                        
                    case 'bottom-top':
                        
                        page.stop().css({top: this.hDivice+'px'});
                        page.animate({'z-index': this.getzIndex(),'top':0,'left':'0px', 
                                       'position':'absolute'},velocity,function(){

                                        if (opc.endAnimation) eval(opc.endAnimation);

                                      }); 
                         
                        this.setNavigator(pageName);
                        this.lastEvent = 'in';
                        window.location.href = "#"+pageName;
                    break; 
                    case 'in-bottom':
                         page.stop().css({top: this.hDivice+'px' , left : 0 });
                         page.animate({top:0,left:0 },velocity,function(){

                            if (opc.endAnimation) eval(opc.endAnimation);

                          });   
                    break;    
                        
                    default:
                         
                         page.stop().animate({'top':0,'left':'-'+(this.wDivice + 150)+'px', 
                                       'position':'absolute'},velocity,function(){

                                        if (opc.endAnimation) eval(opc.endAnimation);

                                      });   
                    break;
                        
                } 
                    
                     
                
                   
            
        },
    
        alertConfirm: function(title, msg ){
                    
                    title = (title) ? title : 'Informació';
                    
                    $.alert({
                          title: title, 
                          content: msg,
                          theme: 'light',
                          containerFluid : true
                    });

		}, 
         
        ajax : function (opciones){
             
                
              errorMSGTITLE =  this.language['Error'];
              errorMSG      =  this.language['ErrorAjax'];
            
              $.ajax({ 
						 beforeSend :  opciones.beforeSend,
                		 type   : "POST",
                         crossDomain: true,
                         dataType : 'json',      
						 url    : 'https://app.socialpartners.org/app/app.php',
						 data   : opciones.datos,
						 success: opciones.success,
                         complete: opciones.complete,
                         error: function (jqXHR, exception) {
                            app.alertConfirm( errorMSGTITLE , errorMSG + ' <b>'+jqXHR.statusText+'</b>');
                            if (opciones.errorCallback){ 
                                 opciones.errorCallback()
                            }
                         },
						 cache: false
				})
            
        },
    
        setAvatar : function(data){
            
                if (data.avatar) $('.avatar img').attr('src', data.avatar);
                if (data.Name) $('.nice-name').html(data.Name);
                 
        },
    
        addEquip : function(listEquip){
                
            var  ul = $('#equip-list');
            
            $.each( listEquip , function( key, M ) {
                ul.append('<li>'+M.SNAME+
                          '<a class="category-team" onclick="app.loadPage(\'detailsEquip\',{ opc : \'loadPage\', page : \'detailsEquip\', id : '+M.ID+'})">'+M.Roll+'</a>'+        
                          '</li>')
            });
            
        },
    
    
        loadPage  : function(page , data){
                
                var pageSelect =  $('[data-page="'+page+'"]');
            
                this.ajax({
                            beforeSend : function(){
                                    app.dialogWait('Per favor esperi');
                            },
                            datos : data,
                            success : function(rs){
                                if (rs.htmlContent){
                                    $(pageSelect).find(rs.obj).html(rs.htmlContent);
                                }
                                // app.dialogClose();   
                                app.animatePage(page,'show');
                            }
                })
            
            
        },

        activeCarrucel : function(){
             
        },

        is_movil : function(){
            return true;
            var isMobile = false; 
            if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent.substr(0,4))) { 
            isMobile = true;
            } 
             return isMobile;
        }
        
    
        
    
    
}



