// In-memory store for analysis results.
// In a real production app, this would be replaced with a database like Redis or a persistent key-value store.

import { RepositoryAnalysis } from "@/types/analysis";

const analysisResults = new Map<string, RepositoryAnalysis>();

export default analysisResults; 