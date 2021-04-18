import { JWTService, Logger } from "@vramework/backend-common/src/services";
import { PGDatabase } from "./database-postgres";

export class JWTManager implements JWTService {
    
    constructor (database: PGDatabase, logger: Logger) {

    }

    public async init () {

    }

    public async getJWTSecret () {

    }
    
    public getUserSession () {

    }
    
}