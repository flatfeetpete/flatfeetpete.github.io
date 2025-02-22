// Generated by dts-bundle-generator v9.0.0

/**
 * This enumerates all supported devices.
 */
export declare enum DeviceId {
	palmPilot = "PalmPilot",
	pilot = "Pilot",
	iii = "PalmIII",
	palmVx = "PalmVx",
	palmV = "PalmV",
	palmVII = "PalmVII",
	palmVIIEZ = "PalmVIIEZ",
	palmVIIx = "PalmVIIx",
	iiic = "PalmIIIc",
	iiix = "PalmIIIx",
	iiixe = "PalmIIIxe",
	iiie = "PalmIIIe",
	m500 = "PalmM500",
	m505 = "PalmM505",
	m515 = "PalmM515",
	m520 = "PalmM520",
	m100 = "PalmM100",
	m105 = "PalmM105",
	m125 = "PalmM125",
	m130 = "PalmM130",
	i705 = "Palmi705",
	i710 = "PalmI710",
	handera330 = "HandEra330",
	handera330c = "HandEra330c",
	pegS300 = "PEG-S300",
	pegS320 = "PEG-S320",
	pegS500c = "PEG-S500C",
	pegT400 = "PEG-T400",
	pegN600c = "PEG-N600C/N610C",
	pegT600c = "PEG-T600",
	pegN700c = "PEG-N700C/N710C",
	pegT650c = "YSX1230",
	pegNR70 = "NR70",
	acerS11 = "Acer-S11",
	lp168 = "Legend-P168"
}
/**
 * The four different orientation settings.
 */
export declare enum DeviceOrientation {
	portrait = "portrait",
	landscape90 = "landscape90",
	landscape270 = "landscape270",
	portrait180 = "portrait180"
}
/**
 * This set of performance statistics can be queries at runtime from the emulator.
 */
export interface EmulationStatistics {
	/**
	 * The ratio between the duration of an emulated timeslice and the time that
	 * is required by the host to emulate it. If this drops below one the host
	 * cannot keep up with the emulation, and CloudpilotEmu automatically reduces
	 * emulation speed.
	 */
	hostSpeed: number;
	/**
	 * The relative speed of the emulated device. One means full speed, lower
	 * values indicate that CloudpilotEmu reduced speed in order to compensate for
	 * a slow host.
	 */
	emulationSpeed: number;
	/**
	 * The average number of frames per second. Note that only frames are only
	 * rendered if the screen content actually changed.
	 */
	averageFps: number;
}
/**
 * A CloudpilotEmu event.
 */
export interface Event<Payload> {
	/**
	 * Bind an handler callback to the event.
	 *
	 * CAUTION: a handler that is bound multiple times will be called multiple times, too!
	 *
	 * @param handler Handler callback.
	 * @param context Optional context that is passed to the callback.
	 */
	addHandler<Context>(handler: Handler<Payload, Context>, context?: Context): Event<Payload>;
	/**
	 * Remove a previously bound handler. Both callback and context must be identical for
	 * the handler to be removed.
	 *
	 * CAUTION: this method will only remove one callback each call, even if a handler / callback
	 * combo is bound multiple times.
	 *
	 * @param handler Handler callback.
	 * @param context Optional callback context.
	 */
	removeHandler<Context>(handler: Handler<Payload, Context>, context?: Context): Event<Payload>;
}
/**
 * Handler callback type.
 */
export type Handler<Payload, Context> = (payload: Payload, context: Context) => void;
/**
 * DOM event handler callback.
 */
export type EventHandler<K extends keyof HTMLElementEventMap> = (ev: HTMLElementEventMap[K]) => void;
/**
 * A DOM event target.
 */
export interface EventTarget {
	addEventListener<K extends keyof HTMLElementEventMap>(type: K, handler: EventHandler<K>, options?: boolean | AddEventListenerOptions): void;
	removeEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: EventHandler<K>, options?: boolean | EventListenerOptions): void;
}
/**
 * Emitted by the emulator.
 */
