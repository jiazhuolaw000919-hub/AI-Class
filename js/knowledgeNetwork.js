window.LawAIApp = window.LawAIApp || {};

LawAIApp.KnowledgeNetwork = {
  graph: {},

  add(node, links = []) {
    this.graph[node] = links;
  },

  get(node) {
    return this.graph[node] || [];
  }
};
