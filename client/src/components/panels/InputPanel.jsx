export default function InputPanel({ stdin, onStdinChange }) {
  return (
    <div className="input-panel">
      <div className="input-header">
        <span className="input-title">Input (stdin)</span>
      </div>
      <textarea
        className="input-textarea"
        value={stdin}
        onChange={(e) => onStdinChange(e.target.value)}
        placeholder="Enter input for your program..."
        spellCheck={false}
      />
    </div>
  );
}
