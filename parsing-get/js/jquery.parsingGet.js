/*

 ParsingGet — jQuery plugin
 Version: 0.2.0
 Author: M.Ulyanov (web.ulyanov@gmail.com)
 Site: http://web-ulyanov.ru
 Source && Doc: https://github.com/M-Ulyanov/ParsingGet
 Example: #

 */

(function($) {

	// Параметры по умолчанию
	var defaults = { 
		ignoreClass: 'no_parsing_get',
		show: true
	};

	// Переменные плагина
	var options;
	var objParams = {};
	var markCheck = false;

	// С какими элементами будем работать
	var arrInput = [
		'input[type="text"]', 
		'input[type="color"]',
		'input[type="date"]',
		'input[type="hidden"]',
		'input[type="datetime"]',
		'input[type="datetime-local"]',
		'input[type="email"]',
		'input[type="number"]',
		'input[type="range"]',
		'input[type="search"]',
		'input[type="tel"]',
		'input[type="time"]',
		'input[type="url"]',
		'input[type="month"]',
		'input[type="week"]'
	];
	var radio_checkbox = [
		'input[type="radio"]',
		'input[type="checkbox"]'
	];
	var textarea = 'textarea';
	var select = 'select';

 
	// Методы
	var methods = {

		// Инициализация
	  init: function(params) {
      options = $.extend({}, defaults, params);
     		methods.parsing(this);
	  },

	  // Разбор GET параметров в обьект
	  parsing: function(self) {

			var url = window.location.href;
			var hash = url.slice(url.indexOf('?') + 1).split('&');

			if(!hash.length)
				return false;

			for(var i = 0; i < hash.length; i++) {
				var iHash = hash[i].split('=');
				var key = decodeURIComponent(iHash[0]);
				var value = iHash[1];
				if(value)
					value = decodeURIComponent(iHash[1].replace(/\+/g, ' '));

				if(key in objParams) { 
	        if(typeof objParams[key] == 'string') {
	        	objParams[key] = [objParams[key]];
	        }
	      	objParams[key].push(value);
	      } 
	      else {
	        objParams[key] = value;
	      }

			}; // end for
	    
	    methods.show(self, objParams);

	  },

   	// Присваивание значений
   	show: function(self) {

   		if(!self) {
   			self = this;
   			markCheck = true;
   		}
   		var obj = objParams;

			return self.each(function() {

				// Input
				for(var i = 0; i < arrInput.length; i++) {
					$(this).find(arrInput[i]).each( function() {
							if(!markCheck) {
								if(methods.ignore(this) == false)
									return; 
							}

		          var name = $(this).attr('name');
		          var value = obj[name];
		          if(!!value) {
		            $(this).val(value);
		          }
		      });
				};

				// Textarea
				$(textarea).each(function() {
					if(!markCheck) {
						if(methods.ignore(this) == false)
							return; 
					}

					var name = $(this).attr('name');
	        var value  = obj[name];
	        if(!!value) {
	          $(this).text(value);
		      }
				});

				// Radio, Checkbox
				for(var i = 0; i < arrInput.length; i++) {
					$(this).find(radio_checkbox[i]).each( function() {
					if(!markCheck) {
						if(methods.ignore(this) == false)
							return; 
					}

					var name = $(this).attr('name');
	        var value  = obj[name];
	        var thisval = $(this).val();
	        if(value == thisval || $.inArray(thisval, value) != -1) {
	        		$(this).attr('checked', 'checked');
	      		          }
		      });
				};

				// Select
				$(select).each(function() {
					if(!markCheck) {
						if(methods.ignore(this) == false)
							return; 
					}

					var name = $(this).attr('name');
					$(this).find('option').each(function() {
						var value  = obj[name];
	        	var thisval = $(this).val();
		        if(value == thisval || $.inArray(thisval, value) != -1) {
		        		$(this).attr('selected', 'selected');
		        }
					});
				});

			}); // end each
   	},

   	// Проверка на исключение с помощью метода isClass
   	ignore: function(self) {
   		var elem = methods.isClass(self);
   		if(elem == false)
   			return false
   		var form = methods.isClass($(self).parents('form'))
   		if(form == false)
   			return false

   		return true;
   	},

   	// Чекает на "исключение" по классу
	  isClass: function(self) {
   		if($(self).hasClass(options.ignoreClass)) {
   			return false;
   		}
   	}

	}; // end Methods
 
	$.fn.parsingGet = function(method) {
	 
	  // Проверка на вызываемый метод
	  if(methods[method]) {
	      return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
	  } 
	  else if(typeof method === 'object' || !method) {
	      return methods.init.apply(this, arguments);
	  } 
	  else {
	  	console.log('Вызванный метод ' + method + ' не найден!');
	  }

	};

})(jQuery);