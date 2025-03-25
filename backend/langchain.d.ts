// declare module 'langchain/llms/openai' {
//     export class OpenAI {
//         constructor(apiKey: string);
//         generateSummary(text: string): Promise<string>;
//     }
// }

// declare module 'langchain/prompts' {
//     export class PromptTemplate {
//         constructor(template: string);
//     }
// }

// declare module 'langchain/chains' {
//     export class LLMChain {
//         constructor(llm: any, prompt: any);
//         call(input: any): Promise<any>;
//     }
// }