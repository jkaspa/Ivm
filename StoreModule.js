function StoreModule() {
	this.namespaced = true
	return this
}

StoreModule.prototype.addActions = function(actions = {}) {
	this.actions = Object.assign({}, this.actions, actions)
}
StoreModule.prototype.addMutations = function(mutations = {}) {
	this.mutations = Object.assign({}, this.mutations, mutations)
}
StoreModule.prototype.addState = function(state = {}) {
	this.state = Object.assign({}, this.state, state)
}
StoreModule.prototype.addGetters = function(getters = {}) {
	this.getters = Object.assign({}, this.getters, getters)
}
StoreModule.prototype.addModules = function(modules = {}) {
	this.modules = Object.assign({}, this.modules, modules)
}

export default StoreModule
