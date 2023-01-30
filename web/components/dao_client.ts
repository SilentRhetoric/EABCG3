import algosdk from "algosdk";
import * as bkr from "beaker-ts";
export class DAO extends bkr.ApplicationClient {
    desc: string = "";
    override appSchema: bkr.Schema = { declared: { leader: { type: bkr.AVMType.bytes, key: "leader", desc: "", static: false }, reg_begin: { type: bkr.AVMType.uint64, key: "reg_begin", desc: "", static: false }, reg_end: { type: bkr.AVMType.uint64, key: "reg_end", desc: "", static: false }, vote_begin: { type: bkr.AVMType.uint64, key: "vote_begin", desc: "", static: false }, vote_end: { type: bkr.AVMType.uint64, key: "vote_end", desc: "", static: false }, voter_token_id: { type: bkr.AVMType.uint64, key: "voter_token_id", desc: "", static: false }, board_token_id: { type: bkr.AVMType.uint64, key: "board_token_id", desc: "", static: false }, winner: { type: bkr.AVMType.bytes, key: "winner", desc: "", static: false }, yes: { type: bkr.AVMType.uint64, key: "yes", desc: "", static: false }, no: { type: bkr.AVMType.uint64, key: "no", desc: "", static: false }, proposal_text: { type: bkr.AVMType.bytes, key: "proposal_text", desc: "", static: false } }, reserved: {} };
    override acctSchema: bkr.Schema = { declared: {}, reserved: {} };
    override approvalProgram: string = "I3ByYWdtYSB2ZXJzaW9uIDgKaW50Y2Jsb2NrIDAgMQpieXRlY2Jsb2NrIDB4Nzk2NTczIDB4NmU2ZiAweDc2NmY3NDY1NWY2NTZlNjQgMHg3MDcyNmY3MDZmNzM2MTZjNWY3NDY1Nzg3NCAweDc2NmY3NDY1NWY2MjY1Njc2OTZlIDB4NzI2NTY3NWY2MjY1Njc2OTZlIDB4NzI2NTY3NWY2NTZlNjQgMHggMHg3NjZmNzQ2NTcyNWY3NDZmNmI2NTZlNWY2OTY0IDB4NjI2ZjYxNzI2NDVmNzQ2ZjZiNjU2ZTVmNjk2NCAweDc3Njk2ZTZlNjU3MiAweDZjNjU2MTY0NjU3Mgp0eG4gTnVtQXBwQXJncwppbnRjXzAgLy8gMAo9PQpibnogbWFpbl9sMTIKdHhuYSBBcHBsaWNhdGlvbkFyZ3MgMApwdXNoYnl0ZXMgMHhhY2I1YTk4OSAvLyAidm90ZShhc3NldCxzdHJpbmcpdm9pZCIKPT0KYm56IG1haW5fbDExCnR4bmEgQXBwbGljYXRpb25BcmdzIDAKcHVzaGJ5dGVzIDB4OWM3NjY0YTAgLy8gImNyZWF0ZShhc3NldCxhc3NldCl2b2lkIgo9PQpibnogbWFpbl9sMTAKdHhuYSBBcHBsaWNhdGlvbkFyZ3MgMApwdXNoYnl0ZXMgMHhkZTIzZjU4MSAvLyAicHJvcG9zYWwoYXNzZXQsc3RyaW5nKXZvaWQiCj09CmJueiBtYWluX2w5CnR4bmEgQXBwbGljYXRpb25BcmdzIDAKcHVzaGJ5dGVzIDB4ZmZlMGU0MTEgLy8gInZldG8oKXZvaWQiCj09CmJueiBtYWluX2w4CnR4bmEgQXBwbGljYXRpb25BcmdzIDAKcHVzaGJ5dGVzIDB4MmM1YmE1MTkgLy8gImZpbmFsaXplX3ZvdGUoKXZvaWQiCj09CmJueiBtYWluX2w3CmVycgptYWluX2w3Ogp0eG4gT25Db21wbGV0aW9uCmludGNfMCAvLyBOb09wCj09CnR4biBBcHBsaWNhdGlvbklECmludGNfMCAvLyAwCiE9CiYmCmFzc2VydApjYWxsc3ViIGZpbmFsaXpldm90ZV81CmludGNfMSAvLyAxCnJldHVybgptYWluX2w4Ogp0eG4gT25Db21wbGV0aW9uCmludGNfMCAvLyBOb09wCj09CnR4biBBcHBsaWNhdGlvbklECmludGNfMCAvLyAwCiE9CiYmCmFzc2VydApjYWxsc3ViIHZldG9fNAppbnRjXzEgLy8gMQpyZXR1cm4KbWFpbl9sOToKdHhuIE9uQ29tcGxldGlvbgppbnRjXzAgLy8gTm9PcAo9PQp0eG4gQXBwbGljYXRpb25JRAppbnRjXzAgLy8gMAohPQomJgphc3NlcnQKdHhuYSBBcHBsaWNhdGlvbkFyZ3MgMQppbnRjXzAgLy8gMApnZXRieXRlCnN0b3JlIDQKdHhuYSBBcHBsaWNhdGlvbkFyZ3MgMgpzdG9yZSA1CmxvYWQgNApsb2FkIDUKY2FsbHN1YiBwcm9wb3NhbF8zCmludGNfMSAvLyAxCnJldHVybgptYWluX2wxMDoKdHhuIE9uQ29tcGxldGlvbgppbnRjXzAgLy8gTm9PcAo9PQp0eG4gQXBwbGljYXRpb25JRAppbnRjXzAgLy8gMAo9PQomJgphc3NlcnQKdHhuYSBBcHBsaWNhdGlvbkFyZ3MgMQppbnRjXzAgLy8gMApnZXRieXRlCnN0b3JlIDIKdHhuYSBBcHBsaWNhdGlvbkFyZ3MgMgppbnRjXzAgLy8gMApnZXRieXRlCnN0b3JlIDMKbG9hZCAyCmxvYWQgMwpjYWxsc3ViIGNyZWF0ZV8yCmludGNfMSAvLyAxCnJldHVybgptYWluX2wxMToKdHhuIE9uQ29tcGxldGlvbgppbnRjXzAgLy8gTm9PcAo9PQp0eG4gQXBwbGljYXRpb25JRAppbnRjXzAgLy8gMAohPQomJgphc3NlcnQKdHhuYSBBcHBsaWNhdGlvbkFyZ3MgMQppbnRjXzAgLy8gMApnZXRieXRlCnN0b3JlIDAKdHhuYSBBcHBsaWNhdGlvbkFyZ3MgMgpzdG9yZSAxCmxvYWQgMApsb2FkIDEKY2FsbHN1YiB2b3RlXzEKaW50Y18xIC8vIDEKcmV0dXJuCm1haW5fbDEyOgp0eG4gT25Db21wbGV0aW9uCmludGNfMSAvLyBPcHRJbgo9PQpibnogbWFpbl9sMTQKZXJyCm1haW5fbDE0Ogp0eG4gQXBwbGljYXRpb25JRAppbnRjXzAgLy8gMAohPQphc3NlcnQKY2FsbHN1YiBvcHRpbl8wCmludGNfMSAvLyAxCnJldHVybgoKLy8gb3B0X2luCm9wdGluXzA6CnJldHN1YgoKLy8gdm90ZQp2b3RlXzE6CnN0b3JlIDcKc3RvcmUgNgpsb2FkIDYKdHhuYXMgQXNzZXRzCmJ5dGVjIDggLy8gInZvdGVyX3Rva2VuX2lkIgphcHBfZ2xvYmFsX2dldAo9PQphc3NlcnQKdHhuIFNlbmRlcgpsb2FkIDYKYXNzZXRfaG9sZGluZ19nZXQgQXNzZXRCYWxhbmNlCnN0b3JlIDkKc3RvcmUgOApsb2FkIDkKbG9hZCA4CmludGNfMCAvLyAwCj4KJiYKYXNzZXJ0Cmdsb2JhbCBMYXRlc3RUaW1lc3RhbXAKYnl0ZWMgNCAvLyAidm90ZV9iZWdpbiIKYXBwX2dsb2JhbF9nZXQKPj0KYXNzZXJ0Cmdsb2JhbCBMYXRlc3RUaW1lc3RhbXAKYnl0ZWNfMiAvLyAidm90ZV9lbmQiCmFwcF9nbG9iYWxfZ2V0CjwKYXNzZXJ0CmxvYWQgNwpleHRyYWN0IDIgMApieXRlY18wIC8vICJ5ZXMiCj09CmJueiB2b3RlXzFfbDQKbG9hZCA3CmV4dHJhY3QgMiAwCmJ5dGVjXzEgLy8gIm5vIgo9PQpibnogdm90ZV8xX2wzCmludGNfMSAvLyAxCnJldHVybgp2b3RlXzFfbDM6CmJ5dGVjXzEgLy8gIm5vIgpieXRlY18xIC8vICJubyIKYXBwX2dsb2JhbF9nZXQKaW50Y18xIC8vIDEKKwphcHBfZ2xvYmFsX3B1dApiIHZvdGVfMV9sNQp2b3RlXzFfbDQ6CmJ5dGVjXzAgLy8gInllcyIKYnl0ZWNfMCAvLyAieWVzIgphcHBfZ2xvYmFsX2dldAppbnRjXzEgLy8gMQorCmFwcF9nbG9iYWxfcHV0CnZvdGVfMV9sNToKcmV0c3ViCgovLyBjcmVhdGUKY3JlYXRlXzI6CnN0b3JlIDExCnN0b3JlIDEwCmJ5dGVjIDExIC8vICJsZWFkZXIiCmdsb2JhbCBDcmVhdG9yQWRkcmVzcwphcHBfZ2xvYmFsX3B1dApieXRlYyA1IC8vICJyZWdfYmVnaW4iCmludGNfMCAvLyAwCmFwcF9nbG9iYWxfcHV0CmJ5dGVjIDYgLy8gInJlZ19lbmQiCmludGNfMCAvLyAwCmFwcF9nbG9iYWxfcHV0CmJ5dGVjIDQgLy8gInZvdGVfYmVnaW4iCmludGNfMCAvLyAwCmFwcF9nbG9iYWxfcHV0CmJ5dGVjXzIgLy8gInZvdGVfZW5kIgppbnRjXzAgLy8gMAphcHBfZ2xvYmFsX3B1dApieXRlYyA4IC8vICJ2b3Rlcl90b2tlbl9pZCIKaW50Y18wIC8vIDAKYXBwX2dsb2JhbF9wdXQKYnl0ZWMgOSAvLyAiYm9hcmRfdG9rZW5faWQiCmludGNfMCAvLyAwCmFwcF9nbG9iYWxfcHV0CmJ5dGVjIDEwIC8vICJ3aW5uZXIiCmJ5dGVjIDcgLy8gIiIKYXBwX2dsb2JhbF9wdXQKYnl0ZWNfMCAvLyAieWVzIgppbnRjXzAgLy8gMAphcHBfZ2xvYmFsX3B1dApieXRlY18xIC8vICJubyIKaW50Y18wIC8vIDAKYXBwX2dsb2JhbF9wdXQKYnl0ZWNfMyAvLyAicHJvcG9zYWxfdGV4dCIKYnl0ZWMgNyAvLyAiIgphcHBfZ2xvYmFsX3B1dApieXRlYyA4IC8vICJ2b3Rlcl90b2tlbl9pZCIKbG9hZCAxMAp0eG5hcyBBc3NldHMKYXBwX2dsb2JhbF9wdXQKYnl0ZWMgOSAvLyAiYm9hcmRfdG9rZW5faWQiCmxvYWQgMTEKdHhuYXMgQXNzZXRzCmFwcF9nbG9iYWxfcHV0CnJldHN1YgoKLy8gcHJvcG9zYWwKcHJvcG9zYWxfMzoKc3RvcmUgMTMKc3RvcmUgMTIKbG9hZCAxMgp0eG5hcyBBc3NldHMKYnl0ZWMgOSAvLyAiYm9hcmRfdG9rZW5faWQiCmFwcF9nbG9iYWxfZ2V0Cj09CmFzc2VydAp0eG4gU2VuZGVyCmxvYWQgMTIKYXNzZXRfaG9sZGluZ19nZXQgQXNzZXRCYWxhbmNlCnN0b3JlIDE1CnN0b3JlIDE0CmxvYWQgMTUKbG9hZCAxNAppbnRjXzAgLy8gMAo+CiYmCmFzc2VydApieXRlY18zIC8vICJwcm9wb3NhbF90ZXh0Igpsb2FkIDEzCmV4dHJhY3QgMiAwCmFwcF9nbG9iYWxfcHV0CmJ5dGVjIDUgLy8gInJlZ19iZWdpbiIKZ2xvYmFsIExhdGVzdFRpbWVzdGFtcAphcHBfZ2xvYmFsX3B1dApieXRlYyA2IC8vICJyZWdfZW5kIgpnbG9iYWwgTGF0ZXN0VGltZXN0YW1wCnB1c2hpbnQgMTAwIC8vIDEwMAorCmFwcF9nbG9iYWxfcHV0CmJ5dGVjIDQgLy8gInZvdGVfYmVnaW4iCmdsb2JhbCBMYXRlc3RUaW1lc3RhbXAKYXBwX2dsb2JhbF9wdXQKYnl0ZWNfMiAvLyAidm90ZV9lbmQiCmdsb2JhbCBMYXRlc3RUaW1lc3RhbXAKcHVzaGludCAxMDAwMDAwMDAwIC8vIDEwMDAwMDAwMDAKKwphcHBfZ2xvYmFsX3B1dApyZXRzdWIKCi8vIHZldG8KdmV0b180Ogp0eG4gU2VuZGVyCmJ5dGVjIDExIC8vICJsZWFkZXIiCmFwcF9nbG9iYWxfZ2V0Cj09CmFzc2VydApieXRlY18zIC8vICJwcm9wb3NhbF90ZXh0IgpieXRlYyA3IC8vICIiCmFwcF9nbG9iYWxfcHV0CmJ5dGVjIDUgLy8gInJlZ19iZWdpbiIKaW50Y18wIC8vIDAKYXBwX2dsb2JhbF9wdXQKYnl0ZWMgNiAvLyAicmVnX2VuZCIKaW50Y18wIC8vIDAKYXBwX2dsb2JhbF9wdXQKYnl0ZWMgNCAvLyAidm90ZV9iZWdpbiIKaW50Y18wIC8vIDAKYXBwX2dsb2JhbF9wdXQKYnl0ZWNfMiAvLyAidm90ZV9lbmQiCmludGNfMCAvLyAwCmFwcF9nbG9iYWxfcHV0CmJ5dGVjXzAgLy8gInllcyIKaW50Y18wIC8vIDAKYXBwX2dsb2JhbF9wdXQKYnl0ZWNfMSAvLyAibm8iCmludGNfMCAvLyAwCmFwcF9nbG9iYWxfcHV0CnJldHN1YgoKLy8gZmluYWxpemVfdm90ZQpmaW5hbGl6ZXZvdGVfNToKZ2xvYmFsIExhdGVzdFRpbWVzdGFtcApieXRlY18yIC8vICJ2b3RlX2VuZCIKYXBwX2dsb2JhbF9nZXQKPgphc3NlcnQKYnl0ZWNfMCAvLyAieWVzIgphcHBfZ2xvYmFsX2dldApieXRlY18xIC8vICJubyIKYXBwX2dsb2JhbF9nZXQKPgpibnogZmluYWxpemV2b3RlXzVfbDIKYnl0ZWMgMTAgLy8gIndpbm5lciIKcHVzaGJ5dGVzIDB4NmU2ZjNhMjAgLy8gIm5vOiAiCmJ5dGVjXzMgLy8gInByb3Bvc2FsX3RleHQiCmFwcF9nbG9iYWxfZ2V0CmNvbmNhdAphcHBfZ2xvYmFsX3B1dApiIGZpbmFsaXpldm90ZV81X2wzCmZpbmFsaXpldm90ZV81X2wyOgpieXRlYyAxMCAvLyAid2lubmVyIgpwdXNoYnl0ZXMgMHg3OTY1NzMzYTIwIC8vICJ5ZXM6ICIKYnl0ZWNfMyAvLyAicHJvcG9zYWxfdGV4dCIKYXBwX2dsb2JhbF9nZXQKY29uY2F0CmFwcF9nbG9iYWxfcHV0CmZpbmFsaXpldm90ZV81X2wzOgpieXRlY18zIC8vICJwcm9wb3NhbF90ZXh0IgpieXRlYyA3IC8vICIiCmFwcF9nbG9iYWxfcHV0CmJ5dGVjIDUgLy8gInJlZ19iZWdpbiIKaW50Y18wIC8vIDAKYXBwX2dsb2JhbF9wdXQKYnl0ZWMgNiAvLyAicmVnX2VuZCIKaW50Y18wIC8vIDAKYXBwX2dsb2JhbF9wdXQKYnl0ZWMgNCAvLyAidm90ZV9iZWdpbiIKaW50Y18wIC8vIDAKYXBwX2dsb2JhbF9wdXQKYnl0ZWNfMiAvLyAidm90ZV9lbmQiCmludGNfMCAvLyAwCmFwcF9nbG9iYWxfcHV0CmJ5dGVjXzAgLy8gInllcyIKaW50Y18wIC8vIDAKYXBwX2dsb2JhbF9wdXQKYnl0ZWNfMSAvLyAibm8iCmludGNfMCAvLyAwCmFwcF9nbG9iYWxfcHV0CnJldHN1Yg==";
    override clearProgram: string = "I3ByYWdtYSB2ZXJzaW9uIDgKcHVzaGludCAwIC8vIDAKcmV0dXJu";
    override methods: algosdk.ABIMethod[] = [
        new algosdk.ABIMethod({ name: "vote", desc: "", args: [{ type: "asset", name: "voter_token", desc: "" }, { type: "string", name: "vote", desc: "" }], returns: { type: "void", desc: "" } }),
        new algosdk.ABIMethod({ name: "create", desc: "", args: [{ type: "asset", name: "voter_token", desc: "" }, { type: "asset", name: "board_token", desc: "" }], returns: { type: "void", desc: "" } }),
        new algosdk.ABIMethod({ name: "proposal", desc: "", args: [{ type: "asset", name: "board_token", desc: "" }, { type: "string", name: "proposal", desc: "" }], returns: { type: "void", desc: "" } }),
        new algosdk.ABIMethod({ name: "veto", desc: "", args: [], returns: { type: "void", desc: "" } }),
        new algosdk.ABIMethod({ name: "finalize_vote", desc: "", args: [], returns: { type: "void", desc: "" } })
    ];
    async vote(args: {
        voter_token: bigint;
        vote: string;
    }, txnParams?: bkr.TransactionOverrides): Promise<bkr.ABIResult<void>> {
        const result = await this.execute(await this.compose.vote({ voter_token: args.voter_token, vote: args.vote }, txnParams));
        return new bkr.ABIResult<void>(result);
    }
    // async create(args: {
    //     voter_token: bigint;
    //     board_token: bigint;
    // }, txnParams?: bkr.TransactionOverrides): Promise<bkr.ABIResult<void>> {
    //     const result = await this.execute(await this.compose.create({ voter_token: args.voter_token, board_token: args.board_token }, txnParams));
    //     return new bkr.ABIResult<void>(result);
    // }
    async proposal(args: {
        board_token: bigint;
        proposal: string;
    }, txnParams?: bkr.TransactionOverrides): Promise<bkr.ABIResult<void>> {
        const result = await this.execute(await this.compose.proposal({ board_token: args.board_token, proposal: args.proposal }, txnParams));
        return new bkr.ABIResult<void>(result);
    }
    async veto(txnParams?: bkr.TransactionOverrides): Promise<bkr.ABIResult<void>> {
        const result = await this.execute(await this.compose.veto(txnParams));
        return new bkr.ABIResult<void>(result);
    }
    async finalize_vote(txnParams?: bkr.TransactionOverrides): Promise<bkr.ABIResult<void>> {
        const result = await this.execute(await this.compose.finalize_vote(txnParams));
        return new bkr.ABIResult<void>(result);
    }
    compose = {
        vote: async (args: {
            voter_token: bigint;
            vote: string;
        }, txnParams?: bkr.TransactionOverrides, atc?: algosdk.AtomicTransactionComposer): Promise<algosdk.AtomicTransactionComposer> => {
            return this.addMethodCall(algosdk.getMethodByName(this.methods, "vote"), { voter_token: args.voter_token, vote: args.vote }, txnParams, atc);
        },
        create: async (args: {
            voter_token: bigint;
            board_token: bigint;
        }, txnParams?: bkr.TransactionOverrides, atc?: algosdk.AtomicTransactionComposer): Promise<algosdk.AtomicTransactionComposer> => {
            return this.addMethodCall(algosdk.getMethodByName(this.methods, "create"), { voter_token: args.voter_token, board_token: args.board_token }, txnParams, atc);
        },
        proposal: async (args: {
            board_token: bigint;
            proposal: string;
        }, txnParams?: bkr.TransactionOverrides, atc?: algosdk.AtomicTransactionComposer): Promise<algosdk.AtomicTransactionComposer> => {
            return this.addMethodCall(algosdk.getMethodByName(this.methods, "proposal"), { board_token: args.board_token, proposal: args.proposal }, txnParams, atc);
        },
        veto: async (txnParams?: bkr.TransactionOverrides, atc?: algosdk.AtomicTransactionComposer): Promise<algosdk.AtomicTransactionComposer> => {
            return this.addMethodCall(algosdk.getMethodByName(this.methods, "veto"), {}, txnParams, atc);
        },
        finalize_vote: async (txnParams?: bkr.TransactionOverrides, atc?: algosdk.AtomicTransactionComposer): Promise<algosdk.AtomicTransactionComposer> => {
            return this.addMethodCall(algosdk.getMethodByName(this.methods, "finalize_vote"), {}, txnParams, atc);
        }
    };
}
