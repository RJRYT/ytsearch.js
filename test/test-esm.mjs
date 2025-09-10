import extractData from "ytsearch.js";

async function testESM() {
  try {
    const query = "rick astley never gonna give you up";
    const results = await extractData(query);
    console.log("ESM Test Results:");
    console.log(results[0]); 
    if (results.length > 0 && results[0].type === "video") {
      console.log("Test Passed: Valid video data received.");
    } else {
      console.error("Test Failed: No valid results.");
    }
  } catch (error) {
    console.error("ESM Test Error:", error.message);
  }
}

testESM();
