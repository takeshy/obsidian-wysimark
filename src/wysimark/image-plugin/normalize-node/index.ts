import { Editor, Node, NodeEntry } from "slate"

export function normalizeNode(_editor: Editor, _entry: NodeEntry<Node>): boolean {
  // No normalization needed for image nodes
  return false
}
