const NODE_ENV: string = process.env.NODE_ENV || "development"
const MONGODB_URI: string = process.env.MONGODB_URI || ""

export {
    NODE_ENV,
    MONGODB_URI
}