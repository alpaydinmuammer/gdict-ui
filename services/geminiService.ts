import { DictionaryEntry, WordOfTheDay, GrammarAnalysis } from "../types";

const API_BASE_URL = 'http://localhost:3001/api';

export const lookupWord = async (word: string): Promise<DictionaryEntry> => {
  try {
    const response = await fetch(`${API_BASE_URL}/lookup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ word }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return await response.json() as DictionaryEntry;
  } catch (error) {
    console.error("Lookup failed:", error);
    throw error;
  }
};

export const getDailyWord = async (): Promise<WordOfTheDay> => {
  try {
    const response = await fetch(`${API_BASE_URL}/daily-word`);

    if (!response.ok) {
      // Fallback handled in backend, but good to catch here too
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json() as WordOfTheDay;
  } catch (error) {
    console.error("Daily word fetch failed:", error);
    return { word: "Serendipity", definition_tr: "Mutlu tesadüf", context: "Finding this app was pure serendipity." };
  }
};

export const checkGrammar = async (textToAnalyze: string): Promise<GrammarAnalysis> => {
  try {
    const response = await fetch(`${API_BASE_URL}/grammar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: textToAnalyze }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return await response.json() as GrammarAnalysis;
  } catch (error) {
    console.error("Grammar check failed:", error);
    throw error;
  }
};
