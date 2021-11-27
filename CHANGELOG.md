# PRISMA UI Changelog

## 1.8.1 (11 Oct, 2021)

This release improves UI by upgrading to material-ui version 4, fixes bugs and introduces few new features like filtering tracks on map, standalone notes, unassigning notes from incident and ability to add custom track icons.


## 1.8.1-rc1 (Aug 13, 2021)

This release improves UI by upgrading to material-ui version 4, fixes bugs and introduces few new features like filtering tracks on map, standalone notes, unassigning notes from incident and ability to add custom track icons.

* [NEW] Add track filtering for map [PR#122](https://github.com/mcmsar/prisma-ui/pull/122)
* [NEW] Add feature to create notes incident standalone [PR#123](https://github.com/mcmsar/prisma-ui/pull/123)
* [NEW] Add feature unassign note from incident [PR#121](https://github.com/mcmsar/prisma-ui/pull/121)
* [FIX] Fixed memory leak warning [PR#143](https://github.com/mcmsar/prisma-ui/pull/143)
* [FIX] Fixed password is too short user error message [PR#144](https://github.com/mcmsar/prisma-ui/pull/144)
* [NEW] Add feature to display custom icons for different tracks [PR#145](https://github.com/mcmsar/prisma-ui/pull/145)
* [NEW] Upgrade material-ui to version 4 [PR#147](https://github.com/mcmsar/prisma-ui/pull/147)
* [FIX] Fixed compareTimestamp method to enforce correct order for sorting log entries. [PR#159](https://github.com/mcmsar/prisma-ui/pull/159)

## 1.8.0 (Oct 19, 2020)

This is primarily a release for delivering RCC system for Qatar to replace legacy RCC.

* [NEW] Add formatter support for orbitography protocol. [PR#117](https://github.com/mcmsar/prisma-ui/pull/117)
* [NEW] Add VTS support. [PR#116](https://github.com/mcmsar/prisma-ui/pull/116)
* [NEW] Add SIT 915 support. [PR#115](https://github.com/mcmsar/prisma-ui/pull/115)
* [NEW] Reopen closed incident.[PR#114](https://github.com/mcmsar/prisma-ui/pull/114)
* [NEW] Add ads-b support. [PR#112](https://github.com/mcmsar/prisma-ui/pull/112)


## 1.8-rc2 (Oct 01, 2020)

This is primarily a release for delivering RCC system for Qatar to replace legacy RCC.

* [NEW] Add formatter support for orbitography protocol. [PR#117](https://github.com/mcmsar/prisma-ui/pull/117)
* [NEW] Add VTS support. [PR#116](https://github.com/mcmsar/prisma-ui/pull/116)
* [NEW] Add SIT 915 support. [PR#115](https://github.com/mcmsar/prisma-ui/pull/115)
* [NEW] Reopen closed incident.[PR#114](https://github.com/mcmsar/prisma-ui/pull/114)
* [NEW] Add ads-b support. [PR#112](https://github.com/mcmsar/prisma-ui/pull/112)


## 1.8-rc1 (Oct 01, 2020)

This is primarily a release for delivering RCC system for Qatar to replace legacy RCC.

* [NEW] Add formatter support for orbitography protocol. [PR#117](https://github.com/mcmsar/prisma-ui/pull/117)
* [NEW] Add VTS support. [PR#116](https://github.com/mcmsar/prisma-ui/pull/116)
* [NEW] Add SIT 915 support. [PR#115](https://github.com/mcmsar/prisma-ui/pull/115)
* [NEW] Reopen closed incident.[PR#114](https://github.com/mcmsar/prisma-ui/pull/114)
* [NEW] Add ads-b support. [PR#112](https://github.com/mcmsar/prisma-ui/pull/112)

## 1.7.7 (Jan 29, 2020)

This is primarily a release for delivering couple new features to Singapore RCC.

* [NEW] On Hover Beacon Summary show: beacon lat/lon, incident time, first time detection. [PR#98](https://github.com/mcmsar/prisma-ui/pull/98)
* [NEW] Add export of incident to CSV file. [PR#99](https://github.com/mcmsar/prisma-ui/pull/99)
* [FIX] Fix profile edit page by copying out event values. [PR#100](https://github.com/mcmsar/prisma-ui/pull/100)
* [NEW] Add manual track FAB, and create/edit manual track panel. [PR#101](https://github.com/mcmsar/prisma-ui/pull/101)
* [FIX] Change info and tooltip lookups for historical points to use the 'new' old endpoint. [PR#103](https://github.com/mcmsar/prisma-ui/pull/103)


## 1.7.6 (May 24, 2019)

This is primarily a technical debt release which includes many dependency updates, documentation changes, and build system updates. This release is not intended to be released to customers. 

## prisma-workspace

* [NEW] Codebase moved to it's own repository, `orolia/prisma-ui`. [PR-21](https://github.com/orolia/prisma-ui/pull/21)
* [NEW] Added codecoverage to CI [PR #33](https://github.com/orolia/prisma-ui/pull/33)
* [NEW] Added prettier config [PR #36](https://github.com/orolia/prisma-ui/pull/36)
* [NEW] Added codebuild status badge to README [PR #61](https://github.com/orolia/prisma-ui/pull/61)
* [NEW] Added docker images for non release builds and release builds [PR #64](https://github.com/orolia/prisma-ui/pull/64)
* [NEW] Added browserslistrc config for browser compatibility [PR #64](https://github.com/orolia/prisma-ui/pull/64)
* [NEW] Storybooks are deployed on every push to develop, master, and every git tag release. [PR #64](https://github.com/orolia/prisma-ui/pull/64)
* [NEW] Docs site is now deployed on every release, master, develop build. [PR #77](https://github.com/orolia/prisma-ui/pull/77)
* [CHG] Addressed some technical debt by removing unused code and extraneous dependencies. [PR #48](https://github.com/orolia/prisma-ui/pull/48), [PR #59](https://github.com/orolia/prisma-ui/pull/59), [PR #64](https://github.com/orolia/prisma-ui/pull/64)
* [CHG] Upgraded all the dependencies, linter updates. [PR #36](https://github.com/orolia/prisma-ui/pull/36), [PR #37](https://github.com/orolia/prisma-ui/pull/37), [PR #38](https://github.com/orolia/prisma-ui/pull/38), [PR #58](https://github.com/orolia/prisma-ui/pull/58)
    - Latest @material-ui [PR #41](https://github.com/orolia/prisma-ui/pull/41)
    - Latest React including hooks support
    - Latest Redux [PR #43](https://github.com/orolia/prisma-ui/pull/43)
    - Latest RxJS and redux-observable [PR #45](https://github.com/orolia/prisma-ui/pull/45)
    - Latest storybook v5 [PR #46](https://github.com/orolia/prisma-ui/pull/46)
    - and much more.
* [CHG] Better mono repo support including running commands at the top level, root babel config, root eslint config, and single jest run for all tests from root directory. [PR #60](https://github.com/orolia/prisma-ui/pull/60), [PR #64](https://github.com/orolia/prisma-ui/pull/64), [PR #65](https://github.com/orolia/prisma-ui/pull/65)
* [CHG] Consolidated and added new builds in AWS so every push to develop, master, tag, and Pull Requests run builds. [PR #62](https://github.com/orolia/prisma-ui/pull/62), [PR #63](https://github.com/orolia/prisma-ui/pull/63), [PR #64](https://github.com/orolia/prisma-ui/pull/64)
* [CHG] Updated documentation and fixed links to postman, storybooks, and PRISMA backend documentation. [PR #77](https://github.com/orolia/prisma-ui/pull/77), [PR #78](https://github.com/orolia/prisma-ui/pull/78)
* [RM] Removed `@prisma/protobuf` package [PR #29](https://github.com/orolia/prisma-ui/pull/29)
* [RM] Removed chai, sinon and mocha and switched entirely to jest. [PR #40](https://github.com/orolia/prisma-ui/pull/40)

### prisma-electron

* [NEW] You can now use URLs for map servers from sources other than open streetmap, including urls that contain custom access keys like maptiler.com. [PR #32](https://github.com/orolia/prisma-ui/pull/32)
* [NEW] Added ErrorBanner to InfoPanel incidents section [PR #51](https://github.com/orolia/prisma-ui/pull/51)
* [NEW] Added stories for LogEntryExpansionPanel and VesselExpansionPanelSummary [PR #72](https://github.com/orolia/prisma-ui/pull/72)
* [NEW] Added stories for PriorityAlertsList and PriorityAlertsListItem [PR #74](https://github.com/orolia/prisma-ui/pull/74)
* [NEW] Default map is now Positron from our paid MapTiler account. [PR #73](https://github.com/orolia/prisma-ui/pull/73)
* [NEW] PriorityAlertsList can now be collapsed and expanded to make room for other content. [PR #76](https://github.com/orolia/prisma-ui/pull/76)
* [CHG] Incidents List Panel now defaults to showing only `Opened` incidents instead of all [PR #35](https://github.com/orolia/prisma-ui/pull/35)
* [CHG] Background color on load now matches login page background color [PR #48](https://github.com/orolia/prisma-ui/pull/48)
* [CHG] Updated text for some audit log messages [PR #52](https://github.com/orolia/prisma-ui/pull/52)
* [CHG] Changed how PriorityAlertsList is opened and closed by removing TopDrawer and letting the component handle it's own open/closed based on notices. [PR #74](https://github.com/orolia/prisma-ui/pull/74)
* [FIX] Audit log moved to left side. [PR #71](https://github.com/orolia/prisma-ui/pull/71)
* [FIX] Tests for age formatter now don't randomly fail. [PR #72](https://github.com/orolia/prisma-ui/pull/72)
* [FIX] PriorityAlertsList now correctly shows 1 row when there is only 1 alert, and 2 rows if there are 2 or more alerts. [PR #74](https://github.com/orolia/prisma-ui/pull/74)
* [FIX] PriorityAlertsList now properly shows update time of the alert and not current time. [PR #74](https://github.com/orolia/prisma-ui/pull/74)
* [FIX] On smaller screens, PriorityAlertsList now leaves room for collapsed NavBar. [PR #74](https://github.com/orolia/prisma-ui/pull/74)
* [FIX] Group By button in Incident Details is no longer cutoff by shadow. [PR #73](https://github.com/orolia/prisma-ui/pull/73)
* [FIX] Login page possibly showing twice (cherry pick from @next) [PR #42](https://github.com/orolia/prisma-ui/pull/42)
* [FIX] Console error regarding transition property that's deprecated being used. [PR #44](https://github.com/orolia/prisma-ui/pull/44)
* [FIX] Fixed undefined fleet name errors in fleet management [PR 50](https://github.com/orolia/prisma-ui/pull/50)
* [FIX] UserEditPage now shows progress indicator and no longer throws console warnings [PR #53](https://github.com/orolia/prisma-ui/pull/53)
* [FIX] Empty crew on a vessel no longer cannot be removed once created [PR #54](https://github.com/orolia/prisma-ui/pull/54)
* [FIX] Fixed an issue where incidents couldn't be created because the dropdown would not select an item [PR #57](https://github.com/orolia/prisma-ui/pull/57)
* [FIX] Fixed issues where vessels were not reloaded during edit/create [PR #56](https://github.com/orolia/prisma-ui/pull/56)
* [RM] TopDrawer has been removed. [PR #74](https://github.com/orolia/prisma-ui/pull/74)

### @prisma-map

* [NEW] Pulled entire map package from @next [PR #49](https://github.com/orolia/prisma-ui/pull/49)

### @prisma-ui

* [NEW] Pulled entire ui package from @next [PR #49](https://github.com/orolia/prisma-ui/pull/49)


## 1.7.6 Release Candidate 2 (May 22, 2019)

* [NEW] Docs site is now deployed on every release, master, develop build. [PR #77](https://github.com/orolia/prisma-ui/pull/77)
* [CHG] Added MkDocs to build docker container [PR #77](https://github.com/orolia/prisma-ui/pull/77)
* [CHG] Updated documentation and fixed links to postman, storybooks, and PRISMA backend documentation. [PR #77](https://github.com/orolia/prisma-ui/pull/77), [PR #78](https://github.com/orolia/prisma-ui/pull/78)
* [FIX] `build:application:production` now calls correct production webpack config file. [PR #70](https://github.com/orolia/prisma-ui/pull/70)
* [FIX] VSCode now correctly reads top level eslint and linting works throughout the project. [PR #72](https://github.com/orolia/prisma-ui/pull/72)

### prisma-electron

* [NEW] Added stories for LogEntryExpansionPanel and VesselExpansionPanelSummary [PR #72](https://github.com/orolia/prisma-ui/pull/72)
* [NEW] Added stories for PriorityAlertsList and PriorityAlertsListItem [PR #74](https://github.com/orolia/prisma-ui/pull/74)
* [NEW] Default map is now Positron from our paid MapTiler account. [PR #73](https://github.com/orolia/prisma-ui/pull/73)
* [NEW] PriorityAlertsList can now be collapsed and expanded to make room for other content. [PR #76](https://github.com/orolia/prisma-ui/pull/76)
* [CHG] Changed how PriorityAlertsList is opened and closed by removing TopDrawer and letting the component handle it's own open/closed based on notices. [PR #74](https://github.com/orolia/prisma-ui/pull/74)
* [FIX] Audit log moved to left side. [PR #71](https://github.com/orolia/prisma-ui/pull/71)
* [FIX] Expansion Panel Icons are now centered correctly. [PR #72](https://github.com/orolia/prisma-ui/pull/72)
* [FIX] Edit icon in ListAlertsPanel now is correctly spaced. [PR #72](https://github.com/orolia/prisma-ui/pull/72)
* [FIX] Tests for age formatter now don't randomly fail. [PR #72](https://github.com/orolia/prisma-ui/pull/72)
* [FIX] PriorityAlertsList now correctly shows 1 row when there is only 1 alert, and 2 rows if there are 2 or more alerts. [PR #74](https://github.com/orolia/prisma-ui/pull/74)
* [FIX] PriorityAlertsList now properly shows update time of the alert and not current time. [PR #74](https://github.com/orolia/prisma-ui/pull/74)
* [FIX] On smaller screens, PriorityAlertsList now leaves room for collapsed NavBar. [PR #74](https://github.com/orolia/prisma-ui/pull/74)
* [FIX] Group By button in Incident Details is no longer cutoff by shadow. [PR #73](https://github.com/orolia/prisma-ui/pull/73)
* [RM] TopDrawer has been removed. [PR #74](https://github.com/orolia/prisma-ui/pull/74)



## 1.7.6 Release Candidate 1 (May 13, 2019)

* [NEW] Codebase moved to it's own repository, `orolia/prisma-ui`. [PR-21](https://github.com/orolia/prisma-ui/pull/21)
* [NEW] Added codecoverage to CI [PR #33](https://github.com/orolia/prisma-ui/pull/33)
* [NEW] Added prettier config [PR #36](https://github.com/orolia/prisma-ui/pull/36)
* [NEW] Added codebuild status badge to README [PR #61](https://github.com/orolia/prisma-ui/pull/61)
* [NEW] Added docker images for non release builds and release builds [PR #64](https://github.com/orolia/prisma-ui/pull/64)
* [NEW] Added browserslistrc config for browser compatibility [PR #64](https://github.com/orolia/prisma-ui/pull/64)
* [NEW] Storybooks are deployed on every push to develop, master, and every git tag release. [PR #64](https://github.com/orolia/prisma-ui/pull/64)
* [CHG] Addressed some technical debt by removing unused code and extraneous dependencies. [PR #48](https://github.com/orolia/prisma-ui/pull/48), [PR #59](https://github.com/orolia/prisma-ui/pull/59), [PR #64](https://github.com/orolia/prisma-ui/pull/64)
* [CHG] Upgraded all the dependencies, linter updates. [PR #36](https://github.com/orolia/prisma-ui/pull/36), [PR #37](https://github.com/orolia/prisma-ui/pull/37), [PR #38](https://github.com/orolia/prisma-ui/pull/38), [PR #58](https://github.com/orolia/prisma-ui/pull/58)
    - Latest @material-ui [PR #41](https://github.com/orolia/prisma-ui/pull/41)
    - Latest React including hooks support
    - Latest Redux [PR #43](https://github.com/orolia/prisma-ui/pull/43)
    - Latest RxJS and redux-observable [PR #45](https://github.com/orolia/prisma-ui/pull/45)
    - Latest storybook v5 [PR #46](https://github.com/orolia/prisma-ui/pull/46)
    - and much more.
* [CHG] Better mono repo support including running commands at the top level, root babel config, root eslint config, and single jest run for all tests from root directory. [PR #60](https://github.com/orolia/prisma-ui/pull/60), [PR #64](https://github.com/orolia/prisma-ui/pull/64), [PR #65](https://github.com/orolia/prisma-ui/pull/65)
* [CHG] Consolidated and added new builds in AWS so every push to develop, master, tag, and Pull Requests run builds. [PR #62](https://github.com/orolia/prisma-ui/pull/62), [PR #63](https://github.com/orolia/prisma-ui/pull/63), [PR #64](https://github.com/orolia/prisma-ui/pull/64)
* [RM] Removed `@prisma/protobuf` package [PR #29](https://github.com/orolia/prisma-ui/pull/29)
* [RM] Removed chai, sinon and mocha and switched entirely to jest. [PR #40](https://github.com/orolia/prisma-ui/pull/40)

### prisma-electron

* [NEW] You can now use URLs for map servers from sources other than open streetmap, including urls that contain custom access keys like maptiler.com. [PR #32](https://github.com/orolia/prisma-ui/pull/32)
* [NEW] Added ErrorBanner to InfoPanel incidents section [PR #51](https://github.com/orolia/prisma-ui/pull/51)
* [CHG] Incidents List Panel now defaults to showing only `Opened` incidents instead of all [PR #35](https://github.com/orolia/prisma-ui/pull/35)
* [CHG] Background color on load now matches login page background color [PR #48](https://github.com/orolia/prisma-ui/pull/48)
* [CHG] Updated text for some audit log messages [PR #52](https://github.com/orolia/prisma-ui/pull/52)
* [FIX] Login page possibly showing twice (cherry pick from @next) [PR #42](https://github.com/orolia/prisma-ui/pull/42)
* [FIX] Console error regarding transition property that's deprecated being used. [PR #44](https://github.com/orolia/prisma-ui/pull/44)
* [FIX] Fixed undefined fleet name errors in fleet management [PR 50](https://github.com/orolia/prisma-ui/pull/50)
* [FIX] UserEditPage now shows progress indicator and no longer throws console warnings [PR #53](https://github.com/orolia/prisma-ui/pull/53)
* [FIX] Empty crew on a vessel no longer cannot be removed once created [PR #54](https://github.com/orolia/prisma-ui/pull/54)
* [FIX] Fixed an issue where incidents couldn't be created because the dropdown would not select an item [PR #57](https://github.com/orolia/prisma-ui/pull/57)
* [FIX] Fixed issues where vessels were not reloaded during edit/create [PR #56](https://github.com/orolia/prisma-ui/pull/56)

### @prisma-map

* [NEW] Pulled entire map package from @next [PR #49](https://github.com/orolia/prisma-ui/pull/49)

### @prisma-ui

* [NEW] Pulled entire ui package from @next [PR #49](https://github.com/orolia/prisma-ui/pull/49)

## 1.7.5

The 1.7.5 release contains changes and fixes found in the Singapore SAT that occured the week of 11 February 2019.

* [NEW] UTC time for timeReceived and updateTime are now displayed in the info panel for SARSAT beacons. [#1]( https://github.com/orolia/prisma-ui/pull/1)
* [CHG] None is now No History in DropDown. [#1]( https://github.com/orolia/prisma-ui/pull/1)
* [FIX] beaconId is now properly displayed. [#1]( https://github.com/orolia/prisma-ui/pull/1)
* [FIX] Incidents are now synced between all client instances. [#1]( https://github.com/orolia/prisma-ui/pull/1)

## 1.7.4

* [CHG] Icon has been changed for Windows Desktop and installed client to be the proper PRISMA icon not the old MCC icon. [PR-587](https://gitlab.com/orolia/prisma/merge_requests/587)

## 1.7.4-rc2

* [CHG] Icon has been changed for Windows Desktop and installed client to be the proper PRISMA icon not the old MCC icon. [PR-587](https://gitlab.com/orolia/prisma/merge_requests/587)

## 1.7.4-rc1

No changes were made to the PRISMA client in this release.

## 1.7.3

* [FIX] Fixed issue where incident attachments would not download. [PR-582](https://gitlab.com/orolia/prisma/merge_requests/582)
* [FIX] Build issues related to deprecation of canvas-prebuilt package. [PR-584](https://gitlab.com/orolia/prisma/merge_requests/584)

## 1.7.3-rc2

* [FIX] Build issues related to deprecation of canvas-prebuilt package. [PR-584](https://gitlab.com/orolia/prisma/merge_requests/584)

## 1.7.3-rc1

* [FIX] Fixed issue where incident attachments would not download. [PR-582](https://gitlab.com/orolia/prisma/merge_requests/582)

## 1.7.2

This release fixes a crashing bug that could cause the client to be completely usable for a system
until the system was reinstalled.

* [NEW] When SARSAT message could not be parsed by the backend, the frontend will now display a section showing the original message body so the user can get whatever information is available from the MCC. [PR-561](https://gitlab.com/orolia/prisma/merge_requests/561)
* [FIX] Application no longer crashes with hexId of undefined error. [PR-561](https://gitlab.com/orolia/prisma/merge_requests/561)

## 1.7.2-rc2

No changes were made to the PRISMA client in this release.

## 1.7.2-rc1

* [NEW] When SARSAT message could not be parsed by the backend, the frontend will now display a section showing the original message body so the user can get whatever information is available from the MCC. [PR-561](https://gitlab.com/orolia/prisma/merge_requests/561)
* [FIX] Application no longer crashes with hexId of undefined error. [PR-561](https://gitlab.com/orolia/prisma/merge_requests/561)

## 1.7.1

This release brings bug fixes and improvements to Incident Transfer, Login Page, and fixes various crashes throughout the application.

* [NEW] Failed Incident Transfers now show a log entry on the incident details page explaining that the transfer failed and another entry marking the incident as re-opened. [PR 523](https://gitlab.com/orolia/prisma/merge_requests/523)
* [NEW] When SSL certificates are invalid, the electron instance will not log an error message so its easier to determine the issue is related to SSL certificates. [PR 482](https://gitlab.com/orolia/prisma/merge_requests/482)
* [CHG] Exported geofences now add radius and linked track id to the GeoJSON properties object. [PR 493](https://gitlab.com/orolia/prisma/merge_requests/493)
* [FIX] Version is now displayed correctly on the Login Page. When git branch or date are not found in the config, they will not be shown anymore as hanging `/` [PR 524](https://gitlab.com/orolia/prisma/merge_requests/524)
* [FIX] When security policy is empty it will no longer be displayed on the login page. [PR 524](https://gitlab.com/orolia/prisma/merge_requests/524)
* [FIX] Fixed avatar circle color contrast in Profile drawer that was hard to see on certain monitors. [PR 511](https://gitlab.com/orolia/prisma/merge_requests/511), [PR 512](https://gitlab.com/orolia/prisma/merge_requests/512)
* [FIX] Removed the + icon from the Cancel button when selecting Zones to export. [PR 509](https://gitlab.com/orolia/prisma/merge_requests/509)
* [FIX] Creating an empty vessel will no longer cause an error. [PR 497](https://gitlab.com/orolia/prisma/merge_requests/497)
* [FIX] Hover over alerts in the High Priority Alerts bar will now properly show a pointer mouse cursor to indicate that the row is clickable. [PR 510](https://gitlab.com/orolia/prisma/merge_requests/510)
* [FIX] Fixed some crashing bugs around Excluding Vessels in Zones Edit/Create [PR 505](https://gitlab.com/orolia/prisma/merge_requests/505)
* [FIX] Geofence edit panel no longer crashes application under certain conditions. [PR 492](https://gitlab.com/orolia/prisma/merge_requests/492), [PR 494](https://gitlab.com/orolia/prisma/merge_requests/494)
* [FIX] Incidents assigned to a removed user can now reassign the incident. [PR 496](https://gitlab.com/orolia/prisma/merge_requests/496)
* [FIX] Prevent log entries with the same name from crashing incident forward progress card. [PR 499](https://gitlab.com/orolia/prisma/merge_requests/499)
* [FIX] Completed log entry with pending packets no longer crashes application. [PR 501](https://gitlab.com/orolia/prisma/merge_requests/501)
* [FIX] flyTo no longer crashes the app when there is no valid position data. [PR 483](https://gitlab.com/orolia/prisma/merge_requests/483)
* [FIX] Device sidebar opened from info panel now has go back button instead of closing entire panel [PR 452](https://gitlab.com/orolia/prisma/merge_requests/452)

## 1.7.1-rc7

* [FIX] App no longer crashes on load when policy object is undefined. [PR 530](https://gitlab.com/orolia/prisma/merge_requests/530)

## 1.7.1-rc6

* [NEW] Failed Incident Transfers now show a log entry on the incident details page explaining that the transfer failed and another entry marking the incident as re-opened. [PR 523](https://gitlab.com/orolia/prisma/merge_requests/523)
* [FIX] Version is now displayed correctly on the Login Page. When git branch or date are not found in the config, they will not be shown anymore as hanging `/` [PR 524](https://gitlab.com/orolia/prisma/merge_requests/524)
* [FIX] When security policy is empty it will no longer be displayed on the login page. [PR 524](https://gitlab.com/orolia/prisma/merge_requests/524)
* [FIX] Fixed avatar circle color contrast in Profile drawer that was hard to see on certain monitors. [PR 511](https://gitlab.com/orolia/prisma/merge_requests/511), [PR 512](https://gitlab.com/orolia/prisma/merge_requests/512)
* [FIX] Removed the + icon from the Cancel button when selecting Zones to export. [PR 509](https://gitlab.com/orolia/prisma/merge_requests/509)
* [FIX] Creating an empty vessel will no longer cause an error. [PR 497](https://gitlab.com/orolia/prisma/merge_requests/497)
* [FIX] Hover over alerts in the High Priority Alerts bar will now properly show a pointer mouse cursor to indicate that the row is clickable. [PR 510](https://gitlab.com/orolia/prisma/merge_requests/510)
* [FIX] Fixed some crashing bugs around Excluding Vessels in Zones Edit/Create [PR 505](https://gitlab.com/orolia/prisma/merge_requests/505)

## 1.7.1-rc5

No changes were made to the PRISMA client in this release.

## 1.7.1-rc4

No changes were made to the PRISMA client in this release.

## 1.7.1-rc3

* [CHG] Exported geofences now add radius and linked track id to the GeoJSON properties object. [PR 493](https://gitlab.com/orolia/prisma/merge_requests/493)
* [FIX] Geofence edit panel no longer crashes application under certain conditions. [PR 492](https://gitlab.com/orolia/prisma/merge_requests/492), [PR 494](https://gitlab.com/orolia/prisma/merge_requests/494)
* [FIX] Incidents assigned to a removed user can now reassign the incident. [PR 496](https://gitlab.com/orolia/prisma/merge_requests/496)
* [FIX] Prevent log entries with the same name from crashing incident forward progress card. [PR 499](https://gitlab.com/orolia/prisma/merge_requests/499)
* [FIX] Completed log entry with pending packets no longer crashes application. [PR 501](https://gitlab.com/orolia/prisma/merge_requests/501)

## 1.7.1-rc2

* [NEW] When SSL certificates are invalid, the electron instance will not log an error message so its easier to determine the issue is related to SSL certificates. [PR 482](https://gitlab.com/orolia/prisma/merge_requests/482)
* [FIX] flyTo no longer crashes the app when there is no valid position data. [PR 483](https://gitlab.com/orolia/prisma/merge_requests/483)

## 1.7.1-rc1

* [FIX] Device sidebar opened from info panel now has go back button instead of closing entire panel [PR 452](https://gitlab.com/orolia/prisma/merge_requests/452)

## 1.7.0

* [NEW] OmniCom devices can now have their Position Reporting Interval Changed [PR 382](https://gitlab.com/orolia/prisma/merge_requests/382)
* [NEW] OmniCom devices can now have their last position requested from the beacon. [PR 405](https://gitlab.com/orolia/prisma/merge_requests/405)
* [NEW] Added support to view OmniCom configuration [PR 403](https://gitlab.com/orolia/prisma/merge_requests/403)
* [NEW] Device registration and vessel attaching now offers autocomplete dropdown with devices already registered in the system. [PR 397](https://gitlab.com/orolia/prisma/merge_requests/397)
* [NEW] Added ability to edit a zones coordinates directly. [PR 395](https://gitlab.com/orolia/prisma/merge_requests/395)
* [NEW] Added additional images for SART and SARSAT devices. [PR 444](https://gitlab.com/orolia/prisma/merge_requests/444)
* [NEW] Added show/hide spidertracks button. [PR 445](https://gitlab.com/orolia/prisma/merge_requests/445)

* [CHG] Upgraded to Material UI version 1.0.0 [PR 376](https://gitlab.com/orolia/prisma/merge_requests/376)
* [CHG] Upgraded to React 16.3 [PR 378](https://gitlab.com/orolia/prisma/merge_requests/378)
* [CHG] Moved the client packages to yarn [PR 383](https://gitlab.com/orolia/prisma/merge_requests/383)
* [CHG] Switched testing to Jest. Mocha and Sinon are still used in `prisma-electron` but all new code will use Jest from now on. [PR 383](https://gitlab.com/orolia/prisma/merge_requests/383)
* [CHG] Restructured the repo by moving the client from `prisma/c2` to `prisma/client` and added new packages for `@prisma/map` and `@prisma/ui` that are placeholders for future versions. [PR 385](https://gitlab.com/orolia/prisma/merge_requests/385)
* [CHG] An error is now shown when FlyTo button is pressed on a feature that cannot be flown to. [PR 442](https://gitlab.com/orolia/prisma/merge_requests/442)

* [FIX] Local configuration specifiying remote server to grab full configuration is now acknowledged. [PR 377](https://gitlab.com/orolia/prisma/merge_requests/377)
* [FIX] Fixed a bug where clicking on a map feature with some missing data would crash the application. [PR 396](https://gitlab.com/orolia/prisma/merge_requests/396)
* [FIX] Incorrect port number for default configuration fetching. [PR 398](https://gitlab.com/orolia/prisma/merge_requests/398)
* [FIX] Fixed text overflow in Hover Tooltips [PR 429](https://gitlab.com/orolia/prisma/merge_requests/429)
* [FIX] User is now prompted to change password on first login. [PR 433](https://gitlab.com/orolia/prisma/merge_requests/433)
* [FIX] Users with no first names no longer display undefined. [PR 438](https://gitlab.com/orolia/prisma/merge_requests/438)
* [FIX] Long zones names no longer overflow the drawer. [PR 434](https://gitlab.com/orolia/prisma/merge_requests/434)

## 1.6.0

* [NEW] Incident Transfer. Incidents can now be sent to another site.
* [CHG] Search object has moved to the log entries section of the incident page and only 1 can be added.
* [CHG] All log entries for an incident can now have notes attached to them.
* [CHG] UI tweaks and updates to the Incident Details Page.

## 1.5.0-1

No changes were made to the PRISMA client in this release.

## 1.5.0

* [NEW] Fleet Management. Create fleets, vessels, and add devices to vessels.
* [NEW] OmniComVMS registration to a vessel and ability to set the reporting interval.
* [NEW] Maps base layer can now be configured in the client configuration file. [PC2-28](https://mcmurdo.atlassian.net/browse/PC2-28)
* [NEW] Added endpoint for SARMAP to retrieve incident details from PRISMA RCC [PC2-54](https://mcmurdo.atlassian.net/browse/PC2-54)
* [NEW] Added a new 1 click Windows installer to install the client.

## 1.4.0

* [NEW] Brand new Look and Feel. The entire application has been re-designed.
* [NEW] Incident Management.
