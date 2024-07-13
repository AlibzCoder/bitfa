import { withMainEl } from "~/utils/DomUtils";
import WalletTable from "./WalletTable";
import { StoreInterface } from "~/utils/interfaces";
import Grapghs, { GraphData } from "./Grapghs";
import { FetchData } from "~/utils";

export default (store : StoreInterface) => {
    withMainEl(()=>{
        const wTableEl = document.getElementById('wallets_table');
        const wChartEl = document.getElementById('wallet_chart');
        const wChartLoader = document.getElementById('graph_loader');
        const wChartBack = document.getElementById('graph_back');
        if(wChartEl && wTableEl && wChartLoader && wChartBack){
            wChartEl.style.setProperty('display', 'none', 'important');
            const Grapgh = Grapghs(store); 
            WalletTable(store, walletTableCallback)
            function walletTableCallback(item : object | any){
                if(Grapgh && wChartEl && wTableEl && wChartLoader && wChartBack){
                    wTableEl.style.setProperty('display', 'none', 'important');
                    wChartEl.style.setProperty('display', '');
                    wChartLoader.style.setProperty('display', '');
                    Grapgh.reset()
                    GetWalletTransaction(item?.walletAddress).then((data : GraphData | any) => {
                        if(Grapgh) Grapgh.render(data)
                    }).catch(()=>{
                        wTableEl.style.setProperty('display', '');
                        wChartEl.style.setProperty('display', 'none', 'important');
                    }).finally(()=>{
                        wChartLoader.style.setProperty('display', 'none', 'important');
                    })
                }
            }
            wChartBack.onclick = () => {
                wTableEl.style.setProperty('display', '');
                wChartEl.style.setProperty('display', 'none', 'important');
                wChartLoader.style.setProperty('display', 'none', 'important');
            }
        }
    })

    function GetWalletTransaction(walletId : string){
        return new Promise((res, rej) => {
            FetchData(`https://onchain.dextrading.com/walletsummary/${walletId}`,{ network: "eth" }).then(data => res(data)).catch(rej)
        })
    }
}