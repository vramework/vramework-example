import { PermissionService } from "@vramework/backend-common/src/services";

export class Permissions implements PermissionService {
    public async validate (): Promise<boolean> {
        return true
    }
}