import { FetchData, IsArray, IsDomElement, IsEmpty, IsObj } from "~/utils";
import { withMainEl } from "~/utils/DomUtils"
import { StoreInterface, WalletInterface } from "~/utils/interfaces";
import Table from "./Table";

export default (store : StoreInterface, itemCallback : (item : object | any) => void) => {

    withMainEl((main)=>{
        const table = main.querySelector('#wallets_table');
        const actionBtn = document.createElement('div');
        actionBtn.classList.add('btn')
        actionBtn.style.width = '2rem';
        actionBtn.style.height = '2rem';
        actionBtn.style.padding = '0.25rem';
        actionBtn.innerHTML = `<img src="/arrow-right.svg" />`
        const TableInstance = Table({
            el : table,
            titleKeys : [
                {
                    label : "Net Profit",
                    key : "netProfit",
                    perfix : '$',
                    sort : true,
                    fold: true,
                    width : '35%'
                },
                {
                    label : "Wallet Address",
                    key : "walletAddress",
                    fold: true,
                    width : '55%'
                }
            ],
            rowAction: {
                callback : itemCallback,
                el : actionBtn
            },
            fetchData : GetWallets,
            pageItemCount: 5
        });
        TableInstance.init()
    })
    
    function GetWallets(page : number, limit = 50){
        return new Promise((res, rej) => {
            store.set("isWalletsLoading", true)
            FetchData('https://onchain.dextrading.com/valuable_wallets',{
                network: "eth",
                page: page + 1,
                limit: limit
            }).then(data => {
                store.set("wallets", data)
                res(data)
            }).catch(rej).finally(()=>{
                store.set("isWalletsLoading", false)
            })
        })
    }

}