/**
 * Message.jsx
 * Renders a single chat message with timestamp and animations.
 */

function formatTime(date) {
  return new Date(date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

export default function Message({ message }) {
  const isUser = message.role === 'user';

  // Convert newlines and basic markdown for display
  const formatContent = (text) => {
    return text
      .split('\n')
      .map((line, i) => {
        // Bold: **text**
        line = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        // Bullet points
        if (line.startsWith('• ') || line.startsWith('- ')) {
          return `<span class="ai-msg-bullet">${line}</span>`;
        }
        return line || '<br/>';
      })
      .join('\n');
  };

  return (
    <div className={`ai-message ai-message--${isUser ? 'user' : 'assistant'}`}>
      {!isUser && (
        <div className="ai-message-avatar">
          <span>🤖</span>
        </div>
      )}
      <div className="ai-message-body">
        <div
          className="ai-message-bubble"
          dangerouslySetInnerHTML={{ __html: formatContent(message.content).replace(/\n/g, '<br/>') }}
        />
        <div className="ai-message-time">{formatTime(message.timestamp)}</div>
      </div>
      {isUser && (
        <div className="ai-message-avatar ai-message-avatar--user">
          <span>👤</span>
        </div>
      )}
    </div>
  );
}
