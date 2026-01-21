import { useState, useRef, useEffect } from 'react';

interface Friend {
  id: number;
  displayName: string;
}

interface MentionInputProps {
  value: string;
  onChange: (value: string) => void;
  onKeyPress?: (e: React.KeyboardEvent) => void;
  placeholder?: string;
  friends: Friend[];
  className?: string;
}

export default function MentionInput({ value, onChange, onKeyPress, placeholder, friends, className }: MentionInputProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredFriends, setFilteredFriends] = useState<Friend[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mentionStart, setMentionStart] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const cursorPos = inputRef.current?.selectionStart || 0;
    const textBeforeCursor = value.substring(0, cursorPos);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');
    
    if (lastAtIndex !== -1 && lastAtIndex === textBeforeCursor.length - 1) {
      // Just typed @
      setMentionStart(lastAtIndex);
      setFilteredFriends(friends);
      setShowDropdown(true);
      setSelectedIndex(0);
    } else if (lastAtIndex !== -1 && cursorPos > lastAtIndex) {
      // Typing after @
      const searchText = textBeforeCursor.substring(lastAtIndex + 1).toLowerCase();
      const filtered = friends.filter(f => 
        f.displayName.toLowerCase().includes(searchText)
      );
      setMentionStart(lastAtIndex);
      setFilteredFriends(filtered);
      setShowDropdown(filtered.length > 0);
      setSelectedIndex(0);
    } else {
      setShowDropdown(false);
    }
  }, [value, friends]);

  const insertMention = (friend: Friend) => {
    const before = value.substring(0, mentionStart);
    const after = value.substring(inputRef.current?.selectionStart || 0);
    const mention = `@[${friend.displayName}](${friend.id})`;
    const newValue = `${before}${mention} ${after}`;
    onChange(newValue);
    setShowDropdown(false);
    
    // Focus back to input
    setTimeout(() => {
      inputRef.current?.focus();
      const newPos = mentionStart + mention.length + 1;
      inputRef.current?.setSelectionRange(newPos, newPos);
    }, 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % filteredFriends.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filteredFriends.length) % filteredFriends.length);
    } else if (e.key === 'Enter' && filteredFriends.length > 0) {
      e.preventDefault();
      insertMention(filteredFriends[selectedIndex]);
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
    }
  };

  return (
    <div className="relative flex-1">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyPress={onKeyPress}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={className}
      />
      
      {showDropdown && filteredFriends.length > 0 && (
        <div className="absolute bottom-full left-0 mb-1 w-64 bg-gray-800 border border-gray-700 rounded-lg shadow-xl max-h-48 overflow-y-auto z-50">
          {filteredFriends.map((friend, index) => (
            <button
              key={friend.id}
              onClick={() => insertMention(friend)}
              className={`w-full px-3 py-2 text-left hover:bg-white/10 transition-colors flex items-center gap-2 ${
                index === selectedIndex ? 'bg-white/10' : ''
              }`}
            >
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-purple-600 rounded-full flex items-center justify-center font-bold text-xs">
                {friend.displayName.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm">{friend.displayName}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
