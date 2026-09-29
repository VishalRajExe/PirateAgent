/**
 * Define the configurable parameters for the agent.
 */

import { RunnableConfig } from "@langchain/core/runnables";
import { Annotation } from "@langchain/langgraph";
import { MAIN_PROMPT } from "./prompts.js";

/**
 * The complete configuration for the agent.
 */
export const ConfigurationAnnotation = Annotation.Root({
  /**
   * The name of the language model to use for the agent.
   *
   * Should be in the form: provider/model-name.
   */
  model: Annotation<string>,

  /**
   * The main prompt template to use for the agent's interactions.
   *
   * Expects two template literals: ${info} and ${topic}.
   */
  prompt: Annotation<string>,

  /**
   * The maximum number of search results to return for each search query.
   */
  maxSearchResults: Annotation<number>,

  /**
   * The maximum number of times the Info tool can be called during a single interaction.
   */
  maxInfoToolCalls: Annotation<number>,

  /**
   * The maximum number of interaction loops allowed before the agent terminates.
   */
  maxLoops: Annotation<number>,
});

/**
 * Create a typeof ConfigurationAnnotation.State instance from a RunnableConfig object.
 *
 * @param config - The configuration object to use.
 * @returns An instance of typeof ConfigurationAnnotation.State with the specified configuration.
 */
export function ensureConfiguration(
  config?: RunnableConfig,
): typeof ConfigurationAnnotation.State {
  const configurable = (config?.configurable ?? {}) as Partial<
    typeof ConfigurationAnnotation.State
  >;

  const defaultModel = process.env.ANTHROPIC_API_KEY
    ? "anthropic/claude-3-5-sonnet-20240620"
    : (process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY)
      ? "google-genai/gemini-2.5-flash"
      : (process.env.OPENAI_API_KEY ? "openai/gpt-4o-mini" : "anthropic/claude-3-5-sonnet-20240620");

  return {
    model: configurable.model ?? defaultModel,
    prompt: configurable.prompt ?? MAIN_PROMPT,
    maxSearchResults: configurable.maxSearchResults ?? 5,
    maxInfoToolCalls: configurable.maxInfoToolCalls ?? 3,
    maxLoops: configurable.maxLoops ?? 6,
  };
}
