declare module 'd3-force' {
  export interface Simulation<NodeDatum extends SimulationNodeDatum> {
    restart(): this;
    stop(): this;
    tick(iterations?: number): this;
    nodes(): NodeDatum[];
    nodes(nodes: NodeDatum[]): this;
    alpha(): number;
    alpha(alpha: number): this;
    alphaTarget(): number;
    alphaTarget(target: number): this;
    alphaDecay(): number;
    alphaDecay(decay: number): this;
    velocityDecay(): number;
    velocityDecay(decay: number): this;
    force(name: string): Force<NodeDatum, any> | undefined;
    force(name: string, force: Force<NodeDatum, any> | null): this;
    find(x?: number, y?: number, radius?: number): NodeDatum | undefined;
    on(typenames: string, listener?: (this: this, ...args: any[]) => void): this;
  }

  export interface SimulationNodeDatum {
    index?: number;
    x?: number;
    y?: number;
    vx?: number;
    vy?: number;
    fx?: number | null;
    fy?: number | null;
  }

  export interface Force<NodeDatum extends SimulationNodeDatum, LinkDatum extends SimulationLinkDatum<NodeDatum>> {
    (alpha: number): void;
    initialize?(nodes: NodeDatum[]): void;
  }

  export interface SimulationLinkDatum<NodeDatum extends SimulationNodeDatum> {
    source: NodeDatum | string | number;
    target: NodeDatum | string | number;
    index?: number;
  }

  export function forceSimulation<NodeDatum extends SimulationNodeDatum>(
    nodes?: NodeDatum[]
  ): Simulation<NodeDatum>;

  export interface ForceManyBody<NodeDatum extends SimulationNodeDatum> extends Force<NodeDatum, any> {
    strength(): number | ((node: NodeDatum) => number);
    strength(strength: number | ((node: NodeDatum) => number)): this;
    theta(): number;
    theta(theta: number): this;
    distanceMin(): number;
    distanceMin(distance: number): this;
    distanceMax(): number;
    distanceMax(distance: number): this;
  }

  export function forceManyBody(): ForceManyBody<any>;
  export function forceManyBody<NodeDatum extends SimulationNodeDatum>(
    strength?: number | ((node: NodeDatum) => number)
  ): ForceManyBody<NodeDatum>;

  export interface ForceLink<NodeDatum extends SimulationNodeDatum, LinkDatum extends SimulationLinkDatum<NodeDatum>> extends Force<NodeDatum, LinkDatum> {
    links(): LinkDatum[];
    links(links: LinkDatum[]): this;
    id(): (node: NodeDatum) => string | number;
    id(id: (node: NodeDatum) => string | number): this;
    distance(): number | ((link: LinkDatum, i: number, links: LinkDatum[]) => number);
    distance(distance: number | ((link: LinkDatum, i: number, links: LinkDatum[]) => number)): this;
    strength(): number | ((link: LinkDatum, i: number, links: LinkDatum[]) => number);
    strength(strength: number | ((link: LinkDatum, i: number, links: LinkDatum[]) => number)): this;
    iterations(): number;
    iterations(iterations: number): this;
  }

  export function forceLink<NodeDatum extends SimulationNodeDatum, LinkDatum extends SimulationLinkDatum<NodeDatum>>(
    links?: LinkDatum[]
  ): ForceLink<NodeDatum, LinkDatum>;

  export interface ForceCollide<NodeDatum extends SimulationNodeDatum> extends Force<NodeDatum, any> {
    radius(): number | ((node: NodeDatum) => number);
    radius(radius: number | ((node: NodeDatum) => number)): this;
    strength(): number;
    strength(strength: number): this;
    iterations(): number;
    iterations(iterations: number): this;
  }

  export function forceCollide<NodeDatum extends SimulationNodeDatum>(
    radius?: number | ((node: NodeDatum) => number)
  ): ForceCollide<NodeDatum>;

  export function forceCenter(x?: number, y?: number): Force<any, any>;
  export function forceX(x?: number | ((node: any) => number)): Force<any, any>;
  export function forceY(y?: number | ((node: any) => number)): Force<any, any>;
  export function forceRadial(radius: number | ((node: any) => number), x?: number, y?: number): Force<any, any>;
}

