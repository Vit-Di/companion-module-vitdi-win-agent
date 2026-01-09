module.exports = function (self) {

	const processList = self.processChoices && self.processChoices.length > 0 
		? self.processChoices 
		: [{ id: 'manual', label: 'Waiting for scan...' }]

	const appList = self.appChoices && self.appChoices.length > 0 
		? self.appChoices 
		: [{ id: 'manual', label: 'Waiting for scan...' }]

	const keyList = [
		{id:'spc',label:'Space (Play/Pause)'}, {id:'enter',label:'Enter'}, {id:'esc',label:'Escape'},
		{id:'left',label:'Arrow Left'}, {id:'right',label:'Arrow Right'}, {id:'up',label:'Arrow Up'}, {id:'down',label:'Arrow Down'},
		{id:'f5',label:'F5 (Start Pres)'}, {id:'f11',label:'F11 (Fullscreen)'}, {id:'backspace',label:'Backspace'},
		{id:'tab',label:'Tab'}, {id:'home',label:'Home'}, {id:'end',label:'End'}, {id:'pageup',label:'Page Up'}, {id:'pagedown',label:'Page Down'},
		{id:'volume_mute',label:'Volume Mute'}, {id:'volume_up',label:'Volume Up'}, {id:'volume_down',label:'Volume Down'},
        {id:'printscreen',label:'Print Screen'}, {id:'delete',label:'Delete'}
	]

	self.setActionDefinitions({
		window_control: {
			name: 'Window: Control Process',
			description: 'Focus, Maximize, Close specific windows from scanned list',
			options: [
				{
					type: 'dropdown',
					label: 'Select Process',
					id: 'proc_menu',
					default: processList[0].id,
					choices: processList,
					allowCustom: true
				},
				{
					type: 'textinput',
					label: 'Or Type Name (if Manual)',
					id: 'proc_manual',
					default: '',
					isVisible: (opt) => opt.proc_menu === 'manual'
				},
				{
					type: 'dropdown',
					label: 'Action',
					id: 'act',
					default: 'focus',
					choices: [
						{ id: 'focus', label: '🔍 Focus / Bring to Front' },
						{ id: 'maximize', label: '⬆️ Maximize' },
						{ id: 'minimize', label: '⬇️ Minimize' },
						{ id: 'restore', label: '🔄 Restore' },
						{ id: 'close_win', label: '❌ Close Window (Soft)' },
						{ id: 'kill', label: '💀 KILL PROCESS (Force)' },
					],
				},
			],
			callback: async (event) => {
				const target = event.options.proc_menu === 'manual' ? event.options.proc_manual : event.options.proc_menu
				
				await self.sendRequest('POST', '/universal/control', {
					path: target,
					action: event.options.act,
				})
			},
		},

		
		app_start_list: {
			name: 'App: Start from List',
			description: 'Launch an app found on the PC',
			options: [
				{
					type: 'dropdown',
					label: 'Select App',
					id: 'path',
					default: appList[0].id,
					choices: appList,
					allowCustom: true
				},
				{
					type: 'textinput',
					label: 'Arguments (Optional)',
					id: 'args',
					default: '',
				},
			],
			callback: async (event) => {
				await self.sendRequest('POST', '/apps/start', {
					path: event.options.path,
					args: event.options.args,
				})
			},
		},

		app_start_manual: {
			name: 'App: Start Manual',
			description: 'Launch via path (e.g. C:/Windows/Notepad.exe)',
			options: [
				{ type: 'textinput', label: 'Path / Command', id: 'path', default: 'notepad' },
				{ type: 'textinput', label: 'Arguments', id: 'args', default: '' },
			],
			callback: async (event) => {
				await self.sendRequest('POST', '/apps/start', {
					path: event.options.path,
					args: event.options.args,
				})
			},
		},

        open_website: {
			name: 'App: Open Website',
			options: [
				{ type: 'textinput', label: 'URL', id: 'url', default: 'https://google.com' }
			],
			callback: async (event) => {
                // explorer.exe автоматично відкриває URL у дефолтному браузері
				await self.sendRequest('POST', '/apps/start', {
                    path: 'explorer', 
                    args: event.options.url
                })
			},
		},

		
		keyboard: {
			name: 'Keyboard: Advanced',
			description: 'Press keys, Hotkeys, or Type text',
			options: [
				{
					type: 'dropdown',
					label: 'Mode',
					id: 'mode',
					default: 'press',
					choices: [
						{ id: 'press', label: 'Single Key (Press)' },
						{ id: 'hotkey', label: 'Hotkey Combo (e.g. Ctrl+S)' },
						{ id: 'type', label: 'Type Text (String)' },
					],
				},
				{
					type: 'dropdown',
					label: 'Key',
					id: 'key_std',
					default: 'spc',
					choices: keyList,
					isVisible: (opt) => opt.mode === 'press',
				},
				{
					type: 'textinput',
					label: 'Hotkey / Text',
					id: 'key_custom',
					default: '',
					isVisible: (opt) => opt.mode !== 'press',
				},
			],
			callback: async (event) => {
				const val = event.options.mode === 'press' ? event.options.key_std : event.options.key_custom
				await self.sendRequest('POST', '/keyboard/action', {
					action: event.options.mode,
					text: val,
				})
			},
		},

        
        minimize_all: {
			name: 'System: Minimize All (Desktop)',
            description: 'Win+D',
			options: [],
			callback: async () => {
				await self.sendRequest('POST', '/keyboard/action', { action: 'hotkey', text: 'lwin+d' })
			},
		},
        
        screenshot_full: {
			name: 'System: Screenshot (Full)',
			options: [],
			callback: async () => {
				await self.sendRequest('POST', '/keyboard/action', { action: 'hotkey', text: 'printscreen' })
			},
		},

        screenshot_area: {
			name: 'System: Screenshot (Snippet Tool)',
            description: 'Win+Shift+S',
			options: [],
			callback: async () => {
				await self.sendRequest('POST', '/keyboard/action', { action: 'hotkey', text: 'lwin+shift+s' })
			},
		},

        virtual_desktop: {
			name: 'System: Switch Virtual Desktop',
			options: [
				{
                    type: 'dropdown', 
                    label: 'Direction', 
                    id: 'dir', 
                    default: 'right', 
                    choices: [
                        { id: 'left', label: 'Previous (Left)' }, 
                        { id: 'right', label: 'Next (Right)' }
                    ]
                }
			],
			callback: async (event) => {
				await self.sendRequest('POST', '/keyboard/action', {
                    action: 'hotkey', 
                    text: `ctrl+lwin+${event.options.dir}`
                })
			},
		},

        system_utils: {
            name: 'System: Open Utility',
            options: [
                {
                    type: 'dropdown', label: 'Utility', id: 'util', default: 'taskmgr', choices: [
                        {id:'taskmgr', label:'Task Manager (Ctrl+Shift+Esc)'},
                        {id:'devmgr', label:'Device Manager'},
                        {id:'settings', label:'Settings (Win+I)'},
                        {id:'explorer', label:'File Explorer (Win+E)'}
                    ]
                }
            ],
            callback: async (event) => {
                const util = event.options.util
                if (util === 'taskmgr') await self.sendRequest('POST', '/keyboard/action', {action:'hotkey', text:'ctrl+shift+esc'})
                else if (util === 'settings') await self.sendRequest('POST', '/keyboard/action', {action:'hotkey', text:'lwin+i'})
                else if (util === 'explorer') await self.sendRequest('POST', '/keyboard/action', {action:'hotkey', text:'lwin+e'})
                else if (util === 'devmgr') await self.sendRequest('POST', '/apps/start', {path:'devmgmt.msc', args:''})
            }
        },

		
		mouse_click: {
			name: 'Mouse: Click / Move',
			options: [
				{
					type: 'dropdown',
					label: 'Button',
					id: 'type',
					default: 'click',
					choices: [
						{ id: 'click', label: 'Left Click' },
						{ id: 'dblclick', label: 'Double Click' },
						{ id: 'rightclick', label: 'Right Click' },
					],
				},
				{
					type: 'number',
					label: 'X (0 = Current)',
					id: 'x',
					default: 0,
					min: -10000,
					max: 10000,
				},
				{
					type: 'number',
					label: 'Y (0 = Current)',
					id: 'y',
					default: 0,
					min: -10000,
					max: 10000,
				},
                {
					type: 'number',
					label: 'Delay (sec)',
					id: 'delay',
					default: 0.1,
					min: 0,
					max: 10,
                    step: 0.1
				},
			],
			callback: async (event) => {
				await self.sendRequest('POST', '/mouse/action', {
					action: event.options.type,
					x: event.options.x,
					y: event.options.y,
                    delay: event.options.delay
				})
			},
		},

		
		system_power: {
			name: 'System: Power Control',
			options: [
				{
					type: 'dropdown',
					label: 'Action',
					id: 'action',
					default: 'lock',
					choices: [
						{ id: 'lock', label: '🔒 Lock PC' },
						{ id: 'sleep', label: '🌙 Sleep' },
						{ id: 'logout', label: '👋 Sign Out' },
						{ id: 'reboot', label: '🔄 Reboot' },
						{ id: 'shutdown', label: '🛑 Shutdown' },
					],
				},
				{
					type: 'checkbox',
					label: 'Force (Close apps)',
					id: 'force',
					default: false,
				},
			],
			callback: async (event) => {
				await self.sendRequest('POST', '/system/power', {
					action: event.options.action,
					force: event.options.force,
				})
			},
		},
	})
}