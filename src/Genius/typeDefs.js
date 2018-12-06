import path from 'path'
import {importSchema} from 'graphql-import'
export const typeDefs = importSchema(path.resolve(__dirname, '../../schemas/genius.graphql'))
