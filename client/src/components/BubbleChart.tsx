import React, { useMemo, useRef, useEffect } from 'react';
// Note: This blueprint implies usage of 'react-force-graph-2d'
// npm install react-force-graph-2d
import ForceGraph2D, { type ForceGraphMethods } from 'react-force-graph-2d';
import { forceCollide } from 'd3-force';

interface TagNode {
    id: string; // tagId
    name: string; // title
    usageCount: number; // for radius
    color: string;
    // Force graph required props
    x?: number;
    y?: number;
    val?: number; // radius value often mapped here or accessor
}

interface GraphLink {
    source: string;
    target: string;
    value: number;
}

interface BubbleChartProps {
    tags: TagNode[];
    links?: GraphLink[];
    width?: number;
    height?: number;
    onTagClick?: (tagId: string) => void;
}

// --- C. Visual Scaling Logic ---
const BASE_RADIUS = 20;
const SCALING_FACTOR = 10;

/**
 * Calculates bubble radius using square root scale for visual balance.
 * Formula: radius = BASE_RADIUS + sqrt(usageCount) * SCALING_FACTOR
 */
export const calculateRadius = (usageCount: number): number => {
    return BASE_RADIUS + Math.sqrt(usageCount) * SCALING_FACTOR;
};

export const BubbleChart: React.FC<BubbleChartProps> = ({ tags, links = [], width = 600, height = 400, onTagClick }) => {
    // Transform tags to graph data
    const graphData = useMemo(() => {
        return {
            nodes: tags.map(t => ({
                ...t,
                val: calculateRadius(t.usageCount), // react-force-graph uses val for radius by default in some modes, or we use nodeRelSize
                // We will use nodeCanvasObject for custom bubble rendering so we can handle radius explicitly
            })),
            links: links.map(l => ({ ...l })) // Clone to prevent mutation issues with repeated renders
        };
    }, [tags, links]);

    const fgRef = useRef<ForceGraphMethods | undefined>(undefined);

    useEffect(() => {
        if (fgRef.current) {
            // Add collision force to prevent overlap
            // Use radius + padding
            fgRef.current.d3Force('collide', forceCollide((node: any) => calculateRadius(node.usageCount) + 5));
        }
    }, [tags]);

    return (
        <div className="border border-border rounded-2xl overflow-hidden bg-card/50 backdrop-blur-sm shadow-sm relative">
            <div className="absolute top-4 left-4 z-10 pointer-events-none">
                <h3 className="text-lg font-bold text-foreground opacity-80">Knowledge Graph</h3>
                <p className="text-xs text-muted-foreground">Interactive connected tags</p>
            </div>

            {(typeof window !== 'undefined') && (
                // @ts-ignore - Library might not be installed in environment
                <ForceGraph2D
                    ref={fgRef}
                    width={width}
                    height={height}
                    graphData={graphData}
                    backgroundColor="rgba(0,0,0,0)" // Transparent
                    nodeLabel="name"
                    nodeColor="color"
                    nodeRelSize={1} // We control size via nodeCanvasObject or val

                    // Link Styles
                    linkColor={() => 'rgba(150, 150, 150, 0.5)'}
                    linkWidth={(link: any) => 2 + Math.sqrt(link.value || 1)}

                    // Custom Render for Bubbles
                    nodeCanvasObject={(node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
                        const label = node.name;
                        const fontSize = 12 / globalScale;
                        const radius = calculateRadius(node.usageCount);

                        // Draw Bubble
                        ctx.beginPath();
                        ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI, false);
                        ctx.fillStyle = node.color || '#6366f1';
                        ctx.fill();

                        // Draw Border
                        ctx.strokeStyle = 'rgba(255,255,255,0.2)';
                        ctx.lineWidth = 1.5;
                        ctx.stroke();

                        // Draw Label
                        ctx.font = `600 ${Math.max(fontSize, 4)}px Sans-Serif`; // Scaled font
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        ctx.fillStyle = 'white'; // Contrast text
                        // Only show label if radius is big enough or zoomed in
                        if (globalScale > 0.8 || radius > 10) {
                            // Shadow for text
                            ctx.shadowColor = "rgba(0,0,0,0.5)";
                            ctx.shadowBlur = 4;
                            ctx.fillText(label, node.x, node.y);
                            ctx.shadowBlur = 0;
                        }
                    }}

                    // Physics to prevent overlap (Collision)
                    // d3Force="charge"
                    d3VelocityDecay={0.6} // Stabilize quickly
                    warmupTicks={100}
                    cooldownTicks={0}
                    onNodeClick={(node: any) => {
                        if (onTagClick) onTagClick(node.id);
                    }}
                />
            )}

            {tags.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm">
                    No analytics data yet using Force Graph
                </div>
            )}
        </div>
    );
};
