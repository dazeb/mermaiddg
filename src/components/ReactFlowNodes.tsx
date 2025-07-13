import React from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';

// Base node styles
const baseNodeStyle = {
  padding: '10px 15px',
  border: '2px solid #1a192b',
  borderRadius: '3px',
  background: 'white',
  fontSize: '12px',
  fontWeight: 500,
  color: '#1a192b',
  minWidth: '80px',
  textAlign: 'center' as const,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
};

// Default rectangular node
export function DefaultNode({ data, selected }: NodeProps) {
  return (
    <div
      style={{
        ...baseNodeStyle,
        borderColor: selected ? '#3b82f6' : '#1a192b',
        boxShadow: selected ? '0 0 0 2px #3b82f6' : '0 2px 4px rgba(0,0,0,0.1)',
      }}
    >
      <Handle type="target" position={Position.Top} />
      <div>{data.label}</div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

// Diamond node for decisions
export function DiamondNode({ data, selected }: NodeProps) {
  return (
    <div
      style={{
        position: 'relative',
        width: '120px',
        height: '80px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Handle type="target" position={Position.Top} />
      <div
        style={{
          width: '100%',
          height: '100%',
          background: 'white',
          border: `2px solid ${selected ? '#3b82f6' : '#1a192b'}`,
          transform: 'rotate(45deg)',
          position: 'absolute',
          boxShadow: selected ? '0 0 0 2px #3b82f6' : '0 2px 4px rgba(0,0,0,0.1)',
        }}
      />
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          fontSize: '12px',
          fontWeight: 500,
          color: '#1a192b',
          textAlign: 'center',
          maxWidth: '80px',
          lineHeight: '1.2',
        }}
      >
        {data.label}
      </div>
      <Handle type="source" position={Position.Bottom} />
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

// Circle node
export function CircleNode({ data, selected }: NodeProps) {
  return (
    <div
      style={{
        position: 'relative',
        width: '80px',
        height: '80px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Handle type="target" position={Position.Top} />
      <div
        style={{
          width: '100%',
          height: '100%',
          background: 'white',
          border: `2px solid ${selected ? '#3b82f6' : '#1a192b'}`,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '12px',
          fontWeight: 500,
          color: '#1a192b',
          textAlign: 'center',
          boxShadow: selected ? '0 0 0 2px #3b82f6' : '0 2px 4px rgba(0,0,0,0.1)',
        }}
      >
        {data.label}
      </div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

// Rounded rectangle node
export function RoundedNode({ data, selected }: NodeProps) {
  return (
    <div
      style={{
        ...baseNodeStyle,
        borderRadius: '20px',
        borderColor: selected ? '#3b82f6' : '#1a192b',
        boxShadow: selected ? '0 0 0 2px #3b82f6' : '0 2px 4px rgba(0,0,0,0.1)',
      }}
    >
      <Handle type="target" position={Position.Top} />
      <div>{data.label}</div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

// Stadium node (pill shape)
export function StadiumNode({ data, selected }: NodeProps) {
  return (
    <div
      style={{
        ...baseNodeStyle,
        borderRadius: '25px',
        borderColor: selected ? '#3b82f6' : '#1a192b',
        boxShadow: selected ? '0 0 0 2px #3b82f6' : '0 2px 4px rgba(0,0,0,0.1)',
      }}
    >
      <Handle type="target" position={Position.Top} />
      <div>{data.label}</div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

// Subroutine node (rectangle with side lines)
export function SubroutineNode({ data, selected }: NodeProps) {
  return (
    <div
      style={{
        position: 'relative',
        ...baseNodeStyle,
        borderColor: selected ? '#3b82f6' : '#1a192b',
        boxShadow: selected ? '0 0 0 2px #3b82f6' : '0 2px 4px rgba(0,0,0,0.1)',
      }}
    >
      <Handle type="target" position={Position.Top} />
      {/* Side lines for subroutine */}
      <div
        style={{
          position: 'absolute',
          left: '8px',
          top: '4px',
          bottom: '4px',
          width: '2px',
          background: selected ? '#3b82f6' : '#1a192b',
        }}
      />
      <div
        style={{
          position: 'absolute',
          right: '8px',
          top: '4px',
          bottom: '4px',
          width: '2px',
          background: selected ? '#3b82f6' : '#1a192b',
        }}
      />
      <div>{data.label}</div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

// Cylinder node (database)
export function CylinderNode({ data, selected }: NodeProps) {
  return (
    <div
      style={{
        position: 'relative',
        width: '100px',
        height: '80px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Handle type="target" position={Position.Top} />
      <div
        style={{
          width: '100%',
          height: '100%',
          background: 'white',
          border: `2px solid ${selected ? '#3b82f6' : '#1a192b'}`,
          borderRadius: '50px 50px 10px 10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '12px',
          fontWeight: 500,
          color: '#1a192b',
          textAlign: 'center',
          boxShadow: selected ? '0 0 0 2px #3b82f6' : '0 2px 4px rgba(0,0,0,0.1)',
        }}
      >
        {data.label}
      </div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

// Cloud node
export function CloudNode({ data, selected }: NodeProps) {
  return (
    <div
      style={{
        position: 'relative',
        width: '120px',
        height: '80px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Handle type="target" position={Position.Top} />
      <div
        style={{
          width: '100%',
          height: '100%',
          background: 'white',
          border: `2px solid ${selected ? '#3b82f6' : '#1a192b'}`,
          borderRadius: '30px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '12px',
          fontWeight: 500,
          color: '#1a192b',
          textAlign: 'center',
          boxShadow: selected ? '0 0 0 2px #3b82f6' : '0 2px 4px rgba(0,0,0,0.1)',
          position: 'relative',
        }}
      >
        {/* Cloud bumps */}
        <div
          style={{
            position: 'absolute',
            top: '-8px',
            left: '20px',
            width: '20px',
            height: '20px',
            background: 'white',
            border: `2px solid ${selected ? '#3b82f6' : '#1a192b'}`,
            borderRadius: '50%',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '-12px',
            left: '50px',
            width: '30px',
            height: '30px',
            background: 'white',
            border: `2px solid ${selected ? '#3b82f6' : '#1a192b'}`,
            borderRadius: '50%',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '-8px',
            right: '20px',
            width: '20px',
            height: '20px',
            background: 'white',
            border: `2px solid ${selected ? '#3b82f6' : '#1a192b'}`,
            borderRadius: '50%',
          }}
        />
        <div style={{ position: 'relative', zIndex: 1 }}>{data.label}</div>
      </div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

// Export node types mapping
export const nodeTypes = {
  default: DefaultNode,
  diamond: DiamondNode,
  circle: CircleNode,
  rounded: RoundedNode,
  stadium: StadiumNode,
  subroutine: SubroutineNode,
  cylinder: CylinderNode,
  cloud: CloudNode,
};
