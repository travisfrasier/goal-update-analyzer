/**
 * Goal Update Analyzer - Heuristic-based Analysis
 * 
 * This module provides simple, deterministic analysis of goal updates.
 * Designed to be easily replaceable with API calls in the future.
 */

/**
 * Analyzes a text input and returns summary, sentiment, and next step suggestion.
 * 
 * @param {string} text - The goal update text to analyze
 * @returns {Object} Analysis result with summaryBullets, sentimentLabel, and nextStep
 */
function analyzeText(text) {
  // Trim whitespace
  const trimmedText = text.trim();
  
  // Analyze sentiment
  const sentimentLabel = analyzeSentiment(trimmedText);
  
  // Extract summary bullets
  const summaryBullets = extractSummary(trimmedText);
  
  // Suggest next step based on sentiment
  const nextStep = suggestNextStep(sentimentLabel);
  
  return {
    summaryBullets,
    sentimentLabel,
    nextStep
  };
}

/**
 * Analyzes sentiment using keyword matching and punctuation patterns.
 * 
 * @param {string} text - Text to analyze
 * @returns {string} 'Positive', 'Neutral', or 'Negative'
 */
function analyzeSentiment(text) {
  const lowerText = text.toLowerCase();
  
  // Positive keywords
  const positiveKeywords = [
    'good', 'great', 'excellent', 'progress', 'achieved', 'completed',
    'happy', 'satisfied', 'improved', 'better', 'success', 'win',
    'accomplished', 'proud', 'excited', 'motivated', 'grateful', 'thankful'
  ];
  
  // Negative keywords
  const negativeKeywords = [
    'bad', 'failed', 'struggled', 'difficult', 'problem', 'stuck',
    'worried', 'disappointed', 'frustrated', 'hard', 'challenge',
    'blocked', 'stressed', 'overwhelmed', 'stuck', 'can\'t', 'cannot'
  ];
  
  // Count positive keywords
  let positiveCount = 0;
  positiveKeywords.forEach(keyword => {
    const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
    const matches = lowerText.match(regex);
    if (matches) positiveCount += matches.length;
  });
  
  // Count negative keywords
  let negativeCount = 0;
  negativeKeywords.forEach(keyword => {
    const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
    const matches = lowerText.match(regex);
    if (matches) negativeCount += matches.length;
  });
  
  // Check for positive emojis
  const positiveEmojis = /[😊😄👍🎉✅🙂😃]/g;
  const positiveEmojiCount = (lowerText.match(positiveEmojis) || []).length;
  positiveCount += positiveEmojiCount;
  
  // Check for negative emojis
  const negativeEmojis = /[😞😢❌😔😟😕]/g;
  const negativeEmojiCount = (lowerText.match(negativeEmojis) || []).length;
  negativeCount += negativeEmojiCount;
  
  // Punctuation analysis
  // Exclamation marks often indicate positive excitement
  const exclamationCount = (text.match(/!/g) || []).length;
  if (exclamationCount > 0) positiveCount += Math.min(exclamationCount, 2);
  
  // Multiple question marks can indicate concern/frustration
  const questionCount = (text.match(/\?/g) || []).length;
  if (questionCount > 1) negativeCount += 1;
  
  // Calculate sentiment score
  const sentimentScore = positiveCount - negativeCount;
  
  // Classify sentiment
  if (sentimentScore > 0) {
    return 'Positive';
  } else if (sentimentScore < 0) {
    return 'Negative';
  } else {
    return 'Neutral';
  }
}

/**
 * Extracts 2-3 key sentences as summary bullets.
 * 
 * @param {string} text - Text to summarize
 * @returns {Array<string>} Array of 2-3 summary sentences
 */
function extractSummary(text) {
  // Split text into sentences
  // Match sentences ending with . ! or ?
  const sentences = text.split(/([.!?]+[\s\n]+)/)
    .filter(s => s.trim().length > 0)
    .reduce((acc, curr, idx, arr) => {
      // Rejoin punctuation with previous sentence
      if (/^[.!?]+[\s\n]*$/.test(curr)) {
        if (acc.length > 0) {
          acc[acc.length - 1] += curr;
        }
      } else {
        acc.push(curr.trim());
      }
      return acc;
    }, [])
    .filter(s => s.length >= 10); // Filter out very short sentences
  
  if (sentences.length === 0) {
    // If no sentences found, return first 200 chars as single bullet
    return [text.substring(0, 200).trim() + (text.length > 200 ? '...' : '')];
  }
  
  // If we have 3 or fewer sentences, return them all
  if (sentences.length <= 3) {
    return sentences;
  }
  
  // If we have more, pick the 2-3 shortest sentences (they're often most concise)
  const sortedByLength = [...sentences].sort((a, b) => a.length - b.length);
  const selected = sortedByLength.slice(0, 3);
  
  // Return in original order
  return sentences.filter(s => selected.includes(s)).slice(0, 3);
}

/**
 * Suggests a next step based on sentiment.
 * 
 * @param {string} sentimentLabel - 'Positive', 'Neutral', or 'Negative'
 * @returns {string} Suggested next step
 */
function suggestNextStep(sentimentLabel) {
  switch (sentimentLabel) {
    case 'Positive':
      return 'Reinforce this positive habit';
    case 'Negative':
      return 'Pick one small task to move forward';
    case 'Neutral':
    default:
      return 'Define your next concrete action';
  }
}

module.exports = {
  analyzeText
};

