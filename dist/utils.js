'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isResrouceMutation = isResrouceMutation;
exports.filterResourceMutation = filterResourceMutation;
exports.extractResourceName = extractResourceName;
var RESOURCE_NODE_NAME = ['img', 'link', 'script'];

function isResrouceMutation(mutation) {
  var nodes = [].concat(mutation.addedNodes, mutation.type === 'attributes' ? mutation.target : []);

  return nodes.filter(function (node) {
    return RESOURCE_NODE_NAME.indexOf(node.nodeName.toLowerCase()) > -1;
  });
}

function filterResourceMutation(mutationList, filter) {
  var f = typeof filter === 'function' ? filter : isResrouceMutation;
  return mutationList.filter(f);
}

function extractResourceName(mutation) {
  if (mutation.type === 'attributes') {
    return mutation.target.src || mutation.target.href;
  }
}