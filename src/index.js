'use strict';

const util = require('./util.js');

// the main landmark
let mainEl;

// the element that will be trapped
let trappedEl;

// collection of elements that get 'dirtied' with aria-hidden attr
let dirtyObjects;

function prepareAttribute(el, dirtyValue) {
  return {
    el,
    cleanValue: el.getAttribute('aria-hidden'),
    dirtyValue
  };
}

function dirtyAttribute(preparedObj) {
  preparedObj.el.setAttribute('aria-hidden', preparedObj.dirtyValue);
}

function cleanAttribute(preparedObj) {
  if (preparedObj.cleanValue) {
    preparedObj.el.setAttribute('aria-hidden', preparedObj.cleanValue);
  } else {
    preparedObj.el.removeAttribute('aria-hidden');
  }
}

function trap(el) {
  // ensure current trap is deactivated
  untrap();

  // update the trapped el reference
  trappedEl = el;

  // update the main landmark reference
  mainEl = document.querySelector('main, [role="main"]');

  // we must remove the main landmark to avoid issues on voiceover iOS
  if (mainEl) {
    mainEl.setAttribute('role', 'presentation');
  }

  // cache all ancestors, siblings & siblings of ancestors for trappedEl
  const ancestors = util.getAncestors(trappedEl);
  const siblings = util.getSiblings(trappedEl);
  const siblingsOfAncestors = util.getSiblingsOfAncestors(trappedEl);

  // prepare elements
  dirtyObjects = [prepareAttribute(trappedEl, 'false')]
                .concat(ancestors.map(item => prepareAttribute(item, 'false')))
                .concat(siblings.map(item => prepareAttribute(item, 'true')))
                .concat(siblingsOfAncestors.map(item => prepareAttribute(item, 'true')));

  // update DOM
  dirtyObjects.forEach(item => dirtyAttribute(item));

  // let observers know the screenreader is now trapped
  const event = document.createEvent('Event');
  event.initEvent('screenreaderTrap', false, true);
  trappedEl.dispatchEvent(event);
}

function untrap() {
  if (trappedEl) {
    // restore 'dirtied' elements to their original state
    dirtyObjects.forEach(item => cleanAttribute(item));

    dirtyObjects = [];

    // 're-enable' the main landmark
    if (mainEl) {
      mainEl.setAttribute('role', 'main');
    }

    // let observers know the screenreader is now untrapped
    const event = document.createEvent('Event');
    event.initEvent('screenreaderUntrap', false, true);
    trappedEl.dispatchEvent(event);

    trappedEl = null;
  }
}

module.exports = {
  trap,
  untrap
};
