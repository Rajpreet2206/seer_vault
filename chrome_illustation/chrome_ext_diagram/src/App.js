import React, { useState } from 'react';

const SeerVaultDiagram = () => {
  const [expandedLayer, setExpandedLayer] = useState(null);

const securityLayers = [
  {
    id: 1,
    name: 'Semantic Extraction',
    icon: '🧠',
    desc: 'Automatic extraction from PDFs, spreadsheets, text, and images',
    bgColor: '#b91c1c',
    borderColor: '#dc2626'
  },
  {
    id: 2,
    name: 'Vector Indexing',
    icon: '🧾',
    desc: 'Embedding-based search using Elastic Cloud vector stores',
    bgColor: '#92400e',
    borderColor: '#d97706'
  },
  {
    id: 3,
    name: 'Multi-Agent Orchestration',
    icon: '🤖',
    desc: 'ADK agents interpret user intent and coordinate retrieval ops',
    bgColor: '#854d0e',
    borderColor: '#eab308'
  },
  {
    id: 4,
    name: 'AlloyDB Metadata',
    icon: '🗄️',
    desc: 'High-performance relational indexing for semantic metadata',
    bgColor: '#4d7c0f',
    borderColor: '#84cc16'
  },
  {
    id: 5,
    name: 'Cloud Object Storage',
    icon: '☁️',
    desc: 'Durable binary storage in Google Cloud Storage (GCS)',
    bgColor: '#15803d',
    borderColor: '#22c55e'
  },
  {
    id: 6,
    name: 'Natural Language Interface',
    icon: '💬',
    desc: 'Conversational querying of heterogeneous file collections',
    bgColor: '#0e7490',
    borderColor: '#06b6d4'
  },
  {
    id: 7,
    name: 'Serverless Scaling',
    icon: '⚡',
    desc: 'Cloud Run autoscaling for ingestion, reasoning, and retrieval',
    bgColor: '#1e40af',
    borderColor: '#2563eb'
  },
  {
    id: 8,
    name: 'Cross-Modal Semantics',
    icon: '🖼️',
    desc: 'Unifies textual, visual, and document semantics for retrieval',
    bgColor: '#6b21a8',
    borderColor: '#a855f7'
  },
  {
    id: 9,
    name: 'Async Pipelines',
    icon: '⚙️',
    desc: 'Background workers ingest and update semantic representations',
    bgColor: '#3730a3',
    borderColor: '#6366f1'
  }
];


const getLayerDetails = (id) => {
  const details = {
    1: "Extracts structured content and entities from PDFs, spreadsheets, text files, and images.",
    2: "Generates embeddings for semantic similarity search using Elastic Cloud vector indices.",
    3: "Uses ADK-powered agents to interpret intent, retrieve files, and coordinate complex operations.",
    4: "Stores semantic metadata, indexing records, and file identities in high-performance AlloyDB tables.",
    5: "Persists the raw binary file objects in durable and scalable Google Cloud Storage.",
    6: "Enables natural language interaction with heterogeneous file collections and multi-file workflows.",
    7: "Cloud Run automatically scales ingestion, reasoning, and retrieval workloads on demand.",
    8: "Unifies text, document, and visual semantics for cross-modal retrieval and relevance ranking.",
    9: "Async background pipelines continuously update embeddings, metadata, and knowledge representations."
  };
  return details[id] || "";
};


  return (
    <div style={{ width: '100%', minHeight: '100vh', background: 'linear-gradient(to bottom right, #030712, #0f172a, #030712)', padding: '32px' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <h1 style={{ fontSize: '48px', fontWeight: 'bold', background: 'linear-gradient(to right, #06b6d4, #60a5fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', marginBottom: '16px' }}>SeerVault</h1>
          <p style={{ fontSize: '24px', fontWeight: '600', color: '#06b6d4', marginBottom: '8px' }}>Enabling Intelligence on Files</p>
          
        </div>

        {/* Main Architecture */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ display: 'inline-block', background: 'linear-gradient(to right, #0369a1, #1e40af)', borderRadius: '8px', padding: '15px 30px', border: '2px solid #06b6d4' }}>
              <p style={{ color: 'white', fontWeight: 'bold', fontSize: '18px', margin: '0' }}>Problem Statement</p>
              <p style={{ color: '#cffafe', fontSize: '14px', marginTop: '4px', margin: '0' }}>
                Traditional cloud storage platforms behave as passive repositories requiring manual navigation,
                filename-based search, and external tools for processing. As data volumes scale across heterogeneous file
                formats, retrieving insights becomes slow, fragmented, and cognitively expensive. Users lack a semantic,
                conversational interface to interact with their stored content.
              </p>
            </div>
          </div>
          
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ display: 'inline-block', background: 'linear-gradient(to right, #072130ff, #b91c1c)', borderRadius: '8px', padding: '15px 30px', border: '2px solid #06b6d4' }}>
              <p style={{ color: 'white', fontWeight: 'bold', fontSize: '18px', margin: '0' }}>Challenge</p>
              <p style={{ color: '#cffafe', fontSize: '14px', marginTop: '4px', margin: '0' }}>
                Mapping user intent to heterogeneous file semantics is non-trivial. Extracting cross-modal meaning requires
                scalable embeddings, entity graphing, and vector indexing. Performing multi file operations, reasoning,
                and retrieval without manual download demands orchestration across distributed agents and high-performance
                storage layers.
              </p>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ display: 'inline-block', background: 'linear-gradient(to right, #0c3d57ff, #059669    )', borderRadius: '8px', padding: '15px 30px', border: '2px solid #06b6d4' }}>
              <p style={{ color: 'white', fontWeight: 'bold', fontSize: '18px', margin: '0' }}>Our Solution</p> 
              <p style={{ color: 'black', fontSize: '12px', margin: '0' }}>   A semantic-aware conversational cloud storage platform</p>
              <p style={{ color: '#cffafe', fontSize: '14px', marginTop: '4px', margin: '0' }}>
                SeerVault enables users to talk directly to their stored data using natural language. Automated extraction
                pipelines convert PDFs, spreadsheets, text files, and images into semantic embeddings stored in Elastic
                Cloud for vector retrieval. Binary objects are persisted in Google Cloud Storage while AlloyDB maintains
                structured metadata and indexing. Multi-agent orchestration (ADK) interprets intent, retrieves relevant
                file sets, and performs server-side transformations; eliminating manual download-edit-upload workflows.

              </p>
            </div>
          </div>

          {/* Top: Warehouse Operators */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ display: 'inline-block', background: 'linear-gradient(to right, #0369a1, #1e40af)', borderRadius: '8px', padding: '15px 30px', border: '2px solid #06b6d4' }}>
              <p style={{ color: 'white', fontWeight: 'bold', fontSize: '18px', margin: '0' }}>☁️ Cloud Run Hackathon 2025</p>
              <p style={{ color: '#cffafe', fontSize: '14px', marginTop: '4px', margin: '0' }}>Semantic-aware file intelligence at cloud-native scale</p>
            </div>
          </div>

          {/* The Nine Security Layers - Concentric */}
          <div style={{ position: 'relative', margin: '0 auto', width: '100%', maxWidth: '600px', height: '384px', marginBottom: '48px' }}>
            {/* Outer circles */}
            {[0, 1, 2, 3, 4].map((ring) => (
              <div
                key={`ring-${ring}`}
                style={{
                  position: 'absolute',
                  border: '2px solid #4b5563',
                  borderRadius: '50%',
                  inset: `${ring * 15}%`,
                  opacity: 0.3
                }}
              />
            ))}

            {/* Center - Core System */}
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 20 }}>
              <div style={{ width: '96px', height: '96px', background: 'linear-gradient(to bottom right, #10b981, #059669)', borderRadius: '8px', border: '2px solid #34d399', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: '14px', fontWeight: 'bold', color: 'white', margin: '0' }}>ADK &</p>
                  <p style={{ fontSize: '14px', fontWeight: 'bold', color: 'white', margin: '0' }}>Gemini</p>
                </div>
              </div>
            </div>

            {/* Security layers arranged in circle */}
            {securityLayers.map((layer, idx) => {
              const angle = (idx / securityLayers.length) * Math.PI * 2;
              const radius = 140;
              const x = Math.cos(angle) * radius;
              const y = Math.sin(angle) * radius;
              
              return (
                <div
                  key={layer.id}
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                    zIndex: 10,
                    cursor: 'pointer'
                  }}
                  onClick={() => setExpandedLayer(expandedLayer === layer.id ? null : layer.id)}
                >
                  <div style={{
                    background: layer.bgColor,
                    borderRadius: '8px',
                    padding: '12px',
                    border: '2px solid white',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
                    width: '128px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.5)';
                    e.currentTarget.style.transform = 'scale(1.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.3)';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                  >
                    <p style={{ fontSize: '32px', margin: '0 0 8px 0' }}>{layer.icon}</p>
                    <p style={{ color: 'white', fontWeight: 'bold', fontSize: '12px', margin: '4px 0' }}>{layer.name}</p>
                    <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '11px', margin: '0', lineHeight: '1.3' }}>{layer.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* <div style={{ textAlign: 'center', color: '#9ca3af', fontSize: '14px', marginBottom: '48px' }}>
            💡 Click any security layer for details
          </div> */}

          {/* Expanded Layer Details */}
          {expandedLayer && (
            <div style={{ background: '#1e293b', border: '2px solid #06b6d4', borderRadius: '8px', padding: '24px', marginBottom: '48px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                <div>
                  <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#06b6d4', marginBottom: '12px', marginTop: 0 }}>{securityLayers[expandedLayer - 1].name}</h3>
                  <p style={{ color: '#cbd5e1', marginBottom: '12px' }}>{securityLayers[expandedLayer - 1].desc}</p>
                </div>
                <div style={{ background: '#0f172a', borderRadius: '8px', padding: '16px' }}>
                  <p style={{ fontSize: '14px', color: '#cbd5e1', margin: '0' }}>
                    {getLayerDetails(expandedLayer)}
                  </p>
                </div>
              </div>
            </div>
          )}

{/* Data Flow Diagram */}
<div style={{ background: '#1e293b', border: '2px solid #a855f7', borderRadius: '8px', padding: '32px', marginBottom: '48px' }}>
  <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#d8b4fe', marginBottom: '24px', marginTop: 0 }}>
    SeerVault Data Flow
  </h2>

  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
    {[
      {
        num: 1,
        title: 'User Authentication',
        desc: 'User signs in through Google Identity to access secure storage and semantic operations.'
      },
      {
        num: 2,
        title: 'File Upload',
        desc: 'Binary assets (PDFs, images, spreadsheets, text) are stored in Google Cloud Storage.'
      },
      {
        num: 3,
        title: 'Semantic Extraction Pipeline',
        desc: 'Background workers extract text, entities, visuals, tables, and structural metadata from files.'
      },
      {
        num: 4,
        title: 'Embedding Generation',
        desc: 'Cross-modal embeddings are generated and indexed in Elastic Cloud for similarity search.'
      },
      {
        num: 5,
        title: 'Metadata Indexing',
        desc: 'AlloyDB stores relational metadata, file identities, timestamps, ownership, and semantic attributes.'
      },
      {
        num: 6,
        title: 'Multi-Agent Orchestration',
        desc: 'ADK agents interpret intent, retrieve relevant files, reason over content, and chain operations.'
      },
      {
        num: 7,
        title: 'Natural Language Query',
        desc: 'Users issue queries like “Fetch my 2014 Paris photos” or “Find 2018 tax documents.”'
      },
      {
        num: 8,
        title: 'Vector Retrieval',
        desc: 'Elastic Cloud retrieves semantically relevant results using embedding similarity and scoring.'
      },
      {
        num: 9,
        title: 'Result Assembly',
        desc: 'Agents consolidate multi-file output, transformations, and summaries server-side.'
      },
      {
        num: 10,
        title: 'Interactive Delivery',
        desc: 'The user receives contextual results without downloading, manually searching, or reprocessing.'
      }
    ].map((step) => (
      <div key={step.num} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div
          style={{
            width: '48px',
            height: '48px',
            background: 'linear-gradient(to bottom right, #06b6d4, #2563eb)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
            flexShrink: 0
          }}
        >
          {step.num}
        </div>
        <div>
          <p style={{ fontWeight: '600', color: 'white', margin: 0 }}>{step.title}</p>
          <p style={{ fontSize: '14px', color: '#cbd5e1', margin: '4px 0 0 0' }}>
            {step.desc}
          </p>
        </div>
      </div>
    ))}
  </div>
</div>


{/* Key Technologies */}
<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', marginBottom: '48px' }}>
  
  <div style={{ background: 'linear-gradient(to bottom right, #7f1d1d, #991b1b)', borderRadius: '8px', padding: '24px', borderLeft: '4px solid #fca5a5' }}>
    <p style={{ color: '#fecaca', fontSize: '14px', fontWeight: '600', margin: '0 0 8px 0' }}>🧠 Semantic Extraction</p>
    <p style={{ color: 'white', fontWeight: 'bold', margin: '0 0 8px 0' }}>Multi-Modal Embeddings</p>
    <p style={{ color: '#cbd5e1', fontSize: '14px', margin: 0 }}>
      Extracts structured content from PDFs, images, text, and spreadsheets, generating embeddings for semantic search.
    </p>
  </div>

  <div style={{ background: 'linear-gradient(to bottom right, #581c87, #7e22ce)', borderRadius: '8px', padding: '24px', borderLeft: '4px solid #d8b4fe' }}>
    <p style={{ color: '#d8b4fe', fontSize: '14px', fontWeight: '600', margin: '0 0 8px 0' }}>🤖 Multi-Agent Orchestration</p>
    <p style={{ color: 'white', fontWeight: 'bold', margin: '0 0 8px 0' }}>ADK Agents</p>
    <p style={{ color: '#cbd5e1', fontSize: '14px', margin: 0 }}>
      Agents interpret natural language queries, retrieve relevant files, and coordinate multi-file operations server-side.
    </p>
  </div>

  <div style={{ background: 'linear-gradient(to bottom right, #0e7490, #06b6d4)', borderRadius: '8px', padding: '24px', borderLeft: '4px solid #bae6fd' }}>
    <p style={{ color: '#bae6fd', fontSize: '14px', fontWeight: '600', margin: '0 0 8px 0' }}>☁️ Cloud Storage & Scaling</p>
    <p style={{ color: 'white', fontWeight: 'bold', margin: '0 0 8px 0' }}>GCS + Cloud Run</p>
    <p style={{ color: '#cbd5e1', fontSize: '14px', margin: 0 }}>
      Binary files persist in Google Cloud Storage while serverless Cloud Run handles scalable ingestion, retrieval, and reasoning workloads.
    </p>
  </div>

</div>




          {/* System Components */}
          <div style={{ background: '#1e293b', border: '2px solid #06b6d4', borderRadius: '8px', padding: '32px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#06b6d4', marginBottom: '24px', marginTop: 0 }}>Complete System Architecture</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
              

    <div style={{ background: '#0f172a', borderRadius: '8px', padding: '16px', borderLeft: '4px solid #22c55e' }}>
      <p style={{ color: '#22c55e', fontWeight: 'bold', marginBottom: '8px', margin: '0 0 8px 0' }}>💻 Frontend</p>
      <ul style={{ fontSize: '14px', color: '#cbd5e1', margin: 0, paddingLeft: '20px' }}>
        <li>React-based user interface for natural language queries</li>
        <li>Interactive search, file management, and visualization</li>
        <li>Real-time updates from backend agents</li>
      </ul>
    </div>

<div style={{ background: '#0f172a', borderRadius: '8px', padding: '16px', borderLeft: '4px solid #a855f7' }}>
      <p style={{ color: '#a855f7', fontWeight: 'bold', marginBottom: '8px', margin: '0 0 8px 0' }}>🤖 Multi-Agent Orchestration</p>
      <ul style={{ fontSize: '14px', color: '#cbd5e1', margin: 0, paddingLeft: '20px' }}>
        <li>ADK agents interpret user intent and coordinate file retrieval</li>
        <li>Performs multi-file operations and semantic reasoning</li>
        <li>Integrates seamlessly with embeddings and metadata</li>
      </ul>
    </div>

    <div style={{ background: '#0f172a', borderRadius: '8px', padding: '16px', borderLeft: '4px solid #fbbf24' }}>
      <p style={{ color: '#fbbf24', fontWeight: 'bold', marginBottom: '8px', margin: '0 0 8px 0' }}>🗄️ Backend & Storage</p>
      <ul style={{ fontSize: '14px', color: '#cbd5e1', margin: 0, paddingLeft: '20px' }}>
        <li>Flask-based backend with REST API endpoints</li>
        <li>AlloyDB for relational metadata and Elastic Cloud for vector indices</li>
        <li>Google Cloud Storage for durable binary file objects</li>
        <li>High-performance indexing, retrieval, and audit logging</li>
      </ul>
    </div>


            </div>
          </div>
        </div>
      </div>
      
      <p></p>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ display: 'inline-block', background: 'linear-gradient(to right, #072130ff, #059669)', borderRadius: '8px', padding: '15px 30px', border: '2px solid #06b6d4' }}>
              <p style={{ color: 'white', fontWeight: 'bold', fontSize: '18px', margin: '0' }}>Submitted By: </p>
              <p style={{ color: '#cffafe', fontSize: '14px', marginTop: '4px', margin: '0' }}>
                    Vidhi Kothari and Rajpreet Singh 
              </p>
              <p style={{ color: '#171124ff', fontSize: '14px', marginTop: '4px', margin: '0' }}>
                    (Pace University and TU Munich) 
              </p>
            </div>
          </div>
    </div>
  );
};

export default SeerVaultDiagram;