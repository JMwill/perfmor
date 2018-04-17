const RESOURCE_NODE_NAME = ['img', 'link', 'script']
const _slice = Array.prototype.slice

function filterResourceNodes(mutation) {
  let nodes = [].concat(
    _slice.call(mutation.addedNodes, 0),
    mutation.type === 'attributes' ? mutation.target : []
  )
  return nodes.filter(node => RESOURCE_NODE_NAME.indexOf(node.nodeName.toLowerCase()) > -1)
}

function getEventNodeResourceName(event) {
  let target = event.target || event.srcElement
  let resourceName = target.src || target.href
  return resourceName
}

function extractResourceName(mutation) {
  if (mutation.type === 'attributes') {
    return [mutation.target.src || mutation.target.href]
  } else if (mutation.type === 'childList') {
    let nodes = _slice.call(mutation.addedNodes, 0)
    return (
      nodes
        .filter(node => RESOURCE_NODE_NAME.indexOf(node.nodeName.toLowerCase()) > -1)
        .map(node => node.src || node.href)
    )
  }
}

export default {
  filterResourceNodes,
  extractResourceName,
  getEventNodeResourceName,
}
