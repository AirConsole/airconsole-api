# Media Permission Flow

## Actors

**Game** calls `getUserMedia(constraints)` and consumes the returned Promise.

**API** is the AirConsole JS SDK running on the controller. It validates input, tracks pending state, talks to the platform, and bridges browser level failures back to the game.

**Platform** decides whether the permission flow should run through a browser prompt, resolve natively, deny with an error type, or return an error.

**Browser** is `navigator.mediaDevices.getUserMedia`, the final source of stream success or browser level failure.

## Sequence

```mermaid
sequenceDiagram
    autonumber
    actor Game
    participant API
    participant Platform
    participant Browser

    Game->>API: getUserMedia(constraints)
    alt Flow 1: early rejection
        Note over API: Validate caller and constraints
        Note over API: Reject early when device is SCREEN, device_id is undefined, mediaPermissionPending_ is true, or constraints are invalid
        API-->>Game: Promise rejects with AirConsoleUserMediaError
    else Request accepted
        Note over API: mediaPermissionCallbacks_.set(instance, { resolve, reject })
        Note over API: mediaPermissionPending_ = true
        Note over API: start 30s timeout
        API->>Platform: sendEvent_('requestUserMediaPermission', { constraints })

        alt Flow 2: platform sends promptUserMediaPermission
            Platform->>API: event promptUserMediaPermission
            API->>Browser: navigator.mediaDevices.getUserMedia(constraints)
            alt Browser succeeds
                Browser-->>API: stream
                API->>Platform: sendEvent_('userMediaPermissionGranted', { constraints })
                API-->>Game: Promise resolves with stream
            else Flow 4: browser rejects after promptUserMediaPermission
                Browser-->>API: DOMException error
                Note over API: cachedMediaError_ = error
                API->>Platform: sendEvent_('userMediaPermissionDenied', { errorType: error.name })
                Platform->>API: event userMediaPermissionDenied
                alt cachedMediaError_ is set
                    API->>API: rejectMediaPermission_(cachedMediaError_)
                    API-->>Game: Promise rejects with DOMException
                else no cached error
                    API->>API: rejectMediaPermission_(AirConsoleUserMediaError.permissionDenied)
                    API-->>Game: Promise rejects with AirConsoleUserMediaError
                end
                Note over API: cachedMediaError_ cleared in cleanUpMediaPermission_
            end

        else Flow 3: platform sends userMediaPermissionGranted
            Platform->>API: event userMediaPermissionGranted
            API->>Browser: navigator.mediaDevices.getUserMedia(constraints)
            alt Browser succeeds
                Browser-->>API: stream
                API->>Platform: sendEvent_('userMediaPermissionGranted', { constraints })
                API-->>Game: Promise resolves with stream
            else Flow 5: browser rejects after userMediaPermissionGranted
                Browser-->>API: error
                API->>API: rejectMediaPermission_(error)
                API-->>Game: Promise rejects with error
            end

        else Flow 6: platform denies
            Platform->>API: event userMediaPermissionDenied
            API->>API: rejectMediaPermission_(AirConsoleUserMediaError.permissionDenied)
            API-->>Game: Promise rejects with AirConsoleUserMediaError

        else Flow 7: timeout
            Note over API: 30s passes with no platform response
            API->>API: rejectMediaPermission_(AirConsoleUserMediaError.timeout)
            API-->>Game: Promise rejects with AirConsoleUserMediaError
        end

        Note over API: Guard stale messages with mediaPermissionPending_
    end

    rect rgba(230, 230, 255, 0.35)
        Note over Platform,Game: Flow 8: broadcast to other devices
        Platform->>API: device update with _is_userMediaPermission_update: true
        alt granted
            API-->>Game: onUserMediaAccessGranted(device_id)
        else denied
            API-->>Game: onUserMediaAccessDenied(device_id)
        end
    end
```

## Key Design Decisions

The Promise resolves with the `MediaStream` on success and rejects with an `Error` on failure. Early rejections (SCREEN device, not ready, already pending, invalid constraints) return `Promise.reject(createAirConsoleUserMediaError(...))` directly. Platform denials, timeouts, and browser failures all go through `rejectMediaPermission_`, which calls the stored `reject` callback and always rejects with a typed `AirConsoleUserMediaError` — except when a cached `DOMException` is present, which is passed through directly to preserve `instanceof` checks.

Browser prompt failures use a cache-and-echo pattern. When the browser rejects with a `DOMException`, the API stores the error in `cachedMediaError_` and sends `sendEvent_('userMediaPermissionDenied', { errorType: error.name })` to the platform. When the platform echoes back `userMediaPermissionDenied`, the API checks `cachedMediaError_`: if set, it calls `rejectMediaPermission_(cachedMediaError_)` to preserve `instanceof DOMException` for the game; if not set, it rejects with a generic `AirConsoleUserMediaError.permissionDenied`. `cachedMediaError_` is cleared in `cleanUpMediaPermission_`.

Callback storage lives in a `WeakMap`, which keeps resolve and reject handlers attached to the SDK instance without exposing them on public state.

The 30 second timeout is a safety net. It rejects with `AirConsoleUserMediaError.timeout` if the platform never answers.

`mediaPermissionPending_` blocks duplicate requests and ignores stale platform messages after cleanup.
