
<h1 align="center">guardians.js</h1>

> JavaScript library for the Guardians Dapp.


## 🏗 Installation

```bash
npm install guardians.js
```

## 🏄 Quickstart

```ts
import Web3 from 'web3'
import { Recovery} from 'guardians'


const networkId = '2828' // lukso L16
const web3 = new Web3('your-web3-provider')

const recovery = new Recovery(web3)

//now you can use functions in Ocean.ts file

```


## 🏛 License

```
Copyright ((C)) 2021 Hashmesh Labs

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
```
