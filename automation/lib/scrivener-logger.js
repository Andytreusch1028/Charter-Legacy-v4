/**
 * Scrivener Logger - Standardized PBP Logging
 * Enforces structured output for audit trails.
 */
export function scrivenerLog(phase, message, data = null) {
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [${phase.toUpperCase()}]`;
  console.log(`${prefix} ${message}`);
  
  if (data) {
    if (data instanceof Error) {
      console.error(`${prefix} ERROR DETAIL:`, data.message);
    } else {
      console.dir(data, { depth: null, colors: true });
    }
  }
}
