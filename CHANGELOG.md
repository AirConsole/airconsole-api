<!--
AirConsole
@copyright 2024 by N-Dream AG, Switzerland. All rights reserved.
-->
<!-- markdownlint-disable MD024 -->

# Releases

Release notes follow the [keep a changelog](https://keepachangelog.com/en/1.0.0/) format.

## [Unreleased]

### Added

- New `AirConsole.setAudioInputDevices(devices, activeDeviceId)` for controllers to report their audio inputs and the
  device the current microphone stream uses.
- New `AirConsole.onAudioInputDeviceChange(device_id)` callback, called when the player picked a different microphone on
  the platform. The game closes its current stream and opens a new one on the given device.
  - Together these let the platform offer a different microphone instead of pausing when opening the microphone takes
    the audio focus away, e.g. a phone controller connected to a car capturing through the car's Bluetooth microphone.
- `getUserMedia` now also informs the platform that a microphone was requested, which the platform correlates with the
  audio focus it loses.

## [1.11.0] - 2026-07-07

### Added 

- Added `AirConsole.getGameConfiguration()` to expose the platform capability gameConfiguration from the `ready` event on screens.
- New `AirConsole.getUserMedia` API for requesting access to the microphone on the controller.
  - Matches the browser's `getUserMedia` API on the controller.
  - As per 1.11.0, only the `audio` constraint is supported
  - The support is consistent for browser based controllers as well as the native AirConsole controller for Android and iOS.
  - The API is designed to be future proof, allowing for the addition of video support in the future without breaking changes.
- Added `ARCHITECTURE.md` with mermaid sequence diagram documenting the full media permission flow.

## [1.10.0] - 2026-02-17

### Added

- Added support for haptics vibration patterns on the controller using the AirConsole.vibrate function.
- Add rendering support for Unity Android games on Android Automotive.

## [1.9.0]

With version 1.9.0, AirConsole adds a consistent system to handle situations where players can not join in the middle of
an active session, limiting joining to the games player selection screen for example.
This is supported by the controller, informing new joining players that they can not join at the moment but can do so
after the current gameplay round has finished.
Gameplay rounds are controlled through AirConsole's setActivePlayers API.

### Added

- Added :gift_heart:: New capability: Player Silencing [see Handling Players connecting guide]](<https://developers.airconsole.com/#!/guides/player_silencing>)
  - function `arePlayersSilenced` to check if players are silenced.
  - `silence_inactive_players` to AirConsole Opts, which when set will silence new players while
    setActivePlayers is in a state with 1 or more players.
- Added :gift_heart:: Immersive State API to create immersive experiences in cars.
  - New function `setImmersiveState` to control the immersive environment through a platform agnostic, best effort API.
- Added :gift_heart:: Partner specific highscore
  - New rank `partner` for `requestHighScores` that will limit the response to highscores the player has achieve on the same partner. See the [partner specific high score section of the high score guide](https://developers.airconsole.com/#!/guides/highscore#partner)
- Added :gift_heart:: Multi-screen multiplayer API [see Multi-screen multiplayer guide](https://developers.airconsole.com/#!/guides/multiplayer)
  - provides information to enable online multiplayer matchmaking against screens in the same car as well screens in the same type of partner environment (e.g. car brand).

### Changed

- storePersistentData's uid parameter is no longer optional for screens.
- requestPersistentData's uids parameter is no longer optional for screens.
