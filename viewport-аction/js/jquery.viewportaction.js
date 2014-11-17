/*
 
*/

(function($){
    $.fn.viewportaction = function(options) {

        // Опции по умолчанию
        var options = $.extend({}, {
            effect: false,
            offsetTop: 100,
            repeat: true,
            customClass: false,
            oneRowViewport: false,
            viewportNav: true,
            scrollSpeed: 400
        }, options);

        // Запомним this и высоту страницу
        var elem = this,
            body = $('body'),
            windowHeight =  $(window).height();

        this.unitElem = function() {
      
  			// Значения отступов
  			var scrollTop = $(body).scrollTop(),
				scrollBottom = (scrollTop + windowHeight);
			
            
            $(elem).each(function() {
                var obj = $(this),
                    objOpt = {};
                $.extend(objOpt, options);

                // Добавим кастомный класс
                $(obj).addClass(objOpt.customClass);

                // Если класс уже существует -  выход
                if($(obj).hasClass(objOpt.effect) && !objOpt.repeat) {
                    return;
                }

                // Позиция элемента + смещение
                var elemTop =  Math.round($(obj).offset().top) + objOpt.offsetTop,
                    elemBottom = elemTop + ($(obj).height());

                // Применить эффект
                if((elemTop < scrollBottom) && (elemBottom > scrollTop)) {
                    $(obj).addClass(objOpt.effect);
                    
                }
                
                // Удалить эффект, если параметр repeat == true 
                else if($(obj).hasClass(objOpt.effect) && (objOpt.repeat)) {
                    $(obj).removeClass(objOpt.effect);
                }

                // Блоки на высоту экрана
                if(objOpt.oneRowViewport) {
                    $(this).height(windowHeight);
                    var dataNav = $(this).attr('data-nav-viewport');

                    // Навигация по слоям
                    if(dataNav && options.viewportNav) {

                        if(!$('.nav-viewport')[0]) {
                            var dataNavArr = $(body).find('*[data-nav-viewport="true"]');
                            var dataNavArrLen = dataNavArr.length;
                            var DataNav = $('<nav class="nav-viewport"></nav>');


                            for(var i = 0; i < dataNavArrLen; i++) {
                                var titleNav  = $(dataNavArr[i]).attr('data-nav-viewport-title');
                                $(DataNav).append('<a class="data-nav-a" data-nav-elem-id=' + '"' + i + '"' +  'href="#">' + titleNav + '</a>');
                            }

                            $(body).append(DataNav);
                        }
                    }
                }
            });
        
        };

        // функция определения в какую сторону был скролл
        var onMouseWheel = function(event) {
            console.log('1');
            event = event.originalEvent;
            var delta = event.wheelDelta > 0 || event.detail < 0 ? 1 : -1;
            var top = $(this).scrollTop();

            if(options.oneRowViewport) {
                startScroll(delta, top);
                return false;  
            }       
        };

        // Функция исполнения скроллинга
        function startScroll(where, top) {
            if(where > 0) {
                 $(body).stop().animate({
                    scrollTop: top - windowHeight
                }, options.scrollSpeed);
            }
            else {
                 $(body).stop().animate({
                    scrollTop: top + windowHeight
                }, options.scrollSpeed);
            }
        };

        // Функция навигации по блокам
        var navScroll = function(event) {
            event.preventDefault();

            var elemId = $(this).attr('data-nav-elem-id')
            $(body).stop().animate({
                    scrollTop: elemId * windowHeight
                }, options.scrollSpeed);
            
            return false;
        }

        /***
            Обработка событий
        ***/

        // Запуск метода unitElem при загрузке, скролле или таче страницы
        $(window).on('load scroll touchmove', this.unitElem);
  
        // Перерасчет высоты по ресайзу окна
        $(window).resize(function() {
            windowHeight = $(window).height();
        });

        // Запуск функции при движении колеса мыши
        $(body).on('mousewheel DOMMouseScroll', onMouseWheel);

        $(document).on('click','.data-nav-a', navScroll);
        
        this.unitElem();
        
       return this;
    };

})(jQuery);


