// agentConsensusEngine.js
LawAIApp.AgentConsensusEngine = {
  proposals: [],
  _voters: [],
  registerVoter(agentName, weight = 1) {
    if (!this._voters.find(v => v.name === agentName)) {
      this._voters.push({ name: agentName, weight });
    }
  },
  propose(proposal) {
    const prop = {
      id: 'prop_' + Date.now(),
      ...proposal,
      votes: {},
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    this.proposals.push(prop);
    LawAIApp.EventBus.emit('ProposalCreated', prop);
    return prop;
  },
  vote(agentName, proposalId, approve, weight = 1) {
    const prop = this.proposals.find(p => p.id === proposalId);
    if (!prop) return;
    prop.votes[agentName] = { approve, weight };
    this._checkConsensus(prop);
  },
  _checkConsensus(prop) {
    const totalWeight = this._voters.reduce((sum, v) => sum + v.weight, 0);
    const votedWeight = Object.values(prop.votes).reduce((sum, v) => sum + (v.approve ? v.weight : 0), 0);
    const threshold = totalWeight * 0.51; // 简单多数
    if (votedWeight >= threshold) {
      prop.status = 'accepted';
      LawAIApp.EventBus.emit('ProposalAccepted', prop);
    } else if (Object.keys(prop.votes).length >= this._voters.length && votedWeight < threshold) {
      prop.status = 'rejected';
      LawAIApp.EventBus.emit('ProposalRejected', prop);
    }
  },
  // 自动收集代理建议并生成共识决策
  async runConsensusRound(context) {
    const proposals = [];
    // 各代理根据上下文提出建议
    const agents = LawAIApp.AgentOrchestrator?.agents || [];
    agents.forEach(agent => {
      if (agent.role === 'Teaching & guidance') {
        proposals.push({ type: 'remediation', action: 'review_weak_concepts', priority: 'high' });
      } else if (agent.role === 'Task optimization') {
        proposals.push({ type: 'plan', action: 'adjust_schedule', priority: 'medium' });
      } else if (agent.role === 'Long-term planning') {
        proposals.push({ type: 'strategy', action: 'accelerate_roadmap', priority: 'low' });
      }
    });
    const finalDecision = proposals.sort((a,b) => (a.priority === 'high' ? -1 : 1))[0];
    LawAIApp.EventBus.emit('ConsensusReached', finalDecision);
    return finalDecision;
  }
};
