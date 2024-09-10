/**
 * AirConsole.
 * @copyright 2024 by N-Dream AG, Switzerland. All rights reserved.
 * @version 1.9.0
 *
 * IMPORTANT:
 * @see http://developers.airconsole.com/ for API documentation
 *
 * This file is grouped into the following chapters:
 * - Constants: Constants you should use
 * - Connectivity: Device Ids, connects and disconnects
 * - Messaging: Sending messages between devices
 * - Device States: Setting data for a device that is readable for all devices
 * - Profile data: User profile data, including nicknames and profile pictures
 * - Active players: Setting a couple of devices as active players for a game
 * - Controller Inputs: Special device inputs like device motion
 * - Ads: Showing ads and handling their events
 * - Premium: Handling premium users
 * - Navigation: Changing games and opening external links
 * - User Interface: Changing orientation
 * - Persistent Data: Storing data across sessions
 * - High Scores: Storing and retrieving high scores
 * - Environment Events: Events triggered by the real world
 *
 * If your prefer an event driven api with .on() .off() and .dispatch()
 * interface instead of sending messages,
 * @see http://github.com/AirConsole/airconsole-events/
 *
 */
/**
 * Your gateway object to AirConsole.
 * There are getter and setter functions for all properties.
 * Do not access properties of this object directly.
 * @constructor
 * @param {AirConsole~Config} opts - Constructor config, see bellow.
 * @return {AirConsoleObject} The AirConsole object.
 */
