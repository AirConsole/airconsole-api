# Media Permission Flow

## Actors

**Game** calls `getUserMedia(constraints)` and consumes the returned Promise.

**API** is the AirConsole JS SDK running on the controller. It validates input, tracks pending state, talks to the platform, and bridges browser level failures back to the game.

**Platform** decides whether the permission flow should run through a browser prompt, resolve natively, deny with a reason, or return an error.

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
        Note over API: Reject early when device is SCREEN, device_id is undefined, media_permission_pending_ is true, or constraints are invalid
        API-->>Game: resolve({ success: false, error })
    else Request accepted
        Note over API: mediaPermissionCallbacks_.set(instance, { resolve, reject })
        Note over API: media_permission_pending_ = true
        Note over API: start 30s timeout
        API->>Platform: sendEvent_('requestUserMediaPermission', { constraints })

        alt Flow 2: platform sends promptUserMediaPermission
            Platform->>API: event promptUserMediaPermission
            API->>Browser: navigator.mediaDevices.getUserMedia(constraints)
            alt Browser succeeds
                Browser-->>API: stream
                API->>Platform: sendEvent_('userMediaPermissionGranted', { constraints })
                API-->>Game: resolve({ success: true, stream })
            else Flow 4: browser rejects after promptUserMediaPermission
                Browser-->>API: error
                API->>Platform: sendEvent_('userMediaPermissionDenied', { userPromptDuration, error })
                Platform->>API: event userMediaPermissionDenied with data: { error }
                API->>API: rejectMediaPermission_(error)
                API-->>Game: Promise rejects with error
            end

        else Flow 3: platform sends userMediaPermissionGranted
            Platform->>API: event userMediaPermissionGranted
            API->>Browser: navigator.mediaDevices.getUserMedia(constraints)
            alt Browser succeeds
                Browser-->>API: stream
                API->>Platform: sendEvent_('userMediaPermissionGranted', { constraints })
                API-->>Game: resolve({ success: true, stream })
            else Flow 5: browser rejects after userMediaPermissionGranted
                Browser-->>API: error
                API-->>Game: resolve({ success: false, error })
            end

        else Flow 6: platform denies with reason
            Platform->>API: event userMediaPermissionDenied with data: { reason: 'temporary'|'permanent' }
            API-->>Game: resolve({ success: false, reason })

        else Flow 7: platform sends error directly
            Platform->>API: event userMediaPermissionDenied with data: { error }
            API->>API: rejectMediaPermission_(error)
            API-->>Game: Promise rejects with error

        else Flow 8: timeout
            Note over API: 30s passes with no platform response
            API-->>Game: resolve({ success: false, error: 'timeout' })
        end

        Note over API: Guard stale messages with media_permission_pending_
    end

    rect rgba(230, 230, 255, 0.35)
        Note over Platform,Game: Flow 9: broadcast to other devices
        Platform->>API: device update with _is_userMediaPermission_update: true
        alt granted
            API-->>Game: onUserMediaAccessGranted(device_id, constraints)
        else denied
            API-->>Game: onUserMediaAccessDenied(device_id, reason)
        end
    end
```

## Key Design Decisions

Platform denials resolve the Promise with `{ success: false, ... }`. Browser failures use Promise rejection when the platform echoes a browser error back through `userMediaPermissionDenied`, but native controller browser failures after `userMediaPermissionGranted` resolve with `{ success: false, error }` instead.

Browser prompt failures use a platform echo pattern. The API sends `sendEvent_('userMediaPermissionDenied', { userPromptDuration, error })`, waits for the platform to echo `userMediaPermissionDenied` with `data: { error }`, then calls `rejectMediaPermission_(error)`.

Callback storage lives in a `WeakMap`, which keeps resolve and reject handlers attached to the SDK instance without exposing them on public state.

The 30 second timeout is a safety net. It resolves `{ success: false, error: 'timeout' }` if the platform never answers.

`media_permission_pending_` blocks duplicate requests and ignores stale platform messages after cleanup.
