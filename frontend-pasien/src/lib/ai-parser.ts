export function parseAiResponse(rawString: string) {
  let patientContext = null;
  let analysis = null;

  try {
    // 1. Extract patient context
    const pcMatch = rawString.match(/patient context:\s*(\{.*?\})\s*analysis:/is);
    if (pcMatch && pcMatch[1]) {
      patientContext = JSON.parse(pcMatch[1].replace(/[\r\n]+/g, ' '));
    }

    // 2. Extract analysis
    let cleanStr = rawString;
    const analysisIdx = cleanStr.indexOf('analysis:');
    if (analysisIdx !== -1) {
      cleanStr = cleanStr.substring(analysisIdx);
    }

    const startIdx = cleanStr.indexOf('{');
    const endIdx = cleanStr.lastIndexOf('}');

    if (startIdx !== -1 && endIdx !== -1 && startIdx < endIdx) {
      let extractedJsonStr = cleanStr.substring(startIdx, endIdx + 1);
      extractedJsonStr = extractedJsonStr.replace(/^```json/i, '').replace(/```$/, '').trim();
      extractedJsonStr = extractedJsonStr.replace(/[\r\n]+/g, ' ');
      
      analysis = JSON.parse(extractedJsonStr);
    } else {
      // Fallback
      analysis = JSON.parse(cleanStr);
    }
  } catch (e) {
    console.error("Failed to parse AI raw string:", e);
  }

  return { patientContext, analysis };
}
