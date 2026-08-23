import React, { useState } from 'react';
import './HymnViewer.css'; // Import the CSS styles below

export default function HymnViewer({ hymn }) {
  // Mode state: 'scan' | 'lyrics' | 'chords'
  const [viewMode, setViewMode] = useState('scan');

  // Strip all [Chords] to get plain lyrics automatically
  const plainLyrics = hymn.lyricsWithChords
    ? hymn.lyricsWithChords.replace(/\[.*?\]/g, '')
    : '';

  // Helper to parse "[G]O Dios nga [C]gamhanan" into floating chords
  const renderChords = (rawText) => {
    if (!rawText) return null;

    return rawText.split('\n').map((line, lineIndex) => {
      const parts = line.split(/\[(.*?)\]/);
      const blocks = [];

      // Add leading text before the first chord (if any)
      if (parts[0]) {
        blocks.push({ chord: '', text: parts[0] });
      }

      // Loop through pairs: parts[i] = chord, parts[i+1] = text
      for (let i = 1; i < parts.length; i += 2) {
        blocks.push({
          chord: parts[i],
          text: parts[i + 1] || '',
        });
      }

      return (
        <div key={lineIndex} className="hymn-line">
          {blocks.map((block, i) => (
            <span key={i} className="chord-block">
              <span className="chord-label">{block.chord}</span>
              <span className="lyrics-text">{block.text || '\u00A0'}</span>
            </span>
          ))}
        </div>
      );
    });
  };

  return (
    <div className="hymn-container">
      {/* Segmented 3-Way Toggle Switch */}
      <div className="toggle-bar">
        <button
          className={viewMode === 'scan' ? 'active' : ''}
          onClick={() => setViewMode('scan')}
        >
          Scan
        </button>
        <button
          className={viewMode === 'lyrics' ? 'active' : ''}
          onClick={() => setViewMode('lyrics')}
        >
          Lyrics
        </button>
        <button
          className={viewMode === 'chords' ? 'active' : ''}
          onClick={() => setViewMode('chords')}
        >
          Chords
        </button>
      </div>

      {/* Content Area */}
      <div className="content-display">
        {/* VIEW 1: Sheet Music Scan */}
        {viewMode === 'scan' && (
          <div className="scan-view">
            <img
              src={`/scans/${hymn.scan}`}
              alt={`Page ${hymn.number}`}
              className="scan-image"
            />
          </div>
        )}

        {/* VIEW 2: Plain Lyrics */}
        {viewMode === 'lyrics' && (
          <div className="lyrics-view">
            <pre className="plain-text">{plainLyrics}</pre>
          </div>
        )}

        {/* VIEW 3: Lyrics with Chords */}
        {viewMode === 'chords' && (
          <div className="chords-view">
            {renderChords(hymn.lyricsWithChords)}
          </div>
        )}
      </div>
    </div>
  );
}
