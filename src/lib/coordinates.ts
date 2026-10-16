export type Floor = 0 | 1 | 2 | 3;
export type Depth = 0 | 1 | 2 | 3;
export type WingId = 'space' | 'life' | 'wildlife' | 'culture' | 'special' | 'theaters' | 'neutral';
export interface RoutePosition {
  readonly path: string;
  readonly floor: Floor;
  readonly depth: Depth;
  readonly x: number;
  readonly wing: WingId;
}
export type TransitionType = 'enter' | 'exit' | 'lateral-l' | 'lateral-r' | 'ascend' | 'descend' | 'reload';
interface HallCoordinate { slug: string; floor: Floor | null; wing: WingId }
interface PageCoordinate { path: string; floor: Floor; wing: WingId }
export function createPositions(halls: readonly HallCoordinate[], exhibitions: readonly {slug: string}[], theaters: readonly {slug: string}[], pages: readonly PageCoordinate[]): RoutePosition[] {
  const position = (path: string, floor: Floor, depth: Depth, x: number, wing: WingId): RoutePosition => ({path, floor, depth, x, wing});
  return [position('/', 1, 0, 0, 'neutral'), position('/halls/', 1, 1, 0, 'neutral'),
    position('/special-exhibitions/', 1, 1, 1, 'special'), position('/theaters/', 1, 1, 2, 'theaters'), position('/programs/', 1, 1, 3, 'life'),
    ...halls.map((h,i) => position(`/halls/${h.slug}/`, h.floor ?? 1, 2, i, h.wing)),
    position('/halls/wildlife-halls/upper-floor/', 3, 2, 3, 'wildlife'),
    ...exhibitions.map((e,i) => position(`/special-exhibitions/${e.slug}/`, 1, 2, i, 'special')),
    ...theaters.map((t,i) => position(`/theaters/${t.slug}/`, 1, 2, i, 'theaters')),
    ...pages.map((p,i) => position(p.path, p.floor, 1, i + 4, p.wing))];
}
export function normalizePath(path: string): string {
  return path === '/' ? '/' : `${path.replace(/\/+$/, '')}/`;
}
export function directoryFloor(value: string | null): Floor | null {
  return value !== null && /^[0-3]$/.test(value) ? Number(value) as Floor : null;
}
export function positionFor(url: URL, positions: readonly RoutePosition[]): RoutePosition | undefined {
  const base = positions.find(p => p.path === normalizePath(url.pathname));
  const floor = directoryFloor(url.searchParams.get('floor'));
  return (base?.path === '/halls/' || base?.path === '/halls/gems-and-minerals/') && floor !== null ? {...base, floor} : base;
}
