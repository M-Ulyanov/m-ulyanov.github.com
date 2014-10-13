(function($) {
	jQuery.fn.lprogress = function(options){

		// Параметры по умолчанию
		var defaults = $.extend({}, {
		loadReady : false,
		startValue: 0,
		maxValue: 100,
		animateSpeed : 1200,
		decimals: 0,
		width: 300,
		color: '64B82D',
		}, options);
				
		return this.each(function() {
		
			// Переменные	
			var progress = $(this),
				line = $('<div class="inner-progress">'),
				buttonstep = $('.progressbar-step'),
				numberPercent = $('<span class="number-percent">');
				
			// Вставка элементов в Dom
			$(progress).addClass('progressbar').append(line);
			$(line).append(numberPercent);

			// Установки ширины и цвета
			var firstLetter = defaults.color.charAt(0);
			if(firstLetter != '#')
				defaults.color = '#' + defaults.color;

			$(this).css({
				width: defaults.width,
			})
				.find(line).css({
					background: defaults.color
				})

			// Функция анимации чисел
			function numberAnimate(param){			
				$(line).find(numberPercent).animate({ 
					num: param,
				}, 
				{ duration: defaults.animateSpeed,
					    step: function (num){
					        this.innerHTML = (num).toFixed(defaults.decimals) + '%'
	    			}
				});
			};

			// Функция автозагрузки
			if(defaults.loadReady){
				$(line).animate({
					width: '100%'
				}, defaults.animateSpeed, function(){
					if($(this).width() == defaults.width){
						/*
							$(this).parent('div').animate({
								'padding': '0px',
							}, 100).animate({
								'padding': '0px',
							}, 100)
						*/
					}
				});

				numberAnimate(defaults.maxValue);
			};

			// Установка начального значения
			if(defaults.startValue != 0){
				$(line).animate({
					width : defaults.startValue + '%'
				}, defaults.animateSpeed);

				numberAnimate(defaults.startValue);
			};
			
			// При клике на элементы управления
			$('.progressbar-step').on('click', function(event){
					var dataStep = parseInt($(this).attr('data-step')),
						dataInit = $(this).attr('data-init'),
						elem = $('#' + dataInit).find('.inner-progress');
						thisWidth = $(elem).width(),
						allWidth = $(elem).parent('.progressbar').width();

					var globalStep = thisWidth / allWidth * 100;
					globalStep += dataStep;

					if(globalStep > defaults.maxValue)
						globalStep = defaults.maxValue;

					if(dataStep == 0)
						globalStep = 0;
					
					// Анимация полоски и чисел	
					$(elem).stop().animate({
						width: globalStep + '%',
					}, defaults.animateSpeed);

					$(elem).find(numberPercent).stop().animate({ 
						num: globalStep
					}, 
					{ duration: defaults.animateSpeed,
						   	step: function (num){
						        this.innerHTML = (num).toFixed(defaults.decimals) + '%';
		    			}
					});
			});
			
		});
	}
})(jQuery);




