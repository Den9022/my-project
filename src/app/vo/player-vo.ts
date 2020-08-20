import { UserVo } from "./user-vo";

export class PlayerVo {

    public userData: UserVo;
    public teammateId: number;
    public selections: number[];

    // Utólag számított értékek
    public selectionSentTo: boolean;
    public selectionReceivedFrom: boolean;
    public myTeammate: boolean;
    public disabled: boolean;

}