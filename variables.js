module.exports = async function (self) {
	self.setVariableDefinitions([
		{ variableId: 'hostname', name: 'Computer Name' },
		{ variableId: 'cpu_usage', name: 'CPU Usage (%)' },
		{ variableId: 'ram_usage', name: 'RAM Usage (%)' },
		{ variableId: 'mouse_x', name: 'Mouse X Position' },
		{ variableId: 'mouse_y', name: 'Mouse Y Position' },
		{ variableId: 'agent_status', name: 'Connection Status' },
	])
}