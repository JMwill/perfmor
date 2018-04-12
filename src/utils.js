const RESOURCE_NODE_NAME = ['img', 'link', 'script']

export function isResrouceMutation(mutation) {
  let nodes = [].concat(
    mutation.addedNodes,
    mutation.type === 'attributes' ? mutation.target : []
  )

  return nodes.filter(node => RESOURCE_NODE_NAME.indexOf(node.nodeName.toLowerCase()) > -1)
}

export function filterResourceMutation(mutationList, filter) {
  const f = typeof filter === 'function' ? filter : isResrouceMutation
  return mutationList.filter(f)
}

export function extractResourceName(mutation) {
  if (mutation.type === 'attributes') {
    return mutation.target.src || mutation.target.href
  }
}
