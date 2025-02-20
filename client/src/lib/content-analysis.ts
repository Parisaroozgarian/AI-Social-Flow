import { apiRequest } from "./queryClient";
import { ContentAnalysis, InsertContentAnalysis } from "@shared/schema";

export async function analyzeContent(data: InsertContentAnalysis): Promise<ContentAnalysis> {
  try {
    const res = await apiRequest("POST", "/api/analyze", data);
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Failed to analyze content');
    }
    return res.json();
  } catch (error) {
    console.error('Analysis error:', error);
    throw error;
  }
}

export async function getAnalyses(): Promise<ContentAnalysis[]> {
  try {
    const res = await apiRequest("GET", "/api/analyses");
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Failed to fetch analyses');
    }
    return res.json();
  } catch (error) {
    console.error('Fetch analyses error:', error);
    throw error;
  }
}