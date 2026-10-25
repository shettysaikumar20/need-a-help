import React, { useState } from 'react';
import { Network, X, ChevronRight, ChevronDown, Info, GitBranch, Layers, Sparkles } from 'lucide-react';

export default function ConceptMap({ data, onClose }) {
  const [selectedNode, setSelectedNode] = useState(data?.root || null);
  const [collapsedNodes, setCollapsedNodes] = useState({});

  if (!data || !data.root) return null;

  const toggleCollapse = (nodeId, e) => {
    e.stopPropagation();
    setCollapsedNodes(prev => ({
      ...prev,
      [nodeId]: !prev[nodeId]
    }));
  };

  const renderTree = (node, depth = 0) => {
    if (!node) return null;
    const isCollapsed = Boolean(collapsedNodes[node.id]);
    const isSelected = selectedNode?.id === node.id;
    const hasChildren = Array.isArray(node.children) && node.children.length > 0;

    return (
      <div key={node.id} className={`map-node-wrapper depth-${depth}`}>
        <div 
          className={`map-node-card depth-${depth} ${isSelected ? 'selected' : ''}`}
          onClick={() => setSelectedNode(node)}
          role="button"
          tabIndex={0}
        >
          <div className="map-node-header">
            {depth === 0 ? (
              <Sparkles size={14} className="node-icon root-icon" />
            ) : depth === 1 ? (
              <Layers size={13} className="node-icon pillar-icon" />
            ) : (
              <GitBranch size={12} className="node-icon leaf-icon" />
            )}
            <span className="map-node-label">{node.label}</span>
            {hasChildren && (
              <button 
                type="button" 
                className="collapse-toggle-btn"
                onClick={(e) => toggleCollapse(node.id, e)}
                title={isCollapsed ? 'Expand branches' : 'Collapse branches'}
              >
                {isCollapsed ? <ChevronRight size={13} /> : <ChevronDown size={13} />}
              </button>
            )}
          </div>
          {node.description && (
            <p className="map-node-preview">{node.description}</p>
          )}
        </div>

        {hasChildren && !isCollapsed && (
          <div className="map-children-container">
            {node.children.map(child => renderTree(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <section className="forge-card concept-map-card" aria-label="Concept Mind Map">
      <div className="concept-map-header">
        <div className="concept-title-wrap">
          <Network size={18} className="concept-map-icon" />
          <div>
            <h2 className="concept-topic-title">{data.topic || 'Concept Mind Map'}</h2>
            <span className="concept-subtitle">Interactive Knowledge Hierarchy</span>
          </div>
        </div>
        {onClose && (
          <button 
            type="button" 
            className="deck-close-btn" 
            onClick={onClose}
            aria-label="Close mind map"
          >
            <X size={16} />
          </button>
        )}
      </div>

      <div className="concept-map-layout">
        {/* Visual Hierarchy Graph */}
        <div className="concept-graph-viewport">
          {renderTree(data.root, 0)}
        </div>

        {/* Selected Concept Deep-Dive Sidebar */}
        {selectedNode && (
          <div className="concept-detail-panel">
            <div className="concept-detail-header">
              <Info size={16} className="detail-icon" />
              <h3>{selectedNode.label}</h3>
            </div>
            <p className="concept-detail-body">
              {selectedNode.description || 'No description provided for this node.'}
            </p>
            {selectedNode.children?.length > 0 && (
              <div className="concept-detail-subnodes">
                <span className="subnodes-title">Key Elements ({selectedNode.children.length}):</span>
                <ul className="subnodes-list">
                  {selectedNode.children.map(c => (
                    <li key={c.id} onClick={() => setSelectedNode(c)}>
                      <strong>{c.label}</strong>: {c.description}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
