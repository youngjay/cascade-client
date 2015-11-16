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

- Combiner: 可以合并一定时间段内的cascade请求

```
var Combiner = require('cascade').Combiner;
var cascade = new Cascade(new Combiner(fetcher, {
    wait: 100 // 合并100ms内的请求
}))
```

- ErrorRejector: 可以把返回数据里面的错误提取出来，走到异常处理流程

```
var ErrorRejector = require('cascade').ErrorRejector;
var cascade = new Cascade(new ErrorRejector(fetcher));
```

- Cacher: 可以缓存type或者type+category，缓存使用 type + category + params 作为key。只能缓存根节点数据

```
var Cacher = require('cascade').Cacher;
var cascade = new Cascade(new Cacher(fetcher, {
    fields: [{type: 'User'}]
}))
```

## cascade

cascade是最终使用的接口，他有一个query方法

## 一段代码例子

```
import {Cascade, LocalFetcher, Combiner} from 'cascade-client';
import Fetcher from 'cascade-fetcher-dpapp'


// 这段代码的意思是，如果使用mock数据的话，生成一个LocalFetcher，如果不是的话，则使用dpapp的fetcher
let cascade = new Cascade(location.href.indexOf('localhost') !== -1 ? new LocalFetcher({
    User: {
        query: {
            name: 'Jay'
        }
    }
}) : new Combiner(new Fetcher('https://a.dper.com' + url)));

// query 方法返回一个promise
cascade.query([{type:'User'}]).then(function(data) {
    console.log(data)
})


```