export interface ReceivePayload {
	/**
	 * Serial data sent by PalmOS. This can be `undefined` in order to
	 * communicate a frame boundary or the absence of a frame response
	 * in 'sync' mode.
	 */
	data: Uint8Array | undefined;
	/**
	 * Marks a transmission frame as complete. This is always `true` in
	 * 'simple' mode.
	 */
	isFrameComplete: boolean;
}
export interface SerialPort {
	/**
	 * Send serial data to the emulator.
	 *
	 * @param data Serial data to transmit (or undefined in order to communicate
	 * a frame boundary or response timeout in 'sync' mode).
	 *
	 * @param isFrameComplete Marks a transmission frame as complete. Should always
	 * be `true` in 'simple' mode.
	 */
	send(data: Uint8Array | undefined, isFrameComplete: boolean): void;
	/**
	 * Switch between 'simple' and 'sync' mode. Sync mode consumes more CPU and should
	 * only be used to connect two emulator instances via IrDA.
	 *
	 * @param modeSync Set `true` for 'sync' mode.
	 */
	setModeSync(modeSync: boolean): void;
	/**
	 * Query mode.
	 */
	getModeSync(): boolean;
	/**
	 * This is fired by the emulator for data or synchronization events. In 'sync' mode,
	 * **every** such event needs to be sent to the remote instance.
	 */
	receiveEvent: Event<ReceivePayload>;
}
export interface Emulator {
	/**
	 * Load a ROM and put the emulator in paused state.
	 *
	 * @param rom Device ROM
	 * @param deviceId Optional: device ID, autodetected if not specified
	 */
	loadRom(rom: Uint8Array, deviceId?: DeviceId): this;
	/**
	 * Load a Cloudpilot session and put the emulator in paused state.
	 *
	 * @param session Session image
	 */
	loadSession(session: Uint8Array): this;
	/**
	 * Attach and mount a gzip compressed card image.
	 *
	 * @param cardImage Gzip compressed image data
	 */
	insertCompressedCardImage(cardImage: Uint8Array): this;
	/**
	 * Attach and mount a plain card image.
	 *
	 * @param cardImage Image data
	 */
	insertCardImage(cardImage: Uint8Array): this;
	/**
	 * Eject a previously inserted card image:
	 */
	ejectCard(): this;
	/**
	 * Check whether a card is currently mounted.
	 */
	isCardMounted(): boolean;
	/**
	 * Configure the canvas element used for displaying the emulator.
	 *
	 * @param canvas Canvas for displaying the emulator
	 */
	setCanvas(canvas: HTMLCanvasElement): this;
	/**
	 * Receive input events from the specified sources. If this method is called
	 * multiple times the previous sources will be unbound.
	 *
	 * @param keyboardTarget Optional: target for keyboard events, default: `window`
	 */
	bindInput(keyboardTarget?: EventTarget): this;
	/**
	 * Unbind the handlers previous bound with `bindInput`.
	 */
	releaseInput(): this;
	/**
	 * Install a prc or pdb database to the device.
	 *
	 * @param file The database data.
	 */
	installDatabase(file: Uint8Array): this;
	/**
	 * Install a prc database to the device and attempt to launch it.
	 *
	 * @param file The database data.
	 */
	installAndLaunchDatabase(file: Uint8Array): this;
	/**
	 * Extract all databases from a zip archive and install them.
	 *
	 * @param file The zip archive data.
	 */
	installFromZipfile(file: Uint8Array): this;
	/**
	 * Extract all databases from a zip archive and install them, then attampt to
	 * launch the specified file.
	 *
	 * @param file The zip archive data.
	 * @param launchFile The file name of the database that Cloudpilot will try to launch.
	 */
	installFromZipfileAndLaunch(file: Uint8Array, launchFile: string): this;
	/**
	 * Attemot to launch the database with the specified name.
	 *
	 * @param name Database name
	 */
	launchByName(name: string): this;
	/**
	 * Attempt to extract the name from a database and launch it.
	 *
	 * @param database Database data (only the first 32 bytes are required)
	 */
	launchDatabase(database: Uint8Array): this;
	/**
	 * Perform a soft reset (equivalent of pushing the reset button).
	 */
	reset(): this;
	/**
	 * Reset w/o system extensions (equivalent to holding "down" while pushing the
	 * reset button).
	 */
	resetNoExtensions(): this;
	/**
	 * Hard reset (equivalent to holding "power" while pushing the
	 * reset button).
	 */
	resetHard(): this;
	/**
	 * Is the emulator running?
	 */
	isRunning(): boolean;
	/**
	 * Is the device powered off?
	 */
	isPowerOff(): boolean;
	/**
	 * Has the emulated device passed UI initialization (during boot)? This
	 * is required before software can be installed.
	 */
	isUiInitialized(): boolean;
	/**
	 * Resume a paused device.
	 */
	resume(): this;
	/**
	 * Pause a running device.
	 */
	pause(): this;
	/**
	 * Push a hardware button.
	 *
	 * @param button The desired button
	 */
	buttonDown(button: Button): this;
	/**
	 * Release a hardware button.
	 *
	 * @param button The desired button
	 */
	buttonUp(button: Button): this;
	/**
	 * Adjust speed of the emulated device.
	 *
	 * @param speed Speed factor
	 */
	setSpeed(speed: number): this;
	/**
	 * Query configured speed factor.
	 */
	getSpeed(): number;
	/**
	 * Set audio volume.
	 *
	 * @param volume Volume (1 = 100%, 0 = silent)
	 */
	setVolume(volume: number): this;
	/**
	 * Query audio volume
	 */
	getVolume(): number;
	/**
	 * Initialize audio. This must be called from an event handler that was triggered
	 * by a user interaction, i.e. a click or a key press.
	 */
	initializeAudio(): Promise<boolean>;
	/**
	 * Was audio initialized succesfully?
	 */
	isAudioInitialized(): boolean;
	/**
	 * Enable or disable game mode (direct key mapping to hardware buttons).
	 *
	 * @param gameModeActive Desired state
	 */
	setGameMode(gameModeActive: boolean): this;
	/**
	 * Is game mode enabled?
	 */
	isGameMode(): boolean;
	/**
	 * Enable or disable shift-ctrl for toggling game mode (enabled by default).
	 *
	 * @param enableGamemodeHotkey Desired state
	 */
	setGameModeHotkeyEnabled(enableGamemodeHotkey: boolean): this;
	/**
	 * Can game mode be toggled via shift-ctrl?
	 */
	isGameModeHotkeyEnabled(): boolean;
	/**
	 * Enable or disable game mode indicator (overlays hard buttons if game mode is active)? Enabled
	 * by default.
	 *
	 * @param gameModeIndicatorEnabled Desired state
	 */
	setGameModeIndicatorEnabled(gameModeIndicatorEnabled: boolean): this;
	/**
	 * Is game mode overlay enabled?
	 */
	isGameModeIndicatorEnabled(): boolean;
	/**
	 * Change device orientation.
	 *
	 * @param orientation Desired orientation
	 */
	setOrientation(orientation: DeviceOrientation): this;
	/**
	 * Query device orientation
	 */
	getOrientation(): DeviceOrientation;
	/**
	 * Set hotsync name.
	 *
	 * @param hotsyncName Desired hotsync name
	 */
	setHotsyncName(hotsyncName: string | undefined): this;
	/**
	 * Get hotsync name.
	 */
	getHotsyncName(): string | undefined;
	/**
	 * Keep running if the emulator tab is not visible?
	 *
	 * @param toggle Desired state
	 */
	setRunHidden(toggle: boolean): this;
	/**
	 * Keep running if the emulator tab is not visible?
	 */
	getRunHidden(): boolean;
	/**
	 * Get performance statistics
	 */
	getStatistics(): EmulationStatistics;
	/**
	 * Get serial transport for IR transceiver.
	 */
	getSerialPortIR(): SerialPort;
	/**
	 * Get serial transport for serial port.
	 */
	getSerialPortSerial(): SerialPort;
	/**
	 * Fires when the device turns on or off.
	 */
	readonly powerOffChangeEvent: Event<boolean>;
	/**
	 * Fires when PalmOS resets or passed UI initialization during boot.
	 */
	readonly isUiInitializedChangeEvent: Event<boolean>;
	/**
	 * Fires when audio is initializd successfully.
	 */
	readonly audioInitializedEvent: Event<void>;
	/**
	 * Fires after each emulated timeslice (typicall 60 times per second)
	 */
	readonly timesliceEvent: Event<void>;
	/**
	 * Fires when the hotsync name changes. This does not happen immediatelly when
	 * `setHotsyncName` is called, but only when the OS is notified of the new name.
	 */
	readonly hotsyncNameChangeEvent: Event<string>;
	/**
	 * Fires if game mode is enabled or disabled.
	 */
	readonly gameModeChangeEvent: Event<boolean>;
}
/**
 * The various supported hard buttons.
 */
export declare enum Button {
	cal = 0,
	phone = 1,
	todo = 2,
	notes = 3,
	up = 4,
	down = 5,
	power = 6,
	cradle = 7
}
export declare const VERSION: string | undefined;
/**
 * Create a new instance of the emulator.
 *
 * @param wasmModuleUrl Optional: URL for loading the web assembly module
 *
 * @returns Emulator instance
 */
export declare function createEmulator(wasmModuleUrl?: string): Promise<Emulator>;
/**
 * Create a factory function that creates new Emulator instances without redownloading
 * and recompiling the WASM module.
 *
 * @param wasmModuleUrl Optional: URL for loading the web assembly module
 * @returns
 */
export declare function createEmulatorFactory(wasmModuleUrl?: string): () => Promise<Emulator>;

export as namespace cloudpilot;

export {};
