// Utility function to format mentions in comment text
export const formatMentions = (text) => {
  if (!text) return "";
  
  return text.replace(
    /@([a-zA-Z0-9_]+)/g,
    '<a href="/profile/$1" class="text-blue-500 hover:underline font-medium">@$1</a>'
  );
};

// Utility function to extract mentions from text
export const extractMentions = (text) => {
  if (!text) return [];
  
  const matches = text.match(/@([a-zA-Z0-9_]+)/g);
  if (!matches) return [];
  
  return matches.map(match => match.substring(1)); // Remove @ symbol
};

