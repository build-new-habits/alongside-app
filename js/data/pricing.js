/**
 * js/data/pricing.js
 * 18 Aug 2026 v1
 *
 * PRICE-3. The price, once.
 *
 * WHY THIS FILE EXISTS. On 18 Aug the annual price moved from £49.99 to
 * £59.99 and `settings.js` was still publishing £49.99 in prose -- a
 * second copy of a number `upgrade.js` already held in a constant
 * precisely so it would exist in one place. Nobody was looking at that
 * file. `verify-price.mjs` found it on the day it was written.
 *
 * The fix is not "remember to change both". It is that there is only
 * one.
 *
 * WHY NOT EXPORT FROM upgrade.js. That would make every consumer of the
 * price import a VIEW, and views own rendering, not facts. A settings
 * panel importing the upgrade screen to find out what things cost is a
 * dependency that will look wrong to the next person and get "tidied"
 * back into a duplicate.
 *
 * WHY NOT READ FROM THE WEBSITE. Graeme's instinct, and worth recording
 * why it was not taken: the app is a PWA that must work fully offline,
 * so a price fetched at runtime would be absent exactly when somebody
 * has no signal, and would put a network dependency on a number that
 * changes about twice a year. It also inverts the direction of truth --
 * the site is a publication OF the price, not the source of it.
 * `verify-price.mjs` enforces agreement between them instead, which
 * gets the same guarantee with no runtime coupling.
 *
 * CHANGING A PRICE. Change it here. Then run tools/verify-price.mjs,
 * which fails if any other file in the repo publishes a retired figure
 * or quotes a monthly-and-annual pair that disagrees with these.
 */

export const PRICE_MONTHLY = "\u00A37.99";
export const PRICE_ANNUAL  = "\u00A359.99";
