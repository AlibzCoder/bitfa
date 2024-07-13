import { IsArray, IsDomElement, IsEmpty, IsFunction, IsObj } from "~/utils"

interface TableProps {
    el : HTMLElement | Element | any,
    titleKeys: Array<{
        label : string,
        key : string,
        perfix?: string,
        sort? : boolean,
        fold?: boolean,
        width?: string
    }>,
    rowAction?: {
        callback : (item : object | any) => void,
        el : HTMLElement
    },
    maxPaginationDisplay?: number,
    pageItemCount?: number,
    fetchData : (page : number, limit : number) => Promise<any>
}

export default ({
    el, titleKeys, rowAction, fetchData, 
    maxPaginationDisplay = 5,
    pageItemCount = 10
} : TableProps) => {

    if(!IsDomElement(el)) return {
        init : () => false
    }

    const tableEl = document.createElement('table');
    let initiated = false;
    let dataEls : Array<Element | HTMLElement | any>[] = [];
    let dataRowsEls : Array<Element | HTMLElement | any> = [];
    let noDataTr : HTMLElement | Element | any;
    let loaderTr : HTMLElement | Element | any;
    let pagePrevEl : HTMLElement | Element | any;
    let pageNextEl : HTMLElement | Element | any;
    let pagesBtns : Array<Element | HTMLElement | any> = [];
    let currentPage = 0;
    let list : Array<object | any> = [];
    let isLoading = false;
    let activeSort = {key : '', sort: 'ac'};
    function createLoaderAndUnloader(){
        noDataTr = document.createElement('tr')
        loaderTr = document.createElement('tr')

        noDataTr.classList.add("wallets-table-temp-tr", "table-no-data")
        loaderTr.classList.add("wallets-table-temp-tr", "table-loader")
        noDataTr.innerHTML = `
            <td class="d-flex flex-center flex-column no-data-loader">
                <span>No Data</span>
                <img src="/empty-file.svg" />
            </td>
        `
        loaderTr.innerHTML = `
            <td class="d-flex flex-center flex-column no-data-loader">
                <span class="loader"></span>
            </td>
        `
        loaderTr.style.display = 'none';
        tableEl.insertAdjacentElement('afterbegin', noDataTr)
        tableEl.insertAdjacentElement('afterbegin', loaderTr)
    }
    function initHeaders(){
        const tr = document.createElement('tr');
        titleKeys.forEach(item => {
            const th = document.createElement('th');
            const div = document.createElement('div')
            div.classList.add('d-flex', 'flex-between', 'flex-center')
            if(item?.fold) th.classList.add('td-fold')
            if(item?.width) th.style.width = item?.width
            div.innerHTML = item.label
            if(item.sort){
                let icon = document.createElement('img');
                icon.style.height = icon.style.width = '1.5rem';
                icon.style.cursor = 'pointer';
                icon.style.padding = '2%';
                icon.dataset["sort"] = "ac";
                icon.src = "/sort-ac.svg"
                icon.onclick = (e) => {
                    const el = e.target as HTMLElement;
                    el.style.transform = `rotate(${(el.dataset.sort === 'ac' ? 1 : 0) * 180}deg)`
                    el.dataset.sort = el.dataset.sort === 'ac' ? 'dc' : 'ac';
                    toggleSort(item.key, el.dataset.sort === 'ac')
                }
                activeSort = {
                    key : item.key,
                    sort : 'ac'
                }
                div.appendChild(icon)
            }
            th.appendChild(div);
            tr.appendChild(th)
        })
        if(rowAction){
            const th = document.createElement('th');
            th.classList.add('td-action')
            tr.appendChild(th)
        }
        tableEl.insertAdjacentElement('afterbegin', tr)
    }
    function initPagination(){
        const p = document.createElement('div');
        const pagesBtnsEl = document.createElement('div');
        pagePrevEl = document.createElement('div');
        pageNextEl = document.createElement('div');
        p.classList.add("table-paginations")
        pagePrevEl.classList.add('pagination-prev', 'pagination-btn', 'btn', 'btn-round-outline', 'disabled')
        pageNextEl.classList.add('pagination-next', 'pagination-btn', 'btn', 'btn-round-outline')
        pagesBtnsEl.classList.add('d-flex')
        pagePrevEl.innerHTML = pageNextEl.innerHTML = `<img src="/arrow-right.svg" />`;
        p.appendChild(pagePrevEl)
        p.appendChild(pagesBtnsEl)
        p.appendChild(pageNextEl)
        for(let i = 0; i < maxPaginationDisplay; i++){
            const pbtn = document.createElement('div');
            pbtn.classList.add('pagination-btn', 'btn', 'btn-round-outline')
            pbtn.innerHTML = `<span>${i + 1}</span>`
            pbtn.dataset['page'] = '' + (i);
            pbtn.onclick = (e) => {
                pagesBtns.forEach(el => el.classList.remove('active'));
                Instance.runFetch(Number(pbtn.dataset.page))
                if(e.target instanceof Element) e.target.classList.add('active')
            }
            if(i === currentPage) pbtn.classList.add('active')
            pagesBtnsEl.appendChild(pbtn)
            pagesBtns.push(pbtn)
        }

        el.appendChild(p);
    }
    function hideRows(hide = true){
        return new Promise((res)=>{
            dataRowsEls.forEach((tr, i) => {
                if(IsDomElement(tr)){
                    tr.style.display = hide ? 'none' : ''
                }
                if(dataRowsEls.length - 1 === i) res(true)
            })
        })
    }
    function updatePagination(){
        const middle = Math.round(maxPaginationDisplay / 2) - 1;
        let max = currentPage >= middle ? currentPage + (middle + 1) : (maxPaginationDisplay - 1)
        let min = currentPage >= middle ? currentPage - middle : 0
        const pages = Array.from({length: max - min + 1}, (_, a) => a + min)
        pagesBtns.forEach(el => el.classList.remove('active'));
        for(let i = 0; i < maxPaginationDisplay; i++){
            pagesBtns[i].innerHTML = `<span>${pages[i] + 1}</span>`
            pagesBtns[i].dataset['page'] = '' + (pages[i]);
            if(pages[i] === currentPage) pagesBtns[i].classList.add('active')
        }
    }
    function toggleSort(key : string, ac : boolean){
        if(IsArray(list) && list.length > 0 && !isLoading){
            list.sort((a, b) => ac ? a[key] - b[key] : b[key] - a[key]);
            Instance.UpdateTable(list)
        }
    }

    const Instance = {
        init(){
            if(IsDomElement(el)){
                el.appendChild(tableEl)
                createLoaderAndUnloader()
                initHeaders()
                initPagination()
                pagePrevEl.onclick = () => currentPage > 0 ? this.runFetch(currentPage - 1) : null
                pageNextEl.onclick = () => this.runFetch(currentPage + 1)
                this.runFetch(currentPage)
            } 
        },
        async runFetch(page : number){
            currentPage = page
            const _this = this;
            if(initiated) await hideRows(true)
            updatePagination()
            pagePrevEl.classList[page > 0 ? 'remove' : 'add']('disabled')
            noDataTr.style.display = 'none';
            loaderTr.style.display = '';
            isLoading = true;
            fetchData(page, pageItemCount).then((data)=>{
                loaderTr.style.display = 'none';
                if(IsArray(data) && data.length > 0){
                    isLoading = false;
                    list = data;
                    toggleSort(activeSort.key, activeSort.sort === 'ac')
                }else{
                    noDataTr.style.display = '';
                }
            }).catch(()=>{
                noDataTr.style.display = '';
            }).finally(() => {
                loaderTr.style.display = 'none';
                isLoading = false;
            })
        },
        UpdateTable(list : Array<object | any>){
            if(!IsArray(list) && !IsDomElement(tableEl)) return;
            list.forEach((item, i)=>{
                if(!IsEmpty(item) && IsObj(item)){
                    if(!initiated){
                        const itemEls : Array<Element | HTMLElement | any> = [];
                        const tr = document.createElement('tr');
                        titleKeys.forEach(tk => {
                            if(IsObj(tk)){
                                const td = document.createElement('td');
                                if(tk?.fold) td.classList.add('td-fold')
                                if(tk?.width) td.style.width = tk?.width
                                td.innerHTML = `<span>${(tk.perfix || '') + item[tk.key]}<span>`; 
                                itemEls.push(td)
                                tr.appendChild(td)
                            }
                        });
                        if(IsObj(rowAction) && rowAction?.el instanceof HTMLElement && IsDomElement(rowAction?.el)){
                            const td = document.createElement('td');
                            td.classList.add('td-action')
                            const el = rowAction.el.cloneNode(true) as HTMLElement
                            td.appendChild(el)
                            el.onclick = () => {
                                if(IsFunction(rowAction.callback)) rowAction.callback(item)
                            }
                            itemEls.push(td)
                            tr.appendChild(td);
                        }
                        tableEl.appendChild(tr)
                        dataRowsEls.push(tr);
                        dataEls.push(itemEls)
                        if(i === list.length -1) initiated = true;
                    } else {
                        titleKeys.forEach((tk, j) => {
                            const actionBtn = dataEls[i][titleKeys.length];
                            if(IsDomElement(dataEls[i][j])) dataEls[i][j].innerHTML = `<span>$${item[tk.key]}<span>`; 
                            if(rowAction && IsObj(rowAction) && IsDomElement(actionBtn)){
                                actionBtn.onclick = () => {
                                    if(IsFunction(rowAction.callback)) rowAction.callback(item)
                                }
                            }
                        });
                    }
                }
                if(i === list.length -1) hideRows(false)
            })
        }
    }
    
    return Instance;
}