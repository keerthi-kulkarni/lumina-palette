function TokenPanel({ tokens }) {
  if (!tokens) return null;

  return (
    <div className="token-panel">
      <h2>Design Tokens</h2>

      <pre>
        {JSON.stringify(tokens, null, 2)}
      </pre>
    </div>
  );
}

export default TokenPanel;