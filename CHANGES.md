<!--
AirConsole
@copyright 2022 by N-Dream AG, Switzerland. All rights reserved.
-->
<!-- markdownlint-disable MD024 -->

# Releases

Release notes follow the [keep a changelog](https://keepachangelog.com/en/1.0.0/) format.

## [Unreleased]

### Game State Management

With version 1.9.0, AirConsole adds a consistent system to handle situations where players can not join in the middle of
an active session, limiting joining to the games player selection screen for example.
This is supported by the controller, informing new joining players that they can not join at the moment but can do so
after the current session.

- Added :gift_heart:: `AirConsole.prototype.arePlayersSilenced` to check if players are silenced.
- Added :gift_heart:: `silence_players` to AirConsole Opts, which when set will silence new players while
  setActivePlayers is in a
  state with 1 or more players.

## vx.y.z

> TBD

### TBD

- Changed :gift_heart::
- Added :sparkles::
- Deprecated :fire::
- Removed :wastebasket::
- Fixed :pill::
- Security :lock::