declare function AirConsole(opts: any): AirConsoleObject;
declare class AirConsole {
    /**
     * AirConsole.
     * @copyright 2024 by N-Dream AG, Switzerland. All rights reserved.
     * @version 1.9.0
     *
     * IMPORTANT:
     * @see http://developers.airconsole.com/ for API documentation
     *
     * This file is grouped into the following chapters:
     * - Constants: Constants you should use
     * - Connectivity: Device Ids, connects and disconnects
     * - Messaging: Sending messages between devices
     * - Device States: Setting data for a device that is readable for all devices
     * - Profile data: User profile data, including nicknames and profile pictures
     * - Active players: Setting a couple of devices as active players for a game
     * - Controller Inputs: Special device inputs like device motion
     * - Ads: Showing ads and handling their events
     * - Premium: Handling premium users
     * - Navigation: Changing games and opening external links
     * - User Interface: Changing orientation
     * - Persistent Data: Storing data across sessions
     * - High Scores: Storing and retrieving high scores
     * - Environment Events: Events triggered by the real world
     *
     * If your prefer an event driven api with .on() .off() and .dispatch()
     * interface instead of sending messages,
     * @see http://github.com/AirConsole/airconsole-events/
     *
     */
    /**
     * Your gateway object to AirConsole.
     * There are getter and setter functions for all properties.
     * Do not access properties of this object directly.
     * @constructor
     * @param {AirConsole~Config} opts - Constructor config, see bellow.
     * @return {AirConsoleObject} The AirConsole object.
     */
    constructor(opts: any);
    /** ------------------------------------------------------------------------ *
     * @chapter                     CONNECTIVITY                                 *
     * @see         http://developers.airconsole.com/#!/guides/pong              *
     * ------------------------------------------------------------------------- */
    /**
     * Gets called when the game console is ready.
     * This event also fires onConnect for all devices that already are
     * connected and have loaded your game.
     * This event also fires onCustomDeviceStateChange for all devices that are
     * connected, have loaded your game and have set a custom Device State.
     * @abstract
     * @param {string} code - The AirConsole join code.
     */
    onReady(code: string): void;
    /**
     * Gets called when a device has connected and loaded the game.
     * @abstract
     * @param {number} device_id - the device ID that loaded the game.
     */
    onConnect(device_id: number): void;
    /**
     * Gets called when a device has left the game.
     * @abstract
     * @param {number} device_id - the device ID that left the game.
     */
    onDisconnect(device_id: number): void;
    /**
     * Returns the device_id of this device.
     * Every device in an AirConsole session has a device_id.
     * The screen always has device_id 0. You can use the AirConsole.SCREEN
     * constant instead of 0.
     * All controllers also get a device_id. You can NOT assume that the device_ids
     * of controllers are consecutive or that they start at 1.
     *
     * DO NOT HARDCODE CONTROLLER DEVICE IDS!
     *
     * If you want to have a logic with "players numbers" (Player 0, Player 1,
     * Player 2, Player 3) use the setActivePlayers helper function! You can
     * hardcode player numbers, but not device_ids.
     *
     * Within an AirConsole session, devices keep the same device_id when they
     * disconnect and reconnect. Different controllers will never get the same
     * device_id in a session. Every device_id remains reserved for the device that
     * originally got it.
     *
     * @see http:// developers.airconsole.com/#/guides/device_ids_and_states
     *
     * @return {number}
     */
    getDeviceId(): number;
    /**
     * Returns the device ID of the master controller.
     * Premium devices are prioritzed.
     * @return {number|undefined}
     */
    getMasterControllerDeviceId(): number | undefined;
    /**
     * Returns all controller device ids that have loaded your game.
     * @return {Array}
     */
    getControllerDeviceIds(): any[];
    /**
     * Returns the current time of the game server.
     * This allows you to have a synchronized clock: You can send the server
     * time in a message to know exactly at what point something happened on a
     * device. This function can only be called if the AirConsole was instantiated
     * with the "synchronize_time" opts set to true and after onReady was called.
     * @return {number} Timestamp in milliseconds.
     */
    getServerTime(): number;
    /**
     * Queries, if new devices are currently silenced.
     * @returns {boolean} True, if new devices that are not players are silenced.
     * @since 1.9.0
     */
    arePlayersSilenced(): boolean;
    /**
     * Dictionary of silenced update messages queued during a running game session.
     * @private
     * @since 1.9.0
     */
    private silencedUpdatesQueue_;
    /** ------------------------------------------------------------------------ *
     * @chapter                     MESSAGING                                    *
     * @see         http://developers.airconsole.com/#!/guides/pong              *
     * ------------------------------------------------------------------------- */
    /**
     * Sends a message to another device.
     * @param device_id {number|undefined} - The device ID to send the message to.
     *                                       If "device_id" is undefined, the
     *                                       message is sent to all devices (except
     *                                       this one).
     * @param data
     */
    message(device_id: number | undefined, data: any): void;
    /**
     * Sends a message to all connected devices.
     * @param data
     */
    broadcast(data: any): void;
    /**
     * Gets called when a message is received from another device
     * that called message() or broadcast().
     * If you dont want to parse messages yourself and prefer an event driven
     * approach, @see http://github.com/AirConsole/airconsole-events/
     * @abstract
     * @param {number} device_id - The device ID that sent the message.
     * @param {serializable} data - The data that was sent.
     */
    onMessage(device_id: number, data: serializable): void;
    /** ------------------------------------------------------------------------ *
     * @chapter                    DEVICE STATES                                 *
     * @see   http://developers.airconsole.com/#!/guides/device_ids_and_states   *
     * ------------------------------------------------------------------------- */
    /**
     * Gets the custom DeviceState of a device.
     * @param {number|undefined} device_id - The device ID of which you want the
     *                                       custom state. Default is this device.
     * @return {Object|undefined} The custom data previously set by the device.
     */
    getCustomDeviceState(device_id: number | undefined): any | undefined;
    /**
     * Sets the custom DeviceState of this device.
     * @param {Object} data - The custom data to set.
     */
    setCustomDeviceState(data: any): void;
    /**
     * Sets a property in the custom DeviceState of this device.
     * @param {String} key - The property name.
     * @param {mixed} value - The property value.
     */
    setCustomDeviceStateProperty(key: string, value: mixed): void;
    /**
     * @typedef {Object} ImmersiveLightOption
     * @property {number} r - The red value of the light. Format: integer between 0 and 255.
     * @property {number} g - The green value of the light. Format: integer between 0 and 255.
     * @property {number} b - The blue value of the light. Format: integer between 0 and 255.
     */
    /**
     * @typedef {Object} ImmersiveOption
     * @property {ImmersiveLightOption} [light] - Light state inside the car.
     * @property {any} [experiment] - Experimental payload for experimental APIs
     * */
    /**
     * Sets the immersive state of the AirConsole game based on the provided options.<br />
     * At least one property is required for the immersive state to be set.
     *
     * @param {ImmersiveOption} immersiveState - The immersive state to send.
     */
    setImmersiveState(immersiveState: ImmersiveOption): void;
    /**
     * Gets called when a device updates it's custom DeviceState
     * by calling setCustomDeviceState or setCustomDeviceStateProperty.
     * Make sure you understand the power of device states:
     * @see http://developers.airconsole.com/#/guides/device_ids_and_states
     * @abstract
     * @param {number} device_id - the device ID that changed its custom
     *                             DeviceState.
     * @param {Object} custom_data - The custom DeviceState data value
     */
    onCustomDeviceStateChange(device_id: number, custom_data: any): void;
    /**
     * Gets called when a device joins/leaves a game session or updates its
     * DeviceState (custom DeviceState, profile pic, nickname, internal state).
     * This is function is also called every time onConnect, onDisconnect or
     * onCustomDeviceStateChange, onDeviceProfileChange is called.
     * It's like their root function.
     * @abstract
     * @param {number} device_id - the device_id that changed its DeviceState.
     * @param user_data {AirConsole~DeviceState} - the data of that device.
     *        If undefined, the device has left.
     */
    onDeviceStateChange(device_id: number, device_data: any): void;
    /** ------------------------------------------------------------------------ *
     * @chapter                       PROFILE                                    *
     * ------------------------------------------------------------------------- */
    /**
     * Returns the globally unique id of a device.
     * @param {number|undefined} device_id - The device id for which you want the
     *                                       uid. Default is this device.
     * @return {string|undefined}
     */
    getUID(device_id: number | undefined): string | undefined;
    /**
     * Returns the nickname of a user.
     * @param {number|undefined} device_id - The device id for which you want the
     *                                       nickname. Default is this device.
     *                                       Screens don't have nicknames.
     * @return {string|undefined}
     */
    getNickname(device_id: number | undefined): string | undefined;
    /**
     * Returns the url to a profile picture of the user.
     * @param {number|string|undefined} device_id_or_uid - The device id or uid for
     *                                                     which you want the
     *                                                     profile picture.
     *                                                     Default is the current
     *                                                     user.
     *                                                     Screens don't have
     *                                                     profile pictures.
     * @param {number|undefined} size - The size of in pixels of the picture.
     *                                  Default is 64.
     * @return {string|undefined}
     */
    getProfilePicture(device_id_or_uid: number | string | undefined, size: number | undefined): string | undefined;
    /**
     * Gets called when a device updates it's profile pic, nickname or email.
     * @abstract
     * @param {number} device_id - The device_id that changed its profile.
     */
    onDeviceProfileChange(device_id: number): void;
    /**
     * Returns true if a user is logged in.
     * @param {number|undefined} device_id - The device_id of the user.
     *                                       Default is this device.
     * @returns {boolean}
     */
    isUserLoggedIn(device_id: number | undefined): boolean;
    /**
     * Requests the email address of this device and calls onEmailAddress iff the
     * request was granted. For privacy reasons, you need to whitelist your
     * game in order to receive the email address of the user. To whitelist your
     * game, contact developers@airconsole.com. For development purposes, localhost
     * is always allowed.
     */
    requestEmailAddress(): void;
    /**
     * Gets called if the request of requestEmailAddress() was granted.
     * For privacy reasons, you need to whitelist your game in order to receive
     * the email address of the user. To whitelist your game, contact
     * developers@airconsole.com. For development purposes, localhost is always
     * allowed.
     * @abstract
     * @param {string|undefined} email_address - The email address of the user if
     *        it was set.
     */
    onEmailAddress(email_address: string | undefined): void;
    /**
     * Lets the user change his nickname, profile picture and email address.
     * If you need a real nickname of the user, use this function.
     * onDeviceProfileChange will be called if the user logs in.
     */
    editProfile(): void;
    /** ------------------------------------------------------------------------ *
     * @chapter                   ACTIVE PLAYERS                                 *
     * @see   http://developers.airconsole.com/#!/guides/device_ids_and_states   *
     * ------------------------------------------------------------------------- */
    /**
     * Takes all currently connected controllers and assigns them a player number.<br />
     * Can only be called by the screen. You don't have to use this helper
     * function, but this mechanism is very convenient if you want to know which
     * device is the first player, the second player, the third player ...<br />
     * The assigned player numbers always start with 0 and are consecutive.
     * You can hardcode player numbers, but not device_ids.<br />
     * Once the screen has called setActivePlayers you can get the device_id of
     * the first player by calling convertPlayerNumberToDeviceId(0), the device_id
     * of the second player by calling convertPlayerNumberToDeviceId(1), ...<br />
     * You can also convert device_ids to player numbers by calling
     * convertDeviceIdToPlayerNumber(device_id). You can get all device_ids that
     * are active players by calling getActivePlayerDeviceIds().<br />
     * The screen can call this function every time a game round starts.<br />
     * When using {@link https://developers.airconsole.com/#!/guides/player_silencing Player Silencing}, the screen needs to call this every time a game round starts or finishes.<br />
     *  Calling it with max_players of 1 or more signals the start of the game round while calling it with max_players 0 signals the end of the game round.
     * @param {number} max_players - The maximum number of controllers that should
     *                               get a player number assigned.
     */
    setActivePlayers(max_players: number): void;
    device_id_to_player_cache: {};
    /**
     * Gets called when the screen sets the active players by calling
     * setActivePlayers().
     * @abstract
     * @param {number|undefined} player_number - The player number of this device.
     *                                           Can be undefined if this device
     *                                           is not part of the active players.
     */
    onActivePlayersChange(player_number: number | undefined): void;
    /**
     * Returns an array of device_ids of the active players previously set by the
     * screen by calling setActivePlayers. The first device_id in the array is the
     * first player, the second device_id in the array is the second player, ...
     * @returns {Array}
     */
    getActivePlayerDeviceIds(): any[];
    /**
     * Returns the device_id of a player, if the player is part of the active
     * players previously set by the screen by calling setActivePlayers. If fewer
     * players are in the game than the passed in player_number or the active
     * players have not been set by the screen, this function returns undefined.
     * @param player_number
     * @returns {number|undefined}
     */
    convertPlayerNumberToDeviceId(player_number: any): number | undefined;
    /**
     * Returns the player number for a device_id, if the device_id is part of the
     * active players previously set by the screen by calling setActivePlayers.
     * Player numbers are zero based and are consecutive. If the device_id is not
     * part of the active players, this function returns undefined.
     * @param device_id
     * @returns {number|undefined}
     */
    convertDeviceIdToPlayerNumber(device_id: any): number | undefined;
    /** ------------------------------------------------------------------------ *
     * @chapter                 CONTROLLER INPUTS                                *
     * ------------------------------------------------------------------------- */
    /**
     * Gets called every X milliseconds with device motion data iff the
     * AirConsole was instantiated with the "device_motion" opts set to the
     * interval in milliseconds. Only works for controllers.
     * Note: Some browsers do not allow games to access accelerometer and gyroscope
     *       in an iframe (your game). So use this method if you need gyroscope
     *       or accelerometer data.
     * @abstract
     * @param {object} data - data.x, data.y, data.z for accelerometer
     *                        data.alpha, data.beta, data.gamma for gyroscope
     */
    onDeviceMotion(data: object): void;
    /**
     * Vibrates the device for a specific amount of time. Only works for controllers.
     * Note: iOS ignores the specified time and vibrates for a pre-set amount of time.
     * @param {Number} time - Milliseconds to vibrate the device
     */
    vibrate(time: number): void;
    /** ------------------------------------------------------------------------ *
     * @chapter                          ADS                                     *
     * ------------------------------------------------------------------------- */
    /**
     * Requests that AirConsole shows a multiscreen advertisment.
     * Can only be called by the AirConsole.SCREEN.
     * onAdShow is called on all connected devices if an advertisement
     * is shown (in this event please mute all sounds).
     * onAdComplete is called on all connected devices when the
     * advertisement is complete or no advertisement was shown.
     */
    showAd(): void;
    /**
     * Gets called if a fullscreen advertisement is shown on this screen.
     * In case this event gets called, please mute all sounds.
     * @abstract
     */
    onAdShow(): void;
    /**
     * Gets called when an advertisement is finished or no advertisement was shown.
     * @abstract
     * @param {boolean} ad_was_shown - True iff an ad was shown and onAdShow was
     *                                 called.
     */
    onAdComplete(ad_was_shown: boolean): void;
    /** ------------------------------------------------------------------------ *
     * @chapter                       PREMIUM                                    *
     * ------------------------------------------------------------------------- */
    /**
     * Returns true if the device is premium
     * @param {number} device_id - The device_id that should be checked.
     *                             Only controllers can be premium.
     *                             Default is this device.
     * @return {boolean|undefined} Returns true or false for a valid device_id and
     *                             undefined if the device_id is not valid.
     *
     */
    isPremium(device_id: number): boolean | undefined;
    /**
     * Returns all device ids that are premium.
     * @return {Array<number>}
     */
    getPremiumDeviceIds(): Array<number>;
    /**
     * Offers the user to become a premium member.
     * Can only be called from controllers.
     * If you call getPremium in development mode, the device becomes premium
     * immediately.
     */
    getPremium(): void;
    /**
     * Gets called when a device becomes premium or when a premium device connects.
     * @abstract
     * @param {number} device_id - The device id of the premium device.
     */
    onPremium(device_id: number): void;
    /** ------------------------------------------------------------------------ *
     * @chapter                       NAVIGATION                                 *
     * ------------------------------------------------------------------------- */
    /**
     * Request that all devices return to the AirConsole store.
     */
    navigateHome(): void;
    /**
     * Request that all devices load a game by url or game id.
     * @param {string} url - The base url of the game to navigate to
     *                       (excluding screen.html or controller.html).
     *                       Instead of a url you may also pass a game id.
     *                       You can also navigate relatively to your current
     *                       game directory: To navigate to a subdirectory,
     *                       pass "./DIRECTORY_NAME". To navigate to a parent
     *                       directory pass "..".
     * @param {object} parameters - You can pass parameters to the game that gets
     *                              loaded. Any jsonizable object is fine.
     *                              The parameters will be appended to the url
     *                              using a url hash.
     */
    navigateTo(url: string, parameters: object): void;
    /**
     * Get the parameters in the loaded game that were passed to navigateTo.
     * @returns {*}
     */
    getNavigateParameters(): any;
    navigate_parameters_cache_: any;
    /**
     * Opens url in external (default-system) browser. Call this method instead of
     * calling window.open. In-App it will open the system's default browser.
     * Because of Safari iOS you can only use it with the onclick handler:
     * <div onclick="airconsole.openExternalUrl('my-url.com');">Open browser</div>
     * OR in JS with assigning element.onclick.
     * @param {string} url - The url to open
     */
    openExternalUrl(url: string): void;
    /** ------------------------------------------------------------------------ *
     * @chapter                     USER INTERFACE                               *
     * ------------------------------------------------------------------------- */
    /**
     * Sets the device orientation.
     * @param {string} orientation - AirConsole.ORIENTATION_PORTRAIT or
     *                               AirConsole.ORIENTATION_LANDSCAPE.
     */
    setOrientation(orientation: string): void;
    /** ------------------------------------------------------------------------ *
     * @chapter                     PERSISTENT DATA                              *
     * ------------------------------------------------------------------------- */
    /**
     * Requests persistent data from the servers.
     * @param {Array<String>} uids - The uids for which you would like to request the persistent data.
     *                                         For controllers, the default is the uid of this device.
     *                                         Screens must provide a valid array of uids.
     * @version 1.9.0 - uids is no longer optional for requests from the screen
     */
    requestPersistentData(uids: Array<string>): void;
    /**
     * Gets called when persistent data was loaded from requestPersistentData().
     * @abstract
     * @param {Object} data - An object mapping uids to all key value pairs.
     */
    onPersistentDataLoaded(data: any): void;
    /**
     * Stores a key-value pair persistently on the AirConsole servers.
     * Storage is per game. Total storage can not exceed 1 MB per game and uid.
     * Storage is public, not secure and anyone can request and tamper with it.
     * Do not store sensitive data.
     * @param {String} key - The key of the data entry.
     * @param {mixed} value - The value of the data entry.
     * @param {String} uid - The uid for which the data should be stored.
     *                       For controllers, the default is the uid of this device.
     *                       Screens must provide a valid uid.
     * @version 1.9.0 - uid is no longer optional for requests from the screen
     */
    storePersistentData(key: string, value: mixed, uid: string): void;
    /**
     * Gets called when persistent data was stored from storePersistentData().
     * @abstract
     * @param {String} uid - The uid for which the data was stored.
     */
    onPersistentDataStored(uid: string): void;
    /** ------------------------------------------------------------------------ *
     * @chapter                      HIGH SCORES                                 *
     * @see       http://developers.airconsole.com/#!/guides/highscore           *
     * ------------------------------------------------------------------------- */
    /**
     * Stores a high score of the current user on the AirConsole servers.
     * High Scores are public, not secure and anyone can request and tamper with
     * them. Do not store sensitive data. Only updates the high score if it was a
     * higher or same score. Calls onHighScoreStored when the request is done.
     * We highly recommend to read the High Score guide (developers.airconsole.com)
     * @param {String} level_name - The name of the level the user was playing.
     *                              This should be a human readable string because
     *                              it appears in the high score sharing image.
     *                              You can also just pass an empty string.
     * @param {String} level_version - The version of the level the user was
     *                                 playing. This is for your internal use.
     * @param {number} score - The score the user has achieved
     * @param {String|Array<String>|undefined} uid - The UIDs of the users that
     *                                               achieved the high score.
     *                                               Can be a single uid or an
     *                                               array of uids. Default is the
     *                                               uid of this device.
     * @param {mixed|undefined} data - Custom high score data (e.g. can be used to
     *                                 implement Ghost modes or include data to
     *                                 verify that it is not a fake high score).
     * @param {String|undefined} score_string - A short human readable
     *                                          representation of the score.
     *                                          (e.g. "4 points in 3s").
     *                                          Defaults to "X points" where x is
     *                                          the score converted to an integer.
     */
    storeHighScore(level_name: string, level_version: string, score: number, uid: string | Array<string> | undefined, data: mixed | undefined, score_string: string | undefined): void;
    /**
     * Gets called when a high score was successfully stored.
     * We highly recommend to read the High Score guide (developers.airconsole.com)
     * @param {AirConsole~HighScore|null} high_score - The stored high score if
     *                                                 it is a new best for the
     *                                                 user or else null.
     *                                                 Ranks include "world",
     *                                                 "country", "region", "city"
     *                                                 if a high score is passed.
     */
    onHighScoreStored(high_score: any): void;
    /**
     * Requests high score data of players (including global high scores and
     * friends). Will call onHighScores when data was received.
     * We highly recommend to read the High Score guide (developers.airconsole.com)
     * @param {String} level_name - The name of the level
     * @param {String} level_version - The version of the level
     * @param {Array<String>|undefined} uids - An array of UIDs of the users that
     *                                         should be included in the result.
     *                                         Default is all connected controllers
     * @param {Array<String>|undefined} ranks - An array of high score rank types.
     *                                          High score rank types can include
     *                                          data from across the world, only a
     *                                          specific area or a users friends.
     *                                          Valid array entries are "world",
     *                                          "country",  "region", "city",
     *                                          "friends", "partner". <br />
     *                                          Default is ["world"].
     * @param {number|undefined} total - Amount of high scores to return per rank
     *                                   type. Default is 8.
     * @param {number|undefined} top - Amount of top high scores to return per rank
     *                                 type. top is part of total. Default is 5.
     */
    requestHighScores(level_name: string, level_version: string, uids: Array<string> | undefined, ranks: Array<string> | undefined, total: number | undefined, top: number | undefined): void;
    /**
     * Gets called when high scores are returned after calling requestHighScores.
     * We highly recommend to read the High Score guide (developers.airconsole.com)
     * @param {Array<AirConsole~HighScore>} high_scores - The high scores.
     */
    onHighScores(high_scores: any): void;
    /**
     * DeviceState contains information about a device in this session.
     * Use the helper methods getUID, getNickname, getProfilePicture and
     * getCustomDeviceState to access this data.
     * @typedef {object} AirConsole~DeviceState
     * @property {string} uid - The globally unique ID of the user.
     * @property {string|undefined} custom - Custom device data that this API can set.
     * @property {string|undefined} nickname - The nickname of the user.
     * @property {boolean|undefined} slow_connection - If the user has a high server latency.
     * @property {AirConsoleScreenEnvironment} environment - The games multiplayer environment to let multiple games in the
     *                                                       same location play together. Only present for the screen device.
     */
    /**
     * HighScore contains information about a users high score
     * We highly recommend to read the High Score guide (developers.airconsole.com)
     * @typedef {object} AirConsole~HighScore
     * @property {String} level_name - The name of the level the user was playing
     * @property {String} level_version - The version of the level the user was
     *                                    playing
     * @property {number} score - The score the user has achieved
     * @property {String} score_string - A human readable version of score.
     * @property {Object} ranks - A dictionary of rank type to actual rank.
     * @property {mixed} data - Custom High Score data. Can be used to implement
     *                          Ghost modes or to verify that it is not a fake
     *                          high score.
     * @property {String} uids - The unique ID of the users that achieved the
     *                           high score.
     * @property {number} timestamp - The timestamp of the high score
     * @property {String} nicknames - The nicknames of the users
     * @property {String} relationship - How the user relates to the current user
     *                                 - "requested" (a user which was requested)
     *                                 - "airconsole" (played AirConsole together)
     *                                 - "facebook" (a facebook friend)
     *                                 - "other" (about same skill level)
     * @property {String} location_country_code - The iso3166 country code
     * @property {String} location_country_name - The name of the country
     * @property {String} location_region_code - The iso3166 region code
     * @property {String} location_region_name - The name of the region
     * @property {String} location_city_name - The name of the city
     * @property {String} share_url - The URL that should be used to share this
     *                                high score.
     * @property {String} share_image - The URL to an image that displays this
     *                                  high score.
     */
    /** ------------------------------------------------------------------------ *
     * @chapter                     TRANSLATIONS                                 *
     * @see       http://developers.airconsole.com/#!/guides/translations        *
     * ------------------------------------------------------------------------- */
    /**
     * Gets a translation for the users current language
     * See http://developers.airconsole.com/#!/guides/translations
     * @param {String} id - The id of the translation string.
     * @param {Object|undefined} values - Values that should be used for
     *                                    replacement in the translated string.
     *                                    E.g. if a translated string is
     *                                    "Hi %name%" and values is {"name": "Tom"}
     *                                    then this will be replaced to "Hi Tom".
     */
    getTranslation(id: string, values: any | undefined): any;
    /**
     * Returns the current IETF language tag of a device e.g. "en" or "en-US"
     * @param {number|undefined} device_id - The device id for which you want the
     *                                       language. Default is this device.
     * @return {String} IETF language
     */
    getLanguage(device_id: number | undefined): string;
    /** ------------------------------------------------------------------------ *
     * @chapter              ENVIRONMENT EVENTS                                  *
     * ------------------------------------------------------------------------- */
    /**
     * Gets called on the Screen when the game should be paused.
     * @abstract
     */
    onPause(): void;
    /**
     * Gets called on the Screen when the game should be resumed.
     * @abstract
     */
    onResume(): void;
    private getDefaultPlayerSilencing_;
    private init_;
    version: string;
    devices: any[];
    server_time_offset: number | boolean;
    silence_inactive_players: any;
    private isDeviceInSameLocation_;
    private deviceIsSilenced_;
    private onPostMessage_;
    private isLocationLoadedMessage_;
    private isLocationUnloadedMessage_;
    private getGameUrl_;
    private set_;
    private setupDocument_;
    private getLocationUrl_;
    private bindTouchFix_;
}
declare namespace AirConsole {
    let SCREEN: number;
    let ORIENTATION_PORTRAIT: string;
    let ORIENTATION_LANDSCAPE: string;
    /**
     * Posts a message to the parent window.
     * @private
     * @param {Object} data - the data to be sent to the parent window.
     */
    function postMessage_(data: any): void;
}
type ImmersiveLightOption = {
    /**
     * - The red value of the light. Format: integer between 0 and 255.
     */
    r: number;
    /**
     * - The green value of the light. Format: integer between 0 and 255.
     */
    g: number;
    /**
     * - The blue value of the light. Format: integer between 0 and 255.
     */
    b: number;
};
type ImmersiveOption = {
    /**
     * - Light state inside the car.
     */
    light?: ImmersiveLightOption;
    /**
     * - Experimental payload for experimental APIs
     */
    experiment?: any;
};
/**
 * The devices environment. Only available on the screen device.
 * Please visit the {@link https://developers.airconsole.com/#!/guides/multiplayer Multiplayer} guide to see how to use this from onDeviceStateChange or through airconsole.devices[AirConsole.SCREEN].environment.id
 */
type AirConsoleScreenEnvironment = {
    /**
     * - Identifier of the environment this screen is in. Where possible this is a specific physical
     *   location, like a specific car.
     */
    id: string;
    /**
     * - Identifier of the partner in the environment.
     */
    partner: string;
};
/**
 * The AirConsole Screen device data of relevance to game developers.
 */
type AirConsoleDevice = {
    /**
     * - The environment object this device is in. Only present on the screen.
     */
    environment?: AirConsoleScreenEnvironment;
};
/**
 * The AirConsole Screen device data of relevance to game developers.
 */
type AirConsoleObject = {
    /**
     * - List of devices in this session. Screen is always devices[AirConsole.SCREEN].
     */
    devices: Array<AirConsoleDevice>;
};
