import { vectorStorePromise } from './vectorStore';
import { Document } from 'langchain/document';

async function testRetrieval() {
  try {
    // 1. Get the vector store instance
    console.log('Getting vector store...');
    const vectorStore = await vectorStorePromise;

    // Test parameters
    const testQuestion = "what is the introduction part about?"; // Replace with a relevant question
    const testCreatorId = "8f6315f1-4732-47b8-bc62-d93deb2df810"; // Replace with a real creator ID (from metadata)
    const k = 3; // Number of documents to retrieve

    // 2. Create a retriever with metadata filtering
    console.log('Creating retriever...');
    const retriever = vectorStore.asRetriever(k, {
      filter: { creator_id: testCreatorId }, // Filters on metadata.creator_id
    });

    // 3. Get relevant documents
    console.log(`\nRetrieving documents for question: "${testQuestion}"`);
    const docs: Document[] = await retriever.getRelevantDocuments(testQuestion);

    // 4. Log results
    console.log(`\nFound ${docs.length} relevant documents:`);
    docs.forEach((doc, index) => {
      console.log(`\nDocument ${index + 1}:`);
      console.log('Content:', doc.pageContent);
      console.log('Metadata:', JSON.stringify(doc.metadata, null, 2));
    });

  } catch (error) {
    console.error('Error during retrieval test:', error);
  }
}

// Run the test
testRetrieval().then(() => {
  console.log('\nTest completed');
  process.exit(0);
}).catch(error => {
  console.error('Test failed:', error);
  process.exit(1);
});
