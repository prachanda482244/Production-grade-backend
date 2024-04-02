import { connect } from "mongoose"
import { DB_NAME } from "../constants.js"

const connectToDb = async()=>{
      try {
          const connectionInstance = await connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log(`MongoDb Connected:: DBHost ${connectionInstance.connection.host}`);

      } catch (error) {
            console.error("MONGODB_CONNECTION_ERRORS: ", error)
            process.exit(1)
      }
}
export default connectToDb