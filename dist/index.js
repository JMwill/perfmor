'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _utils = require('./utils');

var _utils2 = _interopRequireDefault(_utils);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var perf = window.performance || window.webkitPerformance || window.msPerformance || window.mozPerformance;
var doc = document;
var documentElement = doc.documentElement;

function getNetTimes() {
  var timer = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : perf.timing;

  var t = timer;
  var isEntry = !!t.entryType;
  var net = {};

  // Redirect time
  net.redirect = t.redirectEnd - t.redirectStart;
  // DNS time
  net.dns = t.domainLookupEnd = t.domainLookupStart;
  // Tcp handshake time
  net.tcp = t.connectEnd - t.connectStart;
  // Response time
  net.response = t.responseEnd - t.responseStart;
  // Secure connection time
  net.ssl = t.secureConnectionStart ? t.connectEnd - t.secureConnectionStart : 0;
  // Time to first byte
  net.ttfb = isEntry ? t.responseStart - t.startTime : t.responseStart - t.navigationStart;
  // Resource load time
  net.loadtime = isEntry ? t.loadEventStart - t.navigationStart : t.duration;
  // Request time
  net.request = t.responseStart - t.requestStart;
  // Time spent during the request start until response end
  net.reqUntilRep = net.request + net.response;

  return net;
}

function _getFirstPaint() {
  var firstPaint = 0;
  var timing = perf.timing;

  if (window.PerformancePaintTiming) {
    var paint = perf.getEntriesByType('paint')[0];
    firstPaint = paint.startTime + perf.timeOrigin;
  } // eslint-disable-line
  // Chrome
  else if (window.chrome && window.chrome.loadTimes) {
      firstPaint = window.chrome.loadTimes().firstPaintTime * 1000 - timing.navigationStart;
    } // eslint-disable-line
    // IE
    else if (typeof timing.msFirstPaint === 'number') {
        firstPaint = timing.msFirstPaint - timing.navigationStart;
      }

  return firstPaint;
}

function getAppTimes() {
  var t = perf.timing;
  var app = {};

  app.timing = t;

  app.firstPaint = _getFirstPaint();

  // Total time from start to load
  app.loadTime = t.loadEventEnd - t.fetchStart;
  // Time spent constructing the DOM tree
  app.domReadyTime = t.domComplete - t.domInteractive;
  // Time consumed preparing the new page
  app.readyStart = t.fetchStart - t.navigationStart;
  // AppCache
  app.appcacheTime = t.domainLookupStart - t.fetchStart;
  // Time spent unloading documents
  app.unloadEventTime = t.unloadEventEnd - t.unloadEventStart;
  // Request to completion of the DOM loading
  app.initDomTreeTime = t.domInteractive - t.responseEnd;
  // Load event time
  app.loadEventTime = t.loadEventEnd - t.loadEventStart;

  return app;
}

function monitorResource(cb, opt) {
  var o = Object.assign({
    resourceFilter: null
  }, opt);

  var resourceMutationConfig = {
    childList: true,
    attributes: true,
    subtree: true
  };

  function resourceMutationCallback(mutationList) {
    var resourceMutationList = _utils2.default.filterResourceMutation(mutationList, o.resourceFilter);
    var resourceNames = resourceMutationList.map(_utils2.default.extractResourceName);
    var resourceNetTimes = resourceNames.map(function (name) {
      return getNetTimes(perf.getEntriesByName(name));
    });

    if (typeof cb === 'function') {
      cb(resourceNetTimes);
    }
  }

  var resourceObserver = new MutationObserver(resourceMutationCallback);
  resourceObserver.observe(documentElement, resourceMutationConfig);

  return resourceObserver;
}

function measure() {
  if (perf === undefined) {
    return {};
  }
  return {
    getAppTimes: getAppTimes,
    getNetTimes: getNetTimes,
    monitorResource: monitorResource
  };
}

exports.default = measure();