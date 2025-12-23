type HorizontalRuleMethods = {
  insertHorizontalRule: () => boolean
}

export type HorizontalRuleEditor = {
  horizontalRule: HorizontalRuleMethods
}

export type HorizontalRuleElement = {
  type: "horizontal-rule"
  children: [{ text: "" }]
}

export type HorizontalRulePluginCustomTypes = {
  Name: "horizontal-rule"
  Editor: HorizontalRuleEditor
  Element: HorizontalRuleElement
}
