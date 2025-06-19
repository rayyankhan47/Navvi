"use client";

import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { ComponentAnalysis, Relationship } from '../types/analysis';
import { Search, ZoomIn, ZoomOut, RotateCcw, Download } from 'lucide-react';

interface DependencyGraphProps {
  components: ComponentAnalysis[];
  relationships: Relationship[];
  width?: number;
  height?: number;
}

export default function DependencyGraph({ 
  components, 
  relationships, 
  width = 800, 
  height = 600 
}: DependencyGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [zoomLevel, setZoomLevel] = useState(1);

  useEffect(() => {
    if (!svgRef.current || components.length === 0) return;

    // Clear previous content
    d3.select(svgRef.current).selectAll("*").remove();

    // Create nodes from components
    const nodes = components.map(comp => ({
      id: comp.name,
      name: comp.name,
      type: comp.type,
      complexity: comp.complexity,
      files: comp.files.length,
      description: comp.description
    }));

    // Create links from relationships
    const links = relationships
      .filter(rel => rel.type === 'imports')
      .map(rel => ({
        source: rel.from.split('/').pop()?.replace('.ts', '').replace('.js', '') || rel.from,
        target: rel.to.split('/').pop()?.replace('.ts', '').replace('.js', '') || rel.to,
        strength: rel.strength
      }))
      .filter(link => 
        nodes.some(n => n.id === link.source) && 
        nodes.some(n => n.id === link.target)
      );

    // Filter nodes based on search and type
    const filteredNodes = nodes.filter(node => {
      const matchesSearch = searchTerm === '' || 
        node.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        node.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = selectedType === 'all' || node.type === selectedType;
      return matchesSearch && matchesType;
    });

    const filteredLinks = links.filter(link => 
      filteredNodes.some(n => n.id === link.source) && 
      filteredNodes.some(n => n.id === link.target)
    );

    // Create SVG
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    // Create zoom behavior
    const zoom = d3.zoom()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        container.attr('transform', event.transform);
        setZoomLevel(event.transform.k);
      });

    svg.call(zoom as any);

    // Create container for zoom
    const container = svg.append('g');

    // Create force simulation
    const simulation = d3.forceSimulation(filteredNodes as any)
      .force('link', d3.forceLink(filteredLinks).id((d: any) => d.id).distance(100))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(50));

    // Create links
    const link = container.append('g')
      .selectAll('line')
      .data(filteredLinks)
      .enter()
      .append('line')
      .attr('stroke', '#84CC16')
      .attr('stroke-width', 2)
      .attr('stroke-opacity', 0.6);

    // Create nodes
    const node = container.append('g')
      .selectAll('g')
      .data(filteredNodes)
      .enter()
      .append('g')
      .call(d3.drag<any, any>()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended));

    // Add circles to nodes
    node.append('circle')
      .attr('r', (d: any) => Math.max(20, Math.min(40, d.files * 3)))
      .attr('fill', (d: any) => {
        const colors = {
          component: '#84CC16',
          service: '#16A34A',
          utility: '#22C55E',
          page: '#4ADE80',
          api: '#86EFAC'
        };
        return colors[d.type as keyof typeof colors] || '#84CC16';
      })
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')
      .on('mouseover', function(event, d: any) {
        // Highlight connected links
        link.attr('stroke-opacity', (l: any) => 
          l.source.id === d.id || l.target.id === d.id ? 1 : 0.1
        );
        
        // Show tooltip
        const tooltip = d3.select('body').append('div')
          .attr('class', 'tooltip')
          .style('position', 'absolute')
          .style('background', 'rgba(0, 0, 0, 0.9)')
          .style('color', 'white')
          .style('padding', '10px')
          .style('border-radius', '5px')
          .style('font-size', '12px')
          .style('pointer-events', 'none')
          .style('z-index', '1000')
          .style('border', '1px solid #84CC16');

        tooltip.html(`
          <div><strong>${d.name}</strong></div>
          <div>Type: ${d.type}</div>
          <div>Files: ${d.files}</div>
          <div>Complexity: ${d.complexity}</div>
          <div style="max-width: 200px; margin-top: 5px;">${d.description}</div>
        `);

        tooltip.style('left', (event.pageX + 10) + 'px')
               .style('top', (event.pageY - 10) + 'px');
      })
      .on('mouseout', function() {
        // Reset link opacity
        link.attr('stroke-opacity', 0.6);
        
        // Remove tooltip
        d3.selectAll('.tooltip').remove();
      });

    // Add labels to nodes
    node.append('text')
      .text((d: any) => d.name)
      .attr('text-anchor', 'middle')
      .attr('dy', '.35em')
      .attr('fill', '#ffffff')
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .style('pointer-events', 'none');

    // Add complexity indicators
    node.append('text')
      .text((d: any) => `C:${d.complexity}`)
      .attr('text-anchor', 'middle')
      .attr('dy', '1.5em')
      .attr('fill', '#84CC16')
      .attr('font-size', '10px')
      .style('pointer-events', 'none');

    // Update positions on simulation tick
    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      node
        .attr('transform', (d: any) => `translate(${d.x},${d.y})`);
    });

    // Drag functions
    function dragstarted(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event: any, d: any) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    // Cleanup
    return () => {
      simulation.stop();
      d3.selectAll('.tooltip').remove();
    };
  }, [components, relationships, width, height, searchTerm, selectedType]);

  const handleZoomIn = () => {
    if (svgRef.current) {
      const zoom = d3.zoom().scaleExtent([0.1, 4]);
      d3.select(svgRef.current).transition().call(
        zoom.scaleBy as any, 1.5
      );
    }
  };

  const handleZoomOut = () => {
    if (svgRef.current) {
      const zoom = d3.zoom().scaleExtent([0.1, 4]);
      d3.select(svgRef.current).transition().call(
        zoom.scaleBy as any, 1 / 1.5
      );
    }
  };

  const handleReset = () => {
    if (svgRef.current) {
      d3.select(svgRef.current).transition().call(
        d3.zoom().transform as any, d3.zoomIdentity
      );
    }
  };

  const handleExport = () => {
    if (svgRef.current) {
      const svgElement = svgRef.current;
      const svgData = new XMLSerializer().serializeToString(svgElement);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const svgUrl = URL.createObjectURL(svgBlob);
      
      const downloadLink = document.createElement('a');
      downloadLink.href = svgUrl;
      downloadLink.download = 'dependency-graph.svg';
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(svgUrl);
    }
  };

  const componentTypes = ['all', ...Array.from(new Set(components.map(c => c.type)))];

  if (components.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-white/5 rounded-lg border border-white/10">
        <p className="text-gray-400">No components to visualize</p>
      </div>
    );
  }

  return (
    <div className="bg-white/5 rounded-lg border border-white/10 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Dependency Graph</h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleZoomIn}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4 text-white" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4 text-white" />
          </button>
          <button
            onClick={handleReset}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            title="Reset View"
          >
            <RotateCcw className="w-4 h-4 text-white" />
          </button>
          <button
            onClick={handleExport}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            title="Export as SVG"
          >
            <Download className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="flex items-center space-x-4 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search components..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:border-lime-500 focus:outline-none transition-colors"
          />
        </div>
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-lime-500 focus:outline-none transition-colors"
        >
          {componentTypes.map(type => (
            <option key={type} value={type} className="bg-black text-white">
              {type === 'all' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Zoom Level Indicator */}
      <div className="text-sm text-gray-400 mb-4">
        Zoom: {Math.round(zoomLevel * 100)}%
      </div>

      <div className="flex justify-center">
        <svg ref={svgRef} className="border border-white/10 rounded-lg"></svg>
      </div>

      <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-400">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-lime-500 rounded-full"></div>
          <span>Component</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-600 rounded-full"></div>
          <span>Service</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span>Utility</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-400 rounded-full"></div>
          <span>Page</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-300 rounded-full"></div>
          <span>API</span>
        </div>
      </div>
    </div>
  );
} 