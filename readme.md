# cascade-client

## fetcher

fetcher是表示一个获取数据的接口，它实现fetch(fields) 方法

它的实现有：

- LocalFetcher: 是用本地数据来模拟后端的cascade返回

```
import {LocalFetcher} from 'cascade-client'
var fetcher = new LocalFetcher({
    // type
    User: {
        // category
        query: { // return value
            name: 'Jay'
        }
    }
});
```

- [DPAPPFetcher](http://code.dianpingoa.com/cascade/cascade-fetcher-dpapp/blob/master/index.js)： 基于dpapp的fetcher

```
var fetcher = new (require('cascade-fetcher-dpapp'))('https://a.dper.com/shd/query');
```

- [HTTPFetcher](http://code.dianpingoa.com/cascade/cascade-fetcher-http/blob/master/index.js): 基于web的fetcher


```
var fetcher = new (require('cascade-fetcher-http'))('https://a.dper.com/shd/query');
```

## decorator
decorator会对传入的fetcher附加一些功能
他的实现有：

- Combiner: 可以合并一定时间段内的cascade请求

```
var Combiner = import {Combiner} from 'cascade-client';
var cascade = new Combiner(fetcher, {
    wait: 100 // 合并100ms内的请求
})
```

- ErrorRejector: 可以把返回数据里面的错误提取出来，走到异常处理流程

```
var ErrorRejector = import 'ErrorRejector' from 'cascade-client';
var cascade = new ErrorRejector(fetcher);
```

- Cacher: 可以缓存type或者type+category，缓存使用 type + category + params 作为key。只缓存没有children的根节点数据。

```
var Cacher = import {Cacher} from 'cascade-client';
var cascade = new Cacher(fetcher, {
    fields: [{type: 'User'}]
})
```

## 组合起来

```
import {Cascade, LocalFetcher, Combiner} from 'cascade-client';
import Fetcher from 'cascade-fetcher-http'

let cascade = location.href.indexOf('localhost') !== -1 ? new LocalFetcher({
    User: {
        query: {
            name: 'Jay'
        }
    }
}) : new Combiner(new Fetcher('https://a.dper.com/shd/query'));


// query 方法返回一个promise
cascade.fetch([{type:'User'}]).then(function(data) {
    console.log(data)
})


```


## 服务端

[cascade-java](http://code.dianpingoa.com/cascade/cascade-java/tree/master)