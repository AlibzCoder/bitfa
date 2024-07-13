export const IsArray = (o : any) : boolean => o && {}.toString.call(o) === '[object Array]';
export const IsFunction = (o : any) : boolean => o && {}.toString.call(o) === '[object Function]';
export const IsObj = (o : any) : boolean => o !== null && typeof o === 'object' && !(o instanceof Array);
export const IsNumber = (o : any) : boolean => typeof o == "number" || (typeof o == "object" && o.constructor === Number)
export const IsDomElement = (el : any) : boolean => el ? el instanceof Element || el instanceof HTMLElement : false

export function IsEmpty(obj : any) : boolean {
    if (
        ['undefined', 'null'].includes(typeof obj) ||
        obj === undefined || obj === null || 
        (IsArray(obj) && obj.length == 0)
    ) return true;

    if (IsObj(obj)) {
        let r = true;
        for (const prop in obj) {
            if (obj.hasOwnProperty(prop)) {
                r = false;
                break;
            }
        }
        return r;
    }

    if ((typeof obj == 'string' && obj != '') || typeof obj == 'number')  return false;

    return true;
}

export const ObjectToURLParams = (obj : object) : string =>  !IsEmpty(obj) ? Object.entries(obj).map(([key, val] : [string, string | any]) => `${key}=${encodeURIComponent(val)}`).join('&') : ''

export const FetchData = (URL: string, params: object): Promise<object | Array<object | any> | any> => {
  return new Promise((res, rej) => {
    const urlParams = ObjectToURLParams(params)
    const urlWithParams = `${URL}${urlParams ? `?${urlParams}`:''}`;
    fetch(urlWithParams, {
      method: "get",
      redirect: "follow",
      headers: {
        "Content-Type": "application/json",
      },
    }).then((r)=> r.json()).then(data => res(data)).catch((err)=>rej(err));
  });
}


