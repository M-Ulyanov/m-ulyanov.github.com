
// READY
$(document).ready(function () {


  // START
  var game = new RouletteGame({
    insert: $('.js-game-container '),
    wrapperClass: 'roulette-players game-background',
    duration: 13,
    callback: function (winner) {
      renderHTMLFragment([winner], $('.js-winner'), 'winner');
      $('.js-game-start').text('again').addClass('js-game-again');
    }
  });

  game.push(calcProcentBeforePush({
    name: 'Michael',
    bet: 40,
    html: '<div class="player-item table"><div class="player-text table-cell">Michael</div></div>'
  }));
  game.push(calcProcentBeforePush({
    name: 'Thomas',
    bet: 90,
    html: '<div class="player-item table"><div class="player-text table-cell">Thomas</div></div>'
  }));

  renderHTMLFragment(game.getStorage(), $('.js-active-players'));
  bankUpdate();



  // EVENTS
  var $addForm = $('.js-form-add');

  $('.js-game-start').on('click', function() {
    if($(this).hasClass('disabled') || $(this).hasClass('js-game-again')) {
      return;
    }
    game.start();
  });


  $(document).on('click', '.js-game-again', function() {
    game.clearStorage().clearBank();
    bankUpdate();

    $('.js-active-players').empty();
    $('.js-winner').empty();
    $('.roulette-wrapper').remove();
    UI.show($('.js-empty'));
    UI.show($('.js-game-waiting'));
    UI.show($('.js-buttons'));

    $(this).removeClass('js-game-again').text('Start');
    UI.hide($(this));

  });

  $('.js-add-item').on('click', function() {
    if($(this).hasClass('disabled')) {
      return false;
    }
    UI.addDisabledToButton();
    UI.showForm($addForm);
  });

  $('.js-game-ready').on('click', function() {
    if($(this).hasClass('disabled')) {
      return false;
    }
    UI.hide($('.js-buttons'));
    UI.scrollTop();
    game.render();
    UI.show($('.js-game-start'));
    UI.hide($('.js-game-waiting'), 0);
  });

  $('.js-form-close').on('click', function() {
    UI.hideForm($addForm, function() {
      UI.removeDisabledToButton();
    });
  });


  $addForm.on('submit', function(event) {

    event.preventDefault();

    var $inputs = $(this).find('input');
    var values = {};
    $inputs.each(function() {
      values[this.name] = $(this).val();
    });
    $inputs.val('');

    game.push(calcProcentBeforePush({
      name: values.name,
      bet: values.bet,
      html: '<div class="player-item table"><div class="player-text table-cell">'+values.name+'</div></div>'
    }));

    renderHTMLFragment(game.getStorage(), $('.js-active-players'));
    bankUpdate();

    UI.hideForm($addForm, function() {
      UI.removeDisabledToButton();
    });

  });



  // FUNCTIONS

  /**
   *
   * @param object
   */
  function calcProcentBeforePush(object) {

    var storage = $.extend(true, [], game.getStorage());
    storage.push(object);
    var sum = 0;
    storage.forEach(function (current) {
      var bet = parseInt(current.bet);
      if(!isNaN(bet)) {
        sum += bet;
      }
    });

    storage.forEach(function (current) {
      if(current.bet > 0) {
        current['procent'] = (100 / sum * current.bet).toFixed(2);
      }
    });

    game.clearStorage().clearBank();

    return storage;

  }


  /**
   *
   * @param array
   * @param insert
   * @param winner
   */
  function renderHTMLFragment(array, insert, winner) {

    var $item;
    insert.empty();
    var winnerFragment = '<div class="game-item__bet">Prize: ' + game.getBank() + '</div>';
    array.forEach(function(current) {
      $item = $('<div class="hidden game-item"></div>');
      var fragment = winner ? winnerFragment :  '<div class="game-item__bet">Bet: ' + current.bet + '</div>';
      $item.append(
      '<div class="game-item__content table">' +
      '<div class="game-item__text table-cell">' + current.name + '</div>' +
      '</div>' +
      fragment +
      '<div class="game-item__chance">Chance: ' + current.procent +'%'+ '</div>'
      );
      insert.append($item);
      UI.show($item);
    });

    var $emptyElement = insert.prev('.js-empty');
    if($emptyElement.length > 0) {
      UI.hide($emptyElement, 0);
    }

  }


  /**
   *
   */
  function bankUpdate() {
    $('.js-total-bank').text(game.getBank());
  }


});
