# Version 1.4.1

- Direct links to individual posts now remain visible, including visits from X.com and other sites.
- Posts linking to the same destination now have independent reveal controls.
- “Hide filtered posts again” now also hides individually revealed posts.
- Failed keyword saves and resets now display an error and preserve your edits.

Filtering on listing pages retains its existing scope. No new permissions are requested.

## Validation

Four automated regression tests pass, and JavaScript syntax checks pass. Browser store review and interactive browser smoke testing are separate from these checks.

## Store release notes

Fixed individual posts disappearing after opening a direct link. Improved reveal controls and error reporting when saving settings. No new permissions.

## Submission checklist

- Upload the matching Chrome, Edge, and Firefox ZIPs to the existing store listings.
- Use the store release notes above wherever release notes or reviewer notes are supported.
- Clarify the listing description: “Filters linked-list entries while browsing Daring Fireball. Individual post pages opened directly always remain visible.”
- Smoke-test a matching listing entry, a direct linked-post URL, reveal/hide controls, and saved keyword settings in each browser.
- Keep the existing Firefox add-on ID when submitting updates. The packaged ID matches the previous GitHub release.
