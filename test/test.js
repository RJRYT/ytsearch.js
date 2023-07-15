const ytsearch = require("../src/main.js")

const main = async() =>{
  let results = await ytsearch("black panther")

console.log(results)
  
}
main()
