# Feature flags

A flag changes behaviour or look. A flag never hides files: anything inside `public/` can be downloaded by anyone who knows the URL. To keep an item out of a build, set its `visibility` in `catalog/<id>.json` to `hidden` or `draft`.

| Flag | Default | Effect |
|---|---|---|
| `FLAG_SEARCH` | true | Shows the Search link and page. When false the page returns 404. |
| `FLAG_3D_ITEMS` | true | Lists items of type `three-d`. |
| `FLAG_STATUS_BADGES` | true | Shows Draft, Verified, Audited and Legacy badges. |
| `FLAG_SHOW_DRAFTS` | false | Lists items whose visibility is `draft` (they must also have been built with `LIBRARY_ENV=dev`). |
| `FLAG_AUTH_REQUIRED` | false | Reserved for the login phase. Nothing reads it yet. |
| `FLAG_ITEM_<ID>` | true | One per catalog item, named in its `flag` field. false removes the item from every list. The artifact folder itself still exists in the build. |

Values must be exactly `true` or `false`. Anything else is ignored and the default is used.
Flags are read when pages are built, so changing one means rebuilding.
