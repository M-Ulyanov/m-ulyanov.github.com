/**
 * UI methods example
 * @type {{show: Function, hide: Function, showForm: Function, hideForm: Function, addDisabledToButton: Function, removeDisabledToButton: Function, scrollTop: Function}}
 */
var UI = {

  show: function(element, duration) {
    duration = duration != null ? duration : 200;
    element.show(0).animate({
      opacity: 1
    }, duration);
  },

  hide: function(element, duration) {
    duration = duration != null ? duration : 200;
    element.animate({
      opacity: 0
    }, duration, function() {
      $(this).hide(0);
    });
  },

  showForm: function(form) {
    this.scrollTop();
    form.animate({
      top: 0,
    }, 400)
  },

  hideForm: function(form, callback) {
    form.animate({
      top: -300,
    }, 400, function() {
      if(typeof callback === 'function') {
        callback();
      }
    })
  },

  addDisabledToButton: function() {
    $('.js-action-button').addClass('disabled');
  },

  removeDisabledToButton: function() {
    $('.js-action-button').removeClass('disabled');
  },

  scrollTop: function() {
    $('html,body').animate({ scrollTop: 0 }, 200);
  }

};



