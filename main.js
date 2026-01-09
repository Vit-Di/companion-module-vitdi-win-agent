const { InstanceBase, Regex, runEntrypoint, InstanceStatus } = require('@companion-module/base')
const UpgradeScripts = require('./upgrades')
const UpdateActions = require('./actions')
const UpdateFeedbacks = require('./feedbacks')
const UpdateVariableDefinitions = require('./variables')

class ModuleInstance extends InstanceBase {
	constructor(internal) {
		super(internal)
	}

	// Scan
    startProcessScan() {
		this.scanRunningProcesses()
		this.scanInstalledApps()

		this.scanTimerProc = setInterval(() => this.scanRunningProcesses(), 15000) // 15с
		this.scanTimerApps = setInterval(() => this.scanInstalledApps(), 60000)    // 1хв
	}

    stopProcessScan() {
        if (this.scanTimerProc) clearInterval(this.scanTimerProc)
		if (this.scanTimerApps) clearInterval(this.scanTimerApps)
    }

	async scanRunningProcesses() {
		
		const url = `http://${this.config.host}:${this.config.port}/processes`
		
		try {
			const res = await fetch(url)
			if (res.ok) {
				const data = await res.json()
				if (data.processes) {
					
					this.activeProcesses = data.processes

					
					this.processChoices = data.processes.map(proc => ({ id: proc, label: proc }))
					this.processChoices.unshift({ id: 'manual', label: '-- MANUAL INPUT --' })
					
					
					this.updateActions()

					
					this.updateFeedbacks()
					
					
					this.checkFeedbacks('process_state')
				}
			}
		} catch (e) {
			
		}
	}

	async scanInstalledApps() {
        const url = `http://${this.config.host}:${this.config.port}/apps/list`
		try {
			const res = await fetch(url)
            if (res.ok) {
                const data = await res.json()
                if (data.apps) {
                    
                    this.appChoices = data.apps.map(app => ({ id: app.path, label: app.name }))
                    this.appChoices.unshift({ id: 'manual', label: '-- MANUAL PATH --' })
                    
                    this.updateActions()
                }
            }
		} catch (e) {}
	}

	async init(config) {
		this.config = config

		this.activeProcesses = []

		this.updateStatus(InstanceStatus.Connecting)

		this.startProcessScan()

		this.initConnection()
		
		this.updateActions() // export actions
		this.updateFeedbacks() // export feedbacks
		this.updateVariableDefinitions() // export variable definitions
	}
	// When module gets deleted
	async destroy() {
		this.log('debug', 'destroy')
	}

	async configUpdated(config) {
		this.config = config
		this.initConnection()
	}

	// Return config fields for web config
	getConfigFields() {
		return [
			{
				type: 'textinput',
				id: 'host',
				label: 'Target IP',
				width: 8,
				regex: Regex.IP,
			},
			{
				type: 'textinput',
				id: 'port',
				label: 'Target Port',
				width: 4,
				regex: Regex.PORT,
			},
		]
	}

	initConnection() {
		this.stopPolling()
		
		this.checkStatus()

		this.pollingInterval = setInterval(() => {
			this.checkStatus()
		}, 2000)
	}

	stopPolling() {
		if (this.pollingInterval) {
			clearInterval(this.pollingInterval)
			delete this.pollingInterval
		}
	}

	async checkStatus() {
		const url = `http://${this.config.host}:${this.config.port}/stats`
		
		try {
			
			const response = await fetch(url, { signal: AbortSignal.timeout(1500) })
			
			if (response.ok) {
				const data = await response.json()
				
				this.updateStatus(InstanceStatus.Ok)
				
				
				this.setVariableValues({
					'hostname': data.hostname,      
					'cpu_usage': data.cpu,          
					'ram_usage': data.ram,          
					'mouse_x': data.mouse_x || 0,   
					'mouse_y': data.mouse_y || 0,   
					'agent_status': 'Online'
				})

				
				this.checkFeedbacks('cpu_usage_advanced', 'ram_usage_advanced', 'agent_online') 

			} else {
				
				this.updateStatus(InstanceStatus.UnknownError, `Status: ${response.status}`)
				this.setVariableValues({ 'agent_status': 'Error' })
				this.checkFeedbacks('agent_online')
			}
		} catch (e) {
			
			this.updateStatus(InstanceStatus.ConnectionFailure, 'Offline')
			
			
			this.setVariableValues({ 
				'cpu_usage': 0, 
				'ram_usage': 0, 
				'mouse_x': 0,
				'mouse_y': 0,
				'agent_status': 'Offline' 
			})
			
			
			this.checkFeedbacks('cpu_usage_advanced', 'ram_usage_advanced', 'agent_online')
		}
	}
	
	
	async sendRequest(method, endpoint, body = null) {
		const url = `http://${this.config.host}:${this.config.port}${endpoint}`
		
		const options = {
			method: method,
			headers: {
				'Content-Type': 'application/json',
			},
		}

		if (body) {
			options.body = JSON.stringify(body)
		}

		try {
			const response = await fetch(url, options)
			
			if (!response.ok) {
				this.log('error', `Error sending command: ${response.statusText}`)
			} else {
				
			}
		} catch (e) {
			this.log('error', `Network error: ${e.message}`)
		}
	}



	updateActions() {
		UpdateActions(this)
	}

	updateFeedbacks() {
		UpdateFeedbacks(this)
	}

	updateVariableDefinitions() {
		UpdateVariableDefinitions(this)
	}
}

runEntrypoint(ModuleInstance, UpgradeScripts)
