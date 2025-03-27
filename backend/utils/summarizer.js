const { ChatOpenAI } = require("@langchain/openai");
const { PromptTemplate } = require("@langchain/core/prompts");
const z = require("zod");

/**
 * ✅ Initialize OpenAI Model with Faster Execution
 */
const model = new ChatOpenAI({
    modelName: "gpt-4-turbo",
    temperature: 0.3, // Keeps responses structured & clear
    openAIApiKey: process.env.OPENAI_API_KEY
});

/**
 * ✅ Define AI Prompts for Bullet-Point Summaries
 */
const summaryPrompt = new PromptTemplate({
    inputVariables: ["transcript"],
    template: `
    Summarize the following transcript in a **structured bullet-point format**:
    - Use **bolded main points** for key topics.
    - Use **sub-bullets (◦)** for supporting details with double indentation.
    - Extract **technical terms** and define them simply.

    **Output Format**:
    **Bullet-Point Summary**
    **Technical Terms and Their Definitions**

    **Example Output Format**:
    
    **Bullet-Point Summary**
    **Introduction**
        • Mr. Abc, an SDE at Abc, introduces the fundamentals of database systems.
    
    **Agenda Overview**
        • Topics include general database overview, SQL, data storage, cloud computing, database management, internals of databases, and interview preparation.
    
    **Importance of Database Knowledge in Interviews**
        • Emphasis on broad knowledge in various database types and SQL for interviews.
        • Importance of demonstrating both breadth and depth of knowledge.
    
    **Types of Databases**
        • **SQL Databases**
          ◦ Traditional, relational databases with structured schema and static tables.
          ◦ Examples: Oracle, MySQL, SQL Server.
          ◦ Known for ACID properties ensuring reliable transaction processing.
        • **NoSQL Databases**
          ◦ More flexible, suitable for non-static schemas and horizontal scaling.
          ◦ Types include document, graph, and time-series databases.
          ◦ Examples: MongoDB, DynamoDB, Neo4J.

    **Technical Terms and Their Definitions**
        • **SDE (Software Development Engineer)**: A professional who applies engineering principles to software development.
        • **SQL (Structured Query Language)**: A programming language used for managing and manipulating relational databases.
        • **ACID (Atomicity, Consistency, Isolation, Durability)**: Properties that ensure reliable processing of database transactions.


    **Example Input Format 2 **:

    **Bullet-Point Summary**
    **Introduction to Cloud Computing Models**: 
        • **Overview of the three primary types of cloud services**: SaaS, IaaS, and PaaS.

    **Software as a Service (SaaS)** 
        • Defined as application access over the web, managed by a third-party vendor.
        • Benefits include avoiding software maintenance, infrastructure management, and security responsibilities.
        • Examples include Slack, Dropbox, and Google Apps (Gmail, Google Drive, Google Sheets).

    **Infrastructure as a Service (IaaS)** 
        • Provides on-demand computing and storage capabilities via the internet.
        • Operates on a pay-as-you-go billing model, where costs are based on resource usage.
        • Examples include Amazon EC2 for computing instances and Amazon DynamoDB for databases.

    **Technical Terms and Their Definitions*
        • **SaaS (Software as a Service)**: A software distribution model where applications are hosted by a third-party provider and delivered over the internet.
        • **IaaS (Infrastructure as a Service)**: Provides virtualized computing resources over the internet on a scalable, pay-as-you-go basis.
        • **PaaS (Platform as a Service)**: A cloud computing service that offers a platform for developing, running, and managing applications without the complexity of building and maintaining the underlying infrastructure.


    **Ensure the following**:
    - Main points should be bolded using "**bold text**".
    - Sub-bullets should start with "◦" and be indented.
    - Minimize use of jargon, but keep technical terms and provide examples.
    
    **Transcript**:
    {transcript}
    `
});

/**
 * 🟢 Optimized AI Summarization Function
 */
async function generateStructuredSummary(transcript) {
    try {
        console.log("📡 Processing transcript with OpenAI...");

        if (!transcript || typeof transcript !== "string" || transcript.trim() === "") {
            throw new Error("Invalid transcript input");
        }

        console.log("🔹 Generating Structured Bullet-Point Summary...");
        
        const formattedSummaryPrompt = await summaryPrompt.format({ transcript });
        const response = await model.invoke([{ role: "user", content: formattedSummaryPrompt }]);

        // Ensure the response contains text
        if (!response || !response.content) {
            console.error("❌ OpenAI API did not return valid content:", response);
            throw new Error("Invalid OpenAI response");
        }

        const summaryText = response.content;

        return { summary: summaryText };

    } catch (error) {
        console.error("❌ AI Summarization Error:", error.message);
        throw new Error("Failed to generate structured summary");
    }
}

module.exports = { generateStructuredSummary };
