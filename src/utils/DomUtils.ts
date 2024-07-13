import { IsDomElement, IsFunction } from "~/utils";

export function withMainEl (callback : (el : Element | HTMLElement | HTMLDivElement | any) => void){
    const MainAppEl = document.querySelector('#app');
    if(IsDomElement(MainAppEl) && IsFunction(callback)) callback(MainAppEl)
}