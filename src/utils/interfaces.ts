export interface WalletInterface {
    walletAddress?: string,
    networkId?: string,
    winRate?: number,
    netProfit?: number,
    avgHoldingTime?: number,
    buyAmountLabel?: string,
    age?: number,
    dayActive?: number,
    SwapTime?: Array<string>,
    TotalFee?: number,
    BotActivity?: string,
    details?: string,
    totalnumPartiallyClosedData?: number,
    totalNumofFullyOpenedData?: number,
    totalTransactions?: number,
    HotTokenHolders?: Array<any>,
    firstTopTokenHolder?: string,
    rank?: number
}

export type StoreInterface = {
    wallets : Array<WalletInterface>,
    isWalletsLoading : boolean,
    set : (key : keyof StoreInterface , val : any) => void
}
