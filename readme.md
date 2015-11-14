# cascade-client

## fetcher

fetcher是表示一个获取数据的接口，它实现fetch(fields) 方法

它的实现有：

LocalFetcher: 是用本地数据来模拟后端的cascade返回

[DPAPPFetcher](http://code.dianpingoa.com/cascade/cascade-fetcher-dpapp/blob/master/index.js)： 基于dpapp的fetcher

[HTTPFetcher](http://code.dianpingoa.com/cascade/cascade-fetcher-http/blob/master/index.js): 基于web的fetcher

## decorator
decorator类似于java的一系列stream, 会对传入的fetcher附加一些功能
他的实现有：

Combiner: 可以合并一定时间段内的cascade请求

ErrorRejector: 可以把返回数据里面的错误提取出来，走到异常处理流程

## cascade

cascade是最终使用的接口，他有一个query方法

## 一段代码例子

```
import {Cascade, LocalFetcher, Combiner} from 'cascade-client';
import Fetcher from 'cascade-fetcher-dpapp'

// 是否使用mock数据
import {USE_MOCK} from './is-mock';

// 这段代码的意思是，如果使用mock数据的话，生成一个LocalFetcher，如果不是的话，则使用dpapp的fetcher
let cascade = new Cascade(USE_MOCK ? new LocalFetcher(cascadeMock) : new Combiner(new Fetcher('https://a.dper.com' + url)));

// query 方法返回一个promise
cascade.query([{type:'User'}]).then(function(data) {
    console.log(data)
})


```