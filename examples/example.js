const ytsearch = require("ytsearch.js")

const main = async() =>{
  let results = await ytsearch("Iron man")
  
  console.log(results)

}
main()
