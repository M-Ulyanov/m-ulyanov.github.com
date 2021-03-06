// Class TreeDataView 1.0
// Author: M.Ulyanov
// Created: 30/01/2016
// Example: - http://m-ulyanov.github.io/treedataview/


;(function () {

  'use strict';

  /**
   * TreeDataView constructor
   * @param options - user option object format
   * @param nodes - tree data json, array or object format
   * @constructor
   */
  window.TreeDataView = function(options, nodes) {

    // options
    var defaultOptions = {
      openLevel: 1,
      append: null,
      template: null,
      count: false,
      countCallback: null,
      wrapperCss: '',
      theme: 'default',
      slidingDuration: 200,
      iconClasses: {
        open: 'fa-plus-square-o',
        close: 'fa-minus-square-o'
      }
    };

    if (options) {
      this.options = $.extend(true, defaultOptions, options);
    }

    // private fields
    this._level = 1;
    this._nodeId = 0;
    this._structureDOM = null;
    this._structureObject = {};
    this._defaultSelectedElement = null;
    this._eventsName = {
      'opening': 'opening',
      'opened': 'opened',
      'closesing': 'closesing',
      'closest': 'closest',
      'selected': 'selected',
      'unselected': 'unselected'
    };

    var nodesFormatted = this._nodesParse(nodes);
    if (nodesFormatted) {
      this._structureDOM = this._buildTree(nodesFormatted);

      if (this.options.count) {
        this._writeCount(this._structureDOM);
      }

    }

  };


  /**
   * Main builder tree
   * @param data
   * @returns {*|void|jQuery}
   * @private
   */
  TreeDataView.prototype._buildTree = function (data) {

    var self = this;
    var containerRootClasses = (this._level === 1) ? ' tree-view-container-root ' + this.options.wrapperCss : '';
    var isOpen = this.options.openLevel === 'all' || (this.options.openLevel >= this._level) ? ' state-open' : '';
    var isLastOpen = this.options.openLevel === this._level ? true : false;
    var theme = (this._level === 1) ? ' tree-view-theme-' + this.options.theme : '';
    var containerClasses = 'tree-view-container tree-view-level-' + this._level + containerRootClasses + theme + isOpen;

    var tree = $('<ul class="' + containerClasses + '">').append(data.map(function (currentNode) {

      var node = self._buildNode(currentNode);

      // have children
      if (currentNode.nodes) {
        self._structureObject['' + self._level] = currentNode;
        self._level++;
        var iconState = !isOpen || isLastOpen ? self.options.iconClasses.open + ' open' : self.options.iconClasses.close + ' close';
        node.append(self._buildTree(currentNode.nodes)).addClass('tree-view-parent');
        var $element = node.children('.tree-view-element');
        $element.prepend('<span class="tree-view-action"><i class="fa ' + iconState + '"></i></span>');

        if (self.options.count) {
          $element.addClass('have-count').append('<span class="count"></span>');
        }

      }

      return node;

    }));

    self._level--;

    return tree;

  };


  /**
   * Build separate node
   * @param currentNode
   * @returns {*|jQuery|HTMLElement}
   * @private
   */
  TreeDataView.prototype._buildNode = function (currentNode) {


    var $li = $('<li class="tree-view-node" data-node-id="' + this._nodeId++ + '">');
    var $element = $('<div class="tree-view-element">');

    if (currentNode['_node-disabled'] === true) {
      $element.addClass('state-disabled');
    }
    else if (currentNode['_node-selected'] === true) {
      $element.addClass('state-selected');
      this._defaultSelectedElement = $element;
    }

    // user template or default HTML
    var template = this._templateParse(this.options.template, currentNode) ||
        '<span class="tree-view-title">' + currentNode.title + '</span>';

    $element.append(template);
    $li.append($element);

    return $li;

  };


  /**
   * One format code
   * @param nodes
   * @returns {*}
   * @private
   */
  TreeDataView.prototype._nodesParse = function (nodes) {

    try {
      if (typeof(nodes) === 'string') {
        nodes = JSON.parse(nodes);
      }
      if (typeof (nodes) === 'object' && !Array.isArray(nodes)) {
        nodes = [nodes];
      }
    }
    catch (error) {
      this._reportError('_nodesParse error! Name: ' + error.name + ' Message: ' + error.message);
      nodes = false;
    }

    return nodes;

  };


  /**
   * User template parse and replace data
   * @param template
   * @param currentNode
   * @returns {XML|string|void}
   * @private
   */
  TreeDataView.prototype._templateParse = function (template, currentNode) {

    if (!template) {
      return;
    }

    var pattern = /{{[^{{]+}}/gi;

    return template.replace(pattern, function (foundString) {

      // remove {{ }} and spaces
      foundString = foundString.replace(/\s+/g, '');
      var property = foundString.split('').filter(function (current, index, array) {
        if (index > 1 && array.length - 2 > index) {
          return true;
        }
      }).join('');

      var arrayProperty = [];
      var copyPropertyNode = $.extend(true, [], currentNode);
      var currentProperty;
      if (property.indexOf('.') >= 0) {
        arrayProperty = property.split('.');
        for (var i = 0; i < arrayProperty.length; i++) {
          currentProperty = arrayProperty[i];
          if (currentProperty in copyPropertyNode) { //
            copyPropertyNode = copyPropertyNode[currentProperty];
            if (i === arrayProperty.length - 1) {
              return copyPropertyNode;
            }
          }
          else {
            return '';
          }
        }
      }
      else if (property in currentNode) {
        return currentNode[property];
      }
      else {
        return '';
      }

    });
  };


  /**
   * Set DOM events
   * @private
   */
  TreeDataView.prototype._setDOMEvents = function () {

    var self = this;

    // Set tree-view-element
    var $elements = self._structureDOM.find('.tree-view-element');
    $elements.each(function () {
      var $current = $(this);

      if (!setDataEvent($current)) {
        return;
      }

      $current.on('click', function (event) {
        var $target = $(event.target);
        if ($target.hasClass('tree-view-action') ||
            $target.closest('.tree-view-action').length ||
            $(this).hasClass('state-disabled')) {
          return;
        }

        var $clickedElement = $(this);
        $elements.not(this).removeClass('state-selected');
        $clickedElement.toggleClass('state-selected');

        if ($clickedElement.hasClass('state-selected')) {
          self._callEvent($clickedElement, self._eventsName.selected);
        }
        else {
          self._callEvent($clickedElement, self._eventsName.unselected);
        }

      });

    });


    // Set tree-view-action
    this._structureDOM.find('.tree-view-action').each(function () {
      var $current = $(this);

      if (!setDataEvent($current)) {
        return;
      }

      var $container = $current.closest('.tree-view-parent').children('.tree-view-container');
      $current.on('click', function () {

        var $clickedElement = $(this);

        if ($clickedElement.parent('.tree-view-element').hasClass('state-disabled')) {
          return;
        }

        var $fa = $clickedElement.find('.fa');
        $fa.toggleClass(self.options.iconClasses.close).toggleClass(self.options.iconClasses.open);
        $fa.toggleClass('close open');
        var isVisible = $container.is(':visible');
        if (isVisible) {
          self._callEvent($clickedElement, self._eventsName.closesing, {container: $container});
        }
        else {
          self._callEvent($clickedElement, self._eventsName.opening, {container: $container});
        }

        $container.slideToggle(self.options.slidingDuration, function () {
          if (isVisible) {
            self._callEvent($clickedElement, self._eventsName.closest, {container: $container});
          }
          else {
            self._callEvent($clickedElement, self._eventsName.opened, {container: $container});
          }
        });

        var $circle = $('<span class="tree-view-circle"></span>');
        $clickedElement.append($circle);

        // start circle effect
        setTimeout(function () {
          $circle.css({
            "-webkit-transform": "scale(1)",
            "-moz-transform": "scale(1)",
            "-ms-transform": "scale(1)",
            transform: "scale(1)"
          }).stop().animate({
            opacity: 0
          }, function () {
            //$circle.remove();
          });
        }, 30);

      });

    });


    /**
     *
     * @param element
     * @returns {boolean}
     */
    function setDataEvent(element) {
      if (element.attr('data-init-event')) {
        return false;
      }
      else {
        element.attr('data-init-event', true);
        return true;
      }
    }

  };


  /**
   * Calculate and show count
   * @param container
   * @private
   */
  TreeDataView.prototype._writeCount = function (container) {

    var containerChild = container.find('.tree-view-container').eq(0);
    if (containerChild.length > 0) {
      var elements = containerChild.find('.tree-view-element');
      var length = elements.length;
      var callback = this.options.countCallback;
      var count = callback ? callback(length) : length;
      container.find('.tree-view-parent').eq(0).find('.count').text(count);
      this._writeCount(containerChild);
    }

  };


  /**
   * Set state selected node
   * @private
   */
  TreeDataView.prototype._defaultSelectedDOM = function () {

    var $containers = this._defaultSelectedElement.parents('.tree-view-container');
    $containers.addClass('state-open');
    var self = this;
    $containers.each(function (index) {
      if (index === 0) {
        return;
      }
      $(this).find('.tree-view-parent').eq(0).children('.tree-view-element').find('.fa')
          .attr('class', 'fa ' + self.options.iconClasses.close);
    });

  };


  /**
   * Call trigger events
   * @param current
   * @param event
   * @param data
   * @private
   */
  TreeDataView.prototype._callEvent = function (current, event, data) {
    current.trigger(event, data);
  };


  /**
   * Report class error
   * @param message
   * @private
   */
  TreeDataView.prototype._reportError = function (message) {
    console.error(message);
  };


  /**
   * Render html tree
   * @returns {TreeDataView}
   */
  TreeDataView.prototype.render = function () {

    if (this._structureDOM != null) {
      $(this.options.append).append(this._structureDOM);
      if (this._defaultSelectedElement != null && this._defaultSelectedElement.length > 0) {
        this._defaultSelectedDOM();
      }

      this._setDOMEvents();
    }

    return this;

  };


  /**
   * Get data in various formats
   * @param level
   * @param format
   * @returns {*}
   */
  TreeDataView.prototype.getNodes = function (level, format) {

    if (!level) {
      this._reportError('getNodes: expected positive number');
      return false;
    }

    format = format || 'object';
    if (format === 'object') {
      return this._structureObject[level];
    }
    else if (format === 'html') {
      return this._structureDOM.find('.tree-view-level-' + level);
    }
    else if (format === 'json') {
      return JSON.stringify(this._structureObject[level]);
    }
    else {
      this._reportError('getNodes: format ' + format + ' not supported!');
    }

  };


})();

