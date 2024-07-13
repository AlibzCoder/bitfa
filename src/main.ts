import './assets/style.scss'
import HomePage from './components/HomePage';
import { StoreInterface } from './utils/interfaces';


const Store : StoreInterface = {
  wallets : [],
  isWalletsLoading : false,
  set : (key : keyof StoreInterface, val : any) => {
    Store[key] = val;
  }
}



HomePage(Store)