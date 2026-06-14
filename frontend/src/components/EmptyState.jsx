function EmptyState({ onActionText }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">📸</div>
      <p className="empty-title">Ready to extract colors</p>
      <p className="empty-text">{onActionText || 'Upload an image to start'}</p>
    </div>
  );
}

export default EmptyState;
