import type {RoutePosition, TransitionType} from './coordinates.js';
export function resolveTransition(from: RoutePosition, to: RoutePosition): TransitionType {
  if (from.path === to.path && from.floor === to.floor && from.depth === to.depth && from.x === to.x) return 'reload';
  if (to.floor > from.floor) return 'ascend';
  if (to.floor < from.floor) return 'descend';
  if (to.depth > from.depth) return 'enter';
  if (to.depth < from.depth) return 'exit';
  if (to.x < from.x) return 'lateral-l';
  if (to.x > from.x) return 'lateral-r';
  return 'reload';
}
