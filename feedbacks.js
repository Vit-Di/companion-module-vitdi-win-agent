const { combineRgb } = require('@companion-module/base')

module.exports = async function (self) {
	
    
    const processList = self.processChoices && self.processChoices.length > 0 
		? self.processChoices 
		: [{ id: 'manual', label: 'Waiting for scan...' }]

    self.setFeedbackDefinitions({
		
        
        //СТАТУС ПРОЦЕСУ
		process_state: {
			name: 'Status: Process is Running',
			type: 'boolean',
            description: 'Change button color if a specific process is running',
			defaultStyle: {
				bgcolor: combineRgb(0, 255, 0), // Яскраво-зелений, якщо запущено
				color: combineRgb(0, 0, 0),     // Чорний текст
			},
			options: [
				{
					type: 'dropdown',
					label: 'Select Process',
					id: 'proc',
					default: processList[0].id,
					choices: processList,
                    allowCustom: true
				},
                {
                    type: 'textinput',
                    label: 'Or Type Manually',
                    id: 'manual_proc',
                    isVisible: (opt) => opt.proc === 'manual'
                }
			],
			callback: (feedback) => {
                
                const target = feedback.options.proc === 'manual' ? feedback.options.manual_proc : feedback.options.proc
                
                
                if (self.activeProcesses && self.activeProcesses.includes(target)) {
                    return true 
                }
				return false
			},
		},

        
        // CPU TRAFFIC 
        cpu_usage_advanced: {
            name: 'Status: CPU Usage (Traffic Light)',
            type: 'advanced', 
            description: 'Green -> Yellow -> Red based on CPU usage',
            options: [
                {
                    type: 'number',
                    label: 'Yellow Threshold % (Warning)',
                    id: 'yellow',
                    default: 50,
                    min: 0, max: 100
                },
                {
                    type: 'number',
                    label: 'Red Threshold % (Critical)',
                    id: 'red',
                    default: 85,
                    min: 0, max: 100
                }
            ],
            callback: (feedback) => {
                
                const cpu = self.getVariableValue('cpu_usage') || 0
                
                
                if (cpu >= feedback.options.red) {
                    
                    return { bgcolor: combineRgb(255, 0, 0), color: combineRgb(255, 255, 255) }
                } else if (cpu >= feedback.options.yellow) {
                    
                    return { bgcolor: combineRgb(255, 200, 0), color: combineRgb(0, 0, 0) }
                } else {
                    
                    return { bgcolor: combineRgb(0, 150, 0), color: combineRgb(255, 255, 255) }
                }
            }
        },

        
        agent_online: {
            name: 'Status: Agent Online (Green/Red)',
            type: 'boolean',
            description: 'Green if connected, Red if offline',
            defaultStyle: {
                bgcolor: combineRgb(0, 255, 0), 
                color: combineRgb(0, 0, 0),
            },
            options: [],
            callback: (feedback) => {
                
                const status = self.getVariableValue('agent_status')
                
                
                return status === 'Online'
            }
        },
        //  RAM TRAFFIC 
        ram_usage_advanced: {
            name: 'Status: RAM Usage (Traffic Light)',
            type: 'advanced',
            description: 'Green -> Yellow -> Red based on RAM usage',
            options: [
                {
                    type: 'number',
                    label: 'Yellow Threshold % (Warning)',
                    id: 'yellow',
                    default: 60,
                    min: 0, max: 100
                },
                {
                    type: 'number',
                    label: 'Red Threshold % (Critical)',
                    id: 'red',
                    default: 90,
                    min: 0, max: 100
                }
            ],
            callback: (feedback) => {
                
                const ram = self.getVariableValue('ram_usage') || 0
                
                if (ram >= feedback.options.red) {
                    return { bgcolor: combineRgb(255, 0, 0), color: combineRgb(255, 255, 255) }
                } else if (ram >= feedback.options.yellow) {
                    return { bgcolor: combineRgb(255, 200, 0), color: combineRgb(0, 0, 0) }
                } else {
                    return { bgcolor: combineRgb(0, 150, 0), color: combineRgb(255, 255, 255) }
                }
            }
        }
	})
}