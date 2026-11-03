# Destiny item progression signals

Research snapshot: 2026-11-03. This is a source review for designing a compact, objective item-quality signal without retaining weapon perk rolls.

## What Bungie's API exposes

- The current Bungie item instance component exposes `itemLevel`, `quality`, `energy`, and nullable `gearTier`. Bungie describes `itemLevel` as affecting stats such as Light/Power; it is not documented as crafted weapon level. [Item instance component](https://bungie-net.github.io/multi/schema_Destiny-Entities-Items-DestinyItemInstanceComponent.html)
- The base item component's `state` bitmask identifies Masterwork and Crafted items. Enhanced traits can be counted by resolving active socket plugs through the manifest, then discarding the plug hashes. These are compact signals without retaining perk selections. [Item state](https://bungie-net.github.io/multi/schema_Destiny-ItemState.html), [Socket state](https://bungie-net.github.io/multi/schema_Destiny-Entities-Items-DestinyItemSocketState.html)
- Item sockets report the active `plugHash`; the manifest definition provides a plug's effects. This is how enhanced traits and other socket upgrades can be recognized, but saving the full hashes would also preserve random perk choices. Prefer derived booleans/counts and discard the plug list. [Socket state](https://bungie-net.github.io/multi/schema_Destiny-Entities-Items-DestinyItemSocketState.html)
- Profile components include per-item `ItemStats` (304), `ItemSockets` (305), `ItemObjectives` (301), `ItemPlugObjectives` (309), and `ItemInstances` (300). Item stats are display-oriented, but Bungie cautions that some values can differ from in-game values because runtime calculations are unavailable to the API. [Component types](https://bungie-net.github.io/multi/schema_Destiny-DestinyComponentType.html), [item stats](https://bungie-net.github.io/multi/schema_Destiny-Entities-Items-DestinyItemStatsComponent.html)
- `Craftables` (1300) is documented as recipe progress, not the live level of an owned weapon. Crafted-item level/progress may be represented as item objectives; verify the particular account's `ItemObjectives` response before treating it as a reliable per-item metric. [Component types](https://bungie-net.github.io/multi/schema_Destiny-DestinyComponentType.html), [Bungie API change log](https://github.com/Bungie-net/api/blob/master/README.md)

The app currently requests components 300, 305, and 309 but not 301 or 304 in [`src/services/bungie-api.ts`](../../src/services/bungie-api.ts). Its existing profile response therefore has the main instance flags, gear tier, sockets, and plug objectives, but not general item objectives or computed item stats.

## Useful comparisons

| Signal                                | Use                                                                                                                                                                                                                                                    | Caveat                                                                                                                                                                                                                                                                                                                              |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Gear tier                             | Best general progression signal. Bungie's system adds benefits by tier: enhanced traits at Tier 2, more trait options at Tier 3, enhanced components at Tier 4, and enhanced origin traits at Tier 5. Update 9.7 moved enhanced weapon mods to Tier 3. | Compare items only within comparable item classes/slots; tier alone does not prove one weapon is better because perk synergy can matter more. [Bungie weapon tier explanation](https://www.bungie.net/7/en/News/Article/dev_insights_weapon_gear_tier), [Update 9.7](https://www.bungie.net/7/en/News/Article/destiny_update_9_7_0) |
| Item power / primary stat             | Preserve the app's existing power comparison.                                                                                                                                                                                                          | `itemLevel` and `quality` are API instance values, not a generic progression score. Keep the app's current calculated power semantics. [Item instance component](https://bungie-net.github.io/multi/schema_Destiny-Entities-Items-DestinyItemInstanceComponent.html)                                                                |
| Masterwork / Enhanced / Crafted flags | Small boolean badges or tie-breakers; do not need to retain perk identities.                                                                                                                                                                           | Masterwork behavior differs between newer gear and legacy Armor 2.0, and an Enhanced flag does not describe which upgrades are present. [Item state](https://bungie-net.github.io/multi/schema_Destiny-ItemState.html), [Armor 3.0 update](https://www.bungie.net/7/en/News/article/destiny_update_9_0_0_1)                         |
| Armor stat total                      | Optional aggregate comparison if a single armor score is useful; retain the sum only, not the stat breakdown.                                                                                                                                          | Stats are rolled values. Armor 3.0 ties total stats to gear tier, while older Armor 2.0 items have a different system, so do not rank legacy and new armor with one unqualified score. [Armor 3.0 update](https://www.bungie.net/7/en/News/article/destiny_update_9_0_0_1)                                                          |
| Set bonus                             | Relevant to an equipped armor build at the two- and four-piece thresholds.                                                                                                                                                                             | It is a loadout-level effect, not an individual-item quality score. [Armor 3.0 update](https://www.bungie.net/7/en/News/article/destiny_update_9_0_0_1)                                                                                                                                                                             |
| Catalyst / item objectives            | Could mark a completed upgrade when its objective can be reliably identified in live profile data.                                                                                                                                                     | Requires inspecting real profile objective and socket data; the API does not define one uniform catalyst-completion score for every item. [Component types](https://bungie-net.github.io/multi/schema_Destiny-DestinyComponentType.html)                                                                                            |

## Initial recommendation

For a roll-agnostic score, start with a per-slot tuple rather than one cross-weapon scalar: `(power, gear tier, masterwork/enhanced flags)`. For armor, add an optional total-stat value with an explicit Armor 2.0/3.0 family marker. Treat crafting level and catalyst completion as follow-up signals only after they are confirmed in the actual profile response. Never persist the active perk hashes; if enhanced perks matter, reduce them to a count or `hasEnhancedTraits` flag.

This is a source-based starting point, not yet a statement about which signals are populated on the owner's current items. The authenticated profile inspection should verify nullability, naming, and item-type coverage before any scoring rule is implemented.

## Live profile sample

Inspected the authenticated profile on 2026-11-03 with the live manifest. Manifest version was `245114.26.10.13.2000-1-bnet.66137`; the response contained 51 unique item instances after joining character equipment, character inventory, and profile inventory.

- Five items had gear tier above 0: four Tier 5 and one Tier 4. The sample included a Tier 5 weapon and Tier 4/5 armor, so gear tier is populated across the actual account's new gear.
- The profile included 1 crafted item, 15 Masterwork items, 2 items with enhanced traits, 18 items with armor energy capacity, and item stats on 27 items.
- No item objectives were returned for those 51 items, so objectives are not a useful general progression field for this account snapshot.
- The six armor stat values summed to 96 on one Tier 4 armor piece and 100 on three Tier 5 examples. This aligns with Bungie's explanation that Armor 3.0 total stats depend on gear tier, but the total should only be compared among compatible armor families.
- The API reported `primaryStat.value` 10 for most legacy Tier 0 items but 300–400 for current tiered pieces in this sample. Preserve current power behavior as a separate signal and don't rank items across legacy/new families on that field without a compatibility rule.

The one-off raw profile response was not saved. The reusable [inspector script](../../scripts/inspect-destiny-items.mjs) returns normalized signals and omits item instance IDs and socket/perk selections. Use a short-lived `BUNGIE_ACCESS_TOKEN` environment variable plus `BUNGIE_MEMBERSHIP_TYPE` and `BUNGIE_MEMBERSHIP_ID`; it reads the API key from `.env.development` and prints a compact item summary. `--full` includes all item summaries. The token is not written to disk.

To repeat the inspection, in the app's browser console run `copy(JSON.stringify({accessToken:localStorage.getItem("bungieAccessToken"),membership:JSON.parse(localStorage.getItem("destinyMembership"))}))`. Then run this in PowerShell; it clears the process variables and clipboard even if the request fails:

```powershell
$session = Get-Clipboard | ConvertFrom-Json
$secure = ConvertTo-SecureString $session.accessToken -AsPlainText -Force
$env:BUNGIE_ACCESS_TOKEN = [System.Net.NetworkCredential]::new('', $secure).Password
$env:BUNGIE_MEMBERSHIP_TYPE = "$($session.membership.membershipType)"
$env:BUNGIE_MEMBERSHIP_ID = $session.membership.membershipId
try { node .\scripts\inspect-destiny-items.mjs } finally {
  Remove-Item Env:BUNGIE_ACCESS_TOKEN, Env:BUNGIE_MEMBERSHIP_TYPE, Env:BUNGIE_MEMBERSHIP_ID
  Remove-Variable session, secure
  Set-Clipboard -Value ''
}
```

The output does not contain raw perk selections or item instance IDs.

## Current scoring direction

For a first useful version, compare items within the same equipment slot and family, then use a tuple: `(power, gear tier, armor stat total where applicable, Masterwork/enhanced flags)`. Gear tier is the strongest cross-weapon, roll-agnostic progression field because Bungie defines concrete gameplay benefits per tier. Avoid a single scalar across unrelated weapons; Bungie explicitly says perk synergy can make lower-tier weapons stronger. Set bonus belongs on the equipped armor combination, not as a standalone item score. Keep legacy Armor 2.0 separate from Armor 3.0 until the app can identify the family reliably.
