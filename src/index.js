import utils from './utils'

const perf = window.performance || window.webkitPerformance || window.msPerformance || window.mozPerformance
const doc = document
const documentElement = doc.documentElement

function getNetTimes(timer = perf.timing) {
  let t = timer
  let isEntry = !!t.entryType
  let net = {}

  // Redirect time
  net.redirect = t.redirectEnd - t.redirectStart
  // DNS time
  net.dns = t.domainLookupEnd - t.domainLookupStart
  // Tcp handshake time
  net.tcp = t.connectEnd - t.connectStart
  // Response time
  net.response = t.responseEnd - t.responseStart
  // Secure connection time
  net.ssl = t.secureConnectionStart ? t.connectEnd - t.secureConnectionStart : 0
  // Time to first byte
  net.ttfb = isEntry ? t.responseStart - t.startTime : t.responseStart - t.navigationStart
  // Resource load time
  net.loadtime = isEntry ? t.duration : t.loadEventStart - t.navigationStart
  // Request time
  net.request = t.responseStart - t.requestStart
  // Time spent during the request start until response end
  net.reqUntilRes = net.request + net.response

  return net
}

function _getFirstPaint() {
  let firstPaint = 0
  let timing = perf.timing

  if (window.PerformancePaintTiming) {
    let paint = perf.getEntriesByType('paint')
    if (!paint.length) firstPaint = 0
    else paint = paint[0]
    firstPaint = paint.startTime + perf.timeOrigin
  } // eslint-disable-line
  // Chrome
  else if (window.chrome && window.chrome.loadTimes) {
    firstPaint = (window.chrome.loadTimes().firstPaintTime * 1000) - timing.navigationStart
  } // eslint-disable-line
  // IE
  else if (typeof timing.msFirstPaint === 'number') {
    firstPaint = timing.msFirstPaint - timing.navigationStart
  }

  return firstPaint
}

function getAppTimes() {
  let t = perf.timing
  let app = {}

  app.timing = t

  app.firstPaint = _getFirstPaint()

  // Total time from start to load
  app.loadTime = t.loadEventEnd - t.fetchStart
  // Time spent constructing the DOM tree
  app.domReadyTime = t.domComplete - t.domInteractive
  // Time consumed preparing the new page
  app.readyStart = t.fetchStart - t.navigationStart
  // AppCache
  app.appcacheTime = t.domainLookupStart - t.fetchStart
  // Time spent unloading documents
  app.unloadEventTime = t.unloadEventEnd - t.unloadEventStart
  // Request to completion of the DOM loading
  app.initDomTreeTime = t.domInteractive - t.responseEnd
  // Load event time
  app.loadEventTime = t.loadEventEnd - t.loadEventStart

  return app
}

function monitorResource(cb) {
  let resourceMutationConfig = {
    childList: true,
    attributes: true,
    subtree: true,
  }

  function resourceMutationCallback(mutationList) {
    let resourceNodes =
      mutationList.reduce((nodeList, currentMutation) => {
        return nodeList.concat(utils.filterResourceNodes(currentMutation))
      }, [])

    resourceNodes.forEach(node => {
      node.addEventListener('load', function resourceLoad(evt) {
        let performanceItems = perf.getEntriesByName(utils.getEventNodeResourceName(evt))
        let netTimes = performanceItems.map(item => getNetTimes(item))
        if (typeof cb === 'function') { cb(netTimes) }
        node.removeEventListener('load', resourceLoad)
      })
    })
  }

  const resourceObserver = new MutationObserver(resourceMutationCallback)
  resourceObserver.observe(documentElement, resourceMutationConfig)

  return resourceObserver
}

function measure() {
  if (perf === undefined) { return {} }
  return {
    getAppTimes,
    getNetTimes,
    monitorResource,
  }
}

export default measure()
