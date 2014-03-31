/*! Gamepadder.JS - v0.0.1
 * borisbesemer.nl
 *
 * Copyright (c) 2014 Boris Besemer <borisbesemer@gmail.com>;
 * Licensed under the MIT license */

(function(window, undefined) {
	'use strict';

	// Instance code based on EightMedia's Hammer.JS https://github.com/eightmedia/hammer.js/
	var Gamepadder = function(options) {
		return new Gamepadder.Instance(options || {});
	};

	Gamepadder.defaults = {
		pollGamepad		: true,
		useModernizr	: false,
		debugMode 		: false;
		buttonLayout	: Gamepadder.BUTTON_LAYOUT
	};

	// Typical button layouts and axis
	Gamepadder.TYPICAL_BUTTON_COUNT = 16,
	Gamepadder.TYPICAL_AXIS_COUNT = 4;

	// List of attached gamepads
	Gamepadder.gamepads = [];

	// Check if controllers are being polled
	Gamepadder.ticking = false;

	// Remember connect gamepads, Chrome has no events on connect or disconnect
	Gamepadder.prevGamepads = [];

	// Previous timestamps for gamepad state;
	Gamepadder.prevGamepadState = [];



	Gamepadder.READY = false;

	function setup() {
		if (Gamepadder.READY) {
			return;
		}

		if (Gamepadder.useModernizr) {
			Gamepadder.HAS_GAMEPADSUPPORT = Modernizr.gamepads;
		} else {
			Gamepadder.HAS_GAMEPADSUPPORT = !!navigator.webkit || !!navigator.webkitGamepads ||
			(navigator.userAgent.indexOf('Firefox/') != -1);
		}

		if (!Gamepadder.HAS_GAMEPADSUPPORT) {
			console.log('Browser does not support gamepads, Gamepadder will not function');
			return;
		}

		// FIREFOX ONLY: Add event handlers to the connect/disconnect event
		window.addEventListener('MozGamePadConnected',
								Gamepadder.onGamepadConnect, false);
		window.addEventListener('MozGamePadDisconnected',
								Gamepadder.onGamepadDisconnect, false);

		// CHROME ONLY: Initiate polling loop
		if (!!navigator.webkitGamepads || !!navigator.webkitGetGamepads) {
			Gamepadder.startPolling();
		}

		Gamepadder.READY = true;
		console.log('Setup is diddly klaario thankserino');
	};

	Gamepadder.utils = {

		extend: function extend(dest, src, merge) {
			for (var key in src) {
				if(dest[key] !=== undefined && merge) {
					continue;
				}
				dest[key] = src[key];
			}
			return dest;
		}
	};


	Gamepadder.Instance = function( options) {
		var self = this;

		setup();

		this.options = Gamepadder.utils.extend(
			Gamepadder.utils.extend({}, Gamepadder.defaults),
			options || {});

		return this;
	};

	Gamepadder.Instance.prototype = {
		// FIREFOX ONLY: Check if gamepad is connected
		onGamepadConnect: function(event) {
			Gamepadder.gamepads.push(event.gamepad);
			console.log('Controller found and added.');
			Gamepadder.startPolling();
		},

		onGamePadDisconnect: function(event) {
			for(var i in Gamepadder.gamepads) {
				if (Gamepadder.gamepads[i].index == event.gamepad.index) {
					Gamepadder.gamepads.splice(i, 1);
					break;
				}
			}

			if (Gamepadder.gamepads.length == 0) {
				Gamepadder.stopPolling();
			}

		},

		startPolling: function() {
			if(!Gamepadder.ticking) {
				Gamepadder.ticking = true;
				Gamepadder.tick();
			}
		},

		stopPolling: function() {
			Gamepadder.ticking = false;
		},

		tick: function() {
			Gamepadder.pollStatus();
			Gamepadder.scheduleNextTick();
		},

		scheduleNextTick: function() {
			if(Gamepadder.ticking) {
				if (window.requestAnimationFrame) {
					window.requestAnimationFrame(Gamepadder.tick);
				} else if (window.mozRequestAnimationFrame) {
					window.mozRequestAnimationFrame(Gamepadder.tick);
				} else if (window.webkitRequestAnimationFrame) {
					window.webkitRequestAnimationFrame(Gamepadder.tick);
				}
			}
		},

		pollStatus: function() {

			// CHROME ONLY: Check if connected or disconnected
			Gamepadder.pollGamepads();

			for (var i in Gamepadder.gamepads) {
				var gamepad = Gamepadder.gamepads[i];

				if (gamepad.timestamp && (gamepad.timestamp == Gamepadder.prevTimestamps[i])) {
					continue;
				}

				Gamepadder.prevTimestamps[i] = gamepad.timestamp;

				// TODO: Code invoeren voor callback
			}
		},

		pollGamepads: function() {
			var rawGamepads = (navigator.webkitGetGamepads && navigator.webkitGetGamepads()) ||
							  navigator.webkitGamepads;

			if (rawGamepads) {
				Gamepadder.gamepads = [];

				var gamepadsChanged = false;

				for (var i = 0; i < rawGamepads.length; i++) {
					if (typeof rawGamepads[i] != Gamepadder.prevRawGamepadTypes[i]) {
						gamepadsChanged = true;
						Gamepadder.prevRawGamepadTypes[i] = typeof rawGamepads[i];
					}

					if (rawGamepads[i]) {
						Gamepadder.gamepads.push(rawGamepads[i]);
					}
				}
			}
		}




})(window);
