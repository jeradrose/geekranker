export interface BggGeekListResult {
  geeklist: BggGeekList,
}

export interface BggGeekList {
  $: BggGeekListAttributes
  title: string,
  item: BggGeekListItem[]
}

export interface BggGeekListAttributes {
  id: string,
}

export interface BggGeekListItem {
  $: BggGeekListItemAttributes,
}

export interface BggGeekListItemAttributes {
  objectid: string,
  objecttype: "thing",
  subtype: "boardgame",
}