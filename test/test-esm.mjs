import {SearchYt} from "../dist/main.mjs";

async function testESM() {
  try {
    const query = "rick astley never gonna give you up";
    const results = await SearchYt(query, { type: "video" });
    console.log("ESM Test Results:(Count:", results.length + ")");
    console.log(results[0]);
    if (results.length > 0 && results[0].type === "video") {
      console.log("Test Passed: Valid video data received.");
    } else {
      console.error("Test Failed: No valid results.");
    }
  } catch (error) {
    console.error("ESM Test Error:", error);
  }
}

testESM();
